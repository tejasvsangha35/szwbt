/**
 * Canonical Team Identifier & State Code Formatting Utility
 * Standardizes all team IDs across SZWBT 2026 into official State Code formats (e.g. AP - 01, KA - 14).
 */

export const STATE_NAME_TO_CODE: Record<string, string> = {
  "andhra pradesh": "AP",
  andhra: "AP",
  karnataka: "KA",
  kerala: "KR",
  "tamil nadu": "TN",
  tamilnadu: "TN",
  telangana: "TE",
  pondicherry: "PO",
  puducherry: "PO",
};

export const STATE_CODE_TO_NAME: Record<string, string> = {
  AP: "Andhra Pradesh",
  KA: "Karnataka",
  KR: "Kerala",
  TN: "Tamil Nadu",
  TE: "Telangana",
  PO: "Pondicherry",
};

/**
 * Formats any team identifier or state code into canonical spaced display format:
 * "AP-01" -> "AP - 01"
 * "ka-14" -> "KA - 14"
 * "AP - 01" -> "AP - 01"
 * "AP1" -> "AP - 01"
 */
export function formatTeamCode(code: string | null | undefined): string {
  if (!code || typeof code !== "string") return "-";
  const trimmed = code.trim();
  if (!trimmed || trimmed === "-") return "-";

  // Standard 2-letter state code + number (e.g. AP-01, AP - 01, KA14)
  const stateMatch = trimmed.match(/^([A-Za-z]{2})\s*-?\s*(\d{1,3})$/);
  if (stateMatch) {
    const prefix = stateMatch[1].toUpperCase();
    const num = stateMatch[2].padStart(2, "0");
    return `${prefix} - ${num}`;
  }

  // Legacy TM-SZ-xxx fallback
  const tmMatch = trimmed.match(/^TM[-_]?SZ[-_]?(\d+)$/i);
  if (tmMatch) {
    const num = parseInt(tmMatch[1], 10);
    return `SZ - ${String(num).padStart(2, "0")}`;
  }

  return trimmed;
}

/**
 * Normalizes any variation of team code into standard compact database key:
 * "AP - 01" -> "AP-01"
 * "ap-1" -> "AP-01"
 * "KA 14" -> "KA-14"
 */
export function normalizeTeamCode(code: string | null | undefined): string {
  if (!code || typeof code !== "string") return "";
  const trimmed = code.trim();

  const stateMatch = trimmed.match(/^([A-Za-z]{2})\s*-?\s*(\d{1,3})$/);
  if (stateMatch) {
    const prefix = stateMatch[1].toUpperCase();
    const num = stateMatch[2].padStart(2, "0");
    return `${prefix}-${num}`;
  }

  return trimmed.replace(/\s+/g, "");
}

/**
 * Returns database query condition candidates for matching user input:
 * Matches "AP - 01", "AP-01", "AP01", etc.
 */
export function getTeamCodeSearchCandidates(input: string): string[] {
  if (!input || typeof input !== "string") return [];
  const raw = input.trim();
  const normalized = normalizeTeamCode(raw);
  const formatted = formatTeamCode(raw);

  const set = new Set<string>();
  if (raw) set.add(raw);
  if (normalized) set.add(normalized);
  if (formatted && formatted !== "-") set.add(formatted);

  return Array.from(set);
}

/**
 * Resolves 2-letter State Code from state name
 */
export function resolveStateCode(stateName: string | null | undefined): string {
  if (!stateName) return "SZ";
  const key = stateName.toLowerCase().trim();
  return STATE_NAME_TO_CODE[key] || "SZ";
}

/**
 * Generates the next sequential state team code (e.g. AP-21, KA-39, etc.)
 */
export async function generateNextStateTeamCode(
  client: any,
  stateName: string | null | undefined
): Promise<string> {
  const statePrefix = resolveStateCode(stateName);
  const existingTeams = await client.team.findMany({
    where: {
      teamCode: {
        startsWith: `${statePrefix}-`,
      },
    },
    select: { teamCode: true },
  });

  let maxNum = 0;
  for (const t of existingTeams) {
    const match = t.teamCode?.match(new RegExp(`^${statePrefix}-(\\d+)$`, "i"));
    if (match) {
      const n = parseInt(match[1], 10);
      if (n > maxNum) maxNum = n;
    }
  }

  const nextNum = maxNum + 1;
  return `${statePrefix}-${String(nextNum).padStart(2, "0")}`;
}
