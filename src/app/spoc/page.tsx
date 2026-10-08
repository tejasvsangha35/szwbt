"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Users,
  Trophy,
  Phone,
  PhoneCall,
  Flame,
  CheckCircle2,
  AlertTriangle,
  Clock,
  MapPin,
  Bus,
  Home,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  AlertCircle,
  ShieldAlert,
} from "lucide-react";
import { SpocTeamCard, EscalationAuthority } from "@/lib/spoc/service";
import { formatTeamCode } from "@/lib/team/format";

export default function SpocDashboardPage() {
  const [data, setData] = useState<{
    spoc: { id: string; name: string; email: string; phone?: string; badge: string };
    assignedCount: number;
    isComplete: boolean;
    statusText: string;
    teams: SpocTeamCard[];
    escalationAuthorities: EscalationAuthority[];
  } | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<string>("");

  const fetchOverview = useCallback(async () => {
    try {
      const res = await fetch("/api/spoc");
      if (!res.ok) {
        if (res.status === 403) {
          throw new Error("403 Forbidden: You do not have clearance for the SPOC dashboard.");
        }
        const errorJson = await res.json().catch(() => null);
        throw new Error(errorJson?.error || errorJson?.details || `HTTP ${res.status}: Failed to load SPOC dashboard.`);
      }
      const json = await res.json();
      if (json.success) {
        setData(json);
        setError(null);
        setLastRefreshed(new Date().toLocaleTimeString("en-IN", { hour12: false }));
      } else {
        throw new Error(json.error || "Failed to load dashboard data.");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOverview();
    // Live polling every 6 seconds for match scores
    const interval = setInterval(fetchOverview, 6000);
    return () => clearInterval(interval);
  }, [fetchOverview]);

  if (loading) {
    return (
      <div className="p-12 text-center space-y-4">
        <div className="w-10 h-10 border-2 border-[#6366F1] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="font-pixel text-xs text-gray-400">CONNECTING TO LIVE SPOC TELEMETRY...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 max-w-lg mx-auto bg-red-950/20 border-2 border-red-500/40 text-center space-y-3">
        <AlertTriangle className="w-8 h-8 text-red-400 mx-auto" />
        <h2 className="font-pixel text-sm text-red-400">ACCESS RESTRICTION</h2>
        <p className="text-xs text-gray-300">{error}</p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={() => {
              setLoading(true);
              setError(null);
              fetchOverview();
            }}
            className="px-4 py-1.5 bg-[#6366F1] hover:bg-[#4F46E5] text-xs font-pixel text-white border border-[#818CF8]"
          >
            RETRY
          </button>
          <Link
            href="/login"
            className="px-4 py-1.5 bg-[#1E293B] hover:bg-[#334155] text-xs font-pixel text-white border border-gray-600"
          >
            RETURN TO LOGIN
          </Link>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { spoc, teams, isComplete, statusText, escalationAuthorities } = data;
  const liveTeams = teams.filter((t) => t.operationalStatus === "LIVE");

  return (
    <div className="space-y-6">
      {/* ── 1. SPOC TOP IDENTITY HUD ── */}
      <div className="p-5 sm:p-6 bg-[#0B0F17] border-2 border-[#1E293B] shadow-lg flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[#1E1B4B] border-2 border-[#6366F1] flex items-center justify-center font-pixel text-base text-[#818CF8] shadow-[0_0_16px_rgba(99,102,241,0.4)]">
            {spoc.name[0]?.toUpperCase() || "S"}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-pixel text-[10px] text-[#818CF8] uppercase tracking-wider">
                COORDINATOR IDENTITY
              </span>
              <span
                className={`px-1.5 py-0.5 font-pixel text-[8px] uppercase border ${
                  isComplete
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                    : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                }`}
              >
                {statusText}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-wide">{spoc.name}</h1>
            <p className="text-xs text-gray-400 mt-0.5">{spoc.email}</p>
          </div>
        </div>

        {/* Teams Metric Pill */}
        <div className="flex items-center gap-4">
          <div className="px-4 py-2 bg-[#07090E] border border-[#1E293B] text-center min-w-[110px]">
            <span className="block font-pixel text-[9px] text-gray-400 uppercase">MY TEAMS</span>
            <span className="font-pixel text-2xl text-[#6366F1]">{teams.length}</span>
            <span className="block text-[9px] text-gray-500">ASSIGNED</span>
          </div>

          <button
            onClick={fetchOverview}
            className="p-2.5 bg-[#1E293B] hover:bg-[#334155] text-gray-300 hover:text-white rounded border border-[#334155] transition-colors"
            title="Refresh Live Status"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── 2. INCOMPLETE ASSIGNMENT WARNING ── */}
      {!isComplete && (
        <div className="p-4 bg-amber-500/10 border-l-4 border-amber-500 text-amber-300 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <p className="font-semibold">No teams currently assigned to this account.</p>
              <p className="text-amber-400/80 text-[11px]">
                Please contact the tournament secretariat to configure your assigned university contingents.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── 3. LIVE MATCH PRIORITY SPOTLIGHT (IF ANY TEAM IS PLAYING) ── */}
      {liveTeams.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
            <span className="font-pixel text-xs text-red-400 uppercase tracking-widest">
              LIVE COURT ACTION // PRIORITY MONITOR
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {liveTeams.map((team) => {
              const live = team.liveMatch;
              if (!live) return null;
              return (
                <div
                  key={`live-${team.id}`}
                  className="p-5 bg-gradient-to-br from-[#1A0B10] via-[#0B0F17] to-[#07090E] border-2 border-red-500/70 shadow-[0_0_20px_rgba(239,68,68,0.25)] space-y-3 rounded"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 bg-red-500 text-white font-pixel text-[10px] tracking-wider uppercase animate-pulse flex items-center gap-1.5">
                      <Flame className="w-3 h-3" />
                      MATCH: LIVE
                    </span>
                    <span className="font-pixel text-xs text-[#00F0FF]">{live.court}</span>
                  </div>

                  <div className="flex items-center justify-between py-2 border-y border-red-500/30">
                    <div>
                      <p className="font-bold text-base text-white">{team.name}</p>
                      <p className="text-xs text-gray-400">{team.institution}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-pixel text-2xl text-red-400 font-bold">
                        {live.scoreTeam} <span className="text-gray-500 text-lg">-</span> {live.scoreOpponent}
                      </p>
                      <p className="text-[11px] text-gray-300">vs {live.opponent}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-emerald-400 font-semibold font-pixel text-[11px]">
                      STATUS: {live.leaderText}
                    </span>
                    <Link
                      href={`/spoc/teams/${team.id}`}
                      className="text-xs text-[#818CF8] hover:underline flex items-center gap-1"
                    >
                      <span>Match Console</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── 4. THE 4 ASSIGNED TEAMS GRID ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-pixel text-sm text-white tracking-wider flex items-center gap-2">
            <Users className="w-4 h-4 text-[#6366F1]" />
            ASSIGNED TEAMS ({teams.length} / 4)
          </h2>
          <span className="text-xs text-gray-500">Live sync at {lastRefreshed}</span>
        </div>

        {teams.length === 0 ? (
          <div className="p-12 text-center border-2 border-dashed border-[#1E293B] bg-[#0B0F17] space-y-2">
            <Users className="w-8 h-8 text-gray-500 mx-auto" />
            <p className="font-pixel text-xs text-gray-400">Your teams have not been assigned yet.</p>
            <p className="text-xs text-gray-500">
              Please contact the event administrator to receive your 4 assigned university contingents.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {teams.map((team) => {
              // Status Badge Styling
              let statusBg = "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
              if (team.operationalStatus === "LIVE") {
                statusBg = "bg-red-500/20 text-red-400 border-red-500/50 animate-pulse";
              } else if (team.operationalStatus === "ATTENTION") {
                statusBg = "bg-amber-500/20 text-amber-400 border-amber-500/50";
              } else if (team.operationalStatus === "COMPLETED") {
                statusBg = "bg-blue-500/10 text-blue-400 border-blue-500/30";
              }

              return (
                <div
                  key={team.id}
                  className="p-5 bg-[#0B0F17] border-2 border-[#1E293B] hover:border-[#334155] rounded shadow-md transition-all flex flex-col justify-between space-y-4"
                >
                  {/* Team Header */}
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] text-gray-400 font-pixel uppercase tracking-wider block">
                          {formatTeamCode(team.teamCode)} • {team.state}
                        </span>
                        <h3 className="text-base font-bold text-white hover:text-[#818CF8] transition-colors">
                          <Link href={`/spoc/teams/${team.id}`}>{team.name}</Link>
                        </h3>
                        <p className="text-xs text-gray-300 font-medium">{team.institution}</p>
                      </div>

                      {/* Operational Status Badge */}
                      <span className={`px-2.5 py-1 font-pixel text-[10px] uppercase border ${statusBg}`}>
                        {team.operationalStatus}
                      </span>
                    </div>

                    <p className="text-[11px] text-gray-400 italic mt-1.5">{team.statusReason}</p>
                  </div>

                  {/* Operational Telemetry Details */}
                  <div className="grid grid-cols-2 gap-2 text-xs py-3 border-y border-[#1E293B] bg-[#07090E]/60 p-2.5 rounded">
                    {/* Next Match / Current Match */}
                    <div className="space-y-1">
                      <span className="text-[10px] text-gray-400 font-pixel block flex items-center gap-1">
                        <Trophy className="w-3 h-3 text-[#6366F1]" />
                        {team.operationalStatus === "LIVE" ? "CURRENT MATCH" : "NEXT MATCH"}
                      </span>
                      {team.liveMatch ? (
                        <p className="font-semibold text-red-400 text-xs">
                          LIVE | {team.liveMatch.court}
                        </p>
                      ) : team.nextMatch ? (
                        <p className="font-medium text-white text-xs truncate">
                          {team.nextMatch.time} • {team.nextMatch.court}
                        </p>
                      ) : team.completedMatch ? (
                        <p className="text-gray-400 text-xs">Concluded ({team.completedMatch.scoreFinal})</p>
                      ) : (
                        <p className="text-gray-500 text-xs">No upcoming fixture</p>
                      )}
                    </div>

                    {/* Transport Status */}
                    <div className="space-y-1">
                      <span className="text-[10px] text-gray-400 font-pixel block flex items-center gap-1">
                        <Bus className="w-3 h-3 text-[#00F0FF]" />
                        TRANSPORT
                      </span>
                      <span
                        className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-pixel uppercase ${
                          team.transportStatus === "ARRIVED"
                            ? "text-emerald-400 bg-emerald-500/10"
                            : team.transportStatus === "DELAYED"
                            ? "text-red-400 bg-red-500/10"
                            : "text-amber-400 bg-amber-500/10"
                        }`}
                      >
                        {team.transportStatus}
                      </span>
                    </div>

                    {/* Accommodation Status */}
                    <div className="space-y-1 pt-1">
                      <span className="text-[10px] text-gray-400 font-pixel block flex items-center gap-1">
                        <Home className="w-3 h-3 text-amber-400" />
                        ACCOMMODATION
                      </span>
                      <span
                        className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-pixel uppercase ${
                          team.accommodationStatus === "CHECKED-IN"
                            ? "text-emerald-400 bg-emerald-500/10"
                            : "text-amber-400 bg-amber-500/10"
                        }`}
                      >
                        {team.accommodationStatus}
                      </span>
                    </div>

                    {/* Team ID */}
                    <div className="space-y-1 pt-1">
                      <span className="text-[10px] text-gray-400 font-pixel block">TEAM ID (STATE CODE)</span>
                      <span className="text-amber-400 font-mono text-xs font-bold truncate block">
                        {formatTeamCode(team.teamCode || team.id)}
                      </span>
                    </div>
                  </div>

                  {/* Team Contact & Actions */}
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <div className="text-xs">
                      <span className="text-[10px] text-gray-400 block font-pixel">COACH / MANAGER:</span>
                      <span className="font-semibold text-white block">
                        {team.managerName || "Not Provided"}
                      </span>
                      {team.managerPhone ? (
                        <span className="block text-[11px] text-emerald-400 font-mono">
                          {team.managerPhone}
                        </span>
                      ) : (
                        <span className="block text-[10px] text-gray-500 italic">Contact Not Provided</span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Clickable tel: Call button */}
                      {team.managerPhone ? (
                        <a
                          href={`tel:${team.managerPhone}`}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-pixel text-[11px] rounded transition-colors shadow-sm"
                        >
                          <Phone className="w-3 h-3" />
                          <span>CALL</span>
                        </a>
                      ) : team.captainPhone ? (
                        <a
                          href={`tel:${team.captainPhone}`}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-pixel text-[11px] rounded transition-colors shadow-sm"
                        >
                          <Phone className="w-3 h-3" />
                          <span>CALL</span>
                        </a>
                      ) : (
                        <span className="text-[10px] text-gray-500 italic">No Phone</span>
                      )}

                      <Link
                        href={`/spoc/teams/${team.id}`}
                        className="flex items-center gap-1 px-3 py-1.5 bg-[#1E293B] hover:bg-[#334155] text-white font-pixel text-[11px] rounded border border-gray-600 transition-colors"
                      >
                        <span>OVERVIEW</span>
                        <ChevronRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── 5. OFFICIAL ESCALATION WORKFLOW ACCORDION ── */}
      <div className="p-5 bg-[#0B0F17] border border-[#1E293B] rounded space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <h3 className="font-pixel text-xs text-white uppercase tracking-wider">
              OFFICIAL ISSUE ESCALATION PROTOCOL
            </h3>
          </div>
          <Link href="/spoc/contacts" className="text-xs text-[#818CF8] hover:underline font-pixel">
            VIEW FULL DIRECTORY →
          </Link>
        </div>

        <p className="text-xs text-gray-400">
          As a SPOC, you are the first coordination point. Identify, communicate, and immediately escalate issues to the appropriate operational authority below:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-2">
          {escalationAuthorities.slice(0, 3).map((auth) => (
            <div
              key={auth.department}
              className="p-3 bg-[#07090E] border border-[#1E293B] rounded flex flex-col justify-between space-y-1.5"
            >
              <div>
                <span className="font-pixel text-[9px] text-[#818CF8] uppercase block">
                  {auth.department} ISSUE
                </span>
                <p className="text-xs font-semibold text-white">{auth.title}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">{auth.contactName}</p>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-[#1E293B] text-[10px]">
                <a
                  href={`tel:${auth.phone}`}
                  className="text-emerald-400 hover:underline flex items-center gap-1"
                >
                  <PhoneCall className="w-3 h-3" />
                  <span>{auth.phone}</span>
                </a>
                <a href={`mailto:${auth.email}`} className="text-gray-400 hover:text-white">
                  Email
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
