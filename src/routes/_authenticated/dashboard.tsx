import { createFileRoute, Link } from "@tanstack/react-router";
import { ImageIcon, Coins, Zap, Clock } from "lucide-react";
import { AppLayout } from "@/components/app/AppLayout";
import { useAccount } from "@/hooks/useAccount";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — SnapCut AI" },
      { name: "description", content: "Track your SnapCut AI usage, credits and recent background removals." },
      { property: "og:title", content: "Dashboard — SnapCut AI" },
      { property: "og:description", content: "Usage, credits and recent cutouts in one place." },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const { data, isPending } = useAccount();

  const stats = [
    {
      label: "Plan",
      value: data ? data.plan.toUpperCase() : "—",
      icon: Zap,
    },
    {
      label: "Credits",
      value: data ? String(data.credits) : "—",
      icon: Coins,
    },
    {
      label: "Free removals left today",
      value: data ? (data.plan === "pro" ? "Unlimited" : String(Math.max(0, data.dailyLimit - data.dailyUsed))) : "—",
      icon: Clock,
    },
    {
      label: "Images processed",
      value: data ? String(data.uploads.length) : "—",
      icon: ImageIcon,
    },
  ];

  return (
    <AppLayout isAdmin={data?.isAdmin}>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Welcome back{data?.profile?.full_name ? `, ${data.profile.full_name}` : ""}
          </h1>
          <p className="text-sm text-muted-foreground">Your background removal activity at a glance.</p>
        </div>
        <Button variant="hero" asChild>
          <Link to="/workspace">New cutout</Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon }) => (
          <Card key={label} className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
              <Icon className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">{isPending ? "…" : value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="glass-card mt-6">
        <CardHeader>
          <CardTitle>Recent cutouts</CardTitle>
        </CardHeader>
        <CardContent>
          {isPending && <p className="text-sm text-muted-foreground">Loading history…</p>}
          {!isPending && (data?.uploads.length ?? 0) === 0 && (
            <p className="text-sm text-muted-foreground">
              Nothing here yet — head to the workspace and drop in your first image.
            </p>
          )}
          <ul className="divide-y divide-border/60">
            {data?.uploads.slice(0, 10).map((upload) => (
              <li key={upload.id} className="flex items-center justify-between gap-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{upload.original_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(upload.created_at).toLocaleString()} ·{" "}
                    {(Number(upload.size_bytes) / 1024 / 1024).toFixed(2)} MB
                    {upload.credits_used > 0 ? " · 1 credit" : " · free quota"}
                  </p>
                </div>
                <Badge variant={upload.status === "succeeded" ? "default" : "secondary"}>{upload.status}</Badge>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </AppLayout>
  );
}
