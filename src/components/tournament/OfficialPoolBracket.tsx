"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  Trophy,
  ZoomIn,
  ZoomOut,
  Printer,
  ChevronRight,
  Sun,
  Moon,
  ArrowRight,
  RefreshCw,
  X,
} from "lucide-react";
import { formatTeamCode } from "@/lib/team/format";

export type PoolCode = "A" | "B" | "C" | "D" | "CHAMPIONSHIP";

export interface TeamSlot {
  slot: number;
  name: string;
  state: string;
  seed?: number;
  isByeToFinal?: boolean;
  isByeR1?: boolean;
  teamId?: string | null;
  teamCode?: string | null;
  teamNumber?: number | null;
}

export interface PoolBracketProps {
  initialPool?: PoolCode;
  liveMatches?: any[];
  bracketSlots?: any[];
  isAdmin?: boolean;
  onSelectMatch?: (matchNumber: string | number) => void;
  onSlotAssigned?: () => void;
}

export function OfficialPoolBracket({
  initialPool = "A",
  liveMatches = [],
  bracketSlots: initialBracketSlots,
  isAdmin = false,
  onSelectMatch,
  onSlotAssigned,
}: PoolBracketProps) {
  const [activePool, setActivePool] = useState<PoolCode>(initialPool);
  const [themeMode, setThemeMode] = useState<"PAPER" | "DARK">("PAPER");
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [selectedMatchModal, setSelectedMatchModal] = useState<any | null>(null);
  const [hoveredTeam, setHoveredTeam] = useState<number | null>(null);

  // Internal slots state
  const [localSlots, setLocalSlots] = useState<any[]>(initialBracketSlots || []);

  useEffect(() => {
    if (initialBracketSlots && initialBracketSlots.length > 0) {
      setLocalSlots(initialBracketSlots);
    } else {
      fetch("/api/tournament/fixtures")
        .then((r) => r.json())
        .then((data) => {
          if (data.success && data.data.bracketSlots) {
            setLocalSlots(data.data.bracketSlots);
          }
        })
        .catch((err) => console.error("Error loading bracket slots:", err));
    }
  }, [initialBracketSlots]);

  // Derived pool counts: Pools A & C have 26 slots, Pools B & D have 25 slots
  const poolLimits: Record<string, number> = { A: 26, B: 25, C: 26, D: 25 };
  const poolCounts = useMemo(() => {
    const counts: Record<string, number> = { A: 0, B: 0, C: 0, D: 0 };
    (localSlots || []).forEach((s: any) => {
      if (s.teamId && counts[s.pool] !== undefined) {
        counts[s.pool]++;
      }
    });
    return counts;
  }, [localSlots]);

  const activePoolCapacity = activePool !== "CHAMPIONSHIP" ? poolLimits[activePool] || 25 : 0;
  const activePoolCount = activePool !== "CHAMPIONSHIP" ? poolCounts[activePool] || 0 : 0;
  const isActivePoolFull = activePoolCount >= activePoolCapacity;

  // Slot Assignment Modal state
  const [assignModalSlot, setAssignModalSlot] = useState<TeamSlot | null>(null);
  const [teamNumberInput, setTeamNumberInput] = useState<string>("");
  const [fetchedTeam, setFetchedTeam] = useState<any | null>(null);
  const [isFetchingTeam, setIsFetchingTeam] = useState<boolean>(false);
  const [assignError, setAssignError] = useState<string | null>(null);
  const [isAssigning, setIsAssigning] = useState<boolean>(false);

  // Search/Fetch team details from DB as admin types team number or code
  const searchTeam = async (query: string) => {
    if (!query.trim()) {
      setFetchedTeam(null);
      return;
    }
    try {
      setIsFetchingTeam(true);
      setAssignError(null);
      const res = await fetch(`/api/tournament/fixtures/teams?q=${encodeURIComponent(query.trim())}`);
      const data = await res.json();
      if (data.success && data.teams && data.teams.length > 0) {
        setFetchedTeam(data.teams[0]);
      } else {
        setFetchedTeam(null);
        setAssignError(`No university found matching "${query}".`);
      }
    } catch {
      setAssignError("Failed to fetch team details from database.");
    } finally {
      setIsFetchingTeam(false);
    }
  };

  const handleSlotClick = (slot: TeamSlot) => {
    if (!isAdmin) return;
    setAssignModalSlot(slot);
    const initialQuery = slot.teamNumber ? String(slot.teamNumber) : slot.teamCode || "";
    setTeamNumberInput(initialQuery);
    setFetchedTeam(null);
    setAssignError(null);
    if (initialQuery) {
      searchTeam(initialQuery);
    }
  };

  const handleConfirmAssign = async () => {
    if (!assignModalSlot || !fetchedTeam) {
      setAssignError("Please enter a valid team number to fetch university details first.");
      return;
    }

    try {
      setIsAssigning(true);
      setAssignError(null);
      const res = await fetch("/api/tournament/fixtures", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "ASSIGN_SLOT",
          pool: activePool,
          slot: assignModalSlot.slot,
          teamId: fetchedTeam.id,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to assign team to slot.");
      }

      // Refresh slots
      const updatedSlotsRes = await fetch("/api/tournament/fixtures");
      const updatedData = await updatedSlotsRes.json();
      if (updatedData.success && updatedData.data.bracketSlots) {
        setLocalSlots(updatedData.data.bracketSlots);
      }

      onSlotAssigned?.();
      setAssignModalSlot(null);
    } catch (err: any) {
      setAssignError(err.message || "Failed to assign team.");
    } finally {
      setIsAssigning(false);
    }
  };

  const handleUnassignSlot = async () => {
    if (!assignModalSlot) return;
    try {
      setIsAssigning(true);
      setAssignError(null);
      const res = await fetch("/api/tournament/fixtures", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "UNASSIGN_SLOT",
          pool: activePool,
          slot: assignModalSlot.slot,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to unassign slot.");
      }

      const updatedSlotsRes = await fetch("/api/tournament/fixtures");
      const updatedData = await updatedSlotsRes.json();
      if (updatedData.success && updatedData.data.bracketSlots) {
        setLocalSlots(updatedData.data.bracketSlots);
      }

      onSlotAssigned?.();
      setAssignModalSlot(null);
    } catch (err: any) {
      setAssignError(err.message || "Failed to unassign slot.");
    } finally {
      setIsAssigning(false);
    }
  };

  // Dynamically compute exact slots for active pool (Pool A/C: 26, Pool B/D: 25)
  const currentRoster: TeamSlot[] = useMemo(() => {
    if (activePool === "CHAMPIONSHIP") return [];
    const slots: TeamSlot[] = [];
    const poolSlots = (localSlots || []).filter((s: any) => s.pool === activePool);
    const slotMap = new Map<number, any>(poolSlots.map((s: any) => [s.slot, s]));
    const totalSlots = activePool === "A" || activePool === "C" ? 26 : 25;

    for (let slotNum = 1; slotNum <= totalSlots; slotNum++) {
      const assigned = slotMap.get(slotNum);
      const isByeToFinal =
        activePool === "A" || activePool === "C"
          ? slotNum === 1
          : slotNum === 25;

      const isByeR1 =
        activePool === "A" || activePool === "C"
          ? [2, 5, 8, 11, 14, 17, 20].includes(slotNum)
          : [1, 6, 7, 12, 13, 18, 19, 24].includes(slotNum);

      const seed =
        isByeToFinal
          ? activePool === "A"
            ? 1
            : activePool === "B"
            ? 2
            : activePool === "C"
            ? 3
            : 4
          : undefined;

      const defaultTeamNumber =
        activePool === "A"
          ? slotNum
          : activePool === "B"
          ? 26 + slotNum
          : activePool === "C"
          ? 51 + slotNum
          : 77 + slotNum;

      slots.push({
        slot: slotNum,
        name: assigned?.teamName || "",
        state: assigned?.state || "",
        seed,
        isByeToFinal,
        isByeR1,
        teamId: assigned?.teamId || null,
        teamCode: assigned?.teamCode || null,
        teamNumber: assigned?.teamNumber || defaultTeamNumber,
      });
    }
    return slots;
  }, [activePool, localSlots]);

  // Official Tie configurations by pool matching official AIU fixture sheets
  const poolTieData = useMemo(() => {
    switch (activePool) {
      case "A":
        return {
          seedSlot: 1,
          superQfTie: 95,
          r1: [
            { tie: 1, slotA: 3, slotB: 4 },
            { tie: 2, slotA: 6, slotB: 7 },
            { tie: 3, slotA: 9, slotB: 10 },
            { tie: 4, slotA: 12, slotB: 13 },
            { tie: 5, slotA: 15, slotB: 16 },
            { tie: 6, slotA: 18, slotB: 19 },
            { tie: 7, slotA: 21, slotB: 22 },
            { tie: 8, slotA: 23, slotB: 24 },
            { tie: 9, slotA: 25, slotB: 26 },
          ],
          r2: [
            { tie: 35, byeSlot: 2, prevTie: 1 },
            { tie: 36, byeSlot: 5, prevTie: 2 },
            { tie: 37, byeSlot: 8, prevTie: 3 },
            { tie: 38, byeSlot: 11, prevTie: 4 },
            { tie: 39, byeSlot: 14, prevTie: 5 },
            { tie: 40, byeSlot: 17, prevTie: 6 },
            { tie: 41, byeSlot: 20, prevTie: 7 },
            { tie: 42, prevTieA: 8, prevTieB: 9 },
          ],
          qf: [
            { tie: 67, tieA: 35, tieB: 36 },
            { tie: 68, tieA: 37, tieB: 38 },
            { tie: 69, tieA: 39, tieB: 40 },
            { tie: 70, tieA: 41, tieB: 42 },
          ],
          sf: [
            { tie: 83, tieA: 67, tieB: 68 },
            { tie: 84, tieA: 69, tieB: 70 },
          ],
          poolFinal: { tie: 91, tieA: 83, tieB: 84 },
          advancesTo: "Tie 95 (Super Quarters)",
        };
      case "B":
        return {
          seedSlot: 25,
          superQfTie: 96,
          r1: [
            { tie: 10, slotA: 2, slotB: 3 },
            { tie: 11, slotA: 4, slotB: 5 },
            { tie: 12, slotA: 8, slotB: 9 },
            { tie: 13, slotA: 10, slotB: 11 },
            { tie: 14, slotA: 14, slotB: 15 },
            { tie: 15, slotA: 16, slotB: 17 },
            { tie: 16, slotA: 20, slotB: 21 },
            { tie: 17, slotA: 22, slotB: 23 },
          ],
          r2: [
            { tie: 43, byeSlot: 1, prevTie: 10 },
            { tie: 44, prevTie: 11, byeSlot: 6 },
            { tie: 45, byeSlot: 7, prevTie: 12 },
            { tie: 46, prevTie: 13, byeSlot: 12 },
            { tie: 47, byeSlot: 13, prevTie: 14 },
            { tie: 48, prevTie: 15, byeSlot: 18 },
            { tie: 49, byeSlot: 19, prevTie: 16 },
            { tie: 50, prevTie: 17, byeSlot: 24 },
          ],
          qf: [
            { tie: 71, tieA: 43, tieB: 44 },
            { tie: 72, tieA: 45, tieB: 46 },
            { tie: 73, tieA: 47, tieB: 48 },
            { tie: 74, tieA: 49, tieB: 50 },
          ],
          sf: [
            { tie: 85, tieA: 71, tieB: 72 },
            { tie: 86, tieA: 73, tieB: 74 },
          ],
          poolFinal: { tie: 92, tieA: 85, tieB: 86 },
          advancesTo: "Tie 96 (Super Quarters)",
        };
      case "C":
        return {
          seedSlot: 1,
          superQfTie: 97,
          r1: [
            { tie: 18, slotA: 3, slotB: 4 },
            { tie: 19, slotA: 6, slotB: 7 },
            { tie: 20, slotA: 9, slotB: 10 },
            { tie: 21, slotA: 12, slotB: 13 },
            { tie: 22, slotA: 15, slotB: 16 },
            { tie: 23, slotA: 18, slotB: 19 },
            { tie: 24, slotA: 21, slotB: 22 },
            { tie: 25, slotA: 23, slotB: 24 },
            { tie: 26, slotA: 25, slotB: 26 },
          ],
          r2: [
            { tie: 51, byeSlot: 2, prevTie: 18 },
            { tie: 52, byeSlot: 5, prevTie: 19 },
            { tie: 53, byeSlot: 8, prevTie: 20 },
            { tie: 54, byeSlot: 11, prevTie: 21 },
            { tie: 55, byeSlot: 14, prevTie: 22 },
            { tie: 56, byeSlot: 17, prevTie: 23 },
            { tie: 57, byeSlot: 20, prevTie: 24 },
            { tie: 58, prevTieA: 25, prevTieB: 26 },
          ],
          qf: [
            { tie: 75, tieA: 51, tieB: 52 },
            { tie: 76, tieA: 53, tieB: 54 },
            { tie: 77, tieA: 55, tieB: 56 },
            { tie: 78, tieA: 57, tieB: 58 },
          ],
          sf: [
            { tie: 87, tieA: 75, tieB: 76 },
            { tie: 88, tieA: 77, tieB: 78 },
          ],
          poolFinal: { tie: 93, tieA: 87, tieB: 88 },
          advancesTo: "Tie 97 (Super Quarters)",
        };
      case "D":
        return {
          seedSlot: 25,
          superQfTie: 98,
          r1: [
            { tie: 27, slotA: 2, slotB: 3 },
            { tie: 28, slotA: 4, slotB: 5 },
            { tie: 29, slotA: 8, slotB: 9 },
            { tie: 30, slotA: 10, slotB: 11 },
            { tie: 31, slotA: 14, slotB: 15 },
            { tie: 32, slotA: 16, slotB: 17 },
            { tie: 33, slotA: 20, slotB: 21 },
            { tie: 34, slotA: 22, slotB: 23 },
          ],
          r2: [
            { tie: 59, byeSlot: 1, prevTie: 27 },
            { tie: 60, prevTie: 28, byeSlot: 6 },
            { tie: 61, byeSlot: 7, prevTie: 29 },
            { tie: 62, prevTie: 30, byeSlot: 12 },
            { tie: 63, byeSlot: 13, prevTie: 31 },
            { tie: 64, prevTie: 32, byeSlot: 18 },
            { tie: 65, byeSlot: 19, prevTie: 33 },
            { tie: 66, prevTie: 34, byeSlot: 24 },
          ],
          qf: [
            { tie: 79, tieA: 59, tieB: 60 },
            { tie: 80, tieA: 61, tieB: 62 },
            { tie: 81, tieA: 63, tieB: 64 },
            { tie: 82, tieA: 65, tieB: 66 },
          ],
          sf: [
            { tie: 89, tieA: 79, tieB: 80 },
            { tie: 90, tieA: 81, tieB: 82 },
          ],
          poolFinal: { tie: 94, tieA: 89, tieB: 90 },
          advancesTo: "Tie 98 (Super Quarters)",
        };
      default:
        return null;
    }
  }, [activePool]);

  // Geometry configuration with generous width and spacing to avoid any line overlap
  const config = {
    topPadding: 50,
    slotHeight: 30,
    slotGap: 8,
    slotWidth: 460,
    startX: 25,
    r1ColX: 520,
    r2ColX: 590,
    r3ColX: 660,
    r4ColX: 730,
    r5ColX: 805,
    finalColX: 920,
    endArrowX: 1000,
    badgeW: 28,
    badgeH: 18,
  };

  const pitch = config.slotHeight + config.slotGap;
  const totalSvgHeight = config.topPadding + 27 * pitch + 50;
  const totalSvgWidth = config.endArrowX + 130;

  const getSlotY = (slotNum: number) => config.topPadding + (slotNum - 1) * pitch;
  const getSlotCenterY = (slotNum: number) => getSlotY(slotNum) + config.slotHeight / 2;

  // Precomputed match centers for the active pool
  const matchPositions = useMemo(() => {
    if (!poolTieData) return {};
    const pos: Record<number, number> = {};

    // Round 1
    poolTieData.r1.forEach((m) => {
      pos[m.tie] = (getSlotCenterY(m.slotA) + getSlotCenterY(m.slotB)) / 2;
    });

    // Round 2
    poolTieData.r2.forEach((m) => {
      let yA = 0;
      let yB = 0;
      if ("byeSlot" in m && m.byeSlot && "prevTie" in m && m.prevTie) {
        yA = getSlotCenterY(m.byeSlot);
        yB = pos[m.prevTie] || yA;
      } else if ("prevTieA" in m && m.prevTieA && m.prevTieB) {
        yA = pos[m.prevTieA] || 0;
        yB = pos[m.prevTieB] || 0;
      }
      pos[m.tie] = (yA + yB) / 2;
    });

    // QF
    poolTieData.qf.forEach((m) => {
      pos[m.tie] = ((pos[m.tieA] || 0) + (pos[m.tieB] || 0)) / 2;
    });

    // SF
    poolTieData.sf.forEach((m) => {
      pos[m.tie] = ((pos[m.tieA] || 0) + (pos[m.tieB] || 0)) / 2;
    });

    // Pool Final: placed between Seed Slot and Challenger SF Merge
    const pf = poolTieData.poolFinal;
    const sf1 = poolTieData.sf[0].tie;
    const sf2 = poolTieData.sf[1].tie;
    const challengerMidY = ((pos[sf1] || 0) + (pos[sf2] || 0)) / 2;
    const seedY = getSlotCenterY(poolTieData.seedSlot);
    pos[pf.tie] = (seedY + challengerMidY) / 2;

    return pos;
  }, [poolTieData, pitch, config.topPadding]);

  // Color schemes
  const isPaper = themeMode === "PAPER";
  const colors = {
    bg: isPaper ? "#FFFFFF" : "#050914",
    cardBg: isPaper ? "#FFFFFF" : "#0B1226",
    cardBorder: isPaper ? "#002060" : "#00F0FF",
    textPrimary: isPaper ? "#000000" : "#F4E6CE",
    textMuted: isPaper ? "#1A365D" : "#91A0AE",
    lineColor: isPaper ? "#002060" : "#00F0FF",
    badgeBg: isPaper ? "#FFFFFF" : "#060D20",
    badgeBorder: isPaper ? "#002060" : "#FF5A16",
    badgeText: isPaper ? "#002060" : "#FF5A16",
    highlightLine: "#FF5A16",
  };

  const handleMatchClick = (tieNumber: number, roundName: string) => {
    const formattedTie = `Tie ${String(tieNumber).padStart(2, "0")}`;
    const liveInfo = (liveMatches || []).find(
      (m) => m.publicMatchNumber === formattedTie || m.matchNumber === formattedTie
    );

    setSelectedMatchModal({
      tieNumber,
      matchNumber: formattedTie,
      roundName,
      pool: activePool,
      liveInfo,
    });

    if (onSelectMatch) {
      onSelectMatch(formattedTie);
    }
  };

  return (
    <div
      className={`relative w-full rounded-2xl border transition-colors shadow-2xl overflow-hidden ${
        isPaper
          ? "bg-white border-blue-900 text-slate-900"
          : "bg-[#050914] border-[#00F0FF]/30 text-[#F4E6CE]"
      }`}
    >
      {/* ═══ TOP CONTROLS & POOL SELECTOR ═══ */}
      <div
        className={`p-4 border-b flex flex-wrap items-center justify-between gap-4 ${
          isPaper ? "bg-slate-50 border-blue-200" : "bg-[#090F24] border-[#18D8D0]/30"
        }`}
      >
        {/* Pool Selector Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          {(["A", "B", "C", "D"] as const).map((p) => {
            const isSelected = activePool === p;
            const count = poolCounts[p] || 0;
            const cap = poolLimits[p];
            const isFull = count >= cap;
            return (
              <button
                key={p}
                onClick={() => setActivePool(p)}
                className={`px-3.5 py-2 rounded-lg font-pixel text-xs tracking-wider uppercase font-bold transition-all shadow-sm flex items-center gap-2 ${
                  isSelected
                    ? isPaper
                      ? "bg-[#002060] text-white ring-2 ring-blue-700 shadow-md"
                      : "bg-[#FF5A16] text-black shadow-[0_0_12px_rgba(255,90,22,0.6)]"
                    : isPaper
                    ? "bg-white text-blue-900 border border-blue-300 hover:bg-blue-50"
                    : "bg-[#050914] text-[#91A0AE] border border-[#1A2644] hover:text-white"
                }`}
              >
                <span>POOL - {p}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold ${
                    isSelected
                      ? isPaper
                        ? "bg-blue-900 text-blue-100"
                        : "bg-black/35 text-black font-extrabold"
                      : isFull
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                      : isPaper
                      ? "bg-blue-100 text-blue-800"
                      : "bg-[#101935] text-[#00F0FF]"
                  }`}
                >
                  {count}/{cap}
                </span>
              </button>
            );
          })}

          <button
            onClick={() => setActivePool("CHAMPIONSHIP")}
            className={`px-4 py-2 rounded-lg font-pixel text-xs tracking-wider uppercase font-bold transition-all shadow-sm flex items-center gap-1.5 ${
              activePool === "CHAMPIONSHIP"
                ? isPaper
                  ? "bg-amber-600 text-white shadow-md ring-2 ring-amber-500"
                  : "bg-[#00F0FF] text-black font-bold shadow-[0_0_12px_rgba(0,240,255,0.6)]"
                : isPaper
                ? "bg-white text-amber-900 border border-amber-300 hover:bg-amber-50"
                : "bg-[#050914] text-[#91A0AE] border border-[#1A2644] hover:text-[#00F0FF]"
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>FINAL 4 / PODIUM</span>
          </button>
        </div>

        {/* View Tools: Theme Toggle, Zoom Controls, Print */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setThemeMode(isPaper ? "DARK" : "PAPER")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-pixel text-[11px] font-bold uppercase transition-colors border ${
              isPaper
                ? "bg-blue-100 text-blue-900 border-blue-300 hover:bg-blue-200"
                : "bg-[#101935] text-[#00F0FF] border-[#00F0FF]/30 hover:bg-[#15234a]"
            }`}
            title="Toggle Official Print Paper vs Cyber Dark"
          >
            {isPaper ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5 text-amber-400" />}
            <span>{isPaper ? "Cyber Dark" : "Official Sheet"}</span>
          </button>

          <div
            className={`flex items-center rounded-lg border p-0.5 ${
              isPaper ? "bg-white border-blue-300" : "bg-[#050914] border-[#1A2644]"
            }`}
          >
            <button
              onClick={() => setZoomLevel((z) => Math.max(0.6, z - 0.1))}
              className={`p-1.5 rounded ${isPaper ? "hover:bg-blue-50 text-blue-900" : "hover:bg-[#1A2644] text-[#91A0AE]"}`}
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span
              className={`font-pixel text-[10px] w-12 text-center font-bold ${
                isPaper ? "text-blue-950" : "text-[#91A0AE]"
              }`}
            >
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={() => setZoomLevel((z) => Math.min(1.5, z + 0.1))}
              className={`p-1.5 rounded ${isPaper ? "hover:bg-blue-50 text-blue-900" : "hover:bg-[#1A2644] text-[#91A0AE]"}`}
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoomLevel(1)}
              className={`px-2 py-1 font-pixel text-[10px] font-bold rounded ${
                isPaper ? "hover:bg-blue-50 text-blue-900" : "hover:bg-[#1A2644] text-[#00F0FF]"
              }`}
            >
              FIT
            </button>
          </div>

          <button
            onClick={() => window.print()}
            className={`p-2 rounded-lg border font-pixel text-xs transition-colors ${
              isPaper
                ? "bg-white border-blue-300 text-blue-900 hover:bg-blue-50"
                : "bg-[#050914] border-[#1A2644] text-[#91A0AE] hover:text-white"
            }`}
            title="Print Bracket Sheet"
          >
            <Printer className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ═══ POOL HEADER BADGE ═══ */}
      {activePool !== "CHAMPIONSHIP" ? (
        <div className="flex flex-col items-center justify-center pt-5 pb-2 gap-2">
          <div className="flex flex-wrap items-center justify-center gap-3">
            <div
              className={`px-6 py-1.5 rounded-lg border-2 font-display text-sm tracking-widest uppercase font-black shadow-md ${
                isPaper
                  ? "bg-gradient-to-r from-blue-100 via-blue-200 to-blue-100 border-[#002060] text-[#002060]"
                  : "bg-gradient-to-r from-cyan-950 via-[#0B1E40] to-cyan-950 border-[#00F0FF] text-[#00F0FF] shadow-[0_0_15px_rgba(0,240,255,0.3)]"
              }`}
            >
              POOL - {activePool}
            </div>
            <div
              className={`px-3 py-1 rounded-lg font-pixel text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${
                isPaper
                  ? "bg-blue-100 text-blue-900 border border-blue-300"
                  : "bg-[#091228] text-[#00F0FF] border border-[#00F0FF]/30"
              }`}
            >
              <span>{activePoolCount} / {activePoolCapacity} TEAMS</span>
            </div>
          </div>

          <div className="w-full mt-2 p-2.5 bg-[#070D1E] border border-[#00F0FF]/30 rounded-xl flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-[#00F0FF] text-black font-pixel text-[10px] font-bold rounded">
                OFFICIAL AIU BRACKET
              </span>
              <span className="text-slate-300 font-sans text-xs">
                Pool {activePool}: <strong>{activePoolCapacity} teams</strong> &bull; Winner advances to {poolTieData?.advancesTo}
              </span>
            </div>
            <span className="font-pixel text-[10px] text-[#05D550]">
              TOTAL: 102 UNIVERSITIES ACROSS 4 POOLS
            </span>
          </div>
        </div>
      ) : (
        <div className="flex justify-center pt-6 pb-2">
          <div
            className={`px-6 py-1.5 rounded-lg border-2 font-display text-sm tracking-widest uppercase font-black shadow-md ${
              isPaper
                ? "bg-gradient-to-r from-amber-100 via-amber-200 to-amber-100 border-amber-900 text-amber-900"
                : "bg-gradient-to-r from-amber-950 via-[#362208] to-amber-950 border-[#FFB800] text-[#FFB800] shadow-[0_0_15px_rgba(255,184,0,0.3)]"
            }`}
          >
            SUPER QUARTERS &bull; SEMI-FINALS &bull; GRAND FINAL &bull; HARDLINE TIE
          </div>
        </div>
      )}

      {/* ═══ INTERACTIVE SVG BRACKET CANVAS ═══ */}
      {activePool !== "CHAMPIONSHIP" && poolTieData ? (
        <div className="overflow-x-auto overflow-y-auto p-4 sm:p-6 cursor-grab active:cursor-grabbing">
          <div
            className="transition-transform duration-150 origin-top-left"
            style={{ transform: `scale(${zoomLevel})` }}
          >
            <svg
              width={totalSvgWidth}
              height={totalSvgHeight}
              viewBox={`0 0 ${totalSvgWidth} ${totalSvgHeight}`}
              className="select-none font-sans"
            >
              <defs>
                <marker
                  id="arrow"
                  viewBox="0 0 10 10"
                  refX="6"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1 L 8 5 L 0 9 z" fill={colors.lineColor} />
                </marker>
              </defs>

              {/* ── 1. DRAW TEAM SLOTS ── */}
              {currentRoster.map((t) => {
                const y = getSlotY(t.slot);
                const centerY = getSlotCenterY(t.slot);
                const isHovered = hoveredTeam === t.slot;
                const isAssigned = !!t.name;
                const displayPrefix = t.teamCode ? formatTeamCode(t.teamCode) : `${t.teamNumber || t.slot}`;
                const parsed = formatTeamSlot(displayPrefix, t.name, t.state, t.seed);

                return (
                  <g
                    key={t.slot}
                    className="cursor-pointer group"
                    onClick={() => handleSlotClick(t)}
                    onMouseEnter={() => setHoveredTeam(t.slot)}
                    onMouseLeave={() => setHoveredTeam(null)}
                  >
                    <clipPath id={`clip-slot-${t.slot}`}>
                      <rect
                        x={config.startX}
                        y={y}
                        width={config.slotWidth - 6}
                        height={config.slotHeight}
                        rx={3}
                      />
                    </clipPath>

                    <rect
                      x={config.startX}
                      y={y}
                      width={config.slotWidth}
                      height={config.slotHeight}
                      rx={3}
                      fill={
                        isHovered
                          ? isPaper
                            ? "#EBF4FF"
                            : "#18264A"
                          : isAssigned
                          ? colors.cardBg
                          : isPaper
                          ? "#F8FAFC"
                          : "#070E1E"
                      }
                      stroke={
                        isHovered
                          ? colors.highlightLine
                          : isAssigned
                          ? colors.cardBorder
                          : isPaper
                          ? "#94A3B8"
                          : "#1E3056"
                      }
                      strokeWidth={1.5}
                      strokeDasharray={isAssigned ? undefined : "3 3"}
                      className="transition-colors"
                    />

                    {isAssigned ? (
                      <g clipPath={`url(#clip-slot-${t.slot})`}>
                        <title>{parsed.fullText}</title>
                        {parsed.line2 ? (
                          <text
                            fill={isHovered ? colors.highlightLine : colors.textPrimary}
                            fontFamily="Arial, Helvetica, sans-serif"
                          >
                            <tspan
                              x={config.startX + 8}
                              y={centerY - 2}
                              fontSize="8.5"
                              fontWeight="700"
                            >
                              {parsed.line1}
                            </tspan>
                            <tspan
                              x={config.startX + 22}
                              y={centerY + 9}
                              fontSize="8.5"
                              fontWeight="600"
                            >
                              {parsed.line2}
                            </tspan>
                          </text>
                        ) : (
                          <text
                            x={config.startX + 8}
                            y={centerY + 4}
                            fill={isHovered ? colors.highlightLine : colors.textPrimary}
                            fontSize="9.5"
                            fontWeight="700"
                            fontFamily="Arial, Helvetica, sans-serif"
                            letterSpacing="0.2px"
                          >
                            {parsed.line1}
                          </text>
                        )}
                      </g>
                    ) : (
                      <text
                        x={config.startX + 8}
                        y={centerY + 4}
                        fill={isHovered ? colors.highlightLine : isPaper ? "#64748B" : "#475569"}
                        fontSize="9.5"
                        fontWeight="500"
                        fontFamily="Arial, Helvetica, sans-serif"
                        letterSpacing="0.2px"
                      >
                        {displayPrefix}. {t.seed ? `[Seed #${t.seed} Bye] ` : t.isByeR1 ? `[Bye to R2] ` : ""}{isHovered && isAdmin ? "── Click to edit ──" : "──"}
                      </text>
                    )}

                    {/* Horizontal stub line connecting to bracket */}
                    <line
                      x1={config.startX + config.slotWidth}
                      y1={centerY}
                      x2={
                        t.isByeToFinal
                          ? config.finalColX
                          : t.isByeR1
                          ? config.r2ColX
                          : config.r1ColX
                      }
                      y2={centerY}
                      stroke={isHovered ? colors.highlightLine : colors.lineColor}
                      strokeWidth={1.5}
                    />
                  </g>
                );
              })}

              {/* ── 2. ROUND 1 BRACKET LINES & BADGES ── */}
              {poolTieData.r1.map((m) => {
                const y1 = getSlotCenterY(m.slotA);
                const y2 = getSlotCenterY(m.slotB);
                const midY = matchPositions[m.tie] || (y1 + y2) / 2;

                return (
                  <g key={m.tie}>
                    <line
                      x1={config.r1ColX}
                      y1={Math.min(y1, y2)}
                      x2={config.r1ColX}
                      y2={Math.max(y1, y2)}
                      stroke={colors.lineColor}
                      strokeWidth={1.5}
                    />
                    <line
                      x1={config.r1ColX}
                      y1={midY}
                      x2={config.r2ColX}
                      y2={midY}
                      stroke={colors.lineColor}
                      strokeWidth={1.5}
                    />
                    {renderMatchBadge(m.tie, config.r1ColX + 20, midY, "Round 1", colors, handleMatchClick)}
                  </g>
                );
              })}

              {/* ── 3. ROUND 2 BRACKET LINES & BADGES ── */}
              {poolTieData.r2.map((m) => {
                let yA = 0;
                let yB = 0;

                if ("byeSlot" in m && m.byeSlot && "prevTie" in m && m.prevTie) {
                  yA = getSlotCenterY(m.byeSlot);
                  yB = matchPositions[m.prevTie] || yA;
                } else if ("prevTieA" in m && m.prevTieA && m.prevTieB) {
                  yA = matchPositions[m.prevTieA] || 0;
                  yB = matchPositions[m.prevTieB] || 0;
                }

                const topY = Math.min(yA, yB);
                const botY = Math.max(yA, yB);
                const midY = matchPositions[m.tie] || (topY + botY) / 2;

                return (
                  <g key={m.tie}>
                    <line
                      x1={config.r2ColX}
                      y1={topY}
                      x2={config.r2ColX}
                      y2={botY}
                      stroke={colors.lineColor}
                      strokeWidth={1.5}
                    />
                    <line
                      x1={config.r2ColX}
                      y1={midY}
                      x2={config.r3ColX}
                      y2={midY}
                      stroke={colors.lineColor}
                      strokeWidth={1.5}
                    />
                    {renderMatchBadge(m.tie, config.r2ColX + 22, midY, "Round 2", colors, handleMatchClick)}
                  </g>
                );
              })}

              {/* ── 4. ROUND 3 (QUARTER-FINALS) ── */}
              {poolTieData.qf.map((m) => {
                const yA = matchPositions[m.tieA] || 100;
                const yB = matchPositions[m.tieB] || 100;
                const topY = Math.min(yA, yB);
                const botY = Math.max(yA, yB);
                const midY = matchPositions[m.tie] || (topY + botY) / 2;

                return (
                  <g key={m.tie}>
                    <line
                      x1={config.r3ColX}
                      y1={topY}
                      x2={config.r3ColX}
                      y2={botY}
                      stroke={colors.lineColor}
                      strokeWidth={1.5}
                    />
                    <line
                      x1={config.r3ColX}
                      y1={midY}
                      x2={config.r4ColX}
                      y2={midY}
                      stroke={colors.lineColor}
                      strokeWidth={1.5}
                    />
                    {renderMatchBadge(m.tie, config.r3ColX + 22, midY, "Pool Quarter-Final", colors, handleMatchClick)}
                  </g>
                );
              })}

              {/* ── 5. ROUND 4 (POOL SEMI-FINALS) ── */}
              {poolTieData.sf.map((m) => {
                const yA = matchPositions[m.tieA] || 100;
                const yB = matchPositions[m.tieB] || 100;
                const topY = Math.min(yA, yB);
                const botY = Math.max(yA, yB);
                const midY = matchPositions[m.tie] || (topY + botY) / 2;

                return (
                  <g key={m.tie}>
                    <line
                      x1={config.r4ColX}
                      y1={topY}
                      x2={config.r4ColX}
                      y2={botY}
                      stroke={colors.lineColor}
                      strokeWidth={1.5}
                    />
                    <line
                      x1={config.r4ColX}
                      y1={midY}
                      x2={config.r5ColX}
                      y2={midY}
                      stroke={colors.lineColor}
                      strokeWidth={1.5}
                    />
                    {renderMatchBadge(m.tie, config.r4ColX + 22, midY, "Pool Semi-Final", colors, handleMatchClick)}
                  </g>
                );
              })}

              {/* ── 6. CHALLENGER SEMI-FINAL MERGE AT r5ColX ── */}
              {(() => {
                const sf1 = poolTieData.sf[0].tie;
                const sf2 = poolTieData.sf[1].tie;
                const y1 = matchPositions[sf1] || 100;
                const y2 = matchPositions[sf2] || 100;
                const topY = Math.min(y1, y2);
                const botY = Math.max(y1, y2);
                const challengerMidY = (topY + botY) / 2;

                return (
                  <g key="challenger-merge">
                    <line
                      x1={config.r5ColX}
                      y1={topY}
                      x2={config.r5ColX}
                      y2={botY}
                      stroke={colors.lineColor}
                      strokeWidth={1.5}
                    />
                    <line
                      x1={config.r5ColX}
                      y1={challengerMidY}
                      x2={config.finalColX}
                      y2={challengerMidY}
                      stroke={colors.lineColor}
                      strokeWidth={1.5}
                    />
                  </g>
                );
              })()}

              {/* ── 7. ROUND 5: POOL FINAL AT finalColX (SEED vs CHALLENGER) ── */}
              {(() => {
                const pf = poolTieData.poolFinal;
                const seedY = getSlotCenterY(poolTieData.seedSlot);

                const sf1 = poolTieData.sf[0].tie;
                const sf2 = poolTieData.sf[1].tie;
                const y1 = matchPositions[sf1] || 100;
                const y2 = matchPositions[sf2] || 100;
                const challengerMidY = (y1 + y2) / 2;

                const topFinalY = Math.min(seedY, challengerMidY);
                const botFinalY = Math.max(seedY, challengerMidY);
                const poolFinalMidY = matchPositions[pf.tie] || (topFinalY + botFinalY) / 2;

                return (
                  <g key={pf.tie}>
                    {/* Vertical bracket at finalColX connecting Seed and Challenger */}
                    <line
                      x1={config.finalColX}
                      y1={topFinalY}
                      x2={config.finalColX}
                      y2={botFinalY}
                      stroke={colors.lineColor}
                      strokeWidth={1.5}
                    />

                    {/* Horizontal arrow line from finalColX to endArrowX */}
                    <line
                      x1={config.finalColX}
                      y1={poolFinalMidY}
                      x2={config.endArrowX}
                      y2={poolFinalMidY}
                      stroke={colors.lineColor}
                      strokeWidth={1.5}
                      markerEnd="url(#arrow)"
                    />

                    {/* Pool Final Match Badge */}
                    {renderMatchBadge(
                      pf.tie,
                      config.finalColX + 24,
                      poolFinalMidY,
                      "Pool Championship Final",
                      colors,
                      handleMatchClick,
                      true
                    )}

                    {/* Super Quarters Advance Card at endArrowX */}
                    <g
                      className="cursor-pointer group"
                      onClick={() =>
                        handleMatchClick(
                          poolTieData.superQfTie,
                          `Super Quarter-Final (Tie ${poolTieData.superQfTie})`
                        )
                      }
                    >
                      <rect
                        x={config.endArrowX + 8}
                        y={poolFinalMidY - 18}
                        width={105}
                        height={36}
                        rx={6}
                        fill={isPaper ? "#FFF7ED" : "#1A0E05"}
                        stroke="#FF5A16"
                        strokeWidth={1.5}
                        className="group-hover:fill-orange-100 dark:group-hover:fill-[#2A1508] transition-colors"
                      />
                      <text
                        x={config.endArrowX + 16}
                        y={poolFinalMidY - 3}
                        fill="#FF5A16"
                        fontSize="11"
                        fontWeight="900"
                        fontFamily="Arial, Helvetica, sans-serif"
                      >
                        TIE {poolTieData.superQfTie}
                      </text>
                      <text
                        x={config.endArrowX + 16}
                        y={poolFinalMidY + 11}
                        fill={isPaper ? "#9A3412" : "#FB923C"}
                        fontSize="8"
                        fontWeight="bold"
                        fontFamily="Arial, Helvetica, sans-serif"
                        letterSpacing="0.3px"
                      >
                        SUPER QUARTERS
                      </text>
                    </g>
                  </g>
                );
              })()}
            </svg>
          </div>
        </div>
      ) : (
        /* ═══ SUPER QUARTERS & PODIUM CHAMPIONSHIP STAGE ═══ */
        <div className="p-8 sm:p-12">
          <div className="max-w-5xl mx-auto space-y-8">
            <div className="text-center space-y-2">
              <span className="font-pixel text-xs text-[#00F0FF] uppercase tracking-wider">
                AIU SOUTH ZONE INTER-UNIVERSITY 2026-27
              </span>
              <h2 className="font-display text-3xl font-black uppercase text-[#F4E6CE]">
                SUPER QUARTERS &bull; SEMI-FINALS &bull; FINALS
              </h2>
              <p className="text-xs text-[#91A0AE] max-w-xl mx-auto">
                Official knockout progression from Pool Winners to the Championship Podium.
              </p>
            </div>

            {/* SUPER QUARTERS (TIES 95 - 98) */}
            <div className="space-y-4">
              <h3 className="font-pixel text-xs text-[#FF5A16] uppercase font-bold tracking-wider">
                STAGE 1: SUPER QUARTERS &bull; 20-10-2026 (09:00 AM)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { tie: 95, label: "Super QF 1", source: "Winner Pool A (Tie 91)", court: "Court 01" },
                  { tie: 96, label: "Super QF 2", source: "Winner Pool B (Tie 92)", court: "Court 02" },
                  { tie: 97, label: "Super QF 3", source: "Winner Pool C (Tie 93)", court: "Court 03" },
                  { tie: 98, label: "Super QF 4", source: "Winner Pool D (Tie 94)", court: "Court 04" },
                ].map((sq) => (
                  <div
                    key={sq.tie}
                    onClick={() => handleMatchClick(sq.tie, sq.label)}
                    className="p-4 rounded-xl border-2 bg-[#091024] border-[#18D8D0]/40 hover:border-[#FF5A16] cursor-pointer transition-all space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-pixel text-[11px] text-[#FF5A16] font-bold">Tie {sq.tie}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{sq.court}</span>
                    </div>
                    <div className="font-bold text-xs text-white">{sq.label}</div>
                    <div className="text-[11px] text-[#00F0FF]">{sq.source}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* SEMI-FINALS (TIES 99 & 100) */}
            <div className="space-y-4 pt-4 border-t border-[#18D8D0]/20">
              <h3 className="font-pixel text-xs text-[#00F0FF] uppercase font-bold tracking-wider">
                STAGE 2: SEMI-FINALS &bull; 20-10-2026 (03:00 PM)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { tie: 99, label: "Semi-Final 1", a: "Winner Tie 95", b: "Winner Tie 96", court: "Court 01" },
                  { tie: 100, label: "Semi-Final 2", a: "Winner Tie 97", b: "Winner Tie 98", court: "Court 02" },
                ].map((sf) => (
                  <div
                    key={sf.tie}
                    onClick={() => handleMatchClick(sf.tie, sf.label)}
                    className="p-5 rounded-2xl border-2 bg-[#0A122A] border-[#00F0FF]/40 hover:border-[#00F0FF] cursor-pointer transition-all space-y-3"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-blue-900/30">
                      <span className="font-pixel text-xs text-[#FF5A16] font-bold">
                        Tie {sf.tie} &bull; {sf.label}
                      </span>
                      <span className="font-mono text-xs text-[#00F0FF]">{sf.court} &bull; 03:00 PM</span>
                    </div>
                    <div className="space-y-2 text-xs">
                      <div className="p-2.5 rounded-lg bg-black/30 font-bold text-slate-200">{sf.a}</div>
                      <div className="p-2.5 rounded-lg bg-black/30 font-bold text-slate-200">{sf.b}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* FINALS & HARDLINE TIE (TIES 101 & 102) */}
            <div className="space-y-4 pt-4 border-t border-[#18D8D0]/20">
              <h3 className="font-pixel text-xs text-amber-400 uppercase font-bold tracking-wider">
                STAGE 3: FINALS &bull; 21-10-2026 (09:00 AM)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Grand Final */}
                <div
                  onClick={() => handleMatchClick(101, "Championship Final")}
                  className="p-6 rounded-2xl border-2 bg-[#211608] border-[#FFB800] shadow-[0_0_25px_rgba(255,184,0,0.25)] cursor-pointer transition-all space-y-3"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-amber-700/40">
                    <span className="font-pixel text-xs font-bold text-amber-400 flex items-center gap-1.5">
                      <Trophy className="w-4 h-4 fill-amber-400" />
                      <span>Tie 101 &bull; CHAMPIONSHIP FINAL</span>
                    </span>
                    <span className="font-pixel text-[10px] px-2 py-0.5 bg-[#FFB800] text-black font-bold rounded">
                      Court 01 &bull; 09:00 AM
                    </span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="p-2.5 rounded-lg bg-black/40 font-bold text-[#F4E6CE]">Winner of Tie 99 (Semi-Final 1)</div>
                    <div className="p-2.5 rounded-lg bg-black/40 font-bold text-[#F4E6CE]">Winner of Tie 100 (Semi-Final 2)</div>
                  </div>
                </div>

                {/* Hardline Tie (LSF - 3rd Place) */}
                <div
                  onClick={() => handleMatchClick(102, "Hardline Tie (LSF)")}
                  className="p-6 rounded-2xl border-2 bg-[#141208] border-amber-500/40 hover:border-amber-400 cursor-pointer transition-all space-y-3"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-amber-900/30">
                    <span className="font-pixel text-xs font-bold text-amber-500">
                      Tie 102 &bull; HARDLINE TIE (LSF - 3RD PLACE)
                    </span>
                    <span className="font-pixel text-[10px] px-2 py-0.5 bg-amber-950 text-amber-300 rounded border border-amber-600">
                      Court 02 &bull; 09:00 AM
                    </span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="p-2.5 rounded-lg bg-black/40 font-bold text-slate-300">Loser of Tie 99 (Semi-Final 1)</div>
                    <div className="p-2.5 rounded-lg bg-black/40 font-bold text-slate-300">Loser of Tie 100 (Semi-Final 2)</div>
                  </div>
                </div>
              </div>
            </div>

            {/* PRIZE DISTRIBUTION NOTE */}
            <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl text-center space-y-1">
              <span className="font-pixel text-xs text-amber-400 font-bold uppercase block">
                PRIZE DISTRIBUTION CEREMONY
              </span>
              <p className="text-xs text-slate-300">
                Follows the Championship Final and Hardline Tie on 21 October 2026.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ═══ MATCH DETAILS MODAL ═══ */}
      {selectedMatchModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div
            className={`w-full max-w-lg rounded-2xl p-6 border shadow-2xl relative ${
              isPaper
                ? "bg-white text-slate-900 border-blue-900"
                : "bg-[#090F24] text-[#F4E6CE] border-[#00F0FF]"
            }`}
          >
            <button
              onClick={() => setSelectedMatchModal(null)}
              className="absolute top-4 right-4 p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-1 bg-[#FF5A16] text-black font-pixel text-xs font-bold uppercase rounded">
                {selectedMatchModal.matchNumber}
              </span>
              <span className="font-pixel text-xs text-[#00F0FF] uppercase">
                {selectedMatchModal.roundName} &bull; POOL {selectedMatchModal.pool}
              </span>
            </div>

            <h3 className="font-display text-xl font-bold uppercase tracking-tight mt-2 mb-4">
              Match Telemetry &amp; Lineup
            </h3>

            <div className="space-y-3 p-4 bg-black/10 dark:bg-black/30 rounded-xl border border-blue-900/30 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500 font-pixel">STAGE:</span>
                <span className="font-bold">{selectedMatchModal.roundName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-pixel">STATUS:</span>
                <span className="font-bold text-amber-500">
                  {selectedMatchModal.liveInfo?.status || "UPCOMING"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-pixel">COURT:</span>
                <span className="font-bold">{selectedMatchModal.liveInfo?.court || "Official Court"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-pixel">TIME:</span>
                <span className="font-bold">{selectedMatchModal.liveInfo?.time || "Scheduled"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-pixel">TEAM A:</span>
                <span className="font-bold">{selectedMatchModal.liveInfo?.playerA || "TBD"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-pixel">TEAM B:</span>
                <span className="font-bold">{selectedMatchModal.liveInfo?.playerB || "TBD"}</span>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setSelectedMatchModal(null)}
                className="px-4 py-2 border rounded-lg font-pixel text-xs font-bold"
              >
                CLOSE
              </button>
              <Link
                href={`/matches/${selectedMatchModal.matchNumber.replace(/\s+/g, "")}`}
                className="px-4 py-2 bg-[#FF5A16] text-black font-pixel text-xs font-bold uppercase rounded flex items-center gap-1.5 shadow"
              >
                <span>OPEN MATCH DESK</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ═══ SLOT ASSIGNMENT MODAL (ADMIN ONLY) ═══ */}
      {assignModalSlot && isAdmin && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div
            className={`w-full max-w-md rounded-2xl p-6 border shadow-2xl relative ${
              isPaper
                ? "bg-white text-slate-900 border-blue-900 shadow-blue-900/20"
                : "bg-[#090F24] text-[#F4E6CE] border-[#00F0FF]/50 shadow-[#00F0FF]/10"
            }`}
          >
            <button
              onClick={() => setAssignModalSlot(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-1 bg-[#FF5A16] text-black font-pixel text-xs font-bold uppercase rounded">
                POOL {activePool} &bull; SLOT #{assignModalSlot.slot}
              </span>
            </div>

            <h3 className="font-display text-lg font-bold uppercase tracking-tight mt-1 mb-4">
              {assignModalSlot.name ? "Edit / Reassign Slot" : "Enter Team Number to Fill Slot"}
            </h3>

            <div className="space-y-3">
              <div>
                <label className="font-pixel text-[10px] text-slate-400 uppercase tracking-wider block mb-1">
                  ENTER STATE CODE (e.g. AP - 01, KA - 01), OR UNIVERSITY
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="e.g. AP - 01 or Bangalore..."
                    value={teamNumberInput}
                    onChange={(e) => {
                      setTeamNumberInput(e.target.value);
                      searchTeam(e.target.value);
                    }}
                    autoFocus
                    className={`w-full px-3.5 py-2.5 rounded-lg text-sm font-sans focus:outline-none transition-all ${
                      isPaper
                        ? "bg-slate-100 border border-slate-300 text-slate-900 focus:border-blue-600 focus:bg-white"
                        : "bg-[#050A18] border border-[#1A2644] text-[#F4E6CE] focus:border-[#FF5A16] focus:bg-[#080F24]"
                    }`}
                  />
                  {isFetchingTeam && (
                    <RefreshCw className="w-4 h-4 text-[#FF5A16] animate-spin absolute right-3 top-3" />
                  )}
                </div>
              </div>

              {fetchedTeam && (
                <div
                  className={`p-3.5 rounded-xl border space-y-2 text-xs transition-all ${
                    isPaper
                      ? "bg-blue-50 border-blue-200 text-slate-800"
                      : "bg-[#0D1836] border-[#00F0FF]/30 text-[#E0E7FF]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-pixel text-xs font-bold text-[#FF5A16]">
                      TEAM {formatTeamCode(fetchedTeam.teamCode)}
                    </span>
                  </div>
                  <div>
                    <span className="font-pixel text-[10px] text-slate-400 uppercase block">UNIVERSITY</span>
                    <strong className="text-sm font-bold block">{fetchedTeam.name}</strong>
                  </div>
                </div>
              )}

              {assignError && (
                <p className="font-pixel text-xs text-[#FF2A6D] bg-[#FF2A6D]/10 p-2.5 rounded border border-[#FF2A6D]/30">
                  {assignError}
                </p>
              )}
            </div>

            <div className="mt-5 flex items-center justify-between gap-2 border-t pt-4 border-slate-200 dark:border-blue-900/40">
              {assignModalSlot.teamId ? (
                <button
                  type="button"
                  onClick={handleUnassignSlot}
                  disabled={isAssigning}
                  className="px-3 py-2 bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-500/40 font-pixel text-xs font-bold uppercase rounded transition-colors"
                >
                  CLEAR SLOT
                </button>
              ) : (
                <div />
              )}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setAssignModalSlot(null)}
                  disabled={isAssigning}
                  className="px-3.5 py-2 border rounded-lg font-pixel text-xs text-slate-400 hover:text-slate-200 transition-colors"
                >
                  CANCEL
                </button>
                <button
                  type="button"
                  onClick={handleConfirmAssign}
                  disabled={!fetchedTeam || isAssigning}
                  className="px-4 py-2 bg-[#FF5A16] hover:bg-[#ff6a2d] disabled:opacity-50 text-black font-pixel text-xs font-bold uppercase rounded shadow transition-all flex items-center gap-1.5"
                >
                  {isAssigning && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>FILL SLOT #{assignModalSlot.slot}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function renderMatchBadge(
  tieNum: number,
  x: number,
  y: number,
  roundName: string,
  colors: any,
  onClick: (tieNum: number, roundName: string) => void,
  isSpecialFinal = false
) {
  const badgeWidth = isSpecialFinal ? 38 : 28;
  const badgeHeight = 18;

  return (
    <g
      className="cursor-pointer group"
      onClick={() => onClick(tieNum, roundName)}
    >
      <rect
        x={x - badgeWidth / 2}
        y={y - badgeHeight / 2}
        width={badgeWidth}
        height={badgeHeight}
        rx={2}
        fill={colors.badgeBg}
        stroke={isSpecialFinal ? "#FF5A16" : colors.badgeBorder}
        strokeWidth={1.5}
        className="group-hover:fill-blue-50 dark:group-hover:fill-[#15234A] transition-colors"
      />
      <text
        x={x}
        y={y + 4}
        textAnchor="middle"
        fill={isSpecialFinal ? "#FF5A16" : colors.badgeText}
        fontSize="9"
        fontWeight="800"
        fontFamily="Arial, Helvetica, sans-serif"
      >
        {tieNum}
      </text>
    </g>
  );
}

/**
 * Format team display string:
 * - Eliminates duplicate state strings (e.g. "Karnataka, Karnataka")
 * - Smartly splits long institution names into two balanced lines if needed
 * - Preserves complete fullText for hover tooltip
 */
function formatTeamSlot(
  displayIdentifier: string | number,
  rawName: string,
  state?: string,
  seed?: number
): { line1: string; line2?: string; fullText: string } {
  let cleanName = (rawName || "").trim();

  // Deduplicate state: if state is already in name, do not append
  if (state && state.trim()) {
    const st = state.trim().toLowerCase();
    if (!cleanName.toLowerCase().includes(st)) {
      cleanName = `${cleanName}, ${state.trim()}`;
    }
  }

  const seedSuffix = seed ? ` [Seed #${seed}]` : "";
  const fullText = `${displayIdentifier}. ${cleanName}${seedSuffix}`;

  // If text fits in a single line (<= 52 chars), keep it single-line
  if (fullText.length <= 52) {
    return { line1: fullText, fullText };
  }

  // Find a smart split point around 40-56 chars, preferring a comma
  const maxCharsL1 = 56;
  const commaIdx = fullText.lastIndexOf(",", maxCharsL1);
  if (commaIdx >= 28) {
    return {
      line1: fullText.slice(0, commaIdx + 1),
      line2: fullText.slice(commaIdx + 1).trim(),
      fullText,
    };
  }

  // Fallback: split at space
  const spaceIdx = fullText.lastIndexOf(" ", maxCharsL1);
  if (spaceIdx >= 28) {
    return {
      line1: fullText.slice(0, spaceIdx),
      line2: fullText.slice(spaceIdx + 1).trim(),
      fullText,
    };
  }

  return {
    line1: fullText.slice(0, maxCharsL1),
    line2: fullText.slice(maxCharsL1).trim(),
    fullText,
  };
}
