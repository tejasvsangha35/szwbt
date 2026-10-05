const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const UMPIRES = [
  {
    email: 'umpire1@szwbt2026.edu',
    name: 'Court 01 Umpire',
    badge: 'COURT 01 UMPIRE',
    officialId: 'official-court-01',
    courtNumber: 'Court 01',
    description: 'Lead Court Umpire for Court 01. Manages digital scoreboard, line calls, service faults, and scoresheets.',
  },
  {
    email: 'umpire2@szwbt2026.edu',
    name: 'Court 02 Umpire',
    badge: 'COURT 02 UMPIRE',
    officialId: 'official-court-02',
    courtNumber: 'Court 02',
    description: 'Lead Court Umpire for Court 02. Manages digital scoreboard, line calls, service faults, and scoresheets.',
  },
  {
    email: 'umpire3@szwbt2026.edu',
    name: 'Court 03 Umpire',
    badge: 'COURT 03 UMPIRE',
    officialId: 'official-court-03',
    courtNumber: 'Court 03',
    description: 'Lead Court Umpire for Court 03. Manages digital scoreboard, line calls, service faults, and scoresheets.',
  },
  {
    email: 'umpire4@szwbt2026.edu',
    name: 'Court 04 Umpire',
    badge: 'COURT 04 UMPIRE',
    officialId: 'official-court-04',
    courtNumber: 'Court 04',
    description: 'Lead Court Umpire for Court 04. Manages digital scoreboard, line calls, service faults, and scoresheets.',
  },
  // Backwards-compatible alias for existing umpire account
  {
    email: 'umpire@szwbt2026.edu',
    name: 'Court 01 Umpire',
    badge: 'COURT 01 UMPIRE',
    officialId: 'official-court-01',
    courtNumber: 'Court 01',
    description: 'Chief Umpire Court 01. Matches umpire1 profile.',
  },
];

async function main() {
  console.log('Seeding 4 separate court umpire profiles...');

  // Ensure MATCH_OFFICIAL role exists
  const role = await prisma.role.upsert({
    where: { name: 'MATCH_OFFICIAL' },
    update: { displayName: 'Match Official / Umpire', isSystem: true },
    create: { name: 'MATCH_OFFICIAL', displayName: 'Match Official / Umpire', isSystem: true },
  });

  // Assign scoring permissions to MATCH_OFFICIAL
  const perms = ['scoring:read', 'scoring:update', 'match:read', 'match:update', 'match:assign_official'];
  for (const code of perms) {
    let p = await prisma.permission.findUnique({ where: { code } });
    if (!p) {
      p = await prisma.permission.create({
        data: {
          code,
          resource: code.split(':')[0],
          action: code.split(':')[1],
          description: `Permission for ${code}`,
        },
      });
    }
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: { roleId: role.id, permissionId: p.id },
      },
      update: {},
      create: { roleId: role.id, permissionId: p.id },
    });
  }

  for (const u of UMPIRES) {
    // 1. Upsert into User table
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {
        name: u.name,
        badge: u.badge,
        targetUrl: '/official',
        officialId: u.officialId,
        passwordHash: 'szwbt2026pass',
        isActive: true,
      },
      create: {
        email: u.email,
        name: u.name,
        badge: u.badge,
        targetUrl: '/official',
        officialId: u.officialId,
        passwordHash: 'szwbt2026pass',
        isActive: true,
      },
    });

    // 2. Assign MATCH_OFFICIAL role
    await prisma.userRole.upsert({
      where: {
        userId_roleId: { userId: user.id, roleId: role.id },
      },
      update: {},
      create: { userId: user.id, roleId: role.id },
    });

    // 3. Upsert into legacy Official table for fallback compatibility
    await prisma.official.upsert({
      where: { email: u.email },
      update: {
        name: u.name,
        badge: u.badge,
        role: 'MATCH_OFFICIAL',
        password: 'szwbt2026pass',
        targetUrl: '/official',
        description: u.description,
      },
      create: {
        email: u.email,
        name: u.name,
        badge: u.badge,
        role: 'MATCH_OFFICIAL',
        password: 'szwbt2026pass',
        targetUrl: '/official',
        description: u.description,
      },
    });

    // 4. Update Court table to associate with this umpire
    await prisma.court.upsert({
      where: { courtNumber: u.courtNumber },
      update: {
        umpire: u.name,
        status: 'AVAILABLE',
      },
      create: {
        courtNumber: u.courtNumber,
        venue: 'Main Indoor Stadium',
        status: 'AVAILABLE',
        umpire: u.name,
      },
    });

    console.log(`Seeded umpire: ${u.email} -> ${u.name} (${u.courtNumber})`);
  }

  // Also assign Court 01 matches to officialId 'official-court-01' or user id where appropriate
  const u1 = await prisma.user.findUnique({ where: { email: 'umpire1@szwbt2026.edu' } });
  const u2 = await prisma.user.findUnique({ where: { email: 'umpire2@szwbt2026.edu' } });
  const u3 = await prisma.user.findUnique({ where: { email: 'umpire3@szwbt2026.edu' } });
  const u4 = await prisma.user.findUnique({ where: { email: 'umpire4@szwbt2026.edu' } });

  if (u1) {
    await prisma.match.updateMany({
      where: { court: 'Court 01' },
      data: { assignedOfficialId: u1.id },
    });
  }
  if (u2) {
    await prisma.match.updateMany({
      where: { court: 'Court 02' },
      data: { assignedOfficialId: u2.id },
    });
  }
  if (u3) {
    await prisma.match.updateMany({
      where: { court: 'Court 03' },
      data: { assignedOfficialId: u3.id },
    });
  }
  if (u4) {
    await prisma.match.updateMany({
      where: { court: 'Court 04' },
      data: { assignedOfficialId: u4.id },
    });
  }

  console.log('Successfully assigned all matches on Court 01-04 to their respective umpires!');
}

main()
  .catch((e) => {
    console.error('Error seeding umpires:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
