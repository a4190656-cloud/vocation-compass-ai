import { Link } from "@tanstack/react-router";
import brainAsset from "@/assets/brain-icon.png.asset.json";
import aoAsset from "@/assets/ao-logo.png.asset.json";

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
      <p className="mt-4 text-[11px] text-muted-foreground">
        © {new Date().getFullYear()} מצפן · כל הזכויות שמורות
      </p>
    </footer>
  );
}
