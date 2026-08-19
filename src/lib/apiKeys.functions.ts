import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const createInput = z.object({ name: z.string().trim().min(1).max(60) });
const revokeInput = z.object({ id: z.string().uuid() });

export const listApiKeys = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("api_keys")
      .select("id, name, key_prefix, rate_limit_per_min, revoked_at, last_used_at, created_at")
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  });

export const createApiKey = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => createInput.parse(data))
  .handler(async ({ data, context }) => {
    const { createHash, randomBytes } = await import("node:crypto");
    const secret = `sk_snap_${randomBytes(24).toString("hex")}`;
    const keyHash = createHash("sha256").update(secret).digest("hex");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("api_keys").insert({
      user_id: context.userId,
      name: data.name,
      key_prefix: secret.slice(0, 16),
      key_hash: keyHash,
    });
    if (error) throw error;

    return { secret };
  });

export const revokeApiKey = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => revokeInput.parse(data))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("api_keys")
      .update({ revoked_at: new Date().toISOString() })
      .eq("id", data.id)
      .eq("user_id", context.userId);
    if (error) throw error;
    return { ok: true };
  });
