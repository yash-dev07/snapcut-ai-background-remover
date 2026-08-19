import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Boxes,
  Code2,
  Gauge,
  History,
  KeyRound,
  Layers,
  ShieldCheck,
  Sparkles,
  Wand2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteLayout } from "@/components/site/SiteLayout";

export const Route = createFileRoute("/features")({
  head: () => ({
    meta: [
      { title: "Features — SnapCut AI Background Removal" },
      {
        name: "description",
        content:
          "Edge-accurate AI matting, batch processing, transparent PNG exports, usage analytics, API keys and 24-hour auto-deletion. Everything SnapCut AI ships with.",
      },
      { property: "og:title", content: "Features — SnapCut AI Background Removal" },
      {
        property: "og:description",
        content:
          "Edge-accurate matting, batch workflows, analytics and a developer API — built for production teams.",
      },
    ],
  }),
  component: Features,
});

const items = [
  {
    icon: Wand2,
    title: "Edge-accurate matting",
    body: "Hair, fur, glass and soft shadows stay intact with alpha-channel precision.",
  },
  {
    icon: Gauge,
    title: "Sub-5s processing",
    body: "Requests are queued and retried automatically so throughput stays predictable.",
  },
  {
    icon: Layers,
    title: "Full-resolution export",
    body: "Transparent PNG output up to 5000×5000, never downscaled or watermarked.",
  },
  {
    icon: Boxes,
    title: "Batch workspace",
    body: "Drop a folder of product shots and download the finished set in one archive.",
  },
  {
    icon: History,
    title: "7-day history",
    body: "Re-download recent results from your dashboard while originals expire in 24 hours.",
  },
  {
    icon: ShieldCheck,
    title: "Privacy controls",
    body: "Temporary storage only, HTTPS everywhere, encrypted secrets and audit logging.",
  },
  {
    icon: KeyRound,
    title: "Scoped API keys",
    body: "Issue, rotate and revoke keys per environment with per-key rate limits.",
  },
  {
    icon: Code2,
    title: "Developer-first API",
    body: "One POST request returns a signed result URL — no SDK lock-in required.",
  },
  {
    icon: Sparkles,
    title: "Usage analytics",
    body: "Track credits, success rates and error logs across your whole team.",
  },
];

function Features() {
  return (
    <SiteLayout>
      <section className="hero-glow">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-bold sm:text-5xl">
              Everything you need to <span className="text-gradient">ship clean cutouts</span>
            </h1>
            <p className="mt-5 text-muted-foreground">
              SnapCut AI is a focused background removal platform — no bloated editor, just the
              pipeline your catalog and ad workflows depend on.
            </p>
            <Button variant="hero" size="lg" className="mt-8" asChild>
              <Link to="/register">Start free</Link>
            </Button>
          </div>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <article key={item.title} className="glass-card neon-hover p-6">
                <item.icon className="h-5 w-5 text-primary" aria-hidden />
                <h2 className="mt-4 font-display text-lg font-semibold">{item.title}</h2>
                <p className="mt-2 text-sm text-muted-foreground">{item.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
