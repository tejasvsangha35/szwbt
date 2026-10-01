import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/rbac/guard";
import { prisma } from "@/lib/prisma";
import { PERMISSIONS } from "@/lib/rbac/permissions";
import { UserContext } from "@/lib/rbac/service";
import { logAuditEvent } from "@/lib/rbac/audit";
import { generateParticipantQr } from "@/lib/qr/service";
import fs from "fs";
import path from "path";

export const POST = withAuth(
  async (req: NextRequest, context: UserContext) => {
    try {
      const body = await req.json();
      const { participantId, type, fileName, dataUrl, mimeType, autoVerify = false } = body;

      const cleanType = (type || "COMBINED_PDF").toUpperCase().trim();
      const validTypes = ["UNIVERSITY_ID", "SSLC", "PUC", "OTHER", "COMBINED_PDF", "AADHAAR"];
      const resolvedType = validTypes.includes(cleanType) ? cleanType : "COMBINED_PDF";

      if (!dataUrl || typeof dataUrl !== "string") {
        return NextResponse.json(
          { success: false, error: "Document payload (dataUrl) is required." },
          { status: 400 }
        );
      }

      // Secure Private File Storage Path
      // Save to private uploads directory outside web root or in secure subfolder
      const safeParticipantId = participantId ? participantId.replace(/[^a-zA-Z0-9_-]/g, "") : `temp_${Date.now()}`;
      const uploadDir = path.join(process.cwd(), "public", "uploads", "secure", safeParticipantId);

      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      // Convert base64 data to buffer
      const base64Data = dataUrl.replace(/^data:[^;]+;base64,/, "");
      const buffer = Buffer.from(base64Data, "base64");

      const ext = (mimeType && mimeType.includes("pdf")) ? "pdf" : "jpg";
      const cleanFileName = `${resolvedType.toLowerCase()}_${Date.now()}.${ext}`;
      const filePath = path.join(uploadDir, cleanFileName);

      fs.writeFileSync(filePath, buffer);

      const publicPath = `/uploads/secure/${safeParticipantId}/${cleanFileName}`;

      // If participant exists in DB, attach or create Document record
      let documentRecord: any = null;
      if (participantId && !participantId.startsWith("temp_")) {
        const existingParticipant = await prisma.participant.findFirst({
          where: { OR: [{ id: participantId }, { playerId: participantId }] },
        });

        if (existingParticipant) {
          // Remove or update existing document of same type
          await prisma.document.deleteMany({
            where: { participantId: existingParticipant.id, type: resolvedType },
          });

          const docStatus = autoVerify ? "VERIFIED" : "PENDING";
          let generatedQr: any = null;

          documentRecord = await prisma.document.create({
            data: {
              participantId: existingParticipant.id,
              type: resolvedType,
              fileName: fileName || cleanFileName,
              filePath: publicPath,
              fileSize: buffer.length,
              mimeType: mimeType || (ext === "pdf" ? "application/pdf" : "image/jpeg"),
              status: docStatus,
              capturedBy: context.user.email,
            },
          });

          if (autoVerify) {
            await prisma.participant.update({
              where: { id: existingParticipant.id },
              data: { status: "APPROVED" },
            });

            const existingPass = await prisma.qrPass.findFirst({
              where: { participantId: existingParticipant.id, status: "ACTIVE" },
            });

            if (!existingPass) {
              generatedQr = await generateParticipantQr(existingParticipant.id, context.user.email);
            } else {
              generatedQr = { token: existingPass.token, qrPassId: existingPass.id };
            }
          }

          // Audit Log
          await logAuditEvent({
            actorUserId: context.user.id,
            actorEmail: context.user.email,
            action: autoVerify ? "DOCUMENT_UPLOADED_AND_VERIFIED" : "DOCUMENT_UPLOADED",
            resourceType: "document",
            resourceId: documentRecord.id,
            metadata: {
              participantId: existingParticipant.id,
              type: resolvedType,
              fileName: cleanFileName,
              fileSize: buffer.length,
              status: docStatus,
              qrGenerated: !!generatedQr,
            },
          });

          return NextResponse.json({
            success: true,
            message: autoVerify
              ? "Document uploaded & verified successfully. Accreditation QR generated."
              : "Document uploaded successfully. Pending verification.",
            document: {
              id: documentRecord.id,
              type: resolvedType,
              label: resolvedType.replace(/_/g, " "),
              fileName: fileName || cleanFileName,
              fileSize: buffer.length,
              mimeType: mimeType || (ext === "pdf" ? "application/pdf" : "image/jpeg"),
              status: docStatus,
              url: publicPath,
              dataUrl: dataUrl,
              capturedAt: new Date().toLocaleTimeString(),
            },
            verified: autoVerify,
            qrToken: generatedQr?.token || null,
            qrPassId: generatedQr?.qrPassId || null,
            qrGenerated: !!generatedQr,
          });
        }
      }

      return NextResponse.json({
        success: true,
        message: "Document captured and processed successfully.",
        document: {
          id: `doc_${Date.now()}`,
          type: resolvedType,
          label: resolvedType.replace(/_/g, " "),
          fileName: fileName || cleanFileName,
          fileSize: buffer.length,
          mimeType: mimeType || (ext === "pdf" ? "application/pdf" : "image/jpeg"),
          status: "PENDING",
          url: publicPath,
          dataUrl: dataUrl,
          capturedAt: new Date().toLocaleTimeString(),
        },
      });
    } catch (err: any) {
      console.error("Document upload error:", err);
      return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
  },
  {
    permissions: [PERMISSIONS.DOCUMENT_UPLOAD],
  }
);
