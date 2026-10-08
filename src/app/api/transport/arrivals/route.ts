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
  sortArrivalsChronologically,
  parseTimeToMinutes,
} from "@/lib/transport/arrivals";
import { logAuditEvent } from "@/lib/rbac/audit";

/**
 * GET /api/transport/arrivals
 * Fetches university arrivals grouped by the 8 Hubballi venues.
 * Supports date, venue, and search filtering.
 */
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const date = searchParams.get("date") || "2026-10-18";
    const venueFilter = searchParams.get("venue");
    const search = (searchParams.get("search") || "").toLowerCase().trim();

    const allArrivals = await loadArrivalsFromDb();

    // Filter by selected date
    let filtered = allArrivals.filter((a) => a.date === date);

    // Filter by university name search
    if (search) {
      filtered = filtered.filter(
        (a) =>
          a.universityName.toLowerCase().includes(search) ||
          a.venue.toLowerCase().includes(search) ||
          (a.contactPerson && a.contactPerson.toLowerCase().includes(search))
      );
    }

    // Filter by venue if specified
    if (venueFilter && venueFilter !== "ALL" && venueFilter !== "All Venues") {
      filtered = filtered.filter((a) => a.venue === venueFilter);
    }

    // Compute statistics for the selected date
    const totalToday = filtered.length;
    const upcomingCount = filtered.filter((a) => a.status === "UPCOMING").length;
    const arrivedCount = filtered.filter((a) => a.status === "ARRIVED").length;
    const delayedCount = filtered.filter((a) => a.status === "DELAYED").length;
    const cancelledCount = filtered.filter((a) => a.status === "CANCELLED").length;

    // Group arrivals by the 8 fixed venues
    const groupedByVenue: Record<string, UniversityArrival[]> = {};
    const venueSummaries: { venue: ArrivalVenue; count: number; upcomingCount: number }[] = [];

    for (const venue of ARRIVAL_VENUES) {
      const venueArrivals = filtered.filter((a) => a.venue === venue);
      const sorted = sortArrivalsChronologically(venueArrivals);
      groupedByVenue[venue] = sorted;
      venueSummaries.push({
        venue,
        count: sorted.length,
        upcomingCount: sorted.filter((a) => a.status === "UPCOMING" || a.status === "DELAYED").length,
      });
    }

    // Identify the NEXT upcoming arrival (earliest UPCOMING or DELAYED)
    const sortedUpcoming = sortArrivalsChronologically(
      filtered.filter((a) => a.status === "UPCOMING" || a.status === "DELAYED")
    );
    const nextArrival = sortedUpcoming.length > 0 ? sortedUpcoming[0] : null;

    // Generate recent operational alerts
    const operationalAlerts = [];
    const delayedItems = allArrivals.filter((a) => a.status === "DELAYED");
    for (const d of delayedItems) {
      operationalAlerts.push({
        id: `alert-delay-${d.id}`,
        type: "DELAYED",
        title: `${d.universityName} Delayed`,
        message: `Arriving at ${d.updatedTime || d.scheduledTime} at ${d.venue}. Reason: ${d.delayReason || "Traffic"}.`,
        timestamp: d.updatedAt,
        arrivalId: d.id,
        universityName: d.universityName,
        venue: d.venue,
      });
    }

    const arrivedItems = allArrivals
      .filter((a) => a.status === "ARRIVED" && a.arrivedAt)
      .slice(-5);
    for (const arr of arrivedItems) {
      operationalAlerts.push({
        id: `alert-arr-${arr.id}`,
        type: "ARRIVED",
        title: `${arr.universityName} Arrived`,
        message: `Safely arrived at ${arr.venue}.`,
        timestamp: arr.arrivedAt || arr.updatedAt,
        arrivalId: arr.id,
        universityName: arr.universityName,
        venue: arr.venue,
      });
    }

    const summaryData = {
      total: totalToday,
      totalToday,
      totalVenues: ARRIVAL_VENUES.length,
      upcoming: upcomingCount,
      upcomingCount,
      arrived: arrivedCount,
      arrivedCount,
      delayed: delayedCount,
      delayedCount,
      cancelled: cancelledCount,
      cancelledCount,
    };

    const currentTimeStr = new Date().toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });

    const responsePayload = {
      date,
      count: filtered.length,
      arrivals: filtered,
      groupedByVenue,
      venueSummaries,
      allVenues: ARRIVAL_VENUES,
      nextArrival,
      summary: summaryData,
      operationalAlerts: operationalAlerts.slice(0, 10),
      lastUpdated: currentTimeStr,
    };

    return NextResponse.json({
      success: true,
      ...responsePayload,
      data: responsePayload,
    });
  } catch (error: any) {
    console.error("[GET /api/transport/arrivals ERROR]", error);
    return NextResponse.json(
      { success: false, error: "Unable to load arrival information. Please refresh." },
      { status: 500 }
    );
  }
}

/**
 * POST /api/transport/arrivals
 * Creates a new university arrival record.
 */
export const POST = withAuth(
  async (req: NextRequest, context: UserContext) => {
    try {
      const body = await req.json();
      const { universityName, date, scheduledTime, venue, contingentSize, contactPerson, contactPhone } = body;

      if (!universityName || !scheduledTime || !venue) {
        return NextResponse.json(
          { success: false, error: "University name, arrival time, and arrival venue are required." },
          { status: 400 }
        );
      }

      const allArrivals = await loadArrivalsFromDb();
      const newArrival: UniversityArrival = {
        id: `arr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        universityName: universityName.trim(),
        date: date || "2026-10-18",
        scheduledTime: scheduledTime.trim(),
        venue,
        status: "UPCOMING",
        contingentSize: contingentSize ? parseInt(contingentSize, 10) : 10,
        contactPerson: contactPerson || "",
        contactPhone: contactPhone || "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      allArrivals.push(newArrival);
      await saveArrivalsToDb(allArrivals, context.user.email);

      await logAuditEvent({
        actorUserId: context.user.id,
        actorEmail: context.user.email,
        action: "CREATE_ARRIVAL",
        resourceType: "transport",
        resourceId: newArrival.id,
        metadata: {
          universityName: newArrival.universityName,
          venue: newArrival.venue,
          time: newArrival.scheduledTime,
        },
      });

      return NextResponse.json({
        success: true,
        data: newArrival,
      });
    } catch (error: any) {
      console.error("[POST /api/transport/arrivals ERROR]", error);
      return NextResponse.json({ success: false, error: "Failed to create arrival record." }, { status: 500 });
    }
  },
  {
    permissions: [PERMISSIONS.TRANSPORT_BOARDING],
  }
);
