import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/rbac/guard";
import { verifyOperationsClearance } from "@/lib/operations/auth";
import { sendMatchToUmpire } from "@/lib/operations/techOpsService";

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

    const result = await sendMatchToUmpire({
      matchId,
      actorUserId: authResult.context.user.id,
      actorEmail: authResult.context.user.email,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error(`[POST /api/operations/matches/[id]/send-to-umpire] Error:`, error);
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
