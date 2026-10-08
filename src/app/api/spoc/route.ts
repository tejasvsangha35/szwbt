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

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      ...overview,
    });
  } catch (error: any) {
    console.error("SPOC overview API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load SPOC overview data.", details: error.message },
      { status: 500 }
    );
  }
}
