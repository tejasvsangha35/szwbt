/**
 * Authoritative Backend RBAC Service
 * Implements granular permission evaluation, multiple roles per user,
 * and resource-level ownership/assignment checks.
 */

import { prisma } from "@/lib/prisma";
import { ROLES } from "./roles";
import { PERMISSIONS } from "./permissions";

export interface UserContext {
  user: {
    id: string;
    email: string;
    name: string;
    badge: string | null;
    targetUrl: string | null;
    isActive: boolean;
    participantId: string | null;
    teamId: string | null;
    officialId: string | null;
    phone?: string | null;
    institution?: string | null;
    state?: string | null;
    sessionVersion?: number;
    lastLoginAt?: Date | null;
  };
  roles: string[];
  permissions: string[];
}

export interface ResourceScopeOptions {
  assignedOfficialId?: string | null;
  teamId?: string | null;
  participantId?: string | null;
  paymentCategory?: string | null;
}

/**
 * Loads user identity, roles and granular permissions authoritatively from PostgreSQL.
 * Verifies that the user account is active.
 */
export async function getUserContext(userId: string): Promise<UserContext | null> {
  if (!userId) return null;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        userRoles: {
          include: {
            role: {
              include: {
                rolePermissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user || !user.isActive) {
      return null;
    }

    const roles: string[] = user.userRoles.map((ur) => ur.role.name);
    const permissionSet = new Set<string>();

    for (const ur of user.userRoles) {
      for (const rp of ur.role.rolePermissions) {
        permissionSet.add(rp.permission.code);
      }
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        badge: user.badge,
        targetUrl: user.targetUrl,
        isActive: user.isActive,
        participantId: user.participantId,
        teamId: user.teamId,
        officialId: user.officialId,
        phone: user.phone,
        institution: user.institution,
        state: user.state,
        sessionVersion: user.sessionVersion,
        lastLoginAt: user.lastLoginAt,
      },
      roles,
      permissions: Array.from(permissionSet),
    };
  } catch (error) {
    console.error("[RBAC ERROR] Failed to load user context:", error);
    return null;
  }
}

/**
 * Evaluates whether the user has a specific granular permission.
 * SUPER_ADMIN has authoritative global clearance.
 */
export function hasPermission(context: UserContext, requiredPermission: string): boolean {
  if (!context || !context.user.isActive) return false;
  if (context.roles.includes(ROLES.SUPER_ADMIN)) return true;
  return context.permissions.includes(requiredPermission);
}

/**
 * Evaluates whether the user possesses ANY of the specified permissions.
 */
export function hasAnyPermission(context: UserContext, requiredPermissions: string[]): boolean {
  if (!context || !context.user.isActive) return false;
  if (context.roles.includes(ROLES.SUPER_ADMIN)) return true;
  return requiredPermissions.some((p) => context.permissions.includes(p));
}

/**
 * Evaluates whether the user possesses ALL of the specified permissions.
 */
export function hasAllPermissions(context: UserContext, requiredPermissions: string[]): boolean {
  if (!context || !context.user.isActive) return false;
  if (context.roles.includes(ROLES.SUPER_ADMIN)) return true;
  return requiredPermissions.every((p) => context.permissions.includes(p));
}

/**
 * Resolves the physical court assigned to an official/umpire.
 * Returns "Court 01", "Court 02", "Court 03", "Court 04", or null.
 */
export function resolveOfficialCourt(user?: {
  email?: string | null;
  officialId?: string | null;
  name?: string | null;
  badge?: string | null;
} | null): string | null {
  if (!user) return null;

  const email = (user.email || "").toLowerCase();
  const officialId = (user.officialId || "").toLowerCase();
  const name = (user.name || "").toLowerCase();
  const badge = (user.badge || "").toLowerCase();

  const combined = `${email} ${officialId} ${name} ${badge}`;

  if (
    email.startsWith("umpire1") ||
    officialId.includes("court-01") ||
    officialId === "court 01" ||
    combined.includes("court 01") ||
    combined.includes("court 1") ||
    combined.includes("court-01") ||
    combined.includes("court-1")
  ) {
    return "Court 01";
  }

  if (
    email.startsWith("umpire2") ||
    officialId.includes("court-02") ||
    officialId === "court 02" ||
    combined.includes("court 02") ||
    combined.includes("court 2") ||
    combined.includes("court-02") ||
    combined.includes("court-2")
  ) {
    return "Court 02";
  }

  if (
    email.startsWith("umpire3") ||
    officialId.includes("court-03") ||
    officialId === "court 03" ||
    combined.includes("court 03") ||
    combined.includes("court 3") ||
    combined.includes("court-03") ||
    combined.includes("court-3")
  ) {
    return "Court 03";
  }

  if (
    email.startsWith("umpire4") ||
    officialId.includes("court-04") ||
    officialId === "court 04" ||
    combined.includes("court 04") ||
    combined.includes("court 4") ||
    combined.includes("court-04") ||
    combined.includes("court-4")
  ) {
    return "Court 04";
  }

  if (email === "umpire@szwbt2026.edu" || email === "umpire") {
    return "Court 01";
  }

  return null;
}

/**
 * Checks if user has a specific role.
 */
export function hasRole(context: UserContext, roleName: string): boolean {
  if (!context || !context.user.isActive) return false;
  return context.roles.includes(roleName);
}

/**
 * RESOURCE-LEVEL AUTHORIZATION ENGINE
 * Combines RBAC with Resource Ownership / Assignment:
 *
 * 1. SUPER_ADMIN: Unrestricted scope.
 * 2. MATCH_OFFICIAL: Can only score matches assigned to them (match.assignedOfficialId) or in their court.
 * 3. TEAM_MANAGER: Can only access resources of their own team (teamId).
 * 4. PARTICIPANT: Can only access their own record (participantId).
 * 5. PAYMENT: Staff can only record payments for categories they manage.
 * 6. DOCUMENT: Only accessible to Super Admin, Registration Staff, or the athlete owner.
 */
export async function checkResourceScope(
  context: UserContext,
  resourceType: "match" | "team" | "participant" | "payment" | "document" | "accommodation" | "transport",
  resourceId: string | null,
  action: string,
  options?: ResourceScopeOptions
): Promise<{ allowed: boolean; reason?: string }> {
  if (!context || !context.user.isActive) {
    return { allowed: false, reason: "User account inactive or unauthenticated." };
  }

  // 1. Super Admin has unrestricted scope across all resources
  if (context.roles.includes(ROLES.SUPER_ADMIN)) {
    return { allowed: true };
  }

  // 2. MATCH & SCORING RESOURCE SCOPE
  if (resourceType === "match") {
    // Only assigned official or tournament admin can score/update
    if (context.roles.includes(ROLES.TOURNAMENT_ADMIN)) {
      return { allowed: true };
    }

    if (context.roles.includes(ROLES.MATCH_OFFICIAL)) {
      let assignedOfficialId = options?.assignedOfficialId;
      let matchCourt: string | null = null;

      // If assignedOfficialId not provided in options, check in DB if matchId is given
      if (resourceId) {
        try {
          const match = await prisma.match.findUnique({
            where: { id: resourceId },
            select: { assignedOfficialId: true, court: true },
          });
          assignedOfficialId = match?.assignedOfficialId;
          matchCourt = match?.court || null;
        } catch (e) {
          // fallback
        }
      }

      const assignedCourt = resolveOfficialCourt(context.user);
      const isCourtMatch = Boolean(
        assignedCourt &&
        matchCourt &&
        matchCourt.trim().toLowerCase() === assignedCourt.trim().toLowerCase()
      );

      const isDirectlyAssigned = Boolean(
        assignedOfficialId &&
        (assignedOfficialId === context.user.officialId ||
          assignedOfficialId === context.user.id ||
          assignedOfficialId === context.user.email)
      );

      // Strict court isolation: if official is mapped to a court, they cannot access other courts
      if (assignedCourt && matchCourt && !isCourtMatch) {
        return {
          allowed: false,
          reason: `Match Official is assigned exclusively to ${assignedCourt} and cannot access match on ${matchCourt}.`,
        };
      }

      if (!isDirectlyAssigned && !isCourtMatch) {
        return {
          allowed: false,
          reason: `Match Official is not assigned to match ${resourceId || "specified"}.`,
        };
      }

      return { allowed: true };
    }

    // Read only for participants and managers
    if (action === "read" && (context.roles.includes(ROLES.PARTICIPANT) || context.roles.includes(ROLES.TEAM_MANAGER) || context.roles.includes(ROLES.VOLUNTEER))) {
      return { allowed: true };
    }

    return { allowed: false, reason: "Insufficient permissions for match resource." };
  }

  // 3. TEAM RESOURCE SCOPE
  if (resourceType === "team") {
    if (
      context.roles.includes(ROLES.TOURNAMENT_ADMIN) ||
      context.roles.includes(ROLES.REGISTRATION_STAFF) ||
      context.roles.includes(ROLES.ORGANIZER)
    ) {
      return { allowed: true };
    }

    if (context.roles.includes(ROLES.TEAM_MANAGER)) {
      const ownTeamId = context.user.teamId || options?.teamId;
      if (!ownTeamId || (resourceId && ownTeamId !== resourceId)) {
        return {
          allowed: false,
          reason: "Team Manager cannot access or modify another institution's team data.",
        };
      }
      return { allowed: true };
    }

    return { allowed: false, reason: "Insufficient permissions for team resource." };
  }

  // 4. PARTICIPANT RESOURCE SCOPE
  if (resourceType === "participant") {
    if (
      context.roles.includes(ROLES.TOURNAMENT_ADMIN) ||
      context.roles.includes(ROLES.REGISTRATION_STAFF) ||
      context.roles.includes(ROLES.ACCOMMODATION_STAFF) ||
      context.roles.includes(ROLES.TRANSPORT_STAFF) ||
      context.roles.includes(ROLES.ORGANIZER)
    ) {
      return { allowed: true };
    }

    // Team Manager can access participants in their own team
    if (context.roles.includes(ROLES.TEAM_MANAGER)) {
      if (options?.teamId && options.teamId === context.user.teamId) {
        return { allowed: true };
      }
    }

    // Participant can ONLY access their own record
    if (context.roles.includes(ROLES.PARTICIPANT)) {
      const ownParticipantId = context.user.participantId || options?.participantId;
      if (
        !ownParticipantId ||
        (resourceId && resourceId !== ownParticipantId && resourceId !== context.user.id)
      ) {
        return {
          allowed: false,
          reason: "Athletes can only view and access their own participant records.",
        };
      }
      return { allowed: true };
    }

    return { allowed: false, reason: "Insufficient permissions for participant resource." };
  }

  // 5. PAYMENT RESOURCE SCOPE (Category separation)
  if (resourceType === "payment") {
    // Finance staff has access across all payment categories
    if (context.roles.includes(ROLES.FINANCE_STAFF)) {
      return { allowed: true };
    }

    const category = options?.paymentCategory?.toUpperCase();

    // Registration staff can only manage REGISTRATION payments
    if (context.roles.includes(ROLES.REGISTRATION_STAFF)) {
      if (category === "REGISTRATION" || !category) {
        return { allowed: true };
      }
      return {
        allowed: false,
        reason: "Registration staff cannot record or inspect non-registration payments.",
      };
    }

    // Accommodation staff can only manage ACCOMMODATION payments
    if (context.roles.includes(ROLES.ACCOMMODATION_STAFF)) {
      if (category === "ACCOMMODATION" || !category) {
        return { allowed: true };
      }
      return {
        allowed: false,
        reason: "Accommodation staff cannot record or inspect non-accommodation payments.",
      };
    }

    // Transport is university-provided (zero-payment operational service).
    if (context.roles.includes(ROLES.TRANSPORT_STAFF)) {
      return {
        allowed: false,
        reason: "Transport is a university-provided free operational service. Transport staff cannot manage financial ledgers.",
      };
    }

    // Team Manager can read payments of their own team (read-only)
    if (context.roles.includes(ROLES.TEAM_MANAGER)) {
      if (action === "read" && options?.teamId && options.teamId === context.user.teamId) {
        return { allowed: true };
      }
      return {
        allowed: false,
        reason: "Team Manager cannot inspect payments of another team or perform payment modifications.",
      };
    }

    return { allowed: false, reason: "Insufficient permissions for payment ledger." };
  }

  // 6. DOCUMENT RESOURCE SCOPE (Confidentiality)
  if (resourceType === "document") {
    if (context.roles.includes(ROLES.REGISTRATION_STAFF) || context.roles.includes(ROLES.TOURNAMENT_ADMIN)) {
      return { allowed: true };
    }

    // Athlete can access their own uploaded documents
    if (context.roles.includes(ROLES.PARTICIPANT)) {
      if (options?.participantId && options.participantId === context.user.participantId) {
        return { allowed: true };
      }
    }

    // Team Manager can access document readiness status for their own team
    if (context.roles.includes(ROLES.TEAM_MANAGER)) {
      if (action === "read" && options?.teamId && options.teamId === context.user.teamId) {
        return { allowed: true };
      }
    }

    return {
      allowed: false,
      reason: "Sensitive athlete verification documents are restricted to authorized registration staff.",
    };
  }

  // 7. ACCOMMODATION RESOURCE SCOPE
  if (resourceType === "accommodation") {
    if (action === "allocate") {
      if (context.roles.includes(ROLES.ACCOMMODATION_STAFF) && !context.roles.includes(ROLES.SUPER_ADMIN) && !context.roles.includes(ROLES.REGISTRATION_STAFF)) {
        return { allowed: false, reason: "Hostel staff cannot allocate beds from scratch. Bed allocation is managed at the Central Registration Desk." };
      }
    }
    if (context.roles.includes(ROLES.ACCOMMODATION_STAFF)) {
      return { allowed: true };
    }
    if (action === "read") {
      if (context.roles.includes(ROLES.REGISTRATION_STAFF) || context.roles.includes(ROLES.ORGANIZER)) {
        return { allowed: true };
      }
      if (context.roles.includes(ROLES.TEAM_MANAGER) && options?.teamId === context.user.teamId) {
        return { allowed: true };
      }
      if (context.roles.includes(ROLES.PARTICIPANT) && options?.participantId === context.user.participantId) {
        return { allowed: true };
      }
    }
    return { allowed: false, reason: "Accommodation allocation is restricted to accommodation staff." };
  }

  // 8. TRANSPORT RESOURCE SCOPE (Zero Payment University Service)
  if (resourceType === "transport") {
    if (context.roles.includes(ROLES.TRANSPORT_STAFF)) {
      return { allowed: true };
    }
    if (action === "read" || action === "boarding") {
      if (context.roles.includes(ROLES.OPERATIONS_STAFF) || context.roles.includes(ROLES.ORGANIZER)) {
        return { allowed: true };
      }
    }
    if (action === "read") {
      if (context.roles.includes(ROLES.TEAM_MANAGER) && options?.teamId === context.user.teamId) {
        return { allowed: true };
      }
      if (context.roles.includes(ROLES.PARTICIPANT) && options?.participantId === context.user.participantId) {
        return { allowed: true };
      }
    }
    return { allowed: false, reason: "Transport fleet operations are restricted to authorized transport staff." };
  }

  return { allowed: true };
}

/**
 * PRIVILEGE ESCALATION SAFEGUARDS:
 * 1. User cannot modify their own roles.
 * 2. Only active SUPER_ADMIN can grant or revoke SUPER_ADMIN.
 * 3. Ordinary administrators cannot assign roles without ROLES_ASSIGN permission.
 */
export function validateRoleAssignment(
  operatorContext: UserContext,
  targetUserId: string,
  roleToAssign: string
): { allowed: boolean; error?: string } {
  // 1. Check if operator is active
  if (!operatorContext || !operatorContext.user.isActive) {
    return { allowed: false, error: "Authentication required." };
  }

  // 2. Prevent modifying own role
  if (operatorContext.user.id === targetUserId) {
    return { allowed: false, error: "Privilege Escalation Blocked: You cannot modify your own role." };
  }

  // 3. Granting or revoking SUPER_ADMIN requires active SUPER_ADMIN
  if (roleToAssign === ROLES.SUPER_ADMIN && !operatorContext.roles.includes(ROLES.SUPER_ADMIN)) {
    return {
      allowed: false,
      error: "Privilege Escalation Blocked: Only an active Super Admin can assign the Super Admin role.",
    };
  }

  // 4. Must possess roles:assign permission
  if (!hasPermission(operatorContext, PERMISSIONS.ROLES_ASSIGN)) {
    return { allowed: false, error: "Unauthorized: You do not possess role assignment permissions." };
  }

  return { allowed: true };
}
