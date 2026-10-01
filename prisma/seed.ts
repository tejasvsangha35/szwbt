import { PrismaClient } from "@prisma/client";
import { seedRbacData } from "../src/lib/rbac/seed";
import { seedInstitutions } from "./seed-institutions";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding PostgreSQL database szwbt_db...");

  // 1. Seed Tournament Days (OCT 18 is published, OCT 19-21 are unpublished/TBA)
  const days = [
    { id: "OCT18", date: "OCT 18", dayNumber: "Day 1", stage: "Round 1", isPublished: true },
    { id: "OCT19", date: "OCT 19", dayNumber: "Day 2", stage: "Round 2 & QF", isPublished: false },
    { id: "OCT20", date: "OCT 20", dayNumber: "Day 3", stage: "Semi-Finals", isPublished: false },
    { id: "OCT21", date: "OCT 21", dayNumber: "Day 4", stage: "Grand Finals", isPublished: false },
  ];

  for (const day of days) {
    await prisma.tournamentDay.upsert({
      where: { id: day.id },
      update: day,
      create: day,
    });
  }

  // 2. Clear Existing Matches so the system starts with zero dummy tournament data
  await prisma.resultCommunication.deleteMany({});
  await prisma.courtReadinessCheck.deleteMany({});
  await prisma.preMatchReporting.deleteMany({});
  await prisma.matchEvent.deleteMany({});
  await prisma.match.deleteMany({});

  // 3. Seed Official Credentials
  const officials = [
    {
      email: "admin@szwbt2026.edu",
      name: "Super Administrator",
      role: "SUPER_ADMIN",
      badge: "LEVEL 04 ROOT",
      password: "szwbt2026pass",
      targetUrl: "/admin",
      description: "Full tournament operations, database administration & 18 dashboard hubs.",
    },
    {
      email: "umpire@szwbt2026.edu",
      name: "Chief Umpire",
      role: "CHIEF_UMPIRE",
      badge: "BWF TECHNICAL",
      password: "szwbt2026pass",
      targetUrl: "/matches",
      description: "Live court scoring console, line judge reports & official match tie sheets.",
    },
    {
      email: "team@szwbt2026.edu",
      name: "Team Manager",
      role: "TEAM_MANAGER",
      badge: "UNIVERSITY DESK",
      password: "szwbt2026pass",
      targetUrl: "/team",
      description: "Roster verification, player passes, transit dispatch & hostel allocations.",
    },
    {
      email: "secretariat@szwbt2026.edu",
      name: "Organizing Desk Secretariat",
      role: "ORGANIZER",
      badge: "SZWBT SECRETARIAT",
      password: "szwbt2026pass",
      targetUrl: "/organizer",
      description: "Overall tournament flow, VIP hospitality, broadcast feeds & arena logistics.",
    },
    {
      email: "player@szwbt2026.edu",
      name: "Tournament Participant",
      role: "PARTICIPANT",
      badge: "PLAYER HUD",
      password: "szwbt2026pass",
      targetUrl: "/dashboard",
      description: "Athlete accreditation pass, court call timings & hostel bed assignment.",
    },
    {
      email: "techops@szwbt2026.edu",
      name: "Technical Operations Lead",
      role: "OPERATIONS_STAFF",
      badge: "TECHOPS COMMAND",
      password: "szwbt2026pass",
      targetUrl: "/operations",
      description: "Technical match operations, court allocation, umpire assignments & live tournament interventions.",
    },
    {
      email: "scanner@szwbt2026.edu",
      name: "Document Scanner Officer",
      role: "DOCUMENT_SCANNER",
      badge: "DOC SCANNER 01",
      password: "szwbt2026pass",
      targetUrl: "/scanner",
      description: "Mobile document scanner for QR verification, university ID, SSLC & PUC marks card validation.",
    },
    {
      email: "documents@szwbt2026.edu",
      name: "Document Verification Lead",
      role: "DOCUMENT_SCANNER",
      badge: "DOC VERIFICATION",
      password: "szwbt2026pass",
      targetUrl: "/scanner",
      description: "High-throughput document verification desk, OCR matching and athlete eligibility accreditation.",
    },
    {
      email: "volunteer@szwbt2026.edu",
      name: "Field Operations Volunteer",
      role: "VOLUNTEER",
      badge: "MOBILE FIELD",
      password: "szwbt2026pass",
      targetUrl: "/volunteer",
      description: "On-ground task list, participant lookup & quick QR pass scanner.",
    },
  ];

  for (const off of officials) {
    await prisma.official.upsert({
      where: { email: off.email },
      update: off,
      create: off,
    });
  }

  // 4. Seed Courts (Strictly 4 physical courts available, none in dummy LIVE state)
  await prisma.court.deleteMany({
    where: { courtNumber: { in: ["Court 05", "Court 06", "Court 07", "Court 08"] } },
  });

  const courts = [
    { courtNumber: "Court 01", status: "AVAILABLE", umpire: null, venue: "Main Indoor Stadium", isActive: true },
    { courtNumber: "Court 02", status: "AVAILABLE", umpire: null, venue: "Main Indoor Stadium", isActive: true },
    { courtNumber: "Court 03", status: "AVAILABLE", umpire: null, venue: "Main Indoor Stadium", isActive: true },
    { courtNumber: "Court 04", status: "AVAILABLE", umpire: null, venue: "Main Indoor Stadium", isActive: true },
  ];

  for (const court of courts) {
    await prisma.court.upsert({
      where: { courtNumber: court.courtNumber },
      update: court,
      create: court,
    });
  }

  // 5. Seed RBAC Users, Roles & Permissions
  await seedRbacData();

  // 6. Seed University & Institution Master Data
  await seedInstitutions();

  console.log("Database seeded successfully with PostgreSQL!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
