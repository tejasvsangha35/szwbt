"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Trophy,
  Shield,
  Clock,
  MapPin,
  UserCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Play,
  Pause,
  RefreshCw,
  Send,
  FileText,
  Activity,
  Radio,
  ExternalLink,
  ChevronRight,
  AlertCircle,
  Check,
  Building,
  Bus,
  Home,
  DollarSign,
  User,
  Users,
  Layers,
} from "lucide-react";

export interface MatchControlDrawerProps {
  matchId: string | null;
  onClose: () => void;
  onRefreshAll: () => void;
  availableCourts: any[];
  availableOfficials: any[];
}

export function MatchControlDrawer({
  matchId,
  onClose,
  onRefreshAll,
  availableCourts,
  availableOfficials,
}: MatchControlDrawerProps) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [actionPending, setActionPending] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Assignment states
  const [selectedCourt, setSelectedCourt] = useState("");
  const [selectedOfficial, setSelectedOfficial] = useState("");
  const [selectedRoleType, setSelectedRoleType] = useState<"UMPIRE" | "TECHNICAL_OFFICIAL">("UMPIRE");
  const [courtOfficialsNote, setCourtOfficialsNote] = useState("");

  // Pre-match form states
  const [teamAReported, setTeamAReported] = useState(false);
  const [teamBReported, setTeamBReported] = useState(false);
  const [officialsPresent, setOfficialsPresent] = useState(false);
  const [courtReady, setCourtReady] = useState(false);
  const [preMatchNotes, setPreMatchNotes] = useState("");
  const [shuttleFeeStatus, setShuttleFeeStatus] = useState("NOT_REQUIRED");
  const [shuttleFeeReceipt, setShuttleFeeReceipt] = useState("");

  // Court readiness check form
  const [checkItem, setCheckItem] = useState("surface");
  const [checkStatus, setCheckStatus] = useState<"READY" | "ISSUE">("READY");
  const [checkNotes, setCheckNotes] = useState("");

  // Interruption modal states
  const [interruptionModalOpen, setInterruptionModalOpen] = useState(false);
  const [interruptionAction, setInterruptionAction] = useState<"PAUSE" | "RESUME" | "DELAY">("PAUSE");
  const [interruptionReason, setInterruptionReason] = useState("Court Condition / Surface Issue");
  const [interruptionNotes, setInterruptionNotes] = useState("");

  // Load match control details from backend
  const loadMatchDetails = async () => {
    if (!matchId) return;
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/operations/matches/${matchId}`, {
        headers: { "Cache-Control": "no-cache" },
      });
      const json = await res.json();
      if (json.success) {
        setData(json.data);
        const m = json.data.match;
        const pm = json.data.preMatchReporting;
        setSelectedCourt(m.court || "");
        setSelectedOfficial(m.assignedOfficialId || "");
        setCourtOfficialsNote(m.courtOfficials || "");

        if (pm) {
          setTeamAReported(pm.teamAReported);
          setTeamBReported(pm.teamBReported);
          setOfficialsPresent(pm.officialsPresent);
          setCourtReady(pm.courtReady);
          setPreMatchNotes(pm.notes || "");
          setShuttleFeeStatus(pm.shuttleFeeStatus || "NOT_REQUIRED");
          setShuttleFeeReceipt(pm.shuttleFeeReceipt || "");
        } else {
          setTeamAReported(false);
          setTeamBReported(false);
          setOfficialsPresent(false);
          setCourtReady(false);
          setPreMatchNotes("");
        }
      } else {
        setError(json.error || "Failed to load match telemetry.");
      }
    } catch (err: any) {
      setError("Network error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (matchId) {
      loadMatchDetails();
    }
  }, [matchId]);

  if (!matchId) return null;

  // Handle Assign Court
  const handleAssignCourt = async () => {
    if (!selectedCourt || actionPending) return;
    try {
      setActionPending(true);
      setActionMessage(null);
      const res = await fetch(`/api/operations/matches/${matchId}/court`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courtNumber: selectedCourt }),
      });
      const json = await res.json();
      if (json.success) {
        setActionMessage({ type: "success", text: json.message });
        await loadMatchDetails();
        onRefreshAll();
      } else {
        setActionMessage({ type: "error", text: json.error });
      }
    } catch (err: any) {
      setActionMessage({ type: "error", text: err.message });
    } finally {
      setActionPending(false);
    }
  };

  // Handle Assign Official
  const handleAssignOfficial = async () => {
    if (!selectedOfficial || actionPending) return;
    try {
      setActionPending(true);
      setActionMessage(null);
      const res = await fetch(`/api/operations/matches/${matchId}/official`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          officialId: selectedOfficial,
          roleType: selectedRoleType,
          courtOfficials: courtOfficialsNote,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setActionMessage({ type: "success", text: json.message });
        await loadMatchDetails();
        onRefreshAll();
      } else {
        setActionMessage({ type: "error", text: json.error });
      }
    } catch (err: any) {
      setActionMessage({ type: "error", text: err.message });
    } finally {
      setActionPending(false);
    }
  };

  // Handle Pre-Match Reporting Save
  const handleSavePreMatch = async () => {
    if (actionPending) return;
    try {
      setActionPending(true);
      setActionMessage(null);
      const res = await fetch(`/api/operations/matches/${matchId}/readiness`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "PRE_MATCH",
          teamAReported,
          teamBReported,
          officialsPresent,
          courtReady,
          shuttleFeeStatus,
          shuttleFeeReceipt,
          notes: preMatchNotes,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setActionMessage({ type: "success", text: "Pre-match reporting saved successfully." });
        await loadMatchDetails();
        onRefreshAll();
      } else {
        setActionMessage({ type: "error", text: json.error });
      }
    } catch (err: any) {
      setActionMessage({ type: "error", text: err.message });
    } finally {
      setActionPending(false);
    }
  };

  // Handle Court Readiness Check Save
  const handleSaveCourtCheck = async () => {
    if (!data?.match?.court || actionPending) return;
    try {
      setActionPending(true);
      setActionMessage(null);
      const itemConfig = (data.config?.courtReadinessItems || []).find((i: any) => i.id === checkItem);
      const res = await fetch(`/api/operations/matches/${matchId}/readiness`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "COURT_READINESS",
          courtNumber: data.match.court,
          checkItem,
          checkName: itemConfig?.label || checkItem,
          status: checkStatus,
          notes: checkNotes,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setActionMessage({ type: "success", text: `Court check recorded: ${checkItem} -> ${checkStatus}` });
        setCheckNotes("");
        await loadMatchDetails();
        onRefreshAll();
      } else {
        setActionMessage({ type: "error", text: json.error });
      }
    } catch (err: any) {
      setActionMessage({ type: "error", text: err.message });
    } finally {
      setActionPending(false);
    }
  };

  // Handle Send to Umpire
  const handleSendToUmpire = async () => {
    if (actionPending) return;
    try {
      setActionPending(true);
      setActionMessage(null);
      const res = await fetch(`/api/operations/matches/${matchId}/send-to-umpire`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const json = await res.json();
      if (json.success) {
        setActionMessage({ type: "success", text: json.message });
        await loadMatchDetails();
        onRefreshAll();
      } else {
        setActionMessage({ type: "error", text: json.error });
      }
    } catch (err: any) {
      setActionMessage({ type: "error", text: err.message });
    } finally {
      setActionPending(false);
    }
  };

  // Handle Confirm Result
  const handleConfirmResult = async () => {
    if (actionPending) return;
    try {
      setActionPending(true);
      setActionMessage(null);
      const res = await fetch(`/api/operations/matches/${matchId}/confirm-result`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const json = await res.json();
      if (json.success) {
        setActionMessage({ type: "success", text: json.message });
        await loadMatchDetails();
        onRefreshAll();
      } else {
        setActionMessage({ type: "error", text: json.error });
      }
    } catch (err: any) {
      setActionMessage({ type: "error", text: err.message });
    } finally {
      setActionPending(false);
    }
  };

  // Handle Release Court
  const handleReleaseCourt = async () => {
    if (!data?.match?.court || actionPending) return;
    try {
      setActionPending(true);
      setActionMessage(null);
      const res = await fetch(`/api/operations/courts/${encodeURIComponent(data.match.court)}/release`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: "Post-match turnaround cleared by Technical Operations" }),
      });
      const json = await res.json();
      if (json.success) {
        setActionMessage({ type: "success", text: json.message });
        await loadMatchDetails();
        onRefreshAll();
      } else {
        setActionMessage({ type: "error", text: json.error });
      }
    } catch (err: any) {
      setActionMessage({ type: "error", text: err.message });
    } finally {
      setActionPending(false);
    }
  };

  // Handle Interruption (Pause / Resume / Delay)
  const handleExecuteInterruption = async () => {
    if (actionPending) return;
    try {
      setActionPending(true);
      setActionMessage(null);
      const res = await fetch(`/api/operations/matches/${matchId}/interrupt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: interruptionAction,
          reason: interruptionReason,
          notes: interruptionNotes,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setActionMessage({ type: "success", text: json.message });
        setInterruptionModalOpen(false);
        await loadMatchDetails();
        onRefreshAll();
      } else {
        setActionMessage({ type: "error", text: json.error });
      }
    } catch (err: any) {
      setActionMessage({ type: "error", text: err.message });
    } finally {
      setActionPending(false);
    }
  };

  const { match, court, courtChecks = [], assignedOfficial, readiness, preMatchReporting, resultCommunications = [], auditHistory = [] } =
    data || {};

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/80 backdrop-blur-md flex justify-end">
      {/* DRAWER CONTAINER */}
      <div className="w-full max-w-4xl bg-[#070B14] text-[#F8FAFC] h-full shadow-[0_0_50px_rgba(0,0,0,0.9)] flex flex-col border-l border-white/15 transform transition-all duration-300">
        {/* HEADER BAR */}
        <div className="bg-[#0B132B]/90 border-b border-white/10 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 bg-[#FF5A16]/15 border border-[#FF5A16]/40 rounded-xl flex items-center justify-center font-rajdhani font-black text-sm text-[#FF5A16] tracking-wider shadow-inner">
              {match?.publicMatchNumber || "MATCH"}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-rajdhani text-[11px] font-bold text-[#FF5A16] uppercase tracking-[0.18em]">
                  MATCH CONTROL WORKSPACE
                </span>
                <span className="text-[10px] bg-white/5 border border-white/10 px-2 py-0.5 rounded font-mono text-slate-400">
                  ID: {matchId}
                </span>
              </div>
              <h2 className="font-rajdhani text-lg sm:text-xl font-black text-white tracking-wide flex items-center gap-2.5 mt-0.5">
                <span>{match?.matchNumber || "Loading match..."}</span>
                {match?.category && (
                  <span className="text-xs bg-white/10 font-bold px-2.5 py-0.5 rounded-full text-slate-300">
                    {match.category}
                  </span>
                )}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={loadMatchDetails}
              disabled={loading || actionPending}
              className="p-2 bg-[#0E1730] hover:bg-[#162248] border border-white/20 hover:border-[#FF5A16]/60 rounded-lg text-slate-200 hover:text-white transition-colors cursor-pointer shadow-sm"
              title="Refresh telemetry"
            >
              <RefreshCw className={`w-4 h-4 text-[#FF5A16] ${loading ? "animate-spin" : ""}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 bg-[#0E1730] hover:bg-[#162248] border border-white/20 hover:border-red-400/60 rounded-lg text-slate-200 hover:text-white transition-colors cursor-pointer shadow-sm"
              title="Close drawer"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* NOTIFICATION STRIP */}
        {actionMessage && (
          <div
            className={`px-6 py-3 text-xs font-semibold flex items-center justify-between border-b ${
              actionMessage.type === "success"
                ? "bg-[#00FF88]/10 text-[#00FF88] border-[#00FF88]/30"
                : "bg-red-500/10 text-red-400 border-red-500/30"
            }`}
          >
            <div className="flex items-center gap-2">
              {actionMessage.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              <span>{actionMessage.text}</span>
            </div>
            <button
              onClick={() => setActionMessage(null)}
              className="text-xs opacity-60 hover:opacity-100 cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* BODY (SCROLLABLE) */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 scrollbar-none">
          {loading && !data ? (
            <div className="flex flex-col items-center justify-center min-h-[300px] space-y-3">
              <div className="w-10 h-10 border-2 border-[#FF5A16]/20 border-t-[#FF5A16] animate-spin rounded-full" />
              <p className="font-rajdhani text-xs font-bold text-slate-400 uppercase tracking-wider">
                Synchronizing Match Telemetry...
              </p>
            </div>
          ) : error && !data ? (
            <div className="p-6 bg-red-950/20 border border-red-500/30 rounded-2xl text-center space-y-3">
              <AlertTriangle className="w-8 h-8 text-red-400 mx-auto" />
              <p className="text-sm font-semibold text-red-200">{error}</p>
              <button
                onClick={loadMatchDetails}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold font-rajdhani uppercase tracking-wider"
              >
                Retry
              </button>
            </div>
          ) : (
            <>
              {/* SECTION 1: TEAMS & FIXTURE CONTEXT */}
              <div className="bg-[#0B132B]/80 rounded-2xl border border-white/15 p-5 backdrop-blur-xl shadow-lg">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <span className="font-rajdhani text-xs font-bold text-slate-300 tracking-wider uppercase flex items-center gap-1.5">
                    <Trophy className="w-4 h-4 text-[#FF5A16]" />
                    CONTESTING UNIVERSITIES & LINEUPS
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-rajdhani text-xs font-bold px-3 py-1 rounded-full bg-sky-500/20 border border-sky-400/50 text-sky-200 uppercase tracking-wider shadow-sm flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                      <span>POOL {match?.pool || "A"}</span>
                      <span className="text-sky-400/60">&bull;</span>
                      <span className="text-sky-100 font-semibold">{match?.roundName || "Round 1"}</span>
                    </span>
                    <span
                      className={`font-rajdhani text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5 shadow-sm ${
                        match?.status === "LIVE"
                          ? "bg-red-500/25 text-red-300 border border-red-500/50 animate-pulse"
                          : match?.status === "READY_TO_START"
                          ? "bg-[#00FF88]/20 text-[#00FF88] border border-[#00FF88]/50"
                          : match?.status === "READY"
                          ? "bg-[#00FF88]/15 text-[#00FF88] border border-[#00FF88]/40"
                          : match?.status === "RESULT_SUBMITTED"
                          ? "bg-[#FFD700]/20 text-[#FFD700] border border-[#FFD700]/50"
                          : match?.status === "COMPLETED"
                          ? "bg-white/10 text-white border border-white/20"
                          : "bg-white/10 text-slate-200 border border-white/15"
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${match?.status === "LIVE" ? "bg-red-400 animate-ping" : "bg-current"}`} />
                      <span>{match?.status}</span>
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* TEAM A */}
                  <div
                    className={`p-4 sm:p-5 rounded-xl border-2 transition-all ${
                      match?.winner === "PLAYER_A"
                        ? "border-[#00FF88]/60 bg-[#00FF88]/10 shadow-lg shadow-[#00FF88]/5"
                        : "border-blue-500/30 bg-[#0C1527] shadow-md"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-rajdhani font-black text-xs px-2.5 py-0.5 rounded bg-blue-500/25 border border-blue-400/50 text-blue-200 uppercase tracking-wider inline-flex items-center gap-1 shadow-sm">
                        <Users className="w-3.5 h-3.5 text-blue-400" /> TEAM A
                      </span>
                      {match?.winner === "PLAYER_A" && (
                        <span className="font-rajdhani font-black text-xs text-[#00FF88] bg-[#00FF88]/20 border border-[#00FF88]/40 px-2 py-0.5 rounded flex items-center gap-1 uppercase tracking-wider">
                          <Check className="w-3.5 h-3.5" /> WINNER
                        </span>
                      )}
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Participant / Team</span>
                      <h3 className="text-lg sm:text-xl font-black text-white leading-snug tracking-wide mt-0.5 drop-shadow-sm">
                        {match?.playerA || "TBD"}
                      </h3>
                    </div>
                    <div className="mt-3 p-2.5 rounded-lg bg-sky-950/40 border border-sky-400/30 flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-md bg-sky-500/20 border border-sky-400/40 flex items-center justify-center shrink-0">
                        <Building className="w-4 h-4 text-sky-300" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-sky-300/90 block leading-tight">University / Institution</span>
                        <span className="text-sm font-extrabold text-white tracking-wide block truncate">
                          {match?.institutionA || "South Zone University"}
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between text-xs">
                      <span className="text-slate-300 font-medium">Reporting Status:</span>
                      <span
                        className={`font-rajdhani font-bold px-2.5 py-0.5 rounded text-xs tracking-wider uppercase border flex items-center gap-1.5 ${
                          preMatchReporting?.teamAReported
                            ? "bg-emerald-500/20 text-emerald-300 border-emerald-400/40"
                            : "bg-amber-500/20 text-amber-300 border-amber-400/40"
                        }`}
                      >
                        {preMatchReporting?.teamAReported ? "✓ Reported" : "⏳ Pending"}
                      </span>
                    </div>
                  </div>

                  {/* TEAM B */}
                  <div
                    className={`p-4 sm:p-5 rounded-xl border-2 transition-all ${
                      match?.winner === "PLAYER_B"
                        ? "border-[#00FF88]/60 bg-[#00FF88]/10 shadow-lg shadow-[#00FF88]/5"
                        : "border-purple-500/30 bg-[#0C1527] shadow-md"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-rajdhani font-black text-xs px-2.5 py-0.5 rounded bg-purple-500/25 border border-purple-400/50 text-purple-200 uppercase tracking-wider inline-flex items-center gap-1 shadow-sm">
                        <Users className="w-3.5 h-3.5 text-purple-400" /> TEAM B
                      </span>
                      {match?.winner === "PLAYER_B" && (
                        <span className="font-rajdhani font-black text-xs text-[#00FF88] bg-[#00FF88]/20 border border-[#00FF88]/40 px-2 py-0.5 rounded flex items-center gap-1 uppercase tracking-wider">
                          <Check className="w-3.5 h-3.5" /> WINNER
                        </span>
                      )}
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Participant / Team</span>
                      <h3 className="text-lg sm:text-xl font-black text-white leading-snug tracking-wide mt-0.5 drop-shadow-sm">
                        {match?.playerB || "TBD"}
                      </h3>
                    </div>
                    <div className="mt-3 p-2.5 rounded-lg bg-purple-950/40 border border-purple-400/30 flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-md bg-purple-500/20 border border-purple-400/40 flex items-center justify-center shrink-0">
                        <Building className="w-4 h-4 text-purple-300" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300/90 block leading-tight">University / Institution</span>
                        <span className="text-sm font-extrabold text-white tracking-wide block truncate">
                          {match?.institutionB || "South Zone University"}
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between text-xs">
                      <span className="text-slate-300 font-medium">Reporting Status:</span>
                      <span
                        className={`font-rajdhani font-bold px-2.5 py-0.5 rounded text-xs tracking-wider uppercase border flex items-center gap-1.5 ${
                          preMatchReporting?.teamBReported
                            ? "bg-emerald-500/20 text-emerald-300 border-emerald-400/40"
                            : "bg-amber-500/20 text-amber-300 border-amber-400/40"
                        }`}
                      >
                        {preMatchReporting?.teamBReported ? "✓ Reported" : "⏳ Pending"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* SCHEDULE TIMING */}
                <div className="mt-4 pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-300">
                  <div className="flex items-center gap-4">
                    <span>
                      Schedule: <strong className="text-white font-mono text-sm">{match?.time || "TBD"}</strong>
                    </span>
                    <span>
                      Day: <strong className="text-white font-rajdhani font-bold">{match?.day?.dayNumber || match?.dayId || "Day 1"}</strong>
                    </span>
                  </div>
                  {match?.downstreamMatchNumber && (
                    <div className="flex items-center gap-1.5 text-cyan-300 font-rajdhani font-bold text-xs uppercase tracking-wider bg-cyan-950/40 border border-cyan-400/40 px-3 py-1 rounded-lg">
                      <span>Winner advances to:</span>
                      <strong className="text-white font-mono">Match #{match.downstreamMatchNumber}</strong>
                    </div>
                  )}
                </div>
              </div>

              {/* SECTION 2: COURT & OFFICIAL ASSIGNMENT */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* COURT ASSIGNMENT */}
                <div className="bg-[#0B132B]/80 rounded-2xl border border-white/15 p-5 backdrop-blur-xl flex flex-col justify-between shadow-lg">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-rajdhani text-xs font-bold text-slate-300 tracking-wider uppercase flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-[#FF5A16]" />
                        PHYSICAL COURT
                      </span>
                      {court ? (
                        <span
                          className={`font-rajdhani text-xs font-black px-3 py-1 rounded-md uppercase tracking-wider flex items-center gap-1.5 shadow-sm border ${
                            court.status === "LIVE"
                              ? "bg-red-500/30 text-red-200 border-red-400/60 animate-pulse"
                              : court.status === "READY" || court.status === "AVAILABLE"
                              ? "bg-emerald-500/30 text-emerald-200 border-emerald-400/60"
                              : court.status === "DELAYED"
                              ? "bg-amber-500/30 text-amber-200 border-amber-400/60"
                              : "bg-cyan-500/30 text-cyan-200 border-cyan-400/60"
                          }`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${
                              court.status === "LIVE"
                                ? "bg-red-400"
                                : court.status === "READY" || court.status === "AVAILABLE"
                                ? "bg-emerald-400 shadow-[0_0_8px_#34d399]"
                                : court.status === "DELAYED"
                                ? "bg-amber-400"
                                : "bg-cyan-400"
                            }`}
                          />
                          <span>COURT {court.status === "READY" ? "READY" : court.status}</span>
                        </span>
                      ) : (
                        <span className="font-rajdhani text-xs font-bold px-2.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-white/10 uppercase">
                          UNASSIGNED
                        </span>
                      )}
                    </div>

                    <div className="mb-4 bg-[#050914] border border-white/15 p-3 rounded-xl flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Assigned Court</span>
                        <strong className="text-[#FF5A16] font-rajdhani text-2xl font-black tracking-wide block">
                          {match?.court || "Unassigned"}
                        </strong>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Court Readiness Status</span>
                        <span
                          className={`font-rajdhani text-xs font-extrabold px-2.5 py-1 rounded uppercase tracking-wider inline-flex items-center gap-1.5 border ${
                            court?.status === "READY" || court?.status === "AVAILABLE"
                              ? "bg-emerald-500/25 text-emerald-300 border-emerald-400/50"
                              : court?.status === "LIVE"
                              ? "bg-red-500/25 text-red-300 border-red-400/50"
                              : "bg-amber-500/25 text-amber-300 border-amber-400/50"
                          }`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{court?.status ? `COURT ${court.status}` : "NOT READY"}</span>
                        </span>
                      </div>
                    </div>

                    <label className="block font-rajdhani text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                      Assign / Reassign Court
                    </label>
                    <select
                      value={selectedCourt}
                      onChange={(e) => setSelectedCourt(e.target.value)}
                      disabled={match?.status === "LIVE" || actionPending}
                      className="w-full text-xs border border-white/20 rounded-lg p-2.5 bg-[#040711] text-white font-medium focus:outline-none focus:border-[#FF5A16]"
                    >
                      <option value="">Select a tournament court...</option>
                      {availableCourts.map((c) => (
                        <option key={c.id} value={c.courtNumber}>
                          {c.courtNumber} &bull; ({c.status})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-300">
                      <strong className="text-emerald-400 font-bold font-mono">
                        {availableCourts.filter((c) => c.status === "AVAILABLE" || c.status === "READY").length}
                      </strong> courts ready & available
                    </span>
                    <button
                      onClick={handleAssignCourt}
                      disabled={!selectedCourt || selectedCourt === match?.court || match?.status === "LIVE" || actionPending}
                      className="px-4 py-2 bg-[#FF5A16] hover:bg-[#FF7A1A] text-white rounded-lg font-rajdhani font-bold text-xs uppercase tracking-wider disabled:opacity-50 transition-colors shadow-sm cursor-pointer"
                    >
                      {actionPending ? "Assigning..." : "Assign Court"}
                    </button>
                  </div>
                </div>

                {/* OFFICIAL / UMPIRE ASSIGNMENT */}
                {/* OFFICIAL / UMPIRE ASSIGNMENT */}
                <div className="bg-[#0B132B]/80 rounded-2xl border border-white/15 p-5 backdrop-blur-xl flex flex-col justify-between shadow-lg">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-rajdhani text-xs font-bold text-slate-300 tracking-wider uppercase flex items-center gap-1.5">
                        <UserCheck className="w-4 h-4 text-[#FF5A16]" />
                        TECHNICAL OFFICIAL & UMPIRE
                      </span>
                      {assignedOfficial ? (
                        <span className="font-rajdhani text-xs bg-[#00FF88]/20 text-[#00FF88] border border-[#00FF88]/40 font-bold px-2.5 py-0.5 rounded uppercase">
                          ASSIGNED
                        </span>
                      ) : (
                        <span className="font-rajdhani text-xs bg-slate-800 text-slate-400 border border-white/10 font-bold px-2.5 py-0.5 rounded uppercase">
                          UNASSIGNED
                        </span>
                      )}
                    </div>

                    <div className="mb-4 bg-[#050914] border border-white/15 p-3 rounded-xl flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Primary Match Umpire</span>
                        <strong className="text-white font-rajdhani text-lg font-black tracking-wide block">
                          {assignedOfficial?.name || match?.assignedOfficialId || "Unassigned"}
                        </strong>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Official Status</span>
                        <span className={`font-rajdhani text-xs font-bold px-2 py-0.5 rounded uppercase ${
                          assignedOfficial ? "text-cyan-300 bg-cyan-500/20 border border-cyan-400/40" : "text-amber-300 bg-amber-500/20 border border-amber-400/40"
                        }`}>
                          {assignedOfficial ? "Ready & Linked" : "Needs Assignment"}
                        </span>
                      </div>
                    </div>

                    <label className="block font-rajdhani text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                      Assign / Reassign Match Official
                    </label>
                    <select
                      value={selectedOfficial}
                      onChange={(e) => setSelectedOfficial(e.target.value)}
                      disabled={actionPending}
                      className="w-full text-xs border border-white/20 rounded-lg p-2.5 bg-[#040711] text-white font-medium focus:outline-none focus:border-[#FF5A16] mb-2"
                    >
                      <option value="">Select available official...</option>
                      {availableOfficials.map((off) => (
                        <option key={off.id} value={off.id} disabled={!off.isAvailable}>
                          {off.name} &bull; {off.badge} {!off.isAvailable ? "(Occupied)" : ""}
                        </option>
                      ))}
                    </select>

                    <input
                      type="text"
                      placeholder="Court officials (e.g. Service & Line Judges)"
                      value={courtOfficialsNote}
                      onChange={(e) => setCourtOfficialsNote(e.target.value)}
                      className="w-full text-xs border border-white/20 rounded-lg p-2.5 bg-[#040711] text-white placeholder-slate-400 focus:outline-none focus:border-[#FF5A16]"
                    />
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-300">
                      <strong className="text-cyan-400 font-bold font-mono">
                        {availableOfficials.filter((o) => o.isAvailable).length}
                      </strong> officials available
                    </span>
                    <button
                      onClick={handleAssignOfficial}
                      disabled={!selectedOfficial || actionPending}
                      className="px-4 py-2 bg-[#FF5A16] hover:bg-[#FF7A1A] text-white rounded-lg font-rajdhani font-bold text-xs uppercase tracking-wider disabled:opacity-50 transition-colors shadow-sm cursor-pointer"
                    >
                      {actionPending ? "Assigning..." : "Assign Official"}
                    </button>
                  </div>
                </div>
              </div>

              {/* SECTION 3: PRE-MATCH REPORTING & SHUTTLE FEE */}
              <div className="bg-[#0B132B]/80 rounded-2xl border border-white/15 p-5 backdrop-blur-xl shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-rajdhani text-xs font-bold text-slate-300 tracking-wider uppercase flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-[#FF5A16]" />
                    PRE-MATCH REPORTING & ARRANGEMENTS
                  </span>
                  <span className="font-mono text-xs text-slate-400">Authoritative TechOps Control</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                  {/* Team A Reported */}
                  <label className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer shadow-sm ${
                    teamAReported ? "border-emerald-400/60 bg-emerald-950/40 text-emerald-100 shadow-emerald-950/50" : "border-white/20 bg-[#060B18] text-white hover:bg-[#0E1528]"
                  }`}>
                    <input
                      type="checkbox"
                      checked={teamAReported}
                      onChange={(e) => setTeamAReported(e.target.checked)}
                      className="w-4 h-4 accent-[#FF5A16] rounded"
                    />
                    <div className="overflow-hidden">
                      <div className="font-rajdhani font-black text-xs uppercase tracking-wider flex items-center gap-1.5">
                        <Users className={`w-3.5 h-3.5 shrink-0 ${teamAReported ? "text-emerald-400" : "text-blue-400"}`} />
                        <span>Team A Reported</span>
                      </div>
                      <div className="text-[11px] font-semibold text-slate-200 truncate mt-0.5">
                        {match?.playerA || "Team A"}
                      </div>
                    </div>
                  </label>

                  {/* Team B Reported */}
                  <label className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer shadow-sm ${
                    teamBReported ? "border-emerald-400/60 bg-emerald-950/40 text-emerald-100 shadow-emerald-950/50" : "border-white/20 bg-[#060B18] text-white hover:bg-[#0E1528]"
                  }`}>
                    <input
                      type="checkbox"
                      checked={teamBReported}
                      onChange={(e) => setTeamBReported(e.target.checked)}
                      className="w-4 h-4 accent-[#FF5A16] rounded"
                    />
                    <div className="overflow-hidden">
                      <div className="font-rajdhani font-black text-xs uppercase tracking-wider flex items-center gap-1.5">
                        <Users className={`w-3.5 h-3.5 shrink-0 ${teamBReported ? "text-emerald-400" : "text-purple-400"}`} />
                        <span>Team B Reported</span>
                      </div>
                      <div className="text-[11px] font-semibold text-slate-200 truncate mt-0.5">
                        {match?.playerB || "Team B"}
                      </div>
                    </div>
                  </label>

                  {/* Officials Present */}
                  <label className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer shadow-sm ${
                    officialsPresent ? "border-amber-400/60 bg-amber-950/40 text-amber-100 shadow-amber-950/50" : "border-white/20 bg-[#060B18] text-white hover:bg-[#0E1528]"
                  }`}>
                    <input
                      type="checkbox"
                      checked={officialsPresent}
                      onChange={(e) => setOfficialsPresent(e.target.checked)}
                      className="w-4 h-4 accent-[#FF5A16] rounded"
                    />
                    <div>
                      <div className="font-rajdhani font-black text-xs uppercase tracking-wider flex items-center gap-1.5">
                        <UserCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>Officials Present</span>
                      </div>
                      <div className="text-[11px] font-semibold text-slate-200 mt-0.5">Court-Side Check</div>
                    </div>
                  </label>

                  {/* Court Ready */}
                  <label className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer shadow-sm ${
                    courtReady ? "border-emerald-400/60 bg-emerald-950/40 text-emerald-100 shadow-emerald-950/50" : "border-white/20 bg-[#060B18] text-white hover:bg-[#0E1528]"
                  }`}>
                    <input
                      type="checkbox"
                      checked={courtReady}
                      onChange={(e) => setCourtReady(e.target.checked)}
                      className="w-4 h-4 accent-[#FF5A16] rounded"
                    />
                    <div>
                      <div className="font-rajdhani font-black text-xs uppercase tracking-wider flex items-center gap-1.5">
                        <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${courtReady ? "text-emerald-400" : "text-[#FF5A16]"}`} />
                        <span>Court Ready</span>
                      </div>
                      <div className="text-[11px] font-semibold text-slate-200 mt-0.5">Net & Posts Inspected</div>
                    </div>
                  </label>
                </div>

                {/* Shuttle Fee Verification */}
                <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-xl mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <span className="font-rajdhani font-bold text-[#FFD700] uppercase tracking-wider flex items-center gap-1.5">
                      <DollarSign className="w-3.5 h-3.5 text-amber-400" />
                      SHUTTLECOCK / SHUTTLE-FEE VERIFICATION
                    </span>
                    <p className="text-[11px] text-slate-300 mt-0.5">
                      {data?.config?.shuttleFee?.policy === "REQUIRED"
                        ? `Required: ₹${data.config.shuttleFee.feePerTeam} per team entry`
                        : "Tournament Provided Policy (Complimentary BWF Grade-1 Shuttles)"}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      value={shuttleFeeStatus}
                      onChange={(e) => setShuttleFeeStatus(e.target.value)}
                      className="text-xs border border-amber-500/40 rounded-lg p-1.5 bg-[#040711] text-white font-medium focus:outline-none"
                    >
                      <option value="NOT_REQUIRED">NOT REQUIRED</option>
                      <option value="VERIFIED">VERIFIED</option>
                      <option value="PAID">PAID</option>
                      <option value="WAIVED">WAIVED</option>
                      <option value="PENDING">PENDING</option>
                    </select>

                    <input
                      type="text"
                      placeholder="Receipt/UTR #"
                      value={shuttleFeeReceipt}
                      onChange={(e) => setShuttleFeeReceipt(e.target.value)}
                      className="text-xs border border-amber-500/40 rounded-lg p-1.5 bg-[#040711] text-white placeholder-slate-500 w-32 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <input
                    type="text"
                    placeholder="Optional technical notes / reporting observations..."
                    value={preMatchNotes}
                    onChange={(e) => setPreMatchNotes(e.target.value)}
                    className="flex-1 text-xs border border-white/15 rounded-lg p-2.5 bg-[#040711] text-white placeholder-slate-500 focus:outline-none focus:border-[#FF5A16]"
                  />
                  <button
                    onClick={handleSavePreMatch}
                    disabled={actionPending}
                    className="px-5 py-2.5 bg-white/10 hover:bg-white/20 border border-white/15 text-white rounded-lg font-rajdhani font-bold text-xs uppercase tracking-wider transition-colors shrink-0 cursor-pointer"
                  >
                    Save Reporting
                  </button>
                </div>
              </div>

              {/* SECTION 4: COURT READINESS CHECKS */}
              {match?.court && match.court !== "TBD" && (
                <div className="bg-[#0B132B]/80 rounded-2xl border border-white/15 p-5 backdrop-blur-xl shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-rajdhani text-xs font-bold text-slate-300 tracking-wider uppercase flex items-center gap-1.5">
                      <Shield className="w-4 h-4 text-[#FF5A16]" />
                      COURT READINESS TELEMETRY ({match.court})
                    </span>
                    <span className="font-mono text-xs text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-400/20">
                      {courtChecks.length} checks recorded
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-4">
                    {(data?.config?.courtReadinessItems || []).map((item: any) => {
                      const latest = courtChecks.find((c: any) => c.checkItem === item.id);
                      const isIssue = latest?.status === "ISSUE";
                      const isReady = latest?.status === "READY";

                      return (
                        <div
                          key={item.id}
                          className={`p-3 rounded-xl border text-xs flex flex-col justify-between shadow-sm transition-all ${
                            isIssue
                              ? "border-red-400/60 bg-red-950/40 text-red-100"
                              : isReady
                              ? "border-emerald-400/50 bg-emerald-950/30 text-emerald-100"
                              : "border-white/20 bg-[#060B18] text-slate-200"
                          }`}
                        >
                          <div className="font-bold text-white flex items-center gap-1.5">
                            <Shield className={`w-3.5 h-3.5 ${isReady ? "text-emerald-400" : isIssue ? "text-red-400" : "text-[#FF5A16]"}`} />
                            <span>{item.label}</span>
                          </div>
                          <div className="mt-2.5 flex items-center justify-between gap-1">
                            <span
                              className={`font-rajdhani text-xs font-black px-2.5 py-0.5 rounded uppercase tracking-wider ${
                                isIssue
                                  ? "bg-red-500/30 text-red-200 border border-red-500/50"
                                  : isReady
                                  ? "bg-emerald-500/25 text-emerald-200 border border-emerald-400/50"
                                  : "bg-white/10 text-slate-200 border border-white/20"
                              }`}
                            >
                              {latest?.status === "READY" ? "✓ READY" : latest?.status === "ISSUE" ? "⚠ ISSUE" : (latest?.status || "PENDING")}
                            </span>
                            {latest?.notes && (
                              <span className="text-[10px] text-slate-300 truncate max-w-[80px]" title={latest.notes}>
                                {latest.notes}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Record Court Check Form (Clear 2-row layout with zero overlapping) */}
                  <div className="p-4 bg-white/[0.02] border border-white/10 rounded-xl space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-rajdhani text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                          Check Item
                        </label>
                        <select
                          value={checkItem}
                          onChange={(e) => setCheckItem(e.target.value)}
                          className="w-full border border-white/15 rounded-lg p-2 bg-[#040711] text-white text-xs font-medium focus:outline-none"
                        >
                          {(data?.config?.courtReadinessItems || []).map((item: any) => (
                            <option key={item.id} value={item.id}>
                              {item.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block font-rajdhani text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                          Status Evaluation
                        </label>
                        <select
                          value={checkStatus}
                          onChange={(e) => setCheckStatus(e.target.value as any)}
                          className="w-full border border-white/15 rounded-lg p-2 bg-[#040711] text-white text-xs font-bold focus:outline-none"
                        >
                          <option value="READY">READY ✓</option>
                          <option value="ISSUE">ISSUE REPORTED ⚠</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                      <input
                        type="text"
                        placeholder="Notes / observed readings on court..."
                        value={checkNotes}
                        onChange={(e) => setCheckNotes(e.target.value)}
                        className="flex-1 border border-white/15 rounded-lg p-2 bg-[#040711] text-white placeholder-slate-500 text-xs focus:outline-none focus:border-[#FF5A16]"
                      />
                      <button
                        onClick={handleSaveCourtCheck}
                        disabled={actionPending}
                        className="px-5 py-2 bg-[#FF5A16] hover:bg-[#FF7A1A] text-white rounded-lg font-rajdhani font-bold text-xs uppercase tracking-wider transition-colors shrink-0 cursor-pointer shadow-sm"
                      >
                        Record Check
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 5: TECHNICAL READINESS & HANDOFF TO UMPIRE */}
              <div className="bg-[#0B132B]/60 rounded-2xl border border-white/10 p-5 backdrop-blur-xl">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-rajdhani text-xs font-bold text-slate-400 tracking-wider uppercase flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-[#FF5A16]" />
                    TECHNICAL READINESS EVALUATION
                  </span>
                  <span
                    className={`font-rajdhani text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                      readiness?.isReady
                        ? "bg-[#00FF88]/20 text-[#00FF88] border border-[#00FF88]/40"
                        : "bg-red-500/20 text-red-400 border border-red-500/40"
                    }`}
                  >
                    {readiness?.isReady ? "● READY FOR HANDOFF" : "× NOT READY"}
                  </span>
                </div>

                {/* Checklist Breakdown */}
                <div className="space-y-2 mb-5">
                  {(readiness?.checks || []).map((chk: any) => (
                    <div
                      key={chk.id}
                      className={`flex items-center justify-between text-xs py-2 px-3.5 rounded-xl border shadow-sm ${
                        chk.passed
                          ? "bg-[#00FF88]/5 border-[#00FF88]/30 text-white"
                          : "bg-red-950/25 border-red-500/40 text-red-200"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        {chk.passed ? (
                          <CheckCircle2 className="w-4 h-4 text-[#00FF88] shrink-0" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-400 shrink-0" />
                        )}
                        <span className="font-medium text-white">{chk.label}</span>
                      </div>
                      <span className={`text-[11px] font-mono ${chk.passed ? "text-slate-300" : "text-red-300 font-bold"}`}>
                        {chk.details}
                      </span>
                    </div>
                  ))}
                </div>

                {/* BLOCKING REASONS CALLOUT */}
                {readiness?.blockingReasons && readiness.blockingReasons.length > 0 && (
                  <div className="p-4 bg-red-950/30 border border-red-500/40 rounded-xl text-xs text-red-300 mb-5 space-y-2">
                    <div className="font-rajdhani font-bold flex items-center gap-2 text-red-400 uppercase tracking-wider">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      UNMET REQUIREMENTS BLOCKING HANDOFF:
                    </div>
                    <ul className="list-disc list-inside space-y-1 pl-1 text-slate-300">
                      {readiness.blockingReasons.map((reason: string, idx: number) => (
                        <li key={idx}>{reason}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* HANDOFF TO UMPIRE BUTTON (STATE-AWARE UX) */}
                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h4 className="font-rajdhani text-sm font-bold text-white uppercase tracking-wider">
                      {match?.status === "READY_TO_START"
                        ? "Match Handed Off to Umpire"
                        : match?.status === "LIVE"
                        ? "Match is Currently LIVE"
                        : match?.status === "COMPLETED" || match?.status === "RESULT_CONFIRMED"
                        ? "Match Completed"
                        : "Send Match to Assigned Umpire"}
                    </h4>
                    <p className="font-sans text-xs text-slate-400 mt-0.5">
                      {match?.status === "READY_TO_START"
                        ? "Umpire can now start physical match on court-side workspace."
                        : match?.status === "LIVE"
                        ? "Court scoring is actively underway in Umpire Dashboard."
                        : "Authoritatively transitions match to READY_TO_START and activates it in /official."}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0 w-full sm:w-auto">
                    {match?.status === "UPCOMING" || match?.status === "READY" || match?.status === "COURT_ASSIGNED" ? (
                      <button
                        onClick={handleSendToUmpire}
                        disabled={!readiness?.isReady || actionPending}
                        className="w-full sm:w-auto px-5 py-2.5 bg-[#FF5A16] hover:bg-[#FF7A1A] text-white rounded-xl font-rajdhani text-xs font-bold uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                      >
                        <Send className="w-4 h-4" />
                        <span>SEND TO UMPIRE</span>
                      </button>
                    ) : match?.status === "READY_TO_START" ? (
                      <span className="w-full sm:w-auto px-4 py-2 bg-[#00FF88]/20 border border-[#00FF88]/40 text-[#00FF88] font-rajdhani font-bold text-xs rounded-xl flex items-center justify-center gap-2 uppercase tracking-wider">
                        <Clock className="w-4 h-4 animate-spin" />
                        <span>WAITING FOR UMPIRE TO START</span>
                      </span>
                    ) : match?.status === "LIVE" ? (
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <span className="px-4 py-2 bg-red-500/20 border border-red-500/40 text-red-400 font-rajdhani font-bold text-xs rounded-xl flex items-center gap-2 uppercase tracking-wider animate-pulse">
                          <Radio className="w-4 h-4" />
                          <span>LIVE ON {match?.court}</span>
                        </span>
                        <button
                          onClick={() => {
                            setInterruptionAction("PAUSE");
                            setInterruptionModalOpen(true);
                          }}
                          className="px-4 py-2 bg-[#FFD700] hover:bg-amber-400 text-black font-rajdhani font-black text-xs rounded-xl uppercase tracking-wider cursor-pointer"
                        >
                          PAUSE
                        </button>
                      </div>
                    ) : match?.status === "PAUSED" ? (
                      <button
                        onClick={() => {
                          setInterruptionAction("RESUME");
                          setInterruptionModalOpen(true);
                        }}
                        className="px-5 py-2.5 bg-[#00FF88] hover:bg-emerald-400 text-black font-rajdhani font-black text-xs rounded-xl uppercase tracking-wider transition-colors flex items-center gap-2 cursor-pointer"
                      >
                        <Play className="w-4 h-4 fill-current" />
                        <span>RESUME MATCH</span>
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>

              {/* SECTION 6: LIVE SCORE MONITOR & RESULT CONFIRMATION */}
              {(match?.status === "LIVE" ||
                match?.status === "PAUSED" ||
                match?.status === "RESULT_SUBMITTED" ||
                match?.status === "COMPLETED" ||
                match?.status === "RESULT_CONFIRMED") && (
                <div className="bg-[#0B132B]/60 rounded-2xl border border-white/10 p-5 backdrop-blur-xl">
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-rajdhani text-xs font-bold text-slate-400 tracking-wider uppercase flex items-center gap-1.5">
                      <Activity className="w-4 h-4 text-[#FF5A16]" />
                      LIVE SCORING TELEMETRY & RESULT VERIFICATION
                    </span>
                    <span className="font-mono text-xs text-slate-400">
                      Source: Umpire Electronic Scoresheet
                    </span>
                  </div>

                  {/* SCOREBOARD DISPLAY */}
                  <div className="bg-[#03060C] border border-white/10 p-5 rounded-2xl shadow-inner mb-4 flex items-center justify-around font-mono">
                    <div className="text-center flex-1">
                      <p className="text-xs text-slate-400 font-medium truncate mb-1">{match?.playerA}</p>
                      <span className="font-rajdhani text-4xl sm:text-5xl font-black text-[#00F0FF]">
                        {match?.scoreA || "0"}
                      </span>
                    </div>

                    <div className="text-center px-4">
                      <span className="font-rajdhani text-xs font-bold text-slate-500 uppercase tracking-widest">VS</span>
                      <div className="font-rajdhani text-[10px] text-[#FF5A16] uppercase tracking-wider mt-1">
                        {match?.status === "LIVE" ? "IN PLAY" : match?.status}
                      </div>
                    </div>

                    <div className="text-center flex-1">
                      <p className="text-xs text-slate-400 font-medium truncate mb-1">{match?.playerB}</p>
                      <span className="font-rajdhani text-4xl sm:text-5xl font-black text-[#00F0FF]">
                        {match?.scoreB || "0"}
                      </span>
                    </div>
                  </div>

                  {/* RESULT SUBMITTED -> CONFIRM RESULT ACTION */}
                  {match?.status === "RESULT_SUBMITTED" && (
                    <div className="p-4 bg-amber-500/10 border border-amber-500/40 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                      <div>
                        <h4 className="font-rajdhani text-sm font-bold text-[#FFD700] uppercase tracking-wider flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 shrink-0" />
                          RESULT SUBMITTED BY UMPIRE &bull; PENDING CONFIRMATION
                        </h4>
                        <p className="font-sans text-xs text-slate-300 mt-1">
                          Winner submitted:{" "}
                          <strong className="text-white">{match?.winner === "PLAYER_A" ? match?.playerA : match?.playerB}</strong>.
                          Confirming advances the knockout bracket and communicates results to Accommodation, Finance, and Transportation committees.
                        </p>
                      </div>

                      <button
                        onClick={handleConfirmResult}
                        disabled={actionPending}
                        className="px-6 py-2.5 bg-[#00FF88] hover:bg-emerald-400 text-black font-rajdhani font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-[0_0_20px_rgba(0,255,136,0.3)] shrink-0 cursor-pointer"
                      >
                        CONFIRM RESULT
                      </button>
                    </div>
                  )}

                  {/* MATCH COMPLETED -> RELEASE COURT ACTION */}
                  {(match?.status === "COMPLETED" || match?.status === "RESULT_CONFIRMED") && (
                    <div className="p-4 bg-white/[0.03] border border-white/10 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div>
                        <h4 className="font-rajdhani text-sm font-bold text-white uppercase tracking-wider">
                          Match Concluded &bull; Court Turnaround Ready
                        </h4>
                        <p className="font-sans text-xs text-slate-400 mt-0.5">
                          Court {match?.court} can now be released to AVAILABLE status for the next scheduled match.
                        </p>
                      </div>

                      <button
                        onClick={handleReleaseCourt}
                        disabled={actionPending || court?.status === "AVAILABLE"}
                        className="px-5 py-2.5 bg-[#FF5A16] hover:bg-[#FF7A1A] text-white rounded-xl font-rajdhani text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer shadow-sm"
                      >
                        {court?.status === "AVAILABLE" ? "Court Available ✓" : "RELEASE COURT"}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* SECTION 7: RESULT COMMUNICATION STATUS */}
              <div className="bg-[#0B132B]/60 rounded-2xl border border-white/10 p-5 backdrop-blur-xl">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-rajdhani text-xs font-bold text-slate-400 tracking-wider uppercase flex items-center gap-1.5">
                    <Send className="w-4 h-4 text-[#FF5A16]" />
                    COMMITTEE RESULT SYNCHRONIZATION (DOWNSTREAM DISPATCH)
                  </span>
                  <span className="font-mono text-xs text-slate-400">Live Domain Event Status</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  {/* Accommodation Committee */}
                  {(() => {
                    const rc = resultCommunications.find((c: any) => c.committee === "ACCOMMODATION");
                    const isSent = rc?.status === "SENT";
                    const isFailed = rc?.status === "FAILED";

                    return (
                      <div className="p-3.5 rounded-xl border border-white/20 bg-[#060B18] text-xs flex flex-col justify-between shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-rajdhani font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                            <Home className="w-3.5 h-3.5 text-[#FF5A16]" />
                            <span>ACCOMMODATION</span>
                          </span>
                          <span
                            className={`font-rajdhani text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                              isSent
                                ? "bg-[#00FF88]/20 text-[#00FF88] border border-[#00FF88]/30"
                                : isFailed
                                ? "bg-red-500/20 text-red-300 border border-red-500/40"
                                : "bg-white/10 text-slate-200 border border-white/20"
                            }`}
                          >
                            {rc?.status || (match?.status === "COMPLETED" ? "PENDING" : "STANDBY")}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-300 leading-relaxed">
                          {isSent
                            ? "Confirmed result dispatched. Hostel departure/stay updated."
                            : "Awaiting match result confirmation."}
                        </p>
                      </div>
                    );
                  })()}

                  {/* Finance Committee */}
                  {(() => {
                    const rc = resultCommunications.find((c: any) => c.committee === "FINANCE");
                    const isSent = rc?.status === "SENT";
                    const isFailed = rc?.status === "FAILED";

                    return (
                      <div className="p-3.5 rounded-xl border border-white/20 bg-[#060B18] text-xs flex flex-col justify-between shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-rajdhani font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                            <Building className="w-3.5 h-3.5 text-[#FF5A16]" />
                            <span>FINANCE & PRIZE</span>
                          </span>
                          <span
                            className={`font-rajdhani text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                              isSent
                                ? "bg-[#00FF88]/20 text-[#00FF88] border border-[#00FF88]/30"
                                : isFailed
                                ? "bg-red-500/20 text-red-300 border border-red-500/40"
                                : "bg-white/10 text-slate-200 border border-white/20"
                            }`}
                          >
                            {rc?.status || (match?.status === "COMPLETED" ? "PENDING" : "STANDBY")}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-300 leading-relaxed">
                          {isSent
                            ? "Confirmed result dispatched. Prize ledger synced."
                            : "Awaiting match result confirmation."}
                        </p>
                      </div>
                    );
                  })()}

                  {/* Transportation Committee */}
                  {(() => {
                    const rc = resultCommunications.find((c: any) => c.committee === "TRANSPORTATION");
                    const isSent = rc?.status === "SENT";
                    const isFailed = rc?.status === "FAILED";

                    return (
                      <div className="p-3.5 rounded-xl border border-white/20 bg-[#060B18] text-xs flex flex-col justify-between shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-rajdhani font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                            <Bus className="w-3.5 h-3.5 text-[#FF5A16]" />
                            <span>TRANSPORTATION</span>
                          </span>
                          <span
                            className={`font-rajdhani text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                              isSent
                                ? "bg-[#00FF88]/20 text-[#00FF88] border border-[#00FF88]/30"
                                : isFailed
                                ? "bg-red-500/20 text-red-300 border border-red-500/40"
                                : "bg-white/10 text-slate-200 border border-white/20"
                            }`}
                          >
                            {rc?.status || (match?.status === "COMPLETED" ? "PENDING" : "STANDBY")}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-300 leading-relaxed">
                          {isSent
                            ? "Confirmed result dispatched. Shuttle bus pickup coordinated."
                            : "Awaiting match result confirmation."}
                        </p>
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* SECTION 8: TECHNICAL AUDIT TRAIL */}
              <div className="bg-[#0B132B]/60 rounded-2xl border border-white/10 p-5 backdrop-blur-xl">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-rajdhani text-xs font-bold text-slate-400 tracking-wider uppercase flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-[#FF5A16]" />
                    TECHNICAL ACTIVITY & AUDIT TIMELINE
                  </span>
                  <span className="font-mono text-xs text-slate-400">
                    {auditHistory.length} audit events logged
                  </span>
                </div>

                {auditHistory.length === 0 ? (
                  <p className="text-xs text-slate-500 italic py-2">No activity events recorded yet.</p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {auditHistory.map((log: any) => (
                      <div
                        key={log.id}
                        className="text-xs p-2.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-start justify-between gap-3"
                      >
                        <div>
                          <span className="font-mono font-bold text-[#FF5A16]">{log.action}</span>
                          <span className="text-slate-400 ml-2">by {log.actorEmail}</span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-500 shrink-0">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* FOOTER BAR */}
        <div className="bg-[#0B132B]/90 border-t border-white/10 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>Tournament Node:</span>
            <strong className="text-white font-rajdhani font-bold tracking-wider">{data?.config?.tournamentName || "SZWBT 2026"}</strong>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-white/10 hover:bg-white/20 border border-white/15 text-white rounded-lg font-rajdhani text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
          >
            Close Workspace
          </button>
        </div>
      </div>

      {/* INTERRUPTION MODAL */}
      {interruptionModalOpen && (
        <div className="fixed inset-0 z-60 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#080D1A] border border-white/15 rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="font-rajdhani text-lg font-bold text-white uppercase tracking-wider">
              {interruptionAction === "PAUSE"
                ? "Pause Match / Interruption"
                : interruptionAction === "RESUME"
                ? "Resume Match"
                : "Mark Technical Delay"}
            </h3>

            <div>
              <label className="block font-rajdhani text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                Reason
              </label>
              <select
                value={interruptionReason}
                onChange={(e) => setInterruptionReason(e.target.value)}
                className="w-full text-xs border border-white/15 rounded-lg p-2.5 bg-[#040711] text-white focus:outline-none focus:border-[#FF5A16]"
              >
                <option value="Court Condition / Surface Issue">Court Condition / Surface Issue</option>
                <option value="Medical Timeout / Player Injury">Medical Timeout / Player Injury</option>
                <option value="Net / Shuttlecock Equipment Issue">Net / Shuttlecock Equipment Issue</option>
                <option value="Electronic Scoring / Technical Hold">Electronic Scoring / Technical Hold</option>
                <option value="Official Umpire Interval">Official Umpire Interval</option>
                <option value="Other Technical Hold">Other Technical Hold</option>
              </select>
            </div>

            <div>
              <label className="block font-rajdhani text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                Notes (Optional)
              </label>
              <input
                type="text"
                placeholder="Additional notes for technical audit..."
                value={interruptionNotes}
                onChange={(e) => setInterruptionNotes(e.target.value)}
                className="w-full text-xs border border-white/15 rounded-lg p-2.5 bg-[#040711] text-white placeholder-slate-500 focus:outline-none focus:border-[#FF5A16]"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setInterruptionModalOpen(false)}
                className="px-4 py-2 text-xs font-rajdhani font-bold text-slate-400 hover:text-white uppercase tracking-wider cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteInterruption}
                disabled={actionPending}
                className="px-5 py-2 bg-[#FF5A16] hover:bg-[#FF7A1A] text-white rounded-lg font-rajdhani text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
              >
                {actionPending ? "Processing..." : `Execute ${interruptionAction}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
