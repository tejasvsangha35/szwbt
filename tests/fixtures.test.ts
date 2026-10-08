/**
 * Authoritative 102-Team Fixture & Tournament Engine Test Suite
 * AIU South Zone Inter-University Women’s Badminton Tournament 2026-27
 */

import test from "node:test";
import assert from "node:assert/strict";
import { prisma } from "../src/lib/prisma";
import {
  OFFICIAL_UNIVERSITIES,
  OFFICIAL_TIES,
} from "../src/lib/tournament/officialTournamentData";

test("OFFICIAL 102-TEAM TOURNAMENT & FIXTURE SYSTEM VERIFICATION", async (t) => {
  await t.test("Test 1: Official Master Data contains exactly 102 universities with verbatim strings", () => {
    assert.equal(OFFICIAL_UNIVERSITIES.length, 102);
    assert.equal(OFFICIAL_UNIVERSITIES[0].fullName, "Jain Deemed to be University, Bangaluru, Karnataka");
    assert.equal(OFFICIAL_UNIVERSITIES[25].fullName, "Bagalkot University, Jamakhandi, Karnataka");
    assert.equal(OFFICIAL_UNIVERSITIES[26].fullName, "Kerala Agricultural University, Kerala");
    assert.equal(OFFICIAL_UNIVERSITIES[50].fullName, "Mahatma Gandhi University, Kottayam, Kerala");
    assert.equal(OFFICIAL_UNIVERSITIES[51].fullName, "SRM Institute of Science & Technology University, Kottankulathur, Tamilnadu");
    assert.equal(OFFICIAL_UNIVERSITIES[76].fullName, "St. Joseph University, Chennai, Tamilnadu");
    assert.equal(OFFICIAL_UNIVERSITIES[77].fullName, "Bharathiar University, Coimbatore, Tamilnadu");
    assert.equal(OFFICIAL_UNIVERSITIES[101].fullName, "KLEF Deemed to be University, Vaddeshwaram, Andhra Pradesh");
  });

  await t.test("Test 2: Database contains exactly 102 official teams with matching numbers and pools", async () => {
    const teams = await prisma.team.findMany({ orderBy: { teamCode: "asc" } });
    assert.equal(teams.length, 102);

    const slots = await prisma.bracketSlotAssignment.findMany({
      orderBy: { slot: "asc" },
    });
    assert.equal(slots.length, 102);

    const poolA = slots.filter((s) => s.pool === "A");
    const poolB = slots.filter((s) => s.pool === "B");
    const poolC = slots.filter((s) => s.pool === "C");
    const poolD = slots.filter((s) => s.pool === "D");

    assert.equal(poolA.length, 26);
    assert.equal(poolB.length, 25);
    assert.equal(poolC.length, 26);
    assert.equal(poolD.length, 25);

    assert.equal(poolA[0].teamNumber, 1);
    assert.equal(poolA[25].teamNumber, 26);
    assert.equal(poolB[0].teamNumber, 27);
    assert.equal(poolB[24].teamNumber, 51);
    assert.equal(poolC[0].teamNumber, 52);
    assert.equal(poolC[25].teamNumber, 77);
    assert.equal(poolD[0].teamNumber, 78);
    assert.equal(poolD[24].teamNumber, 102);
  });

  await t.test("Test 3: Database contains exactly 102 official ties (Tie 01 to Tie 102)", async () => {
    const matches = await prisma.match.findMany();
    assert.equal(matches.length, 102);

    const matchNumbers = matches
      .map((m) => {
        const num = m.publicMatchNumber?.replace(/\D/g, "");
        return num ? parseInt(num, 10) : 0;
      })
      .sort((a, b) => a - b);

    assert.equal(matchNumbers.length, 102);
    for (let i = 1; i <= 102; i++) {
      assert.equal(matchNumbers[i - 1], i);
    }
  });

  await t.test("Test 4: Schedule dates, sessions, times, and round stages match official schedule", async () => {
    const matches = await prisma.match.findMany();
    const getMatchByNum = (num: number) => {
      const pad = String(num).padStart(2, "0");
      return matches.find((m) => m.publicMatchNumber === `Tie ${pad}` || m.matchNumber === `Tie ${pad}`);
    };

    // Pool A R1: 01 to 09
    for (let i = 1; i <= 9; i++) {
      const m = getMatchByNum(i);
      assert.ok(m, `Tie ${i} must exist`);
      assert.equal(m.pool, "A");
      assert.equal(m.roundStage, "ROUND_1");
      assert.equal(m.dayId, "OCT18");
      assert.equal(m.time, "10:30 AM");
    }

    // Pool B R1: 10 to 17
    for (let i = 10; i <= 17; i++) {
      const m = getMatchByNum(i);
      assert.ok(m, `Tie ${i} must exist`);
      assert.equal(m.pool, "B");
      assert.equal(m.roundStage, "ROUND_1");
      assert.equal(m.dayId, "OCT18");
      assert.equal(m.time, "10:30 AM");
    }

    // Pool C R1: 18 to 26
    for (let i = 18; i <= 26; i++) {
      const m = getMatchByNum(i);
      assert.ok(m, `Tie ${i} must exist`);
      assert.equal(m.pool, "C");
      assert.equal(m.roundStage, "ROUND_1");
      assert.equal(m.dayId, "OCT18");
      assert.equal(m.time, "10:30 AM");
    }

    // Pool D R1: 27 to 34
    for (let i = 27; i <= 34; i++) {
      const m = getMatchByNum(i);
      assert.ok(m, `Tie ${i} must exist`);
      assert.equal(m.pool, "D");
      assert.equal(m.roundStage, "ROUND_1");
      assert.equal(m.dayId, "OCT18");
      assert.equal(m.time, "10:30 AM");
    }

    // Super Quarters: Ties 95 to 98
    for (let i = 95; i <= 98; i++) {
      const m = getMatchByNum(i);
      assert.ok(m, `Tie ${i} must exist`);
      assert.equal(m.dayId, "OCT20");
      assert.equal(m.time, "09:00 AM");
      assert.equal(m.roundStage, "SUPER_QUARTERS");
    }

    // Semi-Finals: Ties 99 & 100
    for (let i = 99; i <= 100; i++) {
      const m = getMatchByNum(i);
      assert.ok(m, `Tie ${i} must exist`);
      assert.equal(m.dayId, "OCT20");
      assert.equal(m.time, "03:00 PM");
      assert.equal(m.roundStage, "CHAMPIONSHIP_SEMI_FINAL");
    }

    // Finals: Tie 101
    const m101 = getMatchByNum(101);
    assert.ok(m101, "Tie 101 must exist");
    assert.equal(m101.dayId, "OCT21");
    assert.equal(m101.time, "09:00 AM");
    assert.equal(m101.roundStage, "GRAND_FINAL");

    // Hardline Tie (LSF): Tie 102
    const m102 = getMatchByNum(102);
    assert.ok(m102, "Tie 102 must exist");
    assert.equal(m102.dayId, "OCT21");
    assert.equal(m102.time, "09:00 AM");
    assert.equal(m102.roundStage, "HARDLINE_TIE");
  });

  await t.test("Test 5: Clean operational state across operational modules", async () => {
    const participantsCount = await prisma.participant.count();
    assert.equal(participantsCount, 0, "No participant records should exist");

    const transportTripsCount = await prisma.transportTrip.count();
    assert.equal(transportTripsCount, 0, "No transport trips should exist");

    const allocationsCount = await prisma.accommodationAllocation.count();
    assert.equal(allocationsCount, 0, "No accommodation allocations should exist");

    const spocAssignmentsCount = await prisma.spocTeamAssignment.count();
    assert.ok(
      spocAssignmentsCount === 0 || spocAssignmentsCount === 102,
      "Official SPOC team assignments should be either 0 (unassigned) or 102 (authoritative seeded)"
    );

    const paymentsCount = await prisma.paymentTransaction.count();
    assert.equal(paymentsCount, 0, "No payment transaction records should exist");
  });
});
