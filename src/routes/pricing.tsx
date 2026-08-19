import { createFileRoute, Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { SiteLayout } from "@/components/site/SiteLayout";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing — SnapCut AI" },
      {
        name: "description",
        content:
          "SnapCut AI pricing: free plan with 5 images per day, Pro Monthly unlimited processing, and pay-as-you-go credit packs with API access.",
      },
      { property: "og:title", content: "Pricing — SnapCut AI" },
      {
        property: "og:description",
        content: "Free plan, unlimited Pro Monthly, and credit packs that never expire.",
      },
    ],
  }),
  component: Pricing,
});

const plans = [
  {
    name: "Free",
    price: "₹0",
    period: "forever",
    description: "For trying SnapCut AI on real images.",
    highlight: false,
    features: ["5 images per day", "Full-resolution PNG", "7-day history", "Community support"],
  },
  {
    name: "Pro Monthly",
    price: "₹799",
    period: "per month",
    description: "For teams shipping catalogs and campaigns.",
    highlight: true,
    features: [
      "Unlimited images",
      "Priority processing queue",
      "Batch workspace",
      "API access with 2 keys",
      "Email support",
    ],
  },
  {
    name: "Credit Packs",
    price: "₹499",
    period: "500 credits",
    description: "For irregular or seasonal volume.",
    highlight: false,
    features: ["Credits never expire", "Shared across the team", "API access", "Usage analytics"],
  },
];

const faqs = [
  {
    q: "What happens to my images?",
    a: "Uploads and results live in temporary storage and are permanently deleted 24 hours after processing. Nothing is stored beyond that window.",
  },
  {
    q: "Which formats and sizes are supported?",
    a: "JPG, PNG and WEBP up to 10 MB, with a maximum resolution of 5000×5000 pixels.",
  },
  {
    q: "Do credits expire?",
    a: "No. Credit-pack credits stay on your account until you use them, and they stack with any active plan.",
  },
  {
    q: "Can I cancel Pro Monthly anytime?",
    a: "Yes. Cancellation takes effect at the end of the current billing period and your history remains accessible.",
  },
];

function Pricing() {
  return (
    <SiteLayout>
      <section className="hero-glow">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-4xl font-bold sm:text-5xl">
              Pricing that scales <span className="text-gradient">with your volume</span>
            </h1>
            <p className="mt-5 text-muted-foreground">
              Start on the free plan today. Move to Pro or credits when your catalog grows.
            </p>
          </div>

          <div className="mt-14 grid gap-6 lg:grid-cols-3">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`glass-card neon-hover flex flex-col p-7 ${
                  plan.highlight ? "glow-primary" : ""
                }`}
              >
                {plan.highlight && (
                  <span className="mb-3 inline-flex w-fit rounded-full gradient-cta px-3 py-1 text-xs font-semibold text-primary-foreground">
                    Most popular
                  </span>
                )}
                <h2 className="font-display text-lg font-semibold">{plan.name}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>
                <p className="mt-6 font-display text-4xl font-bold">{plan.price}</p>
                <p className="text-sm text-muted-foreground">{plan.period}</p>
                <ul className="mt-6 flex-1 space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Button variant={plan.highlight ? "hero" : "neon"} className="mt-7" asChild>
                  <Link to="/register">
                    {plan.name === "Free" ? "Start free" : `Choose ${plan.name}`}
                  </Link>
                </Button>
              </div>
            ))}
          </div>

          <div className="mx-auto mt-20 max-w-3xl">
            <h2 className="text-center text-2xl font-bold sm:text-3xl">Frequently asked</h2>
            <Accordion type="single" collapsible className="mt-8">
              {faqs.map((faq) => (
                <AccordionItem key={faq.q} value={faq.q}>
                  <AccordionTrigger className="text-left">{faq.q}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">{faq.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
