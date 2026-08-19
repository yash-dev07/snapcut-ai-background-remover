import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const getAdminOverview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;

    const { data: roles, error: rolesError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);
    if (rolesError) throw rolesError;
    if (!(roles ?? []).some((r) => r.role === "admin")) {
      throw new Error("Admin access required");
    }

    const [profiles, uploads, transactions, logs] = await Promise.all([
      supabase
        .from("profiles")
        .select("id, email, full_name, plan, daily_used, created_at")
        .order("created_at", { ascending: false })
        .limit(100),
      supabase
        .from("uploads")
        .select("id, user_id, original_name, status, size_bytes, credits_used, created_at")
        .order("created_at", { ascending: false })
        .limit(100),
      supabase
        .from("transactions")
        .select("id, user_id, amount_paise, currency, status, plan, created_at")
        .order("created_at", { ascending: false })
        .limit(50),
      supabase
        .from("logs")
        .select("id, level, event, created_at")
        .order("created_at", { ascending: false })
        .limit(50),
    ]);

    if (profiles.error) throw profiles.error;
    if (uploads.error) throw uploads.error;

    const rows = uploads.data ?? [];
    return {
      users: profiles.data ?? [],
      uploads: rows,
      transactions: transactions.data ?? [],
      logs: logs.data ?? [],
      stats: {
        totalUsers: (profiles.data ?? []).length,
        proUsers: (profiles.data ?? []).filter((p) => p.plan === "pro").length,
        totalUploads: rows.length,
        failed: rows.filter((u) => u.status === "failed").length,
        revenuePaise: (transactions.data ?? [])
          .filter((t) => t.status === "paid")
          .reduce((sum, t) => sum + Number(t.amount_paise), 0),
      },
    };
  });
