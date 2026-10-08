import { NextResponse } from "next/server";
import { UserContext } from "@/lib/rbac/service";
import { ROLES } from "@/lib/rbac/roles";
import { prisma } from "@/lib/prisma";

export interface SpocAuthResult {
  isAuthorized: boolean;
  context?: UserContext;
  errorResponse?: NextResponse;
  assignedTeamIds: string[];
}

/**
 * Authoritatively verifies that the authenticated user has SPOC (or SUPER_ADMIN) clearance,
 * dynamically queries their assigned teams, and enforces strict data isolation.
 * Strictly blocks unauthorized roles or unassigned teams with HTTP 403 Forbidden.
 */
export async function verifySpocClearance(
  context: UserContext,
  targetTeamId?: string | null
): Promise<SpocAuthResult> {
  const isSpoc = context.roles.includes(ROLES.SPOC);
  const isSuperAdmin = context.roles.includes(ROLES.SUPER_ADMIN);

  if (!isSpoc && !isSuperAdmin) {
    return {
      isAuthorized: false,
      assignedTeamIds: [],
      errorResponse: NextResponse.json(
        {
          success: false,
          error: "403 Forbidden: Only authorized Student Points of Contact (SPOC) or Super Administrators can access this portal.",
        },
        { status: 403 }
      ),
    };
  }

  // Super Admin bypass: can view any team or all teams
  if (isSuperAdmin) {
    // If targetTeamId is passed, verify team exists by ID or teamCode
    if (targetTeamId) {
      const teamExists = await prisma.team.findFirst({
        where: {
          OR: [{ id: targetTeamId }, { teamCode: targetTeamId }],
        },
        select: { id: true },
      });
      if (!teamExists) {
        return {
          isAuthorized: false,
          assignedTeamIds: [],
          errorResponse: NextResponse.json(
            { success: false, error: "404 Not Found: The specified team does not exist." },
            { status: 404 }
          ),
        };
      }
    }
    return {
      isAuthorized: true,
      context,
      assignedTeamIds: [],
    };
  }

  // Fetch the dynamically assigned teams from PostgreSQL
  const assignments = await prisma.spocTeamAssignment.findMany({
    where: { spocId: context.user.id },
    include: {
      team: {
        select: { id: true, teamCode: true },
      },
    },
  });

  const assignedTeamIds = assignments.map((a) => a.teamId);
  const assignedTeamCodes = assignments.map((a) => a.team.teamCode).filter(Boolean);

  // If a specific team was requested, enforce strict data isolation
  if (targetTeamId) {
    const isAssigned =
      assignedTeamIds.includes(targetTeamId) ||
      assignedTeamCodes.includes(targetTeamId);

    if (!isAssigned) {
      console.warn(
        `[SECURITY 403] SPOC '${context.user.email}' attempted unauthorized access to unassigned team '${targetTeamId}'.`
      );
      return {
        isAuthorized: false,
        assignedTeamIds,
        errorResponse: NextResponse.json(
          {
            success: false,
            error: "403 Forbidden: Unauthorized team access. SPOCs are restricted exclusively to their assigned teams.",
          },
          { status: 403 }
        ),
      };
    }
  }

  return {
    isAuthorized: true,
    context,
    assignedTeamIds,
  };
}
