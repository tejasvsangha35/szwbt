/**
 * OFFICIAL MASTER TOURNAMENT INFORMATION & FIXTURES
 * AIU South Zone Inter-University Women’s Badminton Tournament 2026-27
 *
 * Venue: Dr. Prabhakar Sports Arena, KLE Technological University (Deemed to be University), Hubballi, Karnataka
 * Dates: 18 October 2026 to 21 October 2026
 *
 * Exact 102 Universities, 4 Pools (Pool A: 26, Pool B: 25, Pool C: 26, Pool D: 25)
 * Exact 102 Ties (Ties 01 through 102)
 */

export const TOURNAMENT_NAME = "AIU South Zone Inter-University Women’s Badminton Tournament 2026-27";
export const TOURNAMENT_VENUE = "Dr. Prabhakar Sports Arena, KLE Technological University (Deemed to be University), Hubballi, Karnataka";
export const TOURNAMENT_DATES = "18 October 2026 to 21 October 2026";

export interface OfficialUniversity {
  teamNumber: number;
  pool: "A" | "B" | "C" | "D";
  teamCode: string;
  fullName: string;
  name: string;
  city?: string;
  state: string;
  isByeToPoolFinal?: boolean;
}

export const OFFICIAL_UNIVERSITIES: OfficialUniversity[] = [
  // ── POOL A (TEAMS 1 TO 26) ──
  {
    teamNumber: 1,
    pool: "A",
    teamCode: "KA-14",
    fullName: "Jain Deemed to be University, Bangaluru, Karnataka",
    name: "Jain Deemed to be University",
    city: "Bangaluru",
    state: "Karnataka",
    isByeToPoolFinal: true,
  },
  {
    teamNumber: 2,
    pool: "A",
    teamCode: "TN-25",
    fullName: "Vellore Institute of Technology, Katapadi, Tamilnadu",
    name: "Vellore Institute of Technology",
    city: "Katapadi",
    state: "Tamilnadu",
  },
  {
    teamNumber: 3,
    pool: "A",
    teamCode: "AP-04",
    fullName: "Dr. NTR university of Health Sciences, Vijayawada, Andhra Pradesh",
    name: "Dr. NTR university of Health Sciences",
    city: "Vijayawada",
    state: "Andhra Pradesh",
  },
  {
    teamNumber: 4,
    pool: "A",
    teamCode: "KA-07",
    fullName: "Chanakya University, Bengaluru, Karnataka",
    name: "Chanakya University",
    city: "Bengaluru",
    state: "Karnataka",
  },
  {
    teamNumber: 5,
    pool: "A",
    teamCode: "AP-14",
    fullName: "Sri Krishnadevaraya University, Anantapura, Andhra Pradesh",
    name: "Sri Krishnadevaraya University",
    city: "Anantapura",
    state: "Andhra Pradesh",
  },
  {
    teamNumber: 6,
    pool: "A",
    teamCode: "TN-05",
    fullName: "B S Abdur Rehman Cresent Institute of Science & Technology, Tamilnadu",
    name: "B S Abdur Rehman Cresent Institute of Science & Technology",
    city: "Tamilnadu",
    state: "Tamilnadu",
  },
  {
    teamNumber: 7,
    pool: "A",
    teamCode: "KA-03",
    fullName: "Bangalore University, Bangaluru, Karnataka",
    name: "Bangalore University",
    city: "Bangaluru",
    state: "Karnataka",
  },
  {
    teamNumber: 8,
    pool: "A",
    teamCode: "KA-34",
    fullName: "Tumkur University, Tumkur, Karnataka",
    name: "Tumkur University",
    city: "Tumkur",
    state: "Karnataka",
  },
  {
    teamNumber: 9,
    pool: "A",
    teamCode: "AP-15",
    fullName: "Sri Venkateshwar University, Tirupati, Andhra Pradesh",
    name: "Sri Venkateshwar University",
    city: "Tirupati",
    state: "Andhra Pradesh",
  },
  {
    teamNumber: 10,
    pool: "A",
    teamCode: "TN-13",
    fullName: "Madurai Kamaraj University, Madurai, Tamilnadu",
    name: "Madurai Kamaraj University",
    city: "Madurai",
    state: "Tamilnadu",
  },
  {
    teamNumber: 11,
    pool: "A",
    teamCode: "KA-31",
    fullName: "Reva University, Bangaluru, Karnataka",
    name: "Reva University",
    city: "Bangaluru",
    state: "Karnataka",
  },
  {
    teamNumber: 12,
    pool: "A",
    teamCode: "KA-11",
    fullName: "Gulbarga University, Gulbarga, Karnataka",
    name: "Gulbarga University",
    city: "Gulbarga",
    state: "Karnataka",
  },
  {
    teamNumber: 13,
    pool: "A",
    teamCode: "AP-07",
    fullName: "Jawaharlal Nehru Technological University, Gurujada Vizianagaram, Andhra Pradesh",
    name: "Jawaharlal Nehru Technological University",
    city: "Gurujada Vizianagaram",
    state: "Andhra Pradesh",
  },
  {
    teamNumber: 14,
    pool: "A",
    teamCode: "TN-16",
    fullName: "Periyar University, Salem, Tamilnadu",
    name: "Periyar University",
    city: "Salem",
    state: "Tamilnadu",
  },
  {
    teamNumber: 15,
    pool: "A",
    teamCode: "KA-25",
    fullName: "Mangalore University, Mangaluru, Karnataka",
    name: "Mangalore University",
    city: "Mangaluru",
    state: "Karnataka",
  },
  {
    teamNumber: 16,
    pool: "A",
    teamCode: "TN-21",
    fullName: "Tamilnadu Physical Education & Sports University, Chennai, Tamilnadu",
    name: "Tamilnadu Physical Education & Sports University",
    city: "Chennai",
    state: "Tamilnadu",
  },
  {
    teamNumber: 17,
    pool: "A",
    teamCode: "TN-08",
    fullName: "Central University of Tamilnadu, Tamilnadu",
    name: "Central University of Tamilnadu",
    city: "Tamilnadu",
    state: "Tamilnadu",
  },
  {
    teamNumber: 18,
    pool: "A",
    teamCode: "KA-16",
    fullName: "Karnatak University, Dharwad, Karnataka",
    name: "Karnatak University",
    city: "Dharwad",
    state: "Karnataka",
  },
  {
    teamNumber: 19,
    pool: "A",
    teamCode: "TN-17",
    fullName: "SASTRA University, Tamilnadu",
    name: "SASTRA University",
    city: "Tamilnadu",
    state: "Tamilnadu",
  },
  {
    teamNumber: 20,
    pool: "A",
    teamCode: "KA-22",
    fullName: "Kristu Jayanti Deemed to be University, Bengaluru, Karnataka",
    name: "Kristu Jayanti Deemed to be University",
    city: "Bengaluru",
    state: "Karnataka",
  },
  {
    teamNumber: 21,
    pool: "A",
    teamCode: "TE-03",
    fullName: "Malla Reddy Vishwavidyapeeth Deemed to be University, Hyderabad, Telangana",
    name: "Malla Reddy Vishwavidyapeeth Deemed to be University",
    city: "Hyderabad",
    state: "Telangana",
  },
  {
    teamNumber: 22,
    pool: "A",
    teamCode: "KA-15",
    fullName: "JSS Academy of Higher Education & Research, Mysuru, Karnataka",
    name: "JSS Academy of Higher Education & Research",
    city: "Mysuru",
    state: "Karnataka",
  },
  {
    teamNumber: 23,
    pool: "A",
    teamCode: "AP-12",
    fullName: "Rayalaseema University, Karnool, Andhra Pradesh",
    name: "Rayalaseema University",
    city: "Karnool",
    state: "Andhra Pradesh",
  },
  {
    teamNumber: 24,
    pool: "A",
    teamCode: "AP-06",
    fullName: "Jawaharlal Nehru Technological University, Ananthpura, Andhra Pradesh",
    name: "Jawaharlal Nehru Technological University",
    city: "Ananthpura",
    state: "Andhra Pradesh",
  },
  {
    teamNumber: 25,
    pool: "A",
    teamCode: "KA-09",
    fullName: "Davangere University, Davangere, Karnataka",
    name: "Davangere University",
    city: "Davangere",
    state: "Karnataka",
  },
  {
    teamNumber: 26,
    pool: "A",
    teamCode: "KA-02",
    fullName: "Bagalkot University, Jamakhandi, Karnataka",
    name: "Bagalkot University",
    city: "Jamakhandi",
    state: "Karnataka",
  },

  // ── POOL B (TEAMS 27 TO 51) ──
  {
    teamNumber: 27,
    pool: "B",
    teamCode: "KR-05",
    fullName: "Kerala Agricultural University, Kerala",
    name: "Kerala Agricultural University",
    city: "Kerala",
    state: "Kerala",
    isByeToPoolFinal: true,
  },
  {
    teamNumber: 28,
    pool: "B",
    teamCode: "KA-32",
    fullName: "RV University, Bengaluru, Karnataka",
    name: "RV University",
    city: "Bengaluru",
    state: "Karnataka",
  },
  {
    teamNumber: 29,
    pool: "B",
    teamCode: "TN-01",
    fullName: "Alagappa University, Karaikudi, Tamilnadu",
    name: "Alagappa University",
    city: "Karaikudi",
    state: "Tamilnadu",
  },
  {
    teamNumber: 30,
    pool: "B",
    teamCode: "KA-36",
    fullName: "University of Mysore, Mysuru, Karnataka",
    name: "University of Mysore",
    city: "Mysuru",
    state: "Karnataka",
  },
  {
    teamNumber: 31,
    pool: "B",
    teamCode: "TN-22",
    fullName: "The Tamilnadu Dr. Ambedkar Law University, Chennai, Tamilnadu",
    name: "The Tamilnadu Dr. Ambedkar Law University",
    city: "Chennai",
    state: "Tamilnadu",
  },
  {
    teamNumber: 32,
    pool: "B",
    teamCode: "TN-02",
    fullName: "Amrita Vishwavidyapeetham, Coimbatore, Tamilnadu",
    name: "Amrita Vishwavidyapeetham",
    city: "Coimbatore",
    state: "Tamilnadu",
  },
  {
    teamNumber: 33,
    pool: "B",
    teamCode: "KR-06",
    fullName: "Kerala University of Health Sciences, Thrissur, Kerala",
    name: "Kerala University of Health Sciences",
    city: "Thrissur",
    state: "Kerala",
  },
  {
    teamNumber: 34,
    pool: "B",
    teamCode: "TN-07",
    fullName: "Bharathidasan University, Tiruchirapalli, Tamilnadu",
    name: "Bharathidasan University",
    city: "Tiruchirapalli",
    state: "Tamilnadu",
  },
  {
    teamNumber: 35,
    pool: "B",
    teamCode: "TE-01",
    fullName: "Jawaharlal Nehru Technological University, Hyderbad, Telangana",
    name: "Jawaharlal Nehru Technological University",
    city: "Hyderbad",
    state: "Telangana",
  },
  {
    teamNumber: 36,
    pool: "B",
    teamCode: "KR-04",
    fullName: "Kannur University, Kannur, Kerala",
    name: "Kannur University",
    city: "Kannur",
    state: "Kerala",
  },
  {
    teamNumber: 37,
    pool: "B",
    teamCode: "KA-21",
    fullName: "KLE Technological University, Hubballi, Karnataka",
    name: "KLE Technological University",
    city: "Hubballi",
    state: "Karnataka",
  },
  {
    teamNumber: 38,
    pool: "B",
    teamCode: "KR-09",
    fullName: "University of Calicut, Calicut, Kerala",
    name: "University of Calicut",
    city: "Calicut",
    state: "Kerala",
  },
  {
    teamNumber: 39,
    pool: "B",
    teamCode: "KA-17",
    fullName: "Karnataka Sate Law University, Hubballi, Karnataka",
    name: "Karnataka Sate Law University",
    city: "Hubballi",
    state: "Karnataka",
  },
  {
    teamNumber: 40,
    pool: "B",
    teamCode: "KA-13",
    fullName: "Haveri University, Haveri, Karnataka",
    name: "Haveri University",
    city: "Haveri",
    state: "Karnataka",
  },
  {
    teamNumber: 41,
    pool: "B",
    teamCode: "KA-38",
    fullName: "Vishweshwarayya Technological University, Belagavi, Karnataka",
    name: "Vishweshwarayya Technological University",
    city: "Belagavi",
    state: "Karnataka",
  },
  {
    teamNumber: 42,
    pool: "B",
    teamCode: "KA-37",
    fullName: "Vijayanagara Sri Krishnadevaraya University, Ballari, Karnataka",
    name: "Vijayanagara Sri Krishnadevaraya University",
    city: "Ballari",
    state: "Karnataka",
  },
  {
    teamNumber: 43,
    pool: "B",
    teamCode: "KA-20",
    fullName: "KLE Academy of Higher Education & Research (Deemed to be University), Karnataka",
    name: "KLE Academy of Higher Education & Research (Deemed to be University)",
    city: "Karnataka",
    state: "Karnataka",
  },
  {
    teamNumber: 44,
    pool: "B",
    teamCode: "TN-12",
    fullName: "Indian Institute of Technology, Madras, Chennai, Tamilnadu",
    name: "Indian Institute of Technology, Madras",
    city: "Chennai",
    state: "Tamilnadu",
  },
  {
    teamNumber: 45,
    pool: "B",
    teamCode: "TN-04",
    fullName: "Annamalai University, Chidambaram, Tamilnadu",
    name: "Annamalai University",
    city: "Chidambaram",
    state: "Tamilnadu",
  },
  {
    teamNumber: 46,
    pool: "B",
    teamCode: "KA-01",
    fullName: "Adikavi Shri Maharshi Valmiki University, Raichur, Karnataka",
    name: "Adikavi Shri Maharshi Valmiki University",
    city: "Raichur",
    state: "Karnataka",
  },
  {
    teamNumber: 47,
    pool: "B",
    teamCode: "TE-05",
    fullName: "Telangana University, Telangana",
    name: "Telangana University",
    city: "Telangana",
    state: "Telangana",
  },
  {
    teamNumber: 48,
    pool: "B",
    teamCode: "KR-02",
    fullName: "Chinmay Vishwa Vidyapeetham, Kerala",
    name: "Chinmay Vishwa Vidyapeetham",
    city: "Kerala",
    state: "Kerala",
  },
  {
    teamNumber: 49,
    pool: "B",
    teamCode: "TN-24",
    fullName: "University of Madras, Chennai, Tamilnadu",
    name: "University of Madras",
    city: "Chennai",
    state: "Tamilnadu",
  },
  {
    teamNumber: 50,
    pool: "B",
    teamCode: "KA-28",
    fullName: "PES University, Bengaluru, Karnataka",
    name: "PES University",
    city: "Bengaluru",
    state: "Karnataka",
  },
  {
    teamNumber: 51,
    pool: "B",
    teamCode: "KR-07",
    fullName: "Mahatma Gandhi University, Kottayam, Kerala",
    name: "Mahatma Gandhi University",
    city: "Kottayam",
    state: "Kerala",
  },

  // ── POOL C (TEAMS 52 TO 77) ──
  {
    teamNumber: 52,
    pool: "C",
    teamCode: "TN-19",
    fullName: "SRM Institute of Science & Technology University, Kottankulathur, Tamilnadu",
    name: "SRM Institute of Science & Technology University",
    city: "Kottankulathur",
    state: "Tamilnadu",
    isByeToPoolFinal: true,
  },
  {
    teamNumber: 53,
    pool: "C",
    teamCode: "KA-35",
    fullName: "University of Agricultural Sciences, Dharwad, Karnataka",
    name: "University of Agricultural Sciences",
    city: "Dharwad",
    state: "Karnataka",
  },
  {
    teamNumber: 54,
    pool: "C",
    teamCode: "AP-05",
    fullName: "GITAM Deemed to be University, Visakhapatnam, Andhra Pradesh",
    name: "GITAM Deemed to be University",
    city: "Visakhapatnam",
    state: "Andhra Pradesh",
  },
  {
    teamNumber: 55,
    pool: "C",
    teamCode: "KA-33",
    fullName: "Shri Dharmasthala Manjunatheshwara University, Dharwad, Karnataka",
    name: "Shri Dharmasthala Manjunatheshwara University",
    city: "Dharwad",
    state: "Karnataka",
  },
  {
    teamNumber: 56,
    pool: "C",
    teamCode: "AP-02",
    fullName: "Adikavi Nannaya University, Rajamahendravaram, Andhra Pradesh",
    name: "Adikavi Nannaya University",
    city: "Rajamahendravaram",
    state: "Andhra Pradesh",
  },
  {
    teamNumber: 57,
    pool: "C",
    teamCode: "KR-10",
    fullName: "University of Kerala, Kerala",
    name: "University of Kerala",
    city: "Kerala",
    state: "Kerala",
  },
  {
    teamNumber: 58,
    pool: "C",
    teamCode: "KA-30",
    fullName: "Rajiv Gandhi University of Health Sciences, Bengaluru, Karnataka",
    name: "Rajiv Gandhi University of Health Sciences",
    city: "Bengaluru",
    state: "Karnataka",
  },
  {
    teamNumber: 59,
    pool: "C",
    teamCode: "KR-01",
    fullName: "APJ Abdul Kalam University, Tiruvananthpuram, Kerala",
    name: "APJ Abdul Kalam University",
    city: "Tiruvananthpuram",
    state: "Kerala",
  },
  {
    teamNumber: 60,
    pool: "C",
    teamCode: "TN-14",
    fullName: "Manonmaniam Sundaranar University, Tirunalveli, Tamilnadu",
    name: "Manonmaniam Sundaranar University",
    city: "Tirunalveli",
    state: "Tamilnadu",
  },
  {
    teamNumber: 61,
    pool: "C",
    teamCode: "TE-02",
    fullName: "Kakatiya University, Warangal, Telangana",
    name: "Kakatiya University",
    city: "Warangal",
    state: "Telangana",
  },
  {
    teamNumber: 62,
    pool: "C",
    teamCode: "KA-27",
    fullName: "Nitte Deemed to be University, Mangaluru, Karnataka",
    name: "Nitte Deemed to be University",
    city: "Mangaluru",
    state: "Karnataka",
  },
  {
    teamNumber: 63,
    pool: "C",
    teamCode: "TN-11",
    fullName: "Hindustan Institute of Technology & Science, Chennai, Tamilnadu",
    name: "Hindustan Institute of Technology & Science",
    city: "Chennai",
    state: "Tamilnadu",
  },
  {
    teamNumber: 64,
    pool: "C",
    teamCode: "TN-23",
    fullName: "Thiruvalluvar University, Vellore, Tamilnadu",
    name: "Thiruvalluvar University",
    city: "Vellore",
    state: "Tamilnadu",
  },
  {
    teamNumber: 65,
    pool: "C",
    teamCode: "AP-11",
    fullName: "Mohan Babu University, Tirupati, Andhra Pradesh",
    name: "Mohan Babu University",
    city: "Tirupati",
    state: "Andhra Pradesh",
  },
  {
    teamNumber: 66,
    pool: "C",
    teamCode: "AP-17",
    fullName: "Vighnan's foundation of Science, Andhra Pradesh",
    name: "Vighnan's foundation of Science",
    city: "Andhra Pradesh",
    state: "Andhra Pradesh",
  },
  {
    teamNumber: 67,
    pool: "C",
    teamCode: "KA-10",
    fullName: "Dr. Manmohan Singh Bengaluru City University, Bengaluru, Karnataka",
    name: "Dr. Manmohan Singh Bengaluru City University",
    city: "Bengaluru",
    state: "Karnataka",
  },
  {
    teamNumber: 68,
    pool: "C",
    teamCode: "KA-05",
    fullName: "Central University of Karnataka, Gulbarga, Karnataka",
    name: "Central University of Karnataka",
    city: "Gulbarga",
    state: "Karnataka",
  },
  {
    teamNumber: 69,
    pool: "C",
    teamCode: "KA-12",
    fullName: "Hassan University, Hassan, Karnataka",
    name: "Hassan University",
    city: "Hassan",
    state: "Karnataka",
  },
  {
    teamNumber: 70,
    pool: "C",
    teamCode: "TN-03",
    fullName: "Anna University, Chennai, Tamilnadu",
    name: "Anna University",
    city: "Chennai",
    state: "Tamilnadu",
  },
  {
    teamNumber: 71,
    pool: "C",
    teamCode: "TN-09",
    fullName: "Dr. MGR Educational & Research institute, Tamilnadu",
    name: "Dr. MGR Educational & Research institute",
    city: "Tamilnadu",
    state: "Tamilnadu",
  },
  {
    teamNumber: 72,
    pool: "C",
    teamCode: "TE-07",
    fullName: "Woxen University, Hydrabad, Telangana",
    name: "Woxen University",
    city: "Hydrabad",
    state: "Telangana",
  },
  {
    teamNumber: 73,
    pool: "C",
    teamCode: "KA-23",
    fullName: "Kuvempu University, Shivamogga, Karnataka",
    name: "Kuvempu University",
    city: "Shivamogga",
    state: "Karnataka",
  },
  {
    teamNumber: 74,
    pool: "C",
    teamCode: "AP-20",
    fullName: "Yogi Veman University, Kadapa, Andhra Pradesh",
    name: "Yogi Veman University",
    city: "Kadapa",
    state: "Andhra Pradesh",
  },
  {
    teamNumber: 75,
    pool: "C",
    teamCode: "KA-18",
    fullName: "Karnataka State Akkamahadevi University, Vijayapura, Karnataka",
    name: "Karnataka State Akkamahadevi University",
    city: "Vijayapura",
    state: "Karnataka",
  },
  {
    teamNumber: 76,
    pool: "C",
    teamCode: "AP-01",
    fullName: "Acharya Nagarjuna University, Guntur, Andhra Pradesh",
    name: "Acharya Nagarjuna University",
    city: "Guntur",
    state: "Andhra Pradesh",
  },
  {
    teamNumber: 77,
    pool: "C",
    teamCode: "TN-20",
    fullName: "St. Joseph University, Chennai, Tamilnadu",
    name: "St. Joseph University",
    city: "Chennai",
    state: "Tamilnadu",
  },

  // ── POOL D (TEAMS 78 TO 102) ──
  {
    teamNumber: 78,
    pool: "D",
    teamCode: "TN-06",
    fullName: "Bharathiar University, Coimbatore, Tamilnadu",
    name: "Bharathiar University",
    city: "Coimbatore",
    state: "Tamilnadu",
    isByeToPoolFinal: true,
  },
  {
    teamNumber: 79,
    pool: "D",
    teamCode: "KA-04",
    fullName: "Bengaluru North University, Kolar, Karnataka",
    name: "Bengaluru North University",
    city: "Kolar",
    state: "Karnataka",
  },
  {
    teamNumber: 80,
    pool: "D",
    teamCode: "PO-01",
    fullName: "Pondicherry University, Puducherry, Puducherry",
    name: "Pondicherry University",
    city: "Puducherry",
    state: "Puducherry",
  },
  {
    teamNumber: 81,
    pool: "D",
    teamCode: "TN-10",
    fullName: "Dravidian University, Tamilnadu",
    name: "Dravidian University",
    city: "Tamilnadu",
    state: "Tamilnadu",
  },
  {
    teamNumber: 82,
    pool: "D",
    teamCode: "AP-18",
    fullName: "Vikram Simhapuri University, Nellore, Andhra Pradesh",
    name: "Vikram Simhapuri University",
    city: "Nellore",
    state: "Andhra Pradesh",
  },
  {
    teamNumber: 83,
    pool: "D",
    teamCode: "TE-06",
    fullName: "University of Hyderabad, Hyderabad, Telangana",
    name: "University of Hyderabad",
    city: "Hyderabad",
    state: "Telangana",
  },
  {
    teamNumber: 84,
    pool: "D",
    teamCode: "KA-24",
    fullName: "Maharani Cluster University, Bengaluru, Karnataka",
    name: "Maharani Cluster University",
    city: "Bengaluru",
    state: "Karnataka",
  },
  {
    teamNumber: 85,
    pool: "D",
    teamCode: "TE-04",
    fullName: "Osmania University, Hyderabad, Telangana",
    name: "Osmania University",
    city: "Hyderabad",
    state: "Telangana",
  },
  {
    teamNumber: 86,
    pool: "D",
    teamCode: "KR-08",
    fullName: "Sree Sankaracharya University of Sanskrit, Kalady, Kerala",
    name: "Sree Sankaracharya University of Sanskrit",
    city: "Kalady",
    state: "Kerala",
  },
  {
    teamNumber: 87,
    pool: "D",
    teamCode: "KA-06",
    fullName: "Chamarajnagara University, Chamarajnagara, Karnataka",
    name: "Chamarajnagara University",
    city: "Chamarajnagara",
    state: "Karnataka",
  },
  {
    teamNumber: 88,
    pool: "D",
    teamCode: "AP-10",
    fullName: "Krishna University, Machalipattanam, Andhra Pradesh",
    name: "Krishna University",
    city: "Machalipattanam",
    state: "Andhra Pradesh",
  },
  {
    teamNumber: 89,
    pool: "D",
    teamCode: "AP-16",
    fullName: "The Apollo University, Andhra Pradesh",
    name: "The Apollo University",
    city: "Andhra Pradesh",
    state: "Andhra Pradesh",
  },
  {
    teamNumber: 90,
    pool: "D",
    teamCode: "TN-26",
    fullName: "Vinayak Mission Research Foundation, Tamilnadu",
    name: "Vinayak Mission Research Foundation",
    city: "Tamilnadu",
    state: "Tamilnadu",
  },
  {
    teamNumber: 91,
    pool: "D",
    teamCode: "KA-19",
    fullName: "Kitturu Rani Channamma University, Belagavi, Karnataka",
    name: "Kitturu Rani Channamma University",
    city: "Belagavi",
    state: "Karnataka",
  },
  {
    teamNumber: 92,
    pool: "D",
    teamCode: "KR-03",
    fullName: "Coachin University of Science & Technology, Coachin, Kerala",
    name: "Coachin University of Science & Technology",
    city: "Coachin",
    state: "Kerala",
  },
  {
    teamNumber: 93,
    pool: "D",
    teamCode: "TN-18",
    fullName: "Saveetha Institute of Medical & technical Sciences, Chennai, Tamilnadu",
    name: "Saveetha Institute of Medical & technical Sciences",
    city: "Chennai",
    state: "Tamilnadu",
  },
  {
    teamNumber: 94,
    pool: "D",
    teamCode: "AP-08",
    fullName: "Jawaharlal Nehru Technological University, Kakinada, Andhra Pradesh",
    name: "Jawaharlal Nehru Technological University",
    city: "Kakinada",
    state: "Andhra Pradesh",
  },
  {
    teamNumber: 95,
    pool: "D",
    teamCode: "KA-08",
    fullName: "Christ Deemed to be University, Bengaluru, Karnataka",
    name: "Christ Deemed to be University",
    city: "Bengaluru",
    state: "Karnataka",
  },
  {
    teamNumber: 96,
    pool: "D",
    teamCode: "KA-29",
    fullName: "Presidency University, Bangaluru, Karnataka",
    name: "Presidency University",
    city: "Bangaluru",
    state: "Karnataka",
  },
  {
    teamNumber: 97,
    pool: "D",
    teamCode: "AP-13",
    fullName: "Siddharth Academy of Higher Education,Deemed to be University, Vijayawada, Andhra Pradesh",
    name: "Siddharth Academy of Higher Education,Deemed to be University",
    city: "Vijayawada",
    state: "Andhra Pradesh",
  },
  {
    teamNumber: 98,
    pool: "D",
    teamCode: "TN-15",
    fullName: "Mother Teresa Women’s University, Kodaikanal, Tamilnadu",
    name: "Mother Teresa Women’s University",
    city: "Kodaikanal",
    state: "Tamilnadu",
  },
  {
    teamNumber: 99,
    pool: "D",
    teamCode: "KA-26",
    fullName: "Manipal Academy of Higher Education, Manipal, Karnataka",
    name: "Manipal Academy of Higher Education",
    city: "Manipal",
    state: "Karnataka",
  },
  {
    teamNumber: 100,
    pool: "D",
    teamCode: "AP-03",
    fullName: "Andhra University, Visakhapattanam, Andhra Pradesh",
    name: "Andhra University",
    city: "Visakhapattanam",
    state: "Andhra Pradesh",
  },
  {
    teamNumber: 101,
    pool: "D",
    teamCode: "AP-19",
    fullName: "VIT- AP University, Vijayawada, Andhra Pradesh",
    name: "VIT- AP University",
    city: "Vijayawada",
    state: "Andhra Pradesh",
  },
  {
    teamNumber: 102,
    pool: "D",
    teamCode: "AP-09",
    fullName: "KLEF Deemed to be University, Vaddeshwaram, Andhra Pradesh",
    name: "KLEF Deemed to be University",
    city: "Vaddeshwaram",
    state: "Andhra Pradesh",
  },
];

export interface OfficialTieDefinition {
  tieNumber: number; // 1 to 102
  matchNumber: string; // "Tie 01" to "Tie 102"
  publicMatchNumber: string; // "Tie 01" to "Tie 102"
  dayId: "OCT18" | "OCT19" | "OCT20" | "OCT21";
  date: string; // "18-10-2026", "19-10-2026", "20-10-2026", "21-10-2026"
  session: "MORNING" | "AFTERNOON" | "EVENING";
  time: string; // "10:30 AM", "02:30 PM", "08:30 AM", "02:00 PM", "Time will be informed", "09:00 AM", "03:00 PM"
  pool: "A" | "B" | "C" | "D" | "CHAMPIONSHIP";
  roundStage: "ROUND_1" | "ROUND_2" | "QUARTER_FINAL" | "SEMI_FINAL" | "POOL_FINAL" | "SUPER_QUARTERS" | "CHAMPIONSHIP_SEMI_FINAL" | "GRAND_FINAL" | "HARDLINE_TIE";
  roundName: string;
  roundOrder: number;
  court: string; // "Court 01", "Court 02", "Court 03", "Court 04"
  sourceAType: "DIRECT_TEAM" | "BYE_TEAM" | "WINNER" | "LOSER";
  sourceBType: "DIRECT_TEAM" | "WINNER" | "LOSER";
  sourceATeamNumber?: number;
  sourceBTeamNumber?: number;
  sourceAMatchNumber?: string;
  sourceBMatchNumber?: string;
  downstreamMatchNumber?: string;
  downstreamSlot?: "A" | "B";
  loserDownstreamMatchNumber?: string;
  loserDownstreamSlot?: "A" | "B";
}

/**
 * Builds all 102 canonical tie definitions with complete tournament graph wiring.
 */
export function buildOfficialTies(): OfficialTieDefinition[] {
  const ties: OfficialTieDefinition[] = [];

  const courtRotate = (idx: number) => `Court 0${(idx % 4) + 1}`;

  // Helper to format Tie XX
  const tieCode = (num: number) => `Tie ${String(num).padStart(2, "0")}`;

  // ═══════════════════════════════════════════════════════════════════
  // SESSION 1: 18-10-2026 - MORNING (10:30 AM) — 34 TIES (ROUND 1)
  // ═══════════════════════════════════════════════════════════════════

  // Pool A: Ties 01 to 09 (9 ties)
  // Teams playing: 3-4, 6-7, 9-10, 12-13, 15-16, 18-19, 21-22, 23-24, 25-26
  const poolAR1Pairs = [
    { num: 1, teamA: 3, teamB: 4, ds: 35, dsSlot: "B" as const },
    { num: 2, teamA: 6, teamB: 7, ds: 36, dsSlot: "B" as const },
    { num: 3, teamA: 9, teamB: 10, ds: 37, dsSlot: "B" as const },
    { num: 4, teamA: 12, teamB: 13, ds: 38, dsSlot: "B" as const },
    { num: 5, teamA: 15, teamB: 16, ds: 39, dsSlot: "B" as const },
    { num: 6, teamA: 18, teamB: 19, ds: 40, dsSlot: "B" as const },
    { num: 7, teamA: 21, teamB: 22, ds: 41, dsSlot: "B" as const },
    { num: 8, teamA: 23, teamB: 24, ds: 42, dsSlot: "A" as const },
    { num: 9, teamA: 25, teamB: 26, ds: 42, dsSlot: "B" as const },
  ];

  poolAR1Pairs.forEach((p, idx) => {
    ties.push({
      tieNumber: p.num,
      matchNumber: tieCode(p.num),
      publicMatchNumber: tieCode(p.num),
      dayId: "OCT18",
      date: "18-10-2026",
      session: "MORNING",
      time: "10:30 AM",
      pool: "A",
      roundStage: "ROUND_1",
      roundName: "Round 1",
      roundOrder: 1,
      court: courtRotate(idx),
      sourceAType: "DIRECT_TEAM",
      sourceBType: "DIRECT_TEAM",
      sourceATeamNumber: p.teamA,
      sourceBTeamNumber: p.teamB,
      downstreamMatchNumber: tieCode(p.ds),
      downstreamSlot: p.dsSlot,
    });
  });

  // Pool B: Ties 10 to 17 (8 ties)
  // Teams playing: 29-30, 32-33, 35-36, 38-39, 41-42, 44-45, 47-48, 50-51
  const poolBR1Pairs = [
    { num: 10, teamA: 29, teamB: 30, ds: 43, dsSlot: "B" as const },
    { num: 11, teamA: 32, teamB: 33, ds: 44, dsSlot: "B" as const },
    { num: 12, teamA: 35, teamB: 36, ds: 45, dsSlot: "B" as const },
    { num: 13, teamA: 38, teamB: 39, ds: 46, dsSlot: "B" as const },
    { num: 14, teamA: 41, teamB: 42, ds: 47, dsSlot: "B" as const },
    { num: 15, teamA: 44, teamB: 45, ds: 48, dsSlot: "B" as const },
    { num: 16, teamA: 47, teamB: 48, ds: 49, dsSlot: "B" as const },
    { num: 17, teamA: 50, teamB: 51, ds: 50, dsSlot: "B" as const },
  ];

  poolBR1Pairs.forEach((p, idx) => {
    ties.push({
      tieNumber: p.num,
      matchNumber: tieCode(p.num),
      publicMatchNumber: tieCode(p.num),
      dayId: "OCT18",
      date: "18-10-2026",
      session: "MORNING",
      time: "10:30 AM",
      pool: "B",
      roundStage: "ROUND_1",
      roundName: "Round 1",
      roundOrder: 1,
      court: courtRotate(idx),
      sourceAType: "DIRECT_TEAM",
      sourceBType: "DIRECT_TEAM",
      sourceATeamNumber: p.teamA,
      sourceBTeamNumber: p.teamB,
      downstreamMatchNumber: tieCode(p.ds),
      downstreamSlot: p.dsSlot,
    });
  });

  // Pool C: Ties 18 to 26 (9 ties)
  // Teams playing: 54-55, 57-58, 60-61, 63-64, 66-67, 69-70, 72-73, 74-75, 76-77
  const poolCR1Pairs = [
    { num: 18, teamA: 54, teamB: 55, ds: 51, dsSlot: "B" as const },
    { num: 19, teamA: 57, teamB: 58, ds: 52, dsSlot: "B" as const },
    { num: 20, teamA: 60, teamB: 61, ds: 53, dsSlot: "B" as const },
    { num: 21, teamA: 63, teamB: 64, ds: 54, dsSlot: "B" as const },
    { num: 22, teamA: 66, teamB: 67, ds: 55, dsSlot: "B" as const },
    { num: 23, teamA: 69, teamB: 70, ds: 56, dsSlot: "B" as const },
    { num: 24, teamA: 72, teamB: 73, ds: 57, dsSlot: "B" as const },
    { num: 25, teamA: 74, teamB: 75, ds: 58, dsSlot: "A" as const },
    { num: 26, teamA: 76, teamB: 77, ds: 58, dsSlot: "B" as const },
  ];

  poolCR1Pairs.forEach((p, idx) => {
    ties.push({
      tieNumber: p.num,
      matchNumber: tieCode(p.num),
      publicMatchNumber: tieCode(p.num),
      dayId: "OCT18",
      date: "18-10-2026",
      session: "MORNING",
      time: "10:30 AM",
      pool: "C",
      roundStage: "ROUND_1",
      roundName: "Round 1",
      roundOrder: 1,
      court: courtRotate(idx),
      sourceAType: "DIRECT_TEAM",
      sourceBType: "DIRECT_TEAM",
      sourceATeamNumber: p.teamA,
      sourceBTeamNumber: p.teamB,
      downstreamMatchNumber: tieCode(p.ds),
      downstreamSlot: p.dsSlot,
    });
  });

  // Pool D: Ties 27 to 34 (8 ties)
  // Teams playing: 80-81, 83-84, 86-87, 89-90, 92-93, 95-96, 98-99, 101-102
  const poolDR1Pairs = [
    { num: 27, teamA: 80, teamB: 81, ds: 59, dsSlot: "B" as const },
    { num: 28, teamA: 83, teamB: 84, ds: 60, dsSlot: "B" as const },
    { num: 29, teamA: 86, teamB: 87, ds: 61, dsSlot: "B" as const },
    { num: 30, teamA: 89, teamB: 90, ds: 62, dsSlot: "B" as const },
    { num: 31, teamA: 92, teamB: 93, ds: 63, dsSlot: "B" as const },
    { num: 32, teamA: 95, teamB: 96, ds: 64, dsSlot: "B" as const },
    { num: 33, teamA: 98, teamB: 99, ds: 65, dsSlot: "B" as const },
    { num: 34, teamA: 101, teamB: 102, ds: 66, dsSlot: "B" as const },
  ];

  poolDR1Pairs.forEach((p, idx) => {
    ties.push({
      tieNumber: p.num,
      matchNumber: tieCode(p.num),
      publicMatchNumber: tieCode(p.num),
      dayId: "OCT18",
      date: "18-10-2026",
      session: "MORNING",
      time: "10:30 AM",
      pool: "D",
      roundStage: "ROUND_1",
      roundName: "Round 1",
      roundOrder: 1,
      court: courtRotate(idx),
      sourceAType: "DIRECT_TEAM",
      sourceBType: "DIRECT_TEAM",
      sourceATeamNumber: p.teamA,
      sourceBTeamNumber: p.teamB,
      downstreamMatchNumber: tieCode(p.ds),
      downstreamSlot: p.dsSlot,
    });
  });

  // ═══════════════════════════════════════════════════════════════════
  // SESSION 2: 18-10-2026 - AFTERNOON (02:30 PM) — 32 TIES (ROUND 2)
  // ═══════════════════════════════════════════════════════════════════

  // Pool A: Ties 35 to 42 (8 ties)
  // Bye teams in Pool A: 2, 5, 8, 11, 14, 17, 20
  const poolAR2 = [
    { num: 35, byeTeam: 2, r1Tie: 1, ds: 67, dsSlot: "A" as const },
    { num: 36, byeTeam: 5, r1Tie: 2, ds: 67, dsSlot: "B" as const },
    { num: 37, byeTeam: 8, r1Tie: 3, ds: 68, dsSlot: "A" as const },
    { num: 38, byeTeam: 11, r1Tie: 4, ds: 68, dsSlot: "B" as const },
    { num: 39, byeTeam: 14, r1Tie: 5, ds: 69, dsSlot: "A" as const },
    { num: 40, byeTeam: 17, r1Tie: 6, ds: 69, dsSlot: "B" as const },
    { num: 41, byeTeam: 20, r1Tie: 7, ds: 70, dsSlot: "A" as const },
    { num: 42, r1TieA: 8, r1TieB: 9, ds: 70, dsSlot: "B" as const },
  ];

  poolAR2.forEach((p, idx) => {
    ties.push({
      tieNumber: p.num,
      matchNumber: tieCode(p.num),
      publicMatchNumber: tieCode(p.num),
      dayId: "OCT18",
      date: "18-10-2026",
      session: "AFTERNOON",
      time: "02:30 PM",
      pool: "A",
      roundStage: "ROUND_2",
      roundName: "Round 2",
      roundOrder: 2,
      court: courtRotate(idx),
      sourceAType: p.byeTeam ? "BYE_TEAM" : "WINNER",
      sourceBType: "WINNER",
      sourceATeamNumber: p.byeTeam,
      sourceAMatchNumber: p.byeTeam ? undefined : tieCode(p.r1TieA!),
      sourceBMatchNumber: tieCode(p.byeTeam ? p.r1Tie! : p.r1TieB!),
      downstreamMatchNumber: tieCode(p.ds),
      downstreamSlot: p.dsSlot,
    });
  });

  // Pool B: Ties 43 to 50 (8 ties)
  // Bye teams in Pool B: 28, 31, 34, 37, 40, 43, 46, 49
  const poolBR2 = [
    { num: 43, byeTeam: 28, r1Tie: 10, ds: 71, dsSlot: "A" as const },
    { num: 44, byeTeam: 31, r1Tie: 11, ds: 71, dsSlot: "B" as const },
    { num: 45, byeTeam: 34, r1Tie: 12, ds: 72, dsSlot: "A" as const },
    { num: 46, byeTeam: 37, r1Tie: 13, ds: 72, dsSlot: "B" as const },
    { num: 47, byeTeam: 40, r1Tie: 14, ds: 73, dsSlot: "A" as const },
    { num: 48, byeTeam: 43, r1Tie: 15, ds: 73, dsSlot: "B" as const },
    { num: 49, byeTeam: 46, r1Tie: 16, ds: 74, dsSlot: "A" as const },
    { num: 50, byeTeam: 49, r1Tie: 17, ds: 74, dsSlot: "B" as const },
  ];

  poolBR2.forEach((p, idx) => {
    ties.push({
      tieNumber: p.num,
      matchNumber: tieCode(p.num),
      publicMatchNumber: tieCode(p.num),
      dayId: "OCT18",
      date: "18-10-2026",
      session: "AFTERNOON",
      time: "02:30 PM",
      pool: "B",
      roundStage: "ROUND_2",
      roundName: "Round 2",
      roundOrder: 2,
      court: courtRotate(idx),
      sourceAType: "BYE_TEAM",
      sourceBType: "WINNER",
      sourceATeamNumber: p.byeTeam,
      sourceBMatchNumber: tieCode(p.r1Tie),
      downstreamMatchNumber: tieCode(p.ds),
      downstreamSlot: p.dsSlot,
    });
  });

  // Pool C: Ties 51 to 58 (8 ties)
  // Bye teams in Pool C: 53, 56, 59, 62, 65, 68, 71
  const poolCR2 = [
    { num: 51, byeTeam: 53, r1Tie: 18, ds: 75, dsSlot: "A" as const },
    { num: 52, byeTeam: 56, r1Tie: 19, ds: 75, dsSlot: "B" as const },
    { num: 53, byeTeam: 59, r1Tie: 20, ds: 76, dsSlot: "A" as const },
    { num: 54, byeTeam: 62, r1Tie: 21, ds: 76, dsSlot: "B" as const },
    { num: 55, byeTeam: 65, r1Tie: 22, ds: 77, dsSlot: "A" as const },
    { num: 56, byeTeam: 68, r1Tie: 23, ds: 77, dsSlot: "B" as const },
    { num: 57, byeTeam: 71, r1Tie: 24, ds: 78, dsSlot: "A" as const },
    { num: 58, r1TieA: 25, r1TieB: 26, ds: 78, dsSlot: "B" as const },
  ];

  poolCR2.forEach((p, idx) => {
    ties.push({
      tieNumber: p.num,
      matchNumber: tieCode(p.num),
      publicMatchNumber: tieCode(p.num),
      dayId: "OCT18",
      date: "18-10-2026",
      session: "AFTERNOON",
      time: "02:30 PM",
      pool: "C",
      roundStage: "ROUND_2",
      roundName: "Round 2",
      roundOrder: 2,
      court: courtRotate(idx),
      sourceAType: p.byeTeam ? "BYE_TEAM" : "WINNER",
      sourceBType: "WINNER",
      sourceATeamNumber: p.byeTeam,
      sourceAMatchNumber: p.byeTeam ? undefined : tieCode(p.r1TieA!),
      sourceBMatchNumber: tieCode(p.byeTeam ? p.r1Tie! : p.r1TieB!),
      downstreamMatchNumber: tieCode(p.ds),
      downstreamSlot: p.dsSlot,
    });
  });

  // Pool D: Ties 59 to 66 (8 ties)
  // Bye teams in Pool D: 79, 82, 85, 88, 91, 94, 97, 100
  const poolDR2 = [
    { num: 59, byeTeam: 79, r1Tie: 27, ds: 79, dsSlot: "A" as const },
    { num: 60, byeTeam: 82, r1Tie: 28, ds: 79, dsSlot: "B" as const },
    { num: 61, byeTeam: 85, r1Tie: 29, ds: 80, dsSlot: "A" as const },
    { num: 62, byeTeam: 88, r1Tie: 30, ds: 80, dsSlot: "B" as const },
    { num: 63, byeTeam: 91, r1Tie: 31, ds: 81, dsSlot: "A" as const },
    { num: 64, byeTeam: 94, r1Tie: 32, ds: 81, dsSlot: "B" as const },
    { num: 65, byeTeam: 97, r1Tie: 33, ds: 82, dsSlot: "A" as const },
    { num: 66, byeTeam: 100, r1Tie: 34, ds: 82, dsSlot: "B" as const },
  ];

  poolDR2.forEach((p, idx) => {
    ties.push({
      tieNumber: p.num,
      matchNumber: tieCode(p.num),
      publicMatchNumber: tieCode(p.num),
      dayId: "OCT18",
      date: "18-10-2026",
      session: "AFTERNOON",
      time: "02:30 PM",
      pool: "D",
      roundStage: "ROUND_2",
      roundName: "Round 2",
      roundOrder: 2,
      court: courtRotate(idx),
      sourceAType: "BYE_TEAM",
      sourceBType: "WINNER",
      sourceATeamNumber: p.byeTeam,
      sourceBMatchNumber: tieCode(p.r1Tie),
      downstreamMatchNumber: tieCode(p.ds),
      downstreamSlot: p.dsSlot,
    });
  });

  // ═══════════════════════════════════════════════════════════════════
  // SESSION 3: 19-10-2026 - MORNING (08:30 AM) — 16 TIES (POOL QUARTERS)
  // ═══════════════════════════════════════════════════════════════════

  // Pool A: Ties 67 to 70
  const poolAQF = [
    { num: 67, upA: 35, upB: 36, ds: 83, dsSlot: "A" as const },
    { num: 68, upA: 37, upB: 38, ds: 83, dsSlot: "B" as const },
    { num: 69, upA: 39, upB: 40, ds: 84, dsSlot: "A" as const },
    { num: 70, upA: 41, upB: 42, ds: 84, dsSlot: "B" as const },
  ];
  poolAQF.forEach((p, idx) => {
    ties.push({
      tieNumber: p.num,
      matchNumber: tieCode(p.num),
      publicMatchNumber: tieCode(p.num),
      dayId: "OCT19",
      date: "19-10-2026",
      session: "MORNING",
      time: "08:30 AM",
      pool: "A",
      roundStage: "QUARTER_FINAL",
      roundName: "Pool Quarter-Finals",
      roundOrder: 3,
      court: courtRotate(idx),
      sourceAType: "WINNER",
      sourceBType: "WINNER",
      sourceAMatchNumber: tieCode(p.upA),
      sourceBMatchNumber: tieCode(p.upB),
      downstreamMatchNumber: tieCode(p.ds),
      downstreamSlot: p.dsSlot,
    });
  });

  // Pool B: Ties 71 to 74
  const poolBQF = [
    { num: 71, upA: 43, upB: 44, ds: 85, dsSlot: "A" as const },
    { num: 72, upA: 45, upB: 46, ds: 85, dsSlot: "B" as const },
    { num: 73, upA: 47, upB: 48, ds: 86, dsSlot: "A" as const },
    { num: 74, upA: 49, upB: 50, ds: 86, dsSlot: "B" as const },
  ];
  poolBQF.forEach((p, idx) => {
    ties.push({
      tieNumber: p.num,
      matchNumber: tieCode(p.num),
      publicMatchNumber: tieCode(p.num),
      dayId: "OCT19",
      date: "19-10-2026",
      session: "MORNING",
      time: "08:30 AM",
      pool: "B",
      roundStage: "QUARTER_FINAL",
      roundName: "Pool Quarter-Finals",
      roundOrder: 3,
      court: courtRotate(idx),
      sourceAType: "WINNER",
      sourceBType: "WINNER",
      sourceAMatchNumber: tieCode(p.upA),
      sourceBMatchNumber: tieCode(p.upB),
      downstreamMatchNumber: tieCode(p.ds),
      downstreamSlot: p.dsSlot,
    });
  });

  // Pool C: Ties 75 to 78
  const poolCQF = [
    { num: 75, upA: 51, upB: 52, ds: 87, dsSlot: "A" as const },
    { num: 76, upA: 53, upB: 54, ds: 87, dsSlot: "B" as const },
    { num: 77, upA: 55, upB: 56, ds: 88, dsSlot: "A" as const },
    { num: 78, upA: 57, upB: 58, ds: 88, dsSlot: "B" as const },
  ];
  poolCQF.forEach((p, idx) => {
    ties.push({
      tieNumber: p.num,
      matchNumber: tieCode(p.num),
      publicMatchNumber: tieCode(p.num),
      dayId: "OCT19",
      date: "19-10-2026",
      session: "MORNING",
      time: "08:30 AM",
      pool: "C",
      roundStage: "QUARTER_FINAL",
      roundName: "Pool Quarter-Finals",
      roundOrder: 3,
      court: courtRotate(idx),
      sourceAType: "WINNER",
      sourceBType: "WINNER",
      sourceAMatchNumber: tieCode(p.upA),
      sourceBMatchNumber: tieCode(p.upB),
      downstreamMatchNumber: tieCode(p.ds),
      downstreamSlot: p.dsSlot,
    });
  });

  // Pool D: Ties 79 to 82
  const poolDQF = [
    { num: 79, upA: 59, upB: 60, ds: 89, dsSlot: "A" as const },
    { num: 80, upA: 61, upB: 62, ds: 89, dsSlot: "B" as const },
    { num: 81, upA: 63, upB: 64, ds: 90, dsSlot: "A" as const },
    { num: 82, upA: 65, upB: 66, ds: 90, dsSlot: "B" as const },
  ];
  poolDQF.forEach((p, idx) => {
    ties.push({
      tieNumber: p.num,
      matchNumber: tieCode(p.num),
      publicMatchNumber: tieCode(p.num),
      dayId: "OCT19",
      date: "19-10-2026",
      session: "MORNING",
      time: "08:30 AM",
      pool: "D",
      roundStage: "QUARTER_FINAL",
      roundName: "Pool Quarter-Finals",
      roundOrder: 3,
      court: courtRotate(idx),
      sourceAType: "WINNER",
      sourceBType: "WINNER",
      sourceAMatchNumber: tieCode(p.upA),
      sourceBMatchNumber: tieCode(p.upB),
      downstreamMatchNumber: tieCode(p.ds),
      downstreamSlot: p.dsSlot,
    });
  });

  // ═══════════════════════════════════════════════════════════════════
  // SESSION 4: 19-10-2026 - AFTERNOON (02:00 PM) — 08 TIES (POOL SEMIS)
  // ═══════════════════════════════════════════════════════════════════

  // Pool A: Ties 83 & 84
  ties.push({
    tieNumber: 83,
    matchNumber: tieCode(83),
    publicMatchNumber: tieCode(83),
    dayId: "OCT19",
    date: "19-10-2026",
    session: "AFTERNOON",
    time: "02:00 PM",
    pool: "A",
    roundStage: "SEMI_FINAL",
    roundName: "Pool Semi-Final 1",
    roundOrder: 4,
    court: "Court 01",
    sourceAType: "WINNER",
    sourceBType: "WINNER",
    sourceAMatchNumber: tieCode(67),
    sourceBMatchNumber: tieCode(68),
    downstreamMatchNumber: tieCode(91),
    downstreamSlot: "A",
  });
  ties.push({
    tieNumber: 84,
    matchNumber: tieCode(84),
    publicMatchNumber: tieCode(84),
    dayId: "OCT19",
    date: "19-10-2026",
    session: "AFTERNOON",
    time: "02:00 PM",
    pool: "A",
    roundStage: "SEMI_FINAL",
    roundName: "Pool Semi-Final 2",
    roundOrder: 4,
    court: "Court 02",
    sourceAType: "WINNER",
    sourceBType: "WINNER",
    sourceAMatchNumber: tieCode(69),
    sourceBMatchNumber: tieCode(70),
    downstreamMatchNumber: tieCode(91),
    downstreamSlot: "B",
  });

  // Pool B: Ties 85 & 86
  ties.push({
    tieNumber: 85,
    matchNumber: tieCode(85),
    publicMatchNumber: tieCode(85),
    dayId: "OCT19",
    date: "19-10-2026",
    session: "AFTERNOON",
    time: "02:00 PM",
    pool: "B",
    roundStage: "SEMI_FINAL",
    roundName: "Pool Semi-Final 1",
    roundOrder: 4,
    court: "Court 03",
    sourceAType: "WINNER",
    sourceBType: "WINNER",
    sourceAMatchNumber: tieCode(71),
    sourceBMatchNumber: tieCode(72),
    downstreamMatchNumber: tieCode(92),
    downstreamSlot: "A",
  });
  ties.push({
    tieNumber: 86,
    matchNumber: tieCode(86),
    publicMatchNumber: tieCode(86),
    dayId: "OCT19",
    date: "19-10-2026",
    session: "AFTERNOON",
    time: "02:00 PM",
    pool: "B",
    roundStage: "SEMI_FINAL",
    roundName: "Pool Semi-Final 2",
    roundOrder: 4,
    court: "Court 04",
    sourceAType: "WINNER",
    sourceBType: "WINNER",
    sourceAMatchNumber: tieCode(73),
    sourceBMatchNumber: tieCode(74),
    downstreamMatchNumber: tieCode(92),
    downstreamSlot: "B",
  });

  // Pool C: Ties 87 & 88
  ties.push({
    tieNumber: 87,
    matchNumber: tieCode(87),
    publicMatchNumber: tieCode(87),
    dayId: "OCT19",
    date: "19-10-2026",
    session: "AFTERNOON",
    time: "02:00 PM",
    pool: "C",
    roundStage: "SEMI_FINAL",
    roundName: "Pool Semi-Final 1",
    roundOrder: 4,
    court: "Court 01",
    sourceAType: "WINNER",
    sourceBType: "WINNER",
    sourceAMatchNumber: tieCode(75),
    sourceBMatchNumber: tieCode(76),
    downstreamMatchNumber: tieCode(93),
    downstreamSlot: "A",
  });
  ties.push({
    tieNumber: 88,
    matchNumber: tieCode(88),
    publicMatchNumber: tieCode(88),
    dayId: "OCT19",
    date: "19-10-2026",
    session: "AFTERNOON",
    time: "02:00 PM",
    pool: "C",
    roundStage: "SEMI_FINAL",
    roundName: "Pool Semi-Final 2",
    roundOrder: 4,
    court: "Court 02",
    sourceAType: "WINNER",
    sourceBType: "WINNER",
    sourceAMatchNumber: tieCode(77),
    sourceBMatchNumber: tieCode(78),
    downstreamMatchNumber: tieCode(93),
    downstreamSlot: "B",
  });

  // Pool D: Ties 89 & 90
  ties.push({
    tieNumber: 89,
    matchNumber: tieCode(89),
    publicMatchNumber: tieCode(89),
    dayId: "OCT19",
    date: "19-10-2026",
    session: "AFTERNOON",
    time: "02:00 PM",
    pool: "D",
    roundStage: "SEMI_FINAL",
    roundName: "Pool Semi-Final 1",
    roundOrder: 4,
    court: "Court 03",
    sourceAType: "WINNER",
    sourceBType: "WINNER",
    sourceAMatchNumber: tieCode(79),
    sourceBMatchNumber: tieCode(80),
    downstreamMatchNumber: tieCode(94),
    downstreamSlot: "A",
  });
  ties.push({
    tieNumber: 90,
    matchNumber: tieCode(90),
    publicMatchNumber: tieCode(90),
    dayId: "OCT19",
    date: "19-10-2026",
    session: "AFTERNOON",
    time: "02:00 PM",
    pool: "D",
    roundStage: "SEMI_FINAL",
    roundName: "Pool Semi-Final 2",
    roundOrder: 4,
    court: "Court 04",
    sourceAType: "WINNER",
    sourceBType: "WINNER",
    sourceAMatchNumber: tieCode(81),
    sourceBMatchNumber: tieCode(82),
    downstreamMatchNumber: tieCode(94),
    downstreamSlot: "B",
  });

  // ═══════════════════════════════════════════════════════════════════
  // SESSION 5: 19-10-2026 - EVENING (Time will be informed) — 04 TIES (POOL FINALS)
  // ═══════════════════════════════════════════════════════════════════

  // Pool A Final: Tie 91
  ties.push({
    tieNumber: 91,
    matchNumber: tieCode(91),
    publicMatchNumber: tieCode(91),
    dayId: "OCT19",
    date: "19-10-2026",
    session: "EVENING",
    time: "Time will be informed",
    pool: "A",
    roundStage: "POOL_FINAL",
    roundName: "Pool A Final",
    roundOrder: 5,
    court: "Court 01",
    sourceAType: "WINNER",
    sourceBType: "WINNER",
    sourceAMatchNumber: tieCode(83),
    sourceBMatchNumber: tieCode(84),
    downstreamMatchNumber: tieCode(95),
    downstreamSlot: "A",
  });

  // Pool B Final: Tie 92
  ties.push({
    tieNumber: 92,
    matchNumber: tieCode(92),
    publicMatchNumber: tieCode(92),
    dayId: "OCT19",
    date: "19-10-2026",
    session: "EVENING",
    time: "Time will be informed",
    pool: "B",
    roundStage: "POOL_FINAL",
    roundName: "Pool B Final",
    roundOrder: 5,
    court: "Court 02",
    sourceAType: "WINNER",
    sourceBType: "WINNER",
    sourceAMatchNumber: tieCode(85),
    sourceBMatchNumber: tieCode(86),
    downstreamMatchNumber: tieCode(96),
    downstreamSlot: "A",
  });

  // Pool C Final: Tie 93
  ties.push({
    tieNumber: 93,
    matchNumber: tieCode(93),
    publicMatchNumber: tieCode(93),
    dayId: "OCT19",
    date: "19-10-2026",
    session: "EVENING",
    time: "Time will be informed",
    pool: "C",
    roundStage: "POOL_FINAL",
    roundName: "Pool C Final",
    roundOrder: 5,
    court: "Court 03",
    sourceAType: "WINNER",
    sourceBType: "WINNER",
    sourceAMatchNumber: tieCode(87),
    sourceBMatchNumber: tieCode(88),
    downstreamMatchNumber: tieCode(97),
    downstreamSlot: "A",
  });

  // Pool D Final: Tie 94
  ties.push({
    tieNumber: 94,
    matchNumber: tieCode(94),
    publicMatchNumber: tieCode(94),
    dayId: "OCT19",
    date: "19-10-2026",
    session: "EVENING",
    time: "Time will be informed",
    pool: "D",
    roundStage: "POOL_FINAL",
    roundName: "Pool D Final",
    roundOrder: 5,
    court: "Court 04",
    sourceAType: "WINNER",
    sourceBType: "WINNER",
    sourceAMatchNumber: tieCode(89),
    sourceBMatchNumber: tieCode(90),
    downstreamMatchNumber: tieCode(98),
    downstreamSlot: "A",
  });

  // ═══════════════════════════════════════════════════════════════════
  // SESSION 6: 20-10-2026 - MORNING (09:00 AM) — 04 TIES (SUPER QUARTERS)
  // ═══════════════════════════════════════════════════════════════════

  ties.push({
    tieNumber: 95,
    matchNumber: tieCode(95),
    publicMatchNumber: tieCode(95),
    dayId: "OCT20",
    date: "20-10-2026",
    session: "MORNING",
    time: "09:00 AM",
    pool: "A",
    roundStage: "SUPER_QUARTERS",
    roundName: "Super Quarter 1 (Pool A Winner)",
    roundOrder: 6,
    court: "Court 01",
    sourceAType: "WINNER",
    sourceBType: "WINNER",
    sourceAMatchNumber: tieCode(91),
    downstreamMatchNumber: tieCode(99),
    downstreamSlot: "A",
  });

  ties.push({
    tieNumber: 96,
    matchNumber: tieCode(96),
    publicMatchNumber: tieCode(96),
    dayId: "OCT20",
    date: "20-10-2026",
    session: "MORNING",
    time: "09:00 AM",
    pool: "B",
    roundStage: "SUPER_QUARTERS",
    roundName: "Super Quarter 2 (Pool B Winner)",
    roundOrder: 6,
    court: "Court 02",
    sourceAType: "WINNER",
    sourceBType: "WINNER",
    sourceAMatchNumber: tieCode(92),
    downstreamMatchNumber: tieCode(99),
    downstreamSlot: "B",
  });

  ties.push({
    tieNumber: 97,
    matchNumber: tieCode(97),
    publicMatchNumber: tieCode(97),
    dayId: "OCT20",
    date: "20-10-2026",
    session: "MORNING",
    time: "09:00 AM",
    pool: "C",
    roundStage: "SUPER_QUARTERS",
    roundName: "Super Quarter 3 (Pool C Winner)",
    roundOrder: 6,
    court: "Court 03",
    sourceAType: "WINNER",
    sourceBType: "WINNER",
    sourceAMatchNumber: tieCode(93),
    downstreamMatchNumber: tieCode(100),
    downstreamSlot: "A",
  });

  ties.push({
    tieNumber: 98,
    matchNumber: tieCode(98),
    publicMatchNumber: tieCode(98),
    dayId: "OCT20",
    date: "20-10-2026",
    session: "MORNING",
    time: "09:00 AM",
    pool: "D",
    roundStage: "SUPER_QUARTERS",
    roundName: "Super Quarter 4 (Pool D Winner)",
    roundOrder: 6,
    court: "Court 04",
    sourceAType: "WINNER",
    sourceBType: "WINNER",
    sourceAMatchNumber: tieCode(94),
    downstreamMatchNumber: tieCode(100),
    downstreamSlot: "B",
  });

  // ═══════════════════════════════════════════════════════════════════
  // SESSION 7: 20-10-2026 - EVENING (03:00 PM) — 02 TIES (SEMI-FINALS)
  // ═══════════════════════════════════════════════════════════════════

  ties.push({
    tieNumber: 99,
    matchNumber: tieCode(99),
    publicMatchNumber: tieCode(99),
    dayId: "OCT20",
    date: "20-10-2026",
    session: "EVENING",
    time: "03:00 PM",
    pool: "CHAMPIONSHIP",
    roundStage: "CHAMPIONSHIP_SEMI_FINAL",
    roundName: "Semi-Final 1",
    roundOrder: 7,
    court: "Court 01",
    sourceAType: "WINNER",
    sourceBType: "WINNER",
    sourceAMatchNumber: tieCode(95),
    sourceBMatchNumber: tieCode(96),
    downstreamMatchNumber: tieCode(101),
    downstreamSlot: "A",
    loserDownstreamMatchNumber: tieCode(102),
    loserDownstreamSlot: "A",
  });

  ties.push({
    tieNumber: 100,
    matchNumber: tieCode(100),
    publicMatchNumber: tieCode(100),
    dayId: "OCT20",
    date: "20-10-2026",
    session: "EVENING",
    time: "03:00 PM",
    pool: "CHAMPIONSHIP",
    roundStage: "CHAMPIONSHIP_SEMI_FINAL",
    roundName: "Semi-Final 2",
    roundOrder: 7,
    court: "Court 02",
    sourceAType: "WINNER",
    sourceBType: "WINNER",
    sourceAMatchNumber: tieCode(97),
    sourceBMatchNumber: tieCode(98),
    downstreamMatchNumber: tieCode(101),
    downstreamSlot: "B",
    loserDownstreamMatchNumber: tieCode(102),
    loserDownstreamSlot: "B",
  });

  // ═══════════════════════════════════════════════════════════════════
  // SESSION 8: 21-10-2026 - MORNING (09:00 AM) — 02 TIES (FINALS & HARDLINE)
  // ═══════════════════════════════════════════════════════════════════

  ties.push({
    tieNumber: 101,
    matchNumber: tieCode(101),
    publicMatchNumber: tieCode(101),
    dayId: "OCT21",
    date: "21-10-2026",
    session: "MORNING",
    time: "09:00 AM",
    pool: "CHAMPIONSHIP",
    roundStage: "GRAND_FINAL",
    roundName: "Championship Final",
    roundOrder: 8,
    court: "Court 01",
    sourceAType: "WINNER",
    sourceBType: "WINNER",
    sourceAMatchNumber: tieCode(99),
    sourceBMatchNumber: tieCode(100),
  });

  ties.push({
    tieNumber: 102,
    matchNumber: `${tieCode(102)} (Hardline Tie)`,
    publicMatchNumber: tieCode(102),
    dayId: "OCT21",
    date: "21-10-2026",
    session: "MORNING",
    time: "09:00 AM",
    pool: "CHAMPIONSHIP",
    roundStage: "HARDLINE_TIE",
    roundName: "Hardline Tie (LSF - 3rd Place)",
    roundOrder: 8,
    court: "Court 02",
    sourceAType: "LOSER",
    sourceBType: "LOSER",
    sourceAMatchNumber: tieCode(99),
    sourceBMatchNumber: tieCode(100),
  });

  return ties;
}

export const OFFICIAL_TIES = buildOfficialTies();

