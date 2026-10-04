"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import {
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
  Search,
  Filter,
  Flame,
  ArrowRight,
  Layers,
  Sparkles,
  ArrowLeft,
} from "lucide-react";
import { useAuth } from "@/lib/rbac/useAuth";
import { MatchControlDrawer } from "@/components/operations/MatchControlDrawer";

function ShuttlecockEmblem({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 28 32" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 14 L14 30 L22 14 Z" fill="#FFFFFF" stroke="#0F172A" strokeWidth="0.8" />
      <line x1="9" y1="16" x2="14" y2="29" stroke="#040711" strokeWidth="0.8" opacity="0.6" />
      <line x1="14" y1="15" x2="14" y2="29" stroke="#040711" strokeWidth="0.8" opacity="0.6" />
      <line x1="19" y1="16" x2="14" y2="29" stroke="#040711" strokeWidth="0.8" opacity="0.6" />
      <path d="M8.5 19 Q14 21 19.5 19" stroke="#00F0FF" strokeWidth="0.9" fill="none" opacity="0.9" />
      <path d="M10.5 24 Q14 25.5 17.5 24" stroke="#00F0FF" strokeWidth="0.8" fill="none" opacity="0.9" />
      <circle cx="14" cy="9" r="5" fill="#FF5A16" />
      <ellipse cx="14" cy="7.5" rx="3" ry="1.5" fill="#FFA366" opacity="0.8" />
      <path d="M9 10 Q14 12 19 10" stroke="#FFFFFF" strokeWidth="1" />
    </svg>
  );
}

function CourtScoreDisplay({ scoreA, scoreB }: { scoreA?: string | null; scoreB?: string | null }) {
  const sA = (scoreA || "0").trim();
  const sB = (scoreB || "0").trim();
  const isMultiSet = sA.includes(",") || sB.includes(",");

  if (isMultiSet) {
    const setsA = sA.split(",").map((s) => s.trim());
    const setsB = sB.split(",").map((s) => s.trim());
    const count = Math.max(setsA.length, setsB.length);

    return (
      <div className="bg-[#03060C]/90 border border-white/10 rounded-xl p-2 font-mono w-full">
        <div className="flex items-center justify-between text-[10px] text-slate-400 font-rajdhani font-bold uppercase tracking-wider mb-1 px-1">
          <span>MATCH SETS</span>
          <span className="text-[#FF5A16]">LIVE</span>
        </div>
        <div className="grid grid-flow-col auto-cols-fr gap-1.5 w-full">
          {Array.from({ length: count }).map((_, idx) => (
            <div
              key={idx}
              className="bg-white/[0.04] border border-white/10 rounded-lg py-1 px-1 text-center min-w-0"
            >
              <div className="text-[9px] text-slate-400 font-rajdhani uppercase font-semibold">
                S{idx + 1}
              </div>
              <div className="text-xs sm:text-sm font-black text-[#00F0FF] truncate">
                {setsA[idx] || "—"}-{setsB[idx] || "—"}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#03060C] border border-white/10 rounded-xl p-2.5 flex items-center justify-around font-mono w-full">
      <div className="text-center min-w-0 flex-1 px-1">
        <span className="font-rajdhani text-2xl sm:text-3xl font-black text-[#00F0FF] truncate block">
          {sA}
        </span>
      </div>
      <span className="font-rajdhani text-[11px] font-bold text-slate-500 uppercase tracking-widest shrink-0 px-2">
        VS
      </span>
      <div className="text-center min-w-0 flex-1 px-1">
        <span className="font-rajdhani text-2xl sm:text-3xl font-black text-[#00F0FF] truncate block">
          {sB}
        </span>
      </div>
    </div>
  );
}

interface GlobalStatus {
  tournament: string;
  tournamentStatus: string;
  venue: string;
  dates: string;
  liveMatches: number;
  pausedMatches: number;
  upcomingMatches: number;
  courtsInUse: number;
  courtsAvailable: number;
  delayedMatches: number;
  completedMatches: number;
  resultSubmittedMatches: number;
  totalMatches: number;
  totalCourts: number;
}

export default function TechnicalOperationsDashboard() {
  const { user, isAuthenticated, isLoading: authLoading, hasRole } = useAuth();

  // Active view tab: "ALL" | "COURTS" | "QUEUE" | "OFFICIALS" | "COMMUNICATIONS" | "ACTIVITY"
  const [activeTab, setActiveTab] = useState<"ALL" | "COURTS" | "QUEUE" | "OFFICIALS" | "COMMUNICATIONS" | "ACTIVITY">("ALL");

  // Telemetry state directly driven by backend API
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [telemetry, setTelemetry] = useState<any>(null);
  const [lastSyncTime, setLastSyncTime] = useState<string>("");

  // Drawer / Match Workspace state
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);

  // Court Control Room Modal state
  const [selectedCourtForControl, setSelectedCourtForControl] = useState<any | null>(null);
  const [courtUpdating, setCourtUpdating] = useState(false);
  const [courtActionMessage, setCourtActionMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [courtFormStatus, setCourtFormStatus] = useState<string>("AVAILABLE");
  const [courtFormUmpire, setCourtFormUmpire] = useState<string>("");

  // Filters for match queue
  const [queueFilterStatus, setQueueFilterStatus] = useState("ALL");
  const [queueFilterCourt, setQueueFilterCourt] = useState("ALL");
  const [queueFilterPool, setQueueFilterPool] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Handler to open control for a court
  const handleOpenControl = (court: any) => {
    if (court.activeMatch) {
      setSelectedMatchId(court.activeMatch.id);
    } else if (court.nextMatch) {
      setSelectedMatchId(court.nextMatch.id);
    } else {
      setSelectedCourtForControl(court);
      setCourtFormStatus(court.status || "AVAILABLE");
      setCourtFormUmpire(court.umpire && court.umpire !== "Unassigned" ? court.umpire : "");
      setCourtActionMessage(null);
    }
  };

  // Handler to save court status and umpire updates
  const handleSaveCourtDetails = async () => {
    if (!selectedCourtForControl) return;
    try {
      setCourtUpdating(true);
      setCourtActionMessage(null);
      const res = await fetch("/api/operations/courts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courtNumber: selectedCourtForControl.courtNumber,
          status: courtFormStatus,
          umpire: courtFormUmpire || "Unassigned",
        }),
      });
      const json = await res.json();
      if (json.success) {
        setCourtActionMessage({
          type: "success",
          text: `${selectedCourtForControl.courtNumber} settings updated successfully.`,
        });
        await fetchOperationsTelemetry(true);
      } else {
        setCourtActionMessage({
          type: "error",
          text: json.error || "Failed to update court.",
        });
      }
    } catch (err: any) {
      setCourtActionMessage({ type: "error", text: err.message });
    } finally {
      setCourtUpdating(false);
    }
  };

  // Handler to assign upcoming match from queue to this court
  const handleAssignMatchToCourt = async (matchId: string) => {
    if (!selectedCourtForControl) return;
    try {
      setCourtUpdating(true);
      setCourtActionMessage(null);
      const res = await fetch(`/api/operations/matches/${matchId}/court`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courtNumber: selectedCourtForControl.courtNumber,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setCourtActionMessage({
          type: "success",
          text: json.message || "Court assigned successfully.",
        });
        await fetchOperationsTelemetry(true);
        setSelectedCourtForControl(null);
        setSelectedMatchId(matchId);
      } else {
        setCourtActionMessage({
          type: "error",
          text: json.error || "Failed to assign match.",
        });
      }
    } catch (err: any) {
      setCourtActionMessage({ type: "error", text: err.message });
    } finally {
      setCourtUpdating(false);
    }
  };

  // Clock
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
          timeZone: "Asia/Kolkata",
        }) + " IST"
      );
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch Authoritative Technical Operations Telemetry
  const fetchOperationsTelemetry = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await fetch("/api/operations", {
        headers: { "Cache-Control": "no-cache" },
      });

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          setError(
            res.status === 403
              ? "403 Forbidden: Technical Operations clearance required. Only authorized Technical Committee or Administration personnel can access this control room."
              : "Authentication required. Please sign in."
          );
          setLoading(false);
          return;
        }
        throw new Error(`Failed to load telemetry (HTTP ${res.status})`);
      }

      const json = await res.json();
      if (json.success) {
        setTelemetry(json);
        setLastSyncTime(new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
        setError(null);
      } else {
        setError(json.error || "Failed to load operational telemetry.");
      }
    } catch (err: any) {
      setError("Network or server interruption: " + err.message);
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  // Initial Load & Periodic Sync (Every 4 seconds for live court turnaround)
  useEffect(() => {
    fetchOperationsTelemetry();

    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource("/api/operations/stream");
      eventSource.addEventListener("update", () => {
        fetchOperationsTelemetry(true);
      });
      eventSource.onerror = () => {
        eventSource?.close();
      };
    } catch {
      // Fallback to polling
    }

    const pollingInterval = setInterval(() => {
      fetchOperationsTelemetry(true);
    }, 4000);

    return () => {
      clearInterval(pollingInterval);
      if (eventSource) eventSource.close();
    };
  }, [fetchOperationsTelemetry]);

  // Derived Telemetry Values (NO HARDCODING)
  const globalStatus: GlobalStatus | null = telemetry?.globalStatus || null;
  const courts: any[] = telemetry?.courts || [];
  const queue: any[] = telemetry?.queue || [];
  const officials: any[] = telemetry?.officials || [];
  const recentActivity: any[] = telemetry?.recentActivity || [];
  const recentCommunications: any[] = telemetry?.recentCommunications || [];
  const config = telemetry?.config || {};

  // Filtered Queue
  const filteredQueue = useMemo(() => {
    return queue.filter((m) => {
      if (queueFilterStatus !== "ALL") {
        if (queueFilterStatus === "READY") {
          if (!m.readiness?.isReady) return false;
        } else if (queueFilterStatus === "WAITING") {
          if (m.status !== "READY_TO_START" && m.status !== "READY" && m.status !== "COURT_ASSIGNED") return false;
        } else if (m.status !== queueFilterStatus) {
          return false;
        }
      }

      if (queueFilterCourt !== "ALL" && m.court?.toLowerCase() !== queueFilterCourt.toLowerCase()) {
        return false;
      }

      if (queueFilterPool !== "ALL" && m.pool?.toUpperCase() !== queueFilterPool.toUpperCase()) {
        return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const numMatch = m.matchNumber?.toLowerCase().includes(q) || m.publicMatchNumber?.toLowerCase().includes(q);
        const teamMatch =
          m.playerA?.toLowerCase().includes(q) ||
          m.playerB?.toLowerCase().includes(q) ||
          m.institutionA?.toLowerCase().includes(q) ||
          m.institutionB?.toLowerCase().includes(q);
        if (!numMatch && !teamMatch) return false;
      }

      return true;
    });
  }, [queue, queueFilterStatus, queueFilterCourt, queueFilterPool, searchQuery]);

  // Compute live match timers or elapsed minutes
  const computeElapsedMinutes = (startTime?: string | null) => {
    if (!startTime) return "—";
    const start = new Date(startTime).getTime();
    const now = Date.now();
    const diffMins = Math.max(0, Math.floor((now - start) / 60000));
    return `${diffMins} min`;
  };

  // Render Loading State
  if (loading && !telemetry) {
    return (
      <div className="min-h-screen bg-[#03060C] flex flex-col items-center justify-center p-4 text-[#F8FAFC]">
        <div className="relative mb-6">
          <div className="w-16 h-16 rounded-full border-2 border-[#FF5A16]/20 border-t-[#FF5A16] animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <ShuttlecockEmblem className="w-6 h-6 animate-pulse" />
          </div>
        </div>
        <h2 className="font-rajdhani text-xl font-bold tracking-[0.16em] uppercase text-white">
          INITIALIZING TECHNICAL OPERATIONS COMMAND
        </h2>
        <p className="font-sans text-xs text-slate-400 mt-2 tracking-wider">
          Synchronizing Court Matrix, Umpire Rosters, Fixtures & Downstream Dispatches...
        </p>
      </div>
    );
  }

  // Render Access Denied / Auth Error State
  if (error && !telemetry) {
    return (
      <div className="min-h-screen bg-[#03060C] flex flex-col items-center justify-center p-4 text-[#F8FAFC]">
        <div className="max-w-md w-full bg-[#080D1A]/90 border border-red-500/30 rounded-2xl p-8 backdrop-blur-xl shadow-2xl text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto text-red-400">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h2 className="font-rajdhani text-xl font-bold uppercase tracking-wider text-white">
            TECHNICAL CONTROL ROOM RESTRICTED
          </h2>
          <p className="font-sans text-xs text-slate-300 leading-relaxed">{error}</p>
          <div className="pt-3 flex items-center justify-center gap-3">
            <button
              onClick={() => fetchOperationsTelemetry()}
              className="px-5 py-2.5 bg-[#FF5A16] hover:bg-[#FF7A1A] text-white rounded-lg font-rajdhani font-bold text-xs uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(255,90,22,0.4)]"
            >
              Retry Connection
            </button>
            <Link
              href="/login"
              className="px-5 py-2.5 bg-white/10 hover:bg-white/15 border border-white/15 text-white rounded-lg font-rajdhani font-bold text-xs uppercase tracking-wider transition-all"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#03060C] text-[#F8FAFC] font-sans selection:bg-[#FF5A16] selection:text-white flex flex-col relative overflow-x-hidden">
      {/* Atmospheric lighting accents matching home page */}
      <div
        className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 pointer-events-none z-0"
        style={{
          background: "radial-gradient(ellipse at 50% 0%, rgba(255,90,22,0.08) 0%, rgba(0,240,255,0.03) 40%, transparent 70%)",
        }}
      />

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* 1. TOP BRAND & TECHNICAL CONTROL ROOM HEADER */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <header className="sticky top-0 z-40 bg-[#040711]/95 backdrop-blur-2xl border-b border-white/10 select-none shadow-[0_4px_30px_rgba(0,0,0,0.85)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-col md:flex-row md:items-center justify-between gap-3 relative z-10">
          {/* Tournament Identity */}
          <div className="flex items-center gap-3.5">
            <Link href="/" className="group flex items-center gap-2.5 shrink-0" title="Return to Tournament Home">
              <div className="w-10 h-10 rounded-xl bg-[#080D1A] border border-white/15 flex items-center justify-center group-hover:border-[#FF5A16]/60 transition-colors shadow-inner">
                <ShuttlecockEmblem className="w-5 h-5 drop-shadow-[0_0_8px_rgba(255,90,22,0.6)]" />
              </div>
            </Link>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-rajdhani text-[11px] font-bold text-[#FF5A16] uppercase tracking-[0.18em] px-2 py-0.5 rounded bg-[#FF5A16]/10 border border-[#FF5A16]/30 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FF5A16] animate-pulse" />
                  TECHNICAL OPERATIONS COMMAND
                </span>
                <span className="font-rajdhani text-[11px] text-slate-400 font-bold uppercase tracking-wider hidden sm:inline">
                  • UMPIRE COMMITTEE &bull; ARENA GROUND ZERO
                </span>
              </div>
              <h1 className="font-rajdhani text-lg sm:text-xl font-black text-white tracking-wide leading-tight mt-0.5">
                {globalStatus?.tournament || "SOUTH ZONE WOMEN'S BADMINTON CHAMPIONSHIP 2026"}
              </h1>
            </div>
          </div>

          {/* Operational Status & Telemetry Sync Clock */}
          <div className="flex items-center gap-3 self-end md:self-auto shrink-0">
            <div className="text-right hidden sm:block">
              <div className="flex items-center justify-end gap-1.5 font-rajdhani text-xs font-bold text-white tracking-wider">
                <span className="w-2 h-2 rounded-full bg-[#00FF88] animate-pulse shadow-[0_0_8px_#00FF88]" />
                <span>{currentTime}</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                Telemetry Sync: {lastSyncTime || "Realtime"}
              </span>
            </div>

            <button
              onClick={() => fetchOperationsTelemetry()}
              disabled={loading}
              className="p-2.5 bg-[#0B132B] hover:bg-[#121E42] border border-white/25 hover:border-[#00F0FF]/60 rounded-xl text-[#00F0FF] hover:text-white transition-all cursor-pointer shadow-md flex items-center justify-center shrink-0"
              title="Synchronize field telemetry"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-[#FF5A16]" : "text-[#00F0FF]"}`} />
            </button>

            <Link
              href="/official"
              target="_blank"
              className="px-3.5 py-2 bg-[#FF5A16]/15 hover:bg-[#FF5A16] text-[#FF5A16] hover:text-white border border-[#FF5A16]/40 rounded-xl font-rajdhani text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(255,90,22,0.15)] shrink-0"
              title="Open Official / Umpire Scoring Portal (/official)"
            >
              <span>/official</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>

            <Link
              href="/"
              className="px-3.5 py-2 bg-[#0B132B] hover:bg-[#121E42] border border-white/25 hover:border-[#FF5A16]/60 text-white rounded-xl font-rajdhani text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all shadow-md shrink-0"
              title="Return to Tournament Homepage"
            >
              <ArrowLeft className="w-4 h-4 text-[#FF5A16]" />
              <span className="text-white font-black tracking-wider">HOME</span>
            </Link>
          </div>
        </div>
      </header>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* 2. GLOBAL EVENT STATUS HUD (Spacious, Uncluttered, High-Impact) */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <section className="relative z-10 py-5 px-4 sm:px-6 border-b border-white/10 bg-[#040814]/70 backdrop-blur-md">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
            {/* 1. TOURNAMENT STATUS */}
            <div className="bg-[#080D1A]/90 border border-white/10 rounded-xl p-3.5 flex flex-col justify-between hover:border-[#FF5A16]/40 transition-colors">
              <span className="font-rajdhani text-[10px] font-bold text-slate-400 uppercase tracking-[0.14em]">
                TOURNAMENT
              </span>
              <div className="my-1.5">
                <span className="font-rajdhani text-sm font-black text-[#00FF88] px-2 py-0.5 rounded bg-[#00FF88]/10 border border-[#00FF88]/30 inline-flex items-center gap-1.5 tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00FF88] animate-ping" />
                  {globalStatus?.tournamentStatus || "LIVE"}
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono truncate">
                {globalStatus?.dates || "OCTOBER 18-21"}
              </span>
            </div>

            {/* 2. LIVE MATCHES */}
            <div className="bg-[#080D1A]/90 border border-red-500/30 rounded-xl p-3.5 flex flex-col justify-between hover:border-red-500/60 transition-colors">
              <div className="flex items-center justify-between">
                <span className="font-rajdhani text-[10px] font-bold text-red-400 uppercase tracking-[0.14em]">
                  LIVE MATCHES
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              </div>
              <div className="my-1">
                <span className="font-rajdhani text-3xl font-black text-red-500 leading-none">
                  {globalStatus?.liveMatches !== undefined ? globalStatus.liveMatches : "0"}
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                {globalStatus?.pausedMatches ? `${globalStatus.pausedMatches} Paused` : "Active On-Court"}
              </span>
            </div>

            {/* 3. COURTS IN PLAY / AVAILABLE */}
            <div className="bg-[#080D1A]/90 border border-[#00FF88]/30 rounded-xl p-3.5 flex flex-col justify-between hover:border-[#00FF88]/60 transition-colors">
              <span className="font-rajdhani text-[10px] font-bold text-[#00FF88] uppercase tracking-[0.14em]">
                COURTS DEPLOYED
              </span>
              <div className="my-1">
                <span className="font-rajdhani text-3xl font-black text-[#00FF88] leading-none">
                  {globalStatus?.courtsInUse !== undefined ? globalStatus.courtsInUse : "0"}
                </span>
                <span className="text-xs font-mono text-slate-400 ml-1.5">
                  / {globalStatus?.totalCourts || courts.length}
                </span>
              </div>
              <span className="text-[10px] text-[#00FF88]/80 font-mono">
                {globalStatus?.courtsAvailable !== undefined ? globalStatus.courtsAvailable : "0"} Courts Ready
              </span>
            </div>

            {/* 4. SCHEDULED MATCH QUEUE */}
            <div className="bg-[#080D1A]/90 border border-[#00F0FF]/30 rounded-xl p-3.5 flex flex-col justify-between hover:border-[#00F0FF]/60 transition-colors">
              <span className="font-rajdhani text-[10px] font-bold text-[#00F0FF] uppercase tracking-[0.14em]">
                SCHEDULED QUEUE
              </span>
              <div className="my-1">
                <span className="font-rajdhani text-3xl font-black text-[#00F0FF] leading-none">
                  {globalStatus?.upcomingMatches !== undefined ? globalStatus.upcomingMatches : "0"}
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">In Bracket Rotation</span>
            </div>

            {/* 5. RESULT SUBMITTED (PENDING TECHOPS CHECK) */}
            <div className="bg-[#080D1A]/90 border border-[#FFD700]/30 rounded-xl p-3.5 flex flex-col justify-between hover:border-[#FFD700]/60 transition-colors">
              <span className="font-rajdhani text-[10px] font-bold text-[#FFD700] uppercase tracking-[0.14em]">
                SUBMITTED RESULTS
              </span>
              <div className="my-1">
                <span className="font-rajdhani text-3xl font-black text-[#FFD700] leading-none">
                  {globalStatus?.resultSubmittedMatches !== undefined ? globalStatus.resultSubmittedMatches : "0"}
                </span>
              </div>
              <span className="text-[10px] text-[#FFD700]/80 font-mono">Awaiting TechOps Confirm</span>
            </div>

            {/* 6. COMPLETED MATCHES */}
            <div className="bg-[#080D1A]/90 border border-white/10 rounded-xl p-3.5 flex flex-col justify-between hover:border-white/20 transition-colors">
              <span className="font-rajdhani text-[10px] font-bold text-slate-400 uppercase tracking-[0.14em]">
                COMPLETED
              </span>
              <div className="my-1">
                <span className="font-rajdhani text-3xl font-black text-slate-200 leading-none">
                  {globalStatus?.completedMatches !== undefined ? globalStatus.completedMatches : "0"}
                </span>
                <span className="text-xs font-mono text-slate-400 ml-1.5">
                  / {globalStatus?.totalMatches || queue.length}
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">Knockout Progress</span>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* 3. NAVIGATION TAB STRIP */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <div className="sticky top-[65px] z-30 bg-[#03060C]/95 backdrop-blur-xl border-b border-white/15 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between overflow-x-auto py-2.5 scrollbar-none">
          <div className="flex items-center gap-2">
            {[
              { id: "ALL", label: "CONTROL OVERVIEW", icon: Layers },
              { id: "COURTS", label: `COURTS (${courts.length})`, icon: MapPin },
              { id: "QUEUE", label: `MATCH QUEUE (${queue.length})`, icon: Clock },
              { id: "OFFICIALS", label: `OFFICIALS (${officials.length})`, icon: UserCheck },
              { id: "COMMUNICATIONS", label: "RESULT DISPATCH", icon: Send },
              { id: "ACTIVITY", label: "AUDIT LOGS", icon: Activity },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3.5 py-1.5 rounded-lg font-rajdhani text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 shrink-0 cursor-pointer shadow-sm ${
                    isActive
                      ? "bg-[#FF5A16] text-white shadow-[0_0_20px_rgba(255,90,22,0.45)] border border-[#FF7A1A]"
                      : "bg-[#0B132B] hover:bg-[#121E42] text-slate-200 hover:text-white border border-white/20 hover:border-[#FF5A16]/60"
                  }`}
                >
                  <tab.icon className={`w-3.5 h-3.5 ${isActive ? "text-white" : "text-[#FF5A16]"}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div className="hidden lg:flex items-center gap-2 font-rajdhani text-xs text-slate-300 tracking-wider">
            <span className="text-slate-400">ARENA VENUE:</span>
            <strong className="text-white uppercase font-bold">{config.venue || "KLE Tech Indoor Stadium"}</strong>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* MAIN CONTENT AREA */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-8 relative z-10">
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* SECTION A: COURT CONTROL MATRIX */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {(activeTab === "ALL" || activeTab === "COURTS") && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-rajdhani text-base font-black text-white tracking-wider uppercase flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#FF5A16]" />
                  <span>COURT CONTROL MATRIX</span>
                </h2>
                <p className="font-sans text-xs text-slate-400 mt-0.5">
                  Real-time court status, assigned umpires, in-play scoring telemetry, and turnaround readiness.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-rajdhani text-xs text-slate-300 font-bold uppercase tracking-wider bg-[#0B132B] border border-white/20 px-3 py-1 rounded-full shadow-sm">
                  <span className="text-[#00FF88]">{courts.filter((c) => c.status === "LIVE").length} LIVE</span> &bull;{" "}
                  <span>{courts.filter((c) => c.status === "AVAILABLE" || c.status === "READY").length} READY</span>
                </span>
              </div>
            </div>

            {courts.length === 0 ? (
              <div className="bg-[#080D1A]/90 rounded-2xl border border-white/10 p-10 text-center text-slate-400">
                No tournament courts configured in database.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 items-stretch">
                {courts.map((court) => {
                  const isLive = court.status === "LIVE";
                  const isPaused = court.status === "PAUSED";
                  const isAssigned = court.status === "ASSIGNED";
                  const isPostMatch = court.status === "POST_MATCH" || court.status === "COMPLETED";
                  const isAvailable = court.status === "AVAILABLE" || court.status === "READY";
                  const isIssue = court.hasIssue || court.status === "MAINTENANCE" || court.status === "BLOCKED";

                  return (
                    <div
                      key={court.id}
                      onClick={() => handleOpenControl(court)}
                      className={`box-border bg-[#080D1A]/95 rounded-2xl border transition-all p-5 sm:p-6 backdrop-blur-xl flex flex-col justify-between group cursor-pointer min-h-[330px] h-full min-w-0 ${
                        isLive
                          ? "border-[#FF5A16] shadow-[0_0_30px_rgba(255,90,22,0.25)] hover:border-[#FF7A1A]"
                          : isPaused
                          ? "border-[#FFD700] shadow-[0_0_20px_rgba(255,215,0,0.2)]"
                          : isAssigned
                          ? "border-[#00F0FF]/40 hover:border-[#00F0FF]"
                          : isPostMatch
                          ? "border-blue-500/40 bg-blue-950/20"
                          : isIssue
                          ? "border-red-500/40 bg-red-950/20"
                          : "border-white/15 hover:border-white/35"
                      }`}
                    >
                      {/* Top Bar: Court Name + Status Badge */}
                      <div className="flex items-center justify-between gap-3 mb-4 min-w-0 shrink-0">
                        <h3 className="font-rajdhani text-xl font-black text-white tracking-wider uppercase leading-none">
                          {court.courtNumber}
                        </h3>
                        <span
                          className={`font-rajdhani text-xs font-black px-3 py-1 rounded-md uppercase tracking-wider flex items-center gap-1.5 shrink-0 shadow-sm border ${
                            isLive
                              ? "bg-red-500/25 text-red-200 border-red-400/60"
                              : isPaused
                              ? "bg-amber-500/25 text-amber-200 border-amber-400/60"
                              : isAssigned
                              ? "bg-cyan-500/25 text-cyan-200 border-cyan-400/60"
                              : isPostMatch
                              ? "bg-blue-500/25 text-blue-200 border-blue-400/60"
                              : isAvailable
                              ? "bg-emerald-500/25 text-emerald-200 border-emerald-400/60"
                              : "bg-white/10 text-slate-200 border-white/20"
                          }`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full shrink-0 ${
                              isLive
                                ? "bg-red-400 animate-ping"
                                : isAvailable
                                ? "bg-emerald-400 shadow-[0_0_6px_#34d399]"
                                : "bg-slate-400"
                            }`}
                          />
                          <span>{court.status === "READY" ? "COURT READY" : court.status}</span>
                        </span>
                      </div>

                      {/* Middle Content Area */}
                      <div className="flex-1 flex flex-col justify-between min-w-0">
                        {court.activeMatch ? (
                          <div className="space-y-2 py-1 flex-1 flex flex-col justify-between min-w-0">
                            <div className="flex items-center justify-between text-xs min-w-0 gap-2">
                              <span className="font-rajdhani font-bold text-[#FF5A16] tracking-wider uppercase truncate">
                                #{court.activeMatch.publicMatchNumber || court.activeMatch.matchNumber}
                              </span>
                              <span className="font-mono text-xs text-slate-400 flex items-center gap-1 shrink-0">
                                <Clock className="w-3 h-3 text-[#FF5A16]" />
                                {computeElapsedMinutes(court.activeMatch.actualStartTime)}
                              </span>
                            </div>

                            <div className="space-y-1 min-w-0">
                              <div
                                className="text-xs font-bold text-white break-words leading-snug line-clamp-1"
                                title={court.activeMatch.playerA}
                              >
                                {court.activeMatch.playerA}
                              </div>
                              <div
                                className="text-xs font-bold text-white break-words leading-snug line-clamp-1"
                                title={court.activeMatch.playerB}
                              >
                                {court.activeMatch.playerB}
                              </div>
                            </div>

                            <CourtScoreDisplay
                              scoreA={court.activeMatch.scoreA}
                              scoreB={court.activeMatch.scoreB}
                            />
                          </div>
                        ) : (
                          /* [large empty/content area] providing comfortable breathing room */
                          <div className="flex-1 min-h-[60px]" />
                        )}

                        {/* NEXT ASSIGNED Section (Aligned across all 4 cards) */}
                        <div className="pt-3 pb-1 min-w-0 border-t border-white/10">
                          <div className="font-rajdhani text-[11px] font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                            <Clock className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                            <span>NEXT ASSIGNED</span>
                          </div>
                          {court.nextMatch ? (
                            <div className="space-y-1 min-w-0">
                              <div className="text-xs font-bold text-white font-mono flex items-center gap-1.5 truncate">
                                <span className="text-[#FF5A16]">
                                  #{court.nextMatch.publicMatchNumber || court.nextMatch.matchNumber}
                                </span>
                                <span className="text-slate-500">&bull;</span>
                                <span className="text-slate-300">{court.nextMatch.time}</span>
                              </div>
                              <div
                                className="text-xs text-slate-300 leading-snug break-words"
                                title={`${court.nextMatch.playerA} vs ${court.nextMatch.playerB}`}
                              >
                                {court.nextMatch.playerA} vs {court.nextMatch.playerB}
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-1 min-w-0">
                              <div className="text-xs font-mono text-slate-400">
                                None queued &bull; Standby
                              </div>
                              <div className="text-xs text-slate-500 leading-snug">
                                Awaiting fixture rotation
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Bottom Strip: Umpire & Quick Action */}
                      <div className="mt-auto pt-4 border-t border-white/10 flex items-center justify-between gap-3 min-w-0 shrink-0">
                        <div className="text-xs text-slate-300 min-w-0 flex-1 truncate" title={court.umpire}>
                          <span className="text-slate-400 font-medium">Ump: </span>
                          <strong className="text-white font-semibold">
                            {court.umpire || "Unassigned"}
                          </strong>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenControl(court);
                          }}
                          className="font-rajdhani font-bold text-xs text-white bg-[#FF5A16] hover:bg-[#FF7A1A] active:scale-95 border border-[#FF7A1A] px-3.5 py-1.5 rounded-lg shadow-[0_0_15px_rgba(255,90,22,0.35)] flex items-center gap-1.5 uppercase tracking-wider transition-all cursor-pointer shrink-0"
                          title={`Open Court Control for ${court.courtNumber}`}
                        >
                          <span>CONTROL</span>
                          <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* SECTION B: MATCH QUEUE & PRE-MATCH CONTROL */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {(activeTab === "ALL" || activeTab === "QUEUE") && (
          <div className="bg-[#080D1A]/90 rounded-2xl border border-white/10 backdrop-blur-xl shadow-xl overflow-hidden">
            {/* Header & Filter Controls */}
            <div className="p-4 sm:p-5 border-b border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="font-rajdhani text-base font-black text-white tracking-wider uppercase flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#FF5A16]" />
                  <span>SCHEDULED MATCH QUEUE</span>
                </h2>
                <p className="font-sans text-xs text-slate-400 mt-0.5">
                  Synchronized live queue backed by official tournament schedule and bracket progression.
                </p>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-2.5">
                {/* Search */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search match # / team..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 pr-3 py-1.5 text-xs border border-white/15 rounded-lg bg-[#040711] text-white placeholder-slate-500 w-44 sm:w-60 focus:outline-none focus:border-[#FF5A16]"
                  />
                </div>

                {/* Status Filter */}
                <select
                  value={queueFilterStatus}
                  onChange={(e) => setQueueFilterStatus(e.target.value)}
                  className="text-xs border border-white/15 rounded-lg py-1.5 px-2.5 bg-[#040711] text-white font-medium focus:outline-none focus:border-[#FF5A16]"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="READY">Ready for Handoff</option>
                  <option value="LIVE">Live In Play</option>
                  <option value="READY_TO_START">Sent to Umpire</option>
                  <option value="COURT_ASSIGNED">Court Assigned</option>
                  <option value="UPCOMING">Upcoming</option>
                  <option value="RESULT_SUBMITTED">Result Submitted</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="DELAYED">Delayed</option>
                </select>

                {/* Court Filter */}
                <select
                  value={queueFilterCourt}
                  onChange={(e) => setQueueFilterCourt(e.target.value)}
                  className="text-xs border border-white/15 rounded-lg py-1.5 px-2.5 bg-[#040711] text-white font-medium focus:outline-none focus:border-[#FF5A16]"
                >
                  <option value="ALL">All Courts</option>
                  {courts.map((c) => (
                    <option key={c.id} value={c.courtNumber}>
                      {c.courtNumber}
                    </option>
                  ))}
                </select>

                {/* Pool Filter */}
                <select
                  value={queueFilterPool}
                  onChange={(e) => setQueueFilterPool(e.target.value)}
                  className="text-xs border border-white/15 rounded-lg py-1.5 px-2.5 bg-[#040711] text-white font-medium focus:outline-none focus:border-[#FF5A16]"
                >
                  <option value="ALL">All Pools</option>
                  <option value="A">Pool A</option>
                  <option value="B">Pool B</option>
                  <option value="C">Pool C</option>
                  <option value="D">Pool D</option>
                </select>
              </div>
            </div>

            {/* TECHNICAL DATA TABLE */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-[#040711]/95 text-slate-200 font-rajdhani font-bold uppercase text-[11px] tracking-wider border-b border-white/15">
                  <tr>
                    <th className="py-3 px-4 min-w-[105px]">
                      <span className="inline-flex items-center gap-1.5 text-white">
                        <Trophy className="w-3.5 h-3.5 text-[#FF5A16]" />
                        <span>MATCH #</span>
                      </span>
                    </th>
                    <th className="py-3 px-3 min-w-[120px]">
                      <span className="inline-flex items-center gap-1.5 text-white">
                        <Layers className="w-3.5 h-3.5 text-cyan-400" />
                        <span>POOL / ROUND</span>
                      </span>
                    </th>
                    <th className="py-3 px-4 min-w-[240px]">
                      <span className="inline-flex items-center gap-1.5 text-white">
                        <Users className="w-3.5 h-3.5 text-[#00FF88]" />
                        <span>CONTESTING TEAMS</span>
                      </span>
                    </th>
                    <th className="py-3 px-3 min-w-[100px]">
                      <span className="inline-flex items-center gap-1.5 text-white">
                        <Clock className="w-3.5 h-3.5 text-amber-400" />
                        <span>TIME</span>
                      </span>
                    </th>
                    <th className="py-3 px-3 min-w-[100px]">
                      <span className="inline-flex items-center gap-1.5 text-white">
                        <MapPin className="w-3.5 h-3.5 text-[#FF5A16]" />
                        <span>COURT</span>
                      </span>
                    </th>
                    <th className="py-3 px-3 min-w-[110px]">
                      <span className="inline-flex items-center gap-1.5 text-white">
                        <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
                        <span>UMPIRE</span>
                      </span>
                    </th>
                    <th className="py-3 px-3 min-w-[120px]">
                      <span className="inline-flex items-center gap-1.5 text-white">
                        <Shield className="w-3.5 h-3.5 text-emerald-400" />
                        <span>READINESS</span>
                      </span>
                    </th>
                    <th className="py-3 px-3 min-w-[120px]">
                      <span className="inline-flex items-center gap-1.5 text-white">
                        <Activity className="w-3.5 h-3.5 text-amber-400" />
                        <span>STATUS</span>
                      </span>
                    </th>
                    <th className="py-3 px-4 text-right min-w-[100px]">
                      <span className="inline-flex items-center justify-end gap-1.5 text-white">
                        <Sparkles className="w-3.5 h-3.5 text-slate-300" />
                        <span>ACTION</span>
                      </span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredQueue.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-16 text-center">
                        <div className="flex flex-col items-center justify-center space-y-2">
                          <Clock className="w-8 h-8 text-[#FF5A16] opacity-75" />
                          <span className="font-rajdhani text-sm font-bold text-white uppercase tracking-wider">
                            No scheduled matches
                          </span>
                          <span className="text-xs text-slate-400 max-w-md mx-auto">
                            {queue.length === 0
                              ? "No tournament matches are currently queued or scheduled in this round."
                              : "No scheduled matches match the selected filter criteria."}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredQueue.map((m) => {
                      const isLive = m.status === "LIVE";
                      const isReadyToStart = m.status === "READY_TO_START";
                      const isCompleted = m.status === "COMPLETED" || m.status === "RESULT_CONFIRMED";
                      const isSubmitted = m.status === "RESULT_SUBMITTED";
                      const isReady = m.readiness?.isReady;

                      return (
                        <tr
                          key={m.id}
                          onClick={() => setSelectedMatchId(m.id)}
                          className="hover:bg-white/[0.04] cursor-pointer transition-colors"
                        >
                          {/* Match Number */}
                          <td className="py-3.5 px-4 font-mono font-bold text-white whitespace-nowrap">
                            <span className="text-[#FF5A16] flex items-center gap-1.5">
                              {isLive && <Radio className="w-3 h-3 text-red-400 animate-pulse shrink-0" />}
                              <span>{m.publicMatchNumber || m.matchNumber}</span>
                            </span>
                            <span className="text-[10px] text-slate-400 font-sans block mt-0.5">
                              {m.category}
                            </span>
                          </td>

                          {/* Pool / Round */}
                          <td className="py-3.5 px-3 whitespace-nowrap">
                            <span className="font-rajdhani font-black text-xs px-2.5 py-0.5 rounded bg-sky-500/20 border border-sky-400/40 text-sky-200 uppercase inline-flex items-center gap-1 shadow-sm">
                              <Layers className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                              <span>Pool {m.pool || "A"}</span>
                            </span>
                            <span className="text-[11px] text-slate-300 font-semibold block truncate max-w-[120px] mt-1">
                              {m.roundName || m.roundStage || "Round 1"}
                            </span>
                          </td>

                          {/* Teams & Universities */}
                          <td className="py-3.5 px-4 min-w-[220px]">
                            <div className="font-extrabold text-white text-sm leading-tight truncate">
                              {m.playerA}
                            </div>
                            {m.institutionA && (
                              <div className="text-[11px] font-semibold text-cyan-200 truncate flex items-center gap-1 mt-0.5">
                                <Building className="w-3 h-3 text-cyan-400 shrink-0" />
                                <span>{m.institutionA}</span>
                              </div>
                            )}
                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest my-1 flex items-center gap-2">
                              <span className="h-[1px] w-4 bg-white/10" />
                              <span>VS</span>
                              <span className="h-[1px] w-4 bg-white/10" />
                            </div>
                            <div className="font-extrabold text-white text-sm leading-tight truncate">
                              {m.playerB}
                            </div>
                            {m.institutionB && (
                              <div className="text-[11px] font-semibold text-purple-200 truncate flex items-center gap-1 mt-0.5">
                                <Building className="w-3 h-3 text-purple-400 shrink-0" />
                                <span>{m.institutionB}</span>
                              </div>
                            )}
                          </td>

                          {/* Scheduled Time */}
                          <td className="py-3.5 px-3 font-mono text-slate-200 whitespace-nowrap">
                            <span className="flex items-center gap-1.5 font-bold">
                              <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                              <span>{m.time}</span>
                            </span>
                          </td>

                          {/* Court */}
                          <td className="py-3.5 px-3 whitespace-nowrap">
                            {m.court && m.court !== "TBD" && m.court !== "Unassigned" ? (
                              <span className="font-rajdhani font-black text-white bg-[#0A1020] border border-white/20 px-2.5 py-1 rounded text-xs inline-flex items-center gap-1.5 shadow-sm">
                                <MapPin className="w-3.5 h-3.5 text-[#FF5A16] shrink-0" />
                                <span>{m.court}</span>
                              </span>
                            ) : (
                              <span className="text-slate-500 italic text-[11px]">Unassigned</span>
                            )}
                          </td>

                          {/* Umpire */}
                          <td className="py-3.5 px-3 whitespace-nowrap text-slate-200">
                            {m.assignedOfficialId ? (
                              <span className="truncate max-w-[120px] inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-200" title={m.assignedOfficialId}>
                                <UserCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                                <span>Assigned</span>
                              </span>
                            ) : (
                              <span className="text-slate-500 italic text-[11px]">Unassigned</span>
                            )}
                          </td>

                          {/* Technical Readiness */}
                          <td className="py-3.5 px-3 whitespace-nowrap">
                            <span
                              className={`font-rajdhani text-xs font-black px-2.5 py-1 rounded uppercase tracking-wider inline-flex items-center gap-1.5 shadow-sm border ${
                                isReady
                                  ? "bg-emerald-500/25 text-emerald-200 border-emerald-400/50"
                                  : "bg-amber-500/25 text-amber-200 border-amber-400/50"
                              }`}
                            >
                              {isReady ? (
                                <>
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                  <span>COURT READY ✓</span>
                                </>
                              ) : (
                                <>
                                  <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                                  <span>{m.readiness?.blockingReasons?.length || 0} UNMET</span>
                                </>
                              )}
                            </span>
                          </td>

                          {/* Status */}
                          <td className="py-3.5 px-3 whitespace-nowrap">
                            <span
                              className={`font-rajdhani text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1.5 w-fit ${
                                isLive
                                  ? "bg-red-500/20 text-red-400 border border-red-500/40"
                                  : isReadyToStart
                                  ? "bg-[#00FF88]/20 text-[#00FF88] border border-[#00FF88]/40"
                                  : isSubmitted
                                  ? "bg-[#FFD700]/20 text-[#FFD700] border border-[#FFD700]/40"
                                  : isCompleted
                                  ? "bg-white/10 text-slate-400"
                                  : "bg-white/5 text-slate-300"
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  isLive ? "bg-red-400 animate-pulse" : isReadyToStart ? "bg-[#00FF88]" : "bg-slate-400"
                                }`}
                              />
                              {m.status}
                            </span>
                          </td>

                          {/* Action Button */}
                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedMatchId(m.id);
                              }}
                              className="px-3 py-1 bg-[#FF5A16]/15 hover:bg-[#FF5A16] text-[#FF5A16] hover:text-white border border-[#FF5A16]/30 rounded-lg font-rajdhani text-xs font-bold uppercase tracking-wider transition-all cursor-pointer inline-flex items-center gap-1"
                            >
                              <Search className="w-3 h-3" />
                              <span>Inspect</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Queue Footer */}
            <div className="p-3.5 bg-[#040711]/90 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
              <span>Showing {filteredQueue.length} of {queue.length} scheduled tournament matches</span>
              <span className="font-mono text-[11px]">Knockout Fixture Graph &bull; Turnaround Engine</span>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* SECTION C: OFFICIALS ROSTER & AVAILABILITY */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {(activeTab === "ALL" || activeTab === "OFFICIALS") && (
          <div className="bg-[#080D1A]/90 rounded-2xl border border-white/10 backdrop-blur-xl shadow-xl p-5 sm:p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="font-rajdhani text-base font-black text-white tracking-wider uppercase flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-[#FF5A16]" />
                  <span>TECHNICAL OFFICIALS & UMPIRES ROSTER</span>
                </h2>
                <p className="font-sans text-xs text-slate-400 mt-0.5">
                  Certified technical officials retrieved directly from database with operational clearances.
                </p>
              </div>

              <span className="font-rajdhani text-xs font-bold text-slate-300 bg-[#0B132B] border border-white/20 px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                <span className="text-[#00FF88]">{officials.filter((o) => o.isAvailable).length}</span> of {officials.length} Available
              </span>
            </div>

            {officials.length === 0 ? (
              <div className="p-10 rounded-xl border border-white/10 bg-white/[0.02] text-center space-y-2">
                <UserCheck className="w-8 h-8 text-[#FF5A16] mx-auto opacity-75" />
                <p className="font-rajdhani text-sm font-bold text-white uppercase tracking-wider">
                  No officials assigned
                </p>
                <p className="text-xs text-slate-400">
                  Technical officials and match umpires have not been assigned in the roster.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                {officials.map((off) => (
                  <div
                    key={off.id}
                    className={`p-4 rounded-xl border text-xs flex flex-col justify-between transition-colors ${
                      off.isAvailable
                        ? "border-white/10 bg-white/[0.02] hover:border-white/20"
                        : "border-amber-500/30 bg-amber-950/10 text-slate-400"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-bold text-white text-sm">{off.name}</span>
                        <span
                          className={`font-rajdhani text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                            off.isAvailable
                              ? "bg-[#00FF88]/15 text-[#00FF88] border border-[#00FF88]/30"
                              : "bg-[#FFD700]/15 text-[#FFD700] border border-[#FFD700]/30"
                          }`}
                        >
                          {off.isAvailable ? "AVAILABLE" : "OCCUPIED"}
                        </span>
                      </div>
                      <span className="font-rajdhani text-xs text-[#00F0FF] uppercase tracking-wider block">
                        {off.badge}
                      </span>
                    </div>

                    <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                      <span className="truncate max-w-[140px]">{off.email}</span>
                      <span>{off.isUmpire ? "Umpire" : "Official"}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* SECTION D: COMMITTEE RESULT SYNCHRONIZATION DISPATCH (LIVE DATA) */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {(activeTab === "ALL" || activeTab === "COMMUNICATIONS") && (
          <div className="bg-[#080D1A]/90 rounded-2xl border border-white/10 backdrop-blur-xl shadow-xl p-5 sm:p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="font-rajdhani text-base font-black text-white tracking-wider uppercase flex items-center gap-2">
                  <Send className="w-4 h-4 text-[#FF5A16]" />
                  <span>COMMITTEE RESULT SYNCHRONIZATION DISPATCH</span>
                </h2>
                <p className="font-sans text-xs text-slate-400 mt-0.5">
                  Confirmed match outcomes are authoritatively communicated to Accommodation, Finance, and Transportation committees.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#00FF88] animate-pulse" />
                <span className="font-rajdhani text-xs text-[#00FF88] font-bold uppercase tracking-wider">
                  3 ACTIVE DISPATCH CHANNELS
                </span>
              </div>
            </div>

            {/* Committee Channel Indicators */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mb-6">
              <div className="p-3.5 rounded-xl border border-white/10 bg-white/[0.02] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#FF5A16]/10 border border-[#FF5A16]/30 flex items-center justify-center text-[#FF5A16]">
                    <Home className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-rajdhani font-bold text-xs text-white uppercase tracking-wider">
                      ACCOMMODATION
                    </div>
                    <div className="text-[10px] text-slate-400">Hostel Departure Sync</div>
                  </div>
                </div>
                <span className="font-rajdhani text-[10px] font-bold text-[#00FF88] bg-[#00FF88]/10 px-2 py-0.5 rounded border border-[#00FF88]/30 uppercase">
                  ACTIVE
                </span>
              </div>

              <div className="p-3.5 rounded-xl border border-white/10 bg-white/[0.02] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#FFD700]/10 border border-[#FFD700]/30 flex items-center justify-center text-[#FFD700]">
                    <Building className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-rajdhani font-bold text-xs text-white uppercase tracking-wider">
                      FINANCE & AUDIT
                    </div>
                    <div className="text-[10px] text-slate-400">Ledger Reconciliation</div>
                  </div>
                </div>
                <span className="font-rajdhani text-[10px] font-bold text-[#00FF88] bg-[#00FF88]/10 px-2 py-0.5 rounded border border-[#00FF88]/30 uppercase">
                  ACTIVE
                </span>
              </div>

              <div className="p-3.5 rounded-xl border border-white/10 bg-white/[0.02] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#00F0FF]/10 border border-[#00F0FF]/30 flex items-center justify-center text-[#00F0FF]">
                    <Bus className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-rajdhani font-bold text-xs text-white uppercase tracking-wider">
                      TRANSPORTATION
                    </div>
                    <div className="text-[10px] text-slate-400">Contingent Bus Pickup</div>
                  </div>
                </div>
                <span className="font-rajdhani text-[10px] font-bold text-[#00FF88] bg-[#00FF88]/10 px-2 py-0.5 rounded border border-[#00FF88]/30 uppercase">
                  ACTIVE
                </span>
              </div>
            </div>

            {/* Live Database Communications Feed */}
            {recentCommunications.length === 0 ? (
              <div className="p-8 rounded-xl border border-white/10 bg-white/[0.02] text-center space-y-2">
                <p className="font-rajdhani text-sm font-bold text-slate-300 uppercase tracking-wider">
                  Result Dispatch Channels Standing By
                </p>
                <p className="font-sans text-xs text-slate-400 max-w-lg mx-auto">
                  Authoritative communications will automatically dispatch across Accommodation, Finance, and Transportation committees immediately upon match result confirmation by Technical Operations.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-[#040711]/90 text-slate-400 font-rajdhani font-bold uppercase text-[11px] tracking-wider border-b border-white/10">
                    <tr>
                      <th className="py-2.5 px-3">MATCH #</th>
                      <th className="py-2.5 px-3">CONTESTING TEAMS</th>
                      <th className="py-2.5 px-3">TARGET COMMITTEE</th>
                      <th className="py-2.5 px-3">CHANNEL</th>
                      <th className="py-2.5 px-3">SENT AT</th>
                      <th className="py-2.5 px-3 text-right">DELIVERY STATUS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-sans">
                    {recentCommunications.map((comm: any) => (
                      <tr key={comm.id} className="hover:bg-white/[0.03]">
                        <td className="py-2.5 px-3 font-mono font-bold text-[#FF5A16]">
                          {comm.matchNumber}
                        </td>
                        <td className="py-2.5 px-3 font-medium text-white">
                          {comm.playerA} vs {comm.playerB}
                        </td>
                        <td className="py-2.5 px-3 font-rajdhani font-bold text-slate-200 uppercase">
                          {comm.committee}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[11px] text-slate-400">
                          {comm.channel}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[11px] text-slate-400">
                          {comm.sentAt ? new Date(comm.sentAt).toLocaleTimeString("en-IN") : "—"}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <span className="font-rajdhani text-[10px] font-bold px-2 py-0.5 rounded bg-[#00FF88]/15 text-[#00FF88] border border-[#00FF88]/30 uppercase">
                            {comm.status || "SENT"} ✓
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* SECTION E: TECHNICAL ACTIVITY & AUDIT TIMELINE */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {(activeTab === "ALL" || activeTab === "ACTIVITY") && (
          <div className="bg-[#080D1A]/90 rounded-2xl border border-white/10 backdrop-blur-xl shadow-xl p-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-rajdhani text-base font-black text-white tracking-wider uppercase flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[#FF5A16]" />
                  <span>TECHNICAL COMMITTEE ACTIVITY AUDIT TRAIL</span>
                </h2>
                <p className="font-sans text-xs text-slate-400 mt-0.5">
                  Tamper-evident logs of court assignments, umpire handoffs, readiness checks, and confirmed results.
                </p>
              </div>

              <span className="font-mono text-xs text-slate-400">
                {recentActivity.length} Recent Logs
              </span>
            </div>

            {recentActivity.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-4">No technical activity recorded yet.</p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {recentActivity.map((log: any) => (
                  <div
                    key={log.id}
                    className="p-3 rounded-xl bg-white/[0.02] border border-white/10 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-white/[0.04] transition-colors"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-[#FF5A16]/15 border border-[#FF5A16]/30 text-[#FF5A16] font-bold font-mono text-[10px]">
                        {log.action}
                      </span>
                      <span className="text-slate-300 font-mono text-[11px]">
                        Target: {log.resourceType} {log.resourceId ? `(${log.resourceId})` : ""}
                      </span>
                      <span className="text-slate-600 hidden sm:inline">&bull;</span>
                      <span className="text-slate-400 font-sans">by {log.actorEmail}</span>
                    </div>

                    <span className="text-[10px] font-mono text-slate-400 shrink-0">
                      {new Date(log.timestamp).toLocaleTimeString("en-IN", {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* 4. MATCH CONTROL DRAWER */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {selectedMatchId && (
        <MatchControlDrawer
          matchId={selectedMatchId}
          onClose={() => setSelectedMatchId(null)}
          onRefreshAll={() => fetchOperationsTelemetry(true)}
          availableCourts={courts}
          availableOfficials={officials}
        />
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* 5. COURT CONTROL ROOM MODAL (For Direct Court Management) */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {selectedCourtForControl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
          <div className="w-full max-w-lg bg-[#07101D] border border-white/20 rounded-2xl p-6 shadow-2xl space-y-5 text-white">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <span className="font-rajdhani text-xs font-bold text-[#FF5A16] uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#FF5A16]" />
                  COURT CONTROL ROOM // {selectedCourtForControl.courtNumber}
                </span>
                <h3 className="font-rajdhani text-xl font-black text-white uppercase tracking-wide mt-0.5">
                  Court Readiness & Allocation
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCourtForControl(null)}
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
              >
                ✕
              </button>
            </div>

            {courtActionMessage && (
              <div
                className={`p-3 rounded-xl border text-xs font-sans ${
                  courtActionMessage.type === "success"
                    ? "bg-[#00FF88]/15 border-[#00FF88]/30 text-[#00FF88]"
                    : "bg-red-500/15 border-red-500/30 text-red-300"
                }`}
              >
                {courtActionMessage.text}
              </div>
            )}

            {/* Status Selection */}
            <div className="space-y-2">
              <label className="block font-rajdhani text-xs font-bold text-slate-300 uppercase tracking-wider">
                Court Operational Status
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: "AVAILABLE", label: "AVAILABLE", color: "border-emerald-500/50 text-emerald-400 bg-emerald-500/10" },
                  { value: "READY", label: "READY FOR MATCH", color: "border-cyan-500/50 text-cyan-400 bg-cyan-500/10" },
                  { value: "MAINTENANCE", label: "MAINTENANCE", color: "border-amber-500/50 text-amber-400 bg-amber-500/10" },
                  { value: "BLOCKED", label: "BLOCKED / HOLD", color: "border-red-500/50 text-red-400 bg-red-500/10" },
                ].map((s) => (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => setCourtFormStatus(s.value)}
                    className={`p-2.5 rounded-xl border text-xs font-rajdhani font-bold uppercase transition-all text-left flex items-center justify-between cursor-pointer ${
                      courtFormStatus === s.value
                        ? `${s.color} ring-2 ring-[#FF5A16]`
                        : "border-white/10 bg-[#0B132B]/60 text-slate-400 hover:border-white/20"
                    }`}
                  >
                    <span>{s.label}</span>
                    {courtFormStatus === s.value && <Check className="w-3.5 h-3.5 text-[#FF5A16]" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Official / Umpire Assignment */}
            <div className="space-y-2">
              <label className="block font-rajdhani text-xs font-bold text-slate-300 uppercase tracking-wider">
                Assigned Umpire / Technical Official
              </label>
              <select
                value={courtFormUmpire}
                onChange={(e) => setCourtFormUmpire(e.target.value)}
                className="w-full text-xs border border-white/20 rounded-xl p-3 bg-[#040711] text-white focus:outline-none focus:border-[#FF5A16]"
              >
                <option value="">Unassigned (No Official)</option>
                {officials.map((o: any) => (
                  <option key={o.id} value={o.name}>
                    {o.name} &bull; {o.badge || "Official"} {o.isAvailable ? "(Available)" : "(Assigned)"}
                  </option>
                ))}
              </select>
            </div>

            {/* Quick Match Allocation from Queue */}
            <div className="space-y-2 border-t border-white/10 pt-4">
              <label className="block font-rajdhani text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                <span>Assign Upcoming Match from Queue</span>
                <span className="text-[10px] text-cyan-400 font-mono">
                  {queue.filter((m: any) => !m.court || m.court === "Unassigned").length} waiting
                </span>
              </label>

              {queue.filter((m: any) => !m.court || m.court === "Unassigned").length === 0 ? (
                <div className="p-3 bg-[#040711] rounded-xl border border-white/10 text-xs text-slate-400 text-center">
                  No unassigned matches currently in queue.
                </div>
              ) : (
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {queue
                    .filter((m: any) => !m.court || m.court === "Unassigned")
                    .slice(0, 4)
                    .map((m: any) => (
                      <div
                        key={m.id}
                        className="p-2.5 rounded-xl bg-[#040711] border border-white/10 flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="font-rajdhani font-bold text-[#FF5A16] truncate">
                            #{m.publicMatchNumber || m.matchNumber} &bull; {m.time}
                          </div>
                          <div className="text-slate-300 truncate text-[11px]">
                            {m.playerA} vs {m.playerB}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleAssignMatchToCourt(m.id)}
                          disabled={courtUpdating}
                          className="px-3 py-1 bg-[#FF5A16] hover:bg-[#FF7A1A] text-white font-rajdhani font-bold text-xs uppercase rounded-lg cursor-pointer shrink-0"
                        >
                          Assign
                        </button>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="border-t border-white/10 pt-4 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setSelectedCourtForControl(null)}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 font-rajdhani font-bold text-xs uppercase tracking-wider cursor-pointer"
              >
                Close
              </button>

              <button
                type="button"
                onClick={handleSaveCourtDetails}
                disabled={courtUpdating}
                className="px-5 py-2 rounded-xl bg-[#FF5A16] hover:bg-[#FF7A1A] text-white font-rajdhani font-black text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(255,90,22,0.35)] cursor-pointer disabled:opacity-50"
              >
                {courtUpdating ? "Saving..." : "Save Court Settings"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
