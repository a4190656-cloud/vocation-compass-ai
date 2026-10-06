import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/password-input";
import { BrandHeader, SiteFooter } from "@/components/brand";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "איפוס סיסמה | מצפן" },
      { name: "description", content: "קביעת סיסמה חדשה לאזור הניהול של מצפן." },
      { property: "og:title", content: "איפוס סיסמה | מצפן" },
      { property: "og:description", content: "קביעת סיסמה חדשה לאזור הניהול." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ResetPassword,
});

function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (password.length < 6) {
      toast.error("הסיסמה צריכה להכיל לפחות 6 תווים");
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("הסיסמה עודכנה");
    navigate({ to: "/admin" });
  };

  return (
    <main className="mx-auto w-full max-w-md px-4 pb-16">
      <BrandHeader />
      <section className="glass-strong mt-6 p-6">
        <h1 className="text-2xl font-bold">סיסמה חדשה</h1>
        <div className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="new-pass">סיסמה חדשה</Label>
            <PasswordInput
              id="new-pass"
              
              dir="ltr"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-12 bg-white/5 text-right"
            />
          </div>
          <Button variant="hero" size="xl" className="w-full" disabled={busy} onClick={submit}>
            שמירת סיסמה
          </Button>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
