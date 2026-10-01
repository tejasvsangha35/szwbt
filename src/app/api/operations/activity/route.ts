import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/rbac/guard";
import { verifyOperationsClearance } from "@/lib/operations/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const authResult = await authenticateRequest(req);
    if (!authResult.authenticated) {
      return authResult.response;
    }

    const opsAuth = verifyOperationsClearance(authResult.context);
    if (opsAuth.errorResponse) {
      return opsAuth.errorResponse;
    }

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const matchId = searchParams.get("matchId");
    const courtNumber = searchParams.get("courtNumber");

    const logs = await prisma.auditLog.findMany({
      where: {
        AND: [
          matchId ? { resourceId: matchId } : {},
          courtNumber ? { metadata: { contains: courtNumber } } : {},
          {
            action: {
              in: [
                "COURT_ASSIGNED",
                "COURT_REASSIGNED",
                "COURT_READY",
                "COURT_ISSUE_REPORTED",
                "COURT_STATUS_CHANGED",
                "OFFICIAL_ASSIGNED",
                "OFFICIAL_REASSIGNED",
                "PRE_MATCH_REPORTING_RECORDED",
                "FEE_VERIFIED",
                "MATCH_READY",
                "MATCH_SENT_TO_UMPIRE",
                "MATCH_STARTED",
                "MATCH_PAUSED",
                "MATCH_RESUMED",
                "MATCH_DELAYED",
                "MATCH_ENDED",
                "RESULT_SUBMITTED",
                "RESULT_CONFIRMED",
                "COURT_RELEASED",
                "RESULT_COMMUNICATION_SENT",
                "RESULT_COMMUNICATION_FAILED",
                "WALKOVER_DECLARED",
              ],
            },
          },
        ],
      },
      orderBy: { timestamp: "desc" },
      take: Math.min(limit, 100),
    });

    return NextResponse.json({
      success: true,
      activity: logs,
      count: logs.length,
    });
  } catch (error: any) {
    console.error("[GET /api/operations/activity] Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
