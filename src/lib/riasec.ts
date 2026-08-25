export type RiasecKey = "R" | "I" | "A" | "S" | "E" | "C";

export type Scores = Record<RiasecKey, number>;

export const RIASEC_KEYS: RiasecKey[] = ["R", "I", "A", "S", "E", "C"];

export const emptyScores = (): Scores => ({ R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 });

export interface TypeInfo {
  key: RiasecKey;
  title: string;
  short: string;
  description: string;
  strengths: string[];
  careers: string[];
}

export const TYPES: Record<RiasecKey, TypeInfo> = {
  R: {
    key: "R",
    title: "המעשי (Realistic)",
    short: "ידיים עובדות, תוצאה מוחשית",
    description:
      "אתה מתחבר לעבודה מוחשית שרואים בסופה תוצאה. אתה מעדיף כלים, מכונות ומערכות על פני תיאוריה, ונהנה לפתור תקלות בשטח ולא במצגות.",
    strengths: ["ראייה טכנית מהירה", "סבלנות לעבודת כפיים", "אחריות ועמידה בלוחות זמנים", "פתרון תקלות בשטח"],
    careers: [
      "חשמלאי מוסמך",
      "טכנאי מיזוג ומערכות קירור",
      "אינסטלטור / קבלן שיפוצים",
      "טכנאי מחשבים ורשתות",
      "נגר ואומן רהיטים",
      "מפעיל מכונות CNC",
      "טכנאי רכב",
      "מנהל אחזקה במוסד או במפעל",
      "סת\"ם וכתיבת קלף (עבודת דיוק)",
      "טכנאי סולארי ואנרגיה",
    ],
  },
  I: {
    key: "I",
    title: "החוקר (Investigative)",
    short: "לרדת לעומק, להבין למה",
    description:
      "המוח שלך לא נח עד שהבנת את השורש. אתה אוהב לנתח, לחקור, להשוות ולבנות מסקנה מסודרת - בדיוק כמו סוגיה עמוקה שצריך לפרק לגורמים.",
    strengths: ["חשיבה אנליטית", "למידה עצמאית מהירה", "דיוק בפרטים", "יכולת סברא והבחנה"],
    careers: [
      "מפתח תוכנה",
      "אנליסט נתונים / Data Analyst",
      "בודק תוכנה QA",
      "רואה חשבון",
      "אקטואר",
      "חוקר שוק",
      "מהנדס תוכנה מוטמע",
      "מנתח מערכות מידע",
      "עורך ומגיה תורני",
      "מומחה סייבר הגנתי",
    ],
  },
  A: {
    key: "A",
    title: "היוצר (Artistic)",
    short: "לראות את מה שעוד לא קיים",
    description:
      "יש לך עין לפרטים אסתטיים ולראש שממציא. אתה נהנה לייצר משהו משלך - עיצוב, כתיבה, ניגון או רעיון חדש שאף אחד עוד לא חשב עליו.",
    strengths: ["דמיון ורעננות", "חוש עיצובי", "יכולת ביטוי", "חשיבה מחוץ לקופסה"],
    careers: [
      "מעצב גרפי",
      "עורך וידאו ואנימציה",
      "צלם אירועים ומוצר",
      "מעצב UX/UI",
      "קופירייטר וכותב תוכן",
      "סופר ועורך ספרים",
      "מוזיקאי / מנצח מקהלה",
      "מעצב פנים",
      "מאייר ומעצב ספרי ילדים",
      "מנהל מותג ותוכן",
    ],
  },
  S: {
    key: "S",
    title: "החברתי (Social)",
    short: "אנשים לפני הכל",
    description:
      "אתה מתמלא מאנשים. יש לך אוזן קשבת, סבלנות ויכולת להסביר, לחבר ולהרים אחרים - ואתה מרגיש שליחות אמיתית בעזרה לזולת.",
    strengths: ["אמפתיה והקשבה", "יכולת הוראה והסבר", "בניית אמון", "פישור וגישור"],
    careers: [
      "מלמד / מחנך",
      "מדריך נוער וקירוב",
      "עובד סוציאלי",
      "יועץ חינוכי",
      "מטפל רגשי / CBT",
      "מנהל מוסד חינוכי",
      "רכז קהילה וחסד",
      "מגשר משפחתי",
      "מדריך חתנים / יועצת כלות",
      "אח / סייעת רפואית",
    ],
  },
  E: {
    key: "E",
    title: "היזם (Enterprising)",
    short: "להוביל, לשכנע, להזיז",
    description:
      "אתה לא מחכה שיקרה - אתה גורם לזה לקרות. יש לך כוח שכנוע, ראש של הזדמנויות ונוחות עם אחריות וניהול אנשים.",
    strengths: ["יכולת מכירה ושכנוע", "ראייה עסקית", "הובלת צוות", "אורך רוח ליזמות"],
    careers: [
      "יזם ובעל עסק",
      "מנהל מכירות",
      "יועץ עסקי לעסקים קטנים",
      "מתווך נדל\"ן",
      "סוכן ביטוח ופיננסים",
      "מנהל פרויקטים",
      "מנהל שיווק דיגיטלי",
      "מגייס משאבים לארגון",
      "מנהל רכש ואספקה",
      "מנהל סניף",
    ],
  },
  C: {
    key: "C",
    title: "המסודר (Conventional)",
    short: "סדר, דיוק ושליטה בנתונים",
    description:
      "אתה אוהב שהכל במקום. נהלים, טבלאות ומעקב מדויק נותנים לך שקט, ואתה האיש שכולם סומכים עליו שלא תיפול טעות.",
    strengths: ["ארגון ושיטתיות", "דיוק בנתונים", "אמינות גבוהה", "עמידה בנהלים"],
    careers: [
      "הנהלת חשבונות",
      "חשב שכר",
      "מנהל משרד ואדמיניסטרציה",
      "פקיד בנק / יועץ משכנתאות",
      "מנהל לוגיסטיקה ומלאי",
      "בקר תקציב",
      "מזכיר מוסד",
      "מנהל תיקי לקוחות",
      "עוזר משפטי",
      "מנהל מערכות מידע ארגוניות",
    ],
  },
};

export interface Choice {
  label: string;
  weights: Partial<Scores>;
}

export interface Question {
  id: string;
  text: string;
  hint?: string;
  multi?: boolean;
  choices: Choice[];
}

const w = (obj: Partial<Scores>) => obj;

export const QUESTIONS: Question[] = [
  {
    id: "q1",
    text: "כשיש לך שעה פנויה באמצע היום, במה תבחר לעסוק?",
    choices: [
      { label: "לתקן משהו בבית שמזמן מחכה", weights: w({ R: 3 }) },
      { label: "לקרוא מאמר או ללמוד נושא חדש לעומק", weights: w({ I: 3 }) },
      { label: "לשרבט רעיון לעיצוב או לכתוב משהו", weights: w({ A: 3 }) },
      { label: "לדבר עם חבר שצריך חיזוק", weights: w({ S: 3 }) },
      { label: "לקדם רעיון עסקי שרץ לי בראש", weights: w({ E: 3 }) },
      { label: "לסדר את הניירת והחשבונות", weights: w({ C: 3 }) },
    ],
  },
  {
    id: "q2",
    text: "מה מתאר הכי טוב את הדרך שבה אתה לומד סוגיה חדשה?",
    choices: [
      { label: "מנסה בפועל עד שזה עובד", weights: w({ R: 3, I: 1 }) },
      { label: "מפרק לגורמים ובונה מסקנה", weights: w({ I: 3 }) },
      { label: "מדמיין תמונה שלמה בראש", weights: w({ A: 3 }) },
      { label: "לומד בחברותא ובדיבור", weights: w({ S: 3 }) },
      { label: "מחפש מיד איך זה יכול להועיל בפועל", weights: w({ E: 3 }) },
      { label: "עושה סיכום מסודר בכתב", weights: w({ C: 3 }) },
    ],
  },
  {
    id: "q3",
    text: "אילו משימות בעבודה גורמות לך להרגיש 'בזרימה'? (אפשר לבחור כמה)",
    multi: true,
    choices: [
      { label: "עבודה עם כלים ומכשור", weights: w({ R: 2 }) },
      { label: "ניתוח נתונים ומספרים", weights: w({ I: 2, C: 1 }) },
      { label: "יצירת חומרים מעוצבים", weights: w({ A: 2 }) },
      { label: "ליווי והדרכה של אנשים", weights: w({ S: 2 }) },
      { label: "משא ומתן וסגירת עסקאות", weights: w({ E: 2 }) },
      { label: "סידור מערכות ונהלים", weights: w({ C: 2 }) },
    ],
  },
  {
    id: "q4",
    text: "בתוך צוות, איזה תפקיד טבעי לך?",
    choices: [
      { label: "זה שמבצע בשטח", weights: w({ R: 3 }) },
      { label: "זה שבודק את הנתונים", weights: w({ I: 3 }) },
      { label: "זה שמביא רעיונות חדשים", weights: w({ A: 3 }) },
      { label: "זה שמחזיק את האווירה והאנשים", weights: w({ S: 3 }) },
      { label: "זה שמוביל ומחלק משימות", weights: w({ E: 3 }) },
      { label: "זה שמנהל את הלו\"ז והמעקב", weights: w({ C: 3 }) },
    ],
  },
  {
    id: "q5",
    text: "איזו מחמאה הכי מדויקת לגביך?",
    choices: [
      { label: "\"יש לך ידי זהב\"", weights: w({ R: 3 }) },
      { label: "\"יש לך ראש חד\"", weights: w({ I: 3 }) },
      { label: "\"יש לך עין וטעם טוב\"", weights: w({ A: 3 }) },
      { label: "\"אתה יודע לדבר ללב\"", weights: w({ S: 3 }) },
      { label: "\"אתה יודע להזיז דברים\"", weights: w({ E: 3 }) },
      { label: "\"אצלך אף פעם אין בלגן\"", weights: w({ C: 3 }) },
    ],
  },
  {
    id: "q6",
    text: "מה יגרום לך להרגיש שיום העבודה היה מוצלח?",
    choices: [
      { label: "סיימתי משהו מוחשי שרואים", weights: w({ R: 3 }) },
      { label: "הבנתי בעיה שאף אחד לא פתר", weights: w({ I: 3 }) },
      { label: "יצרתי משהו יפה", weights: w({ A: 3 }) },
      { label: "עזרתי למישהו באמת", weights: w({ S: 3 }) },
      { label: "סגרתי עסקה או קידמתי יעד", weights: w({ E: 3 }) },
      { label: "הכל מסודר ומעודכן", weights: w({ C: 3 }) },
    ],
  },
  {
    id: "q7",
    text: "סביבת העבודה המועדפת עליך היא...",
    choices: [
      { label: "בשטח, בתנועה, לא ליד שולחן", weights: w({ R: 3 }) },
      { label: "שקטה, עם זמן לחשוב", weights: w({ I: 3 }) },
      { label: "גמישה ויצירתית", weights: w({ A: 3 }) },
      { label: "עם הרבה אנשים סביב", weights: w({ S: 3 }) },
      { label: "דינמית ותחרותית", weights: w({ E: 3 }) },
      { label: "מסודרת עם נהלים ברורים", weights: w({ C: 3 }) },
    ],
  },
  {
    id: "q8",
    text: "כשמתגלה תקלה גדולה, מה התגובה הראשונה שלך?",
    choices: [
      { label: "ניגש לתקן בידיים", weights: w({ R: 3 }) },
      { label: "מחפש את שורש הבעיה", weights: w({ I: 3 }) },
      { label: "חושב על פתרון עוקף יצירתי", weights: w({ A: 3 }) },
      { label: "מרגיע את האנשים שנפגעו", weights: w({ S: 3 }) },
      { label: "לוקח פיקוד ומחלק משימות", weights: w({ E: 3 }) },
      { label: "בודק מה בנוהל ומתעד", weights: w({ C: 3 }) },
    ],
  },
  {
    id: "q9",
    text: "אילו לימודי מקצוע היו מושכים אותך? (אפשר לבחור כמה)",
    multi: true,
    choices: [
      { label: "חשמל / מיזוג / טכנאות", weights: w({ R: 2 }) },
      { label: "תכנות ומדעי המחשב", weights: w({ I: 2 }) },
      { label: "עיצוב גרפי ווידאו", weights: w({ A: 2 }) },
      { label: "טיפול, חינוך והוראה", weights: w({ S: 2 }) },
      { label: "ניהול, שיווק ומכירות", weights: w({ E: 2 }) },
      { label: "הנהלת חשבונות ושכר", weights: w({ C: 2 }) },
    ],
  },
  {
    id: "q10",
    text: "מה חשוב לך יותר בפרנסה?",
    choices: [
      { label: "עבודה יציבה עם ידיים", weights: w({ R: 2, C: 1 }) },
      { label: "אתגר אינטלקטואלי", weights: w({ I: 3 }) },
      { label: "חופש ביטוי ויצירה", weights: w({ A: 3 }) },
      { label: "תחושת שליחות", weights: w({ S: 3 }) },
      { label: "פוטנציאל הכנסה גבוה", weights: w({ E: 3 }) },
      { label: "סדר יום קבוע וברור", weights: w({ C: 3 }) },
    ],
  },
  {
    id: "q11",
    text: "איך אתה מרגיש מול קהל?",
    choices: [
      { label: "מעדיף לעבוד מאחורי הקלעים", weights: w({ R: 2, C: 1 }) },
      { label: "מוכן להרצות אם אני שולט בחומר", weights: w({ I: 2 }) },
      { label: "אוהב להציג דברים שיצרתי", weights: w({ A: 2 }) },
      { label: "נהנה מאוד מקשר עם קהל", weights: w({ S: 3 }) },
      { label: "מרגיש בבית על הבמה", weights: w({ E: 3 }) },
      { label: "מעדיף לשלוח מסמך מסודר", weights: w({ C: 2 }) },
    ],
  },
  {
    id: "q12",
    text: "מה מתסכל אותך הכי הרבה בעבודה?",
    choices: [
      { label: "לשבת בלי לעשות כלום מעשי", weights: w({ R: 3 }) },
      { label: "החלטות בלי בדיקה רצינית", weights: w({ I: 3 }) },
      { label: "שגרה שחוזרת על עצמה", weights: w({ A: 3 }) },
      { label: "יחס לא הוגן לאנשים", weights: w({ S: 3 }) },
      { label: "התקדמות איטית וביורוקרטיה", weights: w({ E: 3 }) },
      { label: "בלגן וחוסר סדר", weights: w({ C: 3 }) },
    ],
  },
  {
    id: "q13",
    text: "בגמ\"ח או בפעילות קהילתית, מה תיקח על עצמך?",
    choices: [
      { label: "הקמה, הובלה והתקנות", weights: w({ R: 3 }) },
      { label: "בניית מערכת מידע ומעקב", weights: w({ I: 2, C: 2 }) },
      { label: "עיצוב הפרסום והחומרים", weights: w({ A: 3 }) },
      { label: "קשר אישי עם הנזקקים", weights: w({ S: 3 }) },
      { label: "גיוס תורמים", weights: w({ E: 3 }) },
      { label: "ניהול הקופה והרישום", weights: w({ C: 3 }) },
    ],
  },
  {
    id: "q14",
    text: "אילו כלים אתה נהנה לעבוד איתם? (אפשר לבחור כמה)",
    multi: true,
    choices: [
      { label: "כלי עבודה ומכשור", weights: w({ R: 2 }) },
      { label: "גיליונות נתונים ומחקר", weights: w({ I: 2 }) },
      { label: "תוכנות עיצוב ועריכה", weights: w({ A: 2 }) },
      { label: "שיחה, טלפון ופגישות", weights: w({ S: 2 }) },
      { label: "מצגות והצעות מחיר", weights: w({ E: 2 }) },
      { label: "מערכות ניהול ורישום", weights: w({ C: 2 }) },
    ],
  },
  {
    id: "q15",
    text: "מה נכון לגבי קצב העבודה שלך?",
    choices: [
      { label: "יסודי ומדוד, עד שזה עומד", weights: w({ R: 2, C: 1 }) },
      { label: "איטי בהתחלה ואז מדויק", weights: w({ I: 3 }) },
      { label: "בגלים - לפי השראה", weights: w({ A: 3 }) },
      { label: "מותאם לקצב של האנשים סביבי", weights: w({ S: 3 }) },
      { label: "מהיר ולוחץ קדימה", weights: w({ E: 3 }) },
      { label: "קבוע ומתוכנן מראש", weights: w({ C: 3 }) },
    ],
  },
  {
    id: "q16",
    text: "איזה סוג הצלחה היית רוצה לספר עליו בעוד עשר שנים?",
    choices: [
      { label: "בניתי דברים שעומדים ומשרתים אנשים", weights: w({ R: 3 }) },
      { label: "פתרתי בעיה מקצועית מורכבת", weights: w({ I: 3 }) },
      { label: "יצרתי משהו שהשאיר חותם", weights: w({ A: 3 }) },
      { label: "שיניתי חיים של אנשים", weights: w({ S: 3 }) },
      { label: "הקמתי עסק מצליח", weights: w({ E: 3 }) },
      { label: "בניתי מערכת שעובדת בלי טעויות", weights: w({ C: 3 }) },
    ],
  },
  {
    id: "q17",
    text: "כמה חשוב לך עצמאות בעבודה?",
    choices: [
      { label: "אשמח לעבוד לבד עם משימה ברורה", weights: w({ R: 3 }) },
      { label: "צריך מרחב לחקור בלי הפרעות", weights: w({ I: 3 }) },
      { label: "חייב חופש מלא", weights: w({ A: 3 }) },
      { label: "מעדיף לעבוד יחד עם אחרים", weights: w({ S: 3 }) },
      { label: "רוצה להיות הבוס של עצמי", weights: w({ E: 3 }) },
      { label: "נוח לי עם מסגרת והנחיות", weights: w({ C: 3 }) },
    ],
  },
  {
    id: "q18",
    text: "מה קורה לך מול טבלת אקסל גדולה?",
    choices: [
      { label: "מעדיף לצאת לשטח", weights: w({ R: 3 }) },
      { label: "מיד מחפש מגמות ותובנות", weights: w({ I: 3 }) },
      { label: "רוצה להפוך אותה לגרף יפה", weights: w({ A: 2, C: 1 }) },
      { label: "שואל איך זה משפיע על אנשים", weights: w({ S: 3 }) },
      { label: "בודק איפה אפשר להרוויח יותר", weights: w({ E: 3 }) },
      { label: "נהנה לסדר ולנקות אותה", weights: w({ C: 3 }) },
    ],
  },
  {
    id: "q19",
    text: "איזה סוג אחריות מרגיש לך נוח? (אפשר לבחור כמה)",
    multi: true,
    choices: [
      { label: "אחריות על ציוד ותשתיות", weights: w({ R: 2 }) },
      { label: "אחריות על נכונות ומידע", weights: w({ I: 2 }) },
      { label: "אחריות על מראה ומיתוג", weights: w({ A: 2 }) },
      { label: "אחריות על אנשים", weights: w({ S: 2 }) },
      { label: "אחריות על תוצאות ורווח", weights: w({ E: 2 }) },
      { label: "אחריות על סדר וכספים", weights: w({ C: 2 }) },
    ],
  },
  {
    id: "q20",
    text: "ואם היית יכול לבחור מקצוע בלי שום מגבלה, מה היה קרוב לזה?",
    choices: [
      { label: "בעל מקצוע מבוקש בשטח", weights: w({ R: 3 }) },
      { label: "מומחה טכנולוגי או מחקרי", weights: w({ I: 3 }) },
      { label: "יוצר, מעצב או כותב", weights: w({ A: 3 }) },
      { label: "מחנך, מטפל או מדריך", weights: w({ S: 3 }) },
      { label: "בעל עסק או מנהל בכיר", weights: w({ E: 3 }) },
      { label: "מנהל כספים ומערכות", weights: w({ C: 3 }) },
    ],
  },
];

export function computeTop(scores: Scores, count = 4): RiasecKey[] {
  return [...RIASEC_KEYS]
    .sort((a, b) => scores[b] - scores[a])
    .slice(0, count)
    .filter((k) => scores[k] > 0);
}

export function hollandCode(top: RiasecKey[]): string {
  return top.slice(0, 3).join("");
}

export function normalize(scores: Scores): { key: RiasecKey; value: number; label: string }[] {
  const max = Math.max(1, ...RIASEC_KEYS.map((k) => scores[k]));
  return RIASEC_KEYS.map((k) => ({
    key: k,
    value: Math.round((scores[k] / max) * 100),
    label: TYPES[k].title.split(" ")[0],
  }));
}

export function recommendedCareers(top: RiasecKey[], limit = 12): string[] {
  const out: string[] = [];
  let i = 0;
  while (out.length < limit && i < 10) {
    for (const k of top) {
      const c = TYPES[k].careers[i];
      if (c && !out.includes(c)) out.push(c);
      if (out.length >= limit) break;
    }
    i++;
  }
  return out;
}

export const STORAGE_KEY = "riasec-progress-v1";
export const RESULT_KEY = "riasec-result-v1";
export const WHATSAPP_GROUP =
  "https://chat.whatsapp.com/EfbcQPOzYc823iSisDwizd?s=cl&p=a&mlu=4";
