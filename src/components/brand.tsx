import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

const brainAsset = { url: "/brain-icon.webp" };
const aoAsset = { url: "/ao-logo.png" };

/** כפתור כניסה קטן ודיסקרטי בפינה — נראה רק לבעלים (מנהל מחובר) */
function AdminCornerLink() {
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    let active = true;
    const check = async () => {
      try {
        const { data } = await supabase.auth.getUser();
        if (active) setIsOwner(data.user?.email?.toLowerCase() === OWNER.email);
      } catch {
        if (active) setIsOwner(false);
      }
    };
    check();
    const { data: sub } = supabase.auth.onAuthStateChange(() => check());
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  if (!isOwner) return null;

  return (
    <Link
      to="/auth"
      aria-label="כניסה לאזור האישי של הניהול"
      title="כניסה לאזור האישי של הניהול"
      className="fixed bottom-3 left-3 z-50 grid h-8 w-8 place-items-center rounded-full bg-muted/60 text-xs text-muted-foreground opacity-40 shadow-sm backdrop-blur transition-opacity hover:opacity-100 print:hidden"
    >
      <span aria-hidden="true">🔐</span>
    </Link>
  );
}

export function BrandHeader() {
  return (
    <div className="flex items-center justify-between gap-3 py-4 print:hidden">
      <Link to="/" className="group flex items-center gap-3">
        <span className="glass grid h-11 w-11 place-items-center overflow-hidden rounded-2xl p-1.5">
          <img
            src={brainAsset.url}
            alt="סמל האבחון החכם"
            className="h-full w-full object-contain drop-shadow-[0_4px_14px_oklch(0.82_0.135_190/45%)]"
            loading="eager"
          />
        </span>
        <span className="leading-tight">
          <span className="block font-[family-name:var(--font-display)] text-sm font-black">
            מצפן
          </span>
          <span className="block text-[11px] text-muted-foreground">
            עוזר לי להבין לאן ללכת
          </span>
        </span>
      </Link>
      <img
        src={aoAsset.url}
        alt="לוגו A.O"
        className="h-9 w-auto opacity-90 mix-blend-screen"
        loading="lazy"
      />
    </div>
  );
}

export function SiteFooter() {
  return (
    <footer className="glass mt-14 px-5 py-6 text-center print:hidden">
      <img
        src={aoAsset.url}
        alt="לוגו A.O"
        className="mx-auto h-10 w-auto opacity-90 mix-blend-screen"
        loading="lazy"
      />
      <nav className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
        <Link to="/privacy" className="underline underline-offset-4 hover:text-primary">
          מדיניות פרטיות
        </Link>
        <Link to="/terms" className="underline underline-offset-4 hover:text-primary">
          תנאי שימוש
        </Link>
        <Link to="/accessibility" className="underline underline-offset-4 hover:text-primary">
          הצהרת נגישות
        </Link>
      </nav>
      <div className="mt-5">
        <Link
          to="/auth"
          className="glass-strong inline-flex items-center justify-center gap-2 rounded-full px-6 py-2.5 text-sm font-bold text-primary shadow-lg transition-transform hover:scale-[1.03]"
        >
          <span aria-hidden="true">🔐</span>
          כניסה לאזור האישי של הניהול
        </Link>
      </div>
      <p className="mt-4 text-[11px] text-muted-foreground">
        © {new Date().getFullYear()} מצפן · כל הזכויות שמורות
      </p>
    </footer>
  );
}

export const OWNER = {
  name: "מצפן - אבחון תעסוקתי חכם",
  email: "a4190656@gmail.com",
  phone: "0534190656",
};

export function ContactCard() {
  return (
    <section className="glass-strong mt-6 p-5">
      <h2 className="text-lg font-bold text-primary">פרטי הפעילות ויצירת קשר</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        בעל השירות ואחראי הגנת הפרטיות והנגישות: {OWNER.name}. לכל פנייה בנושא פרטיות, אבטחת מידע,
        מימוש זכות עיון, תיקון או מחיקת מידע, וכן פניות נגישות - ניתן ליצור קשר בערוצים הבאים:
      </p>
      <ul className="mt-3 space-y-1 text-sm">
        <li>
          דוא"ל:{" "}
          <a href={`mailto:${OWNER.email}`} className="text-primary underline underline-offset-4">
            {OWNER.email}
          </a>
        </li>
        <li>
          טלפון / וואטסאפ:{" "}
          <a href={`tel:${OWNER.phone}`} className="text-primary underline underline-offset-4">
            {OWNER.phone}
          </a>
        </li>
      </ul>
      <p className="mt-3 text-xs text-muted-foreground">
        מענה לפניות יינתן תוך זמן סביר ולא יאוחר מ-30 ימים ממועד קבלת הפנייה.
      </p>
    </section>
  );
}
