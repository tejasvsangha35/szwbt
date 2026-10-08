/**
 * PHASE 2 - LOAD OFFICIAL TOURNAMENT INFORMATION
 * AIU South Zone Inter-University Women’s Badminton Tournament 2026-27
 *
 * Imports:
 * 1. Exactly 102 Universities & Teams across Pools A, B, C, D
 * 2. Exactly 102 Ties with official schedules, dates, and times
 * 3. Bracket slot assignments for all 102 teams
 * 4. Relational upstream and downstream match linkage
 */

import { PrismaClient } from "@prisma/client";
import {
  TOURNAMENT_NAME,
  TOURNAMENT_VENUE,
  TOURNAMENT_DATES,
  OFFICIAL_UNIVERSITIES,
  buildOfficialTies,
} from "../src/lib/tournament/officialTournamentData";

const prisma = new PrismaClient();

export async function loadOfficialTournament() {
  console.log("================================================================================");
  console.log("🏸 PHASE 2: IMPORTING OFFICIAL TOURNAMENT MASTER DATA & FIXTURES");
  console.log("================================================================================\n");

  console.log(`Tournament: ${TOURNAMENT_NAME}`);
  console.log(`Venue:      ${TOURNAMENT_VENUE}`);
  console.log(`Dates:      ${TOURNAMENT_DATES}\n`);

  // 1. ENSURE TOURNAMENT DAYS (OCT 18 to OCT 21) ARE PUBLISHED
  console.log("1. Publishing Official Tournament Days...");
  const tournamentDays = [
    { id: "OCT18", date: "OCT 18", dayNumber: "Day 1", stage: "Round 1 & Round 2", isPublished: true },
    { id: "OCT19", date: "OCT 19", dayNumber: "Day 2", stage: "Quarter-Finals, Semi-Finals & Pool Finals", isPublished: true },
    { id: "OCT20", date: "OCT 20", dayNumber: "Day 3", stage: "Super Quarters & Semi-Finals", isPublished: true },
    { id: "OCT21", date: "OCT 21", dayNumber: "Day 4", stage: "Grand Finals & Hardline Tie", isPublished: true },
  ];

  for (const td of tournamentDays) {
    await prisma.tournamentDay.upsert({
      where: { id: td.id },
      update: td,
      create: td,
    });
  }
  console.log("   ✔ 4 Tournament Days configured and published.");

  // 2. CLEAR AND IMPORT EXACT 102 INSTITUTIONS & TEAMS
  console.log("\n2. Importing 102 Official Universities & Teams into Database...");
  await prisma.institution.deleteMany({});
  await prisma.team.deleteMany({});

  const createdTeamsMap = new Map<number, any>(); // teamNumber -> dbTeam

  for (const univ of OFFICIAL_UNIVERSITIES) {
    const statePrefix = univ.state.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, "SZ");
    const instCode = `${statePrefix}${String(univ.teamNumber).padStart(3, "0")}`;

    // Create Institution master record
    const institution = await prisma.institution.create({
      data: {
        institutionCode: instCode,
        name: univ.fullName,
        city: univ.city || null,
        state: univ.state,
        status: "ACTIVE",
      },
    });

    // Create Official Team record
    const team = await prisma.team.create({
      data: {
        teamCode: univ.teamCode,
        name: univ.fullName,
        institution: univ.fullName,
        state: univ.state,
        status: "COMPLETED",
        managerName: `Team Manager (${univ.name})`,
        captainName: `Team Captain (${univ.name})`,
      },
    });

    createdTeamsMap.set(univ.teamNumber, { ...team, ...univ });
  }

  const teamCount = await prisma.team.count();
  console.log(`   ✔ Exactly ${teamCount} official teams successfully created.`);

  // 3. SEED BRACKET SLOT ASSIGNMENTS (Pool A: 26, Pool B: 25, Pool C: 26, Pool D: 25)
  console.log("\n3. Creating 102 Official Bracket Slot Assignments...");
  await prisma.bracketSlotAssignment.deleteMany({});

  for (const univ of OFFICIAL_UNIVERSITIES) {
    const team = createdTeamsMap.get(univ.teamNumber);
    // Relative slot within pool:
    // Pool A: 1..26, Pool B: 1..25, Pool C: 1..26, Pool D: 1..25
    let slotInPool = univ.teamNumber;
    if (univ.pool === "B") slotInPool = univ.teamNumber - 26; // 27 -> 1, 51 -> 25
    else if (univ.pool === "C") slotInPool = univ.teamNumber - 51; // 52 -> 1, 77 -> 26
    else if (univ.pool === "D") slotInPool = univ.teamNumber - 77; // 78 -> 1, 102 -> 25

    const isSeed = univ.isByeToPoolFinal;
    const seedNumber = isSeed
      ? univ.pool === "A"
        ? 1
        : univ.pool === "B"
        ? 2
        : univ.pool === "C"
        ? 3
        : 4
      : null;

    await prisma.bracketSlotAssignment.create({
      data: {
        pool: univ.pool,
        slot: slotInPool,
        teamId: team.id,
        teamCode: team.teamCode,
        teamNumber: univ.teamNumber,
        teamName: univ.fullName,
        state: univ.state,
        seed: seedNumber,
        isByeToFinal: !!univ.isByeToPoolFinal,
        isByeR1: !univ.isByeToPoolFinal && (
          // Pool A byes: 2, 5, 8, 11, 14, 17, 20
          // Pool B byes: 28, 31, 34, 37, 40, 43, 46, 49
          // Pool C byes: 53, 56, 59, 62, 65, 68, 71
          // Pool D byes: 79, 82, 85, 88, 91, 94, 97, 100
          (univ.pool === "A" && [2, 5, 8, 11, 14, 17, 20].includes(univ.teamNumber)) ||
          (univ.pool === "B" && [28, 31, 34, 37, 40, 43, 46, 49].includes(univ.teamNumber)) ||
          (univ.pool === "C" && [53, 56, 59, 62, 65, 68, 71].includes(univ.teamNumber)) ||
          (univ.pool === "D" && [79, 82, 85, 88, 91, 94, 97, 100].includes(univ.teamNumber))
        ),
        assignedAt: new Date(),
        assignedBy: "OFFICIAL_DRAW_IMPORT",
      },
    });
  }

  const slotCount = await prisma.bracketSlotAssignment.count();
  console.log(`   ✔ Exactly ${slotCount} bracket slots assigned across all 4 pools.`);

  // 4. IMPORT ALL 102 OFFICIAL TIES
  console.log("\n4. Generating 102 Official Ties with Bracket Upstream/Downstream Wiring...");
  await prisma.match.deleteMany({});

  const officialTies = buildOfficialTies();
  console.log(`   - Precomputed ${officialTies.length} official tie definitions.`);

  for (const t of officialTies) {
    let playerA = `TBD`;
    let institutionA = "";
    let teamAId: string | null = null;
    let playerB = `TBD`;
    let institutionB = "";
    let teamBId: string | null = null;

    // Resolve Player A
    if (t.sourceAType === "DIRECT_TEAM" && t.sourceATeamNumber) {
      const teamA = createdTeamsMap.get(t.sourceATeamNumber);
      playerA = teamA.fullName;
      institutionA = teamA.fullName;
      teamAId = teamA.id;
    } else if (t.sourceAType === "BYE_TEAM" && t.sourceATeamNumber) {
      const teamA = createdTeamsMap.get(t.sourceATeamNumber);
      playerA = teamA.fullName;
      institutionA = teamA.fullName;
      teamAId = teamA.id;
    } else if (t.sourceAType === "WINNER") {
      playerA = t.sourceAMatchNumber ? `Winner of ${t.sourceAMatchNumber}` : `Winner of Pool ${t.pool}`;
    } else if (t.sourceAType === "LOSER") {
      playerA = t.sourceAMatchNumber ? `Loser of ${t.sourceAMatchNumber}` : `Loser of Semi-Final 1`;
    }

    // Resolve Player B
    if (t.sourceBType === "DIRECT_TEAM" && t.sourceBTeamNumber) {
      const teamB = createdTeamsMap.get(t.sourceBTeamNumber);
      playerB = teamB.fullName;
      institutionB = teamB.fullName;
      teamBId = teamB.id;
    } else if (t.sourceBType === "WINNER") {
      playerB = t.sourceBMatchNumber ? `Winner of ${t.sourceBMatchNumber}` : `Winner of Pool ${t.pool === "CHAMPIONSHIP" ? "B" : t.pool}`;
    } else if (t.sourceBType === "LOSER") {
      playerB = t.sourceBMatchNumber ? `Loser of ${t.sourceBMatchNumber}` : `Loser of Semi-Final 2`;
    }

    await prisma.match.create({
      data: {
        dayId: t.dayId,
        time: t.time,
        category: "Institution Teams",
        court: t.court,
        matchNumber: t.matchNumber,
        publicMatchNumber: t.publicMatchNumber,
        pool: t.pool,
        roundStage: t.roundStage,
        roundName: t.roundName,
        roundOrder: t.roundOrder,
        playerA,
        institutionA,
        teamAId,
        playerB,
        institutionB,
        teamBId,
        status: "UPCOMING",
        isPublished: true,
        sourceAType: t.sourceAType,
        sourceBType: t.sourceBType,
        sourceAMatchNumber: t.sourceAMatchNumber,
        sourceBMatchNumber: t.sourceBMatchNumber,
        downstreamMatchNumber: t.downstreamMatchNumber,
        downstreamSlot: t.downstreamSlot,
      },
    });
  }

  const matchCount = await prisma.match.count();
  console.log(`   ✔ Exactly ${matchCount} official Match records created in database.`);

  // 5. WIRE INTERNAL UPSTREAM & DOWNSTREAM MATCH IDs
  console.log("\n5. Linking Internal Match ID Graph (Relational Upstream/Downstream)...");
  const allMatches = await prisma.match.findMany({
    select: { id: true, publicMatchNumber: true },
  });
  const matchNumToId = new Map(allMatches.map((m) => [m.publicMatchNumber!, m.id]));

  for (const t of officialTies) {
    const currentId = matchNumToId.get(t.publicMatchNumber);
    if (!currentId) continue;

    const sourceAMatchId = t.sourceAMatchNumber ? matchNumToId.get(t.sourceAMatchNumber) : null;
    const sourceBMatchId = t.sourceBMatchNumber ? matchNumToId.get(t.sourceBMatchNumber) : null;
    const downstreamMatchId = t.downstreamMatchNumber ? matchNumToId.get(t.downstreamMatchNumber) : null;

    if (sourceAMatchId || sourceBMatchId || downstreamMatchId) {
      await prisma.match.update({
        where: { id: currentId },
        data: {
          sourceAMatchId: sourceAMatchId || undefined,
          sourceBMatchId: sourceBMatchId || undefined,
          downstreamMatchId: downstreamMatchId || undefined,
        },
      });
    }
  }
  console.log("   ✔ Relational match wiring completed.");

  // 6. INITIALIZE FIXTURE CONFIG (PUBLISHED & READY)
  console.log("\n6. Initializing Fixture Configuration...");
  await prisma.fixtureConfig.upsert({
    where: { id: "SZWBT-2026-FIXTURE" },
    update: {
      status: "PUBLISHED",
      totalTeams: 102,
      teamsPerPool: 26,
      currentDrawNumber: 102,
      currentPool: "A",
      currentSide: "FIRST",
      isLocked: false,
      isPublished: true,
      publishedAt: new Date(),
      publishedBy: "SUPER_ADMIN",
      version: 1,
    },
    create: {
      id: "SZWBT-2026-FIXTURE",
      status: "PUBLISHED",
      totalTeams: 102,
      teamsPerPool: 26,
      currentDrawNumber: 102,
      currentPool: "A",
      currentSide: "FIRST",
      isLocked: false,
      isPublished: true,
      publishedAt: new Date(),
      publishedBy: "SUPER_ADMIN",
      version: 1,
    },
  });

  console.log("\n================================================================================");
  console.log("🎉 PHASE 2 COMPLETE: OFFICIAL TOURNAMENT DATA & FIXTURES LOADED!");
  console.log("================================================================================\n");
}

if (require.main === module) {
  loadOfficialTournament()
    .catch((err) => {
      console.error("FATAL ERROR IN PHASE 2 IMPORT:", err);
      process.exit(1);
    })
    .finally(() => prisma.$disconnect());
}
