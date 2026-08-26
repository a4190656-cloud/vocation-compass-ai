import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, ArrowRight, Check, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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
      { title: "שאלון האבחון | התובנה הרגשית" },
      {
        name: "description",
        content:
          "20 שאלות קצרות ושתי שאלות פתוחות שמנותחות בבינה מלאכותית, לגילוי קוד הולנד האישי שלך.",
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

const FREE_QUESTIONS = [
  {
    id: "f1",
    text: "ספר במילים שלך: מתי הרגשת הכי מסופק מעבודה או ממשימה שעשית?",
    hint: "כמה שורות זה מספיק - ה-AI ינתח את התשובה.",
  },
  {
    id: "f2",
    text: "מה היית רוצה שיהיה בעבודה הבאה שלך, ומה בשום אופן לא?",
    hint: "כתוב בחופשיות, אין תשובה נכונה.",
  },
];

const TOTAL = QUESTIONS.length + FREE_QUESTIONS.length;

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

  const isFree = index >= QUESTIONS.length;
  const question = QUESTIONS[index];
  const freeQ = FREE_QUESTIONS[index - QUESTIONS.length];
  const progress = Math.round((index / TOTAL) * 100);

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
    if (!question.multi) setTimeout(() => go(index + 1, updated), 180);
  };

  const go = (next: number, ans = answers) => {
    const clamped = Math.max(0, Math.min(TOTAL - 1, next));
    setIndex(clamped);
    persist({ index: clamped, answers: ans });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const finish = async (finalAi: Record<string, Partial<Scores>>) => {
    const scores: Scores = emptyScores();
    for (const q of QUESTIONS) {
      for (const i of answers[q.id] ?? []) {
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
    navigate({ to: "/results" });
  };

  const submitFree = async () => {
    if (!freeQ) return;
    const text = (free[freeQ.id] ?? "").trim();
    if (text.length < 2) {
      toast.error("נא לכתוב תשובה קצרה לפחות");
      return;
    }
    setBusy(true);
    let updatedAi = aiScores;
    try {
      const res = await analyze({
        data: { question: freeQ.text, text: text.slice(0, 500) },
      });
      updatedAi = { ...aiScores, [freeQ.id]: res.scores };
      setAiScores(updatedAi);
      persist({ aiScores: updatedAi, free });
      if (res.summary) toast.success(res.summary);
    } catch (e) {
      console.error(e);
      toast.error("הניתוח החכם לא הצליח, ממשיכים עם שאר התשובות");
    } finally {
      setBusy(false);
    }
    if (index === TOTAL - 1) {
      setBusy(true);
      await finish(updatedAi);
      setBusy(false);
    } else {
      go(index + 1);
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
    <main className="mx-auto w-full max-w-2xl px-4 pb-24 pt-8">
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

      {isFree && freeQ ? (
        <section className="glass-strong mt-8 p-6 sm:p-8">
          <div className="inline-flex items-center gap-2 rounded-lg bg-primary/15 px-2 py-1 text-[11px] font-semibold text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            שאלה פתוחה - ניתוח בינה מלאכותית
          </div>
          <h1 className="mt-4 text-xl font-bold leading-relaxed">{freeQ.text}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{freeQ.hint}</p>
          <Textarea
            value={free[freeQ.id] ?? ""}
            maxLength={500}
            rows={6}
            onChange={(e) => {
              const next = { ...free, [freeQ.id]: e.target.value };
              setFree(next);
              persist({ free: next });
            }}
            placeholder="כתוב כאן..."
            className="mt-5 resize-none bg-white/5"
          />
          <div className="mt-6 flex gap-3">
            <Button variant="hero" size="xl" className="flex-1" disabled={busy} onClick={submitFree}>
              {busy ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  מנתח את התשובה...
                </>
              ) : (
                <>
                  {index === TOTAL - 1 ? "סיים וקבל דוח" : "המשך"}
                  <ArrowLeft className="h-5 w-5" />
                </>
              )}
            </Button>
          </div>
        </section>
      ) : question ? (
        <section className="glass-strong mt-8 p-6 sm:p-8">
          <h1 className="text-xl font-bold leading-relaxed">{question.text}</h1>
          {question.multi && (
            <p className="mt-1 text-sm text-muted-foreground">אפשר לבחור יותר מתשובה אחת</p>
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
        </section>
      ) : null}

      <div className="mt-6 flex items-center justify-between">
        <Button variant="ghost" onClick={() => go(index - 1)} disabled={index === 0 || busy}>
          <ArrowRight className="h-4 w-4" />
          הקודם
        </Button>
        {!isFree && (
          <Button
            variant="outline"
            onClick={() => go(index + 1)}
            disabled={(answers[question?.id ?? ""] ?? []).length === 0}
          >
            הבא
            <ArrowLeft className="h-4 w-4" />
          </Button>
        )}
      </div>
    </main>
  );
}
