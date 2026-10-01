export interface ImageCompressOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0.1 to 1.0 (default: 0.8)
  mimeType?: "image/jpeg" | "image/webp";
}

export interface PdfCompressOptions {
  maxImageDimension?: number;
  imageQuality?: number; // 0.1 to 1.0 (default: 0.75)
}

export interface CompressResult {
  dataUrl: string;
  originalSize: number;
  compressedSize: number;
  savedBytes: number;
  savedPercent: number;
  originalSizeFormatted: string;
  compressedSizeFormatted: string;
  summary: string;
  isCompressed: boolean;
  blob?: Blob;
  width?: number;
  height?: number;
}

export interface UniversalCompressResult extends CompressResult {
  fileName: string;
  fileType: string;
}

/**
 * Formats byte count to a clean human-readable string (e.g. "124 KB", "1.45 MB").
 */
export function formatBytes(bytes: number): string {
  if (isNaN(bytes) || bytes <= 0) return "0 KB";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) {
    const kb = (bytes / 1024).toFixed(0);
    return `${kb} KB`;
  }
  const mb = (bytes / (1024 * 1024)).toFixed(2);
  return `${mb} MB`;
}

/**
 * Calculates byte size of a base64 Data URL.
 */
export function getDataUrlByteLength(dataUrl: string): number {
  if (!dataUrl) return 0;
  const commaIdx = dataUrl.indexOf(",");
  const base64Str = commaIdx !== -1 ? dataUrl.slice(commaIdx + 1) : dataUrl;
  const padding = base64Str.endsWith("==") ? 2 : base64Str.endsWith("=") ? 1 : 0;
  return Math.max(0, Math.floor((base64Str.length * 3) / 4) - padding);
}

/**
 * Converts a base64 Data URL to a Uint8Array.
 */
export function dataUrlToUint8Array(dataUrl: string): Uint8Array {
  const commaIdx = dataUrl.indexOf(",");
  const base64Str = commaIdx !== -1 ? dataUrl.slice(commaIdx + 1) : dataUrl;
  if (typeof atob !== "undefined") {
    const binary = atob(base64Str);
    const len = binary.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  }
  // Node.js fallback
  return new Uint8Array(Buffer.from(base64Str, "base64"));
}

/**
 * Converts a Uint8Array to a base64 Data URL.
 */
export function uint8ArrayToDataUrl(bytes: Uint8Array, mimeType: string): string {
  if (typeof btoa !== "undefined") {
    let binary = "";
    const len = bytes.byteLength;
    // Process in chunks to prevent Maximum Call Stack Size Exceeded
    const chunkSize = 8192;
    for (let i = 0; i < len; i += chunkSize) {
      const chunk = bytes.subarray(i, Math.min(i + chunkSize, len));
      binary += String.fromCharCode.apply(null, Array.from(chunk));
    }
    return `data:${mimeType};base64,${btoa(binary)}`;
  }
  // Node.js fallback
  return `data:${mimeType};base64,${Buffer.from(bytes).toString("base64")}`;
}

/**
 * Compresses an image client-side using HTML5 Canvas.
 * Supports File, Blob, or base64 DataURL inputs.
 */
export async function compressImage(
  source: File | Blob | string,
  options: ImageCompressOptions = {}
): Promise<CompressResult> {
  const {
    maxWidth = 1200,
    maxHeight = 1200,
    quality = 0.8,
    mimeType = "image/jpeg",
  } = options;

  let originalSize = 0;
  let sourceDataUrl = "";

  if (typeof source === "string") {
    sourceDataUrl = source;
    originalSize = getDataUrlByteLength(source);
  } else {
    originalSize = source.size;
    sourceDataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(source);
    });
  }

  // If running in SSR or Node without browser DOM
  if (typeof window === "undefined" || typeof document === "undefined") {
    return {
      dataUrl: sourceDataUrl,
      originalSize,
      compressedSize: originalSize,
      savedBytes: 0,
      savedPercent: 0,
      originalSizeFormatted: formatBytes(originalSize),
      compressedSizeFormatted: formatBytes(originalSize),
      summary: `${formatBytes(originalSize)} (original)`,
      isCompressed: false,
    };
  }

  return new Promise<CompressResult>((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      let width = img.naturalWidth || img.width;
      let height = img.naturalHeight || img.height;

      // Proportional downscale if exceeding bounds
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve({
          dataUrl: sourceDataUrl,
          originalSize,
          compressedSize: originalSize,
          savedBytes: 0,
          savedPercent: 0,
          originalSizeFormatted: formatBytes(originalSize),
          compressedSizeFormatted: formatBytes(originalSize),
          summary: `${formatBytes(originalSize)} (original)`,
          isCompressed: false,
        });
        return;
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      // Fill background with white in case of transparent PNG/WebP converted to JPEG
      if (mimeType === "image/jpeg") {
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, width, height);
      }

      ctx.drawImage(img, 0, 0, width, height);

      const compressedDataUrl = canvas.toDataURL(mimeType, quality);
      const compressedSize = getDataUrlByteLength(compressedDataUrl);

      // Only adopt compressed version if it is actually smaller or was resized
      const shouldKeepCompressed =
        compressedSize < originalSize ||
        width !== (img.naturalWidth || img.width) ||
        height !== (img.naturalHeight || img.height);

      if (shouldKeepCompressed && compressedSize < originalSize) {
        const savedBytes = originalSize - compressedSize;
        const savedPercent = Math.round((savedBytes / originalSize) * 100);
        const originalFmt = formatBytes(originalSize);
        const compressedFmt = formatBytes(compressedSize);

        resolve({
          dataUrl: compressedDataUrl,
          originalSize,
          compressedSize,
          savedBytes,
          savedPercent,
          originalSizeFormatted: originalFmt,
          compressedSizeFormatted: compressedFmt,
          summary: `${originalFmt} → ${compressedFmt} (${savedPercent}% saved)`,
          isCompressed: true,
          width,
          height,
        });
      } else {
        // Source was already compact
        const originalFmt = formatBytes(originalSize);
        resolve({
          dataUrl: sourceDataUrl,
          originalSize,
          compressedSize: originalSize,
          savedBytes: 0,
          savedPercent: 0,
          originalSizeFormatted: originalFmt,
          compressedSizeFormatted: originalFmt,
          summary: `${originalFmt} (optimized)`,
          isCompressed: false,
          width,
          height,
        });
      }
    };

    img.onerror = () => {
      resolve({
        dataUrl: sourceDataUrl,
        originalSize,
        compressedSize: originalSize,
        savedBytes: 0,
        savedPercent: 0,
        originalSizeFormatted: formatBytes(originalSize),
        compressedSizeFormatted: formatBytes(originalSize),
        summary: `${formatBytes(originalSize)} (original)`,
        isCompressed: false,
      });
    };

    img.src = sourceDataUrl;
  });
}

/**
 * Compresses a PDF client-side or server-side.
 * Optimizes object streams, strips uncompressed redundancies, and downscales large embedded JPEG images.
 */
export async function compressPdf(
  source: File | Blob | Uint8Array | ArrayBuffer | string,
  options: PdfCompressOptions = {}
): Promise<CompressResult> {
  const { maxImageDimension = 1400, imageQuality = 0.75 } = options;

  let originalBytes: Uint8Array;
  if (typeof source === "string") {
    originalBytes = dataUrlToUint8Array(source);
  } else if (source instanceof Uint8Array) {
    originalBytes = source;
  } else if (source instanceof ArrayBuffer) {
    originalBytes = new Uint8Array(source);
  } else {
    const ab = await source.arrayBuffer();
    originalBytes = new Uint8Array(ab);
  }

  const originalSize = originalBytes.byteLength;
  const originalFmt = formatBytes(originalSize);

  try {
    const { PDFDocument, PDFName, PDFNumber, PDFRawStream } = await import("pdf-lib");
    const doc = await PDFDocument.load(originalBytes, { ignoreEncryption: true });

    // In browser environment, check indirect objects for large JPEG images to downscale
    if (typeof window !== "undefined" && typeof document !== "undefined") {
      try {
        const indirectObjects = doc.context.enumerateIndirectObjects();
        for (const [, obj] of indirectObjects) {
          if (obj instanceof PDFRawStream) {
            const subtype = obj.dict.get(PDFName.of("Subtype"));
            if (subtype && subtype.toString() === "/Image") {
              const filter = obj.dict.get(PDFName.of("Filter"));
              // Check if image is DCTDecode (JPEG) and large (> 100 KB)
              if (
                filter &&
                filter.toString().includes("DCTDecode") &&
                obj.contents.length > 100 * 1024
              ) {
                try {
                  const rawContents = obj.asUint8Array ? obj.asUint8Array() : (obj as any).contents;
                  const blob = new Blob([rawContents as any], { type: "image/jpeg" });
                  const compressed = await compressImage(blob, {
                    maxWidth: maxImageDimension,
                    maxHeight: maxImageDimension,
                    quality: imageQuality,
                    mimeType: "image/jpeg",
                  });

                  if (compressed.isCompressed && compressed.compressedSize < (rawContents.length || obj.contents.length)) {
                    const newBytes = dataUrlToUint8Array(compressed.dataUrl);
                    (obj as any).contents = newBytes;
                    obj.dict.set(PDFName.of("Length"), PDFNumber.of(newBytes.length));
                    if (compressed.width) {
                      obj.dict.set(PDFName.of("Width"), PDFNumber.of(compressed.width));
                    }
                    if (compressed.height) {
                      obj.dict.set(PDFName.of("Height"), PDFNumber.of(compressed.height));
                    }
                  }
                } catch {
                  // Silently continue if single image re-encoding fails
                }
              }
            }
          }
        }
      } catch {
        // Continue with structural compression if image scanning fails
      }
    }

    // Save with object streams to compress cross-reference tables and objects
    const compressedBytes = await doc.save({ useObjectStreams: true });
    const compressedSize = compressedBytes.byteLength;

    if (compressedSize < originalSize) {
      const savedBytes = originalSize - compressedSize;
      const savedPercent = Math.round((savedBytes / originalSize) * 100);
      const compressedFmt = formatBytes(compressedSize);
      const dataUrl = uint8ArrayToDataUrl(compressedBytes, "application/pdf");

      return {
        dataUrl,
        originalSize,
        compressedSize,
        savedBytes,
        savedPercent,
        originalSizeFormatted: originalFmt,
        compressedSizeFormatted: compressedFmt,
        summary: `${originalFmt} → ${compressedFmt} (${savedPercent}% saved)`,
        isCompressed: true,
      };
    } else {
      // Original was already compact / optimized
      const dataUrl = uint8ArrayToDataUrl(originalBytes, "application/pdf");
      return {
        dataUrl,
        originalSize,
        compressedSize: originalSize,
        savedBytes: 0,
        savedPercent: 0,
        originalSizeFormatted: originalFmt,
        compressedSizeFormatted: originalFmt,
        summary: `${originalFmt} (optimized)`,
        isCompressed: false,
      };
    }
  } catch (err: any) {
    console.warn("[compressPdf] Compression fallback:", err?.message);
    const dataUrl = uint8ArrayToDataUrl(originalBytes, "application/pdf");
    return {
      dataUrl,
      originalSize,
      compressedSize: originalSize,
      savedBytes: 0,
      savedPercent: 0,
      originalSizeFormatted: originalFmt,
      compressedSizeFormatted: originalFmt,
      summary: `${originalFmt} (original)`,
      isCompressed: false,
    };
  }
}

/**
 * Universal file compressor that automatically selects image or PDF pipeline.
 * Reduces upload time and storage by up to 90%+.
 */
export async function compressUploadedFile(
  file: File,
  typeCategory: "AVATAR" | "DOCUMENT" | "GENERAL" = "DOCUMENT"
): Promise<UniversalCompressResult> {
  const isImage = file.type.startsWith("image/") || /\.(jpe?g|png|webp|bmp)$/i.test(file.name);
  const isPdf = file.type === "application/pdf" || /\.pdf$/i.test(file.name);

  if (isImage) {
    const isAvatar = typeCategory === "AVATAR";
    const res = await compressImage(file, {
      maxWidth: isAvatar ? 800 : 1600,
      maxHeight: isAvatar ? 800 : 1600,
      quality: isAvatar ? 0.82 : 0.78,
      mimeType: "image/jpeg",
    });

    return {
      ...res,
      fileName: file.name.replace(/\.[^/.]+$/, ".jpg"),
      fileType: "image/jpeg",
    };
  }

  if (isPdf) {
    const res = await compressPdf(file, {
      maxImageDimension: 1400,
      imageQuality: 0.75,
    });

    return {
      ...res,
      fileName: file.name,
      fileType: "application/pdf",
    };
  }

  // Fallback for other file types: direct DataURL without modification
  const originalSize = file.size;
  const originalFmt = formatBytes(originalSize);
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  return {
    dataUrl,
    originalSize,
    compressedSize: originalSize,
    savedBytes: 0,
    savedPercent: 0,
    originalSizeFormatted: originalFmt,
    compressedSizeFormatted: originalFmt,
    summary: `${originalFmt} (original)`,
    isCompressed: false,
    fileName: file.name,
    fileType: file.type || "application/octet-stream",
  };
}
