import { NextRequest, NextResponse } from "next/server";
import { UserContext } from "@/lib/rbac/service";
import { ROLES } from "@/lib/rbac/roles";

export interface OrganizerAuthResult {
  isAuthorized: boolean;
  context?: UserContext;
  errorResponse?: NextResponse;
}

/**
 * Authoritatively verifies that the authenticated user has ORGANIZER (or SUPER_ADMIN) clearance.
 * Strictly blocks unauthorized roles (Participant, Team Manager, Volunteer, etc.) with 403 Forbidden.
 */
export function verifyOrganizerClearance(context: UserContext): OrganizerAuthResult {
  const isOrganizer = context.roles.includes(ROLES.ORGANIZER);
  const isSuperAdmin = context.roles.includes(ROLES.SUPER_ADMIN);
  const isTournamentAdmin = context.roles.includes(ROLES.TOURNAMENT_ADMIN);
  const isOperationsStaff = context.roles.includes(ROLES.OPERATIONS_STAFF);

  if (!isOrganizer && !isSuperAdmin && !isTournamentAdmin && !isOperationsStaff) {
    return {
      isAuthorized: false,
      errorResponse: NextResponse.json(
        {
          success: false,
          error: "403 Forbidden: Only authorized Tournament Organizers, Operations Staff, Tournament Admins, or Super Administrators can access the operations command center.",
        },
        { status: 403 }
      ),
    };
  }

  return {
    isAuthorized: true,
    context,
  };
}
