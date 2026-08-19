import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const FREE_DAILY_LIMIT = 5;

const startInput = z.object({
  originalName: z.string().trim().min(1).max(255),
  mimeType: z.enum(["image/jpeg", "image/png", "image/webp"]),
  sizeBytes: z.number().int().positive().max(10 * 1024 * 1024),
  width: z.number().int().positive().max(5000),
  height: z.number().int().positive().max(5000),
});

const completeInput = z.object({
  uploadId: z.string().uuid(),
  resultPath: z.string().trim().min(1).max(512),
  processingMs: z.number().int().nonnegative().max(600000),
});

const failInput = z.object({
  uploadId: z.string().uuid(),
  message: z.string().trim().min(1).max(500),
});

export const getAccountOverview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const today = new Date().toISOString().slice(0, 10);

    const [profileRes, creditsRes, uploadsRes, rolesRes] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
      supabase.from("credits").select("*").eq("user_id", userId).maybeSingle(),
      supabase
        .from("uploads")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(50),
      supabase.from("user_roles").select("role").eq("user_id", userId),
    ]);

    if (profileRes.error) throw profileRes.error;
    if (uploadsRes.error) throw uploadsRes.error;

    const profile = profileRes.data;
    const dailyUsed = profile && profile.daily_reset_on === today ? profile.daily_used : 0;
    const plan = profile?.plan ?? "free";
    const balance = creditsRes.data?.balance ?? 0;

    return {
      profile,
      plan,
      dailyUsed,
      dailyLimit: FREE_DAILY_LIMIT,
      remainingToday: plan === "pro" ? null : Math.max(0, FREE_DAILY_LIMIT - dailyUsed) + balance,
      credits: balance,
      uploads: uploadsRes.data ?? [],
      isAdmin: (rolesRes.data ?? []).some((r) => r.role === "admin"),
    };
  });

export const startRemovalJob = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => startInput.parse(data))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const today = new Date().toISOString().slice(0, 10);

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("plan, daily_used, daily_reset_on")
      .eq("id", userId)
      .maybeSingle();
    if (profileError) throw profileError;
    if (!profile) throw new Error("Profile not found");

    const dailyUsed = profile.daily_reset_on === today ? profile.daily_used : 0;
    const { data: creditRow } = await supabase
      .from("credits")
      .select("balance")
      .eq("user_id", userId)
      .maybeSingle();
    const balance = creditRow?.balance ?? 0;

    let useCredit = false;
    if (profile.plan !== "pro") {
      if (dailyUsed >= FREE_DAILY_LIMIT) {
        if (balance <= 0) {
          throw new Error("Daily free limit reached. Upgrade to Pro or buy credits to continue.");
        }
        useCredit = true;
      }
    }

    const { data: upload, error: insertError } = await supabase
      .from("uploads")
      .insert({
        user_id: userId,
        original_name: data.originalName,
        mime_type: data.mimeType,
        size_bytes: data.sizeBytes,
        width: data.width,
        height: data.height,
        status: "processing",
        credits_used: useCredit ? 1 : 0,
      })
      .select("id")
      .single();
    if (insertError) throw insertError;

    if (useCredit) {
      const { error: creditError } = await supabase
        .from("credits")
        .update({ balance: balance - 1, updated_at: new Date().toISOString() })
        .eq("user_id", userId);
      if (creditError) throw creditError;
    } else if (profile.plan !== "pro") {
      const { error: usageError } = await supabase
        .from("profiles")
        .update({ daily_used: dailyUsed + 1, daily_reset_on: today })
        .eq("id", userId);
      if (usageError) throw usageError;
    }

    return { uploadId: upload.id, usedCredit: useCredit };
  });

export const completeRemovalJob = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => completeInput.parse(data))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase
      .from("uploads")
      .update({
        status: "succeeded",
        result_path: data.resultPath,
        processing_ms: data.processingMs,
      })
      .eq("id", data.uploadId)
      .eq("user_id", userId);
    if (error) throw error;
    return { ok: true };
  });

export const failRemovalJob = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => failInput.parse(data))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase
      .from("uploads")
      .update({ status: "failed", error_message: data.message })
      .eq("id", data.uploadId)
      .eq("user_id", userId);
    if (error) throw error;
    return { ok: true };
  });
