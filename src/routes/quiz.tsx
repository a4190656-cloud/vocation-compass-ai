import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, ArrowRight, Check, Loader2, Sparkles, SkipForward } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { BrandHeader, SiteFooter } from "@/components/brand";
import { analyzeFreeText } from "@/lib/ai.functions";
import {
  QUESTIONS,
  RESULT_KEY,
  STORAGE_KEY,
  computeTop,
  emptyScores,
  hollandCode,
  type RiasecKey,
  type Scores,
} from "@/lib/riasec";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/quiz")({
  head: () => ({
    meta: [
      { title: "שאלון האבחון | מצפן" },
      {
        name: "description",
        content:
          "שאלון קצר לגילוי הנטיות התעסוקתיות שלך, עם אפשרות להוסיף תשובה חופשית שמנותחת בבינה מלאכותית.",
      },
      { property: "og:title", content: "שאלון אבחון תעסוקתי RIASEC" },
      {
        property: "og:description",
        content: "ענה בקצב שלך - ההתקדמות נשמרת אוטומטית במכשיר שלך.",
      },
    ],
  }),
  component: Quiz,
});

const TOTAL = QUESTIONS.length;

interface Saved {
  index?: number;
  answers?: Record<string, number[]>;
  free?: Record<string, string>;
  aiScores?: Record<string, Partial<Scores>>;
  user?: { name: string; email: string };
}

function load(): Saved {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}") as Saved;
  } catch {
    return {};
  }
}

function Quiz() {
  const navigate = useNavigate();
  const analyze = useServerFn(analyzeFreeText);
  const [ready, setReady] = useState(false);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number[]>>({});
  const [free, setFree] = useState<Record<string, string>>({});
  const [aiScores, setAiScores] = useState<Record<string, Partial<Scores>>>({});
  const [openAi, setOpenAi] = useState(false);
  const [busy, setBusy] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);

  useEffect(() => {
    const s = load();
    if (!s.user?.name || !s.user?.email) {
      toast.error("נא למלא שם ואימייל לפני תחילת האבחון");
      navigate({ to: "/" });
      return;
    }
    setUser(s.user);
    setIndex(Math.min(s.index ?? 0, TOTAL - 1));
    setAnswers(s.answers ?? {});
    setFree(s.free ?? {});
    setAiScores(s.aiScores ?? {});
    setReady(true);
  }, [navigate]);

  const persist = (patch: Partial<Saved>) => {
    const s = load();
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...s, ...patch }));
  };

  const question = QUESTIONS[index];
  const progress = Math.round((index / TOTAL) * 100);
  const isLast = index === TOTAL - 1;

  const selected = useMemo(
    () => (question ? (answers[question.id] ?? []) : []),
    [answers, question],
  );

  const toggle = (i: number) => {
    if (!question) return;
    const cur = answers[question.id] ?? [];
    const next = question.multi
      ? cur.includes(i)
        ? cur.filter((x) => x !== i)
        : [...cur, i]
      : [i];
    const updated = { ...answers, [question.id]: next };
    setAnswers(updated);
    persist({ answers: updated });
    if (!question.multi && !isLast && !openAi) setTimeout(() => go(index + 1, updated), 180);
  };

  const go = (next: number, ans = answers) => {
    if (next >= TOTAL) {
      void finish(aiScores, ans);
      return;
    }
    const clamped = Math.max(0, Math.min(TOTAL - 1, next));
    setIndex(clamped);
    setOpenAi(false);
    persist({ index: clamped, answers: ans });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const finish = async (
    finalAi: Record<string, Partial<Scores>>,
    finalAnswers: Record<string, number[]> = answers,
  ) => {
    setBusy(true);
    const scores: Scores = emptyScores();
    for (const q of QUESTIONS) {
      for (const i of finalAnswers[q.id] ?? []) {
        const ch = q.choices[i];
        if (!ch) continue;
        for (const [k, v] of Object.entries(ch.weights)) {
          scores[k as RiasecKey] += v ?? 0;
        }
      }
    }
    for (const partial of Object.values(finalAi)) {
      for (const [k, v] of Object.entries(partial)) {
        scores[k as RiasecKey] += (v ?? 0) * 2;
      }
    }
    const top = computeTop(scores);
    const result = {
      scores,
      top,
      code: hollandCode(top),
      user,
      free,
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem(RESULT_KEY, JSON.stringify(result));

    if (user) {
      const { error } = await supabase.from("diagnoses").insert({
        full_name: user.name,
        email: user.email,
        scores: scores as unknown as Record<string, number>,
        top_codes: top,
      });
      if (error) console.error(error);
    }
    localStorage.removeItem(STORAGE_KEY);
    setBusy(false);
    navigate({ to: "/results" });
  };

  const submitManualAi = async () => {
    if (!question) return;
    const text = (free[question.id] ?? "").trim();
    if (text.length < 2) {
      toast.error("נא לכתוב תשובה קצרה לפחות");
      return;
    }
    setBusy(true);
    try {
      const res = await analyze({
        data: { question: question.text, text: text.slice(0, 500) },
      });
      const updated = { ...aiScores, [question.id]: res.scores };
      setAiScores(updated);
      persist({ aiScores: updated, free });
      if (res.summary) toast.success(res.summary);
      else toast.success("התשובה נותחה ונוספה לאבחון");
    } catch (e) {
      console.error(e);
      toast.error("הניתוח החכם לא הצליח, ממשיכים עם שאר התשובות");
    } finally {
      setBusy(false);
    }
  };

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <main className="mx-auto w-full max-w-2xl px-4 pb-24 pt-2">
      <BrandHeader />
      <div className="glass sticky top-4 z-10 px-4 py-3">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            שאלה {index + 1} מתוך {TOTAL}
          </span>
          <span>{progress}%</span>
        </div>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${Math.max(4, progress)}%` }}
          />
        </div>
      </div>

      {question && (
        <section className="glass-strong mt-8 p-6 sm:p-8">
          <h1 className="text-xl font-bold leading-relaxed">{question.text}</h1>
          {question.multi && (
            <p className="mt-1 text-sm text-muted-foreground">ניתן לבחור מספר תשובות</p>
          )}
          <div className="mt-6 space-y-3">
            {question.choices.map((c, i) => {
              const active = selected.includes(i);
              return (
                <button
                  key={c.label}
                  onClick={() => toggle(i)}
                  className={`flex w-full items-center justify-between gap-3 rounded-2xl border px-4 py-4 text-right text-sm transition-all ${
                    active
                      ? "border-primary bg-primary/15 font-semibold text-primary"
                      : "border-border bg-white/5 hover:border-primary/50"
                  }`}
                >
                  <span>{c.label}</span>
                  {active && <Check className="h-4 w-4 shrink-0" />}
                </button>
              );
            })}
          </div>

          <div className="mt-5 border-t border-border pt-4">
            {!openAi ? (
              <button
                onClick={() => setOpenAi(true)}
                className="inline-flex items-center gap-2 rounded-lg bg-primary/15 px-3 py-2 text-xs font-semibold text-primary transition-opacity hover:opacity-80"
              >
                <Sparkles className="h-3.5 w-3.5" />
                להוסיף בעצמי תשובה חופשית (ניתוח AI)
              </button>
            ) : (
              <div>
                <div className="inline-flex items-center gap-2 text-xs font-semibold text-primary">
                  <Sparkles className="h-3.5 w-3.5" />
                  כתוב בחופשיות - הבינה המלאכותית תנתח ותוסיף לאבחון
                </div>
                <Textarea
                  value={free[question.id] ?? ""}
                  maxLength={500}
                  rows={4}
                  onChange={(e) => {
                    const next = { ...free, [question.id]: e.target.value };
                    setFree(next);
                    persist({ free: next });
                  }}
                  placeholder="כתוב כאן..."
                  className="mt-3 resize-none bg-white/5"
                />
                <div className="mt-3 flex gap-2">
                  <Button variant="outline" size="sm" disabled={busy} onClick={submitManualAi}>
                    {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                    ניתוח התשובה
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setOpenAi(false)}>
                    סגירה
                  </Button>
                </div>
                {aiScores[question.id] && (
                  <p className="mt-2 text-[11px] text-primary">התשובה נותחה ונשמרה ✓</p>
                )}
              </div>
            )}
          </div>
        </section>
      )}

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <Button variant="ghost" onClick={() => go(index - 1)} disabled={index === 0 || busy}>
          <ArrowRight className="h-4 w-4" />
          הקודם
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={() => go(index + 1)} disabled={busy}>
            <SkipForward className="h-4 w-4" />
            דלג
          </Button>
          <Button
            variant={isLast ? "hero" : "outline"}
            onClick={() => go(index + 1)}
            disabled={busy || (answers[question?.id ?? ""] ?? []).length === 0}
          >
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            {isLast ? "סיים וקבל דוח" : "הבא"}
            {!isLast && <ArrowLeft className="h-4 w-4" />}
          </Button>
        </div>
      </div>
      <SiteFooter />
    </main>
  );
}
