import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Accessibility, RotateCcw, X } from "lucide-react";

interface Prefs {
  fontStep: number;
  contrast: boolean;
  links: boolean;
  noMotion: boolean;
  readable: boolean;
}

const DEFAULTS: Prefs = {
  fontStep: 0,
  contrast: false,
  links: false,
  noMotion: false,
  readable: false,
};

const KEY = "a11y-prefs";

export function AccessibilityWidget() {
  const [open, setOpen] = useState(false);
  const [prefs, setPrefs] = useState<Prefs>(DEFAULTS);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setPrefs({ ...DEFAULTS, ...(JSON.parse(raw) as Partial<Prefs>) });
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const el = document.documentElement;
    el.style.fontSize = `${100 + prefs.fontStep * 10}%`;
    el.classList.toggle("a11y-contrast", prefs.contrast);
    el.classList.toggle("a11y-links", prefs.links);
    el.classList.toggle("a11y-no-motion", prefs.noMotion);
    el.classList.toggle("a11y-readable", prefs.readable);
    localStorage.setItem(KEY, JSON.stringify(prefs));
  }, [prefs, hydrated]);

  const set = (patch: Partial<Prefs>) => setPrefs((p) => ({ ...p, ...patch }));

  const toggles: { label: string; active: boolean; onClick: () => void }[] = [
    { label: "ניגודיות גבוהה", active: prefs.contrast, onClick: () => set({ contrast: !prefs.contrast }) },
    { label: "הדגשת קישורים", active: prefs.links, onClick: () => set({ links: !prefs.links }) },
    { label: "עצירת אנימציות", active: prefs.noMotion, onClick: () => set({ noMotion: !prefs.noMotion }) },
    { label: "גופן קריא", active: prefs.readable, onClick: () => set({ readable: !prefs.readable }) },
  ];

  return (
    <div className="print:hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label="תפריט נגישות"
        className="fixed bottom-4 left-4 z-50 grid h-12 w-12 place-items-center rounded-full bg-primary text-primary-foreground shadow-lg outline-offset-4 transition-transform hover:scale-105"
      >
        {open ? <X className="h-5 w-5" /> : <Accessibility className="h-6 w-6" />}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="הגדרות נגישות"
          className="glass-strong fixed bottom-20 left-4 z-50 w-64 rounded-2xl p-4 text-right"
        >
          <h2 className="text-sm font-bold text-primary">הגדרות נגישות</h2>

          <div className="mt-3">
            <p className="text-xs text-muted-foreground">גודל טקסט</p>
            <div className="mt-2 flex items-center gap-2">
              <button
                type="button"
                aria-label="הקטנת טקסט"
                onClick={() => set({ fontStep: Math.max(-1, prefs.fontStep - 1) })}
                className="h-9 flex-1 rounded-xl border border-border bg-white/5 text-sm font-bold"
              >
                A-
              </button>
              <span className="w-10 text-center text-xs">{100 + prefs.fontStep * 10}%</span>
              <button
                type="button"
                aria-label="הגדלת טקסט"
                onClick={() => set({ fontStep: Math.min(4, prefs.fontStep + 1) })}
                className="h-9 flex-1 rounded-xl border border-border bg-white/5 text-sm font-bold"
              >
                A+
              </button>
            </div>
          </div>

          <div className="mt-3 space-y-2">
            {toggles.map((t) => (
              <button
                key={t.label}
                type="button"
                aria-pressed={t.active}
                onClick={t.onClick}
                className={`w-full rounded-xl border px-3 py-2 text-xs transition-colors ${
                  t.active
                    ? "border-primary bg-primary/15 font-semibold text-primary"
                    : "border-border bg-white/5"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setPrefs(DEFAULTS)}
            className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border px-3 py-2 text-xs"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            איפוס הגדרות
          </button>

          <Link
            to="/accessibility"
            onClick={() => setOpen(false)}
            className="mt-3 block text-center text-[11px] text-muted-foreground underline underline-offset-4"
          >
            הצהרת נגישות
          </Link>
        </div>
      )}
    </div>
  );
}
