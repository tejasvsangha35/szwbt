import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import { NextRequest } from "next/server";
import { GET as getOperationsOverview } from "@/app/api/operations/route";
import { GET as getIncidents, POST as createIncident } from "@/app/api/operations/incidents/route";
import { GET as getIncidentDetail, PATCH as updateIncident } from "@/app/api/operations/incidents/[id]/route";
import { GET as getTasks, POST as createTask } from "@/app/api/operations/tasks/route";
import { GET as getTaskDetail, PATCH as updateTask } from "@/app/api/operations/tasks/[id]/route";
import { GET as getVenueAreas, PATCH as updateVenueArea } from "@/app/api/operations/venue/route";
import { GET as getStaffRoster, POST as createStaffAssignment } from "@/app/api/operations/staff/route";
import { GET as getCourtsOverview, PATCH as updateCourtStatus } from "@/app/api/operations/courts/route";
import { GET as getMatchControlDetailsRoute } from "@/app/api/operations/matches/[id]/route";
import { POST as assignCourtRoute } from "@/app/api/operations/matches/[id]/court/route";
import { POST as assignOfficialRoute } from "@/app/api/operations/matches/[id]/official/route";
import { POST as updateReadinessRoute } from "@/app/api/operations/matches/[id]/readiness/route";
import { POST as sendToUmpireRoute } from "@/app/api/operations/matches/[id]/send-to-umpire/route";
import { POST as confirmResultRoute } from "@/app/api/operations/matches/[id]/confirm-result/route";
import { POST as releaseCourtRoute } from "@/app/api/operations/courts/[courtNumber]/release/route";
import { GET as getOfficialMatchesRoute } from "@/app/api/official/matches/route";
import { POST as postOfficialMatchActionRoute } from "@/app/api/official/matches/[id]/actions/route";
import { evaluateMatchReadiness, getTechOpsConfiguration } from "@/lib/operations/techOpsService";
import { createSessionToken } from "@/lib/rbac/token";
import { prisma } from "@/lib/prisma";
import { ROLES } from "@/lib/rbac/roles";
import { PERMISSIONS } from "@/lib/rbac/permissions";

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

describe("ON-GROUND OPERATIONS COMMAND CENTER TESTS (/operations)", async () => {
  // Setup users
  let opsUser: any;
  let superAdminUser: any;
  let participantUser: any;
  let volunteerUser: any;
  let umpireUser: any;
  let umpire2User: any;
  let opsToken: string;
  let superAdminToken: string;
  let participantToken: string;
  let spocToken: string;
  let umpireToken: string;
  let umpire2Token: string;

  // Technical Operations Test Match IDs
  const testMatchId = "test-techops-match-01";
  const downstreamMatchId = "test-techops-downstream-01";
  const unreadyMatchId = "test-techops-unready-01";

  before(async () => {
    opsUser = await prisma.user.findUnique({ where: { email: "ops@szwbt2026.edu" } });
    superAdminUser = await prisma.user.findUnique({ where: { email: "admin@szwbt2026.edu" } });
    participantUser = await prisma.user.findUnique({ where: { email: "player@szwbt2026.edu" } });
    const spocUser = await prisma.user.findUnique({ where: { email: "spoc@szwbt2026.edu" } });
    umpireUser = await prisma.user.findUnique({ where: { email: "umpire@szwbt2026.edu" } });

    assert.ok(opsUser, "Operations user exists in test database");
    assert.ok(superAdminUser, "Super admin user exists in test database");
    assert.ok(participantUser, "Participant user exists in test database");
    assert.ok(umpireUser, "Umpire user exists in test database");

    // Upsert secondary match official for unassigned authorization isolation test
    umpire2User = await prisma.user.upsert({
      where: { email: "umpire2@szwbt2026.edu" },
      update: { isActive: true },
      create: {
        email: "umpire2@szwbt2026.edu",
        name: "National Umpire K. Reddy",
        passwordHash: "szwbt2026pass",
        badge: "National Umpire",
        isActive: true,
      },
    });

    const officialRole = await prisma.role.findUnique({ where: { name: ROLES.MATCH_OFFICIAL } });
    if (officialRole) {
      await prisma.userRole.upsert({
        where: { userId_roleId: { userId: umpire2User.id, roleId: officialRole.id } },
        update: {},
        create: { userId: umpire2User.id, roleId: officialRole.id },
      });
    }

    opsToken = createSessionToken({
      userId: opsUser.id,
      email: opsUser.email,
      roles: [ROLES.OPERATIONS_STAFF],
      permissions: [
        PERMISSIONS.REGISTRATION_READ,
        PERMISSIONS.ACCOMMODATION_READ,
        PERMISSIONS.TRANSPORT_READ,
        PERMISSIONS.ANNOUNCEMENT_READ,
        PERMISSIONS.PARTICIPANT_READ,
        PERMISSIONS.LIVE_READ,
        PERMISSIONS.LIVE_OPERATE,
      ],
    });

    superAdminToken = createSessionToken({
      userId: superAdminUser.id,
      email: superAdminUser.email,
      roles: [ROLES.SUPER_ADMIN],
      permissions: Object.values(PERMISSIONS),
    });

    participantToken = createSessionToken({
      userId: participantUser.id,
      email: participantUser.email,
      roles: [ROLES.PARTICIPANT],
      permissions: [PERMISSIONS.PARTICIPANT_READ],
    });

    umpireToken = createSessionToken({
      userId: umpireUser.id,
      email: umpireUser.email,
      roles: [ROLES.MATCH_OFFICIAL],
      permissions: [
        PERMISSIONS.MATCH_READ,
        PERMISSIONS.SCORING_READ,
        PERMISSIONS.SCORING_UPDATE,
        PERMISSIONS.SCORING_SUBMIT,
        PERMISSIONS.RESULT_READ,
        PERMISSIONS.RESULT_SUBMIT,
      ],
    });

    umpire2Token = createSessionToken({
      userId: umpire2User.id,
      email: umpire2User.email,
      roles: [ROLES.MATCH_OFFICIAL],
      permissions: [
        PERMISSIONS.MATCH_READ,
        PERMISSIONS.SCORING_READ,
        PERMISSIONS.SCORING_UPDATE,
        PERMISSIONS.SCORING_SUBMIT,
        PERMISSIONS.RESULT_READ,
        PERMISSIONS.RESULT_SUBMIT,
      ],
    });

    if (spocUser) {
      spocToken = createSessionToken({
        userId: spocUser.id,
        email: spocUser.email,
        roles: [ROLES.SPOC],
        permissions: [PERMISSIONS.SPOC_VIEW_OWN_TEAMS],
      });
    }

    // Seed test tournament day and clean test fixtures
    await prisma.tournamentDay.upsert({
      where: { id: "OCT18" },
      update: {},
      create: {
        id: "OCT18",
        date: "OCT 18",
        dayNumber: "Day 1",
        stage: "Round 1",
        isPublished: true,
      },
    });

    await prisma.resultCommunication.deleteMany({
      where: { matchId: { in: [testMatchId, downstreamMatchId, unreadyMatchId] } },
    });
    await prisma.courtReadinessCheck.deleteMany({
      where: { matchId: { in: [testMatchId, downstreamMatchId, unreadyMatchId] } },
    });
    await prisma.preMatchReporting.deleteMany({
      where: { matchId: { in: [testMatchId, downstreamMatchId, unreadyMatchId] } },
    });
    await prisma.matchEvent.deleteMany({
      where: { matchId: { in: [testMatchId, downstreamMatchId, unreadyMatchId] } },
    });
    await prisma.match.deleteMany({
      where: {
        OR: [
          { id: { in: [testMatchId, downstreamMatchId, unreadyMatchId] } },
          { publicMatchNumber: { in: ["TEST-M099", "TEST-M050", "TEST-M051"] } },
        ],
      },
    });

    // Ensure only 4 tournament courts exist (Court 01 to Court 04)
    const courtNumbers = ["Court 01", "Court 02", "Court 03", "Court 04"];
    for (const courtNumber of courtNumbers) {
      await prisma.court.upsert({
        where: { courtNumber },
        update: { status: "AVAILABLE", umpire: null },
        create: {
          courtNumber,
          venue: "Main Indoor Stadium",
          status: "AVAILABLE",
          isActive: true,
        },
      });
    }

    // Reset any LIVE/PAUSED matches occupying tournament courts to avoid test conflicts
    await prisma.match.updateMany({
      where: {
        court: { in: courtNumbers },
        status: { in: ["LIVE", "PAUSED"] },
      },
      data: { status: "COMPLETED" },
    });

    // Clean up any extraneous courts 05-08
    await prisma.court.deleteMany({
      where: { courtNumber: { in: ["Court 05", "Court 06", "Court 07", "Court 08"] } },
    });

    await prisma.match.create({
      data: {
        id: downstreamMatchId,
        dayId: "OCT18",
        time: "14:00 IST",
        category: "Women's Singles",
        court: "Court 04",
        matchNumber: "QF - Match 99",
        publicMatchNumber: "TEST-M099",
        playerA: "WINNER OF R1 - TECHOPS MATCH 01",
        institutionA: "TBD",
        playerB: "Kavya Sundaram",
        institutionB: "Anna University",
        status: "UPCOMING",
      },
    });

    await prisma.match.create({
      data: {
        id: testMatchId,
        dayId: "OCT18",
        time: "10:00 IST",
        category: "Women's Singles",
        court: "Unassigned",
        matchNumber: "R1 - TechOps Match 01",
        publicMatchNumber: "TEST-M050",
        playerA: "Ananya Sharma",
        institutionA: "KLE Technological University",
        playerB: "Priya Nair",
        institutionB: "Calicut University",
        status: "UPCOMING",
        downstreamMatchId: downstreamMatchId,
        downstreamSlot: "A",
      },
    });

    await prisma.match.create({
      data: {
        id: unreadyMatchId,
        dayId: "OCT18",
        time: "11:00 IST",
        category: "Women's Singles",
        court: "Unassigned",
        matchNumber: "R1 - TechOps Unready",
        publicMatchNumber: "TEST-M051",
        playerA: "WINNER OF PRELIM",
        institutionA: "TBD",
        playerB: "TBD",
        institutionB: "TBD",
        status: "UPCOMING",
      },
    });
  });

  // TEST 1: Authorized Operations Staff can access /api/operations
  it("Test 1: Authorized Operations Staff can access command center telemetry", async () => {
    const req = createMockRequest("/api/operations", "GET", undefined, opsToken);
    const res = await getOperationsOverview(req);
    assert.equal(res.status, 200, "Should return HTTP 200 OK");
    const json = await res.json();
    assert.equal(json.success, true);
    assert.ok(json.globalStatus, "Global status should be populated");
    assert.ok(json.metrics, "Metrics should be populated");
    assert.ok(Array.isArray(json.incidents), "Incidents list should be array");
    assert.ok(Array.isArray(json.tasks), "Tasks list should be array");
    assert.ok(Array.isArray(json.venueAreas), "Venue areas list should be array");
  });

  // TEST 2: Unauthorized role (Participant) rejected with 403 Forbidden
  it("Test 2: Unauthorized Participant is strictly rejected with HTTP 403 Forbidden", async () => {
    const req = createMockRequest("/api/operations", "GET", undefined, participantToken);
    const res = await getOperationsOverview(req);
    assert.equal(res.status, 403, "Should return HTTP 403 Forbidden");
    const json = await res.json();
    assert.equal(json.success, false);
    assert.match(json.error, /403 Forbidden/);
  });

  // TEST 3: Unauthenticated request rejected with 401 Unauthorized
  it("Test 3: Unauthenticated request is strictly rejected with HTTP 401 Unauthorized", async () => {
    const req = createMockRequest("/api/operations", "GET");
    const res = await getOperationsOverview(req);
    assert.equal(res.status, 401, "Should return HTTP 401 Unauthorized");
  });

  // TEST 4: Incident Creation Workflow
  let createdIncidentId: string;
  it("Test 4: Operations Staff can report a high-priority operational incident", async () => {
    const body = {
      title: "Court 03 Light Fixture Flickering",
      category: "VENUE",
      severity: "HIGH",
      priority: "HIGH",
      location: "Court Block B - Court 03",
      description: "High-bay LED array #4 intermittent flicker during practice.",
    };
    const req = createMockRequest("/api/operations/incidents", "POST", body, opsToken);
    const res = await createIncident(req);
    assert.equal(res.status, 200, "Should return HTTP 200");
    const json = await res.json();
    assert.equal(json.success, true);
    assert.ok(json.incident.id);
    assert.equal(json.incident.severity, "HIGH");
    createdIncidentId = json.incident.id;
  });

  // TEST 5: Query Incidents with filter
  it("Test 5: Operations Staff can filter incidents by severity and category", async () => {
    const req = createMockRequest(
      "/api/operations/incidents?severity=HIGH&category=VENUE",
      "GET",
      undefined,
      opsToken
    );
    const res = await getIncidents(req);
    assert.equal(res.status, 200);
    const json = await res.json();
    assert.equal(json.success, true);
    assert.ok(Array.isArray(json.incidents));
    assert.ok(json.incidents.some((i: any) => i.id === createdIncidentId));
  });

  // TEST 6: Incident Detail & Lifecycle Update (Acknowledge & Assign)
  it("Test 6: Operations Staff can acknowledge and assign responder to incident", async () => {
    assert.ok(createdIncidentId, "Incident ID must exist from previous test");
    const req = createMockRequest(
      `/api/operations/incidents/${createdIncidentId}`,
      "PATCH",
      {
        status: "IN_PROGRESS",
        assignedResponder: "Electrical Maintenance Team",
        latestUpdate: "Electrician dispatched with replacement ballast",
      },
      opsToken
    );
    const res = await updateIncident(req, { params: Promise.resolve({ id: createdIncidentId }) });
    assert.equal(res.status, 200);
    const json = await res.json();
    assert.equal(json.success, true);
    assert.equal(json.incident.status, "IN_PROGRESS");
    assert.equal(json.incident.assignedResponder, "Electrical Maintenance Team");
  });

  // TEST 7: Resolve Incident with Audit logging
  it("Test 7: Operations Staff can resolve incident with resolution notes", async () => {
    assert.ok(createdIncidentId);
    const req = createMockRequest(
      `/api/operations/incidents/${createdIncidentId}`,
      "PATCH",
      {
        status: "RESOLVED",
        resolutionNotes: "Ballast replaced. Court 03 illumination verified at 1500 lux.",
      },
      opsToken
    );
    const res = await updateIncident(req, { params: Promise.resolve({ id: createdIncidentId }) });
    assert.equal(res.status, 200);
    const json = await res.json();
    assert.equal(json.success, true);
    assert.equal(json.incident.status, "RESOLVED");
    assert.equal(json.incident.resolutionNotes, "Ballast replaced. Court 03 illumination verified at 1500 lux.");
  });

  // TEST 8: Task Command Center - Create Task
  let createdTaskId: string;
  it("Test 8: Operations Staff can dispatch new task to queue", async () => {
    const body = {
      title: "Inspect Umpire Radios Court Block A",
      category: "TECHNICAL",
      priority: "NORMAL",
      location: "Court Block A Desk",
      dueTime: "11:45 IST",
      instructions: "Check battery levels and frequency channel 4.",
    };
    const req = createMockRequest("/api/operations/tasks", "POST", body, opsToken);
    const res = await createTask(req);
    assert.equal(res.status, 200);
    const json = await res.json();
    assert.equal(json.success, true);
    assert.ok(json.task.id);
    createdTaskId = json.task.id;
  });

  // TEST 9: Task Status Update
  it("Test 9: Operations Staff can update task status to COMPLETED", async () => {
    assert.ok(createdTaskId);
    const req = createMockRequest(
      `/api/operations/tasks/${createdTaskId}`,
      "PATCH",
      { status: "COMPLETED" },
      opsToken
    );
    const res = await updateTask(req, { params: Promise.resolve({ id: createdTaskId }) });
    assert.equal(res.status, 200);
    const json = await res.json();
    assert.equal(json.success, true);
    assert.equal(json.task.status, "COMPLETED");
  });

  // TEST 10: Venue Sector Readiness Query and Update
  it("Test 10: Operations Staff can query and update venue area status", async () => {
    const reqList = createMockRequest("/api/operations/venue", "GET", undefined, opsToken);
    const resList = await getVenueAreas(reqList);
    assert.equal(resList.status, 200);
    const jsonList = await resList.json();
    assert.ok(jsonList.venueAreas.length > 0);

    const firstArea = jsonList.venueAreas[0];
    const reqUpdate = createMockRequest(
      "/api/operations/venue",
      "PATCH",
      { id: firstArea.id, status: "ACTIVE", notes: "Field check completed" },
      opsToken
    );
    const resUpdate = await updateVenueArea(reqUpdate);
    assert.equal(resUpdate.status, 200);
    const jsonUpdate = await resUpdate.json();
    assert.equal(jsonUpdate.venueArea.status, "ACTIVE");
  });

  // TEST 11: Staff & Volunteer Roster Query and Deployment
  it("Test 11: Operations Staff can query personnel roster and create deployment assignment", async () => {
    const reqList = createMockRequest("/api/operations/staff", "GET", undefined, opsToken);
    const resList = await getStaffRoster(reqList);
    assert.equal(resList.status, 200);
    const jsonList = await resList.json();
    assert.ok(Array.isArray(jsonList.staff));

    if (volunteerUser) {
      const reqAssign = createMockRequest(
        "/api/operations/staff",
        "POST",
        {
          userId: volunteerUser.id,
          title: "Evening Shuttle Escort",
          venue: "Arena South Bay",
          area: "Transit Hub",
          shiftStart: "18:00",
          shiftEnd: "21:00",
          supervisor: "Fleet Officer Somesh",
        },
        opsToken
      );
      const resAssign = await createStaffAssignment(reqAssign);
      assert.equal(resAssign.status, 200);
      const jsonAssign = await resAssign.json();
      assert.equal(jsonAssign.success, true);
      assert.equal(jsonAssign.assignment.title, "Evening Shuttle Escort");
    }
  });

  // TEST 12: Courts Operational Overview
  it("Test 12: Operations Staff can query court status overview", async () => {
    const req = createMockRequest("/api/operations/courts", "GET", undefined, opsToken);
    const res = await getCourtsOverview(req);
    assert.equal(res.status, 200);
    const json = await res.json();
    assert.ok(Array.isArray(json.courts));
    assert.ok(json.courts.some((c: any) => c.courtNumber === "Court 01"));
  });

  // TEST 13: Zero Transport Payment Policy Enforced
  it("Test 13: Zero transport payment policy strictly verified in operations contracts", async () => {
    const req = createMockRequest("/api/operations", "GET", undefined, opsToken);
    const res = await getOperationsOverview(req);
    const json = await res.json();
    assert.equal(
      json.globalStatus.transport,
      "IN SERVICE",
      "Transport is strictly complimentary operations without payment"
    );
  });

  // TEST 14: Court assignment to eligible match
  it("Test 14: Technical Committee assigns Court 04 to eligible upcoming match", async () => {
    const req = createMockRequest(
      `/api/operations/matches/${testMatchId}/court`,
      "POST",
      { courtNumber: "Court 04" },
      opsToken
    );
    const res = await assignCourtRoute(req, { params: Promise.resolve({ id: testMatchId }) });
    assert.equal(res.status, 200);
    const json = await res.json();
    assert.equal(json.success, true);
    assert.equal(json.data.match.court, "Court 04");
    assert.equal(json.data.match.status, "COURT_ASSIGNED");
    assert.equal(json.data.court.status, "ASSIGNED");
  });

  // TEST 15: Court conflict rejection (two matches assigned same court)
  it("Test 15: Court assignment is rejected if court is occupied by active LIVE match (Conflict 409)", async () => {
    const liveMatch = await prisma.match.create({
      data: {
        id: "test-temp-live-court03",
        dayId: "OCT18",
        time: "09:30 IST",
        category: "Women's Singles",
        court: "Court 03",
        matchNumber: "R1 - Temp Live 03",
        playerA: "Player X",
        institutionA: "Univ X",
        playerB: "Player Y",
        institutionB: "Univ Y",
        status: "LIVE",
      },
    });

    const req = createMockRequest(
      `/api/operations/matches/${testMatchId}/court`,
      "POST",
      { courtNumber: "Court 03" },
      opsToken
    );
    const res = await assignCourtRoute(req, { params: Promise.resolve({ id: testMatchId }) });
    assert.equal(res.status, 409, "Should return 409 Conflict");
    const json = await res.json();
    assert.equal(json.success, false);
    assert.match(json.error, /occupied by active LIVE match/i);

    await prisma.match.delete({ where: { id: liveMatch.id } });
  });

  // TEST 16: Official assignment to match
  it("Test 16: Technical Committee assigns certified Match Official (Umpire) to match", async () => {
    const req = createMockRequest(
      `/api/operations/matches/${testMatchId}/official`,
      "POST",
      { officialId: umpireUser.id, roleType: "UMPIRE", courtOfficials: "Service Judge: S. Murthy" },
      opsToken
    );
    const res = await assignOfficialRoute(req, { params: Promise.resolve({ id: testMatchId }) });
    assert.equal(res.status, 200);
    const json = await res.json();
    assert.equal(json.success, true);
    assert.equal(json.data.assignedOfficialId, umpireUser.id);
    assert.equal(json.data.courtOfficials, "Service Judge: S. Murthy");
  });

  // TEST 17: Official conflict rejection (official already active elsewhere)
  it("Test 17: Official assignment rejected if official is currently umpiring another LIVE match (Conflict 409)", async () => {
    const liveMatchUmp = await prisma.match.create({
      data: {
        id: "test-temp-live-umpire",
        dayId: "OCT18",
        time: "09:30 IST",
        category: "Women's Singles",
        court: "Court 02",
        matchNumber: "R1 - Temp Live Ump",
        playerA: "Player A1",
        institutionA: "Univ A1",
        playerB: "Player B1",
        institutionB: "Univ B1",
        status: "LIVE",
        assignedOfficialId: umpireUser.id,
      },
    });

    const req = createMockRequest(
      `/api/operations/matches/${downstreamMatchId}/official`,
      "POST",
      { officialId: umpireUser.id, roleType: "UMPIRE" },
      opsToken
    );
    const res = await assignOfficialRoute(req, { params: Promise.resolve({ id: downstreamMatchId }) });
    assert.equal(res.status, 409, "Should return 409 Conflict");
    const json = await res.json();
    assert.equal(json.success, false);
    assert.match(json.error, /currently umpiring LIVE match/i);

    await prisma.match.delete({ where: { id: liveMatchUmp.id } });
  });

  // TEST 18: Readiness calculation rejection when teams missing
  it("Test 18: Readiness evaluation fails when bracket slot has unresolved placeholders", async () => {
    const unreadyMatch = await prisma.match.findUnique({ where: { id: unreadyMatchId } });
    const config = await getTechOpsConfiguration();
    const readiness = evaluateMatchReadiness({
      match: unreadyMatch,
      court: null,
      courtChecks: [],
      preMatch: null,
      shuttleFeeConfig: config.shuttleFee,
    });
    assert.equal(readiness.isReady, false);
    assert.ok(
      readiness.blockingReasons.some((r) => r.includes("Knockout bracket slot unresolved")),
      "Should block on unresolved placeholder team"
    );
  });

  // TEST 19: Readiness calculation rejection when court missing
  it("Test 19: Readiness evaluation fails when court is not assigned", async () => {
    const config = await getTechOpsConfiguration();
    const matchWithoutCourt = {
      playerA: "Ananya Sharma",
      playerB: "Priya Nair",
      court: "Unassigned",
      assignedOfficialId: umpireUser.id,
    };
    const readiness = evaluateMatchReadiness({
      match: matchWithoutCourt,
      court: null,
      courtChecks: [],
      preMatch: null,
      shuttleFeeConfig: config.shuttleFee,
    });
    assert.equal(readiness.isReady, false);
    assert.ok(
      readiness.blockingReasons.some((r) => r.includes("Court not assigned")),
      "Should block on missing court"
    );
  });

  // TEST 20: Readiness calculation rejection when umpire missing
  it("Test 20: Readiness evaluation fails when match official is not assigned", async () => {
    const config = await getTechOpsConfiguration();
    const matchWithoutUmpire = {
      playerA: "Ananya Sharma",
      playerB: "Priya Nair",
      court: "Court 04",
      assignedOfficialId: null,
    };
    const readiness = evaluateMatchReadiness({
      match: matchWithoutUmpire,
      court: { courtNumber: "Court 04", status: "AVAILABLE", isActive: true },
      courtChecks: [],
      preMatch: null,
      shuttleFeeConfig: config.shuttleFee,
    });
    assert.equal(readiness.isReady, false);
    assert.ok(
      readiness.blockingReasons.some((r) => r.includes("Umpire not assigned")),
      "Should block on missing umpire"
    );
  });

  // TEST 21: Readiness calculation rejection when pre-match reporting incomplete
  it("Test 21: Readiness evaluation fails when pre-match reporting is incomplete", async () => {
    const config = await getTechOpsConfiguration();
    const match = await prisma.match.findUnique({ where: { id: testMatchId } });
    const court = await prisma.court.findUnique({ where: { courtNumber: "Court 04" } });
    const readiness = evaluateMatchReadiness({
      match,
      court,
      courtChecks: [],
      preMatch: null,
      shuttleFeeConfig: config.shuttleFee,
    });
    assert.equal(readiness.isReady, false);
    assert.ok(readiness.blockingReasons.some((r) => r.includes("Team A (Ananya Sharma) has not reported")));
    assert.ok(readiness.blockingReasons.some((r) => r.includes("Team B (Priya Nair) has not reported")));
    assert.ok(readiness.blockingReasons.some((r) => r.includes("Officials presence not confirmed on court")));
  });

  // TEST 22: Exact blocking reasons exposed in readiness response
  it("Test 22: GET /api/operations/matches/[id] exposes authoritative readiness status and exact blocking reasons", async () => {
    const req = createMockRequest(`/api/operations/matches/${testMatchId}`, "GET", undefined, opsToken);
    const res = await getMatchControlDetailsRoute(req, { params: Promise.resolve({ id: testMatchId }) });
    assert.equal(res.status, 200);
    const json = await res.json();
    assert.equal(json.success, true);
    assert.equal(json.data.readiness.isReady, false);
    assert.ok(Array.isArray(json.data.readiness.blockingReasons));
    assert.ok(json.data.readiness.blockingReasons.length >= 3);
    assert.ok(
      json.data.readiness.blockingReasons.some((r: string) => r.includes("Team A (Ananya Sharma) has not reported"))
    );
  });

  // TEST 23: Send match to umpire rejected if not ready
  it("Test 23: Handoff to Umpire is strictly rejected when match is not fully ready (400 Bad Request)", async () => {
    const req = createMockRequest(
      `/api/operations/matches/${testMatchId}/send-to-umpire`,
      "POST",
      {},
      opsToken
    );
    const res = await sendToUmpireRoute(req, { params: Promise.resolve({ id: testMatchId }) });
    assert.equal(res.status, 400);
    const json = await res.json();
    assert.equal(json.success, false);
    assert.match(json.error, /Cannot send match to umpire. Unmet requirements/);
  });

  // TEST 24: Send match to umpire succeeds when ready
  it("Test 24: Completing pre-match reporting allows Technical Committee to send match to umpire", async () => {
    // 1. Submit pre-match reporting
    const reqReport = createMockRequest(
      `/api/operations/matches/${testMatchId}/readiness`,
      "POST",
      {
        type: "PRE_MATCH",
        teamAReported: true,
        teamBReported: true,
        officialsPresent: true,
        courtReady: true,
        shuttleFeeStatus: "PAID",
        notes: "Both teams present in warmup area, lineups submitted",
      },
      opsToken
    );
    const resReport = await updateReadinessRoute(reqReport, { params: Promise.resolve({ id: testMatchId }) });
    assert.equal(resReport.status, 200);
    const jsonReport = await resReport.json();
    assert.equal(jsonReport.data.readiness.isReady, true, "Match readiness should now be true");

    // 2. Send match to umpire
    const reqSend = createMockRequest(
      `/api/operations/matches/${testMatchId}/send-to-umpire`,
      "POST",
      {},
      opsToken
    );
    const resSend = await sendToUmpireRoute(reqSend, { params: Promise.resolve({ id: testMatchId }) });
    assert.equal(resSend.status, 200);
    const jsonSend = await resSend.json();
    assert.equal(jsonSend.success, true);
    assert.match(jsonSend.message, /READY_TO_START/);
  });

  // TEST 25: Match status transitions to READY_TO_START
  it("Test 25: Match transitions to READY_TO_START with handoff audit fields populated", async () => {
    const updated = await prisma.match.findUnique({ where: { id: testMatchId } });
    assert.ok(updated);
    assert.equal(updated.status, "READY_TO_START");
    assert.equal(updated.handoffStatus, "SENT_TO_UMPIRE");
    assert.ok(updated.handoffAt, "handoffAt timestamp should be set");
    assert.equal(updated.handoffBy, opsUser.email);
  });

  // TEST 26: Official dashboard shows match only to assigned umpire
  it("Test 26: Official dashboard (/api/official/matches) shows match to assigned umpire", async () => {
    const req = createMockRequest("/api/official/matches", "GET", undefined, umpireToken);
    const res = await getOfficialMatchesRoute(req);
    assert.equal(res.status, 200);
    const json = await res.json();
    assert.equal(json.success, true);
    const allAssigned = [
      json.data.currentMatch,
      ...(json.data.upcomingMatches || []),
      ...(json.data.completedMatches || []),
    ].filter(Boolean);
    assert.ok(
      allAssigned.some((m: any) => m.id === testMatchId),
      "Assigned umpire must receive match in their official queue"
    );
  });

  // TEST 27: Unassigned umpire cannot access match
  it("Test 27: Unassigned umpire is strictly denied access with 403 NOT_ASSIGNED", async () => {
    const req = createMockRequest(
      `/api/official/matches/${testMatchId}/actions`,
      "POST",
      { action: "START" },
      umpire2Token
    );
    const res = await postOfficialMatchActionRoute(req, { params: Promise.resolve({ id: testMatchId }) });
    assert.equal(res.status, 403);
    const json = await res.json();
    assert.equal(json.success, false);
    assert.ok(json.code === "NOT_ASSIGNED" || json.code === "COURT_MISMATCH");
    assert.match(json.error, /403 Forbidden/);
  });

  // TEST 28: Umpire starts match -> status becomes LIVE
  it("Test 28: Assigned umpire starts match -> match and court transition to LIVE", async () => {
    const req = createMockRequest(
      `/api/official/matches/${testMatchId}/actions`,
      "POST",
      { action: "START" },
      umpireToken
    );
    const res = await postOfficialMatchActionRoute(req, { params: Promise.resolve({ id: testMatchId }) });
    assert.equal(res.status, 200);
    const json = await res.json();
    assert.equal(json.success, true);
    assert.equal(json.data.status, "LIVE");

    const court = await prisma.court.findUnique({ where: { courtNumber: "Court 04" } });
    assert.equal(court?.status, "LIVE");
  });

  // TEST 29: Live scoring updates match and court in real time
  it("Test 29: Point increments from umpire update match score and log match event in real time", async () => {
    const req = createMockRequest(
      `/api/official/matches/${testMatchId}/actions`,
      "POST",
      { action: "SCORE", pointTo: "PLAYER_A" },
      umpireToken
    );
    const res = await postOfficialMatchActionRoute(req, { params: Promise.resolve({ id: testMatchId }) });
    assert.equal(res.status, 200);
    const json = await res.json();
    assert.equal(json.success, true);

    const match = await prisma.match.findUnique({ where: { id: testMatchId } });
    assert.equal(match?.scoreA, "1");

    const events = await prisma.matchEvent.findMany({ where: { matchId: testMatchId } });
    assert.ok(events.some((e) => e.eventType === "POINT" && e.pointTo === "PLAYER_A"));
  });

  // TEST 30: Match result submitted by umpire
  it("Test 30: Umpire submits final match result -> status becomes RESULT_SUBMITTED", async () => {
    const req = createMockRequest(
      `/api/official/matches/${testMatchId}/actions`,
      "POST",
      { action: "COMPLETE", winner: "PLAYER_A" },
      umpireToken
    );
    const res = await postOfficialMatchActionRoute(req, { params: Promise.resolve({ id: testMatchId }) });
    assert.equal(res.status, 200);
    const json = await res.json();
    assert.equal(json.success, true);
    assert.equal(json.data.status, "RESULT_SUBMITTED");
    assert.equal(json.data.winner, "PLAYER_A");
  });

  // TEST 31: TechOps confirms result -> status becomes COMPLETED
  it("Test 31: TechOps confirms result -> status becomes COMPLETED, court becomes POST_MATCH", async () => {
    const req = createMockRequest(
      `/api/operations/matches/${testMatchId}/confirm-result`,
      "POST",
      {},
      opsToken
    );
    const res = await confirmResultRoute(req, { params: Promise.resolve({ id: testMatchId }) });
    assert.equal(res.status, 200);
    const json = await res.json();
    assert.equal(json.success, true);
    assert.equal(json.match.status, "COMPLETED");

    const court = await prisma.court.findUnique({ where: { courtNumber: "Court 04" } });
    assert.equal(court?.status, "POST_MATCH");
  });

  // TEST 32: Knockout progression automatically updates next bracket slot
  it("Test 32: Fixture bracket automatically propagates winner to downstream knockout slot", async () => {
    const downstream = await prisma.match.findUnique({ where: { id: downstreamMatchId } });
    assert.ok(downstream);
    assert.equal(
      downstream.playerA,
      "Ananya Sharma",
      "Downstream match slot A should be populated with winner"
    );
    assert.equal(
      downstream.institutionA,
      "KLE Technological University",
      "Downstream match institution should be populated"
    );
  });

  // TEST 33: Accommodation committee notified via domain event
  it("Test 33: Accommodation Committee is notified with confirmed match result event", async () => {
    const comm = await prisma.resultCommunication.findUnique({
      where: {
        matchId_committee: {
          matchId: testMatchId,
          committee: "ACCOMMODATION",
        },
      },
    });
    assert.ok(comm, "Accommodation result communication record must exist");
    assert.equal(comm.status, "SENT");
    const payload = JSON.parse(comm.payload);
    assert.equal(payload.winner, "PLAYER_A");
    assert.equal(payload.winningPlayer, "Ananya Sharma");
  });

  // TEST 34: Finance committee notified via domain event
  it("Test 34: Finance Committee is notified with confirmed match result event", async () => {
    const comm = await prisma.resultCommunication.findUnique({
      where: {
        matchId_committee: {
          matchId: testMatchId,
          committee: "FINANCE",
        },
      },
    });
    assert.ok(comm, "Finance result communication record must exist");
    assert.equal(comm.status, "SENT");
  });

  // TEST 35: Transportation committee notified via domain event
  it("Test 35: Transportation Committee is notified with confirmed match result event", async () => {
    const comm = await prisma.resultCommunication.findUnique({
      where: {
        matchId_committee: {
          matchId: testMatchId,
          committee: "TRANSPORTATION",
        },
      },
    });
    assert.ok(comm, "Transportation result communication record must exist");
    assert.equal(comm.status, "SENT");
  });

  // TEST 36: Court status becomes POST_MATCH then can be released to AVAILABLE
  it("Test 36: TechOps releases Court 04 from POST_MATCH to AVAILABLE status", async () => {
    const req = createMockRequest(
      "/api/operations/courts/Court%2004/release",
      "POST",
      { notes: "Court cleaned, net tension inspected, shuttles restocked." },
      opsToken
    );
    const res = await releaseCourtRoute(req, { params: Promise.resolve({ courtNumber: "Court 04" }) });
    assert.equal(res.status, 200);
    const json = await res.json();
    assert.equal(json.success, true);
    assert.equal(json.court.status, "AVAILABLE");
  });

  // TEST 37: Court release rejected if live match still on court
  it("Test 37: Court release is rejected with 400 Bad Request if a match is actively LIVE on that court", async () => {
    const liveMatch = await prisma.match.create({
      data: {
        id: "test-temp-live-court02",
        dayId: "OCT18",
        time: "11:30 IST",
        category: "Women's Singles",
        court: "Court 02",
        matchNumber: "R1 - Live 02",
        playerA: "Player K",
        institutionA: "Univ K",
        playerB: "Player L",
        institutionB: "Univ L",
        status: "LIVE",
      },
    });

    const req = createMockRequest(
      "/api/operations/courts/Court%2002/release",
      "POST",
      {},
      opsToken
    );
    const res = await releaseCourtRoute(req, { params: Promise.resolve({ courtNumber: "Court 02" }) });
    assert.equal(res.status, 400);
    const json = await res.json();
    assert.equal(json.success, false);
    assert.match(json.error, /is currently LIVE. End match first/);

    await prisma.match.delete({ where: { id: liveMatch.id } });
  });

  // TEST 38: Audit log captures all TechOps actions with user ID and timestamp
  it("Test 38: Technical audit trail logs all TechOps operational events with user credentials", async () => {
    const logs = await prisma.auditLog.findMany({
      where: {
        actorUserId: opsUser.id,
        action: {
          in: [
            "COURT_ASSIGNED",
            "OFFICIAL_ASSIGNED",
            "PRE_MATCH_REPORTING_RECORDED",
            "MATCH_SENT_TO_UMPIRE",
            "RESULT_CONFIRMED",
            "COURT_RELEASED",
          ],
        },
      },
    });
    assert.ok(logs.some((l) => l.action === "COURT_ASSIGNED"));
    assert.ok(logs.some((l) => l.action === "OFFICIAL_ASSIGNED"));
    assert.ok(logs.some((l) => l.action === "PRE_MATCH_REPORTING_RECORDED"));
    assert.ok(logs.some((l) => l.action === "MATCH_SENT_TO_UMPIRE"));
    assert.ok(logs.some((l) => l.action === "RESULT_CONFIRMED"));
    assert.ok(logs.some((l) => l.action === "COURT_RELEASED"));
  });

  // TEST 39: Role-based authorization for TechOps endpoints
  it("Test 39: Role-based access control enforces 401 for unauthenticated and 403 for unauthorized roles across TechOps endpoints", async () => {
    // 1. Unauthenticated court assignment -> 401
    const reqUnauth = createMockRequest(`/api/operations/matches/${testMatchId}/court`, "POST", { courtNumber: "Court 04" });
    const resUnauth = await assignCourtRoute(reqUnauth, { params: Promise.resolve({ id: testMatchId }) });
    assert.equal(resUnauth.status, 401);

    // 2. Participant (unauthorized) court assignment -> 403
    const reqPart = createMockRequest(
      `/api/operations/matches/${testMatchId}/court`,
      "POST",
      { courtNumber: "Court 04" },
      participantToken
    );
    const resPart = await assignCourtRoute(reqPart, { params: Promise.resolve({ id: testMatchId }) });
    assert.equal(resPart.status, 403);

    // 3. Participant (unauthorized) result confirmation -> 403
    const reqPartConfirm = createMockRequest(
      `/api/operations/matches/${testMatchId}/confirm-result`,
      "POST",
      {},
      participantToken
    );
    const resPartConfirm = await confirmResultRoute(reqPartConfirm, { params: Promise.resolve({ id: testMatchId }) });
    assert.equal(resPartConfirm.status, 403);

    // 4. Participant (unauthorized) court release -> 403
    const reqPartRelease = createMockRequest(
      "/api/operations/courts/Court%2004/release",
      "POST",
      {},
      participantToken
    );
    const resPartRelease = await releaseCourtRoute(reqPartRelease, { params: Promise.resolve({ courtNumber: "Court 04" }) });
    assert.equal(resPartRelease.status, 403);
  });

  after(async () => {
    await prisma.resultCommunication.deleteMany({
      where: { matchId: { in: [testMatchId, downstreamMatchId, unreadyMatchId] } },
    });
    await prisma.courtReadinessCheck.deleteMany({
      where: { matchId: { in: [testMatchId, downstreamMatchId, unreadyMatchId] } },
    });
    await prisma.preMatchReporting.deleteMany({
      where: { matchId: { in: [testMatchId, downstreamMatchId, unreadyMatchId] } },
    });
    await prisma.matchEvent.deleteMany({
      where: { matchId: { in: [testMatchId, downstreamMatchId, unreadyMatchId] } },
    });
    await prisma.match.deleteMany({
      where: { id: { in: [testMatchId, downstreamMatchId, unreadyMatchId] } },
    });
  });
});
