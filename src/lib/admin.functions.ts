import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/** The single owner account allowed to become admin automatically. */
const OWNER_EMAIL = "a4190656@gmail.com";

/**
 * Grants the admin role to the owner account on login,
 * and reports whether the current user is an admin.
 */
export const ensureAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const email = String(context.claims["email"] ?? "").toLowerCase();

    if (email === OWNER_EMAIL) {
      try {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        await supabaseAdmin
          .from("user_roles")
          .upsert({ user_id: context.userId, role: "admin" }, { onConflict: "user_id,role" });
      } catch (e) {
        console.error("ensureAdmin upsert failed", e);
      }
    }

    const { data, error } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (error) console.error("has_role failed", error);
    return { isAdmin: Boolean(data) };
  });
