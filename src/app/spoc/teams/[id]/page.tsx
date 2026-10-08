"use client";

import React, { useState, useEffect, useCallback, use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Users,
  Bus,
  Home,
  Trophy,
  Phone,
  Mail,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldAlert,
  Flame,
  PhoneCall,
  ExternalLink,
  ChevronRight,
  Copy,
  Check,
  MessageSquare,
  Smartphone,
  AlertCircle,
} from "lucide-react";
import { formatTeamCode } from "@/lib/team/format";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function SpocTeamOverviewPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const teamId = resolvedParams.id;

  const [activeTab, setActiveTab] = useState<
    "registration" | "transport" | "accommodation" | "matches" | "contact"
  >("registration");

  const [copiedPhone, setCopiedPhone] = useState<string | null>(null);

  const handleCopyPhone = useCallback((phone: string | null | undefined) => {
    if (!phone) return;
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(phone);
    } else {
      const textarea = document.createElement("textarea");
      textarea.value = phone;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      try {
        document.execCommand("copy");
      } catch (err) {
        console.error("Fallback copy failed", err);
      }
      document.body.removeChild(textarea);
    }
    setCopiedPhone(phone);
    setTimeout(() => setCopiedPhone(null), 2000);
  }, []);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDetails = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/spoc/teams/${teamId}`);
      if (!res.ok) {
        if (res.status === 403) {
          throw new Error("403 Forbidden: You are not authorized to view this team. SPOC access is strictly restricted to your 4 assigned teams.");
        }
        if (res.status === 404) {
          throw new Error("404 Not Found: The specified team record does not exist.");
        }
        throw new Error("Failed to load team overview.");
      }
      const json = await res.json();
      if (json.success) {
        setData(json);
      } else {
        throw new Error(json.error || "Failed to load team data.");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [teamId]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  if (loading) {
    return (
      <div className="p-16 text-center space-y-4">
        <div className="w-10 h-10 border-2 border-[#6366F1] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="font-pixel text-xs text-gray-400">LOADING AUTHORITATIVE TEAM OVERVIEW...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 max-w-lg mx-auto bg-red-950/20 border-2 border-red-500/40 text-center space-y-4">
        <AlertTriangle className="w-10 h-10 text-red-400 mx-auto" />
        <h2 className="font-pixel text-sm text-red-400">UNAUTHORIZED ACCESS</h2>
        <p className="text-xs text-gray-300 leading-relaxed">{error}</p>
        <Link
          href="/spoc/teams"
          className="inline-block mt-2 px-4 py-2 bg-[#1E293B] hover:bg-[#334155] text-xs font-pixel text-white border border-gray-600"
        >
          ← RETURN TO MY TEAMS
        </Link>
      </div>
    );
  }

  if (!data) return null;

  const { team, tabs, escalationAuthorities } = data;
  const { registration, transport, accommodation, matches, contact } = tabs;

  return (
    <div className="space-y-6">
      {/* ── TOP NAV BREADCRUMB & CONTINGENT BANNER ── */}
      <div>
        <Link
          href="/spoc/teams"
          className="text-xs text-gray-400 hover:text-white flex items-center gap-1.5 mb-3 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to My Teams</span>
        </Link>

        <div className="p-5 sm:p-6 bg-[#0B0F17] border-2 border-[#1E293B] rounded shadow flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-pixel text-[10px] text-gray-400 uppercase">
                {formatTeamCode(team.teamCode)} • {team.state} {team.city ? `(${team.city})` : ""}
              </span>
              <span className="px-2 py-0.5 bg-[#6366F1]/20 text-[#818CF8] font-pixel text-[8px] uppercase">
                {team.assignedSpocName ? `SPOC: ${team.assignedSpocName}${team.assignedSpocContact ? ` (${team.assignedSpocContact})` : ""}` : "SPOC ASSIGNED"}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-wide mt-0.5">
              {team.name}
            </h1>
            <p className="text-xs text-gray-300">{team.institution}</p>
          </div>

          <div className="flex items-center gap-3">
            <span
              className={`px-3 py-1 font-pixel text-xs uppercase border ${
                team.operationalStatus === "LIVE"
                  ? "bg-red-500/20 text-red-400 border-red-500/50 animate-pulse"
                  : team.operationalStatus === "ATTENTION"
                  ? "bg-amber-500/20 text-amber-400 border-amber-500/50"
                  : team.operationalStatus === "COMPLETED"
                  ? "bg-blue-500/10 text-blue-400 border-blue-500/30"
                  : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
              }`}
            >
              STATUS: {team.operationalStatus}
            </span>

            {team.managerPhone && (
              <div className="flex items-center gap-2">
                <a
                  href={`tel:${team.managerPhone}`}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-pixel text-xs rounded transition-colors shadow-sm"
                  title={`Call Manager (${team.managerPhone})`}
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>CALL MANAGER</span>
                </a>
                <button
                  type="button"
                  onClick={() => handleCopyPhone(team.managerPhone)}
                  title={copiedPhone === team.managerPhone ? "Copied to clipboard!" : `Copy manager number: ${team.managerPhone}`}
                  className={`flex items-center gap-1.5 px-3 py-1.5 font-pixel text-xs rounded border transition-all cursor-pointer ${
                    copiedPhone === team.managerPhone
                      ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/60 shadow-[0_0_10px_rgba(16,185,129,0.2)]"
                      : "bg-[#0E1526] hover:bg-[#1E293B] text-gray-200 hover:text-white border-[#1E293B] hover:border-[#475569]"
                  }`}
                >
                  {copiedPhone === team.managerPhone ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400 font-bold">COPIED</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-gray-300" />
                      <span>COPY NUMBER</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── 5 SEPARATE TABS HEADER ── */}
      <div className="flex border-b border-[#1E293B] gap-1 overflow-x-auto pb-1">
        {[
          { id: "registration", label: "1. REGISTRATION", icon: Users },
          { id: "transport", label: "2. TRANSPORT", icon: Bus },
          { id: "accommodation", label: "3. ACCOMMODATION", icon: Home },
          { id: "matches", label: "4. MATCHES", icon: Trophy },
          { id: "contact", label: "5. CONTACT", icon: Phone },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 font-pixel text-xs flex items-center gap-2 border-b-2 whitespace-nowrap transition-colors ${
                isActive
                  ? "border-[#6366F1] text-white bg-[#0B0F17]"
                  : "border-transparent text-gray-400 hover:text-white hover:bg-[#0B0F17]/50"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── TAB 1: REGISTRATION (READ-ONLY) ── */}
      {activeTab === "registration" && (
        <div className="space-y-4">
          <div className="p-4 bg-[#0B0F17] border border-[#1E293B] rounded space-y-3">
            <div className="flex items-center justify-between border-b border-[#1E293B] pb-2">
              <span className="font-pixel text-xs text-[#818CF8] uppercase">
                INSTITUTIONAL REGISTRATION RECORD
              </span>
              <span
                className={`text-[10px] font-pixel uppercase px-2 py-0.5 rounded border ${
                  registration.status === "COMPLETED"
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                    : registration.status === "PENDING_VERIFICATION"
                    ? "bg-blue-500/10 text-blue-400 border-blue-500/30"
                    : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                }`}
              >
                STATUS: {registration.status}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-gray-400 text-[10px] block">University:</span>
                <span className="font-semibold text-white">{registration.institution}</span>
              </div>
              <div>
                <span className="text-gray-400 text-[10px] block">State / Zone:</span>
                <span className="font-semibold text-white">{registration.state}</span>
              </div>
              <div>
                <span className="text-gray-400 text-[10px] block">Team Manager:</span>
                <span className="font-semibold text-white">{registration.managerName || "None"}</span>
              </div>
              <div>
                <span className="text-gray-400 text-[10px] block">Team Captain:</span>
                <span className="font-semibold text-white">{registration.captainName || "None"}</span>
              </div>
            </div>
          </div>

          {/* Registered Players Table */}
          <div className="p-4 bg-[#0B0F17] border border-[#1E293B] rounded space-y-3">
            <span className="font-pixel text-xs text-white uppercase block">
              ACCREDITED ATHLETES &amp; ROSTER ({registration.players.length})
            </span>

            {registration.players.length === 0 ? (
              <p className="text-xs text-gray-500 italic">No players registered yet for this contingent.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-[#1E293B]">
                  <thead className="bg-[#07090E] text-gray-400 font-pixel text-[10px] uppercase border-b border-[#1E293B]">
                    <tr>
                      <th className="p-2.5">Player Name</th>
                      <th className="p-2.5">Designation</th>
                      <th className="p-2.5">Chest No.</th>
                      <th className="p-2.5">Accreditation</th>
                      <th className="p-2.5">Verification</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1E293B]">
                    {registration.players.map((p: any) => (
                      <tr key={p.id} className="hover:bg-[#1E293B]/40">
                        <td className="p-2.5 font-semibold text-white">{p.name}</td>
                        <td className="p-2.5 text-gray-300 font-pixel text-[10px]">{p.role}</td>
                        <td className="p-2.5 text-gray-400 font-mono text-[11px]">{p.chestNumber || "—"}</td>
                        <td className="p-2.5">
                          <span
                            className={`px-2 py-0.5 font-pixel text-[8px] uppercase rounded ${
                              p.verified ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"
                            }`}
                          >
                            {p.status}
                          </span>
                        </td>
                        <td className="p-2.5 text-gray-400 text-[11px]">
                          {p.documentsCount} documents verified
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TAB 2: TRANSPORT (READ-ONLY) ── */}
      {activeTab === "transport" && (
        <div className="space-y-4">
          <div className="p-4 bg-[#0B0F17] border border-[#1E293B] rounded space-y-3">
            <div className="flex items-center justify-between border-b border-[#1E293B] pb-2">
              <span className="font-pixel text-xs text-[#00F0FF] uppercase flex items-center gap-1.5">
                <Bus className="w-4 h-4" />
                UNIVERSITY TRANSIT &amp; FLEET SCHEDULE
              </span>
              <span className="text-[10px] font-pixel text-emerald-400">
                STATUS: {transport.status}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div className="p-2.5 bg-[#07090E] border border-[#1E293B] rounded">
                <span className="text-gray-400 text-[10px] block">Arrival Venue:</span>
                <span className="font-semibold text-white">
                  {transport.summary?.pickupPoint || "Pending Dispatch"}
                </span>
              </div>
              <div className="p-2.5 bg-[#07090E] border border-[#1E293B] rounded">
                <span className="text-gray-400 text-[10px] block">Scheduled Time:</span>
                <span className="font-semibold text-white">
                  {transport.summary?.scheduledTime || "Not Scheduled"}
                </span>
              </div>
              <div className="p-2.5 bg-[#07090E] border border-[#1E293B] rounded">
                <span className="text-gray-400 text-[10px] block">Vehicle / Shuttle:</span>
                <span className="font-semibold text-white">
                  {transport.summary?.vehicleNo || "Not Assigned"}
                </span>
              </div>
              <div className="p-2.5 bg-[#07090E] border border-[#1E293B] rounded">
                <span className="text-gray-400 text-[10px] block">Driver Contact:</span>
                <span className="font-semibold text-white">
                  {transport.summary?.driverName || "Not Assigned"}
                </span>
                {transport.summary?.driverPhone && (
                  <a
                    href={`tel:${transport.summary.driverPhone}`}
                    className="text-[10px] text-emerald-400 hover:underline block mt-0.5"
                  >
                    {transport.summary.driverPhone}
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Bookings / Manifest */}
          <div className="p-4 bg-[#0B0F17] border border-[#1E293B] rounded space-y-3">
            <span className="font-pixel text-xs text-white uppercase block">
              TRANSIT BOOKINGS &amp; BOARDING MANIFEST ({transport.bookings.length})
            </span>

            {transport.bookings.length === 0 ? (
              <p className="text-xs text-gray-500 italic">No individual boarding records generated yet.</p>
            ) : (
              <div className="space-y-2">
                {transport.bookings.map((b: any) => (
                  <div
                    key={b.id}
                    className="p-3 bg-[#07090E] border border-[#1E293B] rounded flex flex-wrap items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <span className="font-semibold text-white block">{b.passengerName}</span>
                      <span className="text-gray-400 text-[11px]">
                        {b.pickupPoint} → {b.dropPoint}
                      </span>
                    </div>

                    <div className="text-right">
                      <span
                        className={`inline-block px-2 py-0.5 font-pixel text-[9px] uppercase rounded ${
                          b.boardingStatus === "BOARDED"
                            ? "bg-emerald-500/20 text-emerald-400"
                            : "bg-amber-500/20 text-amber-400"
                        }`}
                      >
                        {b.boardingStatus}
                      </span>
                      <span className="block text-[10px] text-gray-500 mt-0.5">
                        {b.tripCode} • {b.scheduledTime}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TAB 3: ACCOMMODATION (READ-ONLY) ── */}
      {activeTab === "accommodation" && (
        <div className="space-y-4">
          <div className="p-4 bg-[#0B0F17] border border-[#1E293B] rounded space-y-3">
            <div className="flex items-center justify-between border-b border-[#1E293B] pb-2">
              <span className="font-pixel text-xs text-amber-400 uppercase flex items-center gap-1.5">
                <Home className="w-4 h-4" />
                HOSTEL &amp; BED ALLOCATION LOGISTICS
              </span>
              <span
                className={`text-[10px] font-pixel uppercase px-2 py-0.5 rounded border ${
                  accommodation.status === "CHECKED-IN"
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                    : accommodation.status === "ALLOCATED"
                    ? "bg-blue-500/10 text-blue-400 border-blue-500/30"
                    : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                }`}
              >
                STATUS: {accommodation.status || "NOT ALLOCATED"}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-2.5 bg-[#07090E] border border-[#1E293B] rounded">
                <span className="text-gray-400 text-[10px] block">Allocated Hostel:</span>
                <span className="font-semibold text-white">
                  {accommodation.summary?.hostelName || "Not Allocated"}
                </span>
              </div>
              <div className="p-2.5 bg-[#07090E] border border-[#1E293B] rounded">
                <span className="text-gray-400 text-[10px] block">Room Number:</span>
                <span className="font-semibold text-white">
                  {accommodation.summary?.roomNumber
                    ? `Room ${accommodation.summary.roomNumber}`
                    : "Pending Allocation"}
                </span>
              </div>
              <div className="p-2.5 bg-[#07090E] border border-[#1E293B] rounded">
                <span className="text-gray-400 text-[10px] block">Check-in Status:</span>
                <span
                  className={`font-semibold font-pixel text-xs uppercase ${
                    accommodation.checkInStatus === "CHECKED-IN"
                      ? "text-emerald-400"
                      : accommodation.checkInStatus === "ALLOCATED" ||
                        accommodation.checkInStatus === "PENDING CHECK-IN"
                      ? "text-blue-400"
                      : "text-amber-400"
                  }`}
                >
                  {accommodation.checkInStatus ||
                    (accommodation.allocations?.length === 0
                      ? "NOT CHECKED IN"
                      : "PENDING")}
                </span>
              </div>
            </div>
          </div>

          {/* Bed Allocation Records */}
          <div className="p-4 bg-[#0B0F17] border border-[#1E293B] rounded space-y-3">
            <span className="font-pixel text-xs text-white uppercase block">
              INDIVIDUAL ATHLETE BED ASSIGNMENTS ({accommodation.allocations.length})
            </span>

            {accommodation.allocations.length === 0 ? (
              <p className="text-xs text-gray-500 italic">No bed allocations assigned yet.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {accommodation.allocations.map((a: any) => (
                  <div
                    key={a.id}
                    className="p-3 bg-[#07090E] border border-[#1E293B] rounded text-xs space-y-1"
                  >
                    <span className="font-semibold text-white block">{a.participantName}</span>
                    <p className="text-gray-400 text-[11px]">
                      {a.hostelName} • Room {a.roomNumber} ({a.bedNumber})
                    </p>
                    <span
                      className={`inline-block px-1.5 py-0.5 font-pixel text-[8px] uppercase border ${
                        a.status === "CHECKED-IN"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                          : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                      }`}
                    >
                      {a.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TAB 4: MATCHES (READ-ONLY) ── */}
      {activeTab === "matches" && (
        <div className="space-y-4">
          {/* LIVE MATCHES */}
          {matches.live.length > 0 && (
            <div className="p-4 bg-[#1A0B10] border-2 border-red-500/60 rounded space-y-3">
              <span className="font-pixel text-xs text-red-400 uppercase flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-red-500 animate-pulse" />
                LIVE COURT MATCH
              </span>

              {matches.live.map((m: any) => (
                <div
                  key={m.id}
                  className="p-4 bg-[#0B0F17] border border-red-500/40 rounded flex items-center justify-between"
                >
                  <div>
                    <span className="font-pixel text-[10px] text-[#00F0FF] uppercase">{m.court}</span>
                    <h3 className="text-base font-bold text-white mt-0.5">
                      {team.name} vs {m.opponent}
                    </h3>
                    <p className="text-xs text-gray-400">{m.category} • {m.matchNumber}</p>
                  </div>

                  <div className="text-right">
                    <span className="font-pixel text-2xl text-red-400 font-bold block">
                      {m.scoreDisplay}
                    </span>
                    <span className="text-[10px] font-pixel text-emerald-400">IN PROGRESS</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* UPCOMING MATCHES */}
          <div className="p-4 bg-[#0B0F17] border border-[#1E293B] rounded space-y-3">
            <span className="font-pixel text-xs text-white uppercase block">
              UPCOMING FIXTURES ({matches.upcoming.length})
            </span>

            {matches.upcoming.length === 0 ? (
              <p className="text-xs text-gray-500 italic">No upcoming matches scheduled.</p>
            ) : (
              <div className="space-y-2">
                {matches.upcoming.map((m: any) => (
                  <div
                    key={m.id}
                    className="p-3 bg-[#07090E] border border-[#1E293B] rounded flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-semibold text-white block">
                        vs {m.opponent}
                      </span>
                      <span className="text-gray-400 text-[11px]">
                        {m.matchNumber} • {m.category}
                      </span>
                    </div>

                    <div className="text-right font-pixel">
                      <span className="text-[#818CF8] block">{m.time}</span>
                      <span className="text-gray-500 text-[10px]">{m.court}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* COMPLETED MATCHES */}
          <div className="p-4 bg-[#0B0F17] border border-[#1E293B] rounded space-y-3">
            <span className="font-pixel text-xs text-white uppercase block">
              COMPLETED MATCHES ({matches.completed.length})
            </span>

            {matches.completed.length === 0 ? (
              <p className="text-xs text-gray-500 italic">No completed matches recorded yet.</p>
            ) : (
              <div className="space-y-2">
                {matches.completed.map((m: any) => (
                  <div
                    key={m.id}
                    className="p-3 bg-[#07090E] border border-[#1E293B] rounded flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-semibold text-white block">
                        vs {m.opponent}
                      </span>
                      <span className="text-gray-400 text-[11px]">
                        {m.matchNumber} • {m.court}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="font-pixel text-sm text-white font-bold block">
                        {m.scoreDisplay}
                      </span>
                      <span
                        className={`font-pixel text-[9px] uppercase ${
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

      {/* ── TAB 5: CONTACT (FULL CONTINGENT DIRECTORY) ── */}
      {activeTab === "contact" && (
        <div className="space-y-6">
          {/* 1. Key Contingent Officials (Manager & Captain) */}
          <div className="p-5 bg-[#0B0F17] border-2 border-[#1E293B] rounded space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1E293B] pb-3">
              <div>
                <span className="font-pixel text-xs text-emerald-400 uppercase flex items-center gap-1.5">
                  <Phone className="w-4 h-4" />
                  KEY CONTINGENT OFFICIALS
                </span>
                <p className="text-xs text-gray-400 mt-0.5">
                  Primary coordination lines for team manager and on-court captain.
                </p>
              </div>
              <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-pixel text-[9px] uppercase">
                PRIORITY LIAISON
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Manager Card */}
              <div className="p-4 bg-[#07090E] border border-[#1E293B] rounded space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-gray-400 text-[10px] font-pixel block uppercase tracking-wider">
                      COACH / TEAM MANAGER
                    </span>
                    <h3 className="font-bold text-white text-base mt-0.5">
                      {contact.managerName || "Not Provided"}
                    </h3>
                    <p className="text-[11px] text-gray-400">{team.institution}</p>
                  </div>
                  <span className="px-2 py-0.5 bg-[#6366F1]/10 text-[#818CF8] font-pixel text-[9px] border border-[#6366F1]/30">
                    COACH / MANAGER
                  </span>
                </div>

                <div className="pt-2 border-t border-[#1E293B]/70 flex flex-wrap items-center justify-between gap-2">
                  {contact.managerPhone ? (
                    <>
                      <div className="flex items-center gap-1.5 text-emerald-400 font-mono text-sm font-semibold">
                        <Smartphone className="w-4 h-4 text-emerald-400" />
                        <span>{contact.managerPhone}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <a
                          href={`tel:${contact.managerPhone}`}
                          className="px-3 py-1 bg-emerald-500 hover:bg-emerald-600 text-white font-pixel text-[10px] rounded flex items-center gap-1 transition-colors"
                        >
                          <PhoneCall className="w-3 h-3" />
                          <span>CALL</span>
                        </a>
                        <a
                          href={`https://wa.me/${contact.managerPhone.replace(/[^0-9]/g, "")}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1 bg-[#25D366]/20 hover:bg-[#25D366]/30 text-[#25D366] border border-[#25D366]/40 font-pixel text-[10px] rounded flex items-center gap-1 transition-colors"
                        >
                          <MessageSquare className="w-3 h-3" />
                          <span>WHATSAPP</span>
                        </a>
                        <button
                          onClick={() => handleCopyPhone(contact.managerPhone)}
                          title="Copy Number"
                          className="p-1 bg-[#1E293B] hover:bg-[#334155] text-gray-300 rounded transition-colors cursor-pointer"
                        >
                          {copiedPhone === contact.managerPhone ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5 text-gray-400" />
                          )}
                        </button>
                      </div>
                    </>
                  ) : (
                    <span className="text-gray-500 italic text-xs">No phone number listed</span>
                  )}
                </div>
              </div>

              {/* Captain Card */}
              <div className="p-4 bg-[#07090E] border border-[#1E293B] rounded space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-gray-400 text-[10px] font-pixel block uppercase tracking-wider">
                      TEAM CAPTAIN
                    </span>
                    <h3 className="font-bold text-white text-base mt-0.5">{contact.captainName}</h3>
                    <p className="text-[11px] text-gray-400">{team.institution}</p>
                  </div>
                  <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 font-pixel text-[9px] border border-amber-500/30">
                    CAPTAIN
                  </span>
                </div>

                <div className="pt-2 border-t border-[#1E293B]/70 flex flex-wrap items-center justify-between gap-2">
                  {contact.captainPhone ? (
                    <>
                      <div className="flex items-center gap-1.5 text-emerald-400 font-mono text-sm font-semibold">
                        <Smartphone className="w-4 h-4 text-emerald-400" />
                        <span>{contact.captainPhone}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <a
                          href={`tel:${contact.captainPhone}`}
                          className="px-3 py-1 bg-emerald-500 hover:bg-emerald-600 text-white font-pixel text-[10px] rounded flex items-center gap-1 transition-colors"
                        >
                          <PhoneCall className="w-3 h-3" />
                          <span>CALL</span>
                        </a>
                        <a
                          href={`https://wa.me/${contact.captainPhone.replace(/[^0-9]/g, "")}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1 bg-[#25D366]/20 hover:bg-[#25D366]/30 text-[#25D366] border border-[#25D366]/40 font-pixel text-[10px] rounded flex items-center gap-1 transition-colors"
                        >
                          <MessageSquare className="w-3 h-3" />
                          <span>WHATSAPP</span>
                        </a>
                        <button
                          onClick={() => handleCopyPhone(contact.captainPhone)}
                          title="Copy Number"
                          className="p-1 bg-[#1E293B] hover:bg-[#334155] text-gray-300 rounded transition-colors cursor-pointer"
                        >
                          {copiedPhone === contact.captainPhone ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5 text-gray-400" />
                          )}
                        </button>
                      </div>
                    </>
                  ) : (
                    <span className="text-gray-500 italic text-xs">No phone number listed</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 2. Full Team Athlete & Staff Contact Directory */}
          <div className="p-5 bg-[#0B0F17] border-2 border-[#1E293B] rounded space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1E293B] pb-3">
              <div>
                <span className="font-pixel text-xs text-white uppercase flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-[#6366F1]" />
                  FULL TEAM SQUAD CONTACT DIRECTORY
                </span>
                <p className="text-xs text-gray-400 mt-0.5">
                  Every registered player and contingent member with direct telephone lines for marshaling and checks.
                </p>
              </div>
              <span className="font-pixel text-[11px] text-gray-300 px-2.5 py-1 bg-[#1E293B] rounded">
                TOTAL SQUAD: {(contact.members || registration.players || []).length} CONTACTS
              </span>
            </div>

            {(!contact.members || contact.members.length === 0) && (!registration.players || registration.players.length === 0) ? (
              <p className="text-xs text-gray-500 italic p-4 text-center">No squad member contacts registered.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {(contact.members || registration.players || []).map((m: any, idx: number) => {
                  const phoneClean = m.phone ? m.phone.replace(/[^0-9]/g, "") : "";
                  const roleBadgeColor =
                    m.role === "MANAGER"
                      ? "bg-purple-500/10 text-purple-400 border-purple-500/30"
                      : m.role === "CAPTAIN"
                      ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                      : m.role === "COACH"
                      ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/30"
                      : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";

                  return (
                    <div
                      key={m.id || idx}
                      className="p-3.5 bg-[#07090E] border border-[#1E293B] hover:border-[#334155] rounded flex flex-col justify-between gap-2.5 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-semibold text-white text-sm truncate">{m.name}</h4>
                            <span className={`px-1.5 py-0.5 font-pixel text-[8px] uppercase border rounded ${roleBadgeColor}`}>
                              {m.role || "ATHLETE"}
                            </span>
                          </div>
                          {m.email && (
                            <p className="text-[11px] text-gray-400 truncate mt-0.5">{m.email}</p>
                          )}
                        </div>
                      </div>

                      <div className="pt-2 border-t border-[#1E293B] flex items-center justify-between gap-2">
                        {m.phone ? (
                          <>
                            <div className="flex items-center gap-1.5 font-mono text-xs text-emerald-400 font-semibold">
                              <Phone className="w-3 h-3 text-emerald-400" />
                              <span>{m.phone}</span>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <a
                                href={`tel:${m.phone}`}
                                title={`Call ${m.name}`}
                                className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-600 text-white font-pixel text-[9px] rounded flex items-center gap-1 transition-colors"
                              >
                                <PhoneCall className="w-3 h-3" />
                                <span>CALL</span>
                              </a>
                              {phoneClean && (
                                <a
                                  href={`https://wa.me/${phoneClean}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  title={`WhatsApp ${m.name}`}
                                  className="px-2 py-1 bg-[#25D366]/20 hover:bg-[#25D366]/30 text-[#25D366] border border-[#25D366]/40 font-pixel text-[9px] rounded flex items-center gap-1 transition-colors"
                                >
                                  <MessageSquare className="w-3 h-3" />
                                  <span>WA</span>
                                </a>
                              )}
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(m.phone);
                                  setCopiedPhone(m.phone);
                                  setTimeout(() => setCopiedPhone(null), 2000);
                                }}
                                title="Copy Number"
                                className="p-1 bg-[#1E293B] hover:bg-[#334155] text-gray-300 rounded transition-colors"
                              >
                                {copiedPhone === m.phone ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5 text-gray-400" />
                                )}
                              </button>
                            </div>
                          </>
                        ) : (
                          <div className="text-gray-500 italic text-[11px] flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            <span>No phone registered</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── ESCALATION FOOTER NOTICE ── */}
      <div className="p-4 bg-[#0B0F17] border border-[#1E293B] rounded flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-gray-400">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            Need to escalate an issue for this team? Do not edit records. Contact the relevant authority.
          </span>
        </div>
        <Link
          href="/spoc/contacts"
          className="font-pixel text-[10px] text-[#818CF8] hover:underline"
        >
          VIEW ESCALATION CONTACTS →
        </Link>
      </div>
    </div>
  );
}
