import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Brain, Sparkles, Star, FileText, Timer, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { BrandHeader, SiteFooter } from "@/components/brand";
import { STORAGE_KEY } from "@/lib/riasec";
import { toast } from "sonner";
import brainAsset from "@/assets/brain-icon.png.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "אבחון תעסוקתי חכם | מצפן" },
      {
        name: "description",
        content:
          "20 שאלות, ניתוח בינה מלאכותית ודוח אישי עם כיווני קריירה מדויקים. בעברית מלאה.",
      },
      { property: "og:title", content: "אבחון תעסוקתי חכם" },
      {
        property: "og:description",
        content: "מצפן אישי בשילוב AI - גלה את הכיוון התעסוקתי שמתאים לך באמת.",
      },
    ],
  }),
  component: Home,
});

interface UserInfo {
  name: string;
  email: string;
}

const FEATURES = [
  {
    icon: Sparkles,
    title: "ניתוח AI חכם",
    text: "הקלידו תשובות חופשיות והבינה המלאכותית שלנו תדע לנתח את האישיות שלכם.",
  },
  {
    icon: Brain,
    title: "מותאם אישית",
    text: "אפשרות לבחור מספר תשובות בכל השאלות כדי לשקף מורכבות אישית, וביטול בחירה פשוט.",
  },
  {
    icon: FileText,
    title: "דוח מפורט",
    text: "בסיום תקבלו מפת אישיות מקיפה והמלצות קריירה מדויקות להורדה ושיתוף.",
  },
];

function Home() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [agreed, setAgreed] = useState(false);
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
        .select("id, display_name, rating, comment, created_at")
        .gte("rating", 4)
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
    if (!agreed) {
      toast.error("יש לאשר את תנאי השימוש ומדיניות הפרטיות");
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
      JSON.stringify({
        ...existing,
        user: { name: cleanName, email: cleanEmail },
        consentAt: new Date().toISOString(),
      }),
    );
    navigate({ to: "/quiz" });
  };

  const restart = () => {
    localStorage.removeItem(STORAGE_KEY);
    setHasProgress(false);
    toast.success("האבחון אופס, אפשר להתחיל מחדש");
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 pb-16">
      <BrandHeader />

      <header className="mt-4 text-center">
        <img
          src={brainAsset.url}
          alt="סמל אבחון מבוסס בינה מלאכותית"
          className="mx-auto h-24 w-24 drop-shadow-[0_18px_45px_oklch(0.82_0.135_190/45%)]"
        />
        <div className="glass mx-auto mt-6 inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-primary">
          <Sparkles className="h-4 w-4" />
          אבחון נטיות תעסוקתיות בשילוב בינה מלאכותית
        </div>
        <h1 className="mt-6 font-[family-name:var(--font-display)] text-4xl font-black leading-tight sm:text-5xl">
          <span className="text-gradient">גלה את הכיוון התעסוקתי</span>
          <br />
          שבאמת מתאים לך
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground">
          20 שאלות קצרות, ניתוח חכם של התשובות שלך, ודוח אישי - מצפן שעוזר לך להבין לאן ללכת,
          עם רשימת מקצועות מדויקת שמתאימה לך.
        </p>
        <div className="mt-4 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <Timer className="h-3.5 w-3.5" />
          כרבע שעה
        </div>
      </header>

      <section className="mt-10 grid gap-3 sm:grid-cols-3">
        {FEATURES.map(({ icon: Icon, title, text }) => (
          <article key={title} className="glass p-5">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/15">
              <Icon className="h-5 w-5 text-primary" />
            </span>
            <h2 className="mt-3 text-sm font-bold">{title}</h2>
            <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{text}</p>
          </article>
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
          <div className="flex items-start gap-3 rounded-2xl border border-border bg-white/5 p-4">
            <Checkbox
              id="consent"
              checked={agreed}
              onCheckedChange={(v) => setAgreed(v === true)}
              className="mt-0.5"
            />
            <Label htmlFor="consent" className="text-xs font-normal leading-relaxed">
              קראתי ואני מאשר/ת את{" "}
              <Link to="/terms" className="text-primary underline underline-offset-4">
                תנאי השימוש
              </Link>{" "}
              ואת{" "}
              <Link to="/privacy" className="text-primary underline underline-offset-4">
                מדיניות הפרטיות ואבטחת המידע
              </Link>
              , ומסכים/ה לעיבוד תשובותיי לצורך הפקת הדוח האישי ולשליחתו למייל שלי.
            </Label>
          </div>
          <Button variant="hero" size="xl" className="w-full" disabled={!agreed} onClick={start}>
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
            </article>
          ))}
          {reviews.isLoading && (
            <div className="glass p-4 text-sm text-muted-foreground">טוען חוות דעת...</div>
          )}
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
