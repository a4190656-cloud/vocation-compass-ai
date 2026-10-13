import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Loader2, SkipForward } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { BrandHeader, SiteFooter } from "@/components/brand";

import {
  QUESTIONS,
  TOTAL_QUESTIONS,
  RESULT_KEY,
  STORAGE_KEY,
  computeRawTotals,
  buildProfile,
  type AnswerMap,
} from "@/lib/riasec";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/quiz")({
  head: () => ({
    meta: [
      { title: "שאלון האבחון | מצפן" },
      {
        name: "description",
        content: "שאלון קצר לגילוי הנטיות התעסוקתיות, סגנון העבודה והערכים התעסוקתיים שלך.",
      },
      { property: "og:title", content: "שאלון אבחון תעסוקתי אישי" },
      {
        property: "og:description",
        content: "ענה בקצב שלך - ההתקדמות נשמרת אוטומטית במכשיר שלך.",
      },
    ],
  }),
  component: Quiz,
});

const TOTAL = TOTAL_QUESTIONS;
const SKIP_WARNING_THRESHOLD = 6;

interface Saved {
  index?: number;
  answers?: AnswerMap;
  skipped?: string[];
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
  const [ready, setReady] = useState(false);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [skipped, setSkipped] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [warnedSkip, setWarnedSkip] = useState(false);

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
    setSkipped(s.skipped ?? []);
    setReady(true);
  }, [navigate]);

  const persist = (patch: Partial<Saved>) => {
    const s = load();
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...s, ...patch }));
  };

  const question = QUESTIONS[index];
  const progress = Math.round((index / TOTAL) * 100);
  const isLast = index === TOTAL - 1;

  const selected = useMemo(() => (question ? answers[question.id] ?? [] : []), [answers, question]);

  const toggle = (i: number) => {
    if (!question) return;
    if (question.mode === "single") {
      const updated = { ...answers, [question.id]: [i] };
      setAnswers(updated);
      persist({ answers: updated });
      return;
    }
    const cur = answers[question.id] ?? [];
    if (!cur.includes(i) && question.maxSelect != null && cur.length >= question.maxSelect) {
      toast.warning(`ניתן לבחור עד ${question.maxSelect} אפשרויות בשאלה הזו`);
      return;
    }
    const next = cur.includes(i) ? cur.filter((x) => x !== i) : [...cur, i];
    const updated = { ...answers, [question.id]: next };
    setAnswers(updated);
    persist({ answers: updated });
  };

  const finish = async (finalAnswers: AnswerMap, finalSkipped: string[]) => {
    setBusy(true);
    const totals = computeRawTotals(finalAnswers);
    const profile = buildProfile(finalAnswers, totals, { skippedCount: finalSkipped.length });

    const result = {
      totals,
      profile,
      user,
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem(RESULT_KEY, JSON.stringify(result));

    if (user) {
      const { error } = await supabase.from("diagnoses").insert({
        full_name: user.name,
        email: user.email,
        scores: {
          riasec: totals.riasec,
          workStyle: totals.workStyle,
          workValues: totals.workValues,
          topCareers: profile.top,
          profile,
        } as unknown as import("@/integrations/supabase/types").Json,
        top_codes: profile.top,
      });
      if (error) console.error(error);
    }
    localStorage.removeItem(STORAGE_KEY);
    setBusy(false);
    navigate({ to: "/results" });
  };

  const go = (next: number, ans: AnswerMap = answers, skippedList: string[] = skipped) => {
    if (next >= TOTAL) {
      void finish(ans, skippedList);
      return;
    }
    const clamped = Math.max(0, Math.min(TOTAL - 1, next));
    setIndex(clamped);
    persist({ index: clamped, answers: ans, skipped: skippedList });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSkip = () => {
    if (!question) return;
    const already = skipped.includes(question.id);
    const nextSkipped = already ? skipped : [...skipped, question.id];
    setSkipped(nextSkipped);
    if (nextSkipped.length > SKIP_WARNING_THRESHOLD && !warnedSkip) {
      setWarnedSkip(true);
      toast.warning("דילגת על שאלות רבות - זה עלול להפחית את דיוק התוצאה");
    }
    go(index + 1, answers, nextSkipped);
  };

  const handleNext = () => {
    go(index + 1);
  };

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  const canProceed = (answers[question?.id ?? ""] ?? []).length > 0;

  return (
    <main className="mx-auto w-full max-w-2xl px-4 lg:max-w-3xl pb-24 pt-2">
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
          <p className="mt-1 text-sm text-muted-foreground">
            {question.mode === "single"
              ? "בחר תשובה אחת"
              : question.maxSelect
                ? `ניתן לבחור עד ${question.maxSelect} תשובות · לחיצה נוספת מבטלת בחירה`
                : "ניתן לבחור מספר תשובות · לחיצה נוספת מבטלת בחירה"}
          </p>

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
      )}

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <Button variant="ghost" onClick={() => go(index - 1)} disabled={index === 0 || busy}>
          <ArrowRight className="h-4 w-4" />
          הקודם
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={handleSkip} disabled={busy}>
            <SkipForward className="h-4 w-4" />
            דלג
          </Button>
          <Button variant={isLast ? "hero" : "outline"} onClick={handleNext} disabled={busy || !canProceed}>
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
