import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });
}

// Invalidate stale cached instance if new models like spocTeamAssignment or bracketSlotAssignment are missing
if (
  globalForPrisma.prisma &&
  (!(globalForPrisma.prisma as any).bracketSlotAssignment || !(globalForPrisma.prisma as any).spocTeamAssignment)
) {
  try {
    (globalForPrisma.prisma as any).$disconnect?.();
  } catch {}
  globalForPrisma.prisma = undefined;
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

console.log("[PRISMA INIT] spocTeamAssignment exists?", Boolean((prisma as any).spocTeamAssignment));

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
