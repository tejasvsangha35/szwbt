import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/rbac/guard";
import { verifyOperationsClearance } from "@/lib/operations/auth";
import { getMatchControlDetails } from "@/lib/operations/techOpsService";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await authenticateRequest(req);
    if (!authResult.authenticated) {
      return authResult.response;
    }

    const opsAuth = verifyOperationsClearance(authResult.context);
    if (opsAuth.errorResponse) {
      return opsAuth.errorResponse;
    }

    const { id: matchId } = await params;
    if (!matchId) {
      return NextResponse.json({ success: false, error: "Match ID is required." }, { status: 400 });
    }

    const details = await getMatchControlDetails(matchId);

    return NextResponse.json({
      success: true,
      data: details,
    });
  } catch (error: any) {
    console.error(`[GET /api/operations/matches/[id]] Error:`, error);
    const status = error.message.includes("not found") ? 404 : 500;
    return NextResponse.json({ success: false, error: error.message }, { status });
  }
}
