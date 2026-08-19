import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Check, Cpu, ImageDown, ShieldCheck, Timer, Upload, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteLayout } from "@/components/site/SiteLayout";

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
  { icon: ImageDown, title: "Download transparent PNG", body: "Full resolution, ready to publish." },
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

function Landing() {
  return (
    <SiteLayout>
      <section className="hero-glow relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 pb-20 pt-20 sm:px-6 lg:pt-28">
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
                  Remove a background free <ArrowRight />
                </Link>
              </Button>
              <Button variant="neon" size="lg" asChild>
                <Link to="/pricing">See pricing</Link>
              </Button>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              5 free images every day · No credit card required
            </p>
          </div>

          <div className="glass-card mx-auto mt-16 max-w-4xl p-6 sm:p-10">
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
