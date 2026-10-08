"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Trophy,
  Flame,
  Clock,
  CheckCircle2,
  RefreshCw,
  AlertTriangle,
  ChevronRight,
} from "lucide-react";

export default function SpocMatchesPage() {
  const [data, setData] = useState<{
    live: any[];
    upcoming: any[];
    completed: any[];
    total: number;
  }>({
    live: [],
    upcoming: [],
    completed: [],
    total: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>("");

  const fetchMatches = useCallback(async () => {
    try {
      const res = await fetch("/api/spoc/matches");
      if (!res.ok) {
        if (res.status === 403) throw new Error("403 Forbidden: Access restricted to authorized SPOC.");
        throw new Error("Failed to load matches.");
      }
      const json = await res.json();
      if (json.success) {
        setData(json.matches || { live: [], upcoming: [], completed: [], total: 0 });
        setLastUpdated(new Date().toLocaleTimeString("en-IN", { hour12: false }));
      } else {
        throw new Error(json.error || "Failed to load matches.");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMatches();
    // Auto-poll every 5 seconds for live court scores
    const interval = setInterval(fetchMatches, 5000);
    return () => clearInterval(interval);
  }, [fetchMatches]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-[#1E293B] pb-4">
        <div>
          <span className="font-pixel text-[10px] text-[#818CF8] uppercase tracking-wider block">
            TOURNAMENT SCHEDULE MONITOR
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-wide">
            ASSIGNED TEAM MATCHES ({data.total})
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Real-time court match feed and fixtures for your 4 assigned university contingents.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400 hidden sm:inline">
            Live auto-sync ({lastUpdated})
          </span>
          <button
            onClick={fetchMatches}
            className="p-2 bg-[#0B0F17] hover:bg-[#1E293B] text-gray-300 rounded border border-[#1E293B] transition-colors"
            title="Refresh Fixtures"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-gray-400 font-pixel text-xs animate-pulse">
          CONNECTING TO LIVE COURT FEED...
        </div>
      ) : error ? (
        <div className="p-6 bg-red-950/20 border border-red-500/30 text-red-400 text-xs text-center font-pixel">
          {error}
        </div>
      ) : (
        <div className="space-y-6">
          {/* ── 1. LIVE MATCHES (PRIORITIZED AT TOP) ── */}
          {data.live.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                <h2 className="font-pixel text-sm text-red-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-red-500" />
                  LIVE ON COURT ({data.live.length})
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.live.map((m) => (
                  <div
                    key={m.id}
                    className="p-5 bg-gradient-to-br from-[#1A0B10] via-[#0B0F17] to-[#07090E] border-2 border-red-500/80 rounded shadow-[0_0_20px_rgba(239,68,68,0.25)] space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 bg-red-500 text-white font-pixel text-[10px] tracking-wider uppercase flex items-center gap-1">
                        <Flame className="w-3 h-3" />
                        LIVE
                      </span>
                      <span className="font-pixel text-xs text-[#00F0FF]">{m.court}</span>
                    </div>

                    <div className="flex items-center justify-between py-2 border-y border-red-500/30">
                      <div>
                        <p className="font-bold text-white text-base">
                          {m.assignedTeam?.name || "Assigned Team"}
                        </p>
                        <p className="text-xs text-gray-400">vs {m.opponent}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-pixel text-2xl text-red-400 font-bold">
                          {m.scoreDisplay}
                        </p>
                        <p className="text-[10px] text-gray-400">{m.category}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-emerald-400 font-pixel text-[11px]">
                        STATUS: {m.leaderText}
                      </span>
                      {m.assignedTeam?.id && (
                        <Link
                          href={`/spoc/teams/${m.assignedTeam.id}`}
                          className="text-xs text-[#818CF8] hover:underline flex items-center gap-1"
                        >
                          <span>Team Overview</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── 2. UPCOMING MATCHES ── */}
          <div className="space-y-3">
            <h2 className="font-pixel text-sm text-white tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#6366F1]" />
              UPCOMING FIXTURES ({data.upcoming.length})
            </h2>

            {data.upcoming.length === 0 ? (
              <div className="p-6 bg-[#0B0F17] border border-[#1E293B] rounded text-center text-xs text-gray-500">
                No upcoming matches currently scheduled for your 4 assigned teams.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {data.upcoming.map((m) => (
                  <div
                    key={m.id}
                    className="p-4 bg-[#0B0F17] border border-[#1E293B] hover:border-[#334155] rounded flex items-center justify-between text-xs transition-colors"
                  >
                    <div>
                      <span className="font-pixel text-[10px] text-gray-400 block">
                        {m.matchNumber} • {m.category}
                      </span>
                      <p className="font-bold text-white text-sm mt-0.5">
                        {m.assignedTeam?.name} vs {m.opponent}
                      </p>
                      <p className="text-gray-400 text-[11px] mt-0.5">{m.court} • KLE Tech Indoor Stadium</p>
                    </div>

                    <div className="text-right">
                      <span className="font-pixel text-sm text-[#818CF8] font-bold block">
                        {m.time}
                      </span>
                      <span className="px-2 py-0.5 bg-[#1E293B] text-gray-300 font-pixel text-[9px] uppercase rounded">
                        {m.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── 3. COMPLETED MATCHES ── */}
          <div className="space-y-3">
            <h2 className="font-pixel text-sm text-white tracking-wider flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              COMPLETED MATCHES ({data.completed.length})
            </h2>

            {data.completed.length === 0 ? (
              <div className="p-6 bg-[#0B0F17] border border-[#1E293B] rounded text-center text-xs text-gray-500">
                No completed matches recorded yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {data.completed.map((m) => (
                  <div
                    key={m.id}
                    className="p-4 bg-[#0B0F17] border border-[#1E293B] rounded flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-pixel text-[10px] text-gray-400 block">
                        {m.matchNumber} • {m.court}
                      </span>
                      <p className="font-bold text-white text-sm mt-0.5">
                        {m.assignedTeam?.name} vs {m.opponent}
                      </p>
                      <p className="text-gray-400 text-[11px]">Final Result</p>
                    </div>

                    <div className="text-right">
                      <span className="font-pixel text-base text-white font-bold block">
                        {m.scoreDisplay}
                      </span>
                      <span
                        className={`font-pixel text-[10px] uppercase font-bold ${
                          m.resultText === "WIN" ? "text-emerald-400" : "text-red-400"
                        }`}
                      >
                        RESULT: {m.resultText}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
