import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const shalmala = await prisma.hostel.findFirst({
    where: { name: { contains: "Shalmala" } },
    include: {
      rooms: {
        include: { beds: true, floor: true },
        orderBy: { roomNumber: "asc" }
      }
    }
  });

  if (!shalmala) {
    console.log("No Shalmala hostel found");
    return;
  }

  console.log(`Shalmala Hostel ID: ${shalmala.id}, Total Rooms: ${shalmala.rooms.length}`);
  let totalBeds = 0;
  for (const r of shalmala.rooms) {
    totalBeds += r.beds.length;
    console.log(`Room ${r.roomNumber}: ${r.beds.length} beds (capacity: ${r.capacity}) - Floor: ${r.floor?.name}`);
  }
  console.log(`Total beds in Shalmala: ${totalBeds}`);
}

main().finally(() => prisma.$disconnect());
