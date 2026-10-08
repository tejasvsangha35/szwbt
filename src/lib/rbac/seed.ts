/**
 * RBAC Database Seeder & Bootstrapper
 * Seeds Permissions, Roles, RolePermissions, and Authorized Users.
 */

import { prisma } from "@/lib/prisma";
import { ALL_PERMISSIONS } from "./permissions";
import { ROLES, ROLE_DEFINITIONS } from "./roles";

export async function seedRbacData() {
  console.log("=== SEEDING AUTHORITATIVE RBAC DATA ===");

  // 1. Seed Permissions
  console.log(`Seeding ${ALL_PERMISSIONS.length} granular permissions...`);
  for (const perm of ALL_PERMISSIONS) {
    await prisma.permission.upsert({
      where: { code: perm.code },
      update: {
        resource: perm.resource,
        action: perm.action,
        description: perm.description,
      },
      create: {
        code: perm.code,
        resource: perm.resource,
        action: perm.action,
        description: perm.description,
      },
    });
  }

  // 2. Seed Roles and Role-Permissions
  console.log("Seeding system roles & role-permission mappings...");
  for (const [roleName, roleDef] of Object.entries(ROLE_DEFINITIONS)) {
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

    // Clear existing permissions for this role to avoid stale bindings
    await prisma.rolePermission.deleteMany({
      where: { roleId: role.id },
    });

    // Link default permissions
    for (const permCode of roleDef.defaultPermissions) {
      const perm = await prisma.permission.findUnique({
        where: { code: permCode },
      });

      if (perm) {
        await prisma.rolePermission.create({
          data: {
            roleId: role.id,
            permissionId: perm.id,
          },
        });
      }
    }
  }

  // 3. Seed Authorized System Users & Multi-Role Bindings
  const usersToSeed = [
    {
      email: "admin@szwbt2026.edu",
      name: "Root Administrator",
      badge: "LEVEL 04 ROOT",
      targetUrl: "/admin",
      roles: [ROLES.SUPER_ADMIN],
    },
    {
      email: "registration@szwbt2026.edu",
      name: "Priya Rao (Registration)",
      badge: "DESK 02 CHIEF",
      targetUrl: "/register",
      roles: [ROLES.REGISTRATION_STAFF],
    },
    {
      email: "hostel@szwbt2026.edu",
      name: "Hostel Logistics Officer",
      badge: "RESIDENCE ADVISOR",
      targetUrl: "/admin/accommodation",
      roles: [ROLES.ACCOMMODATION_STAFF],
    },
    {
      email: "transport@szwbt2026.edu",
      name: "Fleet Transport Manager",
      badge: "FLEET CONTROL",
      targetUrl: "/admin/transport",
      roles: [ROLES.TRANSPORT_STAFF],
    },
    {
      email: "finance@szwbt2026.edu",
      name: "Treasury Auditor",
      badge: "TREASURY OFFICER",
      targetUrl: "/admin/finance",
      roles: [ROLES.FINANCE_STAFF],
    },
    {
      email: "umpire@szwbt2026.edu",
      name: "Chief Umpire",
      badge: "CHIEF UMPIRE",
      targetUrl: "/official",
      officialId: "official-chief",
      roles: [ROLES.MATCH_OFFICIAL],
    },
    {
      email: "umpire1@szwbt2026.edu",
      name: "Court 01 Umpire",
      badge: "COURT 01 UMPIRE",
      targetUrl: "/official",
      officialId: "official-court-01",
      roles: [ROLES.MATCH_OFFICIAL],
    },
    {
      email: "umpire2@szwbt2026.edu",
      name: "Court 02 Umpire",
      badge: "COURT 02 UMPIRE",
      targetUrl: "/official",
      officialId: "official-court-02",
      roles: [ROLES.MATCH_OFFICIAL],
    },
    {
      email: "umpire3@szwbt2026.edu",
      name: "Court 03 Umpire",
      badge: "COURT 03 UMPIRE",
      targetUrl: "/official",
      officialId: "official-court-03",
      roles: [ROLES.MATCH_OFFICIAL],
    },
    {
      email: "umpire4@szwbt2026.edu",
      name: "Court 04 Umpire",
      badge: "COURT 04 UMPIRE",
      targetUrl: "/official",
      officialId: "official-court-04",
      roles: [ROLES.MATCH_OFFICIAL],
    },
    {
      email: "team@szwbt2026.edu",
      name: "Team Manager",
      badge: "UNIVERSITY DESK",
      targetUrl: "/team",
      teamId: "team-mgr-portal",
      roles: [ROLES.TEAM_MANAGER],
    },
    {
      email: "player@szwbt2026.edu",
      name: "Tournament Participant",
      badge: "PLAYER HUD",
      targetUrl: "/dashboard",
      participantId: "participant-athlete-portal",
      roles: [ROLES.PARTICIPANT],
    },
    {
      email: "spoc@szwbt2026.edu",
      name: "Rahul Kumar (SPOC Coordinator)",
      badge: "SPOC DESK",
      targetUrl: "/spoc",
      roles: [ROLES.SPOC],
    },
    {
      email: "spoc2@szwbt2026.edu",
      name: "Sneha Patil (SPOC Coordinator 2)",
      badge: "SPOC DESK 2",
      targetUrl: "/spoc",
      roles: [ROLES.SPOC],
    },
    {
      email: "ops@szwbt2026.edu",
      name: "KLE Tech Arena Operations Controller",
      badge: "FIELD COMMAND",
      targetUrl: "/operations",
      roles: [ROLES.OPERATIONS_STAFF],
    },
    {
      email: "organizer@szwbt2026.edu",
      name: "Tournament Secretariat",
      badge: "SZWBT SECRETARIAT",
      targetUrl: "/organizer",
      roles: [ROLES.ORGANIZER],
    },
    {
      email: "techops@szwbt2026.edu",
      name: "Technical Operations Lead",
      badge: "TECHOPS COMMAND",
      targetUrl: "/operations",
      roles: [ROLES.OPERATIONS_STAFF, ROLES.TOURNAMENT_ADMIN],
    },
    {
      email: "scanner@szwbt2026.edu",
      name: "Document Officer",
      badge: "DOC OFFICER 01",
      targetUrl: "/register",
      roles: [ROLES.REGISTRATION_STAFF],
    },
    {
      email: "documents@szwbt2026.edu",
      name: "Document Verification Lead",
      badge: "DOC VERIFICATION",
      targetUrl: "/register",
      roles: [ROLES.REGISTRATION_STAFF],
    },
    // Multi-Role Demonstration (Supports Multiple Roles per User)
    {
      email: "priya.multirole@szwbt2026.edu",
      name: "Priya Rao (Dual Desk Staff)",
      badge: "DUAL DESK OPS",
      targetUrl: "/register",
      roles: [ROLES.REGISTRATION_STAFF, ROLES.ACCOMMODATION_STAFF],
    },
    {
      email: "lead.multirole@szwbt2026.edu",
      name: "Suresh Patil (Lead Controller)",
      badge: "CONTROLLER",
      targetUrl: "/admin",
      roles: [ROLES.TOURNAMENT_ADMIN, ROLES.FINANCE_STAFF],
    },
  ];

  // Default secure password
  const defaultPassword = "szwbt2026pass";

  for (const u of usersToSeed) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {
        name: u.name,
        badge: u.badge,
        targetUrl: u.targetUrl,
        participantId: (u as any).participantId || null,
        teamId: (u as any).teamId || null,
        officialId: (u as any).officialId || null,
        isActive: true,
      },
      create: {
        email: u.email,
        name: u.name,
        passwordHash: defaultPassword,
        badge: u.badge,
        targetUrl: u.targetUrl,
        participantId: (u as any).participantId || null,
        teamId: (u as any).teamId || null,
        officialId: (u as any).officialId || null,
        isActive: true,
      },
    });

    // Clear existing user roles
    await prisma.userRole.deleteMany({
      where: { userId: user.id },
    });

    // Assign multiple roles
    for (const roleName of u.roles) {
      const role = await prisma.role.findUnique({
        where: { name: roleName },
      });

      if (role) {
        await prisma.userRole.create({
          data: {
            userId: user.id,
            roleId: role.id,
          },
        });
      }
    }
  }

  console.log("=== RBAC DATA SEEDING COMPLETE ===");
}
