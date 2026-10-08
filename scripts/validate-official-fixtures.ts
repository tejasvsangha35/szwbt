import { PrismaClient } from "@prisma/client";
import { OFFICIAL_UNIVERSITIES } from "../src/lib/tournament/officialTournamentData";

const prisma = new PrismaClient();

async function validate() {
  console.log("================================================================================");
  console.log("🔍 RUNNING AUTHORITATIVE VALIDATION CHECKLIST");
  console.log("================================================================================\n");

  let allPassed = true;

  const assertCheck = (condition: boolean, desc: string) => {
    if (condition) {
      console.log(`  ✔ PASS: ${desc}`);
    } else {
      console.error(`  ✖ FAIL: ${desc}`);
      allPassed = false;
    }
  };

  // 1. Exactly 102 universities/teams exist
  const teams = await prisma.team.findMany({
    orderBy: { teamCode: "asc" },
  });
  assertCheck(teams.length === 102, `Exactly 102 teams exist in database (found: ${teams.length})`);

  // 2. Pool distributions
  const poolA = OFFICIAL_UNIVERSITIES.filter((u) => u.pool === "A");
  const poolB = OFFICIAL_UNIVERSITIES.filter((u) => u.pool === "B");
  const poolC = OFFICIAL_UNIVERSITIES.filter((u) => u.pool === "C");
  const poolD = OFFICIAL_UNIVERSITIES.filter((u) => u.pool === "D");

  assertCheck(poolA.length === 26, `Pool A has exactly 26 teams (Teams 1-26)`);
  assertCheck(poolA[0].teamNumber === 1 && poolA[25].teamNumber === 26, `Pool A ranges from Team 1 to 26`);

  assertCheck(poolB.length === 25, `Pool B has exactly 25 teams (Teams 27-51)`);
  assertCheck(poolB[0].teamNumber === 27 && poolB[24].teamNumber === 51, `Pool B ranges from Team 27 to 51`);

  assertCheck(poolC.length === 26, `Pool C has exactly 26 teams (Teams 52-77)`);
  assertCheck(poolC[0].teamNumber === 52 && poolC[25].teamNumber === 77, `Pool C ranges from Team 52 to 77`);

  assertCheck(poolD.length === 25, `Pool D has exactly 25 teams (Teams 78-102)`);
  assertCheck(poolD[0].teamNumber === 78 && poolD[24].teamNumber === 102, `Pool D ranges from Team 78 to 102`);

  // 3. Exactly 102 ties exist
  const matches = await prisma.match.findMany({
    orderBy: { publicMatchNumber: "asc" },
  });
  assertCheck(matches.length === 102, `Exactly 102 ties exist in database (found: ${matches.length})`);

  // 4. Sequential tie numbers preserved
  const tieNumbers = matches.map((m) => {
    const num = m.publicMatchNumber?.replace(/\D/g, "");
    return num ? parseInt(num, 10) : 0;
  }).sort((a, b) => a - b);

  let sequential = true;
  for (let i = 1; i <= 102; i++) {
    if (tieNumbers[i - 1] !== i) {
      sequential = false;
      break;
    }
  }
  assertCheck(sequential, `Tie numbers are strictly sequential from 01 through 102`);

  // 5. Pool tie ranges
  const getMatchByNum = (n: number) => matches.find((m) => m.publicMatchNumber === `Tie ${String(n).padStart(2, "0")}`);

  // Pool A R1: 1-9
  const pAR1 = matches.filter((m) => {
    const num = parseInt(m.publicMatchNumber!.replace(/\D/g, ""), 10);
    return num >= 1 && num <= 9;
  });
  assertCheck(pAR1.length === 9 && pAR1.every((m) => m.pool === "A" && m.time === "10:30 AM" && m.dayId === "OCT18"), `Pool A R1: Ties 01-09 (Morning, 10:30 AM)`);

  // Pool B R1: 10-17
  const pBR1 = matches.filter((m) => {
    const num = parseInt(m.publicMatchNumber!.replace(/\D/g, ""), 10);
    return num >= 10 && num <= 17;
  });
  assertCheck(pBR1.length === 8 && pBR1.every((m) => m.pool === "B" && m.time === "10:30 AM" && m.dayId === "OCT18"), `Pool B R1: Ties 10-17 (Morning, 10:30 AM)`);

  // Pool C R1: 18-26
  const pCR1 = matches.filter((m) => {
    const num = parseInt(m.publicMatchNumber!.replace(/\D/g, ""), 10);
    return num >= 18 && num <= 26;
  });
  assertCheck(pCR1.length === 9 && pCR1.every((m) => m.pool === "C" && m.time === "10:30 AM" && m.dayId === "OCT18"), `Pool C R1: Ties 18-26 (Morning, 10:30 AM)`);

  // Pool D R1: 27-34
  const pDR1 = matches.filter((m) => {
    const num = parseInt(m.publicMatchNumber!.replace(/\D/g, ""), 10);
    return num >= 27 && num <= 34;
  });
  assertCheck(pDR1.length === 8 && pDR1.every((m) => m.pool === "D" && m.time === "10:30 AM" && m.dayId === "OCT18"), `Pool D R1: Ties 27-34 (Morning, 10:30 AM)`);

  // Session 2: 18-10-2026 Afternoon (02:30 PM): Ties 35 to 66
  const pAR2 = matches.filter((m) => {
    const num = parseInt(m.publicMatchNumber!.replace(/\D/g, ""), 10);
    return num >= 35 && num <= 42;
  });
  assertCheck(pAR2.length === 8 && pAR2.every((m) => m.pool === "A" && m.time === "02:30 PM"), `Pool A R2: Ties 35-42 (Afternoon, 02:30 PM)`);

  const pBR2 = matches.filter((m) => {
    const num = parseInt(m.publicMatchNumber!.replace(/\D/g, ""), 10);
    return num >= 43 && num <= 50;
  });
  assertCheck(pBR2.length === 8 && pBR2.every((m) => m.pool === "B" && m.time === "02:30 PM"), `Pool B R2: Ties 43-50 (Afternoon, 02:30 PM)`);

  const pCR2 = matches.filter((m) => {
    const num = parseInt(m.publicMatchNumber!.replace(/\D/g, ""), 10);
    return num >= 51 && num <= 58;
  });
  assertCheck(pCR2.length === 8 && pCR2.every((m) => m.pool === "C" && m.time === "02:30 PM"), `Pool C R2: Ties 51-58 (Afternoon, 02:30 PM)`);

  const pDR2 = matches.filter((m) => {
    const num = parseInt(m.publicMatchNumber!.replace(/\D/g, ""), 10);
    return num >= 59 && num <= 66;
  });
  assertCheck(pDR2.length === 8 && pDR2.every((m) => m.pool === "D" && m.time === "02:30 PM"), `Pool D R2: Ties 59-66 (Afternoon, 02:30 PM)`);

  // Session 3: 19-10-2026 Morning (08:30 AM): Ties 67 to 82
  const pAQF = matches.filter((m) => {
    const num = parseInt(m.publicMatchNumber!.replace(/\D/g, ""), 10);
    return num >= 67 && num <= 70;
  });
  assertCheck(pAQF.length === 4 && pAQF.every((m) => m.pool === "A" && m.time === "08:30 AM"), `Pool A QF: Ties 67-70 (Morning, 08:30 AM)`);

  const pBQF = matches.filter((m) => {
    const num = parseInt(m.publicMatchNumber!.replace(/\D/g, ""), 10);
    return num >= 71 && num <= 74;
  });
  assertCheck(pBQF.length === 4 && pBQF.every((m) => m.pool === "B" && m.time === "08:30 AM"), `Pool B QF: Ties 71-74 (Morning, 08:30 AM)`);

  const pCQF = matches.filter((m) => {
    const num = parseInt(m.publicMatchNumber!.replace(/\D/g, ""), 10);
    return num >= 75 && num <= 78;
  });
  assertCheck(pCQF.length === 4 && pCQF.every((m) => m.pool === "C" && m.time === "08:30 AM"), `Pool C QF: Ties 75-78 (Morning, 08:30 AM)`);

  const pDQF = matches.filter((m) => {
    const num = parseInt(m.publicMatchNumber!.replace(/\D/g, ""), 10);
    return num >= 79 && num <= 82;
  });
  assertCheck(pDQF.length === 4 && pDQF.every((m) => m.pool === "D" && m.time === "08:30 AM"), `Pool D QF: Ties 79-82 (Morning, 08:30 AM)`);

  // Session 4: 19-10-2026 Afternoon (02:00 PM): Ties 83 to 90
  const pASF = matches.filter((m) => ["Tie 83", "Tie 84"].includes(m.publicMatchNumber!));
  assertCheck(pASF.length === 2 && pASF.every((m) => m.pool === "A" && m.time === "02:00 PM"), `Pool A SF: Ties 83 & 84 (Afternoon, 02:00 PM)`);

  const pBSF = matches.filter((m) => ["Tie 85", "Tie 86"].includes(m.publicMatchNumber!));
  assertCheck(pBSF.length === 2 && pBSF.every((m) => m.pool === "B" && m.time === "02:00 PM"), `Pool B SF: Ties 85 & 86 (Afternoon, 02:00 PM)`);

  const pCSF = matches.filter((m) => ["Tie 87", "Tie 88"].includes(m.publicMatchNumber!));
  assertCheck(pCSF.length === 2 && pCSF.every((m) => m.pool === "C" && m.time === "02:00 PM"), `Pool C SF: Ties 87 & 88 (Afternoon, 02:00 PM)`);

  const pDSF = matches.filter((m) => ["Tie 89", "Tie 90"].includes(m.publicMatchNumber!));
  assertCheck(pDSF.length === 2 && pDSF.every((m) => m.pool === "D" && m.time === "02:00 PM"), `Pool D SF: Ties 89 & 90 (Afternoon, 02:00 PM)`);

  // Session 5: 19-10-2026 Evening: Ties 91 to 94
  const t91 = getMatchByNum(91);
  const t92 = getMatchByNum(92);
  const t93 = getMatchByNum(93);
  const t94 = getMatchByNum(94);
  assertCheck(t91?.pool === "A" && t91?.time === "Time will be informed", `Pool A Final: Tie 91`);
  assertCheck(t92?.pool === "B" && t92?.time === "Time will be informed", `Pool B Final: Tie 92`);
  assertCheck(t93?.pool === "C" && t93?.time === "Time will be informed", `Pool C Final: Tie 93`);
  assertCheck(t94?.pool === "D" && t94?.time === "Time will be informed", `Pool D Final: Tie 94`);

  // Session 6: 20-10-2026 Morning (09:00 AM): Super Quarters 95 to 98
  const sq = matches.filter((m) => {
    const num = parseInt(m.publicMatchNumber!.replace(/\D/g, ""), 10);
    return num >= 95 && num <= 98;
  });
  assertCheck(sq.length === 4 && sq.every((m) => m.time === "09:00 AM" && m.dayId === "OCT20"), `Super Quarters: Ties 95 to 98 (20-10-2026 Morning, 09:00 AM)`);

  // Session 7: 20-10-2026 Evening (03:00 PM): Semi-Finals 99 & 100
  const sf = matches.filter((m) => ["Tie 99", "Tie 100"].includes(m.publicMatchNumber!));
  assertCheck(sf.length === 2 && sf.every((m) => m.time === "03:00 PM" && m.dayId === "OCT20"), `Semi-Finals: Ties 99 & 100 (20-10-2026 Evening, 03:00 PM)`);

  // Session 8: 21-10-2026 Morning (09:00 AM): Final (Tie 101) & Hardline Tie (Tie 102)
  const finalMatch = getMatchByNum(101);
  assertCheck(finalMatch?.dayId === "OCT21" && finalMatch?.time === "09:00 AM" && finalMatch.roundStage === "GRAND_FINAL", `Championship Final: Tie 101 (21-10-2026 Morning, 09:00 AM)`);

  const hardlineMatch = getMatchByNum(102);
  assertCheck(hardlineMatch?.dayId === "OCT21" && hardlineMatch?.time === "09:00 AM" && hardlineMatch.roundStage === "HARDLINE_TIE", `Hardline Tie (LSF): Tie 102 (21-10-2026 Morning, 09:00 AM)`);

  // 6. Zero event operational records
  const parts = await prisma.participant.count();
  assertCheck(parts === 0, `Participants count is 0 (clean state)`);

  const trips = await prisma.transportTrip.count();
  assertCheck(trips === 0, `Transport trips count is 0 (clean state)`);

  const allocs = await prisma.accommodationAllocation.count();
  assertCheck(allocs === 0, `Accommodation allocations count is 0 (clean state)`);

  const txs = await prisma.paymentTransaction.count();
  assertCheck(txs === 0, `Payment transactions count is 0 (clean state)`);

  const spocs = await prisma.spocTeamAssignment.count();
  assertCheck(spocs === 0 || spocs === 102, `SPOC team assignments count is valid (0 unassigned or 102 official seeded, found: ${spocs})`);

  console.log("\n================================================================================");
  if (allPassed) {
    console.log("🎉 ALL VALIDATION CHECKS PASSED WITH 100% ACCURACY!");
  } else {
    console.error("✖ SOME VALIDATION CHECKS FAILED! REVIEW LOGS.");
  }
  console.log("================================================================================\n");
}

validate().catch(console.error).finally(() => prisma.$disconnect());
