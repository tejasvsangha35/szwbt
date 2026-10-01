import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/rbac/guard";
import { verifyOperationsClearance } from "@/lib/operations/auth";
import { prisma } from "@/lib/prisma";
import { getTechnicalOperationsOverview } from "@/lib/operations/techOpsService";

export async function GET(req: NextRequest) {
  try {
    const authResult = await authenticateRequest(req);
    if (!authResult.authenticated) {
      return authResult.response;
    }

    const opsAuth = verifyOperationsClearance(authResult.context);
    if (opsAuth.errorResponse) {
      return opsAuth.errorResponse;
    }

    // 1. Fetch Technical Operations telemetry (Authoritative tournament execution)
    const techOpsOverview = await getTechnicalOperationsOverview();

    // 2. Concurrently fetch legacy/facility operational telemetry for backwards compatibility
    const [
      activeIncidents,
      criticalIncidentsCount,
      tasks,
      venueAreas,
      volunteers,
      activeShifts,
      announcements,
      totalParticipants,
      approvedParticipants,
      pendingParticipants,
      allocatedBeds,
      totalBeds,
      transportTrips,
      transportPassengers,
    ] = await Promise.all([
      prisma.volunteerIssue.findMany({
        where: {
          status: { in: ["OPEN", "ACKNOWLEDGED", "ASSIGNED", "IN_PROGRESS", "ESCALATED"] },
        },
        include: {
          user: { select: { id: true, name: true, email: true, badge: true } },
        },
        orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
      }),
      prisma.volunteerIssue.count({
        where: {
          status: { in: ["OPEN", "ACKNOWLEDGED", "ASSIGNED", "IN_PROGRESS", "ESCALATED"] },
          severity: { in: ["CRITICAL", "HIGH"] },
        },
      }),
      prisma.volunteerTask.findMany({
        where: {
          status: { in: ["ASSIGNED", "IN_PROGRESS", "BLOCKED"] },
        },
        include: {
          user: { select: { id: true, name: true, email: true, badge: true } },
          assignment: true,
        },
        orderBy: [{ priority: "desc" }, { createdAt: "asc" }],
      }),
      prisma.venueArea.findMany({
        orderBy: { name: "asc" },
      }),
      prisma.user.findMany({
        where: {
          userRoles: { some: { role: { name: "VOLUNTEER" } } },
          isActive: true,
        },
        select: {
          id: true,
          name: true,
          email: true,
          badge: true,
          volunteerShifts: {
            orderBy: { createdAt: "desc" },
            take: 1,
          },
          volunteerAssignments: {
            where: { status: { in: ["ACTIVE", "ASSIGNED"] } },
            take: 1,
          },
        },
      }),
      prisma.volunteerShift.count({
        where: { status: "ON_SHIFT" },
      }),
      prisma.announcement.findMany({
        where: {
          isPublished: true,
          targetAudience: { in: ["ALL", "VOLUNTEERS", "OPERATIONS", "OFFICIALS"] },
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      prisma.participant.count(),
      prisma.participant.count({ where: { status: "APPROVED" } }),
      prisma.participant.count({ where: { status: "PENDING" } }),
      prisma.accommodationAllocation.count({ where: { status: "ACTIVE" } }),
      prisma.bed.count(),
      prisma.transportTrip.count(),
      prisma.transportPassenger.count(),
    ]);

    const completedTasksCount = await prisma.volunteerTask.count({
      where: { status: "COMPLETED" },
    });

    const venueHasIssues = venueAreas.some((va) => va.status === "ISSUE");
    const venueHasAttention = venueAreas.some((va) => va.status === "ATTENTION");
    const venueStatus = venueHasIssues ? "ISSUE" : venueHasAttention ? "ATTENTION" : "READY";

    const regStatus = pendingParticipants > 0 ? "ACTIVE" : "READY";
    const transportStatus = transportTrips > 0 ? "IN SERVICE" : "STANDBY";
    const volunteerStatus = activeShifts > 0 ? "ACTIVE" : "STANDBY";

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      operationsState: criticalIncidentsCount > 0 ? "ALERT" : "NORMAL",
      // Authoritative Technical Operations Data
      tournament: techOpsOverview.globalStatus.tournament,
      tournamentStatus: techOpsOverview.globalStatus.tournamentStatus,
      globalStatus: {
        tournament: techOpsOverview.globalStatus.tournament,
        tournamentStatus: techOpsOverview.globalStatus.tournamentStatus,
        venue: venueStatus,
        registration: regStatus,
        accommodation: allocatedBeds > 0 ? "ALLOCATED" : "READY",
        transport: transportStatus,
        matchOperations: techOpsOverview.globalStatus.liveMatches > 0 ? "LIVE" : "READY",
        volunteers: volunteerStatus,
        communications: announcements.length > 0 ? "ACTIVE" : "IDLE",
        liveMatches: techOpsOverview.globalStatus.liveMatches,
        pausedMatches: techOpsOverview.globalStatus.pausedMatches,
        upcomingMatches: techOpsOverview.globalStatus.upcomingMatches,
        courtsInUse: techOpsOverview.globalStatus.courtsInUse,
        courtsAvailable: techOpsOverview.globalStatus.courtsAvailable,
        delayedMatches: techOpsOverview.globalStatus.delayedMatches,
        completedMatches: techOpsOverview.globalStatus.completedMatches,
      },
      metrics: {
        activeIncidentsCount: activeIncidents.length,
        criticalIncidentsCount,
        activeTasksCount: tasks.length,
        completedTasksCount,
        activeVolunteersCount: activeShifts,
        totalConfiguredVolunteers: volunteers.length,
        totalParticipants,
        approvedParticipants,
        pendingParticipants,
        allocatedBeds,
        totalBeds,
        transportTrips,
        transportPassengers,
        liveMatchesCount: techOpsOverview.globalStatus.liveMatches,
        courtsInUse: techOpsOverview.globalStatus.courtsInUse,
        courtsAvailable: techOpsOverview.globalStatus.courtsAvailable,
      },
      courts: techOpsOverview.courts,
      queue: techOpsOverview.queue,
      officials: techOpsOverview.officials,
      recentActivity: techOpsOverview.recentActivity,
      recentCommunications: techOpsOverview.recentCommunications,
      config: techOpsOverview.config,
      // Backwards-compatibility
      incidents: activeIncidents,
      tasks,
      venueAreas,
      volunteers,
      announcements,
      activeMatches: techOpsOverview.courts.filter((c) => c.activeMatch).map((c) => c.activeMatch),
      upcomingMatches: techOpsOverview.queue.filter((m) => m.status === "UPCOMING" || m.status === "READY" || m.status === "READY_TO_START"),
    });
  } catch (error: any) {
    console.error("Operations telemetry API error:", error);
    return NextResponse.json(
      { success: false, error: "Internal operational telemetry failure: " + error.message },
      { status: 500 }
    );
  }
}
