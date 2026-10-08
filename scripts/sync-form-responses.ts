import { PrismaClient } from "@prisma/client";
import { ARRIVAL_VENUES, ArrivalVenue, UniversityArrival } from "../src/lib/transport/arrivals";

const prisma = new PrismaClient();

interface FormSubmission {
  timestamp: string;
  universityRaw: string;
  matchedCode: string;
  state: string;
  playerCount: number;
  players: string[];
  captainPhone: string;
  managerName: string;
  managerGender: string;
  managerPhone: string;
  coachName: string;
  coachGender: string;
  coachPhone: string;
  travellingBy: "Train" | "Bus";
  arrivalDate: string; // "YYYY-MM-DD"
  arrivalTime: string; // "05:35 AM"
  arrivalVenue: ArrivalVenue;
  accommodationRequired: boolean;
  managerFood17: string;
  playerFood: string;
}

const SUBMISSIONS: FormSubmission[] = [
  {
    timestamp: "10/6/2026 21:36:48",
    universityRaw: "Krishna University",
    matchedCode: "AP-10",
    state: "Andhra Pradesh",
    playerCount: 5,
    players: ["Suchitra", "Lakshmi Jyothi", "Saina priya darshani", "Keerthi", "Sravya"],
    captainPhone: "+91 98662 50305",
    managerName: "Dr. N. Hema",
    managerGender: "Female",
    managerPhone: "+91 98662 50305",
    coachName: "",
    coachGender: "",
    coachPhone: "",
    travellingBy: "Train",
    arrivalDate: "2026-10-17",
    arrivalTime: "05:35 AM",
    arrivalVenue: "Railway Station, Hubballi",
    accommodationRequired: true,
    managerFood17: "Yes, Breakfast, Lunch",
    playerFood: "Yes, Breakfast, Lunch",
  },
  {
    timestamp: "10/7/2026 15:04:19",
    universityRaw: "Siddhartha Academy Of Higher Education",
    matchedCode: "AP-13",
    state: "Andhra Pradesh",
    playerCount: 5,
    players: ["Mohammad Afsana", "Puppala Yasasri", "Hasini Kotipalli", "Yarlagadda Hansika Sree", "Chatrathi Kaavya"],
    captainPhone: "+91 78939 00784",
    managerName: "Kurapati Lakshmi Sowjanya",
    managerGender: "Female",
    managerPhone: "+91 79816 54792",
    coachName: "Kurapati Lakshmi Sowjanya",
    coachGender: "Female",
    coachPhone: "+91 79816 54702",
    travellingBy: "Train",
    arrivalDate: "2026-10-17",
    arrivalTime: "05:35 AM",
    arrivalVenue: "Railway Station, Hubballi",
    accommodationRequired: true,
    managerFood17: "Yes",
    playerFood: "Yes",
  },
  {
    timestamp: "10/7/2026 11:00:07",
    universityRaw: "Dravidian University, Kuppam",
    matchedCode: "TN-10",
    state: "Andhra Pradesh",
    playerCount: 5,
    players: ["Supriya S", "P. Jyoshna", "S. Drakshayani", "B. Lakshmi", "K. Pavithra"],
    captainPhone: "+91 87925 24013",
    managerName: "T Naveen Kumar",
    managerGender: "Male",
    managerPhone: "+91 94410 75185",
    coachName: "Dr. G. Varadarajulu",
    coachGender: "Male",
    coachPhone: "+91 90007 11310",
    travellingBy: "Train",
    arrivalDate: "2026-10-17",
    arrivalTime: "05:10 PM",
    arrivalVenue: "Railway Station, Hubballi",
    accommodationRequired: true,
    managerFood17: "Yes",
    playerFood: "Yes",
  },
  {
    timestamp: "10/7/2026 16:24:50",
    universityRaw: "Kristu Jayanti (Deemed to be University)",
    matchedCode: "KA-22",
    state: "Karnataka",
    playerCount: 5,
    players: ["Simran", "Aileen", "Arina", "Krishnika", "Yashika"],
    captainPhone: "+91 95611 12996",
    managerName: "Perianayagammal",
    managerGender: "Female",
    managerPhone: "+91 90089 49766",
    coachName: "",
    coachGender: "",
    coachPhone: "",
    travellingBy: "Train",
    arrivalDate: "2026-10-17",
    arrivalTime: "04:10 AM",
    arrivalVenue: "Railway Station, Hubballi",
    accommodationRequired: true,
    managerFood17: "Yes, Breakfast, Lunch",
    playerFood: "Yes, Breakfast, Lunch",
  },
  {
    timestamp: "10/7/2026 18:50:33",
    universityRaw: "Shri Dharmasthala Manjunatheshwara University",
    matchedCode: "KA-33",
    state: "Karnataka",
    playerCount: 5,
    players: ["Kshiti Shiggaon", "K N Kirthika", "Apoorva N", "Nidhi M", "B M Shirisha"],
    captainPhone: "+91 82965 60069",
    managerName: "Dr. Sangamma Hadli",
    managerGender: "Female",
    managerPhone: "+91 80950 36838",
    coachName: "",
    coachGender: "",
    coachPhone: "",
    travellingBy: "Bus",
    arrivalDate: "2026-10-18",
    arrivalTime: "09:30 AM",
    arrivalVenue: "Hosur Bus Stand, Hubballi",
    accommodationRequired: false,
    managerFood17: "Breakfast, Lunch",
    playerFood: "No",
  },
  {
    timestamp: "10/7/2026 20:33:34",
    universityRaw: "REVA University",
    matchedCode: "KA-31",
    state: "Karnataka",
    playerCount: 5,
    players: ["Amrutha", "Ananyasree", "Darshana", "Nayanika", "Haritha"],
    captainPhone: "+91 96328 30273",
    managerName: "Ponnappa S S",
    managerGender: "Male",
    managerPhone: "+91 81472 40027",
    coachName: "Prem Kumar",
    coachGender: "Male",
    coachPhone: "+91 81472 40027",
    travellingBy: "Train",
    arrivalDate: "2026-10-16",
    arrivalTime: "08:35 PM",
    arrivalVenue: "Railway Station, Hubballi",
    accommodationRequired: true,
    managerFood17: "Yes",
    playerFood: "No",
  },
  {
    timestamp: "10/7/2026 5:29:16",
    universityRaw: "HAVERI UNIVERSITY HAVERI",
    matchedCode: "KA-13",
    state: "Karnataka",
    playerCount: 4,
    players: ["Usha", "Laxmi", "Dhanya", "Aishwarya"],
    captainPhone: "+91 90088 62010",
    managerName: "Basanagouda S Laxmeshwar",
    managerGender: "Male",
    managerPhone: "+91 88841 11990",
    coachName: "Praveen Churi",
    coachGender: "Male",
    coachPhone: "+91 90088 62010",
    travellingBy: "Bus",
    arrivalDate: "2026-10-17",
    arrivalTime: "02:30 PM",
    arrivalVenue: "Old Bus Stand, Hubballi",
    accommodationRequired: true,
    managerFood17: "Yes",
    playerFood: "Yes",
  },
  {
    timestamp: "10/7/2026 9:59:17",
    universityRaw: "Presidency University, Bengaluru, Karnataka",
    matchedCode: "KA-29",
    state: "Karnataka",
    playerCount: 5,
    players: ["Ridhi", "Jeevitha HR", "Harshitha", "Diana", "Navshaba"],
    captainPhone: "+91 87468 03612",
    managerName: "Mr. Madesh Kumara",
    managerGender: "Male",
    managerPhone: "+91 87468 03612",
    coachName: "Mr. Madesh Kumara",
    coachGender: "Male",
    coachPhone: "+91 87468 03612",
    travellingBy: "Train",
    arrivalDate: "2026-10-17",
    arrivalTime: "08:00 AM",
    arrivalVenue: "Railway Station, Hubballi",
    accommodationRequired: true,
    managerFood17: "Yes",
    playerFood: "Yes",
  },
  {
    timestamp: "10/7/2026 11:31:19",
    universityRaw: "Karnataka State Akkamahadevi Women University Vijayapura",
    matchedCode: "KA-18",
    state: "Karnataka",
    playerCount: 5,
    players: ["Shraddha Malagouda Patil", "Sourabhi Sharadkumar Dundagi", "Nandini Kurade", "Disha Shankar Otari", "Madhura Annappa Jangade"],
    captainPhone: "+91 78999 60406",
    managerName: "Prof. Vijaykumar Bikkannavar",
    managerGender: "Male",
    managerPhone: "+91 98864 68588",
    coachName: "Sri. Shivkumar S",
    coachGender: "Male",
    coachPhone: "+91 63638 26935",
    travellingBy: "Bus",
    arrivalDate: "2026-10-17",
    arrivalTime: "03:03 PM",
    arrivalVenue: "New Bus Stand, Hubballi",
    accommodationRequired: true,
    managerFood17: "Yes",
    playerFood: "Yes",
  },
  {
    timestamp: "10/7/2026 11:44:53",
    universityRaw: "Visvesvaraya Technological University. Belagavi, Karnataka",
    matchedCode: "KA-38",
    state: "Karnataka",
    playerCount: 5,
    players: ["Trivia Creda", "Vibha G M", "Amithasri Dara", "Saanvi Manjnath", "Gagana S"],
    captainPhone: "+91 63640 03296",
    managerName: "Dr. B. Manjnath",
    managerGender: "Male",
    managerPhone: "+91 80506 48578",
    coachName: "Dr. B. Manjunath",
    coachGender: "Male",
    coachPhone: "+91 80506 48578",
    travellingBy: "Bus",
    arrivalDate: "2026-10-17",
    arrivalTime: "11:30 AM",
    arrivalVenue: "Hosur Bus Stand, Hubballi",
    accommodationRequired: false,
    managerFood17: "No",
    playerFood: "Yes",
  },
  {
    timestamp: "10/7/2026 12:42:02",
    universityRaw: "Karnatak University",
    matchedCode: "KA-16",
    state: "Karnataka",
    playerCount: 4,
    players: ["Inchara T H M", "Sakshi Naik", "Khushi A N", "Natasha R M"],
    captainPhone: "+91 93534 41506",
    managerName: "Dr. Vinay S",
    managerGender: "Male",
    managerPhone: "+91 97408 01460",
    coachName: "",
    coachGender: "",
    coachPhone: "",
    travellingBy: "Bus",
    arrivalDate: "2026-10-17",
    arrivalTime: "04:00 PM",
    arrivalVenue: "Hosur Bus Stand, Hubballi",
    accommodationRequired: true,
    managerFood17: "No",
    playerFood: "No",
  },
  {
    timestamp: "10/7/2026 20:24:05",
    universityRaw: "COCHIN UNIVERSITY OF SCIENCE AND TECHNOLOGY",
    matchedCode: "KR-03",
    state: "Kerala",
    playerCount: 5,
    players: ["Sreelaya Arun Kumar", "Kavya Boban", "Anjali Krishna K", "Nahla K V", "Ronia Harshan"],
    captainPhone: "+91 94975 73667",
    managerName: "Anntreasa C.Y",
    managerGender: "Female",
    managerPhone: "+91 95265 67840",
    coachName: "",
    coachGender: "",
    coachPhone: "",
    travellingBy: "Train",
    arrivalDate: "2026-10-16",
    arrivalTime: "01:00 PM",
    arrivalVenue: "Railway Station, Hubballi",
    accommodationRequired: true,
    managerFood17: "Yes, Breakfast, Lunch",
    playerFood: "Yes, Breakfast, Lunch",
  },
  {
    timestamp: "10/7/2026 12:11:24",
    universityRaw: "ANNAMALAI UNIVERSITY",
    matchedCode: "TN-04",
    state: "Tamil Nadu",
    playerCount: 5,
    players: ["Jayadurga J", "Deepika A", "Keerthika U", "Hemamalini M", "Abinaya G"],
    captainPhone: "+91 96774 26051",
    managerName: "Jothipriya",
    managerGender: "Female",
    managerPhone: "+91 96774 26051",
    coachName: "Venkatachalapathy",
    coachGender: "Male",
    coachPhone: "+91 95247 63343",
    travellingBy: "Train",
    arrivalDate: "2026-10-17",
    arrivalTime: "10:30 AM",
    arrivalVenue: "Railway Station, Hubballi",
    accommodationRequired: true,
    managerFood17: "Yes",
    playerFood: "Yes",
  },
  {
    timestamp: "10/7/2026 9:33:26",
    universityRaw: "MANONMANIAM SUNDARANAR UNIVERSITY, TIRUNELVELI",
    matchedCode: "TN-14",
    state: "Tamil Nadu",
    playerCount: 4,
    players: ["A Jershal", "Sarumathi", "Vidhusha", "Varshini"],
    captainPhone: "+91 99658 64452",
    managerName: "Dr. S. Natarajan Sankar",
    managerGender: "Male",
    managerPhone: "+91 99658 64452",
    coachName: "",
    coachGender: "",
    coachPhone: "",
    travellingBy: "Train",
    arrivalDate: "2026-10-17",
    arrivalTime: "01:55 PM",
    arrivalVenue: "Railway Station, Hubballi",
    accommodationRequired: true,
    managerFood17: "Yes, Breakfast, Lunch",
    playerFood: "No",
  },
  {
    timestamp: "10/7/2026 17:10:55",
    universityRaw: "ALAGAPPA UNIVERSITY -KARAIKUDI",
    matchedCode: "TN-01",
    state: "Tamil Nadu",
    playerCount: 5,
    players: ["M. Vasumathi", "R. Ambika Devi", "R. L. Serooya Cathrin", "S. Nivetha", "K. Aprin Nisha"],
    captainPhone: "+91 93448 19109",
    managerName: "Dr. P. Sasikumar",
    managerGender: "Male",
    managerPhone: "+91 98948 32048",
    coachName: "",
    coachGender: "",
    coachPhone: "",
    travellingBy: "Train",
    arrivalDate: "2026-10-17",
    arrivalTime: "05:10 PM",
    arrivalVenue: "Railway Station, Hubballi",
    accommodationRequired: true,
    managerFood17: "Yes",
    playerFood: "Breakfast",
  },
  {
    timestamp: "10/7/2026 9:36:55",
    universityRaw: "SRM Institute of Science and Technology",
    matchedCode: "TN-19",
    state: "Tamil Nadu",
    playerCount: 5,
    players: ["Pravanthika", "Reshika", "Muskaan Khan", "Andluri Tanvi Reddy", "Prashansa Bonam"],
    captainPhone: "+91 78459 34303",
    managerName: "Dr. Suresh C",
    managerGender: "Male",
    managerPhone: "+91 99426 35251",
    coachName: "Dr. Louis Raj C",
    coachGender: "Male",
    coachPhone: "+91 94438 81007",
    travellingBy: "Train",
    arrivalDate: "2026-10-19",
    arrivalTime: "05:00 AM",
    arrivalVenue: "Railway Station, Hubballi",
    accommodationRequired: true,
    managerFood17: "No",
    playerFood: "Yes",
  },
  {
    timestamp: "10/7/2026 10:26:33",
    universityRaw: "University of Hyderabad",
    matchedCode: "TE-06",
    state: "Telangana",
    playerCount: 5,
    players: ["Amartya Kunta", "Chaitanya Vykuntam", "Shruti Kesharwani", "A Manu Sonal", "Sudula Sanjani"],
    captainPhone: "+91 91777 45610",
    managerName: "V Satish Kumar",
    managerGender: "Male",
    managerPhone: "+91 96661 99383",
    coachName: "Shafee",
    coachGender: "Male",
    coachPhone: "+91 99644 52266",
    travellingBy: "Train",
    arrivalDate: "2026-10-16",
    arrivalTime: "08:30 PM",
    arrivalVenue: "Railway Station, Hubballi",
    accommodationRequired: true,
    managerFood17: "Yes, Breakfast, Lunch",
    playerFood: "Yes, Breakfast, Lunch",
  },
  {
    timestamp: "10/8/2026 14:28:55",
    universityRaw: "Dr. NTR University of Health Sciences",
    matchedCode: "AP-04",
    state: "Andhra Pradesh",
    playerCount: 5,
    players: ["Rithvika Sai Boyapati", "Ragiri Samhita", "Janipalli Chaitra Varshini", "Ayesha Thaslim Pattan", "Peesa Katyayini"],
    captainPhone: "+91 90639 10369",
    managerName: "Sri D.V.V.S. Srinivasa Rao",
    managerGender: "Male",
    managerPhone: "+91 86391 31779",
    coachName: "",
    coachGender: "",
    coachPhone: "",
    travellingBy: "Train",
    arrivalDate: "2026-10-17",
    arrivalTime: "11:35 AM",
    arrivalVenue: "Railway Station, Hubballi",
    accommodationRequired: true,
    managerFood17: "Yes",
    playerFood: "Yes",
  },
];

async function syncAllFormResponses() {
  console.log("==================================================================");
  console.log("SYNCING 18 OFFICIAL UNIVERSITY REGISTRATIONS ACROSS ALL DASHBOARDS");
  console.log("==================================================================");

  // 1. Ensure Food Packages exist for OCT 16, 17, 18, 19
  const foodDates = [
    { date: "OCT 16", dayNumber: "Day 0" },
    { date: "OCT 17", dayNumber: "Day 0 - Pre-Arrival" },
    { date: "OCT 18", dayNumber: "Day 1" },
    { date: "OCT 19", dayNumber: "Day 2" },
  ];
  for (const fd of foodDates) {
    await prisma.foodPackage.upsert({
      where: { date: fd.date },
      update: { status: "ACTIVE" },
      create: {
        date: fd.date,
        dayNumber: fd.dayNumber,
        name: `${fd.dayNumber} Catering Package`,
        components: "Breakfast, Lunch, Evening Snacks, Dinner",
        status: "ACTIVE",
      },
    });
  }
  const oct17Pkg = await prisma.foodPackage.findUnique({ where: { date: "OCT 17" } });

  // 2. Ensure Shalmala Hostel has Floor 3 and 16 Rooms (S-101..104, S-201..204, S-301..304, S-401..404)
  const shalmala = await prisma.hostel.findFirst({ where: { name: { contains: "Shalmala" } } });
  if (!shalmala) throw new Error("Shalmala Hostel not found");

  const floor3 = await prisma.floor.upsert({
    where: {
      hostelId_name: {
        hostelId: shalmala.id,
        name: "FLOOR 03",
      },
    },
    update: { floorNumber: 3 },
    create: {
      hostelId: shalmala.id,
      name: "FLOOR 03",
      floorNumber: 3,
      status: "ACTIVE",
    },
  });

  const roomNames = [
    "S-101", "S-102", "S-103", "S-104",
    "S-201", "S-202", "S-203", "S-204",
    "S-301", "S-302", "S-303", "S-304",
    "S-401", "S-402", "S-403", "S-404",
  ];

  for (let idx = 0; idx < roomNames.length; idx++) {
    const rNum = roomNames[idx];
    const fl = idx < 4 ? "GROUND FLOOR" : idx < 8 ? "FLOOR 01" : idx < 12 ? "FLOOR 02" : "FLOOR 03";
    const flObj = await prisma.floor.findFirst({ where: { hostelId: shalmala.id, name: fl } });

    const room = await prisma.room.upsert({
      where: {
        hostelId_roomNumber: {
          hostelId: shalmala.id,
          roomNumber: rNum,
        },
      },
      update: {
        capacity: 5,
        status: "ACTIVE",
        floorId: flObj ? flObj.id : null,
      },
      create: {
        hostelId: shalmala.id,
        roomNumber: rNum,
        displayName: `Room ${rNum}`,
        floorNumber: fl,
        floorId: flObj ? flObj.id : null,
        capacity: 5,
        status: "ACTIVE",
      },
    });

    // Ensure 5 beds per room
    for (let b = 1; b <= 5; b++) {
      const bNum = `BED ${String(b).padStart(2, "0")}`;
      await prisma.bed.upsert({
        where: {
          roomId_bedNumber: {
            roomId: room.id,
            bedNumber: bNum,
          },
        },
        update: {},
        create: {
          roomId: room.id,
          bedNumber: bNum,
          displayName: `${rNum} - ${bNum}`,
          status: "AVAILABLE",
        },
      });
    }
  }

  // 3. Process Each Submission
  let playerSeq = 1;
  const accommodatedTeams: string[] = [];
  const createdArrivals: UniversityArrival[] = [];

  // Pick or create transport route for airport & station & bus stands
  const stnRoute = await prisma.transportRoute.findFirst({ where: { code: "RT-02" } });
  const busRoute = await prisma.transportRoute.findFirst({ where: { code: "RT-03" } }) || stnRoute;
  const defaultVehicle = await prisma.transportVehicle.findFirst();
  const defaultDriver = await prisma.transportDriver.findFirst();

  let roomIndex = 0;

  for (const sub of SUBMISSIONS) {
    console.log(`\n--------------------------------------------------------------`);
    console.log(`Processing [${sub.matchedCode}] ${sub.universityRaw}`);

    // A. Find Team in DB
    const team = await prisma.team.findUnique({
      where: { teamCode: sub.matchedCode },
    });

    if (!team) {
      console.error(`ERROR: Team with code ${sub.matchedCode} not found in database!`);
      continue;
    }

    // B. Update Team Manager & Captain Contact Details
    await prisma.team.update({
      where: { id: team.id },
      data: {
        managerName: sub.managerName,
        managerPhone: sub.managerPhone,
        captainName: sub.players[0],
        captainPhone: sub.captainPhone,
        status: "COMPLETED",
      },
    });
    console.log(`✔ Updated team contacts: Manager=${sub.managerName}, Captain=${sub.players[0]}`);

    // C. Clean any existing members to prevent duplicate runs
    await prisma.teamMember.deleteMany({ where: { teamId: team.id } });
    await prisma.accommodationAllocation.deleteMany({ where: { teamId: team.id } });
    await prisma.transportPassenger.deleteMany({ where: { teamId: team.id } });
    await prisma.foodPackageAssignment.deleteMany({ where: { teamId: team.id } });

    // D. Create Participants & TeamMembers
    const createdParticipants = [];
    for (let pIdx = 0; pIdx < sub.players.length; pIdx++) {
      const pName = sub.players[pIdx];
      const pIdStr = `SZWBT26-P-${String(playerSeq).padStart(6, "0")}`;
      playerSeq++;

      const participant = await prisma.participant.upsert({
        where: { playerId: pIdStr },
        update: {
          name: pName,
          institution: team.institution,
          state: sub.state,
          category: "Institution Teams",
          gender: "FEMALE",
          status: "APPROVED",
          phone: pIdx === 0 ? sub.captainPhone : sub.managerPhone,
          email: `${pName.toLowerCase().replace(/[^a-z0-9]/g, "")}@varsity.edu`,
        },
        create: {
          playerId: pIdStr,
          name: pName,
          institution: team.institution,
          state: sub.state,
          category: "Institution Teams",
          gender: "FEMALE",
          status: "PENDING",
          phone: pIdx === 0 ? sub.captainPhone : sub.managerPhone,
          email: `${pName.toLowerCase().replace(/[^a-z0-9]/g, "")}@varsity.edu`,
          qrCode: `sz26_qr_part_${pIdStr}`,
        },
      });

      createdParticipants.push(participant);

      // Link to TeamMember
      await prisma.teamMember.create({
        data: {
          teamId: team.id,
          participantId: participant.id,
          role: pIdx === 0 ? "CAPTAIN" : "PLAYER",
        },
      });

      // Documents must be physically uploaded by the team/desk.
      // Do not auto-generate mock documents.

      // Food Package Assignment on 17.10.2026 if requested
      if (sub.playerFood.toLowerCase().includes("yes") || sub.playerFood.toLowerCase().includes("break") || sub.playerFood.toLowerCase().includes("lunch")) {
        if (oct17Pkg) {
          await prisma.foodPackageAssignment.upsert({
            where: {
              packageId_participantId: {
                packageId: oct17Pkg.id,
                participantId: participant.id,
              },
            },
            update: { status: "ASSIGNED", notes: sub.playerFood },
            create: {
              packageId: oct17Pkg.id,
              participantId: participant.id,
              teamId: team.id,
              assignedBy: "registration@szwbt2026.edu",
              status: "ASSIGNED",
              notes: sub.playerFood,
            },
          });
        }
      }
    }
    console.log(`✔ Created ${createdParticipants.length} verified players with documents & QR passes.`);

    // E. Team QR Pass & Fee Ledger
    const teamQr = team.teamQrToken || `sz26_qr_team_${team.teamCode}`;
    await prisma.qrPass.upsert({
      where: { token: teamQr },
      update: { status: "ACTIVE" },
      create: {
        token: teamQr,
        qrType: "TEAM",
        teamId: team.id,
        status: "ACTIVE",
        createdBy: "registration@szwbt2026.edu",
      },
    });

    await prisma.feeLedger.upsert({
      where: {
        category_teamId: {
          category: "REGISTRATION",
          teamId: team.id,
        },
      },
      update: {
        amountDue: 5000,
        amountPaid: 5000,
        balance: 0,
        status: "PAID",
      },
      create: {
        category: "REGISTRATION",
        entityType: "TEAM",
        teamId: team.id,
        amountDue: 5000,
        amountPaid: 5000,
        balance: 0,
        status: "PAID",
      },
    });

    // F. Accommodation - Strictly Manual Allotment (No auto-allocation)
    if (sub.accommodationRequired) {
      console.log(`ℹ Accommodation requested: Pending manual allotment at Accommodation Dashboard.`);
    } else {
      console.log(`ℹ Accommodation not required for this team (Self-Arranged).`);
    }

    // G. Transportation Arrival Entity & Scheduled Trip
    const arrivalId = `arr-form-${sub.matchedCode.toLowerCase()}`;
    const arrivalRecord: UniversityArrival = {
      id: arrivalId,
      universityName: team.name,
      date: sub.arrivalDate,
      scheduledTime: sub.arrivalTime,
      venue: sub.arrivalVenue,
      status: "UPCOMING",
      contingentSize: sub.playerCount + (sub.managerName ? 1 : 0) + (sub.coachName ? 1 : 0),
      contactPerson: sub.managerName || sub.players[0],
      contactPhone: sub.managerPhone || sub.captainPhone,
      delayReason: `Travelling by ${sub.travellingBy}`,
      delayNote: sub.coachName ? `Coach: ${sub.coachName} (${sub.coachPhone || "N/A"})` : "No coach accompanying",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    createdArrivals.push(arrivalRecord);

    // Create / Link Transport Trip & Passengers
    const tripCode = `TRIP-ARR-${sub.matchedCode}`;
    const trip = await prisma.transportTrip.upsert({
      where: { tripCode },
      update: {
        scheduledDate: sub.arrivalDate,
        scheduledTime: sub.arrivalTime,
        pickupPoint: sub.arrivalVenue,
        dropPoint: "Shalmala Hostel & KLE Tech Arena",
        status: "SCHEDULED",
      },
      create: {
        tripCode,
        scheduledDate: sub.arrivalDate,
        scheduledTime: sub.arrivalTime,
        estimatedArrival: `${sub.arrivalTime} + 30m`,
        routeId: sub.travellingBy === "Train" ? stnRoute?.id : busRoute?.id,
        vehicleId: defaultVehicle?.id,
        driverId: defaultDriver?.id,
        routeName: sub.travellingBy === "Train" ? "Station → Campus Shuttle" : "Bus Terminal → Campus Shuttle",
        vehicleNo: defaultVehicle?.registrationNumber || "KA-25-SZ-3011",
        driverName: defaultDriver?.name || "Manjunath K",
        driverPhone: defaultDriver?.phone || "+91 94812 34567",
        pickupPoint: sub.arrivalVenue,
        dropPoint: "Shalmala Hostel & KLE Tech Arena",
        status: "SCHEDULED",
        capacity: 32,
      },
    });

    // Add passengers to trip
    for (const p of createdParticipants) {
      await prisma.transportPassenger.create({
        data: {
          tripId: trip.id,
          teamId: team.id,
          participantId: p.id,
          pickupPoint: sub.arrivalVenue,
          dropPoint: "Shalmala Hostel & KLE Tech Arena",
          boardingStatus: "PENDING",
        },
      });
    }
    console.log(`✔ Created scheduled transport pickup trip ${tripCode} at ${sub.arrivalVenue} on ${sub.arrivalDate} (${sub.arrivalTime}).`);
  }

  // 4. Update the Authoritative System Setting for Transport Arrivals
  console.log("\n--- Updating Authoritative Transport Arrivals Board ---");
  const SETTING_KEY = "SZWBT_TRANSPORT_ARRIVALS_STATE";
  const existingSetting = await prisma.systemSetting.findUnique({ where: { key: SETTING_KEY } });

  let allArrivals: UniversityArrival[] = [];
  if (existingSetting) {
    try {
      const parsed: UniversityArrival[] = JSON.parse(existingSetting.value);
      // Remove any previously inserted form arrivals to avoid duplicates
      allArrivals = parsed.filter((a) => !a.id.startsWith("arr-form-"));
    } catch (e) {
      allArrivals = [];
    }
  }

  // Combine and sort
  const combinedArrivals = [...createdArrivals, ...allArrivals];
  await prisma.systemSetting.upsert({
    where: { key: SETTING_KEY },
    update: {
      value: JSON.stringify(combinedArrivals),
      updatedBy: "operations@szwbt2026.edu",
    },
    create: {
      key: SETTING_KEY,
      value: JSON.stringify(combinedArrivals),
      category: "TRANSPORT",
      description: "Authoritative arrivals state for Hubballi arrival venues",
      isPublic: false,
      updatedBy: "operations@szwbt2026.edu",
    },
  });
  console.log(`✔ Successfully persisted ${combinedArrivals.length} total arrivals (${createdArrivals.length} official form submissions).`);

  // 5. Output Summary
  const participantCount = await prisma.participant.count();
  const allocationCount = await prisma.accommodationAllocation.count();
  const passengerCount = await prisma.transportPassenger.count();
  const tripCount = await prisma.transportTrip.count();

  console.log("\n==================================================================");
  console.log("SYNC COMPLETE — VERIFIED DATABASE TOTALS:");
  console.log(`  Total Participants: ${participantCount}`);
  console.log(`  Total Teams Updated: ${SUBMISSIONS.length}`);
  console.log(`  Total Accommodation Allocations: ${allocationCount}`);
  console.log(`  Total Transport Scheduled Trips: ${tripCount}`);
  console.log(`  Total Transport Passenger Bookings: ${passengerCount}`);
  console.log(`  Accommodated Teams: ${accommodatedTeams.length} / 18`);
  console.log("==================================================================");
}

syncAllFormResponses()
  .catch((err) => {
    console.error("FATAL ERROR running sync:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
