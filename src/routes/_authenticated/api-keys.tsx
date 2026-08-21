import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Copy, KeyRound } from "lucide-react";
import { AppLayout } from "@/components/app/AppLayout";
import { useAccount } from "@/hooks/useAccount";
import { listApiKeys, createApiKey, revokeApiKey } from "@/lib/apiKeys.functions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_authenticated/api-keys")({
  head: () => ({
    meta: [
      { title: "API keys — SnapCut AI" },
      { name: "description", content: "Create, inspect and revoke SnapCut AI developer API keys." },
      { property: "og:title", content: "API keys — SnapCut AI" },
      {
        property: "og:description",
        content: "Manage developer credentials for the SnapCut AI REST API.",
      },
    ],
  }),
  component: ApiKeysPage,
});

function ApiKeysPage() {
  const { data: account } = useAccount();
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [freshKey, setFreshKey] = useState<string | null>(null);

  const list = useServerFn(listApiKeys);
  const create = useServerFn(createApiKey);
  const revoke = useServerFn(revokeApiKey);

  const keys = useQuery({ queryKey: ["api-keys"], queryFn: () => list() });

  const createMutation = useMutation({
    mutationFn: (keyName: string) => create({ data: { name: keyName } }),
    onSuccess: (result) => {
      setFreshKey(result.secret);
      setName("");
      queryClient.invalidateQueries({ queryKey: ["api-keys"] });
      toast.success("API key created — copy it now, it won't be shown again.");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const revokeMutation = useMutation({
    mutationFn: (id: string) => revoke({ data: { id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["api-keys"] });
      toast.success("Key revoked.");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <AppLayout isAdmin={account?.isAdmin ?? false}>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">API keys</h1>
        <p className="text-sm text-muted-foreground">
          Authenticate REST requests with{" "}
          <code className="text-foreground">Authorization: Bearer &lt;key&gt;</code>.
        </p>
      </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-base">Create a key</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row">
          <Input
            placeholder="Production server"
            value={name}
            maxLength={60}
            onChange={(e) => setName(e.target.value)}
          />
          <Button
            variant="hero"
            disabled={!name.trim() || createMutation.isPending}
            onClick={() => createMutation.mutate(name.trim())}
          >
            <KeyRound className="mr-2 h-4 w-4" />
            Generate
          </Button>
        </CardContent>
      </Card>

      {freshKey && (
        <Card className="glass-card mt-4 border-primary/40">
          <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
            <code className="break-all text-sm text-primary">{freshKey}</code>
            <Button
              size="sm"
              variant="neon"
              onClick={() => {
                void navigator.clipboard.writeText(freshKey);
                toast.success("Copied to clipboard");
              }}
            >
              <Copy className="mr-2 h-4 w-4" />
              Copy
            </Button>
          </CardContent>
        </Card>
      )}

      <Card className="glass-card mt-6">
        <CardHeader>
          <CardTitle className="text-base">Your keys</CardTitle>
        </CardHeader>
        <CardContent>
          {keys.isPending && <p className="text-sm text-muted-foreground">Loading…</p>}
          {!keys.isPending && (keys.data?.length ?? 0) === 0 && (
            <p className="text-sm text-muted-foreground">No API keys yet.</p>
          )}
          <ul className="divide-y divide-border/60">
            {keys.data?.map((key) => (
              <li key={key.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div>
                  <p className="text-sm font-medium">{key.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {key.key_prefix}… · created {new Date(key.created_at).toLocaleDateString()} ·{" "}
                    {key.last_used_at
                      ? `last used ${new Date(key.last_used_at).toLocaleString()}`
                      : "never used"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {key.revoked_at ? (
                    <Badge variant="secondary">Revoked</Badge>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={revokeMutation.isPending}
                      onClick={() => revokeMutation.mutate(key.id)}
                    >
                      Revoke
                    </Button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </AppLayout>
  );
}
