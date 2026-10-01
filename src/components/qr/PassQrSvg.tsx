"use client";

import React, { useEffect, useState } from "react";
import QRCode from "qrcode";
import { QrCode as QrIcon } from "lucide-react";

interface PassQrSvgProps {
  value: string;
  size?: number;
}

export const PassQrSvg: React.FC<PassQrSvgProps> = ({ value, size = 160 }) => {
  const [svgContent, setSvgContent] = useState<string>("");

  useEffect(() => {
    if (!value) return;
    QRCode.toString(
      value,
      {
        type: "svg",
        margin: 1,
        color: {
          dark: "#0B1528",
          light: "#FFFFFF",
        },
        errorCorrectionLevel: "M",
      },
      (err, str) => {
        if (!err && str) {
          setSvgContent(str);
        } else {
          console.error("Pass QR generation error:", err);
        }
      }
    );
  }, [value]);

  return (
    <div
      className="flex items-center justify-center bg-white"
      style={{ width: size, height: size }}
    >
      {svgContent ? (
        <div
          className="w-full h-full flex items-center justify-center [&>svg]:w-full [&>svg]:h-full"
          dangerouslySetInnerHTML={{ __html: svgContent }}
        />
      ) : (
        <div className="flex flex-col items-center justify-center text-slate-400 gap-1">
          <QrIcon className="w-8 h-8 animate-pulse text-slate-300" />
          <span className="text-[10px] font-mono">GENERATING...</span>
        </div>
      )}
    </div>
  );
};
