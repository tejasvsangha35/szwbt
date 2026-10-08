import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/rbac/guard";
import { verifySpocClearance } from "@/lib/spoc/auth";
import { getSpocOverviewData } from "@/lib/spoc/service";

export async function GET(req: NextRequest) {
  try {
    const authResult = await authenticateRequest(req);
    if (!authResult.authenticated) {
      return authResult.response;
    }

    const spocAuth = await verifySpocClearance(authResult.context);
    if (spocAuth.errorResponse) {
      return spocAuth.errorResponse;
    }

    const overview = await getSpocOverviewData(authResult.context.user.id);
    if (!overview) {
      return NextResponse.json(
        { success: false, error: "404 Not Found: SPOC record not found." },
        { status: 404 }
      );
    }

    let teams = overview.teams;
    const query = req.nextUrl.searchParams.get("q") || req.nextUrl.searchParams.get("search");
    if (query && query.trim()) {
      const q = query.trim().toLowerCase();
      teams = teams.filter(
        (t) =>
          t.teamCode.toLowerCase().includes(q) ||
          t.name.toLowerCase().includes(q) ||
          t.institution.toLowerCase().includes(q) ||
          t.state.toLowerCase().includes(q) ||
          (t.city && t.city.toLowerCase().includes(q))
      );
    }

    return NextResponse.json({
      success: true,
      teams,
      total: teams.length,
      isComplete: overview.isComplete,
      statusText: overview.statusText,
    });
  } catch (error: any) {
    console.error("SPOC teams API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load assigned teams." },
      { status: 500 }
    );
  }
}
