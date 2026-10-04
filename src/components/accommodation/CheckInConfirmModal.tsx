"use client";

import React, { useEffect } from "react";
import {
  X,
  UserCheck,
  RotateCcw,
  Building2,
  Key,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  ShieldCheck,
  Users,
  Home,
  User,
} from "lucide-react";
import { BedData } from "./BedCard";
import { RoomData } from "./RoomCard";

export interface CheckInConfirmState {
  type: "single" | "bulk" | "team";
  bed?: BedData;
  room?: RoomData;
  newStatus?: boolean; // true = physical check-in, false = revert to pending
  allocationIds?: string[];
  teamId?: string;
  contextName?: string;
  count?: number;
  occupantNames?: string[];
}

interface CheckInConfirmModalProps {
  state: CheckInConfirmState | null;
  hostelName: string;
  isOpen: boolean;
  isSubmitting: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
}

export function CheckInConfirmModal({
  state,
  hostelName,
  isOpen,
  isSubmitting,
  onClose,
  onConfirm,
}: CheckInConfirmModalProps) {
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isSubmitting) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen || !state) return null;

  const isRevert = state.type === "single" && state.newStatus === false;
  const isBulk = state.type === "bulk" || state.type === "team";

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 select-none animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="checkin-dialog-title"
        className={`max-w-md w-full bg-white border-2 rounded-2xl p-5 sm:p-6 shadow-2xl relative text-slate-900 transition-all ${
          isRevert
            ? "border-amber-400 ring-4 ring-amber-400/10"
            : "border-emerald-500 ring-4 ring-emerald-500/10"
        }`}
      >
        {/* Close Button */}
        <button
          type="button"
          disabled={isSubmitting}
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-500 hover:text-slate-800 rounded-lg cursor-pointer transition-colors"
          title="Cancel and close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div
          className={`flex items-center gap-3 border-b pb-3 mb-4 ${
            isRevert ? "border-amber-200" : "border-emerald-200"
          }`}
        >
          <div
            className={`p-2.5 rounded-xl border ${
              isRevert
                ? "bg-amber-50 text-amber-600 border-amber-300"
                : "bg-emerald-50 text-emerald-600 border-emerald-300"
            }`}
          >
            {isRevert ? (
              <RotateCcw className="w-6 h-6" />
            ) : isBulk ? (
              <Users className="w-6 h-6" />
            ) : (
              <UserCheck className="w-6 h-6" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span
                className={`font-pixel text-[9px] px-2 py-0.5 rounded font-bold uppercase tracking-wider border ${
                  isRevert
                    ? "bg-amber-100 text-amber-800 border-amber-300"
                    : "bg-emerald-100 text-emerald-800 border-emerald-300"
                }`}
              >
                {isRevert
                  ? "STATUS REVERSAL"
                  : isBulk
                  ? "BULK CHECK-IN"
                  : "DESK CHECK-IN"}
              </span>
            </div>
            <h3
              id="checkin-dialog-title"
              className="font-pixel text-base text-slate-900 font-bold mt-1"
            >
              {isRevert
                ? "REVERT CHECK-IN STATUS"
                : isBulk
                ? "CONFIRM BULK CHECK-IN"
                : "CONFIRM PHYSICAL CHECK-IN"}
            </h3>
            <p className="font-sans text-[11px] text-slate-500">
              {isRevert
                ? "Reset occupant status back to pending physical arrival"
                : isBulk
                ? "Simultaneously check in all pending occupants in this group"
                : "Verify participant arrival at the desk before issuing room key"}
            </p>
          </div>
        </div>

        {/* Modal Body */}
        <div className="space-y-4 font-sans text-xs">
          {/* SINGLE CHECK-IN CASE */}
          {!isBulk && state.bed && (
            <>
              {isRevert ? (
                <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl space-y-1.5 text-amber-900">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-[11px] leading-relaxed">
                      Are you sure you want to mark this participant as{" "}
                      <span className="font-bold">PENDING CHECK-IN</span>? This
                      will clear their confirmed check-in timestamp.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-1.5 text-emerald-950">
                  <div className="flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <p className="text-[11px] leading-relaxed">
                      Confirming physical presence at the hostel desk. Please
                      ensure participant credentials have been verified.
                    </p>
                  </div>
                </div>
              )}

              {/* Occupant Details Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2.5">
                <div className="flex items-start justify-between gap-2 border-b border-slate-200 pb-2.5">
                  <div>
                    <span className="font-pixel text-[9px] text-slate-400 block uppercase tracking-wider">
                      PARTICIPANT NAME
                    </span>
                    <span className="font-pixel text-sm text-slate-900 font-bold block">
                      {state.bed.occupant?.name || "Occupant"}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-pixel text-[8px] px-2 py-0.5 rounded font-bold uppercase tracking-wider bg-orange-100 text-[#FF5A16] border border-orange-200 inline-block">
                      {state.bed.occupant?.role || "ATHLETE"}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono block mt-0.5">
                      {state.bed.occupant?.gender || "FEMALE"}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-400 text-[10px] block uppercase font-mono">
                      INSTITUTION / TEAM
                    </span>
                    <div className="flex items-center gap-1.5 mt-0.5 text-slate-700 font-medium">
                      <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">
                        {state.bed.occupant?.teamName ||
                          state.bed.occupant?.institution ||
                          "Registered Contingent"}
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-400 text-[10px] block uppercase font-mono">
                      HOSTEL &amp; ROOM
                    </span>
                    <div className="flex items-center gap-1.5 mt-0.5 text-slate-800 font-semibold font-mono">
                      <Home className="w-3.5 h-3.5 text-[#FF5A16] shrink-0" />
                      <span>
                        Room {state.room?.roomNumber || "—"} • {state.bed.bedNumber}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-600">
                  <span className="font-mono text-[10px] text-slate-400">
                    FACILITY
                  </span>
                  <span className="font-medium text-slate-800">
                    {hostelName}
                  </span>
                </div>
              </div>

              {/* Check-In Checklist (for physical check-in) */}
              {!isRevert && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-[11px] text-slate-600 font-sans">
                  <div className="flex items-center gap-2 text-emerald-700 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Identity credential &amp; accreditation verified</span>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-700 font-medium">
                    <Key className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Room key card ready for handover</span>
                  </div>
                </div>
              )}
            </>
          )}

          {/* BULK / TEAM CHECK-IN CASE */}
          {isBulk && (
            <>
              <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-1.5 text-emerald-950">
                <div className="flex items-start gap-2">
                  <Users className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <p className="text-[11px] leading-relaxed">
                    You are recording physical check-in for all pending members
                    of this group at once.
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                  <div>
                    <span className="font-pixel text-[9px] text-slate-400 block uppercase tracking-wider">
                      TARGET CONTINGENT / ROOM
                    </span>
                    <span className="font-pixel text-sm text-slate-900 font-bold block">
                      {state.contextName || "Selected Group"}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-pixel text-[9px] text-slate-400 block uppercase tracking-wider">
                      TOTAL TO CHECK IN
                    </span>
                    <span className="font-pixel text-base text-emerald-600 font-bold">
                      {state.count || state.allocationIds?.length || 0} OCCUPANTS
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-600">
                  <span className="text-slate-400 font-mono text-[10px]">
                    FACILITY
                  </span>
                  <span className="font-medium text-slate-800">{hostelName}</span>
                </div>

                {state.occupantNames && state.occupantNames.length > 0 && (
                  <div className="space-y-1 pt-2 border-t border-slate-200">
                    <span className="font-pixel text-[9px] text-slate-400 uppercase tracking-wider block">
                      MEMBERS TO BE CHECKED IN ({state.occupantNames.length}):
                    </span>
                    <div className="flex flex-wrap gap-1 max-h-28 overflow-y-auto pr-1">
                      {state.occupantNames.slice(0, 10).map((name, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 bg-white border border-slate-200 rounded-md text-[10px] text-slate-700 font-sans shadow-2xs"
                        >
                          {name}
                        </span>
                      ))}
                      {state.occupantNames.length > 10 && (
                        <span className="px-2 py-0.5 bg-slate-200 text-slate-600 rounded-md text-[10px] font-pixel">
                          +{state.occupantNames.length - 10} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-200 gap-2">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 rounded-xl font-pixel text-[10px] cursor-pointer transition-colors"
            >
              CANCEL
            </button>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={onConfirm}
              className={`px-4 py-2.5 font-pixel text-xs font-bold tracking-wider cursor-pointer shadow-xs rounded-xl flex items-center gap-2 disabled:opacity-50 transition-all ${
                isRevert
                  ? "bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/20"
                  : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20"
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>PROCESSING...</span>
                </>
              ) : isRevert ? (
                <>
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>CONFIRM REVERT TO PENDING</span>
                </>
              ) : isBulk ? (
                <>
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>
                    CONFIRM CHECK IN ALL (
                    {state.count || state.allocationIds?.length || 0})
                  </span>
                </>
              ) : (
                <>
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>CONFIRM CHECK-IN</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
