"use client";

import React, { useState, useMemo } from "react";
import { BedData } from "./BedCard";
import { RoomData } from "./RoomCard";
import {
  Building2,
  UserCheck,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Pencil,
  UserMinus,
  Search,
  Users,
  Bed,
  Sparkles,
  DoorOpen,
  Check,
  Clock,
  MapPin,
  ShieldCheck,
  AlertCircle
} from "lucide-react";

interface AccommodationTableProps {
  rooms: RoomData[];
  hostelName: string;
  canAllocate?: boolean;
  onCheckInBed: (bed: BedData, room: RoomData, newStatus: boolean) => Promise<void> | void;
  onBulkCheckIn: (allocationIds: string[], contextName?: string, occupantNames?: string[]) => Promise<void> | void;
  onEditBed: (bed: BedData, room: RoomData) => void;
  onVacateBed: (bed: BedData, room: RoomData) => void;
  onAllocateBed?: (bed: BedData, room: RoomData) => void;
}

interface UniversityContingent {
  key: string;
  institutionName: string;
  teamName: string;
  totalAthletes: number;
  checkedInCount: number;
  pendingCount: number;
  isAllCheckedIn: boolean;
  rooms: string[];
  allocationIds: string[];
  pendingAllocationIds: string[];
  athletes: Array<{
    room: RoomData;
    bed: BedData;
    occupant: NonNullable<BedData["occupant"]>;
    isCheckedIn: boolean;
  }>;
}

export const AccommodationTable: React.FC<AccommodationTableProps> = ({
  rooms,
  hostelName,
  canAllocate = false,
  onCheckInBed,
  onBulkCheckIn,
  onEditBed,
  onVacateBed,
  onAllocateBed,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "PENDING" | "CHECKED_IN">("ALL");
  const [expandedUniversities, setExpandedUniversities] = useState<Record<string, boolean>>({});
  const [showVacantBeds, setShowVacantBeds] = useState(false);
  const [isProcessingBulk, setIsProcessingBulk] = useState(false);

  // 1. Group all occupied beds by University / Institution
  const { universities, vacantBedsCount, totalAllocatedCount, totalCheckedInCount } = useMemo(() => {
    const uniMap = new Map<string, UniversityContingent>();
    let vacantCount = 0;
    let allocatedCount = 0;
    let checkedInTotal = 0;

    rooms.forEach((room) => {
      room.beds.forEach((bed) => {
        if (bed.status === "OCCUPIED" && bed.occupant) {
          allocatedCount++;
          const isCheckedIn = Boolean(bed.occupant.isCheckedIn);
          if (isCheckedIn) checkedInTotal++;

          const inst = (bed.occupant.institution || bed.occupant.teamName || "Independent Contingent").trim();
          const team = (bed.occupant.teamName || bed.occupant.institution || inst).trim();
          const uniKey = inst.toLowerCase();

          if (!uniMap.has(uniKey)) {
            uniMap.set(uniKey, {
              key: uniKey,
              institutionName: inst,
              teamName: team,
              totalAthletes: 0,
              checkedInCount: 0,
              pendingCount: 0,
              isAllCheckedIn: false,
              rooms: [],
              allocationIds: [],
              pendingAllocationIds: [],
              athletes: [],
            });
          }

          const entry = uniMap.get(uniKey)!;
          entry.totalAthletes++;
          if (isCheckedIn) {
            entry.checkedInCount++;
          } else {
            entry.pendingCount++;
            if (bed.occupant.allocationId) {
              entry.pendingAllocationIds.push(bed.occupant.allocationId);
            }
          }

          if (bed.occupant.allocationId) {
            entry.allocationIds.push(bed.occupant.allocationId);
          }

          const roomLabel = room.displayName || room.roomNumber;
          if (!entry.rooms.includes(roomLabel)) {
            entry.rooms.push(roomLabel);
          }

          entry.athletes.push({
            room,
            bed,
            occupant: bed.occupant,
            isCheckedIn,
          });
        } else if (bed.status === "AVAILABLE") {
          vacantCount++;
        }
      });
    });

    const uniList = Array.from(uniMap.values()).map((uni) => {
      uni.isAllCheckedIn = uni.totalAthletes > 0 && uni.checkedInCount === uni.totalAthletes;
      // Sort athletes by room then bed
      uni.athletes.sort((a, b) => {
        const roomCmp = a.room.roomNumber.localeCompare(b.room.roomNumber);
        if (roomCmp !== 0) return roomCmp;
        return a.bed.bedNumber.localeCompare(b.bed.bedNumber);
      });
      return uni;
    });

    // Sort: Pending universities first, then by name
    uniList.sort((a, b) => {
      if (a.pendingCount > 0 && b.pendingCount === 0) return -1;
      if (a.pendingCount === 0 && b.pendingCount > 0) return 1;
      return a.institutionName.localeCompare(b.institutionName);
    });

    return {
      universities: uniList,
      vacantBedsCount: vacantCount,
      totalAllocatedCount: allocatedCount,
      totalCheckedInCount: checkedInTotal,
    };
  }, [rooms]);

  // 2. Filter universities based on search query and status filter
  const filteredUniversities = useMemo(() => {
    return universities.filter((uni) => {
      // Status filter
      if (statusFilter === "PENDING" && uni.pendingCount === 0) return false;
      if (statusFilter === "CHECKED_IN" && !uni.isAllCheckedIn) return false;

      // Search query
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();

      const matchUni = uni.institutionName.toLowerCase().includes(q);
      const matchTeam = uni.teamName.toLowerCase().includes(q);
      const matchRooms = uni.rooms.some((r) => r.toLowerCase().includes(q));
      const matchAthlete = uni.athletes.some(
        (a) =>
          a.occupant.name.toLowerCase().includes(q) ||
          (a.occupant.playerId || "").toLowerCase().includes(q) ||
          a.bed.bedNumber.toLowerCase().includes(q)
      );

      return matchUni || matchTeam || matchRooms || matchAthlete;
    });
  }, [universities, statusFilter, searchQuery]);

  // Vacant beds list for the dedicated vacancy inspection drawer
  const vacantBedsList = useMemo(() => {
    const list: Array<{ room: RoomData; bed: BedData }> = [];
    rooms.forEach((room) => {
      room.beds.forEach((bed) => {
        if (bed.status === "AVAILABLE") {
          list.push({ room, bed });
        }
      });
    });
    return list;
  }, [rooms]);

  // Toggle university accordion
  const toggleUniversity = (key: string) => {
    setExpandedUniversities((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Expand all / Collapse all
  const handleToggleExpandAll = () => {
    const allExpanded = filteredUniversities.every((u) => expandedUniversities[u.key]);
    const newState: Record<string, boolean> = {};
    filteredUniversities.forEach((u) => {
      newState[u.key] = !allExpanded;
    });
    setExpandedUniversities(newState);
  };

  // Perform bulk check-in for an entire university
  const handleCheckInEntireUniversity = async (uni: UniversityContingent) => {
    if (uni.pendingAllocationIds.length === 0) return;
    setIsProcessingBulk(true);
    try {
      const pendingNames = uni.athletes
        .filter((a) => !a.isCheckedIn)
        .map((a) => a.occupant.name);
      await onBulkCheckIn(uni.pendingAllocationIds, uni.institutionName, pendingNames);
    } finally {
      setIsProcessingBulk(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* ───────────────────────────────────────────────────────────── */}
      {/* 1. TOP TELEMETRY & CONTINGENTS OVERVIEW STRIP */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <div className="flex items-center gap-2 text-slate-500">
            <Building2 className="w-4 h-4 text-[#FF5A16]" />
            <span className="font-pixel text-[9px] uppercase tracking-wider">UNIVERSITIES</span>
          </div>
          <span className="font-pixel text-lg font-bold text-slate-900 mt-1 block">
            {universities.length}
          </span>
          <span className="text-[10px] text-slate-400 font-mono">Teams Allocated</span>
        </div>

        <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <div className="flex items-center gap-2 text-slate-500">
            <Clock className="w-4 h-4 text-amber-500" />
            <span className="font-pixel text-[9px] uppercase tracking-wider">PENDING ARRIVAL</span>
          </div>
          <span className="font-pixel text-lg font-bold text-amber-600 mt-1 block">
            {universities.filter((u) => u.pendingCount > 0).length}
          </span>
          <span className="text-[10px] text-slate-400 font-mono">Teams Awaiting Check-In</span>
        </div>

        <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <div className="flex items-center gap-2 text-slate-500">
            <UserCheck className="w-4 h-4 text-emerald-600" />
            <span className="font-pixel text-[9px] uppercase tracking-wider">ATHLETES CHECKED IN</span>
          </div>
          <span className="font-pixel text-lg font-bold text-emerald-600 mt-1 block">
            {totalCheckedInCount} / {totalAllocatedCount}
          </span>
          <span className="text-[10px] text-slate-400 font-mono">
            {totalAllocatedCount > 0
              ? `${Math.round((totalCheckedInCount / totalAllocatedCount) * 100)}% Checked In`
              : "0%"}
          </span>
        </div>

        <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <div className="flex items-center gap-2 text-slate-500">
            <DoorOpen className="w-4 h-4 text-slate-400" />
            <span className="font-pixel text-[9px] uppercase tracking-wider">VACANT BEDS</span>
          </div>
          <span className="font-pixel text-lg font-bold text-slate-700 mt-1 block">
            {vacantBedsCount}
          </span>
          <span className="text-[10px] text-slate-400 font-mono">Clean & Available</span>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 2. SEARCH BAR & STATUS FILTERS */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 bg-white border border-slate-200 rounded-xl shadow-xs">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search University, Team, Player, Room, or Bed..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-sans text-xs text-slate-900 outline-none focus:border-[#FF5A16] focus:bg-white transition-colors"
          />
        </div>

        {/* Filter Buttons & Toggle All */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 font-pixel text-[9px]">
            <button
              type="button"
              onClick={() => setStatusFilter("ALL")}
              className={`px-3 py-1 rounded-md cursor-pointer transition-all ${
                statusFilter === "ALL"
                  ? "bg-white text-slate-900 font-bold shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              ALL UNIVERSITIES ({universities.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("PENDING")}
              className={`px-3 py-1 rounded-md cursor-pointer transition-all ${
                statusFilter === "PENDING"
                  ? "bg-white text-amber-700 font-bold shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              PENDING ARRIVAL ({universities.filter((u) => u.pendingCount > 0).length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("CHECKED_IN")}
              className={`px-3 py-1 rounded-md cursor-pointer transition-all ${
                statusFilter === "CHECKED_IN"
                  ? "bg-white text-emerald-700 font-bold shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              FULLY CHECKED IN ({universities.filter((u) => u.isAllCheckedIn).length})
            </button>
          </div>

          <button
            type="button"
            onClick={handleToggleExpandAll}
            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-pixel text-[9px] rounded-lg border border-slate-200 transition-colors cursor-pointer"
          >
            {filteredUniversities.every((u) => expandedUniversities[u.key])
              ? "COLLAPSE ALL"
              : "EXPAND ALL"}
          </button>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 3. UNIVERSITIES ROSTER TABLE (DON'T SHOW PLAYERS DIRECTLY) */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="space-y-3">
        {filteredUniversities.length === 0 ? (
          <div className="p-12 text-center bg-white border border-slate-200 rounded-2xl shadow-xs">
            <Building2 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <span className="font-pixel text-xs text-slate-500 block uppercase">
              NO UNIVERSITIES MATCHING FILTER CRITERIA
            </span>
            <p className="text-slate-400 text-xs mt-1">
              Try clearing the search query or switching the status filter above.
            </p>
          </div>
        ) : (
          filteredUniversities.map((uni) => {
            const isExpanded = Boolean(expandedUniversities[uni.key] || searchQuery.trim().length > 0);

            return (
              <div
                key={uni.key}
                className={`bg-white border rounded-2xl shadow-xs transition-all overflow-hidden ${
                  uni.isAllCheckedIn
                    ? "border-emerald-200/80 bg-emerald-50/5"
                    : uni.pendingCount > 0
                    ? "border-slate-200 hover:border-orange-300"
                    : "border-slate-200"
                }`}
              >
                {/* ─── UNIVERSITY MASTER ROW ─── */}
                <div className="p-4 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                  {/* Left: University Name & Contingent Meta */}
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                        uni.isAllCheckedIn
                          ? "bg-emerald-100 text-emerald-700 border-emerald-300"
                          : "bg-orange-50 text-[#FF5A16] border-orange-200"
                      }`}
                    >
                      <Building2 className="w-5 h-5" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-pixel text-sm sm:text-base font-bold text-slate-900 tracking-wide truncate">
                          {uni.institutionName}
                        </h3>
                        {uni.isAllCheckedIn ? (
                          <span className="inline-flex items-center gap-1 font-pixel text-[9px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-md">
                            <Check className="w-3 h-3" /> ALL {uni.totalAthletes} CHECKED IN
                          </span>
                        ) : uni.checkedInCount > 0 ? (
                          <span className="inline-flex items-center gap-1 font-pixel text-[9px] font-bold text-amber-800 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-md">
                            <Clock className="w-3 h-3" /> {uni.checkedInCount}/{uni.totalAthletes} CHECKED IN
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 font-pixel text-[9px] font-bold text-orange-800 bg-orange-100 border border-orange-300 px-2 py-0.5 rounded-md">
                            <AlertCircle className="w-3 h-3" /> PENDING ARRIVAL ({uni.totalAthletes})
                          </span>
                        )}
                      </div>

                      {/* Subtitle: Team Name, Rooms, Floor */}
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 font-sans text-xs text-slate-600">
                        <span className="font-medium text-slate-700">{uni.teamName}</span>
                        <span className="text-slate-300 hidden sm:inline">•</span>
                        <span className="flex items-center gap-1 text-slate-500 font-mono text-[11px]">
                          <DoorOpen className="w-3.5 h-3.5 text-slate-400" />
                          Rooms: {uni.rooms.join(", ")}
                        </span>
                        <span className="text-slate-300 hidden sm:inline">•</span>
                        <span className="flex items-center gap-1 text-slate-500 font-mono text-[11px]">
                          <Users className="w-3.5 h-3.5 text-slate-400" />
                          {uni.totalAthletes} Allocated Beds ({hostelName})
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions Beside University (CHECKIN BUTTON & DROPDOWN BUTTON) */}
                  <div className="flex items-center gap-2.5 self-end lg:self-center shrink-0 w-full sm:w-auto justify-end">
                    {/* 1. CHECKIN BUTTON BESIDE IT */}
                    {uni.pendingCount > 0 ? (
                      <button
                        type="button"
                        disabled={isProcessingBulk}
                        onClick={() => handleCheckInEntireUniversity(uni)}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] disabled:opacity-50 text-white font-pixel text-[11px] font-bold tracking-wider rounded-xl shadow-xs cursor-pointer flex items-center gap-2 transition-all"
                        title={`Check in all ${uni.pendingCount} pending athletes of ${uni.institutionName} at once`}
                      >
                        <UserCheck className="w-4 h-4" />
                        <span>CHECK IN TEAM ({uni.pendingCount})</span>
                      </button>
                    ) : (
                      <div className="px-3.5 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 font-pixel text-[11px] font-bold rounded-xl flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>ALL CHECKED IN ✓</span>
                      </div>
                    )}

                    {/* 2. DROP DOWN BUTTON TO ALL THE PLAYERS INDIVIDUALLY */}
                    <button
                      type="button"
                      onClick={() => toggleUniversity(uni.key)}
                      className={`px-3 py-2 font-pixel text-[11px] font-bold rounded-xl border transition-all flex items-center gap-1.5 cursor-pointer ${
                        isExpanded
                          ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                          : "bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300"
                      }`}
                      title={isExpanded ? "Hide individual players" : "Show individual players"}
                    >
                      <span>{isExpanded ? "HIDE PLAYERS" : `VIEW PLAYERS (${uni.totalAthletes})`}</span>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* ─── 4. EXPANDABLE SUB-TABLE: ALL PLAYERS INDIVIDUALLY ─── */}
                {isExpanded && (
                  <div className="border-t border-slate-200 bg-slate-50/70 p-3 sm:p-4 animate-in fade-in duration-150">
                    <div className="flex items-center justify-between mb-2.5 px-1">
                      <span className="font-pixel text-[10px] text-slate-500 uppercase tracking-wider font-bold">
                        INDIVIDUAL ATHLETES & BED ROSTER ({uni.athletes.length} PLAYERS)
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        Hostel: {hostelName}
                      </span>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="bg-slate-100/80 border-b border-slate-200 font-pixel text-[9px] text-slate-600 tracking-wider">
                              <th className="py-2.5 px-3 font-bold text-slate-900">ROOM / SUITE</th>
                              <th className="py-2.5 px-3 font-bold text-slate-900">BED</th>
                              <th className="py-2.5 px-4 font-bold text-slate-900">ATHLETE / OCCUPANT</th>
                              <th className="py-2.5 px-3 font-bold text-slate-900">ATHLETE ID</th>
                              <th className="py-2.5 px-3 font-bold text-slate-900">ROLE / CATEGORY</th>
                              <th className="py-2.5 px-3 font-bold text-slate-900">STATUS</th>
                              <th className="py-2.5 px-4 text-right font-bold text-slate-900">ACTIONS</th>
                            </tr>
                          </thead>

                          <tbody className="divide-y divide-slate-100 font-sans">
                            {uni.athletes.map(({ room, bed, occupant, isCheckedIn }) => (
                              <tr
                                key={`${room.id}-${bed.id}`}
                                className={`transition-colors hover:bg-slate-50 ${
                                  isCheckedIn ? "bg-emerald-50/20" : "bg-white"
                                }`}
                              >
                                {/* Room / Suite */}
                                <td className="py-2.5 px-3 whitespace-nowrap">
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-pixel text-xs text-slate-900 font-bold">
                                      {room.displayName || room.roomNumber}
                                    </span>
                                    <span className="font-pixel text-[8px] bg-slate-100 text-slate-600 border border-slate-200 px-1 py-0.2 rounded font-medium">
                                      {room.floorNumber}
                                    </span>
                                  </div>
                                </td>

                                {/* Bed */}
                                <td className="py-2.5 px-3 whitespace-nowrap font-pixel font-bold text-xs text-slate-800">
                                  {bed.bedNumber}
                                </td>

                                {/* Athlete Name & Gender */}
                                <td className="py-2.5 px-4">
                                  <div className="flex items-center gap-1.5">
                                    <span
                                      className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                        isCheckedIn ? "bg-emerald-500" : "bg-amber-500 animate-pulse"
                                      }`}
                                    />
                                    <span className="font-sans text-xs font-bold text-slate-900">
                                      {occupant.name}
                                    </span>
                                    {occupant.gender && (
                                      <span className="font-pixel text-[8px] text-slate-500 bg-slate-100 px-1 py-0.2 rounded uppercase">
                                        {occupant.gender}
                                      </span>
                                    )}
                                  </div>
                                </td>

                                {/* Athlete ID */}
                                <td className="py-2.5 px-3 whitespace-nowrap font-mono text-[11px] text-slate-500">
                                  {occupant.playerId || "—"}
                                </td>

                                {/* Role / Category */}
                                <td className="py-2.5 px-3 whitespace-nowrap text-slate-600 text-[11px]">
                                  {occupant.role || "Athlete"}
                                </td>

                                {/* Status */}
                                <td className="py-2.5 px-3 whitespace-nowrap">
                                  {isCheckedIn ? (
                                    <span className="inline-flex items-center gap-1 font-pixel text-[9px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-md">
                                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                      CHECKED IN
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 font-pixel text-[9px] font-bold text-amber-800 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-md">
                                      <Clock className="w-3 h-3 text-amber-600" />
                                      PENDING
                                    </span>
                                  )}
                                </td>

                                {/* Individual Actions */}
                                <td className="py-2.5 px-4 text-right whitespace-nowrap">
                                  <div className="flex items-center justify-end gap-1.5">
                                    {/* Individual Check-in Button */}
                                    <button
                                      type="button"
                                      onClick={() => onCheckInBed(bed, room, !isCheckedIn)}
                                      className={`px-2.5 py-1 font-pixel text-[9px] font-bold rounded-lg cursor-pointer transition-all flex items-center gap-1 ${
                                        isCheckedIn
                                          ? "bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300"
                                          : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                                      }`}
                                      title={isCheckedIn ? "Change check-in status (undo)" : "Check in this athlete"}
                                    >
                                      <UserCheck className="w-3 h-3" />
                                      <span>{isCheckedIn ? "CHECKED IN ✓" : "CHECK IN"}</span>
                                    </button>

                                    {/* Edit Bed Button */}
                                    <button
                                      type="button"
                                      onClick={() => onEditBed(bed, room)}
                                      className="p-1 text-slate-500 hover:text-blue-700 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-lg cursor-pointer transition-colors"
                                      title="Edit / Reassign Bed"
                                    >
                                      <Pencil className="w-3.5 h-3.5" />
                                    </button>

                                    {/* Vacate / Check-out Button */}
                                    <button
                                      type="button"
                                      onClick={() => onVacateBed(bed, room)}
                                      className="p-1 text-slate-500 hover:text-rose-700 hover:bg-rose-50 border border-slate-200 hover:border-rose-300 rounded-lg cursor-pointer transition-colors"
                                      title="Check out / Vacate Bed"
                                    >
                                      <UserMinus className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 4. DEDICATED COLLAPSIBLE VACANT BEDS SECTION */}
      {/* ───────────────────────────────────────────────────────────── */}
      {vacantBedsList.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DoorOpen className="w-4 h-4 text-slate-500" />
              <span className="font-pixel text-xs text-slate-800 font-bold uppercase tracking-wider">
                VACANT BEDS IN {hostelName.toUpperCase()} ({vacantBedsList.length} BEDS AVAILABLE)
              </span>
            </div>

            <button
              type="button"
              onClick={() => setShowVacantBeds((prev) => !prev)}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-pixel text-[10px] font-bold rounded-lg border border-slate-200 cursor-pointer flex items-center gap-1.5 transition-colors"
            >
              <span>{showVacantBeds ? "HIDE VACANT BEDS" : "VIEW VACANT BEDS"}</span>
              {showVacantBeds ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </button>
          </div>

          {showVacantBeds && (
            <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 animate-in fade-in duration-150">
              {vacantBedsList.map(({ room, bed }) => (
                <div
                  key={`${room.id}-${bed.id}`}
                  className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-pixel text-[11px] font-bold text-slate-800">
                      {room.displayName || room.roomNumber}
                    </span>
                    <span className="font-pixel text-[8px] bg-slate-200 text-slate-600 px-1 py-0.2 rounded">
                      {room.floorNumber}
                    </span>
                  </div>
                  <span className="font-pixel text-xs text-[#FF5A16] font-bold mt-1">
                    {bed.bedNumber}
                  </span>
                  <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-200/60">
                    <span className="font-mono text-[9px] text-emerald-700 font-medium">
                      Vacant & Clean
                    </span>
                    {canAllocate && onAllocateBed && (
                      <button
                        type="button"
                        onClick={() => onAllocateBed(bed, room)}
                        className="text-[9px] font-pixel text-blue-600 hover:underline cursor-pointer"
                      >
                        Allocate
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
