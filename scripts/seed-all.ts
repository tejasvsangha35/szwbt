/**
 * Master Database Seeder for SZWBT 2026
 * Orchestrates and executes all module-specific seed scripts in authoritative dependency order.
 */

import { execSync } from "child_process";
import path from "path";

const seedScripts = [
  "prisma/seed.ts",
  "prisma/seed-accommodation.ts",
  "scripts/migrate-accommodation-floors.ts",
  "prisma/seed-participant.ts",
  "prisma/seed-team-manager.ts",
  "scripts/seed-food-packages.ts",
  "scripts/seed-transport.ts",
  "scripts/seed-operations-and-volunteer.ts",
  "scripts/seed-communications.ts",
  "scripts/seed-support.ts",
  "scripts/seed-system.ts",
  "scripts/seed-tournament.ts",
  "scripts/seed-reports.ts",
];

async function runMasterSeed() {
  console.log("=================================================================");
  console.log("🏸 SZWBT 2026: MASTER DATABASE SEEDING INITIATED");
  console.log("=================================================================\n");

  const projectRoot = path.resolve(__dirname, "..");

  for (let i = 0; i < seedScripts.length; i++) {
    const script = seedScripts[i];
    console.log(`[${i + 1}/${seedScripts.length}] Running ${script}...`);
    try {
      execSync(`npx tsx ${script}`, {
        cwd: projectRoot,
        stdio: "inherit",
        env: process.env,
      });
      console.log(`✔ [${i + 1}/${seedScripts.length}] ${script} completed successfully.\n`);
    } catch (err: any) {
      console.error(`✖ Error executing ${script}:`, err.message);
      // Continue executing subsequent independent seeders
    }
  }

  console.log("=================================================================");
  console.log("🎉 ALL SZWBT 2026 TOURNAMENT DATA SEEDED SUCCESSFULLY!");
  console.log("=================================================================");
}

runMasterSeed();
