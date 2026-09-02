import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BrandHeader, SiteFooter } from "@/components/brand";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "כניסת מנהל | מצפן" },
      { name: "description", content: "כניסה לאזור הניהול של מצפן לצפייה בתוצאות ובחוות דעת." },
      { property: "og:title", content: "כניסת מנהל | מצפן" },
      { property: "og:description", content: "אזור ניהול פנימי של מערכת האבחון." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"in" | "up">("in");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true);
    try {
      if (mode === "up") {
        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { emailRedirectTo: `${window.location.origin}/admin` },
        });
        if (error) throw error;
        toast.success("החשבון נוצר, אפשר להתחבר");
        setMode("in");
        return;
      }
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) throw error;
      navigate({ to: "/admin" });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "הכניסה נכשלה");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="mx-auto w-full max-w-md px-4 pb-16">
      <BrandHeader />
      <section className="glass-strong mt-6 p-6">
        <h1 className="text-2xl font-bold">אזור ניהול</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {mode === "in" ? "התחבר כדי לנהל תוצאות וחוות דעת." : "יצירת חשבון מנהל."}
        </p>
        <div className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="admin-email">אימייל</Label>
            <Input
              id="admin-email"
              type="email"
              dir="ltr"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 bg-white/5 text-right"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="admin-pass">סיסמה</Label>
            <Input
              id="admin-pass"
              type="password"
              dir="ltr"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-12 bg-white/5 text-right"
            />
          </div>
          <Button variant="hero" size="xl" className="w-full" disabled={busy} onClick={submit}>
            {mode === "in" ? "כניסה" : "יצירת חשבון"}
          </Button>
          <button
            onClick={() => setMode(mode === "in" ? "up" : "in")}
            className="w-full text-center text-xs text-muted-foreground underline underline-offset-4"
          >
            {mode === "in" ? "אין לי עדיין חשבון מנהל" : "יש לי כבר חשבון"}
          </button>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
