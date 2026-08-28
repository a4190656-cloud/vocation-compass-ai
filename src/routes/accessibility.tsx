import { createFileRoute } from "@tanstack/react-router";
import { BrandHeader, SiteFooter } from "@/components/brand";

export const Route = createFileRoute("/accessibility")({
  head: () => ({
    meta: [
      { title: "הצהרת נגישות | מצפן" },
      {
        name: "description",
        content:
          "הצהרת הנגישות של האבחון התעסוקתי: התאמות שבוצעו לפי תקן ישראלי 5568 ורמה AA, ודרכי פנייה לרכז הנגישות.",
      },
      { property: "og:title", content: "הצהרת נגישות" },
      {
        property: "og:description",
        content: "אנחנו פועלים להנגיש את האבחון לכלל המשתמשים, כולל טכנולוגיות מסייעות וניווט מקלדת.",
      },
    ],
  }),
  component: Accessibility,
});

const SECTIONS: { title: string; body: string[] }[] = [
  {
    title: "המחויבות שלנו",
    body: [
      "אנו רואים חשיבות רבה במתן שירות שוויוני לכלל הציבור, לרבות אנשים עם מוגבלות, ופועלים להנגשת האתר בהתאם לחוק שוויון זכויות לאנשים עם מוגבלות, התשנ\"ח-1998 ולתקנות הנגישות לשירות.",
    ],
  },
  {
    title: "רמת הנגישות",
    body: [
      "האתר הונגש בהתאם לתקן הישראלי ת\"י 5568 המבוסס על הנחיות WCAG 2.1 ברמה AA, במידת האפשר.",
    ],
  },
  {
    title: "התאמות שבוצעו",
    body: [
      "מבנה סמנטי ותמיכה מלאה בקוראי מסך, כולל תיאורים חלופיים לתמונות.",
      "ניווט מלא באמצעות מקלדת וסימון ברור של אלמנט הפוקוס.",
      "ניגודיות צבעים גבוהה, טקסט הניתן להגדלה ותצוגה מותאמת למובייל.",
      "כתיבה בעברית פשוטה וברורה, עם הוראות מפורשות בכל שלב בשאלון.",
    ],
  },
  {
    title: "מגבלות ידועות",
    body: [
      "ייתכנו רכיבים, ובפרט תרשים הנטיות הגרפי, שאינם נגישים באופן מלא. לצד התרשים מוצג פירוט טקסטואלי מלא של התוצאות.",
      "אנו ממשיכים לשפר את הנגישות באופן שוטף.",
    ],
  },
  {
    title: "פנייה בנושא נגישות",
    body: [
      "נתקלתם בבעיית נגישות? נשמח לשמוע. ניתן לפנות אלינו דרך אמצעי הקשר המופיעים באתר, ונטפל בפנייה בהקדם האפשרי.",
    ],
  },
];

function Accessibility() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 pb-16">
      <BrandHeader />
      <h1 className="mt-4 font-[family-name:var(--font-display)] text-3xl font-black">
        הצהרת <span className="text-gradient">נגישות</span>
      </h1>
      <div className="mt-8 space-y-4">
        {SECTIONS.map((s) => (
          <section key={s.title} className="glass p-5">
            <h2 className="text-lg font-bold text-primary">{s.title}</h2>
            <div className="mt-2 space-y-2">
              {s.body.map((p) => (
                <p key={p} className="text-sm leading-relaxed text-muted-foreground">
                  {p}
                </p>
              ))}
            </div>
          </section>
        ))}
      </div>
      <SiteFooter />
    </main>
  );
}
