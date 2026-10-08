"use client";

import React, { useEffect, useState, useRef } from "react";
import QRCode from "qrcode";
import { Download, Printer, CheckCircle2, Shield, QrCode } from "lucide-react";

export interface PortalQrCodeProps {
  value: string; // The opaque URL or secure token
  title?: string;
  subtitle?: string;
  name?: string;
  participantName?: string;
  institution?: string;
  referenceId?: string;
  referenceCode?: string;
  roleOrType?: string;
  designation?: string;
  qrType?: "PARTICIPANT" | "TEAM" | string;
  size?: number;
  showActions?: boolean;
  className?: string;
}

/**
 * Authentic, standards-compliant SVG QR pass generator & card renderer.
 * Produces high-resolution, scalable, printable SVG QR codes that scan natively on all mobile devices.
 */
export const PortalQrCode: React.FC<PortalQrCodeProps> = ({
  value,
  title = "SOUTH ZONE WOMEN'S BADMINTON CHAMPIONSHIP 2026",
  subtitle,
  name,
  participantName,
  institution = "Accredited University / Institution",
  referenceId,
  referenceCode,
  roleOrType,
  designation,
  qrType = "PARTICIPANT",
  size = 200,
  showActions = true,
  className = "",
}) => {
  const rawRole = (designation || roleOrType || subtitle || qrType || "").toUpperCase();
  const isManager = rawRole.includes("MANAGER");
  const isCaptain = rawRole.includes("CAPTAIN");

  const displayDesignation = isManager
    ? "MANAGER"
    : isCaptain
    ? "TEAM CAPTAIN"
    : "ATHLETE";

  const resolvedName = participantName || name || (isManager ? "Team Manager" : isCaptain ? "Team Captain" : "Athlete");
  const displayUniversity = institution || "Accredited University / Institution";
  const displayRef = referenceCode || referenceId || "SZ-2026";
  const displayRoleHeader = qrType === "TEAM" ? "OFFICIAL TEAM QR PASS" : "OFFICIAL ACCREDITATION PASS";
  const [svgContent, setSvgContent] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const cardRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!value) return;
    QRCode.toString(
      value,
      {
        type: "svg",
        margin: 1,
        color: {
          dark: "#050914",
          light: "#FFFFFF",
        },
        errorCorrectionLevel: "M",
      },
      (err, string) => {
        if (!err && string) {
          setSvgContent(string);
        } else {
          console.error("QR generation error:", err);
        }
      }
    );
  }, [value]);

  const handleDownload = () => {
    if (!svgContent) return;
    const blob = new Blob([svgContent], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `SZWBT2026_QR_${displayRef || "PASS"}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${displayRef} - Official Accreditation QR Pass</title>
          <style>
            @page { size: A6 portrait; margin: 10mm; }
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; text-align: center; padding: 20px; color: #0F172A; }
            .card { border: 2px solid #0F172A; padding: 20px; max-width: 320px; margin: 0 auto; border-radius: 12px; }
            .title { font-size: 11px; font-weight: bold; letter-spacing: 1px; color: #FF5500; margin-bottom: 4px; }
            .sub { font-size: 9px; color: #475569; margin-bottom: 12px; font-family: monospace; font-weight: bold; }
            .inst { font-size: 12px; font-weight: 800; color: #0F172A; margin-bottom: 6px; text-transform: uppercase; }
            .role { display: inline-block; padding: 3px 12px; font-size: 11px; font-weight: 900; border-radius: 9999px; text-transform: uppercase; margin-bottom: 6px; ${
              isManager
                ? "background: #F3E8FF; color: #581C87; border: 1px solid #D8B4FE;"
                : isCaptain
                ? "background: #FFEDD5; color: #C2410C; border: 1px solid #FDBA74;"
                : "background: #DBEAFE; color: #1E40AF; border: 1px solid #93C5FD;"
            }}
            .name { font-size: 18px; font-weight: 900; margin-bottom: 6px; text-transform: uppercase; color: #0B1528; }
            .ref { font-family: monospace; font-size: 12px; font-weight: bold; background: #FFF7ED; padding: 3px 10px; display: inline-block; margin-bottom: 12px; border: 1px solid #FFEDD5; border-radius: 9999px; color: #FF5500; }
            .qr-container svg { width: 180px; height: 180px; }
            .footer { font-size: 8px; color: #64748B; margin-top: 14px; border-top: 1px dashed #CBD5E1; padding-top: 8px; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="title">${title}</div>
            <div class="sub">${displayRoleHeader}</div>
            <div class="inst">${displayUniversity}</div>
            <div class="role">${displayDesignation}</div>
            <div class="name">${resolvedName}</div>
            <div class="ref">${displayRef}</div>
            <div class="qr-container">${svgContent}</div>
            <div class="footer">OFFICIAL ACCREDITATION PASS • DR. PRABHAKAR KORE SPORTS ARENA • HUBBALLI</div>
          </div>
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div
      ref={cardRef}
      className={`bg-white border-2 border-black p-5 shadow-[4px_4px_0px_#000] text-black flex flex-col items-center select-none ${className}`}
      style={{ maxWidth: Math.max(size + 60, 280) }}
    >
      {/* Official Header */}
      <div className="w-full text-center pb-2.5 border-b border-gray-200 mb-3">
        <p className="font-pixel text-[8.5px] text-[#FF5500] font-black uppercase tracking-wider leading-tight">
          {title}
        </p>
        <p className="font-pixel text-[7.5px] text-gray-500 uppercase tracking-widest mt-0.5">
          {displayRoleHeader}
        </p>
      </div>

      {/* Participant Identity & Hierarchy: University Name -> Designation -> Name below designation */}
      <div className="w-full text-center mb-3 space-y-1">
        {/* 1. University's Name */}
        <p className="font-rajdhani text-xs font-black text-slate-800 uppercase tracking-wide px-1 leading-snug">
          {displayUniversity}
        </p>

        {/* 2. Designation ('ATHLETE', 'TEAM CAPTAIN', or 'MANAGER') */}
        <div className="py-0.5">
          <span className={`inline-block px-2.5 py-0.5 rounded-full font-rajdhani text-[10px] font-black uppercase tracking-wider ${
            isManager
              ? "bg-purple-100 text-purple-900 border border-purple-300"
              : isCaptain
              ? "bg-orange-100 text-[#FF5A16] border border-orange-300"
              : "bg-blue-100 text-blue-900 border border-blue-300"
          }`}>
            {displayDesignation}
          </span>
        </div>

        {/* 3. Their Name below their designation */}
        <h4 className="font-rajdhani text-base sm:text-lg font-black text-[#0B1528] uppercase leading-tight pt-0.5">
          {resolvedName}
        </h4>

        {/* Reference / ID */}
        <div className="inline-block mt-0.5 px-2 py-0.5 bg-gray-100 border border-gray-300 font-mono text-[10px] font-bold text-[#FF5500] rounded">
          {displayRef}
        </div>
      </div>

      {/* SVG QR Code Rendering */}
      <div
        className="p-2.5 bg-white border border-gray-300 flex items-center justify-center my-1"
        style={{ width: size, height: size }}
      >
        {svgContent ? (
          <div
            className="w-full h-full flex items-center justify-center [&>svg]:w-full [&>svg]:h-full"
            dangerouslySetInnerHTML={{ __html: svgContent }}
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-gray-400 gap-1">
            <QrCode className="w-10 h-10 animate-pulse text-gray-300" />
            <span className="text-[10px] font-pixel">GENERATING...</span>
          </div>
        )}
      </div>

      {/* Security Note */}
      <p className="text-[7.5px] text-gray-400 text-center uppercase tracking-wider mt-2">
        SCAN VIA OFFICIAL DESK TERMINALS • VERIFIED SECURE TOKEN
      </p>

      {/* Action Buttons: DOWNLOAD / PRINT */}
      {showActions && (
        <div className="w-full flex items-center justify-center gap-2 mt-4 pt-3 border-t border-gray-200">
          <button
            onClick={handleDownload}
            type="button"
            className="flex-1 py-2 px-3 bg-[#0F172A] hover:bg-black text-white font-pixel text-[9px] font-bold tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-black shadow-[2px_2px_0px_#888]"
          >
            <Download className="w-3.5 h-3.5 text-[#18D8D0]" />
            <span>DOWNLOAD</span>
          </button>

          <button
            onClick={handlePrint}
            type="button"
            className="flex-1 py-2 px-3 bg-[#FF5500] hover:bg-[#d94e16] text-black font-pixel text-[9px] font-bold tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-black shadow-[2px_2px_0px_#000]"
          >
            <Printer className="w-3.5 h-3.5 text-black" />
            <span>PRINT</span>
          </button>
        </div>
      )}
    </div>
  );
};
