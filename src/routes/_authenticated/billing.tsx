import { createFileRoute } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { AppLayout } from "@/components/app/AppLayout";
import { useAccount } from "@/hooks/useAccount";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/billing")({
  head: () => ({
    meta: [
      { title: "Billing & credits — SnapCut AI" },
      {
        name: "description",
        content: "Review your SnapCut AI plan, credit balance and payment history.",
      },
      { property: "og:title", content: "Billing & credits — SnapCut AI" },
      {
        property: "og:description",
        content: "Plan, credits and payment history for your SnapCut AI account.",
      },
    ],
  }),
  component: BillingPage,
});

const plans = [
  {
    id: "free",
    name: "Free",
    price: "₹0",
    perks: ["5 removals / day", "Standard quality", "24h auto-delete"],
  },
  {
    id: "pro",
    name: "Pro",
    price: "₹499 / mo",
    perks: ["Unlimited removals", "HD matting", "Priority queue", "API access"],
  },
  {
    id: "credits",
    name: "Credit pack",
    price: "₹299",
    perks: ["500 credits", "Never expire", "Use beyond daily limit"],
  },
];

function BillingPage() {
  const { data } = useAccount();

  return (
    <AppLayout isAdmin={data?.isAdmin ?? false}>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Billing &amp; credits</h1>
        <p className="text-sm text-muted-foreground">
          Current plan: <span className="text-foreground">{data?.plan ?? "…"}</span> · Credits:{" "}
          <span className="text-foreground">{data?.credits ?? 0}</span>
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {plans.map((plan) => (
          <Card key={plan.id} className="glass-card flex flex-col">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{plan.name}</CardTitle>
                {data?.plan === plan.id && <Badge>Current</Badge>}
              </div>
              <p className="text-2xl font-semibold">{plan.price}</p>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col justify-between gap-4">
              <ul className="space-y-2 text-sm text-muted-foreground">
                {plan.perks.map((perk) => (
                  <li key={perk} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    {perk}
                  </li>
                ))}
              </ul>
              <Button variant={plan.id === "pro" ? "hero" : "outline"} disabled>
                {plan.id === "free" ? "Included" : "Checkout coming soon"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="glass-card mt-6">
        <CardHeader>
          <CardTitle>Payment history</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No payments yet. Paid checkout activates once Razorpay API keys are connected to this
            project — ask me to wire it up and I&apos;ll request the keys securely.
          </p>
        </CardContent>
      </Card>
    </AppLayout>
  );
}
