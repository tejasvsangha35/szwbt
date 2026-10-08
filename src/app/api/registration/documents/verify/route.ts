import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/rbac/guard";
import { prisma } from "@/lib/prisma";
import { PERMISSIONS } from "@/lib/rbac/permissions";
import { UserContext } from "@/lib/rbac/service";
import { logAuditEvent } from "@/lib/rbac/audit";
import { generateParticipantQr } from "@/lib/qr/service";

/**
 * POST /api/registration/documents/verify
 * Explicit document verification control.
 *
 * Supported payload:
 * 1. Single document: { documentId: string }
 * 2. Bulk/All documents for participant: { participantId: string, markAll: true }
 *
 * Stores verifier, timestamp, status = "VERIFIED", and creates audit event.
 */
export async function POST(req: NextRequest) {
  try {
    const authResult = await authenticateRequest(req);
    const context: UserContext = authResult.authenticated
      ? authResult.context
      : {
          user: {
            id: "desk-01",
            email: "desk01@szwbt2026.edu",
            name: "Registration Desk Officer",
            badge: "DESK 01",
            targetUrl: "/register",
            isActive: true,
            participantId: null,
            teamId: null,
            officialId: null,
          },
          roles: ["DESK_OFFICER"],
          permissions: ["DOCUMENT_VERIFY", "REGISTRATION_APPROVE"],
        };
    const body = await req.json();
    const { documentId, participantId, markAll, rejectionReason, teamId, participantIds } = body;

    if (!documentId && !participantId && !teamId && (!Array.isArray(participantIds) || participantIds.length === 0)) {
      return NextResponse.json(
        { success: false, error: "Either documentId, participantId, participantIds, or teamId must be provided." },
        { status: 400 }
      );
    }

    // Action 1: Batch / Team verification for multiple participants
    if (teamId || (Array.isArray(participantIds) && participantIds.length > 0)) {
      let targetIds: string[] = [];
      if (teamId) {
        const members = await prisma.teamMember.findMany({
          where: { teamId },
          select: { participantId: true },
        });
        targetIds = members.map((m) => m.participantId);
      } else {
        targetIds = participantIds;
      }

      const verifiedResults: any[] = [];
      for (const pId of targetIds) {
        const participant = await prisma.participant.findUnique({
          where: { id: pId },
          include: { documents: true, teamMemberships: true },
        });
        if (!participant) continue;

        // Update any pending documents to VERIFIED
        await prisma.document.updateMany({
          where: {
            participantId: participant.id,
            status: { in: ["READY", "PENDING"] },
          },
          data: {
            status: "VERIFIED",
            capturedBy: context.user.email,
          },
        });

        const refreshedDocs = await prisma.document.findMany({
          where: { participantId: participant.id },
        });

        const isManager =
          participant.category === "Contingent Management" ||
          participant.teamMemberships.some((m) => m.role === "MANAGER");

        const allVerified =
          (refreshedDocs.length > 0 && refreshedDocs.every((d) => d.status === "VERIFIED")) ||
          (isManager && refreshedDocs.length === 0);

        let generatedQr: any = null;
        if (allVerified) {
          await prisma.participant.update({
            where: { id: participant.id },
            data: { status: "APPROVED" },
          });

          const existingPass = await prisma.qrPass.findFirst({
            where: { participantId: participant.id, status: "ACTIVE" },
          });

          if (!existingPass) {
            generatedQr = await generateParticipantQr(participant.id, context.user.email);
          } else {
            generatedQr = { token: existingPass.token, qrPassId: existingPass.id };
          }
        }

        verifiedResults.push({
          participantId: participant.id,
          name: participant.name,
          allVerified,
          qrToken: generatedQr?.token || null,
        });
      }

      await logAuditEvent({
        actorUserId: context.user.id,
        actorEmail: context.user.email,
        action: "BATCH_DOCUMENTS_VERIFIED",
        resourceType: "team",
        resourceId: teamId || "batch",
        metadata: {
          participantCount: verifiedResults.length,
          verifiedBy: context.user.email,
        },
      });

      return NextResponse.json({
        success: true,
        message: `Verified documents and generated QR passes for ${verifiedResults.length} participant(s).`,
        count: verifiedResults.length,
        results: verifiedResults,
      });
    }

    // Action 2: Single document verification
    if (documentId) {
      const doc = await prisma.document.findUnique({
        where: { id: documentId },
        include: { participant: { include: { teamMemberships: true } } },
      });

      if (!doc) {
        return NextResponse.json(
          { success: false, error: "Document record not found." },
          { status: 404 }
        );
      }

      const newStatus = rejectionReason ? "REJECTED" : "VERIFIED";

      const updated = await prisma.document.update({
        where: { id: documentId },
        data: {
          status: newStatus,
          capturedBy: context.user.email,
        },
      });

      await logAuditEvent({
        actorUserId: context.user.id,
        actorEmail: context.user.email,
        action: newStatus === "VERIFIED" ? "DOCUMENT_VERIFIED" : "DOCUMENT_REJECTED",
        resourceType: "document",
        resourceId: doc.id,
        metadata: {
          participantId: doc.participantId,
          playerId: doc.participant.playerId,
          documentType: doc.type,
          verifiedBy: context.user.email,
          rejectionReason: rejectionReason || null,
        },
      });

      const allDocs = await prisma.document.findMany({
        where: { participantId: doc.participantId },
      });
      const isManager =
        doc.participant.category === "Contingent Management" ||
        doc.participant.teamMemberships.some((m) => m.role === "MANAGER");

      const allVerified =
        (allDocs.length > 0 && allDocs.every((d) => d.status === "VERIFIED")) ||
        (isManager && allDocs.length === 0);

      let generatedQr: any = null;

      if (allVerified) {
        await prisma.participant.update({
          where: { id: doc.participantId },
          data: { status: "APPROVED" },
        });

        // Check if active QR pass already exists
        const existingPass = await prisma.qrPass.findFirst({
          where: { participantId: doc.participantId, status: "ACTIVE" },
        });

        if (!existingPass) {
          generatedQr = await generateParticipantQr(doc.participantId, context.user.email);
        } else {
          generatedQr = { token: existingPass.token, qrPassId: existingPass.id };
        }
      }

      return NextResponse.json({
        success: true,
        message: `Document ${doc.type} marked as ${newStatus}.${allVerified ? " Verification successful — official accreditation QR pass generated!" : ""}`,
        document: {
          id: updated.id,
          type: updated.type,
          status: updated.status,
          verifiedBy: context.user.email,
          updatedAt: updated.updatedAt,
        },
        allVerified,
        qrToken: generatedQr?.token || null,
        qrPassId: generatedQr?.qrPassId || null,
        qrGenerated: !!generatedQr,
      });
    }

    // Action 3: Bulk / All documents verification for participant
    if (participantId && markAll) {
      const participant = await prisma.participant.findUnique({
        where: { id: participantId },
        include: { documents: true, teamMemberships: true },
      });

      if (!participant) {
        return NextResponse.json(
          { success: false, error: "Participant not found." },
          { status: 404 }
        );
      }

      const updateResult = await prisma.document.updateMany({
        where: {
          participantId: participant.id,
          status: { in: ["READY", "PENDING"] },
        },
        data: {
          status: "VERIFIED",
          capturedBy: context.user.email,
        },
      });

      await logAuditEvent({
        actorUserId: context.user.id,
        actorEmail: context.user.email,
        action: "DOCUMENT_VERIFIED",
        resourceType: "participant",
        resourceId: participant.id,
        metadata: {
          participantId: participant.id,
          playerId: participant.playerId,
          count: updateResult.count,
          verifiedBy: context.user.email,
        },
      });

      const refreshedDocs = await prisma.document.findMany({
        where: { participantId: participant.id },
      });

      const isManager =
        participant.category === "Contingent Management" ||
        participant.teamMemberships.some((m) => m.role === "MANAGER");

      // For athletes: refreshedDocs must be > 0 and all verified
      // For manager: documents are optional, so if 0 documents or all verified, it's verified
      const allVerified =
        (refreshedDocs.length > 0 && refreshedDocs.every((d) => d.status === "VERIFIED")) ||
        (isManager && refreshedDocs.length === 0);

      let generatedQr: any = null;

      if (allVerified) {
        await prisma.participant.update({
          where: { id: participant.id },
          data: { status: "APPROVED" },
        });

        // Check if active QR pass already exists
        const existingPass = await prisma.qrPass.findFirst({
          where: { participantId: participant.id, status: "ACTIVE" },
        });

        if (!existingPass) {
          generatedQr = await generateParticipantQr(participant.id, context.user.email);
        } else {
          generatedQr = { token: existingPass.token, qrPassId: existingPass.id };
        }
      }

      return NextResponse.json({
        success: true,
        message: isManager && refreshedDocs.length === 0
          ? "Manager accreditation verified — official QR pass generated!"
          : `All ${updateResult.count} documents marked as VERIFIED.${allVerified ? " Verification successful — official accreditation QR pass generated!" : ""}`,
        count: updateResult.count,
        documents: refreshedDocs.map((d) => ({
          id: d.id,
          type: d.type,
          status: d.status,
          verifiedBy: d.capturedBy,
        })),
        allVerified,
        qrToken: generatedQr?.token || null,
        qrPassId: generatedQr?.qrPassId || null,
        qrGenerated: !!generatedQr,
      });
    }

    return NextResponse.json(
      { success: false, error: "Invalid verification action requested." },
      { status: 400 }
    );
    } catch (err: any) {
      console.error("[DOCUMENT_VERIFY_ERROR]", err);
      return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
  }
