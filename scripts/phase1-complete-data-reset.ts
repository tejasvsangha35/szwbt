/**
 * PHASE 1 - COMPLETE DATA RESET
 *
 * Clears all existing TEST, DEMO, MOCK, SEEDED, GENERATED, and OLD EVENT data
 * from the website, backend, and PostgreSQL database across EVERY role and module.
 *
 * Preserves:
 * - Application source code & schema
 * - Admin/Official accounts from credentials directory
 * - Role definitions & Permissions (RBAC)
 * - Physical infrastructure (Courts 01-04, Hostels, Rooms, Beds, Transport Routes, Stops, Vehicles, Drivers)
 * - System configuration & settings
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function completeDataReset() {
  console.log("================================================================================");
  console.log("🏸 PHASE 1: COMPLETE TOURNAMENT DATA RESET INITIATED");
  console.log("================================================================================\n");

  // 1. CLEAR EVENT REPORTING & MATCH TELEMETRY
  console.log("1. Clearing Match Operational Telemetry & Event Records...");
  const delResComms = await prisma.resultCommunication.deleteMany({});
  console.log(`   - Deleted ${delResComms.count} ResultCommunication records.`);

  const delReadiness = await prisma.courtReadinessCheck.deleteMany({});
  console.log(`   - Deleted ${delReadiness.count} CourtReadinessCheck records.`);

  const delPreMatch = await prisma.preMatchReporting.deleteMany({});
  console.log(`   - Deleted ${delPreMatch.count} PreMatchReporting records.`);

  const delMatchEvents = await prisma.matchEvent.deleteMany({});
  console.log(`   - Deleted ${delMatchEvents.count} MatchEvent records.`);

  // 2. CLEAR ALL OLD MATCHES & FIXTURE GRAPH STATE
  console.log("\n2. Clearing Old Tournament Matches, Bracket Slots & Fixture Positions...");
  const delMatches = await prisma.match.deleteMany({});
  console.log(`   - Deleted ${delMatches.count} old Match records.`);

  const delSlots = await prisma.bracketSlotAssignment.deleteMany({});
  console.log(`   - Deleted ${delSlots.count} BracketSlotAssignment records.`);

  const delDrawHist = await prisma.drawHistory.deleteMany({});
  console.log(`   - Deleted ${delDrawHist.count} DrawHistory records.`);

  const delPositions = await prisma.fixturePosition.deleteMany({});
  console.log(`   - Deleted ${delPositions.count} FixturePosition records.`);

  await prisma.fixtureConfig.deleteMany({});
  console.log(`   - Cleared FixtureConfig.`);

  // 3. RESET COURTS & PHYSICAL VENUE
  console.log("\n3. Resetting Courts to Clean Standby / Ready State...");
  const resetCourts = await prisma.court.updateMany({
    data: {
      status: "READY",
      umpire: null,
    },
  });
  console.log(`   - Reset ${resetCourts.count} courts to READY (no assigned umpires/matches).`);

  await prisma.venueArea.updateMany({
    data: {
      status: "READY",
      inCharge: null,
    },
  });

  await prisma.scheduleLock.updateMany({
    data: {
      isLocked: false,
      lockedBy: null,
      lockedAt: null,
      reason: null,
    },
  });

  // 4. CLEAR SPOC ASSIGNMENTS
  console.log("\n4. Clearing SPOC Assignments & Team Bindings...");
  const delSpoc = await prisma.spocTeamAssignment.deleteMany({});
  console.log(`   - Deleted ${delSpoc.count} SPOC team assignments.`);

  // 5. CLEAR ALL REGISTRATION DATA (PARTICIPANTS, DOCUMENTS, TEAM MEMBERS, PASSES)
  console.log("\n5. Clearing All Registration Records & Participant Data...");
  const unlinkedUsers = await prisma.user.updateMany({
    where: {
      OR: [
        { participantId: { not: null } },
        { teamId: { not: null } },
      ],
    },
    data: {
      participantId: null,
      teamId: null,
    },
  });
  console.log(`   - Unlinked participant/team IDs from ${unlinkedUsers.count} user accounts.`);

  const delDocs = await prisma.document.deleteMany({});
  console.log(`   - Deleted ${delDocs.count} Document records.`);

  const delMembers = await prisma.teamMember.deleteMany({});
  console.log(`   - Deleted ${delMembers.count} TeamMember records.`);

  const delQr = await prisma.qrPass.deleteMany({});
  console.log(`   - Deleted ${delQr.count} QrPass records.`);

  const delFoodCons = await prisma.foodConsumption.deleteMany({});
  console.log(`   - Deleted ${delFoodCons.count} FoodConsumption records.`);

  const delFoodAssign = await prisma.foodPackageAssignment.deleteMany({});
  console.log(`   - Deleted ${delFoodAssign.count} FoodPackageAssignment records.`);

  const delFeeLedgers = await prisma.feeLedger.deleteMany({});
  console.log(`   - Deleted ${delFeeLedgers.count} FeeLedger records.`);

  const delPayments = await prisma.paymentTransaction.deleteMany({});
  console.log(`   - Deleted ${delPayments.count} PaymentTransaction records.`);

  const delParticipants = await prisma.participant.deleteMany({});
  console.log(`   - Deleted ${delParticipants.count} Participant records.`);

  // 6. CLEAR TRANSPORTATION DATA (TRIPS, PASSENGERS, ASSIGNMENTS)
  console.log("\n6. Clearing All Transportation Trips & Passenger Manifests...");
  const delPassengers = await prisma.transportPassenger.deleteMany({});
  console.log(`   - Deleted ${delPassengers.count} TransportPassenger records.`);

  const delTrips = await prisma.transportTrip.deleteMany({});
  console.log(`   - Deleted ${delTrips.count} TransportTrip records.`);

  const resetVehicles = await prisma.transportVehicle.updateMany({
    data: { status: "AVAILABLE" },
  });
  console.log(`   - Reset ${resetVehicles.count} TransportVehicles to AVAILABLE.`);

  const resetDrivers = await prisma.transportDriver.updateMany({
    data: { status: "AVAILABLE" },
  });
  console.log(`   - Reset ${resetDrivers.count} TransportDrivers to AVAILABLE.`);

  // 7. CLEAR ACCOMMODATION DATA (ALLOCATIONS, OCCUPANCY)
  console.log("\n7. Clearing All Accommodation Allocations & Resetting Beds...");
  const delAllocations = await prisma.accommodationAllocation.deleteMany({});
  console.log(`   - Deleted ${delAllocations.count} AccommodationAllocation records.`);

  const resetBeds = await prisma.bed.updateMany({
    data: { status: "AVAILABLE" },
  });
  console.log(`   - Reset ${resetBeds.count} physical beds across all hostels to AVAILABLE.`);

  // 8. CLEAR VOLUNTEER & ON-GROUND FIELD OPERATIONS DATA
  console.log("\n8. Clearing Volunteer Tasks, Shifts, Assignments & Issues...");
  const delIssues = await prisma.volunteerIssue.deleteMany({});
  console.log(`   - Deleted ${delIssues.count} VolunteerIssue records.`);

  const delTasks = await prisma.volunteerTask.deleteMany({});
  console.log(`   - Deleted ${delTasks.count} VolunteerTask records.`);

  const delShifts = await prisma.volunteerShift.deleteMany({});
  console.log(`   - Deleted ${delShifts.count} VolunteerShift records.`);

  const delAssignments = await prisma.volunteerAssignment.deleteMany({});
  console.log(`   - Deleted ${delAssignments.count} VolunteerAssignment records.`);

  // 9. CLEAR SUPPORT TICKETS & MESSAGES
  console.log("\n9. Clearing Support Desk Tickets, Messages & Escalations...");
  const delSupportAttachments = await prisma.supportAttachment.deleteMany({});
  console.log(`   - Deleted ${delSupportAttachments.count} SupportAttachment records.`);

  const delSupportMessages = await prisma.supportMessage.deleteMany({});
  console.log(`   - Deleted ${delSupportMessages.count} SupportMessage records.`);

  const delSupportEscalations = await prisma.supportEscalation.deleteMany({});
  console.log(`   - Deleted ${delSupportEscalations.count} SupportEscalation records.`);

  const delSupportTickets = await prisma.supportTicket.deleteMany({});
  console.log(`   - Deleted ${delSupportTickets.count} SupportTicket records.`);

  // 10. CLEAR EVENT NOTIFICATIONS & AUDIT LOGS
  console.log("\n10. Clearing Event Announcements, Notifications & Audit Logs...");
  const delDeliveries = await prisma.notificationDelivery.deleteMany({});
  console.log(`   - Deleted ${delDeliveries.count} NotificationDelivery records.`);

  const delAnnouncements = await prisma.announcement.deleteMany({});
  console.log(`   - Deleted ${delAnnouncements.count} Announcement records.`);

  const delAuditLogs = await prisma.auditLog.deleteMany({});
  console.log(`   - Deleted ${delAuditLogs.count} AuditLog records.`);

  // 11. CLEAR OLD TEAMS & OLD INSTITUTIONS
  console.log("\n11. Clearing Old Team Records & Old Institution Imports...");
  const delTeams = await prisma.team.deleteMany({});
  console.log(`   - Deleted ${delTeams.count} old Team records.`);

  const delImports = await prisma.institutionImport.deleteMany({});
  console.log(`   - Deleted ${delImports.count} InstitutionImport records.`);

  // 12. CLEAN UP DUMMY TEST USER ACCOUNTS (PRESERVING CREDENTIALS DIRECTORY USERS)
  console.log("\n12. Verifying Authorized System Users & Pruning Non-System Test Accounts...");
  const officialEmails = [
    "admin@szwbt2026.edu",
    "registration@szwbt2026.edu",
    "hostel@szwbt2026.edu",
    "transport@szwbt2026.edu",
    "finance@szwbt2026.edu",
    "umpire@szwbt2026.edu",
    "umpire1@szwbt2026.edu",
    "umpire2@szwbt2026.edu",
    "umpire3@szwbt2026.edu",
    "umpire4@szwbt2026.edu",
    "team@szwbt2026.edu",
    "manager.blr@szwbt2026.edu",
    "player@szwbt2026.edu",
    "ananya@szwbt2026.edu",
    "spoc@szwbt2026.edu",
    "spoc2@szwbt2026.edu",
    "ops@szwbt2026.edu",
    "organizer@szwbt2026.edu",
    "techops@szwbt2026.edu",
    "scanner@szwbt2026.edu",
    "documents@szwbt2026.edu",
    "priya.multirole@szwbt2026.edu",
    "lead.multirole@szwbt2026.edu",
    "support@szwbt2026.edu",
    "agent.kavya@szwbt2026.edu",
    "reports@szwbt2026.edu",
    "comm@szwbt2026.edu",
  ];

  const dummyUsers = await prisma.user.findMany({
    where: {
      email: {
        notIn: officialEmails,
      },
    },
    select: { id: true, email: true },
  });

  if (dummyUsers.length > 0) {
    console.log(`   - Found ${dummyUsers.length} non-official test users. Removing...`);
    for (const du of dummyUsers) {
      await prisma.userRole.deleteMany({ where: { userId: du.id } });
      await prisma.userSession.deleteMany({ where: { userId: du.id } });
      await prisma.userPreference.deleteMany({ where: { userId: du.id } });
      await prisma.user.delete({ where: { id: du.id } });
    }
  }

  // 13. ENSURE TOURNAMENT DAYS EXIST
  const tournamentDays = [
    { id: "OCT18", date: "OCT 18", dayNumber: "Day 1", stage: "Round 1 & Round 2", isPublished: true },
    { id: "OCT19", date: "OCT 19", dayNumber: "Day 2", stage: "Quarter-Finals, Semi-Finals & Pool Finals", isPublished: true },
    { id: "OCT20", date: "OCT 20", dayNumber: "Day 3", stage: "Super Quarters & Semi-Finals", isPublished: true },
    { id: "OCT21", date: "OCT 21", dayNumber: "Day 4", stage: "Grand Finals & Hardline Tie", isPublished: true },
  ];

  for (const td of tournamentDays) {
    await prisma.tournamentDay.upsert({
      where: { id: td.id },
      update: td,
      create: td,
    });
  }

  console.log("\n================================================================================");
  console.log("✔ PHASE 1 COMPLETE: ALL EVENT/TEST/MOCK DATA HAS BEEN ENTIRELY WIPED CLEAN!");
  console.log("================================================================================\n");
}

completeDataReset()
  .catch((err) => {
    console.error("FATAL ERROR IN PHASE 1 RESET:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
