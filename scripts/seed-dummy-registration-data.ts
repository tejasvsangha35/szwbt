import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seedDummyRegistrationData() {
  console.log("=== Seeding 5 Dummy University Contingents for Registration Portal ===");

  // Find institutions in database
  const universities = [
    {
      state: "Karnataka",
      searchName: "Bangalore University",
      teamCode: "TM-SZ26-KAR01",
      teamName: "Bangalore University Women's Badminton Team",
      managerName: "Dr. Ramesh Rao",
      managerPhone: "+91 98450 11223",
      managerEmail: "ramesh.rao@bangaloreuniv.edu",
      managerHostelRoom: "V-101",
      athletesHostelRoom: "S-101",
      allVerified: true,
      athletes: [
        { name: "Ananya Sharma", isCaptain: true, phone: "+91 98765 41001", email: "ananya.sharma@bu.edu", verified: true },
        { name: "Pooja Hegde", isCaptain: false, phone: "+91 98765 41002", email: "pooja.hegde@bu.edu", verified: true },
        { name: "Sneha Kulkarni", isCaptain: false, phone: "+91 98765 41003", email: "sneha.k@bu.edu", verified: true },
        { name: "Deepika Patil", isCaptain: false, phone: "+91 98765 41004", email: "deepika.patil@bu.edu", verified: true },
        { name: "Kavya Murthy", isCaptain: false, phone: "+91 98765 41005", email: "kavya.m@bu.edu", verified: true },
      ],
      paymentMethod: "CASH",
      receipt: "REC-SZ26-100001",
    },
    {
      state: "Tamil Nadu",
      searchName: "Anna University",
      teamCode: "TM-SZ26-TN01",
      teamName: "Anna University Women's Badminton Team",
      managerName: "Prof. S. Soundararajan",
      managerPhone: "+91 94440 22334",
      managerEmail: "s.soundar@annauniv.edu",
      managerHostelRoom: "V-102",
      athletesHostelRoom: "S-102",
      allVerified: true,
      athletes: [
        { name: "Meenakshi Sundaram", isCaptain: true, phone: "+91 98765 42001", email: "meenakshi.s@annauniv.edu", verified: true },
        { name: "Harini Krishnan", isCaptain: false, phone: "+91 98765 42002", email: "harini.k@annauniv.edu", verified: true },
        { name: "Divya Bharathi", isCaptain: false, phone: "+91 98765 42003", email: "divya.b@annauniv.edu", verified: true },
        { name: "Priyanka Natarajan", isCaptain: false, phone: "+91 98765 42004", email: "priyanka.n@annauniv.edu", verified: true },
        { name: "Keerthana Raman", isCaptain: false, phone: "+91 98765 42005", email: "keerthana.r@annauniv.edu", verified: true },
      ],
      paymentMethod: "UPI",
      utr: "329012345678",
      receipt: "REC-SZ26-100002",
    },
    {
      state: "Telangana",
      searchName: "Osmania University",
      teamCode: "TM-SZ26-TS01",
      teamName: "Osmania University Women's Badminton Team",
      managerName: "Coach K. V. Prasad",
      managerPhone: "+91 98490 33445",
      managerEmail: "kvprasad@osmania.ac.in",
      managerHostelRoom: "V-103",
      athletesHostelRoom: "S-103",
      allVerified: false,
      athletes: [
        { name: "Sravani Reddy", isCaptain: true, phone: "+91 98765 43001", email: "sravani.r@osmania.ac.in", verified: true },
        { name: "Bhavana Varma", isCaptain: false, phone: "+91 98765 43002", email: "bhavana.v@osmania.ac.in", verified: false },
        { name: "Niharika Rao", isCaptain: false, phone: "+91 98765 43003", email: "niharika.rao@osmania.ac.in", verified: false },
        { name: "Sai Pallavi G.", isCaptain: false, phone: "+91 98765 43004", email: "saipallavi@osmania.ac.in", verified: false },
        { name: "Tejaswini Chenna", isCaptain: false, phone: "+91 98765 43005", email: "tejaswini.c@osmania.ac.in", verified: false },
      ],
      paymentMethod: "CASH",
      receipt: "REC-SZ26-100003",
    },
    {
      state: "Kerala",
      searchName: "University of Kerala",
      teamCode: "TM-SZ26-KER01",
      teamName: "University of Kerala Women's Badminton Team",
      managerName: "Dr. Matthew Thomas",
      managerPhone: "+91 94470 44556",
      managerEmail: "matthew.thomas@keralauniversity.ac.in",
      managerHostelRoom: "V-104",
      athletesHostelRoom: "S-104",
      allVerified: true,
      athletes: [
        { name: "Anjana Nair", isCaptain: true, phone: "+91 98765 44001", email: "anjana.nair@ku.edu", verified: true },
        { name: "Gopika Menon", isCaptain: false, phone: "+91 98765 44002", email: "gopika.m@ku.edu", verified: true },
        { name: "Arya Pillai", isCaptain: false, phone: "+91 98765 44003", email: "arya.pillai@ku.edu", verified: true },
        { name: "Sneha Kurian", isCaptain: false, phone: "+91 98765 44004", email: "sneha.k@ku.edu", verified: true },
        { name: "Rhea George", isCaptain: false, phone: "+91 98765 44005", email: "rhea.george@ku.edu", verified: true },
      ],
      paymentMethod: "CASH",
      receipt: "REC-SZ26-100004",
    },
    {
      state: "Andhra Pradesh",
      searchName: "Andhra University",
      teamCode: "TM-SZ26-AP01",
      teamName: "Andhra University Women's Badminton Team",
      managerName: "Prof. N. Venkatratnam",
      managerPhone: "+91 98480 55667",
      managerEmail: "venkatratnam@andhrauniversity.edu.in",
      managerHostelRoom: "V-201",
      athletesHostelRoom: "S-201",
      allVerified: false,
      athletes: [
        { name: "Lavanya Devi", isCaptain: true, phone: "+91 98765 45001", email: "lavanya.d@au.edu.in", verified: true },
        { name: "Chandana Sri", isCaptain: false, phone: "+91 98765 45002", email: "chandana.s@au.edu.in", verified: true },
        { name: "Sirisha V.", isCaptain: false, phone: "+91 98765 45003", email: "sirisha.v@au.edu.in", verified: false },
        { name: "Harshita Rayudu", isCaptain: false, phone: "+91 98765 45004", email: "harshita.r@au.edu.in", verified: false },
        { name: "Mounika Chowdary", isCaptain: false, phone: "+91 98765 45005", email: "mounika.c@au.edu.in", verified: false },
      ],
      paymentMethod: "UPI",
      utr: "329055443322",
      receipt: "REC-SZ26-100005",
    },
  ];

  // Clean up any previously seeded dummy data
  const teamCodes = universities.map((u) => u.teamCode);
  const existingTeams = await prisma.team.findMany({
    where: { teamCode: { in: teamCodes } },
    select: { id: true },
  });
  const existingTeamIds = existingTeams.map((t) => t.id);

  const existingParticipants = await prisma.participant.findMany({
    where: {
      OR: [
        { playerId: { startsWith: "SZ26-MGR-" } },
        { playerId: { startsWith: "SZ26-ATH-" } },
      ],
    },
    select: { id: true },
  });
  const existingParticipantIds = existingParticipants.map((p) => p.id);

  if (existingTeamIds.length > 0 || existingParticipantIds.length > 0) {
    console.log(
      `Cleaning up ${existingTeamIds.length} existing dummy teams and ${existingParticipantIds.length} dummy participants...`
    );

    await prisma.accommodationAllocation.deleteMany({
      where: {
        OR: [
          { teamId: { in: existingTeamIds } },
          { participantId: { in: existingParticipantIds } },
        ],
      },
    });

    const bedNumbers = [
      "V-101", "V-102", "V-103", "V-104", "V-201",
      "S-101", "S-102", "S-103", "S-104", "S-201",
    ];
    await prisma.bed.updateMany({
      where: { room: { roomNumber: { in: bedNumbers } } },
      data: { status: "AVAILABLE" },
    });

    await prisma.qrPass.deleteMany({
      where: {
        OR: [
          { teamId: { in: existingTeamIds } },
          { participantId: { in: existingParticipantIds } },
        ],
      },
    });

    await prisma.document.deleteMany({
      where: { participantId: { in: existingParticipantIds } },
    });

    await prisma.feeLedger.deleteMany({
      where: {
        OR: [
          { teamId: { in: existingTeamIds } },
          { participantId: { in: existingParticipantIds } },
        ],
      },
    });

    await prisma.teamMember.deleteMany({
      where: {
        OR: [
          { teamId: { in: existingTeamIds } },
          { participantId: { in: existingParticipantIds } },
        ],
      },
    });

    await prisma.participant.deleteMany({
      where: { id: { in: existingParticipantIds } },
    });

    await prisma.team.deleteMany({
      where: { id: { in: existingTeamIds } },
    });
  }

  // Sample portrait photos
  const femalePhotos = [
    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80",
  ];
  const malePhoto =
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80";

  let athleteGlobalIndex = 1;
  let managerGlobalIndex = 1;

  for (const u of universities) {
    console.log(`\nProcessing ${u.searchName} (${u.state})...`);

    // Match institution in database
    const instRecord = await prisma.institution.findFirst({
      where: { name: { contains: u.searchName, mode: "insensitive" } },
    });

    const institutionId = instRecord?.id;
    const institutionName = instRecord?.name || `${u.searchName}, ${u.state}`;

    // 1. Create Team
    const team = await prisma.team.create({
      data: {
        teamCode: u.teamCode,
        name: u.teamName,
        institution: institutionName,
        state: u.state,
        managerName: u.managerName,
        managerPhone: u.managerPhone,
        captainName: u.athletes[0].name,
        captainPhone: u.athletes[0].phone,
        status: u.allVerified ? "COMPLETED" : "PENDING_VERIFICATION",
        teamQrToken: `sz26_team_${u.teamCode}`,
      },
    });

    // Team QR Pass
    await prisma.qrPass.create({
      data: {
        token: `sz26_team_${u.teamCode}`,
        qrType: "TEAM",
        teamId: team.id,
        status: "ACTIVE",
      },
    });

    // 2. Fetch Beds for manager and athletes
    const managerRoom = await prisma.room.findFirst({
      where: { roomNumber: u.managerHostelRoom },
      include: { hostel: true, beds: { orderBy: { bedNumber: "asc" } } },
    });
    const managerBed = managerRoom?.beds[0];

    const athleteRoom = await prisma.room.findFirst({
      where: { roomNumber: u.athletesHostelRoom },
      include: { hostel: true, beds: { orderBy: { bedNumber: "asc" } } },
    });

    // 3. Create Manager Participant
    const mgrPlayerId = `SZ26-MGR-${String(managerGlobalIndex).padStart(3, "0")}`;
    managerGlobalIndex++;

    const managerParticipant = await prisma.participant.create({
      data: {
        playerId: mgrPlayerId,
        name: u.managerName,
        email: u.managerEmail,
        phone: u.managerPhone,
        institution: institutionName,
        institutionId: institutionId || null,
        state: u.state,
        category: "Women's Team Official",
        gender: "MALE",
        status: "APPROVED",
        photoUrl: malePhoto,
        hostel: managerRoom?.hostel?.name || "Vindhya Boys Hostel",
        room: managerRoom?.roomNumber || u.managerHostelRoom,
        qrCode: `sz26_part_${mgrPlayerId}`,
      },
    });

    // Team Membership for Manager
    await prisma.teamMember.create({
      data: {
        teamId: team.id,
        participantId: managerParticipant.id,
        role: "MANAGER",
      },
    });

    // Manager Bed Allocation
    if (managerBed) {
      await prisma.accommodationAllocation.create({
        data: {
          bedId: managerBed.id,
          participantId: managerParticipant.id,
          teamId: team.id,
          status: "ACTIVE",
          allocatedBy: "desk01@szwbt2026.edu",
        },
      });
      await prisma.bed.update({
        where: { id: managerBed.id },
        data: { status: "OCCUPIED" },
      });
    }

    // Manager Combined PDF Document
    await prisma.document.create({
      data: {
        participantId: managerParticipant.id,
        type: "COMBINED_PDF",
        fileName: `${u.managerName.replace(/\s+/g, "_")}_Manager_Dossier.pdf`,
        filePath: `/uploads/dossiers/${mgrPlayerId}_combined.pdf`,
        status: "VERIFIED",
        mimeType: "application/pdf",
        capturedBy: "desk01@szwbt2026.edu",
      },
    });

    // Manager QR Pass
    await prisma.qrPass.create({
      data: {
        token: `SZ26-QR-${mgrPlayerId}`,
        qrType: "PARTICIPANT",
        participantId: managerParticipant.id,
        teamId: team.id,
        status: "ACTIVE",
      },
    });

    // Manager Fee Ledger
    await prisma.feeLedger.create({
      data: {
        category: "REGISTRATION",
        entityType: "PARTICIPANT",
        participantId: managerParticipant.id,
        amountDue: 0,
        amountPaid: 0,
        status: "PAID",
      },
    });

    // 4. Create 5 Athletes
    for (let idx = 0; idx < u.athletes.length; idx++) {
      const a = u.athletes[idx];
      const athPlayerId = `SZ26-ATH-${String(athleteGlobalIndex).padStart(3, "0")}`;
      const athBed = athleteRoom?.beds[idx];
      athleteGlobalIndex++;

      const athPhoto = femalePhotos[idx % femalePhotos.length];

      const athleteParticipant = await prisma.participant.create({
        data: {
          playerId: athPlayerId,
          name: a.name,
          email: a.email,
          phone: a.phone,
          institution: institutionName,
          institutionId: institutionId || null,
          state: u.state,
          category: a.isCaptain ? "Team Captain / Women's Singles" : "Women's Team Athlete",
          gender: "FEMALE",
          status: a.verified ? "APPROVED" : "PENDING",
          photoUrl: athPhoto,
          hostel: athleteRoom?.hostel?.name || "Shalmala Hostel",
          room: athleteRoom?.roomNumber || u.athletesHostelRoom,
          qrCode: `sz26_part_${athPlayerId}`,
        },
      });

      // Team Membership for Athlete
      await prisma.teamMember.create({
        data: {
          teamId: team.id,
          participantId: athleteParticipant.id,
          role: a.isCaptain ? "CAPTAIN" : "ATHLETE",
        },
      });

      // Athlete Bed Allocation
      if (athBed) {
        await prisma.accommodationAllocation.create({
          data: {
            bedId: athBed.id,
            participantId: athleteParticipant.id,
            teamId: team.id,
            status: "ACTIVE",
            allocatedBy: "desk01@szwbt2026.edu",
          },
        });
        await prisma.bed.update({
          where: { id: athBed.id },
          data: { status: "OCCUPIED" },
        });
      }

      // Athlete Combined PDF Document
      await prisma.document.create({
        data: {
          participantId: athleteParticipant.id,
          type: "COMBINED_PDF",
          fileName: `${a.name.replace(/\s+/g, "_")}_Verification_Dossier.pdf`,
          filePath: `/uploads/dossiers/${athPlayerId}_combined.pdf`,
          status: a.verified ? "VERIFIED" : "PENDING",
          mimeType: "application/pdf",
          capturedBy: "desk01@szwbt2026.edu",
        },
      });

      // Athlete QR Pass (Only active if verified)
      if (a.verified) {
        await prisma.qrPass.create({
          data: {
            token: `SZ26-QR-${athPlayerId}`,
            qrType: "PARTICIPANT",
            participantId: athleteParticipant.id,
            teamId: team.id,
            status: "ACTIVE",
          },
        });
      }

      // Athlete Fee Ledger
      await prisma.feeLedger.create({
        data: {
          category: "REGISTRATION",
          entityType: "PARTICIPANT",
          participantId: athleteParticipant.id,
          amountDue: 500,
          amountPaid: 500,
          status: "PAID",
        },
      });
    }

    // 5. Team Fee Ledger
    await prisma.feeLedger.create({
      data: {
        category: "REGISTRATION",
        entityType: "TEAM",
        teamId: team.id,
        amountDue: 2500,
        amountPaid: 2500,
        status: "PAID",
      },
    });

    console.log(`✓ Seeded team ${u.teamCode} (${institutionName}) with Manager + 5 Athletes.`);
  }

  const finalTeams = await prisma.team.count();
  const finalParticipants = await prisma.participant.count();
  console.log(`\n=== Seeding Finished Successfully! ===`);
  console.log(`Total Teams: ${finalTeams}`);
  console.log(`Total Participants: ${finalParticipants}`);
}

seedDummyRegistrationData()
  .catch((e) => {
    console.error("Error seeding dummy data:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
