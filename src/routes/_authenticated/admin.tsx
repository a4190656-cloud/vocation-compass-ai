import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Check, LogOut, Star, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { BrandHeader } from "@/components/brand";
import { ensureAdmin } from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "ניהול מערכת | מצפן" },
      { name: "description", content: "ניהול תוצאות אבחון, אישור ועריכת חוות דעת." },
      { property: "og:title", content: "ניהול מערכת | מצפן" },
      { property: "og:description", content: "לוח ניהול פנימי." },
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
}

function Admin() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const check = useServerFn(ensureAdmin);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [tab, setTab] = useState<"reviews" | "results">("reviews");
  const [edit, setEdit] = useState<Record<string, { display_name: string; comment: string }>>({});

  useEffect(() => {
    check({})
      .then((r) => setIsAdmin(r.isAdmin))
      .catch(() => setIsAdmin(false));
  }, [check]);

  const reviews = useQuery({
    queryKey: ["admin-reviews"],
    enabled: isAdmin === true,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reviews")
        .select("id, display_name, rating, comment, approved, created_at")
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
        .select("id, full_name, email, top_codes, created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["admin-reviews"] });
    qc.invalidateQueries({ queryKey: ["reviews"] });
  };

  const setApproved = async (id: string, approved: boolean) => {
    const { error } = await supabase.from("reviews").update({ approved }).eq("id", id);
    if (error) {
      toast.error("העדכון נכשל");
      return;
    }
    toast.success(approved ? "התגובה אושרה ומוצגת באתר" : "התגובה הוסרה מהתצוגה");
    refresh();
  };

  const saveEdit = async (id: string) => {
    const patch = edit[id];
    if (!patch) return;
    const { error } = await supabase
      .from("reviews")
      .update({
        display_name: patch.display_name.trim().slice(0, 40),
        comment: patch.comment.trim().slice(0, 300),
      })
      .eq("id", id);
    if (error) {
      toast.error("השמירה נכשלה");
      return;
    }
    setEdit((p) => {
      const n = { ...p };
      delete n[id];
      return n;
    });
    toast.success("התגובה נשמרה");
    refresh();
  };

  const removeReview = async (id: string) => {
    const { error } = await supabase.from("reviews").delete().eq("id", id);
    if (error) {
      toast.error("המחיקה נכשלה");
      return;
    }
    toast.success("התגובה נמחקה");
    refresh();
  };

  const removeResult = async (id: string) => {
    const { error } = await supabase.from("diagnoses").delete().eq("id", id);
    if (error) {
      toast.error("המחיקה נכשלה");
      return;
    }
    toast.success("התוצאה נמחקה");
    qc.invalidateQueries({ queryKey: ["admin-results"] });
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
          <p className="mt-2 text-sm text-muted-foreground">
            החשבון המחובר אינו מוגדר כמנהל המערכת.
          </p>
          <Button className="mt-4" variant="outline" onClick={signOut}>
            התנתקות
          </Button>
        </div>
      </main>
    );
  }

  const pending = (reviews.data ?? []).filter((r) => !r.approved).length;

  return (
    <main className="mx-auto w-full max-w-4xl px-4 pb-20">
      <BrandHeader />
      <header className="flex items-center justify-between">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-black">
            <span className="text-gradient">לוח ניהול</span>
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

      <div className="glass mt-6 flex gap-2 p-1.5">
        {(
          [
            ["reviews", `חוות דעת (${reviews.data?.length ?? 0})`],
            ["results", `תוצאות אבחון (${results.data?.length ?? 0})`],
          ] as const
        ).map(([k, label]) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            className={`flex-1 rounded-xl px-4 py-2 text-sm font-semibold transition ${
              tab === k ? "bg-primary/20 text-primary" : "text-muted-foreground"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "reviews" && (
        <section className="mt-6 space-y-3">
          {(reviews.data ?? []).map((r) => {
            const draft = edit[r.id];
            return (
              <article key={r.id} className="glass p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="flex items-center gap-2 text-sm font-semibold">
                    {r.display_name}
                    <span className="flex">
                      {Array.from({ length: r.rating }).map((_, i) => (
                        <Star key={i} className="h-3.5 w-3.5 fill-current text-[var(--gold)]" />
                      ))}
                    </span>
                  </span>
                  <span
                    className={`rounded-lg px-2 py-1 text-[11px] ${
                      r.approved ? "bg-primary/15 text-primary" : "bg-white/10 text-muted-foreground"
                    }`}
                  >
                    {r.approved ? "מאושר ומוצג" : "ממתין לאישור"}
                  </span>
                </div>

                {draft ? (
                  <div className="mt-3 space-y-2">
                    <Input
                      value={draft.display_name}
                      maxLength={40}
                      placeholder="שם מוצג"
                      className="bg-white/5"
                      onChange={(e) =>
                        setEdit((p) => ({ ...p, [r.id]: { ...draft, display_name: e.target.value } }))
                      }
                    />
                    <Textarea
                      value={draft.comment}
                      maxLength={300}
                      rows={3}
                      className="resize-none bg-white/5"
                      onChange={(e) =>
                        setEdit((p) => ({ ...p, [r.id]: { ...draft, comment: e.target.value } }))
                      }
                    />
                    <div className="flex gap-2">
                      <Button size="sm" variant="hero" onClick={() => saveEdit(r.id)}>
                        שמירה
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          setEdit((p) => {
                            const n = { ...p };
                            delete n[r.id];
                            return n;
                          })
                        }
                      >
                        ביטול
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{r.comment}</p>
                )}

                {!draft && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {r.approved ? (
                      <Button size="sm" variant="outline" onClick={() => setApproved(r.id, false)}>
                        <X className="h-4 w-4" />
                        הסתרה
                      </Button>
                    ) : (
                      <Button size="sm" variant="hero" onClick={() => setApproved(r.id, true)}>
                        <Check className="h-4 w-4" />
                        אישור לפרסום
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        setEdit((p) => ({
                          ...p,
                          [r.id]: { display_name: r.display_name, comment: r.comment },
                        }))
                      }
                    >
                      עריכה
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => removeReview(r.id)}>
                      <Trash2 className="h-4 w-4" />
                      מחיקה
                    </Button>
                  </div>
                )}
              </article>
            );
          })}
          {reviews.isLoading && <p className="text-sm text-muted-foreground">טוען...</p>}
        </section>
      )}

      {tab === "results" && (
        <section className="mt-6 space-y-3">
          {(results.data ?? []).map((d) => (
            <article key={d.id} className="glass flex flex-wrap items-center justify-between gap-3 p-4">
              <div>
                <p className="text-sm font-semibold">{d.full_name}</p>
                <p dir="ltr" className="text-right text-xs text-muted-foreground">
                  {d.email}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {new Date(d.created_at).toLocaleString("he-IL")}
                </p>
              </div>
              <Button size="sm" variant="outline" onClick={() => removeResult(d.id)}>
                <Trash2 className="h-4 w-4" />
                מחיקה
              </Button>
            </article>
          ))}
          {results.isLoading && <p className="text-sm text-muted-foreground">טוען...</p>}
        </section>
      )}
    </main>
  );
}
