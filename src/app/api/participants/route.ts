import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/rbac/guard";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/participants
 * Returns registered participants for registration desk and official rosters.
 */
export async function GET(req: NextRequest) {
  try {
    // Optional session check: Allow registration desk portal (/register) to read participant rosters
    await authenticateRequest(req);

    const participants = await prisma.participant.findMany({
      include: {
        institutionRef: {
          select: { id: true, name: true, state: true, institutionCode: true },
        },
        teamMemberships: {
          include: {
            team: {
              select: { id: true, teamCode: true, name: true, institution: true, state: true },
            },
          },
        },
        qrPasses: {
          where: { status: "ACTIVE" },
          take: 1,
        },
        bedAllocations: {
          where: { status: "ACTIVE" },
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
          },
          take: 1,
        },
        documents: {
          select: { id: true, type: true, status: true, fileName: true, filePath: true },
        },
        paymentLedgers: {
          take: 1,
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const mapped = participants.map((p) => {
      const activeBed = p.bedAllocations[0]?.bed;
      const activeRoom = activeBed?.room;
      const activeHostel = activeRoom?.hostel;
      const activeFloor = activeRoom?.floor;
      const activeQr = p.qrPasses[0]?.token || null;
      const role = p.teamMemberships[0]?.role || (p.category === "Contingent Management" || p.category === "OFFICIAL" ? "MANAGER" : "ATHLETE");
      const isManager = role === "MANAGER" || p.category === "Contingent Management";

      // For athletes: documents must be uploaded and all verified
      // For manager: documents are optional; if approved / has active pass or documents verified, status is VERIFIED
      const docStatus =
        p.documents.length === 0
          ? (isManager && (activeQr || p.status === "APPROVED") ? "VERIFIED" : "DOCUMENTS_PENDING")
          : p.documents.every((d) => d.status === "VERIFIED")
          ? "VERIFIED"
          : "PENDING";

      return {
        id: p.id,
        playerId: p.playerId,
        name: p.name,
        email: p.email,
        phone: p.phone,
        state: p.state,
        institution: p.institution,
        institutionId: p.institutionId,
        category: p.category,
        gender: p.gender,
        role,
        teamMemberships: p.teamMemberships,
        status: p.status,
        photoUrl: p.photoUrl,
        hostel: activeHostel?.name || p.hostel || "Shalmala Hostel",
        floor: activeFloor?.name || activeRoom?.floorNumber || "Floor 01",
        room: activeRoom?.roomNumber || p.room || "—",
        bed: activeBed?.bedNumber || "—",
        bedAllocations: p.bedAllocations,
        payments: p.paymentLedgers?.map((l) => ({ amount: l.amountPaid, method: "CASH" })),
        amountPaid: p.paymentLedgers?.[0]?.amountPaid || 500,
        paymentMethod: "CASH",
        qrToken: (docStatus === "VERIFIED" && activeQr) ? activeQr : null,
        documentsStatus: docStatus,
        documents: p.documents,
        createdAt: p.createdAt.toISOString(),
      };
    });

    return NextResponse.json({
      success: true,
      count: mapped.length,
      participants: mapped,
    });
  } catch (error: any) {
    console.error("[GET /api/participants] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch participants.", details: error.message },
      { status: 500 }
    );
  }
}
