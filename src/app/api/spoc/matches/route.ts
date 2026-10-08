import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/rbac/guard";
import { verifySpocClearance } from "@/lib/spoc/auth";
import { prisma } from "@/lib/prisma";

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

    // Get assigned team IDs
    const assignments = await prisma.spocTeamAssignment.findMany({
      where: { spocId: authResult.context.user.id },
      include: {
        team: {
          select: { id: true, name: true, institution: true },
        },
      },
    });

    const teams = assignments.map((a) => a.team);
    const teamIds = teams.map((t) => t.id);

    if (teamIds.length === 0) {
      return NextResponse.json({
        success: true,
        matches: { live: [], upcoming: [], completed: [], total: 0 },
        message: "No teams assigned to this SPOC yet.",
      });
    }

    // Find matches involving ONLY these assigned teams
    const matches = await prisma.match.findMany({
      where: {
        OR: [
          { teamAId: { in: teamIds } },
          { teamBId: { in: teamIds } },
          ...teams.map((t) => ({ institutionA: { contains: t.institution, mode: "insensitive" as const } })),
          ...teams.map((t) => ({ institutionB: { contains: t.institution, mode: "insensitive" as const } })),
        ],
      },
      orderBy: [{ status: "asc" }, { time: "asc" }],
    });

    const formatted = matches.map((m) => {
      // Find which assigned team is in this match
      const assignedTeam = teams.find(
        (t) =>
          t.id === m.teamAId ||
          t.id === m.teamBId ||
          m.institutionA.toLowerCase().includes(t.institution.toLowerCase()) ||
          m.institutionB.toLowerCase().includes(t.institution.toLowerCase())
      );

      const isTeamA =
        assignedTeam?.id === m.teamAId ||
        (assignedTeam && m.institutionA.toLowerCase().includes(assignedTeam.institution.toLowerCase()));

      const opponent = isTeamA
        ? m.institutionB || m.playerB
        : m.institutionA || m.playerA;

      const scoreTeam = isTeamA ? m.scoreA || "0" : m.scoreB || "0";
      const scoreOpponent = isTeamA ? m.scoreB || "0" : m.scoreA || "0";

      let resultText: "WIN" | "LOSS" | "TIE" | "PENDING" = "PENDING";
      if (m.status === "COMPLETED") {
        if (m.winner === "PLAYER_A") resultText = isTeamA ? "WIN" : "LOSS";
        else if (m.winner === "PLAYER_B") resultText = isTeamA ? "LOSS" : "WIN";
        else resultText = "TIE";
      }

      // Leader text for live match
      let leaderText = "MATCH TIED";
      const numTeam = parseInt(scoreTeam.split(",").pop() || "0", 10);
      const numOpp = parseInt(scoreOpponent.split(",").pop() || "0", 10);
      if (numTeam > numOpp) {
        leaderText = `${assignedTeam?.name.split(" ")[0] || "Team"} LEADING`;
      } else if (numOpp > numTeam) {
        leaderText = `OPPONENT LEADING`;
      }

      return {
        id: m.id,
        matchNumber: m.publicMatchNumber || m.matchNumber,
        category: m.category,
        court: m.court,
        time: m.time,
        status: m.status,
        assignedTeam: {
          id: assignedTeam?.id,
          name: assignedTeam?.name,
          institution: assignedTeam?.institution,
        },
        opponent,
        scoreTeam,
        scoreOpponent,
        scoreDisplay: `${scoreTeam} - ${scoreOpponent}`,
        winner: m.winner,
        resultText,
        leaderText,
      };
    });

    const live = formatted.filter((m) => m.status === "LIVE");
    const upcoming = formatted.filter(
      (m) => m.status === "UPCOMING" || m.status === "READY" || m.status === "SCHEDULED"
    );
    const completed = formatted.filter((m) => m.status === "COMPLETED");

    return NextResponse.json({
      success: true,
      matches: {
        live,
        upcoming,
        completed,
        total: formatted.length,
      },
    });
  } catch (error: any) {
    console.error("SPOC matches API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load matches for assigned teams." },
      { status: 500 }
    );
  }
}

// Strictly block score modification attempts by SPOC
export async function POST() {
  return NextResponse.json(
    { success: false, error: "403 Forbidden: SPOC cannot create or modify official matches or scores." },
    { status: 403 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { success: false, error: "403 Forbidden: SPOC cannot modify official match scores." },
    { status: 403 }
  );
}
