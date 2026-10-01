import assert from "assert";
import test from "node:test";
import path from "path";
import fs from "fs";
import {
  MASTER_INSTITUTIONS,
  CANONICAL_STATES,
  UNRESOLVED_STATE,
  normalizeStateName,
  getInstitutionsByState,
  searchMasterInstitutions,
} from "../src/data/institutions";
import { prisma } from "../src/lib/prisma";

test("INSTITUTION & STATE DATA NORMALIZATION TEST SUITE", async (t) => {
  await t.test("Rule 1: Canonical state names strictly match required specification", () => {
    const expectedCanonical = [
      "Andhra Pradesh",
      "Karnataka",
      "Kerala",
      "Puducherry",
      "Tamil Nadu",
      "Telangana",
    ];
    assert.deepStrictEqual([...CANONICAL_STATES], expectedCanonical);
  });

  await t.test("Rule 2: Normalizes spreadsheet spelling and capitalization variations", () => {
    assert.strictEqual(normalizeStateName("Karnatak"), "Karnataka");
    assert.strictEqual(normalizeStateName("karnatak"), "Karnataka");
    assert.strictEqual(normalizeStateName("KARNATAK"), "Karnataka");
    assert.strictEqual(normalizeStateName("karnataka"), "Karnataka");

    assert.strictEqual(normalizeStateName("Andhra pradesh"), "Andhra Pradesh");
    assert.strictEqual(normalizeStateName("andhra pradesh"), "Andhra Pradesh");
    assert.strictEqual(normalizeStateName("andhrapradesh"), "Andhra Pradesh");

    assert.strictEqual(normalizeStateName("Telanagana"), "Telangana");
    assert.strictEqual(normalizeStateName("telanagana"), "Telangana");
    assert.strictEqual(normalizeStateName("telangana"), "Telangana");

    assert.strictEqual(normalizeStateName("Tamilnadu"), "Tamil Nadu");
    assert.strictEqual(normalizeStateName("tamilnadu"), "Tamil Nadu");
    assert.strictEqual(normalizeStateName("tamil nadu"), "Tamil Nadu");

    assert.strictEqual(normalizeStateName("Pondicherry"), "Puducherry");
    assert.strictEqual(normalizeStateName("puducherry"), "Puducherry");

    assert.strictEqual(normalizeStateName("State not specified"), UNRESOLVED_STATE);
    assert.strictEqual(normalizeStateName("unresolved"), UNRESOLVED_STATE);
  });

  await t.test("Rule 3: State university count distribution is strictly verified", () => {
    const counts: Record<string, number> = {};
    for (const inst of MASTER_INSTITUTIONS) {
      counts[inst.state] = (counts[inst.state] || 0) + 1;
    }

    assert.strictEqual(counts["Andhra Pradesh"], 20, "20 Andhra Pradesh universities (19 prompt + 1 baseline)");
    assert.strictEqual(counts["Karnataka"], 40, "40 Karnataka universities");
    assert.strictEqual(counts["Kerala"], 9, "9 Kerala universities");
    assert.strictEqual(counts["Tamil Nadu"], 23, "23 Tamil Nadu universities");
    assert.strictEqual(counts["Telangana"], 7, "7 Telangana universities");
    assert.strictEqual(counts["Puducherry"], 1, "1 Puducherry university");
    assert.strictEqual(counts[UNRESOLVED_STATE], 1, "1 Unresolved entry for Mahatma Gandhi University");

    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    assert.strictEqual(total, 101, "Total 101 master universities");
  });

  await t.test("Rule 4: Mahatma Gandhi University is kept as unresolved entry and flagged", () => {
    const mgu = MASTER_INSTITUTIONS.find((i) => i.name === "Mahatma Gandhi University");
    assert.ok(mgu, "Mahatma Gandhi University must exist in master institutions");
    assert.strictEqual(mgu.state, UNRESOLVED_STATE, "State must not be guessed");
    assert.strictEqual(mgu.status, "PENDING_ASSIGNMENT", "Status must be PENDING_ASSIGNMENT");
    assert.ok(mgu.notes?.includes("FLAGGED_FOR_MANUAL_ASSIGNMENT"), "Must be flagged for manual assignment");
  });

  await t.test("Rule 5: No duplicate institution codes or duplicate name+state pairs exist", () => {
    const seenCodes = new Set<string>();
    const seenPairs = new Set<string>();

    for (const inst of MASTER_INSTITUTIONS) {
      assert.strictEqual(seenCodes.has(inst.institutionCode), false, `Duplicate code: ${inst.institutionCode}`);
      seenCodes.add(inst.institutionCode);

      const pair = `${inst.name.toLowerCase()}||${inst.state.toLowerCase()}`;
      assert.strictEqual(seenPairs.has(pair), false, `Duplicate name+state: ${inst.name} in ${inst.state}`);
      seenPairs.add(pair);
    }
  });

  await t.test("Rule 6: Universities are sorted alphabetically within each state", () => {
    for (const state of CANONICAL_STATES) {
      const insts = getInstitutionsByState(state);
      for (let i = 1; i < insts.length; i++) {
        const prev = insts[i - 1].name;
        const curr = insts[i].name;
        assert.ok(
          prev.localeCompare(curr) <= 0,
          `Sort order violation in ${state}: "${prev}" should precede "${curr}"`
        );
      }
    }
  });

  await t.test("Rule 7: State selection with variations accurately filters universities", () => {
    const kaDirect = getInstitutionsByState("Karnataka");
    const kaVariation = getInstitutionsByState("Karnatak");
    assert.strictEqual(kaDirect.length, 40);
    assert.strictEqual(kaVariation.length, 40);

    const tnDirect = getInstitutionsByState("Tamil Nadu");
    const tnVariation = getInstitutionsByState("Tamilnadu");
    assert.strictEqual(tnDirect.length, 23);
    assert.strictEqual(tnVariation.length, 23);

    const tsDirect = getInstitutionsByState("Telangana");
    const tsVariation = getInstitutionsByState("Telanagana");
    assert.strictEqual(tsDirect.length, 7);
    assert.strictEqual(tsVariation.length, 7);
  });

  await t.test("Rule 8: Search functionality works by name, code, and city", () => {
    const byName = searchMasterInstitutions("KLE Technological");
    assert.ok(byName.length >= 1);
    assert.ok(byName.some((i) => i.name.includes("KLE Technological University")));

    const byCode = searchMasterInstitutions("KAR021");
    assert.strictEqual(byCode.length, 1);
    assert.strictEqual(byCode[0].name, "KLE Technological University, Hubballi");

    const byCity = searchMasterInstitutions("Warangal");
    assert.ok(byCity.some((i) => i.name.includes("Kakatiya University")));
  });

  await t.test("Rule 9: Database contains all 101 records with correct states", async () => {
    const dbCount = await prisma.institution.count();
    assert.strictEqual(dbCount, 101, "Database must have 101 institutions");

    const dbKarnataka = await prisma.institution.count({ where: { state: "Karnataka" } });
    assert.strictEqual(dbKarnataka, 40);

    const dbAndhra = await prisma.institution.count({ where: { state: "Andhra Pradesh" } });
    assert.strictEqual(dbAndhra, 20);

    const dbKerala = await prisma.institution.count({ where: { state: "Kerala" } });
    assert.strictEqual(dbKerala, 9);

    const dbTamilNadu = await prisma.institution.count({ where: { state: "Tamil Nadu" } });
    assert.strictEqual(dbTamilNadu, 23);

    const dbTelangana = await prisma.institution.count({ where: { state: "Telangana" } });
    assert.strictEqual(dbTelangana, 7);

    const dbPuducherry = await prisma.institution.count({ where: { state: "Puducherry" } });
    assert.strictEqual(dbPuducherry, 1);

    const dbUnresolved = await prisma.institution.count({ where: { state: UNRESOLVED_STATE } });
    assert.strictEqual(dbUnresolved, 1);
  });

  await t.test("Rule 10: CSV template file exists and has all 101 valid rows", () => {
    const csvPath = path.resolve(__dirname, "../docs/csv-examples/institutions/university_master_template.csv");
    assert.strictEqual(fs.existsSync(csvPath), true);
    const content = fs.readFileSync(csvPath, "utf-8").trim();
    const lines = content.split(/\r?\n/);
    assert.strictEqual(lines.length, 102, "Header + 101 institution rows");
    assert.strictEqual(lines[0], "institution_code,university_name,state,city,district,status");
  });
});
