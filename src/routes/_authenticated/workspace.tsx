import { useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { UploadCloud, Download, Loader2 } from "lucide-react";
import { AppLayout } from "@/components/app/AppLayout";
import { useAccount } from "@/hooks/useAccount";
import { supabase } from "@/integrations/supabase/client";
import { startRemovalJob, completeRemovalJob, failRemovalJob } from "@/lib/snapcut.functions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/_authenticated/workspace")({
  head: () => ({
    meta: [
      { title: "Workspace — remove image backgrounds | SnapCut AI" },
      {
        name: "description",
        content: "Drop an image and let SnapCut AI cut out the background in seconds. Max 10MB and 5000px.",
      },
      { property: "og:title", content: "Workspace — SnapCut AI" },
      { property: "og:description", content: "Instant AI background removal with transparent PNG export." },
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

function WorkspacePage() {
  const { data: account } = useAccount();
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [stage, setStage] = useState("");
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);

  const start = useServerFn(startRemovalJob);
  const complete = useServerFn(completeRemovalJob);
  const fail = useServerFn(failRemovalJob);

  async function handleFile(file: File) {
    if (!ACCEPTED.includes(file.type as (typeof ACCEPTED)[number])) {
      return toast.error("Only JPG, PNG and WebP images are supported.");
    }
    if (file.size > MAX_BYTES) return toast.error("Images must be 10MB or smaller.");

    let dims: { width: number; height: number };
    try {
      dims = await readDimensions(file);
    } catch (error) {
      return toast.error((error as Error).message);
    }
    if (dims.width > MAX_DIM || dims.height > MAX_DIM) {
      return toast.error("Images must be at most 5000px on each side.");
    }

    setBusy(true);
    setResultUrl(null);
    setOriginalUrl(URL.createObjectURL(file));
    let uploadId: string | null = null;

    try {
      setStage("Checking your quota…");
      const job = await start({
        data: {
          originalName: file.name,
          mimeType: file.type as (typeof ACCEPTED)[number],
          sizeBytes: file.size,
          width: dims.width,
          height: dims.height,
        },
      });
      uploadId = job.uploadId;

      setStage("Running AI matting…");
      const startedAt = performance.now();
      const { removeBackground } = await import("@imgly/background-removal");
      const blob = await removeBackground(file, { output: { format: "image/png" } });
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
      toast.success(`Background removed in ${(processingMs / 1000).toFixed(1)}s`);
      queryClient.invalidateQueries({ queryKey: ["account-overview"] });
    } catch (error) {
      const message = (error as Error).message || "Processing failed.";
      if (uploadId) await fail({ data: { uploadId, message: message.slice(0, 500) } }).catch(() => {});
      toast.error(message);
      queryClient.invalidateQueries({ queryKey: ["account-overview"] });
    } finally {
      setBusy(false);
      setStage("");
    }
  }

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
            role="button"
            tabIndex={0}
            onClick={() => !busy && inputRef.current?.click()}
            onKeyDown={(e) => e.key === "Enter" && !busy && inputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const file = e.dataTransfer.files?.[0];
              if (file && !busy) void handleFile(file);
            }}
            className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-primary/40 bg-primary/5 px-6 py-14 text-center transition-colors hover:border-primary"
          >
            {busy ? (
              <>
                <Loader2 className="mb-3 h-8 w-8 animate-spin text-primary" />
                <p className="text-sm font-medium">{stage}</p>
              </>
            ) : (
              <>
                <UploadCloud className="mb-3 h-8 w-8 text-primary" />
                <p className="text-sm font-medium">Drop an image here or click to browse</p>
                <p className="mt-1 text-xs text-muted-foreground">
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
                if (file) void handleFile(file);
                e.target.value = "";
              }}
            />
          </div>
        </CardContent>
      </Card>

      {(originalUrl || resultUrl) && (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-base">Original</CardTitle>
            </CardHeader>
            <CardContent>
              {originalUrl && <img src={originalUrl} alt="Original upload" className="w-full rounded-lg" />}
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
                <p className="text-sm text-muted-foreground">Your transparent PNG will appear here.</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </AppLayout>
  );
}
