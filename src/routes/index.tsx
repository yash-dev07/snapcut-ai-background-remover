import { useCallback, useEffect, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import {
  ArrowRight,
  Check,
  Clipboard,
  Cpu,
  Download,
  ImageDown,
  Loader2,
  ShieldCheck,
  Timer,
  Upload,
  UploadCloud,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SiteLayout } from "@/components/site/SiteLayout";
import { removeBackgroundViaWebhook } from "@/lib/snapcut.functions";
import type { RemoveBgResult, RemoveBgServerFn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SnapCut AI — Instant AI Background Removal" },
      {
        name: "description",
        content:
          "Remove image backgrounds in under 5 seconds with SnapCut AI. Studio-grade transparent cutouts, bulk workflows, and a developer API. Free plan included.",
      },
      { property: "og:title", content: "SnapCut AI — Instant AI Background Removal" },
      {
        property: "og:description",
        content:
          "Studio-grade transparent cutouts in seconds. Free plan, Pro unlimited, and a production-ready API.",
      },
    ],
  }),
  component: Landing,
});

const steps = [
  { icon: Upload, title: "Drop your image", body: "JPG, PNG or WEBP up to 10 MB and 5000×5000." },
  { icon: Cpu, title: "AI removes the background", body: "Edge-accurate matting, hair and all." },
  {
    icon: ImageDown,
    title: "Download transparent PNG",
    body: "Full resolution, ready to publish.",
  },
];

const features = [
  { icon: Zap, title: "Under 5 seconds", body: "Average processing time per image, at any scale." },
  {
    icon: ShieldCheck,
    title: "Private by default",
    body: "Every upload is auto-deleted after 24 hours.",
  },
  {
    icon: Timer,
    title: "Built for volume",
    body: "Queue batches and stream results through the API.",
  },
];

const plans = [
  {
    name: "Free",
    price: "₹0",
    period: "forever",
    highlight: false,
    features: ["5 images per day", "Full resolution output", "7-day history"],
  },
  {
    name: "Pro Monthly",
    price: "₹799",
    period: "per month",
    highlight: true,
    features: ["Unlimited images", "Priority processing", "API access", "Email support"],
  },
  {
    name: "Credit Pack",
    price: "₹499",
    period: "500 credits",
    highlight: false,
    features: ["Never expires", "Team sharing", "Usage analytics"],
  },
];

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

function BackgroundRemover() {
  const inputRef = useRef<HTMLInputElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [stage, setStage] = useState("");
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const webhookRemove = useServerFn(removeBackgroundViaWebhook);

  const clearSelection = useCallback(() => {
    if (originalUrl) URL.revokeObjectURL(originalUrl);
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setSelectedFile(null);
    setOriginalUrl(null);
    setResultUrl(null);
  }, [originalUrl, resultUrl]);

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
    setBusy(true);
    setStage("Preparing image…");
    setResultUrl(null);
    const startedAt = performance.now();
    try {
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
      setStage("Preparing your cutout…");
      setResultUrl(URL.createObjectURL(blob));
      const elapsed = Math.round(performance.now() - startedAt);
      const tag = source === "webhook" ? "via n8n" : "via local AI";
      toast.success(`Background removed ${tag} in ${(elapsed / 1000).toFixed(1)}s`);
    } catch (error) {
      const message = (error as Error).message || "Processing failed.";
      toast.error(message);
    } finally {
      setBusy(false);
      setStage("");
    }
  }, [selectedFile, webhookRemove]);

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
    <Card className="glass-card mx-auto mt-12 max-w-5xl">
      <CardHeader className="pb-4">
        <CardTitle className="text-center text-lg">
          Try it now — remove a background for free
        </CardTitle>
        <p className="text-center text-xs text-muted-foreground">
          Click · Drag &amp; drop · or press Ctrl+V to paste — no account needed
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
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
          className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed px-6 py-16 text-center transition-all ${
            dragOver
              ? "border-primary bg-primary/15 scale-[1.01]"
              : "border-primary/40 bg-primary/5 hover:border-primary hover:bg-primary/10"
          }`}
        >
          {busy ? (
            <>
              <Loader2 className="mb-3 h-10 w-10 animate-spin text-primary" />
              <p className="text-sm font-medium">{stage}</p>
              <p className="mt-1 text-xs text-muted-foreground">Server proxy bypasses CORS…</p>
            </>
          ) : (
            <>
              <div className="mb-4 flex items-center gap-2 text-primary">
                <UploadCloud className="h-10 w-10" />
              </div>
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
                JPG, PNG or WebP · up to 10MB · max 5000px
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

        {selectedFile && !busy && (
          <div className="flex justify-center">
            <Button variant="hero" size="lg" onClick={handleRemove}>
              <Cpu className="mr-2 h-5 w-5" />
              Remove Background
            </Button>
          </div>
        )}

        {(originalUrl || resultUrl) && (
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="glass-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-base">Original</CardTitle>
                {originalUrl && !busy && (
                  <Button size="sm" variant="outline" onClick={clearSelection}>
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
                    <a href={resultUrl} download="snapcut-free.png">
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
      </CardContent>
    </Card>
  );
}

function Landing() {
  return (
    <SiteLayout>
      <section className="hero-glow relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 pb-20 pt-20 sm:px-6 lg:pt-24">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/60 px-3 py-1 text-xs text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              AI background removal · 99.5% uptime
            </span>
            <h1 className="mt-6 text-4xl font-bold leading-tight sm:text-6xl">
              Cut the background. <span className="text-gradient">Keep the magic.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-base text-muted-foreground sm:text-lg">
              SnapCut AI turns any photo into a clean transparent cutout in seconds — for
              marketplaces, ads, and product catalogs. No editor, no learning curve.
            </p>
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button variant="hero" size="lg" asChild>
                <Link to="/register">
                  Make an account <ArrowRight />
                </Link>
              </Button>
              <Button variant="neon" size="lg" asChild>
                <Link to="/pricing">See pricing</Link>
              </Button>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              5 free images every day · No credit card required · or try the free tool below
            </p>
          </div>

          <BackgroundRemover />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="glass-card mx-auto max-w-4xl p-6 sm:p-10">
          <div className="grid gap-6 sm:grid-cols-3">
            {steps.map((step) => (
              <div key={step.title} className="neon-hover rounded-xl border border-border p-5">
                <step.icon className="h-5 w-5 text-primary" aria-hidden />
                <h2 className="mt-4 text-sm font-semibold">{step.title}</h2>
                <p className="mt-1.5 text-sm text-muted-foreground">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="grid gap-6 md:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="glass-card neon-hover p-6">
              <f.icon className="h-5 w-5 text-accent" aria-hidden />
              <h2 className="mt-4 font-display text-lg font-semibold">{f.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">Simple, scalable pricing</h2>
          <p className="mt-3 text-muted-foreground">Start free. Upgrade when volume demands it.</p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`glass-card neon-hover flex flex-col p-7 ${
                plan.highlight ? "glow-primary" : ""
              }`}
            >
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                {plan.name}
              </h3>
              <p className="mt-4 font-display text-4xl font-bold">{plan.price}</p>
              <p className="text-sm text-muted-foreground">{plan.period}</p>
              <ul className="mt-6 flex-1 space-y-3">
                {plan.features.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <Button variant={plan.highlight ? "hero" : "neon"} className="mt-7" asChild>
                <Link to="/register">Get started</Link>
              </Button>
            </div>
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}