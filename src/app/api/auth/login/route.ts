import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserContext } from "@/lib/rbac/service";
import { createSessionToken, attachSessionCookie } from "@/lib/rbac/token";
import { logAuditEvent } from "@/lib/rbac/audit";
import { sanitizeRedirectUrl } from "@/lib/rbac/routes";
import { ROLES, ROLE_DEFINITIONS, RoleName } from "@/lib/rbac/roles";

const DEFAULT_SYSTEM_ROLES: Record<string, string[]> = {
  "admin@szwbt2026.edu": [ROLES.SUPER_ADMIN],
  "techops@szwbt2026.edu": [ROLES.OPERATIONS_STAFF, ROLES.TOURNAMENT_ADMIN],
  "ops@szwbt2026.edu": [ROLES.OPERATIONS_STAFF],
  "tournament@szwbt2026.edu": [ROLES.TOURNAMENT_ADMIN],
  "registration@szwbt2026.edu": [ROLES.REGISTRATION_STAFF],
  "scanner@szwbt2026.edu": [ROLES.REGISTRATION_STAFF],
  "documents@szwbt2026.edu": [ROLES.REGISTRATION_STAFF],
  "hostel@szwbt2026.edu": [ROLES.ACCOMMODATION_STAFF],
  "transport@szwbt2026.edu": [ROLES.TRANSPORT_STAFF],
  "finance@szwbt2026.edu": [ROLES.FINANCE_STAFF],
  "umpire1@szwbt2026.edu": [ROLES.MATCH_OFFICIAL],
  "umpire2@szwbt2026.edu": [ROLES.MATCH_OFFICIAL],
  "umpire3@szwbt2026.edu": [ROLES.MATCH_OFFICIAL],
  "umpire4@szwbt2026.edu": [ROLES.MATCH_OFFICIAL],
  "umpire1": [ROLES.MATCH_OFFICIAL],
  "umpire2": [ROLES.MATCH_OFFICIAL],
  "umpire3": [ROLES.MATCH_OFFICIAL],
  "umpire4": [ROLES.MATCH_OFFICIAL],
  "organizer@szwbt2026.edu": [ROLES.ORGANIZER],
  "secretariat@szwbt2026.edu": [ROLES.ORGANIZER],
  "comm@szwbt2026.edu": [ROLES.COMMUNICATIONS_STAFF],
  "reports@szwbt2026.edu": [ROLES.REPORTS_STAFF],
  "team@szwbt2026.edu": [ROLES.TEAM_MANAGER],
  "player@szwbt2026.edu": [ROLES.PARTICIPANT],
  "spoc@szwbt2026.edu": [ROLES.SPOC],
  "spoc1@szwbt2026.edu": [ROLES.SPOC],
  "spoc2@szwbt2026.edu": [ROLES.SPOC],
  "support@szwbt2026.edu": [ROLES.SUPPORT_STAFF],
  "priya.multirole@szwbt2026.edu": [ROLES.REGISTRATION_STAFF, ROLES.ACCOMMODATION_STAFF],
  "lead.multirole@szwbt2026.edu": [ROLES.TOURNAMENT_ADMIN, ROLES.FINANCE_STAFF],
};

const LEGACY_ROLE_MAP: Record<string, string> = {
  SUPER_ADMIN: ROLES.SUPER_ADMIN,
  TOURNAMENT_ADMIN: ROLES.TOURNAMENT_ADMIN,
  OPERATIONS_STAFF: ROLES.OPERATIONS_STAFF,
  TECHOPS: ROLES.OPERATIONS_STAFF,
  CHIEF_UMPIRE: ROLES.MATCH_OFFICIAL,
  MATCH_OFFICIAL: ROLES.MATCH_OFFICIAL,
  REGISTRATION_ADMIN: ROLES.REGISTRATION_STAFF,
  REGISTRATION_STAFF: ROLES.REGISTRATION_STAFF,
  ACCOMMODATION_ADMIN: ROLES.ACCOMMODATION_STAFF,
  ACCOMMODATION_STAFF: ROLES.ACCOMMODATION_STAFF,
  TRANSPORT_ADMIN: ROLES.TRANSPORT_STAFF,
  TRANSPORT_STAFF: ROLES.TRANSPORT_STAFF,
  FINANCE_ADMIN: ROLES.FINANCE_STAFF,
  FINANCE_STAFF: ROLES.FINANCE_STAFF,
  DOCUMENT_SCANNER: ROLES.REGISTRATION_STAFF,
  ORGANIZER: ROLES.ORGANIZER,
  SPOC: ROLES.SPOC,
  TEAM_MANAGER: ROLES.TEAM_MANAGER,
  PARTICIPANT: ROLES.PARTICIPANT,
  SUPPORT_STAFF: ROLES.SUPPORT_STAFF,
};

async function autoAssignUserRoles(
  userId: string,
  email: string,
  legacyRole?: string | null,
  targetUrl?: string | null
) {
  const rolesToAssign: string[] = [];
  const normalizedEmail = email.toLowerCase().trim();

  if (DEFAULT_SYSTEM_ROLES[normalizedEmail]) {
    rolesToAssign.push(...DEFAULT_SYSTEM_ROLES[normalizedEmail]);
  } else if (legacyRole && LEGACY_ROLE_MAP[legacyRole]) {
    rolesToAssign.push(LEGACY_ROLE_MAP[legacyRole]);
  } else if (targetUrl) {
    if (targetUrl.startsWith("/operations")) rolesToAssign.push(ROLES.OPERATIONS_STAFF);
    else if (targetUrl.startsWith("/official")) rolesToAssign.push(ROLES.MATCH_OFFICIAL);
    else if (targetUrl.startsWith("/register")) rolesToAssign.push(ROLES.REGISTRATION_STAFF);
    else if (targetUrl.startsWith("/team")) rolesToAssign.push(ROLES.TEAM_MANAGER);
    else if (targetUrl.startsWith("/dashboard")) rolesToAssign.push(ROLES.PARTICIPANT);
    else if (targetUrl.startsWith("/spoc")) rolesToAssign.push(ROLES.SPOC);
    else if (targetUrl.startsWith("/support")) rolesToAssign.push(ROLES.SUPPORT_STAFF);
    else if (targetUrl.startsWith("/organizer")) rolesToAssign.push(ROLES.ORGANIZER);
    else if (targetUrl.startsWith("/admin/finance")) rolesToAssign.push(ROLES.FINANCE_STAFF);
    else if (targetUrl.startsWith("/admin/transport")) rolesToAssign.push(ROLES.TRANSPORT_STAFF);
    else if (targetUrl.startsWith("/admin/accommodation")) rolesToAssign.push(ROLES.ACCOMMODATION_STAFF);
    else if (targetUrl.startsWith("/admin/tournament")) rolesToAssign.push(ROLES.TOURNAMENT_ADMIN);
    else if (targetUrl.startsWith("/admin")) rolesToAssign.push(ROLES.SUPER_ADMIN);
  }

  for (const roleName of rolesToAssign) {
    const roleDef = ROLE_DEFINITIONS[roleName as RoleName];
    if (!roleDef) continue;

    const role = await prisma.role.upsert({
      where: { name: roleName },
      update: {
        displayName: roleDef.displayName,
        description: roleDef.description,
        isSystem: true,
      },
      create: {
        name: roleName,
        displayName: roleDef.displayName,
        description: roleDef.description,
        isSystem: true,
      },
    });

    for (const permCode of roleDef.defaultPermissions) {
      const perm = await prisma.permission.findUnique({
        where: { code: permCode },
      });
      if (perm) {
        await prisma.rolePermission.upsert({
          where: {
            roleId_permissionId: {
              roleId: role.id,
              permissionId: perm.id,
            },
          },
          update: {},
          create: {
            roleId: role.id,
            permissionId: perm.id,
          },
        });
      }
    }

    await prisma.userRole.upsert({
      where: {
        userId_roleId: {
          userId,
          roleId: role.id,
        },
      },
      update: {},
      create: {
        userId,
        roleId: role.id,
      },
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { credential, password, returnTo } = body;

    if (!credential || !password) {
      return NextResponse.json(
        { success: false, error: "Credential and security passcode are required." },
        { status: 400 }
      );
    }

    const cleanCred = credential.toLowerCase().trim();
    const candidateEmails = [cleanCred];
    if (!cleanCred.includes("@")) {
      candidateEmails.push(`${cleanCred}@szwbt2026.edu`);
    }

    // 1. Authoritative User Lookup in PostgreSQL
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: { in: candidateEmails } },
          { officialId: { in: candidateEmails, mode: "insensitive" } },
          { name: { in: candidateEmails, mode: "insensitive" } },
        ],
      },
    });

    // Fallback: If user was in legacy Official table but not User, migrate or find
    if (!user) {
      const official = await prisma.official.findFirst({
        where: {
          OR: [
            { email: { in: candidateEmails } },
            { name: { in: candidateEmails, mode: "insensitive" } },
          ],
        },
      });

      if (official) {
        user = await prisma.user.create({
          data: {
            email: official.email,
            name: official.name,
            passwordHash: official.password,
            badge: official.badge,
            targetUrl: official.targetUrl,
            isActive: true,
          },
        });
      }
    }

    // Invalid credentials
    if (!user || user.passwordHash !== password) {
      return NextResponse.json(
        { success: false, error: "401 Unauthorized: Invalid credential or security passcode." },
        { status: 401 }
      );
    }

    // 2. Check if Account is Active (Disabled User Protection)
    if (!user.isActive) {
      return NextResponse.json(
        { success: false, error: "403 Forbidden: User account has been deactivated. Contact Super Admin." },
        { status: 403 }
      );
    }

    // 3. Load Authoritative Roles and Permissions
    let context = await getUserContext(user.id);
    if (!context || context.roles.length === 0) {
      const official = await prisma.official.findFirst({
        where: {
          OR: [
            { email: { in: candidateEmails } },
            { name: { in: candidateEmails, mode: "insensitive" } },
          ],
        },
      });
      await autoAssignUserRoles(user.id, user.email, official?.role, user.targetUrl);
      context = await getUserContext(user.id);
    }

    if (!context) {
      return NextResponse.json(
        { success: false, error: "403 Forbidden: Unable to establish user authorization context." },
        { status: 403 }
      );
    }

    // 4. Generate Cryptographically Signed Session Token
    const sessionToken = createSessionToken({
      userId: user.id,
      email: user.email,
      roles: context.roles,
      permissions: context.permissions,
    });

    // 5. Construct Secure Response with HTTP-only Cookie
    const defaultTarget = user.targetUrl || "/admin";
    const finalTarget = returnTo ? sanitizeRedirectUrl(returnTo, defaultTarget) : defaultTarget;

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        badge: user.badge,
        targetUrl: finalTarget,
        roles: context.roles,
        permissions: context.permissions,
        participantId: user.participantId,
        teamId: user.teamId,
        officialId: user.officialId,
      },
    });

    attachSessionCookie(response, sessionToken);

    // 6. Record Audit Event
    await logAuditEvent({
      actorUserId: user.id,
      actorEmail: user.email,
      action: "USER_LOGIN",
      resourceType: "auth",
      resourceId: user.id,
      metadata: { roles: context.roles },
    });

    return response;
  } catch (error: any) {
    console.error("Login API error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error during authentication." },
      { status: 500 }
    );
  }
}
