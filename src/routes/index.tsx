import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Brain, Sparkles, Star, ShieldCheck, Timer, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { STORAGE_KEY } from "@/lib/riasec";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "אבחון תעסוקתי חכם | התובנה הרגשית" },
      {
        name: "description",
        content:
          "20 שאלות, ניתוח בינה מלאכותית ודוח אישי עם כיווני קריירה מותאמים לציבור החרדי. חינם ובעברית מלאה.",
      },
      { property: "og:title", content: "אבחון תעסוקתי חכם למגזר החרדי" },
      {
        property: "og:description",
        content: "מודל RIASEC בשילוב AI - גלה את הכיוון התעסוקתי שמתאים לך באמת.",
      },
    ],
  }),
  component: Home,
});

interface UserInfo {
  name: string;
  email: string;
}

function Home() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [hasProgress, setHasProgress] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as { index?: number; user?: UserInfo };
        if ((parsed.index ?? 0) > 0) {
          setHasProgress(true);
          if (parsed.user) {
            setName(parsed.user.name ?? "");
            setEmail(parsed.user.email ?? "");
          }
        }
      }
    } catch {
      /* ignore */
    }
  }, []);

  const reviews = useQuery({
    queryKey: ["reviews"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reviews")
        .select("id, display_name, rating, comment, holland_code, created_at")
        .order("created_at", { ascending: false })
        .limit(12);
      if (error) throw error;
      return data;
    },
  });

  const avg =
    reviews.data && reviews.data.length
      ? (
          reviews.data.reduce((s, r) => s + (r.rating ?? 5), 0) / reviews.data.length
        ).toFixed(1)
      : "5.0";

  const start = () => {
    const cleanName = name.trim();
    const cleanEmail = email.trim();
    if (cleanName.length < 2 || cleanName.length > 60) {
      toast.error("נא להזין שם מלא (2-60 תווים)");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(cleanEmail) || cleanEmail.length > 255) {
      toast.error("נא להזין כתובת אימייל תקינה");
      return;
    }
    const existing = (() => {
      try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
      } catch {
        return {};
      }
    })();
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...existing, user: { name: cleanName, email: cleanEmail } }),
    );
    navigate({ to: "/quiz" });
  };

  const restart = () => {
    localStorage.removeItem(STORAGE_KEY);
    setHasProgress(false);
    toast.success("האבחון אופס, אפשר להתחיל מחדש");
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 pb-20 pt-10">
      <header className="text-center">
        <div className="glass mx-auto inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-primary">
          <Sparkles className="h-4 w-4" />
          אבחון מבוסס מודל RIASEC + בינה מלאכותית
        </div>
        <h1 className="mt-6 font-[family-name:var(--font-display)] text-4xl font-black leading-tight sm:text-5xl">
          <span className="text-gradient">גלה את הכיוון התעסוקתי</span>
          <br />
          שבאמת מתאים לך
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground">
          20 שאלות קצרות, ניתוח חכם של התשובות החופשיות שלך, ודוח אישי עם קוד הולנד מלא
          ורשימת מקצועות מסוננת ומותאמת לאורח החיים שלנו.
        </p>
      </header>

      <section className="mt-8 grid grid-cols-3 gap-3 text-center">
        {[
          { icon: Timer, label: "7 דקות" },
          { icon: Brain, label: "ניתוח AI" },
          { icon: ShieldCheck, label: "תוכן מותאם" },
        ].map(({ icon: Icon, label }) => (
          <div key={label} className="glass px-2 py-4">
            <Icon className="mx-auto h-5 w-5 text-primary" />
            <div className="mt-2 text-xs font-medium sm:text-sm">{label}</div>
          </div>
        ))}
      </section>

      <section className="glass-strong mt-8 p-6 sm:p-8">
        <h2 className="text-xl font-bold">נתחיל בהיכרות קצרה</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          השם ישמש להתאמה אישית של הדוח, והמייל לשליחת התוצאות אליך.
        </p>
        <div className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">שם מלא</Label>
            <Input
              id="name"
              value={name}
              maxLength={60}
              onChange={(e) => setName(e.target.value)}
              placeholder="ישראל ישראלי"
              className="h-12 bg-white/5"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">כתובת אימייל</Label>
            <Input
              id="email"
              type="email"
              dir="ltr"
              maxLength={255}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="h-12 bg-white/5 text-right"
            />
          </div>
          <Button variant="hero" size="xl" className="w-full" onClick={start}>
            {hasProgress ? "המשך מהמקום שעצרתי" : "מתחילים באבחון"}
            <ArrowLeft className="h-5 w-5" />
          </Button>
          {hasProgress && (
            <button
              onClick={restart}
              className="w-full text-center text-xs text-muted-foreground underline underline-offset-4"
            >
              מחק את ההתקדמות והתחל אבחון חדש
            </button>
          )}
        </div>
      </section>

      <section className="mt-12">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">מה אומרים מי שכבר עברו</h2>
          <div className="flex items-center gap-1 text-sm font-semibold text-[var(--gold)]">
            <Star className="h-4 w-4 fill-current" />
            {avg}
          </div>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {(reviews.data ?? []).map((r) => (
            <article key={r.id} className="glass p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">{r.display_name}</span>
                <span className="flex gap-0.5">
                  {Array.from({ length: r.rating ?? 5 }).map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-current text-[var(--gold)]" />
                  ))}
                </span>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{r.comment}</p>
              {r.holland_code && (
                <span className="mt-3 inline-block rounded-lg bg-primary/15 px-2 py-1 text-[11px] font-semibold text-primary">
                  קוד הולנד: {r.holland_code}
                </span>
              )}
            </article>
          ))}
          {reviews.isLoading && (
            <div className="glass p-4 text-sm text-muted-foreground">טוען חוות דעת...</div>
          )}
        </div>
      </section>
    </main>
  );
}
