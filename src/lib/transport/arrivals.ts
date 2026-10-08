/**
 * SZWBT 2026 — University Arrival Management Service
 * Strictly enforces the 8 official Hubballi arrival venues,
 * chronological arrival sorting, status management, and persistence.
 */

import { prisma } from "@/lib/prisma";

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

// ─────────────────────────────────────────────────────────────────────────────
// DEFAULT SEED ARRIVALS FOR THE CHAMPIONSHIP (24 Universities across 8 Venues)
// ─────────────────────────────────────────────────────────────────────────────
const SEED_ARRIVALS_OCT18: UniversityArrival[] = [
  // 1. Hosur Bus Stand, Hubballi (5 arrivals)
  {
    id: "arr-hosur-01",
    universityName: "KLE Technological University, Hubballi",
    date: "2026-10-18",
    scheduledTime: "07:30 AM",
    venue: "Hosur Bus Stand, Hubballi",
    status: "UPCOMING",
    contingentSize: 12,
    contactPerson: "Dr. Ashok Patil",
    contactPhone: "+91 94812 55667",
    createdAt: "2026-10-18T05:00:00Z",
    updatedAt: "2026-10-18T05:00:00Z",
  },
  {
    id: "arr-hosur-02",
    universityName: "University of Mysore",
    date: "2026-10-18",
    scheduledTime: "08:15 AM",
    venue: "Hosur Bus Stand, Hubballi",
    status: "UPCOMING",
    contingentSize: 10,
    contactPerson: "Prof. Manjunath",
    contactPhone: "+91 98451 22334",
    createdAt: "2026-10-18T05:00:00Z",
    updatedAt: "2026-10-18T05:00:00Z",
  },
  {
    id: "arr-hosur-03",
    universityName: "Visvesvaraya Technological University, Belagavi",
    date: "2026-10-18",
    scheduledTime: "09:00 AM",
    venue: "Hosur Bus Stand, Hubballi",
    status: "UPCOMING",
    contingentSize: 14,
    contactPerson: "Dr. Ramesh Hegde",
    contactPhone: "+91 98860 33445",
    createdAt: "2026-10-18T05:00:00Z",
    updatedAt: "2026-10-18T05:00:00Z",
  },
  {
    id: "arr-hosur-04",
    universityName: "Karnatak University, Dharwad",
    date: "2026-10-18",
    scheduledTime: "10:30 AM",
    venue: "Hosur Bus Stand, Hubballi",
    status: "UPCOMING",
    contingentSize: 11,
    contactPerson: "Dr. S. K. Joshi",
    contactPhone: "+91 94481 66778",
    createdAt: "2026-10-18T05:00:00Z",
    updatedAt: "2026-10-18T05:00:00Z",
  },
  {
    id: "arr-hosur-05",
    universityName: "Mangalore University",
    date: "2026-10-18",
    scheduledTime: "11:45 AM",
    venue: "Hosur Bus Stand, Hubballi",
    status: "UPCOMING",
    contingentSize: 9,
    contactPerson: "Dr. Dayanand Rao",
    contactPhone: "+91 98452 77889",
    createdAt: "2026-10-18T05:00:00Z",
    updatedAt: "2026-10-18T05:00:00Z",
  },

  // 2. Old Bus Stand, Hubballi (4 arrivals)
  {
    id: "arr-oldbus-01",
    universityName: "Bangalore University",
    date: "2026-10-18",
    scheduledTime: "08:00 AM",
    venue: "Old Bus Stand, Hubballi",
    status: "ARRIVED",
    arrivedAt: "2026-10-18T07:55:00Z",
    contingentSize: 10,
    contactPerson: "Rajesh Kumar",
    contactPhone: "+91 98450 11223",
    createdAt: "2026-10-18T05:00:00Z",
    updatedAt: "2026-10-18T07:55:00Z",
  },
  {
    id: "arr-oldbus-02",
    universityName: "Kuvempu University, Shivamogga",
    date: "2026-10-18",
    scheduledTime: "09:00 AM",
    venue: "Old Bus Stand, Hubballi",
    status: "UPCOMING",
    contingentSize: 8,
    contactPerson: "Dr. H. G. Gowda",
    contactPhone: "+91 94482 12345",
    createdAt: "2026-10-18T05:00:00Z",
    updatedAt: "2026-10-18T05:00:00Z",
  },
  {
    id: "arr-oldbus-03",
    universityName: "Tumkur University",
    date: "2026-10-18",
    scheduledTime: "10:15 AM",
    venue: "Old Bus Stand, Hubballi",
    status: "UPCOMING",
    contingentSize: 10,
    contactPerson: "Prof. Prakash M",
    contactPhone: "+91 98440 22331",
    createdAt: "2026-10-18T05:00:00Z",
    updatedAt: "2026-10-18T05:00:00Z",
  },
  {
    id: "arr-oldbus-04",
    universityName: "Davangere University",
    date: "2026-10-18",
    scheduledTime: "11:30 AM",
    venue: "Old Bus Stand, Hubballi",
    status: "UPCOMING",
    contingentSize: 8,
    contactPerson: "Dr. Ravi Naik",
    contactPhone: "+91 94801 33442",
    createdAt: "2026-10-18T05:00:00Z",
    updatedAt: "2026-10-18T05:00:00Z",
  },

  // 3. New Bus Stand, Hubballi (3 arrivals)
  {
    id: "arr-newbus-01",
    universityName: "Gulbarga University, Kalaburagi",
    date: "2026-10-18",
    scheduledTime: "08:30 AM",
    venue: "New Bus Stand, Hubballi",
    status: "UPCOMING",
    contingentSize: 12,
    contactPerson: "Dr. Basavaraj K",
    contactPhone: "+91 94480 88990",
    createdAt: "2026-10-18T05:00:00Z",
    updatedAt: "2026-10-18T05:00:00Z",
  },
  {
    id: "arr-newbus-02",
    universityName: "Rani Channamma University, Belagavi",
    date: "2026-10-18",
    scheduledTime: "10:00 AM",
    venue: "New Bus Stand, Hubballi",
    status: "UPCOMING",
    contingentSize: 10,
    contactPerson: "Prof. Sunita Patil",
    contactPhone: "+91 98861 44556",
    createdAt: "2026-10-18T05:00:00Z",
    updatedAt: "2026-10-18T05:00:00Z",
  },
  {
    id: "arr-newbus-03",
    universityName: "Vijayanagara Sri Krishnadevaraya University, Ballari",
    date: "2026-10-18",
    scheduledTime: "12:15 PM",
    venue: "New Bus Stand, Hubballi",
    status: "UPCOMING",
    contingentSize: 11,
    contactPerson: "Dr. Venkatesh R",
    contactPhone: "+91 94490 55667",
    createdAt: "2026-10-18T05:00:00Z",
    updatedAt: "2026-10-18T05:00:00Z",
  },

  // 4. Rani Chennamma Circle, Hubballi (2 arrivals)
  {
    id: "arr-chennamma-01",
    universityName: "Osmania University, Hyderabad",
    date: "2026-10-18",
    scheduledTime: "09:15 AM",
    venue: "Rani Chennamma Circle, Hubballi",
    status: "UPCOMING",
    contingentSize: 13,
    contactPerson: "Dr. Srinivas Reddy",
    contactPhone: "+91 98490 12345",
    createdAt: "2026-10-18T05:00:00Z",
    updatedAt: "2026-10-18T05:00:00Z",
  },
  {
    id: "arr-chennamma-02",
    universityName: "Kakatiya University, Warangal",
    date: "2026-10-18",
    scheduledTime: "10:30 AM",
    venue: "Rani Chennamma Circle, Hubballi",
    status: "UPCOMING",
    contingentSize: 9,
    contactPerson: "Prof. Sudhakar Rao",
    contactPhone: "+91 98491 67890",
    createdAt: "2026-10-18T05:00:00Z",
    updatedAt: "2026-10-18T05:00:00Z",
  },

  // 5. Ambedkar Circle, Hubballi (2 arrivals)
  {
    id: "arr-ambedkar-01",
    universityName: "Andhra University, Visakhapatnam",
    date: "2026-10-18",
    scheduledTime: "08:45 AM",
    venue: "Ambedkar Circle, Hubballi",
    status: "UPCOMING",
    contingentSize: 10,
    contactPerson: "Dr. Prasad V",
    contactPhone: "+91 94401 23456",
    createdAt: "2026-10-18T05:00:00Z",
    updatedAt: "2026-10-18T05:00:00Z",
  },
  {
    id: "arr-ambedkar-02",
    universityName: "Acharya Nagarjuna University, Guntur",
    date: "2026-10-18",
    scheduledTime: "11:00 AM",
    venue: "Ambedkar Circle, Hubballi",
    status: "UPCOMING",
    contingentSize: 8,
    contactPerson: "Dr. Subba Rao",
    contactPhone: "+91 94402 34567",
    createdAt: "2026-10-18T05:00:00Z",
    updatedAt: "2026-10-18T05:00:00Z",
  },

  // 6. Railway Station, Hubballi (4 arrivals)
  {
    id: "arr-railway-01",
    universityName: "University of Kerala, Thiruvananthapuram",
    date: "2026-10-18",
    scheduledTime: "06:45 AM",
    venue: "Railway Station, Hubballi",
    status: "ARRIVED",
    arrivedAt: "2026-10-18T06:50:00Z",
    contingentSize: 12,
    contactPerson: "Dr. Suresh Kumar",
    contactPhone: "+91 94470 12345",
    createdAt: "2026-10-18T05:00:00Z",
    updatedAt: "2026-10-18T06:50:00Z",
  },
  {
    id: "arr-railway-02",
    universityName: "Calicut University, Kozhikode",
    date: "2026-10-18",
    scheduledTime: "08:30 AM",
    originalTime: "07:45 AM",
    updatedTime: "08:30 AM",
    venue: "Railway Station, Hubballi",
    status: "DELAYED",
    delayReason: "Train Delay (Netravati Express)",
    delayNote: "Train running 45 mins late into Hubballi Junction platform 2.",
    contingentSize: 11,
    contactPerson: "Prof. Vinod Nair",
    contactPhone: "+91 94471 23456",
    createdAt: "2026-10-18T05:00:00Z",
    updatedAt: "2026-10-18T07:20:00Z",
  },
  {
    id: "arr-railway-03",
    universityName: "Mahatma Gandhi University, Kottayam",
    date: "2026-10-18",
    scheduledTime: "09:30 AM",
    venue: "Railway Station, Hubballi",
    status: "UPCOMING",
    contingentSize: 10,
    contactPerson: "Dr. Joseph Varghese",
    contactPhone: "+91 94472 34567",
    createdAt: "2026-10-18T05:00:00Z",
    updatedAt: "2026-10-18T05:00:00Z",
  },
  {
    id: "arr-railway-04",
    universityName: "Sri Venkateswara University, Tirupati",
    date: "2026-10-18",
    scheduledTime: "11:15 AM",
    venue: "Railway Station, Hubballi",
    status: "UPCOMING",
    contingentSize: 10,
    contactPerson: "Prof. Ramanaiah",
    contactPhone: "+91 94405 67890",
    createdAt: "2026-10-18T05:00:00Z",
    updatedAt: "2026-10-18T05:00:00Z",
  },

  // 7. Hubballi Airport (2 arrivals)
  {
    id: "arr-airport-01",
    universityName: "Anna University, Chennai",
    date: "2026-10-18",
    scheduledTime: "09:15 AM",
    venue: "Hubballi Airport",
    status: "UPCOMING",
    contingentSize: 8,
    contactPerson: "Dr. Balasubramanian",
    contactPhone: "+91 98400 12345",
    createdAt: "2026-10-18T05:00:00Z",
    updatedAt: "2026-10-18T05:00:00Z",
  },
  {
    id: "arr-airport-02",
    universityName: "Bharathiar University, Coimbatore",
    date: "2026-10-18",
    scheduledTime: "11:45 AM",
    venue: "Hubballi Airport",
    status: "UPCOMING",
    contingentSize: 9,
    contactPerson: "Dr. Senthil Kumar",
    contactPhone: "+91 98401 23456",
    createdAt: "2026-10-18T05:00:00Z",
    updatedAt: "2026-10-18T05:00:00Z",
  },

  // 8. Opp. Basava Vana Circle, Deshpande Nagar, Hubballi (2 arrivals)
  {
    id: "arr-basava-01",
    universityName: "Madurai Kamaraj University",
    date: "2026-10-18",
    scheduledTime: "09:45 AM",
    venue: "Opp. Basava Vana Circle, Deshpande Nagar, Hubballi",
    status: "UPCOMING",
    contingentSize: 10,
    contactPerson: "Prof. Meenakshi Sundaram",
    contactPhone: "+91 98402 34567",
    createdAt: "2026-10-18T05:00:00Z",
    updatedAt: "2026-10-18T05:00:00Z",
  },
  {
    id: "arr-basava-02",
    universityName: "Sri Krishnadevaraya University, Anantapur",
    date: "2026-10-18",
    scheduledTime: "11:30 AM",
    venue: "Opp. Basava Vana Circle, Deshpande Nagar, Hubballi",
    status: "UPCOMING",
    contingentSize: 9,
    contactPerson: "Dr. Hariprasad",
    contactPhone: "+91 94406 78901",
    createdAt: "2026-10-18T05:00:00Z",
    updatedAt: "2026-10-18T05:00:00Z",
  },
];

const SEED_ARRIVALS_OCT17: UniversityArrival[] = [
  {
    id: "arr-oct17-01",
    universityName: "University of Madras, Chennai",
    date: "2026-10-17",
    scheduledTime: "09:30 AM",
    venue: "Hubballi Airport",
    status: "ARRIVED",
    arrivedAt: "2026-10-17T09:25:00Z",
    contingentSize: 12,
    contactPerson: "Dr. K. S. Raman",
    contactPhone: "+91 94440 12345",
    createdAt: "2026-10-17T05:00:00Z",
    updatedAt: "2026-10-17T09:25:00Z",
  },
  {
    id: "arr-oct17-02",
    universityName: "Osmania University, Hyderabad",
    date: "2026-10-17",
    scheduledTime: "11:00 AM",
    venue: "Railway Station, Hubballi",
    status: "ARRIVED",
    arrivedAt: "2026-10-17T10:55:00Z",
    contingentSize: 10,
    contactPerson: "Prof. P. Reddy",
    contactPhone: "+91 98490 23456",
    createdAt: "2026-10-17T05:00:00Z",
    updatedAt: "2026-10-17T10:55:00Z",
  },
  {
    id: "arr-oct17-03",
    universityName: "University of Calicut, Malappuram",
    date: "2026-10-17",
    scheduledTime: "01:30 PM",
    venue: "Old Bus Stand, Hubballi",
    status: "UPCOMING",
    contingentSize: 11,
    contactPerson: "Dr. K. V. Thomas",
    contactPhone: "+91 94471 34567",
    createdAt: "2026-10-17T05:00:00Z",
    updatedAt: "2026-10-17T05:00:00Z",
  },
  {
    id: "arr-oct17-04",
    universityName: "University of Kerala, Thiruvananthapuram",
    date: "2026-10-17",
    scheduledTime: "03:15 PM",
    venue: "Hosur Bus Stand, Hubballi",
    status: "UPCOMING",
    contingentSize: 10,
    contactPerson: "Dr. Biju Nair",
    contactPhone: "+91 98470 45678",
    createdAt: "2026-10-17T05:00:00Z",
    updatedAt: "2026-10-17T05:00:00Z",
  },
  {
    id: "arr-oct17-05",
    universityName: "Andhra University, Visakhapatnam",
    date: "2026-10-17",
    scheduledTime: "04:30 PM",
    venue: "New Bus Stand, Hubballi",
    status: "UPCOMING",
    contingentSize: 12,
    contactPerson: "Dr. N. Prasad",
    contactPhone: "+91 98481 56789",
    createdAt: "2026-10-17T05:00:00Z",
    updatedAt: "2026-10-17T05:00:00Z",
  },
  {
    id: "arr-oct17-06",
    universityName: "Bharathidasan University, Tiruchirappalli",
    date: "2026-10-17",
    scheduledTime: "06:00 PM",
    venue: "Rani Chennamma Circle, Hubballi",
    status: "UPCOMING",
    contingentSize: 9,
    contactPerson: "Prof. S. Nathan",
    contactPhone: "+91 94433 67890",
    createdAt: "2026-10-17T05:00:00Z",
    updatedAt: "2026-10-17T05:00:00Z",
  },
  {
    id: "arr-oct17-07",
    universityName: "Kakatiya University, Warangal",
    date: "2026-10-17",
    scheduledTime: "07:15 PM",
    venue: "Ambedkar Circle, Hubballi",
    status: "UPCOMING",
    contingentSize: 10,
    contactPerson: "Dr. M. Chary",
    contactPhone: "+91 98492 78901",
    createdAt: "2026-10-17T05:00:00Z",
    updatedAt: "2026-10-17T05:00:00Z",
  },
  {
    id: "arr-oct17-08",
    universityName: "Pondicherry University, Puducherry",
    date: "2026-10-17",
    scheduledTime: "08:30 PM",
    venue: "Opp. Basava Vana Circle, Deshpande Nagar, Hubballi",
    status: "UPCOMING",
    contingentSize: 11,
    contactPerson: "Dr. R. Pierre",
    contactPhone: "+91 94422 89012",
    createdAt: "2026-10-17T05:00:00Z",
    updatedAt: "2026-10-17T05:00:00Z",
  },
];

const SEED_ARRIVALS_OCT19: UniversityArrival[] = [
  {
    id: "arr-oct19-01",
    universityName: "Alagappa University, Karaikudi",
    date: "2026-10-19",
    scheduledTime: "06:30 AM",
    venue: "Railway Station, Hubballi",
    status: "UPCOMING",
    contingentSize: 8,
    contactPerson: "Dr. M. Raja",
    contactPhone: "+91 94431 99887",
    createdAt: "2026-10-19T05:00:00Z",
    updatedAt: "2026-10-19T05:00:00Z",
  },
  {
    id: "arr-oct19-02",
    universityName: "Telangana University, Nizamabad",
    date: "2026-10-19",
    scheduledTime: "07:45 AM",
    venue: "Hosur Bus Stand, Hubballi",
    status: "UPCOMING",
    contingentSize: 9,
    contactPerson: "Dr. K. Srinivas",
    contactPhone: "+91 98495 11224",
    createdAt: "2026-10-19T05:00:00Z",
    updatedAt: "2026-10-19T05:00:00Z",
  },
];

export const ALL_INITIAL_SEED_ARRIVALS: UniversityArrival[] = [
  ...SEED_ARRIVALS_OCT17,
  ...SEED_ARRIVALS_OCT18,
  ...SEED_ARRIVALS_OCT19,
];

const SETTING_KEY = "SZWBT_TRANSPORT_ARRIVALS_STATE";

/**
 * Loads all arrivals from PostgreSQL.
 * If not initialized yet, seeds the championship arrivals and saves to database.
 */
export async function loadArrivalsFromDb(dateFilter?: string): Promise<UniversityArrival[]> {
  try {
    let setting = await prisma.systemSetting.findUnique({
      where: { key: SETTING_KEY },
    });

    let arrivals: UniversityArrival[] = [];

    if (!setting) {
      arrivals = ALL_INITIAL_SEED_ARRIVALS;
      await prisma.systemSetting.create({
        data: {
          key: SETTING_KEY,
          value: JSON.stringify(arrivals),
          category: "TRANSPORT",
          description: "Authoritative arrivals state for Hubballi arrival venues",
          isPublic: false,
          updatedBy: "system@szwbt2026.edu",
        },
      });
    } else {
      try {
        arrivals = JSON.parse(setting.value);
        // If loaded arrivals only have 18th, merge in 17th and 19th seeds
        const has17 = arrivals.some((a) => a.date === "2026-10-17");
        if (!has17) {
          arrivals = [...SEED_ARRIVALS_OCT17, ...arrivals, ...SEED_ARRIVALS_OCT19];
          await prisma.systemSetting.update({
            where: { key: SETTING_KEY },
            data: { value: JSON.stringify(arrivals) },
          });
        }
      } catch (e) {
        arrivals = ALL_INITIAL_SEED_ARRIVALS;
      }
    }

    if (dateFilter) {
      return arrivals.filter((a) => a.date === dateFilter);
    }

    return arrivals;
  } catch (error) {
    console.error("[ARRIVALS DB ERROR]", error);
    return SEED_ARRIVALS_OCT18;
  }
}

/**
 * Persists all arrivals to PostgreSQL.
 */
export async function saveArrivalsToDb(
  arrivals: UniversityArrival[],
  actorEmail: string = "transport@szwbt2026.edu"
): Promise<boolean> {
  try {
    await prisma.systemSetting.upsert({
      where: { key: SETTING_KEY },
      update: {
        value: JSON.stringify(arrivals),
        updatedBy: actorEmail,
      },
      create: {
        key: SETTING_KEY,
        value: JSON.stringify(arrivals),
        category: "TRANSPORT",
        description: "Authoritative arrivals state for Hubballi arrival venues",
        isPublic: false,
        updatedBy: actorEmail,
      },
    });
    return true;
  } catch (error) {
    console.error("[ARRIVALS SAVE ERROR]", error);
    return false;
  }
}

/**
 * Parses time string like "07:30 AM" or "12:15 PM" to comparable minutes from midnight.
 */
export function parseTimeToMinutes(timeStr: string): number {
  if (!timeStr) return 9999;
  const cleaned = timeStr.trim().toUpperCase();
  const match = cleaned.match(/(\d{1,2}):(\d{2})\s*(AM|PM|IST)?/);
  if (!match) return 9999;

  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const period = match[3];

  if (period === "PM" && hours < 12) hours += 12;
  if (period === "AM" && hours === 12) hours = 0;

  return hours * 60 + minutes;
}

/**
 * Sorts arrivals chronologically (earliest first).
 */
export function sortArrivalsChronologically(arrivals: UniversityArrival[]): UniversityArrival[] {
  return [...arrivals].sort((a, b) => {
    const timeA = parseTimeToMinutes(a.updatedTime || a.scheduledTime);
    const timeB = parseTimeToMinutes(b.updatedTime || b.scheduledTime);
    return timeA - timeB;
  });
}
