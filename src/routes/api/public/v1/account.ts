import { createFileRoute } from "@tanstack/react-router";

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", "access-control-allow-origin": "*" },
  });
}

export const Route = createFileRoute("/api/public/v1/account")({
  server: {
    handlers: {
      OPTIONS: async () =>
        new Response(null, {
          status: 204,
          headers: {
            "access-control-allow-origin": "*",
            "access-control-allow-methods": "GET,OPTIONS",
            "access-control-allow-headers": "authorization,content-type",
          },
        }),
      GET: async ({ request }) => {
        const auth = request.headers.get("authorization") ?? "";
        const token = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
        if (!token.startsWith("sk_snap_")) {
          return json(
            { error: "unauthorized", message: "Provide a SnapCut API key as a Bearer token." },
            401,
          );
        }

        const { createHash } = await import("node:crypto");
        const keyHash = createHash("sha256").update(token).digest("hex");

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data: key, error } = await supabaseAdmin
          .from("api_keys")
          .select("id, user_id, revoked_at")
          .eq("key_hash", keyHash)
          .maybeSingle();

        if (error) return json({ error: "server_error" }, 500);
        if (!key || key.revoked_at)
          return json({ error: "unauthorized", message: "Invalid or revoked key." }, 401);

        await supabaseAdmin
          .from("api_keys")
          .update({ last_used_at: new Date().toISOString() })
          .eq("id", key.id);

        const today = new Date().toISOString().slice(0, 10);
        const [profileRes, creditsRes, countRes] = await Promise.all([
          supabaseAdmin
            .from("profiles")
            .select("plan, daily_used, daily_reset_on")
            .eq("id", key.user_id)
            .maybeSingle(),
          supabaseAdmin.from("credits").select("balance").eq("user_id", key.user_id).maybeSingle(),
          supabaseAdmin
            .from("uploads")
            .select("id", { count: "exact", head: true })
            .eq("user_id", key.user_id),
        ]);

        const profile = profileRes.data;
        const dailyUsed = profile?.daily_reset_on === today ? (profile?.daily_used ?? 0) : 0;

        return json({
          plan: profile?.plan ?? "free",
          credits: creditsRes.data?.balance ?? 0,
          daily_used: dailyUsed,
          daily_limit: profile?.plan === "pro" ? null : 5,
          total_images: countRes.count ?? 0,
        });
      },
    },
  },
});
