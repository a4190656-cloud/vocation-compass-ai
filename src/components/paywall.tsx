import { useEffect, useState } from "react";
import { Check, Loader2, Lock, Mail, MessageCircle, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { BrandHeader, SiteFooter, OWNER } from "@/components/brand";
import { ResultsView, type StoredResult } from "@/routes/results";

type Plan = "report_only" | "report_with_consultation";
type Method = "bit" | "bank_transfer";

export const PLANS: Record<Plan, { title: string; price: number; desc: string }> = {
  report_only: {
    title: "אבחון תעסוקתי ממוחשב מקצועי",
    price: 45,
    desc: "פתיחת דוח תוצאות מפורט ומלא לפי מודל הולנד (RIASEC)",
  },
  report_with_consultation: {
    title: "אבחון + ייעוץ אישי מקצועי",
    price: 90,
    desc: "דוח תוצאות מלא + שיחת ייעוץ אישית ומקצועית (ייעוץ טלפוני או בזום)",
  },
};
export const METHOD_LABEL: Record<Method, string> = { bit: "ביט", bank_transfer: "העברה בנקאית" };

interface Access {
  payment_status: string;
  selected_plan: Plan | null;
  payment_method: Method | null;
}

export function PaywallGate({ result }: { result: StoredResult }) {
  const id = result.diagnosisId;
  const [access, setAccess] = useState<Access | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!id) {
      // דוחות ישנים שנשמרו לפני מנגנון התשלום
      setAccess({ payment_status: "paid", selected_plan: null, payment_method: null });
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data } = await supabase.rpc("get_diagnosis_access" as never, { _id: id } as never);
    const row = (data as unknown as Access[] | null)?.[0];
    setAccess(row ?? { payment_status: "pending", selected_plan: null, payment_method: null });
    setLoading(false);
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading && !access) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (access?.payment_status === "paid") {
    return (
      <>
        {access.selected_plan === "report_with_consultation" && (
          <div className="mx-auto mt-4 max-w-3xl px-4 lg:max-w-5xl lg:px-8">
            <div role="status" className="glass-strong border-2 border-primary p-4 text-center font-bold text-primary">
              בחרת במסלול הכולל ייעוץ אישי — הצוות שלנו ייצור איתך קשר בהקדם לתיאום פגישת הייעוץ.
            </div>
          </div>
        )}
        <ResultsView result={result} />
      </>
    );
  }

  return <Checkout result={result} access={access} onRefresh={load} refreshing={loading} />;
}

function Checkout({
  result,
  access,
  onRefresh,
  refreshing,
}: {
  result: StoredResult;
  access: Access | null;
  onRefresh: () => void;
  refreshing: boolean;
}) {
  const [plan, setPlan] = useState<Plan | null>(access?.selected_plan ?? null);
  const [method, setMethod] = useState<Method | null>(access?.payment_method ?? null);
  const [done, setDone] = useState(Boolean(access?.selected_plan && access?.payment_method));
  const [saving, setSaving] = useState(false);
  const name = result.user?.name ?? "";

  const confirm = async () => {
    if (!plan || !method || !result.diagnosisId) return;
    setSaving(true);
    const { error } = await supabase.rpc(
      "choose_diagnosis_plan" as never,
      { _id: result.diagnosisId, _plan: plan, _method: method } as never,
    );
    setSaving(false);
    if (error) {
      toast.error("השמירה נכשלה, נסו שוב");
      return;
    }
    setDone(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const price = plan ? PLANS[plan].price : 0;
  const msg = plan && method ? `היי, סיימתי את אבחון מצפן התעסוקתי.\nשם: ${name}\nמסלול: ${PLANS[plan].title} (${price} ₪)\nאמצעי תשלום: ${METHOD_LABEL[method]}\nאשמח לקבל פרטי תשלום ולשלוח אסמכתא.` : "";
  const waUrl = `https://wa.me/972${OWNER.phone.slice(1)}?text=${encodeURIComponent(msg)}`;
  const mailUrl = `mailto:${OWNER.email}?subject=${encodeURIComponent(`בקשת פרטי תשלום - מצפן - ${name}`)}&body=${encodeURIComponent(msg)}`;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 pb-20 pt-2 lg:max-w-4xl lg:px-8">
      <BrandHeader />

      <section className="glass-strong relative mt-4 overflow-hidden p-6 text-center">
        <div className="pointer-events-none absolute inset-0 select-none opacity-30 blur-md" aria-hidden="true">
          <div className="mx-auto mt-6 h-40 w-40 rounded-full border-8 border-primary/50" />
          <div className="mx-auto mt-4 h-3 w-2/3 rounded bg-primary/40" />
          <div className="mx-auto mt-2 h-3 w-1/2 rounded bg-primary/30" />
        </div>
        <div className="relative">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-primary/15">
            <Lock className="h-7 w-7 text-primary" />
          </span>
          <h1 className="mt-3 text-2xl font-black">התוצאות שלך מוכנות!</h1>
          <p className="mt-2 text-sm text-muted-foreground">הגישה תפתח מיידית ברגע שאישור התשלום יאושר על ידי הצוות (ברענון הדף).</p>
        </div>
      </section>

      {!done ? (
        <>
          <section className="mt-6">
            <h2 className="text-lg font-bold">שלב 1: בחירת מסלול</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {(Object.keys(PLANS) as Plan[]).map((k) => {
                const p = PLANS[k];
                const active = plan === k;
                return (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setPlan(k)}
                    aria-pressed={active}
                    className={`glass p-5 text-right transition-all ${active ? "border-2 border-primary bg-primary/10" : "hover:border-primary/50"}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold">{p.title}</h3>
                      {active && <Check className="h-5 w-5 shrink-0 text-primary" />}
                    </div>
                    <p className="mt-2 text-3xl font-black text-primary">
                      {p.price} ₪ <span className="text-sm font-medium text-muted-foreground">בלבד</span>
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">{p.desc}</p>
                  </button>
                );
              })}
            </div>
          </section>

          {plan && (
            <section className="mt-6">
              <h2 className="text-lg font-bold">שלב 2: אמצעי תשלום</h2>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {(Object.keys(METHOD_LABEL) as Method[]).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMethod(m)}
                    aria-pressed={method === m}
                    className={`glass flex items-center justify-between p-5 text-right font-bold ${method === m ? "border-2 border-primary bg-primary/10" : "hover:border-primary/50"}`}
                  >
                    {METHOD_LABEL[m]}
                    {method === m && <Check className="h-5 w-5 text-primary" />}
                  </button>
                ))}
              </div>
              <Button variant="hero" size="xl" className="mt-5 w-full" disabled={!method || saving} onClick={confirm}>
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                המשך להנחיות תשלום
              </Button>
            </section>
          )}
        </>
      ) : (
        plan &&
        method && (
          <section className="glass-strong mt-6 space-y-5 p-6">
            <div>
              <h2 className="text-lg font-bold">שלב 3: הנחיות תשלום</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                מסלול: <b className="text-foreground">{PLANS[plan].title}</b> · סכום:{" "}
                <b className="text-primary">{price} ₪</b> · אמצעי: <b className="text-foreground">{METHOD_LABEL[method]}</b>
              </p>
            </div>

            <div>
              <h3 className="font-bold">ליצירת קשר לקבלת פרטי תשלום ושליחת אסמכתא</h3>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-bold text-white"
                  style={{ backgroundColor: "#25D366" }}
                >
                  <MessageCircle className="h-5 w-5" /> ליצירת קשר לקבלת פרטי תשלום ושליחת אסמכתא
                </a>
                <a
                  href={mailUrl}
                  className="flex items-center justify-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-bold text-primary-foreground"
                >
                  <Mail className="h-5 w-5" /> יצירת קשר במייל
                </a>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                טלפון: <span dir="ltr">{OWNER.phone}</span> · מייל: <span dir="ltr">{OWNER.email}</span>
              </p>
            </div>

            <p role="status" className="rounded-2xl bg-primary/10 p-4 text-sm font-semibold text-primary">
              תודה רבה! לאחר קבלת האסמכתא נאשר את התשלום, והתוצאות המלאות ייפתחו לצפייה מיידית ברענון הדף.
            </p>

            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={onRefresh} disabled={refreshing}>
                <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} /> בדיקה אם התשלום אושר
              </Button>
              <Button variant="ghost" onClick={() => setDone(false)}>שינוי מסלול / אמצעי תשלום</Button>
            </div>
          </section>
        )
      )}
      <SiteFooter />
    </main>
  );
}
