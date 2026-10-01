import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/rbac/guard";
import { prisma } from "@/lib/prisma";
import { PERMISSIONS } from "@/lib/rbac/permissions";
import { UserContext } from "@/lib/rbac/service";

/**
 * GET /api/accommodation/rooms
 * Returns rooms and their EXACT 5 BEDS with live occupancy and active allocation details.
 */
export async function GET(req: NextRequest) {
  try {
    // Optional session check: Allow registration desk portal (/register) to read room and bed topography
    await authenticateRequest(req);
      const { searchParams } = new URL(req.url);
      const hostelParam = searchParams.get("hostelId");
      const floor = searchParams.get("floor");
      const statusFilter = searchParams.get("status");

      const whereClause: any = {};

      if (hostelParam && hostelParam !== "ALL") {
        whereClause.hostelId = hostelParam;
      }

      if (floor && floor !== "ALL") {
        whereClause.floorNumber = { equals: floor, mode: "insensitive" };
      }

      const rooms = await prisma.room.findMany({
        where: whereClause,
        include: {
          hostel: true,
          beds: {
            orderBy: { bedNumber: "asc" },
            include: {
              allocations: {
                where: { status: "ACTIVE" },
                include: {
                  participant: true,
                  team: true,
                },
              },
            },
          },
        },
        orderBy: [{ floorNumber: "asc" }, { roomNumber: "asc" }],
      });

      const formattedRooms = rooms.map((room) => {
        const beds = room.beds.map((bed) => {
          const activeAlloc = bed.allocations[0];
          const isCheckedIn = Boolean(activeAlloc?.allocatedBy?.includes("CHECKED_IN"));
          let checkInIso = activeAlloc ? activeAlloc.checkInDate.toISOString() : null;
          if (isCheckedIn && activeAlloc?.allocatedBy) {
            const match = activeAlloc.allocatedBy.match(/CHECKED_IN:([^|]+)/);
            if (match && match[1]) {
              checkInIso = match[1];
            }
          }

          return {
            id: bed.id,
            bedNumber: bed.bedNumber,
            status: bed.status, // "AVAILABLE", "OCCUPIED", "RESERVED", "MAINTENANCE"
            occupant: activeAlloc?.participant
              ? {
                  allocationId: activeAlloc.id,
                  id: activeAlloc.participant.id,
                  name: activeAlloc.participant.name,
                  playerId: activeAlloc.participant.playerId,
                  gender: activeAlloc.participant.gender || "FEMALE",
                  institution: activeAlloc.participant.institution,
                  state: activeAlloc.participant.state,
                  role: activeAlloc.participant.category || "PLAYER",
                  teamName: activeAlloc.team?.name || activeAlloc.participant.institution,
                  allocatedBy: activeAlloc.allocatedBy,
                  checkInDate: checkInIso,
                  isCheckedIn,
                }
              : null,
          };
        });

        const occupiedCount = beds.filter((b) => b.status === "OCCUPIED").length;
        const availableCount = beds.filter((b) => b.status === "AVAILABLE").length;
        const reservedCount = beds.filter((b) => b.status === "RESERVED").length;
        const maintenanceCount = beds.filter((b) => b.status === "MAINTENANCE").length;

        return {
          id: room.id,
          hostelId: room.hostelId,
          hostelName: room.hostel?.name || (room.hostelId === "SHALMALA" ? "Shalmala Hostel" : "Vindhya Boys Hostel"),
          roomNumber: room.roomNumber,
          floorNumber: room.floorNumber,
          capacity: room.capacity, // STRICT 5 BEDS
          occupiedCount,
          availableCount,
          reservedCount,
          maintenanceCount,
          isFull: occupiedCount >= room.capacity,
          beds,
        };
      });

      // Filter by bed status if specified
      let result = formattedRooms;
      if (statusFilter && statusFilter !== "ALL") {
        result = formattedRooms.filter((r) => r.beds.some((b) => b.status === statusFilter));
      }

      return NextResponse.json({
        success: true,
        hostelId: hostelParam || "ALL",
        count: result.length,
        rooms: result,
      });
    } catch (err: any) {
      console.error("[ACCOMMODATION_ROOMS_ERROR]", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
