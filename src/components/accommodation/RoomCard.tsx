"use client";

import React from "react";
import { BedCard, BedData } from "./BedCard";
import { UserCheck } from "lucide-react";

export interface RoomData {
  id: string;
  hostelId: string;
  roomNumber: string;
  displayName?: string;
  floorNumber: string;
  capacity: number; // Configurable by Super Admin
  occupiedCount: number;
  availableCount: number;
  reservedCount?: number;
  maintenanceCount?: number;
  isFull: boolean;
  beds: BedData[];
}

interface RoomCardProps {
  room: RoomData;
  hostelName: string;
  canAllocate?: boolean;
  onAllocateBed?: (bed: BedData, room: RoomData) => void;
  onCheckInBed?: (bed: BedData, room: RoomData, newStatus: boolean) => void;
  onCheckInWholeRoom?: (room: RoomData) => void;
  onEditBed?: (bed: BedData, room: RoomData) => void;
  onMoveBed?: (bed: BedData, room: RoomData) => void;
  onVacateBed?: (bed: BedData, room: RoomData) => void;
}

export const RoomCard: React.FC<RoomCardProps> = ({
  room,
  hostelName,
  canAllocate = false,
  onAllocateBed,
  onCheckInBed,
  onCheckInWholeRoom,
  onEditBed,
  onMoveBed,
  onVacateBed,
}) => {
  const totalBeds = room.beds.length || room.capacity || 1;
  const occupiedCount = room.beds.filter((b) => b.status === "OCCUPIED").length;
  const availableCount = room.beds.filter((b) => b.status === "AVAILABLE").length;
  const isFull = occupiedCount >= totalBeds;

  const pendingOccupants = room.beds.filter(
    (b) => b.status === "OCCUPIED" && b.occupant && !b.occupant.isCheckedIn
  );

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between gap-4 transition-all hover:border-orange-300 hover:shadow-sm">
      {/* Room Header Strip */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-pixel text-sm sm:text-base text-slate-900 font-bold tracking-wider uppercase">
              {room.displayName || room.roomNumber}
            </span>
            <span className="font-pixel text-[9px] text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded font-medium">
              {room.floorNumber}
            </span>
          </div>
          <span className="font-sans text-[11px] text-slate-500 block mt-0.5">
            {hostelName} • {totalBeds}-Bed Suite
          </span>
        </div>

        <div className="flex items-center gap-2 flex-wrap justify-end">
          {/* Check in whole room button */}
          {pendingOccupants.length > 0 && onCheckInWholeRoom && (
            <button
              type="button"
              onClick={() => onCheckInWholeRoom(room)}
              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-pixel text-[9px] font-bold tracking-wider rounded-lg shadow-2xs flex items-center gap-1 cursor-pointer transition-colors"
              title={`Check in all ${pendingOccupants.length} pending occupants in ${room.roomNumber} at once`}
            >
              <UserCheck className="w-3 h-3" />
              <span>CHECK IN ROOM ({pendingOccupants.length})</span>
            </button>
          )}

          {/* Occupancy Badge */}
          <span
            className={`font-pixel text-xs px-3 py-1 font-bold rounded-lg border shadow-2xs ${
              isFull
                ? "bg-rose-50 text-rose-700 border-rose-200"
                : occupiedCount > 0
                ? "bg-amber-50 text-amber-800 border-amber-200"
                : "bg-emerald-50 text-emerald-800 border-emerald-200"
            }`}
          >
            {occupiedCount} / {totalBeds} OCCUPIED ({availableCount} AVAILABLE)
          </span>
        </div>
      </div>

      {/* Dynamic Bed Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {room.beds.map((bed, idx) => {
          // If total beds is odd and this is the last bed, let it take full span
          const isOddLast = room.beds.length % 2 === 1 && idx === room.beds.length - 1;
          return (
            <div key={bed.id} className={isOddLast ? "sm:col-span-2" : ""}>
              <BedCard
                bed={bed}
                roomNumber={room.roomNumber}
                hostelName={hostelName}
                canAllocate={canAllocate}
                onAllocate={(b) => onAllocateBed && onAllocateBed(b, room)}
                onCheckIn={(b, newStatus) => onCheckInBed && onCheckInBed(b, room, newStatus)}
                onEditBed={(b) => (onEditBed ? onEditBed(b, room) : onMoveBed && onMoveBed(b, room))}
                onMove={(b) => onMoveBed && onMoveBed(b, room)}
                onVacate={(b) => onVacateBed && onVacateBed(b, room)}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
