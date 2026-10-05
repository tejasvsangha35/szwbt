"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Layers,
  CheckSquare,
  Calendar,
  AlertTriangle,
  Megaphone,
  User,
  Clock,
  MapPin,
  LifeBuoy,
  PlusCircle,
  Play,
  CheckCircle2,
  XCircle,
  ChevronRight,
  RefreshCw,
  Send,
  Radio,
  FileText,
  Phone,
  ShieldAlert,
  ArrowRight,
  Check,
  Building2,
  Briefcase,
  AlertCircle,
} from "lucide-react";
import {
  VolunteerPortalShell,
  VolunteerThemeProvider,
  useVolunteerTheme,
} from "@/components/volunteer/VolunteerPortalShell";
import { useAuth } from "@/lib/rbac/useAuth";

function VolunteerDashboardContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") || "overview";
  const [currentTab, setCurrentTab] = useState<string>(initialTab);

  const { user } = useAuth();
  const { isDark } = useVolunteerTheme();

  // Sync tab with URL
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam) setCurrentTab(tabParam);
  }, [searchParams]);

  // Main state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [overviewData, setOverviewData] = useState<any>(null);

  // Modals & Drawers
  const [reportIssueModalOpen, setReportIssueModalOpen] = useState(false);
  const [helpModalOpen, setHelpModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any | null>(null);

  // Issue Form state
  const [issueCategory, setIssueCategory] = useState("VENUE");
  const [issuePriority, setIssuePriority] = useState("NORMAL");
  const [issueLocation, setIssueLocation] = useState("");
  const [issueDesc, setIssueDesc] = useState("");
  const [submittingIssue, setSubmittingIssue] = useState(false);

  // Help Request Form state
  const [helpDestination, setHelpDestination] = useState("Operations");
  const [helpMessage, setHelpMessage] = useState("");
  const [helpLocation, setHelpLocation] = useState("");
  const [submittingHelp, setSubmittingHelp] = useState(false);

  // Shift action state
  const [mutatingShift, setMutatingShift] = useState(false);

  // Task Filter state
  const [taskFilterStatus, setTaskFilterStatus] = useState("ALL");

  // Fetch volunteer overview
  const loadVolunteerData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/volunteer");
      if (res.status === 401 || res.status === 403) {
        setError(
          res.status === 403
            ? "403 Forbidden: Only authorized Tournament Volunteers or Super Administrators can access the volunteer portal."
            : "Authentication required. Please sign in."
        );
        setLoading(false);
        return;
      }
      const data = await res.json();
      if (data.success) {
        setOverviewData(data);
      } else {
        setError(data.error || "Failed to load volunteer telemetry.");
      }
    } catch (err: any) {
      setError("Network or volunteer server interruption: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVolunteerData();
  }, []);

  // Handle Shift action
  const handleShiftAction = async (action: "START_SHIFT" | "END_SHIFT" | "BREAK" | "RESUME") => {
    try {
      setMutatingShift(true);
      const res = await fetch("/api/volunteer/shift", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (data.success) {
        loadVolunteerData();
      } else {
        alert("Shift error: " + data.error);
      }
    } catch (err: any) {
      alert("Shift action failed: " + err.message);
    } finally {
      setMutatingShift(false);
    }
  };

  // Handle Task status update
  const handleUpdateTask = async (taskId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/volunteer/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        if (selectedTask && selectedTask.id === taskId) {
          setSelectedTask(data.task);
        }
        loadVolunteerData();
      } else {
        alert("Task update failed: " + data.error);
      }
    } catch (err: any) {
      alert("Task update failed: " + err.message);
    }
  };

  // Handle Issue report submit
  const handleReportIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!issueLocation || !issueDesc) return;
    try {
      setSubmittingIssue(true);
      const res = await fetch("/api/volunteer/issues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: issueCategory,
          priority: issuePriority,
          location: issueLocation,
          description: issueDesc,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setReportIssueModalOpen(false);
        setIssueLocation("");
        setIssueDesc("");
        loadVolunteerData();
      } else {
        alert("Issue reporting error: " + data.error);
      }
    } catch (err: any) {
      alert("Submission error: " + err.message);
    } finally {
      setSubmittingIssue(false);
    }
  };

  // Handle Help Request submit
  const handleRequestHelp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!helpMessage) return;
    try {
      setSubmittingHelp(true);
      const res = await fetch("/api/volunteer/help", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destination: helpDestination,
          message: helpMessage,
          location: helpLocation || overviewData?.volunteer?.assignedArea || "Field Venue",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setHelpModalOpen(false);
        setHelpMessage("");
        setHelpLocation("");
        loadVolunteerData();
        alert(data.message);
      } else {
        alert("Help request failed: " + data.error);
      }
    } catch (err: any) {
      alert("Dispatch failed: " + err.message);
    } finally {
      setSubmittingHelp(false);
    }
  };

  // Loading State
  if (loading && !overviewData) {
    return (
      <VolunteerPortalShell
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        shiftStatus="NOT_STARTED"
        activeTasksCount={0}
        openIssuesCount={0}
      >
        <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
          <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent animate-spin rounded-full" />
          <p className="font-pixel text-xs text-orange-500 tracking-wider animate-pulse">
            LOADING FIELD VOLUNTEER WORKSPACE...
          </p>
        </div>
      </VolunteerPortalShell>
    );
  }

  // Error State
  if (error && !overviewData) {
    return (
      <VolunteerPortalShell
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        shiftStatus="NOT_STARTED"
        activeTasksCount={0}
        openIssuesCount={0}
      >
        <div
          className={`max-w-xl mx-auto p-6 rounded-2xl border text-center space-y-4 shadow-xl ${
            isDark ? "bg-[#0b1322] border-red-500/40" : "bg-white border-red-200"
          }`}
        >
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto animate-pulse" />
          <h2 className="font-pixel text-base text-red-500 font-bold">OPS SIGNAL LOST</h2>
          <p className="text-xs text-slate-400 font-sans leading-relaxed">{error}</p>
          <button
            onClick={loadVolunteerData}
            className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-pixel text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            RETRY CONNECTION
          </button>
        </div>
      </VolunteerPortalShell>
    );
  }

  const {
    volunteer = {},
    currentShift = {},
    currentAssignment = null,
    nextAssignment = null,
    kpis = {},
    tasks = [],
    openIssues = [],
    announcements = [],
  } = overviewData || {};

  const shiftStatus = currentShift.status || "NOT_STARTED";
  const isOnShift = shiftStatus === "ON_SHIFT";

  // Filter tasks
  const filteredTasks = tasks.filter((t: any) => {
    if (taskFilterStatus !== "ALL" && t.status !== taskFilterStatus) return false;
    return true;
  });

  return (
    <VolunteerPortalShell
      currentTab={currentTab}
      onSelectTab={setCurrentTab}
      shiftStatus={shiftStatus}
      activeTasksCount={kpis.activeTasksCount || 0}
      openIssuesCount={kpis.openIssuesCount || 0}
      assignedArea={volunteer.assignedArea}
      onRefresh={loadVolunteerData}
      onRequestHelp={() => setHelpModalOpen(true)}
    >
      <div className="space-y-6 max-w-6xl mx-auto">
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* TAB 1: OVERVIEW */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {currentTab === "overview" && (
          <>
            {/* ───────────────────────────────────────────────────────────── */}
            {/* 1. OPERATOR IDENTITY / WELCOME PANEL */}
            {/* ───────────────────────────────────────────────────────────── */}
            <div
              className={`p-4 sm:p-5 rounded-2xl border shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors ${
                isDark
                  ? "bg-[#0b1322] border-slate-800 text-slate-100"
                  : "bg-white border-slate-200 text-slate-900"
              }`}
            >
              <div>
                <div className="flex items-center gap-2 text-[10px] font-mono">
                  <span className={`font-bold tracking-wider ${isDark ? "text-cyan-400" : "text-cyan-700"}`}>
                    OPERATOR // {volunteer.volunteerCode || "VLT-2026-NS99"}
                  </span>
                  <span className={isDark ? "text-slate-500" : "text-slate-400"}>•</span>
                  <span className={isDark ? "text-slate-400" : "text-slate-600"}>
                    [{volunteer.badge || "MOBILE FIELD"}]
                  </span>
                </div>

                <h1
                  className={`text-base sm:text-lg font-bold tracking-tight mt-1 font-pixel ${
                    isDark ? "text-slate-100" : "text-slate-900"
                  }`}
                >
                  WELCOME, {volunteer.name || "Arena Field Volunteer"}
                </h1>

                <p
                  className={`text-xs mt-0.5 font-sans ${
                    isDark ? "text-slate-400" : "text-slate-500"
                  }`}
                >
                  Assigned Sector:{" "}
                  <strong className={isDark ? "text-slate-200" : "text-slate-800"}>
                    {volunteer.assignedArea || "KLE Tech Arena — Court Block A"}
                  </strong>
                </p>
              </div>

              {/* Status Indicator */}
              <div
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-mono font-bold ${
                  isOnShift
                    ? isDark
                      ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
                      : "bg-emerald-50 border-emerald-200 text-emerald-700"
                    : isDark
                    ? "bg-slate-800 border-slate-700 text-slate-400"
                    : "bg-slate-100 border-slate-200 text-slate-600"
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    isOnShift ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
                  }`}
                />
                <span className="font-pixel text-[10px] uppercase tracking-wider">
                  {shiftStatus.replace("_", " ")}
                </span>
              </div>
            </div>

            {/* ───────────────────────────────────────────────────────────── */}
            {/* 2. CURRENT SHIFT STATUS CARD */}
            {/* ───────────────────────────────────────────────────────────── */}
            <div
              className={`p-4 sm:p-5 rounded-2xl border shadow-xs space-y-4 transition-colors ${
                isDark
                  ? "bg-[#0b1322] border-slate-800 text-slate-100"
                  : "bg-white border-slate-200 text-slate-900"
              }`}
            >
              {/* Header */}
              <div
                className={`flex items-center justify-between border-b pb-3 ${
                  isDark ? "border-slate-800" : "border-slate-100"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-orange-500" />
                  <h3
                    className={`text-xs sm:text-sm font-semibold uppercase tracking-wider font-pixel ${
                      isDark ? "text-slate-100" : "text-slate-900"
                    }`}
                  >
                    MY CURRENT SHIFT STATUS
                  </h3>
                </div>
                <span
                  className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                    isOnShift
                      ? isDark
                        ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                        : "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : isDark
                      ? "bg-slate-800 text-slate-400 border-slate-700"
                      : "bg-slate-100 text-slate-600 border-slate-200"
                  }`}
                >
                  {shiftStatus}
                </span>
              </div>

              {/* Body */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div
                    className={`font-semibold text-xs sm:text-sm ${
                      isDark ? "text-slate-200" : "text-slate-800"
                    }`}
                  >
                    {isOnShift ? "ACTIVE ON-SITE DEPLOYMENT" : "OFF-DUTY STANDBY"}
                  </div>
                  <p
                    className={`text-xs mt-1 font-sans ${
                      isDark ? "text-slate-400" : "text-slate-500"
                    }`}
                  >
                    {isOnShift
                      ? `Shift active since: ${
                          currentShift.startedAt
                            ? new Date(currentShift.startedAt).toLocaleTimeString("en-IN", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "10:34 pm"
                        }`
                      : "Click 'START SHIFT' to begin logging on-ground event operations."}
                  </p>
                </div>

                {/* Buttons */}
                <div className="flex flex-wrap items-center gap-2">
                  {!isOnShift && shiftStatus !== "COMPLETED" && (
                    <button
                      type="button"
                      disabled={mutatingShift}
                      onClick={() => handleShiftAction("START_SHIFT")}
                      className="px-3.5 py-2 bg-orange-600 hover:bg-orange-700 text-white font-pixel text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>START SHIFT</span>
                    </button>
                  )}

                  {isOnShift && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleShiftAction("BREAK")}
                        disabled={mutatingShift}
                        className={`px-3.5 py-2 rounded-xl border font-pixel text-xs font-bold transition-colors cursor-pointer disabled:opacity-50 ${
                          isDark
                            ? "bg-[#111d33] border-slate-700 hover:border-amber-400 text-amber-400 hover:bg-[#162540]"
                            : "bg-amber-50 border-amber-200 hover:bg-amber-100 text-amber-800"
                        }`}
                      >
                        TAKE BREAK
                      </button>

                      <button
                        type="button"
                        onClick={() => handleShiftAction("END_SHIFT")}
                        disabled={mutatingShift}
                        className="px-3.5 py-2 bg-red-500/15 hover:bg-red-500/25 border border-red-500/40 text-red-500 hover:text-red-400 font-pixel text-xs font-bold rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                      >
                        END SHIFT
                      </button>
                    </>
                  )}

                  {shiftStatus === "BREAK" && (
                    <button
                      type="button"
                      disabled={mutatingShift}
                      onClick={() => handleShiftAction("RESUME")}
                      className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-pixel text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>RESUME SHIFT</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* ───────────────────────────────────────────────────────────── */}
            {/* 3. CURRENT ASSIGNMENT CARD */}
            {/* ───────────────────────────────────────────────────────────── */}
            <div
              className={`p-4 sm:p-5 rounded-2xl border shadow-xs space-y-4 transition-colors ${
                isDark
                  ? "bg-[#0b1322] border-slate-800 text-slate-100"
                  : "bg-white border-slate-200 text-slate-900"
              }`}
            >
              {/* Header */}
              <div
                className={`flex items-center justify-between border-b pb-3 ${
                  isDark ? "border-slate-800" : "border-slate-100"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-orange-500" />
                  <h3
                    className={`text-xs sm:text-sm font-semibold uppercase tracking-wider font-pixel ${
                      isDark ? "text-slate-100" : "text-slate-900"
                    }`}
                  >
                    CURRENT ASSIGNMENT
                  </h3>
                </div>
                <span
                  className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                    currentAssignment?.status === "ACTIVE"
                      ? isDark
                        ? "bg-orange-500/15 text-orange-400 border-orange-500/30"
                        : "bg-orange-50 text-orange-700 border-orange-200"
                      : isDark
                      ? "bg-cyan-500/15 text-cyan-400 border-cyan-500/30"
                      : "bg-cyan-50 text-cyan-700 border-cyan-200"
                  }`}
                >
                  {currentAssignment?.status || "ACTIVE"}
                </span>
              </div>

              {/* Main Assignment Row */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div>
                  <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-cyan-500/10 text-cyan-500 border border-cyan-500/20">
                    {currentAssignment?.venue || "KLE TECH ARENA"}
                  </span>
                  <h2
                    className={`text-base sm:text-lg font-bold font-pixel mt-1 ${
                      isDark ? "text-slate-100" : "text-slate-900"
                    }`}
                  >
                    {currentAssignment?.title || "Court Operations"}
                  </h2>
                  <p className="text-xs font-sans mt-0.5 text-orange-500 font-medium">
                    Area:{" "}
                    <span className={isDark ? "text-slate-200" : "text-slate-700"}>
                      {currentAssignment?.area || "Court Block A"}
                    </span>
                  </p>
                </div>

                {/* Shift Time Badge Box */}
                <div
                  className={`p-3 rounded-xl border text-right sm:min-w-[150px] transition-colors ${
                    isDark
                      ? "bg-[#111d33] border-slate-800"
                      : "bg-slate-50 border-slate-200"
                  }`}
                >
                  <span
                    className={`text-[10px] font-pixel block uppercase tracking-wider ${
                      isDark ? "text-slate-400" : "text-slate-500"
                    }`}
                  >
                    SHIFT TIME
                  </span>
                  <div className={`flex items-center justify-end gap-1.5 mt-0.5 font-mono text-xs sm:text-sm font-bold ${isDark ? "text-amber-400" : "text-amber-700"}`}>
                    <Clock className="w-3.5 h-3.5 shrink-0" />
                    <span>
                      {currentAssignment?.shiftStart || "09:00"} —{" "}
                      {currentAssignment?.shiftEnd || "13:00"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Information Row: Reporting Point & Supervisor */}
              <div
                className={`grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl border text-xs font-sans transition-colors ${
                  isDark
                    ? "bg-[#111d33] border-slate-800"
                    : "bg-slate-50 border-slate-200"
                }`}
              >
                <div>
                  <span
                    className={`font-mono text-[10px] block uppercase tracking-wider ${
                      isDark ? "text-slate-500" : "text-slate-400"
                    }`}
                  >
                    REPORTING POINT:
                  </span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                    <p
                      className={`font-semibold ${
                        isDark ? "text-slate-200" : "text-slate-800"
                      }`}
                    >
                      {currentAssignment?.reportingPoint || "Arena Control Desk Room 102"}
                    </p>
                  </div>
                </div>

                <div>
                  <span
                    className={`font-mono text-[10px] block uppercase tracking-wider ${
                      isDark ? "text-slate-500" : "text-slate-500"
                    }`}
                  >
                    SUPERVISOR:
                  </span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <User className={`w-3.5 h-3.5 shrink-0 ${isDark ? "text-cyan-400" : "text-cyan-600"}`} />
                    <p className={`font-semibold truncate ${isDark ? "text-cyan-400" : "text-cyan-700"}`}>
                      {currentAssignment?.supervisor || "Dr. Rajesh K (Venue Director)"}
                      <span
                        className={`font-mono text-[11px] ml-1 font-normal ${
                          isDark ? "text-slate-400" : "text-slate-500"
                        }`}
                      >
                        {currentAssignment?.supervisorPhone || "(+91 94481 00234)"}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Instructions Row */}
              <div
                className={`p-3.5 rounded-xl border-l-3 border-orange-500 border text-xs font-sans transition-colors ${
                  isDark
                    ? "bg-[#111d33] border-slate-800 text-slate-300"
                    : "bg-slate-50 border-slate-200 text-slate-700"
                }`}
              >
                <strong className={`font-pixel text-[10px] block mb-1 uppercase tracking-wider ${isDark ? "text-orange-400" : "text-orange-700"}`}>
                  OPERATIONAL INSTRUCTIONS:
                </strong>
                <p className="leading-relaxed">
                  {currentAssignment?.instructions ||
                    "Report to Court Block A controller. Verify player racquets and court shuttlecocks. Maintain court boundary order during live sets."}
                </p>
              </div>
            </div>

            {/* ───────────────────────────────────────────────────────────── */}
            {/* 4. METRIC CARDS (4 TILES) */}
            {/* ───────────────────────────────────────────────────────────── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {/* Active Tasks */}
              <div
                className={`p-4 rounded-xl border shadow-2xs flex flex-col justify-between transition-colors ${
                  isDark
                    ? "bg-[#0b1322] border-slate-800"
                    : "bg-white border-slate-200"
                }`}
              >
                <span
                  className={`font-pixel text-[10px] uppercase tracking-wider ${
                    isDark ? "text-slate-400" : "text-slate-500"
                  }`}
                >
                  ACTIVE TASKS
                </span>
                <p className={`font-pixel text-2xl font-bold my-1.5 ${isDark ? "text-cyan-400" : "text-cyan-600"}`}>
                  {kpis.activeTasksCount || 4}
                </p>
                <span
                  className={`text-[11px] font-mono ${
                    isDark ? "text-slate-500" : "text-slate-400"
                  }`}
                >
                  Assigned queue
                </span>
              </div>

              {/* Completed Tasks */}
              <div
                className={`p-4 rounded-xl border shadow-2xs flex flex-col justify-between transition-colors ${
                  isDark
                    ? "bg-[#0b1322] border-slate-800"
                    : "bg-white border-slate-200"
                }`}
              >
                <span
                  className={`font-pixel text-[10px] uppercase tracking-wider ${
                    isDark ? "text-slate-400" : "text-slate-500"
                  }`}
                >
                  COMPLETED
                </span>
                <p className={`font-pixel text-2xl font-bold my-1.5 ${isDark ? "text-emerald-400" : "text-emerald-600"}`}>
                  {kpis.completedTasksCount || 29}
                </p>
                <span
                  className={`text-[11px] font-mono ${
                    isDark ? "text-slate-500" : "text-slate-400"
                  }`}
                >
                  Tasks finished
                </span>
              </div>

              {/* Open Issues */}
              <div
                className={`p-4 rounded-xl border shadow-2xs flex flex-col justify-between transition-colors ${
                  isDark
                    ? "bg-[#0b1322] border-slate-800"
                    : "bg-white border-slate-200"
                }`}
              >
                <span
                  className={`font-pixel text-[10px] uppercase tracking-wider ${
                    isDark ? "text-slate-400" : "text-slate-500"
                  }`}
                >
                  OPEN ISSUES
                </span>
                <p className={`font-pixel text-2xl font-bold my-1.5 ${isDark ? "text-amber-400" : "text-amber-600"}`}>
                  {kpis.openIssuesCount || 32}
                </p>
                <span
                  className={`text-[11px] font-mono ${
                    isDark ? "text-slate-500" : "text-slate-400"
                  }`}
                >
                  Reported by you
                </span>
              </div>

              {/* Next Shift */}
              <div
                className={`p-4 rounded-xl border shadow-2xs flex flex-col justify-between transition-colors ${
                  isDark
                    ? "bg-[#0b1322] border-slate-800"
                    : "bg-white border-slate-200"
                }`}
              >
                <span
                  className={`font-pixel text-[10px] uppercase tracking-wider ${
                    isDark ? "text-slate-400" : "text-slate-500"
                  }`}
                >
                  NEXT SHIFT
                </span>
                <p
                  className={`font-pixel text-xs sm:text-sm font-bold my-1.5 truncate ${
                    isDark ? "text-slate-200" : "text-slate-800"
                  }`}
                  title={kpis.nextAssignmentTitle || "Transport Coordination Support"}
                >
                  {kpis.nextAssignmentTitle || "Transport Coordination Support"}
                </p>
                <span
                  className={`text-[11px] font-mono ${
                    isDark ? "text-slate-500" : "text-slate-400"
                  }`}
                >
                  Upcoming roster
                </span>
              </div>
            </div>

            {/* ───────────────────────────────────────────────────────────── */}
            {/* 5. TODAY'S TASKS CARD */}
            {/* ───────────────────────────────────────────────────────────── */}
            <div
              className={`p-4 sm:p-5 rounded-2xl border shadow-xs space-y-4 transition-colors ${
                isDark
                  ? "bg-[#0b1322] border-slate-800 text-slate-100"
                  : "bg-white border-slate-200 text-slate-900"
              }`}
            >
              {/* Header */}
              <div
                className={`flex items-center justify-between border-b pb-3 ${
                  isDark ? "border-slate-800" : "border-slate-100"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-orange-500" />
                  <h3
                    className={`text-xs sm:text-sm font-semibold uppercase tracking-wider font-pixel ${
                      isDark ? "text-slate-100" : "text-slate-900"
                    }`}
                  >
                    TODAY'S TASKS ({tasks.length || 33})
                  </h3>
                </div>
                <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border uppercase ${
                  isDark
                    ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
                    : "bg-amber-50 text-amber-700 border-amber-200"
                }`}>
                  PRIORITY QUEUE
                </span>
              </div>

              {/* Task Rows List */}
              {tasks.length === 0 ? (
                <div
                  className={`p-8 text-center rounded-xl border ${
                    isDark
                      ? "bg-[#111d33] border-slate-800 text-slate-400"
                      : "bg-slate-50 border-slate-200 text-slate-600"
                  }`}
                >
                  <CheckCircle2 className="w-8 h-8 text-cyan-500 mx-auto mb-2 opacity-80" />
                  <p className="font-pixel text-xs text-cyan-500 font-bold">TASK QUEUE CLEAR</p>
                  <p className="text-xs text-slate-400 mt-1">No tasks are currently assigned to you.</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {tasks.slice(0, 4).map((task: any) => (
                    <div
                      key={task.id}
                      onClick={() => setSelectedTask(task)}
                      className={`p-3.5 sm:p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer transition-all ${
                        isDark
                          ? "bg-[#111d33] border-slate-800/80 hover:border-slate-700 hover:bg-[#15233c]"
                          : "bg-slate-50 border-slate-200 hover:border-slate-300 hover:bg-slate-100/70"
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          {/* Priority Badge */}
                          <span
                            className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase border ${
                              task.priority === "URGENT"
                                ? isDark
                                  ? "bg-red-500/15 text-red-400 border-red-500/30"
                                  : "bg-red-50 text-red-700 border-red-200"
                                : task.priority === "HIGH"
                                ? isDark
                                  ? "bg-orange-500/15 text-orange-400 border-orange-500/30"
                                  : "bg-orange-50 text-orange-700 border-orange-200"
                                : isDark
                                ? "bg-slate-800 text-slate-400 border-slate-700"
                                : "bg-slate-100 text-slate-600 border-slate-200"
                            }`}
                          >
                            {task.priority}
                          </span>

                          {/* Category Badge */}
                          <span
                            className={`font-pixel text-[10px] uppercase font-bold ${
                              isDark ? "text-slate-400" : "text-slate-500"
                            }`}
                          >
                            {task.category}
                          </span>
                        </div>

                        {/* Task Title */}
                        <h4
                          className={`font-semibold text-xs sm:text-sm mt-1 truncate ${
                            isDark ? "text-slate-100" : "text-slate-900"
                          }`}
                        >
                          {task.title}
                        </h4>

                        {/* Task Metadata */}
                        <div
                          className={`flex items-center gap-3 text-[11px] font-mono mt-1 ${
                            isDark ? "text-slate-400" : "text-slate-500"
                          }`}
                        >
                          <span>Loc: {task.location}</span>
                          <span>•</span>
                          <span className="text-amber-500 font-medium">Due: {task.dueTime}</span>
                        </div>
                      </div>

                      {/* Status & Action Button */}
                      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                        {/* Status badge */}
                        <span
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase border ${
                            task.status === "COMPLETED"
                              ? isDark
                                ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                                : "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : task.status === "IN_PROGRESS"
                              ? isDark
                                ? "bg-orange-500/15 text-orange-400 border-orange-500/30"
                                : "bg-orange-50 text-orange-700 border-orange-200"
                              : isDark
                              ? "bg-slate-800 text-slate-400 border-slate-700"
                              : "bg-slate-200 text-slate-700 border-slate-300"
                          }`}
                        >
                          {task.status === "COMPLETED"
                            ? "■ COMPLETED"
                            : task.status === "ASSIGNED"
                            ? "■ ASSIGNED"
                            : task.status}
                        </span>

                        {/* Action buttons */}
                        {task.status === "ASSIGNED" && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUpdateTask(task.id, "IN_PROGRESS");
                            }}
                            className="px-3 py-1 bg-orange-600 hover:bg-orange-700 text-white font-pixel text-[10px] font-bold rounded-lg transition-colors cursor-pointer shadow-xs"
                          >
                            START
                          </button>
                        )}

                        {task.status === "IN_PROGRESS" && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUpdateTask(task.id, "COMPLETED");
                            }}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-pixel text-[10px] font-bold rounded-lg transition-colors cursor-pointer shadow-xs"
                          >
                            COMPLETE
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Task Footer */}
              <div
                className={`pt-3 border-t flex justify-between items-center text-xs ${
                  isDark ? "border-slate-800" : "border-slate-100"
                }`}
              >
                <span
                  className={`text-[11px] font-mono ${
                    isDark ? "text-slate-500" : "text-slate-400"
                  }`}
                >
                  Showing {Math.min(tasks.length, 4)} of {tasks.length || 33} tasks
                </span>

                <button
                  type="button"
                  onClick={() => setCurrentTab("tasks")}
                  className="font-pixel text-[11px] text-cyan-500 hover:text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer font-bold transition-colors"
                >
                  <span>VIEW ALL TASKS</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* ───────────────────────────────────────────────────────────── */}
            {/* 6. QUICK ACTIONS ROW (4 CARDS) */}
            {/* ───────────────────────────────────────────────────────────── */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              {/* Report Issue */}
              <button
                type="button"
                onClick={() => setReportIssueModalOpen(true)}
                className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs group ${
                  isDark
                    ? "bg-[#0b1322] border-slate-800 hover:border-amber-500/50 hover:bg-[#111d33]"
                    : "bg-white border-slate-200 hover:border-amber-400 hover:bg-amber-50/30"
                }`}
              >
                <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-500 group-hover:scale-105 transition-transform">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <span className="font-pixel text-[11px] font-bold tracking-wider text-amber-500">
                  REPORT ISSUE
                </span>
              </button>

              {/* Request Help */}
              <button
                type="button"
                onClick={() => setHelpModalOpen(true)}
                className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs group ${
                  isDark
                    ? "bg-[#0b1322] border-slate-800 hover:border-red-500/50 hover:bg-[#111d33]"
                    : "bg-white border-slate-200 hover:border-red-400 hover:bg-red-50/30"
                }`}
              >
                <div className="p-2.5 rounded-lg bg-red-500/10 text-red-500 group-hover:scale-105 transition-transform">
                  <LifeBuoy className="w-5 h-5" />
                </div>
                <span className="font-pixel text-[11px] font-bold tracking-wider text-red-500">
                  REQUEST HELP
                </span>
              </button>

              {/* My Shifts */}
              <button
                type="button"
                onClick={() => setCurrentTab("assignments")}
                className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs group ${
                  isDark
                    ? "bg-[#0b1322] border-slate-800 hover:border-cyan-500/50 hover:bg-[#111d33]"
                    : "bg-white border-slate-200 hover:border-cyan-400 hover:bg-cyan-50/30"
                }`}
              >
                <div className="p-2.5 rounded-lg bg-cyan-500/10 text-cyan-500 group-hover:scale-105 transition-transform">
                  <Calendar className="w-5 h-5" />
                </div>
                <span className="font-pixel text-[11px] font-bold tracking-wider text-cyan-500">
                  MY SHIFTS
                </span>
              </button>

              {/* Bulletins */}
              <button
                type="button"
                onClick={() => setCurrentTab("notifications")}
                className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs group ${
                  isDark
                    ? "bg-[#0b1322] border-slate-800 hover:border-orange-500/50 hover:bg-[#111d33]"
                    : "bg-white border-slate-200 hover:border-orange-400 hover:bg-orange-50/30"
                }`}
              >
                <div className="p-2.5 rounded-lg bg-orange-500/10 text-orange-500 group-hover:scale-105 transition-transform">
                  <Megaphone className="w-5 h-5" />
                </div>
                <span className="font-pixel text-[11px] font-bold tracking-wider text-orange-500">
                  BULLETINS
                </span>
              </button>
            </div>
          </>
        )}

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* TAB 2: TASKS */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {currentTab === "tasks" && (
          <div className="space-y-6">
            <div
              className={`p-4 sm:p-5 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-colors ${
                isDark
                  ? "bg-[#0b1322] border-slate-800 text-slate-100"
                  : "bg-white border-slate-200 text-slate-900"
              }`}
            >
              <div>
                <h2 className="font-pixel text-base font-bold">VOLUNTEER TASK QUEUE</h2>
                <p
                  className={`text-xs font-sans mt-0.5 ${
                    isDark ? "text-slate-400" : "text-slate-500"
                  }`}
                >
                  Complete operational responsibilities assigned to you by field supervisors.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={taskFilterStatus}
                  onChange={(e) => setTaskFilterStatus(e.target.value)}
                  className={`border text-xs rounded-xl px-3 py-1.5 focus:outline-none transition-colors ${
                    isDark
                      ? "bg-[#111d33] border-slate-700 text-slate-200"
                      : "bg-slate-50 border-slate-300 text-slate-800"
                  }`}
                >
                  <option value="ALL">ALL TASKS</option>
                  <option value="ASSIGNED">ASSIGNED</option>
                  <option value="IN_PROGRESS">IN PROGRESS</option>
                  <option value="COMPLETED">COMPLETED</option>
                </select>
              </div>
            </div>

            {filteredTasks.length === 0 ? (
              <div
                className={`p-12 text-center rounded-2xl border ${
                  isDark
                    ? "bg-[#0b1322] border-slate-800 text-slate-400"
                    : "bg-white border-slate-200 text-slate-600"
                }`}
              >
                <CheckCircle2 className="w-12 h-12 text-cyan-500 mx-auto mb-2 opacity-80" />
                <p className="font-pixel text-xs text-cyan-500 font-bold">TASK QUEUE CLEAR</p>
                <p className="text-xs text-slate-400 mt-1">No tasks matching your selection.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredTasks.map((task: any) => (
                  <div
                    key={task.id}
                    className={`p-4 rounded-xl border space-y-3 transition-colors ${
                      isDark
                        ? "bg-[#0b1322] border-slate-800 hover:border-slate-700"
                        : "bg-white border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase border ${
                              task.priority === "URGENT"
                                ? isDark
                                  ? "bg-red-500/15 text-red-400 border-red-500/30"
                                  : "bg-red-50 text-red-700 border-red-200"
                                : task.priority === "HIGH"
                                ? isDark
                                  ? "bg-orange-500/15 text-orange-400 border-orange-500/30"
                                  : "bg-orange-50 text-orange-700 border-orange-200"
                                : isDark
                                ? "bg-slate-800 text-slate-400 border-slate-700"
                                : "bg-slate-100 text-slate-600 border-slate-200"
                            }`}
                          >
                            {task.priority}
                          </span>
                          <span className="font-pixel text-[10px] text-cyan-500 uppercase font-bold">
                            {task.category}
                          </span>
                        </div>
                        <h4
                          className={`font-semibold text-sm mt-1 ${
                            isDark ? "text-slate-100" : "text-slate-900"
                          }`}
                        >
                          {task.title}
                        </h4>
                      </div>

                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border ${
                          task.status === "COMPLETED"
                            ? isDark
                              ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                              : "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : task.status === "IN_PROGRESS"
                            ? isDark
                              ? "bg-orange-500/15 text-orange-400 border-orange-500/30"
                              : "bg-orange-50 text-orange-700 border-orange-200"
                            : isDark
                            ? "bg-slate-800 text-slate-400 border-slate-700"
                            : "bg-slate-200 text-slate-700 border-slate-300"
                        }`}
                      >
                        {task.status}
                      </span>
                    </div>

                    <p
                      className={`text-xs font-sans ${
                        isDark ? "text-slate-300" : "text-slate-600"
                      }`}
                    >
                      {task.description}
                    </p>

                    {task.instructions && (
                      <div
                        className={`p-2.5 rounded-lg border text-[11px] ${
                          isDark
                            ? "bg-[#111d33] border-slate-800 text-slate-300"
                            : "bg-slate-50 border-slate-200 text-slate-700"
                        }`}
                      >
                        <strong className="text-cyan-500 font-medium">Instructions:</strong>{" "}
                        {task.instructions}
                      </div>
                    )}

                    <div
                      className={`pt-2 border-t flex items-center justify-between text-xs font-mono ${
                        isDark
                          ? "border-slate-800 text-slate-400"
                          : "border-slate-100 text-slate-500"
                      }`}
                    >
                      <span>Location: {task.location}</span>
                      <span className="text-amber-500 font-medium">Due: {task.dueTime}</span>
                    </div>

                    <div
                      className={`pt-2 border-t flex items-center justify-between ${
                        isDark ? "border-slate-800" : "border-slate-100"
                      }`}
                    >
                      <span
                        className={`text-[11px] font-mono ${
                          isDark ? "text-slate-500" : "text-slate-400"
                        }`}
                      >
                        Supervisor: {task.supervisor || "Venue Desk"}
                      </span>

                      <div className="flex gap-2">
                        {task.status === "ASSIGNED" && (
                          <button
                            type="button"
                            onClick={() => handleUpdateTask(task.id, "IN_PROGRESS")}
                            className="px-3 py-1 bg-orange-600 hover:bg-orange-700 text-white font-pixel text-[10px] font-bold rounded-lg transition-colors cursor-pointer"
                          >
                            START TASK
                          </button>
                        )}
                        {task.status === "IN_PROGRESS" && (
                          <button
                            type="button"
                            onClick={() => handleUpdateTask(task.id, "COMPLETED")}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-pixel text-[10px] font-bold rounded-lg transition-colors cursor-pointer"
                          >
                            MARK COMPLETED
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setSelectedTask(task)}
                          className={`px-3 py-1 border text-cyan-500 font-pixel text-[10px] font-bold rounded-lg transition-colors cursor-pointer ${
                            isDark
                              ? "bg-[#111d33] border-slate-700 hover:bg-[#15233c]"
                              : "bg-slate-100 border-slate-200 hover:bg-slate-200"
                          }`}
                        >
                          SPEC
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* TAB 3: ASSIGNMENTS */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {currentTab === "assignments" && (
          <div className="space-y-6">
            <div
              className={`p-4 sm:p-5 rounded-2xl border transition-colors ${
                isDark
                  ? "bg-[#0b1322] border-slate-800 text-slate-100"
                  : "bg-white border-slate-200 text-slate-900"
              }`}
            >
              <h2 className="font-pixel text-base font-bold">DEPLOYMENT ROSTER</h2>
              <p
                className={`text-xs font-sans mt-0.5 ${
                  isDark ? "text-slate-400" : "text-slate-500"
                }`}
              >
                Your assigned field stations and reporting supervisors.
              </p>
            </div>

            {currentAssignment ? (
              <div
                className={`p-4 sm:p-5 rounded-2xl border space-y-4 transition-colors ${
                  isDark
                    ? "bg-[#0b1322] border-slate-800 text-slate-100"
                    : "bg-white border-slate-200 text-slate-900"
                }`}
              >
                <div
                  className={`flex justify-between items-center border-b pb-3 ${
                    isDark ? "border-slate-800" : "border-slate-100"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-orange-500" />
                    <h3 className="font-pixel text-sm font-bold uppercase tracking-wider">
                      ACTIVE DEPLOYMENT
                    </h3>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-orange-500/15 text-orange-500 border border-orange-500/30 uppercase">
                    CURRENT
                  </span>
                </div>

                <div className="space-y-3 text-xs font-sans">
                  <div>
                    <h3
                      className={`font-pixel text-base font-bold ${
                        isDark ? "text-slate-100" : "text-slate-900"
                      }`}
                    >
                      {currentAssignment.title}
                    </h3>
                    <p className="text-orange-500 font-mono mt-0.5">
                      {currentAssignment.venue} — {currentAssignment.area}
                    </p>
                  </div>

                  <div
                    className={`grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl border font-mono text-[11px] ${
                      isDark
                        ? "bg-[#111d33] border-slate-800"
                        : "bg-slate-50 border-slate-200"
                    }`}
                  >
                    <div>
                      <span className={isDark ? "text-slate-500" : "text-slate-400"}>
                        SHIFT:
                      </span>
                      <p className={`font-bold ${isDark ? "text-slate-200" : "text-slate-800"}`}>
                        {currentAssignment.shiftStart} — {currentAssignment.shiftEnd}
                      </p>
                    </div>
                    <div>
                      <span className={isDark ? "text-slate-500" : "text-slate-400"}>
                        REPORTING POINT:
                      </span>
                      <p className={`font-bold ${isDark ? "text-slate-200" : "text-slate-800"}`}>
                        {currentAssignment.reportingPoint}
                      </p>
                    </div>
                    <div>
                      <span className={isDark ? "text-slate-500" : "text-slate-400"}>
                        SUPERVISOR:
                      </span>
                      <p className="text-cyan-500 font-bold">{currentAssignment.supervisor}</p>
                    </div>
                    <div>
                      <span className={isDark ? "text-slate-500" : "text-slate-400"}>
                        CONTACT:
                      </span>
                      <p className={`font-bold ${isDark ? "text-slate-200" : "text-slate-800"}`}>
                        {currentAssignment.supervisorPhone || "Venue Radio Desk"}
                      </p>
                    </div>
                  </div>

                  <p
                    className={`leading-relaxed ${
                      isDark ? "text-slate-300" : "text-slate-600"
                    }`}
                  >
                    {currentAssignment.instructions}
                  </p>
                </div>
              </div>
            ) : null}

            {nextAssignment && (
              <div
                className={`p-4 sm:p-5 rounded-2xl border space-y-4 transition-colors ${
                  isDark
                    ? "bg-[#0b1322] border-slate-800 text-slate-100"
                    : "bg-white border-slate-200 text-slate-900"
                }`}
              >
                <div
                  className={`flex justify-between items-center border-b pb-3 ${
                    isDark ? "border-slate-800" : "border-slate-100"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-500" />
                    <h3 className="font-pixel text-sm font-bold uppercase tracking-wider">
                      UPCOMING DEPLOYMENT
                    </h3>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/15 text-cyan-500 border border-cyan-500/30 uppercase">
                    SCHEDULED
                  </span>
                </div>

                <div className="space-y-2 text-xs font-sans">
                  <h3
                    className={`font-pixel text-sm font-bold ${
                      isDark ? "text-slate-100" : "text-slate-900"
                    }`}
                  >
                    {nextAssignment.title}
                  </h3>
                  <p className="text-cyan-500 font-mono">
                    {nextAssignment.venue} — {nextAssignment.area}
                  </p>
                  <p className="font-mono text-amber-500">
                    Shift: {nextAssignment.shiftStart} — {nextAssignment.shiftEnd}
                  </p>
                  <p className={isDark ? "text-slate-400" : "text-slate-500"}>
                    {nextAssignment.instructions}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* TAB 4: REPORTED ISSUES */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {currentTab === "issues" && (
          <div className="space-y-6">
            <div
              className={`p-4 sm:p-5 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-colors ${
                isDark
                  ? "bg-[#0b1322] border-slate-800 text-slate-100"
                  : "bg-white border-slate-200 text-slate-900"
              }`}
            >
              <div>
                <h2 className="font-pixel text-base font-bold">MY REPORTED ISSUES</h2>
                <p
                  className={`text-xs font-sans mt-0.5 ${
                    isDark ? "text-slate-400" : "text-slate-500"
                  }`}
                >
                  Track resolution status of venue problems reported from the field.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setReportIssueModalOpen(true)}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-pixel text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>REPORT ISSUE</span>
              </button>
            </div>

            {openIssues.length === 0 ? (
              <div
                className={`p-12 text-center rounded-2xl border ${
                  isDark
                    ? "bg-[#0b1322] border-slate-800 text-slate-400"
                    : "bg-white border-slate-200 text-slate-600"
                }`}
              >
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-2 opacity-80" />
                <p className="font-pixel text-xs text-emerald-500 font-bold">NO OPEN ISSUES</p>
                <p className="text-xs text-slate-400 mt-1">
                  Everything assigned to you is currently clear.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {openIssues.map((issue: any) => (
                  <div
                    key={issue.id}
                    className={`p-4 rounded-xl border space-y-2 text-xs transition-colors ${
                      isDark
                        ? "bg-[#0b1322] border-slate-800 hover:border-slate-700"
                        : "bg-white border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase border ${
                              issue.priority === "URGENT"
                                ? isDark
                                  ? "bg-red-500/15 text-red-400 border-red-500/30"
                                  : "bg-red-50 text-red-700 border-red-200"
                                : isDark
                                ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
                                : "bg-amber-50 text-amber-700 border-amber-200"
                            }`}
                          >
                            {issue.priority}
                          </span>
                          <span className="font-pixel text-[10px] text-cyan-500 uppercase font-bold">
                            {issue.category}
                          </span>
                        </div>
                        <h4
                          className={`font-semibold text-sm mt-1 ${
                            isDark ? "text-slate-100" : "text-slate-900"
                          }`}
                        >
                          {issue.title}
                        </h4>
                      </div>

                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border ${
                          issue.status === "RESOLVED"
                            ? isDark
                              ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                              : "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : issue.status === "OPEN"
                            ? isDark
                              ? "bg-red-500/15 text-red-400 border-red-500/30"
                              : "bg-red-50 text-red-700 border-red-200"
                            : isDark
                            ? "bg-orange-500/15 text-orange-400 border-orange-500/30"
                            : "bg-orange-50 text-orange-700 border-orange-200"
                        }`}
                      >
                        {issue.status}
                      </span>
                    </div>

                    <p
                      className={`font-sans leading-relaxed ${
                        isDark ? "text-slate-300" : "text-slate-600"
                      }`}
                    >
                      {issue.description}
                    </p>

                    <div
                      className={`pt-2 border-t flex items-center justify-between text-[11px] font-mono ${
                        isDark
                          ? "border-slate-800 text-slate-400"
                          : "border-slate-100 text-slate-500"
                      }`}
                    >
                      <span>Loc: {issue.location}</span>
                      <span>Latest: {issue.latestUpdate || "Pending assignment"}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* TAB 5: NOTIFICATIONS & BULLETINS */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {currentTab === "notifications" && (
          <div className="space-y-6">
            <div
              className={`p-4 sm:p-5 rounded-2xl border transition-colors ${
                isDark
                  ? "bg-[#0b1322] border-slate-800 text-slate-100"
                  : "bg-white border-slate-200 text-slate-900"
              }`}
            >
              <h2 className="font-pixel text-base font-bold">
                VOLUNTEER NOTIFICATIONS &amp; BULLETINS
              </h2>
              <p
                className={`text-xs font-sans mt-0.5 ${
                  isDark ? "text-slate-400" : "text-slate-500"
                }`}
              >
                Official circulars and announcements applicable to field operations.
              </p>
            </div>

            {announcements.length === 0 ? (
              <div
                className={`p-12 text-center rounded-2xl border ${
                  isDark
                    ? "bg-[#0b1322] border-slate-800 text-slate-400"
                    : "bg-white border-slate-200 text-slate-600"
                }`}
              >
                <Megaphone className="w-12 h-12 text-slate-500 mx-auto mb-2 opacity-60" />
                <p className="font-pixel text-xs text-slate-400 font-bold">NO ANNOUNCEMENTS</p>
              </div>
            ) : (
              <div className="space-y-4">
                {announcements.map((ann: any) => (
                  <div
                    key={ann.id}
                    className={`p-4 sm:p-5 rounded-2xl border space-y-3 transition-colors ${
                      isDark
                        ? "bg-[#0b1322] border-slate-800 text-slate-100"
                        : "bg-white border-slate-200 text-slate-900"
                    }`}
                  >
                    <div
                      className={`flex justify-between items-center border-b pb-2.5 ${
                        isDark ? "border-slate-800" : "border-slate-100"
                      }`}
                    >
                      <h3 className="font-pixel text-sm font-bold uppercase tracking-wider text-orange-500">
                        {ann.title}
                      </h3>
                      <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-orange-500/10 text-orange-500 border border-orange-500/30 uppercase">
                        OFFICIAL
                      </span>
                    </div>

                    <p
                      className={`text-xs font-sans leading-relaxed whitespace-pre-wrap ${
                        isDark ? "text-slate-300" : "text-slate-600"
                      }`}
                    >
                      {ann.content}
                    </p>

                    <div
                      className={`pt-2 border-t flex justify-between text-[10px] font-mono ${
                        isDark
                          ? "border-slate-800 text-slate-500"
                          : "border-slate-100 text-slate-400"
                      }`}
                    >
                      <span>Broadcast by: {ann.authorEmail}</span>
                      <span>{new Date(ann.createdAt).toLocaleString("en-IN")}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* TAB 6: PROFILE */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {currentTab === "profile" && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div
              className={`p-5 sm:p-6 rounded-2xl border space-y-4 shadow-sm transition-colors ${
                isDark
                  ? "bg-[#0b1322] border-slate-800 text-slate-100"
                  : "bg-white border-slate-200 text-slate-900"
              }`}
            >
              <div
                className={`flex justify-between items-center border-b pb-3 ${
                  isDark ? "border-slate-800" : "border-slate-100"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-orange-500" />
                  <h3 className="font-pixel text-sm font-bold uppercase tracking-wider">
                    VOLUNTEER CREDENTIAL CARD
                  </h3>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-orange-500/15 text-orange-500 border border-orange-500/30 uppercase">
                  MOBILE FIELD
                </span>
              </div>

              <div className="space-y-4 text-xs font-sans">
                <div
                  className={`flex items-center gap-4 p-4 rounded-xl border ${
                    isDark
                      ? "bg-[#111d33] border-slate-800"
                      : "bg-slate-50 border-slate-200"
                  }`}
                >
                  <div className="w-16 h-16 rounded-xl bg-orange-500/20 border-2 border-orange-500 flex items-center justify-center font-pixel text-lg font-bold text-orange-500">
                    {volunteer.name ? volunteer.name.slice(0, 2).toUpperCase() : "VL"}
                  </div>
                  <div>
                    <h3
                      className={`font-pixel text-sm sm:text-base font-bold ${
                        isDark ? "text-slate-100" : "text-slate-900"
                      }`}
                    >
                      {volunteer.name || "Field Volunteer"}
                    </h3>
                    <p className="text-cyan-500 font-mono text-xs mt-0.5 font-bold">
                      {volunteer.volunteerCode || "VLT-2026-FIELD"}
                    </p>
                    <p
                      className={`text-xs font-mono mt-0.5 ${
                        isDark ? "text-slate-400" : "text-slate-500"
                      }`}
                    >
                      {volunteer.email || "volunteer@szwbt2026.edu"}
                    </p>
                  </div>
                </div>

                <div
                  className={`grid grid-cols-2 gap-3 p-4 rounded-xl border font-mono text-xs ${
                    isDark
                      ? "bg-[#111d33] border-slate-800 text-slate-300"
                      : "bg-slate-50 border-slate-200 text-slate-700"
                  }`}
                >
                  <div>
                    <span
                      className={`block uppercase text-[10px] ${
                        isDark ? "text-slate-500" : "text-slate-400"
                      }`}
                    >
                      ASSIGNED AREA:
                    </span>
                    <p className="font-bold mt-0.5">{volunteer.assignedArea || "Court Operations"}</p>
                  </div>
                  <div>
                    <span
                      className={`block uppercase text-[10px] ${
                        isDark ? "text-slate-500" : "text-slate-400"
                      }`}
                    >
                      SHIFT STATUS:
                    </span>
                    <p className="text-orange-500 font-bold mt-0.5">{shiftStatus}</p>
                  </div>
                  <div>
                    <span
                      className={`block uppercase text-[10px] ${
                        isDark ? "text-slate-500" : "text-slate-400"
                      }`}
                    >
                      BADGE:
                    </span>
                    <p className="font-bold mt-0.5">{volunteer.badge || "MOBILE FIELD"}</p>
                  </div>
                  <div>
                    <span
                      className={`block uppercase text-[10px] ${
                        isDark ? "text-slate-500" : "text-slate-400"
                      }`}
                    >
                      ROLE:
                    </span>
                    <p className="font-bold mt-0.5">{volunteer.role || "Volunteer"}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* MODAL: REPORT ISSUE */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {reportIssueModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs select-none animate-in fade-in duration-150">
          <div
            className={`w-full max-w-lg rounded-2xl border p-5 sm:p-6 shadow-2xl relative ${
              isDark
                ? "bg-[#0b1322] border-amber-500/40 text-slate-100"
                : "bg-white border-amber-300 text-slate-900"
            }`}
          >
            <div
              className={`flex items-center justify-between border-b pb-3 mb-4 ${
                isDark ? "border-slate-800" : "border-slate-100"
              }`}
            >
              <div className="flex items-center gap-2 text-amber-500">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <h3 className="font-pixel text-xs font-bold uppercase tracking-wider">
                  REPORT OPERATIONAL ISSUE
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setReportIssueModalOpen(false)}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  isDark
                    ? "text-slate-400 hover:text-white hover:bg-slate-800"
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleReportIssue} className="space-y-4 text-xs font-sans">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    className={`block mb-1 font-pixel text-[10px] uppercase font-bold ${
                      isDark ? "text-slate-400" : "text-slate-600"
                    }`}
                  >
                    ISSUE CATEGORY:
                  </label>
                  <select
                    value={issueCategory}
                    onChange={(e) => setIssueCategory(e.target.value)}
                    className={`w-full p-2.5 rounded-xl border text-xs focus:outline-none transition-colors ${
                      isDark
                        ? "bg-[#111d33] border-slate-700 text-slate-200"
                        : "bg-slate-50 border-slate-300 text-slate-900"
                    }`}
                  >
                    <option value="VENUE">VENUE</option>
                    <option value="PARTICIPANT">PARTICIPANT</option>
                    <option value="ACCOMMODATION">ACCOMMODATION</option>
                    <option value="TRANSPORT">TRANSPORT</option>
                    <option value="MATCH">MATCH</option>
                    <option value="EQUIPMENT">EQUIPMENT</option>
                    <option value="SAFETY">SAFETY</option>
                    <option value="TECHNICAL">TECHNICAL</option>
                    <option value="OTHER">OTHER</option>
                  </select>
                </div>

                <div>
                  <label
                    className={`block mb-1 font-pixel text-[10px] uppercase font-bold ${
                      isDark ? "text-slate-400" : "text-slate-600"
                    }`}
                  >
                    PRIORITY:
                  </label>
                  <select
                    value={issuePriority}
                    onChange={(e) => setIssuePriority(e.target.value)}
                    className={`w-full p-2.5 rounded-xl border text-xs focus:outline-none transition-colors ${
                      isDark
                        ? "bg-[#111d33] border-slate-700 text-slate-200"
                        : "bg-slate-50 border-slate-300 text-slate-900"
                    }`}
                  >
                    <option value="URGENT">URGENT</option>
                    <option value="HIGH">HIGH</option>
                    <option value="NORMAL">NORMAL</option>
                    <option value="LOW">LOW</option>
                  </select>
                </div>
              </div>

              <div>
                <label
                  className={`block mb-1 font-pixel text-[10px] uppercase font-bold ${
                    isDark ? "text-slate-400" : "text-slate-600"
                  }`}
                >
                  LOCATION:
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Concourse Gate 01 or Court Block A"
                  value={issueLocation}
                  onChange={(e) => setIssueLocation(e.target.value)}
                  className={`w-full p-2.5 rounded-xl border text-xs focus:outline-none transition-colors ${
                    isDark
                      ? "bg-[#111d33] border-slate-700 text-slate-200 placeholder:text-slate-600"
                      : "bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400"
                  }`}
                />
              </div>

              <div>
                <label
                  className={`block mb-1 font-pixel text-[10px] uppercase font-bold ${
                    isDark ? "text-slate-400" : "text-slate-600"
                  }`}
                >
                  DESCRIPTION:
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe the issue and assistance needed..."
                  value={issueDesc}
                  onChange={(e) => setIssueDesc(e.target.value)}
                  className={`w-full p-2.5 rounded-xl border text-xs focus:outline-none transition-colors ${
                    isDark
                      ? "bg-[#111d33] border-slate-700 text-slate-200 placeholder:text-slate-600"
                      : "bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400"
                  }`}
                />
              </div>

              <div
                className={`flex justify-end gap-2 pt-3 border-t ${
                  isDark ? "border-slate-800" : "border-slate-100"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setReportIssueModalOpen(false)}
                  className={`px-4 py-2 rounded-xl border font-pixel text-xs transition-colors cursor-pointer ${
                    isDark
                      ? "bg-[#111d33] border-slate-700 text-slate-400 hover:text-white"
                      : "bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900"
                  }`}
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={submittingIssue}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-pixel text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-xs disabled:opacity-50"
                >
                  {submittingIssue ? "SUBMITTING..." : "SUBMIT REPORT"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* MODAL: REQUEST HELP */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {helpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs select-none animate-in fade-in duration-150">
          <div
            className={`w-full max-w-lg rounded-2xl border p-5 sm:p-6 shadow-2xl relative ${
              isDark
                ? "bg-[#0b1322] border-red-500/40 text-slate-100"
                : "bg-white border-red-300 text-slate-900"
            }`}
          >
            <div
              className={`flex items-center justify-between border-b pb-3 mb-4 ${
                isDark ? "border-slate-800" : "border-slate-100"
              }`}
            >
              <div className="flex items-center gap-2 text-red-500">
                <LifeBuoy className="w-5 h-5 shrink-0 animate-pulse" />
                <h3 className="font-pixel text-xs font-bold uppercase tracking-wider">
                  OPERATIONAL ESCALATION / REQUEST HELP
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setHelpModalOpen(false)}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  isDark
                    ? "text-slate-400 hover:text-white hover:bg-slate-800"
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRequestHelp} className="space-y-4 text-xs font-sans">
              <div>
                <label
                  className={`block mb-1 font-pixel text-[10px] uppercase font-bold ${
                    isDark ? "text-slate-400" : "text-slate-600"
                  }`}
                >
                  ESCALATION DESTINATION:
                </label>
                <select
                  value={helpDestination}
                  onChange={(e) => setHelpDestination(e.target.value)}
                  className={`w-full p-2.5 rounded-xl border text-xs focus:outline-none transition-colors ${
                    isDark
                      ? "bg-[#111d33] border-slate-700 text-slate-200"
                      : "bg-slate-50 border-slate-300 text-slate-900"
                  }`}
                >
                  <option value="Supervisor">Supervisor (Field Lead)</option>
                  <option value="Operations">Operations Command Desk</option>
                  <option value="Organizer">Organizer Secretariat</option>
                  <option value="Transport">Transport Coordinator</option>
                  <option value="Accommodation">Hostel / Accommodation Desk</option>
                  <option value="Match Operations">Match Operations / Umpire Desk</option>
                  <option value="Medical">Medical Bay / First Aid</option>
                </select>
              </div>

              <div>
                <label
                  className={`block mb-1 font-pixel text-[10px] uppercase font-bold ${
                    isDark ? "text-slate-400" : "text-slate-600"
                  }`}
                >
                  LOCATION:
                </label>
                <input
                  type="text"
                  placeholder="e.g. Court Block A"
                  value={helpLocation}
                  onChange={(e) => setHelpLocation(e.target.value)}
                  className={`w-full p-2.5 rounded-xl border text-xs focus:outline-none transition-colors ${
                    isDark
                      ? "bg-[#111d33] border-slate-700 text-slate-200 placeholder:text-slate-600"
                      : "bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400"
                  }`}
                />
              </div>

              <div>
                <label
                  className={`block mb-1 font-pixel text-[10px] uppercase font-bold ${
                    isDark ? "text-slate-400" : "text-slate-600"
                  }`}
                >
                  NATURE OF EMERGENCY / ASSISTANCE:
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="State the immediate problem requiring assistance..."
                  value={helpMessage}
                  onChange={(e) => setHelpMessage(e.target.value)}
                  className={`w-full p-2.5 rounded-xl border text-xs focus:outline-none transition-colors ${
                    isDark
                      ? "bg-[#111d33] border-slate-700 text-slate-200 placeholder:text-slate-600"
                      : "bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400"
                  }`}
                />
              </div>

              <div
                className={`flex justify-end gap-2 pt-3 border-t ${
                  isDark ? "border-slate-800" : "border-slate-100"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setHelpModalOpen(false)}
                  className={`px-4 py-2 rounded-xl border font-pixel text-xs transition-colors cursor-pointer ${
                    isDark
                      ? "bg-[#111d33] border-slate-700 text-slate-400 hover:text-white"
                      : "bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900"
                  }`}
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={submittingHelp}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-pixel text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-xs disabled:opacity-50"
                >
                  {submittingHelp ? "DISPATCHING..." : "DISPATCH SIGNAL"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* MODAL: TASK DETAIL */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs select-none animate-in fade-in duration-150">
          <div
            className={`w-full max-w-lg rounded-2xl border p-5 sm:p-6 shadow-2xl relative ${
              isDark
                ? "bg-[#0b1322] border-cyan-500/40 text-slate-100"
                : "bg-white border-cyan-300 text-slate-900"
            }`}
          >
            <div
              className={`flex items-center justify-between border-b pb-3 mb-4 ${
                isDark ? "border-slate-800" : "border-slate-100"
              }`}
            >
              <div>
                <span className="font-pixel text-[10px] text-cyan-500 uppercase font-bold">
                  TASK // {selectedTask.id.slice(-6)}
                </span>
                <h3
                  className={`font-bold text-sm mt-0.5 ${
                    isDark ? "text-slate-100" : "text-slate-900"
                  }`}
                >
                  {selectedTask.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTask(null)}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  isDark
                    ? "text-slate-400 hover:text-white hover:bg-slate-800"
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs font-sans">
              <div className="flex gap-2 flex-wrap">
                <span
                  className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase border ${
                    selectedTask.priority === "URGENT"
                      ? isDark
                        ? "bg-red-500/15 text-red-400 border-red-500/30"
                        : "bg-red-50 text-red-700 border-red-200"
                      : isDark
                      ? "bg-orange-500/15 text-orange-400 border-orange-500/30"
                      : "bg-orange-50 text-orange-700 border-orange-200"
                  }`}
                >
                  {selectedTask.priority}
                </span>

                <span
                  className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase border ${
                    isDark
                      ? "bg-cyan-500/15 text-cyan-400 border-cyan-500/30"
                      : "bg-cyan-50 text-cyan-700 border-cyan-200"
                  }`}
                >
                  {selectedTask.category}
                </span>

                <span
                  className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase border ${
                    selectedTask.status === "COMPLETED"
                      ? isDark
                        ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                        : "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : isDark
                      ? "bg-slate-800 text-slate-400 border-slate-700"
                      : "bg-slate-100 text-slate-600 border-slate-200"
                  }`}
                >
                  {selectedTask.status}
                </span>
              </div>

              <div
                className={`p-3.5 rounded-xl border space-y-1 ${
                  isDark
                    ? "bg-[#111d33] border-slate-800"
                    : "bg-slate-50 border-slate-200"
                }`}
              >
                <p className={`font-bold ${isDark ? "text-slate-200" : "text-slate-800"}`}>
                  Description:
                </p>
                <p className={isDark ? "text-slate-300" : "text-slate-600"}>
                  {selectedTask.description}
                </p>
              </div>

              {selectedTask.instructions && (
                <div
                  className={`p-3.5 rounded-xl border-l-3 border-cyan-500 border text-xs ${
                    isDark
                      ? "bg-[#111d33] border-slate-800"
                      : "bg-slate-50 border-slate-200"
                  }`}
                >
                  <strong className="text-cyan-500 block mb-1 font-pixel text-[10px] uppercase tracking-wider">
                    Operational Instructions:
                  </strong>
                  <p className={isDark ? "text-slate-300" : "text-slate-600"}>
                    {selectedTask.instructions}
                  </p>
                </div>
              )}

              <div
                className={`grid grid-cols-2 gap-3 p-3.5 rounded-xl border text-[11px] font-mono ${
                  isDark
                    ? "bg-[#111d33] border-slate-800"
                    : "bg-slate-50 border-slate-200"
                }`}
              >
                <div>
                  <span
                    className={`block uppercase text-[10px] ${
                      isDark ? "text-slate-500" : "text-slate-400"
                    }`}
                  >
                    Location:
                  </span>
                  <p className={`font-semibold mt-0.5 ${isDark ? "text-slate-200" : "text-slate-800"}`}>
                    {selectedTask.location}
                  </p>
                </div>
                <div>
                  <span
                    className={`block uppercase text-[10px] ${
                      isDark ? "text-slate-500" : "text-slate-400"
                    }`}
                  >
                    Due Time:
                  </span>
                  <p className="text-amber-500 font-semibold mt-0.5">{selectedTask.dueTime}</p>
                </div>
              </div>

              <div
                className={`pt-3 border-t flex justify-end gap-2 ${
                  isDark ? "border-slate-800" : "border-slate-100"
                }`}
              >
                {selectedTask.status === "ASSIGNED" && (
                  <button
                    type="button"
                    onClick={() => handleUpdateTask(selectedTask.id, "IN_PROGRESS")}
                    className="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white font-pixel text-[10px] font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    START TASK
                  </button>
                )}
                {selectedTask.status === "IN_PROGRESS" && (
                  <button
                    type="button"
                    onClick={() => handleUpdateTask(selectedTask.id, "COMPLETED")}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-pixel text-[10px] font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    COMPLETE
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setSelectedTask(null)}
                  className={`px-3 py-1.5 rounded-lg border font-pixel text-[10px] transition-colors cursor-pointer ${
                    isDark
                      ? "bg-[#111d33] border-slate-700 text-slate-400 hover:text-white"
                      : "bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900"
                  }`}
                >
                  CLOSE
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </VolunteerPortalShell>
  );
}

export default function VolunteerDashboard() {
  return (
    <VolunteerThemeProvider>
      <Suspense
        fallback={
          <div className="min-h-screen bg-[#060b14] flex items-center justify-center text-slate-100 font-pixel text-xs">
            INITIALIZING VOLUNTEER OPERATIONS PORTAL...
          </div>
        }
      >
        <VolunteerDashboardContent />
      </Suspense>
    </VolunteerThemeProvider>
  );
}
