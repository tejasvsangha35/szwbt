"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useAuth } from "@/lib/rbac/useAuth";
import {
  ARRIVAL_VENUES,
  ArrivalVenue,
  ArrivalStatus,
  UniversityArrival,
  OperationalAlert,
} from "@/lib/transport/types";
import {
  MapPin,
  Clock,
  Search,
  RefreshCw,
  Sun,
  Moon,
  Monitor,
  Calendar,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  X,
  Printer,
  Download,
  Edit3,
  Sliders,
  Shield,
  AlertCircle,
  Check,
  LogOut,
  Bell,
  ChevronDown,
  LayoutDashboard,
  ListFilter,
  SlidersHorizontal,
  ExternalLink,
  Phone,
  User,
  Users,
  Building,
} from "lucide-react";

// Official Tournament Dates
const TOURNAMENT_DATES = [
  { value: "2026-10-16", label: "16 Oct 2026 (Early Team Arrivals)" },
  { value: "2026-10-17", label: "17 Oct 2026 (Peak Pre-Arrivals Day)" },
  { value: "2026-10-18", label: "18 Oct 2026 (Primary Arrival Day)" },
  { value: "2026-10-19", label: "19 Oct 2026 (Inauguration Day)" },
  { value: "2026-10-20", label: "20 Oct 2026 (Tournament Day 2)" },
  { value: "2026-10-21", label: "21 Oct 2026 (Finals & Departures)" },
];

export default function UniversityArrivalManagementPage() {
  const { user, logout } = useAuth();

  // Navigation & View Tab
  const [activeNav, setActiveNav] = useState<"dashboard" | "arrivals" | "issues" | "settings">("dashboard");

  // Filter States (Default to peak arrival day 2026-10-17)
  const [selectedDate, setSelectedDate] = useState<string>("2026-10-17");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedVenue, setSelectedVenue] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");

  // Data States
  const [arrivals, setArrivals] = useState<UniversityArrival[]>([]);
  const [groupedArrivals, setGroupedArrivals] = useState<Record<ArrivalVenue, UniversityArrival[]>>({} as any);
  const [nextArrival, setNextArrival] = useState<UniversityArrival | null>(null);
  const [summary, setSummary] = useState({
    total: 0,
    upcoming: 0,
    arrived: 0,
    delayed: 0,
    cancelled: 0,
    totalVenues: 8,
  });
  const [operationalAlerts, setOperationalAlerts] = useState<OperationalAlert[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string>("--:--");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [actionSuccessNotice, setActionSuccessNotice] = useState<string | null>(null);

  // Theme State: 'light' | 'dark' | 'system'
  const [theme, setTheme] = useState<"light" | "dark" | "system">("light");
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState<boolean>(false);

  // Live Clock
  const [currentTimeStr, setCurrentTimeStr] = useState<string>("");

  // Modals & Panels
  const [detailModalArrival, setDetailModalArrival] = useState<UniversityArrival | null>(null);
  const [delayModalArrival, setDelayModalArrival] = useState<UniversityArrival | null>(null);
  const [editModalArrival, setEditModalArrival] = useState<UniversityArrival | null>(null);
  const [issueModalArrival, setIssueModalArrival] = useState<UniversityArrival | null>(null);

  // Delay Form States
  const [delayTimeInput, setDelayTimeInput] = useState<string>("");
  const [delayReasonInput, setDelayReasonInput] = useState<string>("Traffic");
  const [delayNoteInput, setDelayNoteInput] = useState<string>("");
  const [isSubmittingDelay, setIsSubmittingDelay] = useState<boolean>(false);

  // Edit Form States
  const [editUniversityName, setEditUniversityName] = useState<string>("");
  const [editArrivalTime, setEditArrivalTime] = useState<string>("");
  const [editArrivalVenue, setEditArrivalVenue] = useState<ArrivalVenue>(ARRIVAL_VENUES[0]);
  const [editArrivalStatus, setEditArrivalStatus] = useState<ArrivalStatus>("UPCOMING");
  const [editContactPerson, setEditContactPerson] = useState<string>("");
  const [editContactPhone, setEditContactPhone] = useState<string>("");
  const [isSubmittingEdit, setIsSubmittingEdit] = useState<boolean>(false);

  // Issue Form States
  const [issueCategoryInput, setIssueCategoryInput] = useState<string>("Delayed Arrival");
  const [issueNoteInput, setIssueNoteInput] = useState<string>("");
  const [isSubmittingIssue, setIsSubmittingIssue] = useState<boolean>(false);

  // Settings States
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState<boolean>(true);
  const [autoRefreshInterval, setAutoRefreshInterval] = useState<number>(30); // seconds
  const [showNotificationBanner, setShowNotificationBanner] = useState<boolean>(true);

  // Auto-refresh interval ref
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);

  // ───────────────────────────────────────────────────────────────────────────
  // THEME MANAGEMENT (PERSISTENCE & ZERO LEAKAGE)
  // ───────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    const savedTheme = (localStorage.getItem("szwbt_theme") as "light" | "dark" | "system") || "light";
    setTheme(savedTheme);
    applyTheme(savedTheme);
  }, []);

  const applyTheme = (targetTheme: "light" | "dark" | "system") => {
    const root = document.documentElement;
    let effectiveDark = false;
    if (targetTheme === "dark") {
      effectiveDark = true;
    } else if (targetTheme === "system") {
      effectiveDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    } else {
      effectiveDark = false;
    }

    if (effectiveDark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  };

  const handleThemeChange = (newTheme: "light" | "dark" | "system") => {
    setTheme(newTheme);
    localStorage.setItem("szwbt_theme", newTheme);
    applyTheme(newTheme);
    setIsThemeMenuOpen(false);
  };

  // ───────────────────────────────────────────────────────────────────────────
  // LIVE CLOCK
  // ───────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      });
      const dateStr = now.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
      setCurrentTimeStr(`${dateStr} • ${timeStr} IST`);
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // ───────────────────────────────────────────────────────────────────────────
  // DATA FETCHING
  // ───────────────────────────────────────────────────────────────────────────
  const fetchArrivals = useCallback(
    async (isManualRefresh = false) => {
      if (isManualRefresh) setIsRefreshing(true);
      setErrorMessage(null);

      try {
        const queryParams = new URLSearchParams();
        if (selectedDate) queryParams.set("date", selectedDate);
        if (selectedVenue && selectedVenue !== "ALL") queryParams.set("venue", selectedVenue);
        if (searchQuery.trim()) queryParams.set("search", searchQuery.trim());

        const res = await fetch(`/api/transport/arrivals?${queryParams.toString()}`);
        if (!res.ok) {
          throw new Error("Unable to load arrival information. Please refresh and try again.");
        }

        const resJson = await res.json();
        if (resJson.success) {
          const payload = resJson.data || resJson;
          setArrivals(payload.arrivals || resJson.arrivals || []);
          setGroupedArrivals(payload.groupedByVenue || resJson.groupedByVenue || ({} as any));
          setSummary(
            payload.summary ||
              resJson.summary || { total: 0, upcoming: 0, arrived: 0, delayed: 0, cancelled: 0, totalVenues: 8 }
          );
          setNextArrival(payload.nextArrival || resJson.nextArrival || null);
          setOperationalAlerts(payload.operationalAlerts || resJson.operationalAlerts || []);
          setLastUpdated(
            payload.lastUpdated ||
              resJson.lastUpdated ||
              new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
          );
        } else {
          throw new Error(resJson.error || "Failed to load arrivals");
        }
      } catch (err: any) {
        setErrorMessage(err.message || "Unable to load arrival information. Please refresh and try again.");
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [selectedDate, selectedVenue, searchQuery]
  );

  // Initial load and filter change
  useEffect(() => {
    fetchArrivals();
  }, [fetchArrivals]);

  // Auto-refresh timer
  useEffect(() => {
    if (refreshTimerRef.current) clearInterval(refreshTimerRef.current);
    if (autoRefreshEnabled && autoRefreshInterval > 0) {
      refreshTimerRef.current = setInterval(() => {
        fetchArrivals(false);
      }, autoRefreshInterval * 1000);
    }
    return () => {
      if (refreshTimerRef.current) clearInterval(refreshTimerRef.current);
    };
  }, [autoRefreshEnabled, autoRefreshInterval, fetchArrivals]);

  // ───────────────────────────────────────────────────────────────────────────
  // ACTIONS: MARK ARRIVED
  // ───────────────────────────────────────────────────────────────────────────
  const handleMarkArrived = async (arrival: UniversityArrival) => {
    try {
      const res = await fetch(`/api/transport/arrivals/${arrival.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "MARK_ARRIVED" }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to mark as arrived");
      }

      setActionSuccessNotice(`${arrival.universityName} marked as ARRIVED at ${arrival.venue}`);
      setTimeout(() => setActionSuccessNotice(null), 4000);

      if (detailModalArrival?.id === arrival.id) {
        setDetailModalArrival(data.arrival);
      }
      fetchArrivals();
    } catch (err: any) {
      alert(err.message || "Failed to mark arrived");
    }
  };

  // ───────────────────────────────────────────────────────────────────────────
  // ACTIONS: DELAY MANAGEMENT
  // ───────────────────────────────────────────────────────────────────────────
  const openDelayModal = (arrival: UniversityArrival) => {
    setDelayModalArrival(arrival);
    setDelayTimeInput(arrival.updatedTime || arrival.scheduledTime);
    setDelayReasonInput(arrival.delayReason || "Traffic");
    setDelayNoteInput(arrival.delayNote || "");
  };

  const handleSubmitDelay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!delayModalArrival) return;
    if (!delayTimeInput.trim()) {
      alert("Please provide the updated arrival time.");
      return;
    }

    setIsSubmittingDelay(true);
    try {
      const res = await fetch(`/api/transport/arrivals/${delayModalArrival.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "MARK_DELAYED",
          updatedTime: delayTimeInput.trim(),
          delayReason: delayReasonInput,
          delayNote: delayNoteInput.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to record delay");
      }

      setActionSuccessNotice(`Delay recorded for ${delayModalArrival.universityName}: Revised to ${delayTimeInput}`);
      setTimeout(() => setActionSuccessNotice(null), 4000);

      setDelayModalArrival(null);
      if (detailModalArrival?.id === delayModalArrival.id) {
        setDetailModalArrival(data.arrival);
      }
      fetchArrivals();
    } catch (err: any) {
      alert(err.message || "Failed to record delay");
    } finally {
      setIsSubmittingDelay(false);
    }
  };

  // ───────────────────────────────────────────────────────────────────────────
  // ACTIONS: EDIT ARRIVAL (VENUE CHANGE / TIME CHANGE)
  // ───────────────────────────────────────────────────────────────────────────
  const openEditModal = (arrival: UniversityArrival) => {
    setEditModalArrival(arrival);
    setEditUniversityName(arrival.universityName);
    setEditArrivalTime(arrival.scheduledTime);
    setEditArrivalVenue(arrival.venue);
    setEditArrivalStatus(arrival.status);
    setEditContactPerson(arrival.contactPerson || "");
    setEditContactPhone(arrival.contactPhone || "");
  };

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editModalArrival) return;

    setIsSubmittingEdit(true);
    try {
      const res = await fetch(`/api/transport/arrivals/${editModalArrival.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "EDIT_ARRIVAL",
          universityName: editUniversityName.trim(),
          scheduledTime: editArrivalTime.trim(),
          venue: editArrivalVenue,
          status: editArrivalStatus,
          contactPerson: editContactPerson.trim(),
          contactPhone: editContactPhone.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update arrival");
      }

      setActionSuccessNotice(`Updated arrival details for ${editUniversityName}. Venue: ${editArrivalVenue}`);
      setTimeout(() => setActionSuccessNotice(null), 4000);

      setEditModalArrival(null);
      if (detailModalArrival?.id === editModalArrival.id) {
        setDetailModalArrival(data.arrival);
      }
      fetchArrivals();
    } catch (err: any) {
      alert(err.message || "Failed to update arrival");
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  // ───────────────────────────────────────────────────────────────────────────
  // ACTIONS: REPORT ISSUE
  // ───────────────────────────────────────────────────────────────────────────
  const openIssueModal = (arrival: UniversityArrival) => {
    setIssueModalArrival(arrival);
    setIssueCategoryInput("Delayed Arrival");
    setIssueNoteInput("");
  };

  const handleSubmitIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!issueModalArrival) return;
    if (!issueNoteInput.trim()) {
      alert("Please enter a short operational note.");
      return;
    }

    setIsSubmittingIssue(true);
    try {
      const res = await fetch(`/api/transport/arrivals/${issueModalArrival.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "REPORT_ISSUE",
          issueCategory: issueCategoryInput,
          issueNote: issueNoteInput.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to report issue");
      }

      setActionSuccessNotice(`Issue reported: "${issueCategoryInput}" for ${issueModalArrival.universityName}`);
      setTimeout(() => setActionSuccessNotice(null), 4000);

      setIssueModalArrival(null);
      if (detailModalArrival?.id === issueModalArrival.id) {
        setDetailModalArrival(data.arrival);
      }
      fetchArrivals();
    } catch (err: any) {
      alert(err.message || "Failed to submit issue");
    } finally {
      setIsSubmittingIssue(false);
    }
  };

  // ───────────────────────────────────────────────────────────────────────────
  // DATE NAVIGATION
  // ───────────────────────────────────────────────────────────────────────────
  const handlePrevDate = () => {
    const currentIndex = TOURNAMENT_DATES.findIndex((d) => d.value === selectedDate);
    if (currentIndex > 0) {
      setSelectedDate(TOURNAMENT_DATES[currentIndex - 1].value);
    }
  };

  const handleNextDate = () => {
    const currentIndex = TOURNAMENT_DATES.findIndex((d) => d.value === selectedDate);
    if (currentIndex < TOURNAMENT_DATES.length - 1) {
      setSelectedDate(TOURNAMENT_DATES[currentIndex + 1].value);
    }
  };

  const formattedDateLabel = useMemo(() => {
    const matched = TOURNAMENT_DATES.find((d) => d.value === selectedDate);
    return matched ? matched.label : selectedDate;
  }, [selectedDate]);

  // ───────────────────────────────────────────────────────────────────────────
  // PRINT FUNCTION
  // ───────────────────────────────────────────────────────────────────────────
  const handlePrintSchedule = () => {
    window.print();
  };

  // ───────────────────────────────────────────────────────────────────────────
  // EXPORT CSV FUNCTION
  // ───────────────────────────────────────────────────────────────────────────
  const handleExportCsv = () => {
    const headers = [
      "University Name",
      "Date",
      "Arrival Time",
      "Original Time",
      "Venue",
      "Status",
      "Delay Reason",
      "Delay Note",
      "Athletes Count",
      "Contact Person",
      "Contact Phone",
    ];

    const rows = arrivals.map((a) => [
      `"${a.universityName.replace(/"/g, '""')}"`,
      `"${a.date}"`,
      `"${a.updatedTime || a.scheduledTime}"`,
      `"${a.originalTime || a.scheduledTime}"`,
      `"${a.venue}"`,
      `"${a.status}"`,
      `"${a.delayReason || ""}"`,
      `"${(a.delayNote || "").replace(/"/g, '""')}"`,
      a.contingentSize || 0,
      `"${(a.contactPerson || "").replace(/"/g, '""')}"`,
      `"${a.contactPhone || ""}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `SZWBT_2026_Arrivals_${selectedDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Status Badge Rendering Helper
  const renderStatusBadge = (status: ArrivalStatus, isNext: boolean = false) => {
    switch (status) {
      case "ARRIVED":
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200 border-2 border-emerald-400 dark:border-emerald-600 shadow-sm">
            ARRIVED
          </span>
        );
      case "DELAYED":
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200 border-2 border-amber-400 dark:border-amber-600 shadow-sm">
            DELAYED
          </span>
        );
      case "CANCELLED":
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-rose-100 text-rose-900 dark:bg-rose-950 dark:text-rose-200 border-2 border-rose-400 dark:border-rose-600 shadow-sm">
            CANCELLED
          </span>
        );
      case "UPCOMING":
      default:
        return (
          <div className="flex items-center space-x-1.5">
            {isNext && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-black bg-[#F95700] text-white shadow-sm tracking-wider">
                NEXT
              </span>
            )}
            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-200 border-2 border-blue-400 dark:border-blue-700 shadow-sm">
              UPCOMING
            </span>
          </div>
        );
    }
  };

  // Filtered Venues for Dashboard Display
  const venuesToDisplay = useMemo(() => {
    if (selectedVenue && selectedVenue !== "ALL") {
      return ARRIVAL_VENUES.filter((v) => v === selectedVenue);
    }
    return ARRIVAL_VENUES;
  }, [selectedVenue]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#070D1F] text-slate-900 dark:text-slate-100 transition-colors duration-200 flex flex-col font-sans">
      {/* ─────────────────────────────────────────────────────────────────────────── */}
      {/* 1. COMPACT HEADER (High-Contrast, Visible Icons at all times)                 */}
      {/* ─────────────────────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 bg-white dark:bg-[#0B152E] border-b-2 border-slate-200 dark:border-slate-800 px-4 lg:px-8 py-3.5 transition-colors shadow-sm print:hidden">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-4">
          {/* Left: SZWBT 2026 Brand + Transport Admin badge */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-[#F95700] flex items-center justify-center text-white shadow-md font-black text-sm tracking-wider">
                SZ
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-black tracking-tight text-slate-900 dark:text-white text-base leading-none">
                    SZWBT 2026
                  </span>
                  <span className="inline-block text-[11px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-orange-100 dark:bg-orange-950/80 text-[#F95700] dark:text-orange-400 border border-orange-300 dark:border-orange-700">
                    Transport Admin
                  </span>
                </div>
                <div className="text-[11px] text-slate-600 dark:text-slate-300 font-semibold mt-0.5">
                  KLE Tech Campus • Hubballi
                </div>
              </div>
            </div>
          </div>

          {/* Center-Right: Live Clock, Theme Switcher, User Menu with ULTRA-VISIBLE ICONS */}
          <div className="flex items-center space-x-3">
            {/* Live Real-time Clock with ULTRA-VISIBLE ORANGE BADGE & WHITE ICON */}
            <div className="hidden sm:flex items-center space-x-2.5 px-3.5 py-1.5 rounded-xl border-2 border-orange-400/80 dark:border-orange-500/80 bg-orange-50 dark:bg-[#1A2544] text-slate-900 dark:text-white shadow-md">
              <div className="w-7 h-7 rounded-lg bg-[#F95700] text-white flex items-center justify-center shrink-0 shadow-sm shadow-orange-500/30">
                <Clock className="w-4 h-4 text-white" strokeWidth={2.8} />
              </div>
              <span className="font-mono font-black text-xs text-slate-900 dark:text-white tracking-tight">
                {currentTimeStr || "Syncing clock..."}
              </span>
            </div>

            {/* Light / Dark / System Theme Toggle with ULTRA-VISIBLE BADGE & WHITE ICON */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)}
                aria-label="Toggle display theme"
                className="flex items-center space-x-2.5 px-3.5 py-1.5 rounded-xl border-2 border-amber-400/80 dark:border-indigo-400/80 bg-amber-50 dark:bg-[#1C204A] text-slate-900 dark:text-white font-black text-xs shadow-md hover:border-[#F95700] dark:hover:border-[#F95700] transition-all group"
              >
                <div className="w-7 h-7 rounded-lg bg-amber-500 dark:bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-indigo-500/30 group-hover:scale-105 transition-transform">
                  {theme === "light" && <Sun className="w-4 h-4 text-white" strokeWidth={2.8} />}
                  {theme === "dark" && <Moon className="w-4 h-4 text-white" strokeWidth={2.8} />}
                  {theme === "system" && <Monitor className="w-4 h-4 text-white" strokeWidth={2.8} />}
                </div>
                <span className="capitalize font-black text-xs text-slate-900 dark:text-white tracking-wide">{theme}</span>
                <div className="w-5 h-5 rounded-md bg-amber-200 dark:bg-indigo-950/80 flex items-center justify-center text-slate-900 dark:text-white">
                  <ChevronDown className="w-3.5 h-3.5 text-slate-900 dark:text-white shrink-0" strokeWidth={2.8} />
                </div>
              </button>

              {isThemeMenuOpen && (
                <div className="absolute right-0 mt-2 w-40 rounded-xl bg-white dark:bg-[#0E172E] border-2 border-slate-300 dark:border-slate-700 shadow-2xl py-1.5 z-50 text-xs font-black">
                  <button
                    type="button"
                    onClick={() => handleThemeChange("light")}
                    className={`w-full text-left px-3.5 py-2.5 flex items-center space-x-2.5 hover:bg-slate-100 dark:hover:bg-slate-800/80 ${
                      theme === "light" ? "text-[#F95700] bg-orange-50 dark:bg-orange-950/40" : "text-slate-800 dark:text-slate-200"
                    }`}
                  >
                    <div className="w-6 h-6 rounded-md bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                      <Sun className="w-3.5 h-3.5 text-white" strokeWidth={2.8} />
                    </div>
                    <span>Light Mode</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleThemeChange("dark")}
                    className={`w-full text-left px-3.5 py-2.5 flex items-center space-x-2.5 hover:bg-slate-100 dark:hover:bg-slate-800/80 ${
                      theme === "dark" ? "text-[#F95700] bg-orange-50 dark:bg-orange-950/40" : "text-slate-800 dark:text-slate-200"
                    }`}
                  >
                    <div className="w-6 h-6 rounded-md bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                      <Moon className="w-3.5 h-3.5 text-white" strokeWidth={2.8} />
                    </div>
                    <span>Dark Mode</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleThemeChange("system")}
                    className={`w-full text-left px-3.5 py-2.5 flex items-center space-x-2.5 hover:bg-slate-100 dark:hover:bg-slate-800/80 ${
                      theme === "system" ? "text-[#F95700] bg-orange-50 dark:bg-orange-950/40" : "text-slate-800 dark:text-slate-200"
                    }`}
                  >
                    <div className="w-6 h-6 rounded-md bg-slate-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                      <Monitor className="w-3.5 h-3.5 text-white" strokeWidth={2.8} />
                    </div>
                    <span>System Theme</span>
                  </button>
                </div>
              )}
            </div>

            {/* User Profile */}
            <div className="flex items-center space-x-2.5 pl-3 border-l-2 border-slate-300 dark:border-slate-700">
              <div className="w-8 h-8 rounded-xl bg-[#F95700] text-white flex items-center justify-center shrink-0 shadow-md shadow-orange-500/30">
                <User className="w-4 h-4 text-white" strokeWidth={2.8} />
              </div>
              <div className="hidden md:block text-left text-xs leading-tight">
                <div className="font-black text-slate-900 dark:text-white">
                  {user?.name || "Fleet Transport Manager"}
                </div>
                <div className="text-[11px] text-slate-600 dark:text-slate-300 font-bold">transport@szwbt2026.edu</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ─────────────────────────────────────────────────────────────────────────── */}
      {/* 2. BODY LAYOUT: HIGH-CONTRAST SIDEBAR + MAIN OPERATIONAL CONTENT             */}
      {/* ─────────────────────────────────────────────────────────────────────────── */}
      <div className="flex-1 max-w-[1600px] w-full mx-auto flex flex-col md:flex-row">
        {/* Left Sidebar (Taskbar) with ULTRA-VISIBLE ICONS AT ALL TIMES */}
        <aside className="w-full md:w-64 lg:w-72 bg-white dark:bg-[#0B152E] border-r-2 border-b md:border-b-0 border-slate-200 dark:border-slate-800 p-4 shrink-0 print:hidden">
          <div className="text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-3 px-3">
            Transport Admin
          </div>
          <nav className="space-y-2">
            {/* 1. Arrival Dashboard */}
            <button
              type="button"
              onClick={() => setActiveNav("dashboard")}
              className={`w-full flex items-center justify-between p-2.5 rounded-xl text-sm font-extrabold transition-all border-2 ${
                activeNav === "dashboard"
                  ? "bg-orange-50 dark:bg-orange-950/40 text-[#F95700] border-[#F95700] shadow-sm"
                  : "bg-slate-50 dark:bg-[#0E1B38] text-slate-900 dark:text-white border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-600"
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-[#F95700] text-white shadow-md shadow-orange-500/20 shrink-0">
                  <LayoutDashboard className="w-5 h-5 text-white" strokeWidth={2.5} />
                </div>
                <span className="text-slate-900 dark:text-white font-bold">Arrival Dashboard</span>
              </div>
              <span className="text-xs bg-[#F95700] text-white px-2 py-0.5 rounded-full font-mono font-bold shadow-sm">
                {summary.total}
              </span>
            </button>

            {/* 2. All Arrivals */}
            <button
              type="button"
              onClick={() => setActiveNav("arrivals")}
              className={`w-full flex items-center justify-between p-2.5 rounded-xl text-sm font-extrabold transition-all border-2 ${
                activeNav === "arrivals"
                  ? "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border-blue-500 shadow-sm"
                  : "bg-slate-50 dark:bg-[#0E1B38] text-slate-900 dark:text-white border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-600"
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-blue-100 dark:bg-blue-900/60 border border-blue-400 dark:border-blue-600 text-blue-700 dark:text-blue-300 shrink-0">
                  <ListFilter className="w-5 h-5 text-blue-700 dark:text-blue-300" strokeWidth={2.5} />
                </div>
                <span className="text-slate-900 dark:text-white font-bold">All Arrivals</span>
              </div>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-700">
                List
              </span>
            </button>

            {/* 3. Issues & Alerts */}
            <button
              type="button"
              onClick={() => setActiveNav("issues")}
              className={`w-full flex items-center justify-between p-2.5 rounded-xl text-sm font-extrabold transition-all border-2 ${
                activeNav === "issues"
                  ? "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-500 shadow-sm"
                  : "bg-slate-50 dark:bg-[#0E1B38] text-slate-900 dark:text-white border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-600"
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-rose-100 dark:bg-rose-900/60 border border-rose-400 dark:border-rose-600 text-rose-700 dark:text-rose-300 shrink-0">
                  <AlertCircle className="w-5 h-5 text-rose-700 dark:text-rose-300" strokeWidth={2.5} />
                </div>
                <span className="text-slate-900 dark:text-white font-bold">Issues & Alerts</span>
              </div>
              {operationalAlerts.length > 0 && (
                <span className="text-xs bg-rose-600 text-white px-2 py-0.5 rounded-full font-bold shadow-sm">
                  {operationalAlerts.length}
                </span>
              )}
            </button>

            {/* 4. Settings */}
            <button
              type="button"
              onClick={() => setActiveNav("settings")}
              className={`w-full flex items-center justify-between p-2.5 rounded-xl text-sm font-extrabold transition-all border-2 ${
                activeNav === "settings"
                  ? "bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border-purple-500 shadow-sm"
                  : "bg-slate-50 dark:bg-[#0E1B38] text-slate-900 dark:text-white border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-600"
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-purple-100 dark:bg-purple-900/60 border border-purple-400 dark:border-purple-600 text-purple-700 dark:text-purple-300 shrink-0">
                  <SlidersHorizontal className="w-5 h-5 text-purple-700 dark:text-purple-300" strokeWidth={2.5} />
                </div>
                <span className="text-slate-900 dark:text-white font-bold">Settings</span>
              </div>
            </button>
          </nav>

          {/* Quick Hubballi Venues Reference in Sidebar */}
          <div className="mt-8 pt-6 border-t-2 border-slate-200 dark:border-slate-800 hidden md:block">
            <div className="flex items-center justify-between text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 px-3 mb-3">
              <span>8 Hubballi Venues</span>
              <MapPin className="w-4 h-4 text-[#F95700]" strokeWidth={2.5} />
            </div>
            <ul className="text-xs space-y-2 px-1 text-slate-800 dark:text-slate-200">
              {ARRIVAL_VENUES.map((v, i) => (
                <li
                  key={v}
                  onClick={() => {
                    setSelectedVenue(v);
                    setActiveNav("dashboard");
                  }}
                  className={`cursor-pointer hover:text-[#F95700] transition-colors truncate p-1.5 rounded-lg flex items-center space-x-2 ${
                    selectedVenue === v
                      ? "bg-orange-50 dark:bg-orange-950/40 text-[#F95700] font-black border border-[#F95700]"
                      : "hover:bg-slate-100 dark:hover:bg-slate-800/80 font-semibold"
                  }`}
                  title={v}
                >
                  <span className="w-5 h-5 rounded-md bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-[11px] font-bold flex items-center justify-center shrink-0">
                    {i + 1}
                  </span>
                  <span className="truncate">{v.replace(", Hubballi", "")}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Secondary Link to Shuttle Fleet Operations */}
          <div className="mt-8 pt-4 border-t-2 border-slate-200 dark:border-slate-800 text-xs">
            <a
              href="/admin/transport/trips"
              className="flex items-center justify-between p-2.5 rounded-lg bg-slate-100 dark:bg-[#121E3E] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-bold hover:border-[#F95700] transition-colors"
            >
              <span className="text-xs font-bold">Shuttle Dispatch Logs</span>
              <ExternalLink className="w-4 h-4 text-[#F95700] shrink-0" strokeWidth={2.5} />
            </a>
          </div>
        </aside>

        {/* ─────────────────────────────────────────────────────────────────────────── */}
        {/* MAIN CONTENT AREA                                                           */}
        {/* ─────────────────────────────────────────────────────────────────────────── */}
        <main className="flex-1 p-4 lg:p-8 min-w-0">
          {/* Action Success Notice Toast */}
          {actionSuccessNotice && (
            <div className="mb-4 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950 border-2 border-emerald-400 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200 flex items-center justify-between text-sm shadow-md print:hidden">
              <div className="flex items-center space-x-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" strokeWidth={2.5} />
                <span className="font-extrabold">{actionSuccessNotice}</span>
              </div>
              <button
                type="button"
                onClick={() => setActionSuccessNotice(null)}
                className="text-emerald-700 dark:text-emerald-400 hover:text-emerald-900 p-1"
              >
                <X className="w-4 h-4" strokeWidth={2.5} />
              </button>
            </div>
          )}

          {/* PAGE TITLE & SUBTITLE */}
          <div className="mb-4">
            <h1 className="text-2xl lg:text-3xl font-black tracking-tight text-slate-900 dark:text-white uppercase leading-none">
              UNIVERSITY ARRIVAL MANAGEMENT
            </h1>
            <p className="mt-1 text-sm font-semibold text-slate-600 dark:text-slate-300">
              Monitor and coordinate university arrivals across Hubballi.
            </p>
          </div>

          {/* ─────────────────────────────────────────────────────────────────────────── */}
          {/* 3. SIMPLE COMPACT SUMMARY BAR                                              */}
          {/* ─────────────────────────────────────────────────────────────────────────── */}
          <div className="mb-6 p-4 rounded-xl bg-white dark:bg-[#0B152E] border-2 border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-3 text-sm">
            <div className="flex items-center flex-wrap gap-2 text-slate-900 dark:text-white font-bold">
              <span className="text-xs font-black uppercase tracking-wider text-[#F95700]">
                Today&apos;s Arrivals:
              </span>
              <span className="px-2.5 py-0.5 rounded-md bg-orange-100 dark:bg-orange-950/80 text-[#F95700] font-black border border-orange-300 dark:border-orange-800">
                {summary.total} Universities
              </span>
              <span className="text-slate-400 font-bold">•</span>
              <span className="text-slate-800 dark:text-slate-200">
                <span className="font-black">{summary.totalVenues}</span> Arrival Venues
              </span>
              <span className="text-slate-400 font-bold">•</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-black bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-200 border border-blue-400 dark:border-blue-700">
                {summary.upcoming} Upcoming
              </span>
            </div>

            <div className="flex items-center space-x-3 text-xs font-bold">
              <span className="inline-flex items-center space-x-1.5 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                <span>{summary.arrived} Arrived</span>
              </span>
              {summary.delayed > 0 && (
                <span className="inline-flex items-center space-x-1.5 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                  <span>{summary.delayed} Delayed</span>
                </span>
              )}
              {summary.cancelled > 0 && (
                <span className="inline-flex items-center space-x-1.5 text-rose-700 dark:text-rose-400 px-2 py-0.5 rounded bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
                  <span>{summary.cancelled} Cancelled</span>
                </span>
              )}
            </div>
          </div>

          {/* Operational Alert Strip */}
          {operationalAlerts.length > 0 && showNotificationBanner && (
            <div className="mb-6 p-3.5 rounded-xl bg-orange-50 dark:bg-orange-950/60 border-2 border-orange-300 dark:border-orange-800/80 flex items-center justify-between text-xs text-orange-950 dark:text-orange-200 shadow-sm print:hidden">
              <div className="flex items-center space-x-3">
                <div className="w-7 h-7 rounded-lg bg-[#F95700] text-white flex items-center justify-center shrink-0 shadow-sm">
                  <Bell className="w-4 h-4 text-white" strokeWidth={2.5} />
                </div>
                <div>
                  <span className="font-black mr-1 text-[#F95700]">Latest Operational Alert:</span>
                  <span className="font-semibold">{operationalAlerts[0]?.message}</span>
                  <span className="ml-2 font-mono font-bold text-slate-500 dark:text-slate-400 text-[10px]">
                    {operationalAlerts[0]?.timestamp}
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => setActiveNav("issues")}
                  className="font-extrabold underline text-[#F95700] hover:text-orange-600"
                >
                  View All ({operationalAlerts.length})
                </button>
                <button
                  type="button"
                  onClick={() => setShowNotificationBanner(false)}
                  className="p-1 hover:bg-orange-200 dark:hover:bg-orange-900 rounded text-slate-600 dark:text-slate-300"
                >
                  <X className="w-4 h-4" strokeWidth={2.5} />
                </button>
              </div>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────────────────── */}
          {/* 4. DATE SELECTOR & SEARCH / FILTERS WITH ULTRA-VISIBLE ICONS                 */}
          {/* ─────────────────────────────────────────────────────────────────────────── */}
          <div className="mb-6 space-y-3.5 print:hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              {/* Date Selector with prominent chevrons and calendar icon */}
              <div className="flex items-center space-x-2">
                <div className="flex items-center rounded-xl border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0B152E] shadow-sm overflow-hidden">
                  <button
                    type="button"
                    onClick={handlePrevDate}
                    title="Previous Date"
                    className="p-2.5 bg-slate-100 dark:bg-[#14234B] hover:bg-slate-200 dark:hover:bg-[#1A2E63] text-slate-900 dark:text-white transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4 text-slate-900 dark:text-white" strokeWidth={3} />
                  </button>
                  <div className="px-3.5 py-1.5 flex items-center space-x-2 text-sm font-black text-slate-900 dark:text-white">
                    <Calendar className="w-4 h-4 text-[#F95700] shrink-0" strokeWidth={2.5} />
                    <span>{formattedDateLabel}</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleNextDate}
                    title="Next Date"
                    className="p-2.5 bg-slate-100 dark:bg-[#14234B] hover:bg-slate-200 dark:hover:bg-[#1A2E63] text-slate-900 dark:text-white transition-colors"
                  >
                    <ChevronRight className="w-4 h-4 text-slate-900 dark:text-white" strokeWidth={3} />
                  </button>
                </div>

                {/* Quick Date Pills */}
                <div className="hidden sm:flex items-center space-x-1.5">
                  {TOURNAMENT_DATES.map((d) => (
                    <button
                      key={d.value}
                      type="button"
                      onClick={() => setSelectedDate(d.value)}
                      className={`px-3 py-1.5 text-xs font-black rounded-lg transition-all border-2 ${
                        selectedDate === d.value
                          ? "bg-[#F95700] text-white border-[#F95700] shadow-md shadow-orange-500/20"
                          : "bg-slate-100 dark:bg-[#14234B] text-slate-900 dark:text-white border-slate-300 dark:border-slate-700 hover:border-[#F95700]"
                      }`}
                    >
                      {d.value.slice(5)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons: Print Schedule & Export CSV with ULTRA-VISIBLE BRIGHT ICONS */}
              <div className="flex items-center space-x-2.5">
                <button
                  type="button"
                  onClick={handlePrintSchedule}
                  className="inline-flex items-center space-x-2.5 px-4 py-2 rounded-xl border-2 border-orange-400/80 dark:border-orange-500/80 bg-orange-50 dark:bg-[#1A2544] hover:bg-orange-100 dark:hover:bg-[#22315B] text-xs font-black text-slate-900 dark:text-white shadow-md transition-all group"
                  title="Print Arrival Schedule"
                >
                  <div className="w-7 h-7 rounded-lg bg-[#F95700] text-white flex items-center justify-center shrink-0 shadow-sm shadow-orange-500/30 group-hover:scale-105 transition-transform">
                    <Printer className="w-4 h-4 text-white" strokeWidth={2.8} />
                  </div>
                  <span className="font-black text-xs text-slate-900 dark:text-white tracking-wide">Print Schedule</span>
                </button>

                <button
                  type="button"
                  onClick={handleExportCsv}
                  className="inline-flex items-center space-x-2.5 px-4 py-2 rounded-xl border-2 border-emerald-400/80 dark:border-emerald-500/80 bg-emerald-50 dark:bg-[#132A3E] hover:bg-emerald-100 dark:hover:bg-[#1A3852] text-xs font-black text-slate-900 dark:text-white shadow-md transition-all group"
                  title="Export Arrivals CSV"
                >
                  <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-emerald-600/30 group-hover:scale-105 transition-transform">
                    <Download className="w-4 h-4 text-white" strokeWidth={2.8} />
                  </div>
                  <span className="font-black text-xs text-slate-900 dark:text-white tracking-wide">Export CSV</span>
                </button>
              </div>
            </div>

            {/* Search, Venue Filter, Status Filter & Refresh Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
              {/* Search University Name with HIGH-CONTRAST ICON BADGE */}
              <div className="lg:col-span-5 relative">
                <div className="w-7 h-7 rounded-lg bg-orange-100 dark:bg-orange-950/80 border border-orange-300 dark:border-orange-700 flex items-center justify-center absolute left-2.5 top-1/2 -translate-y-1/2 shrink-0">
                  <Search className="w-4 h-4 text-[#F95700] dark:text-orange-400 shrink-0" strokeWidth={2.8} />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search university or institution..."
                  className="w-full pl-12 pr-9 py-2.5 rounded-xl border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0B152E] text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 text-sm font-bold focus:outline-none focus:border-[#F95700] transition-colors shadow-sm"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 dark:text-slate-200 hover:text-slate-900 p-1"
                  >
                    <X className="w-4 h-4" strokeWidth={2.5} />
                  </button>
                )}
              </div>

              {/* Venue Filter Dropdown (All 8 Venues) */}
              <div className="lg:col-span-4">
                <select
                  value={selectedVenue}
                  onChange={(e) => setSelectedVenue(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0B152E] text-slate-900 dark:text-white text-sm font-bold focus:outline-none focus:border-[#F95700] transition-colors shadow-sm"
                >
                  <option value="ALL">All Venues (8 Venues)</option>
                  {ARRIVAL_VENUES.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Filter Dropdown + Refresh Button with ULTRA-VISIBLE ICON */}
              <div className="lg:col-span-3 flex items-center space-x-2">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="flex-1 px-3.5 py-2.5 rounded-xl border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0B152E] text-slate-900 dark:text-white text-sm font-bold focus:outline-none focus:border-[#F95700] transition-colors shadow-sm"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="UPCOMING">Upcoming Only</option>
                  <option value="ARRIVED">Arrived</option>
                  <option value="DELAYED">Delayed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>

                {/* Refresh Button with PROMINENT ICON BADGE */}
                <button
                  type="button"
                  onClick={() => fetchArrivals(true)}
                  disabled={isRefreshing}
                  className="px-3.5 py-2 rounded-xl border-2 border-blue-400/80 dark:border-blue-500/80 bg-blue-50 dark:bg-[#14234B] hover:bg-blue-100 dark:hover:bg-[#1A2E63] text-slate-900 dark:text-white text-xs font-black flex items-center space-x-2 shadow-md transition-all shrink-0 group"
                  title="Refresh arrival data"
                >
                  <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-blue-600/30 group-hover:scale-105 transition-transform">
                    <RefreshCw className={`w-4 h-4 text-white ${isRefreshing ? "animate-spin" : ""}`} strokeWidth={2.8} />
                  </div>
                  <span className="hidden sm:inline font-black text-slate-900 dark:text-white">Refresh</span>
                </button>
              </div>
            </div>

            {/* Subtle Last Updated Display */}
            <div className="text-right text-[11px] text-slate-500 dark:text-slate-400 font-mono font-bold">
              Last updated: {lastUpdated}
            </div>
          </div>

          {/* ─────────────────────────────────────────────────────────────────────────── */}
          {/* TAB ROUTING: DASHBOARD vs ALL ARRIVALS vs ISSUES vs SETTINGS                */}
          {/* ─────────────────────────────────────────────────────────────────────────── */}
          {activeNav === "dashboard" && (
            <>
              {/* LOADING SKELETON */}
              {isLoading && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 animate-pulse">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="p-5 rounded-xl bg-white dark:bg-[#0B152E] border-2 border-slate-200 dark:border-slate-800 space-y-3"
                    >
                      <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-2/3" />
                      <div className="h-16 bg-slate-100 dark:bg-slate-800/60 rounded" />
                      <div className="h-16 bg-slate-100 dark:bg-slate-800/60 rounded" />
                    </div>
                  ))}
                </div>
              )}

              {/* ERROR STATE */}
              {!isLoading && errorMessage && (
                <div className="p-8 rounded-xl bg-white dark:bg-[#0B152E] border-2 border-rose-300 dark:border-rose-900 text-center max-w-md mx-auto my-12 shadow-lg">
                  <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" strokeWidth={2.5} />
                  <h3 className="font-extrabold text-slate-900 dark:text-white mb-1 text-base">
                    Unable to load arrival information
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
                    Please refresh and try again.
                  </p>
                  <button
                    type="button"
                    onClick={() => fetchArrivals(true)}
                    className="px-5 py-2.5 rounded-xl bg-[#F95700] text-white text-xs font-black hover:bg-[#e04e00] transition-colors shadow-md"
                  >
                    Refresh
                  </button>
                </div>
              )}

              {/* ─────────────────────────────────────────────────────────────────────── */}
              {/* 5. MAIN ARRIVAL BOARD (2-COLUMN GRID OF 8 VENUES)                       */}
              {/* ─────────────────────────────────────────────────────────────────────── */}
              {!isLoading && !errorMessage && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 print:grid-cols-1 print:gap-4">
                  {venuesToDisplay.map((venueName) => {
                    const venueArrivals = (groupedArrivals[venueName] || []).filter((a) => {
                      if (selectedStatus === "ALL") return true;
                      return a.status === selectedStatus;
                    });

                    const upcomingCount = venueArrivals.filter((a) => a.status === "UPCOMING").length;

                    return (
                      <section
                        key={venueName}
                        className="rounded-xl bg-white dark:bg-[#0B152E] border-2 border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col transition-all print:border-slate-300 print:shadow-none"
                      >
                        {/* Section Header: Venue Name (Visually prominent with clear pin icon) */}
                        <div className="px-5 py-3.5 bg-slate-50 dark:bg-[#0E1B38] border-b-2 border-slate-200 dark:border-slate-800 flex items-center justify-between">
                          <div className="flex items-center space-x-2.5">
                            <div className="w-7 h-7 rounded-lg bg-orange-100 dark:bg-orange-500/20 border border-orange-300 dark:border-orange-500/40 flex items-center justify-center text-[#F95700] shrink-0">
                              <MapPin className="w-4 h-4 text-[#F95700] shrink-0" strokeWidth={2.5} />
                            </div>
                            <h2 className="font-black text-sm lg:text-base text-slate-900 dark:text-white uppercase tracking-tight">
                              {venueName}
                            </h2>
                          </div>
                          <div className="text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center space-x-1.5">
                            <span className="font-black text-slate-900 dark:text-white text-sm">
                              {venueArrivals.length}
                            </span>
                            <span>{venueArrivals.length === 1 ? "arrival" : "arrivals"}</span>
                            {upcomingCount > 0 && (
                              <span className="text-[11px] bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-200 px-2 py-0.5 rounded font-black border border-blue-300 dark:border-blue-800 ml-1">
                                {upcomingCount} upcoming
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Arrival Records List (Sorted chronologically) */}
                        <div className="p-3 space-y-2 flex-1">
                          {venueArrivals.length === 0 ? (
                            /* Empty State: Compact */
                            <div className="py-6 text-center text-xs text-slate-500 dark:text-slate-400 font-bold">
                              No arrivals scheduled.
                            </div>
                          ) : (
                            venueArrivals.map((arrival) => {
                              const isNext = nextArrival?.id === arrival.id;
                              const isDelayed = arrival.status === "DELAYED";

                              return (
                                <div
                                  key={arrival.id}
                                  onClick={() => setDetailModalArrival(arrival)}
                                  className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer group flex items-start justify-between gap-3 ${
                                    isNext
                                      ? "bg-orange-50/80 dark:bg-orange-950/30 border-[#F95700] ring-2 ring-[#F95700]/30 shadow-md"
                                      : "bg-white dark:bg-[#0E172E] border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-600 hover:shadow-md"
                                  }`}
                                >
                                  {/* Left: Time + University Name */}
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center space-x-2 mb-1.5">
                                      {/* Arrival Time */}
                                      <div className="font-mono text-sm font-black text-slate-900 dark:text-white flex items-center space-x-1.5">
                                        <Clock className="w-4 h-4 text-[#F95700] shrink-0" strokeWidth={2.5} />
                                        {isDelayed && arrival.updatedTime ? (
                                          <div className="flex items-center space-x-1.5">
                                            <span className="line-through text-slate-400 text-xs font-semibold">
                                              {arrival.originalTime || arrival.scheduledTime}
                                            </span>
                                            <span className="text-[#F95700] font-black">
                                              {arrival.updatedTime}
                                            </span>
                                          </div>
                                        ) : (
                                          <span>{arrival.scheduledTime}</span>
                                        )}
                                      </div>

                                      {/* Next Badge */}
                                      {isNext && (
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black bg-[#F95700] text-white tracking-wider shadow-sm">
                                          NEXT
                                        </span>
                                      )}
                                    </div>

                                    {/* University Name */}
                                    <h3 className="font-black text-sm lg:text-base text-slate-900 dark:text-white group-hover:text-[#F95700] transition-colors leading-snug truncate">
                                      {arrival.universityName}
                                    </h3>

                                    {/* Delay Reason Note if Delayed */}
                                    {isDelayed && arrival.delayReason && (
                                      <div className="mt-1 text-xs text-amber-700 dark:text-amber-300 font-bold flex items-center space-x-1">
                                        <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" strokeWidth={2.5} />
                                        <span>
                                          Delay: {arrival.delayReason}
                                          {arrival.delayNote ? ` (${arrival.delayNote})` : ""}
                                        </span>
                                      </div>
                                    )}

                                    {/* Contact preview */}
                                    {arrival.contactPerson && (
                                      <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                                        Contact: {arrival.contactPerson}{" "}
                                        {arrival.contactPhone ? `• ${arrival.contactPhone}` : ""}
                                      </div>
                                    )}
                                  </div>

                                  {/* Right: Status Badge */}
                                  <div className="shrink-0 flex flex-col items-end space-y-1">
                                    {renderStatusBadge(arrival.status, false)}
                                    <span className="text-[10px] font-bold text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity print:hidden">
                                      Manage →
                                    </span>
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </section>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {/* ─────────────────────────────────────────────────────────────────────────── */}
          {/* TAB 2: ALL ARRIVALS TABLE VIEW                                              */}
          {/* ─────────────────────────────────────────────────────────────────────────── */}
          {activeNav === "arrivals" && (
            <div className="rounded-xl bg-white dark:bg-[#0B152E] border-2 border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="p-4 border-b-2 border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h2 className="font-black text-base text-slate-900 dark:text-white">
                    Complete Arrivals Schedule
                  </h2>
                  <p className="text-xs text-slate-600 dark:text-slate-300 font-semibold">
                    All universities arriving on {formattedDateLabel} ({arrivals.length} total)
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleExportCsv}
                  className="px-3.5 py-2 rounded-xl bg-[#F95700] text-white text-xs font-bold hover:bg-[#e04e00] flex items-center space-x-1.5 shadow-md"
                >
                  <Download className="w-4 h-4 text-white" strokeWidth={2.5} />
                  <span>Download Table</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 dark:bg-[#0E172E] text-slate-700 dark:text-slate-300 font-black text-xs uppercase border-b-2 border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="px-4 py-3">Arrival Time</th>
                      <th className="px-4 py-3">University Name</th>
                      <th className="px-4 py-3">Venue</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Contact</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {arrivals.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-xs font-bold text-slate-500 dark:text-slate-400">
                          No transportation data available
                        </td>
                      </tr>
                    ) : (
                      arrivals.map((arrival) => (
                      <tr
                        key={arrival.id}
                        className="hover:bg-slate-50 dark:hover:bg-[#0E172E]/80 transition-colors"
                      >
                        <td className="px-4 py-3 font-mono font-black whitespace-nowrap text-slate-900 dark:text-slate-100">
                          {arrival.updatedTime || arrival.scheduledTime}
                        </td>
                        <td className="px-4 py-3 font-black text-slate-900 dark:text-white">
                          {arrival.universityName}
                        </td>
                        <td className="px-4 py-3 text-xs font-semibold text-slate-700 dark:text-slate-300">
                          {arrival.venue}
                        </td>
                        <td className="px-4 py-3">{renderStatusBadge(arrival.status)}</td>
                        <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-400 font-medium">
                          {arrival.contactPerson || "—"}
                          {arrival.contactPhone && <div className="text-[10px] font-mono">{arrival.contactPhone}</div>}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            type="button"
                            onClick={() => setDetailModalArrival(arrival)}
                            className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-[#F95700] hover:text-white text-xs font-bold transition-colors"
                          >
                            Manage
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────────────────── */}
          {/* TAB 3: ISSUES & OPERATIONAL ALERTS                                          */}
          {/* ─────────────────────────────────────────────────────────────────────────── */}
          {activeNav === "issues" && (
            <div className="space-y-6">
              <div className="rounded-xl bg-white dark:bg-[#0B152E] border-2 border-slate-200 dark:border-slate-800 p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="font-black text-base text-slate-900 dark:text-white flex items-center space-x-2">
                      <AlertCircle className="w-5 h-5 text-[#F95700]" strokeWidth={2.5} />
                      <span>Operational Alert Feed</span>
                    </h2>
                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                      Real-time arrival confirmations, delays, and field issues.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => fetchArrivals(true)}
                    className="text-xs font-black text-[#F95700] hover:underline"
                  >
                    Refresh Feed
                  </button>
                </div>

                <div className="divide-y divide-slate-200 dark:divide-slate-800 space-y-2">
                  {operationalAlerts.length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-500 font-bold">
                      No operational alerts recorded for today.
                    </div>
                  ) : (
                    operationalAlerts.map((alert) => (
                      <div key={alert.id} className="pt-3 pb-2 flex items-start space-x-3 text-sm">
                        <div className="w-2.5 h-2.5 rounded-full bg-[#F95700] mt-1.5 shrink-0" />
                        <div className="flex-1">
                          <div className="font-black text-slate-900 dark:text-white">{alert.title}</div>
                          <div className="text-slate-700 dark:text-slate-300 text-xs mt-0.5 font-medium">{alert.message}</div>
                          <div className="text-[10px] text-slate-500 font-mono font-bold mt-1">{alert.timestamp}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────────────────── */}
          {/* TAB 4: SETTINGS                                                             */}
          {/* ─────────────────────────────────────────────────────────────────────────── */}
          {activeNav === "settings" && (
            <div className="max-w-2xl rounded-xl bg-white dark:bg-[#0B152E] border-2 border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
              <div>
                <h2 className="font-black text-lg text-slate-900 dark:text-white mb-1">
                  Transport Dashboard Settings
                </h2>
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                  Configure display preferences and operational refresh intervals.
                </p>
              </div>

              {/* Theme Settings */}
              <div className="pt-4 border-t-2 border-slate-200 dark:border-slate-800">
                <label className="block text-sm font-black text-slate-900 dark:text-white mb-2">
                  Dashboard Theme
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => handleThemeChange("light")}
                    className={`p-3 rounded-xl border-2 text-xs font-black flex items-center justify-center space-x-2 ${
                      theme === "light"
                        ? "border-[#F95700] bg-orange-50 dark:bg-orange-950/40 text-[#F95700]"
                        : "border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0E172E] text-slate-900 dark:text-slate-200"
                    }`}
                  >
                    <Sun className="w-4 h-4 text-amber-500" strokeWidth={2.5} />
                    <span>Light Mode</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleThemeChange("dark")}
                    className={`p-3 rounded-xl border-2 text-xs font-black flex items-center justify-center space-x-2 ${
                      theme === "dark"
                        ? "border-[#F95700] bg-orange-50 dark:bg-orange-950/40 text-[#F95700]"
                        : "border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0E172E] text-slate-900 dark:text-slate-200"
                    }`}
                  >
                    <Moon className="w-4 h-4 text-indigo-400" strokeWidth={2.5} />
                    <span>Dark Mode</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleThemeChange("system")}
                    className={`p-3 rounded-xl border-2 text-xs font-black flex items-center justify-center space-x-2 ${
                      theme === "system"
                        ? "border-[#F95700] bg-orange-50 dark:bg-orange-950/40 text-[#F95700]"
                        : "border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0E172E] text-slate-900 dark:text-slate-200"
                    }`}
                  >
                    <Monitor className="w-4 h-4 text-slate-600 dark:text-slate-300" strokeWidth={2.5} />
                    <span>System</span>
                  </button>
                </div>
              </div>

              {/* Auto Refresh Setting */}
              <div className="pt-4 border-t-2 border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-sm font-black text-slate-900 dark:text-white">
                    Live Auto-Refresh
                  </div>
                  <div className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                    Automatically poll latest university arrival timestamps.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setAutoRefreshEnabled(!autoRefreshEnabled)}
                  className={`w-12 h-6 rounded-full transition-colors relative ${
                    autoRefreshEnabled ? "bg-[#F95700]" : "bg-slate-300 dark:bg-slate-700"
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${
                      autoRefreshEnabled ? "translate-x-6" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>

              {/* Official 8 Hubballi Venues Reference */}
              <div className="pt-4 border-t-2 border-slate-200 dark:border-slate-800">
                <div className="text-sm font-black text-slate-900 dark:text-white mb-2">
                  Configured Arrival Venues (Fixed 8 Groups)
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {ARRIVAL_VENUES.map((v, i) => (
                    <div
                      key={v}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-[#0E172E] border-2 border-slate-200 dark:border-slate-800 font-bold flex items-center space-x-2.5"
                    >
                      <span className="w-6 h-6 rounded-lg bg-[#F95700] text-white flex items-center justify-center font-black text-[11px] shadow-sm">
                        {i + 1}
                      </span>
                      <span>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ─────────────────────────────────────────────────────────────────────────── */}
      {/* 6. ARRIVAL DETAIL MODAL / DRAWER                                            */}
      {/* ─────────────────────────────────────────────────────────────────────────── */}
      {detailModalArrival && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in print:hidden">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-[#0B152E] border-2 border-slate-300 dark:border-slate-700 shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-50 dark:bg-[#0E172E] border-b-2 border-slate-200 dark:border-slate-800 flex items-start justify-between">
              <div>
                <span className="text-[11px] font-black uppercase tracking-wider text-[#F95700]">
                  Arrival Details
                </span>
                <h3 className="text-lg font-black text-slate-900 dark:text-white leading-snug">
                  {detailModalArrival.universityName}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setDetailModalArrival(null)}
                className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" strokeWidth={2.5} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0E172E] border-2 border-slate-200 dark:border-slate-800">
                  <div className="text-[11px] font-black text-slate-500 uppercase">Arrival Time</div>
                  <div className="text-base font-black font-mono text-slate-900 dark:text-white mt-0.5">
                    {detailModalArrival.updatedTime || detailModalArrival.scheduledTime}
                  </div>
                  {detailModalArrival.updatedTime && (
                    <div className="text-[10px] text-slate-500 font-bold">
                      Original: {detailModalArrival.scheduledTime}
                    </div>
                  )}
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0E172E] border-2 border-slate-200 dark:border-slate-800">
                  <div className="text-[11px] font-black text-slate-500 uppercase">Arrival Status</div>
                  <div className="mt-1">{renderStatusBadge(detailModalArrival.status)}</div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0E172E] border-2 border-slate-200 dark:border-slate-800">
                <div className="text-[11px] font-black text-slate-500 uppercase">Arrival Venue</div>
                <div className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center space-x-2 mt-0.5">
                  <MapPin className="w-4 h-4 text-[#F95700] shrink-0" strokeWidth={2.5} />
                  <span>{detailModalArrival.venue}</span>
                </div>
              </div>

              {detailModalArrival.contactPerson && (
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0E172E] border-2 border-slate-200 dark:border-slate-800 text-xs">
                  <div className="text-[11px] font-black text-slate-500 uppercase mb-1">
                    Contingent Contact
                  </div>
                  <div className="font-extrabold text-slate-900 dark:text-slate-100">
                    {detailModalArrival.contactPerson}
                  </div>
                  {detailModalArrival.contactPhone && (
                    <div className="text-slate-600 dark:text-slate-300 font-mono font-bold mt-0.5">
                      {detailModalArrival.contactPhone}
                    </div>
                  )}
                </div>
              )}

              {/* Delay Details if status is DELAYED */}
              {detailModalArrival.status === "DELAYED" && (
                <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-300 dark:border-amber-800 text-xs text-amber-950 dark:text-amber-200">
                  <div className="font-black flex items-center space-x-1.5 mb-1 text-amber-600 dark:text-amber-400">
                    <AlertTriangle className="w-4 h-4" strokeWidth={2.5} />
                    <span>Delay Information</span>
                  </div>
                  <div className="font-semibold">Reason: {detailModalArrival.delayReason || "Traffic"}</div>
                  {detailModalArrival.delayNote && <div className="mt-0.5">Note: {detailModalArrival.delayNote}</div>}
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="px-6 py-4 bg-slate-50 dark:bg-[#0E172E] border-t-2 border-slate-200 dark:border-slate-800 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleMarkArrived(detailModalArrival)}
                disabled={detailModalArrival.status === "ARRIVED"}
                className={`w-full py-2.5 px-3.5 rounded-xl text-xs font-black transition-colors flex items-center justify-center space-x-2 ${
                  detailModalArrival.status === "ARRIVED"
                    ? "bg-slate-200 dark:bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-300 dark:border-slate-700"
                    : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-md"
                }`}
              >
                <Check className="w-4 h-4 text-white" strokeWidth={2.8} />
                <span>Mark Arrived</span>
              </button>

              <button
                type="button"
                onClick={() => openDelayModal(detailModalArrival)}
                className="w-full py-2.5 px-3.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-black transition-colors shadow-md flex items-center justify-center space-x-2"
              >
                <Clock className="w-4 h-4 text-white" strokeWidth={2.8} />
                <span>Mark Delayed</span>
              </button>

              <button
                type="button"
                onClick={() => openEditModal(detailModalArrival)}
                className="w-full py-2.5 px-3.5 rounded-xl border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0B152E] hover:border-[#F95700] text-slate-900 dark:text-white text-xs font-black transition-colors flex items-center justify-center space-x-2"
              >
                <Edit3 className="w-4 h-4 text-[#F95700]" strokeWidth={2.5} />
                <span>Edit Arrival</span>
              </button>

              <button
                type="button"
                onClick={() => openIssueModal(detailModalArrival)}
                className="w-full py-2.5 px-3.5 rounded-xl border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0B152E] hover:border-rose-500 text-slate-900 dark:text-white text-xs font-black transition-colors flex items-center justify-center space-x-2"
              >
                <AlertTriangle className="w-4 h-4 text-rose-500" strokeWidth={2.5} />
                <span>Report Issue</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────────── */}
      {/* 7. MARK DELAYED MODAL                                                       */}
      {/* ─────────────────────────────────────────────────────────────────────────── */}
      {delayModalArrival && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in print:hidden">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#0B152E] border-2 border-slate-300 dark:border-slate-700 shadow-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-black text-base text-slate-900 dark:text-white flex items-center space-x-2">
                <Clock className="w-5 h-5 text-amber-500" strokeWidth={2.5} />
                <span>Record Arrival Delay</span>
              </h3>
              <button
                type="button"
                onClick={() => setDelayModalArrival(null)}
                className="text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white p-1"
              >
                <X className="w-5 h-5" strokeWidth={2.5} />
              </button>
            </div>

            <form onSubmit={handleSubmitDelay} className="space-y-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1">
                  University
                </label>
                <div className="font-black text-sm text-slate-900 dark:text-white">
                  {delayModalArrival.universityName}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1">
                    Original Time
                  </label>
                  <div className="px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 font-mono text-sm font-black text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
                    {delayModalArrival.scheduledTime}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1">
                    Updated Arrival Time *
                  </label>
                  <input
                    type="text"
                    required
                    value={delayTimeInput}
                    onChange={(e) => setDelayTimeInput(e.target.value)}
                    placeholder="e.g. 09:00 AM"
                    className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0E172E] text-slate-900 dark:text-slate-100 font-mono text-sm font-black focus:border-[#F95700] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1">
                  Reason for Delay *
                </label>
                <select
                  value={delayReasonInput}
                  onChange={(e) => setDelayReasonInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0E172E] text-slate-900 dark:text-slate-100 text-sm font-bold focus:border-[#F95700] focus:outline-none"
                >
                  <option value="Traffic">Traffic</option>
                  <option value="Vehicle Delay">Vehicle Delay</option>
                  <option value="University Delay">University Delay</option>
                  <option value="Venue Issue">Venue Issue</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1">
                  Short Note (Optional)
                </label>
                <textarea
                  rows={2}
                  value={delayNoteInput}
                  onChange={(e) => setDelayNoteInput(e.target.value)}
                  placeholder="e.g. Bus held up near Chennamma circle"
                  className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0E172E] text-slate-900 dark:text-slate-100 text-xs font-semibold focus:border-[#F95700] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDelayModalArrival(null)}
                  className="px-4 py-2.5 rounded-xl border-2 border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingDelay}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-black transition-colors disabled:opacity-50 shadow-md"
                >
                  {isSubmittingDelay ? "Saving..." : "Confirm Delay"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────────── */}
      {/* 8. EDIT ARRIVAL & VENUE CHANGE MODAL                                       */}
      {/* ─────────────────────────────────────────────────────────────────────────── */}
      {editModalArrival && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in print:hidden">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-[#0B152E] border-2 border-slate-300 dark:border-slate-700 shadow-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-black text-base text-slate-900 dark:text-white flex items-center space-x-2">
                <Edit3 className="w-5 h-5 text-[#F95700]" strokeWidth={2.5} />
                <span>Edit Arrival / Change Venue</span>
              </h3>
              <button
                type="button"
                onClick={() => setEditModalArrival(null)}
                className="text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white p-1"
              >
                <X className="w-5 h-5" strokeWidth={2.5} />
              </button>
            </div>

            <form onSubmit={handleSubmitEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1">
                  University Name *
                </label>
                <input
                  type="text"
                  required
                  value={editUniversityName}
                  onChange={(e) => setEditUniversityName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0E172E] text-slate-900 dark:text-slate-100 text-sm font-black focus:border-[#F95700] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1">
                    Arrival Time *
                  </label>
                  <input
                    type="text"
                    required
                    value={editArrivalTime}
                    onChange={(e) => setEditArrivalTime(e.target.value)}
                    placeholder="e.g. 08:30 AM"
                    className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0E172E] text-slate-900 dark:text-slate-100 font-mono text-sm font-black focus:border-[#F95700] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1">
                    Status
                  </label>
                  <select
                    value={editArrivalStatus}
                    onChange={(e) => setEditArrivalStatus(e.target.value as ArrivalStatus)}
                    className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0E172E] text-slate-900 dark:text-slate-100 text-sm font-bold focus:border-[#F95700] focus:outline-none"
                  >
                    <option value="UPCOMING">UPCOMING</option>
                    <option value="ARRIVED">ARRIVED</option>
                    <option value="DELAYED">DELAYED</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                </div>
              </div>

              {/* Venue Dropdown (Official 8 Venues) */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1">
                  Arrival Venue (Moves to selected venue section) *
                </label>
                <select
                  value={editArrivalVenue}
                  onChange={(e) => setEditArrivalVenue(e.target.value as ArrivalVenue)}
                  className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0E172E] text-slate-900 dark:text-slate-100 text-sm font-bold focus:border-[#F95700] focus:outline-none"
                >
                  {ARRIVAL_VENUES.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1">
                    Contact Person
                  </label>
                  <input
                    type="text"
                    value={editContactPerson}
                    onChange={(e) => setEditContactPerson(e.target.value)}
                    placeholder="Coach / Manager"
                    className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0E172E] text-slate-900 dark:text-slate-100 text-xs font-semibold focus:border-[#F95700] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1">
                    Contact Phone
                  </label>
                  <input
                    type="text"
                    value={editContactPhone}
                    onChange={(e) => setEditContactPhone(e.target.value)}
                    placeholder="+91..."
                    className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0E172E] text-slate-900 dark:text-slate-100 text-xs font-mono font-bold focus:border-[#F95700] focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditModalArrival(null)}
                  className="px-4 py-2.5 rounded-xl border-2 border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingEdit}
                  className="px-5 py-2.5 rounded-xl bg-[#F95700] hover:bg-[#e04e00] text-white text-xs font-black transition-colors disabled:opacity-50 shadow-md"
                >
                  {isSubmittingEdit ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────────── */}
      {/* 9. REPORT ISSUE MODAL                                                       */}
      {/* ─────────────────────────────────────────────────────────────────────────── */}
      {issueModalArrival && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in print:hidden">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#0B152E] border-2 border-slate-300 dark:border-slate-700 shadow-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-black text-base text-slate-900 dark:text-white flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-rose-500" strokeWidth={2.5} />
                <span>Report Field Issue</span>
              </h3>
              <button
                type="button"
                onClick={() => setIssueModalArrival(null)}
                className="text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white p-1"
              >
                <X className="w-5 h-5" strokeWidth={2.5} />
              </button>
            </div>

            <form onSubmit={handleSubmitIssue} className="space-y-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1">
                  University
                </label>
                <div className="font-black text-sm text-slate-900 dark:text-white">
                  {issueModalArrival.universityName}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">{issueModalArrival.venue}</div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1">
                  Issue Category *
                </label>
                <select
                  value={issueCategoryInput}
                  onChange={(e) => setIssueCategoryInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0E172E] text-slate-900 dark:text-slate-100 text-sm font-bold focus:border-[#F95700] focus:outline-none"
                >
                  <option value="Delayed Arrival">Delayed Arrival</option>
                  <option value="Wrong Venue">Wrong Venue</option>
                  <option value="University Not Reachable">University Not Reachable</option>
                  <option value="Transport Issue">Transport Issue</option>
                  <option value="Venue Congestion">Venue Congestion</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1">
                  Operational Note *
                </label>
                <textarea
                  rows={3}
                  required
                  value={issueNoteInput}
                  onChange={(e) => setIssueNoteInput(e.target.value)}
                  placeholder="Describe the operational issue observed by transport official..."
                  className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0E172E] text-slate-900 dark:text-slate-100 text-xs font-semibold focus:border-[#F95700] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIssueModalArrival(null)}
                  className="px-4 py-2.5 rounded-xl border-2 border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingIssue}
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black transition-colors disabled:opacity-50 shadow-md"
                >
                  {isSubmittingIssue ? "Submitting..." : "Report Issue"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────────── */}
      {/* 10. PRINT LAYOUT                                                            */}
      {/* ─────────────────────────────────────────────────────────────────────────── */}
      <div className="hidden print:block p-8 bg-white text-black font-sans">
        <div className="border-b-2 border-black pb-4 mb-6">
          <div className="text-xl font-black uppercase tracking-tight">SZWBT 2026</div>
          <div className="text-2xl font-black uppercase tracking-tight">
            UNIVERSITY ARRIVAL SCHEDULE
          </div>
          <div className="text-sm font-semibold mt-1">
            Date: {formattedDateLabel} • Hubballi Transport Coordination
          </div>
        </div>

        <div className="space-y-6">
          {ARRIVAL_VENUES.map((venueName) => {
            const vArrivals = (groupedArrivals[venueName] || []).filter((a) => {
              if (selectedStatus === "ALL") return true;
              return a.status === selectedStatus;
            });

            return (
              <div key={venueName} className="break-inside-avoid">
                <div className="text-base font-black uppercase tracking-wider border-b border-black pb-1 mb-2">
                  📍 {venueName} ({vArrivals.length} arrivals)
                </div>
                {vArrivals.length === 0 ? (
                  <div className="text-xs italic text-gray-500 py-1">No arrivals scheduled.</div>
                ) : (
                  <ul className="text-sm space-y-1.5 pl-2">
                    {vArrivals.map((a) => (
                      <li key={a.id} className="flex items-center space-x-3">
                        <span className="font-mono font-bold w-20">
                          {a.updatedTime || a.scheduledTime}
                        </span>
                        <span className="font-bold flex-1">{a.universityName}</span>
                        <span className="text-xs uppercase font-semibold border border-black px-1.5 py-0.2">
                          {a.status}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
