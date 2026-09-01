import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from "recharts";
import { Download, MessageCircle, Share2, Star, Users } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { BrandHeader, SiteFooter } from "@/components/brand";
import {
  RESULT_KEY,
  TYPES,
  WHATSAPP_GROUP,
  normalize,
  recommendedCareers,
  type RiasecKey,
  type Scores,
} from "@/lib/riasec";

export const Route = createFileRoute("/results")({
  head: () => ({
    meta: [
      { title: "המצפן האישי שלי | מצפן" },
      {
        name: "description",
        content: "המצפן האישי שלך: גרף נטיות תעסוקתיות ורשימת מקצועות מותאמים לאורח החיים החרדי.",
      },
      { property: "og:title", content: "דוח אבחון תעסוקתי אישי" },
      {
        property: "og:description",
        content: "מפת נטיות תעסוקתיות אישית בשילוב ניתוח בינה מלאכותית.",
      },
    ],
  }),
  component: Results,
});

interface StoredResult {
  scores: Scores;
  top: RiasecKey[];
  code: string;
  user?: { name: string; email: string } | null;
}

function Results() {
  const navigate = useNavigate();
  const [result, setResult] = useState<StoredResult | null>(null);
  const [rating, setRating] = useState(5);
  const [displayName, setDisplayName] = useState("");
  const [comment, setComment] = useState("");
  const [sent, setSent] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(RESULT_KEY);
      if (!raw) {
        navigate({ to: "/" });
        return;
      }
      const parsed = JSON.parse(raw) as StoredResult;
      setResult(parsed);
      setDisplayName(parsed.user?.name ?? "");
    } catch {
      navigate({ to: "/" });
    }
  }, [navigate]);

  if (!result) return null;

  const data = normalize(result.scores);
  const careers = recommendedCareers(result.top);
  const main = result.top[0] ? TYPES[result.top[0]] : null;

  const topTitles = result.top.map((k) => TYPES[k].title);
  const shareText = [
    "🧭 *מצפן — עוזר לי להבין לאן ללכת*",
    "",
    `סיימתי עכשיו אבחון תעסוקתי חכם${result.user?.name ? ` (${result.user.name})` : ""}, והנה עיקרי הדוח האישי שקיבלתי:`,
    "",
    "*הנטיות הבולטות שלי:*",
    ...topTitles.map((t, i) => `${i + 1}. ${t}`),
    "",
    main ? `*במילים פשוטות:* ${main.description}` : "",
    "",
    "*כיווני מקצוע שהומלצו לי:*",
    ...careers.slice(0, 6).map((c) => `• ${c}`),
    "",
    "האבחון משלב שאלון נטיות מקצועי עם ניתוח בינה מלאכותית של תשובות חופשיות, והמקצועות מותאמים לאורח החיים שלנו.",
    "",
    `מומלץ בחום לעשות גם אתם: ${typeof window !== "undefined" ? window.location.origin : ""}`,
  ]
    .filter(Boolean)
    .join("\n");


  const submitReview = async () => {
    const name = displayName.trim();
    if (name.length < 2) {
      toast.error("נא להזין שם לתצוגה");
      return;
    }
    const { error } = await supabase.from("reviews").insert({
      display_name: name.slice(0, 40),
      rating,
      comment: comment.trim().slice(0, 300),
      holland_code: result.code,
    });
    if (error) {
      toast.error("שליחת חוות הדעת נכשלה");
      return;
    }
    setSent(true);
    toast.success("תודה רבה על הדירוג!");
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 pb-20 pt-2">
      <BrandHeader />
      <header className="text-center">
        <p className="text-sm text-muted-foreground">
          {result.user?.name ? `${result.user.name}, הנה הדוח שלך` : "הדוח האישי שלך"}
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl font-black">
          <span className="text-gradient">מצפן</span> — עוזר לי להבין לאן ללכת
        </h1>
        {main && (
          <p className="mt-3 text-base font-semibold text-primary">{main.title}</p>
        )}
        {main && <p className="mt-2 text-base text-muted-foreground">{main.description}</p>}
      </header>

      <section className="glass-strong mt-8 p-4 sm:p-6">
        <h2 className="text-lg font-bold">מפת הנטיות שלך</h2>
        <div className="mt-2 h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={data} outerRadius="72%">
              <PolarGrid stroke="var(--glass-border)" />
              <PolarAngleAxis
                dataKey="label"
                tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
              />
              <Radar
                dataKey="value"
                stroke="var(--primary)"
                fill="var(--primary)"
                fillOpacity={0.35}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="mt-8 space-y-4">
        <h2 className="text-lg font-bold">הטיפוסים הבולטים אצלך</h2>
        {result.top.map((k, i) => {
          const t = TYPES[k];
          return (
            <article key={k} className="glass p-5">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-primary">
                  {i + 1}. {t.title}
                </h3>
                <span className="text-xs text-muted-foreground">{t.short}</span>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t.description}</p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {t.strengths.map((s) => (
                  <li key={s} className="rounded-lg bg-white/5 px-2 py-1 text-[11px]">
                    {s}
                  </li>
                ))}
              </ul>
            </article>
          );
        })}
      </section>

      <section className="glass-strong mt-8 p-6">
        <h2 className="text-lg font-bold">מקצועות שמתאימים לך</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          הרשימה מסוננת ומותאמת לאורח החיים שלנו.
        </p>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {careers.map((c) => (
            <div key={c} className="rounded-xl border border-border bg-white/5 px-3 py-2 text-sm">
              {c}
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8 grid gap-3 sm:grid-cols-3 print:hidden">
        <Button variant="outline" onClick={() => window.print()}>
          <Download className="h-4 w-4" />
          שמירה כ-PDF
        </Button>
        <a
          href={`https://wa.me/?text=${encodeURIComponent(shareText)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-border bg-white/5 px-4 text-sm font-medium"
        >
          <Share2 className="h-4 w-4" />
          שיתוף בוואטסאפ
        </a>
        <a
          href={WHATSAPP_GROUP}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-primary/15 px-4 text-sm font-semibold text-primary"
        >
          <Users className="h-4 w-4" />
          הצטרפות לקהילה
        </a>
      </section>

      <section className="glass mt-10 p-6 print:hidden">
        <h2 className="flex items-center gap-2 text-lg font-bold">
          <MessageCircle className="h-5 w-5 text-primary" />
          איך היה האבחון?
        </h2>
        {sent ? (
          <p className="mt-3 text-sm text-muted-foreground">
            תודה! חוות הדעת שלך מופיעה עכשיו בדף הבית.
          </p>
        ) : (
          <div className="mt-4 space-y-4">
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} onClick={() => setRating(n)} aria-label={`דירוג ${n}`}>
                  <Star
                    className={`h-8 w-8 ${
                      n <= rating ? "fill-current text-[var(--gold)]" : "text-muted-foreground"
                    }`}
                  />
                </button>
              ))}
            </div>
            <Input
              value={displayName}
              maxLength={40}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="שם לתצוגה"
              className="bg-white/5"
            />
            <Textarea
              value={comment}
              maxLength={300}
              rows={3}
              onChange={(e) => setComment(e.target.value)}
              placeholder="מה הכי עזר לך באבחון?"
              className="resize-none bg-white/5"
            />
            <Button variant="hero" className="w-full" onClick={submitReview}>
              שליחת דירוג
            </Button>
          </div>
        )}
      </section>

      <div className="mt-8 text-center print:hidden">
        <Link to="/" className="text-sm text-muted-foreground underline underline-offset-4">
          חזרה לדף הבית
        </Link>
      </div>
      <SiteFooter />
    </main>
  );
}
