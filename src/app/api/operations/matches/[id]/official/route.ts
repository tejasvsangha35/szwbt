import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/rbac/guard";
import { verifyOperationsClearance } from "@/lib/operations/auth";
import { assignMatchOfficial } from "@/lib/operations/techOpsService";

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
    const { officialId, roleType = "UMPIRE", courtOfficials } = body;

    if (!officialId) {
      return NextResponse.json(
        { success: false, error: "officialId is required for official assignment." },
        { status: 400 }
      );
    }

    const updatedMatch = await assignMatchOfficial({
      matchId,
      officialId,
      roleType,
      courtOfficials,
      actorUserId: authResult.context.user.id,
      actorEmail: authResult.context.user.email,
    });

    return NextResponse.json({
      success: true,
      message: `Official assigned to Match #${updatedMatch.matchNumber}.`,
      data: updatedMatch,
    });
  } catch (error: any) {
    console.error(`[POST /api/operations/matches/[id]/official] Error:`, error);
    const isConflict = error.message.includes("currently umpiring") || error.message.includes("conflict");
    const isNotFound = error.message.includes("not found");
    const isForbidden = error.message.includes("clearance");
    const status = isConflict ? 409 : isNotFound ? 404 : isForbidden ? 403 : 400;

    return NextResponse.json({ success: false, error: error.message }, { status });
  }
}
