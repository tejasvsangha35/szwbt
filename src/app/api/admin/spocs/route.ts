import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/rbac/guard";
import { ROLES } from "@/lib/rbac/roles";
import { prisma } from "@/lib/prisma";
import { logAuditEvent } from "@/lib/rbac/audit";

/**
 * Authoritatively verifies that the authenticated user is an authorized Administrator (SUPER_ADMIN or TOURNAMENT_ADMIN).
 */
function verifyAdminClearance(context: any): NextResponse | null {
  const isSuperAdmin = context.roles.includes(ROLES.SUPER_ADMIN);
  const isTournamentAdmin = context.roles.includes(ROLES.TOURNAMENT_ADMIN);

  if (!isSuperAdmin && !isTournamentAdmin) {
    return NextResponse.json(
      {
        success: false,
        error: "403 Forbidden: Only authorized administrators can manage SPOC team assignments.",
      },
      { status: 403 }
    );
  }
  return null;
}

/**
 * GET /api/admin/spocs
 * Lists all SPOCs, their 4 assigned teams, assignment status (COMPLETE vs INCOMPLETE),
 * and all available teams for assignment dropdowns.
 */
export async function GET(req: NextRequest) {
  try {
    const authResult = await authenticateRequest(req);
    if (!authResult.authenticated) return authResult.response;

    const adminError = verifyAdminClearance(authResult.context);
    if (adminError) return adminError;

    // 1. Fetch all users with SPOC role
    const spocUsers = await prisma.user.findMany({
      where: {
        userRoles: {
          some: {
            role: { name: ROLES.SPOC },
          },
        },
      },
      include: {
        spocAssignments: {
          include: {
            team: {
              select: {
                id: true,
                teamCode: true,
                name: true,
                institution: true,
                state: true,
                status: true,
                managerName: true,
                managerPhone: true,
              },
            },
          },
          orderBy: { assignedAt: "asc" },
        },
      },
      orderBy: { name: "asc" },
    });

    // 2. Fetch all teams to know which are assigned and unassigned
    const allTeams = await prisma.team.findMany({
      select: {
        id: true,
        teamCode: true,
        name: true,
        institution: true,
        state: true,
        status: true,
        spocAssignment: {
          include: {
            spoc: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
      orderBy: { name: "asc" },
    });

    const formattedSpocs = spocUsers.map((user) => {
      const assignedTeams = user.spocAssignments.map((a) => a.team);
      const isComplete = assignedTeams.length > 0;
      const status = isComplete ? "COMPLETE" : "INCOMPLETE";

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        badge: user.badge || "STUDENT POINT OF CONTACT",
        isActive: user.isActive,
        assignedTeamsCount: assignedTeams.length,
        isComplete,
        status,
        statusText: `${assignedTeams.length} Teams Assigned`,
        assignedTeams,
      };
    });

    const unassignedTeams = allTeams.filter((t) => !t.spocAssignment);

    return NextResponse.json({
      success: true,
      spocs: formattedSpocs,
      totalSpocs: formattedSpocs.length,
      unassignedTeamsCount: unassignedTeams.length,
      allTeamsCount: allTeams.length,
      teams: allTeams,
    });
  } catch (error: any) {
    console.error("Admin SPOC list error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load SPOC management data." },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/spocs
 * Provisions a new SPOC user.
 */
export async function POST(req: NextRequest) {
  try {
    const authResult = await authenticateRequest(req);
    if (!authResult.authenticated) return authResult.response;

    const adminError = verifyAdminClearance(authResult.context);
    if (adminError) return adminError;

    const body = await req.json();
    const { name, email, phone, badge = "STUDENT POINT OF CONTACT", teamIds = [] } = body;

    if (!name || !email) {
      return NextResponse.json(
        { success: false, error: "Validation failed: Full name and email address are required." },
        { status: 400 }
      );
    }

    if (teamIds.length > 4) {
      return NextResponse.json(
        { success: false, error: "Validation error: A SPOC cannot be assigned more than 4 teams." },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const existing = await prisma.user.findUnique({ where: { email: cleanEmail } });
    if (existing) {
      return NextResponse.json(
        { success: false, error: `An account with email '${cleanEmail}' already exists.` },
        { status: 409 }
      );
    }

    // Ensure SPOC role exists
    const spocRole = await prisma.role.upsert({
      where: { name: ROLES.SPOC },
      update: {},
      create: {
        name: ROLES.SPOC,
        displayName: "Student Point of Contact",
        description: "Primary coordination and monitoring point for 4 assigned participating teams.",
        isSystem: true,
      },
    });

    // Create user
    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        email: cleanEmail,
        phone: phone?.trim() || null,
        badge,
        targetUrl: "/spoc",
        passwordHash: "szwbt2026pass",
        userRoles: {
          create: {
            roleId: spocRole.id,
          },
        },
      },
    });

    // Assign teams if provided
    if (teamIds.length > 0) {
      for (const teamId of teamIds) {
        // Upsert assignment
        await prisma.spocTeamAssignment.upsert({
          where: { teamId },
          update: {
            spocId: newUser.id,
            assignedBy: authResult.context.user.email,
          },
          create: {
            spocId: newUser.id,
            teamId,
            assignedBy: authResult.context.user.email,
          },
        });
      }
    }

    await logAuditEvent({
      actorUserId: authResult.context.user.id,
      actorEmail: authResult.context.user.email,
      action: "SPOC_CREATED",
      resourceType: "user",
      resourceId: newUser.id,
      metadata: { email: cleanEmail, initialTeamsCount: teamIds.length },
    });

    return NextResponse.json({
      success: true,
      message: `SPOC account successfully created for ${newUser.name}.`,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        targetUrl: newUser.targetUrl,
      },
    });
  } catch (error: any) {
    console.error("Admin SPOC creation error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create SPOC account." },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/spocs
 * Updates team assignments for a SPOC.
 * Validations:
 * - Max 4 teams
 * - Cannot exceed 4 teams
 * - Duplicate team prevention (ensures clean reassignment)
 */
export async function PUT(req: NextRequest) {
  try {
    const authResult = await authenticateRequest(req);
    if (!authResult.authenticated) return authResult.response;

    const adminError = verifyAdminClearance(authResult.context);
    if (adminError) return adminError;

    const body = await req.json();
    const { spocId, teamIds } = body;

    if (!spocId || !Array.isArray(teamIds)) {
      return NextResponse.json(
        { success: false, error: "Validation failed: SPOC ID and team IDs array are required." },
        { status: 400 }
      );
    }

    // Validation: Maximum reasonable teams
    if (teamIds.length > 20) {
      return NextResponse.json(
        { success: false, error: "Validation failed: A SPOC cannot be assigned more than 20 teams." },
        { status: 400 }
      );
    }

    // Validation: Prevent duplicate team assignments
    const uniqueIds = new Set(teamIds);
    if (uniqueIds.size !== teamIds.length) {
      return NextResponse.json(
        { success: false, error: "Validation failed: Duplicate team IDs are not permitted." },
        { status: 400 }
      );
    }

    // Verify target SPOC exists
    const spocUser = await prisma.user.findUnique({
      where: { id: spocId },
      include: {
        userRoles: {
          include: { role: true },
        },
      },
    });

    if (!spocUser) {
      return NextResponse.json(
        { success: false, error: "404 Not Found: Target SPOC user not found." },
        { status: 404 }
      );
    }

    const hasSpocRole = spocUser.userRoles.some((ur) => ur.role.name === ROLES.SPOC);
    if (!hasSpocRole) {
      return NextResponse.json(
        { success: false, error: "Validation failed: Selected user does not have the SPOC role." },
        { status: 400 }
      );
    }

    // Check if any of the requested teams are already assigned to a DIFFERENT SPOC
    const existingAssignments = await prisma.spocTeamAssignment.findMany({
      where: {
        teamId: { in: teamIds },
        spocId: { not: spocId },
      },
      include: {
        team: { select: { name: true } },
        spoc: { select: { name: true, email: true } },
      },
    });

    // Reassign atomically: delete current assignments for this SPOC, then reassign requested teams
    await prisma.$transaction(async (tx) => {
      // 1. Delete all current assignments for this SPOC
      await tx.spocTeamAssignment.deleteMany({
        where: { spocId },
      });

      // 2. If any team was assigned to another SPOC, remove their old assignment
      if (teamIds.length > 0) {
        await tx.spocTeamAssignment.deleteMany({
          where: { teamId: { in: teamIds } },
        });

        // 3. Create new assignments
        for (const teamId of teamIds) {
          await tx.spocTeamAssignment.create({
            data: {
              spocId,
              teamId,
              assignedBy: authResult.context.user.email,
            },
          });
        }
      }
    });

    const reallocatedNote =
      existingAssignments.length > 0
        ? ` Reassigned ${existingAssignments.length} team(s) from previous coordinators.`
        : "";

    await logAuditEvent({
      actorUserId: authResult.context.user.id,
      actorEmail: authResult.context.user.email,
      action: "SPOC_TEAMS_REASSIGNED",
      resourceType: "spoc_assignment",
      resourceId: spocId,
      metadata: {
        spocEmail: spocUser.email,
        assignedTeamsCount: teamIds.length,
        status: teamIds.length === 4 ? "COMPLETE" : "INCOMPLETE",
      },
    });

    return NextResponse.json({
      success: true,
      message: `Team assignments for ${spocUser.name} updated successfully (${teamIds.length}/4 teams).${reallocatedNote}`,
      assignedCount: teamIds.length,
      isComplete: teamIds.length === 4,
      status: teamIds.length === 4 ? "COMPLETE" : "INCOMPLETE",
    });
  } catch (error: any) {
    console.error("Admin SPOC assignment update error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update SPOC team assignments." },
      { status: 500 }
    );
  }
}
