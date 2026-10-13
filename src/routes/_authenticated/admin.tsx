import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  BarChart3,
  Check,
  Download,
  History,
  LogOut,
  MessageSquare,
  RotateCcw,
  Search,
  Settings,
  Star,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { BrandHeader } from "@/components/brand";
import { ensureAdmin } from "@/lib/admin.functions";
import { fetchSiteSettings, type SiteSettings } from "@/lib/site-settings";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "ניהול מערכת | מצפן" },
      { name: "description", content: "ניהול תוצאות אבחון, חוות דעת, סל מחזור, היסטוריה והגדרות." },
      { property: "og:title", content: "ניהול מערכת | מצפן" },
      { property: "og:description", content: "לוח ניהול פנימי." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Admin,
});

interface ReviewRow {
  id: string;
  display_name: string;
  rating: number;
  comment: string;
  approved: boolean;
  created_at: string;
  deleted_at: string | null;
}
interface ResultRow {
  id: string;
  full_name: string;
  email: string;
  top_codes: string[];
  created_at: string;
  deleted_at: string | null;
  admin_note: string;
}
interface ActivityRow {
  id: string;
  action: string;
  target_type: string;
  details: string;
  created_at: string;
}

type Tab = "overview" | "reviews" | "results" | "trash" | "history" | "settings";

const fmt = (d: string) => new Date(d).toLocaleString("he-IL");

function downloadCsv(name: string, rows: (string | number)[][]) {
  const csv =
    "\uFEFF" +
    rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

function Stars({ n }: { n: number }) {
  return (
    <span className="flex">
      {Array.from({ length: n }).map((_, i) => (
        <Star key={i} className="h-3.5 w-3.5 fill-current text-[var(--gold)]" />
      ))}
    </span>
  );
}

function Admin() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const check = useServerFn(ensureAdmin);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [tab, setTab] = useState<Tab>("overview");

  useEffect(() => {
    let cancelled = false;
    const directCheck = async (): Promise<boolean> => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return false;
      const { data } = await supabase.rpc("has_role", { _user_id: u.user.id, _role: "admin" });
      return Boolean(data);
    };
    const run = async (attempt: number): Promise<void> => {
      try {
        // Fast path: ask the database directly from the browser.
        if (await directCheck().catch(() => false)) {
          if (!cancelled) setIsAdmin(true);
          return;
        }
        const r = await check({});
        if (r.isAdmin || attempt >= 2) {
          if (!cancelled) setIsAdmin(r.isAdmin);
          return;
        }
      } catch {
        if (attempt >= 2) {
          if (!cancelled) setIsAdmin(false);
          return;
        }
      }
      await new Promise((res) => setTimeout(res, 1000));
      return run(attempt + 1);
    };
    run(0);
    return () => {
      cancelled = true;
    };
  }, [check]);

  const reviews = useQuery({
    queryKey: ["admin-reviews"],
    enabled: isAdmin === true,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reviews")
        .select("id, display_name, rating, comment, approved, created_at, deleted_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as ReviewRow[];
    },
  });

  const results = useQuery({
    queryKey: ["admin-results"],
    enabled: isAdmin === true,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("diagnoses")
        .select("id, full_name, email, top_codes, created_at, deleted_at, admin_note")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as ResultRow[];
    },
  });

  const activity = useQuery({
    queryKey: ["admin-activity"],
    enabled: isAdmin === true,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("admin_activity")
        .select("id, action, target_type, details, created_at")
        .order("created_at", { ascending: false })
        .limit(300);
      if (error) throw error;
      return data as ActivityRow[];
    },
  });

  const log = async (action: string, target_type: string, details: string, target_id?: string) => {
    await supabase.from("admin_activity").insert({ action, target_type, details, target_id: target_id ?? null });
    qc.invalidateQueries({ queryKey: ["admin-activity"] });
  };

  const refreshAll = () => {
    qc.invalidateQueries({ queryKey: ["admin-reviews"] });
    qc.invalidateQueries({ queryKey: ["admin-results"] });
    qc.invalidateQueries({ queryKey: ["reviews"] });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/auth" });
  };

  if (isAdmin === null) {
    return <main className="p-8 text-center text-sm text-muted-foreground">טוען...</main>;
  }

  if (!isAdmin) {
    return (
      <main className="mx-auto w-full max-w-md px-4">
        <BrandHeader />
        <div className="glass mt-6 p-6 text-center">
          <h1 className="text-lg font-bold">אין לך הרשאת ניהול</h1>
          <p className="mt-2 text-sm text-muted-foreground">החשבון המחובר אינו מוגדר כמנהל המערכת.</p>
          <div className="mt-4 flex justify-center gap-2">
            <Button onClick={() => window.location.reload()}>נסה שוב</Button>
            <Button variant="outline" onClick={signOut}>
              התנתקות
            </Button>
          </div>
        </div>
      </main>
    );
  }

  const allReviews = reviews.data ?? [];
  const allResults = results.data ?? [];
  const liveReviews = allReviews.filter((r) => !r.deleted_at);
  const liveResults = allResults.filter((r) => !r.deleted_at);
  const trashCount =
    allReviews.filter((r) => r.deleted_at).length + allResults.filter((r) => r.deleted_at).length;
  const pending = liveReviews.filter((r) => !r.approved).length;

  const tabs: [Tab, string, typeof Star][] = [
    ["overview", "סקירה", BarChart3],
    ["reviews", `חוות דעת (${liveReviews.length})`, MessageSquare],
    ["results", `תוצאות (${liveResults.length})`, Users],
    ["trash", `סל מחזור (${trashCount})`, Trash2],
    ["history", "היסטוריה", History],
    ["settings", "הגדרות", Settings],
  ];

  const ctx = { log, refreshAll };

  return (
    <main className="mx-auto w-full max-w-5xl px-4 lg:px-8 2xl:max-w-6xl pb-20">
      <BrandHeader />
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-black">
            <span className="text-gradient">האזור האישי — ניהול</span>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {pending > 0 ? `${pending} תגובות ממתינות לאישור` : "אין תגובות שממתינות לאישור"}
          </p>
        </div>
        <Button variant="outline" onClick={signOut}>
          <LogOut className="h-4 w-4" />
          יציאה
        </Button>
      </header>

      <nav className="glass mt-6 grid grid-cols-3 gap-1.5 p-1.5 sm:grid-cols-6" aria-label="אזורי ניהול">
        {tabs.map(([k, label, Icon]) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            aria-current={tab === k ? "page" : undefined}
            className={`flex flex-col items-center gap-1 rounded-xl px-2 py-2 text-xs font-semibold transition sm:text-sm ${
              tab === k ? "bg-primary/20 text-primary" : "text-muted-foreground hover:bg-white/5"
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </nav>

      {tab === "overview" && (
        <Overview reviews={liveReviews} results={liveResults} pending={pending} trash={trashCount} go={setTab} />
      )}
      {tab === "reviews" && <ReviewsTab rows={liveReviews} loading={reviews.isLoading} {...ctx} />}
      {tab === "results" && <ResultsTab rows={liveResults} loading={results.isLoading} {...ctx} />}
      {tab === "trash" && (
        <TrashTab
          reviews={allReviews.filter((r) => r.deleted_at)}
          results={allResults.filter((r) => r.deleted_at)}
          {...ctx}
        />
      )}
      {tab === "history" && (
        <HistoryTab
          rows={activity.data ?? []}
          clear={async () => {
            if (!confirm("למחוק את כל היסטוריית הפעולות?")) return;
            await supabase.from("admin_activity").delete().not("id", "is", null);
            qc.invalidateQueries({ queryKey: ["admin-activity"] });
            toast.success("ההיסטוריה נוקתה");
          }}
        />
      )}
      {tab === "settings" && <SettingsTab reviews={liveReviews} results={liveResults} log={log} />}
    </main>
  );
}

interface Ctx {
  log: (action: string, type: string, details: string, id?: string) => Promise<void>;
  refreshAll: () => void;
}

/* ---------------- Overview ---------------- */
function Overview({
  reviews,
  results,
  pending,
  trash,
  go,
}: {
  reviews: ReviewRow[];
  results: ResultRow[];
  pending: number;
  trash: number;
  go: (t: Tab) => void;
}) {
  const weekAgo = Date.now() - 7 * 864e5;
  const monthAgo = Date.now() - 30 * 864e5;
  const avg = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : "—";
  const dist = [5, 4, 3, 2, 1].map((n) => ({ n, c: reviews.filter((r) => r.rating === n).length }));
  const maxDist = Math.max(1, ...dist.map((d) => d.c));
  const cards: [string, string | number, Tab][] = [
    ["אבחונים סה״כ", results.length, "results"],
    ["אבחונים השבוע", results.filter((r) => +new Date(r.created_at) > weekAgo).length, "results"],
    ["אבחונים החודש", results.filter((r) => +new Date(r.created_at) > monthAgo).length, "results"],
    ["חוות דעת", reviews.length, "reviews"],
    ["ממתינות לאישור", pending, "reviews"],
    ["דירוג ממוצע", avg, "reviews"],
    ["פריטים בסל מחזור", trash, "trash"],
  ];
  return (
    <section className="mt-6 space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {cards.map(([label, val, t]) => (
          <button key={label} onClick={() => go(t)} className="glass p-4 text-right transition hover:bg-white/5">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="mt-1 text-2xl font-black text-primary">{val}</p>
          </button>
        ))}
      </div>
      <div className="glass p-5">
        <h2 className="font-bold">התפלגות דירוגים</h2>
        <div className="mt-3 space-y-2">
          {dist.map((d) => (
            <div key={d.n} className="flex items-center gap-3 text-sm">
              <span className="w-10">{d.n} ★</span>
              <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-white/10">
                <div className="h-full bg-primary" style={{ width: `${(d.c / maxDist) * 100}%` }} />
              </div>
              <span className="w-8 text-left text-muted-foreground">{d.c}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="glass p-5">
        <h2 className="font-bold">אבחונים אחרונים</h2>
        <ul className="mt-3 divide-y divide-white/10 text-sm">
          {results.slice(0, 5).map((r) => (
            <li key={r.id} className="flex justify-between py-2">
              <span>{r.full_name}</span>
              <span className="text-xs text-muted-foreground">{fmt(r.created_at)}</span>
            </li>
          ))}
          {!results.length && <li className="py-2 text-muted-foreground">עדיין אין אבחונים</li>}
        </ul>
      </div>
    </section>
  );
}

/* ---------------- Reviews ---------------- */
function ReviewsTab({ rows, loading, log, refreshAll }: { rows: ReviewRow[]; loading: boolean } & Ctx) {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"all" | "pending" | "approved">("all");
  const [minStars, setMinStars] = useState(1);
  const [sort, setSort] = useState<"new" | "old" | "high" | "low">("new");
  const [edit, setEdit] = useState<Record<string, { display_name: string; comment: string; rating: number }>>({});
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const list = useMemo(() => {
    const s = q.trim();
    const out = rows.filter(
      (r) =>
        (!s || r.display_name.includes(s) || r.comment.includes(s)) &&
        (status === "all" || (status === "approved" ? r.approved : !r.approved)) &&
        r.rating >= minStars,
    );
    return [...out].sort((a, b) =>
      sort === "new"
        ? b.created_at.localeCompare(a.created_at)
        : sort === "old"
          ? a.created_at.localeCompare(b.created_at)
          : sort === "high"
            ? b.rating - a.rating
            : a.rating - b.rating,
    );
  }, [rows, q, status, minStars, sort]);

  const update = async (ids: string[], patch: Partial<ReviewRow>, action: string, msg: string) => {
    if (!ids.length) return;
    const { error } = await supabase.from("reviews").update(patch).in("id", ids);
    if (error) { toast.error("הפעולה נכשלה"); return; }
    toast.success(msg);
    await log(action, "review", `${ids.length} תגובות`);
    setSelected(new Set());
    refreshAll();
  };

  const saveEdit = async (r: ReviewRow) => {
    const d = edit[r.id];
    if (!d) return;
    const name = d.display_name.trim().slice(0, 40);
    if (!name) { toast.error("שם מוצג חובה"); return; }
    const { error } = await supabase
      .from("reviews")
      .update({ display_name: name, comment: d.comment.trim().slice(0, 300), rating: d.rating })
      .eq("id", r.id);
    if (error) { toast.error("השמירה נכשלה"); return; }
    setEdit((p) => {
      const n = { ...p };
      delete n[r.id];
      return n;
    });
    toast.success("התגובה נשמרה");
    await log("עריכת תגובה", "review", name, r.id);
    refreshAll();
  };

  const toggle = (id: string) =>
    setSelected((p) => {
      const n = new Set(p);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  const sel = [...selected];
  const pendingIds = rows.filter((r) => !r.approved).map((r) => r.id);

  return (
    <section className="mt-6 space-y-3">
      <div className="glass space-y-3 p-4">
        <div className="relative">
          <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="חיפוש לפי שם או תוכן" className="bg-white/5 pr-9" aria-label="חיפוש תגובות" />
        </div>
        <div className="flex flex-wrap gap-2 text-sm">
          <select value={status} onChange={(e) => setStatus(e.target.value as typeof status)} className="rounded-lg border border-white/10 bg-background px-2 py-1.5" aria-label="סטטוס">
            <option value="all">כל הסטטוסים</option>
            <option value="pending">ממתינות</option>
            <option value="approved">מאושרות</option>
          </select>
          <select value={minStars} onChange={(e) => setMinStars(Number(e.target.value))} className="rounded-lg border border-white/10 bg-background px-2 py-1.5" aria-label="דירוג מינימלי">
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>{n}+ כוכבים</option>
            ))}
          </select>
          <select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} className="rounded-lg border border-white/10 bg-background px-2 py-1.5" aria-label="מיון">
            <option value="new">חדש לישן</option>
            <option value="old">ישן לחדש</option>
            <option value="high">דירוג גבוה</option>
            <option value="low">דירוג נמוך</option>
          </select>
          {pendingIds.length > 0 && (
            <Button size="sm" variant="hero" onClick={() => update(pendingIds, { approved: true }, "אישור כל הממתינות", "כל הממתינות אושרו")}>
              <Check className="h-4 w-4" /> אשר את כל הממתינות
            </Button>
          )}
        </div>
        {sel.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 rounded-xl bg-primary/10 p-2 text-sm">
            <span className="font-semibold">{sel.length} נבחרו</span>
            <Button size="sm" variant="outline" onClick={() => update(sel, { approved: true }, "אישור מרובה", "אושרו")}>אישור</Button>
            <Button size="sm" variant="outline" onClick={() => update(sel, { approved: false }, "הסתרה מרובה", "הוסתרו")}>הסתרה</Button>
            <Button size="sm" variant="outline" onClick={() => update(sel, { deleted_at: new Date().toISOString() }, "העברה לסל מחזור", "הועברו לסל המחזור")}>
              <Trash2 className="h-4 w-4" /> לסל מחזור
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setSelected(new Set())}>ביטול בחירה</Button>
          </div>
        )}
        <p className="text-xs text-muted-foreground">מוצגות {list.length} מתוך {rows.length}</p>
      </div>

      {list.map((r) => {
        const d = edit[r.id];
        return (
          <article key={r.id} className="glass p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="flex items-center gap-2 text-sm font-semibold">
                <input type="checkbox" checked={selected.has(r.id)} onChange={() => toggle(r.id)} aria-label={`בחירת ${r.display_name}`} />
                {r.display_name}
                <Stars n={r.rating} />
              </label>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-muted-foreground">{fmt(r.created_at)}</span>
                <span className={`rounded-lg px-2 py-1 text-[11px] ${r.approved ? "bg-primary/15 text-primary" : "bg-white/10 text-muted-foreground"}`}>
                  {r.approved ? "מאושר ומוצג" : "ממתין לאישור"}
                </span>
              </div>
            </div>

            {d ? (
              <div className="mt-3 space-y-2">
                <Input value={d.display_name} maxLength={40} placeholder="שם מוצג" className="bg-white/5" onChange={(e) => setEdit((p) => ({ ...p, [r.id]: { ...d, display_name: e.target.value } }))} />
                <div className="flex gap-1" role="radiogroup" aria-label="דירוג">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button key={n} type="button" role="radio" aria-checked={d.rating === n} aria-label={`${n} כוכבים`} onClick={() => setEdit((p) => ({ ...p, [r.id]: { ...d, rating: n } }))}>
                      <Star className={`h-6 w-6 ${n <= d.rating ? "fill-current text-[var(--gold)]" : "text-muted-foreground"}`} />
                    </button>
                  ))}
                </div>
                <Textarea value={d.comment} maxLength={300} rows={3} className="resize-none bg-white/5" onChange={(e) => setEdit((p) => ({ ...p, [r.id]: { ...d, comment: e.target.value } }))} />
                <p className="text-xs text-muted-foreground">{d.comment.length}/300</p>
                <div className="flex gap-2">
                  <Button size="sm" variant="hero" onClick={() => saveEdit(r)}>שמירה</Button>
                  <Button size="sm" variant="outline" onClick={() => setEdit((p) => { const n = { ...p }; delete n[r.id]; return n; })}>ביטול</Button>
                </div>
              </div>
            ) : (
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{r.comment || "—"}</p>
            )}

            {!d && (
              <div className="mt-3 flex flex-wrap gap-2">
                {r.approved ? (
                  <Button size="sm" variant="outline" onClick={() => update([r.id], { approved: false }, "הסתרת תגובה", "התגובה הוסתרה")}>
                    <X className="h-4 w-4" /> הסתרה
                  </Button>
                ) : (
                  <Button size="sm" variant="hero" onClick={() => update([r.id], { approved: true }, "אישור תגובה", "התגובה אושרה ומוצגת באתר")}>
                    <Check className="h-4 w-4" /> אישור לפרסום
                  </Button>
                )}
                <Button size="sm" variant="outline" onClick={() => setEdit((p) => ({ ...p, [r.id]: { display_name: r.display_name, comment: r.comment, rating: r.rating } }))}>עריכה</Button>
                <Button size="sm" variant="outline" onClick={() => update([r.id], { deleted_at: new Date().toISOString() }, "העברה לסל מחזור", "התגובה הועברה לסל המחזור")}>
                  <Trash2 className="h-4 w-4" /> לסל מחזור
                </Button>
              </div>
            )}
          </article>
        );
      })}
      {loading && <p className="text-sm text-muted-foreground">טוען...</p>}
      {!loading && !list.length && <p className="glass p-4 text-sm text-muted-foreground">לא נמצאו תגובות</p>}
    </section>
  );
}

/* ---------------- Results ---------------- */
function ResultsTab({ rows, loading, log, refreshAll }: { rows: ResultRow[]; loading: boolean } & Ctx) {
  const [q, setQ] = useState("");
  const [range, setRange] = useState<"all" | "7" | "30">("all");
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [open, setOpen] = useState<string | null>(null);

  const list = rows.filter((r) => {
    const s = q.trim().toLowerCase();
    const okQ = !s || r.full_name.toLowerCase().includes(s) || r.email.toLowerCase().includes(s);
    const okR = range === "all" || +new Date(r.created_at) > Date.now() - Number(range) * 864e5;
    return okQ && okR;
  });

  const trash = async (r: ResultRow) => {
    const { error } = await supabase.from("diagnoses").update({ deleted_at: new Date().toISOString() }).eq("id", r.id);
    if (error) { toast.error("הפעולה נכשלה"); return; }
    toast.success("התוצאה הועברה לסל המחזור");
    await log("העברה לסל מחזור", "result", r.full_name, r.id);
    refreshAll();
  };

  const saveNote = async (r: ResultRow) => {
    const note = (notes[r.id] ?? "").slice(0, 1000);
    const { error } = await supabase.from("diagnoses").update({ admin_note: note }).eq("id", r.id);
    if (error) { toast.error("השמירה נכשלה"); return; }
    toast.success("ההערה נשמרה");
    await log("הערה פנימית", "result", r.full_name, r.id);
    refreshAll();
  };

  return (
    <section className="mt-6 space-y-3">
      <div className="glass flex flex-wrap gap-2 p-4">
        <div className="relative min-w-[200px] flex-1">
          <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="חיפוש לפי שם או מייל" className="bg-white/5 pr-9" aria-label="חיפוש תוצאות" />
        </div>
        <select value={range} onChange={(e) => setRange(e.target.value as typeof range)} className="rounded-lg border border-white/10 bg-background px-2 py-1.5 text-sm" aria-label="טווח זמן">
          <option value="all">כל הזמנים</option>
          <option value="7">7 ימים אחרונים</option>
          <option value="30">30 ימים אחרונים</option>
        </select>
        <Button size="sm" variant="outline" onClick={() => downloadCsv("diagnoses.csv", [["שם", "מייל", "נטיות מובילות", "תאריך", "הערה"], ...list.map((r) => [r.full_name, r.email, r.top_codes.join(" "), fmt(r.created_at), r.admin_note])])}>
          <Download className="h-4 w-4" /> ייצוא לאקסל
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">מוצגות {list.length} מתוך {rows.length}</p>

      {list.map((d) => (
        <article key={d.id} className="glass p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <button className="text-right" onClick={() => setOpen(open === d.id ? null : d.id)} aria-expanded={open === d.id}>
              <p className="text-sm font-semibold">{d.full_name}</p>
              <p dir="ltr" className="text-right text-xs text-muted-foreground">{d.email}</p>
              <p className="mt-1 text-xs text-muted-foreground">{fmt(d.created_at)}</p>
            </button>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="hero" asChild>
                <Link to="/report/$id" params={{ id: d.id }}>דוח מלא</Link>
              </Button>
              <Button size="sm" variant="outline" asChild>
                <a href={`mailto:${d.email}`}>שליחת מייל</a>
              </Button>
              <Button size="sm" variant="outline" onClick={() => setOpen(open === d.id ? null : d.id)}>
                {open === d.id ? "סגירה" : "פרטים"}
              </Button>
              <Button size="sm" variant="outline" onClick={() => trash(d)}>
                <Trash2 className="h-4 w-4" /> לסל מחזור
              </Button>
            </div>
          </div>
          {open === d.id && (
            <div className="mt-3 space-y-2 border-t border-white/10 pt-3 text-sm">
              <p><span className="text-muted-foreground">נטיות מובילות: </span>{d.top_codes.join(" · ") || "—"}</p>
              <label className="block text-xs text-muted-foreground" htmlFor={`note-${d.id}`}>הערה פנימית (רק אתה רואה)</label>
              <Textarea id={`note-${d.id}`} rows={2} className="resize-none bg-white/5" value={notes[d.id] ?? d.admin_note} onChange={(e) => setNotes((p) => ({ ...p, [d.id]: e.target.value }))} />
              <Button size="sm" variant="hero" onClick={() => saveNote(d)}>שמירת הערה</Button>
            </div>
          )}
        </article>
      ))}
      {loading && <p className="text-sm text-muted-foreground">טוען...</p>}
      {!loading && !list.length && <p className="glass p-4 text-sm text-muted-foreground">לא נמצאו תוצאות</p>}
    </section>
  );
}

/* ---------------- Trash ---------------- */
function TrashTab({ reviews, results, log, refreshAll }: { reviews: ReviewRow[]; results: ResultRow[] } & Ctx) {
  const act = async (table: "reviews" | "diagnoses", id: string, label: string, restore: boolean) => {
    if (!restore && !confirm("מחיקה לצמיתות — לא ניתן לשחזר. להמשיך?")) return;
    const { error } = restore
      ? await supabase.from(table).update({ deleted_at: null }).eq("id", id)
      : await supabase.from(table).delete().eq("id", id);
    if (error) { toast.error("הפעולה נכשלה"); return; }
    toast.success(restore ? "שוחזר בהצלחה" : "נמחק לצמיתות");
    await log(restore ? "שחזור מסל מחזור" : "מחיקה לצמיתות", table === "reviews" ? "review" : "result", label, id);
    refreshAll();
  };

  const empty = async () => {
    if (!confirm("לרוקן את כל סל המחזור? הפריטים יימחקו לצמיתות.")) return;
    await supabase.from("reviews").delete().not("deleted_at", "is", null);
    await supabase.from("diagnoses").delete().not("deleted_at", "is", null);
    toast.success("סל המחזור רוקן");
    await log("ריקון סל מחזור", "trash", `${reviews.length + results.length} פריטים`);
    refreshAll();
  };

  const items = [
    ...reviews.map((r) => ({ id: r.id, table: "reviews" as const, title: r.display_name, sub: r.comment, kind: "חוות דעת", at: r.deleted_at! })),
    ...results.map((r) => ({ id: r.id, table: "diagnoses" as const, title: r.full_name, sub: r.email, kind: "תוצאת אבחון", at: r.deleted_at! })),
  ].sort((a, b) => b.at.localeCompare(a.at));

  return (
    <section className="mt-6 space-y-3">
      <div className="glass flex items-center justify-between p-4">
        <p className="text-sm text-muted-foreground">פריטים שנמחקו נשמרים כאן עד שתמחק אותם לצמיתות.</p>
        {items.length > 0 && (
          <Button size="sm" variant="outline" onClick={empty}>
            <Trash2 className="h-4 w-4" /> ריקון הסל
          </Button>
        )}
      </div>
      {items.map((i) => (
        <article key={i.id} className="glass flex flex-wrap items-center justify-between gap-3 p-4">
          <div className="min-w-0">
            <p className="text-sm font-semibold">{i.title} <span className="text-xs font-normal text-muted-foreground">· {i.kind}</span></p>
            <p className="truncate text-xs text-muted-foreground">{i.sub}</p>
            <p className="text-[11px] text-muted-foreground">נמחק: {fmt(i.at)}</p>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="hero" onClick={() => act(i.table, i.id, i.title, true)}>
              <RotateCcw className="h-4 w-4" /> שחזור
            </Button>
            <Button size="sm" variant="outline" onClick={() => act(i.table, i.id, i.title, false)}>מחיקה לצמיתות</Button>
          </div>
        </article>
      ))}
      {!items.length && <p className="glass p-4 text-sm text-muted-foreground">סל המחזור ריק</p>}
    </section>
  );
}

/* ---------------- History ---------------- */
function HistoryTab({ rows, clear }: { rows: ActivityRow[]; clear: () => void }) {
  const [q, setQ] = useState("");
  const list = rows.filter((r) => !q || r.action.includes(q) || r.details.includes(q));
  return (
    <section className="mt-6 space-y-3">
      <div className="glass flex flex-wrap gap-2 p-4">
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="חיפוש בהיסטוריה" className="flex-1 bg-white/5" aria-label="חיפוש בהיסטוריה" />
        <Button size="sm" variant="outline" onClick={() => downloadCsv("history.csv", [["פעולה", "סוג", "פרטים", "תאריך"], ...list.map((r) => [r.action, r.target_type, r.details, fmt(r.created_at)])])}>
          <Download className="h-4 w-4" /> ייצוא
        </Button>
        {rows.length > 0 && <Button size="sm" variant="outline" onClick={clear}>ניקוי היסטוריה</Button>}
      </div>
      <ul className="glass divide-y divide-white/10 p-2">
        {list.map((r) => (
          <li key={r.id} className="flex flex-wrap justify-between gap-2 p-2 text-sm">
            <span><span className="font-semibold">{r.action}</span>{r.details && <span className="text-muted-foreground"> — {r.details}</span>}</span>
            <span className="text-xs text-muted-foreground">{fmt(r.created_at)}</span>
          </li>
        ))}
        {!list.length && <li className="p-2 text-sm text-muted-foreground">אין פעולות להצגה</li>}
      </ul>
    </section>
  );
}

/* ---------------- Settings ---------------- */
function SettingsTab({ reviews, results, log }: { reviews: ReviewRow[]; results: ResultRow[]; log: Ctx["log"] }) {
  const qc = useQueryClient();
  const [s, setS] = useState<SiteSettings | null>(null);
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");

  useEffect(() => {
    fetchSiteSettings().then(setS);
  }, []);

  const save = async () => {
    if (!s) return;
    const rows = (Object.keys(s) as (keyof SiteSettings)[]).map((key) => ({
      key,
      value: s[key],
      updated_at: new Date().toISOString(),
    }));
    const { error } = await supabase.from("site_settings").upsert(rows);
    if (error) { toast.error("השמירה נכשלה"); return; }
    toast.success("ההגדרות נשמרו ומופיעות באתר");
    await log("עדכון הגדרות אתר", "settings", "");
    qc.invalidateQueries({ queryKey: ["site-settings"] });
    qc.invalidateQueries({ queryKey: ["reviews"] });
  };

  const changePw = async () => {
    if (pw.length < 6) { toast.error("סיסמה של 6 תווים לפחות"); return; }
    if (pw !== pw2) { toast.error("הסיסמאות אינן תואמות"); return; }
    const { error } = await supabase.auth.updateUser({ password: pw });
    if (error) { toast.error("שינוי הסיסמה נכשל"); return; }
    setPw("");
    setPw2("");
    toast.success("הסיסמה עודכנה");
    await log("שינוי סיסמה", "account", "");
  };

  if (!s) return <p className="mt-6 text-sm text-muted-foreground">טוען הגדרות...</p>;

  return (
    <section className="mt-6 space-y-4">
      <div className="glass space-y-4 p-5">
        <h2 className="font-bold">תצוגת האתר</h2>
        <label className="flex items-center justify-between gap-3 text-sm">
          הצגת אזור חוות הדעת בעמוד הראשי
          <input type="checkbox" className="h-5 w-5" checked={s.show_reviews} onChange={(e) => setS({ ...s, show_reviews: e.target.checked })} />
        </label>
        <label className="flex items-center justify-between gap-3 text-sm">
          דירוג מינימלי להצגה באתר
          <select value={s.min_public_rating} onChange={(e) => setS({ ...s, min_public_rating: Number(e.target.value) })} className="rounded-lg border border-white/10 bg-background px-2 py-1.5">
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>{n} כוכבים ומעלה</option>
            ))}
          </select>
        </label>
        <div className="space-y-1 text-sm">
          <label htmlFor="announce">הודעה בראש העמוד הראשי (ריק = ללא הודעה)</label>
          <Input id="announce" maxLength={160} value={s.announcement} onChange={(e) => setS({ ...s, announcement: e.target.value })} className="bg-white/5" placeholder="לדוגמה: חדש! דוח מורחב לכל משתמש" />
        </div>
        <Button variant="hero" onClick={save}>שמירת הגדרות</Button>
      </div>

      <div className="glass space-y-3 p-5">
        <h2 className="font-bold">גיבוי וייצוא</h2>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => downloadCsv("reviews.csv", [["שם", "דירוג", "תגובה", "מאושר", "תאריך"], ...reviews.map((r) => [r.display_name, r.rating, r.comment, r.approved ? "כן" : "לא", fmt(r.created_at)])])}>
            <Download className="h-4 w-4" /> כל חוות הדעת
          </Button>
          <Button variant="outline" size="sm" onClick={() => downloadCsv("diagnoses.csv", [["שם", "מייל", "נטיות", "תאריך"], ...results.map((r) => [r.full_name, r.email, r.top_codes.join(" "), fmt(r.created_at)])])}>
            <Download className="h-4 w-4" /> כל תוצאות האבחון
          </Button>
        </div>
      </div>

      <div className="glass space-y-3 p-5">
        <h2 className="font-bold">החשבון שלי</h2>
        <Input type="password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="סיסמה חדשה" className="bg-white/5" aria-label="סיסמה חדשה" autoComplete="new-password" />
        <Input type="password" value={pw2} onChange={(e) => setPw2(e.target.value)} placeholder="אימות סיסמה" className="bg-white/5" aria-label="אימות סיסמה" autoComplete="new-password" />
        <Button variant="outline" onClick={changePw}>שינוי סיסמה</Button>
      </div>
    </section>
  );
}
