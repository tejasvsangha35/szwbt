"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Trophy,
  PhoneCall,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "@/lib/rbac/useAuth";

export default function SpocLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "/spoc", label: "DASHBOARD", icon: LayoutDashboard },
    { href: "/spoc/teams", label: "MY TEAMS", icon: Users },
    { href: "/spoc/matches", label: "MATCHES", icon: Trophy },
    { href: "/spoc/contacts", label: "CONTACTS", icon: PhoneCall },
  ];

  return (
    <div className="min-h-screen bg-[#07090E] text-[#E2E8F0] flex flex-col font-sans selection:bg-[#FF5500] selection:text-white">
      {/* ── SPOC TOP OPERATIONAL HEADER ── */}
      <header className="sticky top-0 z-50 bg-[#0B0F17]/95 backdrop-blur-md border-b-2 border-[#1E293B] shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Brand & Identity */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-400 hover:text-white border border-[#334155] rounded bg-[#07090E]"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <Link href="/spoc" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 bg-[#1E1B4B] border-2 border-[#6366F1] flex items-center justify-center text-[#818CF8] font-pixel text-xs shadow-[0_0_12px_rgba(99,102,241,0.35)] group-hover:scale-105 transition-transform">
                SPOC
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-pixel text-xs sm:text-sm text-white tracking-wider">
                    SZWBT 2026 <span className="text-[#6366F1]">//</span> SPOC PORTAL
                  </span>
                </div>
                <p className="text-[10px] text-gray-400 hidden sm:block">
                  Student Point of Contact • Primary Team Coordination Desk
                </p>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 font-pixel text-xs">
            {navLinks.map((item) => {
              const isActive =
                item.href === "/spoc"
                  ? pathname === "/spoc"
                  : pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-1.5 flex items-center gap-1.5 rounded transition-colors ${
                    isActive
                      ? "bg-[#6366F1] text-white shadow-[0_0_10px_rgba(99,102,241,0.4)]"
                      : "text-gray-400 hover:text-white hover:bg-[#1E293B]"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Status & Logout */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col items-end text-right">
              <span className="text-xs font-semibold text-white truncate max-w-[150px]">
                {user?.name || "SPOC Coordinator"}
              </span>
              <span className="text-[10px] text-[#818CF8] font-pixel">
                {user?.email || "spoc@szwbt2026.edu"}
              </span>
            </div>

            <button
              onClick={() => logout()}
              className="p-2 text-gray-400 hover:text-red-400 hover:bg-[#1E293B] rounded border border-transparent hover:border-red-500/30 transition-colors"
              title="Sign Out"
              aria-label="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[#1E293B] bg-[#0B0F17] px-4 py-3 space-y-2">
            {navLinks.map((item) => {
              const isActive =
                item.href === "/spoc"
                  ? pathname === "/spoc"
                  : pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded font-pixel text-xs ${
                    isActive
                      ? "bg-[#6366F1] text-white"
                      : "text-gray-300 hover:bg-[#1E293B]"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#1E293B] bg-[#07090E] py-4 text-center text-xs text-gray-500">
        <p>SZWBT 2026 Student Point of Contact (SPOC) System • Read-Only Operational Hub</p>
      </footer>
    </div>
  );
}
