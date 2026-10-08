import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/rbac/guard";
import { PERMISSIONS } from "@/lib/rbac/permissions";
import { UserContext } from "@/lib/rbac/service";
import {
  ARRIVAL_VENUES,
  ArrivalVenue,
  UniversityArrival,
  loadArrivalsFromDb,
  saveArrivalsToDb,
} from "@/lib/transport/arrivals";
import { logAuditEvent } from "@/lib/rbac/audit";

/**
 * PATCH /api/transport/arrivals/[id]
 * Handles operational arrival actions:
 * - MARK_ARRIVED
 * - MARK_DELAYED
 * - EDIT_ARRIVAL
 * - REPORT_ISSUE
 */
export const PATCH = withAuth(
  async (req: NextRequest, context: UserContext, routeProps: any) => {
    try {
      const resolvedParams = await Promise.resolve(routeProps?.params || {});
      const arrivalId = resolvedParams.id;

      if (!arrivalId) {
        return NextResponse.json({ success: false, error: "Arrival ID is required." }, { status: 400 });
      }

      const body = await req.json();
      const action = body.action;
      const payload = { ...body, ...(body.payload || {}) };

      const allArrivals = await loadArrivalsFromDb();
      const index = allArrivals.findIndex((a) => a.id === arrivalId);

      if (index === -1) {
        return NextResponse.json({ success: false, error: "Arrival record not found." }, { status: 404 });
      }

      const arrival = allArrivals[index];
      const nowIso = new Date().toISOString();

      switch (action) {
        // ── 1. MARK ARRIVED ──────────────────────────────────────────
        case "MARK_ARRIVED": {
          arrival.status = "ARRIVED";
          arrival.arrivedAt = nowIso;
          arrival.updatedAt = nowIso;

          await logAuditEvent({
            actorUserId: context.user.id,
            actorEmail: context.user.email,
            action: "MARK_ARRIVED",
            resourceType: "transport",
            resourceId: arrival.id,
            metadata: {
              universityName: arrival.universityName,
              venue: arrival.venue,
              arrivedAt: nowIso,
            },
          });
          break;
        }

        // ── 2. MARK DELAYED ──────────────────────────────────────────
        case "MARK_DELAYED": {
          const { updatedTime, delayReason, delayNote } = payload || {};
          if (!updatedTime) {
            return NextResponse.json(
              { success: false, error: "Updated arrival time is required when marking a delay." },
              { status: 400 }
            );
          }

          if (!arrival.originalTime) {
            arrival.originalTime = arrival.scheduledTime;
          }
          arrival.status = "DELAYED";
          arrival.updatedTime = updatedTime.trim();
          arrival.delayReason = delayReason || "Traffic";
          arrival.delayNote = delayNote || null;
          arrival.updatedAt = nowIso;

          await logAuditEvent({
            actorUserId: context.user.id,
            actorEmail: context.user.email,
            action: "MARK_DELAYED",
            resourceType: "transport",
            resourceId: arrival.id,
            metadata: {
              universityName: arrival.universityName,
              venue: arrival.venue,
              originalTime: arrival.originalTime,
              updatedTime,
              delayReason,
              delayNote,
            },
          });
          break;
        }

        // ── 3. EDIT ARRIVAL (Venue change, Time change, etc.) ────────
        case "EDIT_ARRIVAL": {
          const { universityName, scheduledTime, updatedTime, venue, status, contingentSize, contactPerson, contactPhone } = payload || {};

          if (venue && !ARRIVAL_VENUES.includes(venue)) {
            return NextResponse.json(
              { success: false, error: "Invalid arrival venue specified." },
              { status: 400 }
            );
          }

          const previousVenue = arrival.venue;
          if (universityName) arrival.universityName = universityName.trim();
          if (scheduledTime) arrival.scheduledTime = scheduledTime.trim();
          if (updatedTime !== undefined) arrival.updatedTime = updatedTime ? updatedTime.trim() : undefined;
          if (venue) arrival.venue = venue as ArrivalVenue;
          if (status) arrival.status = status;
          if (contingentSize !== undefined) arrival.contingentSize = parseInt(contingentSize, 10);
          if (contactPerson !== undefined) arrival.contactPerson = contactPerson;
          if (contactPhone !== undefined) arrival.contactPhone = contactPhone;
          arrival.updatedAt = nowIso;

          await logAuditEvent({
            actorUserId: context.user.id,
            actorEmail: context.user.email,
            action: "EDIT_ARRIVAL",
            resourceType: "transport",
            resourceId: arrival.id,
            metadata: {
              universityName: arrival.universityName,
              venueChanged: previousVenue !== arrival.venue,
              oldVenue: previousVenue,
              newVenue: arrival.venue,
              status: arrival.status,
            },
          });
          break;
        }

        // ── 4. REPORT ISSUE ──────────────────────────────────────────
        case "REPORT_ISSUE": {
          const category = payload?.category || payload?.issueCategory;
          const note = payload?.note || payload?.issueNote || "";
          if (!category) {
            return NextResponse.json({ success: false, error: "Issue category is required." }, { status: 400 });
          }

          const issueId = `issue-${Date.now()}`;
          const newIssue = {
            id: issueId,
            category: category,
            note: note || "",
            reportedAt: nowIso,
            reportedBy: context.user.name || context.user.email,
          };

          if (!arrival.issues) arrival.issues = [];
          arrival.issues.unshift(newIssue);
          arrival.updatedAt = nowIso;

          await logAuditEvent({
            actorUserId: context.user.id,
            actorEmail: context.user.email,
            action: "REPORT_TRANSPORT_ISSUE",
            resourceType: "transport",
            resourceId: arrival.id,
            metadata: {
              universityName: arrival.universityName,
              venue: arrival.venue,
              category,
              note,
            },
          });
          break;
        }

        default:
          return NextResponse.json({ success: false, error: `Unsupported action: ${action}` }, { status: 400 });
      }

      allArrivals[index] = arrival;
      await saveArrivalsToDb(allArrivals, context.user.email);

      return NextResponse.json({
        success: true,
        data: arrival,
        arrival,
      });
    } catch (error: any) {
      console.error("[PATCH /api/transport/arrivals/[id] ERROR]", error);
      return NextResponse.json({ success: false, error: "Failed to update arrival record." }, { status: 500 });
    }
  }
);
