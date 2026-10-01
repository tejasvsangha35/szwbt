"use client";

import React, { useState, useRef, useMemo, useCallback, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { PortalQrCode } from "@/components/qr/PortalQrCode";
import { PassQrSvg } from "@/components/qr/PassQrSvg";
import { compressUploadedFile } from "@/lib/fileCompressor";

import {
  Shield, Camera, Upload, CheckCircle2, Plus, Trash2, RefreshCw,
  Download, X, Check, FileText, Users, Briefcase, Info,
  FileCheck, ChevronDown, ChevronUp, Printer, ClipboardList,
  ClipboardCheck, Flag, AlertTriangle, ThumbsUp, Eye, Search,
  Award, Sparkles, Building2, MapPin, QrCode, ExternalLink,
  Paperclip, CheckCircle, UserCheck, AlertCircle, BadgeCheck,
  Receipt, FolderCheck, ShieldCheck, Layers, Grid, List,
  Calendar, Bed, Home, DollarSign, CreditCard, ArrowRight, User, Clock, Phone, Mail, FileBadge,
  Smartphone, Lock, GraduationCap, Table
} from "lucide-react";

// South Zone States for geographical filtering (canonical names)
const SOUTH_ZONE_STATES = [
  "Andhra Pradesh",
  "Karnataka",
  "Kerala",
  "Puducherry",
  "Tamil Nadu",
  "Telangana"
];

interface InstitutionOption {
  id: string;
  name: string;
  state: string;
  institutionCode?: string;
  city?: string;
  district?: string;
}

interface ParticipantRecord {
  id: string;
  playerId: string;
  name: string;
  email: string;
  phone: string;
  state: string;
  institution: string;
  institutionId?: string;
  category: string;
  role: string;
  photoUrl?: string;
  qrToken?: string;
  qrCodeSvg?: string;
  documentsStatus: "DOCUMENTS_PENDING" | "READY" | "VERIFIED";
  documents?: {
    id: string;
    type: string;
    fileName: string;
    filePath?: string;
    status: string;
  }[];
  paymentStatus: "PAID" | "PENDING" | "PARTIAL";
  paymentMethod?: "CASH" | "UPI";
  utr?: string;
  amountPaid?: number;
  accommodationStatus: "ALLOCATED" | "NOT_ALLOCATED";
  hostel?: string;
  floor?: string;
  room?: string;
  bed?: string;
  registrationStatus: "COMPLETED" | "IN_PROGRESS" | "APPROVED";
  registeredAt: string;
}

interface HostelRoomOption {
  id: string;
  roomNumber: string;
  floorNumber: string;
  capacity: number;
  hostelId: string;
  hostelName: string;
  beds: {
    id: string;
    bedNumber: string;
    status: "AVAILABLE" | "OCCUPIED" | "RESERVED" | "MAINTENANCE";
  }[];
}

interface TeamAthleteFormItem {
  name: string;
  email: string;
  mobile: string;
  photoUrl: string | null;
  bedId?: string;
  bedNumber?: string;
  pdfFileName?: string;
  pdfFileSize?: string;
  pdfDataUrl?: string | null;
}

interface CreatedTeamContingent {
  team: {
    id: string;
    teamCode: string;
    name: string;
    institution: string;
    state: string;
    managerName?: string;
    managerPhone?: string;
  };
  manager?: ParticipantRecord | null;
  participants: ParticipantRecord[];
  payment: {
    amount: number;
    method: string;
    utr?: string;
    receiptNumber: string;
  };
}

function isFloorMatch(roomFloor?: string | null, filterFloor?: string | null): boolean {
  if (!filterFloor || filterFloor === "ALL") return true;
  if (!roomFloor) return false;

  const rf = roomFloor.trim().toUpperCase().replace(/\s+/g, " ");
  const ff = filterFloor.trim().toUpperCase().replace(/\s+/g, " ");

  if (rf === ff) return true;

  // Compare normalized floor numbers (e.g. "FLOOR 02" vs "FLOOR 2" vs "2")
  const rfNum = rf.replace(/^FLOOR\s*0?/, "");
  const ffNum = ff.replace(/^FLOOR\s*0?/, "");
  if (rfNum && ffNum && rfNum === ffNum) return true;

  return false;
}

export default function RegistrationDeskPage() {
  const staffName = "Registration Desk Officer";
  const deskId = "DESK 01";

  // Top-level Navigation: 1. FULL TEAM REGISTRATION | 2. ONBOARDED TEAMS & PASSES
  const [activeTab, setActiveTab] = useState<"NEW_REG" | "REGISTERED" | "ONBOARDED">("NEW_REG");
  const [onboardedViewMode, setOnboardedViewMode] = useState<"TEAMS" | "REGISTRY">("TEAMS");
  const [teamsDisplayMode, setTeamsDisplayMode] = useState<"TABLE" | "CARDS">("TABLE");
  const [stateFilter, setStateFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [expandedTeamId, setExpandedTeamId] = useState<string | null>(null);

  // Redirect legacy / programmatic "REGISTERED" tab to ONBOARDED tab with registry view
  useEffect(() => {
    if (activeTab === "REGISTERED") {
      setActiveTab("ONBOARDED");
      setOnboardedViewMode("REGISTRY");
    }
  }, [activeTab]);

  // ─────────────────────────────────────────────────────────────
  // MASTER DATA: State & University Dependent Lists
  // ─────────────────────────────────────────────────────────────
  const [selectedState, setSelectedState] = useState<string>("Karnataka");
  const [institutions, setInstitutions] = useState<InstitutionOption[]>([]);
  const [selectedInstitutionId, setSelectedInstitutionId] = useState<string>("");
  const [selectedInstitutionName, setSelectedInstitutionName] = useState<string>("");
  const [institutionSearch, setInstitutionSearch] = useState<string>("");
  const [loadingInstitutions, setLoadingInstitutions] = useState<boolean>(false);

  // ─────────────────────────────────────────────────────────────
  // TEAM MANAGER SEPARATE REGISTRATION & PHOTO & COMBINED PDF
  // ─────────────────────────────────────────────────────────────
  const [managerName, setManagerName] = useState<string>("");
  const [managerPhone, setManagerPhone] = useState<string>("");
  const [managerEmail, setManagerEmail] = useState<string>("");
  const [managerPhotoUrl, setManagerPhotoUrl] = useState<string | null>(null);
  const [managerPdfName, setManagerPdfName] = useState<string>("");
  const [managerPdfSize, setManagerPdfSize] = useState<string>("");
  const [managerPdfDataUrl, setManagerPdfDataUrl] = useState<string | null>(null);

  // ─────────────────────────────────────────────────────────────
  // 5-MEMBER FULL SQUAD STATE (1 COMBINED PDF PER ATHLETE)
  // ─────────────────────────────────────────────────────────────
  const [teamAthletes, setTeamAthletes] = useState<TeamAthleteFormItem[]>([
    { name: "", email: "", mobile: "", photoUrl: null, pdfDataUrl: null },
    { name: "", email: "", mobile: "", photoUrl: null, pdfDataUrl: null },
    { name: "", email: "", mobile: "", photoUrl: null, pdfDataUrl: null },
    { name: "", email: "", mobile: "", photoUrl: null, pdfDataUrl: null },
    { name: "", email: "", mobile: "", photoUrl: null, pdfDataUrl: null },
  ]);

  const [activePhotoTarget, setActivePhotoTarget] = useState<"MANAGER" | number | null>(null);

  // File Compression States
  const [compressingPhotoTarget, setCompressingPhotoTarget] = useState<"MANAGER" | number | null>(null);
  const [isCompressingManagerPdf, setIsCompressingManagerPdf] = useState<boolean>(false);
  const [compressingAthletePdfIdx, setCompressingAthletePdfIdx] = useState<number | null>(null);

  // ─────────────────────────────────────────────────────────────
  // CAMERA CAPTURE WORKFLOW
  // ─────────────────────────────────────────────────────────────
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraPreview, setCameraPreview] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // ─────────────────────────────────────────────────────────────
  // ACCOMMODATION ALLOCATION (5 BEDS SQUAD CONTINGENT + MANAGER BED)
  // ─────────────────────────────────────────────────────────────
  const [wantAccommodation, setWantAccommodation] = useState<boolean>(true);
  const [rooms, setRooms] = useState<HostelRoomOption[]>([]);
  const [selectedHostel, setSelectedHostel] = useState<string>("SHALMALA");
  const [selectedFloor, setSelectedFloor] = useState<string>("");
  const [selectedRoomId, setSelectedRoomId] = useState<string>("");
  const [loadingRooms, setLoadingRooms] = useState<boolean>(false);
  const [isViewAllRoomsOpen, setIsViewAllRoomsOpen] = useState<boolean>(false);

  // Dedicated Team Manager Accommodation State (Vindhya Boys Hostel)
  const [managerBedId, setManagerBedId] = useState<string | undefined>(undefined);
  const [managerBedNumber, setManagerBedNumber] = useState<string | undefined>(undefined);
  const [managerRoomId, setManagerRoomId] = useState<string | undefined>(undefined);
  const [managerRoomNumber, setManagerRoomNumber] = useState<string | undefined>(undefined);
  const [managerFloor, setManagerFloor] = useState<string | undefined>(undefined);
  const [managerHostel, setManagerHostel] = useState<string>("Vindhya Boys Hostel");

  // ─────────────────────────────────────────────────────────────
  // PAYMENT & VERIFICATION LEDGER (₹2,500 PER TEAM CONTINGENT TOTAL)
  // ─────────────────────────────────────────────────────────────
  const totalTeamFee = 2500; // ₹2,500 per team contingent
  const feePerAthlete = 500; // ₹500 per athlete (5 x 500 = ₹2,500)
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "UPI">("CASH");
  const [upiUtr, setUpiUtr] = useState<string>("");
  const [isPaymentVerified, setIsPaymentVerified] = useState<boolean>(true);

  // ─────────────────────────────────────────────────────────────
  // SAVING & CREATED STATE
  // ─────────────────────────────────────────────────────────────
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [createdTeam, setCreatedTeam] = useState<CreatedTeamContingent | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "error" | "info" } | null>(null);

  // ─────────────────────────────────────────────────────────────
  // REGISTERED PARTICIPANTS & ONBOARDED TEAMS
  // ─────────────────────────────────────────────────────────────
  const [participantsList, setParticipantsList] = useState<ParticipantRecord[]>([]);
  const [loadingParticipants, setLoadingParticipants] = useState<boolean>(false);
  const [searchFilter, setSearchFilter] = useState<string>("");
  const [selectedParticipantForPass, setSelectedParticipantForPass] = useState<ParticipantRecord | null>(null);
  const [selectedTeamName, setSelectedTeamName] = useState<string | null>(null);

  // Direct native system file upload states
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [targetParticipantForUpload, setTargetParticipantForUpload] = useState<ParticipantRecord | null>(null);

  // Selected participant for document upload modal
  const [docUploadParticipant, setDocUploadParticipant] = useState<ParticipantRecord | null>(null);
  const [selectedDocType, setSelectedDocType] = useState<string>("COMBINED_PDF");
  const [uploadingDoc, setUploadingDoc] = useState<boolean>(false);
  const [autoVerifyDossier, setAutoVerifyDossier] = useState<boolean>(false);

  // ─────────────────────────────────────────────────────────────
  // FIND DETAILS MODAL
  // ─────────────────────────────────────────────────────────────
  const [isFindDetailsOpen, setIsFindDetailsOpen] = useState<boolean>(false);
  const [findSearchQuery, setFindSearchQuery] = useState<string>("");

  // Trigger Toast Helper
  const showToast = (text: string, type: "success" | "error" | "info" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // ─────────────────────────────────────────────────────────────
  // FETCH INSTITUTIONS FROM DATABASE (STATE DEPENDENT)
  // ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchInstitutions = async () => {
      setLoadingInstitutions(true);
      try {
        const queryParams = new URLSearchParams();
        if (selectedState) queryParams.set("state", selectedState);
        queryParams.set("status", "ACTIVE");
        queryParams.set("limit", "500");

        const res = await fetch(`/api/institutions?${queryParams.toString()}`);
        const data = await res.json();
        if (data.success && Array.isArray(data.institutions)) {
          setInstitutions(data.institutions);
          if (data.institutions.length > 0) {
            setSelectedInstitutionId(data.institutions[0].id);
            setSelectedInstitutionName(data.institutions[0].name);
          } else {
            setSelectedInstitutionId("");
            setSelectedInstitutionName("");
          }
        }
      } catch (err) {
        console.error("Error fetching institutions:", err);
      } finally {
        setLoadingInstitutions(false);
      }
    };
    fetchInstitutions();
  }, [selectedState]);

  // ─────────────────────────────────────────────────────────────
  // FETCH ACCOMMODATION ROOMS & BEDS
  // ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchRooms = async () => {
      setLoadingRooms(true);
      try {
        const res = await fetch("/api/accommodation/rooms?hostelId=ALL");
        const data = await res.json();
        if (data.success && Array.isArray(data.rooms)) {
          setRooms(data.rooms);
          if (data.rooms.length > 0 && !selectedRoomId) {
            setSelectedRoomId(data.rooms[0].id);
          }
          // Pre-allocate first available bed in Vindhya Boys Hostel for Manager if not yet set
          const vindhyaRooms = data.rooms.filter((r: HostelRoomOption) =>
            r.hostelId === "VINDHYA" || r.hostelName?.toUpperCase().includes("VINDHYA")
          );
          for (const vRoom of vindhyaRooms) {
            const availBed = vRoom.beds?.find((b: any) => b.status === "AVAILABLE");
            if (availBed) {
              setManagerBedId(availBed.id);
              setManagerBedNumber(availBed.bedNumber);
              setManagerRoomId(vRoom.id);
              setManagerRoomNumber(vRoom.roomNumber);
              setManagerFloor(vRoom.floorNumber || "FLOOR 01");
              setManagerHostel(vRoom.hostelName || "Vindhya Boys Hostel");
              break;
            }
          }
        }
      } catch (err) {
        console.error("Error fetching rooms:", err);
      } finally {
        setLoadingRooms(false);
      }
    };
    fetchRooms();
  }, []);

  // Dynamically compute distinct available floors for the currently selected hostel
  const availableFloors = useMemo(() => {
    const hostelRooms = rooms.filter((r) => {
      if (!selectedHostel) return true;
      return (
        r.hostelId === selectedHostel ||
        r.hostelName?.toUpperCase().includes(selectedHostel.toUpperCase())
      );
    });

    const distinctFloors = Array.from(
      new Set(hostelRooms.map((r) => r.floorNumber).filter(Boolean))
    ) as string[];

    return distinctFloors.sort((a, b) => {
      const aUpper = a.toUpperCase();
      const bUpper = b.toUpperCase();
      if (aUpper.includes("GROUND")) return -1;
      if (bUpper.includes("GROUND")) return 1;
      return aUpper.localeCompare(bUpper, undefined, { numeric: true });
    });
  }, [rooms, selectedHostel]);

  // Filtered rooms for selected hostel & floor
  const filteredRooms = useMemo(() => {
    return rooms.filter((r) => {
      const matchHostel =
        !selectedHostel ||
        r.hostelId === selectedHostel ||
        r.hostelName?.toUpperCase().includes(selectedHostel.toUpperCase());
      const matchFloor = isFloorMatch(r.floorNumber, selectedFloor);
      return matchHostel && matchFloor;
    });
  }, [rooms, selectedHostel, selectedFloor]);

  // When filteredRooms updates (e.g. floor or hostel filter changes), select a valid room
  useEffect(() => {
    if (filteredRooms.length > 0) {
      const isCurrentValid = filteredRooms.some((r) => r.id === selectedRoomId);
      if (!isCurrentValid) {
        if (selectedHostel === "VINDHYA" && managerRoomId && filteredRooms.some((r) => r.id === managerRoomId)) {
          setSelectedRoomId(managerRoomId);
        } else if (selectedHostel === "SHALMALA") {
          const firstAthleteBedId = teamAthletes.find((a) => a.bedId)?.bedId;
          const athleteRoom = firstAthleteBedId
            ? filteredRooms.find((r) => r.beds?.some((b) => b.id === firstAthleteBedId))
            : null;
          if (athleteRoom) {
            setSelectedRoomId(athleteRoom.id);
          } else {
            setSelectedRoomId(filteredRooms[0].id);
          }
        } else {
          setSelectedRoomId(filteredRooms[0].id);
        }
      }
    } else {
      setSelectedRoomId("");
    }
  }, [filteredRooms, selectedRoomId, selectedHostel, managerRoomId, teamAthletes]);

  const selectedRoom = useMemo(() => {
    return rooms.find((r) => r.id === selectedRoomId);
  }, [rooms, selectedRoomId]);

  const availableBedsInRoom = useMemo(() => {
    return selectedRoom?.beds?.filter((b) => b.status === "AVAILABLE") || [];
  }, [selectedRoom]);

  // Automatically assign available beds from selected room:
  // - In SHALMALA: Only assign to the 5 squad athletes if none currently have a bed
  // - In VINDHYA: Only assign to the Team Manager if no manager bed is currently set
  useEffect(() => {
    if (!wantAccommodation || !selectedRoom) return;

    if (selectedHostel === "SHALMALA") {
      const hasAnyBed = teamAthletes.some((a) => Boolean(a.bedId));
      if (!hasAnyBed) {
        const avail = selectedRoom.beds.filter((b) => b.status === "AVAILABLE");
        setTeamAthletes((prev) =>
          prev.map((ath, idx) => ({
            ...ath,
            bedId: avail[idx] ? avail[idx].id : undefined,
            bedNumber: avail[idx] ? avail[idx].bedNumber : undefined,
          }))
        );
      }
    } else if (selectedHostel === "VINDHYA") {
      if (!managerBedId) {
        const avail = selectedRoom.beds.find((b) => b.status === "AVAILABLE");
        if (avail) {
          setManagerBedId(avail.id);
          setManagerBedNumber(avail.bedNumber);
          setManagerRoomId(selectedRoom.id);
          setManagerRoomNumber(selectedRoom.roomNumber);
          setManagerFloor(selectedRoom.floorNumber || "FLOOR 01");
          setManagerHostel(selectedRoom.hostelName || "Vindhya Boys Hostel");
        }
      }
    }
  }, [selectedRoomId, selectedRoom, selectedHostel, wantAccommodation, managerBedId]);

  // Select all 5 available beds in the selected room for the squad (SHALMALA)
  const handleSelectAllBeds = () => {
    if (!selectedRoom) return;
    const avail = selectedRoom.beds.filter((b) => b.status === "AVAILABLE");
    setTeamAthletes((prev) =>
      prev.map((ath, idx) => ({
        ...ath,
        bedId: avail[idx] ? avail[idx].id : undefined,
        bedNumber: avail[idx] ? avail[idx].bedNumber : undefined,
      }))
    );
    showToast("All available beds assigned to the 5 squad athletes ✓");
  };

  // Clear all bed assignments for athletes (SHALMALA)
  const handleClearAllBeds = () => {
    setTeamAthletes((prev) =>
      prev.map((ath) => ({
        ...ath,
        bedId: undefined,
        bedNumber: undefined,
      }))
    );
    showToast("All athlete bed allocations cleared");
  };

  // Allocate first available bed in current room for manager (VINDHYA)
  const handleAllocateManagerBed = () => {
    if (!selectedRoom) return;
    const avail = selectedRoom.beds.find((b) => b.status === "AVAILABLE");
    if (avail) {
      setManagerBedId(avail.id);
      setManagerBedNumber(avail.bedNumber);
      setManagerRoomId(selectedRoom.id);
      setManagerRoomNumber(selectedRoom.roomNumber);
      setManagerFloor(selectedRoom.floorNumber || "FLOOR 01");
      setManagerHostel(selectedRoom.hostelName || "Vindhya Boys Hostel");
      showToast(`Assigned ${avail.bedNumber} (Room ${selectedRoom.roomNumber}) to Team Manager ✓`);
    } else {
      showToast("No available beds in this room for Team Manager", "error");
    }
  };

  // Clear manager bed assignment (VINDHYA)
  const handleClearManagerBed = () => {
    setManagerBedId(undefined);
    setManagerBedNumber(undefined);
    setManagerRoomId(undefined);
    setManagerRoomNumber(undefined);
    setManagerFloor(undefined);
    showToast("Manager bed allocation cleared");
  };

  // Toggle manager bed on card click (VINDHYA)
  const handleToggleManagerBed = (bed: { id: string; bedNumber: string; status: string }) => {
    if (bed.status !== "AVAILABLE" && bed.id !== managerBedId) return;

    if (managerBedId === bed.id) {
      handleClearManagerBed();
      return;
    }

    if (!selectedRoom) return;
    setManagerBedId(bed.id);
    setManagerBedNumber(bed.bedNumber);
    setManagerRoomId(selectedRoom.id);
    setManagerRoomNumber(selectedRoom.roomNumber);
    setManagerFloor(selectedRoom.floorNumber || "FLOOR 01");
    setManagerHostel(selectedRoom.hostelName || "Vindhya Boys Hostel");
    showToast(`Assigned ${bed.bedNumber} (Room ${selectedRoom.roomNumber}) to Team Manager ✓`);
  };

  // Assign specific bed to specific athlete (SHALMALA)
  const handleAssignBedToAthlete = (athleteIndex: number, bedId: string) => {
    const bedObj = selectedRoom?.beds.find((b) => b.id === bedId);
    setTeamAthletes((prev) => {
      const updated = [...prev];
      // If another athlete had this bed, clear it from them
      updated.forEach((a, i) => {
        if (i !== athleteIndex && a.bedId === bedId) {
          a.bedId = undefined;
          a.bedNumber = undefined;
        }
      });
      updated[athleteIndex] = {
        ...updated[athleteIndex],
        bedId: bedId || undefined,
        bedNumber: bedObj?.bedNumber || undefined,
      };
      return updated;
    });
  };

  // Toggle bed assignment on click
  const handleToggleBedSelection = (bed: { id: string; bedNumber: string; status: string }) => {
    if (selectedHostel === "VINDHYA") {
      handleToggleManagerBed(bed);
      return;
    }

    if (bed.status !== "AVAILABLE") {
      const assignedIndex = teamAthletes.findIndex((a) => a.bedId === bed.id);
      if (assignedIndex !== -1) {
        handleAssignBedToAthlete(assignedIndex, "");
        showToast(`Unassigned ${bed.bedNumber}`);
      }
      return;
    }

    const assignedIndex = teamAthletes.findIndex((a) => a.bedId === bed.id);
    if (assignedIndex !== -1) {
      handleAssignBedToAthlete(assignedIndex, "");
      showToast(`Unassigned ${bed.bedNumber}`);
      return;
    }
    const firstUnassignedIndex = teamAthletes.findIndex((a) => !a.bedId);
    if (firstUnassignedIndex !== -1) {
      handleAssignBedToAthlete(firstUnassignedIndex, bed.id);
      const athName = teamAthletes[firstUnassignedIndex].name || `Athlete 0${firstUnassignedIndex + 1}`;
      showToast(`Assigned ${bed.bedNumber} ➔ ${athName} ✓`);
    } else {
      showToast("All 5 athletes already have beds assigned. To reassign, click an assigned bed to unassign first.", "info");
    }
  };

  const selectedBedsCount = useMemo(() => {
    return teamAthletes.filter((a) => a.bedId).length;
  }, [teamAthletes]);

  // ─────────────────────────────────────────────────────────────
  // FETCH EXISTING PARTICIPANTS
  // ─────────────────────────────────────────────────────────────
  const fetchParticipants = async () => {
    setLoadingParticipants(true);
    try {
      const res = await fetch("/api/participants");
      const data = await res.json();
      if (data.success && Array.isArray(data.participants)) {
        const mapped: ParticipantRecord[] = data.participants.map((p: any) => ({
          id: p.id,
          playerId: p.playerId,
          name: p.name,
          email: p.email || "—",
          phone: p.phone,
          state: p.state || selectedState,
          institution: p.institution || p.institutionRel?.name || "University",
          institutionId: p.institutionId,
          category: p.category || "Women's Team",
          role: p.teamMemberships?.[0]?.role || p.role || "ATHLETE",
          photoUrl: p.photoUrl,
          qrToken: (p.documentsStatus === "VERIFIED" || (p.documents?.length > 0 && p.documents.every((d: any) => d.status === "VERIFIED"))) ? (p.qrToken || p.qrPasses?.[0]?.token || null) : null,
          documentsStatus: p.documentsStatus || (p.documents?.length > 0 && p.documents.every((d: any) => d.status === "VERIFIED") ? "VERIFIED" : p.documents?.length > 0 ? "PENDING" : "DOCUMENTS_PENDING"),
          documents: p.documents || [],
          paymentStatus: "PAID",
          paymentMethod: p.payments?.[0]?.method || "CASH",
          utr: p.payments?.[0]?.utr,
          amountPaid: p.payments?.[0]?.amount || 2500,
          accommodationStatus: p.bedAllocations?.length > 0 ? "ALLOCATED" : "NOT_ALLOCATED",
          hostel: p.bedAllocations?.[0]?.bed?.room?.hostel?.name || "—",
          floor: p.bedAllocations?.[0]?.bed?.room?.floor?.name || "—",
          room: p.bedAllocations?.[0]?.bed?.room?.roomNumber || p.room || "—",
          bed: p.bedAllocations?.[0]?.bed?.bedNumber || "—",
          registrationStatus: p.status === "ACTIVE" || p.status === "APPROVED" ? "COMPLETED" : "IN_PROGRESS",
          registeredAt: p.createdAt ? new Date(p.createdAt).toLocaleString() : new Date().toLocaleString(),
        }));
        setParticipantsList(mapped);
      }
    } catch (err) {
      console.warn("Could not fetch participants:", err);
    } finally {
      setLoadingParticipants(false);
    }
  };

  useEffect(() => {
    fetchParticipants();
  }, []);

  // Update specific athlete field
  const handleUpdateAthlete = (index: number, field: keyof TeamAthleteFormItem, value: any) => {
    setTeamAthletes((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  // ─────────────────────────────────────────────────────────────
  // CAMERA STREAM CONTROLS (SUPPORTS MANAGER & ATHLETES)
  // ─────────────────────────────────────────────────────────────
  const startCamera = (target: "MANAGER" | number) => {
    setActivePhotoTarget(target);
    setIsCameraActive(true);
    setCameraPreview(null);
    setCameraError(null);
    navigator.mediaDevices
      ?.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      })
      .then((stream) => {
        setCameraStream(stream);
        if (videoRef.current) videoRef.current.srcObject = stream;
      })
      .catch(() => {
        setCameraError("Camera access denied or webcam not available. Please upload a photo file instead.");
      });
  };

  const stopCamera = useCallback(() => {
    cameraStream?.getTracks().forEach((track) => track.stop());
    setCameraStream(null);
    setIsCameraActive(false);
    setCameraPreview(null);
    setCameraError(null);
    setActivePhotoTarget(null);
  }, [cameraStream]);

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    const rawWidth = video.videoWidth || 640;
    const rawHeight = video.videoHeight || 480;
    const maxDim = 800;
    let targetWidth = rawWidth;
    let targetHeight = rawHeight;
    if (targetWidth > maxDim || targetHeight > maxDim) {
      const ratio = Math.min(maxDim / targetWidth, maxDim / targetHeight);
      targetWidth = Math.round(targetWidth * ratio);
      targetHeight = Math.round(targetHeight * ratio);
    }
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(video, 0, 0, targetWidth, targetHeight);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.82);
      setCameraPreview(dataUrl);
    }
  };

  const applyCapturedPhoto = () => {
    if (!cameraPreview) return;
    if (activePhotoTarget === "MANAGER") {
      setManagerPhotoUrl(cameraPreview);
      showToast("Team Manager photo captured & compressed ✓");
    } else if (typeof activePhotoTarget === "number") {
      handleUpdateAthlete(activePhotoTarget, "photoUrl", cameraPreview);
      showToast(`Athlete 0${activePhotoTarget + 1} photo captured & compressed ✓`);
    }
    stopCamera();
  };

  const handleFileUpload = async (target: "MANAGER" | number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Please upload a valid image file (JPEG or PNG).");
      return;
    }
    setCompressingPhotoTarget(target);
    try {
      showToast("Compressing photo before upload...", "info");
      const res = await compressUploadedFile(file, "AVATAR");
      if (target === "MANAGER") {
        setManagerPhotoUrl(res.dataUrl);
        showToast(
          res.isCompressed
            ? `Manager photo compressed (${res.summary}) & attached ✓`
            : `Team Manager photo attached (${res.summary}) ✓`
        );
      } else {
        handleUpdateAthlete(target, "photoUrl", res.dataUrl);
        showToast(
          res.isCompressed
            ? `Athlete 0${target + 1} photo compressed (${res.summary}) & attached ✓`
            : `Athlete 0${target + 1} photo attached (${res.summary}) ✓`
        );
      }
    } catch (err: any) {
      console.error("Photo compression error:", err);
      alert("Failed to compress image file.");
    } finally {
      setCompressingPhotoTarget(null);
      e.target.value = "";
    }
  };

  // ─────────────────────────────────────────────────────────────
  // PER-ATHLETE & MANAGER 1 COMBINED PDF HANDLERS
  // ─────────────────────────────────────────────────────────────
  const handleAthletePdfUpload = async (idx: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      alert("Please upload a valid PDF document (.pdf only).");
      return;
    }
    setCompressingAthletePdfIdx(idx);
    try {
      showToast(`Compressing Athlete 0${idx + 1} PDF before attaching...`, "info");
      const res = await compressUploadedFile(file, "DOCUMENT");
      const displaySize = res.isCompressed
        ? `${res.compressedSizeFormatted} (${res.savedPercent}% compressed)`
        : res.compressedSizeFormatted;
      setTeamAthletes((prev) =>
        prev.map((a, i) =>
          i === idx
            ? { ...a, pdfFileName: res.fileName, pdfFileSize: displaySize, pdfDataUrl: res.dataUrl }
            : a
        )
      );
      showToast(
        res.isCompressed
          ? `Athlete 0${idx + 1} PDF compressed (${res.summary}) & attached ✓`
          : `Athlete 0${idx + 1} combined PDF attached (${res.summary}) ✓`
      );
    } catch (err: any) {
      console.error("Athlete PDF compression error:", err);
      alert("Failed to compress PDF document.");
    } finally {
      setCompressingAthletePdfIdx(null);
      e.target.value = "";
    }
  };

  const handleRemoveAthletePdf = (idx: number) => {
    setTeamAthletes((prev) =>
      prev.map((a, i) =>
        i === idx
          ? { ...a, pdfFileName: undefined, pdfFileSize: undefined, pdfDataUrl: null }
          : a
      )
    );
  };

  const handleManagerPdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      alert("Please upload a valid PDF document (.pdf only).");
      return;
    }
    setIsCompressingManagerPdf(true);
    try {
      showToast("Compressing Manager PDF before attaching...", "info");
      const res = await compressUploadedFile(file, "DOCUMENT");
      const displaySize = res.isCompressed
        ? `${res.compressedSizeFormatted} (${res.savedPercent}% compressed)`
        : res.compressedSizeFormatted;
      setManagerPdfName(res.fileName);
      setManagerPdfSize(displaySize);
      setManagerPdfDataUrl(res.dataUrl);
      showToast(
        res.isCompressed
          ? `Manager PDF compressed (${res.summary}) & attached ✓`
          : `Team Manager combined PDF attached (${res.summary}) ✓`
      );
    } catch (err: any) {
      console.error("Manager PDF compression error:", err);
      alert("Failed to compress Manager PDF.");
    } finally {
      setIsCompressingManagerPdf(false);
      e.target.value = "";
    }
  };

  const handleRemoveManagerPdf = () => {
    setManagerPdfName("");
    setManagerPdfSize("");
    setManagerPdfDataUrl(null);
  };

  // ─────────────────────────────────────────────────────────────
  // ─────────────────────────────────────────────────────────────
  // VERIFY DOCUMENTS & ISSUE QR PASS HANDLER
  // ─────────────────────────────────────────────────────────────
  const handleVerifyDocumentsForParticipant = async (participantId: string) => {
    try {
      showToast("Verifying documents & generating official accreditation QR pass...", "info");
      const res = await fetch("/api/registration/documents/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ participantId, markAll: true }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast("✓ Verification successful! Official accreditation QR pass generated.", "success");
        await fetchParticipants();
        if (docUploadParticipant && docUploadParticipant.id === participantId) {
          setDocUploadParticipant(null);
        }
      } else {
        alert(data.error || "Failed to verify documents.");
      }
    } catch (err: any) {
      alert(`Verification error: ${err.message}`);
    }
  };

  // ─────────────────────────────────────────────────────────────
  // DIRECT DOCUMENT UPLOAD & VERIFY HANDLER
  // ─────────────────────────────────────────────────────────────
  const handleUploadDocumentForParticipant = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !docUploadParticipant) return;

    if (!file.name.toLowerCase().endsWith(".pdf") && file.type !== "application/pdf") {
      alert("Only PDF format is accepted. Please upload 1 Combined PDF dossier.");
      e.target.value = "";
      return;
    }

    setUploadingDoc(true);
    try {
      showToast(`Compressing ${file.name} before upload...`, "info");
      const resCompress = await compressUploadedFile(file, "DOCUMENT");
      const res = await fetch("/api/documents/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          participantId: docUploadParticipant.id,
          type: "COMBINED_PDF",
          fileName: resCompress.fileName,
          dataUrl: resCompress.dataUrl,
          mimeType: resCompress.fileType || "application/pdf",
          autoVerify: autoVerifyDossier,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast(
          autoVerifyDossier
            ? `✓ 1 Combined PDF dossier uploaded & verified for ${docUploadParticipant.name}. Official QR pass generated!`
            : `✓ 1 Combined PDF dossier uploaded (${resCompress.summary}) for ${docUploadParticipant.name}. Pending verification.`,
          "success"
        );
        fetchParticipants();
        setDocUploadParticipant(null);
      } else {
        alert(`Document upload error: ${data.error || "Failed to upload"}`);
      }
    } catch (err: any) {
      alert(`Upload error: ${err.message}`);
    } finally {
      setUploadingDoc(false);
      e.target.value = "";
    }
  };

  // ─────────────────────────────────────────────────────────────
  // DIRECT NATIVE FILE PICKER FOR PARTICIPANT DOCUMENT UPLOADS
  // ─────────────────────────────────────────────────────────────
  const triggerNativeFileUpload = (participant: ParticipantRecord) => {
    setTargetParticipantForUpload(participant);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      fileInputRef.current.click();
    }
  };

  const handleNativeFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !targetParticipantForUpload) return;

    if (!file.name.toLowerCase().endsWith(".pdf") && file.type !== "application/pdf") {
      alert("Only PDF format is accepted. Please upload 1 Combined PDF dossier.");
      e.target.value = "";
      return;
    }

    setUploadingDoc(true);
    try {
      showToast(`Compressing & uploading ${file.name}...`, "info");
      const resCompress = await compressUploadedFile(file, "DOCUMENT");
      const res = await fetch("/api/documents/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          participantId: targetParticipantForUpload.id,
          type: "COMBINED_PDF",
          fileName: resCompress.fileName,
          dataUrl: resCompress.dataUrl,
          mimeType: resCompress.fileType || "application/pdf",
          autoVerify: true,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast(
          `✓ 1 Combined PDF dossier uploaded & verified for ${targetParticipantForUpload.name}. Official pass active!`,
          "success"
        );
        await fetchParticipants();
        setTargetParticipantForUpload(null);
      } else {
        alert(`Document upload error: ${data.error || "Failed to upload"}`);
      }
    } catch (err: any) {
      alert(`Upload error: ${err.message}`);
    } finally {
      setUploadingDoc(false);
      e.target.value = "";
    }
  };

  // ─────────────────────────────────────────────────────────────
  // SUBMIT FULL TEAM CONTINGENT (5 ATHLETES + MANAGER AT ONCE)
  // ─────────────────────────────────────────────────────────────
  const handleRegisterFullTeam = async () => {
    if (!selectedState) {
      alert("Please select State / Region.");
      return;
    }
    if (!selectedInstitutionName) {
      alert("Please select University / Institution from master list.");
      return;
    }

    // Validate Manager (if name is entered or any manager details are provided)
    if (managerName.trim() || managerPhone.trim() || managerEmail.trim() || managerPhotoUrl) {
      if (!managerName.trim()) {
        alert("Please enter Full Name for Team Manager.");
        return;
      }
      if (!managerPhone.trim()) {
        alert("Please enter Mobile Number for Team Manager.");
        return;
      }
      if (!managerEmail.trim()) {
        alert("Please enter Email Address for Team Manager.");
        return;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(managerEmail.trim())) {
        alert("Please enter a valid Email Address for Team Manager.");
        return;
      }
      if (!managerPhotoUrl) {
        alert("Photograph is mandatory for Team Manager. Please capture or upload manager photo.");
        return;
      }
    }

    // Validate all 5 athletes
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    for (let i = 0; i < teamAthletes.length; i++) {
      const ath = teamAthletes[i];
      const slotName = i === 0 ? "Athlete 1 (Team Captain)" : `Athlete ${i + 1}`;
      if (!ath.name.trim()) {
        alert(`Please enter Full Name for ${slotName}.`);
        return;
      }
      if (!ath.mobile.trim()) {
        alert(`Please enter Mobile Number for ${slotName}.`);
        return;
      }
      if (!ath.email.trim()) {
        alert(`Please enter Email Address for ${slotName}.`);
        return;
      }
      if (!emailRegex.test(ath.email.trim())) {
        alert(`Please enter a valid Email Address for ${slotName}.`);
        return;
      }
      if (!ath.photoUrl) {
        alert(`Photograph is mandatory for ${slotName}. Please take a photo or upload one.`);
        return;
      }
    }

    if (paymentMethod === "UPI" && !upiUtr.trim()) {
      alert("UPI Transaction Reference (UTR) is strictly required for UPI payment.");
      return;
    }

    if (!isPaymentVerified) {
      alert("Please verify and check the 'Payment Verification Confirmed' box before proceeding.");
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        state: selectedState,
        institution: selectedInstitutionName,
        institutionId: selectedInstitutionId,
        teamName: `${selectedInstitutionName} Women's Badminton Team`,
        managerName: managerName.trim() || undefined,
        managerPhone: managerPhone.trim() || undefined,
        managerEmail: managerEmail.trim() || undefined,
        managerPhotoUrl: managerPhotoUrl || undefined,
        managerBedId: wantAccommodation ? managerBedId : undefined,
        managerPdf: managerPdfDataUrl ? {
          fileName: managerPdfName,
          fileSize: managerPdfSize,
          dataUrl: managerPdfDataUrl,
        } : undefined,
        athletes: teamAthletes.map((ath) => ({
          name: ath.name.trim(),
          email: ath.email.trim() || undefined,
          mobile: ath.mobile.trim(),
          photoUrl: ath.photoUrl,
          bedId: wantAccommodation ? ath.bedId : undefined,
          pdfFileName: ath.pdfFileName,
          pdfFileSize: ath.pdfFileSize,
          pdfDataUrl: ath.pdfDataUrl,
        })),
        paymentMethod,
        utr: paymentMethod === "UPI" ? upiUtr.trim() : undefined,
        feePerAthlete,
      };

      const res = await fetch("/api/registration/team-contingent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to register team contingent.");
      }

      const teamData = data.data;

      // Manager record if created
      let mappedManager: ParticipantRecord | null = null;
      if (teamData.manager) {
        mappedManager = {
          id: teamData.manager.id,
          playerId: teamData.manager.playerId,
          name: teamData.manager.name,
          email: teamData.manager.email || "—",
          phone: teamData.manager.phone,
          state: selectedState,
          institution: selectedInstitutionName,
          institutionId: selectedInstitutionId,
          category: "Contingent Management",
          role: "MANAGER",
          photoUrl: teamData.manager.photoUrl,
          qrToken: teamData.manager.qrToken,
          documentsStatus: "DOCUMENTS_PENDING",
          paymentStatus: "PAID",
          paymentMethod,
          amountPaid: 0,
          accommodationStatus: teamData.manager.bed ? "ALLOCATED" : (managerBedId ? "ALLOCATED" : "NOT_ALLOCATED"),
          hostel: teamData.manager.bed?.hostel || (managerBedId ? (managerHostel || "Vindhya Boys Hostel") : "—"),
          floor: teamData.manager.bed?.floor || (managerBedId ? (managerFloor || "FLOOR 01") : "—"),
          room: teamData.manager.bed?.roomNumber || (managerBedId ? (managerRoomNumber || "—") : "—"),
          bed: teamData.manager.bed?.bedNumber || (managerBedId ? (managerBedNumber || "—") : "—"),
          registrationStatus: "COMPLETED",
          registeredAt: new Date().toLocaleString(),
        };
      }

      const mappedParticipants: ParticipantRecord[] = teamData.participants.map((p: any, idx: number) => ({
        id: p.id,
        playerId: p.playerId,
        name: p.name,
        email: p.email || "—",
        phone: p.phone,
        state: selectedState,
        institution: selectedInstitutionName,
        institutionId: selectedInstitutionId,
        category: idx < 2 ? "Women's Singles" : "Women's Doubles",
        role: idx === 0 ? "CAPTAIN" : "ATHLETE",
        photoUrl: p.photoUrl,
        qrToken: p.qrToken,
        documentsStatus: "DOCUMENTS_PENDING",
        paymentStatus: "PAID",
        paymentMethod,
        utr: paymentMethod === "UPI" ? upiUtr.trim() : undefined,
        amountPaid: feePerAthlete,
        accommodationStatus: p.bed ? "ALLOCATED" : "NOT_ALLOCATED",
        hostel: p.bed?.hostel || (selectedHostel === "SHALMALA" ? "Shalmala Hostel" : "Vindhya Boys Hostel"),
        floor: p.bed?.floor || selectedRoom?.floorNumber || selectedFloor || "GROUND FLOOR",
        room: p.bed?.roomNumber || selectedRoom?.roomNumber || "—",
        bed: p.bed?.bedNumber || teamAthletes[idx]?.bedNumber || "—",
        registrationStatus: "COMPLETED",
        registeredAt: new Date().toLocaleString(),
      }));

      const createdObj: CreatedTeamContingent = {
        team: {
          id: teamData.team.id,
          teamCode: teamData.team.teamCode,
          name: teamData.team.name,
          institution: selectedInstitutionName,
          state: selectedState,
          managerName: managerName.trim() || undefined,
          managerPhone: managerPhone.trim() || undefined,
        },
        manager: mappedManager,
        participants: mappedParticipants,
        payment: {
          amount: totalTeamFee,
          method: paymentMethod,
          utr: paymentMethod === "UPI" ? upiUtr.trim() : undefined,
          receiptNumber: teamData.payment?.receiptNumber || `REC-SZ26-${Date.now().toString().slice(-6)}`,
        },
      };

      setCreatedTeam(createdObj);
      const allToAppend = mappedManager ? [mappedManager, ...mappedParticipants] : mappedParticipants;
      setParticipantsList((prev) => [...allToAppend, ...prev]);
      showToast(`FULL TEAM REGISTERED ✓ ${teamData.team.teamCode} (5 ATHLETES + MANAGER)`);
    } catch (err: any) {
      alert(`Error registering team contingent: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Reset for + REGISTER NEXT TEAM CONTINGENT
  const handleResetForNextTeam = () => {
    setTeamAthletes([
      { name: "", email: "", mobile: "", photoUrl: null },
      { name: "", email: "", mobile: "", photoUrl: null },
      { name: "", email: "", mobile: "", photoUrl: null },
      { name: "", email: "", mobile: "", photoUrl: null },
      { name: "", email: "", mobile: "", photoUrl: null },
    ]);
    setManagerName("");
    setManagerPhone("");
    setManagerEmail("");
    setManagerPhotoUrl(null);
    setManagerBedId(undefined);
    setManagerBedNumber(undefined);
    setManagerRoomId(undefined);
    setManagerRoomNumber(undefined);
    setManagerFloor(undefined);
    setUpiUtr("");
    setIsPaymentVerified(true);
    setCreatedTeam(null);
  };

  // Search filter
  const searchResults = useMemo(() => {
    if (!findSearchQuery.trim()) return [];
    const q = findSearchQuery.toLowerCase();
    return participantsList.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.playerId.toLowerCase().includes(q) ||
        p.phone.includes(q) ||
        p.email.toLowerCase().includes(q) ||
        p.institution.toLowerCase().includes(q)
    );
  }, [participantsList, findSearchQuery]);

  // Live participant record lookup (for newly registered team instant sync)
  const getLiveParticipant = useCallback(
    (p: ParticipantRecord) => {
      return participantsList.find((item) => item.id === p.id) || p;
    },
    [participantsList]
  );

  // Grouped by Institution for Tab 02 (ONBOARDED TEAMS & PASSES)
  const groupedByInstitution = useMemo(() => {
    const map: Record<string, { state: string; participants: ParticipantRecord[] }> = {};
    participantsList.forEach((p) => {
      const inst = p.institution || "Other Institution";
      if (!map[inst]) {
        map[inst] = { state: p.state || "Karnataka", participants: [] };
      }
      map[inst].participants.push(p);
    });
    return Object.entries(map).map(([institution, data]) => ({
      institution,
      state: data.state,
      participants: data.participants,
      totalPaid: data.participants.reduce((acc, p) => acc + (p.amountPaid || 2500), 0),
    }));
  }, [participantsList]);

  // Filtered Participants across Search, State, and Document Status
  const filteredParticipants = useMemo(() => {
    return participantsList.filter((p) => {
      if (searchFilter.trim()) {
        const q = searchFilter.toLowerCase();
        const matches =
          p.name.toLowerCase().includes(q) ||
          p.playerId.toLowerCase().includes(q) ||
          p.phone.includes(q) ||
          p.institution.toLowerCase().includes(q) ||
          p.state.toLowerCase().includes(q);
        if (!matches) return false;
      }
      if (stateFilter !== "ALL" && p.state !== stateFilter) return false;
      if (statusFilter === "VERIFIED" && p.documentsStatus !== "VERIFIED") return false;
      if (statusFilter === "PENDING" && p.documentsStatus === "VERIFIED") return false;
      return true;
    });
  }, [participantsList, searchFilter, stateFilter, statusFilter]);

  // Filtered Teams based on search, state, and status
  const filteredTeams = useMemo(() => {
    return groupedByInstitution.filter((team) => {
      if (stateFilter !== "ALL" && team.state !== stateFilter) return false;
      if (statusFilter === "VERIFIED" && !team.participants.every((p) => p.documentsStatus === "VERIFIED")) return false;
      if (statusFilter === "PENDING" && team.participants.every((p) => p.documentsStatus === "VERIFIED")) return false;
      if (searchFilter.trim()) {
        const q = searchFilter.toLowerCase();
        const instMatch = team.institution.toLowerCase().includes(q);
        const stateMatch = team.state.toLowerCase().includes(q);
        const memberMatch = team.participants.some(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.playerId.toLowerCase().includes(q) ||
            p.phone.includes(q)
        );
        return instMatch || stateMatch || memberMatch;
      }
      return true;
    });
  }, [groupedByInstitution, searchFilter, stateFilter, statusFilter]);

  // Selected Team Details Drilldown Memo
  const selectedTeamDetail = useMemo(() => {
    if (!selectedTeamName) return null;
    return groupedByInstitution.find((t) => t.institution === selectedTeamName) || null;
  }, [selectedTeamName, groupedByInstitution]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans flex flex-col selection:bg-[#FF5A16] selection:text-white">

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* TOP REGISTRATION DESK HEADER BAR */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <header className="bg-white border-b border-slate-200 px-4 sm:px-8 sticky top-0 z-40 shadow-xs">
        <div className="max-w-[1536px] mx-auto">
          <div className="flex flex-wrap items-center justify-between gap-3 py-3.5">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-orange-50 border-2 border-orange-200 flex items-center justify-center text-[#FF5A16] font-black text-sm shadow-xs">
                SZ
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-rajdhani text-lg sm:text-xl text-slate-900 font-black uppercase tracking-wider">
                    SOUTH ZONE WOMEN&apos;S BADMINTON CHAMPIONSHIP 2026
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full bg-orange-100 text-[#FF5A16] border border-orange-200 font-rajdhani text-[10px] font-bold uppercase">
                    {deskId}
                  </span>
                </div>
                <p className="font-sans text-xs text-slate-500">
                  Official Team Contingent Registration Desk &bull; Dr. Prabhakar Kore Sports Arena, KLE Tech
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setIsFindDetailsOpen(true)}
                type="button"
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-rajdhani text-xs font-bold uppercase rounded-xl transition-all cursor-pointer flex items-center gap-1.5 border border-slate-300"
              >
                <Search className="w-4 h-4 text-slate-600" /> FIND DETAILS
              </button>

              <button
                onClick={() => {
                  handleResetForNextTeam();
                  setActiveTab("NEW_REG");
                }}
                type="button"
                className="px-4 py-2 bg-[#FF5A16] hover:bg-[#ea4e0e] text-white font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-xs font-rajdhani text-xs uppercase tracking-wider"
              >
                <Plus className="w-4 h-4" />+ REGISTER FULL TEAM
              </button>
            </div>
          </div>

          {/* TOP-LEVEL 2 TABS: 01. FULL TEAM REGISTRATION | 02. ONBOARDED TEAMS & PASSES */}
          <div className="flex border-t border-slate-100 overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => setActiveTab("NEW_REG")}
              className={`flex items-center gap-2 px-5 py-3 font-rajdhani text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer whitespace-nowrap ${activeTab === "NEW_REG"
                ? "border-[#FF5A16] text-[#FF5A16] bg-orange-50/60 font-black"
                : "border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
            >
              <ClipboardList className="w-4 h-4" />
              01. FULL TEAM REGISTRATION (5 ATHLETES + MANAGER)
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab("ONBOARDED");
                fetchParticipants();
              }}
              className={`flex items-center gap-2 px-5 py-3 font-rajdhani text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer whitespace-nowrap ${activeTab === "ONBOARDED"
                ? "border-[#FF5A16] text-[#FF5A16] bg-orange-50/60 font-black"
                : "border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
            >
              <BadgeCheck className="w-4 h-4" />
              02. ONBOARDED TEAMS &amp; PASSES ({groupedByInstitution.length})
            </button>
          </div>
        </div>
      </header>

      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl font-rajdhani text-xs font-bold uppercase tracking-wider flex items-center gap-2.5 shadow-xl border ${toastMessage.type === "success"
              ? "bg-emerald-900 text-emerald-100 border-emerald-500"
              : "bg-rose-900 text-rose-100 border-rose-500"
              }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{toastMessage.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MAIN VIEW CONTENT */}
      <main className="max-w-[1536px] mx-auto p-4 sm:p-8 flex-1 w-full space-y-6">

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* TAB 01: FULL TEAM CONTINGENT REGISTRATION */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        {activeTab === "NEW_REG" && (
          <>
            {createdTeam ? (
              /* TEAM CONTINGENT CREATED STATE */
              <div className="bg-white border-2 border-emerald-300 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-5">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black">
                      <CheckCircle2 className="w-7 h-7" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-rajdhani text-xs font-bold uppercase tracking-wider">
                          TEAM CONTINGENT REGISTERED ✓
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-orange-100 text-[#FF5A16] font-mono text-xs font-bold">
                          {createdTeam.team.teamCode}
                        </span>
                      </div>
                      <h2 className="font-rajdhani text-2xl font-black text-slate-900 uppercase mt-1">
                        {createdTeam.team.institution}
                      </h2>
                      <p className="font-mono text-xs text-slate-600">
                        {createdTeam.team.state} &bull; 5 Athletes + Team Manager Accredited &bull; Receipt: {createdTeam.payment.receiptNumber}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-rajdhani text-xs font-bold uppercase rounded-xl flex items-center gap-1.5 border border-slate-300 cursor-pointer"
                    >
                      <Printer className="w-4 h-4" /> PRINT ALL BADGES &amp; PASSES
                    </button>
                    <button
                      type="button"
                      onClick={handleResetForNextTeam}
                      className="px-5 py-2 bg-[#FF5A16] hover:bg-[#ea4e0e] text-white font-rajdhani text-xs font-black uppercase rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />+ REGISTER ANOTHER UNIVERSITY TEAM
                    </button>
                  </div>
                </div>

                {/* Contingent Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs font-rajdhani">
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                    <span className="text-slate-500 font-bold uppercase text-[10px]">TOTAL CONTINGENT</span>
                    <div className="text-slate-900 font-black text-sm flex items-center gap-1">
                      <Users className="w-4 h-4 text-[#FF5A16]" /> 5 ATHLETES + 1 MANAGER
                    </div>
                  </div>
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                    <span className="text-slate-500 font-bold uppercase text-[10px]">PAYMENT STATUS</span>
                    <div className="text-emerald-700 font-black text-sm flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> ₹{createdTeam.payment.amount.toLocaleString()} ({createdTeam.payment.method}) PAID
                    </div>
                  </div>
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                    <span className="text-slate-500 font-bold uppercase text-[10px]">DOCUMENT UPLOADS</span>
                    <div className="text-emerald-700 font-black text-sm flex items-center gap-1">
                      <FileText className="w-4 h-4 text-[#FF5A16]" /> SYSTEM UPLOADS ACTIVE
                    </div>
                  </div>
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                    <span className="text-slate-500 font-bold uppercase text-[10px]">ACCOMMODATION</span>
                    <div className="text-slate-900 font-black text-sm flex items-center gap-1">
                      <Bed className="w-4 h-4 text-[#FF5A16]" /> 5 BEDS ALLOCATED
                    </div>
                  </div>
                </div>

                {/* Manager Pass Card if registered */}
                {createdTeam.manager && (() => {
                  const liveManager = getLiveParticipant(createdTeam.manager);
                  return (
                    <div className="p-4 bg-orange-50/70 border-2 border-orange-200 rounded-2xl space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 bg-[#FF5A16] text-white font-rajdhani text-[10px] font-black rounded-full uppercase">
                            OFFICIAL
                          </span>
                          <span className="font-rajdhani font-black text-sm uppercase text-slate-900">
                            TEAM MANAGER ACCREDITATION PASS
                          </span>
                        </div>
                        <span className="text-xs font-mono font-bold text-[#FF5A16]">
                          ID: {liveManager.playerId}
                        </span>
                      </div>

                      <div className="flex flex-col sm:flex-row items-center gap-5">
                        <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-200 border-2 border-slate-300 shrink-0">
                          {liveManager.photoUrl ? (
                            <img src={liveManager.photoUrl} alt="Manager" className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-10 h-10 text-slate-400 m-auto mt-5" />
                          )}
                        </div>

                        <div className="flex-1 space-y-1 text-center sm:text-left text-xs">
                          <div className="font-rajdhani font-black text-slate-900 text-base">
                            {liveManager.name}
                          </div>
                          <div className="text-slate-600 font-mono text-[11px]">
                            Phone: {liveManager.phone}
                          </div>
                          <div className="text-slate-500 text-[11px]">
                            Official Team Manager &bull; {createdTeam.team.institution}
                          </div>
                          {liveManager.room && liveManager.room !== "—" && (
                            <div className="text-[10px] font-mono text-slate-700 bg-white/70 px-2 py-0.5 rounded border border-slate-200 w-fit">
                              {liveManager.hostel} &bull; Room {liveManager.room} &bull; Bed {liveManager.bed}
                            </div>
                          )}
                        </div>

                        {liveManager.documentsStatus === "VERIFIED" && liveManager.qrToken ? (
                          <div className="bg-white p-2 rounded-xl border border-slate-300 shadow-2xs">
                            <PortalQrCode
                              value={liveManager.qrToken}
                              size={90}
                              showActions={false}
                            />
                          </div>
                        ) : (
                          <div className="w-20 h-20 bg-slate-100 rounded-xl border border-dashed border-slate-300 flex flex-col items-center justify-center text-center p-1">
                            <Lock className="w-4 h-4 text-amber-500 mb-0.5" />
                            <span className="text-[9px] font-mono font-bold text-slate-700">QR LOCKED</span>
                            <span className="text-[8px] text-slate-400">Verify in Tab 03</span>
                          </div>
                        )}

                        <div className="flex flex-col gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedDocType("COMBINED_PDF");
                              setDocUploadParticipant(liveManager);
                            }}
                            className={`px-3 py-2 font-rajdhani text-xs font-bold uppercase rounded-xl flex items-center justify-center gap-1.5 cursor-pointer border transition-colors ${
                              liveManager.documentsStatus === "VERIFIED"
                                ? "bg-emerald-50 text-emerald-800 border-emerald-300 font-black"
                                : "bg-blue-600 hover:bg-blue-700 text-white border-blue-600 shadow-xs"
                            }`}
                            title="Upload or manage manager 1 Combined PDF dossier"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            {liveManager.documentsStatus === "VERIFIED" ? "1 PDF DOSSIER ✓" : "UPLOAD 1 PDF"}
                          </button>

                          <button
                            type="button"
                            onClick={() => setSelectedParticipantForPass(liveManager)}
                            className="px-4 py-2 bg-slate-900 hover:bg-[#FF5A16] text-white font-rajdhani text-xs font-black uppercase rounded-xl cursor-pointer shadow-xs flex items-center justify-center gap-1.5 transition-colors"
                          >
                            <QrCode className="w-3.5 h-3.5 text-[#FF5A16]" /> VIEW PASS
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* 5 Registered Athletes Cards with Photos and QR Tokens */}
                <div className="space-y-3 pt-2">
                  <h3 className="font-rajdhani text-sm font-black text-slate-800 uppercase tracking-wider">
                    ACCREDITED SQUAD ATHLETES (5 PASSES GENERATED)
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    {createdTeam.participants.map((ath, idx) => {
                      const liveAth = getLiveParticipant(ath);
                      return (
                        <div
                          key={ath.id}
                          className="p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl flex flex-col items-center text-center space-y-3 shadow-xs hover:border-[#FF5A16] transition-colors"
                        >
                          <div className="w-full flex items-center justify-between text-[10px] font-mono font-bold">
                            <span className={idx === 0 ? "text-[#FF5A16]" : "text-slate-500"}>
                              {idx === 0 ? "★ CAPTAIN" : `ATHLETE 0${idx + 1}`}
                            </span>
                            <span className="text-emerald-700">✓ SAVED</span>
                          </div>

                          {/* Athlete Photo */}
                          <div className="w-24 h-24 rounded-xl overflow-hidden border-2 border-slate-300 bg-slate-200 shadow-xs">
                            {liveAth.photoUrl ? (
                              <img src={liveAth.photoUrl} alt={liveAth.name} className="w-full h-full object-cover" />
                            ) : (
                              <User className="w-10 h-10 text-slate-400 m-auto mt-6" />
                            )}
                          </div>

                          <div className="space-y-0.5 w-full">
                            <div className="font-rajdhani font-black text-slate-900 text-sm truncate" title={liveAth.name}>
                              {liveAth.name}
                            </div>
                            <div className="font-mono text-xs text-[#FF5A16] font-bold">
                              {liveAth.playerId}
                            </div>
                            <div className="text-[10px] font-mono text-slate-600 truncate">
                              {liveAth.phone}
                            </div>
                          </div>

                          {/* QR Code Pass */}
                          {liveAth.documentsStatus === "VERIFIED" && liveAth.qrToken ? (
                            <div className="bg-white p-2 rounded-xl border border-slate-300 shadow-2xs">
                              <PortalQrCode
                                value={liveAth.qrToken}
                                size={100}
                                showActions={false}
                              />
                            </div>
                          ) : (
                            <div className="w-24 h-24 bg-slate-100 rounded-xl border border-dashed border-slate-300 flex flex-col items-center justify-center text-center p-1.5">
                              <Lock className="w-5 h-5 text-amber-500 mb-1" />
                              <span className="text-[10px] font-mono font-bold text-slate-700">QR LOCKED</span>
                              <span className="text-[8px] text-slate-400">Verify in Tab 03</span>
                            </div>
                          )}

                          <div className="w-full pt-1 border-t border-slate-200 text-[10px] font-mono text-slate-600">
                            Room: <strong className="text-slate-900">{liveAth.room}</strong> &bull; Bed: <strong className="text-slate-900">{liveAth.bed}</strong>
                          </div>

                          <div className="flex flex-col gap-1.5 w-full">
                            <button
                              type="button"
                              onClick={() => {
                                if (liveAth.documents && liveAth.documents.length > 0 && liveAth.documents[0].filePath) {
                                  window.open(liveAth.documents[0].filePath, "_blank");
                                } else {
                                  triggerNativeFileUpload(liveAth);
                                }
                              }}
                              className={`py-1.5 px-2 font-rajdhani text-[10px] font-bold uppercase rounded-lg flex items-center justify-center gap-1 cursor-pointer border ${
                                liveAth.documentsStatus === "VERIFIED"
                                  ? "bg-emerald-50 text-emerald-800 border-emerald-300 font-black"
                                  : "bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200 font-bold"
                              }`}
                              title={liveAth.documentsStatus === "VERIFIED" ? "View verified PDF dossier" : "Upload 1 Combined PDF dossier from computer"}
                            >
                              <FileText className="w-3 h-3" />
                              {liveAth.documentsStatus === "VERIFIED" ? "PDF ✓" : "1 PDF"}
                            </button>

                            <button
                              type="button"
                              onClick={() => setSelectedParticipantForPass(liveAth)}
                              className="w-full py-1.5 bg-slate-900 hover:bg-[#FF5A16] text-white font-rajdhani text-[11px] font-bold uppercase rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1"
                            >
                              <QrCode className="w-3 h-3 text-[#FF5A16]" /> VIEW PASS
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Registered Contingent Roster Table (Manager + 5 Athletes) */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
                    <div>
                      <h4 className="font-rajdhani text-sm font-black text-slate-900 uppercase">
                        CONTINGENT ACCREDITATION ROSTER ({createdTeam.team.institution})
                      </h4>
                      <p className="text-[11px] text-slate-500 font-sans">
                        Full participant records, dossier attachments, verification status, and credentials
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab("ONBOARDED");
                        fetchParticipants();
                      }}
                      className="px-4 py-2 bg-slate-900 hover:bg-[#FF5A16] text-white font-rajdhani text-xs font-bold uppercase rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      VIEW IN ONBOARDED TEAMS &amp; PASSES <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-white text-slate-700 font-rajdhani font-black uppercase border-b border-slate-200">
                        <tr>
                          <th className="p-2.5">PHOTO</th>
                          <th className="p-2.5">PARTICIPANT NAME &amp; ID</th>
                          <th className="p-2.5">ROLE</th>
                          <th className="p-2.5">MOBILE</th>
                          <th className="p-2.5">ACCOMMODATION</th>
                          <th className="p-2.5">1 COMBINED PDF</th>
                          <th className="p-2.5">QR STATUS</th>
                          <th className="p-2.5 text-right">ACTIONS</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 font-sans">
                        {[...(createdTeam.manager ? [createdTeam.manager] : []), ...createdTeam.participants].map((member) => {
                          const liveMember = getLiveParticipant(member);
                          return (
                            <tr key={liveMember.id} className="hover:bg-white transition-colors">
                              <td className="p-2.5">
                                <div className="w-8 h-8 rounded-lg overflow-hidden bg-slate-200 border border-slate-300">
                                  {liveMember.photoUrl ? (
                                    <img src={liveMember.photoUrl} alt={liveMember.name} className="w-full h-full object-cover" />
                                  ) : (
                                    <User className="w-4 h-4 text-slate-400 m-auto mt-2" />
                                  )}
                                </div>
                              </td>
                              <td className="p-2.5">
                                <div className="font-bold text-slate-900">{liveMember.name}</div>
                                <div className="font-mono text-[10px] text-[#FF5A16] font-bold">{liveMember.playerId}</div>
                              </td>
                              <td className="p-2.5">
                                <span className={`px-2 py-0.5 rounded-full font-rajdhani text-[10px] font-bold ${
                                  liveMember.role === "MANAGER"
                                    ? "bg-purple-100 text-purple-800 border border-purple-200 font-black"
                                    : liveMember.role === "CAPTAIN"
                                    ? "bg-orange-100 text-[#FF5A16] border border-orange-200 font-black"
                                    : "bg-slate-100 text-slate-700"
                                }`}>
                                  {liveMember.role || "ATHLETE"}
                                </span>
                              </td>
                              <td className="p-2.5 font-mono text-[11px] text-slate-600">{liveMember.phone}</td>
                              <td className="p-2.5">
                                <span className={`px-2 py-0.5 rounded-full font-rajdhani text-[10px] font-bold ${
                                  liveMember.accommodationStatus === "ALLOCATED"
                                    ? "bg-slate-100 text-slate-900 border border-slate-300"
                                    : "bg-amber-50 text-amber-800 border border-amber-300"
                                }`}>
                                  {liveMember.room !== "—" ? `${liveMember.hostel} (${liveMember.room})` : "NOT ALLOCATED"}
                                </span>
                              </td>
                              <td className="p-2.5">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedDocType("COMBINED_PDF");
                                    setDocUploadParticipant(liveMember);
                                  }}
                                  className={`px-2 py-0.5 rounded-full font-rajdhani text-[10px] font-bold cursor-pointer hover:opacity-80 transition-opacity flex items-center gap-1 ${
                                    liveMember.documentsStatus === "VERIFIED"
                                      ? "bg-emerald-50 text-emerald-800 border border-emerald-300 font-black"
                                      : "bg-amber-50 text-amber-800 border border-amber-300"
                                  }`}
                                  title="Upload or view 1 Combined PDF dossier"
                                >
                                  <FileText className="w-3 h-3" />
                                  {liveMember.documentsStatus === "VERIFIED" ? "1 PDF ✓" : "1 PDF PENDING"}
                                </button>
                              </td>
                              <td className="p-2.5">
                                {liveMember.documentsStatus === "VERIFIED" && liveMember.qrToken ? (
                                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 font-rajdhani text-[10px] font-black flex items-center gap-1 w-fit">
                                    <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" /> ACTIVE ✓
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-300 font-rajdhani text-[10px] font-bold flex items-center gap-1 w-fit">
                                    <Lock className="w-2.5 h-2.5 text-amber-500" /> LOCKED
                                  </span>
                                )}
                              </td>
                              <td className="p-2.5 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (liveMember.documents && liveMember.documents.length > 0 && liveMember.documents[0].filePath) {
                                        window.open(liveMember.documents[0].filePath, "_blank");
                                      } else {
                                        triggerNativeFileUpload(liveMember);
                                      }
                                    }}
                                    className={`px-2 py-1 font-rajdhani text-[10px] font-bold uppercase rounded-md flex items-center gap-1 cursor-pointer border ${
                                      liveMember.documentsStatus === "VERIFIED"
                                        ? "bg-emerald-50 text-emerald-800 border-emerald-300 font-black"
                                        : "bg-blue-600 hover:bg-blue-700 text-white border-blue-600"
                                    }`}
                                    title={liveMember.documentsStatus === "VERIFIED" ? "View verified PDF dossier" : "Upload 1 Combined PDF dossier from computer"}
                                  >
                                    <FileText className="w-3 h-3" />
                                    {liveMember.documentsStatus === "VERIFIED" ? "PDF ✓" : "1 PDF"}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setSelectedParticipantForPass(liveMember)}
                                    className="px-2.5 py-1 bg-slate-900 hover:bg-[#FF5A16] text-white font-rajdhani text-[10px] font-bold uppercase rounded-md cursor-pointer transition-colors flex items-center gap-1"
                                  >
                                    <QrCode className="w-3 h-3 text-[#FF5A16]" /> VIEW PASS
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            ) : (
              /* FULL TEAM CONTINGENT INTAKE FORM (5 ATHLETES + MANAGER AT ONCE) */
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* LEFT COLUMN: 8 COLS (UNIVERSITY, MANAGER, 5 ATHLETES, ACCOMMODATION) */}
                <div className="lg:col-span-8 space-y-6">

                  {/* SECTION 01: STATE & UNIVERSITY SELECTION */}
                  <div className="bg-white border-2 border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
                    <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
                      <span className="w-6 h-6 rounded-lg bg-orange-50 border border-orange-200 text-[#FF5A16] font-rajdhani font-black text-xs flex items-center justify-center">01</span>
                      <h2 className="font-rajdhani text-base sm:text-lg text-slate-900 font-black uppercase tracking-wider">
                        UNIVERSITY &amp; INSTITUTION DETAILS
                      </h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* State Dropdown */}
                      <div>
                        <label className="block font-rajdhani text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                          STATE / REGION *
                        </label>
                        <select
                          value={selectedState}
                          onChange={(e) => setSelectedState(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-300 focus:bg-white focus:border-[#FF5A16] text-slate-900 rounded-xl px-3.5 py-2.5 text-xs transition-colors focus:outline-none"
                        >
                          {SOUTH_ZONE_STATES.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>

                      {/* Dependent University Dropdown */}
                      <div>
                        <label className="block font-rajdhani text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                          UNIVERSITY / INSTITUTION * {loadingInstitutions && "(Loading...)"}
                        </label>
                        <select
                          value={selectedInstitutionId}
                          onChange={(e) => {
                            setSelectedInstitutionId(e.target.value);
                            const found = institutions.find((i) => i.id === e.target.value);
                            if (found) setSelectedInstitutionName(found.name);
                          }}
                          className="w-full bg-slate-50 border border-slate-300 focus:bg-white focus:border-[#FF5A16] text-slate-900 rounded-xl px-3.5 py-2.5 text-xs transition-colors focus:outline-none"
                        >
                          {institutions.length === 0 ? (
                            <option value="">No institutions registered in {selectedState}</option>
                          ) : (
                            institutions.map((inst) => (
                              <option key={inst.id} value={inst.id}>
                                {inst.name} {inst.city && !inst.name.toLowerCase().includes(inst.city.toLowerCase()) ? `(${inst.city})` : ""}
                              </option>
                            ))
                          )}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* SECTION 02: TEAM MANAGER SEPARATE REGISTRATION & PHOTO */}
                  <div className="bg-white border-2 border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2.5">
                        <span className="w-6 h-6 rounded-lg bg-orange-50 border border-orange-200 text-[#FF5A16] font-rajdhani font-black text-xs flex items-center justify-center">02</span>
                        <h2 className="font-rajdhani text-base sm:text-lg text-slate-900 font-black uppercase tracking-wider">
                          TEAM MANAGER / COACH REGISTRATION
                        </h2>
                      </div>
                      {managerPhotoUrl && (
                        <span className="text-[11px] font-rajdhani font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> MANAGER PHOTO READY
                        </span>
                      )}
                    </div>

                    <div className="p-4 bg-orange-50/40 border border-orange-200 rounded-2xl space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                        {/* Manager Photo Capture */}
                        <div className="md:col-span-3 flex items-center gap-2.5">
                          <div className="w-20 h-20 rounded-xl overflow-hidden bg-white border-2 border-slate-300 shrink-0 relative shadow-2xs">
                            {managerPhotoUrl ? (
                              <img src={managerPhotoUrl} alt="Manager" className="w-full h-full object-cover" />
                            ) : (
                              <User className="w-10 h-10 text-slate-300 m-auto mt-5" />
                            )}
                          </div>

                          <div className="space-y-1.5 flex-1">
                            <button
                              type="button"
                              onClick={() => startCamera("MANAGER")}
                              className="w-full py-1.5 px-2 bg-slate-900 hover:bg-slate-800 text-white font-rajdhani text-[10px] font-black uppercase rounded-lg flex items-center justify-center gap-1 cursor-pointer shadow-xs"
                            >
                              <Camera className="w-3.5 h-3.5 text-[#FF5A16]" /> CAMERA
                            </button>

                            <label className="w-full py-1.5 px-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-rajdhani text-[10px] font-bold uppercase rounded-lg flex items-center justify-center gap-1 cursor-pointer shadow-xs">
                              {compressingPhotoTarget === "MANAGER" ? (
                                <>
                                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#FF5A16]" /> COMPRESSING...
                                </>
                              ) : (
                                <>
                                  <Upload className="w-3.5 h-3.5 text-slate-500" /> UPLOAD
                                </>
                              )}
                              <input
                                type="file"
                                accept="image/*"
                                disabled={compressingPhotoTarget === "MANAGER"}
                                className="hidden"
                                onChange={(e) => handleFileUpload("MANAGER", e)}
                              />
                            </label>
                          </div>
                        </div>

                        {/* Manager Details: Name, Mobile, Email */}
                        <div className="md:col-span-9 grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="block font-rajdhani text-[10px] font-bold text-slate-800 uppercase tracking-wider mb-1">
                              MANAGER FULL NAME *
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. Dr. Ramesh Rao"
                              value={managerName}
                              onChange={(e) => setManagerName(e.target.value)}
                              className="w-full bg-white border border-slate-300 focus:border-[#FF5A16] text-slate-900 rounded-xl px-3 py-2 text-xs focus:outline-none"
                            />
                          </div>

                          <div>
                            <label className="block font-rajdhani text-[10px] font-bold text-slate-800 uppercase tracking-wider mb-1">
                              MANAGER CONTACT NUMBER *
                            </label>
                            <input
                              type="tel"
                              placeholder="+91 98450 99887"
                              value={managerPhone}
                              onChange={(e) => setManagerPhone(e.target.value)}
                              className="w-full bg-white border border-slate-300 focus:border-[#FF5A16] text-slate-900 rounded-xl px-3 py-2 text-xs focus:outline-none"
                            />
                          </div>

                          <div>
                            <label className="block font-rajdhani text-[10px] font-bold text-slate-800 uppercase tracking-wider mb-1">
                              MANAGER EMAIL ADDRESS *
                            </label>
                            <input
                              type="email"
                              required
                              placeholder="manager@university.edu"
                              value={managerEmail}
                              onChange={(e) => setManagerEmail(e.target.value)}
                              className="w-full bg-white border border-slate-300 focus:border-[#FF5A16] text-slate-900 rounded-xl px-3 py-2 text-xs focus:outline-none"
                            />
                          </div>
                        </div>
                      </div>

                      {/* 1 Combined PDF upload for manager */}
                      <div className="pt-3 border-t border-orange-200/80 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-[#FF5A16]" />
                          <span className="font-rajdhani text-xs font-bold text-slate-800 uppercase tracking-wider">
                            MANAGER DOCUMENTS (1 COMBINED PDF: ID CARD, APPOINTMENT ORDER)
                          </span>
                        </div>

                        {managerPdfName ? (
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-mono text-emerald-800 bg-emerald-100/90 border border-emerald-300 px-3 py-1 rounded-lg font-bold flex items-center gap-1.5 shadow-2xs">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              {managerPdfName} ({managerPdfSize})
                            </span>
                            <button
                              type="button"
                              onClick={handleRemoveManagerPdf}
                              className="text-[10px] font-rajdhani font-bold text-red-600 hover:text-red-700 uppercase cursor-pointer"
                            >
                              ✕ Remove
                            </button>
                          </div>
                        ) : (
                          <label className="px-3.5 py-1.5 bg-white hover:bg-orange-50/70 border-2 border-dashed border-orange-300 hover:border-[#FF5A16] text-slate-700 hover:text-[#FF5A16] rounded-xl font-rajdhani text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors">
                            {isCompressingManagerPdf ? (
                              <>
                                <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#FF5A16]" />
                                COMPRESSING & OPTIMIZING PDF...
                              </>
                            ) : (
                              <>
                                <Upload className="w-3.5 h-3.5 text-[#FF5A16]" />
                                UPLOAD 1 COMBINED PDF (MANAGER)
                              </>
                            )}
                            <input
                              type="file"
                              accept=".pdf,application/pdf"
                              disabled={isCompressingManagerPdf}
                              className="hidden"
                              onChange={handleManagerPdfUpload}
                            />
                          </label>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* SECTION 03: 5-MEMBER SQUAD ROSTER INTAKE (FULL TEAM AT ONCE) */}
                  <div className="bg-white border-2 border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2.5">
                        <span className="w-6 h-6 rounded-lg bg-orange-50 border border-orange-200 text-[#FF5A16] font-rajdhani font-black text-xs flex items-center justify-center">03</span>
                        <h2 className="font-rajdhani text-base sm:text-lg text-slate-900 font-black uppercase tracking-wider">
                          TEAM SQUAD ROSTER (ALL 5 ATHLETES AT ONCE)
                        </h2>
                      </div>
                      <span className="text-xs font-mono font-bold text-[#FF5A16] bg-orange-50 px-3 py-1 rounded-full border border-orange-200">
                        5 ATHLETES PER SQUAD
                      </span>
                    </div>

                    <div className="space-y-4">
                      {teamAthletes.map((athlete, idx) => {
                        const isCaptain = idx === 0;
                        const label = isCaptain ? "ATHLETE 01 — TEAM CAPTAIN *" : `ATHLETE 0${idx + 1} *`;

                        return (
                          <div
                            key={`athlete-row-${idx}`}
                            className={`p-4 rounded-xl border-2 transition-all ${athlete.name && athlete.mobile && athlete.photoUrl
                              ? "bg-emerald-50/40 border-emerald-300"
                              : "bg-slate-50/70 border-slate-200 hover:border-slate-300"
                              }`}
                          >
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <span className={`w-6 h-6 rounded-full font-rajdhani font-black text-xs flex items-center justify-center ${isCaptain ? "bg-[#FF5A16] text-white" : "bg-slate-200 text-slate-800"
                                  }`}>
                                  {idx + 1}
                                </span>
                                <span className="font-rajdhani font-black text-xs uppercase tracking-wider text-slate-900">
                                  {label}
                                </span>
                              </div>

                              {athlete.photoUrl && (
                                <span className="text-[11px] font-rajdhani font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3" /> PHOTO READY
                                </span>
                              )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                              {/* Photo Avatar / Capture Control */}
                              <div className="md:col-span-3 flex items-center gap-2.5">
                                <div className="w-16 h-16 rounded-xl overflow-hidden bg-white border-2 border-slate-300 shrink-0 relative shadow-2xs">
                                  {athlete.photoUrl ? (
                                    <img src={athlete.photoUrl} alt="Athlete" className="w-full h-full object-cover" />
                                  ) : (
                                    <User className="w-8 h-8 text-slate-300 m-auto mt-3.5" />
                                  )}
                                </div>

                                <div className="space-y-1.5 flex-1">
                                  <button
                                    type="button"
                                    onClick={() => startCamera(idx)}
                                    className="w-full py-1 px-2 bg-slate-900 hover:bg-slate-800 text-white font-rajdhani text-[10px] font-black uppercase rounded-lg flex items-center justify-center gap-1 cursor-pointer"
                                  >
                                    <Camera className="w-3 h-3 text-[#FF5A16]" /> CAMERA
                                  </button>

                                  <label className="w-full py-1 px-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-rajdhani text-[10px] font-bold uppercase rounded-lg flex items-center justify-center gap-1 cursor-pointer">
                                    {compressingPhotoTarget === idx ? (
                                      <>
                                        <RefreshCw className="w-3 h-3 animate-spin text-[#FF5A16]" />
                                        <span>COMPRESSING...</span>
                                      </>
                                    ) : (
                                      <>
                                        <Upload className="w-3 h-3 text-slate-500" />
                                        <span>UPLOAD</span>
                                      </>
                                    )}
                                    <input
                                      type="file"
                                      accept="image/*"
                                      disabled={compressingPhotoTarget === idx}
                                      className="hidden"
                                      onChange={(e) => handleFileUpload(idx, e)}
                                    />
                                  </label>
                                </div>
                              </div>

                              {/* Athlete Fields: Name, Mobile, Email */}
                              <div className="md:col-span-9 grid grid-cols-1 sm:grid-cols-3 gap-3">
                                {/* Full Name */}
                                <div>
                                  <label className="block font-rajdhani text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                                    FULL NAME *
                                  </label>
                                  <input
                                    type="text"
                                    placeholder={isCaptain ? "e.g. Ananya Sharma" : `Athlete ${idx + 1} Name`}
                                    value={athlete.name}
                                    onChange={(e) => handleUpdateAthlete(idx, "name", e.target.value)}
                                    className="w-full bg-white border border-slate-300 focus:border-[#FF5A16] text-slate-900 rounded-xl px-3 py-2 text-xs focus:outline-none"
                                  />
                                </div>

                                {/* Mobile Number */}
                                <div>
                                  <label className="block font-rajdhani text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                                    MOBILE NUMBER *
                                  </label>
                                  <input
                                    type="tel"
                                    placeholder="+91 98450 12345"
                                    value={athlete.mobile}
                                    onChange={(e) => handleUpdateAthlete(idx, "mobile", e.target.value)}
                                    className="w-full bg-white border border-slate-300 focus:border-[#FF5A16] text-slate-900 rounded-xl px-3 py-2 text-xs focus:outline-none"
                                  />
                                </div>

                                {/* Email Address */}
                                <div>
                                  <label className="block font-rajdhani text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                                    EMAIL ADDRESS *
                                  </label>
                                  <input
                                    type="email"
                                    required
                                    placeholder="athlete@univ.edu"
                                    value={athlete.email}
                                    onChange={(e) => handleUpdateAthlete(idx, "email", e.target.value)}
                                    className="w-full bg-white border border-slate-300 focus:border-[#FF5A16] text-slate-900 rounded-xl px-3 py-2 text-xs focus:outline-none"
                                  />
                                </div>
                              </div>
                            </div>

                            {/* 1 Combined PDF upload row for this athlete */}
                            <div className="mt-3 pt-2.5 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <FileText className="w-3.5 h-3.5 text-[#FF5A16]" />
                                <span className="font-rajdhani text-[11px] font-bold text-slate-800 uppercase tracking-wider">
                                  DOCUMENTS (1 COMBINED PDF: ID CARD, SSLC, PUC / ELIGIBILITY)
                                </span>
                              </div>

                              {athlete.pdfFileName ? (
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] font-mono text-emerald-800 bg-emerald-100/90 border border-emerald-300 px-2.5 py-1 rounded-lg font-bold flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                    {athlete.pdfFileName} ({athlete.pdfFileSize})
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveAthletePdf(idx)}
                                    className="text-[10px] font-rajdhani font-bold text-red-600 hover:text-red-700 uppercase cursor-pointer"
                                  >
                                    ✕ Remove
                                  </button>
                                </div>
                              ) : (
                                <label className="px-3 py-1 bg-white hover:bg-orange-50/70 border-2 border-dashed border-slate-300 hover:border-[#FF5A16] text-slate-700 hover:text-[#FF5A16] rounded-lg font-rajdhani text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors">
                                  {compressingAthletePdfIdx === idx ? (
                                    <>
                                      <RefreshCw className="w-3 h-3 animate-spin text-[#FF5A16]" />
                                      COMPRESSING PDF...
                                    </>
                                  ) : (
                                    <>
                                      <Upload className="w-3 h-3 text-[#FF5A16]" />
                                      UPLOAD 1 COMBINED PDF
                                    </>
                                  )}
                                  <input
                                    type="file"
                                    accept=".pdf,application/pdf"
                                    disabled={compressingAthletePdfIdx === idx}
                                    className="hidden"
                                    onChange={(e) => handleAthletePdfUpload(idx, e)}
                                  />
                                </label>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* SECTION 04: CONTINGENT ACCOMMODATION (5 ATHLETES IN SHALMALA + MANAGER IN VINDHYA) */}
                  <div className="bg-white border-2 border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm space-y-5">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2.5">
                        <span className="w-6 h-6 rounded-lg bg-orange-50 border border-orange-200 text-[#FF5A16] font-rajdhani font-black text-xs flex items-center justify-center">04</span>
                        <div>
                          <h2 className="font-rajdhani text-base sm:text-lg text-slate-900 font-black uppercase tracking-wider">
                            {selectedHostel === "VINDHYA"
                              ? "TEAM MANAGER ACCOMMODATION (VINDHYA BOYS HOSTEL)"
                              : "CONTINGENT ACCOMMODATION (5 BEDS SQUAD ALLOCATION)"}
                          </h2>
                          <p className="text-[11px] text-slate-500 font-sans">
                            {selectedHostel === "VINDHYA" ? (
                              managerBedId ? (
                                <span className="text-emerald-700 font-bold">
                                  ✓ Bed {managerBedNumber} allocated in Room {managerRoomNumber || selectedRoom?.roomNumber} ({managerName.trim() || "Team Manager"})
                                </span>
                              ) : (
                                <span className="text-amber-700 font-semibold">
                                  No bed allocated for Team Manager &bull; Click an available bed below
                                </span>
                              )
                            ) : (
                              <span>
                                {selectedBedsCount} of 5 Athletes Assigned Beds &bull; {selectedBedsCount === 5 ? "✓ Complete" : "Select beds below"}
                              </span>
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {selectedHostel === "VINDHYA" ? (
                          <>
                            {/* ALLOCATE MANAGER BED BUTTON */}
                            <button
                              type="button"
                              onClick={handleAllocateManagerBed}
                              className="px-3 py-1.5 bg-[#FF5A16] hover:bg-[#ea4e0e] text-white rounded-xl text-xs font-rajdhani font-black uppercase flex items-center gap-1.5 shadow-xs cursor-pointer transition-all"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" /> ALLOCATE MANAGER BED
                            </button>

                            {/* CLEAR MANAGER BED BUTTON */}
                            <button
                              type="button"
                              onClick={handleClearManagerBed}
                              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-rajdhani font-bold uppercase flex items-center gap-1.5 border border-slate-300 cursor-pointer transition-all"
                            >
                              <X className="w-3.5 h-3.5" /> CLEAR MANAGER BED
                            </button>
                          </>
                        ) : (
                          <>
                            {/* SELECT ALL 5 BEDS BUTTON */}
                            <button
                              type="button"
                              onClick={handleSelectAllBeds}
                              className="px-3 py-1.5 bg-[#FF5A16] hover:bg-[#ea4e0e] text-white rounded-xl text-xs font-rajdhani font-black uppercase flex items-center gap-1.5 shadow-xs cursor-pointer transition-all"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" /> SELECT ALL 5 BEDS
                            </button>

                            {/* CLEAR ALL BEDS BUTTON */}
                            <button
                              type="button"
                              onClick={handleClearAllBeds}
                              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-rajdhani font-bold uppercase flex items-center gap-1.5 border border-slate-300 cursor-pointer transition-all"
                            >
                              <X className="w-3.5 h-3.5" /> CLEAR ALL
                            </button>
                          </>
                        )}

                        {/* VIEW ALL ROOMS MODAL BUTTON */}
                        <button
                          type="button"
                          onClick={() => setIsViewAllRoomsOpen(true)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-rajdhani font-bold flex items-center gap-1 border border-slate-300 cursor-pointer"
                        >
                          <Bed className="w-3.5 h-3.5 text-[#FF5A16]" /> VIEW ALL ROOMS
                        </button>
                      </div>
                    </div>

                    {/* Contingent Allocation Status Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-2.5 h-2.5 rounded-full ${selectedBedsCount === 5 ? "bg-emerald-500" : selectedBedsCount > 0 ? "bg-amber-500" : "bg-slate-300"}`} />
                          <span className="font-rajdhani font-bold text-slate-700">SHALMALA (ATHLETES):</span>
                          <span className="font-mono text-slate-900 font-bold">{selectedBedsCount}/5 Beds Assigned</span>
                        </div>
                        <span className="text-slate-300 hidden sm:inline">|</span>
                        <div className="flex items-center gap-1.5">
                          <span className={`w-2.5 h-2.5 rounded-full ${managerBedId ? "bg-emerald-500" : "bg-amber-500"}`} />
                          <span className="font-rajdhani font-bold text-slate-700">VINDHYA (MANAGER):</span>
                          <span className="font-mono text-slate-900 font-bold">
                            {managerBedId ? `${managerRoomNumber || "Room"} - ${managerBedNumber}` : "Not Allocated"}
                          </span>
                        </div>
                      </div>

                      <div className="text-[11px] font-sans text-slate-500">
                        Active Filter: <span className="font-bold text-slate-800">{selectedHostel === "SHALMALA" ? "Shalmala (Female Athletes)" : "Vindhya (Male Manager)"}</span>
                      </div>
                    </div>

                    {/* Hostel, Floor & Room Dropdowns */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {/* Hostel */}
                      <div>
                        <label className="block font-rajdhani text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                          HOSTEL
                        </label>
                        <select
                          value={selectedHostel}
                          onChange={(e) => {
                            setSelectedHostel(e.target.value);
                            setSelectedFloor("");
                          }}
                          className="w-full bg-slate-50 border border-slate-300 focus:bg-white focus:border-[#FF5A16] text-slate-900 rounded-xl px-3.5 py-2.5 text-xs transition-colors focus:outline-none"
                        >
                          <option value="SHALMALA">Shalmala Hostel (Female Athletes)</option>
                          <option value="VINDHYA">Vindhya Boys Hostel (Male Managers)</option>
                        </select>
                      </div>

                      {/* Floor */}
                      <div>
                        <label className="block font-rajdhani text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                          FLOOR
                        </label>
                        <select
                          value={selectedFloor}
                          onChange={(e) => {
                            setSelectedFloor(e.target.value);
                          }}
                          className="w-full bg-slate-50 border border-slate-300 focus:bg-white focus:border-[#FF5A16] text-slate-900 rounded-xl px-3.5 py-2.5 text-xs transition-colors focus:outline-none"
                        >
                          <option value="">All Floors</option>
                          {availableFloors.length > 0 ? (
                            availableFloors.map((fl) => (
                              <option key={fl} value={fl}>
                                {fl.toUpperCase()}
                              </option>
                            ))
                          ) : (
                            <>
                              <option value="GROUND FLOOR">GROUND FLOOR</option>
                              <option value="FLOOR 01">FLOOR 01</option>
                              <option value="FLOOR 02">FLOOR 02</option>
                            </>
                          )}
                        </select>
                      </div>

                      {/* Room Selection */}
                      <div>
                        <label className="block font-rajdhani text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                          ROOM {selectedHostel === "VINDHYA" ? "(MANAGER ROOM)" : "(5-BED CONTINGENT ROOM)"}
                        </label>
                        <select
                          value={selectedRoomId}
                          onChange={(e) => setSelectedRoomId(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-300 focus:bg-white focus:border-[#FF5A16] text-slate-900 rounded-xl px-3.5 py-2.5 text-xs transition-colors focus:outline-none"
                        >
                          {filteredRooms.length === 0 ? (
                            <option value="">No rooms available on this floor</option>
                          ) : (
                            filteredRooms.map((r) => {
                              const availCount = r.beds?.filter((b) => b.status === "AVAILABLE").length || 0;
                              const squadBedsInRoom = teamAthletes.filter((a) => r.beds?.some((b) => b.id === a.bedId)).length;
                              const isManagerInRoom = selectedHostel === "VINDHYA" && managerRoomId === r.id;
                              const isSquadInRoom = selectedHostel === "SHALMALA" && squadBedsInRoom > 0;

                              return (
                                <option
                                  key={r.id}
                                  value={r.id}
                                  disabled={availCount === 0 && !isSquadInRoom && !isManagerInRoom}
                                >
                                  {r.roomNumber} ({availCount}/{r.capacity || 5} Available Beds) — {r.floorNumber}
                                  {isSquadInRoom ? ` (${squadBedsInRoom} Squad Assigned)` : ""}
                                  {isManagerInRoom ? " (★ Manager Allocated)" : ""}
                                </option>
                              );
                            })
                          )}
                        </select>
                      </div>
                    </div>

                    {/* Cross-room notice for Manager when on Vindhya */}
                    {selectedHostel === "VINDHYA" && managerBedId && managerRoomNumber && selectedRoom && managerRoomNumber !== selectedRoom.roomNumber && (
                      <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center justify-between">
                        <span>
                          Manager currently allocated to <strong>{managerBedNumber}</strong> in <strong>Room {managerRoomNumber}</strong> ({managerFloor}).
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            const found = rooms.find((r) => r.id === managerRoomId);
                            if (found) {
                              setSelectedFloor(found.floorNumber);
                              setSelectedRoomId(found.id);
                            }
                          }}
                          className="text-[#FF5A16] underline font-bold ml-2 cursor-pointer"
                        >
                          Go to Room {managerRoomNumber}
                        </button>
                      </div>
                    )}

                    {/* INTERACTIVE BED TOPOLOGY SELECTION GRID */}
                    {selectedRoom && (
                      <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="font-rajdhani font-black text-xs uppercase tracking-wider text-slate-900">
                              {selectedHostel === "VINDHYA" ? "MANAGER ROOM" : "SQUAD ROOM"} {selectedRoom.roomNumber} &bull;{" "}
                              {selectedHostel === "VINDHYA" ? "ALLOCATE 1 BED FOR MANAGER" : "INTERACTIVE BED SELECTION (CLICK TO TOGGLE)"}
                            </span>
                            <span className="text-[10px] font-mono text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-full font-bold">
                              {availableBedsInRoom.length} / {selectedRoom.capacity || 5} Beds Available
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            {selectedHostel === "VINDHYA" ? (
                              managerBedId && managerRoomId === selectedRoom.id ? (
                                <button
                                  type="button"
                                  onClick={handleClearManagerBed}
                                  className="text-[11px] font-rajdhani font-bold text-red-600 hover:underline cursor-pointer flex items-center gap-1"
                                >
                                  <X className="w-3.5 h-3.5" /> Clear Manager Bed
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={handleAllocateManagerBed}
                                  className="text-[11px] font-rajdhani font-bold text-[#FF5A16] hover:underline cursor-pointer flex items-center gap-1"
                                >
                                  <CheckCircle className="w-3.5 h-3.5" /> Allocate First Bed to Manager
                                </button>
                              )
                            ) : (
                              <button
                                type="button"
                                onClick={handleSelectAllBeds}
                                className="text-[11px] font-rajdhani font-bold text-[#FF5A16] hover:underline cursor-pointer flex items-center gap-1"
                              >
                                <CheckCircle className="w-3.5 h-3.5" /> Select All ({selectedRoom.beds.filter(b => b.status === "AVAILABLE").length} Available)
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Visual Clickable Bed Cards */}
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                          {selectedRoom.beds.map((bed) => {
                            const isAvailable = bed.status === "AVAILABLE";

                            if (selectedHostel === "VINDHYA") {
                              const isManagerAssigned = managerBedId === bed.id;
                              const canSelect = isAvailable || isManagerAssigned;

                              return (
                                <button
                                  key={bed.id}
                                  type="button"
                                  disabled={!canSelect}
                                  onClick={() => handleToggleBedSelection(bed)}
                                  className={`p-3 rounded-xl border-2 text-center transition-all cursor-pointer flex flex-col justify-between min-h-[92px] ${
                                    isManagerAssigned
                                      ? "bg-emerald-50 border-emerald-500 text-emerald-950 shadow-xs ring-2 ring-emerald-300/60"
                                      : isAvailable
                                        ? "bg-white border-slate-300 text-slate-800 hover:border-[#FF5A16] hover:bg-orange-50/50"
                                        : "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed opacity-60"
                                  }`}
                                >
                                  <div className="flex items-center justify-between w-full">
                                    <span className="font-rajdhani font-black text-xs uppercase">{bed.bedNumber}</span>
                                    {isManagerAssigned ? (
                                      <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[9px] font-bold">✓</span>
                                    ) : isAvailable ? (
                                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                    ) : (
                                      <span className="w-2 h-2 rounded-full bg-slate-300"></span>
                                    )}
                                  </div>

                                  <div className="py-1">
                                    {isManagerAssigned ? (
                                      <div className="space-y-0.5 text-left">
                                        <div className="text-[10px] font-rajdhani font-black text-emerald-800 truncate">
                                          ★ Team Manager
                                        </div>
                                        <div className="text-[11px] font-bold text-slate-900 truncate" title={managerName || "Team Manager"}>
                                          {managerName.trim() || "Team Manager"}
                                        </div>
                                      </div>
                                    ) : isAvailable ? (
                                      <div className="text-[10px] font-mono text-slate-500">
                                        Available (Click to allocate)
                                      </div>
                                    ) : (
                                      <div className="text-[10px] font-mono text-slate-400">
                                        Occupied
                                      </div>
                                    )}
                                  </div>

                                  <div className="text-[9px] font-mono font-bold text-slate-400 pt-1 border-t border-slate-200/60">
                                    {isManagerAssigned ? "ALLOCATED" : isAvailable ? "ALLOCATE" : "UNAVAILABLE"}
                                  </div>
                                </button>
                              );
                            }

                            // SHALMALA (ATHLETES)
                            const assignedIndex = teamAthletes.findIndex((a) => a.bedId === bed.id);
                            const isAssigned = assignedIndex !== -1;
                            const assignedAthlete = isAssigned ? teamAthletes[assignedIndex] : null;

                            return (
                              <button
                                key={bed.id}
                                type="button"
                                disabled={!isAvailable && !isAssigned}
                                onClick={() => handleToggleBedSelection(bed)}
                                className={`p-3 rounded-xl border-2 text-center transition-all cursor-pointer flex flex-col justify-between min-h-[92px] ${
                                  isAssigned
                                    ? "bg-emerald-50 border-emerald-500 text-emerald-950 shadow-xs ring-2 ring-emerald-300/60"
                                    : isAvailable
                                      ? "bg-white border-slate-300 text-slate-800 hover:border-[#FF5A16] hover:bg-orange-50/50"
                                      : "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed opacity-60"
                                }`}
                              >
                                <div className="flex items-center justify-between w-full">
                                  <span className="font-rajdhani font-black text-xs uppercase">{bed.bedNumber}</span>
                                  {isAssigned ? (
                                    <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[9px] font-bold">✓</span>
                                  ) : isAvailable ? (
                                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                  ) : (
                                    <span className="w-2 h-2 rounded-full bg-slate-300"></span>
                                  )}
                                </div>

                                <div className="py-1">
                                  {isAssigned ? (
                                    <div className="space-y-0.5 text-left">
                                      <div className="text-[10px] font-rajdhani font-black text-emerald-800 truncate">
                                        {assignedIndex === 0 ? "★ Captain" : `Athlete 0${assignedIndex + 1}`}
                                      </div>
                                      <div className="text-[11px] font-bold text-slate-900 truncate" title={assignedAthlete?.name}>
                                        {assignedAthlete?.name || `Slot ${assignedIndex + 1}`}
                                      </div>
                                    </div>
                                  ) : isAvailable ? (
                                    <div className="text-[10px] font-mono text-slate-500">
                                      Available (Click to assign)
                                    </div>
                                  ) : (
                                    <div className="text-[10px] font-mono text-slate-400">
                                      Occupied
                                    </div>
                                  )}
                                </div>

                                <div className="text-[9px] font-mono font-bold text-slate-400 pt-1 border-t border-slate-200/60">
                                  {isAssigned ? "SELECTED" : isAvailable ? "SELECT" : "UNAVAILABLE"}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                  </div>

                </div>

                {/* RIGHT COLUMN: 4 COLS (CONTINGENT FEE ₹2,500, PAYMENT METHOD, VERIFICATION & SUBMIT) */}
                <div className="lg:col-span-4 space-y-6">

                  {/* Team Registration Fee Ledger Card */}
                  <div className="bg-white border-2 border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div>
                        <h3 className="font-rajdhani text-base font-black text-slate-900 uppercase tracking-wider">
                          CONTINGENT LEDGER
                        </h3>
                        <p className="text-[11px] text-slate-500">5 Athletes Squad Registration</p>
                      </div>
                      <span className="font-rajdhani text-lg text-[#FF5A16] font-black">
                        ₹{totalTeamFee.toLocaleString()}
                      </span>
                    </div>

                    <div className="space-y-4 font-sans text-xs">
                      {/* Breakdown */}
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 font-mono text-[11px] text-slate-700">
                        <div className="flex justify-between">
                          <span>Team Registration Fee:</span>
                          <span className="font-bold text-slate-900">₹2,500 / Team</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Total Squad Athletes:</span>
                          <span className="font-bold text-slate-900">5 Players (₹500 / athlete)</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Team Manager Registration:</span>
                          <span className="font-bold text-emerald-700">Complimentary Pass</span>
                        </div>
                        <div className="flex justify-between pt-1 border-t border-slate-200 font-bold text-slate-900">
                          <span>Total Contingent Amount:</span>
                          <span className="text-[#FF5A16]">₹2,500</span>
                        </div>
                      </div>

                      {/* Payment Method Selector */}
                      <div>
                        <label className="block font-rajdhani text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                          PAYMENT METHOD *
                        </label>
                        <div className="grid grid-cols-2 gap-2 font-rajdhani font-bold text-xs uppercase">
                          <button
                            type="button"
                            onClick={() => setPaymentMethod("CASH")}
                            className={`py-2.5 rounded-xl border-2 transition-all cursor-pointer ${paymentMethod === "CASH"
                              ? "bg-[#FF5A16] text-white border-[#FF5A16] shadow-xs font-black"
                              : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                              }`}
                          >
                            CASH AT DESK
                          </button>
                          <button
                            type="button"
                            onClick={() => setPaymentMethod("UPI")}
                            className={`py-2.5 rounded-xl border-2 transition-all cursor-pointer ${paymentMethod === "UPI"
                              ? "bg-[#FF5A16] text-white border-[#FF5A16] shadow-xs font-black"
                              : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                              }`}
                          >
                            UPI / SCAN
                          </button>
                        </div>
                      </div>

                      {/* UPI Reference Input */}
                      {paymentMethod === "UPI" && (
                        <div>
                          <label className="block font-rajdhani text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                            UPI TRANSACTION REFERENCE (UTR) *
                          </label>
                          <input
                            type="text"
                            placeholder="Enter 12-digit UTR (e.g. 529182746192)"
                            value={upiUtr}
                            onChange={(e) => setUpiUtr(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-300 focus:bg-white focus:border-[#FF5A16] text-slate-900 placeholder:text-slate-400 rounded-xl px-3.5 py-2.5 text-xs transition-colors focus:outline-none font-mono"
                          />
                        </div>
                      )}

                      {/* Payment Verification Checkbox */}
                      <label className="flex items-start gap-3 p-3.5 bg-emerald-50/80 border-2 border-emerald-300/80 rounded-xl cursor-pointer hover:bg-emerald-50 transition-colors shadow-xs">
                        <input
                          type="checkbox"
                          id="checkbox-reg-payment-verified"
                          checked={isPaymentVerified}
                          onChange={(e) => setIsPaymentVerified(e.target.checked)}
                          className="mt-0.5 w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer accent-emerald-600"
                        />
                        <div>
                          <div className="font-rajdhani font-black text-xs text-emerald-950 uppercase tracking-wider flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            PAYMENT VERIFICATION CONFIRMED *
                          </div>
                          <div className="text-[11px] text-emerald-800 font-sans mt-0.5 leading-snug">
                            ₹2,500 full squad fee verified &amp; received via {paymentMethod === "CASH" ? "CASH AT DESK" : "UPI / SCAN"}
                          </div>
                        </div>
                      </label>

                      {/* Register Full Team Button */}
                      <button
                        type="button"
                        disabled={isSaving}
                        onClick={handleRegisterFullTeam}
                        className="w-full py-3.5 bg-[#FF5A16] hover:bg-[#ea4e0e] disabled:opacity-50 text-white font-rajdhani text-sm font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-md flex items-center justify-center gap-2"
                      >
                        {isSaving ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" /> REGISTERING SQUAD &amp; GENERATING PASSES...
                          </>
                        ) : (
                          <>
                            <Check className="w-4 h-4" /> REGISTER FULL TEAM (5 ATHLETES + MANAGER)
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                </div>

                {/* ───────────────────────────────────────────────────────────── */}
                {/* RECENTLY REGISTERED PARTICIPANTS & QUICK ROSTER LOOKUP */}
                {/* (MERGED FROM REGISTERED PARTICIPANTS SLIDE) */}
                {/* ───────────────────────────────────────────────────────────── */}
                <div className="bg-white border-2 border-slate-200 rounded-2xl overflow-hidden shadow-sm space-y-4 p-5 sm:p-6">
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
                    <div>
                      <h3 className="font-rajdhani text-lg font-black text-slate-900 uppercase flex items-center gap-2">
                        <Users className="w-5 h-5 text-[#FF5A16]" />
                        RECENT REGISTERED PARTICIPANTS ({participantsList.length})
                      </h3>
                      <p className="text-xs text-slate-500 font-sans">
                        Quick intake registry: verify athlete eligibility, inspect uploaded dossiers, or open passes directly
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          placeholder="Search registered athletes &amp; managers..."
                          value={searchFilter}
                          onChange={(e) => setSearchFilter(e.target.value)}
                          className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 w-64 focus:outline-none focus:border-[#FF5A16]"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={fetchParticipants}
                        className="p-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-700 cursor-pointer"
                        title="Refresh registry"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab("ONBOARDED");
                          fetchParticipants();
                        }}
                        className="px-3 py-2 bg-slate-900 hover:bg-[#FF5A16] text-white font-rajdhani text-xs font-bold uppercase rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        ONBOARDED TEAMS &amp; PASSES <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {loadingParticipants ? (
                    <div className="p-8 text-center text-slate-400 font-rajdhani text-xs">
                      LOADING PARTICIPANTS DATABASE...
                    </div>
                  ) : participantsList.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 font-rajdhani text-xs">
                      NO PARTICIPANTS RECORDED YET. FILL IN THE FORM ABOVE TO REGISTER THE FIRST CONTINGENT.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 text-slate-700 font-rajdhani font-black uppercase border-b border-slate-200">
                          <tr>
                            <th className="p-3">PHOTO</th>
                            <th className="p-3">PARTICIPANT NAME &amp; ID</th>
                            <th className="p-3">UNIVERSITY</th>
                            <th className="p-3">MOBILE</th>
                            <th className="p-3">ROLE</th>
                            <th className="p-3">QR STATUS</th>
                            <th className="p-3">1 COMBINED PDF</th>
                            <th className="p-3">ACCOMMODATION</th>
                            <th className="p-3 text-right">ACTIONS</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-sans">
                          {filteredParticipants.slice(0, 10).map((p) => (
                            <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                              <td className="p-3">
                                <div className="w-8 h-8 rounded-lg overflow-hidden bg-slate-200 border border-slate-300">
                                  {p.photoUrl ? (
                                    <img src={p.photoUrl} alt={p.name} className="w-full h-full object-cover" />
                                  ) : (
                                    <User className="w-4 h-4 text-slate-400 m-auto mt-2" />
                                  )}
                                </div>
                              </td>
                              <td className="p-3">
                                <div className="font-bold text-slate-900">{p.name}</div>
                                <div className="font-mono text-[10px] text-[#FF5A16] font-bold">{p.playerId}</div>
                              </td>
                              <td className="p-3">
                                <div className="text-slate-800">{p.institution}</div>
                                <div className="text-[10px] text-slate-500">{p.state}</div>
                              </td>
                              <td className="p-3 text-slate-600 font-mono text-[11px]">{p.phone}</td>
                              <td className="p-3">
                                <span className={`px-2 py-0.5 rounded-full font-rajdhani text-[10px] font-bold ${
                                  p.role === "MANAGER"
                                    ? "bg-purple-100 text-purple-800 border border-purple-200 font-black"
                                    : p.role === "CAPTAIN"
                                    ? "bg-orange-100 text-[#FF5A16] border border-orange-200 font-black"
                                    : "bg-slate-100 text-slate-700"
                                }`}>
                                  {p.role || "ATHLETE"}
                                </span>
                              </td>
                              <td className="p-3">
                                {p.documentsStatus === "VERIFIED" && p.qrToken ? (
                                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 font-rajdhani text-[10px] font-black flex items-center gap-1 w-fit">
                                    <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" /> ACTIVE ✓
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-300 font-rajdhani text-[10px] font-bold flex items-center gap-1 w-fit">
                                    <Lock className="w-2.5 h-2.5 text-amber-500" /> LOCKED
                                  </span>
                                )}
                              </td>
                              <td className="p-3">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedDocType("COMBINED_PDF");
                                    setDocUploadParticipant(p);
                                  }}
                                  className={`px-2.5 py-0.5 rounded-full font-rajdhani text-[10px] font-bold cursor-pointer hover:opacity-80 transition-opacity flex items-center gap-1 ${
                                    p.documentsStatus === "VERIFIED"
                                      ? "bg-emerald-50 text-emerald-800 border border-emerald-300 font-black"
                                      : "bg-amber-50 text-amber-800 border border-amber-300"
                                  }`}
                                  title="Upload or view 1 Combined PDF dossier"
                                >
                                  <FileText className="w-3 h-3" />
                                  {p.documentsStatus === "VERIFIED" ? "1 PDF ✓" : "1 PDF PENDING"}
                                </button>
                              </td>
                              <td className="p-3">
                                <span className={`px-2 py-0.5 rounded-full font-rajdhani text-[10px] font-bold ${
                                  p.accommodationStatus === "ALLOCATED"
                                    ? "bg-slate-100 text-slate-900 border border-slate-300"
                                    : "bg-amber-50 text-amber-800 border border-amber-300"
                                }`}>
                                  {p.room !== "—" ? `${p.hostel} (${p.room})` : "NOT ALLOCATED"}
                                </span>
                              </td>
                              <td className="p-3 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (p.documents && p.documents.length > 0 && p.documents[0].filePath) {
                                        window.open(p.documents[0].filePath, "_blank");
                                      } else {
                                        triggerNativeFileUpload(p);
                                      }
                                    }}
                                    className={`px-2 py-1 font-rajdhani text-[10px] font-bold uppercase rounded-md flex items-center gap-1 cursor-pointer border ${
                                      p.documentsStatus === "VERIFIED"
                                        ? "bg-emerald-50 text-emerald-800 border-emerald-300 font-black"
                                        : "bg-blue-600 hover:bg-blue-700 text-white border-blue-600"
                                    }`}
                                    title={p.documentsStatus === "VERIFIED" ? "View verified PDF dossier" : "Upload 1 Combined PDF dossier from computer"}
                                  >
                                    <FileText className="w-3 h-3" />
                                    {p.documentsStatus === "VERIFIED" ? "PDF ✓" : "1 PDF"}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setSelectedParticipantForPass(p)}
                                    className="px-2.5 py-1 bg-slate-900 hover:bg-[#FF5A16] text-white font-rajdhani text-[10px] font-bold uppercase rounded-md cursor-pointer transition-colors flex items-center gap-1"
                                  >
                                    <QrCode className="w-3 h-3 text-[#FF5A16]" /> VIEW PASS
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {filteredParticipants.length > 10 && (
                        <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
                          <button
                            type="button"
                            onClick={() => {
                              setActiveTab("ONBOARDED");
                              setOnboardedViewMode("REGISTRY");
                              fetchParticipants();
                            }}
                            className="font-rajdhani text-xs font-bold text-[#FF5A16] hover:underline uppercase cursor-pointer"
                          >
                            Showing 10 of {filteredParticipants.length} participants &bull; View all in Onboarded Teams &amp; Passes →
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

              </div>
            )}
          </>
        )}

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* TAB 02: ONBOARDED TEAMS & PASSES (MERGED WITH PARTICIPANT REGISTRY) */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        {activeTab === "ONBOARDED" && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 bg-white border-2 border-slate-200 rounded-2xl p-5 shadow-xs">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-rajdhani text-2xl text-slate-900 font-black uppercase">
                    ONBOARDED UNIVERSITY TEAMS &amp; PASSES
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full bg-orange-100 text-[#FF5A16] font-rajdhani text-xs font-bold">
                    {filteredTeams.length} Teams
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-rajdhani text-xs font-bold">
                    {filteredParticipants.length} Participants
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-sans mt-0.5">
                  Accredited University Contingents, athlete rosters, credentials, and full participant registry
                </p>
              </div>

              {/* View Mode Toggle: Teams (Cards) vs Registry (Table) */}
              <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setOnboardedViewMode("TEAMS")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-rajdhani text-xs font-bold uppercase transition-all cursor-pointer ${
                    onboardedViewMode === "TEAMS"
                      ? "bg-white text-slate-900 shadow-xs font-black border border-slate-200"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Grid className="w-3.5 h-3.5 text-[#FF5A16]" />
                  UNIVERSITY CONTINGENTS ({filteredTeams.length})
                </button>
                <button
                  type="button"
                  onClick={() => setOnboardedViewMode("REGISTRY")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-rajdhani text-xs font-bold uppercase transition-all cursor-pointer ${
                    onboardedViewMode === "REGISTRY"
                      ? "bg-white text-slate-900 shadow-xs font-black border border-slate-200"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <List className="w-3.5 h-3.5 text-[#FF5A16]" />
                  FULL PARTICIPANTS REGISTRY ({filteredParticipants.length})
                </button>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="bg-white border-2 border-slate-200 rounded-2xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[300px]">
                <div className="relative flex-1 min-w-[220px]">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by Name, ID, Mobile, University, or State..."
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#FF5A16]"
                  />
                </div>

                {/* State Filter */}
                <select
                  value={stateFilter}
                  onChange={(e) => setStateFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 px-3 py-2 focus:outline-none focus:border-[#FF5A16]"
                >
                  <option value="ALL">All States ({SOUTH_ZONE_STATES.length})</option>
                  {SOUTH_ZONE_STATES.map((st) => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>

                {/* Document / Accreditation Status Filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 px-3 py-2 focus:outline-none focus:border-[#FF5A16]"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="VERIFIED">Accredited / Verified ✓</option>
                  <option value="PENDING">Documents Pending</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                {/* Form Toggle: TABLE vs CARDS */}
                {onboardedViewMode === "TEAMS" && (
                  <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200">
                    <button
                      type="button"
                      onClick={() => setTeamsDisplayMode("TABLE")}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-rajdhani text-xs font-bold uppercase transition-all cursor-pointer ${
                        teamsDisplayMode === "TABLE"
                          ? "bg-white text-slate-900 shadow-xs font-black border border-slate-200"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                      title="Display contingents in tabular form"
                    >
                      <Table className="w-3.5 h-3.5 text-[#FF5A16]" /> TABULAR FORM
                    </button>
                    <button
                      type="button"
                      onClick={() => setTeamsDisplayMode("CARDS")}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-rajdhani text-xs font-bold uppercase transition-all cursor-pointer ${
                        teamsDisplayMode === "CARDS"
                          ? "bg-white text-slate-900 shadow-xs font-black border border-slate-200"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                      title="Display contingents as card grid"
                    >
                      <Grid className="w-3.5 h-3.5 text-[#FF5A16]" /> CARDS
                    </button>
                  </div>
                )}

                <button
                  type="button"
                  onClick={fetchParticipants}
                  className="p-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-700 cursor-pointer flex items-center gap-1.5 font-rajdhani text-xs font-bold"
                  title="Refresh list"
                >
                  <RefreshCw className="w-4 h-4" /> REFRESH
                </button>
              </div>
            </div>

            {/* CONTINGENTS VIEW (TABULAR FORM OR CARDS) */}
            {onboardedViewMode === "TEAMS" && (
              <>
                {filteredTeams.length === 0 ? (
                  <div className="bg-white border-2 border-slate-200 rounded-2xl p-12 text-center text-slate-400 font-rajdhani text-sm">
                    NO ONBOARDED TEAMS MATCHING FILTERS. ADJUST SEARCH OR COMPLETE NEW REGISTRATIONS.
                  </div>
                ) : teamsDisplayMode === "TABLE" ? (
                  /* TABULAR FORM FOR UNIVERSITY CONTINGENTS */
                  <div className="bg-white border-2 border-slate-200 rounded-2xl overflow-hidden shadow-xs space-y-0">
                    <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50">
                      <div>
                        <h3 className="font-rajdhani text-lg font-black text-slate-900 uppercase flex items-center gap-2">
                          <GraduationCap className="w-5 h-5 text-[#FF5A16]" />
                          ONBOARDED UNIVERSITY CONTINGENTS ({filteredTeams.length} TEAMS)
                        </h3>
                        <p className="text-xs text-slate-500 font-sans">
                          Click any University Name or &quot;VIEW PASSES&quot; to inspect full roster, credentials &amp; official passes
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-600 bg-white px-3 py-1 rounded-xl border border-slate-200">
                          {filteredTeams.reduce((acc, t) => acc + t.participants.length, 0)} Total Athletes &amp; Managers
                        </span>
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 text-slate-700 font-rajdhani font-black uppercase border-b border-slate-200">
                          <tr>
                            <th className="p-3.5">UNIVERSITY / INSTITUTION</th>
                            <th className="p-3.5">STATE</th>
                            <th className="p-3.5">REGISTERED MEMBERS</th>
                            <th className="p-3.5">FEES PAID</th>
                            <th className="p-3.5">ACCREDITATION STATUS</th>
                            <th className="p-3.5">SQUAD ROSTER</th>
                            <th className="p-3.5 text-right">ACTION</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-sans">
                          {filteredTeams.map((team) => {
                            const isExpanded = expandedTeamId === team.institution;
                            const isAccredited = team.participants.every((p) => p.documentsStatus === "VERIFIED");
                            const verifiedCount = team.participants.filter((p) => p.documentsStatus === "VERIFIED").length;

                            return (
                              <React.Fragment key={team.institution}>
                                <tr className="hover:bg-slate-50/80 transition-colors">
                                  {/* University Name (Clickable) */}
                                  <td className="p-3.5">
                                    <button
                                      type="button"
                                      onClick={() => setSelectedTeamName(team.institution)}
                                      className="text-left group cursor-pointer focus:outline-none"
                                      title="Click to view full team roster & official passes"
                                    >
                                      <div className="flex items-center gap-2">
                                        <GraduationCap className="w-4 h-4 text-[#FF5A16] group-hover:scale-110 transition-transform shrink-0" />
                                        <span className="font-rajdhani font-black text-sm text-slate-900 uppercase group-hover:text-[#FF5A16] transition-colors">
                                          {team.institution}
                                        </span>
                                      </div>
                                      <div className="text-[10px] text-slate-400 group-hover:text-slate-600 font-sans mt-0.5">
                                        Click to view roster, passes &amp; documents &rarr;
                                      </div>
                                    </button>
                                  </td>

                                  {/* State Badge */}
                                  <td className="p-3.5">
                                    <span className="px-3 py-1 rounded-xl bg-orange-50 border border-orange-200 text-[#FF5A16] font-rajdhani text-xs font-black uppercase tracking-wider inline-flex items-center gap-1.5 shadow-2xs">
                                      <span className="w-1.5 h-1.5 rounded-full bg-[#FF5A16]" />
                                      {team.state}
                                    </span>
                                  </td>

                                  {/* Member Count Badge */}
                                  <td className="p-3.5">
                                    <span className="px-3 py-1 rounded-xl bg-slate-100 border border-slate-300 text-slate-800 font-rajdhani text-xs font-black uppercase tracking-wider inline-flex items-center gap-1.5 shadow-2xs">
                                      <Users className="w-3.5 h-3.5 text-slate-600" />
                                      {team.participants.length} MEMBERS
                                    </span>
                                  </td>

                                  {/* Fees Paid Badge */}
                                  <td className="p-3.5">
                                    <span className="px-3 py-1 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 font-rajdhani text-xs font-black uppercase tracking-wider inline-flex items-center gap-1 shadow-2xs">
                                      ₹{team.totalPaid.toLocaleString()} PAID
                                    </span>
                                  </td>

                                  {/* Accreditation Status */}
                                  <td className="p-3.5">
                                    {isAccredited ? (
                                      <span className="px-2.5 py-1 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-full font-rajdhani text-xs font-black inline-flex items-center gap-1">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> ACCREDITED ✓
                                      </span>
                                    ) : (
                                      <span className="px-2.5 py-1 bg-amber-50 border border-amber-300 text-amber-800 rounded-full font-rajdhani text-xs font-bold inline-flex items-center gap-1">
                                        <Clock className="w-3.5 h-3.5 text-amber-600" /> DOCS PENDING ({verifiedCount}/{team.participants.length})
                                      </span>
                                    )}
                                  </td>

                                  {/* Squad Roster Mini Avatars */}
                                  <td className="p-3.5">
                                    <div className="flex items-center gap-2">
                                      <div className="flex -space-x-1.5 overflow-hidden">
                                        {team.participants.slice(0, 5).map((p) => (
                                          <div
                                            key={p.id}
                                            className="inline-block h-6 w-6 rounded-full ring-2 ring-white bg-slate-200 overflow-hidden shrink-0"
                                            title={`${p.name} (${p.role})`}
                                          >
                                            {p.photoUrl ? (
                                              <img src={p.photoUrl} alt={p.name} className="h-full w-full object-cover" />
                                            ) : (
                                              <User className="h-3 w-3 text-slate-400 m-auto mt-1.5" />
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                      <span className="text-[11px] text-slate-500 font-mono">
                                        {team.participants.length} pax
                                      </span>
                                    </div>
                                  </td>

                                  {/* Actions */}
                                  <td className="p-3.5 text-right">
                                    <div className="flex items-center justify-end gap-1.5">
                                      <button
                                        type="button"
                                        onClick={() => setSelectedTeamName(team.institution)}
                                        className="py-1.5 px-3 bg-[#FF5A16] hover:bg-[#ea4e0e] text-white font-rajdhani text-xs font-black uppercase rounded-xl shadow-xs cursor-pointer inline-flex items-center gap-1.5 transition-colors"
                                        title="View Full Team Roster, Dossiers, & Passes"
                                      >
                                        <Eye className="w-3.5 h-3.5" /> VIEW PASSES ({team.participants.length})
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setExpandedTeamId(isExpanded ? null : team.institution)}
                                        className="p-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 rounded-xl cursor-pointer transition-colors"
                                        title={isExpanded ? "Collapse inline roster" : "Expand inline roster"}
                                      >
                                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                      </button>
                                    </div>
                                  </td>
                                </tr>

                                {/* Inline Expanded Roster Row */}
                                {isExpanded && (
                                  <tr className="bg-slate-50/90">
                                    <td colSpan={7} className="p-4 border-y border-slate-200">
                                      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs space-y-2 p-3">
                                        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                                          <span className="font-rajdhani text-xs font-black uppercase text-slate-900">
                                            {team.institution} &bull; FULL SQUAD ROSTER ({team.participants.length} MEMBERS)
                                          </span>
                                          <button
                                            type="button"
                                            onClick={() => setSelectedTeamName(team.institution)}
                                            className="text-[#FF5A16] hover:underline font-rajdhani text-xs font-bold uppercase inline-flex items-center gap-1 cursor-pointer"
                                          >
                                            OPEN IN FULL MODAL &rarr;
                                          </button>
                                        </div>
                                        <div className="overflow-x-auto">
                                          <table className="w-full text-left text-xs">
                                            <thead className="bg-slate-50 text-slate-600 font-rajdhani font-black uppercase border-b border-slate-200">
                                              <tr>
                                                <th className="p-2">MEMBER</th>
                                                <th className="p-2">ROLE</th>
                                                <th className="p-2">PHONE</th>
                                                <th className="p-2">ROOM</th>
                                                <th className="p-2">1 PDF</th>
                                                <th className="p-2 text-right">ACTION</th>
                                              </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100 font-sans">
                                              {team.participants.map((m) => (
                                                <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                                                  <td className="p-2">
                                                    <div className="flex items-center gap-2">
                                                      <div className="w-7 h-7 rounded-md overflow-hidden bg-slate-200 shrink-0 border border-slate-300">
                                                        {m.photoUrl ? (
                                                          <img src={m.photoUrl} alt={m.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                          <User className="w-3.5 h-3.5 text-slate-400 m-auto mt-1" />
                                                        )}
                                                      </div>
                                                      <div>
                                                        <div className="font-bold text-slate-900 text-xs">{m.name}</div>
                                                        <div className="font-mono text-[9px] text-[#FF5A16] font-bold">{m.playerId}</div>
                                                      </div>
                                                    </div>
                                                  </td>
                                                  <td className="p-2">
                                                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                                                      m.role === "MANAGER"
                                                        ? "bg-purple-100 text-purple-800"
                                                        : m.role === "CAPTAIN"
                                                        ? "bg-orange-100 text-[#FF5A16]"
                                                        : "bg-slate-100 text-slate-700"
                                                    }`}>
                                                      {m.role}
                                                    </span>
                                                  </td>
                                                  <td className="p-2 font-mono text-[10px] text-slate-600">{m.phone}</td>
                                                  <td className="p-2 text-[10px] text-slate-700">
                                                    {m.room !== "—" ? `${m.hostel} (${m.room})` : "None"}
                                                  </td>
                                                  <td className="p-2">
                                                    <button
                                                      type="button"
                                                      onClick={() => triggerNativeFileUpload(m)}
                                                      className={`px-2 py-0.5 rounded text-[9px] font-bold cursor-pointer border ${
                                                        m.documentsStatus === "VERIFIED"
                                                          ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                                                          : "bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200"
                                                      }`}
                                                      title="Upload 1 Combined PDF via system file selector"
                                                    >
                                                      {m.documentsStatus === "VERIFIED" ? "PDF ✓" : "1 PDF"}
                                                    </button>
                                                  </td>
                                                  <td className="p-2 text-right">
                                                    <button
                                                      type="button"
                                                      onClick={() => setSelectedParticipantForPass(m)}
                                                      className="px-2.5 py-1 bg-[#FF5A16] hover:bg-[#ea4e0e] text-white rounded text-[10px] font-bold uppercase cursor-pointer"
                                                    >
                                                      VIEW PASS
                                                    </button>
                                                  </td>
                                                </tr>
                                              ))}
                                            </tbody>
                                          </table>
                                        </div>
                                      </div>
                                    </td>
                                  </tr>
                                )}
                              </React.Fragment>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  /* CARDS GRID (existing layout from screenshot) */
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredTeams.map((team) => {
                      const isExpanded = expandedTeamId === team.institution;
                      const isAccredited = team.participants.every((p) => p.documentsStatus === "VERIFIED");
                      const verifiedCount = team.participants.filter((p) => p.documentsStatus === "VERIFIED").length;

                      return (
                        <div key={team.institution} className="bg-white border-2 border-slate-200 rounded-2xl p-5 shadow-xs space-y-4 hover:border-slate-300 transition-colors">
                          {/* Card Header with Clickable University Name and Status */}
                          <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
                            <button
                              type="button"
                              onClick={() => setSelectedTeamName(team.institution)}
                              className="text-left group cursor-pointer flex-1 focus:outline-none"
                              title="Click to view full team roster & official passes"
                            >
                              <div className="flex items-center gap-2">
                                <GraduationCap className="w-5 h-5 text-[#FF5A16] group-hover:scale-110 transition-transform shrink-0" />
                                <h3 className="font-rajdhani text-lg sm:text-xl font-black text-slate-900 uppercase group-hover:text-[#FF5A16] transition-colors">
                                  {team.institution}
                                </h3>
                              </div>
                              <p className="text-[11px] text-slate-500 font-sans mt-0.5 group-hover:text-slate-700">
                                Click university name to view roster, passes &amp; documents &rarr;
                              </p>
                            </button>

                            <div className="shrink-0">
                              {isAccredited ? (
                                <span className="px-2.5 py-1 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-full font-rajdhani text-xs font-black inline-flex items-center gap-1">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> ACCREDITED ✓
                                </span>
                              ) : (
                                <span className="px-2.5 py-1 bg-amber-50 border border-amber-300 text-amber-800 rounded-full font-rajdhani text-xs font-bold inline-flex items-center gap-1">
                                  <Clock className="w-3.5 h-3.5 text-amber-600" /> DOCS PENDING ({verifiedCount}/{team.participants.length})
                                </span>
                              )}
                            </div>
                          </div>

                          {/* SEPARATE VISUAL BUTTONS / BADGES: State, Member Count, Total Paid */}
                          <div className="flex flex-wrap items-center gap-2">
                            {/* State Badge */}
                            <span className="px-3 py-1 rounded-xl bg-orange-50 border border-orange-200 text-[#FF5A16] font-rajdhani text-xs font-black uppercase tracking-wider inline-flex items-center gap-1.5 shadow-2xs">
                              <span className="w-2 h-2 rounded-full bg-[#FF5A16]" />
                              {team.state}
                            </span>

                            {/* Registered Member Count Badge */}
                            <span className="px-3 py-1 rounded-xl bg-slate-100 border border-slate-300 text-slate-800 font-rajdhani text-xs font-black uppercase tracking-wider inline-flex items-center gap-1.5 shadow-2xs">
                              <Users className="w-3.5 h-3.5 text-slate-600" />
                              {team.participants.length} REGISTERED {team.participants.length === 1 ? "MEMBER" : "MEMBERS"}
                            </span>

                            {/* Total Paid Badge */}
                            <span className="px-3 py-1 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 font-rajdhani text-xs font-black uppercase tracking-wider inline-flex items-center gap-1 shadow-2xs">
                              ₹{team.totalPaid.toLocaleString()} PAID
                            </span>
                          </div>

                          {/* Action Controls: Open Modal Roster OR Inline Expand */}
                          <div className="flex items-center gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => setSelectedTeamName(team.institution)}
                              className="flex-1 py-2 px-3 bg-slate-900 hover:bg-[#FF5A16] text-white font-rajdhani text-xs font-black uppercase rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                            >
                              <Eye className="w-4 h-4" /> VIEW TEAM DETAILS &amp; PASSES ({team.participants.length})
                            </button>

                            <button
                              type="button"
                              onClick={() => setExpandedTeamId(isExpanded ? null : team.institution)}
                              className="py-2 px-3 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 rounded-xl text-xs font-rajdhani font-bold flex items-center gap-1 cursor-pointer transition-colors"
                              title="Toggle quick inline roster"
                            >
                              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                              {isExpanded ? "HIDE" : "ROSTER"}
                            </button>
                          </div>

                          {/* Quick Inline Roster (if toggled) */}
                          {isExpanded && (
                            <div className="pt-2 border-t border-slate-100 space-y-2">
                              <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs">
                                  <thead className="bg-slate-50 text-slate-700 font-rajdhani font-black uppercase border-b border-slate-200">
                                    <tr>
                                      <th className="p-2">MEMBER</th>
                                      <th className="p-2">ROLE</th>
                                      <th className="p-2">PHONE</th>
                                      <th className="p-2">ROOM</th>
                                      <th className="p-2">1 PDF</th>
                                      <th className="p-2 text-right">ACTION</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100 font-sans">
                                    {team.participants.map((m) => (
                                      <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="p-2">
                                          <div className="flex items-center gap-2">
                                            <div className="w-7 h-7 rounded-md overflow-hidden bg-slate-200 shrink-0 border border-slate-300">
                                              {m.photoUrl ? (
                                                <img src={m.photoUrl} alt={m.name} className="w-full h-full object-cover" />
                                              ) : (
                                                <User className="w-3.5 h-3.5 text-slate-400 m-auto mt-1" />
                                              )}
                                            </div>
                                            <div>
                                              <div className="font-bold text-slate-900 text-xs">{m.name}</div>
                                              <div className="font-mono text-[9px] text-[#FF5A16] font-bold">{m.playerId}</div>
                                            </div>
                                          </div>
                                        </td>
                                        <td className="p-2">
                                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                                            m.role === "MANAGER"
                                              ? "bg-purple-100 text-purple-800"
                                              : m.role === "CAPTAIN"
                                              ? "bg-orange-100 text-[#FF5A16]"
                                              : "bg-slate-100 text-slate-700"
                                          }`}>
                                            {m.role}
                                          </span>
                                        </td>
                                        <td className="p-2 font-mono text-[10px] text-slate-600">{m.phone}</td>
                                        <td className="p-2 text-[10px] text-slate-700">
                                          {m.room !== "—" ? `${m.hostel} (${m.room})` : "None"}
                                        </td>
                                        <td className="p-2">
                                          <button
                                            type="button"
                                            onClick={() => triggerNativeFileUpload(m)}
                                            className={`px-2 py-0.5 rounded text-[9px] font-bold cursor-pointer border ${
                                              m.documentsStatus === "VERIFIED"
                                                ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                                                : "bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200"
                                            }`}
                                            title="Upload 1 Combined PDF via system file selector"
                                          >
                                            {m.documentsStatus === "VERIFIED" ? "PDF ✓" : "1 PDF"}
                                          </button>
                                        </td>
                                        <td className="p-2 text-right">
                                          <button
                                            type="button"
                                            onClick={() => setSelectedParticipantForPass(m)}
                                            className="px-2.5 py-1 bg-[#FF5A16] hover:bg-[#ea4e0e] text-white rounded text-[10px] font-bold uppercase cursor-pointer"
                                          >
                                            VIEW PASS
                                          </button>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}

            {/* FULL PARTICIPANTS REGISTRY (MERGED TABLE VIEW) */}
            {onboardedViewMode === "REGISTRY" && (
              <div className="bg-white border-2 border-slate-200 rounded-2xl overflow-hidden shadow-sm space-y-4 p-5 sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="font-rajdhani text-xl font-black text-slate-900 uppercase">
                      REGISTERED PARTICIPANTS REGISTRY ({filteredParticipants.length})
                    </h3>
                    <p className="text-xs text-slate-500">Official tournament athlete &amp; manager accreditation database</p>
                  </div>
                </div>

                {loadingParticipants ? (
                  <div className="p-12 text-center text-slate-400 font-rajdhani text-sm">
                    LOADING PARTICIPANTS DATABASE...
                  </div>
                ) : filteredParticipants.length === 0 ? (
                  <div className="p-12 text-center text-slate-400 font-rajdhani text-sm">
                    NO PARTICIPANTS RECORDED YET. CLICK &quot;01. FULL TEAM REGISTRATION&quot; TO BEGIN.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-700 font-rajdhani font-black uppercase border-b border-slate-200">
                        <tr>
                          <th className="p-3">PHOTO</th>
                          <th className="p-3">PARTICIPANT NAME &amp; ID</th>
                          <th className="p-3">UNIVERSITY</th>
                          <th className="p-3">MOBILE</th>
                          <th className="p-3">ROLE</th>
                          <th className="p-3">STATUS</th>
                          <th className="p-3">1 COMBINED PDF</th>
                          <th className="p-3">PAYMENT</th>
                          <th className="p-3">ACCOMMODATION</th>
                          <th className="p-3 text-right">ACTIONS</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-sans">
                        {filteredParticipants.map((p) => (
                          <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                            <td className="p-3">
                              <div className="w-9 h-9 rounded-lg overflow-hidden bg-slate-200 border border-slate-300">
                                {p.photoUrl ? (
                                  <img src={p.photoUrl} alt={p.name} className="w-full h-full object-cover" />
                                ) : (
                                  <User className="w-5 h-5 text-slate-400 m-auto mt-2" />
                                )}
                              </div>
                            </td>
                            <td className="p-3">
                              <div className="font-bold text-slate-900">{p.name}</div>
                              <div className="font-mono text-[11px] text-[#FF5A16] font-bold">{p.playerId}</div>
                            </td>
                            <td className="p-3">
                              <div className="text-slate-800">{p.institution}</div>
                              <div className="text-[10px] text-slate-500">{p.state}</div>
                            </td>
                            <td className="p-3 text-slate-600 font-mono text-[11px]">{p.phone}</td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded-full font-rajdhani text-[10px] font-bold ${
                                p.role === "MANAGER"
                                  ? "bg-purple-100 text-purple-800 border border-purple-200 font-black"
                                  : p.role === "CAPTAIN"
                                  ? "bg-orange-100 text-[#FF5A16] border border-orange-200 font-black"
                                  : "bg-slate-100 text-slate-700"
                              }`}>
                                {p.role || "ATHLETE"}
                              </span>
                            </td>
                            <td className="p-3">
                              {p.documentsStatus === "VERIFIED" ? (
                                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 font-rajdhani text-[10px] font-black flex items-center gap-1 w-fit">
                                  <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" /> ACCREDITED ✓
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-300 font-rajdhani text-[10px] font-bold flex items-center gap-1 w-fit">
                                  <Clock className="w-2.5 h-2.5 text-amber-600" /> DOCS PENDING
                                </span>
                              )}
                            </td>
                            <td className="p-3">
                              <button
                                type="button"
                                onClick={() => triggerNativeFileUpload(p)}
                                className={`px-2.5 py-0.5 rounded-full font-rajdhani text-[10px] font-bold cursor-pointer hover:opacity-80 transition-opacity flex items-center gap-1 ${
                                  p.documentsStatus === "VERIFIED"
                                    ? "bg-emerald-50 text-emerald-800 border border-emerald-300 font-black"
                                    : "bg-blue-50 text-blue-800 border border-blue-300"
                                }`}
                                title="Click to upload 1 Combined PDF via system file selector"
                              >
                                <FileText className="w-3 h-3" />
                                {p.documentsStatus === "VERIFIED" ? "1 COMBINED PDF ✓" : "UPLOAD 1 PDF"}
                              </button>
                            </td>
                            <td className="p-3">
                              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 font-rajdhani text-[10px] font-black">
                                ₹{p.amountPaid || 0} ({p.paymentMethod || "PAID"})
                              </span>
                            </td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded-full font-rajdhani text-[10px] font-bold ${
                                p.accommodationStatus === "ALLOCATED"
                                  ? "bg-slate-100 text-slate-900 border border-slate-300"
                                  : "bg-amber-50 text-amber-800 border border-amber-300"
                              }`}>
                                {p.room !== "—" ? `${p.hostel} (${p.room})` : "NOT ALLOCATED"}
                              </span>
                            </td>
                            <td className="p-3 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => triggerNativeFileUpload(p)}
                                  className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white font-rajdhani text-[10px] font-bold uppercase rounded-md flex items-center gap-1 cursor-pointer"
                                  title="Upload 1 Combined PDF via system file selector"
                                >
                                  <FileText className="w-3 h-3" />
                                  1 PDF
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setSelectedParticipantForPass(p)}
                                  className="px-2.5 py-1 bg-[#FF5A16] hover:bg-[#ea4e0e] text-white font-rajdhani text-[10px] font-bold uppercase rounded-md cursor-pointer flex items-center gap-1 shadow-2xs"
                                  title="View Official Accreditation Pass"
                                >
                                  <Eye className="w-3 h-3" /> VIEW PASS
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

      </main>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* MODAL 0: DIRECT DOCUMENT UPLOAD MODAL (1 COMBINED PDF) */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {docUploadParticipant && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
            <div className="bg-white border-2 border-[#FF5A16] rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#FF5A16]" />
                  <h3 className="font-rajdhani text-base font-black text-slate-900 uppercase">
                    UPLOAD 1 COMBINED PDF (VERIFICATION DOSSIER)
                  </h3>
                </div>
                <button type="button" onClick={() => setDocUploadParticipant(null)} className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Participant Info Banner */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm">{docUploadParticipant.name}</span>
                  <span className={`px-2 py-0.5 rounded font-rajdhani text-[10px] font-black uppercase ${
                    docUploadParticipant.role === "MANAGER"
                      ? "bg-purple-100 text-purple-800"
                      : "bg-orange-100 text-[#FF5A16]"
                  }`}>
                    {docUploadParticipant.role || "ATHLETE"}
                  </span>
                </div>
                <div className="font-mono text-[11px] text-[#FF5A16]">{docUploadParticipant.playerId} &bull; {docUploadParticipant.institution}</div>
              </div>

              {/* Role Dossier Guidance (Tab 01 aligned) */}
              <div className="p-3 bg-orange-50/70 border border-orange-200 rounded-xl space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-rajdhani font-black text-slate-900 uppercase">
                  <FileText className="w-3.5 h-3.5 text-[#FF5A16]" />
                  {docUploadParticipant.role === "MANAGER"
                    ? "MANAGER DOCUMENTS (1 COMBINED PDF: ID CARD, APPOINTMENT ORDER)"
                    : "ATHLETE DOCUMENTS (1 COMBINED PDF: ID CARD, SSLC, PUC / ELIGIBILITY)"}
                </div>
                <p className="text-[11px] text-slate-600 font-sans leading-snug">
                  {docUploadParticipant.role === "MANAGER"
                    ? "Upload a single consolidated PDF dossier containing University ID card and official appointment/deputation order."
                    : "Upload a single consolidated PDF dossier containing University ID card, SSLC/10th marks card, and PUC/12th marks card."}
                </p>
              </div>

              {/* Existing Attached Documents (if any) */}
              {docUploadParticipant.documents && docUploadParticipant.documents.length > 0 && (
                <div className={`p-3 rounded-xl space-y-2 border ${
                  docUploadParticipant.documentsStatus === "VERIFIED"
                    ? "bg-emerald-50/70 border-emerald-300"
                    : "bg-amber-50/70 border-amber-300"
                }`}>
                  <div className="text-[11px] font-rajdhani font-black uppercase tracking-wide flex items-center justify-between">
                    <span className="flex items-center gap-1 text-slate-800">
                      <FileCheck className="w-3.5 h-3.5 text-[#FF5A16]" />
                      ATTACHED DOSSIER ({docUploadParticipant.documents.length})
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                      docUploadParticipant.documentsStatus === "VERIFIED"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-amber-100 text-amber-800"
                    }`}>
                      {docUploadParticipant.documentsStatus === "VERIFIED" ? "VERIFIED ✓" : "PENDING VERIFICATION"}
                    </span>
                  </div>

                  <div className="space-y-1 max-h-24 overflow-y-auto">
                    {docUploadParticipant.documents.map((d) => (
                      <div key={d.id} className="flex items-center justify-between text-[11px] font-mono text-slate-700 bg-white/80 px-2.5 py-1 rounded-lg border border-slate-200">
                        <span className="truncate max-w-[240px]" title={d.fileName}>{d.fileName}</span>
                        <span className={`text-[10px] font-bold shrink-0 ${d.status === "VERIFIED" ? "text-emerald-700" : "text-amber-700"}`}>
                          {d.status}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* If documents uploaded but not verified, show direct Verify & Issue QR button */}
                  {docUploadParticipant.documentsStatus !== "VERIFIED" && (
                    <button
                      type="button"
                      onClick={() => handleVerifyDocumentsForParticipant(docUploadParticipant.id)}
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-rajdhani text-xs font-black uppercase rounded-lg flex items-center justify-center gap-1.5 shadow-xs cursor-pointer transition-colors"
                    >
                      <Check className="w-3.5 h-3.5" /> VERIFY DOSSIER &amp; GENERATE QR PASS
                    </button>
                  )}
                </div>
              )}

              {/* File Upload Zone (Combined PDF Only) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block font-rajdhani text-xs font-bold text-slate-800 uppercase tracking-wider">
                    {docUploadParticipant.documents && docUploadParticipant.documents.length > 0 ? "REPLACE / RE-UPLOAD 1 COMBINED PDF *" : "SELECT 1 COMBINED PDF DOSSIER *"}
                  </label>
                  <label className="flex items-center gap-1.5 text-[11px] font-mono text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoVerifyDossier}
                      onChange={(e) => setAutoVerifyDossier(e.target.checked)}
                      className="rounded text-[#FF5A16] focus:ring-[#FF5A16]"
                    />
                    <span>Verify &amp; Issue QR on upload</span>
                  </label>
                </div>
                <label className="w-full p-6 border-2 border-dashed border-[#FF5A16]/60 hover:border-[#FF5A16] rounded-xl flex flex-col items-center justify-center gap-2.5 cursor-pointer bg-orange-50/30 hover:bg-orange-50/70 transition-colors shadow-2xs">
                  {uploadingDoc ? (
                    <RefreshCw className="w-7 h-7 text-[#FF5A16] animate-spin" />
                  ) : (
                    <Upload className="w-7 h-7 text-[#FF5A16]" />
                  )}
                  <span className="font-rajdhani text-sm font-black uppercase text-slate-800 tracking-wider">
                    {uploadingDoc ? "COMPRESSING & UPLOADING PDF..." : autoVerifyDossier ? "UPLOAD & VERIFY 1 COMBINED PDF" : "UPLOAD 1 COMBINED PDF"}
                  </span>
                  <span className="text-[11px] text-slate-500 font-sans text-center">
                    Accepts <strong>.pdf</strong> only &bull; Single consolidated PDF dossier &bull; Auto-compressed before upload
                  </span>
                  <input
                    type="file"
                    accept=".pdf,application/pdf"
                    disabled={uploadingDoc}
                    className="hidden"
                    onChange={handleUploadDocumentForParticipant}
                  />
                </label>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* MODAL 1: LIVE CAMERA CAPTURE */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {isCameraActive && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
            <div className="bg-white border-2 border-[#FF5A16] rounded-2xl max-w-lg w-full p-5 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="font-rajdhani text-sm font-black text-slate-900 uppercase tracking-wider">
                  MANDATORY PHOTO CAPTURE {activePhotoTarget === "MANAGER" ? "(TEAM MANAGER)" : typeof activePhotoTarget === "number" ? `(ATHLETE 0${activePhotoTarget + 1})` : ""}
                </span>
                <button type="button" onClick={stopCamera} className="p-1 text-slate-400 hover:text-slate-700">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {cameraError ? (
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs">
                  {cameraError}
                </div>
              ) : cameraPreview ? (
                <div className="aspect-video bg-slate-900 rounded-xl overflow-hidden border border-slate-200">
                  <img src={cameraPreview} alt="Preview" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="aspect-video bg-slate-900 rounded-xl overflow-hidden relative border border-slate-200">
                  <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                </div>
              )}

              <div className="flex gap-2">
                {cameraPreview ? (
                  <>
                    <button
                      type="button"
                      onClick={applyCapturedPhoto}
                      className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-rajdhani text-xs font-bold uppercase rounded-xl shadow-xs cursor-pointer"
                    >
                      USE THIS PHOTO ✓
                    </button>
                    <button
                      type="button"
                      onClick={() => setCameraPreview(null)}
                      className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-rajdhani text-xs font-bold uppercase rounded-xl cursor-pointer"
                    >
                      RETAKE
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={capturePhoto}
                    className="w-full py-2.5 bg-[#FF5A16] hover:bg-[#ea4e0e] text-white font-rajdhani text-xs font-bold uppercase rounded-xl flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                  >
                    <Camera className="w-4 h-4" /> SNAP PHOTO
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* MODAL 2: PARTICIPANT ACCREDITATION PASS */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {selectedParticipantForPass && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border-2 border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="font-rajdhani text-xs font-bold text-slate-500 uppercase tracking-widest">
                  OFFICIAL TOURNAMENT PASS
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedParticipantForPass(null)}
                  className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* ID Badge Pass Card (CLEAN LIGHT THEME) */}
              <div
                id="accreditation-pass-card"
                className="bg-white text-[#0B1528] rounded-2xl p-6 border-2 border-[#0B1528] shadow-lg text-center space-y-4 relative overflow-hidden"
              >
                {/* Official Accent Header Bar */}
                <div className="border-b-2 border-[#FF5A16] pb-3 space-y-1">
                  <div className="font-rajdhani text-xs text-[#FF5A16] font-black uppercase tracking-wider">
                    SOUTH ZONE WOMEN&apos;S BADMINTON CHAMPIONSHIP 2026
                  </div>
                  <div className="text-[11px] text-slate-600 font-mono font-medium">
                    KLE Technological University, Hubballi &bull; Karnataka
                  </div>
                  <div className="inline-block px-2.5 py-0.5 rounded-full bg-slate-100 text-[#0B1528] font-rajdhani text-[10px] font-black uppercase tracking-widest mt-1">
                    OFFICIAL ACCREDITATION PASS
                  </div>
                </div>

                {/* Photo */}
                <div className="w-28 h-28 mx-auto rounded-xl overflow-hidden border-2 border-slate-300 shadow-sm bg-slate-100">
                  {selectedParticipantForPass.photoUrl ? (
                    <img
                      src={selectedParticipantForPass.photoUrl}
                      alt={selectedParticipantForPass.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-12 h-12 text-slate-400 m-auto mt-8" />
                  )}
                </div>

                {/* Details */}
                <div className="space-y-1">
                  <h3 className="font-rajdhani text-2xl font-black uppercase tracking-tight text-[#0B1528]">
                    {selectedParticipantForPass.name}
                  </h3>
                  <div>
                    <span className="font-mono text-xs text-[#FF5A16] font-bold px-3 py-1 bg-orange-50 border border-orange-200 rounded-full inline-block">
                      {selectedParticipantForPass.playerId}
                    </span>
                  </div>
                  <div className="text-sm text-[#0B1528] font-bold uppercase mt-1">
                    {selectedParticipantForPass.institution}
                  </div>
                  <div className="text-xs text-slate-600 font-rajdhani font-bold uppercase">
                    {selectedParticipantForPass.state}
                  </div>

                  {/* Role Badge */}
                  <div className="pt-1">
                    <span className={`inline-block px-3 py-0.5 rounded-full font-rajdhani text-xs font-black uppercase tracking-wider ${
                      selectedParticipantForPass.role === "MANAGER"
                        ? "bg-purple-100 text-purple-900 border border-purple-200"
                        : selectedParticipantForPass.role === "CAPTAIN"
                        ? "bg-orange-100 text-[#FF5A16] border border-orange-200"
                        : "bg-blue-50 text-blue-900 border border-blue-200"
                    }`}>
                      {selectedParticipantForPass.role === "MANAGER"
                        ? "ACCREDITED TEAM MANAGER"
                        : selectedParticipantForPass.role === "CAPTAIN"
                        ? "ACCREDITED ATHLETE (CAPTAIN)"
                        : "ACCREDITED ATHLETE"}
                    </span>
                  </div>

                  {/* Accommodation Info */}
                  {selectedParticipantForPass.room && selectedParticipantForPass.room !== "—" && (
                    <div className="text-[10px] font-mono text-slate-700 font-bold bg-slate-50 rounded-lg py-1 px-2 border border-slate-200 mt-1 inline-block">
                      {selectedParticipantForPass.hostel} &bull; Room {selectedParticipantForPass.room} &bull; Bed {selectedParticipantForPass.bed}
                    </div>
                  )}
                </div>

                {/* Crisp Scannable Pass QR */}
                <div className="pt-1 flex flex-col items-center justify-center">
                  <div className="bg-white p-3 rounded-2xl border-2 border-slate-300 inline-block shadow-sm">
                    <PassQrSvg
                      value={selectedParticipantForPass.qrToken || selectedParticipantForPass.playerId}
                      size={140}
                    />
                  </div>

                  <div className="text-[10px] font-mono font-bold tracking-wider uppercase mt-2">
                    {selectedParticipantForPass.documentsStatus === "VERIFIED" ? (
                      <span className="text-emerald-700 flex items-center gap-1 justify-center">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        ACCREDITATION VERIFIED &bull; DESK 01
                      </span>
                    ) : (
                      <span className="text-amber-700 flex items-center gap-1 justify-center">
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        PROVISIONAL REGISTRATION &bull; VERIFY AT DESK
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex-1 py-2.5 bg-[#FF5A16] hover:bg-[#ea4e0e] text-white font-rajdhani text-xs font-black uppercase rounded-xl flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Printer className="w-4 h-4" /> PRINT BADGE
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedParticipantForPass(null)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-rajdhani text-xs font-bold uppercase rounded-xl cursor-pointer"
                >
                  CLOSE
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* TEAM DETAILS MODAL (DEDICATED ROSTER VIEW OPENED ON CLICK) */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {selectedTeamDetail && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border-2 border-slate-200 rounded-2xl max-w-4xl w-full p-6 shadow-2xl space-y-5 max-h-[90vh] flex flex-col"
            >
              {/* Header */}
              <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-6 h-6 text-[#FF5A16]" />
                    <h3 className="font-rajdhani text-2xl font-black text-slate-900 uppercase">
                      {selectedTeamDetail.institution}
                    </h3>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <span className="px-3 py-0.5 rounded-full bg-orange-100 border border-orange-200 text-[#FF5A16] font-rajdhani text-xs font-black uppercase">
                      {selectedTeamDetail.state}
                    </span>
                    <span className="px-3 py-0.5 rounded-full bg-slate-100 border border-slate-300 text-slate-800 font-rajdhani text-xs font-black uppercase">
                      {selectedTeamDetail.participants.length} Registered Members
                    </span>
                    <span className="px-3 py-0.5 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-800 font-rajdhani text-xs font-black uppercase">
                      Total Paid: ₹{selectedTeamDetail.totalPaid.toLocaleString()}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedTeamName(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Members Roster Table */}
              <div className="overflow-y-auto flex-1 border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-700 font-rajdhani font-black uppercase border-b border-slate-200 sticky top-0 z-10">
                    <tr>
                      <th className="p-3">PHOTO</th>
                      <th className="p-3">NAME &amp; ID</th>
                      <th className="p-3">ROLE</th>
                      <th className="p-3">PHONE</th>
                      <th className="p-3">ACCOMMODATION</th>
                      <th className="p-3">1 PDF DOSSIER</th>
                      <th className="p-3 text-right">ACTION</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-sans">
                    {selectedTeamDetail.participants.map((m) => (
                      <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3">
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-200 border border-slate-300 shrink-0">
                            {m.photoUrl ? (
                              <img src={m.photoUrl} alt={m.name} className="w-full h-full object-cover" />
                            ) : (
                              <User className="w-5 h-5 text-slate-400 m-auto mt-2.5" />
                            )}
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="font-bold text-slate-900">{m.name}</div>
                          <div className="font-mono text-[10px] text-[#FF5A16] font-bold">{m.playerId}</div>
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded font-rajdhani text-[10px] font-bold ${
                            m.role === "MANAGER"
                              ? "bg-purple-100 text-purple-800 border border-purple-200 font-black"
                              : m.role === "CAPTAIN"
                              ? "bg-orange-100 text-[#FF5A16] border border-orange-200 font-black"
                              : "bg-slate-100 text-slate-700"
                          }`}>
                            {m.role}
                          </span>
                        </td>
                        <td className="p-3 font-mono text-[11px] text-slate-600">{m.phone}</td>
                        <td className="p-3 text-slate-700">
                          {m.room !== "—" ? (
                            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 border border-slate-300 font-rajdhani text-[10px] font-bold">
                              {m.hostel} ({m.room})
                            </span>
                          ) : (
                            <span className="text-slate-400 italic">None</span>
                          )}
                        </td>
                        <td className="p-3">
                          <button
                            type="button"
                            onClick={() => triggerNativeFileUpload(m)}
                            className={`px-2.5 py-1 rounded-lg font-rajdhani text-xs font-bold uppercase flex items-center gap-1 cursor-pointer border transition-colors ${
                              m.documentsStatus === "VERIFIED"
                                ? "bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100 font-black"
                                : "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                            }`}
                            title="Click to select 1 Combined PDF from your computer"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            {m.documentsStatus === "VERIFIED" ? "PDF ✓" : "1 PDF (SELECT)"}
                          </button>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            type="button"
                            onClick={() => setSelectedParticipantForPass(m)}
                            className="px-3 py-1.5 bg-[#FF5A16] hover:bg-[#ea4e0e] text-white font-rajdhani text-xs font-black uppercase rounded-lg shadow-xs cursor-pointer inline-flex items-center gap-1"
                          >
                            <Eye className="w-3.5 h-3.5" /> VIEW PASS
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <span className="text-xs text-slate-500 font-mono">
                  Showing {selectedTeamDetail.participants.length} registered contingent members
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedTeamName(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-rajdhani text-xs font-bold uppercase rounded-xl cursor-pointer"
                >
                  CLOSE
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Hidden Native File Input for direct document uploads */}
      <input
        type="file"
        ref={fileInputRef}
        accept=".pdf,application/pdf"
        className="hidden"
        onChange={handleNativeFileSelected}
      />

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* MODAL 4: FIND DETAILS SEARCH */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {isFindDetailsOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
            <div className="bg-white border-2 border-slate-200 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Search className="w-5 h-5 text-[#FF5A16]" />
                  <h3 className="font-rajdhani text-lg font-black text-slate-900 uppercase">
                    FIND PARTICIPANT / REGISTRATION DETAILS
                  </h3>
                </div>
                <button type="button" onClick={() => setIsFindDetailsOpen(false)} className="p-1 text-slate-400 hover:text-slate-700">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div>
                <input
                  type="text"
                  autoFocus
                  placeholder="Search by Athlete Name, Participant ID, Mobile, Email, or University..."
                  value={findSearchQuery}
                  onChange={(e) => setFindSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 focus:bg-white focus:border-[#FF5A16] text-slate-900 rounded-xl px-4 py-3 text-xs transition-colors focus:outline-none font-sans"
                />
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                {searchResults.length === 0 ? (
                  <div className="py-8 text-center text-slate-400 text-xs">
                    {findSearchQuery.trim() ? "No matching records found." : "Type above to search existing registrations."}
                  </div>
                ) : (
                  searchResults.map((res) => (
                    <div key={res.id} className="py-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg overflow-hidden bg-slate-200 border border-slate-300 shrink-0">
                          {res.photoUrl ? (
                            <img src={res.photoUrl} alt={res.name} className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-5 h-5 text-slate-400 m-auto mt-2" />
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 text-xs">{res.name} ({res.role})</div>
                          <div className="font-mono text-[10px] text-[#FF5A16] font-bold">{res.playerId} &bull; {res.institution}</div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedParticipantForPass(res);
                          setIsFindDetailsOpen(false);
                        }}
                        className="px-3 py-1.5 bg-[#FF5A16] text-white font-rajdhani text-xs font-bold uppercase rounded-lg shadow-xs cursor-pointer"
                      >
                        OPEN RECORD
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* MODAL 5: VIEW ALL ROOMS INVENTORY */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {isViewAllRoomsOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
            <div className="bg-white border-2 border-slate-200 rounded-2xl max-w-3xl w-full p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Bed className="w-5 h-5 text-[#FF5A16]" />
                  <h3 className="font-rajdhani text-lg font-black text-slate-900 uppercase">
                    ALL ACCOMMODATION ROOMS &amp; BED TOPOLOGY
                  </h3>
                </div>
                <button type="button" onClick={() => setIsViewAllRoomsOpen(false)} className="p-1 text-slate-400 hover:text-slate-700">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="overflow-y-auto flex-1 space-y-4 pr-1">
                {rooms.map((room) => {
                  const availCount = room.beds?.filter((b) => b.status === "AVAILABLE").length || 0;
                  return (
                    <div key={room.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-rajdhani font-black text-sm text-slate-900">
                            {room.hostelName} &bull; Room {room.roomNumber}
                          </span>
                          <span className="text-xs text-slate-500 ml-2">({room.floorNumber})</span>
                        </div>
                        <span className={`font-rajdhani text-xs font-bold px-2.5 py-0.5 rounded-full ${availCount > 0 ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "bg-rose-50 text-rose-800 border border-rose-200"
                          }`}>
                          {availCount} / {room.capacity || 5} AVAILABLE
                        </span>
                      </div>
                      <div className="grid grid-cols-5 gap-2 pt-1">
                        {room.beds?.map((b) => (
                          <div
                            key={b.id}
                            className={`p-2 rounded-lg border text-center font-mono text-[11px] ${b.status === "AVAILABLE"
                              ? "bg-emerald-100 border-emerald-300 text-emerald-900 font-bold"
                              : "bg-slate-200 border-slate-300 text-slate-500"
                              }`}
                          >
                            <div>{b.bedNumber}</div>
                            <div>{b.status}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
