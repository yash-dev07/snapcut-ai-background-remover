import { useCallback, useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { UploadCloud, Download, Loader2, Upload, Clipboard, Cpu } from "lucide-react";
import { AppLayout } from "@/components/app/AppLayout";
import { useAccount } from "@/hooks/useAccount";
import { supabase } from "@/integrations/supabase/client";
import {
  startRemovalJob,
  completeRemovalJob,
  failRemovalJob,
  removeBackgroundViaWebhook,
} from "@/lib/snapcut.functions";
import type { RemoveBgResult, RemoveBgServerFn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/_authenticated/workspace")({
  head: () => ({
    meta: [
      { title: "Workspace — remove image backgrounds | SnapCut AI" },
      {
        name: "description",
        content:
          "Drop an image and let SnapCut AI cut out the background in seconds. Max 10MB and 5000px.",
      },
      { property: "og:title", content: "Workspace — SnapCut AI" },
      {
        property: "og:description",
        content: "Instant AI background removal with transparent PNG export.",
      },
    ],
  }),
  component: WorkspacePage,
});

const MAX_BYTES = 10 * 1024 * 1024;
const MAX_DIM = 5000;
const ACCEPTED = ["image/jpeg", "image/png", "image/webp"] as const;

function readDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read this image."));
    };
    img.src = url;
  });
}

function cleanUrl(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const cleaned = raw.trim().replace(/^`+|`+$/g, "").trim();
  if (!cleaned) return null;
  return cleaned;
}

function extractUrlFromObject(obj: unknown): string | null {
  if (!obj || typeof obj !== "object") return null;
  const o = obj as Record<string, unknown>;
  return (
    cleanUrl(o.url) ||
    cleanUrl(o.resultUrl) ||
    cleanUrl(o.result_url) ||
    cleanUrl(o.outputUrl) ||
    cleanUrl(o.output_url) ||
    cleanUrl(o.imageUrl) ||
    cleanUrl(o.image_url) ||
    (o.data && typeof o.data === "object" ? extractUrlFromObject(o.data) : null) ||
    (o.result && typeof o.result === "object" ? extractUrlFromObject(o.result) : null) ||
    (o.body && typeof o.body === "object" ? extractUrlFromObject(o.body) : null)
  );
}

function WorkspacePage() {
  const { data: account } = useAccount();
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [stage, setStage] = useState("");
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const start = useServerFn(startRemovalJob);
  const complete = useServerFn(completeRemovalJob);
  const fail = useServerFn(failRemovalJob);
  const webhookRemove = useServerFn(removeBackgroundViaWebhook);

  const selectFile = useCallback((file: File) => {
    if (!ACCEPTED.includes(file.type as (typeof ACCEPTED)[number])) {
      return toast.error("Only JPG, PNG and WebP images are supported.");
    }
    if (file.size > MAX_BYTES) return toast.error("Images must be 10MB or smaller.");
    void readDimensions(file)
      .then((dims) => {
        if (dims.width > MAX_DIM || dims.height > MAX_DIM) {
          toast.error("Images must be at most 5000px on each side.");
          return;
        }
        setSelectedFile(file);
        setOriginalUrl(URL.createObjectURL(file));
        setResultUrl(null);
        toast.info("Image selected — click Remove Background to process.");
      })
      .catch((err) => toast.error((err as Error).message));
  }, []);

  const handleRemove = useCallback(async () => {
    if (!selectedFile) {
      toast.error("Select an image first.");
      return;
    }
    let dims: { width: number; height: number };
    try {
      dims = await readDimensions(selectedFile);
    } catch (error) {
      return toast.error((error as Error).message);
    }

    setBusy(true);
    setStage("Checking your quota…");
    setResultUrl(null);
    let uploadId: string | null = null;
    const startedAt = performance.now();

    try {
      const job = await start({
        data: {
          originalName: selectedFile.name,
          mimeType: selectedFile.type as (typeof ACCEPTED)[number],
          sizeBytes: selectedFile.size,
          width: dims.width,
          height: dims.height,
        },
      });
      uploadId = job.uploadId;

      const mod = await import("@/lib/remove-bg.client");
      const { blob, source } = (await mod.removeBackgroundSmart(
        selectedFile,
        webhookRemove as RemoveBgServerFn,
        {
          onStage: (s) => setStage(s),
          onFallback: (reason) =>
            toast.warning(`n8n skipped (${reason.slice(0, 80)}). Using local AI.`),
        }
      )) as RemoveBgResult;
      const processingMs = Math.round(performance.now() - startedAt);

      setStage("Saving your cutout…");
      const { data: userData } = await supabase.auth.getUser();
      const path = `${userData.user!.id}/${uploadId}.png`;
      const { error: uploadError } = await supabase.storage
        .from("cutouts")
        .upload(path, blob, { contentType: "image/png", upsert: true });
      if (uploadError) throw uploadError;

      await complete({ data: { uploadId, resultPath: path, processingMs } });
      setResultUrl(URL.createObjectURL(blob));
      const tag = source === "webhook" ? "via n8n" : "via local AI";
      toast.success(`Background removed ${tag} in ${(processingMs / 1000).toFixed(1)}s`);
      queryClient.invalidateQueries({ queryKey: ["account-overview"] });
    } catch (error) {
      const message = (error as Error).message || "Processing failed.";
      if (uploadId)
        await fail({ data: { uploadId, message: message.slice(0, 500) } }).catch(() => {});
      toast.error(message);
      queryClient.invalidateQueries({ queryKey: ["account-overview"] });
    } finally {
      setBusy(false);
      setStage("");
    }
  }, [selectedFile, start, complete, fail, queryClient, webhookRemove]);

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (!e.clipboardData) return;
      const items = e.clipboardData.items;
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.startsWith("image/")) {
          const file = item.getAsFile();
          if (file) {
            e.preventDefault();
            selectFile(file);
            toast.info("Pasted image detected.");
            return;
          }
        }
      }
    };
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [selectFile]);

  return (
    <AppLayout isAdmin={account?.isAdmin}>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Workspace</h1>
        <p className="text-sm text-muted-foreground">
          JPG, PNG or WebP · up to 10MB · max 5000px · results auto-delete after 24 hours.
        </p>
      </div>

      <Card className="glass-card">
        <CardContent className="p-6">
          <div
            ref={dropRef}
            role="button"
            tabIndex={0}
            onClick={() => !busy && inputRef.current?.click()}
            onKeyDown={(e) => e.key === "Enter" && !busy && inputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              const file = e.dataTransfer.files?.[0];
              if (file && !busy) selectFile(file);
            }}
            className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed px-6 py-14 text-center transition-all ${
              dragOver
                ? "border-primary bg-primary/15 scale-[1.01]"
                : "border-primary/40 bg-primary/5 hover:border-primary hover:bg-primary/10"
            }`}
          >
            {busy ? (
              <>
                <Loader2 className="mb-3 h-10 w-10 animate-spin text-primary" />
                <p className="text-sm font-medium">{stage}</p>
              </>
            ) : (
              <>
                <UploadCloud className="mb-4 h-10 w-10 text-primary" />
                <p className="text-base font-semibold">
                  Drop an image, click to browse, or paste (Ctrl+V)
                </p>
                <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-xs">
                  <span className="inline-flex items-center gap-1 rounded-full border border-border bg-surface/60 px-3 py-1 text-muted-foreground">
                    <Upload className="h-3 w-3" /> Click to browse
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-border bg-surface/60 px-3 py-1 text-muted-foreground">
                    <UploadCloud className="h-3 w-3" /> Drag &amp; drop
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-border bg-surface/60 px-3 py-1 text-muted-foreground">
                    <Clipboard className="h-3 w-3" /> Ctrl+V to paste
                  </span>
                </div>
                <p className="mt-4 text-xs text-muted-foreground">
                  {account?.plan === "pro"
                    ? "Pro plan — unlimited removals"
                    : `${Math.max(0, (account?.dailyLimit ?? 5) - (account?.dailyUsed ?? 0))} free left today · ${account?.credits ?? 0} credits`}
                </p>
              </>
            )}
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) selectFile(file);
                e.target.value = "";
              }}
            />
          </div>
        </CardContent>
      </Card>

      {selectedFile && !busy && (
        <div className="mt-4 flex justify-center">
          <Button variant="hero" size="lg" onClick={handleRemove}>
            <Cpu className="mr-2 h-5 w-5" />
            Remove Background
          </Button>
        </div>
      )}

      {(originalUrl || resultUrl) && (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-base">Original</CardTitle>
              {originalUrl && !busy && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setSelectedFile(null);
                    setOriginalUrl(null);
                    setResultUrl(null);
                  }}
                >
                  Change
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {originalUrl && (
                <img src={originalUrl} alt="Original upload" className="w-full rounded-lg" />
              )}
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-base">Cutout</CardTitle>
              {resultUrl && (
                <Button size="sm" variant="neon" asChild>
                  <a href={resultUrl} download="snapcut.png">
                    <Download className="mr-2 h-4 w-4" />
                    PNG
                  </a>
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {resultUrl ? (
                <img
                  src={resultUrl}
                  alt="Background removed result"
                  className="w-full rounded-lg"
                  style={{
                    backgroundImage:
                      "linear-gradient(45deg,rgba(255,255,255,0.06) 25%,transparent 25%,transparent 75%,rgba(255,255,255,0.06) 75%),linear-gradient(45deg,rgba(255,255,255,0.06) 25%,transparent 25%,transparent 75%,rgba(255,255,255,0.06) 75%)",
                    backgroundSize: "20px 20px",
                    backgroundPosition: "0 0, 10px 10px",
                  }}
                />
              ) : (
                <p className="text-sm text-muted-foreground">
                  {busy
                    ? stage
                    : "Your transparent PNG will appear here after clicking Remove Background."}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </AppLayout>
  );
}