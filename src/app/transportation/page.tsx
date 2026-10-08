"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ArcadeNav } from "@/components/navigation/ArcadeNav";
import { 
  Bus, Plane, Train, MapPin, Clock, Shield, CheckCircle2, 
  ChevronRight, Phone, Navigation, ArrowRight, AlertCircle, Compass,
  Search, Calendar, Users, RefreshCw, Sparkles
} from "lucide-react";

type TransportStep = "PICKUP" | "TRAVEL" | "REACH" | "PLAY";

export default function TransportationPage() {
  const [activeStep, setActiveStep] = useState<TransportStep>("PICKUP");
  const [selectedHub, setSelectedHub] = useState<string>("airport");

  // Live University Arrival Schedule State
  const [selectedArrivalDate, setSelectedArrivalDate] = useState<string>("2026-10-17");
  const [arrivalsList, setArrivalsList] = useState<any[]>([]);
  const [loadingArrivals, setLoadingArrivals] = useState<boolean>(true);
  const [searchArrivalQuery, setSearchArrivalQuery] = useState<string>("");
  const [arrivalFilterMode, setArrivalFilterMode] = useState<"ALL" | "TRAIN" | "BUS">("ALL");

  const fetchArrivals = useCallback(async () => {
    try {
      setLoadingArrivals(true);
      const res = await fetch(`/api/transport/arrivals?date=${selectedArrivalDate}`);
      if (res.ok) {
        const json = await res.json();
        setArrivalsList(json.arrivals || []);
      }
    } catch (e) {
      console.error("Failed to fetch arrival schedule", e);
    } finally {
      setLoadingArrivals(false);
    }
  }, [selectedArrivalDate]);

  useEffect(() => {
    fetchArrivals();
  }, [fetchArrivals]);

  const steps = [
    { id: "PICKUP", number: "1", title: "Pick Up", desc: "Arrival Hub Welcome Desk" },
    { id: "TRAVEL", number: "2", title: "Travel", desc: "Dedicated AC Shuttles" },
    { id: "REACH", number: "3", title: "Reach", desc: "KLE Tech Arena Drop-off" },
    { id: "PLAY", number: "4", title: "Play", desc: "Match Court Ready" },
  ];

  const hubsData = [
    {
      id: "airport",
      name: "Airport Pickup",
      hubName: "Hubballi Airport (HBX)",
      icon: Plane,
      distance: "12 km • ~20 mins transit",
      frequency: "Every 45 mins (synced with flight arrivals)",
      pickupLocation: "Terminal 1 Exit — South Zone Reception Booth",
      color: "#18D8D0",
      features: [
        "Flight tracking by tournament operations",
        "Luggage assistance directly to hostel room",
        "Complimentary sports hydration kit",
        "Air-conditioned championship express bus",
      ],
    },
    {
      id: "railway",
      name: "Railway Station",
      hubName: "Hubballi Junction (UBL) & Dharwad (DWR)",
      icon: Train,
      distance: "6.5 km • ~15 mins transit",
      frequency: "Every 30 mins (24/7 service during Oct 17-21)",
      pickupLocation: "Platform 1 Main Portico — Reception Kiosk",
      color: "#FF5A16",
      features: [
        "Coordinated with Vande Bharat, Jan Shatabdi & Expresses",
        "Round-the-clock volunteer escorts for female squads",
        "Direct connection to Shalmala & Vindhya Hostels",
        "Pre-booked seat reservations for university teams",
      ],
    },
    {
      id: "bus",
      name: "Bus Stand",
      hubName: "Central Bus Terminal (CBT Hubballi)",
      icon: Bus,
      distance: "5.0 km • ~12 mins transit",
      frequency: "Every 20 mins continuous loop",
      pickupLocation: "NWKRTC Inter-State Bay — Help Desk #4",
      color: "#FF7A1A",
      features: [
        "Continuous fleet loop between CBT & KLE Tech Arena",
        "Immediate boarding with Digital QR Pass",
        "Security accompanied transits",
        "Luggage racks for team kit bags & racket bags",
      ],
    },
    {
      id: "custom",
      name: "Custom Location",
      hubName: "Institutional Group Transit",
      icon: MapPin,
      distance: "Anywhere within Hubballi-Dharwad Twin Cities",
      frequency: "On-demand pre-scheduled booking",
      pickupLocation: "Designated Team Hotel / Institution Point",
      color: "#18D8D0",
      features: [
        "Exclusive 30-seater bus reserved for single varsity squad",
        "Customized pickup time as requested by team manager",
        "Direct point-to-point arena transfer",
        "Requestable in tournament registration form",
      ],
    },
  ];

  const liveShuttles = [
    { busId: "SZ-BUS-01", route: "HBX Airport → KLE Tech Arena", time: "14:15 IST", status: "BOARDING", capacity: "24/32 Seats" },
    { busId: "SZ-BUS-02", route: "UBL Railway Station → Shalmala Hostel", time: "14:30 IST", status: "ON ROUTE", capacity: "28/32 Seats" },
    { busId: "SZ-BUS-03", route: "CBT Bus Terminal → KLE Tech Arena", time: "14:40 IST", status: "SCHEDULED", capacity: "12/32 Seats" },
    { busId: "SZ-BUS-04", route: "KLE Tech Arena → UBL Railway Station", time: "15:00 IST", status: "SCHEDULED", capacity: "8/32 Seats" },
  ];

  return (
    <div className="min-h-screen bg-[#050914] text-[#F4E6CE] font-sans flex flex-col justify-between overflow-x-hidden selection:bg-[#FF5A16] selection:text-white">
      <ArcadeNav />

      <main className="flex-1 max-w-[1400px] mx-auto w-full px-4 sm:px-6 lg:px-8 pt-20 pb-24 z-10">
        
        {/* ═══ MASTER TRANSPORTATION BANNER — EXACT TO REFERENCE 3 (PANEL 08) ═══ */}
        <section className="relative w-full border-2 border-[#18D8D0]/60 bg-[#07101D] shadow-[0_0_30px_rgba(24,216,208,0.12)] mb-8 overflow-hidden rounded-sm">
          {/* Background image: dusk arena & tournament bus artwork backdrop */}
          <div className="absolute inset-0 z-0">
            <Image
              src="/college-campus-pixel.jpg"
              alt="Championship Transit & Arena"
              fill
              priority
              className="object-cover object-right md:object-center opacity-75 lg:opacity-80 filter contrast-110"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#050914]/90 via-[#050914]/75 to-transparent lg:w-3/4" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#07101D] via-transparent to-[#050914]/50" />
          </div>

          <div className="relative z-10 p-6 sm:p-10 lg:p-12 flex flex-col justify-between min-h-[360px]">
            {/* Top badges */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-[#FF5A16] text-black font-pixel text-[10px] font-bold tracking-wider uppercase shadow-[2px_2px_0px_#000]">
                  TRANSPORTATION
                </span>
                <span className="font-pixel text-[10px] text-[#18D8D0] uppercase tracking-widest">
                  WE&apos;LL GET YOU THERE
                </span>
              </div>
              <span className="font-pixel text-[9px] text-[#91A0AE] bg-[#050914]/80 px-2.5 py-1 border border-[#18D8D0]/30">
                SAFE. RELIABLE. TOGETHER.
              </span>
            </div>

            {/* Main heading */}
            <div className="max-w-xl">
              <h1 className="font-display text-4xl sm:text-6xl text-[#F4E6CE] font-extrabold tracking-tight uppercase leading-none">
                CAMPUS <span className="text-[#FF5A16]">TRANSIT</span>
              </h1>
              <p className="font-pixel text-xs text-[#18D8D0] mt-2 uppercase tracking-wider">
                COMPLIMENTARY SHUTTLES CONNECTING ALL TRAVEL HUBS
              </p>
              <p className="font-sans text-xs sm:text-sm text-[#91A0AE] mt-2 leading-relaxed">
                Dedicated fleet of tournament air-conditioned buses ensuring seamless, punctually escorted travel between airport, railway stations, bus stands, hostels, and KLE Tech Arena.
              </p>
            </div>

            {/* Quote on right */}
            <div className="hidden lg:block absolute right-12 bottom-12 max-w-xs text-right bg-[#050914]/85 border border-[#18D8D0]/40 p-4">
              <p className="font-pixel text-xs text-[#F4E6CE]">
                &quot;JOURNEY TO A
              </p>
              <p className="font-pixel text-xs text-[#FF5A16]">
                GREATER GAME.&quot;
              </p>
              <span className="font-pixel text-[9px] text-[#18D8D0] mt-1 block">
                PUNCTUAL &bull; SAFE &bull; ESCORTED
              </span>
            </div>
          </div>
        </section>

        {/* ═══ 4-STEP TRANSIT PROGRESSION (EXACT TO REFERENCE 3 PANEL 08: 1 Pick Up, 2 Travel, 3 Reach, 4 Play) ═══ */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {steps.map((s) => {
            const isActive = activeStep === s.id;
            return (
              <button
                key={s.id}
                onClick={() => setActiveStep(s.id as TransportStep)}
                className={`p-4 text-left border-2 transition-all cursor-pointer rounded-xs flex items-center gap-3 ${
                  isActive
                    ? "bg-[#18D8D0] text-[#050914] border-[#18D8D0] font-bold shadow-[0_0_15px_rgba(24,216,208,0.4)]"
                    : "bg-[#07101D] text-[#91A0AE] border-[#18D8D0]/40 hover:border-[#18D8D0] hover:text-[#F4E6CE]"
                }`}
              >
                <div className={`w-8 h-8 rounded-full border flex items-center justify-center font-display text-sm font-bold ${
                  isActive ? "border-black bg-black text-[#18D8D0]" : "border-[#18D8D0]/50 text-[#18D8D0]"
                }`}>
                  {s.number}
                </div>
                <div>
                  <h4 className="font-display text-sm tracking-wider uppercase">
                    {s.title}
                  </h4>
                  <span className="font-sans text-[11px] opacity-80 block">
                    {s.desc}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* ═══ 4 ROUTE CARDS (EXACT TO REFERENCE 3 PANEL 08: Airport, Railway Station, Bus Stand, Custom Location) ═══ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {hubsData.map((hub) => {
            const Icon = hub.icon;
            const isSelected = selectedHub === hub.id;
            return (
              <div
                key={hub.id}
                onClick={() => setSelectedHub(hub.id)}
                className={`p-6 border-2 rounded-sm cursor-pointer transition-all flex flex-col justify-between min-h-[300px] ${
                  isSelected
                    ? "bg-[#07101D] border-[#18D8D0] shadow-[0_0_20px_rgba(24,216,208,0.25)] translate-y-[-2px]"
                    : "bg-[#07101D]/70 border-[#1e2638] hover:border-[#18D8D0]/50"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between border-b border-[#18D8D0]/30 pb-3 mb-4">
                    <div 
                      className="w-10 h-10 border flex items-center justify-center rounded-xs"
                      style={{ borderColor: hub.color, color: hub.color }}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="font-pixel text-[9px] text-[#91A0AE] uppercase">
                      {hub.distance}
                    </span>
                  </div>

                  <h3 className="font-display text-xl text-[#F4E6CE] font-bold">
                    {hub.name}
                  </h3>
                  <p className="font-pixel text-[10px] text-[#18D8D0] mb-3">
                    {hub.hubName}
                  </p>
                  <p className="font-sans text-xs text-[#91A0AE] mb-4">
                    Frequency: <strong className="text-[#F4E6CE]">{hub.frequency}</strong>
                  </p>

                  <ul className="space-y-1.5 font-sans text-xs text-[#91A0AE]">
                    {hub.features.slice(0, 2).map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#18D8D0] shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-4 border-t border-[#1e2638] mt-4 flex items-center justify-between font-pixel text-xs text-[#FF5A16]">
                  <span>FIND YOUR ROUTE</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            );
          })}
        </div>

        {/* ═══ CONFIRMED UNIVERSITY ARRIVALS & RECEPTION TIMETABLE ═══ */}
        <section className="bg-[#07101D] border-2 border-[#18D8D0]/60 p-6 rounded-sm shadow-[0_0_20px_rgba(24,216,208,0.12)] mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-4 mb-4 border-b border-[#18D8D0]/30 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 bg-[#FF5A16] text-black font-pixel text-[10px] font-bold uppercase tracking-wider">
                  OFFICIAL TRANSIT ROSTER
                </span>
                <span className="font-pixel text-[10px] text-[#18D8D0] uppercase tracking-wider">
                  HUBBALLI RECEPTION STATIONS
                </span>
              </div>
              <h3 className="font-display text-2xl text-[#F4E6CE] font-bold">
                CONFIRMED UNIVERSITY ARRIVALS TIMETABLE
              </h3>
              <p className="font-sans text-xs text-[#91A0AE] mt-0.5">
                Official campus shuttle dispatch and reception coordination across Railway Station, Airport, and Bus Terminals.
              </p>
            </div>

            {/* Date Selector Tabs */}
            <div className="flex flex-wrap items-center gap-2">
              {[
                { date: "2026-10-16", label: "OCT 16 (EARLY)" },
                { date: "2026-10-17", label: "OCT 17 (PEAK PRE-ARRIVALS)" },
                { date: "2026-10-18", label: "OCT 18 (PRIMARY)" },
                { date: "2026-10-19", label: "OCT 19 (INAUGURAL)" },
              ].map((d) => (
                <button
                  key={d.date}
                  onClick={() => setSelectedArrivalDate(d.date)}
                  className={`px-3 py-1.5 font-pixel text-[10px] border transition-all cursor-pointer ${
                    selectedArrivalDate === d.date
                      ? "bg-[#18D8D0] text-black border-[#18D8D0] font-bold shadow-[0_0_10px_rgba(24,216,208,0.4)]"
                      : "bg-[#050914] text-[#91A0AE] border-[#1e2638] hover:border-[#18D8D0]/50 hover:text-white"
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* Search & Mode Filters */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="relative flex-1 min-w-[240px] max-w-md">
              <Search className="w-4 h-4 text-[#91A0AE] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search university, venue, or manager..."
                value={searchArrivalQuery}
                onChange={(e) => setSearchArrivalQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-[#050914] border border-[#1e2638] rounded-xs text-xs text-[#F4E6CE] placeholder-[#91A0AE]/60 focus:outline-none focus:border-[#18D8D0]"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="font-pixel text-[10px] text-[#91A0AE] uppercase">MODE:</span>
              {(["ALL", "TRAIN", "BUS"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setArrivalFilterMode(m)}
                  className={`px-2.5 py-1 font-pixel text-[9px] border uppercase transition-colors cursor-pointer ${
                    arrivalFilterMode === m
                      ? "bg-[#FF5A16] text-black border-[#FF5A16] font-bold"
                      : "bg-[#050914] text-[#91A0AE] border-[#1e2638] hover:border-[#18D8D0]/40"
                  }`}
                >
                  {m === "ALL" ? "All Modes" : m === "TRAIN" ? "🚆 Train" : "🚌 Bus"}
                </button>
              ))}
              <button
                onClick={fetchArrivals}
                className="p-1.5 bg-[#050914] hover:bg-[#1e2638] border border-[#1e2638] text-[#91A0AE] hover:text-[#18D8D0] transition-colors ml-2 cursor-pointer"
                title="Refresh Schedule"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Arrivals Table */}
          <div className="overflow-x-auto">
            {loadingArrivals ? (
              <div className="py-12 text-center text-xs font-pixel text-[#91A0AE] animate-pulse">
                LOADING UNIVERSITY ARRIVALS LOGISTICS...
              </div>
            ) : arrivalsList.length === 0 ? (
              <div className="py-12 text-center text-xs font-pixel text-[#91A0AE]">
                NO SCHEDULED ARRIVALS RECORDED FOR THIS DATE.
              </div>
            ) : (
              <table className="w-full text-left font-sans text-xs">
                <thead>
                  <tr className="border-b border-[#1e2638] font-pixel text-[10px] text-[#91A0AE] uppercase">
                    <th className="py-3 px-3">ARRIVAL TIME</th>
                    <th className="py-3 px-3">UNIVERSITY CONTINGENT</th>
                    <th className="py-3 px-3">MODE</th>
                    <th className="py-3 px-3">RECEPTION VENUE</th>
                    <th className="py-3 px-3">SQUAD SIZE</th>
                    <th className="py-3 px-3">CONTACT / MANAGER</th>
                    <th className="py-3 px-3 text-right">STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1e2638]">
                  {arrivalsList
                    .filter((a) => {
                      const q = searchArrivalQuery.toLowerCase().trim();
                      const matchQuery =
                        !q ||
                        a.universityName.toLowerCase().includes(q) ||
                        a.venue.toLowerCase().includes(q) ||
                        (a.contactPerson && a.contactPerson.toLowerCase().includes(q));
                      const isTrain = a.venue?.toLowerCase().includes("railway") || a.delayReason?.toLowerCase().includes("train");
                      const matchMode =
                        arrivalFilterMode === "ALL" ||
                        (arrivalFilterMode === "TRAIN" && isTrain) ||
                        (arrivalFilterMode === "BUS" && !isTrain);
                      return matchQuery && matchMode;
                    })
                    .map((arr) => {
                      const isTrain = arr.venue?.toLowerCase().includes("railway") || arr.delayReason?.toLowerCase().includes("train");
                      return (
                        <tr key={arr.id} className="hover:bg-[#050914]/80 transition-colors">
                          <td className="py-3.5 px-3 font-mono text-[#18D8D0] font-bold whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-[#18D8D0]" />
                              <span>{arr.updatedTime || arr.scheduledTime}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-3 font-medium text-[#F4E6CE]">
                            <div className="font-semibold text-sm">{arr.universityName}</div>
                            {arr.delayNote && (
                              <div className="text-[10px] text-[#91A0AE] mt-0.5">{arr.delayNote}</div>
                            )}
                          </td>
                          <td className="py-3.5 px-3 whitespace-nowrap">
                            <span className={`px-2 py-0.5 font-pixel text-[9px] rounded-xs uppercase ${
                              isTrain
                                ? "bg-cyan-950/60 text-[#18D8D0] border border-[#18D8D0]/40"
                                : "bg-amber-950/60 text-[#FF7A1A] border border-[#FF7A1A]/40"
                            }`}>
                              {isTrain ? "🚆 TRAIN" : "🚌 BUS"}
                            </span>
                          </td>
                          <td className="py-3.5 px-3 text-[#91A0AE]">
                            <div className="flex items-center gap-1 text-[#F4E6CE]">
                              <MapPin className="w-3 h-3 text-[#FF5A16] shrink-0" />
                              <span className="truncate max-w-[220px]">{arr.venue}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-3 text-[#91A0AE] whitespace-nowrap">
                            <div className="flex items-center gap-1 text-[#F4E6CE] font-mono">
                              <Users className="w-3.5 h-3.5 text-[#18D8D0]" />
                              <span>{arr.contingentSize || 7} Members</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-3 text-[#91A0AE] whitespace-nowrap">
                            <div className="text-[#F4E6CE]">{arr.contactPerson || "Manager Desk"}</div>
                            {arr.contactPhone && (
                              <a
                                href={`tel:${arr.contactPhone.replace(/\s+/g, "")}`}
                                className="text-[10px] font-mono text-[#18D8D0] hover:underline flex items-center gap-1 mt-0.5"
                              >
                                <Phone className="w-2.5 h-2.5" />
                                <span>{arr.contactPhone}</span>
                              </a>
                            )}
                          </td>
                          <td className="py-3.5 px-3 text-right whitespace-nowrap">
                            <span className={`px-2 py-0.5 font-pixel text-[9px] ${
                              arr.status === "ARRIVED"
                                ? "bg-emerald-950/80 text-emerald-400 border border-emerald-500/40"
                                : arr.status === "DELAYED"
                                ? "bg-amber-950/80 text-amber-400 border border-amber-500/40"
                                : "bg-[#050914] text-[#18D8D0] border border-[#18D8D0]/30"
                            }`}>
                              {arr.status === "ARRIVED" ? "✓ ARRIVED" : arr.status === "DELAYED" ? "⚠ DELAYED" : "CONFIRMED"}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            )}
          </div>
        </section>

        {/* ═══ LIVE SHUTTLE OPERATIONS TRACKER ═══ */}
        <div className="bg-[#07101D] border-2 border-[#18D8D0]/60 p-6 rounded-sm shadow-[0_0_20px_rgba(24,216,208,0.1)]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-[#18D8D0]/30 gap-2">
            <div>
              <span className="font-pixel text-xs text-[#FF5A16] uppercase">
                ACTIVE TOURNAMENT SHUTTLE FLEET
              </span>
              <h3 className="font-display text-xl text-[#F4E6CE] font-bold">
                LIVE DISPATCH SCHEDULE
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#18D8D0] animate-ping" />
              <span className="font-pixel text-[10px] text-[#18D8D0]">LIVE TRACKING ACTIVE</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-sans text-xs">
              <thead>
                <tr className="border-b border-[#1e2638] font-pixel text-[10px] text-[#91A0AE] uppercase">
                  <th className="py-3 px-3">BUS ID</th>
                  <th className="py-3 px-3">TRANSIT ROUTE</th>
                  <th className="py-3 px-3">DEPARTURE</th>
                  <th className="py-3 px-3">CAPACITY</th>
                  <th className="py-3 px-3 text-right">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e2638]">
                {liveShuttles.map((s, idx) => (
                  <tr key={idx} className="hover:bg-[#050914] transition-colors">
                    <td className="py-3.5 px-3 font-mono text-[#FF5A16] font-bold">
                      {s.busId}
                    </td>
                    <td className="py-3.5 px-3 font-medium text-[#F4E6CE]">
                      {s.route}
                    </td>
                    <td className="py-3.5 px-3 font-mono text-[#18D8D0]">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-[#18D8D0]" />
                        <span>{s.time}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-3 font-sans text-[#91A0AE]">
                      {s.capacity}
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <span className={`px-2 py-0.5 font-pixel text-[9px] ${
                        s.status === "BOARDING"
                          ? "bg-[#18D8D0] text-black font-bold animate-pulse"
                          : s.status === "ON ROUTE"
                          ? "bg-[#FF5A16] text-black font-bold"
                          : "bg-[#050914] border border-[#1e2638] text-[#91A0AE]"
                      }`}>
                        {s.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Transportation Support & Hotline */}
          <div className="flex flex-wrap items-center justify-between pt-5 border-t border-[#1e2638] mt-4 gap-4">
            <div className="flex items-center gap-2 text-xs text-[#91A0AE]">
              <Phone className="w-4 h-4 text-[#18D8D0]" />
              <span>TRANSIT DISPATCH HELPLINE: <strong className="text-[#F4E6CE] font-mono">+91 98765 43210</strong></span>
            </div>
            <Link href="/register">
              <button className="px-5 py-2 bg-[#FF5A16] text-black font-pixel text-xs font-bold hover:bg-[#FF7A1A] transition-all flex items-center gap-1.5 shadow-[2px_2px_0px_#000] cursor-pointer">
                <span>REQUEST TRANSIT IN REGISTRATION</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </Link>
          </div>
        </div>
      </main>

      {/* ═══ BOTTOM BROADCAST TICKER ═══ */}
      <footer className="fixed bottom-0 left-0 right-0 z-50 bg-[#050914] border-t border-[#18D8D0]/40 px-4 py-2 flex items-center justify-between font-pixel text-[10px] text-[#91A0AE]">
        <div className="flex items-center gap-2 text-[#18D8D0]">
          <span>🏸</span>
          <span className="text-[#F4E6CE]">SOUTH ZONE WOMEN&apos;S BADMINTON CHAMPIONSHIP 2026</span>
        </div>
        <div className="hidden md:flex items-center gap-6 text-[#FF7A1A]">
          <span>SAFE. RELIABLE. TOGETHER.</span>
          <span className="text-[#F4E6CE]">CAMPUS SHUTTLE RUNNING OCT 17 – 22</span>
          <span className="text-[#18D8D0]">KLE TECH ARENA</span>
        </div>
      </footer>
    </div>
  );
}
