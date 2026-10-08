// ─────────────────────────────────────────────────────────────
// TOURNAMENT SPECIFICATIONS (SINGLE SOURCE OF TRUTH)
// AIU South Zone Inter-University Women’s Badminton Tournament 2026-27
// ─────────────────────────────────────────────────────────────
export const COURT_COUNT = 4;
export const TOURNAMENT_COURTS = ["Court 01", "Court 02", "Court 03", "Court 04"] as const;

export const TOTAL_TOURNAMENT_TEAMS = 102;
export const TOTAL_TOURNAMENT_TIES = 102;

export const POOL_SLOT_COUNTS = {
  A: 26,
  B: 25,
  C: 26,
  D: 25,
} as const;

export const POOL_TEAM_RANGES = {
  A: { start: 1, end: 26 },
  B: { start: 27, end: 51 },
  C: { start: 52, end: 77 },
  D: { start: 78, end: 102 },
} as const;

// ─────────────────────────────────────────────────────────────
// OFFICIAL ROUND 1 MATCH FLOW & PAIRINGS BY POOL
// ─────────────────────────────────────────────────────────────
export const ROUND_1_MATCH_FLOW_BY_POOL = {
  A: [
    { index: 1, label: "Tie 01", tieNumber: 1, matchInPool: 1, slotA: 3, slotB: 4, teamA: 3, teamB: 4, downstreamTie: 35, downstreamSlot: "B" as const },
    { index: 2, label: "Tie 02", tieNumber: 2, matchInPool: 2, slotA: 6, slotB: 7, teamA: 6, teamB: 7, downstreamTie: 36, downstreamSlot: "B" as const },
    { index: 3, label: "Tie 03", tieNumber: 3, matchInPool: 3, slotA: 9, slotB: 10, teamA: 9, teamB: 10, downstreamTie: 37, downstreamSlot: "B" as const },
    { index: 4, label: "Tie 04", tieNumber: 4, matchInPool: 4, slotA: 12, slotB: 13, teamA: 12, teamB: 13, downstreamTie: 38, downstreamSlot: "B" as const },
    { index: 5, label: "Tie 05", tieNumber: 5, matchInPool: 5, slotA: 15, slotB: 16, teamA: 15, teamB: 16, downstreamTie: 39, downstreamSlot: "B" as const },
    { index: 6, label: "Tie 06", tieNumber: 6, matchInPool: 6, slotA: 18, slotB: 19, teamA: 18, teamB: 19, downstreamTie: 40, downstreamSlot: "B" as const },
    { index: 7, label: "Tie 07", tieNumber: 7, matchInPool: 7, slotA: 21, slotB: 22, teamA: 21, teamB: 22, downstreamTie: 41, downstreamSlot: "B" as const },
    { index: 8, label: "Tie 08", tieNumber: 8, matchInPool: 8, slotA: 23, slotB: 24, teamA: 23, teamB: 24, downstreamTie: 42, downstreamSlot: "A" as const },
    { index: 9, label: "Tie 09", tieNumber: 9, matchInPool: 9, slotA: 25, slotB: 26, teamA: 25, teamB: 26, downstreamTie: 42, downstreamSlot: "B" as const },
  ],
  B: [
    { index: 10, label: "Tie 10", tieNumber: 10, matchInPool: 1, slotA: 29, slotB: 30, teamA: 29, teamB: 30, downstreamTie: 43, downstreamSlot: "B" as const },
    { index: 11, label: "Tie 11", tieNumber: 11, matchInPool: 2, slotA: 32, slotB: 33, teamA: 32, teamB: 33, downstreamTie: 44, downstreamSlot: "B" as const },
    { index: 12, label: "Tie 12", tieNumber: 12, matchInPool: 3, slotA: 35, slotB: 36, teamA: 35, teamB: 36, downstreamTie: 45, downstreamSlot: "B" as const },
    { index: 13, label: "Tie 13", tieNumber: 13, matchInPool: 4, slotA: 38, slotB: 39, teamA: 38, teamB: 39, downstreamTie: 46, downstreamSlot: "B" as const },
    { index: 14, label: "Tie 14", tieNumber: 14, matchInPool: 5, slotA: 41, slotB: 42, teamA: 41, teamB: 42, downstreamTie: 47, downstreamSlot: "B" as const },
    { index: 15, label: "Tie 15", tieNumber: 15, matchInPool: 6, slotA: 44, slotB: 45, teamA: 44, teamB: 45, downstreamTie: 48, downstreamSlot: "B" as const },
    { index: 16, label: "Tie 16", tieNumber: 16, matchInPool: 7, slotA: 47, slotB: 48, teamA: 47, teamB: 48, downstreamTie: 49, downstreamSlot: "B" as const },
    { index: 17, label: "Tie 17", tieNumber: 17, matchInPool: 8, slotA: 50, slotB: 51, teamA: 50, teamB: 51, downstreamTie: 50, downstreamSlot: "B" as const },
  ],
  C: [
    { index: 18, label: "Tie 18", tieNumber: 18, matchInPool: 1, slotA: 54, slotB: 55, teamA: 54, teamB: 55, downstreamTie: 51, downstreamSlot: "B" as const },
    { index: 19, label: "Tie 19", tieNumber: 19, matchInPool: 2, slotA: 57, slotB: 58, teamA: 57, teamB: 58, downstreamTie: 52, downstreamSlot: "B" as const },
    { index: 20, label: "Tie 20", tieNumber: 20, matchInPool: 3, slotA: 60, slotB: 61, teamA: 60, teamB: 61, downstreamTie: 53, downstreamSlot: "B" as const },
    { index: 21, label: "Tie 21", tieNumber: 21, matchInPool: 4, slotA: 63, slotB: 64, teamA: 63, teamB: 64, downstreamTie: 54, downstreamSlot: "B" as const },
    { index: 22, label: "Tie 22", tieNumber: 22, matchInPool: 5, slotA: 66, slotB: 67, teamA: 66, teamB: 67, downstreamTie: 55, downstreamSlot: "B" as const },
    { index: 23, label: "Tie 23", tieNumber: 23, matchInPool: 6, slotA: 69, slotB: 70, teamA: 69, teamB: 70, downstreamTie: 56, downstreamSlot: "B" as const },
    { index: 24, label: "Tie 24", tieNumber: 24, matchInPool: 7, slotA: 72, slotB: 73, teamA: 72, teamB: 73, downstreamTie: 57, downstreamSlot: "B" as const },
    { index: 25, label: "Tie 25", tieNumber: 25, matchInPool: 8, slotA: 74, slotB: 75, teamA: 74, teamB: 75, downstreamTie: 58, downstreamSlot: "A" as const },
    { index: 26, label: "Tie 26", tieNumber: 26, matchInPool: 9, slotA: 76, slotB: 77, teamA: 76, teamB: 77, downstreamTie: 58, downstreamSlot: "B" as const },
  ],
  D: [
    { index: 27, label: "Tie 27", tieNumber: 27, matchInPool: 1, slotA: 80, slotB: 81, teamA: 80, teamB: 81, downstreamTie: 59, downstreamSlot: "B" as const },
    { index: 28, label: "Tie 28", tieNumber: 28, matchInPool: 2, slotA: 83, slotB: 84, teamA: 83, teamB: 84, downstreamTie: 60, downstreamSlot: "B" as const },
    { index: 29, label: "Tie 29", tieNumber: 29, matchInPool: 3, slotA: 86, slotB: 87, teamA: 86, teamB: 87, downstreamTie: 61, downstreamSlot: "B" as const },
    { index: 30, label: "Tie 30", tieNumber: 30, matchInPool: 4, slotA: 89, slotB: 90, teamA: 89, teamB: 90, downstreamTie: 62, downstreamSlot: "B" as const },
    { index: 31, label: "Tie 31", tieNumber: 31, matchInPool: 5, slotA: 92, slotB: 93, teamA: 92, teamB: 93, downstreamTie: 63, downstreamSlot: "B" as const },
    { index: 32, label: "Tie 32", tieNumber: 32, matchInPool: 6, slotA: 95, slotB: 96, teamA: 95, teamB: 96, downstreamTie: 64, downstreamSlot: "B" as const },
    { index: 33, label: "Tie 33", tieNumber: 33, matchInPool: 7, slotA: 98, slotB: 99, teamA: 98, teamB: 99, downstreamTie: 65, downstreamSlot: "B" as const },
    { index: 34, label: "Tie 34", tieNumber: 34, matchInPool: 8, slotA: 101, slotB: 102, teamA: 101, teamB: 102, downstreamTie: 66, downstreamSlot: "B" as const },
  ],
};

// Flattened R1 flow
export const ROUND_1_MATCH_FLOW = [
  ...ROUND_1_MATCH_FLOW_BY_POOL.A,
  ...ROUND_1_MATCH_FLOW_BY_POOL.B,
  ...ROUND_1_MATCH_FLOW_BY_POOL.C,
  ...ROUND_1_MATCH_FLOW_BY_POOL.D,
];

export const BYE_SLOT_OPTIONS = [
  { slot: 1, label: "Slot 1: Seed Bye (Direct to Pool Final / Round 6)", isSeed: true },
  { slot: 2, label: "Slot 2: Round 1 Bye (Advances to Round 2 Match)", isSeed: false },
  { slot: 17, label: "Slot 17: Round 1 Bye (Advances to Round 2 Match)", isSeed: false },
  { slot: 30, label: "Slot 30: Round 1 Bye (Advances to Round 2 Match)", isSeed: false },
];

export function getGlobalMatchNumber(pool: "A" | "B" | "C" | "D", matchInPool: number): number {
  const poolItems = ROUND_1_MATCH_FLOW_BY_POOL[pool];
  const item = poolItems[matchInPool - 1];
  return item ? item.tieNumber : matchInPool;
}
