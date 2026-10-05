"use client";

import React, { useState, useEffect, createContext, useContext } from "react";
import Link from "next/link";
import {
  Layers,
  CheckSquare,
  Calendar,
  AlertTriangle,
  Megaphone,
  User,
  Clock,
  LogOut,
  Menu,
  X,
  Wifi,
  WifiOff,
  LifeBuoy,
  ChevronDown,
  Sun,
  Moon,
  ShieldAlert,
} from "lucide-react";
import { useAuth } from "@/lib/rbac/useAuth";

export interface VolunteerThemeContextType {
  theme: "dark" | "light";
  isDark: boolean;
  toggleTheme: () => void;
}

export const VolunteerThemeContext = createContext<VolunteerThemeContextType>({
  theme: "dark",
  isDark: true,
  toggleTheme: () => {},
});

export const useVolunteerTheme = () => useContext(VolunteerThemeContext);

export function VolunteerThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("szwbt_volunteer_theme") as "dark" | "light" | null;
      if (saved === "light" || saved === "dark") {
        setTheme(saved);
      }
    } catch {
      // storage unavailable
    }
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      try {
        localStorage.setItem("szwbt_volunteer_theme", next);
      } catch {
        // storage unavailable
      }
      return next;
    });
  };

  const isDark = theme === "dark";

  return (
    <VolunteerThemeContext.Provider value={{ theme, isDark, toggleTheme }}>
      {children}
    </VolunteerThemeContext.Provider>
  );
}

export interface VolunteerPortalShellProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  shiftStatus: string;
  activeTasksCount: number;
  openIssuesCount: number;
  assignedArea?: string;
  onRefresh?: () => void;
  onRequestHelp?: () => void;
  children: React.ReactNode;
}

export const VolunteerPortalShell: React.FC<VolunteerPortalShellProps> = ({
  currentTab,
  onSelectTab,
  shiftStatus,
  activeTasksCount,
  openIssuesCount,
  assignedArea,
  onRefresh,
  onRequestHelp,
  children,
}) => {
  const { user, logout } = useAuth();
  const { theme, isDark, toggleTheme } = useVolunteerTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    const updateTime = () => {
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
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const isOnShift = shiftStatus === "ON_SHIFT";

  const navItems = [
    { id: "overview", label: "OVERVIEW", icon: Layers, badge: null },
    {
      id: "tasks",
      label: "TASKS",
      icon: CheckSquare,
      badge: activeTasksCount > 0 ? `${activeTasksCount}` : null,
      badgeColor: "cyan",
    },
    { id: "assignments", label: "ASSIGNMENTS", icon: Calendar, badge: null },
    {
      id: "issues",
      label: "REPORTED ISSUES",
      icon: AlertTriangle,
      badge: openIssuesCount > 0 ? `${openIssuesCount}` : null,
      badgeColor: "amber",
    },
    { id: "notifications", label: "NOTIFICATIONS", icon: Megaphone, badge: null },
    { id: "profile", label: "MY PROFILE", icon: User, badge: null },
  ];

  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-colors duration-200 selection:bg-orange-500 selection:text-white ${
        isDark
          ? "bg-[#060b14] text-slate-100"
          : "bg-[#f8fafc] text-slate-900"
      }`}
    >
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* TOP VOLUNTEER OPERATIONS HUD (HEADER) */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <header
          className={`sticky top-0 z-50 px-3 sm:px-6 py-2.5 flex items-center justify-between border-b transition-colors ${
            isDark
              ? "bg-[#0b1322]/95 backdrop-blur-md border-slate-800 shadow-lg"
              : "bg-white/95 backdrop-blur-md border-slate-200 shadow-xs"
          }`}
        >
          {/* Left: Mobile Toggle & Operations Branding */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className={`md:hidden p-2 rounded-lg border transition-colors ${
                isDark
                  ? "bg-[#111d33] border-slate-800 text-slate-300 hover:text-orange-400"
                  : "bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900"
              }`}
              aria-label="Toggle navigation"
            >
              {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>

            <Link href="/volunteer" className="flex items-center gap-2.5 group">
              <div
                className={`w-9 h-9 rounded-lg border flex items-center justify-center font-pixel text-xs font-bold transition-all shadow-2xs group-hover:scale-105 ${
                  isDark
                    ? "bg-[#111d33] border-orange-500/40 text-orange-400 shadow-orange-500/10"
                    : "bg-orange-50 border-orange-200 text-orange-600"
                }`}
              >
                VLT
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span
                    className={`font-pixel text-[11px] sm:text-xs tracking-wider ${
                      isDark ? "text-slate-100" : "text-slate-900"
                    }`}
                  >
                    SOUTH ZONE 2026
                  </span>
                  <span className="text-[10px] text-cyan-500 font-mono hidden sm:inline-block font-bold">
                    [FIELD OPS]
                  </span>
                </div>
                <p className="font-pixel text-[9px] sm:text-[10px] text-orange-500 tracking-wider uppercase font-medium">
                  VOLUNTEER OPERATIONS PORTAL
                </p>
              </div>
            </Link>
          </div>

          {/* Center: Live Field Status & Telemetry (Desktop) */}
          <div
            className={`hidden lg:flex items-center gap-3.5 px-3.5 py-1.5 rounded-xl border text-xs font-mono transition-colors ${
              isDark
                ? "bg-[#111d33] border-slate-800/80 text-slate-300"
                : "bg-slate-50 border-slate-200 text-slate-700"
            }`}
          >
            <div className="flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  isOnShift ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
                }`}
              />
              <span
                className={`font-pixel text-[10px] tracking-wider font-bold ${
                  isOnShift
                    ? "text-emerald-500"
                    : isDark
                    ? "text-slate-400"
                    : "text-slate-500"
                }`}
              >
                {isOnShift ? "● ON SHIFT" : "○ OFF SHIFT"}
              </span>
            </div>

            <div className={`h-3 w-px ${isDark ? "bg-slate-700" : "bg-slate-300"}`} />

            <div className="flex items-center gap-1.5 truncate max-w-[200px]">
              <span className={`text-[10px] uppercase font-bold ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                AREA:
              </span>
              <span className={`truncate text-xs ${isDark ? "text-slate-200" : "text-slate-800"}`}>
                {assignedArea || "Court Operations"}
              </span>
            </div>

            <div className={`h-3 w-px ${isDark ? "bg-slate-700" : "bg-slate-300"}`} />

            <div className="flex items-center gap-1.5 text-[11px] font-mono font-medium">
              <Clock className="w-3.5 h-3.5 text-orange-500 shrink-0" />
              <span className={isDark ? "text-slate-200" : "text-slate-800"}>
                {currentTime || "10:00:00 IST"}
              </span>
            </div>
          </div>

          {/* Right: Quick Help, Network Status, Theme Toggle & Operator Profile */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className={`p-2 sm:px-2.5 sm:py-1.5 rounded-lg border text-xs font-mono flex items-center gap-1.5 cursor-pointer transition-colors ${
                isDark
                  ? "bg-[#111d33] border-slate-800 hover:border-slate-700 text-slate-300 hover:text-amber-400"
                  : "bg-slate-100 border-slate-200 hover:border-slate-300 text-slate-700 hover:text-orange-600"
              }`}
              title={isDark ? "Switch to Light Theme" : "Switch to Dark Command Theme"}
              aria-label="Toggle theme"
            >
              {isDark ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline text-[11px] font-pixel">LIGHT</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-slate-700" />
                  <span className="hidden sm:inline text-[11px] font-pixel">DARK</span>
                </>
              )}
            </button>

            {/* REQUEST HELP Quick Action */}
            {onRequestHelp && (
              <button
                onClick={onRequestHelp}
                className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 font-pixel text-[10px] tracking-wider rounded-lg border transition-colors cursor-pointer ${
                  isDark
                    ? "bg-red-500/15 hover:bg-red-500/25 border-red-500/40 text-red-400 hover:text-red-300"
                    : "bg-red-50 hover:bg-red-100 border-red-200 text-red-700 hover:text-red-800"
                }`}
              >
                <LifeBuoy className="w-3.5 h-3.5 animate-pulse" />
                <span className="hidden sm:inline">REQUEST HELP</span>
              </button>
            )}

            {/* Network Connection Status */}
            <div
              className={`hidden sm:flex items-center gap-1 text-[11px] font-mono px-2 py-1 rounded-lg border ${
                isOnline
                  ? isDark
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                    : "bg-emerald-50 border-emerald-200 text-emerald-700"
                  : isDark
                  ? "bg-red-500/10 border-red-500/30 text-red-400"
                  : "bg-red-50 border-red-200 text-red-700"
              }`}
            >
              {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
              <span className="hidden md:inline font-bold">{isOnline ? "ONLINE" : "OFFLINE"}</span>
            </div>

            {/* Operator Identity Pill & Dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className={`flex items-center gap-2 p-1 sm:px-2.5 sm:py-1 rounded-lg border text-left transition-colors cursor-pointer ${
                  isDark
                    ? "bg-[#111d33] border-slate-800 hover:border-slate-700"
                    : "bg-slate-50 border-slate-200 hover:border-slate-300"
                }`}
                aria-label="User profile options"
              >
                <div
                  className={`w-7 h-7 rounded-md border flex items-center justify-center font-pixel text-[10px] font-bold ${
                    isDark
                      ? "bg-orange-500/20 border-orange-500/50 text-orange-400"
                      : "bg-orange-100 border-orange-200 text-orange-700"
                  }`}
                >
                  {user?.name ? user.name.slice(0, 2).toUpperCase() : "AR"}
                </div>
                <div className="hidden md:block">
                  <p
                    className={`text-xs font-bold leading-tight truncate max-w-[120px] ${
                      isDark ? "text-slate-100" : "text-slate-900"
                    }`}
                  >
                    {user?.name || "Arena Field Volunteer"}
                  </p>
                  <p className="text-[10px] text-orange-500 font-mono leading-none font-bold">
                    {user?.badge || "MOBILE FIELD"}
                  </p>
                </div>
                <ChevronDown
                  className={`w-3.5 h-3.5 hidden md:block ${
                    isDark ? "text-slate-400" : "text-slate-500"
                  }`}
                />
              </button>

              {profileMenuOpen && (
                <div
                  className={`absolute right-0 mt-2 w-56 rounded-xl border p-2 z-50 shadow-2xl animate-in fade-in slide-in-from-top-2 ${
                    isDark
                      ? "bg-[#0b1322] border-slate-800 text-slate-100"
                      : "bg-white border-slate-200 text-slate-900"
                  }`}
                >
                  <div className={`p-2 border-b ${isDark ? "border-slate-800" : "border-slate-100"}`}>
                    <p className="font-pixel text-[11px] font-bold truncate">
                      {user?.name || "Arena Field Volunteer"}
                    </p>
                    <p
                      className={`font-mono text-[10px] truncate ${
                        isDark ? "text-slate-400" : "text-slate-500"
                      }`}
                    >
                      {user?.email || "volunteer@szwbt2026.edu"}
                    </p>
                    <div className="mt-1.5">
                      <span className="inline-block px-2 py-0.5 rounded text-[9px] font-pixel font-bold bg-orange-500/15 text-orange-500 border border-orange-500/30">
                        VOLUNTEER CLEARANCE
                      </span>
                    </div>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => {
                        onSelectTab("profile");
                        setProfileMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-2 px-3 py-1.5 text-xs rounded-lg text-left transition-colors cursor-pointer ${
                        isDark
                          ? "text-slate-300 hover:text-white hover:bg-[#111d33]"
                          : "text-slate-700 hover:text-slate-900 hover:bg-slate-100"
                      }`}
                    >
                      <User className="w-3.5 h-3.5 text-cyan-500" />
                      <span>My Profile</span>
                    </button>
                  </div>

                  <div className={`border-t pt-1 ${isDark ? "border-slate-800" : "border-slate-100"}`}>
                    <button
                      onClick={() => logout()}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-red-500 hover:bg-red-500/10 rounded-lg text-left transition-colors cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* WORKSPACE: SIDEBAR + MAIN CONTENT */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <div className="flex-1 flex overflow-hidden">
          {/* DESKTOP SIDEBAR */}
          <aside
            className={`
              fixed md:static inset-y-0 left-0 z-40 w-64 border-r flex flex-col 
              transform transition-all duration-200 ease-in-out shrink-0
              ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
              ${isDark ? "bg-[#0b1322] border-slate-800" : "bg-white border-slate-200"}
            `}
          >
            {/* Shift Status Banner at top of sidebar */}
            <div
              className={`p-3 border-b flex items-center justify-between ${
                isDark ? "bg-[#111d33] border-slate-800" : "bg-slate-50 border-slate-200"
              }`}
            >
              <span className="font-pixel text-[10px] text-cyan-500 tracking-wider font-bold">
                FIELD DEPLOYMENT
              </span>
              <span
                className={`font-mono text-[10px] px-2 py-0.5 rounded-full font-bold border ${
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

            {/* Navigation Items */}
            <nav className="flex-1 overflow-y-auto p-2.5 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onSelectTab(item.id);
                      setSidebarOpen(false);
                    }}
                    className={`
                      w-full flex items-center justify-between px-3 py-2.5 text-xs font-pixel tracking-wider
                      rounded-xl transition-all text-left cursor-pointer
                      ${
                        isActive
                          ? isDark
                            ? "bg-orange-500/15 border-l-2 border-orange-500 text-orange-400 font-bold"
                            : "bg-orange-50 border-l-2 border-orange-500 text-orange-600 font-bold shadow-2xs"
                          : isDark
                          ? "text-slate-400 hover:text-slate-100 hover:bg-[#111d33]"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                      }
                    `}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon
                        className={`w-4 h-4 shrink-0 ${
                          isActive
                            ? "text-orange-500"
                            : isDark
                            ? "text-slate-400"
                            : "text-slate-500"
                        }`}
                      />
                      <span className="text-[11px]">{item.label}</span>
                    </div>

                    {item.badge && (
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                          item.badgeColor === "cyan"
                            ? isDark
                              ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/30"
                              : "bg-cyan-50 text-cyan-700 border border-cyan-200"
                            : isDark
                            ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Sidebar Footer Metadata (Non-competing, subtle) */}
            <div
              className={`p-3.5 border-t text-[10px] font-mono ${
                isDark ? "bg-[#111d33] border-slate-800 text-slate-400" : "bg-slate-50 border-slate-200 text-slate-500"
              }`}
            >
              <div className="flex justify-between items-center">
                <span className="font-bold">ROLE:</span>
                <span className={`font-semibold ${isDark ? "text-slate-200" : "text-slate-800"}`}>
                  VOLUNTEER
                </span>
              </div>
              <div className="flex justify-between items-center mt-1.5">
                <span className="font-bold">LOCATION:</span>
                <span className="text-orange-500 truncate max-w-[130px] font-semibold">
                  {assignedArea || "KLE Tech Arena"}
                </span>
              </div>
            </div>
          </aside>

          {/* Mobile Backdrop */}
          {sidebarOpen && (
            <div
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black/60 z-30 md:hidden backdrop-blur-xs"
            />
          )}

          {/* MAIN VIEWPORT */}
          <main
            className={`flex-1 overflow-y-auto pb-20 md:pb-8 p-3 sm:p-6 transition-colors ${
              isDark ? "bg-[#060b14]" : "bg-[#f8fafc]"
            }`}
          >
            {children}
          </main>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* MOBILE BOTTOM NAVIGATION BAR */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <nav
          className={`md:hidden fixed bottom-0 left-0 right-0 z-50 border-t px-2 py-1.5 flex items-center justify-around shadow-2xl transition-colors ${
            isDark ? "bg-[#0b1322] border-slate-800 text-slate-300" : "bg-white border-slate-200 text-slate-700"
          }`}
        >
          <button
            onClick={() => onSelectTab("overview")}
            className={`flex flex-col items-center p-1.5 text-[9px] font-pixel ${
              currentTab === "overview" ? "text-orange-500 font-bold" : isDark ? "text-slate-400" : "text-slate-500"
            }`}
          >
            <Layers className="w-4 h-4 mb-0.5" />
            <span>HOME</span>
          </button>

          <button
            onClick={() => onSelectTab("tasks")}
            className={`flex flex-col items-center p-1.5 text-[9px] font-pixel relative ${
              currentTab === "tasks" ? "text-orange-500 font-bold" : isDark ? "text-slate-400" : "text-slate-500"
            }`}
          >
            <CheckSquare className="w-4 h-4 mb-0.5" />
            <span>TASKS</span>
            {activeTasksCount > 0 && (
              <span className="absolute top-0 right-1 w-2 h-2 bg-cyan-500 rounded-full" />
            )}
          </button>

          <button
            onClick={() => onSelectTab("issues")}
            className={`flex flex-col items-center p-1.5 text-[9px] font-pixel relative ${
              currentTab === "issues" ? "text-orange-500 font-bold" : isDark ? "text-slate-400" : "text-slate-500"
            }`}
          >
            <AlertTriangle className="w-4 h-4 mb-0.5" />
            <span>ISSUES</span>
            {openIssuesCount > 0 && (
              <span className="absolute top-0 right-1 w-2 h-2 bg-amber-500 rounded-full" />
            )}
          </button>

          <button
            onClick={() => onSelectTab("assignments")}
            className={`flex flex-col items-center p-1.5 text-[9px] font-pixel ${
              currentTab === "assignments" ? "text-orange-500 font-bold" : isDark ? "text-slate-400" : "text-slate-500"
            }`}
          >
            <Calendar className="w-4 h-4 mb-0.5" />
            <span>SHIFTS</span>
          </button>

          <button
            onClick={() => onSelectTab("profile")}
            className={`flex flex-col items-center p-1.5 text-[9px] font-pixel ${
              currentTab === "profile" ? "text-orange-500 font-bold" : isDark ? "text-slate-400" : "text-slate-500"
            }`}
          >
            <User className="w-4 h-4 mb-0.5" />
            <span>ME</span>
          </button>
        </nav>
      </div>
  );
};
