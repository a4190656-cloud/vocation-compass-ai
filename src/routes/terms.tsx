import { createFileRoute, Link } from "@tanstack/react-router";
import { BrandHeader, SiteFooter } from "@/components/brand";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "תנאי שימוש | מצפן" },
      {
        name: "description",
        content:
          "תנאי השימוש באבחון התעסוקתי החכם: אופי השירות, תשלום והחזרים, שימוש בבינה מלאכותית, קניין רוחני והגבלת אחריות.",
      },
      { property: "og:title", content: "תנאי שימוש - אבחון תעסוקתי חכם" },
      {
        property: "og:description",
        content: "כל מה שחשוב לדעת לפני תחילת האבחון: זכויות, חובות ומגבלות השירות.",
      },
    ],
  }),
  component: Terms,
});

const SECTIONS: { title: string; body: string[] }[] = [
  {
    title: "1. מהות השירות",
    body: [
      "השירות מספק שאלון נטיות תעסוקתיות בשילוב ניתוח בינה מלאכותית, ומפיק דוח אישי עם כיווני קריירה מותאמים.",
      "הדוח הוא כלי הכוונה והעשרה בלבד. אין בו ייעוץ תעסוקתי, פסיכולוגי, רפואי, משפטי או פיננסי, ואינו מחליף אבחון מקצועי מוסמך.",
    ],
  },
  {
    title: "2. שימוש הוגן",
    body: [
      "השימוש מיועד לשימוש אישי בלבד. אין להעתיק, לשכפל, למכור או להפיץ את תוכן השאלון או הדוחות.",
      "אין להזין תוכן פוגעני, מידע של אדם אחר או פרטים רגישים שאינם נחוצים לאבחון.",
    ],
  },
  {
    title: "3. שימוש בבינה מלאכותית",
    body: [
      "התשובות החופשיות מנותחות באמצעות מודל בינה מלאכותית. תוצרי הניתוח הם הערכה סטטיסטית ועשויים להיות לא מדויקים.",
      "האחריות על כל החלטה המתקבלת בעקבות הדוח היא על המשתמש בלבד.",
    ],
  },
  {
    title: "4. תשלום, ביטול והחזרים",
    body: [
      "הגישה לאבחון עשויה להיות כרוכה בתשלום חד פעמי המוצג בבירור לפני הרכישה, או להינתן ללא תשלום באמצעות קוד קופון תקף.",
      "הרכישה מקנה גישה לאבחון אחד ולדוח האישי הנובע ממנו.",
      "ניתן לבטל עסקה בהתאם לחוק הגנת הצרכן, התשמ\"א-1981 ותקנותיו. במקרה שבו האבחון כבר בוצע והדוח הופק, מדובר בשירות שנוצל במלואו.",
    ],
  },
  {
    title: "5. קניין רוחני",
    body: [
      "כל הזכויות בתוכן, בשאלון, במתודולוגיה, בעיצוב ובלוגואים שמורות לבעלי השירות. הדוח האישי הוא לשימושך האישי.",
    ],
  },
  {
    title: "6. הגבלת אחריות",
    body: [
      "השירות ניתן כמות שהוא (AS IS). איננו מתחייבים לזמינות רציפה או להיעדר תקלות.",
      "לא נישא באחריות לנזק ישיר או עקיף הנובע מהסתמכות על תוכן הדוח.",
    ],
  },
  {
    title: "7. פרטיות",
    body: [
      "השימוש בשירות כפוף גם למדיניות הפרטיות ואבטחת המידע שלנו, המהווה חלק בלתי נפרד מתנאים אלה.",
    ],
  },
  {
    title: "8. דין וסמכות שיפוט",
    body: ["על תנאים אלה יחולו דיני מדינת ישראל, וסמכות השיפוט הבלעדית נתונה לבתי המשפט המוסמכים בישראל."],
  },
];

function Terms() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 pb-16">
      <BrandHeader />
      <h1 className="mt-4 font-[family-name:var(--font-display)] text-3xl font-black">
        תנאי <span className="text-gradient">שימוש</span>
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        ראו גם:{" "}
        <Link to="/privacy" className="underline underline-offset-4">
          מדיניות פרטיות ואבטחת מידע
        </Link>
      </p>
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
