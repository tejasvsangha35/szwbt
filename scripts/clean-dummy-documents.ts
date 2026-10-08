import { prisma } from "../src/lib/prisma";

async function main() {
  console.log("=== CLEANING DUMMY DOCUMENTS ===");

  const totalBefore = await prisma.document.count();
  console.log(`Total Document records before cleanup: ${totalBefore}`);

  // Delete all dummy documents where filePath starts with /uploads/documents/
  // or that were seeded by registration@szwbt2026.edu
  const deleted = await prisma.document.deleteMany({
    where: {
      OR: [
        { filePath: { startsWith: "/uploads/documents/" } },
        { capturedBy: "registration@szwbt2026.edu" },
      ],
    },
  });

  console.log(`Deleted ${deleted.count} dummy Document records.`);

  const remaining = await prisma.document.count();
  console.log(`Remaining Document records: ${remaining}`);

  // Update participant status to PENDING for athletes whose documents are pending
  const updatedParticipants = await prisma.participant.updateMany({
    where: {
      category: { not: "Contingent Management" },
    },
    data: {
      status: "PENDING",
    },
  });
  console.log(`Reset status to PENDING for ${updatedParticipants.count} participants.`);

  // Also remove dummy qrPasses for participants who do not have verified documents
  const deletedPasses = await prisma.qrPass.deleteMany({
    where: {
      createdBy: "registration@szwbt2026.edu",
    },
  });
  console.log(`Deleted ${deletedPasses.count} unverified dummy qrPass records.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
