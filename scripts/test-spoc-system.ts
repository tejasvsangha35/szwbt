import { prisma } from "../src/lib/prisma";
import { getSpocOverviewData } from "../src/lib/spoc/service";
import { verifySpocClearance } from "../src/lib/spoc/auth";
import { ROLES } from "../src/lib/rbac/roles";

async function runTests() {
  console.log("============================================================");
  console.log("RUNNING AUTHORITATIVE SPOC SYSTEM VALIDATION TESTS");
  console.log("============================================================");

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition: boolean, desc: string) {
    totalTests++;
    if (condition) {
      console.log(`✅ [PASS] ${desc}`);
      passedTests++;
    } else {
      console.error(`❌ [FAIL] ${desc}`);
      throw new Error(`Test failed: ${desc}`);
    }
  }

  // ── TEST 1: All 26 SPOC Accounts Exist with Correct Password & Role ──
  console.log("\n--- TEST 1: 26 SPOC ACCOUNTS VERIFICATION ---");
  const testSpocs = [
    { email: "utkarshguptaspoc@szwbt2026.edu", name: "Utkarsh Gupta", phone: "7760618549", expectedCount: 4 },
    { email: "ashritaangadispoc@szwbt2026.edu", name: "Ashrita Angadi", phone: "6366955515", expectedCount: 4 },
    { email: "nitishamnspoc@szwbt2026.edu", name: "Nitisha M N", phone: "7892923187", expectedCount: 4 },
    { email: "khushispoc@szwbt2026.edu", name: "Khushi", phone: "9449197058", expectedCount: 4 },
    { email: "poojapspoc@szwbt2026.edu", name: "Pooja P", phone: "8660932088", expectedCount: 4 },
    { email: "arpitapatilspoc@szwbt2026.edu", name: "Arpita Patil", phone: "7019416947", expectedCount: 5 },
    { email: "bhumikamspoc@szwbt2026.edu", name: "Bhumika M", phone: "6360433574", expectedCount: 4 },
    { email: "anikabspoc@szwbt2026.edu", name: "Anika B", phone: "9972826672", expectedCount: 4 },
    { email: "sadafhspoc@szwbt2026.edu", name: "Sadaf H", phone: "8867672307", expectedCount: 4 },
    { email: "ananyahspoc@szwbt2026.edu", name: "Ananya H", phone: "9591487531", expectedCount: 4 },
    { email: "sanjanagspoc@szwbt2026.edu", name: "Sanjana G", phone: "9741351090", expectedCount: 3 },
    { email: "sakshinccspoc@szwbt2026.edu", name: "Sakshi (NCC)", phone: "7795444086", expectedCount: 4 },
    { email: "vaishnavisspoc@szwbt2026.edu", name: "Vaishnavi S", phone: "9113999604", expectedCount: 5 },
    { email: "roopahspoc@szwbt2026.edu", name: "Roopa H", phone: "6361934927", expectedCount: 5 },
    { email: "karunaspoc@szwbt2026.edu", name: "Karuna", phone: "8217019421", expectedCount: 4 },
    { email: "sonispoc@szwbt2026.edu", name: "Soni", phone: "9036862732", expectedCount: 4 },
    { email: "shanavasspoc@szwbt2026.edu", name: "Shanavas", phone: "9945670955", expectedCount: 2 },
    { email: "purvivpatilspoc@szwbt2026.edu", name: "Purvi V Patil", phone: "8762104763", expectedCount: 4 },
    { email: "sujalaspoc@szwbt2026.edu", name: "Sujala", phone: "9353407394", expectedCount: 4 },
    { email: "sufalaspoc@szwbt2026.edu", name: "Sufala", phone: "7619267497", expectedCount: 4 },
    { email: "anvitakspoc@szwbt2026.edu", name: "Anvita K", phone: "6361184289", expectedCount: 4 },
    { email: "vanditalspoc@szwbt2026.edu", name: "Vandita L", phone: "8073194891", expectedCount: 3 },
    { email: "srinidhinccspoc@szwbt2026.edu", name: "Srinidhi (NCC)", phone: "9008739904", expectedCount: 5 },
    { email: "nithishjspoc@szwbt2026.edu", name: "Nithish J", phone: "8310128592", expectedCount: 3 },
    { email: "gouthamrspoc@szwbt2026.edu", name: "Goutham R", phone: "7019688638", expectedCount: 4 },
    { email: "bhaktitspoc@szwbt2026.edu", name: "Bhakti T", phone: "7338203033", expectedCount: 3 },
  ];

  for (const s of testSpocs) {
    const user = await prisma.user.findUnique({
      where: { email: s.email },
      include: {
        userRoles: { include: { role: true } },
        spocAssignments: true,
      },
    });

    assert(Boolean(user), `User '${s.email}' exists in database`);
    assert(user?.passwordHash === "szwbt2026pass", `Password for '${s.email}' is 'szwbt2026pass'`);
    assert(user?.phone === s.phone, `Phone for '${s.email}' is '${s.phone}'`);
    assert(user?.name === s.name, `Name for '${s.email}' is '${s.name}'`);
    assert(user?.userRoles.some((ur) => ur.role.name === ROLES.SPOC) ?? false, `Role for '${s.email}' includes 'SPOC'`);
    assert(user?.spocAssignments.length === s.expectedCount, `Assigned count for '${s.name}' is exactly ${s.expectedCount}`);
  }

  // ── TEST 2: Nithish J Deep Verification ──
  console.log("\n--- TEST 2: NITHISH J SPECIAL VERIFICATION ---");
  const nithish = await prisma.user.findUnique({
    where: { email: "nithishjspoc@szwbt2026.edu" },
  });
  assert(Boolean(nithish), "Nithish J user account exists");

  const nithishOverview = await getSpocOverviewData(nithish!.id);
  assert(Boolean(nithishOverview), "Nithish J overview data successfully loaded");
  assert(nithishOverview?.teams.length === 3, `Nithish J has exactly 3 teams (received ${nithishOverview?.teams.length})`);

  const nithishTeamCodes = nithishOverview!.teams.map((t) => t.teamCode).sort();
  assert(nithishTeamCodes[0] === "PO-01", "Nithish J team 1 is PO-01");
  assert(nithishTeamCodes[1] === "TN-25", "Nithish J team 2 is TN-25");
  assert(nithishTeamCodes[2] === "TN-26", "Nithish J team 3 is TN-26");

  const po01Team = nithishOverview!.teams.find((t) => t.teamCode === "PO-01");
  assert(po01Team?.name === "Pondicherry University, Puducherry", "PO-01 name is 'Pondicherry University, Puducherry'");
  assert(po01Team?.managerPhone === "9488979000", "PO-01 Coach/Manager Contact is '9488979000'");
  assert(po01Team?.managerName === "Not Provided", "PO-01 Coach/Manager Name is 'Not Provided'");
  assert(po01Team?.managerPhone !== nithish!.phone, "PO-01 Coach Contact is NOT the SPOC's phone");

  // ── TEST 3: Strict Data Isolation & Backend Authorization ──
  console.log("\n--- TEST 3: STRICT DATA ISOLATION & CLEARANCE ENFORCEMENT ---");
  const nithishContext = {
    user: nithish!,
    roles: [ROLES.SPOC],
    permissions: [],
  };

  // Test authorized access by ID and by teamCode
  const authPO01 = await verifySpocClearance(nithishContext, "PO-01");
  assert(authPO01.isAuthorized === true, "Nithish J clearance for PO-01: GRANTED");

  const authTN25 = await verifySpocClearance(nithishContext, "TN-25");
  assert(authTN25.isAuthorized === true, "Nithish J clearance for TN-25: GRANTED");

  const authTN26 = await verifySpocClearance(nithishContext, "TN-26");
  assert(authTN26.isAuthorized === true, "Nithish J clearance for TN-26: GRANTED");

  // Test unauthorized access (TN-24 belongs to Srinidhi NCC, KA-01 belongs to Arpita Patil)
  const authTN24 = await verifySpocClearance(nithishContext, "TN-24");
  assert(authTN24.isAuthorized === false, "Nithish J clearance for TN-24: REJECTED");
  assert(authTN24.errorResponse?.status === 403, "Nithish J clearance for TN-24 returns HTTP 403 Forbidden");

  const authKA01 = await verifySpocClearance(nithishContext, "KA-01");
  assert(authKA01.isAuthorized === false, "Nithish J clearance for KA-01: REJECTED");
  assert(authKA01.errorResponse?.status === 403, "Nithish J clearance for KA-01 returns HTTP 403 Forbidden");

  const authAP01 = await verifySpocClearance(nithishContext, "AP-01");
  assert(authAP01.isAuthorized === false, "Nithish J clearance for AP-01: REJECTED");
  assert(authAP01.errorResponse?.status === 403, "Nithish J clearance for AP-01 returns HTTP 403 Forbidden");

  // ── TEST 4: Search & Filter Isolation ──
  console.log("\n--- TEST 4: SEARCH SECURITY & FILTER ISOLATION ---");
  // Nithish searches "Pondicherry" -> returns PO-01
  const searchPondi = nithishOverview!.teams.filter(
    (t) =>
      t.teamCode.toLowerCase().includes("pondicherry") ||
      t.name.toLowerCase().includes("pondicherry") ||
      t.institution.toLowerCase().includes("pondicherry")
  );
  assert(searchPondi.length === 1 && searchPondi[0].teamCode === "PO-01", "Search 'Pondicherry' finds only PO-01 for Nithish J");

  // Nithish searches "KA-01" -> returns 0
  const searchKA01 = nithishOverview!.teams.filter((t) => t.teamCode === "KA-01");
  assert(searchKA01.length === 0, "Search 'KA-01' finds no results for Nithish J (blocked)");

  // ── TEST 5: Total Database Teams & State Group Integrity ──
  console.log("\n--- TEST 5: STATE GROUP & CODE INTEGRITY ---");
  const allTeams = await prisma.team.findMany({ orderBy: { teamCode: "asc" } });
  assert(allTeams.length === 102, "Total database teams count is exactly 102");

  const apTeams = allTeams.filter((t) => t.stateCode === "AP");
  const kaTeams = allTeams.filter((t) => t.stateCode === "KA");
  const krTeams = allTeams.filter((t) => t.stateCode === "KR");
  const tnTeams = allTeams.filter((t) => t.stateCode === "TN");
  const poTeams = allTeams.filter((t) => t.stateCode === "PO");
  const teTeams = allTeams.filter((t) => t.stateCode === "TE");

  assert(apTeams.length === 20, "AP has exactly 20 teams (AP-01 to AP-20)");
  assert(kaTeams.length === 38, "KA has exactly 38 teams (KA-01 to KA-38)");
  assert(krTeams.length === 10, "KR has exactly 10 teams (KR-01 to KR-10)");
  assert(tnTeams.length === 26, "TN has exactly 26 teams (TN-01 to TN-26)");
  assert(poTeams.length === 1, "PO has exactly 1 team (PO-01)");
  assert(teTeams.length === 7, "TE has exactly 7 teams (TE-01 to TE-07)");

  // Verify unique team codes
  const uniqueCodes = new Set(allTeams.map((t) => t.teamCode));
  assert(uniqueCodes.size === 102, "All 102 team codes are unique");

  // Verify total assignments
  const totalAssignments = await prisma.spocTeamAssignment.count();
  assert(totalAssignments === 102, "Exactly 102 SPOC team assignments exist");

  // Verify no unassigned teams
  const unassigned = await prisma.team.findMany({
    where: { spocAssignment: null },
  });
  assert(unassigned.length === 0, "Zero unassigned teams exist in database");

  // Verify Coach/Manager contact is never the SPOC contact
  const allAssignments = await prisma.spocTeamAssignment.findMany({
    include: { team: true, spoc: true },
  });
  let mixedContactFound = false;
  for (const a of allAssignments) {
    if (a.spoc.phone && a.team.managerPhone && a.spoc.phone === a.team.managerPhone) {
      mixedContactFound = true;
      console.error(`Mixed contact found on ${a.team.teamCode}: SPOC ${a.spoc.phone} === Coach ${a.team.managerPhone}`);
    }
  }
  assert(!mixedContactFound, "SPOC contact and Coach/Manager contact are strictly separate across all 102 teams");

  console.log("\n============================================================");
  console.log(`🎉 ALL ${passedTests} / ${totalTests} TESTS PASSED PERFECTLY!`);
  console.log("============================================================");
}

runTests()
  .catch((e) => {
    console.error("FATAL ERROR IN TEST SUITE:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
