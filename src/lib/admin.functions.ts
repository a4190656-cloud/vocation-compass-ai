import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/** The single owner account allowed to become admin automatically. */
const OWNER_EMAIL = "a4190656@gmail.com";

/**
 * Grants the admin role to the owner account on first login,
 * and reports whether the current user is an admin.
 */
export const ensureAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const email = String(context.claims["email"] ?? "").toLowerCase();

    if (email === OWNER_EMAIL) {
      await supabaseAdmin
        .from("user_roles")
        .upsert({ user_id: context.userId, role: "admin" }, { onConflict: "user_id,role" });
    }

    const { data } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId)
      .eq("role", "admin")
      .maybeSingle();

    return { isAdmin: Boolean(data) };
  });
