import { prisma } from "@/lib/prisma";

export type OperationalStatus = "READY" | "ATTENTION" | "LIVE" | "COMPLETED";

export interface SpocTeamCard {
  id: string;
  teamCode: string;
  name: string;
  institution: string;
  state: string;
  stateCode?: string | null;
  city?: string | null;
  assignedSpocName?: string | null;
  assignedSpocContact?: string | null;
  assignedSpocId?: string | null;
  team_code?: string;
  state_code?: string | null;
  state_name?: string;
  university_name?: string;
  coach_manager_name?: string | null;
  coach_manager_contact?: string | null;
  assigned_spoc_name?: string | null;
  assigned_spoc_contact?: string | null;
  assigned_spoc_id?: string | null;
  managerName: string | null;
  managerPhone: string | null;
  captainName: string | null;
  captainPhone: string | null;
  registrationStatus: string;
  operationalStatus: OperationalStatus;
  statusReason: string;
  transportStatus: string;
  transportDetail?: {
    tripCode?: string;
    vehicleNo?: string;
    driverName?: string;
    driverPhone?: string;
    pickupPoint?: string;
    scheduledTime?: string;
    status?: string;
  };
  accommodationStatus: string;
  accommodationDetail?: {
    hostelName?: string;
    roomNumber?: string;
    bedNumber?: string;
    checkInDate?: string;
    status?: string;
  };
  nextMatch?: {
    id: string;
    matchNumber: string;
    time: string;
    court: string;
    opponent: string;
    category: string;
    status: string;
  } | null;
  liveMatch?: {
    id: string;
    matchNumber: string;
    court: string;
    time: string;
    opponent: string;
    scoreTeam: string;
    scoreOpponent: string;
    isTeamA: boolean;
    status: string;
    leaderText: string;
  } | null;
  completedMatch?: {
    id: string;
    matchNumber: string;
    court: string;
    opponent: string;
    scoreFinal: string;
    winner: string;
    resultText: "WIN" | "LOSS" | "TIE";
  } | null;
  contacts: {
    managerName?: string;
    managerPhone?: string;
    captainName?: string;
    captainPhone?: string;
    coachName?: string;
    coachPhone?: string;
  };
}

export interface EscalationAuthority {
  department: string;
  title: string;
  contactName: string;
  email: string;
  phone: string;
  description: string;
  badge: string;
}

export const OFFICIAL_ESCALATION_AUTHORITIES: EscalationAuthority[] = [
  {
    department: "REGISTRATION",
    title: "Registration Desk Operations",
    contactName: "Registration Admin Desk",
    email: "register@szwbt2026.edu",
    phone: "+91 94812 00101",
    description: "Player accreditation, ID verification, roster approvals, QR passes, and eligibility queries.",
    badge: "REGISTRATION",
  },
  {
    department: "TRANSPORT",
    title: "Fleet Transport Manager",
    contactName: "Fleet Control Dispatcher",
    email: "transport@szwbt2026.edu",
    phone: "+91 94812 00102",
    description: "Airport/Railway pickups, delayed shuttle fleet, vehicle allocations, and transit issues.",
    badge: "FLEET CONTROL",
  },
  {
    department: "ACCOMMODATION",
    title: "Hostel Logistics Officer",
    contactName: "Residence Logistics Desk",
    email: "hostel@szwbt2026.edu",
    phone: "+91 94812 00103",
    description: "Shalmala & Vindhya Hostels, room keys, bed allocations, check-ins, and hostel facility concerns.",
    badge: "HOSTEL DESK",
  },
  {
    department: "MATCH & COURT",
    title: "Court / Match Official",
    contactName: "Technical Officials Table",
    email: "umpire@szwbt2026.edu",
    phone: "+91 94812 00104",
    description: "Court schedules, fixture calls, warm-up reporting, umpire concerns, and score discrepancies.",
    badge: "COURT TECH",
  },
  {
    department: "EMERGENCY & EVENT CONTROL",
    title: "Event Control Command",
    contactName: "Secretariat Emergency Response",
    email: "admin@szwbt2026.edu",
    phone: "+91 94812 99999",
    description: "Medical first-aid emergencies, safety alerts, immediate distress dispatch, and executive escalation.",
    badge: "EMERGENCY SOS",
  },
];

/**
 * Resolves operational status for a team based on real database records.
 * Possible operational statuses:
 * - LIVE: Currently in active court match
 * - ATTENTION: Transport delayed, accommodation pending, team not arrived, or match approaching
 * - COMPLETED: All matches / tied events concluded
 * - READY: Arrived, accommodation settled, ready for upcoming fixtures
 */
export function computeTeamOperationalStatus(
  team: {
    status: string;
    members?: any[];
    bedAllocations?: any[];
    transportBookings?: any[];
  },
  matches: any[]
): { status: OperationalStatus; reason: string } {
  // 1. Check for LIVE match
  const liveMatch = matches.find((m) => m.status === "LIVE");
  if (liveMatch) {
    return {
      status: "LIVE",
      reason: `Currently playing live on ${liveMatch.court || "court"}`,
    };
  }

  // 2. Check registration status
  const isRegistered = team.status === "COMPLETED" && (!team.members || team.members.length > 0);
  if (!isRegistered) {
    return {
      status: "ATTENTION",
      reason: team.status === "PENDING_VERIFICATION"
        ? "Contingent registration pending document verification."
        : "Contingent registration incomplete. Awaiting roster submission.",
    };
  }

  // 3. Check transport status
  let transportArrived = false;
  let transportDelayed = false;
  let hasTransport = false;

  if (team.transportBookings && team.transportBookings.length > 0) {
    hasTransport = true;
    for (const b of team.transportBookings) {
      if (b.boardingStatus === "BOARDED" || b.trip?.status === "ARRIVED") {
        transportArrived = true;
      } else if (b.trip?.status === "DELAYED") {
        transportDelayed = true;
      }
    }
  }

  // 4. Check accommodation status
  const allBeds = team.bedAllocations || [];
  const activeBeds = allBeds.filter((ba: any) => ba.status === "ACTIVE");
  const checkedInBeds = activeBeds.filter((ba: any) =>
    Boolean(ba.allocatedBy?.includes("CHECKED_IN"))
  );
  const hasAccommodation = activeBeds.length > 0;
  const isCheckedIn = activeBeds.length > 0 && checkedInBeds.length === activeBeds.length;

  if (transportDelayed) {
    return {
      status: "ATTENTION",
      reason: "University transport shuttle is delayed. Coordinate with Fleet Control.",
    };
  }

  if (hasTransport && !transportArrived) {
    return {
      status: "ATTENTION",
      reason: "Contingent has not yet arrived on campus.",
    };
  }

  if (!hasAccommodation) {
    return {
      status: "ATTENTION",
      reason: "Hostel room allocation pending.",
    };
  }

  if (!isCheckedIn) {
    return {
      status: "ATTENTION",
      reason: "Hostel room check-in pending at registration desk.",
    };
  }

  // 5. Check matches completion
  const upcomingMatches = matches.filter(
    (m) => m.status === "UPCOMING" || m.status === "READY" || m.status === "SCHEDULED"
  );
  const completedMatches = matches.filter((m) => m.status === "COMPLETED");

  if (completedMatches.length > 0 && upcomingMatches.length === 0) {
    return {
      status: "COMPLETED",
      reason: "All scheduled matches and ties completed.",
    };
  }

  return {
    status: "READY",
    reason: "Team checked-in, accommodation confirmed, ready for match fixtures.",
  };
}

/**
 * Builds formatted team card for SPOC view
 */
export function formatSpocTeamCard(team: any, allMatchesForTeam: any[]): SpocTeamCard {
  // Matches involving this team
  const sortedMatches = [...allMatchesForTeam].sort((a, b) => {
    if (a.status === "LIVE" && b.status !== "LIVE") return -1;
    if (b.status === "LIVE" && a.status !== "LIVE") return 1;
    return 0;
  });

  const live = sortedMatches.find((m) => m.status === "LIVE");
  const upcoming = sortedMatches.find(
    (m) => m.status === "UPCOMING" || m.status === "READY" || m.status === "SCHEDULED"
  );
  const completed = sortedMatches
    .filter((m) => m.status === "COMPLETED")
    .slice(-1)[0];

  const { status: operationalStatus, reason: statusReason } =
    computeTeamOperationalStatus(team, allMatchesForTeam);

  // Parse transport
  const primaryBooking = team.transportBookings?.[0];
  let transportStatus = "NOT SCHEDULED";
  if (primaryBooking) {
    if (primaryBooking.boardingStatus === "BOARDED" || primaryBooking.trip?.status === "ARRIVED") {
      transportStatus = "ARRIVED";
    } else if (primaryBooking.trip?.status === "DELAYED") {
      transportStatus = "DELAYED";
    } else if (primaryBooking.trip?.status === "BOARDING" || primaryBooking.trip?.status === "IN_TRANSIT") {
      transportStatus = "IN-TRANSIT";
    } else {
      transportStatus = "SCHEDULED";
    }
  }

  // Parse accommodation
  const allBeds = team.bedAllocations || [];
  const activeBeds = allBeds.filter((ba: any) => ba.status === "ACTIVE");
  const checkedInBeds = activeBeds.filter((ba: any) =>
    Boolean(ba.allocatedBy?.includes("CHECKED_IN"))
  );

  let accommodationStatus = "NOT ALLOCATED";
  if (allBeds.length === 0) {
    accommodationStatus = "NOT ALLOCATED";
  } else if (checkedInBeds.length > 0 && checkedInBeds.length === activeBeds.length) {
    accommodationStatus = "CHECKED-IN";
  } else if (checkedInBeds.length > 0) {
    accommodationStatus = "PARTIALLY CHECKED-IN";
  } else if (activeBeds.length > 0) {
    accommodationStatus = "PENDING CHECK-IN";
  } else {
    accommodationStatus = "VACATED";
  }

  // Format Live match
  let liveMatchData = null;
  if (live) {
    const isTeamA =
      live.teamAId === team.id ||
      (live.institutionA && live.institutionA.toLowerCase().includes(team.institution.toLowerCase()));
    const scoreTeam = isTeamA ? live.scoreA || "0" : live.scoreB || "0";
    const scoreOpponent = isTeamA ? live.scoreB || "0" : live.scoreA || "0";
    const opponent = isTeamA ? live.institutionB || live.playerB : live.institutionA || live.playerA;

    // Leader text
    let leaderText = "MATCH TIED";
    const numTeam = parseInt(scoreTeam.split(",").pop() || "0", 10);
    const numOpp = parseInt(scoreOpponent.split(",").pop() || "0", 10);
    if (numTeam > numOpp) {
      leaderText = `${team.name.split(" ")[0]} LEADING (${numTeam} - ${numOpp})`;
    } else if (numOpp > numTeam) {
      leaderText = `OPPONENT LEADING (${numOpp} - ${numTeam})`;
    }

    liveMatchData = {
      id: live.id,
      matchNumber: live.publicMatchNumber || live.matchNumber || "M-LIVE",
      court: live.court,
      time: live.time,
      opponent,
      scoreTeam,
      scoreOpponent,
      isTeamA,
      status: "LIVE",
      leaderText,
    };
  }

  // Format Next Match
  let nextMatchData = null;
  if (upcoming) {
    const isTeamA =
      upcoming.teamAId === team.id ||
      (upcoming.institutionA && upcoming.institutionA.toLowerCase().includes(team.institution.toLowerCase()));
    const opponent = isTeamA
      ? upcoming.institutionB || upcoming.playerB
      : upcoming.institutionA || upcoming.playerA;

    nextMatchData = {
      id: upcoming.id,
      matchNumber: upcoming.publicMatchNumber || upcoming.matchNumber || "M-UPCOMING",
      time: upcoming.time,
      court: upcoming.court,
      opponent,
      category: upcoming.category,
      status: upcoming.status,
    };
  }

  // Format Completed match
  let completedMatchData = null;
  if (completed) {
    const isTeamA =
      completed.teamAId === team.id ||
      (completed.institutionA && completed.institutionA.toLowerCase().includes(team.institution.toLowerCase()));
    const opponent = isTeamA
      ? completed.institutionB || completed.playerB
      : completed.institutionA || completed.playerA;

    let resultText: "WIN" | "LOSS" | "TIE" = "TIE";
    if (completed.winner === "PLAYER_A") {
      resultText = isTeamA ? "WIN" : "LOSS";
    } else if (completed.winner === "PLAYER_B") {
      resultText = isTeamA ? "LOSS" : "WIN";
    }

    completedMatchData = {
      id: completed.id,
      matchNumber: completed.publicMatchNumber || completed.matchNumber,
      court: completed.court,
      opponent,
      scoreFinal: `${completed.scoreA || "0"} - ${completed.scoreB || "0"}`,
      winner: completed.winner || "TBD",
      resultText,
    };
  }

  return {
    id: team.id,
    teamCode: team.teamCode,
    name: team.name,
    institution: team.institution,
    state: team.state,
    stateCode: team.stateCode || null,
    city: team.city || null,
    assignedSpocName: team.spocAssignment?.spoc?.name || null,
    assignedSpocContact: team.spocAssignment?.spoc?.phone || null,
    assignedSpocId: team.spocAssignment?.spocId || null,
    team_code: team.teamCode,
    state_code: team.stateCode || null,
    state_name: team.state,
    university_name: team.institution,
    coach_manager_name: team.managerName || "Not Provided",
    coach_manager_contact: team.managerPhone || null,
    assigned_spoc_name: team.spocAssignment?.spoc?.name || null,
    assigned_spoc_contact: team.spocAssignment?.spoc?.phone || null,
    assigned_spoc_id: team.spocAssignment?.spocId || null,
    managerName: team.managerName,
    managerPhone: team.managerPhone,
    captainName: team.captainName,
    captainPhone: team.captainPhone,
    registrationStatus: (team.members?.length > 0 && team.status === "COMPLETED")
      ? "COMPLETED"
      : team.status === "PENDING_VERIFICATION"
      ? "PENDING_VERIFICATION"
      : "PENDING",
    operationalStatus,
    statusReason,
    transportStatus,
    transportDetail: primaryBooking
      ? {
          tripCode: primaryBooking.trip?.tripCode,
          vehicleNo: primaryBooking.trip?.vehicleNo || primaryBooking.trip?.vehicle?.registrationNumber,
          driverName: primaryBooking.trip?.driverName || primaryBooking.trip?.driver?.name,
          driverPhone: primaryBooking.trip?.driverPhone || primaryBooking.trip?.driver?.phone,
          pickupPoint: primaryBooking.pickupPoint,
          scheduledTime: primaryBooking.trip?.scheduledTime,
          status: primaryBooking.trip?.status,
        }
      : undefined,
    accommodationStatus,
    accommodationDetail: activeBeds.length > 0
      ? {
          hostelName: activeBeds[0].bed?.room?.hostel?.name,
          roomNumber: activeBeds[0].bed?.room?.roomNumber,
          bedNumber: activeBeds[0].bed?.bedNumber,
          checkInDate: activeBeds[0].checkInDate ? new Date(activeBeds[0].checkInDate).toISOString() : undefined,
          status: checkedInBeds.length === activeBeds.length ? "CHECKED-IN" : "ALLOCATED",
        }
      : undefined,
    nextMatch: nextMatchData,
    liveMatch: liveMatchData,
    completedMatch: completedMatchData,
    contacts: {
      managerName: team.managerName || undefined,
      managerPhone: team.managerPhone || undefined,
      captainName: team.captainName || undefined,
      captainPhone: team.captainPhone || undefined,
    },
  };
}

/**
 * Loads the SPOC overview data: SPOC user + assigned teams + telemetry
 */
export async function getSpocOverviewData(spocUserId: string) {
  const user = await prisma.user.findUnique({
    where: { id: spocUserId },
    select: { id: true, name: true, email: true, badge: true, phone: true },
  });

  if (!user) return null;

  // Fetch assignments with deep relational records
  const assignments = await prisma.spocTeamAssignment.findMany({
    where: { spocId: spocUserId },
    include: {
      team: {
        include: {
          spocAssignment: {
            include: {
              spoc: {
                select: { id: true, name: true, phone: true, email: true },
              },
            },
          },
          members: {
            include: { participant: true },
          },
          bedAllocations: {
            include: {
              bed: {
                include: {
                  room: {
                    include: { hostel: true },
                  },
                },
              },
            },
          },
          transportBookings: {
            include: {
              trip: {
                include: {
                  vehicle: true,
                  driver: true,
                  route: true,
                },
              },
            },
          },
        },
      },
    },
    orderBy: { assignedAt: "asc" },
  });

  const teams = assignments.map((a) => a.team);
  const teamIds = teams.map((t) => t.id);

  // Fetch matches involving any of these teams
  const matches = await prisma.match.findMany({
    where: {
      OR: [
        { teamAId: { in: teamIds } },
        { teamBId: { in: teamIds } },
        ...teams.map((t) => ({ institutionA: { contains: t.institution, mode: "insensitive" as const } })),
        ...teams.map((t) => ({ institutionB: { contains: t.institution, mode: "insensitive" as const } })),
      ],
    },
    orderBy: [{ status: "asc" }, { time: "asc" }],
  });

  // Map each team to its formatted card
  const teamCards = teams.map((team) => {
    const teamMatches = matches.filter(
      (m) =>
        m.teamAId === team.id ||
        m.teamBId === team.id ||
        (m.institutionA && m.institutionA.toLowerCase().includes(team.institution.toLowerCase())) ||
        (m.institutionB && m.institutionB.toLowerCase().includes(team.institution.toLowerCase()))
    );
    return formatSpocTeamCard(team, teamMatches);
  });

  const liveMatchesCount = teamCards.filter((t) => t.operationalStatus === "LIVE").length;
  const attentionCount = teamCards.filter((t) => t.operationalStatus === "ATTENTION").length;
  const readyCount = teamCards.filter((t) => t.operationalStatus === "READY").length;
  const completedCount = teamCards.filter((t) => t.operationalStatus === "COMPLETED").length;

  return {
    spoc: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      badge: user.badge || "STUDENT POINT OF CONTACT",
      role: "Student Point of Contact",
    },
    assignedCount: teams.length,
    isComplete: teams.length > 0,
    statusText: `${teams.length} Teams Assigned`,
    summary: {
      liveMatchesCount,
      attentionCount,
      readyCount,
      completedCount,
    },
    teams: teamCards,
    escalationAuthorities: OFFICIAL_ESCALATION_AUTHORITIES,
  };
}
