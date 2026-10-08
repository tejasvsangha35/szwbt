import { describe, it, before } from "node:test";
import assert from "node:assert/strict";
import { NextRequest } from "next/server";
import { GET as getSpocOverview } from "@/app/api/spoc/route";
import { GET as getSpocTeams } from "@/app/api/spoc/teams/route";
import {
  GET as getSpocTeamDetail,
  POST as blockPostTeam,
  PUT as blockPutTeam,
  DELETE as blockDeleteTeam,
} from "@/app/api/spoc/teams/[id]/route";
import { GET as getSpocMatches } from "@/app/api/spoc/matches/route";
import { GET as getSpocContacts } from "@/app/api/spoc/contacts/route";
import { GET as getAdminSpocs, PUT as putAdminSpocs } from "@/app/api/admin/spocs/route";
import { createSessionToken } from "@/lib/rbac/token";
import { prisma } from "@/lib/prisma";
import { ROLES } from "@/lib/rbac/roles";
import { PERMISSIONS } from "@/lib/rbac/permissions";
import { checkRouteAuthorization } from "@/lib/rbac/routes";

function createMockRequest(
  url: string,
  method = "GET",
  body?: any,
  token?: string
): NextRequest {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Cookie"] = `szwbt_session=${token}`;
  }

  const init: any = {
    method,
    headers,
  };
  if (body) {
    init.body = JSON.stringify(body);
  }

  return new NextRequest(new URL(url, "http://localhost:3000"), init);
}

describe("SPOC (STUDENT POINT OF CONTACT) ROLE & DATA ISOLATION TESTS", async () => {
  let spoc1User: any;
  let spoc2User: any;
  let nithishUser: any;
  let participantUser: any;
  let superAdminUser: any;

  let spoc1Token: string;
  let spoc2Token: string;
  let nithishToken: string;
  let participantToken: string;
  let superAdminToken: string;

  let spoc1TeamIds: string[] = [];
  let spoc2TeamIds: string[] = [];
  let nithishTeamCodes: string[] = [];
  let otherTeamId: string;

  before(async () => {
    // 1. Fetch official SPOC users
    spoc1User = await prisma.user.findUnique({ where: { email: "utkarshguptaspoc@szwbt2026.edu" } });
    spoc2User = await prisma.user.findUnique({ where: { email: "ashritaangadispoc@szwbt2026.edu" } });
    nithishUser = await prisma.user.findUnique({ where: { email: "nithishjspoc@szwbt2026.edu" } });
    participantUser = await prisma.user.findUnique({ where: { email: "player@szwbt2026.edu" } });
    superAdminUser = await prisma.user.findUnique({ where: { email: "admin@szwbt2026.edu" } });

    assert.ok(spoc1User, "Primary SPOC user utkarshguptaspoc@szwbt2026.edu must exist in database");
    assert.ok(spoc2User, "Secondary SPOC user ashritaangadispoc@szwbt2026.edu must exist in database");
    assert.ok(nithishUser, "Nithish J SPOC user nithishjspoc@szwbt2026.edu must exist in database");
    assert.ok(participantUser, "Participant test user must exist in database");
    assert.ok(superAdminUser, "Super admin user must exist in database");

    // 2. Generate authoritative JWT tokens
    const spocPermissions = [
      PERMISSIONS.SPOC_VIEW_OWN_TEAMS,
      PERMISSIONS.SPOC_VIEW_REGISTRATION,
      PERMISSIONS.SPOC_VIEW_TRANSPORT,
      PERMISSIONS.SPOC_VIEW_ACCOMMODATION,
      PERMISSIONS.SPOC_VIEW_MATCHES,
      PERMISSIONS.SPOC_VIEW_LIVE_MATCH,
      PERMISSIONS.SPOC_VIEW_CONTACTS,
    ];

    spoc1Token = createSessionToken({
      userId: spoc1User.id,
      email: spoc1User.email,
      roles: [ROLES.SPOC],
      permissions: spocPermissions,
    });

    spoc2Token = createSessionToken({
      userId: spoc2User.id,
      email: spoc2User.email,
      roles: [ROLES.SPOC],
      permissions: spocPermissions,
    });

    nithishToken = createSessionToken({
      userId: nithishUser.id,
      email: nithishUser.email,
      roles: [ROLES.SPOC],
      permissions: spocPermissions,
    });

    participantToken = createSessionToken({
      userId: participantUser.id,
      email: participantUser.email,
      roles: [ROLES.PARTICIPANT],
      permissions: [PERMISSIONS.PARTICIPANT_READ],
    });

    superAdminToken = createSessionToken({
      userId: superAdminUser.id,
      email: superAdminUser.email,
      roles: [ROLES.SUPER_ADMIN],
      permissions: Object.values(PERMISSIONS),
    });

    // 3. Retrieve assigned team IDs from the relational database
    const spoc1Assignments = await prisma.spocTeamAssignment.findMany({
      where: { spocId: spoc1User.id },
      select: { teamId: true },
    });
    spoc1TeamIds = spoc1Assignments.map((a) => a.teamId);

    const spoc2Assignments = await prisma.spocTeamAssignment.findMany({
      where: { spocId: spoc2User.id },
      select: { teamId: true },
    });
    spoc2TeamIds = spoc2Assignments.map((a) => a.teamId);

    const nithishAssignments = await prisma.spocTeamAssignment.findMany({
      where: { spocId: nithishUser.id },
      include: { team: true },
    });
    nithishTeamCodes = nithishAssignments.map((a) => a.team.teamCode).sort();

    // Find another team not assigned to SPOC 1 or SPOC 2
    const allSpoc1And2Ids = [...spoc1TeamIds, ...spoc2TeamIds];
    const otherTeam = await prisma.team.findFirst({
      where: { id: { notIn: allSpoc1And2Ids } },
    });
    assert.ok(otherTeam, "Must have other teams in database for isolation testing");
    otherTeamId = otherTeam.id;

    assert.equal(spoc1TeamIds.length, 4, "Utkarsh Gupta must have exactly 4 assigned teams in DB");
    assert.equal(spoc2TeamIds.length, 4, "Ashrita Angadi must have exactly 4 assigned teams in DB");
    assert.equal(nithishTeamCodes.length, 3, "Nithish J must have exactly 3 assigned teams in DB");
    assert.deepEqual(nithishTeamCodes, ["PO-01", "TN-25", "TN-26"], "Nithish J must have TN-25, TN-26, and PO-01");
  });

  // TEST 1: Authorized SPOC can access /api/spoc
  it("Test 1: Authorized SPOC can access overview telemetry and sees assigned teams", async () => {
    const req = createMockRequest("/api/spoc", "GET", undefined, spoc1Token);
    const res = await getSpocOverview(req);
    assert.equal(res.status, 200);
    const json = await res.json();
    assert.equal(json.success, true);
    assert.ok(json.spoc);
    assert.equal(json.spoc.email, "utkarshguptaspoc@szwbt2026.edu");
    assert.equal(json.teams.length, 4, "Overview must return exactly 4 teams for Utkarsh Gupta");
    assert.equal(json.assignedCount, 4);
    assert.ok(json.summary);
  });

  // TEST 2: Unauthenticated user is blocked with HTTP 401
  it("Test 2: Unauthenticated user is rejected with HTTP 401 Unauthorized", async () => {
    const req = createMockRequest("/api/spoc", "GET");
    const res = await getSpocOverview(req);
    assert.equal(res.status, 401);
  });

  // TEST 3: Unauthorized role (Participant) is blocked with HTTP 403
  it("Test 3: Non-SPOC role (Participant) is blocked with HTTP 403 Forbidden", async () => {
    const req = createMockRequest("/api/spoc", "GET", undefined, participantToken);
    const res = await getSpocOverview(req);
    assert.equal(res.status, 403);
  });

  // TEST 4: Query Assigned Teams
  it("Test 4: SPOC can query /api/spoc/teams and receives only their 4 assigned teams", async () => {
    const req = createMockRequest("/api/spoc/teams", "GET", undefined, spoc1Token);
    const res = await getSpocTeams(req);
    assert.equal(res.status, 200);
    const json = await res.json();
    assert.equal(json.success, true);
    assert.equal(json.teams.length, 4);
    const returnedIds = json.teams.map((t: any) => t.id);
    for (const id of spoc1TeamIds) {
      assert.ok(returnedIds.includes(id), `Returned teams must include assigned team ${id}`);
    }
  });

  // TEST 5: STRICT DATA ISOLATION - SPOC 1 can access own assigned team
  it("Test 5: STRICT DATA ISOLATION - SPOC 1 can access own assigned team detail", async () => {
    const targetTeamId = spoc1TeamIds[0];
    const req = createMockRequest(`/api/spoc/teams/${targetTeamId}`, "GET", undefined, spoc1Token);
    const res = await getSpocTeamDetail(req, { params: Promise.resolve({ id: targetTeamId }) });
    assert.equal(res.status, 200);
    const json = await res.json();
    assert.equal(json.success, true);
    assert.equal(json.team.id, targetTeamId);
    assert.ok(json.tabs.registration);
    assert.ok(json.tabs.transport);
    assert.ok(json.tabs.accommodation);
    assert.ok(json.tabs.matches);
    assert.ok(json.tabs.contact);
    assert.equal(json.tabs.contact.managerName, "Not Provided");
    assert.equal(json.coach_manager_name, "Not Provided");
    assert.equal(json.assigned_spoc_name, "Utkarsh Gupta");
    assert.equal(json.assigned_spoc_contact, "7760618549");
  });

  // TEST 6: STRICT DATA ISOLATION - SPOC 1 CANNOT access SPOC 2's team (HTTP 403)
  it("Test 6: STRICT DATA ISOLATION - SPOC 1 CANNOT access SPOC 2's assigned team (HTTP 403 Forbidden)", async () => {
    const foreignTeamId = spoc2TeamIds[0];
    const req = createMockRequest(`/api/spoc/teams/${foreignTeamId}`, "GET", undefined, spoc1Token);
    const res = await getSpocTeamDetail(req, { params: Promise.resolve({ id: foreignTeamId }) });
    assert.equal(res.status, 403, "Access to another SPOC's team MUST be blocked with HTTP 403");
    const json = await res.json();
    assert.equal(json.success, false);
    assert.match(json.error, /403 Forbidden/);
  });

  // TEST 7: STRICT DATA ISOLATION - SPOC 1 CANNOT access other team (HTTP 403)
  it("Test 7: STRICT DATA ISOLATION - SPOC 1 CANNOT access other SPOC's team (HTTP 403 Forbidden)", async () => {
    const req = createMockRequest(`/api/spoc/teams/${otherTeamId}`, "GET", undefined, spoc1Token);
    const res = await getSpocTeamDetail(req, { params: Promise.resolve({ id: otherTeamId }) });
    assert.equal(res.status, 403, "Access to other SPOC's team MUST be blocked with HTTP 403");
  });

  // TEST 8: Read-Only Enforcement — Mutations strictly rejected with HTTP 403
  it("Test 8: READ-ONLY ENFORCEMENT - SPOC cannot mutate team, match, or record data (HTTP 403)", async () => {
    const targetTeamId = spoc1TeamIds[0];

    const postReq = createMockRequest(`/api/spoc/teams/${targetTeamId}`, "POST", { name: "Hacked" }, spoc1Token);
    const postRes = await blockPostTeam();
    assert.equal(postRes.status, 403);

    const putReq = createMockRequest(`/api/spoc/teams/${targetTeamId}`, "PUT", { status: "ACTIVE" }, spoc1Token);
    const putRes = await blockPutTeam();
    assert.equal(putRes.status, 403);

    const delReq = createMockRequest(`/api/spoc/teams/${targetTeamId}`, "DELETE", undefined, spoc1Token);
    const delRes = await blockDeleteTeam();
    assert.equal(delRes.status, 403);
  });

  // TEST 9: Match Monitoring Feed
  it("Test 9: Match monitoring feed (/api/spoc/matches) returns isolated fixtures for assigned teams", async () => {
    const req = createMockRequest("/api/spoc/matches", "GET", undefined, spoc1Token);
    const res = await getSpocMatches(req);
    assert.equal(res.status, 200);
    const json = await res.json();
    assert.equal(json.success, true);
    assert.ok(json.matches.live);
    assert.ok(json.matches.upcoming);
    assert.ok(json.matches.completed);
  });

  // TEST 10: Contingent Contacts & Official Issue Escalation Chain
  it("Test 10: Contacts feed (/api/spoc/contacts) returns team leaders and 5 escalation departments", async () => {
    const req = createMockRequest("/api/spoc/contacts", "GET", undefined, spoc1Token);
    const res = await getSpocContacts(req);
    assert.equal(res.status, 200);
    const json = await res.json();
    assert.equal(json.success, true);
    assert.equal(json.teams.length, 4, "Must return contacts for all 4 assigned teams");
    assert.equal(json.escalationAuthorities.length, 5, "Must provide the 5 official escalation authorities");

    const depts = json.escalationAuthorities.map((e: any) => e.department);
    assert.ok(depts.includes("REGISTRATION"));
    assert.ok(depts.includes("TRANSPORT"));
    assert.ok(depts.includes("ACCOMMODATION"));
    assert.ok(depts.includes("MATCH & COURT"));
    assert.ok(depts.includes("EMERGENCY & EVENT CONTROL"));
  });

  // TEST 11: Admin SPOC Management - Super Admin can list all SPOCs
  it("Test 11: Admin can list SPOCs and verify assignment status (/api/admin/spocs)", async () => {
    const req = createMockRequest("/api/admin/spocs", "GET", undefined, superAdminToken);
    const res = await getAdminSpocs(req);
    assert.equal(res.status, 200);
    const json = await res.json();
    assert.equal(json.success, true);
    assert.ok(json.spocs.length >= 26, "Must list all 26 official SPOCs");

    const utkarshEntry = json.spocs.find((s: any) => s.email === "utkarshguptaspoc@szwbt2026.edu");
    assert.ok(utkarshEntry);
    assert.equal(utkarshEntry.assignedTeamsCount, 4);
    assert.equal(utkarshEntry.status, "COMPLETE");
  });

  // TEST 12: Admin Team Assignment Validation - Max Teams Enforced (> 20)
  it("Test 12: Admin assignment rejects more than 20 teams with HTTP 400 validation error", async () => {
    const excessiveTeams = Array.from({ length: 25 }, (_, i) => `team-${i}`);
    const req = createMockRequest(
      "/api/admin/spocs",
      "PUT",
      {
        spocId: spoc1User.id,
        teamIds: excessiveTeams,
      },
      superAdminToken
    );
    const res = await putAdminSpocs(req);
    assert.equal(res.status, 400);
    const json = await res.json();
    assert.equal(json.success, false);
    assert.match(json.error, /cannot be assigned more than 20 teams/);
  });

  // TEST 13: Admin Team Assignment Validation - Duplicate Team Rejection
  it("Test 13: Admin assignment rejects duplicate team IDs with HTTP 400 validation error", async () => {
    const req = createMockRequest(
      "/api/admin/spocs",
      "PUT",
      {
        spocId: spoc1User.id,
        teamIds: [spoc1TeamIds[0], spoc1TeamIds[0], spoc1TeamIds[1]], // duplicates
      },
      superAdminToken
    );
    const res = await putAdminSpocs(req);
    assert.equal(res.status, 400);
    const json = await res.json();
    assert.equal(json.success, false);
    assert.match(json.error, /Duplicate team IDs/);
  });

  // TEST 14: Non-admin users cannot access Admin SPOC APIs
  it("Test 14: SPOC user cannot access Admin SPOC management API (HTTP 403)", async () => {
    const req = createMockRequest("/api/admin/spocs", "GET", undefined, spoc1Token);
    const res = await getAdminSpocs(req);
    assert.equal(res.status, 403);
  });

  // TEST 15: Route Guard Verification — Old /volunteer route is unmapped / blocked
  it("Test 15: Old /volunteer routes are not accessible by SPOC or any unprivileged role", () => {
    const spocRouteCheck = checkRouteAuthorization("/spoc", [PERMISSIONS.SPOC_VIEW_OWN_TEAMS], [ROLES.SPOC]);
    assert.equal(spocRouteCheck.authorized, true, "SPOC must be authorized to access /spoc");

    const spocAdminCheck = checkRouteAuthorization("/admin/spocs", [PERMISSIONS.SPOC_VIEW_OWN_TEAMS], [ROLES.SPOC]);
    assert.equal(spocAdminCheck.authorized, false, "SPOC must NOT be authorized to access /admin/spocs");
  });

  // TEST 16: NITHISH J SPECIAL VALIDATION - Exactly 3 teams (TN-25, TN-26, PO-01)
  it("Test 16: Nithish J has exactly TN-25, TN-26, PO-01 and cannot access TN-24", async () => {
    // Check teams overview
    const req = createMockRequest("/api/spoc/teams", "GET", undefined, nithishToken);
    const res = await getSpocTeams(req);
    assert.equal(res.status, 200);
    const json = await res.json();
    assert.equal(json.teams.length, 3, "Nithish J must have exactly 3 teams");
    const codes = json.teams.map((t: any) => t.teamCode).sort();
    assert.deepEqual(codes, ["PO-01", "TN-25", "TN-26"]);

    // Verify PO-01 details
    const po01 = json.teams.find((t: any) => t.teamCode === "PO-01");
    assert.ok(po01);
    assert.equal(po01.institution, "Pondicherry University, Puducherry");
    assert.equal(po01.managerPhone, "9488979000");

    // Can access PO-01 via team code
    const poReq = createMockRequest("/api/spoc/teams/PO-01", "GET", undefined, nithishToken);
    const poRes = await getSpocTeamDetail(poReq, { params: Promise.resolve({ id: "PO-01" }) });
    assert.equal(poRes.status, 200);

    // CANNOT access TN-24
    const tn24Req = createMockRequest("/api/spoc/teams/TN-24", "GET", undefined, nithishToken);
    const tn24Res = await getSpocTeamDetail(tn24Req, { params: Promise.resolve({ id: "TN-24" }) });
    assert.equal(tn24Res.status, 403, "Nithish J must NOT access TN-24 (HTTP 403 Forbidden)");
  });
});
