import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/rbac/guard";
import { verifyOperationsClearance } from "@/lib/operations/auth";
import { assignMatchCourt } from "@/lib/operations/techOpsService";

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
    const { courtNumber } = body;

    if (!courtNumber) {
      return NextResponse.json(
        { success: false, error: "courtNumber is required for court assignment." },
        { status: 400 }
      );
    }

    const result = await assignMatchCourt({
      matchId,
      courtNumber,
      actorUserId: authResult.context.user.id,
      actorEmail: authResult.context.user.email,
    });

    return NextResponse.json({
      success: true,
      message: `Court ${courtNumber} successfully assigned to Match #${result.match.matchNumber}.`,
      data: result,
    });
  } catch (error: any) {
    console.error(`[POST /api/operations/matches/[id]/court] Error:`, error);
    const isConflict = error.message.includes("occupied") || error.message.includes("conflict");
    const isNotFound = error.message.includes("not found");
    const status = isConflict ? 409 : isNotFound ? 404 : 400;

    return NextResponse.json({ success: false, error: error.message }, { status });
  }
}
