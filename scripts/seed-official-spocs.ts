import { prisma } from "../src/lib/prisma";
import { ROLES } from "../src/lib/rbac/roles";

export interface OfficialSpocDefinition {
  name: string;
  email: string;
  phone: string | null;
}

export interface OfficialTeamDefinition {
  teamCode: string;
  stateCode: string;
  stateName: string;
  universityName: string;
  city: string;
  coachName: string;
  coachContact: string;
  additionalContact?: string;
  assignedSpocName: string;
  assignedSpocEmail: string;
  matchPattern: string;
}

export const OFFICIAL_SPOCS: OfficialSpocDefinition[] = [
  // AP (5)
  { name: "Utkarsh Gupta", email: "utkarshguptaspoc@szwbt2026.edu", phone: "7760618549" },
  { name: "Ashrita Angadi", email: "ashritaangadispoc@szwbt2026.edu", phone: "6366955515" },
  { name: "Nitisha M N", email: "nitishamnspoc@szwbt2026.edu", phone: "7892923187" },
  { name: "Khushi", email: "khushispoc@szwbt2026.edu", phone: null },
  { name: "Pooja P", email: "poojapspoc@szwbt2026.edu", phone: "8660932088" },

  // KA (9)
  { name: "Arpita Patil", email: "arpitapatilspoc@szwbt2026.edu", phone: "7019416947" },
  { name: "Bhumika M", email: "bhumikamspoc@szwbt2026.edu", phone: "6360433574" },
  { name: "Anika B", email: "anikabspoc@szwbt2026.edu", phone: "9972826672" },
  { name: "Sadaf H", email: "sadafhspoc@szwbt2026.edu", phone: "8867672307" },
  { name: "Ananya H", email: "ananyahspoc@szwbt2026.edu", phone: "9591487531" },
  { name: "Sanjana G", email: "sanjanagspoc@szwbt2026.edu", phone: "9741351090" },
  { name: "Sakshi (NCC)", email: "sakshinccspoc@szwbt2026.edu", phone: "7795444086" },
  { name: "Vaishnavi S", email: "vaishnavisspoc@szwbt2026.edu", phone: "9113999604" },
  { name: "Roopa H", email: "roopahspoc@szwbt2026.edu", phone: "6361934927" },

  // KR (3)
  { name: "Karuna", email: "karunaspoc@szwbt2026.edu", phone: "8217019421" },
  { name: "Soni", email: "sonispoc@szwbt2026.edu", phone: "9036862732" },
  { name: "Shanavas", email: "shanavasspoc@szwbt2026.edu", phone: "9945670955" },

  // TN (6)
  { name: "Purvi V Patil", email: "purvivpatilspoc@szwbt2026.edu", phone: "8762104763" },
  { name: "Sujala", email: "sujalaspoc@szwbt2026.edu", phone: "9353407394" },
  { name: "Sufala", email: "sufalaspoc@szwbt2026.edu", phone: "7619267497" },
  { name: "Anvita K", email: "anvitakspoc@szwbt2026.edu", phone: "6361184289" },
  { name: "Vandita L", email: "vanditalspoc@szwbt2026.edu", phone: "8073194891" },
  { name: "Srinidhi (NCC)", email: "srinidhinccspoc@szwbt2026.edu", phone: "9008739904" },

  // TN/PO (1)
  { name: "Nithish J", email: "nithishjspoc@szwbt2026.edu", phone: "8310128592" },

  // TE (2)
  { name: "Goutham R", email: "gouthamrspoc@szwbt2026.edu", phone: "7019688638" },
  { name: "Bhakti T", email: "bhaktitspoc@szwbt2026.edu", phone: "7338203033" },
];

export const OFFICIAL_TEAMS: OfficialTeamDefinition[] = [
  // ANDHRA PRADESH — AP (20)
  { teamCode: "AP-01", stateCode: "AP", stateName: "Andhra Pradesh", universityName: "Acharya Nagarjuna University, Guntur", city: "Guntur", coachName: "Not Provided", coachContact: "9849376146", assignedSpocName: "Utkarsh Gupta", assignedSpocEmail: "utkarshguptaspoc@szwbt2026.edu", matchPattern: "Acharya Nagarjuna" },
  { teamCode: "AP-02", stateCode: "AP", stateName: "Andhra Pradesh", universityName: "Adikavi Nannaya University, Rajamahendravaram", city: "Rajamahendravaram", coachName: "Not Provided", coachContact: "9581145333", assignedSpocName: "Utkarsh Gupta", assignedSpocEmail: "utkarshguptaspoc@szwbt2026.edu", matchPattern: "Adikavi Nannaya" },
  { teamCode: "AP-03", stateCode: "AP", stateName: "Andhra Pradesh", universityName: "Andhra University, Visakhapattanam", city: "Visakhapattanam", coachName: "Not Provided", coachContact: "9666545735", assignedSpocName: "Utkarsh Gupta", assignedSpocEmail: "utkarshguptaspoc@szwbt2026.edu", matchPattern: "Andhra University" },
  { teamCode: "AP-04", stateCode: "AP", stateName: "Andhra Pradesh", universityName: "Dr. NTR university of Health Sciences, Vijayawada", city: "Vijayawada", coachName: "Not Provided", coachContact: "9848613699", assignedSpocName: "Utkarsh Gupta", assignedSpocEmail: "utkarshguptaspoc@szwbt2026.edu", matchPattern: "NTR university" },
  { teamCode: "AP-05", stateCode: "AP", stateName: "Andhra Pradesh", universityName: "GITAM Deemed to be University, Visakhapatnam", city: "Visakhapatnam", coachName: "Not Provided", coachContact: "7013748320", assignedSpocName: "Ashrita Angadi", assignedSpocEmail: "ashritaangadispoc@szwbt2026.edu", matchPattern: "GITAM" },
  { teamCode: "AP-06", stateCode: "AP", stateName: "Andhra Pradesh", universityName: "Jawaharlal Nehru Technological University, Ananthpura", city: "Ananthpura", coachName: "Not Provided", coachContact: "9885856315", assignedSpocName: "Ashrita Angadi", assignedSpocEmail: "ashritaangadispoc@szwbt2026.edu", matchPattern: "Technological University, Ananthpura" },
  { teamCode: "AP-07", stateCode: "AP", stateName: "Andhra Pradesh", universityName: "Jawaharlal Nehru Technological University, Gurujada Vizianagaram", city: "Gurujada Vizianagaram", coachName: "Not Provided", coachContact: "8374033644", assignedSpocName: "Ashrita Angadi", assignedSpocEmail: "ashritaangadispoc@szwbt2026.edu", matchPattern: "Gurujada" },
  { teamCode: "AP-08", stateCode: "AP", stateName: "Andhra Pradesh", universityName: "Jawaharlal Nehru Technological University, Kakinada", city: "Kakinada", coachName: "Not Provided", coachContact: "7702594555", assignedSpocName: "Ashrita Angadi", assignedSpocEmail: "ashritaangadispoc@szwbt2026.edu", matchPattern: "Kakinada" },
  { teamCode: "AP-09", stateCode: "AP", stateName: "Andhra Pradesh", universityName: "KLEF Deemed to be University, Vaddeshwaram", city: "Vaddeshwaram", coachName: "Not Provided", coachContact: "9440959907", assignedSpocName: "Nitisha M N", assignedSpocEmail: "nitishamnspoc@szwbt2026.edu", matchPattern: "KLEF" },
  { teamCode: "AP-10", stateCode: "AP", stateName: "Andhra Pradesh", universityName: "Krishna University, Machalipattanam", city: "Machalipattanam", coachName: "Not Provided", coachContact: "9490794025", assignedSpocName: "Nitisha M N", assignedSpocEmail: "nitishamnspoc@szwbt2026.edu", matchPattern: "Krishna University" },
  { teamCode: "AP-11", stateCode: "AP", stateName: "Andhra Pradesh", universityName: "Mohan Babu University, Tirupati", city: "Tirupati", coachName: "Not Provided", coachContact: "8121341272", assignedSpocName: "Nitisha M N", assignedSpocEmail: "nitishamnspoc@szwbt2026.edu", matchPattern: "Mohan Babu" },
  { teamCode: "AP-12", stateCode: "AP", stateName: "Andhra Pradesh", universityName: "Rayalaseema University, Karnool", city: "Karnool", coachName: "Not Provided", coachContact: "9848213227", assignedSpocName: "Nitisha M N", assignedSpocEmail: "nitishamnspoc@szwbt2026.edu", matchPattern: "Rayalaseema" },
  { teamCode: "AP-13", stateCode: "AP", stateName: "Andhra Pradesh", universityName: "Siddharth Academy of Higher Education, Deemed to be University, Vijayawada", city: "Vijayawada", coachName: "Not Provided", coachContact: "7981829044", assignedSpocName: "Khushi", assignedSpocEmail: "khushispoc@szwbt2026.edu", matchPattern: "Siddharth Academy" },
  { teamCode: "AP-14", stateCode: "AP", stateName: "Andhra Pradesh", universityName: "Sri Krishnadevaraya University, Anantapura", city: "Anantapura", coachName: "Not Provided", coachContact: "9440287878", assignedSpocName: "Khushi", assignedSpocEmail: "khushispoc@szwbt2026.edu", matchPattern: "Krishnadevaraya University, Anantapura" },
  { teamCode: "AP-15", stateCode: "AP", stateName: "Andhra Pradesh", universityName: "Sri Venkateshwar University, Tirupati", city: "Tirupati", coachName: "Not Provided", coachContact: "9441296125", assignedSpocName: "Khushi", assignedSpocEmail: "khushispoc@szwbt2026.edu", matchPattern: "Sri Venkateshwar" },
  { teamCode: "AP-16", stateCode: "AP", stateName: "Andhra Pradesh", universityName: "The Apollo University", city: "Chittoor", coachName: "Not Provided", coachContact: "9493572822", additionalContact: "9959493716", assignedSpocName: "Khushi", assignedSpocEmail: "khushispoc@szwbt2026.edu", matchPattern: "Apollo University" },
  { teamCode: "AP-17", stateCode: "AP", stateName: "Andhra Pradesh", universityName: "Vighnan's foundation of Science", city: "Guntur", coachName: "Not Provided", coachContact: "9849596535", assignedSpocName: "Pooja P", assignedSpocEmail: "poojapspoc@szwbt2026.edu", matchPattern: "Vighnan's" },
  { teamCode: "AP-18", stateCode: "AP", stateName: "Andhra Pradesh", universityName: "Vikram Simhapuri University, Nellore", city: "Nellore", coachName: "Not Provided", coachContact: "9963255325", assignedSpocName: "Pooja P", assignedSpocEmail: "poojapspoc@szwbt2026.edu", matchPattern: "Vikram Simhapuri" },
  { teamCode: "AP-19", stateCode: "AP", stateName: "Andhra Pradesh", universityName: "VIT- AP University, Vijayawada", city: "Vijayawada", coachName: "Not Provided", coachContact: "9705273817", assignedSpocName: "Pooja P", assignedSpocEmail: "poojapspoc@szwbt2026.edu", matchPattern: "VIT- AP" },
  { teamCode: "AP-20", stateCode: "AP", stateName: "Andhra Pradesh", universityName: "Yogi Veman University, Kadapa", city: "Kadapa", coachName: "Not Provided", coachContact: "9059990999", assignedSpocName: "Pooja P", assignedSpocEmail: "poojapspoc@szwbt2026.edu", matchPattern: "Yogi Veman" },

  // KARNATAKA — KA (38)
  { teamCode: "KA-01", stateCode: "KA", stateName: "Karnataka", universityName: "Adikavi Shri Maharshi Valmiki University, Raichur", city: "Raichur", coachName: "Not Provided", coachContact: "9008348821", assignedSpocName: "Arpita Patil", assignedSpocEmail: "arpitapatilspoc@szwbt2026.edu", matchPattern: "Valmiki" },
  { teamCode: "KA-02", stateCode: "KA", stateName: "Karnataka", universityName: "Bagalkot University, Jamakhandi", city: "Jamakhandi", coachName: "Not Provided", coachContact: "9964541008", assignedSpocName: "Arpita Patil", assignedSpocEmail: "arpitapatilspoc@szwbt2026.edu", matchPattern: "Bagalkot" },
  { teamCode: "KA-03", stateCode: "KA", stateName: "Karnataka", universityName: "Bangalore University, Bangaluru", city: "Bangaluru", coachName: "Not Provided", coachContact: "7795671570", assignedSpocName: "Arpita Patil", assignedSpocEmail: "arpitapatilspoc@szwbt2026.edu", matchPattern: "Bangalore University" },
  { teamCode: "KA-04", stateCode: "KA", stateName: "Karnataka", universityName: "Bengaluru North University, Kolar", city: "Kolar", coachName: "Not Provided", coachContact: "9448620169", assignedSpocName: "Arpita Patil", assignedSpocEmail: "arpitapatilspoc@szwbt2026.edu", matchPattern: "Bengaluru North" },
  { teamCode: "KA-05", stateCode: "KA", stateName: "Karnataka", universityName: "Central University of Karnataka, Kalaburagi", city: "Kalaburagi", coachName: "Not Provided", coachContact: "9948546678", assignedSpocName: "Arpita Patil", assignedSpocEmail: "arpitapatilspoc@szwbt2026.edu", matchPattern: "Central University of Karnataka" },
  { teamCode: "KA-06", stateCode: "KA", stateName: "Karnataka", universityName: "Chamarajnagara University, Chamarajnagara", city: "Chamarajnagara", coachName: "Not Provided", coachContact: "9538673032", assignedSpocName: "Bhumika M", assignedSpocEmail: "bhumikamspoc@szwbt2026.edu", matchPattern: "Chamarajnagara" },
  { teamCode: "KA-07", stateCode: "KA", stateName: "Karnataka", universityName: "Chanakya University, Bengaluru", city: "Bengaluru", coachName: "Not Provided", coachContact: "9449141869", assignedSpocName: "Bhumika M", assignedSpocEmail: "bhumikamspoc@szwbt2026.edu", matchPattern: "Chanakya" },
  { teamCode: "KA-08", stateCode: "KA", stateName: "Karnataka", universityName: "Christ Deemed to be University, Bengaluru", city: "Bengaluru", coachName: "Not Provided", coachContact: "9986527620", assignedSpocName: "Bhumika M", assignedSpocEmail: "bhumikamspoc@szwbt2026.edu", matchPattern: "Christ Deemed" },
  { teamCode: "KA-09", stateCode: "KA", stateName: "Karnataka", universityName: "Davangere University, Davangere", city: "Davangere", coachName: "Not Provided", coachContact: "9448630136", assignedSpocName: "Bhumika M", assignedSpocEmail: "bhumikamspoc@szwbt2026.edu", matchPattern: "Davangere" },
  { teamCode: "KA-10", stateCode: "KA", stateName: "Karnataka", universityName: "Dr. Manmohan Singh Bengaluru City University, Bengaluru", city: "Bengaluru", coachName: "Not Provided", coachContact: "8904884660", assignedSpocName: "Anika B", assignedSpocEmail: "anikabspoc@szwbt2026.edu", matchPattern: "Manmohan Singh" },
  { teamCode: "KA-11", stateCode: "KA", stateName: "Karnataka", universityName: "Gulbarga University, Kalaburagi", city: "Kalaburagi", coachName: "Not Provided", coachContact: "9448414223", assignedSpocName: "Anika B", assignedSpocEmail: "anikabspoc@szwbt2026.edu", matchPattern: "Gulbarga University" },
  { teamCode: "KA-12", stateCode: "KA", stateName: "Karnataka", universityName: "Hassan University, Hassan", city: "Hassan", coachName: "Not Provided", coachContact: "9448792544", assignedSpocName: "Anika B", assignedSpocEmail: "anikabspoc@szwbt2026.edu", matchPattern: "Hassan" },
  { teamCode: "KA-13", stateCode: "KA", stateName: "Karnataka", universityName: "Haveri University, Haveri", city: "Haveri", coachName: "Not Provided", coachContact: "8884111990", assignedSpocName: "Anika B", assignedSpocEmail: "anikabspoc@szwbt2026.edu", matchPattern: "Haveri" },
  { teamCode: "KA-14", stateCode: "KA", stateName: "Karnataka", universityName: "Jain Deemed to be University, Bengaluru", city: "Bengaluru", coachName: "Not Provided", coachContact: "9845030214", assignedSpocName: "Sadaf H", assignedSpocEmail: "sadafhspoc@szwbt2026.edu", matchPattern: "Jain Deemed" },
  { teamCode: "KA-15", stateCode: "KA", stateName: "Karnataka", universityName: "JSS Academy of Higher Education & Research, Mysuru", city: "Mysuru", coachName: "Not Provided", coachContact: "9880196513", assignedSpocName: "Sadaf H", assignedSpocEmail: "sadafhspoc@szwbt2026.edu", matchPattern: "JSS Academy" },
  { teamCode: "KA-16", stateCode: "KA", stateName: "Karnataka", universityName: "Karnatak University, Dharwad", city: "Dharwad", coachName: "Not Provided", coachContact: "9901353725", assignedSpocName: "Sadaf H", assignedSpocEmail: "sadafhspoc@szwbt2026.edu", matchPattern: "Karnatak University" },
  { teamCode: "KA-17", stateCode: "KA", stateName: "Karnataka", universityName: "Karnataka State Law University, Hubballi", city: "Hubballi", coachName: "Not Provided", coachContact: "9980732264", assignedSpocName: "Sadaf H", assignedSpocEmail: "sadafhspoc@szwbt2026.edu", matchPattern: "Law University, Hubballi" },
  { teamCode: "KA-18", stateCode: "KA", stateName: "Karnataka", universityName: "Karnataka State Akkamahadevi Women's University, Vijayapura", city: "Vijayapura", coachName: "Not Provided", coachContact: "9740108853", assignedSpocName: "Ananya H", assignedSpocEmail: "ananyahspoc@szwbt2026.edu", matchPattern: "Akkamahadevi" },
  { teamCode: "KA-19", stateCode: "KA", stateName: "Karnataka", universityName: "Kitturu Rani Channamma University, Belagavi", city: "Belagavi", coachName: "Not Provided", coachContact: "8792366067", assignedSpocName: "Ananya H", assignedSpocEmail: "ananyahspoc@szwbt2026.edu", matchPattern: "Kitturu Rani" },
  { teamCode: "KA-20", stateCode: "KA", stateName: "Karnataka", universityName: "KLE Academy of Higher Education & Research (Deemed to be University)", city: "Belagavi", coachName: "Not Provided", coachContact: "9986250252", assignedSpocName: "Ananya H", assignedSpocEmail: "ananyahspoc@szwbt2026.edu", matchPattern: "KLE Academy" },
  { teamCode: "KA-21", stateCode: "KA", stateName: "Karnataka", universityName: "KLE Technological University, Hubballi", city: "Hubballi", coachName: "Not Provided", coachContact: "9986034231", assignedSpocName: "Ananya H", assignedSpocEmail: "ananyahspoc@szwbt2026.edu", matchPattern: "KLE Technological" },
  { teamCode: "KA-22", stateCode: "KA", stateName: "Karnataka", universityName: "Kristu Jayanti Deemed to be University, Bengaluru", city: "Bengaluru", coachName: "Not Provided", coachContact: "7892920317", assignedSpocName: "Sanjana G", assignedSpocEmail: "sanjanagspoc@szwbt2026.edu", matchPattern: "Kristu Jayanti" },
  { teamCode: "KA-23", stateCode: "KA", stateName: "Karnataka", universityName: "Kuvempu University, Shivamogga", city: "Shivamogga", coachName: "Not Provided", coachContact: "9481877431", assignedSpocName: "Sanjana G", assignedSpocEmail: "sanjanagspoc@szwbt2026.edu", matchPattern: "Kuvempu" },
  { teamCode: "KA-24", stateCode: "KA", stateName: "Karnataka", universityName: "Maharani Cluster University, Bengaluru", city: "Bengaluru", coachName: "Not Provided", coachContact: "9964590429", assignedSpocName: "Sanjana G", assignedSpocEmail: "sanjanagspoc@szwbt2026.edu", matchPattern: "Maharani Cluster" },
  { teamCode: "KA-25", stateCode: "KA", stateName: "Karnataka", universityName: "Mangalore University, Mangaluru", city: "Mangaluru", coachName: "Not Provided", coachContact: "9343572023", assignedSpocName: "Sakshi (NCC)", assignedSpocEmail: "sakshinccspoc@szwbt2026.edu", matchPattern: "Mangalore University" },
  { teamCode: "KA-26", stateCode: "KA", stateName: "Karnataka", universityName: "Manipal Academy of Higher Education, Manipal", city: "Manipal", coachName: "Not Provided", coachContact: "9844266082", assignedSpocName: "Sakshi (NCC)", assignedSpocEmail: "sakshinccspoc@szwbt2026.edu", matchPattern: "Manipal Academy" },
  { teamCode: "KA-27", stateCode: "KA", stateName: "Karnataka", universityName: "Nitte Deemed to be University, Mangaluru", city: "Mangaluru", coachName: "Not Provided", coachContact: "9964319830", assignedSpocName: "Sakshi (NCC)", assignedSpocEmail: "sakshinccspoc@szwbt2026.edu", matchPattern: "Nitte Deemed" },
  { teamCode: "KA-28", stateCode: "KA", stateName: "Karnataka", universityName: "PES University, Bengaluru", city: "Bengaluru", coachName: "Not Provided", coachContact: "9845838018", assignedSpocName: "Sakshi (NCC)", assignedSpocEmail: "sakshinccspoc@szwbt2026.edu", matchPattern: "PES University" },
  { teamCode: "KA-29", stateCode: "KA", stateName: "Karnataka", universityName: "Presidency University, Bengaluru", city: "Bengaluru", coachName: "Not Provided", coachContact: "8838074047", assignedSpocName: "Vaishnavi S", assignedSpocEmail: "vaishnavisspoc@szwbt2026.edu", matchPattern: "Presidency" },
  { teamCode: "KA-30", stateCode: "KA", stateName: "Karnataka", universityName: "Rajiv Gandhi University of Health Sciences, Bengaluru", city: "Bengaluru", coachName: "Not Provided", coachContact: "7019297028", assignedSpocName: "Vaishnavi S", assignedSpocEmail: "vaishnavisspoc@szwbt2026.edu", matchPattern: "Rajiv Gandhi" },
  { teamCode: "KA-31", stateCode: "KA", stateName: "Karnataka", universityName: "Reva University, Bengaluru", city: "Bengaluru", coachName: "Not Provided", coachContact: "8220851986", assignedSpocName: "Vaishnavi S", assignedSpocEmail: "vaishnavisspoc@szwbt2026.edu", matchPattern: "Reva" },
  { teamCode: "KA-32", stateCode: "KA", stateName: "Karnataka", universityName: "RV University, Bengaluru", city: "Bengaluru", coachName: "Not Provided", coachContact: "Not Provided", assignedSpocName: "Vaishnavi S", assignedSpocEmail: "vaishnavisspoc@szwbt2026.edu", matchPattern: "RV University" },
  { teamCode: "KA-33", stateCode: "KA", stateName: "Karnataka", universityName: "Shri Dharmasthala Manjunatheshwara University, Dharwad", city: "Dharwad", coachName: "Not Provided", coachContact: "9844804171", assignedSpocName: "Vaishnavi S", assignedSpocEmail: "vaishnavisspoc@szwbt2026.edu", matchPattern: "Dharmasthala" },
  { teamCode: "KA-34", stateCode: "KA", stateName: "Karnataka", universityName: "Tumkur University, Tumkur", city: "Tumkur", coachName: "Not Provided", coachContact: "8904131981", assignedSpocName: "Roopa H", assignedSpocEmail: "roopahspoc@szwbt2026.edu", matchPattern: "Tumkur" },
  { teamCode: "KA-35", stateCode: "KA", stateName: "Karnataka", universityName: "University of Agricultural Sciences, Dharwad", city: "Dharwad", coachName: "Not Provided", coachContact: "9886423980", assignedSpocName: "Roopa H", assignedSpocEmail: "roopahspoc@szwbt2026.edu", matchPattern: "Agricultural Sciences" },
  { teamCode: "KA-36", stateCode: "KA", stateName: "Karnataka", universityName: "University of Mysore, Mysuru", city: "Mysuru", coachName: "Not Provided", coachContact: "9448246112", assignedSpocName: "Roopa H", assignedSpocEmail: "roopahspoc@szwbt2026.edu", matchPattern: "Mysore" },
  { teamCode: "KA-37", stateCode: "KA", stateName: "Karnataka", universityName: "Vijayanagara Sri Krishnadevaraya University, Ballari", city: "Ballari", coachName: "Not Provided", coachContact: "9141816600", assignedSpocName: "Roopa H", assignedSpocEmail: "roopahspoc@szwbt2026.edu", matchPattern: "Vijayanagara" },
  { teamCode: "KA-38", stateCode: "KA", stateName: "Karnataka", universityName: "Vishweshwarayya Technological University, Belagavi", city: "Belagavi", coachName: "Not Provided", coachContact: "9591192646", assignedSpocName: "Roopa H", assignedSpocEmail: "roopahspoc@szwbt2026.edu", matchPattern: "Vishweshwarayya" },

  // KERALA — KR (10)
  { teamCode: "KR-01", stateCode: "KR", stateName: "Kerala", universityName: "APJ Abdul Kalam University, Tiruvananthpuram", city: "Tiruvananthpuram", coachName: "Not Provided", coachContact: "9349452577", assignedSpocName: "Karuna", assignedSpocEmail: "karunaspoc@szwbt2026.edu", matchPattern: "Abdul Kalam" },
  { teamCode: "KR-02", stateCode: "KR", stateName: "Kerala", universityName: "Chinmay Vishwa Vidyapeetham", city: "Ernakulam", coachName: "Not Provided", coachContact: "7845681557", assignedSpocName: "Karuna", assignedSpocEmail: "karunaspoc@szwbt2026.edu", matchPattern: "Chinmay" },
  { teamCode: "KR-03", stateCode: "KR", stateName: "Kerala", universityName: "Coachin University of Science & Technology, Coachin", city: "Coachin", coachName: "Not Provided", coachContact: "9447102163", assignedSpocName: "Karuna", assignedSpocEmail: "karunaspoc@szwbt2026.edu", matchPattern: "Coachin" },
  { teamCode: "KR-04", stateCode: "KR", stateName: "Kerala", universityName: "Kannur University, Kannur", city: "Kannur", coachName: "Not Provided", coachContact: "9447231975", assignedSpocName: "Karuna", assignedSpocEmail: "karunaspoc@szwbt2026.edu", matchPattern: "Kannur" },
  { teamCode: "KR-05", stateCode: "KR", stateName: "Kerala", universityName: "Kerala Agricultural University", city: "Thrissur", coachName: "Not Provided", coachContact: "9747692328", assignedSpocName: "Soni", assignedSpocEmail: "sonispoc@szwbt2026.edu", matchPattern: "Kerala Agricultural" },
  { teamCode: "KR-06", stateCode: "KR", stateName: "Kerala", universityName: "Kerala University of Health Sciences, Thrissur", city: "Thrissur", coachName: "Not Provided", coachContact: "9539121063", assignedSpocName: "Soni", assignedSpocEmail: "sonispoc@szwbt2026.edu", matchPattern: "Kerala University of Health" },
  { teamCode: "KR-07", stateCode: "KR", stateName: "Kerala", universityName: "Mahatma Gandhi University, Kottayam", city: "Kottayam", coachName: "Not Provided", coachContact: "9447006946", assignedSpocName: "Soni", assignedSpocEmail: "sonispoc@szwbt2026.edu", matchPattern: "Mahatma Gandhi" },
  { teamCode: "KR-08", stateCode: "KR", stateName: "Kerala", universityName: "Sree Sankaracharya University of Sanskrit, Kalady", city: "Kalady", coachName: "Not Provided", coachContact: "9446905243", assignedSpocName: "Soni", assignedSpocEmail: "sonispoc@szwbt2026.edu", matchPattern: "Sankaracharya" },
  { teamCode: "KR-09", stateCode: "KR", stateName: "Kerala", universityName: "University of Calicut, Calicut", city: "Calicut", coachName: "Not Provided", coachContact: "9497817551", assignedSpocName: "Shanavas", assignedSpocEmail: "shanavasspoc@szwbt2026.edu", matchPattern: "Calicut" },
  { teamCode: "KR-10", stateCode: "KR", stateName: "Kerala", universityName: "University of Kerala", city: "Thiruvananthapuram", coachName: "Not Provided", coachContact: "7994759331", assignedSpocName: "Shanavas", assignedSpocEmail: "shanavasspoc@szwbt2026.edu", matchPattern: "University of Kerala" },

  // TAMIL NADU — TN (26)
  { teamCode: "TN-01", stateCode: "TN", stateName: "Tamil Nadu", universityName: "Alagappa University, Karaikudi", city: "Karaikudi", coachName: "Not Provided", coachContact: "8754949368", assignedSpocName: "Purvi V Patil", assignedSpocEmail: "purvivpatilspoc@szwbt2026.edu", matchPattern: "Alagappa" },
  { teamCode: "TN-02", stateCode: "TN", stateName: "Tamil Nadu", universityName: "Amrita Vishwavidyapeetham, Coimbatore", city: "Coimbatore", coachName: "Not Provided", coachContact: "9952163278", assignedSpocName: "Purvi V Patil", assignedSpocEmail: "purvivpatilspoc@szwbt2026.edu", matchPattern: "Amrita" },
  { teamCode: "TN-03", stateCode: "TN", stateName: "Tamil Nadu", universityName: "Anna University, Chennai", city: "Chennai", coachName: "Not Provided", coachContact: "9444036313", assignedSpocName: "Purvi V Patil", assignedSpocEmail: "purvivpatilspoc@szwbt2026.edu", matchPattern: "Anna University" },
  { teamCode: "TN-04", stateCode: "TN", stateName: "Tamil Nadu", universityName: "Annamalai University, Chidambaram", city: "Chidambaram", coachName: "Not Provided", coachContact: "9952551812", assignedSpocName: "Purvi V Patil", assignedSpocEmail: "purvivpatilspoc@szwbt2026.edu", matchPattern: "Annamalai" },
  { teamCode: "TN-05", stateCode: "TN", stateName: "Tamil Nadu", universityName: "B S Abdur Rehman Cresent Institute of Science & Technology", city: "Chennai", coachName: "Not Provided", coachContact: "9790085085", assignedSpocName: "Sujala", assignedSpocEmail: "sujalaspoc@szwbt2026.edu", matchPattern: "Abdur Rehman" },
  { teamCode: "TN-06", stateCode: "TN", stateName: "Tamil Nadu", universityName: "Bharathiar University, Coimbatore", city: "Coimbatore", coachName: "Not Provided", coachContact: "9788520000", assignedSpocName: "Sujala", assignedSpocEmail: "sujalaspoc@szwbt2026.edu", matchPattern: "Bharathiar" },
  { teamCode: "TN-07", stateCode: "TN", stateName: "Tamil Nadu", universityName: "Bharathidasan University, Tiruchirapalli", city: "Tiruchirapalli", coachName: "Not Provided", coachContact: "9842053777", assignedSpocName: "Sujala", assignedSpocEmail: "sujalaspoc@szwbt2026.edu", matchPattern: "Bharathidasan" },
  { teamCode: "TN-08", stateCode: "TN", stateName: "Tamil Nadu", universityName: "Central University of Tamilnadu", city: "Thiruvarur", coachName: "Not Provided", coachContact: "6235678750", assignedSpocName: "Sujala", assignedSpocEmail: "sujalaspoc@szwbt2026.edu", matchPattern: "Central University of Tamilnadu" },
  { teamCode: "TN-09", stateCode: "TN", stateName: "Tamil Nadu", universityName: "Dr. MGR Educational & Research institute", city: "Chennai", coachName: "Not Provided", coachContact: "9444737767", assignedSpocName: "Sufala", assignedSpocEmail: "sufalaspoc@szwbt2026.edu", matchPattern: "MGR" },
  { teamCode: "TN-10", stateCode: "TN", stateName: "Tamil Nadu", universityName: "Dravidian University", city: "Kuppam", coachName: "Not Provided", coachContact: "9441644461", assignedSpocName: "Sufala", assignedSpocEmail: "sufalaspoc@szwbt2026.edu", matchPattern: "Dravidian" },
  { teamCode: "TN-11", stateCode: "TN", stateName: "Tamil Nadu", universityName: "Hindustan Institute of Technology & Science, Chennai", city: "Chennai", coachName: "Not Provided", coachContact: "9600010960", assignedSpocName: "Sufala", assignedSpocEmail: "sufalaspoc@szwbt2026.edu", matchPattern: "Hindustan Institute" },
  { teamCode: "TN-12", stateCode: "TN", stateName: "Tamil Nadu", universityName: "Indian Institute of Technology, Madras, Chennai", city: "Chennai", coachName: "Not Provided", coachContact: "9840077074", assignedSpocName: "Sufala", assignedSpocEmail: "sufalaspoc@szwbt2026.edu", matchPattern: "Indian Institute of Technology" },
  { teamCode: "TN-13", stateCode: "TN", stateName: "Tamil Nadu", universityName: "Madurai Kamaraj University, Madurai", city: "Madurai", coachName: "Not Provided", coachContact: "9080127418", assignedSpocName: "Anvita K", assignedSpocEmail: "anvitakspoc@szwbt2026.edu", matchPattern: "Madurai Kamaraj" },
  { teamCode: "TN-14", stateCode: "TN", stateName: "Tamil Nadu", universityName: "Manonmaniam Sundaranar University, Tirunalveli", city: "Tirunalveli", coachName: "Not Provided", coachContact: "9489233679", assignedSpocName: "Anvita K", assignedSpocEmail: "anvitakspoc@szwbt2026.edu", matchPattern: "Manonmaniam Sundaranar" },
  { teamCode: "TN-15", stateCode: "TN", stateName: "Tamil Nadu", universityName: "Mother Teresa Women's University, Kodaikanal", city: "Kodaikanal", coachName: "Not Provided", coachContact: "9698644991", assignedSpocName: "Anvita K", assignedSpocEmail: "anvitakspoc@szwbt2026.edu", matchPattern: "Mother Teresa" },
  { teamCode: "TN-16", stateCode: "TN", stateName: "Tamil Nadu", universityName: "Periyar University, Salem", city: "Salem", coachName: "Not Provided", coachContact: "9842255300", assignedSpocName: "Anvita K", assignedSpocEmail: "anvitakspoc@szwbt2026.edu", matchPattern: "Periyar" },
  { teamCode: "TN-17", stateCode: "TN", stateName: "Tamil Nadu", universityName: "SASTRA University", city: "Thanjavur", coachName: "Not Provided", coachContact: "9443863386", assignedSpocName: "Vandita L", assignedSpocEmail: "vanditalspoc@szwbt2026.edu", matchPattern: "SASTRA" },
  { teamCode: "TN-18", stateCode: "TN", stateName: "Tamil Nadu", universityName: "Saveetha Institute of Medical & technical Sciences, Chennai", city: "Chennai", coachName: "Not Provided", coachContact: "Not Provided", assignedSpocName: "Vandita L", assignedSpocEmail: "vanditalspoc@szwbt2026.edu", matchPattern: "Saveetha" },
  { teamCode: "TN-19", stateCode: "TN", stateName: "Tamil Nadu", universityName: "SRM Institute of Science & Technology University, Kottankulathur", city: "Kottankulathur", coachName: "Not Provided", coachContact: "9566033337", assignedSpocName: "Vandita L", assignedSpocEmail: "vanditalspoc@szwbt2026.edu", matchPattern: "SRM Institute" },
  { teamCode: "TN-20", stateCode: "TN", stateName: "Tamil Nadu", universityName: "St. Joseph University, Chennai", city: "Chennai", coachName: "Not Provided", coachContact: "9159865486", assignedSpocName: "Srinidhi (NCC)", assignedSpocEmail: "srinidhinccspoc@szwbt2026.edu", matchPattern: "St. Joseph" },
  { teamCode: "TN-21", stateCode: "TN", stateName: "Tamil Nadu", universityName: "Tamilnadu Physical Education & Sports University, Chennai", city: "Chennai", coachName: "Not Provided", coachContact: "9841291923", assignedSpocName: "Srinidhi (NCC)", assignedSpocEmail: "srinidhinccspoc@szwbt2026.edu", matchPattern: "Physical Education" },
  { teamCode: "TN-22", stateCode: "TN", stateName: "Tamil Nadu", universityName: "The Tamilnadu Dr. Ambedkar Law University, Chennai", city: "Chennai", coachName: "Not Provided", coachContact: "9789862587", assignedSpocName: "Srinidhi (NCC)", assignedSpocEmail: "srinidhinccspoc@szwbt2026.edu", matchPattern: "Ambedkar Law" },
  { teamCode: "TN-23", stateCode: "TN", stateName: "Tamil Nadu", universityName: "Thiruvalluvar University, Vellore", city: "Vellore", coachName: "Not Provided", coachContact: "9865336751", assignedSpocName: "Srinidhi (NCC)", assignedSpocEmail: "srinidhinccspoc@szwbt2026.edu", matchPattern: "Thiruvalluvar" },
  { teamCode: "TN-24", stateCode: "TN", stateName: "Tamil Nadu", universityName: "University of Madras, Chennai", city: "Chennai", coachName: "Not Provided", coachContact: "9940998443", assignedSpocName: "Srinidhi (NCC)", assignedSpocEmail: "srinidhinccspoc@szwbt2026.edu", matchPattern: "University of Madras" },
  { teamCode: "TN-25", stateCode: "TN", stateName: "Tamil Nadu", universityName: "Vellore Institute of Technology, Katapadi", city: "Katapadi", coachName: "Not Provided", coachContact: "9345317583", assignedSpocName: "Nithish J", assignedSpocEmail: "nithishjspoc@szwbt2026.edu", matchPattern: "Vellore Institute" },
  { teamCode: "TN-26", stateCode: "TN", stateName: "Tamil Nadu", universityName: "Vinayak Mission Research Foundation", city: "Salem", coachName: "Not Provided", coachContact: "7200060626", assignedSpocName: "Nithish J", assignedSpocEmail: "nithishjspoc@szwbt2026.edu", matchPattern: "Vinayak Mission" },

  // PONDICHERRY — PO (1) -> Explicitly assigned to Nithish J
  { teamCode: "PO-01", stateCode: "PO", stateName: "Pondicherry", universityName: "Pondicherry University, Puducherry", city: "Puducherry", coachName: "Not Provided", coachContact: "9488979000", assignedSpocName: "Nithish J", assignedSpocEmail: "nithishjspoc@szwbt2026.edu", matchPattern: "Pondicherry" },

  // TELANGANA — TE (7)
  { teamCode: "TE-01", stateCode: "TE", stateName: "Telangana", universityName: "Jawaharlal Nehru Technological University, Hyderabad", city: "Hyderabad", coachName: "Not Provided", coachContact: "9059912384", assignedSpocName: "Goutham R", assignedSpocEmail: "gouthamrspoc@szwbt2026.edu", matchPattern: "Hyderba" },
  { teamCode: "TE-02", stateCode: "TE", stateName: "Telangana", universityName: "Kakatiya University, Warangal", city: "Warangal", coachName: "Not Provided", coachContact: "87900 50059", assignedSpocName: "Goutham R", assignedSpocEmail: "gouthamrspoc@szwbt2026.edu", matchPattern: "Kakatiya" },
  { teamCode: "TE-03", stateCode: "TE", stateName: "Telangana", universityName: "Malla Reddy Vishwavidyapeeth Deemed to be University, Hyderabad", city: "Hyderabad", coachName: "Not Provided", coachContact: "9985709348", assignedSpocName: "Goutham R", assignedSpocEmail: "gouthamrspoc@szwbt2026.edu", matchPattern: "Malla Reddy" },
  { teamCode: "TE-04", stateCode: "TE", stateName: "Telangana", universityName: "Osmania University, Hyderabad", city: "Hyderabad", coachName: "Not Provided", coachContact: "9912522470", assignedSpocName: "Goutham R", assignedSpocEmail: "gouthamrspoc@szwbt2026.edu", matchPattern: "Osmania" },
  { teamCode: "TE-05", stateCode: "TE", stateName: "Telangana", universityName: "Telangana University", city: "Nizamabad", coachName: "Not Provided", coachContact: "9440675137", assignedSpocName: "Bhakti T", assignedSpocEmail: "bhaktitspoc@szwbt2026.edu", matchPattern: "Telangana University" },
  { teamCode: "TE-06", stateCode: "TE", stateName: "Telangana", universityName: "University of Hyderabad, Hyderabad", city: "Hyderabad", coachName: "Not Provided", coachContact: "9676886270", assignedSpocName: "Bhakti T", assignedSpocEmail: "bhaktitspoc@szwbt2026.edu", matchPattern: "University of Hyderabad" },
  { teamCode: "TE-07", stateCode: "TE", stateName: "Telangana", universityName: "Woxen University, Hydrabad", city: "Hydrabad", coachName: "Not Provided", coachContact: "4044448888", assignedSpocName: "Bhakti T", assignedSpocEmail: "bhaktitspoc@szwbt2026.edu", matchPattern: "Woxen" },
];

async function main() {
  console.log("============================================================");
  console.log("SEEDING OFFICIAL SZWBT 2026 SPOC SYSTEM & TEAM ASSIGNMENTS");
  console.log("============================================================");

  // 1. Ensure Role SPOC exists
  const spocRole = await prisma.role.upsert({
    where: { name: ROLES.SPOC },
    update: {},
    create: {
      name: ROLES.SPOC,
      displayName: "Student Point of Contact",
      description: "Official SPOC coordinator assigned to specific university contingents.",
      isSystem: true,
    },
  });
  console.log(`[AUTH] Verified SPOC role in DB (Role ID: ${spocRole.id})`);

  // 2. Upsert all 26 official SPOC accounts
  const createdSpocsMap = new Map<string, any>(); // email -> User
  for (const s of OFFICIAL_SPOCS) {
    const user = await prisma.user.upsert({
      where: { email: s.email },
      update: {
        name: s.name,
        phone: s.phone,
        passwordHash: "szwbt2026pass",
        badge: "STUDENT POINT OF CONTACT",
        targetUrl: "/spoc",
        isActive: true,
      },
      create: {
        name: s.name,
        email: s.email,
        phone: s.phone,
        passwordHash: "szwbt2026pass",
        badge: "STUDENT POINT OF CONTACT",
        targetUrl: "/spoc",
        isActive: true,
      },
    });

    // Ensure UserRole relation exists
    await prisma.userRole.upsert({
      where: {
        userId_roleId: {
          userId: user.id,
          roleId: spocRole.id,
        },
      },
      update: {},
      create: {
        userId: user.id,
        roleId: spocRole.id,
      },
    });

    createdSpocsMap.set(s.email, user);
    console.log(`[SPOC USER] ${s.name} | ${s.email} | Phone: ${s.phone || "None"}`);
  }
  console.log(`[SPOC USERS] Successfully verified/upserted all ${createdSpocsMap.size} SPOC accounts.`);

  // 3. Match and Update all 102 Teams with Official Codes, Coach/Manager Contacts
  const allDbTeams = await prisma.team.findMany();
  console.log(`[DB TEAMS] Total existing teams in DB: ${allDbTeams.length}`);

  // Clear existing SPOC team assignments so we rebuild canonical 102 mappings
  const deletedAssignments = await prisma.spocTeamAssignment.deleteMany({});
  console.log(`[ASSIGNMENTS] Cleared ${deletedAssignments.count} previous assignments for clean canonical link.`);

  let updatedTeamsCount = 0;
  let createdAssignmentsCount = 0;
  const spocAssignmentsCountMap = new Map<string, number>();

  for (const target of OFFICIAL_TEAMS) {
    const matchedTeam = allDbTeams.find((t) =>
      t.name.toLowerCase().includes(target.matchPattern.toLowerCase()) ||
      t.institution.toLowerCase().includes(target.matchPattern.toLowerCase())
    );

    if (!matchedTeam) {
      throw new Error(`CRITICAL ERROR: No DB match found for ${target.teamCode} (${target.universityName})`);
    }

    const assignedSpoc = createdSpocsMap.get(target.assignedSpocEmail);
    if (!assignedSpoc) {
      throw new Error(`CRITICAL ERROR: Assigned SPOC ${target.assignedSpocEmail} not found!`);
    }

    // Update Team record with official teamCode, stateCode, state, city, coach contact
    const updatedTeam = await prisma.team.update({
      where: { id: matchedTeam.id },
      data: {
        teamCode: target.teamCode,
        stateCode: target.stateCode,
        state: target.stateName,
        city: target.city,
        name: target.universityName,
        institution: target.universityName,
        managerName: target.coachName, // "Not Provided"
        managerPhone: target.coachContact, // Coach/Manager Contact
      },
    });
    updatedTeamsCount++;

    // Create assignment link
    await prisma.spocTeamAssignment.create({
      data: {
        spocId: assignedSpoc.id,
        teamId: updatedTeam.id,
        assignedBy: "admin@szwbt2026.edu",
      },
    });
    createdAssignmentsCount++;

    const currentCount = spocAssignmentsCountMap.get(assignedSpoc.name) || 0;
    spocAssignmentsCountMap.set(assignedSpoc.name, currentCount + 1);
  }

  console.log(`[TEAMS] Successfully updated ${updatedTeamsCount} teams with official codes & contacts.`);
  console.log(`[ASSIGNMENTS] Successfully created ${createdAssignmentsCount} SPOC team assignments.`);

  // 4. Verify Nithish J specifically
  const nithishUser = createdSpocsMap.get("nithishjspoc@szwbt2026.edu");
  const nithishAssignments = await prisma.spocTeamAssignment.findMany({
    where: { spocId: nithishUser.id },
    include: { team: true },
  });
  console.log("------------------------------------------------------------");
  console.log("VERIFICATION: NITHISH J ASSIGNMENTS:");
  console.log(`Count: ${nithishAssignments.length} (Expected: 3)`);
  nithishAssignments.forEach((a) => {
    console.log(`- ${a.team.teamCode}: ${a.team.name} | Coach Contact: ${a.team.managerPhone}`);
  });

  const nithishCodes = nithishAssignments.map((a) => a.team.teamCode).sort();
  if (
    nithishAssignments.length === 3 &&
    nithishCodes[0] === "PO-01" &&
    nithishCodes[1] === "TN-25" &&
    nithishCodes[2] === "TN-26"
  ) {
    console.log("✅ NITHISH J HAS EXACTLY TN-25, TN-26, and PO-01!");
  } else {
    throw new Error(`CRITICAL ERROR: Nithish J assignments invalid: ${nithishCodes.join(", ")}`);
  }

  // 5. Verify Team Code Distribution
  const finalTeams = await prisma.team.findMany({
    select: { teamCode: true, stateCode: true, managerName: true, managerPhone: true },
    orderBy: { teamCode: "asc" },
  });
  console.log("------------------------------------------------------------");
  console.log("FINAL STATE CODE VERIFICATION:");
  const apCount = finalTeams.filter((t) => t.stateCode === "AP").length;
  const kaCount = finalTeams.filter((t) => t.stateCode === "KA").length;
  const krCount = finalTeams.filter((t) => t.stateCode === "KR").length;
  const tnCount = finalTeams.filter((t) => t.stateCode === "TN").length;
  const poCount = finalTeams.filter((t) => t.stateCode === "PO").length;
  const teCount = finalTeams.filter((t) => t.stateCode === "TE").length;

  console.log(`AP: ${apCount} / 20`);
  console.log(`KA: ${kaCount} / 38`);
  console.log(`KR: ${krCount} / 10`);
  console.log(`TN: ${tnCount} / 26`);
  console.log(`PO: ${poCount} / 1`);
  console.log(`TE: ${teCount} / 7`);
  console.log(`Total: ${finalTeams.length} / 102`);

  console.log("============================================================");
  console.log("✅ ALL 26 SPOCS & 102 TEAMS SEEDED SUCCESSFULLY!");
  console.log("============================================================");
}

main()
  .catch((e) => {
    console.error("FATAL ERROR IN SEED SCRIPT:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
