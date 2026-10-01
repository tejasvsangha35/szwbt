import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/rbac/guard";
import { verifyOperationsClearance } from "@/lib/operations/auth";
import {
  updatePreMatchReporting,
  updateCourtReadinessCheck,
  getMatchControlDetails,
} from "@/lib/operations/techOpsService";

export async function POST(
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
    const body = await req.json();
    const {
      type, // "PRE_MATCH" | "COURT_READINESS"
      // Pre-Match fields
      teamAReported,
      teamBReported,
      officialsPresent,
      courtReady,
      shuttleFeeStatus,
      shuttleFeeAmount,
      shuttleFeeReceipt,
      // Court Readiness fields
      courtNumber,
      checkItem,
      checkName,
      status, // "READY" | "PENDING" | "ISSUE"
      notes,
    } = body;

    const actorUserId = authResult.context.user.id;
    const actorEmail = authResult.context.user.email;

    if (type === "COURT_READINESS" && courtNumber && checkItem) {
      await updateCourtReadinessCheck({
        courtNumber,
        matchId,
        checkItem,
        checkName: checkName || checkItem,
        status: status || "READY",
        notes,
        actorUserId,
        actorEmail,
      });
    } else {
      // Default: Pre-match reporting update
      await updatePreMatchReporting({
        matchId,
        teamAReported,
        teamBReported,
        officialsPresent,
        courtReady,
        shuttleFeeStatus,
        shuttleFeeAmount,
        shuttleFeeReceipt,
        notes,
        actorUserId,
        actorEmail,
      });
    }

    // Return updated match details with fresh readiness status
    const details = await getMatchControlDetails(matchId);

    return NextResponse.json({
      success: true,
      message: "Match technical readiness updated successfully.",
      data: details,
    });
  } catch (error: any) {
    console.error(`[POST /api/operations/matches/[id]/readiness] Error:`, error);
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
