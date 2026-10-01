import { MASTER_INSTITUTIONS, CANONICAL_STATES, normalizeStateName } from "../src/data/institutions";

console.log("Total institutions in master:", MASTER_INSTITUTIONS.length);

const stateCounts: Record<string, number> = {};
const codes = new Set<string>();
const nameStatePairs = new Set<string>();
const duplicateCodes: string[] = [];
const duplicateNameState: string[] = [];

for (const inst of MASTER_INSTITUTIONS) {
  const normState = normalizeStateName(inst.state);
  stateCounts[normState] = (stateCounts[normState] || 0) + 1;

  if (codes.has(inst.institutionCode)) {
    duplicateCodes.push(inst.institutionCode);
  }
  codes.add(inst.institutionCode);

  const pairKey = inst.name.toLowerCase() + "||" + normState.toLowerCase();
  if (nameStatePairs.has(pairKey)) {
    duplicateNameState.push(inst.name + " (" + normState + ")");
  }
  nameStatePairs.add(pairKey);
}

console.log("\nState counts:");
for (const [st, count] of Object.entries(stateCounts)) {
  console.log(`  ${st}: ${count}`);
}

console.log("\nDuplicate codes:", duplicateCodes.length > 0 ? duplicateCodes : "None");
console.log("Duplicate name+state combinations:", duplicateNameState.length > 0 ? duplicateNameState : "None");
console.log("\nCanonical states defined:", CANONICAL_STATES);
