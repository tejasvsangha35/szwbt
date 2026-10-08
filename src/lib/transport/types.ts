/**
 * SZWBT 2026 — Transport & Arrival Types & Constants
 * Pure type definitions and static venue constants safe for client & server components.
 */

export const ARRIVAL_VENUES = [
  "Hosur Bus Stand, Hubballi",
  "Old Bus Stand, Hubballi",
  "New Bus Stand, Hubballi",
  "Rani Chennamma Circle, Hubballi",
  "Ambedkar Circle, Hubballi",
  "Railway Station, Hubballi",
  "Hubballi Airport",
  "Opp. Basava Vana Circle, Deshpande Nagar, Hubballi",
] as const;

export type ArrivalVenue = (typeof ARRIVAL_VENUES)[number];

export type ArrivalStatus = "UPCOMING" | "ARRIVED" | "DELAYED" | "CANCELLED";

export interface ArrivalIssue {
  id: string;
  category: "Delayed Arrival" | "Wrong Venue" | "University Not Reachable" | "Transport Issue" | "Venue Congestion" | "Other";
  note: string;
  reportedAt: string;
  reportedBy: string;
}

export interface UniversityArrival {
  id: string;
  universityName: string;
  date: string; // "2026-10-18"
  scheduledTime: string; // "07:30 AM"
  originalTime?: string; // "07:30 AM"
  updatedTime?: string; // "08:15 AM"
  venue: ArrivalVenue;
  status: ArrivalStatus;
  arrivedAt?: string | null;
  delayReason?: "Traffic" | "Vehicle Delay" | "University Delay" | "Venue Issue" | "Other" | string | null;
  delayNote?: string | null;
  contingentSize?: number;
  contactPerson?: string;
  contactPhone?: string;
  issues?: ArrivalIssue[];
  createdAt: string;
  updatedAt: string;
}

export interface OperationalAlert {
  id: string;
  type: "ARRIVED" | "DELAYED" | "VENUE_CHANGED" | "ISSUE_REPORTED" | "TIME_CHANGED";
  title: string;
  message: string;
  timestamp: string;
  arrivalId?: string;
  universityName?: string;
  venue?: string;
}
