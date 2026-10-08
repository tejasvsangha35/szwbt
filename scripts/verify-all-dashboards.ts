import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const adminUser = await prisma.user.findFirst({ where: { email: "admin@szwbt2026.edu" } });
  console.log("Admin user:", adminUser?.email);

  // Check participants count
  const partCount = await prisma.participant.count();
  const teamCount = await prisma.team.count();
  const tmCount = await prisma.teamMember.count();
  const docCount = await prisma.document.count();
  const allocCount = await prisma.accommodationAllocation.count();
  const occupiedBeds = await prisma.bed.count({ where: { status: "OCCUPIED" } });

  console.log(`DB Counts:
  - Participants: ${partCount}
  - Teams: ${teamCount}
  - Team Members: ${tmCount}
  - Documents: ${docCount}
  - Accommodation Allocations: ${allocCount}
  - Occupied Beds: ${occupiedBeds}
  `);

  const sampleParticipants = await prisma.participant.findMany({
    take: 5,
    include: {
      teamMemberships: { include: { team: true } },
      documents: true,
      bedAllocations: { include: { bed: { include: { room: true } } } },
    },
  });

  for (const p of sampleParticipants) {
    const tm = p.teamMemberships[0];
    const alloc = p.bedAllocations[0];
    console.log(`Participant [${p.playerId}] ${p.name} (${p.category})`);
    console.log(`  Team: [${tm?.team.teamCode}] ${tm?.team.name} (Role: ${tm?.role})`);
    console.log(`  Docs: ${p.documents.length} verified documents`);
    console.log(`  Bed: Room ${alloc?.bed.room.roomNumber} - Bed ${alloc?.bed.bedNumber}`);
  }
}

main().finally(() => prisma.$disconnect());
