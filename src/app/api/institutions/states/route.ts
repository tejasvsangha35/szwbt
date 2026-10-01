import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CANONICAL_STATES, normalizeStateName } from "@/data/institutions";
import { seedInstitutions } from "../../../../../prisma/seed-institutions";

/**
 * GET /api/institutions/states
 * Returns distinct states from Institution master for dropdown population.
 * Sorted alphabetically using canonical state normalization.
 */
export async function GET(req: NextRequest) {
  try {
    const totalCount = await prisma.institution.count();
    if (totalCount === 0) {
      await seedInstitutions();
    }

    const institutions = await prisma.institution.findMany({
      where: { status: "ACTIVE" },
      select: { state: true },
      distinct: ["state"],
      orderBy: { state: "asc" },
    });

    const states = Array.from(
      new Set(institutions.map((i) => normalizeStateName(i.state)).filter(Boolean))
    ).sort((a, b) => a.localeCompare(b));

    const fallbackStates = [...CANONICAL_STATES];

    return NextResponse.json({
      success: true,
      states: states.length > 0 ? states : fallbackStates,
      isFallback: states.length === 0,
    });
  } catch (err: any) {
    console.error("[INSTITUTIONS_STATES_ERROR]", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
