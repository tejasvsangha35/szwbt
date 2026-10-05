/**
 * Championship Scoring Model & Transition Validation Engine
 * Consumes tournament configuration rules without hardcoding arbitrary rules in UI.
 * Standard BWF 21-point rally scoring system as ratified for South Zone 2026.
 */

export interface ScoringConfig {
  format: "BEST_OF_3" | "BEST_OF_5" | "SINGLE_SET";
  gamesToWin: number;
  pointsPerGame: number;
  extendedPointsMax: number;
  leadPointsRequired: number;
  intervalPoint: number;
  ruleSet: string;
}

/**
 * Returns tournament-configured scoring parameters for a category.
 */
export function getScoringConfigForCategory(category?: string | null): ScoringConfig {
  return {
    format: "BEST_OF_3",
    gamesToWin: 2,
    pointsPerGame: 21,
    extendedPointsMax: 30,
    leadPointsRequired: 2,
    intervalPoint: 11,
    ruleSet: "BWF Standard Championship Rules (Ratified South Zone 2026)",
  };
}

/**
 * Parses a comma-separated score string into an array of game points.
 * Example: "21, 18, 14" -> [21, 18, 14]
 * Example: null / "" -> [0]
 */
export function parseScoreSets(scoreStr?: string | null): number[] {
  if (!scoreStr || typeof scoreStr !== "string") return [0];
  const parts = scoreStr
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  if (parts.length === 0) return [0];
  const nums = parts.map((p) => {
    const val = parseInt(p, 10);
    return isNaN(val) || val < 0 ? 0 : val;
  });
  return nums.length > 0 ? nums : [0];
}

/**
 * Formats an array of game points into a standard comma-separated string.
 * Example: [21, 18, 14] -> "21, 18, 14"
 */
export function formatScoreSets(sets: number[]): string {
  if (!sets || sets.length === 0) return "0";
  return sets.join(", ");
}

/**
 * Evaluates whether a single game has reached a winning condition.
 * Rules:
 * - Minimum pointsPerGame (21)
 * - Must lead by leadPointsRequired (2) until extendedPointsMax (30)
 * - At 29-29, 30th point wins regardless of lead.
 */
export function evaluateGameWinner(
  scoreA: number,
  scoreB: number,
  config: ScoringConfig
): "PLAYER_A" | "PLAYER_B" | null {
  // Max cap reached (first to 30)
  if (scoreA >= config.extendedPointsMax) return "PLAYER_A";
  if (scoreB >= config.extendedPointsMax) return "PLAYER_B";

  // Standard win condition (>= 21 and lead >= 2)
  if (scoreA >= config.pointsPerGame && scoreA - scoreB >= config.leadPointsRequired) {
    return "PLAYER_A";
  }
  if (scoreB >= config.pointsPerGame && scoreB - scoreA >= config.leadPointsRequired) {
    return "PLAYER_B";
  }

  return null;
}

/**
 * Validates whether a proposed score increment from prev to next is legally valid for a single game.
 */
export function validateScoreIncrement(
  prevScoreA: number,
  prevScoreB: number,
  pointTo: "PLAYER_A" | "PLAYER_B",
  config: ScoringConfig
): { valid: boolean; newScoreA: number; newScoreB: number; error?: string } {
  // Reject negative scores
  if (prevScoreA < 0 || prevScoreB < 0) {
    return { valid: false, newScoreA: prevScoreA, newScoreB: prevScoreB, error: "Scores cannot be negative." };
  }

  // Check if current game is already won
  const gameWon = evaluateGameWinner(prevScoreA, prevScoreB, config);
  if (gameWon) {
    return {
      valid: false,
      newScoreA: prevScoreA,
      newScoreB: prevScoreB,
      error: `Current game is already finished (${gameWon} won at ${prevScoreA} - ${prevScoreB}).`,
    };
  }

  const newScoreA = pointTo === "PLAYER_A" ? prevScoreA + 1 : prevScoreA;
  const newScoreB = pointTo === "PLAYER_B" ? prevScoreB + 1 : prevScoreB;

  // Cannot exceed extended maximum (30 points)
  if (newScoreA > config.extendedPointsMax || newScoreB > config.extendedPointsMax) {
    return {
      valid: false,
      newScoreA: prevScoreA,
      newScoreB: prevScoreB,
      error: `Score cannot exceed maximum allowed points (${config.extendedPointsMax}).`,
    };
  }

  return { valid: true, newScoreA, newScoreB };
}

export interface SetHistoryItem {
  setNumber: number;
  scoreA: number;
  scoreB: number;
  winner: "PLAYER_A" | "PLAYER_B" | null;
  isFinished: boolean;
}

export interface MatchScoringAnalysis {
  setsA: number[];
  setsB: number[];
  gamesWonA: number;
  gamesWonB: number;
  activeGameIndex: number;
  activeGameNumber: number; // 1-indexed
  activeScoreA: number;
  activeScoreB: number;
  isMatchFinished: boolean;
  matchWinner: "PLAYER_A" | "PLAYER_B" | null;
  history: SetHistoryItem[];
}

/**
 * Analyzes the complete match sets state under tournament rules.
 * Correctly accounts for multi-set matches (e.g. "21, 18, 14" vs "19, 21, 11").
 */
export function analyzeMatchSets(
  scoreAStr?: string | null,
  scoreBStr?: string | null,
  config: ScoringConfig = getScoringConfigForCategory()
): MatchScoringAnalysis {
  const setsA = parseScoreSets(scoreAStr);
  const setsB = parseScoreSets(scoreBStr);

  const maxLen = Math.max(setsA.length, setsB.length, 1);
  while (setsA.length < maxLen) setsA.push(0);
  while (setsB.length < maxLen) setsB.push(0);

  let gamesWonA = 0;
  let gamesWonB = 0;
  const history: SetHistoryItem[] = [];

  for (let i = 0; i < maxLen; i++) {
    const sA = setsA[i];
    const sB = setsB[i];
    const winner = evaluateGameWinner(sA, sB, config);
    if (winner === "PLAYER_A") gamesWonA++;
    if (winner === "PLAYER_B") gamesWonB++;

    history.push({
      setNumber: i + 1,
      scoreA: sA,
      scoreB: sB,
      winner,
      isFinished: winner !== null,
    });
  }

  const isMatchFinished = gamesWonA >= config.gamesToWin || gamesWonB >= config.gamesToWin;
  const matchWinner =
    gamesWonA >= config.gamesToWin ? "PLAYER_A" : gamesWonB >= config.gamesToWin ? "PLAYER_B" : null;

  // Determine active game:
  let activeGameIndex = maxLen - 1;
  const lastGameFinished = history[activeGameIndex]?.isFinished;

  // If the last game in history was won, but the match is not finished, the active game is the next one
  if (lastGameFinished && !isMatchFinished) {
    setsA.push(0);
    setsB.push(0);
    activeGameIndex = setsA.length - 1;
    history.push({
      setNumber: activeGameIndex + 1,
      scoreA: 0,
      scoreB: 0,
      winner: null,
      isFinished: false,
    });
  }

  return {
    setsA,
    setsB,
    gamesWonA,
    gamesWonB,
    activeGameIndex,
    activeGameNumber: activeGameIndex + 1,
    activeScoreA: setsA[activeGameIndex] || 0,
    activeScoreB: setsB[activeGameIndex] || 0,
    isMatchFinished,
    matchWinner,
    history,
  };
}

/**
 * Applies a point to the currently active game of a match.
 * Handles game transitions and match completion under tournament rules.
 */
export function applyPointToMatch(
  scoreAStr: string | null | undefined,
  scoreBStr: string | null | undefined,
  pointTo: "PLAYER_A" | "PLAYER_B",
  config: ScoringConfig = getScoringConfigForCategory()
): {
  valid: boolean;
  error?: string;
  newScoreAStr: string;
  newScoreBStr: string;
  newSetsA: number[];
  newSetsB: number[];
  currentSetNumber: number;
  newActiveScoreA: number;
  newActiveScoreB: number;
  gameJustWon: "PLAYER_A" | "PLAYER_B" | null;
  matchJustWon: "PLAYER_A" | "PLAYER_B" | null;
} {
  const analysis = analyzeMatchSets(scoreAStr, scoreBStr, config);

  if (analysis.isMatchFinished) {
    return {
      valid: false,
      error: `Match is already finished (${analysis.matchWinner} won the match). Please click Complete & Submit Result.`,
      newScoreAStr: formatScoreSets(analysis.setsA),
      newScoreBStr: formatScoreSets(analysis.setsB),
      newSetsA: analysis.setsA,
      newSetsB: analysis.setsB,
      currentSetNumber: analysis.activeGameNumber,
      newActiveScoreA: analysis.activeScoreA,
      newActiveScoreB: analysis.activeScoreB,
      gameJustWon: null,
      matchJustWon: analysis.matchWinner,
    };
  }

  const idx = analysis.activeGameIndex;
  const currentA = analysis.setsA[idx];
  const currentB = analysis.setsB[idx];

  const validation = validateScoreIncrement(currentA, currentB, pointTo, config);
  if (!validation.valid) {
    return {
      valid: false,
      error: validation.error,
      newScoreAStr: formatScoreSets(analysis.setsA),
      newScoreBStr: formatScoreSets(analysis.setsB),
      newSetsA: analysis.setsA,
      newSetsB: analysis.setsB,
      currentSetNumber: analysis.activeGameNumber,
      newActiveScoreA: currentA,
      newActiveScoreB: currentB,
      gameJustWon: null,
      matchJustWon: null,
    };
  }

  const updatedSetsA = [...analysis.setsA];
  const updatedSetsB = [...analysis.setsB];
  updatedSetsA[idx] = validation.newScoreA;
  updatedSetsB[idx] = validation.newScoreB;

  const currentSetNumber = idx + 1;
  const gameWinner = evaluateGameWinner(validation.newScoreA, validation.newScoreB, config);

  let gameJustWon: "PLAYER_A" | "PLAYER_B" | null = null;
  let matchJustWon: "PLAYER_A" | "PLAYER_B" | null = null;

  if (gameWinner) {
    gameJustWon = gameWinner;
    // Recount games won
    let gamesWonA = 0;
    let gamesWonB = 0;
    for (let i = 0; i <= idx; i++) {
      const w = evaluateGameWinner(updatedSetsA[i], updatedSetsB[i], config);
      if (w === "PLAYER_A") gamesWonA++;
      if (w === "PLAYER_B") gamesWonB++;
    }

    if (gamesWonA >= config.gamesToWin) {
      matchJustWon = "PLAYER_A";
    } else if (gamesWonB >= config.gamesToWin) {
      matchJustWon = "PLAYER_B";
    } else {
      // Game won, but match not yet won -> Automatically start next game at 0 - 0
      updatedSetsA.push(0);
      updatedSetsB.push(0);
    }
  }

  return {
    valid: true,
    newScoreAStr: formatScoreSets(updatedSetsA),
    newScoreBStr: formatScoreSets(updatedSetsB),
    newSetsA: updatedSetsA,
    newSetsB: updatedSetsB,
    currentSetNumber,
    newActiveScoreA: validation.newScoreA,
    newActiveScoreB: validation.newScoreB,
    gameJustWon,
    matchJustWon,
  };
}

/**
 * Undoes the last point recorded in the match.
 * Gracefully steps backward across game transitions if a game was just completed.
 */
export function undoPointInMatch(
  scoreAStr: string | null | undefined,
  scoreBStr: string | null | undefined,
  lastPointTo?: "PLAYER_A" | "PLAYER_B" | null,
  config: ScoringConfig = getScoringConfigForCategory()
): {
  valid: boolean;
  error?: string;
  newScoreAStr: string;
  newScoreBStr: string;
  newSetsA: number[];
  newSetsB: number[];
  currentSetNumber: number;
  newActiveScoreA: number;
  newActiveScoreB: number;
  undonePlayer: "PLAYER_A" | "PLAYER_B";
} {
  const setsA = parseScoreSets(scoreAStr);
  const setsB = parseScoreSets(scoreBStr);

  const maxLen = Math.max(setsA.length, setsB.length, 1);
  while (setsA.length < maxLen) setsA.push(0);
  while (setsB.length < maxLen) setsB.push(0);

  let targetIndex = maxLen - 1;

  // If the active set is empty (0 - 0) and we have prior sets, the last point finished the previous set
  if (targetIndex > 0 && setsA[targetIndex] === 0 && setsB[targetIndex] === 0) {
    setsA.pop();
    setsB.pop();
    targetIndex--;
  }

  const sA = setsA[targetIndex];
  const sB = setsB[targetIndex];

  if (sA === 0 && sB === 0) {
    return {
      valid: false,
      error: "No points to undo in this match.",
      newScoreAStr: formatScoreSets(setsA),
      newScoreBStr: formatScoreSets(setsB),
      newSetsA: setsA,
      newSetsB: setsB,
      currentSetNumber: targetIndex + 1,
      newActiveScoreA: sA,
      newActiveScoreB: sB,
      undonePlayer: "PLAYER_A",
    };
  }

  // Determine which player to decrement
  let playerToRevert: "PLAYER_A" | "PLAYER_B";
  if (lastPointTo === "PLAYER_A" || lastPointTo === "PLAYER_B") {
    playerToRevert = lastPointTo;
  } else {
    // If not specified, decrement whoever has points or higher score
    if (sA > 0 && sB === 0) playerToRevert = "PLAYER_A";
    else if (sB > 0 && sA === 0) playerToRevert = "PLAYER_B";
    else playerToRevert = sA >= sB ? "PLAYER_A" : "PLAYER_B";
  }

  if (playerToRevert === "PLAYER_A") {
    setsA[targetIndex] = Math.max(0, setsA[targetIndex] - 1);
  } else {
    setsB[targetIndex] = Math.max(0, setsB[targetIndex] - 1);
  }

  return {
    valid: true,
    newScoreAStr: formatScoreSets(setsA),
    newScoreBStr: formatScoreSets(setsB),
    newSetsA: setsA,
    newSetsB: setsB,
    currentSetNumber: targetIndex + 1,
    newActiveScoreA: setsA[targetIndex],
    newActiveScoreB: setsB[targetIndex],
    undonePlayer: playerToRevert,
  };
}
