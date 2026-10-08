import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/rbac/guard";
import { verifySpocClearance } from "@/lib/spoc/auth";
import { prisma } from "@/lib/prisma";
import { OFFICIAL_ESCALATION_AUTHORITIES } from "@/lib/spoc/service";

export async function GET(req: NextRequest) {
  try {
    const authResult = await authenticateRequest(req);
    if (!authResult.authenticated) {
      return authResult.response;
    }

    const spocAuth = await verifySpocClearance(authResult.context);
    if (spocAuth.errorResponse) {
      return spocAuth.errorResponse;
    }

    const assignments = await prisma.spocTeamAssignment.findMany({
      where: { spocId: authResult.context.user.id },
      include: {
        team: {
          select: {
            id: true,
            teamCode: true,
            name: true,
            institution: true,
            state: true,
            managerName: true,
            managerPhone: true,
            captainName: true,
            captainPhone: true,
            status: true,
            members: {
              include: {
                participant: {
                  select: {
                    id: true,
                    name: true,
                    phone: true,
                    email: true,
                    status: true,
                  },
                },
              },
              orderBy: { role: "asc" },
            },
          },
        },
      },
    });

    const teamContacts = assignments.map((a) => ({
      teamId: a.team.id,
      teamCode: a.team.teamCode,
      name: a.team.name,
      institution: a.team.institution,
      state: a.team.state,
      manager: {
        name: a.team.managerName || "Not Provided",
        phone: a.team.managerPhone || null,
      },
      captain: {
        name: a.team.captainName || "Not Provided",
        phone: a.team.captainPhone || null,
      },
      members: a.team.members.map((m) => ({
        id: m.participant.id,
        name: m.participant.name,
        role: m.role || "ATHLETE",
        phone: m.participant.phone || null,
        email: m.participant.email || null,
        status: m.participant.status,
      })),
    }));

    return NextResponse.json({
      success: true,
      teams: teamContacts,
      escalationAuthorities: OFFICIAL_ESCALATION_AUTHORITIES,
    });
  } catch (error: any) {
    console.error("SPOC contacts API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load SPOC contingent contacts." },
      { status: 500 }
    );
  }
}
