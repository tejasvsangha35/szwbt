import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/rbac/guard";
import { verifyOperationsClearance } from "@/lib/operations/auth";
import { coordinateMatchInterruption } from "@/lib/operations/techOpsService";

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
    const { action, reason, notes } = body;

    if (!action || !["PAUSE", "RESUME", "DELAY"].includes(action)) {
      return NextResponse.json(
        { success: false, error: "Action must be PAUSE, RESUME, or DELAY." },
        { status: 400 }
      );
    }

    const updatedMatch = await coordinateMatchInterruption({
      matchId,
      action,
      reason: reason || "Technical Operations Hold",
      notes,
      actorUserId: authResult.context.user.id,
      actorEmail: authResult.context.user.email,
    });

    return NextResponse.json({
      success: true,
      message: `Match #${updatedMatch.matchNumber} ${action} applied successfully.`,
      match: updatedMatch,
    });
  } catch (error: any) {
    console.error(`[POST /api/operations/matches/[id]/interrupt] Error:`, error);
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
