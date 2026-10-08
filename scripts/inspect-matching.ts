import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const allTeams = await prisma.team.findMany();
  console.log("Searching for Siddhartha or Belagavi or Visvesvaraya:");
  for (const t of allTeams) {
    const tn = t.name.toLowerCase();
    if (
      tn.includes("belag") ||
      tn.includes("visv") ||
      tn.includes("sidd") ||
      tn.includes("vtu") ||
      tn.includes("techno") ||
      tn.includes("higher") ||
      tn.includes("academy")
    ) {
      console.log(`[${t.teamCode}] "${t.name}" (${t.state})`);
    }
  }

  console.log("\nAll Andhra Pradesh teams:");
  for (const t of allTeams.filter(t => t.state.toLowerCase().includes("andhra"))) {
    console.log(`[${t.teamCode}] "${t.name}"`);
  }

  console.log("\nAll Karnataka teams with 'Tech' or 'Bel':");
  for (const t of allTeams.filter(t => t.state.toLowerCase().includes("karna"))) {
    if (t.name.toLowerCase().includes("tech") || t.name.toLowerCase().includes("bel") || t.name.toLowerCase().includes("vis")) {
      console.log(`[${t.teamCode}] "${t.name}"`);
    }
  }
}

main().finally(() => prisma.$disconnect());
