import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/rbac/guard";
import { verifySpocClearance } from "@/lib/spoc/auth";
import { prisma } from "@/lib/prisma";
import { computeTeamOperationalStatus, formatSpocTeamCard, OFFICIAL_ESCALATION_AUTHORITIES } from "@/lib/spoc/service";

export async function GET(
  req: NextRequest,
  segmentData: { params: Promise<{ id: string }> }
) {
  try {
    const params = await segmentData.params;
    const teamId = params.id;

    if (!teamId) {
      return NextResponse.json(
        { success: false, error: "Validation failed: Team ID is required." },
        { status: 400 }
      );
    }

    // 1. Authenticate Request
    const authResult = await authenticateRequest(req);
    if (!authResult.authenticated) {
      return authResult.response;
    }

    // 2. Authoritative SPOC Clearance & Strict Data Isolation Enforcement
    const spocAuth = await verifySpocClearance(authResult.context, teamId);
    if (spocAuth.errorResponse) {
      return spocAuth.errorResponse;
    }

    // 3. Query Deep Team Entity
    const team = await prisma.team.findFirst({
      where: {
        OR: [{ id: teamId }, { teamCode: teamId }],
      },
      include: {
        spocAssignment: {
          include: {
            spoc: {
              select: { id: true, name: true, phone: true, email: true },
            },
          },
        },
        members: {
          include: {
            participant: {
              include: {
                documents: {
                  select: { id: true, type: true, status: true, fileName: true },
                },
              },
            },
          },
          orderBy: { role: "asc" },
        },
        bedAllocations: {
          include: {
            bed: {
              include: {
                room: {
                  include: {
                    hostel: true,
                    floor: true,
                  },
                },
              },
            },
            participant: {
              select: { id: true, name: true, phone: true },
            },
          },
          orderBy: { createdAt: "asc" },
        },
        transportBookings: {
          include: {
            trip: {
              include: {
                vehicle: true,
                driver: true,
                route: {
                  include: { stops: true },
                },
              },
            },
            participant: {
              select: { id: true, name: true, phone: true },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!team) {
      return NextResponse.json(
        { success: false, error: "404 Not Found: Requested team record does not exist." },
        { status: 404 }
      );
    }

    // 4. Query Matches for this Team
    const matches = await prisma.match.findMany({
      where: {
        OR: [
          { teamAId: team.id },
          { teamBId: team.id },
          { institutionA: { contains: team.institution, mode: "insensitive" } },
          { institutionB: { contains: team.institution, mode: "insensitive" } },
        ],
      },
      orderBy: [{ status: "asc" }, { time: "asc" }],
    });

    // 5. Structure data into the 5 authoritative tabs
    const teamCard = formatSpocTeamCard(team, matches);

    // TAB 1: REGISTRATION
    const isTeamRegistered = team.members && team.members.length > 0;
    const computedRegStatus = isTeamRegistered
      ? team.status
      : "PENDING_REGISTRATION";

    const registration = {
      teamId: team.id,
      teamCode: team.teamCode,
      name: team.name,
      institution: team.institution,
      state: team.state,
      status: computedRegStatus,
      isRegistered: isTeamRegistered,
      managerName: team.managerName,
      managerPhone: team.managerPhone,
      captainName: team.captainName,
      captainPhone: team.captainPhone,
      totalPlayers: team.members.length,
      players: team.members.map((m) => ({
        id: m.participant.id,
        name: m.participant.name,
        role: m.role,
        phone: m.participant.phone,
        email: m.participant.email,
        status: m.participant.status,
        chestNumber: (m.participant as any).chestNumber || m.participant.id.slice(-4),
        verified: m.participant.status === "APPROVED",
        documentsCount: m.participant.documents?.length || 0,
      })),
    };

    // TAB 2: TRANSPORT
    const hasTransport = team.transportBookings && team.transportBookings.length > 0;
    const transport = {
      status: teamCard.transportStatus,
      hasBookings: hasTransport,
      bookings: team.transportBookings.map((b) => ({
        id: b.id,
        passengerName: b.participant?.name || "Contingent Member",
        pickupPoint: b.pickupPoint || b.trip?.pickupPoint || "Pending Dispatch",
        dropPoint: b.dropPoint || b.trip?.dropPoint || "KLE Tech Main Arena",
        boardingStatus: b.boardingStatus,
        boardedAt: b.boardedAt,
        tripCode: b.trip?.tripCode,
        routeName: b.trip?.routeName || b.trip?.route?.name || "Shuttle Route",
        scheduledDate: b.trip?.scheduledDate,
        scheduledTime: b.trip?.scheduledTime,
        estimatedArrival: b.trip?.estimatedArrival,
        delayMinutes: b.trip?.delayMinutes || 0,
        tripStatus: b.trip?.status || "SCHEDULED",
        vehicleNo: b.trip?.vehicleNo || b.trip?.vehicle?.registrationNumber || "Unassigned",
        vehicleType: b.trip?.vehicle?.type || "BUS",
        driverName: b.trip?.driverName || b.trip?.driver?.name || "Unassigned",
        driverPhone: b.trip?.driverPhone || b.trip?.driver?.phone || "Contact via Transport Desk",
      })),
      summary: hasTransport ? teamCard.transportDetail || null : null,
    };

    // TAB 3: ACCOMMODATION
    const hasAllocations = team.bedAllocations && team.bedAllocations.length > 0;
    const activeAllocations = team.bedAllocations?.filter((ba: any) => ba.status === "ACTIVE") || [];
    const checkedInAllocations = activeAllocations.filter((ba: any) =>
      Boolean(ba.allocatedBy?.includes("CHECKED_IN"))
    );

    let checkInStatus = "NOT ALLOCATED";
    let accommodationStatus = "NOT ALLOCATED";

    if (!hasAllocations || activeAllocations.length === 0) {
      checkInStatus = "NOT ALLOCATED";
      accommodationStatus = "NOT ALLOCATED";
    } else if (checkedInAllocations.length === activeAllocations.length) {
      checkInStatus = "CHECKED-IN";
      accommodationStatus = "CHECKED-IN";
    } else if (checkedInAllocations.length > 0) {
      checkInStatus = `PARTIAL (${checkedInAllocations.length}/${activeAllocations.length})`;
      accommodationStatus = "PARTIALLY_CHECKED_IN";
    } else {
      checkInStatus = "PENDING CHECK-IN";
      accommodationStatus = "ALLOCATED";
    }

    const accommodation = {
      status: accommodationStatus,
      checkInStatus,
      totalAllocated: activeAllocations.length,
      checkedInCount: checkedInAllocations.length,
      allocations: team.bedAllocations.map((ba) => ({
        id: ba.id,
        participantName: ba.participant?.name || "Contingent Athlete",
        hostelName: ba.bed?.room?.hostel?.name || "Not Allocated",
        roomNumber: ba.bed?.room?.roomNumber || "—",
        bedNumber: ba.bed?.bedNumber || "—",
        floor: ba.bed?.room?.floor?.name || ba.bed?.room?.floorNumber || "Ground Floor",
        checkInDate: ba.checkInDate,
        checkOutDate: ba.checkOutDate,
        status: Boolean(ba.allocatedBy?.includes("CHECKED_IN")) ? "CHECKED-IN" : "PENDING CHECK-IN",
      })),
      summary: activeAllocations.length > 0 ? {
        hostelName: activeAllocations[0].bed?.room?.hostel?.name || "Assigned Hostel",
        roomNumber: activeAllocations[0].bed?.room?.roomNumber || "Assigned Room",
        status: checkInStatus,
      } : null,
    };

    // TAB 4: MATCHES
    const formattedMatches = matches.map((m) => {
      const isTeamA =
        m.teamAId === team.id ||
        (m.institutionA && m.institutionA.toLowerCase().includes(team.institution.toLowerCase()));
      const opponent = isTeamA
        ? m.institutionB || m.playerB || "Opponent"
        : m.institutionA || m.playerA || "Opponent";
      const scoreTeam = isTeamA ? m.scoreA || "0" : m.scoreB || "0";
      const scoreOpponent = isTeamA ? m.scoreB || "0" : m.scoreA || "0";

      let resultText: "WIN" | "LOSS" | "TIE" | "PENDING" = "PENDING";
      if (m.status === "COMPLETED") {
        if (m.winner === "PLAYER_A") resultText = isTeamA ? "WIN" : "LOSS";
        else if (m.winner === "PLAYER_B") resultText = isTeamA ? "LOSS" : "WIN";
        else resultText = "TIE";
      }

      return {
        id: m.id,
        matchNumber: m.publicMatchNumber || m.matchNumber,
        category: m.category,
        court: m.court,
        time: m.time,
        status: m.status,
        opponent,
        scoreTeam,
        scoreOpponent,
        scoreDisplay: `${scoreTeam} - ${scoreOpponent}`,
        winner: m.winner,
        resultText,
      };
    });

    const liveMatches = formattedMatches.filter((m) => m.status === "LIVE");
    const upcomingMatches = formattedMatches.filter(
      (m) => m.status === "UPCOMING" || m.status === "READY" || m.status === "SCHEDULED"
    );
    const completedMatches = formattedMatches.filter((m) => m.status === "COMPLETED");

    // TAB 5: CONTACT (FULL CONTINGENT DIRECTORY)
    const contact = {
      managerName: team.managerName || "Not Provided",
      managerPhone: team.managerPhone || null,
      captainName: team.captainName || "Not Provided",
      captainPhone: team.captainPhone || null,
      institution: team.institution,
      state: team.state,
      members: team.members.map((m) => ({
        id: m.participant.id,
        name: m.participant.name,
        role: m.role || "ATHLETE",
        phone: m.participant.phone || null,
        email: m.participant.email || null,
        status: m.participant.status,
      })),
    };

    return NextResponse.json({
      success: true,
      team: teamCard,
      // Database structure fields (Section 10)
      team_code: team.teamCode,
      state_code: team.stateCode || null,
      state_name: team.state,
      university_name: team.institution,
      city: team.city || null,
      coach_manager_name: team.managerName || "Not Provided",
      coach_manager_contact: team.managerPhone || null,
      assigned_spoc_id: team.spocAssignment?.spocId || null,
      assigned_spoc_name: team.spocAssignment?.spoc?.name || null,
      assigned_spoc_contact: team.spocAssignment?.spoc?.phone || null,
      tabs: {
        registration,
        transport,
        accommodation,
        matches: {
          live: liveMatches,
          upcoming: upcomingMatches,
          completed: completedMatches,
          total: formattedMatches.length,
        },
        contact,
      },
      escalationAuthorities: OFFICIAL_ESCALATION_AUTHORITIES,
    });
  } catch (error: any) {
    console.error("SPOC team detail API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load team details." },
      { status: 500 }
    );
  }
}

// Strictly block any mutation attempts by SPOC (read-only role)
export async function POST() {
  return NextResponse.json(
    { success: false, error: "403 Forbidden: SPOC role is strictly read-only and cannot create team records." },
    { status: 403 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { success: false, error: "403 Forbidden: SPOC role is strictly read-only and cannot modify official team records." },
    { status: 403 }
  );
}

export async function PATCH() {
  return NextResponse.json(
    { success: false, error: "403 Forbidden: SPOC role is strictly read-only and cannot modify official team records." },
    { status: 403 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { success: false, error: "403 Forbidden: SPOC role is strictly read-only and cannot delete team records." },
    { status: 403 }
  );
}
