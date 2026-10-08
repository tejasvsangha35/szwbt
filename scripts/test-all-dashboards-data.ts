import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  console.log("=== TESTING DASHBOARD QUERIES & ENDPOINTS ===");

  // 1. Registration Desk KPIs
  const totalParticipants = await prisma.participant.count();
  const totalTeams = await prisma.team.count();
  const totalCompletedTeams = await prisma.team.count({ where: { status: "COMPLETED" } });
  const totalDocs = await prisma.document.count({ where: { status: "VERIFIED" } });
  const totalPaidLedgers = await prisma.feeLedger.count({ where: { status: "PAID" } });

  console.log(`\n1. REGISTRATION DASHBOARD DATA:`);
  console.log(`   Total Participants: ${totalParticipants}`);
  console.log(`   Total Teams: ${totalTeams} (${totalCompletedTeams} Completed/Registered)`);
  console.log(`   Verified Documents: ${totalDocs}`);
  console.log(`   Paid Team Fee Ledgers: ${totalPaidLedgers}`);

  // 2. Transportation Dashboard Data
  const setting = await prisma.systemSetting.findUnique({ where: { key: "SZWBT_TRANSPORT_ARRIVALS_STATE" } });
  const arrivals = setting ? JSON.parse(setting.value) : [];
  const trips = await prisma.transportTrip.count();
  const passengers = await prisma.transportPassenger.count();

  console.log(`\n2. TRANSPORTATION DASHBOARD DATA:`);
  console.log(`   Total System Arrivals: ${arrivals.length}`);
  const oct16 = arrivals.filter((a: any) => a.date === "2026-10-16").length;
  const oct17 = arrivals.filter((a: any) => a.date === "2026-10-17").length;
  const oct18 = arrivals.filter((a: any) => a.date === "2026-10-18").length;
  const oct19 = arrivals.filter((a: any) => a.date === "2026-10-19").length;
  console.log(`   Oct 16 Arrivals: ${oct16}`);
  console.log(`   Oct 17 Arrivals: ${oct17}`);
  console.log(`   Oct 18 Arrivals: ${oct18}`);
  console.log(`   Oct 19 Arrivals: ${oct19}`);
  console.log(`   Scheduled Pickup Trips in DB: ${trips}`);
  console.log(`   Booked Contingent Passengers in DB: ${passengers}`);

  // 3. Accommodation Dashboard Data
  const allocations = await prisma.accommodationAllocation.count();
  const occupiedBeds = await prisma.bed.count({ where: { status: "OCCUPIED" } });
  const shalmalaRooms = await prisma.room.count({ where: { hostelId: "SHALMALA" } });

  console.log(`\n3. ACCOMMODATION DASHBOARD DATA:`);
  console.log(`   Total Bed Allocations: ${allocations}`);
  console.log(`   Occupied Beds: ${occupiedBeds}`);
  console.log(`   Shalmala Active Rooms: ${shalmalaRooms}`);

  // 4. Food / Catering Package Assignments
  const foodAssignments = await prisma.foodPackageAssignment.count();
  console.log(`\n4. CATERING / FOOD MESS DATA:`);
  console.log(`   Oct 17 Food Assignments: ${foodAssignments}`);

  // 5. SPOC Assignments
  const spocAssignments = await prisma.spocTeamAssignment.count();
  console.log(`\n5. SPOC SYSTEM DATA:`);
  console.log(`   Total SPOC Team Assignments: ${spocAssignments}`);
}

main().finally(() => prisma.$disconnect());
