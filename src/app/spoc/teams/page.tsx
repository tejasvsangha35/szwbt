"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Users,
  Search,
  Trophy,
  Phone,
  Bus,
  Home,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  RefreshCw,
  ExternalLink,
  Copy,
  Check,
} from "lucide-react";
import { SpocTeamCard } from "@/lib/spoc/service";
import { formatTeamCode } from "@/lib/team/format";

export default function SpocMyTeamsPage() {
  const [teams, setTeams] = useState<SpocTeamCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copiedPhone, setCopiedPhone] = useState<string | null>(null);

  const handleCopyPhone = useCallback((phone: string) => {
    if (!phone) return;
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(phone);
    } else {
      const textarea = document.createElement("textarea");
      textarea.value = phone;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand("copy");
      } catch (e) {
        console.error("Copy failed", e);
      }
      document.body.removeChild(textarea);
    }
    setCopiedPhone(phone);
    setTimeout(() => setCopiedPhone(null), 2000);
  }, []);

  const fetchTeams = useCallback(async () => {
    try {
      const res = await fetch("/api/spoc/teams");
      if (!res.ok) {
        if (res.status === 403) throw new Error("403 Forbidden: Access restricted to authorized SPOC.");
        throw new Error("Failed to load assigned teams.");
      }
      const json = await res.json();
      if (json.success) {
        setTeams(json.teams || []);
      } else {
        throw new Error(json.error || "Failed to load teams.");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  const filteredTeams = teams.filter((t) => {
    const q = search.trim().toLowerCase();
    const qClean = q.replace(/[^a-z0-9]/g, "");
    return (
      t.name.toLowerCase().includes(q) ||
      t.institution.toLowerCase().includes(q) ||
      t.teamCode.toLowerCase().includes(q) ||
      formatTeamCode(t.teamCode).toLowerCase().includes(q) ||
      (qClean.length > 0 && t.teamCode.toLowerCase().replace(/[^a-z0-9]/g, "").includes(qClean))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-[#1E293B] pb-4">
        <div>
          <span className="font-pixel text-[10px] text-[#818CF8] uppercase tracking-wider block">
            MY CONTINGENTS
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-wide">
            ASSIGNED TEAMS ({teams.length})
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">
            You have read-only access to monitoring and coordination for your assigned contingents.
          </p>
        </div>

        <button
          onClick={fetchTeams}
          className="p-2 bg-[#0B0F17] hover:bg-[#1E293B] text-gray-300 rounded border border-[#1E293B] transition-colors"
          title="Refresh Teams"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Search Input */}
      <div className="flex items-center gap-2.5 p-3 bg-[#0B0F17] border border-[#1E293B] rounded">
        <Search className="w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Filter your assigned teams by name, university, or state code (e.g. AP - 01)..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-transparent text-xs text-white placeholder-gray-500 focus:outline-none"
        />
      </div>

      {/* Teams Grid / Cards */}
      {loading ? (
        <div className="p-12 text-center text-gray-400 font-pixel text-xs animate-pulse">
          LOADING YOUR ASSIGNED CONTINGENTS...
        </div>
      ) : error ? (
        <div className="p-6 bg-red-950/20 border border-red-500/30 text-red-400 text-xs text-center font-pixel">
          {error}
        </div>
      ) : teams.length === 0 ? (
        <div className="p-12 text-center border-2 border-dashed border-[#1E293B] bg-[#0B0F17] rounded space-y-2">
          <Users className="w-8 h-8 text-gray-500 mx-auto" />
          <p className="font-pixel text-xs text-gray-400">Your teams have not been assigned yet.</p>
          <p className="text-xs text-gray-500">
            Please contact the tournament administrator to receive your 4 team allocations.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTeams.map((team) => (
            <div
              key={team.id}
              className="p-5 bg-[#0B0F17] border-2 border-[#1E293B] hover:border-[#334155] rounded shadow transition-all space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="font-pixel text-[10px] text-gray-400 uppercase tracking-wider block">
                    {formatTeamCode(team.teamCode)} • {team.state}
                  </span>
                  <h2 className="text-base font-bold text-white hover:text-[#818CF8]">
                    <Link href={`/spoc/teams/${team.id}`}>{team.name}</Link>
                  </h2>
                  <p className="text-xs text-gray-300 font-medium">{team.institution}</p>
                </div>

                <span
                  className={`px-2 py-0.5 rounded font-pixel text-[9px] uppercase border ${
                    team.operationalStatus === "LIVE"
                      ? "bg-red-500/20 text-red-400 border-red-500/50"
                      : team.operationalStatus === "ATTENTION"
                      ? "bg-amber-500/20 text-amber-400 border-amber-500/50"
                      : team.operationalStatus === "COMPLETED"
                      ? "bg-blue-500/10 text-blue-400 border-blue-500/30"
                      : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                  }`}
                >
                  {team.operationalStatus}
                </span>
              </div>

              {/* Status Row */}
              <div className="grid grid-cols-3 gap-2 p-2.5 bg-[#07090E] border border-[#1E293B] rounded text-[11px]">
                <div>
                  <span className="text-gray-400 block text-[9px] font-pixel">REGISTRATION</span>
                  <span
                    className={`font-semibold ${
                      team.registrationStatus === "COMPLETED"
                        ? "text-emerald-400"
                        : team.registrationStatus === "PENDING_VERIFICATION"
                        ? "text-blue-400"
                        : "text-amber-400"
                    }`}
                  >
                    {team.registrationStatus}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[9px] font-pixel">TRANSPORT</span>
                  <span
                    className={`font-semibold ${
                      team.transportStatus === "ARRIVED"
                        ? "text-emerald-400"
                        : team.transportStatus === "DELAYED"
                        ? "text-red-400"
                        : "text-white"
                    }`}
                  >
                    {team.transportStatus}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[9px] font-pixel">ACCOMMODATION</span>
                  <span
                    className={`font-semibold ${
                      team.accommodationStatus === "CHECKED-IN"
                        ? "text-emerald-400"
                        : team.accommodationStatus === "NOT ALLOCATED" ||
                          team.accommodationStatus === "PENDING CHECK-IN"
                        ? "text-amber-400"
                        : "text-blue-400"
                    }`}
                  >
                    {team.accommodationStatus}
                  </span>
                </div>
              </div>

              {/* Next Match / Current Status */}
              <div className="flex items-center justify-between text-xs py-1">
                <span className="text-gray-400">Match Schedule:</span>
                <span className="font-semibold text-white">
                  {team.liveMatch ? (
                    <span className="text-red-400 font-pixel">LIVE ({team.liveMatch.scoreTeam} - {team.liveMatch.scoreOpponent})</span>
                  ) : team.nextMatch ? (
                    `${team.nextMatch.time} • ${team.nextMatch.court}`
                  ) : (
                    "No active fixture"
                  )}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-[#1E293B]">
                <div className="text-xs">
                  <span className="text-gray-400 block text-[10px] font-pixel">COACH / MANAGER:</span>
                  <span className="font-medium text-white">{team.managerName || "Not Provided"}</span>
                  {team.managerPhone && (
                    <span className="block text-[11px] text-emerald-400 font-mono">{team.managerPhone}</span>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  {team.managerPhone && (
                    <>
                      <a
                        href={`tel:${team.managerPhone}`}
                        className="flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-pixel text-[10px] rounded transition-colors"
                        title={`Call ${team.managerPhone}`}
                      >
                        <Phone className="w-3 h-3" />
                        <span>CALL</span>
                      </a>
                      <button
                        type="button"
                        onClick={() => handleCopyPhone(team.managerPhone!)}
                        title={copiedPhone === team.managerPhone ? "Copied!" : `Copy number: ${team.managerPhone}`}
                        className={`flex items-center gap-1 px-2 py-1 font-pixel text-[10px] rounded border transition-colors cursor-pointer ${
                          copiedPhone === team.managerPhone
                            ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/60"
                            : "bg-[#0E1526] hover:bg-[#1E293B] text-gray-300 hover:text-white border-[#1E293B]"
                        }`}
                      >
                        {copiedPhone === team.managerPhone ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span>COPIED</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3 text-gray-400" />
                            <span>COPY</span>
                          </>
                        )}
                      </button>
                    </>
                  )}

                  <Link
                    href={`/spoc/teams/${team.id}`}
                    className="flex items-center gap-1 px-3 py-1 bg-[#1E293B] hover:bg-[#334155] text-white font-pixel text-[10px] rounded border border-gray-600"
                  >
                    <span>OVERVIEW</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
