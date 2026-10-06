import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/password-input";
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
  const [mode, setMode] = useState<"in" | "up" | "reset">("in");
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
        toast.success("נשלח אליך מייל אימות - יש ללחוץ על הקישור ואז להתחבר");
        setMode("in");
        return;
      }
      if (mode === "reset") {
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        toast.success("נשלח אליך מייל לאיפוס הסיסמה");
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
          {mode === "in" ? "התחבר כדי לנהל תוצאות וחוות דעת." : mode === "up" ? "יצירת חשבון מנהל." : "הזן אימייל ונשלח קישור לאיפוס סיסמה."}
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
          {mode !== "reset" && (
            <div className="space-y-2">
              <Label htmlFor="admin-pass">סיסמה</Label>
              <PasswordInput
                id="admin-pass"
                
                dir="ltr"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 bg-white/5 text-right"
              />
            </div>
          )}
          <Button variant="hero" size="xl" className="w-full" disabled={busy} onClick={submit}>
            {mode === "in" ? "כניסה" : mode === "up" ? "יצירת חשבון" : "שליחת קישור איפוס"}
          </Button>
          <button
            onClick={() => setMode(mode === "in" ? "up" : "in")}
            className="w-full text-center text-xs text-muted-foreground underline underline-offset-4"
          >
            {mode === "in" ? "אין לי עדיין חשבון מנהל" : "חזרה לכניסה"}
          </button>
          {mode === "in" && (
            <button
              onClick={() => setMode("reset")}
              className="w-full text-center text-xs text-muted-foreground underline underline-offset-4"
            >
              שכחתי סיסמה
            </button>
          )}
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
