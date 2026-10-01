import { NextRequest } from "next/server";
import { authenticateRequest } from "@/lib/rbac/guard";
import { verifyOperationsClearance } from "@/lib/operations/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const authResult = await authenticateRequest(req);
  if (!authResult.authenticated) {
    return new Response("Unauthorized", { status: 401 });
  }

  const opsAuth = verifyOperationsClearance(authResult.context);
  if (opsAuth.errorResponse) {
    return new Response("Forbidden", { status: 403 });
  }

  const responseStream = new TransformStream();
  const writer = responseStream.writable.getWriter();
  const encoder = new TextEncoder();

  let isAlive = true;

  const sendEvent = async () => {
    try {
      if (!isAlive) return;

      const [liveMatchesCount, courts, latestAudit] = await Promise.all([
        prisma.match.count({ where: { status: "LIVE" } }),
        prisma.court.findMany({ select: { id: true, courtNumber: true, status: true, umpire: true } }),
        prisma.auditLog.findFirst({
          orderBy: { timestamp: "desc" },
          select: { id: true, action: true, timestamp: true },
        }),
      ]);

      const payload = JSON.stringify({
        liveMatchesCount,
        courts,
        latestEventId: latestAudit?.id,
        latestAction: latestAudit?.action,
        timestamp: new Date().toISOString(),
      });

      await writer.write(encoder.encode(`event: update\ndata: ${payload}\n\n`));
    } catch {
      isAlive = false;
    }
  };

  // Initial event
  sendEvent();

  // Pulse interval every 3 seconds
  const interval = setInterval(async () => {
    if (!isAlive) {
      clearInterval(interval);
      return;
    }
    await sendEvent();
  }, 3000);

  req.signal.addEventListener("abort", () => {
    isAlive = false;
    clearInterval(interval);
    writer.close().catch(() => {});
  });

  return new Response(responseStream.readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
