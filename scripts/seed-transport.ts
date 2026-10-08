import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seedTransport() {
  console.log("Seeding Transport Operations Data (University-Provided / Free Service)...");

  // 1. Create Transport Routes
  const route1 = await prisma.transportRoute.upsert({
    where: { code: "RT-01" },
    update: {},
    create: {
      code: "RT-01",
      name: "Route 01: Airport Express",
      origin: "Hubballi Airport (HBX)",
      destination: "KLE Tech Arena / Hostels",
      estimatedMinutes: 35,
      status: "ACTIVE",
      stops: {
        create: [
          { name: "Hubballi Airport T1 Gate 2", orderIndex: 1, expectedMinutes: 0 },
          { name: "Shalmala Hostel Gate", orderIndex: 2, expectedMinutes: 25 },
          { name: "KLE Tech Arena East Gate", orderIndex: 3, expectedMinutes: 35 },
        ],
      },
    },
    include: { stops: true },
  });

  const route2 = await prisma.transportRoute.upsert({
    where: { code: "RT-02" },
    update: {},
    create: {
      code: "RT-02",
      name: "Route 02: Hubballi Junction Shuttle",
      origin: "Hubballi Junction Railway Station (UBL)",
      destination: "KLE Tech Arena / Hostels",
      estimatedMinutes: 25,
      status: "ACTIVE",
      stops: {
        create: [
          { name: "Hubballi Junction Concourse", orderIndex: 1, expectedMinutes: 0 },
          { name: "Vindhya Boys Hostel Gate", orderIndex: 2, expectedMinutes: 18 },
          { name: "Shalmala Hostel Gate", orderIndex: 3, expectedMinutes: 22 },
          { name: "KLE Tech Arena East Gate", orderIndex: 4, expectedMinutes: 25 },
        ],
      },
    },
    include: { stops: true },
  });

  const route3 = await prisma.transportRoute.upsert({
    where: { code: "RT-03" },
    update: {},
    create: {
      code: "RT-03",
      name: "Route 03: Arena - Hostel Circuit",
      origin: "Shalmala Hostel Gate",
      destination: "KLE Tech Badminton Arena",
      estimatedMinutes: 15,
      status: "ACTIVE",
      stops: {
        create: [
          { name: "Shalmala Hostel Gate", orderIndex: 1, expectedMinutes: 0 },
          { name: "Vindhya Boys Hostel Gate", orderIndex: 2, expectedMinutes: 5 },
          { name: "Campus Athlete Village Hub", orderIndex: 3, expectedMinutes: 10 },
          { name: "Main Arena Players Entrance", orderIndex: 4, expectedMinutes: 15 },
        ],
      },
    },
    include: { stops: true },
  });

  console.log("✔ Routes and stops initialized");

  // 2. Create Vehicles
  const vehiclesData = [
    { registrationNumber: "KA-25-EA-9021", type: "AC_BUS", capacity: 45, makeModel: "Tata Starbus 45-Seater Ultra AC", status: "AVAILABLE" },
    { registrationNumber: "KA-25-EA-9022", type: "AC_BUS", capacity: 45, makeModel: "Ashok Leyland Falcon 45-Seater", status: "AVAILABLE" },
    { registrationNumber: "KA-25-SZ-3011", type: "SHUTTLE_BUS", capacity: 32, makeModel: "Eicher Skyline Pro 32-Seater", status: "AVAILABLE" },
    { registrationNumber: "KA-25-SZ-3012", type: "SHUTTLE_BUS", capacity: 32, makeModel: "Eicher Skyline Pro 32-Seater", status: "AVAILABLE" },
    { registrationNumber: "KA-25-EV-1001", type: "ELECTRIC_SHUTTLE", capacity: 24, makeModel: "Olectra Greentech Electric 24-Seater", status: "AVAILABLE" },
    { registrationNumber: "KA-25-VN-5501", type: "MINI_VAN", capacity: 14, makeModel: "Force Traveller 14-Seater AC", status: "AVAILABLE" },
  ];

  const vehicles = [];
  for (const v of vehiclesData) {
    const veh = await prisma.transportVehicle.upsert({
      where: { registrationNumber: v.registrationNumber },
      update: { capacity: v.capacity, status: v.status, makeModel: v.makeModel, type: v.type },
      create: v,
    });
    vehicles.push(veh);
  }
  console.log(`✔ ${vehicles.length} Fleet Vehicles initialized`);

  // 3. Create Drivers
  const driversData = [
    { driverCode: "DRV-01", name: "Manjunath K", phone: "+91 94812 34567", licenseNumber: "KA-25-2018-004912", status: "AVAILABLE" },
    { driverCode: "DRV-02", name: "Basavaraj Patil", phone: "+91 94812 34568", licenseNumber: "KA-25-2017-003819", status: "AVAILABLE" },
    { driverCode: "DRV-03", name: "Suresh Gowda", phone: "+91 94812 34569", licenseNumber: "KA-25-2019-007142", status: "AVAILABLE" },
    { driverCode: "DRV-04", name: "Anand Hegde", phone: "+91 94812 34570", licenseNumber: "KA-25-2016-002194", status: "AVAILABLE" },
    { driverCode: "DRV-05", name: "Ravi Kumbar", phone: "+91 94812 34571", licenseNumber: "KA-25-2020-008923", status: "AVAILABLE" },
  ];

  const drivers = [];
  for (const d of driversData) {
    const drv = await prisma.transportDriver.upsert({
      where: { driverCode: d.driverCode },
      update: { name: d.name, phone: d.phone, licenseNumber: d.licenseNumber, status: d.status },
      create: d,
    });
    drivers.push(drv);
  }
  console.log(`✔ ${drivers.length} Drivers initialized`);

  // Trips and Passengers remain EMPTY for clean operational start
  console.log("✔ Zero fake trips / passengers created. Transport operations starts clean.");
  console.log("Transport database seeding complete!\n");
}

seedTransport()
  .catch((e) => {
    console.error("Error seeding transport:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
