"use client";

import React, { useState, useEffect, useCallback } from "react";
import { SystemAdminShell } from "@/components/system/SystemAdminShell";
import {
  Users,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Search,
  Shield,
  Layers,
  X,
  Phone,
  Mail,
  RefreshCw,
  Edit2,
  Trash2,
} from "lucide-react";

interface TeamItem {
  id: string;
  teamCode: string;
  name: string;
  institution: string;
  state: string;
  status: string;
  spocAssignment?: {
    spoc?: {
      id: string;
      name: string;
      email: string;
    };
  } | null;
}

interface SpocUser {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  badge: string;
  isActive: boolean;
  assignedTeamsCount: number;
  isComplete: boolean;
  status: "COMPLETE" | "INCOMPLETE";
  statusText: string;
  assignedTeams: TeamItem[];
}

export default function AdminSpocsPage() {
  const [spocs, setSpocs] = useState<SpocUser[]>([]);
  const [allTeams, setAllTeams] = useState<TeamItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "COMPLETE" | "INCOMPLETE">("ALL");

  // Manage 4 Teams Modal State
  const [editModalSpoc, setEditModalSpoc] = useState<SpocUser | null>(null);
  const [selectedTeamIds, setSelectedTeamIds] = useState<string[]>([]);
  const [savingAssignments, setSavingAssignments] = useState(false);
  const [assignmentError, setAssignmentError] = useState<string | null>(null);

  // Create SPOC Modal State
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newSpocName, setNewSpocName] = useState("");
  const [newSpocEmail, setNewSpocEmail] = useState("");
  const [newSpocPhone, setNewSpocPhone] = useState("");
  const [newSpocBadge, setNewSpocBadge] = useState("STUDENT POINT OF CONTACT");
  const [newSpocTeamIds, setNewSpocTeamIds] = useState<string[]>([]);
  const [creatingSpoc, setCreatingSpoc] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const fetchSpocs = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/spocs");
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setSpocs(data.spocs || []);
          setAllTeams(data.teams || []);
        }
      }
    } catch (err) {
      console.error("Failed to load SPOCs:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSpocs();
  }, [fetchSpocs]);

  // Open Edit Modal
  const openEditModal = (spoc: SpocUser) => {
    setEditModalSpoc(spoc);
    setSelectedTeamIds(spoc.assignedTeams.map((t) => t.id));
    setAssignmentError(null);
  };

  // Save Team Assignments
  const handleSaveAssignments = async () => {
    if (!editModalSpoc) return;
    if (selectedTeamIds.length > 20) {
      setAssignmentError("A SPOC cannot be assigned more than 20 teams.");
      return;
    }

    try {
      setSavingAssignments(true);
      setAssignmentError(null);

      const res = await fetch("/api/admin/spocs", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          spocId: editModalSpoc.id,
          teamIds: selectedTeamIds,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update assignments.");
      }

      setEditModalSpoc(null);
      await fetchSpocs();
    } catch (err: any) {
      setAssignmentError(err.message);
    } finally {
      setSavingAssignments(false);
    }
  };

  // Create New SPOC
  const handleCreateSpoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSpocName.trim() || !newSpocEmail.trim()) {
      setCreateError("Name and email are required.");
      return;
    }
    if (newSpocTeamIds.length > 20) {
      setCreateError("Cannot assign more than 20 teams.");
      return;
    }

    try {
      setCreatingSpoc(true);
      setCreateError(null);

      const res = await fetch("/api/admin/spocs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newSpocName.trim(),
          email: newSpocEmail.trim(),
          phone: newSpocPhone.trim() || undefined,
          badge: newSpocBadge,
          teamIds: newSpocTeamIds,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to create SPOC.");
      }

      setCreateModalOpen(false);
      setNewSpocName("");
      setNewSpocEmail("");
      setNewSpocPhone("");
      setNewSpocTeamIds([]);
      await fetchSpocs();
    } catch (err: any) {
      setCreateError(err.message);
    } finally {
      setCreatingSpoc(false);
    }
  };

  // Filtered SPOC list
  const filteredSpocs = spocs.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase()) ||
      s.assignedTeams.some(
        (t) =>
          t.name.toLowerCase().includes(search.toLowerCase()) ||
          t.institution.toLowerCase().includes(search.toLowerCase())
      );
    const matchesStatus =
      statusFilter === "ALL" ||
      (statusFilter === "COMPLETE" && s.isComplete) ||
      (statusFilter === "INCOMPLETE" && !s.isComplete);
    return matchesSearch && matchesStatus;
  });

  const completeCount = spocs.filter((s) => s.isComplete).length;
  const incompleteCount = spocs.filter((s) => !s.isComplete).length;
  const totalAssignedTeams = spocs.reduce((acc, s) => acc + s.assignedTeamsCount, 0);
  const unassignedTeamsCount = allTeams.filter((t) => !t.spocAssignment).length;

  return (
    <SystemAdminShell onRefresh={fetchSpocs}>
      <div className="space-y-6">
        {/* TOP HEADER */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-[#18D8D0]/30 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#FF5500]/10 border-2 border-[#FF5500] flex items-center justify-center text-[#FF5500] shadow-[0_0_12px_rgba(255,85,0,0.3)]">
              <Users className="w-5 h-5 text-[#FF5500]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-pixel text-[10px] text-[#FF5500] uppercase tracking-widest">
                  COORDINATION ARCHITECTURE
                </span>
                <span className="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 font-pixel text-[8px] uppercase">
                  ACTIVE REGISTRY
                </span>
              </div>
              <h1 className="font-pixel text-lg sm:text-xl text-white tracking-wider">
                SPOC TEAM ASSIGNMENT MATRIX
              </h1>
              <p className="text-xs text-gray-400">
                Manage Student Point of Contact (SPOC) profiles and enforce the strict 4-team relational allocation model.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setCreateError(null);
              setCreateModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-[#FF5500] hover:bg-[#FF6A1A] text-white font-pixel text-xs tracking-wider transition-colors shadow-[0_0_12px_rgba(255,85,0,0.4)]"
          >
            <Plus className="w-4 h-4" />
            <span>PROVISION NEW SPOC</span>
          </button>
        </div>

        {/* METRICS HUD */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 bg-[#0B0C10] border border-[#2D3748] flex flex-col justify-between">
            <span className="font-pixel text-[9px] text-gray-400 uppercase">TOTAL ACTIVE SPOCS</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="font-pixel text-xl text-white">{spocs.length}</span>
              <span className="text-[10px] text-[#18D8D0] font-pixel">REGISTERED</span>
            </div>
          </div>

          <div className="p-3 bg-[#0B0C10] border border-emerald-500/30 flex flex-col justify-between">
            <span className="font-pixel text-[9px] text-emerald-400 uppercase">FULLY ASSIGNED (4/4)</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="font-pixel text-xl text-emerald-400">{completeCount}</span>
              <span className="text-[10px] text-emerald-500 font-pixel">READY</span>
            </div>
          </div>

          <div className="p-3 bg-[#0B0C10] border border-amber-500/30 flex flex-col justify-between">
            <span className="font-pixel text-[9px] text-amber-400 uppercase">INCOMPLETE (&lt;4 TEAMS)</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="font-pixel text-xl text-amber-400">{incompleteCount}</span>
              <span className="text-[10px] text-amber-500 font-pixel">ACTION REQ</span>
            </div>
          </div>

          <div className="p-3 bg-[#0B0C10] border border-[#2D3748] flex flex-col justify-between">
            <span className="font-pixel text-[9px] text-gray-400 uppercase">UNASSIGNED TEAMS</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="font-pixel text-xl text-[#00F0FF]">{unassignedTeamsCount}</span>
              <span className="text-[10px] text-gray-400 font-pixel">AVAILABLE</span>
            </div>
          </div>
        </div>

        {/* CONTROLS (SEARCH & STATUS FILTER) */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-[#0B0C10] border border-[#2D3748]">
          <div className="flex items-center gap-2 flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by SPOC name, email, or assigned university..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent text-xs text-white placeholder-gray-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-1.5 font-pixel text-[10px]">
            <span className="text-gray-400 mr-1">STATUS:</span>
            {(["ALL", "COMPLETE", "INCOMPLETE"] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 border transition-colors ${
                  statusFilter === st
                    ? "bg-[#FF5500] text-white border-[#FF5500]"
                    : "bg-[#060608] text-gray-400 border-[#2D3748] hover:text-white"
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* SPOC CARDS LIST */}
        {loading ? (
          <div className="p-12 text-center text-gray-500 font-pixel text-xs animate-pulse">
            LOADING SPOC TEAM ALLOCATION MATRIX...
          </div>
        ) : filteredSpocs.length === 0 ? (
          <div className="p-12 text-center border-2 border-dashed border-[#2D3748] bg-[#0B0C10] space-y-3">
            <Users className="w-8 h-8 text-gray-500 mx-auto" />
            <p className="font-pixel text-xs text-gray-400">No Student Point of Contact accounts found.</p>
            <p className="text-[11px] text-gray-500">
              Provision a new SPOC above or adjust your search filter criteria.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredSpocs.map((spoc) => (
              <div
                key={spoc.id}
                className="p-4 bg-[#0B0C10] border-2 border-[#1F2430] hover:border-[#2D3748] transition-all space-y-3"
              >
                {/* SPOC Header Row */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1F2430] pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#1B0D2B] border border-[#FF5500] flex items-center justify-center font-pixel text-xs text-[#FF5500]">
                      {spoc.name[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="font-pixel text-sm text-white">{spoc.name}</h2>
                        <span className="px-1.5 py-0.5 bg-[#FF5500]/15 text-[#FF5500] font-pixel text-[8px] uppercase">
                          {spoc.badge}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-400 mt-0.5">
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3 text-gray-500" />
                          {spoc.email}
                        </span>
                        {spoc.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-gray-500" />
                            {spoc.phone}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Status Pill */}
                    <div
                      className={`px-3 py-1 font-pixel text-[10px] flex items-center gap-1.5 border ${
                        spoc.isComplete
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                          : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                      }`}
                    >
                      {spoc.isComplete ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                      )}
                      <span>{spoc.statusText}</span>
                    </div>

                    <button
                      onClick={() => openEditModal(spoc)}
                      className="flex items-center gap-1.5 px-3 py-1 bg-[#1A202C] hover:bg-[#2D3748] text-white font-pixel text-[10px] border border-[#4A5568] transition-colors"
                    >
                      <Edit2 className="w-3 h-3 text-[#FF5500]" />
                      <span>MANAGE 4 TEAMS</span>
                    </button>
                  </div>
                </div>

                {/* 4 Teams Slots Grid */}
                <div>
                  <span className="font-pixel text-[9px] text-gray-400 uppercase tracking-wider block mb-2">
                    ASSIGNED TEAMS ({spoc.assignedTeams.length} / 4)
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                    {[0, 1, 2, 3].map((slotIdx) => {
                      const team = spoc.assignedTeams[slotIdx];
                      return team ? (
                        <div
                          key={team.id}
                          className="p-2.5 bg-[#060608] border border-[#2D3748] flex flex-col justify-between space-y-1.5"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-pixel text-[9px] text-[#FF5500]">
                              SLOT {slotIdx + 1}
                            </span>
                            <span className="text-[9px] text-gray-400 font-pixel">
                              {team.teamCode}
                            </span>
                          </div>
                          <p className="text-xs font-semibold text-white truncate" title={team.name}>
                            {team.name}
                          </p>
                          <p className="text-[11px] text-gray-400 truncate" title={team.institution}>
                            {team.institution}
                          </p>
                          <div className="pt-1 flex items-center justify-between text-[10px] text-gray-500 border-t border-[#1F2430]">
                            <span>{team.state}</span>
                            <span className="text-emerald-400 font-pixel text-[8px]">
                              {team.status}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div
                          key={`empty-${slotIdx}`}
                          className="p-2.5 bg-[#060608]/50 border border-dashed border-[#2D3748] flex flex-col items-center justify-center text-center space-y-1 min-h-[90px]"
                        >
                          <span className="font-pixel text-[9px] text-gray-500">
                            SLOT {slotIdx + 1} // UNASSIGNED
                          </span>
                          <button
                            onClick={() => openEditModal(spoc)}
                            className="text-[10px] text-[#FF5500] hover:underline font-pixel"
                          >
                            + ASSIGN TEAM
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* MODAL: MANAGE 4 TEAMS ASSIGNMENT */}
        {editModalSpoc && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-2xl bg-[#0B0C10] border-2 border-[#FF5500] p-6 space-y-5 shadow-[0_0_24px_rgba(255,85,0,0.3)] max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-[#2D3748] pb-3">
                <div>
                  <span className="font-pixel text-[10px] text-[#FF5500] uppercase">
                    RELATIONAL TEAM ALLOCATION
                  </span>
                  <h2 className="font-pixel text-base text-white">
                    ASSIGN 4 TEAMS TO {editModalSpoc.name.toUpperCase()}
                  </h2>
                </div>
                <button
                  onClick={() => setEditModalSpoc(null)}
                  className="p-1 text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {assignmentError && (
                <div className="p-3 bg-red-500/10 border border-red-500 text-red-400 text-xs font-pixel flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{assignmentError}</span>
                </div>
              )}

              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400 font-pixel">
                    ALLOCATED SLOTS ({selectedTeamIds.length} / 4)
                  </span>
                  <span
                    className={`font-pixel text-[10px] ${
                      selectedTeamIds.length === 4 ? "text-emerald-400" : "text-amber-400"
                    }`}
                  >
                    {selectedTeamIds.length === 4 ? "COMPLETE" : "INCOMPLETE"}
                  </span>
                </div>

                {/* 4 Dynamic Team Dropdown Pickers */}
                {[0, 1, 2, 3].map((slotIdx) => {
                  const currentId = selectedTeamIds[slotIdx] || "";
                  return (
                    <div key={slotIdx} className="p-3 bg-[#060608] border border-[#2D3748] space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="font-pixel text-[10px] text-[#FF5500]">
                          TEAM SLOT {slotIdx + 1}
                        </label>
                        {currentId && (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedTeamIds(selectedTeamIds.filter((_, idx) => idx !== slotIdx));
                            }}
                            className="text-[10px] text-red-400 hover:underline flex items-center gap-1 font-pixel"
                          >
                            <Trash2 className="w-3 h-3" />
                            REMOVE
                          </button>
                        )}
                      </div>

                      <select
                        value={currentId}
                        onChange={(e) => {
                          const newId = e.target.value;
                          const next = [...selectedTeamIds];
                          if (newId) {
                            next[slotIdx] = newId;
                          } else {
                            next.splice(slotIdx, 1);
                          }
                          // Remove duplicates
                          const unique = Array.from(new Set(next.filter(Boolean)));
                          setSelectedTeamIds(unique);
                        }}
                        className="w-full bg-[#0B0C10] border border-[#2D3748] text-xs text-white p-2 focus:outline-none focus:border-[#FF5500]"
                      >
                        <option value="">-- SELECT TEAM FOR SLOT {slotIdx + 1} --</option>
                        {allTeams.map((team) => {
                          const assignedToOther =
                            team.spocAssignment &&
                            team.spocAssignment.spoc?.id !== editModalSpoc.id;
                          const label = `${team.name} (${team.institution}) ${
                            assignedToOther
                              ? `[Reassigns from ${team.spocAssignment?.spoc?.name}]`
                              : ""
                          }`;
                          return (
                            <option key={team.id} value={team.id}>
                              {label}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#2D3748]">
                <button
                  type="button"
                  onClick={() => setEditModalSpoc(null)}
                  className="px-4 py-2 bg-[#1A202C] hover:bg-[#2D3748] text-gray-300 font-pixel text-xs transition-colors"
                >
                  CANCEL
                </button>
                <button
                  type="button"
                  onClick={handleSaveAssignments}
                  disabled={savingAssignments}
                  className="px-5 py-2 bg-[#FF5500] hover:bg-[#FF6A1A] disabled:opacity-50 text-white font-pixel text-xs transition-colors"
                >
                  {savingAssignments ? "SAVING..." : "SAVE ASSIGNMENTS"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: PROVISION NEW SPOC */}
        {createModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <form
              onSubmit={handleCreateSpoc}
              className="w-full max-w-lg bg-[#0B0C10] border-2 border-[#FF5500] p-6 space-y-4 shadow-[0_0_24px_rgba(255,85,0,0.3)] max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-[#2D3748] pb-3">
                <div>
                  <span className="font-pixel text-[10px] text-[#FF5500] uppercase">NEW ROLE PROVISION</span>
                  <h2 className="font-pixel text-base text-white">PROVISION NEW SPOC</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="p-1 text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {createError && (
                <div className="p-3 bg-red-500/10 border border-red-500 text-red-400 text-xs font-pixel flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{createError}</span>
                </div>
              )}

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-gray-400 font-pixel text-[10px] mb-1">
                    FULL NAME *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Kumar"
                    value={newSpocName}
                    onChange={(e) => setNewSpocName(e.target.value)}
                    className="w-full bg-[#060608] border border-[#2D3748] p-2 text-white focus:outline-none focus:border-[#FF5500]"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 font-pixel text-[10px] mb-1">
                    EMAIL ADDRESS *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. spoc.rahul@szwbt2026.edu"
                    value={newSpocEmail}
                    onChange={(e) => setNewSpocEmail(e.target.value)}
                    className="w-full bg-[#060608] border border-[#2D3748] p-2 text-white focus:outline-none focus:border-[#FF5500]"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 font-pixel text-[10px] mb-1">
                    PHONE NUMBER
                  </label>
                  <input
                    type="tel"
                    placeholder="e.g. +91 94812 44556"
                    value={newSpocPhone}
                    onChange={(e) => setNewSpocPhone(e.target.value)}
                    className="w-full bg-[#060608] border border-[#2D3748] p-2 text-white focus:outline-none focus:border-[#FF5500]"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 font-pixel text-[10px] mb-1">
                    BADGE TITLE
                  </label>
                  <input
                    type="text"
                    value={newSpocBadge}
                    onChange={(e) => setNewSpocBadge(e.target.value)}
                    className="w-full bg-[#060608] border border-[#2D3748] p-2 text-white focus:outline-none focus:border-[#FF5500]"
                  />
                </div>

                <div className="p-3 bg-[#060608] border border-[#2D3748] space-y-2">
                  <span className="font-pixel text-[10px] text-[#18D8D0] block">
                    DEFAULT CREDENTIALS
                  </span>
                  <p className="text-[11px] text-gray-400">
                    Default password will be set to: <code className="text-[#FF5500]">szwbt2026pass</code>.
                    Primary login redirect target will be set to: <code className="text-[#00F0FF]">/spoc</code>.
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#2D3748]">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 bg-[#1A202C] hover:bg-[#2D3748] text-gray-300 font-pixel text-xs transition-colors"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={creatingSpoc}
                  className="px-5 py-2 bg-[#FF5500] hover:bg-[#FF6A1A] disabled:opacity-50 text-white font-pixel text-xs transition-colors"
                >
                  {creatingSpoc ? "CREATING..." : "CREATE SPOC ACCOUNT"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </SystemAdminShell>
  );
}
