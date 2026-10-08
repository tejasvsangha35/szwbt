/**
 * Championship Fixture Template & Graph Definition
 * AIU South Zone Inter-University Women’s Badminton Tournament 2026-27
 *
 * SPECIFICATION GUARANTEES:
 * - Exactly 102 teams total
 * - Exactly 4 pools (A: 26, B: 25, C: 26, D: 25)
 * - Exactly 102 ties (Tie 01 through Tie 102) pre-generated in database
 * - Upstream and downstream relational references
 */

import {
  OFFICIAL_UNIVERSITIES,
  buildOfficialTies,
  OfficialTieDefinition,
} from "./officialTournamentData";

export type PoolCode = "A" | "B" | "C" | "D";
export type SideCode = "FIRST" | "LAST";

export interface FixturePositionTemplate {
  id: string; // e.g. "POOL-A-SLOT-01"
  pool: PoolCode;
  side: SideCode;
  positionNumber: number; // 1 to 26 / 25
  globalSequence: number; // 1 to 102 in official sequence
  firstMatchNumber: string; // e.g. "Tie 01"
  firstMatchSlot: "A" | "B";
  isByeToRound2: boolean;
  isByeToPoolFinal?: boolean;
}

export interface FixtureMatchTemplate {
  publicMatchNumber: string; // "Tie 01" to "Tie 102"
  pool: PoolCode | "CHAMPIONSHIP";
  roundStage: string;
  roundName: string;
  roundOrder: number;
  dayId: "OCT18" | "OCT19" | "OCT20" | "OCT21";
  time: string;
  court: string;
  sourceAType: "POSITION" | "WINNER" | "LOSER";
  sourceBType: "POSITION" | "WINNER" | "LOSER";
  sourceAPositionId?: string;
  sourceBPositionId?: string;
  sourceAMatchNumber?: string;
  sourceBMatchNumber?: string;
  downstreamMatchNumber?: string;
  downstreamSlot?: "A" | "B";
}

/**
 * Returns canonical draw sequence across all 102 universities.
 */
export function getCanonicalDrawSequence(): Array<{
  pool: PoolCode;
  side: SideCode;
  positionNumber: number;
  positionId: string;
}> {
  return OFFICIAL_UNIVERSITIES.map((u) => {
    const slotInPool =
      u.pool === "A"
        ? u.teamNumber
        : u.pool === "B"
        ? u.teamNumber - 26
        : u.pool === "C"
        ? u.teamNumber - 51
        : u.teamNumber - 77;

    const side: SideCode = slotInPool <= 13 ? "FIRST" : "LAST";
    const numStr = String(slotInPool).padStart(2, "0");

    return {
      pool: u.pool as PoolCode,
      side,
      positionNumber: slotInPool,
      positionId: `POOL-${u.pool}-SLOT-${numStr}`,
    };
  });
}

/**
 * Returns all 102 position templates.
 */
export function getAllPositionTemplates(): FixturePositionTemplate[] {
  const ties = buildOfficialTies();
  const sequence = getCanonicalDrawSequence();

  return OFFICIAL_UNIVERSITIES.map((u, idx) => {
    const seq = sequence[idx];
    const initialTie = ties.find(
      (t) => t.sourceATeamNumber === u.teamNumber || t.sourceBTeamNumber === u.teamNumber
    );

    const firstMatchNumber = initialTie ? initialTie.publicMatchNumber : "";
    const firstMatchSlot: "A" | "B" = initialTie?.sourceATeamNumber === u.teamNumber ? "A" : "B";
    const isByeToPoolFinal = Boolean(u.isByeToPoolFinal);
    const isByeToRound2 = !initialTie && !isByeToPoolFinal;

    return {
      id: seq.positionId,
      pool: seq.pool,
      side: seq.side,
      positionNumber: seq.positionNumber,
      globalSequence: u.teamNumber,
      firstMatchNumber,
      firstMatchSlot,
      isByeToRound2,
      isByeToPoolFinal,
    };
  });
}

/**
 * Returns all 102 match templates from the official fixture definition.
 */
export function getAllMatchTemplates(): FixtureMatchTemplate[] {
  const officialTies = buildOfficialTies();

  return officialTies.map((t) => {
    let sourceAType: "POSITION" | "WINNER" | "LOSER" = "WINNER";
    if (t.sourceAType === "DIRECT_TEAM" || t.sourceAType === "BYE_TEAM") {
      sourceAType = "POSITION";
    } else if (t.sourceAType === "LOSER") {
      sourceAType = "LOSER";
    }
    let sourceBType: "POSITION" | "WINNER" | "LOSER" = "WINNER";
    if (t.sourceBType === "DIRECT_TEAM") {
      sourceBType = "POSITION";
    } else if (t.sourceBType === "LOSER") {
      sourceBType = "LOSER";
    }

    const univA = t.sourceATeamNumber ? OFFICIAL_UNIVERSITIES.find((u) => u.teamNumber === t.sourceATeamNumber) : null;
    const univB = t.sourceBTeamNumber ? OFFICIAL_UNIVERSITIES.find((u) => u.teamNumber === t.sourceBTeamNumber) : null;
    const posAId = univA ? univA.teamCode : t.sourceATeamNumber ? `TM-${t.sourceATeamNumber}` : undefined;
    const posBId = univB ? univB.teamCode : t.sourceBTeamNumber ? `TM-${t.sourceBTeamNumber}` : undefined;

    return {
      publicMatchNumber: t.publicMatchNumber,
      pool: t.pool as PoolCode | "CHAMPIONSHIP",
      roundStage: t.roundStage,
      roundName: t.roundName,
      roundOrder: t.roundOrder,
      dayId: t.dayId,
      time: t.time,
      court: t.court,
      sourceAType,
      sourceBType,
      sourceAPositionId: posAId,
      sourceBPositionId: posBId,
      sourceAMatchNumber: t.sourceAMatchNumber,
      sourceBMatchNumber: t.sourceBMatchNumber,
      downstreamMatchNumber: t.downstreamMatchNumber,
      downstreamSlot: t.downstreamSlot,
    };
  });
}
