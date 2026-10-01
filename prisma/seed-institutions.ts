import { PrismaClient } from "@prisma/client";
import { MASTER_INSTITUTIONS, normalizeStateName } from "../src/data/institutions";

const prisma = new PrismaClient();

export async function seedInstitutions() {
  console.log("Seeding institutions master data...");

  let inserted = 0;
  let updated = 0;

  for (const inst of MASTER_INSTITUTIONS) {
    const normalizedState = normalizeStateName(inst.state);
    const existing = await prisma.institution.findFirst({
      where: {
        OR: [
          { institutionCode: inst.institutionCode },
          { name: { equals: inst.name, mode: "insensitive" }, state: { equals: normalizedState, mode: "insensitive" } },
        ],
      },
    });

    if (existing) {
      await prisma.institution.update({
        where: { id: existing.id },
        data: {
          institutionCode: inst.institutionCode,
          name: inst.name,
          state: normalizedState,
          city: inst.city || null,
          district: inst.district || null,
          status: inst.status,
        },
      });
      updated++;
    } else {
      await prisma.institution.create({
        data: {
          institutionCode: inst.institutionCode,
          name: inst.name,
          state: normalizedState,
          city: inst.city || null,
          district: inst.district || null,
          status: inst.status,
        },
      });
      inserted++;
    }
  }

  console.log(`Institutions seeding complete: ${inserted} inserted, ${updated} updated, total ${MASTER_INSTITUTIONS.length}.`);
}

if (require.main === module) {
  seedInstitutions()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
