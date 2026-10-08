import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function clearAllAllocations() {
  console.log("============================================================");
  console.log("REMOVING ALL ALLOTTED ROOMS & RESETTING TO MANUAL ALLOTMENT");
  console.log("============================================================");

  // 1. Delete all accommodation allocations
  const delAlloc = await prisma.accommodationAllocation.deleteMany({});
  console.log(`✔ Deleted ${delAlloc.count} accommodation allocation records.`);

  // 2. Reset all beds to AVAILABLE
  const resetBeds = await prisma.bed.updateMany({
    data: { status: "AVAILABLE" },
  });
  console.log(`✔ Reset ${resetBeds.count} beds back to status 'AVAILABLE'.`);

  // 3. Verification
  const allocCount = await prisma.accommodationAllocation.count();
  const occupiedBeds = await prisma.bed.count({ where: { status: "OCCUPIED" } });
  const availableBeds = await prisma.bed.count({ where: { status: "AVAILABLE" } });

  console.log("\n--- VERIFICATION ---");
  console.log(`Active Allocations in DB: ${allocCount} (Expected: 0)`);
  console.log(`Occupied Beds in DB: ${occupiedBeds} (Expected: 0)`);
  console.log(`Available Beds in DB: ${availableBeds}`);
  console.log("All room allotments completely cleared!\n");
}

clearAllAllocations()
  .catch((e) => {
    console.error("Error clearing allocations:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
