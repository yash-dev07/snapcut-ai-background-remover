import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(",")[1] || "";
      resolve(base64);
    };
    reader.onerror = () => reject(new Error("Failed to read file."));
    reader.readAsDataURL(file);
  });
}

export function base64ToBlob(base64: string, mimeType: string): Blob {
  const byteChars = atob(base64);
  const byteNumbers = new Array(byteChars.length);
  for (let i = 0; i < byteChars.length; i++) {
    byteNumbers[i] = byteChars.charCodeAt(i);
  }
  return new Blob([new Uint8Array(byteNumbers)], { type: mimeType });
}

export type AcceptedMime = "image/jpeg" | "image/png" | "image/webp";

export type RemoveBgResult = {
  blob: Blob;
  source: "webhook" | "local-ai";
};

export type RemoveBgServerFn = (args: {
  data: {
    originalName: string;
    mimeType: AcceptedMime;
    sizeBytes: number;
    imageBase64: string;
  };
}) => Promise<{ resultBase64: string; resultMimeType: string }>;
