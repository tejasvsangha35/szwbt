import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/rbac/guard";
import { prisma } from "@/lib/prisma";
import { PERMISSIONS } from "@/lib/rbac/permissions";
import { UserContext, resolveOfficialCourt } from "@/lib/rbac/service";
import { ROLES } from "@/lib/rbac/roles";

/**
 * GET /api/official/matches
 * Fetches matches assigned to the authenticated match official/umpire.
 * Strict court-level isolation enforced server-side:
 * Umpire 1 -> Court 01 only
 * Umpire 2 -> Court 02 only
 * Umpire 3 -> Court 03 only
 * Umpire 4 -> Court 04 only
 */
export const GET = withAuth(
  async (req: NextRequest, context: UserContext) => {
    try {
      const isSuper =
        context.roles.includes(ROLES.SUPER_ADMIN) ||
        context.roles.includes(ROLES.TOURNAMENT_ADMIN);

      const isOfficial = context.roles.includes(ROLES.MATCH_OFFICIAL);

      if (!isSuper && !isOfficial) {
        return NextResponse.json(
          {
            success: false,
            error: "403 Forbidden: You do not hold MATCH_OFFICIAL operational clearance.",
          },
          { status: 403 }
        );
      }

      // Resolve physical court assigned to this umpire
      const assignedCourt = resolveOfficialCourt(context.user);
      const courtQueryParam = req.nextUrl.searchParams.get("court");

      // Super Admin can toggle between courts via query param; Umpires are strictly locked
      const effectiveCourt = !isSuper
        ? assignedCourt
        : (courtQueryParam && courtQueryParam.toUpperCase() !== "ALL" ? courtQueryParam : assignedCourt);

      // Resolve official identifiers
      const officialIdentifiers = [
        context.user.id,
        context.user.officialId,
        context.user.email,
      ].filter(Boolean) as string[];

      // Construct court-isolated filter
      let whereClause: any = undefined;

      if (!isSuper) {
        if (assignedCourt) {
          whereClause = {
            court: { equals: assignedCourt, mode: "insensitive" },
          };
        } else {
          whereClause = {
            assignedOfficialId: { in: officialIdentifiers },
          };
        }
      } else if (courtQueryParam && courtQueryParam.toUpperCase() !== "ALL") {
        whereClause = {
          court: { equals: courtQueryParam, mode: "insensitive" },
        };
      }

      // Query database for assigned matches
      const matches = await prisma.match.findMany({
        where: whereClause,
        include: {
          day: { select: { id: true, date: true, dayNumber: true, stage: true } },
          events: { orderBy: { timestamp: "desc" }, take: 5 },
        },
        orderBy: [{ dayId: "asc" }, { time: "asc" }],
      });

      // Fetch all courts for status enrichment
      const courts = await prisma.court.findMany({
        orderBy: { courtNumber: "asc" },
      });
      const courtMap = new Map(courts.map((c) => [c.courtNumber.toLowerCase(), c]));

      // Enrich matches with court status
      const enrichedMatches = matches.map((m) => {
        const c = courtMap.get(m.court.toLowerCase());
        return {
          ...m,
          courtStatus: c?.status || "UNKNOWN",
        };
      });

      // Classify into Current, Upcoming, Completed
      const currentMatch =
        enrichedMatches.find((m) => m.status === "LIVE" || m.status === "PAUSED") ||
        enrichedMatches.find((m) => m.status === "READY_TO_START" || m.status === "READY" || m.status === "UPCOMING" || m.status === "COURT_ASSIGNED") ||
        null;

      const upcomingMatches = enrichedMatches.filter(
        (m) =>
          (m.status === "UPCOMING" || m.status === "READY" || m.status === "READY_TO_START" || m.status === "COURT_ASSIGNED") &&
          (!currentMatch || m.id !== currentMatch.id)
      );

      const completedMatches = enrichedMatches.filter(
        (m) => m.status === "COMPLETED" || m.status === "RESULT_CONFIRMED" || m.status === "RESULT_SUBMITTED" || m.status === "WALKOVER"
      );

      // Resolve specific court telemetry
      const activeCourtInfo = effectiveCourt
        ? courtMap.get(effectiveCourt.toLowerCase()) || null
        : (currentMatch ? courtMap.get(currentMatch.court.toLowerCase()) || null : null);

      return NextResponse.json({
        success: true,
        data: {
          currentMatch,
          upcomingMatches,
          completedMatches,
          totalAssigned: matches.length,
          assignedCourt: effectiveCourt,
          courtDetails: activeCourtInfo,
          allCourts: courts,
          official: {
            id: context.user.id,
            name: context.user.name,
            email: context.user.email,
            officialId: context.user.officialId || "OFFICIAL",
            badge: context.user.badge || (effectiveCourt ? `${effectiveCourt.toUpperCase()} UMPIRE` : "Court Umpire"),
            court: effectiveCourt,
          },
          serverTime: new Date().toISOString(),
        },
      });
    } catch (error: any) {
      console.error("[GET /api/official/matches] Error:", error);
      return NextResponse.json(
        { success: false, error: "Internal Server Error", details: error.message },
        { status: 500 }
      );
    }
  },
  {
    permissions: [PERMISSIONS.SCORING_READ],
  }
);
