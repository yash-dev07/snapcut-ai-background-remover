import { removeBackground } from "@imgly/background-removal";
import {
  base64ToBlob,
  fileToBase64,
  type AcceptedMime,
  type RemoveBgResult,
  type RemoveBgServerFn,
} from "./utils";

async function removeBackgroundLocal(file: File): Promise<Blob> {
  const blob = await removeBackground(file, { progress: () => {} });
  return blob as Blob;
}

export async function removeBackgroundSmart(
  file: File,
  serverFn: RemoveBgServerFn,
  options?: {
    onStage?: (stage: string) => void;
    onFallback?: (reason: string) => void;
  },
): Promise<RemoveBgResult> {
  options?.onStage?.("Trying n8n webhook (server proxy)…");
  try {
    const imageBase64 = await fileToBase64(file);
    const result = await serverFn({
      data: {
        originalName: file.name,
        mimeType: file.type as AcceptedMime,
        sizeBytes: file.size,
        imageBase64,
      },
    });
    const blob = base64ToBlob(result.resultBase64, result.resultMimeType);
    return { blob, source: "webhook" };
  } catch (webhookErr) {
    const reason = (webhookErr as Error)?.message || "Unknown webhook error";
    options?.onFallback?.(reason);
    options?.onStage?.("n8n unavailable — using local AI model…");
    const blob = await removeBackgroundLocal(file);
    return { blob, source: "local-ai" };
  }
}
