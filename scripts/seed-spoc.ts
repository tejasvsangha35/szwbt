import { prisma } from "../src/lib/prisma";
import { ROLES, ROLE_DEFINITIONS } from "../src/lib/rbac/roles";
import { PERMISSIONS } from "../src/lib/rbac/permissions";

export async function seedSpoc() {
  console.log("🏸 Seeding SPOC (Student Point of Contact) Role, Users & Team Assignments...");

  // 1. Ensure all RBAC Permissions and Roles are seeded authoritatively
  const { seedRbacData } = await import("../src/lib/rbac/seed");
  await seedRbacData();

  const spocRole = await prisma.role.findUniqueOrThrow({
    where: { name: ROLES.SPOC },
  });

  // 3. Upsert Primary SPOC User (spoc@szwbt2026.edu)
  const spocUser1 = await prisma.user.upsert({
    where: { email: "spoc@szwbt2026.edu" },
    update: {
      name: "Rahul Verma (SPOC Lead Coordinator)",
      badge: "SPOC LEAD",
      targetUrl: "/spoc",
      isActive: true,
    },
    create: {
      email: "spoc@szwbt2026.edu",
      name: "Rahul Verma (SPOC Lead Coordinator)",
      passwordHash: "szwbt2026pass",
      badge: "SPOC LEAD",
      targetUrl: "/spoc",
      isActive: true,
    },
  });

  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: spocUser1.id,
        roleId: spocRole.id,
      },
    },
    update: {},
    create: {
      userId: spocUser1.id,
      roleId: spocRole.id,
    },
  });

  // 4. Upsert Secondary SPOC User (spoc2@szwbt2026.edu)
  const spocUser2 = await prisma.user.upsert({
    where: { email: "spoc2@szwbt2026.edu" },
    update: {
      name: "Ananya Deshmukh (SPOC Contingent 2)",
      badge: "SPOC CONTINGENT",
      targetUrl: "/spoc",
      isActive: true,
    },
    create: {
      email: "spoc2@szwbt2026.edu",
      name: "Ananya Deshmukh (SPOC Contingent 2)",
      passwordHash: "szwbt2026pass",
      badge: "SPOC CONTINGENT",
      targetUrl: "/spoc",
      isActive: true,
    },
  });

  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: spocUser2.id,
        roleId: spocRole.id,
      },
    },
    update: {},
    create: {
      userId: spocUser2.id,
      roleId: spocRole.id,
    },
  });

  // 5. Clean up obsolete volunteer user roles and users if present
  const obsoleteEmails = ["volunteer@szwbt2026.edu", "volunteer2@szwbt2026.edu"];
  for (const email of obsoleteEmails) {
    const oldUser = await prisma.user.findUnique({ where: { email } });
    if (oldUser) {
      // Remove any user roles
      await prisma.userRole.deleteMany({ where: { userId: oldUser.id } });
      // Delete the user record
      try {
        await prisma.user.delete({ where: { id: oldUser.id } });
      } catch (e) {
        // In case foreign keys exist, mark inactive
        await prisma.user.update({
          where: { id: oldUser.id },
          data: { isActive: false, targetUrl: "/login" },
        });
      }
    }
  }

  // Clean obsolete VOLUNTEER role if still in DB
  const oldVolRole = await prisma.role.findUnique({ where: { name: "VOLUNTEER" } });
  if (oldVolRole) {
    await prisma.rolePermission.deleteMany({ where: { roleId: oldVolRole.id } });
    await prisma.userRole.deleteMany({ where: { roleId: oldVolRole.id } });
    try {
      await prisma.role.delete({ where: { id: oldVolRole.id } });
    } catch {
      // Ignore if referenced
    }
  }

  // 6. SPOC assignments start clean
  console.log("✅ SPOC Role & Accounts Seeded Successfully! (Assignments start empty for clean operations)");
  return;

  const spoc1Teams = allTeams.slice(0, 4);
  const spoc2Teams = allTeams.slice(4, 8);

  // Clear existing assignments for these two SPOCs
  await prisma.spocTeamAssignment.deleteMany({
    where: {
      spocId: { in: [spocUser1.id, spocUser2.id] },
    },
  });

  // Also remove any existing assignments for these 8 teams
  await prisma.spocTeamAssignment.deleteMany({
    where: {
      teamId: { in: allTeams.slice(0, 8).map((t) => t.id) },
    },
  });

  // 7. Assign 4 teams to SPOC 1
  for (const team of spoc1Teams) {
    await prisma.spocTeamAssignment.create({
      data: {
        spocId: spocUser1.id,
        teamId: team.id,
        assignedBy: "SUPER_ADMIN",
      },
    });
  }

  // 8. Assign 4 teams to SPOC 2
  for (const team of spoc2Teams) {
    await prisma.spocTeamAssignment.create({
      data: {
        spocId: spocUser2.id,
        teamId: team.id,
        assignedBy: "SUPER_ADMIN",
      },
    });
  }

  // 9. Enrich SPOC 1 teams with realistic test states:
  // Team 0: LIVE Match
  // Team 1: READY (Upcoming Match, Arrived, Checked In)
  // Team 2: ATTENTION (Pending arrival / pending hostel)
  // Team 3: COMPLETED (Completed Match)

  const [tLive, tReady, tAttention, tCompleted] = spoc1Teams;

  // Ensure tournament day exists
  await prisma.tournamentDay.upsert({
    where: { id: "OCT18" },
    update: {},
    create: {
      id: "OCT18",
      date: "OCT 18",
      dayNumber: "Day 1",
      stage: "Round 1",
      isPublished: true,
    },
  });

  // Setup LIVE match for Team 0
  await prisma.match.deleteMany({
    where: {
      OR: [
        { teamAId: tLive.id },
        { teamBId: tLive.id },
        { matchNumber: "M-SPOC-LIVE" },
      ],
    },
  });

  await prisma.match.create({
    data: {
      dayId: "OCT18",
      matchNumber: "M-SPOC-LIVE",
      publicMatchNumber: "M-SPOC-LIVE",
      teamAId: tLive.id,
      teamBId: spoc2Teams[0].id,
      playerA: tLive.captainName || "Captain " + tLive.name,
      institutionA: tLive.institution,
      playerB: spoc2Teams[0].captainName || "Captain " + spoc2Teams[0].name,
      institutionB: spoc2Teams[0].institution,
      court: "Court 02",
      category: "Women's Team Championship",
      time: "10:30 IST",
      status: "LIVE",
      scoreA: "18",
      scoreB: "15",
      isPublished: true,
    },
  });

  // Setup UPCOMING match for Team 1
  await prisma.match.deleteMany({
    where: { matchNumber: "M-SPOC-READY" },
  });

  await prisma.match.create({
    data: {
      dayId: "OCT18",
      matchNumber: "M-SPOC-READY",
      publicMatchNumber: "M-SPOC-READY",
      teamAId: tReady.id,
      teamBId: spoc2Teams[1].id,
      playerA: tReady.captainName || "Captain " + tReady.name,
      institutionA: tReady.institution,
      playerB: spoc2Teams[1].captainName || "Captain " + spoc2Teams[1].name,
      institutionB: spoc2Teams[1].institution,
      court: "Court 03",
      category: "Women's Team Championship",
      time: "14:00 IST",
      status: "UPCOMING",
      isPublished: true,
    },
  });

  // Setup COMPLETED match for Team 3
  await prisma.match.deleteMany({
    where: { matchNumber: "M-SPOC-DONE" },
  });

  await prisma.match.create({
    data: {
      dayId: "OCT18",
      matchNumber: "M-SPOC-DONE",
      publicMatchNumber: "M-SPOC-DONE",
      teamAId: tCompleted.id,
      teamBId: spoc2Teams[2].id,
      playerA: tCompleted.captainName || "Captain " + tCompleted.name,
      institutionA: tCompleted.institution,
      playerB: spoc2Teams[2].captainName || "Captain " + spoc2Teams[2].name,
      institutionB: spoc2Teams[2].institution,
      court: "Court 01",
      category: "Women's Team Championship",
      time: "09:00 IST",
      status: "COMPLETED",
      scoreA: "21",
      scoreB: "17",
      winner: "PLAYER_A",
      isPublished: true,
    },
  });

  // Setup transport for tReady (ARRIVED)
  const readyTrip = await prisma.transportTrip.upsert({
    where: { tripCode: "TRIP-SPOC-01" },
    update: { status: "ARRIVED" },
    create: {
      tripCode: "TRIP-SPOC-01",
      scheduledDate: "2026-10-18",
      scheduledTime: "08:30 IST",
      pickupPoint: "Hubballi Junction (UBL)",
      dropPoint: "Shalmala Hostel",
      status: "ARRIVED",
      driverName: "Ramesh Naik",
      driverPhone: "+91 98450 11223",
      vehicleNo: "KA-25-AA-1001",
    },
  });

  await prisma.transportPassenger.deleteMany({
    where: { tripId: readyTrip.id, teamId: tReady.id },
  });
  await prisma.transportPassenger.create({
    data: {
      tripId: readyTrip.id,
      teamId: tReady.id,
      pickupPoint: "Hubballi Junction (UBL)",
      dropPoint: "Shalmala Hostel",
      boardingStatus: "BOARDED",
    },
  });

  // Setup transport for tAttention (DELAYED)
  const delayedTrip = await prisma.transportTrip.upsert({
    where: { tripCode: "TRIP-SPOC-ATTN" },
    update: { status: "DELAYED" },
    create: {
      tripCode: "TRIP-SPOC-ATTN",
      scheduledDate: "2026-10-18",
      scheduledTime: "09:30 IST",
      pickupPoint: "Hubballi Airport (HBX)",
      dropPoint: "Vindhya Hostel",
      status: "DELAYED",
      driverName: "Suresh Patil",
      driverPhone: "+91 98450 99887",
      vehicleNo: "KA-25-BB-2002",
      delayMinutes: 45,
    },
  });

  await prisma.transportPassenger.deleteMany({
    where: { tripId: delayedTrip.id, teamId: tAttention.id },
  });
  await prisma.transportPassenger.create({
    data: {
      tripId: delayedTrip.id,
      teamId: tAttention.id,
      pickupPoint: "Hubballi Airport (HBX)",
      dropPoint: "Vindhya Hostel",
      boardingStatus: "PENDING",
    },
  });

  console.log("✅ SPOC Role, Accounts & 4-Team Relational Assignments Seeded Successfully!");
  console.log(`SPOC 1: ${spocUser1.email} -> 4 Teams Assigned: ${spoc1Teams.map((t) => t.name).join(", ")}`);
  console.log(`SPOC 2: ${spocUser2.email} -> 4 Teams Assigned: ${spoc2Teams.map((t) => t.name).join(", ")}`);
}

if (require.main === module) {
  seedSpoc()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("❌ Seed SPOC failed:", err);
      process.exit(1);
    });
}
