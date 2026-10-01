import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/rbac/guard";
import { verifyOperationsClearance } from "@/lib/operations/auth";
import { releaseCourt } from "@/lib/operations/techOpsService";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ courtNumber: string }> }
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

    const { courtNumber: rawCourtNumber } = await params;
    const courtNumber = decodeURIComponent(rawCourtNumber);

    const body = await req.json().catch(() => ({}));
    const { notes } = body;

    const court = await releaseCourt({
      courtNumber,
      notes,
      actorUserId: authResult.context.user.id,
      actorEmail: authResult.context.user.email,
    });

    return NextResponse.json({
      success: true,
      message: `${courtNumber} released to AVAILABLE status.`,
      court,
    });
  } catch (error: any) {
    console.error(`[POST /api/operations/courts/[courtNumber]/release] Error:`, error);
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
