import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from "recharts";
import { AlertTriangle, Download, MessageCircle, Share2, Star, Users } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { BrandHeader, SiteFooter } from "@/components/brand";
import { PaywallGate } from "@/components/paywall";
import {
  RESULT_KEY,
  WHATSAPP_GROUP,
  matchCareers,
  leastFitNotes,
  type Profile,
  type CareerMatch,
} from "@/lib/riasec";

export const Route = createFileRoute("/results")({
  head: () => ({
    meta: [
      { title: "המצפן האישי שלי | מצפן" },
      {
        name: "description",
        content: "המצפן האישי שלך: פרופיל נטיות, סגנון עבודה, ערכים תעסוקתיים ומקצועות מתאימים.",
      },
      { property: "og:title", content: "דוח אבחון תעסוקתי אישי" },
      {
        property: "og:description",
        content: "מפת נטיות תעסוקתיות אישית עם מקצועות מותאמים.",
      },
    ],
  }),
  component: Results,
});

export interface StoredResult {
  diagnosisId?: string;
  profile: Profile;
  user?: { name: string; email: string } | null;
}

function Results() {
  const navigate = useNavigate();
  const [result, setResult] = useState<StoredResult | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(RESULT_KEY);
      if (!raw) {
        navigate({ to: "/" });
        return;
      }
      setResult(JSON.parse(raw) as StoredResult);
    } catch {
      navigate({ to: "/" });
    }
  }, [navigate]);

  if (!result) return null;
  return <PaywallGate result={result} />;
}

export function ResultsView({ result, admin = false }: { result: StoredResult; admin?: boolean }) {
  const [rating, setRating] = useState(5);
  const [displayName, setDisplayName] = useState(result.user?.name ?? "");
  const [comment, setComment] = useState("");
  const [sent, setSent] = useState(false);

  const { profile } = result;
  const radarData = profile.riasec.map((d) => ({
    label: d.info.title.split(" ")[0] ?? d.key,
    value: d.percentOfMax,
  }));

  const matches: CareerMatch[] = matchCareers(profile, 8);
  const lessFit = leastFitNotes(profile);
  const topValues = profile.workValues.filter((v) => v.percentOfMax >= 40).slice(0, 4);
  const notableStyles = profile.workStyle.filter((s) => s.dominant !== "מאוזן");
  const careerFields = Array.from(new Set(matches.slice(0, 6).map((m) => m.career.field)));

  const main = profile.riasec[0]?.info ?? null;
  const second = profile.riasec[1]?.info ?? null;

  const topTitles = profile.riasec.slice(0, 3).map((d) => d.info.title);
  const shareText = [
    "🧭 *מצפן — עוזר לי להבין לאן ללכת*",
    "",
    `סיימתי עכשיו אבחון תעסוקתי, והנה עיקרי הדוח האישי שקיבלתי${result.user?.name ? ` (${result.user.name})` : ""}:`,
    "",
    "*הנטיות הבולטות שלי:*",
    ...topTitles.map((t, i) => `${i + 1}. ${t}`),
    "",
    main ? `*במילים פשוטות:* ${main.description}` : "",
    "",
    "*כיווני מקצוע שהומלצו לי:*",
    ...matches.slice(0, 6).map((m) => `• ${m.career.title}`),
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
      holland_code: profile.hollandCode,
    });
    if (error) {
      toast.error("שליחת חוות הדעת נכשלה");
      return;
    }
    setSent(true);
    toast.success("תודה רבה! חוות הדעת תפורסם לאחר אישור.");
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 lg:max-w-5xl lg:px-8 pb-20 pt-2">
      {!admin && <BrandHeader />}
      {!admin && (
        <section role="status" className="glass-strong mb-6 p-5 text-center">
          <h2 className="text-lg font-bold text-primary">תודה שסיימת את האבחון! 🎉</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            התשובות שלך התקבלו בהצלחה. נציג מטעמנו יעבור על התוצאות, ייצור איתך קשר בהקדם וישלח אליך
            לכתובת המייל את הדוח המלא עם ההמלצות האישיות.
          </p>
        </section>
      )}
      <header className="text-center">
        <p className="text-sm text-muted-foreground">
          {admin
            ? `הדוח של ${result.user?.name ?? "משתמש"}${result.user?.email ? ` · ${result.user.email}` : ""}`
            : result.user?.name ? `${result.user.name}, הנה הדוח שלך` : "הדוח האישי שלך"}
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl font-black">
          <span className="text-gradient">מצפן</span> — עוזר לי להבין לאן ללכת
        </h1>
        {main && <p className="mt-3 text-base font-semibold text-primary">{main.title}</p>}
        {main && <p className="mt-2 text-base text-muted-foreground">{main.description}</p>}
      </header>


      {profile.lowConfidence && (
        <div className="glass mt-6 flex items-start gap-3 border border-amber-500/30 p-4 text-sm">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
          <p className="text-muted-foreground">
            דילגת על מספר לא מבוטל של שאלות, כך שהדוח הזה עשוי להיות פחות מדויק ממה שהיה יכול להיות. מומלץ להתייחס
            אליו כנקודת פתיחה ולא כתמונה סופית.
          </p>
        </div>
      )}
      {!profile.consistency.reliable && (
        <div className="glass mt-3 flex items-start gap-3 border border-amber-500/30 p-4 text-sm">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
          <p className="text-muted-foreground">
            {profile.consistency.straightLining
              ? "שים לב: זיהינו שנתת תשובה דומה מאוד לרוב השאלות. זה עלול להעיד על מענה מהיר מדי, ומומלץ לעבור על השאלון שוב בעיון."
              : `שים לב: מדד העקביות הפנימית של התשובות שלך (${profile.consistency.responseConsistencyScore}/100) לא היה גבוה משמעותית ממה שהיה יוצא ממענה אקראי לגמרי על אותו שאלון. זה טבעי ולעיתים משקף פרופיל מורכב, אך כדאי להתייחס לדוח כנקודת פתיחה ולא כתמונה סופית.`}
          </p>
        </div>
      )}
      {profile.selfReportedDifficulty === "hard" && (
        <div className="glass mt-3 flex items-start gap-3 border border-amber-500/30 p-4 text-sm">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
          <p className="text-muted-foreground">
            ציינת שהיה לך קשה לענות על חלק מהשאלות - זה קורה, ולרוב אומר שהתמונה שלך עדיין מתגבשת. שווה לעבור על
            הדוח בעין ביקורתית ולא להתייחס אליו כפסק דין סופי.
          </p>
        </div>
      )}

      <section className="glass-strong mt-8 p-4 sm:p-6">
        <h2 className="text-lg font-bold">מפת הנטיות שלך</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          העוצמה משקפת את מידת ההעדפה שלך בכל ממד, ואינה אחוזון ביחס לאוכלוסייה.
        </p>
        <div className="mt-2 h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData} outerRadius="72%">
              <PolarGrid stroke="var(--glass-border)" />
              <PolarAngleAxis dataKey="label" tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
              <Radar dataKey="value" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.35} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {main && second && (
        <section className="glass mt-6 p-5">
          <h2 className="text-lg font-bold">השילוב שמאפיין אותך</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            הנטייה הבולטת ביותר אצלך היא <span className="font-semibold text-primary">{main.title}</span>, יחד עם
            <span className="font-semibold text-primary"> {second.title}</span> כנטייה משמעותית נוספת. השילוב הזה
            אומר שאתה עשוי להתאים יותר לתפקידים שמשלבים בין {main.short.toLowerCase()} לבין {second.short.toLowerCase()}
            , ופחות לתפקידים שדורשים רק צד אחד מהם באופן קיצוני.
          </p>
        </section>
      )}

      <section className="mt-8 space-y-4">
        <h2 className="text-lg font-bold">ששת הטיפוסים שלך, מהחזק לחלש</h2>
        {profile.riasec.map((d, i) => (
          <article key={d.key} className="glass p-5">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-primary">
                {i + 1}. {d.info.title}
              </h3>
              <span className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] text-muted-foreground">
                {d.level}
              </span>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{d.info.description}</p>
            {i < 3 && (
              <ul className="mt-3 flex flex-wrap gap-2">
                {d.info.strengths.map((s) => (
                  <li key={s} className="rounded-lg bg-white/5 px-2 py-1 text-[11px]">
                    {s}
                  </li>
                ))}
              </ul>
            )}
          </article>
        ))}
      </section>

      {notableStyles.length > 0 && (
        <section className="glass-strong mt-8 p-6">
          <h2 className="text-lg font-bold">סביבת העבודה שמתאימה לך</h2>
          <p className="mt-1 text-sm text-muted-foreground">איך אתה נוטה לתפקד, בלי קשר לתחום המקצועי עצמו.</p>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {notableStyles.map((s) => (
              <div key={s.key} className="rounded-xl border border-border bg-white/5 px-3 py-2 text-sm">
                <span className="font-semibold text-primary">
                  {s.dominant === "pos" ? s.info.posLabel : s.info.negLabel}
                </span>
                <span className="mr-1 text-muted-foreground"> · {s.info.title}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {topValues.length > 0 && (
        <section className="mt-8">
          <h2 className="text-lg font-bold">מה חשוב לך בפרנסה</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {topValues.map((v) => (
              <span key={v.key} className="rounded-full bg-primary/15 px-3 py-1.5 text-sm font-semibold text-primary">
                {v.label}
              </span>
            ))}
          </div>
        </section>
      )}

      {careerFields.length > 0 && (
        <section className="mt-8">
          <h2 className="text-lg font-bold">תחומי קריירה שכדאי לבדוק</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {careerFields.map((f) => (
              <span key={f} className="rounded-full border border-border bg-white/5 px-3 py-1.5 text-sm">
                {f}
              </span>
            ))}
          </div>
        </section>
      )}

      <section className="glass-strong mt-8 p-6">
        <h2 className="text-lg font-bold">מקצועות שעשויים להתאים לך</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          מיון לפי מידת ההתאמה לפרופיל שלך. זו רשימה לבדיקה ולא קביעה חד-משמעית.
        </p>
        <div className="mt-4 space-y-3">
          {matches.map((m) => (
            <article key={m.career.id} className="rounded-xl border border-border bg-white/5 p-4">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-bold">{m.career.title}</h3>
                <span className="shrink-0 rounded-full bg-primary/15 px-2 py-0.5 text-[11px] font-semibold text-primary">
                  {m.matchScore}% התאמה
                </span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{m.career.field}</p>
              {(m.sharedRiasec.length > 0 || m.sharedWorkValues.length > 0) && (
                <p className="mt-2 text-sm text-muted-foreground">
                  מתאים בעיקר בגלל הנטיות שלך ל
                  {m.sharedRiasec
                    .map((k) => profile.riasec.find((d) => d.key === k)?.info.title.split(" ")[0])
                    .filter(Boolean)
                    .join(", ")}
                  {m.sharedWorkValues.length > 0 && m.sharedRiasec.length > 0 ? ", ולערך שנתת ל" : m.sharedWorkValues.length > 0 ? "ערך שנתת ל" : ""}
                  {m.sharedWorkValues
                    .map((k) => profile.workValues.find((v) => v.key === k)?.label)
                    .filter(Boolean)
                    .join(", ")}
                  .
                </p>
              )}
              <p className="mt-2 text-xs text-muted-foreground">מה כדאי להכין: {m.career.requirements}</p>
            </article>
          ))}
        </div>
      </section>

      {lessFit.length > 0 && (
        <section className="mt-8">
          <h2 className="text-lg font-bold">מה עשוי להתאים פחות</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            אלה לא תחומים אסורים - רק כאלה שכדאי להיכנס אליהם בעיניים פקוחות.
          </p>
          <div className="mt-3 space-y-2">
            {lessFit.map((t) => (
              <div key={t.key} className="rounded-xl border border-border bg-white/5 p-3 text-sm text-muted-foreground">
                {t.lowDescription}
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="glass mt-8 p-5 text-sm text-muted-foreground">
        <h2 className="text-base font-bold text-foreground">לפני שמחליטים</h2>
        <p className="mt-2 leading-relaxed">
          כדאי לדבר עם מישהו שעובד בפועל באחד מהתחומים שעלו, לנסות יום התנסות או התנדבות קצרה אם אפשר, ולבדוק את
          דרישות הלימוד/ההכשרה בפועל מול מוסד לימוד. הדוח הזה נועד לתת כיוון, לא להחליט במקומך.
        </p>
      </section>

      {admin ? (
        <section className="mt-8 print:hidden">
          <Button variant="outline" className="w-full" onClick={() => window.print()}>
            <Download className="h-4 w-4" />
            שמירה כ-PDF
          </Button>
        </section>
      ) : (
      <>
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
            תודה! חוות הדעת שלך התקבלה ותפורסם באתר לאחר אישור.
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
            <div className="space-y-1.5">
              <label htmlFor="display-name" className="text-xs text-muted-foreground">
                שם מוצג — זה השם שיוצג לצד חוות הדעת שלך באתר
              </label>
              <Input
                id="display-name"
                value={displayName}
                maxLength={40}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="שם מוצג"
                className="bg-white/5"
              />
            </div>
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
      </>
      )}


      <div className="mt-8 text-center print:hidden">
        <Link to="/" className="text-sm text-muted-foreground underline underline-offset-4">
          חזרה לדף הבית
        </Link>
      </div>
      <SiteFooter />
    </main>
  );
}
