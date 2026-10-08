"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Phone,
  Mail,
  Users,
  ShieldAlert,
  PhoneCall,
  ExternalLink,
  RefreshCw,
  Building,
  Bus,
  Home,
  Trophy,
  AlertCircle,
  MessageSquare,
  Copy,
  Check,
} from "lucide-react";
import { EscalationAuthority } from "@/lib/spoc/service";
import { formatTeamCode } from "@/lib/team/format";

export default function SpocContactsPage() {
  const [data, setData] = useState<{
    teams: any[];
    escalationAuthorities: EscalationAuthority[];
  }>({
    teams: [],
    escalationAuthorities: [],
  });

  const [loading, setLoading] = useState(true);
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

  const fetchContacts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/spoc/contacts");
      if (!res.ok) {
        if (res.status === 403) throw new Error("403 Forbidden: Access restricted to authorized SPOC.");
        throw new Error("Failed to load contacts.");
      }
      const json = await res.json();
      if (json.success) {
        setData(json);
      } else {
        throw new Error(json.error || "Failed to load contacts.");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-[#1E293B] pb-4">
        <div>
          <span className="font-pixel text-[10px] text-[#818CF8] uppercase tracking-wider block">
            COMMUNICATION &amp; ESCALATION DIRECTORY
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-wide">
            CONTINGENT &amp; AUTHORITY CONTACTS
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Immediate telephone and email directory for your 4 assigned contingents and official tournament leads.
          </p>
        </div>

        <button
          onClick={fetchContacts}
          className="p-2 bg-[#0B0F17] hover:bg-[#1E293B] text-gray-300 rounded border border-[#1E293B] transition-colors"
          title="Refresh Contacts"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-gray-400 font-pixel text-xs animate-pulse">
          LOADING DIRECTORY CONTACTS...
        </div>
      ) : error ? (
        <div className="p-6 bg-red-950/20 border border-red-500/30 text-red-400 text-xs text-center font-pixel">
          {error}
        </div>
      ) : (
        <div className="space-y-8">
          {/* ── 1. THE 4 ASSIGNED TEAMS CONTACTS ── */}
          <div className="space-y-4">
            <h2 className="font-pixel text-sm text-white tracking-wider flex items-center gap-2">
              <Users className="w-4 h-4 text-[#6366F1]" />
              MY 4 ASSIGNED CONTINGENT LEADERS
            </h2>

            {data.teams.length === 0 ? (
              <div className="p-6 bg-[#0B0F17] border border-[#1E293B] rounded text-center text-xs text-gray-500">
                No teams assigned yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.teams.map((t) => (
                  <div
                    key={t.teamId}
                    className="p-5 bg-[#0B0F17] border-2 border-[#1E293B] hover:border-[#334155] rounded shadow space-y-4"
                  >
                    <div>
                      <span className="font-pixel text-[10px] text-gray-400 uppercase tracking-wider block">
                        {formatTeamCode(t.teamCode)} • {t.state}
                      </span>
                      <h3 className="text-base font-bold text-white mt-0.5">{t.name}</h3>
                      <p className="text-xs text-gray-300">{t.institution}</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 border-t border-[#1E293B]">
                      {/* Team Manager */}
                      <div className="p-3 bg-[#07090E] border border-[#1E293B] rounded space-y-1">
                        <span className="font-pixel text-[9px] text-gray-400 block">TEAM MANAGER</span>
                        <p className="font-semibold text-white text-xs">{t.manager.name}</p>
                        {t.manager.phone ? (
                          <div className="flex items-center gap-1.5 pt-1">
                            <a
                              href={`tel:${t.manager.phone}`}
                              className="text-emerald-400 hover:underline flex items-center gap-1 font-pixel text-[11px]"
                              title={`Call ${t.manager.phone}`}
                            >
                              <PhoneCall className="w-3 h-3" />
                              <span>{t.manager.phone}</span>
                            </a>
                            <button
                              type="button"
                              onClick={() => handleCopyPhone(t.manager.phone)}
                              title={copiedPhone === t.manager.phone ? "Copied!" : `Copy number: ${t.manager.phone}`}
                              className="p-1 bg-[#1E293B] hover:bg-[#334155] text-gray-300 rounded transition-colors cursor-pointer ml-auto"
                            >
                              {copiedPhone === t.manager.phone ? (
                                <Check className="w-3 h-3 text-emerald-400" />
                              ) : (
                                <Copy className="w-3 h-3 text-gray-400" />
                              )}
                            </button>
                          </div>
                        ) : (
                          <span className="text-[10px] text-gray-500 italic block">No phone</span>
                        )}
                      </div>

                      {/* Captain */}
                      <div className="p-3 bg-[#07090E] border border-[#1E293B] rounded space-y-1">
                        <span className="font-pixel text-[9px] text-gray-400 block">TEAM CAPTAIN</span>
                        <p className="font-semibold text-white text-xs">{t.captain.name}</p>
                        {t.captain.phone ? (
                          <div className="flex items-center gap-1.5 pt-1">
                            <a
                              href={`tel:${t.captain.phone}`}
                              className="text-emerald-400 hover:underline flex items-center gap-1 font-pixel text-[11px]"
                              title={`Call ${t.captain.phone}`}
                            >
                              <PhoneCall className="w-3 h-3" />
                              <span>{t.captain.phone}</span>
                            </a>
                            <button
                              type="button"
                              onClick={() => handleCopyPhone(t.captain.phone)}
                              title={copiedPhone === t.captain.phone ? "Copied!" : `Copy number: ${t.captain.phone}`}
                              className="p-1 bg-[#1E293B] hover:bg-[#334155] text-gray-300 rounded transition-colors cursor-pointer ml-auto"
                            >
                              {copiedPhone === t.captain.phone ? (
                                <Check className="w-3 h-3 text-emerald-400" />
                              ) : (
                                <Copy className="w-3 h-3 text-gray-400" />
                              )}
                            </button>
                          </div>
                        ) : (
                          <span className="text-[10px] text-gray-500 italic block">No phone</span>
                        )}
                      </div>
                    </div>

                    {/* Full Squad Contacts Section */}
                    {t.members && t.members.length > 0 && (
                      <div className="pt-3 border-t border-[#1E293B] space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-pixel text-[10px] text-[#818CF8] uppercase tracking-wider flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            FULL SQUAD CONTACTS ({t.members.length})
                          </span>
                          <Link
                            href={`/spoc/teams/${t.teamId}?tab=contact`}
                            className="font-pixel text-[9px] text-gray-400 hover:text-white flex items-center gap-1 transition-colors"
                          >
                            <span>VIEW ALL</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </Link>
                        </div>

                        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                          {t.members.map((m: any, mIdx: number) => {
                            const phoneClean = m.phone ? m.phone.replace(/[^0-9]/g, "") : "";
                            return (
                              <div
                                key={m.id || mIdx}
                                className="p-2 bg-[#07090E] border border-[#1E293B] rounded flex items-center justify-between text-xs"
                              >
                                <div className="min-w-0 pr-2">
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-medium text-white truncate text-[11px]">{m.name}</span>
                                    <span className="text-[8px] font-pixel text-gray-400 uppercase">
                                      ({m.role || "ATHLETE"})
                                    </span>
                                  </div>
                                </div>

                                <div className="flex items-center gap-1.5 shrink-0">
                                  {m.phone ? (
                                    <>
                                      <span className="font-mono text-[10px] text-emerald-400 hidden sm:inline">
                                        {m.phone}
                                      </span>
                                      <a
                                        href={`tel:${m.phone}`}
                                        title={`Call ${m.name}`}
                                        className="p-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 rounded"
                                      >
                                        <Phone className="w-3 h-3" />
                                      </a>
                                      <button
                                        type="button"
                                        onClick={() => handleCopyPhone(m.phone)}
                                        title={copiedPhone === m.phone ? "Copied!" : `Copy number: ${m.phone}`}
                                        className="p-1 bg-[#1E293B] hover:bg-[#334155] text-gray-300 rounded border border-gray-700 transition-colors cursor-pointer"
                                      >
                                        {copiedPhone === m.phone ? (
                                          <Check className="w-3 h-3 text-emerald-400" />
                                        ) : (
                                          <Copy className="w-3 h-3 text-gray-400" />
                                        )}
                                      </button>
                                      {phoneClean && (
                                        <a
                                          href={`https://wa.me/${phoneClean}`}
                                          target="_blank"
                                          rel="noreferrer"
                                          title={`WhatsApp ${m.name}`}
                                          className="p-1 bg-[#25D366]/20 hover:bg-[#25D366]/30 text-[#25D366] border border-[#25D366]/30 rounded"
                                        >
                                          <MessageSquare className="w-3 h-3" />
                                        </a>
                                      )}
                                    </>
                                  ) : (
                                    <span className="text-[9px] text-gray-500 italic">No phone</span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── 2. OFFICIAL ESCALATION WORKFLOW DIRECTORY ── */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <h2 className="font-pixel text-sm text-white tracking-wider uppercase">
                OFFICIAL ISSUE ESCALATION CHAIN
              </h2>
            </div>

            <div className="p-4 bg-amber-500/10 border-l-4 border-amber-500 text-amber-300 text-xs">
              <p className="font-semibold">SPOC Coordination Rule:</p>
              <p className="text-amber-400/90 text-[11px] mt-0.5">
                The SPOC is the first coordination point, not the administrative authority. Do not attempt to modify registration, transport, accommodation, or match records. Escalate issues directly to the authorities listed below:
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {data.escalationAuthorities.map((auth) => (
                <div
                  key={auth.department}
                  className="p-4 bg-[#0B0F17] border-2 border-[#1E293B] hover:border-[#334155] rounded space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-1.5">
                    <span className="px-2 py-0.5 bg-[#6366F1]/20 text-[#818CF8] font-pixel text-[9px] uppercase tracking-wider rounded inline-block">
                      {auth.department} ISSUE
                    </span>
                    <h3 className="font-bold text-white text-sm">{auth.title}</h3>
                    <p className="text-[11px] text-gray-400 leading-relaxed">{auth.description}</p>
                  </div>

                  <div className="space-y-1.5 pt-3 border-t border-[#1E293B] text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-[10px]">Official Lead:</span>
                      <span className="text-white font-medium">{auth.contactName}</span>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <a
                        href={`tel:${auth.phone}`}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-pixel text-[10px] rounded flex items-center gap-1 transition-colors"
                      >
                        <Phone className="w-3 h-3" />
                        <span>{auth.phone}</span>
                      </a>

                      <a
                        href={`mailto:${auth.email}`}
                        className="px-2.5 py-1 bg-[#1E293B] hover:bg-[#334155] text-gray-300 hover:text-white font-pixel text-[10px] rounded flex items-center gap-1 transition-colors border border-gray-600"
                      >
                        <Mail className="w-3 h-3" />
                        <span>EMAIL</span>
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
