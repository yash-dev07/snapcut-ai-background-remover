import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { AppLayout } from "@/components/app/AppLayout";
import { getAdminOverview } from "@/lib/admin.functions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Admin panel — SnapCut AI" },
      {
        name: "description",
        content: "Monitor SnapCut AI users, processing jobs, revenue and system logs.",
      },
      { property: "og:title", content: "Admin panel — SnapCut AI" },
      { property: "og:description", content: "Operational overview of the SnapCut AI platform." },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const fetchOverview = useServerFn(getAdminOverview);
  const { data, isPending, error } = useQuery({
    queryKey: ["admin-overview"],
    queryFn: () => fetchOverview(),
    retry: false,
  });

  if (error) {
    return (
      <AppLayout>
        <Card className="glass-card">
          <CardContent className="p-6 text-sm text-muted-foreground">
            You don&apos;t have admin access to this workspace.
          </CardContent>
        </Card>
      </AppLayout>
    );
  }

  const stats = data?.stats;

  return (
    <AppLayout isAdmin>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Admin panel</h1>
        <p className="text-sm text-muted-foreground">Platform health, usage and revenue.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {[
          ["Users", stats?.totalUsers],
          ["Pro users", stats?.proUsers],
          ["Images processed", stats?.totalUploads],
          ["Failed jobs", stats?.failed],
          ["Revenue", stats ? `₹${(stats.revenuePaise / 100).toFixed(0)}` : undefined],
        ].map(([label, value]) => (
          <Card key={String(label)} className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">{isPending ? "…" : (value ?? 0)}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-base">Recent users</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="divide-y divide-border/60">
              {data?.users.slice(0, 12).map((user) => (
                <li key={user.id} className="flex items-center justify-between gap-3 py-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm">{user.full_name || user.email}</p>
                    <p className="text-xs text-muted-foreground">
                      joined {new Date(user.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant={user.plan === "pro" ? "default" : "secondary"}>{user.plan}</Badge>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-base">Recent jobs</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="divide-y divide-border/60">
              {data?.uploads.slice(0, 12).map((upload) => (
                <li key={upload.id} className="flex items-center justify-between gap-3 py-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm">{upload.original_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(upload.created_at).toLocaleString()}
                    </p>
                  </div>
                  <Badge variant={upload.status === "succeeded" ? "default" : "secondary"}>
                    {upload.status}
                  </Badge>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
