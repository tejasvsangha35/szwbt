/**
 * Authoritative Master Institution & University Data for SZWBT 2026
 *
 * Implements canonical state normalization rules:
 * - Andhra Pradesh
 * - Karnataka
 * - Kerala
 * - Tamil Nadu
 * - Telangana
 * - Puducherry
 *
 * Spreadsheet variations normalized:
 * - Karnatak -> Karnataka
 * - Andhra pradesh -> Andhra Pradesh
 * - Telanagana -> Telangana
 * - Tamilnadu -> Tamil Nadu
 * - Pondicherry -> Puducherry
 */

export const CANONICAL_STATES = [
  "Andhra Pradesh",
  "Karnataka",
  "Kerala",
  "Puducherry",
  "Tamil Nadu",
  "Telangana",
] as const;

export type CanonicalState = (typeof CANONICAL_STATES)[number];

export const UNRESOLVED_STATE = "State not specified";

/**
 * Normalizes state names to prevent duplicate state entries caused by spelling or capitalization variations.
 */
export function normalizeStateName(state: string | null | undefined): string {
  if (!state) return "";
  const trimmed = state.trim();
  const lower = trimmed.toLowerCase().replace(/[\s_-]+/g, " ");

  if (lower === "karnatak" || lower === "karnataka") return "Karnataka";
  if (lower === "andhra pradesh" || lower === "andhrapradesh" || lower === "ap") return "Andhra Pradesh";
  if (lower === "telanagana" || lower === "telangana" || lower === "ts") return "Telangana";
  if (lower === "tamilnadu" || lower === "tamil nadu" || lower === "tn") return "Tamil Nadu";
  if (lower === "kerala" || lower === "ker") return "Kerala";
  if (lower === "puducherry" || lower === "pondicherry" || lower === "py") return "Puducherry";

  if (lower === "state not specified" || lower === "unresolved" || lower === "unassigned") {
    return UNRESOLVED_STATE;
  }

  return trimmed;
}

export interface MasterInstitution {
  institutionCode: string;
  name: string;
  state: string;
  city?: string;
  district?: string;
  status: "ACTIVE" | "PENDING_ASSIGNMENT" | "INACTIVE";
  notes?: string;
}

export const MASTER_INSTITUTIONS: MasterInstitution[] = [
  // ==========================================
  // ANDHRA PRADESH (Canonical State)
  // ==========================================
  {
    institutionCode: "AND001",
    name: "Acharya Nagarjuna University, Guntur",
    state: "Andhra Pradesh",
    city: "Guntur",
    district: "Guntur",
    status: "ACTIVE",
  },
  {
    institutionCode: "AND002",
    name: "Adikavi Nannaya University, Rajamahendravaram",
    state: "Andhra Pradesh",
    city: "Rajamahendravaram",
    district: "East Godavari",
    status: "ACTIVE",
  },
  {
    institutionCode: "AND003",
    name: "Apollo University, Chitturu",
    state: "Andhra Pradesh",
    city: "Chitturu",
    district: "Chittoor",
    status: "ACTIVE",
  },
  {
    institutionCode: "AND004",
    name: "Dr. NTR university of Health Sciences, Vijayawada",
    state: "Andhra Pradesh",
    city: "Vijayawada",
    district: "NTR",
    status: "ACTIVE",
  },
  {
    institutionCode: "AND005",
    name: "GITAM Deemed to be University, Visakhapatnam",
    state: "Andhra Pradesh",
    city: "Visakhapatnam",
    district: "Visakhapatnam",
    status: "ACTIVE",
  },
  {
    institutionCode: "AND006",
    name: "Jawaharlal Nehru Technological University, Ananthpura",
    state: "Andhra Pradesh",
    city: "Ananthpura",
    district: "Anantapur",
    status: "ACTIVE",
  },
  {
    institutionCode: "AND007",
    name: "Jawaharlal Nehru Technological University, Gurujada Vizianagaram",
    state: "Andhra Pradesh",
    city: "Vizianagaram",
    district: "Vizianagaram",
    status: "ACTIVE",
  },
  {
    institutionCode: "AND008",
    name: "Jawaharlal Nehru Technological University, Kakinada",
    state: "Andhra Pradesh",
    city: "Kakinada",
    district: "Kakinada",
    status: "ACTIVE",
  },
  {
    institutionCode: "AND009",
    name: "KLEF Deemed to be University, Vaddeshwaram",
    state: "Andhra Pradesh",
    city: "Vaddeshwaram",
    district: "Guntur",
    status: "ACTIVE",
  },
  {
    institutionCode: "AND010",
    name: "Krishna University, Machalipattanam",
    state: "Andhra Pradesh",
    city: "Machalipattanam",
    district: "Krishna",
    status: "ACTIVE",
  },
  {
    institutionCode: "AND011",
    name: "Mohan Babu University, Tirupati",
    state: "Andhra Pradesh",
    city: "Tirupati",
    district: "Tirupati",
    status: "ACTIVE",
  },
  {
    institutionCode: "AND012",
    name: "Rayalaseema University, Karnool",
    state: "Andhra Pradesh",
    city: "Karnool",
    district: "Kurnool",
    status: "ACTIVE",
  },
  {
    institutionCode: "AND013",
    name: "Siddharth Academy of Higher Education,Deemed to be University, Vijayawada",
    state: "Andhra Pradesh",
    city: "Vijayawada",
    district: "NTR",
    status: "ACTIVE",
  },
  {
    institutionCode: "AND014",
    name: "Sri Krishnadevaraya University, Anantapura",
    state: "Andhra Pradesh",
    city: "Anantapura",
    district: "Anantapur",
    status: "ACTIVE",
  },
  {
    institutionCode: "AND015",
    name: "Sri Venkateshwar University, Tirupati",
    state: "Andhra Pradesh",
    city: "Tirupati",
    district: "Tirupati",
    status: "ACTIVE",
  },
  {
    institutionCode: "AND016",
    name: "Vighnan's foundation of Science",
    state: "Andhra Pradesh",
    city: "Guntur",
    district: "Guntur",
    status: "ACTIVE",
  },
  {
    institutionCode: "AND017",
    name: "Vikram Simhapuri University, Nellore",
    state: "Andhra Pradesh",
    city: "Nellore",
    district: "SPSR Nellore",
    status: "ACTIVE",
  },
  {
    institutionCode: "AND018",
    name: "VIT- AP University, Vijayawada",
    state: "Andhra Pradesh",
    city: "Vijayawada",
    district: "Amaravati",
    status: "ACTIVE",
  },
  {
    institutionCode: "AND019",
    name: "Yogi Vemana University, Kadapa",
    state: "Andhra Pradesh",
    city: "Kadapa",
    district: "YSR Kadapa",
    status: "ACTIVE",
  },
  // Preserved existing university from project master
  {
    institutionCode: "AND020",
    name: "Andhra University",
    state: "Andhra Pradesh",
    city: "Visakhapatnam",
    district: "Visakhapatnam",
    status: "ACTIVE",
    notes: "Preserved existing university from baseline repository configuration",
  },

  // ==========================================
  // KARNATAKA (Canonical State)
  // ==========================================
  {
    institutionCode: "KAR001",
    name: "Adikavi Shri Maharshi Valmiki University, Raichur",
    state: "Karnataka",
    city: "Raichur",
    district: "Raichur",
    status: "ACTIVE",
  },
  {
    institutionCode: "KAR002",
    name: "Bagalkot University, Jamakhandi",
    state: "Karnataka",
    city: "Jamakhandi",
    district: "Bagalkot",
    status: "ACTIVE",
  },
  {
    institutionCode: "KAR003",
    name: "Bangalore University, Bangaluru",
    state: "Karnataka",
    city: "Bangaluru",
    district: "Bengaluru Urban",
    status: "ACTIVE",
  },
  {
    institutionCode: "KAR004",
    name: "Bengaluru North University, Kolar",
    state: "Karnataka",
    city: "Kolar",
    district: "Kolar",
    status: "ACTIVE",
  },
  {
    institutionCode: "KAR005",
    name: "Central University of Karnataka, Gulbarga",
    state: "Karnataka",
    city: "Gulbarga",
    district: "Kalaburagi",
    status: "ACTIVE",
  },
  {
    institutionCode: "KAR006",
    name: "Chamarajnagara University, Chamarajnagara",
    state: "Karnataka",
    city: "Chamarajnagara",
    district: "Chamarajanagar",
    status: "ACTIVE",
  },
  {
    institutionCode: "KAR007",
    name: "Chanakya University, Bengaluru",
    state: "Karnataka",
    city: "Bengaluru",
    district: "Bengaluru Urban",
    status: "ACTIVE",
  },
  {
    institutionCode: "KAR008",
    name: "Christ University, Bengaluru",
    state: "Karnataka",
    city: "Bengaluru",
    district: "Bengaluru Urban",
    status: "ACTIVE",
  },
  {
    institutionCode: "KAR009",
    name: "Davangere University, Davangere",
    state: "Karnataka",
    city: "Davangere",
    district: "Davanagere",
    status: "ACTIVE",
  },
  {
    institutionCode: "KAR010",
    name: "Dr. Manmohan Singh Bengaluru City University, Bengaluru",
    state: "Karnataka",
    city: "Bengaluru",
    district: "Bengaluru Urban",
    status: "ACTIVE",
  },
  {
    institutionCode: "KAR011",
    name: "Gulbarga University, Gulbarga",
    state: "Karnataka",
    city: "Gulbarga",
    district: "Kalaburagi",
    status: "ACTIVE",
  },
  {
    institutionCode: "KAR012",
    name: "Hassan University, Hassan",
    state: "Karnataka",
    city: "Hassan",
    district: "Hassan",
    status: "ACTIVE",
  },
  {
    institutionCode: "KAR013",
    name: "Haveri University, Haveri",
    state: "Karnataka",
    city: "Haveri",
    district: "Haveri",
    status: "ACTIVE",
  },
  {
    institutionCode: "KAR014",
    name: "Jain Deemed to be University, Bangaluru",
    state: "Karnataka",
    city: "Bangaluru",
    district: "Bengaluru Urban",
    status: "ACTIVE",
  },
  {
    institutionCode: "KAR015",
    name: "JSS Academy of Higher Education & Research, Mysuru",
    state: "Karnataka",
    city: "Mysuru",
    district: "Mysuru",
    status: "ACTIVE",
  },
  {
    institutionCode: "KAR016",
    name: "Karnatak University, Dharwad",
    state: "Karnataka",
    city: "Dharwad",
    district: "Dharwad",
    status: "ACTIVE",
  },
  {
    institutionCode: "KAR017",
    name: "Karnataka Sate Law University, Hubballi",
    state: "Karnataka",
    city: "Hubballi",
    district: "Dharwad",
    status: "ACTIVE",
  },
  {
    institutionCode: "KAR018",
    name: "Karnataka State Akkamahadevi University, Vijayapura",
    state: "Karnataka",
    city: "Vijayapura",
    district: "Vijayapura",
    status: "ACTIVE",
  },
  {
    institutionCode: "KAR019",
    name: "Kitturu Rani Channamma University, Belagavi",
    state: "Karnataka",
    city: "Belagavi",
    district: "Belagavi",
    status: "ACTIVE",
  },
  {
    institutionCode: "KAR020",
    name: "KLE Academy of Higher Education & Research (Deemed to be University)",
    state: "Karnataka",
    city: "Belagavi",
    district: "Belagavi",
    status: "ACTIVE",
  },
  {
    institutionCode: "KAR021",
    name: "KLE Technological University, Hubballi",
    state: "Karnataka",
    city: "Hubballi",
    district: "Dharwad",
    status: "ACTIVE",
  },
  {
    institutionCode: "KAR022",
    name: "Kristu Jayanti Deemed to be University, Bengaluru",
    state: "Karnataka",
    city: "Bengaluru",
    district: "Bengaluru Urban",
    status: "ACTIVE",
  },
  {
    institutionCode: "KAR023",
    name: "Kuvempu University, Shivamogga",
    state: "Karnataka",
    city: "Shivamogga",
    district: "Shivamogga",
    status: "ACTIVE",
  },
  {
    institutionCode: "KAR024",
    name: "Maharani Cluster University, Bengaluru",
    state: "Karnataka",
    city: "Bengaluru",
    district: "Bengaluru Urban",
    status: "ACTIVE",
  },
  {
    institutionCode: "KAR025",
    name: "Mangalore University, Mangaluru",
    state: "Karnataka",
    city: "Mangaluru",
    district: "Dakshina Kannada",
    status: "ACTIVE",
  },
  {
    institutionCode: "KAR026",
    name: "Manipal Academy of Higher Education, Manipal",
    state: "Karnataka",
    city: "Manipal",
    district: "Udupi",
    status: "ACTIVE",
  },
  {
    institutionCode: "KAR027",
    name: "Nitte Deemed to be University, Mangaluru",
    state: "Karnataka",
    city: "Mangaluru",
    district: "Dakshina Kannada",
    status: "ACTIVE",
  },
  {
    institutionCode: "KAR028",
    name: "PES University, Bengaluru",
    state: "Karnataka",
    city: "Bengaluru",
    district: "Bengaluru Urban",
    status: "ACTIVE",
  },
  {
    institutionCode: "KAR029",
    name: "Presidency University, Bangaluru",
    state: "Karnataka",
    city: "Bangaluru",
    district: "Bengaluru Urban",
    status: "ACTIVE",
  },
  {
    institutionCode: "KAR030",
    name: "Rajiv Gandhi University of Health Sciences, Bengaluru",
    state: "Karnataka",
    city: "Bengaluru",
    district: "Bengaluru Urban",
    status: "ACTIVE",
  },
  {
    institutionCode: "KAR031",
    name: "Reva University, Bangaluru",
    state: "Karnataka",
    city: "Bangaluru",
    district: "Bengaluru Urban",
    status: "ACTIVE",
  },
  {
    institutionCode: "KAR032",
    name: "RV University, Bengaluru",
    state: "Karnataka",
    city: "Bengaluru",
    district: "Bengaluru Urban",
    status: "ACTIVE",
  },
  {
    institutionCode: "KAR033",
    name: "Shri Dharmasthala Manjunatheshwara University, Dharwad",
    state: "Karnataka",
    city: "Dharwad",
    district: "Dharwad",
    status: "ACTIVE",
  },
  {
    institutionCode: "KAR034",
    name: "St. Joseph University, Bengaluru",
    state: "Karnataka",
    city: "Bengaluru",
    district: "Bengaluru Urban",
    status: "ACTIVE",
  },
  {
    institutionCode: "KAR035",
    name: "Tumkur University, Tumkur",
    state: "Karnataka",
    city: "Tumkur",
    district: "Tumakuru",
    status: "ACTIVE",
  },
  {
    institutionCode: "KAR036",
    name: "University of Agricultural Sciences, Bangaluru",
    state: "Karnataka",
    city: "Bangaluru",
    district: "Bengaluru Urban",
    status: "ACTIVE",
  },
  {
    institutionCode: "KAR037",
    name: "University of Agricultural Sciences, Dharwad",
    state: "Karnataka",
    city: "Dharwad",
    district: "Dharwad",
    status: "ACTIVE",
  },
  {
    institutionCode: "KAR038",
    name: "University of Mysore, Mysuru",
    state: "Karnataka",
    city: "Mysuru",
    district: "Mysuru",
    status: "ACTIVE",
  },
  {
    institutionCode: "KAR039",
    name: "Vijayanagara Sri Krishnadevaraya University, Ballari",
    state: "Karnataka",
    city: "Ballari",
    district: "Ballari",
    status: "ACTIVE",
  },
  {
    institutionCode: "KAR040",
    name: "Vishweshwarayya Technological University, Belagavi",
    state: "Karnataka",
    city: "Belagavi",
    district: "Belagavi",
    status: "ACTIVE",
  },

  // ==========================================
  // KERALA (Canonical State)
  // ==========================================
  {
    institutionCode: "KER001",
    name: "APJ Abdul Kalam University, Tiruvananthpuram",
    state: "Kerala",
    city: "Tiruvananthpuram",
    district: "Thiruvananthapuram",
    status: "ACTIVE",
  },
  {
    institutionCode: "KER002",
    name: "Chinmay Vishwavidyapeetham",
    state: "Kerala",
    city: "Ernakulam",
    district: "Ernakulam",
    status: "ACTIVE",
  },
  {
    institutionCode: "KER003",
    name: "Coachin University of Science & Technology, Coachin",
    state: "Kerala",
    city: "Coachin",
    district: "Ernakulam",
    status: "ACTIVE",
  },
  {
    institutionCode: "KER004",
    name: "Kannur University, Kannur",
    state: "Kerala",
    city: "Kannur",
    district: "Kannur",
    status: "ACTIVE",
  },
  {
    institutionCode: "KER005",
    name: "Kerala Agricultural University",
    state: "Kerala",
    city: "Thrissur",
    district: "Thrissur",
    status: "ACTIVE",
  },
  {
    institutionCode: "KER006",
    name: "Kerala University of Health Sciences, Thrissur",
    state: "Kerala",
    city: "Thrissur",
    district: "Thrissur",
    status: "ACTIVE",
  },
  {
    institutionCode: "KER007",
    name: "Sree Sankaracharya University of Sanskrit, Kalady",
    state: "Kerala",
    city: "Kalady",
    district: "Ernakulam",
    status: "ACTIVE",
  },
  {
    institutionCode: "KER008",
    name: "University of Calicut, Calicut",
    state: "Kerala",
    city: "Calicut",
    district: "Malappuram",
    status: "ACTIVE",
  },
  {
    institutionCode: "KER009",
    name: "University of Kerala",
    state: "Kerala",
    city: "Thiruvananthapuram",
    district: "Thiruvananthapuram",
    status: "ACTIVE",
  },

  // ==========================================
  // TAMIL NADU (Canonical State)
  // ==========================================
  {
    institutionCode: "TAM001",
    name: "Alagappa University, Karaikudi",
    state: "Tamil Nadu",
    city: "Karaikudi",
    district: "Sivaganga",
    status: "ACTIVE",
  },
  {
    institutionCode: "TAM002",
    name: "Amrita Vishwavidyapeetham, Coimbatore",
    state: "Tamil Nadu",
    city: "Coimbatore",
    district: "Coimbatore",
    status: "ACTIVE",
  },
  {
    institutionCode: "TAM003",
    name: "Anna University, Chennai",
    state: "Tamil Nadu",
    city: "Chennai",
    district: "Chennai",
    status: "ACTIVE",
  },
  {
    institutionCode: "TAM004",
    name: "Annamalai University, Chidambaram",
    state: "Tamil Nadu",
    city: "Chidambaram",
    district: "Cuddalore",
    status: "ACTIVE",
  },
  {
    institutionCode: "TAM005",
    name: "B S Abdur Rehman Cresent Institute of Science & Technology",
    state: "Tamil Nadu",
    city: "Chennai",
    district: "Chengalpattu",
    status: "ACTIVE",
  },
  {
    institutionCode: "TAM006",
    name: "Bharathiar University, Coimbatore",
    state: "Tamil Nadu",
    city: "Coimbatore",
    district: "Coimbatore",
    status: "ACTIVE",
  },
  {
    institutionCode: "TAM007",
    name: "Bharathidasan University, Tiruchirapalli",
    state: "Tamil Nadu",
    city: "Tiruchirapalli",
    district: "Tiruchirappalli",
    status: "ACTIVE",
  },
  {
    institutionCode: "TAM008",
    name: "Central University of Tamilnadu",
    state: "Tamil Nadu",
    city: "Thiruvarur",
    district: "Thiruvarur",
    status: "ACTIVE",
  },
  {
    institutionCode: "TAM009",
    name: "Dr. MGR Educational & Research institute",
    state: "Tamil Nadu",
    city: "Chennai",
    district: "Chennai",
    status: "ACTIVE",
  },
  {
    institutionCode: "TAM010",
    name: "Hindustan Institute of Technology & Science, Chennai",
    state: "Tamil Nadu",
    city: "Chennai",
    district: "Chengalpattu",
    status: "ACTIVE",
  },
  {
    institutionCode: "TAM011",
    name: "Indian Institute of Technology, Madras, Chennai",
    state: "Tamil Nadu",
    city: "Chennai",
    district: "Chennai",
    status: "ACTIVE",
  },
  {
    institutionCode: "TAM012",
    name: "Madurai Kamaraj University, Madurai",
    state: "Tamil Nadu",
    city: "Madurai",
    district: "Madurai",
    status: "ACTIVE",
  },
  {
    institutionCode: "TAM013",
    name: "Manonmaniam Sundaranar University, Tirunalveli",
    state: "Tamil Nadu",
    city: "Tirunalveli",
    district: "Tirunelveli",
    status: "ACTIVE",
  },
  {
    institutionCode: "TAM014",
    name: "Mother Teresa Women’s University, Kodaikanal",
    state: "Tamil Nadu",
    city: "Kodaikanal",
    district: "Dindigul",
    status: "ACTIVE",
  },
  {
    institutionCode: "TAM015",
    name: "Periyar University, Salem",
    state: "Tamil Nadu",
    city: "Salem",
    district: "Salem",
    status: "ACTIVE",
  },
  {
    institutionCode: "TAM016",
    name: "Saveetha Institute of Medical & technical Sciences, Chennai",
    state: "Tamil Nadu",
    city: "Chennai",
    district: "Poonamallee",
    status: "ACTIVE",
  },
  {
    institutionCode: "TAM017",
    name: "SRM University, Kottankulathur",
    state: "Tamil Nadu",
    city: "Kottankulathur",
    district: "Chengalpattu",
    status: "ACTIVE",
  },
  {
    institutionCode: "TAM018",
    name: "Tamilnadu Physical Education & Sports University, Chennai",
    state: "Tamil Nadu",
    city: "Chennai",
    district: "Chennai",
    status: "ACTIVE",
  },
  {
    institutionCode: "TAM019",
    name: "The Tamilnadu Dr. Ambedkar Law University, Chennai",
    state: "Tamil Nadu",
    city: "Chennai",
    district: "Chennai",
    status: "ACTIVE",
  },
  {
    institutionCode: "TAM020",
    name: "Thiruvalluvar University, Vellore",
    state: "Tamil Nadu",
    city: "Vellore",
    district: "Vellore",
    status: "ACTIVE",
  },
  {
    institutionCode: "TAM021",
    name: "University of Madras, Chennai",
    state: "Tamil Nadu",
    city: "Chennai",
    district: "Chennai",
    status: "ACTIVE",
  },
  {
    institutionCode: "TAM022",
    name: "Vellore Institute of Technology, Vellore",
    state: "Tamil Nadu",
    city: "Vellore",
    district: "Vellore",
    status: "ACTIVE",
  },
  {
    institutionCode: "TAM023",
    name: "Vinayak Mission Research Foundation",
    state: "Tamil Nadu",
    city: "Salem",
    district: "Salem",
    status: "ACTIVE",
  },

  // ==========================================
  // TELANGANA (Canonical State)
  // ==========================================
  {
    institutionCode: "TEL001",
    name: "Jawaharlal Nehru Technological University, Hyderbad",
    state: "Telangana",
    city: "Hyderbad",
    district: "Hyderabad",
    status: "ACTIVE",
  },
  {
    institutionCode: "TEL002",
    name: "Kakatiya University, Warangal",
    state: "Telangana",
    city: "Warangal",
    district: "Hanamkonda",
    status: "ACTIVE",
  },
  {
    institutionCode: "TEL003",
    name: "Malla Reddy Vishwavidyapeeth Deemed to be University, Hyderabad",
    state: "Telangana",
    city: "Hyderabad",
    district: "Medchal-Malkajgiri",
    status: "ACTIVE",
  },
  {
    institutionCode: "TEL004",
    name: "Osmania University, Hyderabad",
    state: "Telangana",
    city: "Hyderabad",
    district: "Hyderabad",
    status: "ACTIVE",
  },
  {
    institutionCode: "TEL005",
    name: "University of Hyderabad, Hyderabad",
    state: "Telangana",
    city: "Hyderabad",
    district: "Hyderabad",
    status: "ACTIVE",
  },
  {
    institutionCode: "TEL006",
    name: "Veeranari Chakali Ilamma University, Hyderabad",
    state: "Telangana",
    city: "Hyderabad",
    district: "Hyderabad",
    status: "ACTIVE",
  },
  {
    institutionCode: "TEL007",
    name: "Woxen University, Hydrabad",
    state: "Telangana",
    city: "Hydrabad",
    district: "Sangareddy",
    status: "ACTIVE",
  },

  // ==========================================
  // PUDUCHERRY (Canonical State)
  // ==========================================
  {
    institutionCode: "PON001",
    name: "Pondicherry University, Puducherry",
    state: "Puducherry",
    city: "Puducherry",
    district: "Puducherry",
    status: "ACTIVE",
  },

  // ==========================================
  // UNRESOLVED / STATE NOT SPECIFIED
  // Kept in a separate unresolved entry flagged for manual assignment
  // ==========================================
  {
    institutionCode: "UNR001",
    name: "Mahatma Gandhi University",
    state: "State not specified",
    city: undefined,
    district: undefined,
    status: "PENDING_ASSIGNMENT",
    notes: "FLAGGED_FOR_MANUAL_ASSIGNMENT: State not specified in source spreadsheet. Requires manual assignment between regional campuses (e.g., Kottayam, Kerala vs. Nalgonda, Telangana).",
  },
];

/**
 * Helper to fetch institutions by normalized state.
 */
export function getInstitutionsByState(state: string, status?: string): MasterInstitution[] {
  const norm = normalizeStateName(state);
  return MASTER_INSTITUTIONS.filter((inst) => {
    const matchState = !norm || norm === "ALL" || inst.state === norm;
    const matchStatus = !status || status === "ALL" || inst.status === status;
    return matchState && matchStatus;
  }).sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Helper to search institutions across name, code, and city.
 */
export function searchMasterInstitutions(query: string, state?: string): MasterInstitution[] {
  const q = query.trim().toLowerCase();
  const stateNorm = state ? normalizeStateName(state) : "";

  return MASTER_INSTITUTIONS.filter((inst) => {
    if (stateNorm && stateNorm !== "ALL" && inst.state !== stateNorm) return false;
    if (!q) return true;
    return (
      inst.name.toLowerCase().includes(q) ||
      inst.institutionCode.toLowerCase().includes(q) ||
      (inst.city && inst.city.toLowerCase().includes(q))
    );
  }).sort((a, b) => a.name.localeCompare(b.name));
}
