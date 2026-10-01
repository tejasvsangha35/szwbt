import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/rbac/guard";
import { prisma } from "@/lib/prisma";
import { UserContext } from "@/lib/rbac/service";
import { logAuditEvent } from "@/lib/rbac/audit";

/**
 * POST /api/accommodation/allocations/checkin
 * Toggles or updates occupant physical check-in status on active bed allocations.
 * Supports:
 * 1. Single bed / occupant check-in: { allocationId } or { bedId }
 * 2. Entire team bulk check-in at once: { teamId }
 * 3. Entire room bulk check-in at once: { roomId }
 * 4. Multi-selected occupants check-in at once: { allocationIds: string[] }
 * Atomic transaction with audit trail logging.
 */
export const POST = withAuth(
  async (req: NextRequest, context: UserContext) => {
    try {
      const body = await req.json();
      const {
        allocationId,
        bedId,
        teamId,
        roomId,
        allocationIds,
        isCheckedIn = true,
        checkInDate,
      } = body;

      const isBulk = Boolean(teamId || roomId || (Array.isArray(allocationIds) && allocationIds.length > 0));

      if (!allocationId && !bedId && !isBulk) {
        return NextResponse.json(
          {
            success: false,
            error: "Either allocationId, bedId, teamId, roomId, or allocationIds is required.",
          },
          { status: 400 }
        );
      }

      const checkInTimestamp = checkInDate ? new Date(checkInDate) : new Date();

      // ─────────────────────────────────────────────────────────────
      // BULK CHECK-IN (WHOLE TEAM, ROOM, OR SELECTED BATCH)
      // ─────────────────────────────────────────────────────────────
      if (isBulk) {
        const whereClause: any = { status: "ACTIVE" };

        if (teamId) {
          whereClause.teamId = teamId;
        } else if (roomId) {
          whereClause.bed = { roomId };
        } else if (Array.isArray(allocationIds) && allocationIds.length > 0) {
          whereClause.id = { in: allocationIds };
        }

        const activeAllocations = await prisma.accommodationAllocation.findMany({
          where: whereClause,
          include: {
            participant: true,
            team: true,
            bed: {
              include: {
                room: {
                  include: { hostel: true },
                },
              },
            },
          },
        });

        if (activeAllocations.length === 0) {
          return NextResponse.json(
            { success: false, error: "No active occupant allocations found matching the bulk criteria." },
            { status: 404 }
          );
        }

        // Execute batch update in atomic transaction
        const updatedIds: string[] = [];
        await prisma.$transaction(async (tx) => {
          for (const alloc of activeAllocations) {
            const currentAllocatedBy = alloc.allocatedBy || "";
            const baseAllocatedBy = currentAllocatedBy.replace(/\|CHECKED_IN:[^|]+(\|BY:[^|]+)?/g, "").trim();

            let newAllocatedBy = baseAllocatedBy;
            if (isCheckedIn) {
              newAllocatedBy = `${baseAllocatedBy || "desk"}|CHECKED_IN:${checkInTimestamp.toISOString()}|BY:${context.user.email}`;
            }

            await tx.accommodationAllocation.update({
              where: { id: alloc.id },
              data: {
                checkInDate: checkInTimestamp,
                allocatedBy: newAllocatedBy,
              },
            });
            updatedIds.push(alloc.id);
          }
        });

        const teamName = activeAllocations[0]?.team?.name || activeAllocations[0]?.participant?.institution || "Team";

        // Log Bulk Audit Event
        await logAuditEvent({
          actorUserId: context.user.id,
          actorEmail: context.user.email,
          action: isCheckedIn ? "ACCOMMODATION_BULK_CHECKIN" : "ACCOMMODATION_BULK_CHECKIN_REVERT",
          resourceType: "accommodation",
          metadata: {
            teamId,
            roomId,
            teamName,
            count: updatedIds.length,
            allocationIds: updatedIds,
            isCheckedIn,
            checkInTime: checkInTimestamp.toISOString(),
          },
        });

        return NextResponse.json({
          success: true,
          count: updatedIds.length,
          allocationIds: updatedIds,
          isCheckedIn: Boolean(isCheckedIn),
          checkInDate: checkInTimestamp.toISOString(),
          message: isCheckedIn
            ? `Successfully checked in all ${updatedIds.length} members of ${teamName} at once!`
            : `Reverted check-in status for ${updatedIds.length} members of ${teamName}.`,
        });
      }

      // ─────────────────────────────────────────────────────────────
      // SINGLE OCCUPANT CHECK-IN
      // ─────────────────────────────────────────────────────────────
      let allocation = null;
      if (allocationId) {
        allocation = await prisma.accommodationAllocation.findUnique({
          where: { id: allocationId },
          include: {
            participant: true,
            bed: {
              include: {
                room: {
                  include: { hostel: true },
                },
              },
            },
          },
        });
      } else if (bedId) {
        allocation = await prisma.accommodationAllocation.findFirst({
          where: { bedId, status: "ACTIVE" },
          include: {
            participant: true,
            bed: {
              include: {
                room: {
                  include: { hostel: true },
                },
              },
            },
          },
        });
      }

      if (!allocation || allocation.status !== "ACTIVE") {
        return NextResponse.json(
          { success: false, error: "Active allocation record not found for this bed." },
          { status: 404 }
        );
      }

      const currentAllocatedBy = allocation.allocatedBy || "";
      const baseAllocatedBy = currentAllocatedBy.replace(/\|CHECKED_IN:[^|]+(\|BY:[^|]+)?/g, "").trim();

      let newAllocatedBy = baseAllocatedBy;
      if (isCheckedIn) {
        newAllocatedBy = `${baseAllocatedBy || "desk"}|CHECKED_IN:${checkInTimestamp.toISOString()}|BY:${context.user.email}`;
      }

      const updated = await prisma.accommodationAllocation.update({
        where: { id: allocation.id },
        data: {
          checkInDate: checkInTimestamp,
          allocatedBy: newAllocatedBy,
        },
      });

      await logAuditEvent({
        actorUserId: context.user.id,
        actorEmail: context.user.email,
        action: isCheckedIn ? "ACCOMMODATION_CHECKIN" : "ACCOMMODATION_CHECKIN_REVERT",
        resourceType: "accommodation",
        resourceId: allocation.id,
        metadata: {
          participantId: allocation.participantId,
          participantName: allocation.participant?.name,
          bedId: allocation.bedId,
          bedNumber: allocation.bed.bedNumber,
          roomNumber: allocation.bed.room.roomNumber,
          hostelName: allocation.bed.room.hostel.name,
          isCheckedIn,
          checkInTime: checkInTimestamp.toISOString(),
        },
      });

      return NextResponse.json({
        success: true,
        allocationId: updated.id,
        isCheckedIn: Boolean(isCheckedIn),
        checkInDate: checkInTimestamp.toISOString(),
        message: isCheckedIn
          ? `Check-in recorded for ${allocation.participant?.name || "Occupant"}.`
          : `Check-in status reverted to pending for ${allocation.participant?.name || "Occupant"}.`,
      });
    } catch (err: any) {
      console.error("[CHECKIN_ERROR]", err);
      return NextResponse.json(
        { success: false, error: err.message || "Failed to update check-in status." },
        { status: 500 }
      );
    }
  }
);
