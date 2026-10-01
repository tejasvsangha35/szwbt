import { prisma } from "@/lib/prisma";
import { logAuditEvent } from "@/lib/rbac/audit";
import {
  MATCH_STATUS,
  COURT_STATUS,
  isPlaceholderSlot,
  resolveKnockoutDependencies,
  PAUSE_REASONS,
} from "@/lib/matches/lifecycle";
import { resolveMatchProgression } from "@/lib/tournament/fixtureService";
import { ROLES } from "@/lib/rbac/roles";

export interface ReadinessCheckResult {
  isReady: boolean;
  blockingReasons: string[];
  checks: Array<{
    id: string;
    label: string;
    passed: boolean;
    details?: string;
  }>;
}

/**
 * Ensures baseline technical operations system settings exist in the database.
 * Never hardcodes values - retrieves from DB or creates configurable records.
 */
export async function ensureTechOpsSettings(): Promise<void> {
  const defaultSettings = [
    {
      key: "tournament.shuttleFee",
      value: JSON.stringify({
        required: false,
        feePerTeam: 0,
        currency: "INR",
        policy: "NOT_REQUIRED",
        description: "Tournament Organizing Committee provides BWF Grade-1 feather shuttlecocks; verification required.",
      }),
      category: "TOURNAMENT",
      description: "Shuttle fee collection and verification policy",
      isPublic: true,
    },
    {
      key: "tournament.courtReadinessItems",
      value: JSON.stringify([
        { id: "surface", label: "Playing Surface / BWF Mat Integrity" },
        { id: "net_posts", label: "Net Height (1.55m) & Posts Tension" },
        { id: "lighting", label: "Arena Illumination (1000+ Lux)" },
        { id: "umpire_station", label: "Umpire Station & Electronic Scoreboard" },
        { id: "shuttles", label: "Feather Shuttlecock Stock Verification" },
      ]),
      category: "TOURNAMENT",
      description: "Configured technical court readiness checklist items",
      isPublic: true,
    },
    {
      key: "tournament.preMatchRequirements",
      value: JSON.stringify([
        { id: "team_a_reported", label: "Team A Lineup Reported to Desk" },
        { id: "team_b_reported", label: "Team B Lineup Reported to Desk" },
        { id: "officials_present", label: "Umpire & Court Officials Present" },
        { id: "court_ready", label: "Court Readiness Cleared" },
      ]),
      category: "TOURNAMENT",
      description: "Pre-match reporting technical criteria",
      isPublic: true,
    },
    {
      key: "tournament.resultCommunicationCommittees",
      value: JSON.stringify([
        { id: "ACCOMMODATION", name: "Accommodation Committee", channel: "IN_APP_EVENT" },
        { id: "FINANCE", name: "Finance Committee", channel: "IN_APP_EVENT" },
        { id: "TRANSPORTATION", name: "Transportation Committee", channel: "IN_APP_EVENT" },
      ]),
      category: "TOURNAMENT",
      description: "Downstream committees for confirmed match result synchronization",
      isPublic: true,
    },
  ];

  for (const s of defaultSettings) {
    const existing = await prisma.systemSetting.findUnique({ where: { key: s.key } });
    if (!existing) {
      await prisma.systemSetting.create({ data: s });
    }
  }
}

/**
 * Retrieves configured system settings for TechOps.
 */
export async function getTechOpsConfiguration() {
  await ensureTechOpsSettings();

  const settings = await prisma.systemSetting.findMany({
    where: {
      key: {
        in: [
          "tournament.name",
          "tournament.status",
          "tournament.venue",
          "tournament.dates",
          "tournament.shuttleFee",
          "tournament.courtReadinessItems",
          "tournament.preMatchRequirements",
          "tournament.resultCommunicationCommittees",
        ],
      },
    },
  });

  const configMap: Record<string, any> = {};
  settings.forEach((s) => {
    try {
      configMap[s.key] = JSON.parse(s.value);
    } catch {
      configMap[s.key] = s.value;
    }
  });

  return {
    tournamentName: configMap["tournament.name"] || "South Zone Women's Badminton Championship 2026",
    tournamentStatus: configMap["tournament.status"] || "LIVE",
    venue: configMap["tournament.venue"] || "KLE Technological University Indoor Stadium, Hubballi",
    dates: configMap["tournament.dates"] || "October 18 - 21, 2026",
    shuttleFee: configMap["tournament.shuttleFee"] || {
      required: false,
      feePerTeam: 0,
      currency: "INR",
      policy: "NOT_REQUIRED",
    },
    courtReadinessItems: configMap["tournament.courtReadinessItems"] || [],
    preMatchRequirements: configMap["tournament.preMatchRequirements"] || [],
    resultCommunicationCommittees: configMap["tournament.resultCommunicationCommittees"] || [
      { id: "ACCOMMODATION", name: "Accommodation Committee", channel: "IN_APP_EVENT" },
      { id: "FINANCE", name: "Finance Committee", channel: "IN_APP_EVENT" },
      { id: "TRANSPORTATION", name: "Transportation Committee", channel: "IN_APP_EVENT" },
    ],
  };
}

/**
 * Evaluates full pre-match technical readiness for a match.
 * Backend-authoritative with exact blocking reasons.
 */
export function evaluateMatchReadiness(params: {
  match: any;
  court: any | null;
  courtChecks: any[];
  preMatch: any | null;
  shuttleFeeConfig: any;
}): ReadinessCheckResult {
  const { match, court, courtChecks, preMatch, shuttleFeeConfig } = params;
  const blockingReasons: string[] = [];
  const checks: ReadinessCheckResult["checks"] = [];

  // 1. Teams resolved check
  const teamsResolved =
    match &&
    match.playerA &&
    match.playerB &&
    !isPlaceholderSlot(match.playerA) &&
    !isPlaceholderSlot(match.playerB);

  checks.push({
    id: "teams_resolved",
    label: "Teams Resolved in Fixture",
    passed: Boolean(teamsResolved),
    details: teamsResolved
      ? `${match.playerA} vs ${match.playerB}`
      : `Unresolved prerequisite bracket slot: ${match.playerA || "TBD"} vs ${match.playerB || "TBD"}`,
  });
  if (!teamsResolved) {
    blockingReasons.push(
      `Knockout bracket slot unresolved (${match.playerA || "TBD"} vs ${match.playerB || "TBD"}). Awaiting prior round winner.`
    );
  }

  // 2. Court assigned check
  const courtAssigned = Boolean(match && match.court && match.court !== "TBD" && match.court !== "Unassigned");
  checks.push({
    id: "court_assigned",
    label: "Court Assigned",
    passed: courtAssigned,
    details: courtAssigned ? match.court : "No court currently assigned",
  });
  if (!courtAssigned) {
    blockingReasons.push("Court not assigned");
  }

  // 3. Court readiness check
  const courtIsReady =
    Boolean(court) &&
    court.status !== COURT_STATUS.MAINTENANCE &&
    court.status !== COURT_STATUS.BLOCKED &&
    court.status !== COURT_STATUS.OUT_OF_SERVICE &&
    court.isActive !== false;

  const hasCourtIssue = courtChecks.some((c) => c.status === "ISSUE");
  const courtReadyPassed = courtAssigned && courtIsReady && !hasCourtIssue;

  checks.push({
    id: "court_ready",
    label: "Court Readiness Verified",
    passed: courtReadyPassed,
    details: !courtAssigned
      ? "Awaiting court assignment"
      : hasCourtIssue
      ? "Court has reported technical issues"
      : court
      ? `Court status: ${court.status}`
      : "Court record not found",
  });
  if (courtAssigned && !courtReadyPassed) {
    blockingReasons.push(
      hasCourtIssue
        ? `Court ${match.court} has unresolved technical issue`
        : `Court ${match.court} is not ready (Status: ${court?.status || "UNKNOWN"})`
    );
  }

  // 4. Umpire assigned check
  const umpireAssigned = Boolean(match && match.assignedOfficialId);
  checks.push({
    id: "umpire_assigned",
    label: "Umpire Assigned",
    passed: umpireAssigned,
    details: umpireAssigned ? "Official assigned to match" : "No match official assigned",
  });
  if (!umpireAssigned) {
    blockingReasons.push("Umpire not assigned");
  }

  // 5. Team A reporting check
  const teamAReported = Boolean(preMatch?.teamAReported);
  checks.push({
    id: "team_a_reported",
    label: "Team A Lineup Reported",
    passed: teamAReported,
    details: teamAReported ? `${match.playerA} reported` : `${match.playerA} pending reporting`,
  });
  if (!teamAReported) {
    blockingReasons.push(`Team A (${match.playerA}) has not reported`);
  }

  // 6. Team B reporting check
  const teamBReported = Boolean(preMatch?.teamBReported);
  checks.push({
    id: "team_b_reported",
    label: "Team B Lineup Reported",
    passed: teamBReported,
    details: teamBReported ? `${match.playerB} reported` : `${match.playerB} pending reporting`,
  });
  if (!teamBReported) {
    blockingReasons.push(`Team B (${match.playerB}) has not reported`);
  }

  // 7. Officials present check
  const officialsPresent = Boolean(preMatch?.officialsPresent);
  checks.push({
    id: "officials_present",
    label: "Officials Present on Court",
    passed: officialsPresent,
    details: officialsPresent ? "Officials on court" : "Awaiting officials presence confirmation",
  });
  if (!officialsPresent) {
    blockingReasons.push("Officials presence not confirmed on court");
  }

  // 8. Shuttle fee verification (configurable)
  if (shuttleFeeConfig && shuttleFeeConfig.required) {
    const feeVerified =
      preMatch?.shuttleFeeStatus === "VERIFIED" ||
      preMatch?.shuttleFeeStatus === "PAID" ||
      preMatch?.shuttleFeeStatus === "WAIVED";

    checks.push({
      id: "shuttle_fee_verified",
      label: "Shuttle Fee Verified",
      passed: Boolean(feeVerified),
      details: preMatch?.shuttleFeeStatus || "PENDING",
    });
    if (!feeVerified) {
      blockingReasons.push(`Shuttle fee verification pending (${preMatch?.shuttleFeeStatus || "PENDING"})`);
    }
  } else {
    checks.push({
      id: "shuttle_fee_verified",
      label: "Shuttlecock Clearance",
      passed: true,
      details: "Tournament Provided (Zero Shuttle Fee)",
    });
  }

  const isReady = blockingReasons.length === 0;

  return {
    isReady,
    blockingReasons,
    checks,
  };
}

/**
 * Global Technical Operations Overview
 * Real backend values only - never hardcoded.
 */
export async function getTechnicalOperationsOverview() {
  const config = await getTechOpsConfiguration();

  // Fetch all courts, matches, officials, audit activity, and communications concurrently
  const [courts, matches, officials, recentLogs, readinessChecks, preMatchRecords, recentCommunications] = await Promise.all([
    prisma.court.findMany({
      orderBy: { courtNumber: "asc" },
    }),
    prisma.match.findMany({
      include: {
        day: { select: { id: true, date: true, dayNumber: true, stage: true } },
        preMatchReporting: true,
        events: { orderBy: { timestamp: "desc" }, take: 1 },
        resultCommunications: true,
      },
      orderBy: [
        { dayId: "asc" },
        { scheduledStartTime: "asc" },
        { time: "asc" },
        { roundOrder: "asc" },
        { matchNumber: "asc" },
      ],
    }),
    prisma.user.findMany({
      where: {
        userRoles: {
          some: {
            role: {
              name: {
                in: [ROLES.MATCH_OFFICIAL, ROLES.OPERATIONS_STAFF, ROLES.TOURNAMENT_ADMIN, ROLES.SUPER_ADMIN],
              },
            },
          },
        },
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        badge: true,
        officialId: true,
        userRoles: { select: { role: { select: { name: true, displayName: true } } } },
      },
    }),
    prisma.auditLog.findMany({
      where: {
        action: {
          in: [
            "COURT_ASSIGNED",
            "COURT_REASSIGNED",
            "COURT_READY",
            "COURT_ISSUE_REPORTED",
            "COURT_STATUS_CHANGED",
            "OFFICIAL_ASSIGNED",
            "OFFICIAL_REASSIGNED",
            "PRE_MATCH_REPORTING_RECORDED",
            "FEE_VERIFIED",
            "MATCH_READY",
            "MATCH_SENT_TO_UMPIRE",
            "MATCH_STARTED",
            "MATCH_PAUSED",
            "MATCH_RESUMED",
            "MATCH_DELAYED",
            "MATCH_ENDED",
            "RESULT_SUBMITTED",
            "RESULT_CONFIRMED",
            "COURT_RELEASED",
            "RESULT_COMMUNICATION_SENT",
            "RESULT_COMMUNICATION_FAILED",
            "WALKOVER_DECLARED",
          ],
        },
      },
      orderBy: { timestamp: "desc" },
      take: 30,
    }),
    prisma.courtReadinessCheck.findMany({
      orderBy: { checkedAt: "desc" },
    }),
    prisma.preMatchReporting.findMany(),
    prisma.resultCommunication.findMany({
      orderBy: { sentAt: "desc" },
      take: 25,
      include: {
        match: {
          select: {
            id: true,
            matchNumber: true,
            publicMatchNumber: true,
            playerA: true,
            playerB: true,
            winner: true,
            court: true,
          },
        },
      },
    }),
  ]);

  // Indexing maps
  const courtMap = new Map(courts.map((c) => [c.courtNumber.toLowerCase(), c]));
  const preMatchMap = new Map(preMatchRecords.map((p) => [p.matchId, p]));
  const checksByCourt = new Map<string, any[]>();
  readinessChecks.forEach((rc) => {
    const key = rc.courtNumber.toLowerCase();
    const existing = checksByCourt.get(key) || [];
    existing.push(rc);
    checksByCourt.set(key, existing);
  });

  // Active / live match tracking by court
  const activeMatchByCourt = new Map<string, any>();
  const activeOfficialIds = new Set<string>();

  matches.forEach((m) => {
    if (m.status === MATCH_STATUS.LIVE || m.status === MATCH_STATUS.PAUSED) {
      if (m.court) activeMatchByCourt.set(m.court.toLowerCase(), m);
      if (m.assignedOfficialId) activeOfficialIds.add(m.assignedOfficialId);
    }
  });

  // Calculate Global Event Status Metrics (authoritative numbers directly from DB)
  const liveMatches = matches.filter((m) => m.status === MATCH_STATUS.LIVE);
  const pausedMatches = matches.filter((m) => m.status === MATCH_STATUS.PAUSED);
  const delayedMatches = matches.filter((m) => m.status === MATCH_STATUS.DELAYED);
  const completedMatches = matches.filter(
    (m) =>
      m.status === MATCH_STATUS.COMPLETED ||
      m.status === MATCH_STATUS.RESULT_CONFIRMED ||
      m.status === MATCH_STATUS.WALKOVER
  );
  const resultSubmittedMatches = matches.filter((m) => m.status === MATCH_STATUS.RESULT_SUBMITTED);
  const upcomingMatches = matches.filter(
    (m) =>
      m.status === MATCH_STATUS.UPCOMING ||
      m.status === MATCH_STATUS.SCHEDULED ||
      m.status === MATCH_STATUS.READY ||
      m.status === MATCH_STATUS.COURT_ASSIGNED ||
      m.status === MATCH_STATUS.READY_TO_START
  );

  const courtsInUse = courts.filter(
    (c) =>
      c.status === COURT_STATUS.LIVE ||
      c.status === COURT_STATUS.ASSIGNED ||
      c.status === COURT_STATUS.PAUSED ||
      c.status === COURT_STATUS.POST_MATCH
  );
  const courtsAvailable = courts.filter(
    (c) => c.status === COURT_STATUS.AVAILABLE || c.status === COURT_STATUS.READY
  );

  // Enriched Courts Grid
  const enrichedCourts = courts.map((c) => {
    const activeMatch = activeMatchByCourt.get(c.courtNumber.toLowerCase()) || null;
    const upcomingForCourt = matches.filter(
      (m) =>
        m.court?.toLowerCase() === c.courtNumber.toLowerCase() &&
        (m.status === MATCH_STATUS.READY ||
          m.status === MATCH_STATUS.READY_TO_START ||
          m.status === MATCH_STATUS.COURT_ASSIGNED ||
          m.status === MATCH_STATUS.SCHEDULED ||
          m.status === "UPCOMING")
    );
    const nextMatch = upcomingForCourt[0] || null;
    const cChecks = checksByCourt.get(c.courtNumber.toLowerCase()) || [];
    const hasIssue = cChecks.some((chk) => chk.status === "ISSUE");

    // Compute derived operational state
    let derivedStatus = c.status;
    if (activeMatch) {
      derivedStatus = activeMatch.status === MATCH_STATUS.PAUSED ? COURT_STATUS.PAUSED : COURT_STATUS.LIVE;
    } else if (c.status === COURT_STATUS.ASSIGNED && upcomingForCourt.length > 0) {
      derivedStatus = COURT_STATUS.ASSIGNED;
    }

    return {
      id: c.id,
      courtNumber: c.courtNumber,
      status: derivedStatus,
      rawStatus: c.status,
      venue: c.venue || config.venue,
      umpire: c.umpire || activeMatch?.assignedOfficialId || "Unassigned",
      notes: c.notes,
      isActive: c.isActive,
      hasIssue,
      activeMatch: activeMatch
        ? {
            id: activeMatch.id,
            matchNumber: activeMatch.matchNumber,
            publicMatchNumber: activeMatch.publicMatchNumber,
            category: activeMatch.category,
            playerA: activeMatch.playerA,
            institutionA: activeMatch.institutionA,
            playerB: activeMatch.playerB,
            institutionB: activeMatch.institutionB,
            scoreA: activeMatch.scoreA || "0",
            scoreB: activeMatch.scoreB || "0",
            status: activeMatch.status,
            actualStartTime: activeMatch.actualStartTime,
            interruptionReason: activeMatch.interruptionReason,
            interruptionNotes: activeMatch.interruptionNotes,
          }
        : null,
      nextMatch: nextMatch
        ? {
            id: nextMatch.id,
            matchNumber: nextMatch.matchNumber,
            publicMatchNumber: nextMatch.publicMatchNumber,
            category: nextMatch.category,
            playerA: nextMatch.playerA,
            institutionA: nextMatch.institutionA,
            playerB: nextMatch.playerB,
            institutionB: nextMatch.institutionB,
            time: nextMatch.time,
            status: nextMatch.status,
          }
        : null,
    };
  });

  // Enriched Match Queue
  const matchQueue = matches.map((m) => {
    const court = m.court ? courtMap.get(m.court.toLowerCase()) || null : null;
    const preMatch = preMatchMap.get(m.id) || null;
    const cChecks = m.court ? checksByCourt.get(m.court.toLowerCase()) || [] : [];
    const readiness = evaluateMatchReadiness({
      match: m,
      court,
      courtChecks: cChecks,
      preMatch,
      shuttleFeeConfig: config.shuttleFee,
    });

    return {
      id: m.id,
      matchNumber: m.matchNumber,
      publicMatchNumber: m.publicMatchNumber,
      pool: m.pool,
      roundStage: m.roundStage,
      roundName: m.roundName,
      roundOrder: m.roundOrder,
      category: m.category,
      time: m.time,
      dayId: m.dayId,
      day: m.day,
      court: m.court,
      courtStatus: court?.status || null,
      playerA: m.playerA,
      institutionA: m.institutionA,
      playerB: m.playerB,
      institutionB: m.institutionB,
      scoreA: m.scoreA,
      scoreB: m.scoreB,
      status: m.status,
      winner: m.winner,
      assignedOfficialId: m.assignedOfficialId,
      technicalOfficialId: m.technicalOfficialId,
      technicalOfficialName: m.technicalOfficialName,
      courtOfficials: m.courtOfficials,
      handoffStatus: m.handoffStatus,
      handoffAt: m.handoffAt,
      interruptionReason: m.interruptionReason,
      interruptionNotes: m.interruptionNotes,
      actualStartTime: m.actualStartTime,
      actualEndTime: m.actualEndTime,
      scheduledStartTime: m.scheduledStartTime,
      readiness,
      preMatch: preMatch
        ? {
            teamAReported: preMatch.teamAReported,
            teamBReported: preMatch.teamBReported,
            officialsPresent: preMatch.officialsPresent,
            courtReady: preMatch.courtReady,
            checkComplete: preMatch.checkComplete,
            shuttleFeeStatus: preMatch.shuttleFeeStatus,
            shuttleFeeAmount: preMatch.shuttleFeeAmount,
          }
        : null,
      resultCommunications: m.resultCommunications || [],
    };
  });

  // Enriched Officials List with live availability
  const enrichedOfficials = officials.map((off) => {
    const isOccupied = activeOfficialIds.has(off.id) || activeOfficialIds.has(off.email) || activeOfficialIds.has(off.officialId || "");
    const rolesList = off.userRoles.map((ur) => ur.role.name);
    const isUmpire = rolesList.includes(ROLES.MATCH_OFFICIAL);

    return {
      id: off.id,
      name: off.name,
      email: off.email,
      badge: off.badge || (isUmpire ? "Match Umpire" : "Technical Official"),
      roles: rolesList,
      isUmpire,
      isAvailable: !isOccupied,
      occupiedReason: isOccupied ? "Currently officiating a LIVE match" : null,
    };
  });

  return {
    globalStatus: {
      tournament: config.tournamentName,
      tournamentStatus: config.tournamentStatus,
      venue: config.venue,
      dates: config.dates,
      liveMatches: liveMatches.length,
      pausedMatches: pausedMatches.length,
      upcomingMatches: upcomingMatches.length,
      courtsInUse: courtsInUse.length,
      courtsAvailable: courtsAvailable.length,
      delayedMatches: delayedMatches.length,
      completedMatches: completedMatches.length,
      resultSubmittedMatches: resultSubmittedMatches.length,
      totalMatches: matches.length,
      totalCourts: courts.length,
    },
    courts: enrichedCourts,
    queue: matchQueue,
    officials: enrichedOfficials,
    recentActivity: recentLogs,
    recentCommunications: recentCommunications.map((rc) => ({
      id: rc.id,
      matchId: rc.matchId,
      matchNumber: rc.match?.publicMatchNumber || rc.match?.matchNumber || rc.matchId,
      playerA: rc.match?.playerA || "Team A",
      playerB: rc.match?.playerB || "Team B",
      winner: rc.match?.winner,
      court: rc.match?.court || "Court",
      committee: rc.committee,
      status: rc.status,
      channel: rc.channel,
      sentAt: rc.sentAt,
      errorMessage: rc.errorMessage,
    })),
    config,
    serverTime: new Date().toISOString(),
  };
}

/**
 * Detailed Match Control Telemetry
 */
export async function getMatchControlDetails(matchId: string) {
  const config = await getTechOpsConfiguration();

  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: {
      day: true,
      preMatchReporting: true,
      events: { orderBy: { timestamp: "desc" }, take: 10 },
      resultCommunications: true,
    },
  });

  if (!match) {
    throw new Error(`Match ${matchId} not found.`);
  }

  const court = match.court && match.court !== "TBD"
    ? await prisma.court.findUnique({ where: { courtNumber: match.court } })
    : null;

  const courtChecks = match.court
    ? await prisma.courtReadinessCheck.findMany({
        where: { courtNumber: match.court },
        orderBy: { checkedAt: "desc" },
      })
    : [];

  const assignedOfficial = match.assignedOfficialId
    ? await prisma.user.findFirst({
        where: {
          OR: [
            { id: match.assignedOfficialId },
            { officialId: match.assignedOfficialId },
            { email: match.assignedOfficialId },
          ],
        },
        select: { id: true, name: true, email: true, badge: true },
      })
    : null;

  const auditHistory = await prisma.auditLog.findMany({
    where: { resourceId: matchId },
    orderBy: { timestamp: "desc" },
    take: 20,
  });

  const readiness = evaluateMatchReadiness({
    match,
    court,
    courtChecks,
    preMatch: match.preMatchReporting,
    shuttleFeeConfig: config.shuttleFee,
  });

  return {
    match,
    court,
    courtChecks,
    assignedOfficial,
    readiness,
    preMatchReporting: match.preMatchReporting,
    resultCommunications: match.resultCommunications,
    auditHistory,
    config,
  };
}

/**
 * Assigns or reassigns an eligible match to a court.
 * Transactional and prevents concurrent assignment conflicts.
 */
export async function assignMatchCourt(params: {
  matchId: string;
  courtNumber: string;
  actorUserId: string;
  actorEmail: string;
}) {
  const { matchId, courtNumber, actorUserId, actorEmail } = params;

  return await prisma.$transaction(async (tx) => {
    // 1. Validate Match
    const match = await tx.match.findUnique({ where: { id: matchId } });
    if (!match) throw new Error(`Match ${matchId} not found.`);

    if (match.status === MATCH_STATUS.LIVE) {
      throw new Error(`Cannot reassign court for a LIVE match. Use operational pause or interruption first.`);
    }

    if (match.status === MATCH_STATUS.COMPLETED || match.status === MATCH_STATUS.RESULT_CONFIRMED) {
      throw new Error(`Cannot assign court to a completed match.`);
    }

    // 2. Validate Court
    const court = await tx.court.findUnique({ where: { courtNumber } });
    if (!court) throw new Error(`Court ${courtNumber} not found.`);

    if (!court.isActive) {
      throw new Error(`Court ${courtNumber} is inactive.`);
    }

    if (
      court.status === COURT_STATUS.MAINTENANCE ||
      court.status === COURT_STATUS.BLOCKED ||
      court.status === COURT_STATUS.OUT_OF_SERVICE
    ) {
      throw new Error(`Court ${courtNumber} is currently ${court.status} and cannot receive matches.`);
    }

    // Concurrency check: Ensure no active LIVE or PAUSED match occupies this court
    const occupied = await tx.match.findFirst({
      where: {
        court: courtNumber,
        status: { in: [MATCH_STATUS.LIVE, MATCH_STATUS.PAUSED] },
        id: { not: matchId },
      },
    });

    if (occupied) {
      throw new Error(`Court ${courtNumber} is occupied by active LIVE match #${occupied.matchNumber}.`);
    }

    const previousCourt = match.court;

    // 3. Update Match
    const nextStatus = MATCH_STATUS.COURT_ASSIGNED;
    const updatedMatch = await tx.match.update({
      where: { id: matchId },
      data: {
        court: courtNumber,
        status: match.status === MATCH_STATUS.UPCOMING || match.status === MATCH_STATUS.SCHEDULED ? nextStatus : match.status,
      },
    });

    // 4. Update Court Status
    const updatedCourt = await tx.court.update({
      where: { courtNumber },
      data: { status: COURT_STATUS.ASSIGNED },
    });

    // If court changed, release previous court if it has no other matches
    if (previousCourt && previousCourt !== courtNumber && previousCourt !== "TBD" && previousCourt !== "Unassigned") {
      const otherMatchOnPrev = await tx.match.findFirst({
        where: {
          court: previousCourt,
          status: { in: [MATCH_STATUS.LIVE, MATCH_STATUS.PAUSED, MATCH_STATUS.READY_TO_START] },
          id: { not: matchId },
        },
      });

      if (!otherMatchOnPrev) {
        await tx.court.updateMany({
          where: { courtNumber: previousCourt },
          data: { status: COURT_STATUS.AVAILABLE },
        });
      }
    }

    // 5. Audit Logging
    await logAuditEvent({
      actorUserId,
      actorEmail,
      action: "COURT_ASSIGNED",
      resourceType: "match",
      resourceId: match.id,
      metadata: {
        matchId: match.id,
        matchNumber: match.matchNumber,
        courtNumber,
        previousCourt,
      },
    });

    return { match: updatedMatch, court: updatedCourt };
  });
}

/**
 * Assigns or reassigns an official or umpire to a match.
 */
export async function assignMatchOfficial(params: {
  matchId: string;
  officialId: string;
  roleType?: "UMPIRE" | "TECHNICAL_OFFICIAL";
  courtOfficials?: string;
  actorUserId: string;
  actorEmail: string;
}) {
  const { matchId, officialId, roleType = "UMPIRE", courtOfficials, actorUserId, actorEmail } = params;

  return await prisma.$transaction(async (tx) => {
    const match = await tx.match.findUnique({ where: { id: matchId } });
    if (!match) throw new Error(`Match ${matchId} not found.`);

    // Validate Official
    const official = await tx.user.findFirst({
      where: {
        OR: [{ id: officialId }, { officialId }, { email: officialId }],
        isActive: true,
      },
      include: { userRoles: { include: { role: true } } },
    });

    if (!official) {
      throw new Error(`Official ${officialId} not found or inactive.`);
    }

    const hasClearance = official.userRoles.some((ur) =>
      [ROLES.MATCH_OFFICIAL, ROLES.OPERATIONS_STAFF, ROLES.TOURNAMENT_ADMIN, ROLES.SUPER_ADMIN].includes(
        ur.role.name as any
      )
    );

    if (!hasClearance) {
      throw new Error(`User ${official.name} does not hold MATCH_OFFICIAL or administrative clearance.`);
    }

    // Check if official is currently on another LIVE match
    const conflictingMatch = await tx.match.findFirst({
      where: {
        assignedOfficialId: { in: [official.id, official.officialId || "", official.email].filter(Boolean) },
        status: { in: [MATCH_STATUS.LIVE, MATCH_STATUS.PAUSED] },
        id: { not: matchId },
      },
    });

    if (conflictingMatch) {
      throw new Error(
        `Official ${official.name} is currently umpiring LIVE match #${conflictingMatch.matchNumber} on ${conflictingMatch.court}.`
      );
    }

    const updateData: any = {};
    if (roleType === "UMPIRE") {
      updateData.assignedOfficialId = official.id;
      if (match.court && match.court !== "TBD") {
        await tx.court.updateMany({
          where: { courtNumber: match.court },
          data: { umpire: official.name },
        });
      }
    } else {
      updateData.technicalOfficialId = official.id;
      updateData.technicalOfficialName = official.name;
    }

    if (courtOfficials !== undefined) {
      updateData.courtOfficials = courtOfficials;
    }

    const updatedMatch = await tx.match.update({
      where: { id: matchId },
      data: updateData,
    });

    await logAuditEvent({
      actorUserId,
      actorEmail,
      action: "OFFICIAL_ASSIGNED",
      resourceType: "match",
      resourceId: match.id,
      metadata: {
        matchId: match.id,
        matchNumber: match.matchNumber,
        officialId: official.id,
        officialName: official.name,
        roleType,
        courtOfficials,
      },
    });

    return updatedMatch;
  });
}

/**
 * Updates Pre-Match Reporting for a match.
 */
export async function updatePreMatchReporting(params: {
  matchId: string;
  teamAReported?: boolean;
  teamBReported?: boolean;
  officialsPresent?: boolean;
  courtReady?: boolean;
  shuttleFeeStatus?: string;
  shuttleFeeAmount?: number;
  shuttleFeeReceipt?: string;
  notes?: string;
  actorUserId: string;
  actorEmail: string;
}) {
  const {
    matchId,
    teamAReported,
    teamBReported,
    officialsPresent,
    courtReady,
    shuttleFeeStatus,
    shuttleFeeAmount,
    shuttleFeeReceipt,
    notes,
    actorUserId,
    actorEmail,
  } = params;

  const match = await prisma.match.findUnique({ where: { id: matchId } });
  if (!match) throw new Error(`Match ${matchId} not found.`);

  const existing = await prisma.preMatchReporting.findUnique({ where: { matchId } });

  const updated = await prisma.preMatchReporting.upsert({
    where: { matchId },
    update: {
      ...(teamAReported !== undefined ? { teamAReported } : {}),
      ...(teamBReported !== undefined ? { teamBReported } : {}),
      ...(officialsPresent !== undefined ? { officialsPresent } : {}),
      ...(courtReady !== undefined ? { courtReady } : {}),
      ...(shuttleFeeStatus !== undefined ? { shuttleFeeStatus } : {}),
      ...(shuttleFeeAmount !== undefined ? { shuttleFeeAmount } : {}),
      ...(shuttleFeeReceipt !== undefined ? { shuttleFeeReceipt } : {}),
      ...(notes !== undefined ? { notes } : {}),
      reportedBy: actorEmail,
      reportedAt: new Date(),
    },
    create: {
      matchId,
      teamAReported: teamAReported ?? false,
      teamBReported: teamBReported ?? false,
      officialsPresent: officialsPresent ?? false,
      courtReady: courtReady ?? false,
      checkComplete: false,
      shuttleFeeStatus: shuttleFeeStatus ?? "NOT_REQUIRED",
      shuttleFeeAmount: shuttleFeeAmount ?? 0,
      shuttleFeeReceipt: shuttleFeeReceipt ?? null,
      reportedBy: actorEmail,
      reportedAt: new Date(),
      notes: notes ?? null,
    },
  });

  await logAuditEvent({
    actorUserId,
    actorEmail,
    action: "PRE_MATCH_REPORTING_RECORDED",
    resourceType: "match",
    resourceId: matchId,
    metadata: {
      matchNumber: match.matchNumber,
      teamAReported: updated.teamAReported,
      teamBReported: updated.teamBReported,
      officialsPresent: updated.officialsPresent,
      courtReady: updated.courtReady,
      shuttleFeeStatus: updated.shuttleFeeStatus,
    },
  });

  return updated;
}

/**
 * Updates or records a Court Readiness check.
 */
export async function updateCourtReadinessCheck(params: {
  courtNumber: string;
  matchId?: string;
  checkItem: string;
  checkName: string;
  status: "READY" | "PENDING" | "ISSUE";
  notes?: string;
  actorUserId: string;
  actorEmail: string;
}) {
  const { courtNumber, matchId, checkItem, checkName, status, notes, actorUserId, actorEmail } = params;

  const court = await prisma.court.findUnique({ where: { courtNumber } });
  if (!court) throw new Error(`Court ${courtNumber} not found.`);

  // Find existing check for this item & court
  const existing = await prisma.courtReadinessCheck.findFirst({
    where: { courtNumber, checkItem },
  });

  let checkRecord;
  if (existing) {
    checkRecord = await prisma.courtReadinessCheck.update({
      where: { id: existing.id },
      data: {
        status,
        notes: notes ?? existing.notes,
        actorEmail,
        checkedAt: new Date(),
        matchId: matchId ?? existing.matchId,
      },
    });
  } else {
    checkRecord = await prisma.courtReadinessCheck.create({
      data: {
        courtNumber,
        matchId: matchId ?? null,
        checkItem,
        checkName,
        status,
        notes: notes ?? null,
        actorEmail,
        checkedAt: new Date(),
      },
    });
  }

  // If issue reported, update court status or notes
  if (status === "ISSUE") {
    await prisma.court.update({
      where: { courtNumber },
      data: { notes: `Readiness Issue [${checkName}]: ${notes || "Check failed"}` },
    });
  }

  await logAuditEvent({
    actorUserId,
    actorEmail,
    action: status === "READY" ? "COURT_READY" : "COURT_ISSUE_REPORTED",
    resourceType: "court",
    resourceId: courtNumber,
    metadata: {
      courtNumber,
      checkItem,
      checkName,
      status,
      notes,
    },
  });

  return checkRecord;
}

/**
 * Sends Match to Umpire.
 * Backend verifies ALL technical readiness criteria.
 * On success, match becomes READY_TO_START and appears in assigned umpire's /official dashboard.
 */
export async function sendMatchToUmpire(params: {
  matchId: string;
  actorUserId: string;
  actorEmail: string;
}) {
  const { matchId, actorUserId, actorEmail } = params;
  const config = await getTechOpsConfiguration();

  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: { preMatchReporting: true },
  });

  if (!match) throw new Error(`Match ${matchId} not found.`);

  if (match.status === MATCH_STATUS.LIVE) {
    throw new Error(`Match is already LIVE.`);
  }

  if (match.status === MATCH_STATUS.COMPLETED || match.status === MATCH_STATUS.RESULT_CONFIRMED) {
    throw new Error(`Cannot send a completed match to umpire.`);
  }

  const court = match.court && match.court !== "TBD"
    ? await prisma.court.findUnique({ where: { courtNumber: match.court } })
    : null;

  const courtChecks = match.court
    ? await prisma.courtReadinessCheck.findMany({ where: { courtNumber: match.court } })
    : [];

  // Authoritative server-side readiness verification
  const readiness = evaluateMatchReadiness({
    match,
    court,
    courtChecks,
    preMatch: match.preMatchReporting,
    shuttleFeeConfig: config.shuttleFee,
  });

  if (!readiness.isReady) {
    const errorMsg = `Cannot send match to umpire. Unmet requirements: \n• ${readiness.blockingReasons.join("\n• ")}`;
    throw new Error(errorMsg);
  }

  // Atomic state handoff
  const result = await prisma.$transaction(async (tx) => {
    const updatedMatch = await tx.match.update({
      where: { id: matchId },
      data: {
        status: MATCH_STATUS.READY_TO_START,
        handoffStatus: "SENT_TO_UMPIRE",
        handoffAt: new Date(),
        handoffBy: actorEmail,
      },
    });

    if (match.court && match.court !== "TBD") {
      await tx.court.updateMany({
        where: { courtNumber: match.court },
        data: { status: COURT_STATUS.READY },
      });
    }

    return updatedMatch;
  });

  await logAuditEvent({
    actorUserId,
    actorEmail,
    action: "MATCH_SENT_TO_UMPIRE",
    resourceType: "match",
    resourceId: match.id,
    metadata: {
      matchId: match.id,
      matchNumber: match.matchNumber,
      court: match.court,
      assignedOfficialId: match.assignedOfficialId,
      handoffAt: new Date().toISOString(),
      readinessSnapshot: readiness.checks,
    },
  });

  return {
    success: true,
    message: `Match #${match.matchNumber} successfully sent to Umpire. Match is READY_TO_START for court-side activation.`,
    match: result,
  };
}

/**
 * Confirms a match result submitted by an umpire.
 * Advances bracket fixtures and communicates confirmed results to Accommodation, Finance, and Transportation committees.
 */
export async function confirmMatchResult(params: {
  matchId: string;
  actorUserId: string;
  actorEmail: string;
}) {
  const { matchId, actorUserId, actorEmail } = params;

  const match = await prisma.match.findUnique({
    where: { id: matchId },
  });

  if (!match) throw new Error(`Match ${matchId} not found.`);

  if (!match.winner) {
    throw new Error(`Cannot confirm result: Winner has not been determined or submitted.`);
  }

  const winner = match.winner as "PLAYER_A" | "PLAYER_B";
  const winningPlayer = winner === "PLAYER_A" ? match.playerA : match.playerB;
  const winningInstitution = winner === "PLAYER_A" ? match.institutionA : match.institutionB;
  const losingPlayer = winner === "PLAYER_A" ? match.playerB : match.playerA;
  const losingInstitution = winner === "PLAYER_A" ? match.institutionB : match.institutionA;

  // 1. Transaction: Update match status, court status, fixture progression
  const result = await prisma.$transaction(async (tx) => {
    const updatedMatch = await tx.match.update({
      where: { id: matchId },
      data: {
        status: MATCH_STATUS.COMPLETED,
        actualEndTime: match.actualEndTime || new Date(),
      },
    });

    // Set court to POST_MATCH for cleanup/turnaround
    if (match.court && match.court !== "TBD") {
      await tx.court.updateMany({
        where: { courtNumber: match.court },
        data: { status: COURT_STATUS.POST_MATCH },
      });
    }

    // Advance downstream knockout dependencies
    await resolveKnockoutDependencies(tx, {
      id: updatedMatch.id,
      matchNumber: updatedMatch.matchNumber,
      winner: updatedMatch.winner,
      playerA: updatedMatch.playerA,
      institutionA: updatedMatch.institutionA,
      playerB: updatedMatch.playerB,
      institutionB: updatedMatch.institutionB,
    });

    return updatedMatch;
  });

  // Also call fixture progression service for M001-M100 bracket template linkages
  try {
    await resolveMatchProgression({
      matchId: match.id,
      winner,
      scoreA: match.scoreA || undefined,
      scoreB: match.scoreB || undefined,
      actorEmail,
    });
  } catch (err) {
    console.warn("Bracket progression note:", err);
  }

  // 2. Publish Domain Event & Result Communication to the 3 Authoritative Committees
  const eventPayload = {
    tournamentId: "SZWBT-2026",
    matchId: match.id,
    matchNumber: match.matchNumber,
    publicMatchNumber: match.publicMatchNumber,
    category: match.category,
    court: match.court,
    team1: match.playerA,
    institution1: match.institutionA,
    team2: match.playerB,
    institution2: match.institutionB,
    winner,
    winningPlayer,
    winningInstitution,
    losingPlayer,
    losingInstitution,
    score: `${match.scoreA || "0"} - ${match.scoreB || "0"}`,
    timestamp: new Date().toISOString(),
  };

  const committees = ["ACCOMMODATION", "FINANCE", "TRANSPORTATION"];
  const communicationResults = [];

  for (const committee of committees) {
    try {
      const commRecord = await prisma.resultCommunication.upsert({
        where: {
          matchId_committee: {
            matchId: match.id,
            committee,
          },
        },
        update: {
          status: "SENT",
          payload: JSON.stringify(eventPayload),
          sentAt: new Date(),
          errorMessage: null,
        },
        create: {
          matchId: match.id,
          committee,
          status: "SENT",
          channel: "IN_APP_EVENT",
          payload: JSON.stringify(eventPayload),
          sentAt: new Date(),
        },
      });
      communicationResults.push(commRecord);

      // Create official staff notification bulletin
      const audience =
        committee === "ACCOMMODATION"
          ? "ACCOMMODATION_STAFF"
          : committee === "FINANCE"
          ? "FINANCE_STAFF"
          : "TRANSPORT_STAFF";

      await prisma.announcement.create({
        data: {
          title: `[OFFICIAL RESULT] ${match.matchNumber}: ${winningPlayer} (${winningInstitution}) Won`,
          content: `Match #${match.matchNumber} (${match.category}) confirmed on ${match.court}. Winner: ${winningPlayer} [${winningInstitution}], Loser: ${losingPlayer} [${losingInstitution}]. Score: ${match.scoreA} - ${match.scoreB}. Synchronized with ${committee} Committee.`,
          category: "MATCH",
          targetAudience: audience,
          priority: "NORMAL",
          channels: "IN_APP",
          status: "PUBLISHED",
          isPublished: true,
          authorEmail: actorEmail,
          deliveryStatus: "DELIVERED",
          relatedResource: `match:${match.id}`,
        },
      });

      await logAuditEvent({
        actorUserId,
        actorEmail,
        action: "RESULT_COMMUNICATION_SENT",
        resourceType: "committee_communication",
        resourceId: `${match.id}:${committee}`,
        metadata: {
          matchId: match.id,
          matchNumber: match.matchNumber,
          committee,
          status: "SENT",
        },
      });
    } catch (commErr: any) {
      console.error(`Failed to dispatch communication to ${committee}:`, commErr);
      await prisma.resultCommunication.upsert({
        where: {
          matchId_committee: { matchId: match.id, committee },
        },
        update: {
          status: "FAILED",
          errorMessage: commErr.message,
        },
        create: {
          matchId: match.id,
          committee,
          status: "FAILED",
          channel: "IN_APP_EVENT",
          payload: JSON.stringify(eventPayload),
          errorMessage: commErr.message,
        },
      });

      await logAuditEvent({
        actorUserId,
        actorEmail,
        action: "RESULT_COMMUNICATION_FAILED",
        resourceType: "committee_communication",
        resourceId: `${match.id}:${committee}`,
        metadata: {
          matchId: match.id,
          matchNumber: match.matchNumber,
          committee,
          error: commErr.message,
        },
      });
    }
  }

  // 3. Final Audit Log
  await logAuditEvent({
    actorUserId,
    actorEmail,
    action: "RESULT_CONFIRMED",
    resourceType: "match",
    resourceId: match.id,
    metadata: {
      matchId: match.id,
      matchNumber: match.matchNumber,
      winner,
      winningPlayer,
      score: `${match.scoreA} - ${match.scoreB}`,
      communicatedCommittees: committees,
    },
  });

  return {
    success: true,
    message: `Result confirmed for Match #${match.matchNumber}. Winner: ${winningPlayer}. Bracket progressed and notifications dispatched to Accommodation, Finance, and Transportation committees.`,
    match: result,
    communications: communicationResults,
  };
}

/**
 * Releases a court after match completion and cleanup.
 * Validates that no active match or scoring session remains on the court.
 */
export async function releaseCourt(params: {
  courtNumber: string;
  notes?: string;
  actorUserId: string;
  actorEmail: string;
}) {
  const { courtNumber, notes, actorUserId, actorEmail } = params;

  return await prisma.$transaction(async (tx) => {
    const court = await tx.court.findUnique({ where: { courtNumber } });
    if (!court) throw new Error(`Court ${courtNumber} not found.`);

    // Verify no active LIVE or PAUSED matches on this court
    const activeMatch = await tx.match.findFirst({
      where: {
        court: courtNumber,
        status: { in: [MATCH_STATUS.LIVE, MATCH_STATUS.PAUSED] },
      },
    });

    if (activeMatch) {
      throw new Error(
        `Cannot release ${courtNumber}: Match #${activeMatch.matchNumber} is currently ${activeMatch.status}. End match first.`
      );
    }

    const updatedCourt = await tx.court.update({
      where: { courtNumber },
      data: {
        status: COURT_STATUS.AVAILABLE,
        umpire: null,
        notes: notes ?? null,
      },
    });

    await logAuditEvent({
      actorUserId,
      actorEmail,
      action: "COURT_RELEASED",
      resourceType: "court",
      resourceId: courtNumber,
      metadata: {
        courtNumber,
        newStatus: COURT_STATUS.AVAILABLE,
        notes,
      },
    });

    return updatedCourt;
  });
}

/**
 * Coordinates match interruptions (Pause, Resume, Delay)
 */
export async function coordinateMatchInterruption(params: {
  matchId: string;
  action: "PAUSE" | "RESUME" | "DELAY";
  reason: string;
  notes?: string;
  actorUserId: string;
  actorEmail: string;
}) {
  const { matchId, action, reason, notes, actorUserId, actorEmail } = params;

  const match = await prisma.match.findUnique({ where: { id: matchId } });
  if (!match) throw new Error(`Match ${matchId} not found.`);

  return await prisma.$transaction(async (tx) => {
    let nextMatchStatus = match.status;
    let nextCourtStatus: string = COURT_STATUS.LIVE;
    let auditAction = "MATCH_INTERRUPTED";

    if (action === "PAUSE") {
      if (match.status !== MATCH_STATUS.LIVE) {
        throw new Error(`Only a LIVE match can be paused.`);
      }
      nextMatchStatus = MATCH_STATUS.PAUSED;
      nextCourtStatus = COURT_STATUS.PAUSED;
      auditAction = "MATCH_PAUSED";
    } else if (action === "RESUME") {
      if (match.status !== MATCH_STATUS.PAUSED) {
        throw new Error(`Only a PAUSED match can be resumed.`);
      }
      nextMatchStatus = MATCH_STATUS.LIVE;
      nextCourtStatus = COURT_STATUS.LIVE;
      auditAction = "MATCH_RESUMED";
    } else if (action === "DELAY") {
      nextMatchStatus = MATCH_STATUS.DELAYED;
      nextCourtStatus = COURT_STATUS.DELAYED;
      auditAction = "MATCH_DELAYED";
    }

    const updatedMatch = await tx.match.update({
      where: { id: matchId },
      data: {
        status: nextMatchStatus,
        interruptionReason: action === "RESUME" ? null : reason,
        interruptionNotes: action === "RESUME" ? null : notes ?? null,
      },
    });

    if (match.court && match.court !== "TBD") {
      await tx.court.updateMany({
        where: { courtNumber: match.court },
        data: { status: nextCourtStatus },
      });
    }

    await logAuditEvent({
      actorUserId,
      actorEmail,
      action: auditAction,
      resourceType: "match",
      resourceId: match.id,
      metadata: {
        matchId: match.id,
        matchNumber: match.matchNumber,
        court: match.court,
        reason,
        notes,
      },
    });

    return updatedMatch;
  });
}
