"use client";

import React from "react";
import { User, Plus, Pencil, MoveRight, UserMinus, UserCheck, CheckCircle2 } from "lucide-react";

export interface BedData {
  id: string;
  bedNumber: string;
  status: string; // "AVAILABLE", "OCCUPIED", "RESERVED", "MAINTENANCE"
  occupant?: {
    allocationId?: string;
    id: string;
    name: string;
    playerId?: string;
    gender: string;
    institution: string;
    state?: string;
    role: string;
    teamName: string;
    allocatedBy?: string;
    checkInDate?: string;
    isCheckedIn?: boolean;
  } | null;
}

interface BedCardProps {
  bed: BedData;
  roomNumber: string;
  hostelName: string;
  canAllocate?: boolean;
  onAllocate?: (bed: BedData) => void;
  onCheckIn?: (bed: BedData, newStatus: boolean) => void;
  onEditBed?: (bed: BedData) => void;
  onMove?: (bed: BedData) => void;
  onVacate?: (bed: BedData) => void;
  onViewDetails?: (bed: BedData) => void;
}

export const BedCard: React.FC<BedCardProps> = ({
  bed,
  roomNumber,
  hostelName,
  canAllocate = false,
  onAllocate,
  onCheckIn,
  onEditBed,
  onMove,
  onVacate,
  onViewDetails,
}) => {
  const isAvailable = bed.status === "AVAILABLE";
  const isOccupied = bed.status === "OCCUPIED";
  const isReserved = bed.status === "RESERVED";
  const isMaintenance = bed.status === "MAINTENANCE";

  const isCheckedIn = Boolean(bed.occupant?.isCheckedIn);

  return (
    <div
      className={`p-3 rounded-xl border transition-all flex flex-col justify-between min-h-[140px] shadow-2xs ${
        isOccupied
          ? isCheckedIn
            ? "bg-emerald-50/30 border-emerald-300"
            : "bg-amber-50/20 border-amber-300"
          : isAvailable
          ? "bg-white border-2 border-dashed border-slate-200 hover:border-orange-300"
          : isReserved
          ? "bg-amber-50/40 border-amber-300"
          : "bg-slate-100 border-slate-200 opacity-60"
      }`}
    >
      {/* Top Header Strip */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-1.5 mb-1.5 font-pixel">
        <span className="text-xs text-slate-900 font-bold tracking-wider">
          {bed.bedNumber}
        </span>
        <span
          className={`text-[8px] px-2 py-0.5 uppercase tracking-wider font-bold rounded border ${
            isOccupied
              ? isCheckedIn
                ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                : "bg-amber-100 text-amber-800 border-amber-300"
              : isAvailable
              ? "bg-slate-100 text-slate-600 border-slate-200"
              : isReserved
              ? "bg-amber-100 text-amber-800 border-amber-300"
              : "bg-rose-100 text-rose-800 border-rose-300"
          }`}
        >
          {isOccupied
            ? isCheckedIn
              ? "● CHECKED IN"
              : "○ PENDING CHECK-IN"
            : isAvailable
            ? "○ AVAILABLE"
            : bed.status}
        </span>
      </div>

      {/* Content Body */}
      {isOccupied && bed.occupant ? (
        <div className="text-xs space-y-1 my-0.5">
          <div className="font-bold text-slate-900 truncate flex items-center gap-1.5">
            <span
              className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                isCheckedIn ? "bg-emerald-500" : "bg-amber-500 animate-pulse"
              }`}
            />
            <span className="truncate">{bed.occupant.name}</span>
          </div>

          <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
            <span className="text-[#FF5A16] font-semibold">{bed.occupant.role}</span>
            <span>{bed.occupant.gender}</span>
          </div>

          <div className="text-[10px] text-slate-500 truncate font-sans">
            {bed.occupant.teamName || bed.occupant.institution}
          </div>

          {/* Action buttons for occupied bed */}
          <div className="pt-2 border-t border-slate-100 mt-2 space-y-1.5 font-pixel text-[9px]">
            {/* 1. CHECK IN / CHANGE CHECK-IN STATUS BUTTON */}
            {onCheckIn && (
              <button
                type="button"
                onClick={() => onCheckIn(bed, !isCheckedIn)}
                className={`w-full py-1.5 px-2 rounded-lg font-bold tracking-wider cursor-pointer flex items-center justify-center gap-1.5 transition-all shadow-2xs ${
                  isCheckedIn
                    ? "bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300"
                    : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                }`}
                title={isCheckedIn ? "Click to change or revert check-in status" : "Record occupant physical check-in"}
              >
                {isCheckedIn ? (
                  <>
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>CHECKED IN ✓ (CHANGE)</span>
                  </>
                ) : (
                  <>
                    <UserCheck className="w-3 h-3 text-white" />
                    <span>CHECK IN OCCUPANT</span>
                  </>
                )}
              </button>
            )}

            {/* 2. SECONDARY CONTROLS: EDIT BED & CHECK OUT / VACATE */}
            <div className="flex items-center gap-1.5">
              {(onEditBed || onMove) && (
                <button
                  type="button"
                  onClick={() => (onEditBed ? onEditBed(bed) : onMove && onMove(bed))}
                  className="flex-1 py-1 px-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg flex items-center justify-center gap-1 cursor-pointer transition-colors shadow-2xs font-bold"
                  title="Edit assigned room or bed in case of changes"
                >
                  <Pencil className="w-2.5 h-2.5" />
                  <span>EDIT BED</span>
                </button>
              )}

              {onVacate && (
                <button
                  type="button"
                  onClick={() => onVacate(bed)}
                  className="flex-1 py-1 px-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg flex items-center justify-center gap-1 cursor-pointer transition-colors shadow-2xs font-bold"
                  title="Check out occupant and vacate bed"
                >
                  <UserMinus className="w-2.5 h-2.5" />
                  <span>CHECK OUT</span>
                </button>
              )}
            </div>
          </div>
        </div>
      ) : isAvailable ? (
        <div className="flex flex-col items-center justify-center my-auto py-2.5 space-y-1 text-center">
          <span className="font-mono text-[10px] text-slate-500 font-medium">Vacant &amp; Clean</span>
          {canAllocate && onAllocate ? (
            <button
              type="button"
              onClick={() => onAllocate(bed)}
              className="w-full py-1.5 px-2 bg-[#FF5A16] hover:bg-[#d94e16] text-white rounded-lg font-pixel text-[9px] font-bold tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1 shadow-xs mt-1"
            >
              <Plus className="w-3 h-3" />
              <span>ALLOCATE BED</span>
            </button>
          ) : (
            <span className="font-pixel text-[8px] text-slate-400 uppercase tracking-wider block">
              Desk Assigned
            </span>
          )}
        </div>
      ) : (
        <div className="text-center py-4 font-pixel text-[9px] text-slate-400 uppercase tracking-wider">
          {isReserved ? "★ RESERVED FOR TEAM" : "⚠ OUT OF SERVICE"}
        </div>
      )}
    </div>
  );
};
