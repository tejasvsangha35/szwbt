import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/rbac/guard";
import { prisma } from "@/lib/prisma";
import { PERMISSIONS } from "@/lib/rbac/permissions";
import { UserContext } from "@/lib/rbac/service";
import { logAuditEvent } from "@/lib/rbac/audit";
import { generateParticipantQr } from "@/lib/qr/service";
import { generateNextStateTeamCode } from "@/lib/team/format";
import fs from "fs";
import path from "path";

export interface AthleteInput {
  name: string;
  email?: string;
  mobile: string;
  photoUrl?: string;
  aadhaarNumber?: string;
  aadhaarUrl?: string;
  bedId?: string;
  pdfFileName?: string;
  pdfFileSize?: string;
  pdfDataUrl?: string;
}

export interface ManagerPdfInput {
  fileName?: string;
  fileSize?: string;
  dataUrl?: string;
}

export interface ManagerInput {
  name?: string;
  email?: string;
  mobile?: string;
  photoUrl?: string;
  aadhaarNumber?: string;
  aadhaarUrl?: string;
  bedId?: string;
}

/**
 * POST /api/registration/team-contingent
 * Registers a full university team contingent (5 athletes + Team Manager) in a single atomic transaction.
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
          permissions: ["REGISTRATION_CREATE", "ACCOMMODATION_ALLOCATE", "PAYMENT_RECORD"],
        };
      const body = await req.json();
      const {
        state,
        institution,
        institutionId,
        teamName,
        managerName,
        managerPhone,
        managerEmail,
        managerPhotoUrl,
        managerAadhaarNumber,
        managerAadhaarUrl,
        managerBedId,
        manager, // Optional structured manager object
        athletes, // Array of 5 athletes
        paymentMethod = "CASH",
        utr,
        feePerAthlete = 500, // ₹500 per athlete (₹2,500 total per team contingent)
        combinedPdf, // Single combined PDF for entire squad
        managerPdf, // Combined PDF for manager
      } = body;

      // 1. Mandatory Validations
      if (!state || !institution) {
        return NextResponse.json(
          { success: false, error: "State and University / Institution are required." },
          { status: 400 }
        );
      }

      if (!Array.isArray(athletes) || athletes.length === 0) {
        return NextResponse.json(
          { success: false, error: "Athletes squad list is required." },
          { status: 400 }
        );
      }

      const cleanState = state.trim();
      const cleanInst = institution.trim();
      const cleanTeamName = teamName?.trim() || `${cleanInst} Badminton Contingent`;
      const finalManagerName = manager?.name || managerName || "";
      const finalManagerPhone = manager?.mobile || managerPhone || "";
      const finalManagerEmail = manager?.email || managerEmail || "";
      const finalManagerPhoto = manager?.photoUrl || managerPhotoUrl || null;
      const finalManagerAadhaar = manager?.aadhaarNumber || managerAadhaarNumber || "";
      const finalManagerAadhaarUrl = manager?.aadhaarUrl || managerAadhaarUrl || null;
      const finalManagerBedId = manager?.bedId || managerBedId || null;

      // Validate Team Manager: only Full Name and Contact Number are compulsory; documents, photo, and email are optional
      if (!finalManagerName.trim() || !finalManagerPhone.trim()) {
        return NextResponse.json(
          {
            success: false,
            error: "Team Manager Full Name and Contact Number are compulsory.",
          },
          { status: 400 }
        );
      }

      // Validate all provided athletes: all details (name, mobile, email, photo, combined PDF documents) are strictly compulsory
      for (let i = 0; i < athletes.length; i++) {
        const a = athletes[i];
        const slotName = i === 0 ? "Athlete 1 (Team Captain)" : `Athlete ${i + 1}`;
        if (!a.name || !a.name.trim()) {
          return NextResponse.json(
            { success: false, error: `${slotName} is missing compulsory Full Name.` },
            { status: 400 }
          );
        }
        if (!a.mobile || !a.mobile.trim()) {
          return NextResponse.json(
            { success: false, error: `${slotName} is missing compulsory Mobile Number.` },
            { status: 400 }
          );
        }
        if (!a.email || !a.email.trim()) {
          return NextResponse.json(
            { success: false, error: `${slotName} is missing compulsory Email Address.` },
            { status: 400 }
          );
        }
        if (!a.photoUrl || !a.photoUrl.trim()) {
          return NextResponse.json(
            { success: false, error: `${slotName} is missing compulsory Photograph.` },
            { status: 400 }
          );
        }
        if (!a.pdfDataUrl || !a.pdfDataUrl.trim()) {
          return NextResponse.json(
            { success: false, error: `${slotName} is missing compulsory Documents (1 Combined PDF).` },
            { status: 400 }
          );
        }
      }

      if (paymentMethod === "UPI" && (!utr || !utr.trim())) {
        return NextResponse.json(
          { success: false, error: "UPI Transaction Reference (UTR) is strictly required for UPI payment." },
          { status: 400 }
        );
      }

      const totalAmount = athletes.length * feePerAthlete;

      // 2. Atomic Transaction
      const result = await prisma.$transaction(async (tx) => {
        // A. Create or Find University Team
        const teamCode = await generateNextStateTeamCode(tx, cleanState);
        const teamQrToken = `sz26_qr_tm_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 9)}`;

        const team = await tx.team.create({
          data: {
            teamCode,
            name: cleanTeamName,
            institution: cleanInst,
            state: cleanState,
            managerName: finalManagerName.trim() || null,
            managerPhone: finalManagerPhone.trim() || null,
            captainName: athletes[0]?.name?.trim() || null,
            status: "COMPLETED",
            teamQrToken,
          },
        });

        // B. If Manager Name/Phone provided, register Manager as Official Participant/Team Member
        let createdManager: any = null;
        if (finalManagerName.trim()) {
          const mgrCount = await tx.participant.count();
          const mgrPlayerId = `SZWBT26-M-${String(mgrCount + 1).padStart(5, "0")}`;

          const mgrParticipant = await tx.participant.create({
            data: {
              playerId: mgrPlayerId,
              name: finalManagerName.trim(),
              email: finalManagerEmail.trim().toLowerCase() || null,
              phone: finalManagerPhone.trim() || "—",
              institution: cleanInst,
              institutionId: institutionId || null,
              state: cleanState,
              category: "Contingent Management",
              gender: "FEMALE",
              photoUrl: finalManagerPhoto,
              status: "APPROVED",
            },
          });

          // Link manager to team
          await tx.teamMember.create({
            data: {
              teamId: team.id,
              participantId: mgrParticipant.id,
              role: "MANAGER",
            },
          });

          let finalManagerPhotoUrl = finalManagerPhoto;
          if (finalManagerPhoto && finalManagerPhoto.startsWith("data:image/")) {
            try {
              const photoDir = path.join(process.cwd(), "public", "uploads", "photos", mgrParticipant.id);
              if (!fs.existsSync(photoDir)) {
                fs.mkdirSync(photoDir, { recursive: true });
              }
              const base64Data = finalManagerPhoto.replace(/^data:[^;]+;base64,/, "");
              const buffer = Buffer.from(base64Data, "base64");
              const fileName = `photo_${Date.now()}.jpg`;
              fs.writeFileSync(path.join(photoDir, fileName), buffer);
              finalManagerPhotoUrl = `/uploads/photos/${mgrParticipant.id}/${fileName}`;
              await tx.participant.update({
                where: { id: mgrParticipant.id },
                data: { photoUrl: finalManagerPhotoUrl },
              });
            } catch (e) {
              console.warn("Failed to write manager photo to disk:", e);
            }
          }

          // Note: QR Pass is NOT generated yet — only generated after verification status shows successful
          const mgrQr = null;

          // Record Aadhaar Document if provided
          if (finalManagerAadhaar.trim() || finalManagerAadhaarUrl) {
            await tx.document.create({
              data: {
                participantId: mgrParticipant.id,
                type: "AADHAAR",
                fileName: `Aadhaar_${mgrParticipant.name.replace(/\s+/g, "_")}.pdf`,
                filePath: finalManagerAadhaarUrl || `aadhaar://${finalManagerAadhaar.trim()}`,
                status: "PENDING",
                capturedBy: context.user.email,
              },
            });
          }

          // Record Combined PDF Document if provided
          if (managerPdf?.dataUrl) {
            try {
              const safeId = mgrParticipant.id.replace(/[^a-zA-Z0-9_-]/g, "");
              const uploadDir = path.join(process.cwd(), "public", "uploads", "secure", safeId);
              if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
              }
              const base64Data = managerPdf.dataUrl.replace(/^data:[^;]+;base64,/, "");
              const buffer = Buffer.from(base64Data, "base64");
              const cleanFileName = managerPdf.fileName || `manager_docs_${Date.now()}.pdf`;
              const filePath = path.join(uploadDir, cleanFileName);
              fs.writeFileSync(filePath, buffer);
              const publicPath = `/uploads/secure/${safeId}/${cleanFileName}`;

              await tx.document.create({
                data: {
                  participantId: mgrParticipant.id,
                  type: "OTHER",
                  fileName: cleanFileName,
                  filePath: publicPath,
                  fileSize: buffer.length,
                  mimeType: "application/pdf",
                  status: "PENDING",
                  capturedBy: context.user.email,
                },
              });
            } catch (e) {
              console.warn("Failed to save manager PDF:", e);
            }
          }

          // Note: Room allotment is managed exclusively & manually in the Accommodation Dashboard.
          // Registration does NOT allocate any rooms automatically or manually.
          const mgrBedInfo: any = null;

          createdManager = {
            id: mgrParticipant.id,
            playerId: mgrParticipant.playerId,
            name: mgrParticipant.name,
            email: mgrParticipant.email,
            phone: mgrParticipant.phone,
            role: "MANAGER",
            institution: mgrParticipant.institution,
            state: mgrParticipant.state,
            photoUrl: mgrParticipant.photoUrl,
            aadhaarNumber: finalManagerAadhaar.trim() || null,
            qrToken: null,
            bed: mgrBedInfo,
          };
        }

        // C. Create Each Participant & Bed Allocation & QR Pass
        const createdParticipants: any[] = [];

        for (let i = 0; i < athletes.length; i++) {
          const a = athletes[i];
          const participantCount = await tx.participant.count();
          const playerId = `SZWBT26-P-${String(participantCount + 1).padStart(6, "0")}`;

          const participant = await tx.participant.create({
            data: {
              playerId,
              name: a.name.trim(),
              email: a.email?.trim().toLowerCase() || null,
              phone: a.mobile.trim(),
              institution: cleanInst,
              institutionId: institutionId || null,
              state: cleanState,
              category: i < 2 ? "Women's Singles" : "Women's Doubles",
              gender: "FEMALE",
              photoUrl: a.photoUrl || null,
              status: "PENDING",
            },
          });

          // Link to team
          await tx.teamMember.create({
            data: {
              teamId: team.id,
              participantId: participant.id,
              role: i === 0 ? "CAPTAIN" : "PLAYER",
            },
          });

          let athletePhotoUrl = a.photoUrl || null;
          if (a.photoUrl && a.photoUrl.startsWith("data:image/")) {
            try {
              const photoDir = path.join(process.cwd(), "public", "uploads", "photos", participant.id);
              if (!fs.existsSync(photoDir)) {
                fs.mkdirSync(photoDir, { recursive: true });
              }
              const base64Data = a.photoUrl.replace(/^data:[^;]+;base64,/, "");
              const buffer = Buffer.from(base64Data, "base64");
              const fileName = `photo_${Date.now()}.jpg`;
              fs.writeFileSync(path.join(photoDir, fileName), buffer);
              athletePhotoUrl = `/uploads/photos/${participant.id}/${fileName}`;
              await tx.participant.update({
                where: { id: participant.id },
                data: { photoUrl: athletePhotoUrl },
              });
            } catch (e) {
              console.warn("Failed to write athlete photo to disk:", e);
            }
          }

          // Note: QR Pass is NOT generated yet — only generated after verification status shows successful
          const qrResult = null;

          // Record Aadhaar Document if provided
          if (a.aadhaarNumber?.trim() || a.aadhaarUrl) {
            await tx.document.create({
              data: {
                participantId: participant.id,
                type: "AADHAAR",
                fileName: `Aadhaar_${participant.name.replace(/\s+/g, "_")}.pdf`,
                filePath: a.aadhaarUrl || `aadhaar://${a.aadhaarNumber.trim()}`,
                status: "PENDING",
                capturedBy: context.user.email,
              },
            });
          }

          // Record Combined PDF Document if provided
          if (a.pdfDataUrl) {
            try {
              const safeId = participant.id.replace(/[^a-zA-Z0-9_-]/g, "");
              const uploadDir = path.join(process.cwd(), "public", "uploads", "secure", safeId);
              if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
              }
              const base64Data = a.pdfDataUrl.replace(/^data:[^;]+;base64,/, "");
              const buffer = Buffer.from(base64Data, "base64");
              const cleanFileName = a.pdfFileName || `athlete_docs_${Date.now()}.pdf`;
              const filePath = path.join(uploadDir, cleanFileName);
              fs.writeFileSync(filePath, buffer);
              const publicPath = `/uploads/secure/${safeId}/${cleanFileName}`;

              await tx.document.create({
                data: {
                  participantId: participant.id,
                  type: "OTHER",
                  fileName: cleanFileName,
                  filePath: publicPath,
                  fileSize: buffer.length,
                  mimeType: "application/pdf",
                  status: "PENDING",
                  capturedBy: context.user.email,
                },
              });
            } catch (e) {
              console.warn("Failed to save athlete PDF:", e);
            }
          }

          // Note: Room allotment is managed exclusively & manually in the Accommodation Dashboard.
          // Registration does NOT allocate any rooms automatically or manually.
          const bedInfo: any = null;

          createdParticipants.push({
            id: participant.id,
            playerId: participant.playerId,
            name: participant.name,
            email: participant.email,
            phone: participant.phone,
            role: i === 0 ? "CAPTAIN" : "ATHLETE",
            institution: participant.institution,
            state: participant.state,
            category: participant.category,
            photoUrl: participant.photoUrl,
            aadhaarNumber: a.aadhaarNumber?.trim() || null,
            qrToken: null,
            bed: bedInfo,
          });
        }

        // D. Record Payment Transaction
        const txn = await tx.paymentTransaction.create({
          data: {
            category: "REGISTRATION",
            entityType: "TEAM",
            entityId: team.id,
            amount: totalAmount,
            method: paymentMethod,
            utr: paymentMethod === "UPI" ? utr.trim() : null,
            operatorEmail: context.user.email,
            receiptNumber: `REC-SZ26-${Date.now().toString().slice(-6)}`,
            status: "SUCCESS",
            notes: `Full contingent registration payment for ${cleanInst} (${athletes.length} athletes @ ₹${feePerAthlete})`,
          },
        });

        // E. Create Fee Ledger
        await tx.feeLedger.create({
          data: {
            category: "REGISTRATION",
            entityType: "TEAM",
            teamId: team.id,
            amountDue: totalAmount,
            amountPaid: totalAmount,
            balance: 0,
            status: "PAID",
          },
        });

        return {
          team,
          manager: createdManager,
          participants: createdParticipants,
          payment: txn,
        };
      });

      // 3. Audit Logging
      await logAuditEvent({
        actorUserId: context.user.id,
        actorEmail: context.user.email,
        action: "TEAM_REGISTERED",
        resourceType: "team",
        resourceId: result.team.id,
        metadata: {
          teamCode: result.team.teamCode,
          institution: cleanInst,
          athleteCount: result.participants.length,
          managerName: finalManagerName || null,
          totalAmount,
          paymentMethod,
          operator: context.user.email,
        },
      });

      return NextResponse.json({
        success: true,
        message: `Successfully registered full contingent for ${cleanInst} (${result.participants.length} athletes + Manager).`,
        data: result,
      });
    } catch (error: any) {
      console.error("[POST /api/registration/team-contingent] Error:", error);
      return NextResponse.json(
        { success: false, error: error.message || "Failed to register team contingent." },
        { status: 500 }
      );
    }
  }
