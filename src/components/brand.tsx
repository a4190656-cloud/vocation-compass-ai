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

/** בועת וואטסאפ ליצירת קשר — צפה בפינה בכל הדפים */
function WhatsAppBubble() {
  const text = encodeURIComponent(
    "הגעתי מהאתר \"מצפן — עוזר לי להבין לאן ללכת\", רציתי לדבר על..."
  );
  const waUrl = `https://wa.me/972${OWNER.phone.slice(1)}?text=${text}`;

  return (
    <a
      href={waUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="יצירת קשר בוואטסאפ"
      title="יצירת קשר בוואטסאפ"
      className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-full px-4 py-3 text-sm font-bold text-white shadow-lg transition-transform hover:scale-105 print:hidden"
      style={{ backgroundColor: "#25D366" }}
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
        <path d="M12.04 2a9.9 9.9 0 0 0-8.4 15.2L2 22l4.9-1.6A9.9 9.9 0 1 0 12.04 2Zm5.8 14.1c-.25.7-1.45 1.35-2 1.4-.5.05-1.15.25-3.85-.8-3.25-1.3-5.3-4.6-5.45-4.8-.15-.2-1.3-1.75-1.3-3.35 0-1.6.85-2.4 1.15-2.7.3-.3.65-.4.85-.4h.6c.2 0 .45-.05.7.55.25.6.85 2.1.95 2.25.1.15.15.35.05.55-.1.2-.15.35-.3.55l-.45.5c-.15.15-.3.3-.15.6.15.3.7 1.2 1.5 1.95 1.05.95 1.9 1.25 2.2 1.4.3.15.5.1.65-.05.2-.2.7-.8.9-1.1.2-.3.4-.25.65-.15.25.1 1.65.8 1.95.95.3.15.5.2.55.35.1.15.1.75-.15 1.45Z" />
      </svg>
      <span className="hidden sm:inline">יצירת קשר בוואטסאפ</span>
    </a>
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
      <AdminCornerLink />
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
