// =====================================================================================
// מערכת אבחון תעסוקתי — RIASEC + Work Style + Work Values + Career Matching
// 100% דטרמיניסטי, ללא AI, כל החישוב מתבצע מקומית בדפדפן.
// =====================================================================================

// --------------------------------- RIASEC ---------------------------------

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
  /** מה עלול להתאים פחות למי שחזק בממד הזה, או להסביר החלשה בממד */
  lowDescription: string;
}

export const TYPES: Record<RiasecKey, TypeInfo> = {
  R: {
    key: "R",
    title: "המעשי (Realistic)",
    short: "ידיים עובדות, תוצאה מוחשית",
    description:
      "אתה מתחבר לעבודה מוחשית שרואים בסופה תוצאה. אתה מעדיף כלים, מכונות ומערכות על פני תיאוריה, ונהנה לפתור תקלות בשטח ולא במצגות.",
    strengths: ["ראייה טכנית מהירה", "סבלנות לעבודת כפיים", "אחריות ועמידה בלוחות זמנים", "פתרון תקלות בשטח"],
    lowDescription:
      "עבודות שדורשות ישיבה ממושכת מול מסך בלי תוצר מוחשי, או המון שכנוע ודיבור בלי פעולה בפועל, עלולות להרגיש פחות טבעיות לך.",
  },
  I: {
    key: "I",
    title: "החוקר (Investigative)",
    short: "לרדת לעומק, להבין למה",
    description:
      "המוח שלך לא נח עד שהבנת את השורש. אתה אוהב לנתח, לחקור, להשוות ולבנות מסקנה מסודרת - בדיוק כמו סוגיה עמוקה שצריך לפרק לגורמים.",
    strengths: ["חשיבה אנליטית", "למידה עצמאית מהירה", "דיוק בפרטים", "יכולת סברא והבחנה"],
    lowDescription:
      "עבודה עם שגרה חוזרת בלי מרחב לחשוב ולנתח לעומק, או כזו שדורשת החלטות מהירות בלי זמן לבדוק, עלולה להתאים פחות.",
  },
  A: {
    key: "A",
    title: "היוצר (Artistic)",
    short: "לראות את מה שעוד לא קיים",
    description:
      "יש לך עין לפרטים אסתטיים ולראש שממציא. אתה נהנה לייצר משהו משלך - עיצוב, כתיבה, ניגון או רעיון חדש שאף אחד עוד לא חשב עליו.",
    strengths: ["דמיון ורעננות", "חוש עיצובי", "יכולת ביטוי", "חשיבה מחוץ לקופסה"],
    lowDescription:
      "סביבות עם נהלים נוקשים וחוזרים על עצמם, בלי שום מקום לביטוי אישי או לגיוון, עלולות להרגיש מחניקות עבורך.",
  },
  S: {
    key: "S",
    title: "החברתי (Social)",
    short: "אנשים לפני הכל",
    description:
      "אתה מתמלא מאנשים. יש לך אוזן קשבת, סבלנות ויכולת להסביר, לחבר ולהרים אחרים - ואתה מרגיש שליחות אמיתית בעזרה לזולת.",
    strengths: ["אמפתיה והקשבה", "יכולת הוראה והסבר", "בניית אמון", "פישור וגישור"],
    lowDescription:
      "עבודה בבידוד ממושך מול מסך או מכונה, כמעט בלי קשר עם בני אדם, עלולה להרגיש ריקה מבחינתך לאורך זמן.",
  },
  E: {
    key: "E",
    title: "היזם (Enterprising)",
    short: "להוביל, לשכנע, להזיז",
    description:
      "אתה לא מחכה שיקרה - אתה גורם לזה לקרות. יש לך כוח שכנוע, ראש של הזדמנויות ונוחות עם אחריות וניהול אנשים.",
    strengths: ["יכולת מכירה ושכנוע", "ראייה עסקית", "הובלת צוות", "אורך רוח ליזמות"],
    lowDescription:
      "תפקידים שגרתיים ומוגדרים מראש, בלי שום אפשרות ליזום, להוביל או להשפיע על כיוון, עלולים להרגיש תקועים מדי.",
  },
  C: {
    key: "C",
    title: "המסודר (Conventional)",
    short: "סדר, דיוק ושליטה בנתונים",
    description:
      "אתה אוהב שהכל במקום. נהלים, טבלאות ומעקב מדויק נותנים לך שקט, ואתה האיש שכולם סומכים עליו שלא תיפול טעות.",
    strengths: ["ארגון ושיטתיות", "דיוק בנתונים", "אמינות גבוהה", "עמידה בנהלים"],
    lowDescription:
      "סביבות מבולגנות ולא צפויות, בלי נהלים ברורים ובלי מבנה קבוע, עלולות ליצור אצלך תחושת חוסר שליטה.",
  },
};

// --------------------------------- Work Style ---------------------------------
// כל ממד הוא ציר דו-קוטבי בטווח 100- עד 100. לא משויך אוטומטית ל-RIASEC.

export type WorkStyleKey =
  | "aloneVsPeople"
  | "officeVsField"
  | "handsVsThinking"
  | "routineVsVariety"
  | "structureVsAmbiguity"
  | "fastVsCalmPace"
  | "independenceVsFramework"
  | "publicVsBackstage";

export const WORK_STYLE_KEYS: WorkStyleKey[] = [
  "aloneVsPeople",
  "officeVsField",
  "handsVsThinking",
  "routineVsVariety",
  "structureVsAmbiguity",
  "fastVsCalmPace",
  "independenceVsFramework",
  "publicVsBackstage",
];

export type WorkStyleScores = Record<WorkStyleKey, number>;

export const emptyWorkStyle = (): WorkStyleScores =>
  Object.fromEntries(WORK_STYLE_KEYS.map((k) => [k, 0])) as WorkStyleScores;

export interface WorkStyleAxisInfo {
  key: WorkStyleKey;
  title: string;
  negLabel: string; // הקוטב בצד 100-
  posLabel: string; // הקוטב בצד 100
}

export const WORK_STYLE_AXES: Record<WorkStyleKey, WorkStyleAxisInfo> = {
  aloneVsPeople: { key: "aloneVsPeople", title: "לבד מול עם אנשים", negLabel: "עבודה לבד", posLabel: "עבודה עם אנשים" },
  officeVsField: { key: "officeVsField", title: "משרד מול שטח", negLabel: "משרד", posLabel: "שטח" },
  handsVsThinking: { key: "handsVsThinking", title: "ידיים מול חשיבה", negLabel: "עבודה עם הידיים", posLabel: "חשיבה וניתוח" },
  routineVsVariety: { key: "routineVsVariety", title: "שגרה מול גיוון", negLabel: "שגרה קבועה", posLabel: "גיוון ותנודתיות" },
  structureVsAmbiguity: {
    key: "structureVsAmbiguity",
    title: "מסגרת ברורה מול עמימות",
    negLabel: "מסגרת ברורה",
    posLabel: "עמימות וחופש פרשנות",
  },
  fastVsCalmPace: { key: "fastVsCalmPace", title: "קצב עבודה", negLabel: "קצב רגוע", posLabel: "קצב מהיר ולוחץ" },
  independenceVsFramework: {
    key: "independenceVsFramework",
    title: "עצמאות מול מסגרת",
    negLabel: "מסגרת והנחיה",
    posLabel: "עצמאות מלאה",
  },
  publicVsBackstage: {
    key: "publicVsBackstage",
    title: "מול קהל מול מאחורי הקלעים",
    negLabel: "מאחורי הקלעים",
    posLabel: "מול קהל",
  },
};

// --------------------------------- Work Values ---------------------------------

export type WorkValueKey =
  | "stability"
  | "jobSecurity"
  | "income"
  | "independence"
  | "mission"
  | "meaning"
  | "advancement"
  | "creativity"
  | "balance"
  | "flexibility";

export const WORK_VALUE_KEYS: WorkValueKey[] = [
  "stability",
  "jobSecurity",
  "income",
  "independence",
  "mission",
  "meaning",
  "advancement",
  "creativity",
  "balance",
  "flexibility",
];

export type WorkValueScores = Record<WorkValueKey, number>;

export const emptyWorkValues = (): WorkValueScores =>
  Object.fromEntries(WORK_VALUE_KEYS.map((k) => [k, 0])) as WorkValueScores;

export const WORK_VALUE_LABELS: Record<WorkValueKey, string> = {
  stability: "יציבות",
  jobSecurity: "ביטחון תעסוקתי",
  income: "הכנסה",
  independence: "עצמאות",
  mission: "שליחות",
  meaning: "משמעות",
  advancement: "קידום",
  creativity: "יצירתיות",
  balance: "איזון",
  flexibility: "גמישות",
};

// --------------------------------- Questions ---------------------------------

export type QuestionCategory = "riasec" | "workStyle" | "workValues" | "validation";
export type QuestionMode = "single" | "multi";

export interface Choice {
  label: string;
  riasec?: Partial<Scores>;
  workStyle?: Partial<WorkStyleScores>;
  workValues?: Partial<WorkValueScores>;
  /** לשאלת הכיול בלבד: איזו אות "מוצהרת" הבחירה הזו מייצגת */
  validationLetter?: RiasecKey;
}

export interface Question {
  id: string;
  category: QuestionCategory;
  text: string;
  hint?: string;
  mode: QuestionMode;
  choices: Choice[];
}

const r = (weights: Partial<Scores>): Pick<Choice, "riasec"> => ({ riasec: weights });

export const QUESTIONS: Question[] = [
  // ============================= RIASEC (24) =============================
  {
    id: "q1",
    category: "riasec",
    mode: "single",
    text: "כשיש לך שעה פנויה באמצע היום, במה תבחר לעסוק?",
    choices: [
      { label: "לתקן משהו בבית שמזמן מחכה", ...r({ R: 3 }) },
      { label: "לקרוא מאמר או ללמוד נושא חדש לעומק", ...r({ I: 3 }) },
      { label: "לשרבט רעיון לעיצוב או לכתוב משהו", ...r({ A: 3 }) },
      { label: "לדבר עם חבר שצריך חיזוק", ...r({ S: 3 }) },
      { label: "לקדם רעיון עסקי שרץ לי בראש", ...r({ E: 3 }) },
      { label: "לסדר את הניירת והחשבונות", ...r({ C: 3 }) },
    ],
  },
  {
    id: "q2",
    category: "riasec",
    mode: "single",
    text: "מה מתאר הכי טוב את הדרך שבה אתה לומד סוגיה חדשה?",
    choices: [
      { label: "מנסה בפועל עד שזה עובד", ...r({ R: 3, I: 1 }) },
      { label: "מפרק לגורמים ובונה מסקנה", ...r({ I: 3 }) },
      { label: "מדמיין תמונה שלמה בראש", ...r({ A: 3 }) },
      { label: "לומד בחברותא ובדיבור", ...r({ S: 3 }) },
      { label: "מחפש מיד איך זה יכול להועיל בפועל", ...r({ E: 3 }) },
      { label: "עושה סיכום מסודר בכתב", ...r({ C: 3 }) },
    ],
  },
  {
    id: "q3",
    category: "riasec",
    mode: "multi",
    text: "אילו משימות בעבודה גורמות לך להרגיש 'בזרימה'? (אפשר לבחור כמה)",
    choices: [
      { label: "עבודה עם כלים ומכשור", ...r({ R: 2 }) },
      { label: "ניתוח נתונים ומספרים", ...r({ I: 2, C: 1 }) },
      { label: "יצירת חומרים מעוצבים", ...r({ A: 2 }) },
      { label: "ליווי והדרכה של אנשים", ...r({ S: 2 }) },
      { label: "משא ומתן וסגירת עסקאות", ...r({ E: 2 }) },
      { label: "סידור מערכות ונהלים", ...r({ C: 2 }) },
    ],
  },
  {
    id: "q4",
    category: "riasec",
    mode: "single",
    text: "בתוך צוות, איזה תפקיד טבעי לך?",
    choices: [
      { label: "זה שמבצע בשטח", ...r({ R: 3 }) },
      { label: "זה שבודק את הנתונים", ...r({ I: 3 }) },
      { label: "זה שמביא רעיונות חדשים", ...r({ A: 3 }) },
      { label: "זה שמחזיק את האווירה והאנשים", ...r({ S: 3 }) },
      { label: "זה שמוביל ומחלק משימות", ...r({ E: 3 }) },
      { label: "זה שמנהל את הלו\"ז והמעקב", ...r({ C: 3 }) },
    ],
  },
  {
    id: "q5",
    category: "riasec",
    mode: "single",
    text: "איזו מחמאה הכי מדויקת לגביך?",
    choices: [
      { label: "\"יש לך ידי זהב\"", ...r({ R: 3 }) },
      { label: "\"יש לך ראש חד\"", ...r({ I: 3 }) },
      { label: "\"יש לך עין וטעם טוב\"", ...r({ A: 3 }) },
      { label: "\"אתה יודע לדבר ללב\"", ...r({ S: 3 }) },
      { label: "\"אתה יודע להזיז דברים\"", ...r({ E: 3 }) },
      { label: "\"אצלך אף פעם אין בלגן\"", ...r({ C: 3 }) },
    ],
  },
  {
    id: "q6",
    category: "riasec",
    mode: "single",
    text: "מה יגרום לך להרגיש שיום העבודה היה מוצלח?",
    choices: [
      { label: "סיימתי משהו מוחשי שרואים", ...r({ R: 3 }) },
      { label: "הבנתי בעיה שאף אחד לא פתר", ...r({ I: 3 }) },
      { label: "יצרתי משהו יפה", ...r({ A: 3 }) },
      { label: "עזרתי למישהו באמת", ...r({ S: 3 }) },
      { label: "סגרתי עסקה או קידמתי יעד", ...r({ E: 3 }) },
      { label: "הכל מסודר ומעודכן", ...r({ C: 3 }) },
    ],
  },
  {
    id: "q7",
    category: "riasec",
    mode: "single",
    text: "כשמתגלה תקלה גדולה, מה התגובה הראשונה שלך?",
    choices: [
      { label: "ניגש לתקן בידיים", ...r({ R: 3 }) },
      { label: "מחפש את שורש הבעיה", ...r({ I: 3 }) },
      { label: "חושב על פתרון עוקף יצירתי", ...r({ A: 3 }) },
      { label: "מרגיע את האנשים שנפגעו", ...r({ S: 3 }) },
      { label: "לוקח פיקוד ומחלק משימות", ...r({ E: 3 }) },
      { label: "בודק מה בנוהל ומתעד", ...r({ C: 3 }) },
    ],
  },
  {
    id: "q8",
    category: "riasec",
    mode: "multi",
    text: "אילו לימודי מקצוע היו מושכים אותך? (אפשר לבחור כמה)",
    choices: [
      { label: "חשמל / מיזוג / טכנאות", ...r({ R: 2 }) },
      { label: "תכנות ומדעי המחשב", ...r({ I: 2 }) },
      { label: "עיצוב גרפי ווידאו", ...r({ A: 2 }) },
      { label: "טיפול, חינוך והוראה", ...r({ S: 2 }) },
      { label: "ניהול, שיווק ומכירות", ...r({ E: 2 }) },
      { label: "הנהלת חשבונות ושכר", ...r({ C: 2 }) },
    ],
  },
  {
    id: "q9",
    category: "riasec",
    mode: "single",
    text: "איך אתה מרגיש מול קהל?",
    choices: [
      { label: "מעדיף שהעבודה שלי תדבר בעצמה, לא אני", ...r({ R: 2 }) },
      { label: "מוכן להרצות אם אני שולט בחומר", ...r({ I: 2 }) },
      { label: "אוהב להציג דברים שיצרתי", ...r({ A: 2 }) },
      { label: "נהנה מאוד מקשר עם קהל", ...r({ S: 3 }) },
      { label: "מרגיש בבית על הבמה", ...r({ E: 3 }) },
      { label: "מעדיף לתקשר בכתב מסודר", ...r({ C: 2 }) },
    ],
  },
  {
    id: "q10",
    category: "riasec",
    mode: "single",
    text: "מה מתסכל אותך הכי הרבה בעבודה?",
    choices: [
      { label: "לשבת בלי לעשות כלום מעשי", ...r({ R: 3 }) },
      { label: "החלטות בלי בדיקה רצינית", ...r({ I: 3 }) },
      { label: "שגרה שחוזרת על עצמה בלי גיוון", ...r({ A: 3 }) },
      { label: "יחס לא הוגן לאנשים", ...r({ S: 3 }) },
      { label: "התקדמות איטית וביורוקרטיה", ...r({ E: 3 }) },
      { label: "בלגן וחוסר סדר", ...r({ C: 3 }) },
    ],
  },
  {
    id: "q11",
    category: "riasec",
    mode: "single",
    text: "בגמ\"ח או בפעילות קהילתית, מה תיקח על עצמך?",
    choices: [
      { label: "הקמה, הובלה והתקנות", ...r({ R: 3 }) },
      { label: "בניית מערכת מידע ומעקב", ...r({ I: 2, C: 2 }) },
      { label: "עיצוב הפרסום והחומרים", ...r({ A: 3 }) },
      { label: "קשר אישי עם הנזקקים", ...r({ S: 3 }) },
      { label: "גיוס תורמים", ...r({ E: 3 }) },
      { label: "ניהול הקופה והרישום", ...r({ C: 3 }) },
    ],
  },
  {
    id: "q12",
    category: "riasec",
    mode: "multi",
    text: "אילו כלים אתה נהנה לעבוד איתם? (אפשר לבחור כמה)",
    choices: [
      { label: "כלי עבודה ומכשור", ...r({ R: 2 }) },
      { label: "גיליונות נתונים ומחקר", ...r({ I: 2 }) },
      { label: "תוכנות עיצוב ועריכה", ...r({ A: 2 }) },
      { label: "שיחה, טלפון ופגישות", ...r({ S: 2 }) },
      { label: "מצגות והצעות מחיר", ...r({ E: 2 }) },
      { label: "מערכות ניהול ורישום", ...r({ C: 2 }) },
    ],
  },
  {
    id: "q13",
    category: "riasec",
    mode: "single",
    text: "איזה סוג הצלחה היית רוצה לספר עליו בעוד עשר שנים?",
    choices: [
      { label: "בניתי דברים שעומדים ומשרתים אנשים", ...r({ R: 3 }) },
      { label: "פתרתי בעיה מקצועית מורכבת", ...r({ I: 3 }) },
      { label: "יצרתי משהו שהשאיר חותם", ...r({ A: 3 }) },
      { label: "שיניתי חיים של אנשים", ...r({ S: 3 }) },
      { label: "הקמתי עסק מצליח", ...r({ E: 3 }) },
      { label: "בניתי מערכת שעובדת בלי טעויות", ...r({ C: 3 }) },
    ],
  },
  {
    id: "q14",
    category: "riasec",
    mode: "single",
    text: "מה קורה לך מול טבלת אקסל גדולה?",
    choices: [
      { label: "מעדיף לצאת לשטח", ...r({ R: 3 }) },
      { label: "מיד מחפש מגמות ותובנות", ...r({ I: 3 }) },
      { label: "רוצה להפוך אותה לגרף יפה", ...r({ A: 2, C: 1 }) },
      { label: "שואל איך זה משפיע על אנשים", ...r({ S: 3 }) },
      { label: "בודק איפה אפשר להרוויח יותר", ...r({ E: 3 }) },
      { label: "נהנה לסדר ולנקות אותה", ...r({ C: 3 }) },
    ],
  },
  {
    id: "q15",
    category: "riasec",
    mode: "multi",
    text: "איזה סוג אחריות מרגיש לך נוח? (אפשר לבחור כמה)",
    choices: [
      { label: "אחריות על ציוד ותשתיות", ...r({ R: 2 }) },
      { label: "אחריות על נכונות ומידע", ...r({ I: 2 }) },
      { label: "אחריות על מראה ומיתוג", ...r({ A: 2 }) },
      { label: "אחריות על אנשים", ...r({ S: 2 }) },
      { label: "אחריות על תוצאות ורווח", ...r({ E: 2 }) },
      { label: "אחריות על סדר וכספים", ...r({ C: 2 }) },
    ],
  },
  {
    id: "q16",
    category: "riasec",
    mode: "single",
    text: "ואם היית יכול לבחור מקצוע בלי שום מגבלה, מה היה קרוב לזה?",
    choices: [
      { label: "בעל מקצוע מבוקש בשטח", ...r({ R: 3 }) },
      { label: "מומחה טכנולוגי או מחקרי", ...r({ I: 3 }) },
      { label: "יוצר, מעצב או כותב", ...r({ A: 3 }) },
      { label: "מחנך, מטפל או מדריך", ...r({ S: 3 }) },
      { label: "בעל עסק או מנהל בכיר", ...r({ E: 3 }) },
      { label: "מנהל כספים ומערכות", ...r({ C: 3 }) },
    ],
  },
  {
    id: "q17",
    category: "riasec",
    mode: "single",
    text: "בסוף הכשרה או קורס, מה הכי ירגש אותך?",
    choices: [
      { label: "פרויקט מעשי שסיימתי בהצלחה", ...r({ R: 3 }) },
      { label: "הבנה מלאה של החומר התיאורטי", ...r({ I: 3 }) },
      { label: "יצרתי משהו מקורי משלי", ...r({ A: 3 }) },
      { label: "עזרתי לחברים בקבוצה להבין", ...r({ S: 3 }) },
      { label: "הובלתי את הקבוצה להישג", ...r({ E: 3 }) },
      { label: "סיכום מסודר שכולם השתמשו בו", ...r({ C: 3 }) },
    ],
  },
  {
    id: "q18",
    category: "riasec",
    mode: "single",
    text: "מה תעדיף לעשות בסוף שבוע כדי 'להתאוורר' מהראש?",
    choices: [
      { label: "לתקן/לבנות משהו בבית", ...r({ R: 3 }) },
      { label: "לקרוא או לצפות בתוכן מעמיק", ...r({ I: 3 }) },
      { label: "ליצור, לצייר, לנגן, לכתוב", ...r({ A: 3 }) },
      { label: "לבלות עם אנשים קרובים", ...r({ S: 3 }) },
      { label: "לתכנן פרויקט או יוזמה חדשה", ...r({ E: 3 }) },
      { label: "לסדר ולארגן את הבית / החדר", ...r({ C: 3 }) },
    ],
  },
  {
    id: "q19",
    category: "riasec",
    mode: "multi",
    text: "אילו מהמשפטים הבאים נכונים עליך? (אפשר לבחור כמה)",
    choices: [
      { label: "אני טוב עם הידיים וכלים", ...r({ R: 2 }) },
      { label: "אני שואל \"למה\" על כל דבר", ...r({ I: 2 }) },
      { label: "יש לי דמיון עשיר", ...r({ A: 2 }) },
      { label: "אנשים באים אליי לדבר", ...r({ S: 2 }) },
      { label: "אני יוזם דברים בלי לחכות שיבקשו", ...r({ E: 2 }) },
      { label: "אני שם לב לפרטים קטנים שאחרים מפספסים", ...r({ C: 2 }) },
    ],
  },
  {
    id: "q20",
    category: "riasec",
    mode: "single",
    text: "כשמשהו נשבר או לא עובד בבית, מה קורה קודם?",
    choices: [
      { label: "אני פותח ומנסה לתקן בעצמי", ...r({ R: 3 }) },
      { label: "אני מחפש הסבר טכני לתקלה", ...r({ I: 3 }) },
      { label: "אני חושב על פתרון יצירתי זמני", ...r({ A: 3 }) },
      { label: "אני מבקש עזרה ממישהו קרוב", ...r({ S: 3 }) },
      { label: "אני מתקשר למישהו שיבוא לתקן", ...r({ E: 2 }) },
      { label: "אני בודק במדריך / באחריות מה הנוהל", ...r({ C: 3 }) },
    ],
  },
  {
    id: "q21",
    category: "riasec",
    mode: "single",
    text: "איזה סוג פרויקט היה נותן לך הכי הרבה סיפוק להוביל?",
    choices: [
      { label: "בניית משהו פיזי מהיסוד", ...r({ R: 3 }) },
      { label: "מחקר שמגלה משהו חדש", ...r({ I: 3 }) },
      { label: "יצירת קמפיין או עיצוב מקורי", ...r({ A: 3 }) },
      { label: "תוכנית שעוזרת לאנשים", ...r({ S: 3 }) },
      { label: "עסק או מיזם חדש שמניב רווח", ...r({ E: 3 }) },
      { label: "מערכת שמסדרת תהליך מבולגן", ...r({ C: 3 }) },
    ],
  },
  {
    id: "q22",
    category: "riasec",
    mode: "multi",
    text: "אילו מהפעילויות הבאות היית עושה גם בהתנדבות, בלי תשלום? (אפשר לבחור כמה)",
    choices: [
      { label: "לעזור בבנייה / שיפוץ לנזקקים", ...r({ R: 2 }) },
      { label: "לחקור ולכתוב על נושא שמעניין אותי", ...r({ I: 2 }) },
      { label: "לעצב / לצייר / ליצור למען מטרה", ...r({ A: 2 }) },
      { label: "ללוות ולהקשיב למישהו במצוקה", ...r({ S: 2 }) },
      { label: "לגייס תרומות ולשווק מטרה", ...r({ E: 2 }) },
      { label: "לנהל את הרישום והתקציב של עמותה", ...r({ C: 2 }) },
    ],
  },
  {
    id: "q23",
    category: "riasec",
    mode: "single",
    text: "מה יגרום לך להרגיש שבזבזת יום שלם?",
    choices: [
      { label: "לא עשיתי שום דבר מוחשי", ...r({ R: 3 }) },
      { label: "לא למדתי או הבנתי שום דבר חדש", ...r({ I: 3 }) },
      { label: "לא יצרתי כלום", ...r({ A: 3 }) },
      { label: "לא היה לי קשר משמעותי עם אף אחד", ...r({ S: 3 }) },
      { label: "לא קידמתי שום דבר קדימה", ...r({ E: 3 }) },
      { label: "הכל היה מבולגן ולא מסודר", ...r({ C: 3 }) },
    ],
  },
  {
    id: "q24",
    category: "riasec",
    mode: "single",
    text: "בסיפור על עצמך בעוד חמש שנים, מה הכי מדויק?",
    choices: [
      { label: "בעל מקצוע מבוקש שעובד עם הידיים", ...r({ R: 3 }) },
      { label: "מומחה שמבין לעומק תחום מסוים", ...r({ I: 3 }) },
      { label: "יוצר עם סגנון וקול משלו", ...r({ A: 3 }) },
      { label: "מישהו שאנשים סומכים עליו ופונים אליו", ...r({ S: 3 }) },
      { label: "מוביל צוות או בעל עסק משגשג", ...r({ E: 3 }) },
      { label: "מישהו שהכל אצלו מתפקד בלי תקלות", ...r({ C: 3 }) },
    ],
  },

  // ============================= Work Style (4) =============================
  {
    id: "ws1",
    category: "workStyle",
    mode: "multi",
    text: "תאר לעצמך יום עבודה אידיאלי — אילו מהתיאורים הבאים הכי מדברים אליך? (אפשר לבחור כמה)",
    choices: [
      { label: "עבודה שקטה לבד, בלי הרבה אינטראקציה", workStyle: { aloneVsPeople: -2 } },
      { label: "עבודה בצוות עם אנשים כל היום", workStyle: { aloneVsPeople: 2 } },
      { label: "רוב הזמן במשרד מסודר וקבוע", workStyle: { officeVsField: -2 } },
      { label: "רוב הזמן בשטח, בתנועה, בין מקומות", workStyle: { officeVsField: 2 } },
    ],
  },
  {
    id: "ws2",
    category: "workStyle",
    mode: "multi",
    text: "מה מתאר טוב יותר את סוג הפעילות שגורמת לך סיפוק? (אפשר לבחור כמה)",
    choices: [
      { label: "לעבוד עם הידיים ולראות תוצאה מוחשית", workStyle: { handsVsThinking: -2 } },
      { label: "לחשוב, לנתח ולתכנן", workStyle: { handsVsThinking: 2 } },
      { label: "שגרה קבועה שאני שולט בה היטב", workStyle: { routineVsVariety: -2 } },
      { label: "כל יום שונה ומגוון מהקודם", workStyle: { routineVsVariety: 2 } },
    ],
  },
  {
    id: "ws3",
    category: "workStyle",
    mode: "multi",
    text: "באיזה סוג סביבה אתה מתפקד הכי טוב? (אפשר לבחור כמה)",
    choices: [
      { label: "כשיש לי הנחיות ברורות ומדויקות מראש", workStyle: { structureVsAmbiguity: -2 } },
      { label: "כשיש הרבה מקום לפרש ולהחליט בעצמי", workStyle: { structureVsAmbiguity: 2 } },
      { label: "קצב מהיר, לחץ ואתגרים מיידיים", workStyle: { fastVsCalmPace: 2 } },
      { label: "קצב רגוע ומדוד, בלי לחץ מתמיד", workStyle: { fastVsCalmPace: -2 } },
    ],
  },
  {
    id: "ws4",
    category: "workStyle",
    mode: "multi",
    text: "מה מתאר אותך יותר? (אפשר לבחור כמה)",
    choices: [
      { label: "אני צריך שמישהו יגדיר לי מסגרת ברורה", workStyle: { independenceVsFramework: -2 } },
      { label: "אני מעדיף לפעול בעצמאות מלאה, בלי שמישהו עומד לי מעל", workStyle: { independenceVsFramework: 2 } },
      { label: "אני נהנה לעמוד מול קהל ולהיות במרכז", workStyle: { publicVsBackstage: 2 } },
      { label: "אני מעדיף לעבוד מאחורי הקלעים, בלי זרקורים", workStyle: { publicVsBackstage: -2 } },
    ],
  },

  // ============================= Work Values (3) =============================
  {
    id: "wv1",
    category: "workValues",
    mode: "multi",
    text: "מתוך הרשימה הבאה, מה הכי חשוב לך בעבודה? (בחר עד 2)",
    choices: [
      { label: "יציבות — לדעת למה לצפות", workValues: { stability: 3 } },
      { label: "ביטחון תעסוקתי — שלא יפטרו אותי בקלות", workValues: { jobSecurity: 3 } },
      { label: "הכנסה גבוהה", workValues: { income: 3 } },
      { label: "עצמאות בעבודה", workValues: { independence: 3 } },
      { label: "גמישות בשעות ובמקום העבודה", workValues: { flexibility: 3 } },
    ],
  },
  {
    id: "wv2",
    category: "workValues",
    mode: "multi",
    text: "ומה מבין אלה הכי חשוב לך? (בחר עד 2)",
    choices: [
      { label: "שליחות — להרגיש שאני תורם למשהו גדול ממני", workValues: { mission: 3 } },
      { label: "משמעות אישית בעבודה עצמה", workValues: { meaning: 3 } },
      { label: "קידום והתקדמות בסולם הדרגות", workValues: { advancement: 3 } },
      { label: "מקום לביטוי יצירתי", workValues: { creativity: 3 } },
      { label: "איזון בין עבודה לחיים האישיים", workValues: { balance: 3 } },
    ],
  },
  {
    id: "wv3",
    category: "workValues",
    mode: "single",
    text: "אם היית צריך לבחור רק דבר אחד שהכי יגדיר עבורך \"עבודה טובה\", מה הוא היה?",
    choices: [
      { label: "יציבות", workValues: { stability: 3 } },
      { label: "ביטחון תעסוקתי", workValues: { jobSecurity: 3 } },
      { label: "הכנסה גבוהה", workValues: { income: 3 } },
      { label: "עצמאות", workValues: { independence: 3 } },
      { label: "שליחות", workValues: { mission: 3 } },
      { label: "משמעות אישית", workValues: { meaning: 3 } },
      { label: "קידום", workValues: { advancement: 3 } },
      { label: "יצירתיות", workValues: { creativity: 3 } },
      { label: "איזון חיים-עבודה", workValues: { balance: 3 } },
      { label: "גמישות", workValues: { flexibility: 3 } },
    ],
  },

  // ============================= Validation (1) =============================
  {
    id: "val1",
    category: "validation",
    mode: "single",
    text: "ולסיום — אם היית צריך לתמצת את עצמך במשפט אחד, מה הכי מתאר אותך?",
    choices: [
      { label: "אני אדם מעשי שעושה ולא רק מדבר", riasec: { R: 1 }, validationLetter: "R" },
      { label: "אני אדם שחייב להבין לעומק לפני שהוא פועל", riasec: { I: 1 }, validationLetter: "I" },
      { label: "אני אדם עם דמיון וצורך ליצור", riasec: { A: 1 }, validationLetter: "A" },
      { label: "אני אדם שחי בשביל לעזור ולהיות עם אנשים", riasec: { S: 1 }, validationLetter: "S" },
      { label: "אני אדם שרודף הזדמנויות ומוביל", riasec: { E: 1 }, validationLetter: "E" },
      { label: "אני אדם מסודר שאי אפשר להפתיע", riasec: { C: 1 }, validationLetter: "C" },
    ],
  },
];

export const TOTAL_QUESTIONS = QUESTIONS.length;

// --------------------------------- Scoring Engine ---------------------------------
// מנוע הניקוד מופרד לחלוטין מה-UI. UI שולח רק Record<questionId, selectedChoiceIndexes[]>.

export type AnswerMap = Record<string, number[]>;

export interface RawTotals {
  riasec: Scores;
  workStyle: WorkStyleScores;
  workValues: WorkValueScores;
}

export function computeRawTotals(answers: AnswerMap): RawTotals {
  const riasec = emptyScores();
  const workStyle = emptyWorkStyle();
  const workValues = emptyWorkValues();

  for (const q of QUESTIONS) {
    const picked = answers[q.id] ?? [];
    for (const i of picked) {
      const choice = q.choices[i];
      if (!choice) continue;
      if (choice.riasec) {
        for (const [k, v] of Object.entries(choice.riasec)) {
          riasec[k as RiasecKey] += v ?? 0;
        }
      }
      if (choice.workStyle) {
        for (const [k, v] of Object.entries(choice.workStyle)) {
          workStyle[k as WorkStyleKey] += v ?? 0;
        }
      }
      if (choice.workValues) {
        for (const [k, v] of Object.entries(choice.workValues)) {
          workValues[k as WorkValueKey] += v ?? 0;
        }
      }
    }
  }

  return { riasec, workStyle, workValues };
}

/**
 * הסכום המקסימלי התיאורטי שניתן לצבור לכל מפתח, מחושב מתוך מבנה השאלות עצמו
 * (סכום הערכים המוחלטים של כל המשקלים הרלוונטיים על פני כל השאלות).
 * זה מבטיח נורמליזציה שמותאמת אוטומטית למספר השאלות ולמשקלים בפועל,
 * ולא תלויה בקבועים שרירותיים שעלולים להתיישן כשהשאלון משתנה.
 */
function computeMaxAbs<K extends string>(
  extractor: (choice: Choice) => Partial<Record<K, number>> | undefined,
  categoryFilter?: QuestionCategory,
): Record<K, number> {
  const max: Record<string, number> = {};
  for (const q of QUESTIONS) {
    if (categoryFilter && q.category !== categoryFilter) continue;
    for (const choice of q.choices) {
      const weights = extractor(choice);
      if (!weights) continue;
      for (const [k, v] of Object.entries(weights)) {
        const abs = Math.abs((v as number) ?? 0);
        max[k] = (max[k] ?? 0) + abs;
      }
    }
  }
  return max as Record<K, number>;
}

/** סכום מקסימלי חיובי / שלילי בנפרד — נחוץ לציר דו-קוטבי כמו Work Style */
function computeMaxSigned<K extends string>(
  extractor: (choice: Choice) => Partial<Record<K, number>> | undefined,
): { pos: Record<K, number>; neg: Record<K, number> } {
  const pos: Record<string, number> = {};
  const neg: Record<string, number> = {};
  for (const q of QUESTIONS) {
    for (const choice of q.choices) {
      const weights = extractor(choice);
      if (!weights) continue;
      for (const [k, v] of Object.entries(weights)) {
        const val = (v as number) ?? 0;
        if (val > 0) pos[k] = (pos[k] ?? 0) + val;
        else if (val < 0) neg[k] = (neg[k] ?? 0) + Math.abs(val);
      }
    }
  }
  return { pos: pos as Record<K, number>, neg: neg as Record<K, number> };
}

const RIASEC_MAX = computeMaxAbs<RiasecKey>((c) => c.riasec, "riasec");
// לצירך העמסת ה-Work Values/Style, לא מסננים לפי קטגוריה כי המפתחות ייחודיים ממילא לקטגוריה שלהם.
const WORK_VALUES_MAX = computeMaxAbs<WorkValueKey>((c) => c.workValues);
const WORK_STYLE_SIGNED = computeMaxSigned<WorkStyleKey>((c) => c.workStyle);

export type Level = "נמוך" | "בינוני" | "גבוה" | "גבוה מאוד";

export function levelFromPercent(p: number): Level {
  if (p >= 75) return "גבוה מאוד";
  if (p >= 50) return "גבוה";
  if (p >= 25) return "בינוני";
  return "נמוך";
}

export interface RiasecDimension {
  key: RiasecKey;
  raw: number;
  /** אחוז מתוך המקסימום התיאורטי - משמש לרמות (נמוך/בינוני/גבוה/גבוה מאוד) */
  percentOfMax: number;
  /** אחוז יחסי לממד החזק ביותר אצל המשתמש - משמש להצגה גרפית (רדאר) */
  relativePercent: number;
  level: Level;
  info: TypeInfo;
}

export interface WorkStyleDimension {
  key: WorkStyleKey;
  /** 100- עד 100, שלילי = קוטב neg, חיובי = קוטב pos */
  value: number;
  level: "מאוזן" | Level;
  dominant: "neg" | "pos" | "מאוזן";
  info: WorkStyleAxisInfo;
}

export interface WorkValueDimension {
  key: WorkValueKey;
  percentOfMax: number;
  level: Level;
  label: string;
}

export interface Profile {
  riasec: RiasecDimension[]; // ממוין מהחזק לחלש
  top: RiasecKey[];
  hollandCode: string;
  workStyle: WorkStyleDimension[];
  workValues: WorkValueDimension[]; // ממוין מהחזק לחלש
  /** האם התשובה בשאלת הכיול תואמת את הממד החזק ביותר שחושב מהשאלון */
  validationConsistent: boolean | null;
  /** האם המשתמש דילג על שאלות רבות מדי - משפיע על אמינות התוצאה */
  lowConfidence: boolean;
}

export function buildProfile(
  totals: RawTotals,
  opts?: { validationLetter?: RiasecKey | null; skippedCount?: number },
): Profile {
  const riasecMaxSelf = Math.max(1, ...RIASEC_KEYS.map((k) => totals.riasec[k]));

  const riasec: RiasecDimension[] = [...RIASEC_KEYS]
    .map((k) => {
      const raw = totals.riasec[k];
      const maxTheoretical = Math.max(1, RIASEC_MAX[k] ?? 1);
      const percentOfMax = Math.round((raw / maxTheoretical) * 100);
      const relativePercent = Math.round((raw / riasecMaxSelf) * 100);
      return {
        key: k,
        raw,
        percentOfMax: Math.max(0, Math.min(100, percentOfMax)),
        relativePercent: Math.max(0, Math.min(100, relativePercent)),
        level: levelFromPercent(percentOfMax),
        info: TYPES[k],
      };
    })
    .sort((a, b) => b.raw - a.raw);

  const top = riasec.slice(0, 3).map((d) => d.key).filter((k) => totals.riasec[k] > 0);

  const workStyle: WorkStyleDimension[] = WORK_STYLE_KEYS.map((k) => {
    const raw = totals.workStyle[k];
    const maxPos = Math.max(1, WORK_STYLE_SIGNED.pos[k] ?? 1);
    const maxNeg = Math.max(1, WORK_STYLE_SIGNED.neg[k] ?? 1);
    const denom = raw >= 0 ? maxPos : maxNeg;
    const value = Math.round(Math.max(-100, Math.min(100, (raw / denom) * 100)));
    const dominant: "neg" | "pos" | "מאוזן" = value > 20 ? "pos" : value < -20 ? "neg" : "מאוזן";
    const level = dominant === "מאוזן" ? "מאוזן" : levelFromPercent(Math.abs(value));
    return { key: k, value, level, dominant, info: WORK_STYLE_AXES[k] };
  });

  const workValues: WorkValueDimension[] = WORK_VALUE_KEYS.map((k) => {
    const raw = totals.workValues[k];
    const maxTheoretical = Math.max(1, WORK_VALUES_MAX[k] ?? 1);
    const percentOfMax = Math.max(0, Math.min(100, Math.round((raw / maxTheoretical) * 100)));
    return { key: k, percentOfMax, level: levelFromPercent(percentOfMax), label: WORK_VALUE_LABELS[k] };
  }).sort((a, b) => b.percentOfMax - a.percentOfMax);

  const validationConsistent =
    opts?.validationLetter != null && top.length > 0 ? top[0] === opts.validationLetter : null;

  const lowConfidence = (opts?.skippedCount ?? 0) > 6;

  return {
    riasec,
    top,
    hollandCode: top.join(""),
    workStyle,
    workValues,
    validationConsistent,
    lowConfidence,
  };
}

// --------------------------------- Career Matching Engine ---------------------------------

export interface CareerProfile {
  id: string;
  title: string;
  field: string;
  requirements: string;
  /** 0-100 לכל ממד RIASEC - כמה הממד חשוב/בולט במקצוע */
  riasec: Scores;
  /** רק צירים רלוונטיים למקצוע, 100- עד 100 */
  workStyle?: Partial<WorkStyleScores>;
  /** רק ערכים רלוונטיים, משקל חשיבות 1-3 */
  workValues?: Partial<WorkValueScores>;
}

export const CAREER_PROFILES: CareerProfile[] = [
  { id: "electrician", title: "חשמלאי מוסמך", field: "טכני ותשתיות", requirements: "קורס חשמלאים מוסמך + התמחות בשטח",
    riasec: { R: 90, I: 30, A: 10, S: 20, E: 20, C: 40 },
    workStyle: { officeVsField: 70, handsVsThinking: -80, independenceVsFramework: 20 },
    workValues: { stability: 3, income: 2 } },
  { id: "it-tech", title: "טכנאי מחשבים ורשתות", field: "טכני ותשתיות", requirements: "קורס טכנאי מחשבים / הכשרה מקצועית",
    riasec: { R: 70, I: 60, A: 10, S: 20, E: 10, C: 50 },
    workStyle: { officeVsField: -10, handsVsThinking: -40 },
    workValues: { stability: 2, income: 2 } },
  { id: "sw-dev", title: "מפתח תוכנה", field: "טכנולוגיה", requirements: "לימודי תכנות / מדעי המחשב, פרויקט תיק עבודות",
    riasec: { R: 20, I: 85, A: 40, S: 20, E: 30, C: 40 },
    workStyle: { aloneVsPeople: -30, handsVsThinking: 60, routineVsVariety: 40 },
    workValues: { income: 3, independence: 2, creativity: 1 } },
  { id: "data-analyst", title: "אנליסט נתונים (Data Analyst)", field: "טכנולוגיה", requirements: "קורס ניתוח נתונים, שליטה ב-Excel/SQL",
    riasec: { R: 10, I: 85, A: 20, S: 20, E: 20, C: 70 },
    workStyle: { handsVsThinking: 70 },
    workValues: { stability: 2, income: 2 } },
  { id: "accountant", title: "רואה חשבון", field: "כלכלה ומינהל", requirements: "תואר בחשבונאות + התמחות + בחינות לשכה",
    riasec: { R: 10, I: 55, A: 10, S: 20, E: 30, C: 90 },
    workStyle: { structureVsAmbiguity: -70, handsVsThinking: 50 },
    workValues: { stability: 3, jobSecurity: 3, income: 2 } },
  { id: "graphic-designer", title: "מעצב גרפי / UX-UI", field: "עיצוב ותוכן", requirements: "לימודי עיצוב גרפי / UX, תיק עבודות",
    riasec: { R: 20, I: 30, A: 90, S: 30, E: 30, C: 20 },
    workStyle: { routineVsVariety: 60, independenceVsFramework: 30 },
    workValues: { creativity: 3, flexibility: 2 } },
  { id: "copywriter", title: "קופירייטר וכותב תוכן", field: "עיצוב ותוכן", requirements: "כתיבה, פורטפוליו טקסטים",
    riasec: { R: 10, I: 40, A: 85, S: 40, E: 30, C: 20 },
    workStyle: { aloneVsPeople: -20 },
    workValues: { creativity: 3, meaning: 1 } },
  { id: "teacher", title: "מלמד / מחנך", field: "חינוך וטיפול", requirements: "תעודת הוראה / הכשרה חינוכית",
    riasec: { R: 20, I: 40, A: 30, S: 90, E: 40, C: 30 },
    workStyle: { aloneVsPeople: 70, publicVsBackstage: 40 },
    workValues: { mission: 3, meaning: 3, stability: 1 } },
  { id: "social-worker", title: "עובד סוציאלי", field: "חינוך וטיפול", requirements: "תואר בעבודה סוציאלית",
    riasec: { R: 10, I: 40, A: 20, S: 90, E: 30, C: 30 },
    workStyle: { aloneVsPeople: 80 },
    workValues: { mission: 3, meaning: 3 } },
  { id: "therapist", title: "מטפל רגשי / CBT", field: "חינוך וטיפול", requirements: "תואר בפסיכולוגיה/טיפול + הכשרה קלינית",
    riasec: { R: 10, I: 50, A: 30, S: 90, E: 20, C: 20 },
    workStyle: { aloneVsPeople: 40 },
    workValues: { meaning: 3, independence: 1 } },
  { id: "entrepreneur", title: "יזם ובעל עסק", field: "ניהול ועסקים", requirements: "אין דרישת השכלה פורמלית, נדרש הון/ניסיון",
    riasec: { R: 30, I: 40, A: 40, S: 40, E: 95, C: 30 },
    workStyle: { independenceVsFramework: 80, fastVsCalmPace: 50 },
    workValues: { independence: 3, income: 2, advancement: 2 } },
  { id: "sales-manager", title: "מנהל מכירות", field: "ניהול ועסקים", requirements: "ניסיון מכירות, לרוב ללא דרישת תואר",
    riasec: { R: 10, I: 20, A: 20, S: 60, E: 90, C: 40 },
    workStyle: { publicVsBackstage: 60, fastVsCalmPace: 40 },
    workValues: { income: 3, advancement: 2 } },
  { id: "project-manager", title: "מנהל פרויקטים", field: "ניהול ועסקים", requirements: "תואר רלוונטי + ניסיון ניהולי",
    riasec: { R: 20, I: 50, A: 20, S: 50, E: 70, C: 70 },
    workValues: { advancement: 2, stability: 1 } },
  { id: "bookkeeper", title: "הנהלת חשבונות / חשב שכר", field: "כלכלה ומינהל", requirements: "קורס הנהלת חשבונות",
    riasec: { R: 10, I: 30, A: 10, S: 20, E: 10, C: 95 },
    workStyle: { structureVsAmbiguity: -80, routineVsVariety: -50 },
    workValues: { stability: 3, jobSecurity: 3 } },
  { id: "office-manager", title: "מנהל משרד ואדמיניסטרציה", field: "כלכלה ומינהל", requirements: "לרוב ללא דרישת תואר, ניסיון ארגוני",
    riasec: { R: 20, I: 30, A: 10, S: 50, E: 30, C: 85 },
    workValues: { stability: 2, balance: 2 } },
  { id: "legal-assistant", title: "עוזר משפטי", field: "כלכלה ומינהל", requirements: "קורס עוזר/ת משפטי/ת",
    riasec: { R: 10, I: 50, A: 10, S: 30, E: 20, C: 85 },
    workValues: { stability: 2, jobSecurity: 2 } },
  { id: "car-tech", title: "טכנאי רכב", field: "טכני ותשתיות", requirements: "קורס מכונאות רכב + התמחות",
    riasec: { R: 95, I: 30, A: 10, S: 20, E: 10, C: 30 },
    workStyle: { handsVsThinking: -85, officeVsField: 40 },
    workValues: { stability: 2, income: 2 } },
  { id: "carpenter", title: "נגר ואומן רהיטים", field: "טכני ואומנות יד", requirements: "קורס נגרות / התמחות אצל בעל מקצוע",
    riasec: { R: 90, I: 20, A: 50, S: 10, E: 20, C: 30 },
    workStyle: { handsVsThinking: -70, routineVsVariety: 30 },
    workValues: { creativity: 2, independence: 2 } },
  { id: "maintenance-manager", title: "מנהל אחזקה", field: "טכני ותשתיות", requirements: "ניסיון טכני + יכולת ניהול",
    riasec: { R: 80, I: 40, A: 10, S: 40, E: 40, C: 60 },
    workValues: { stability: 2 } },
  { id: "plumber", title: "אינסטלטור / קבלן שיפוצים", field: "טכני ואומנות יד", requirements: "קורס אינסטלציה + רישיון קבלן",
    riasec: { R: 90, I: 20, A: 20, S: 30, E: 40, C: 30 },
    workStyle: { officeVsField: 80, independenceVsFramework: 50 },
    workValues: { independence: 2, income: 2 } },
  { id: "youth-guide", title: "מדריך נוער וקירוב", field: "חינוך וטיפול", requirements: "הכשרת הדרכה, לרוב ללא דרישת תואר",
    riasec: { R: 30, I: 20, A: 40, S: 90, E: 50, C: 20 },
    workStyle: { aloneVsPeople: 70, publicVsBackstage: 30 },
    workValues: { mission: 3, meaning: 2 } },
  { id: "business-consultant", title: "יועץ עסקי לעסקים קטנים", field: "ניהול ועסקים", requirements: "ניסיון עסקי / תואר בכלכלה-מנהל עסקים",
    riasec: { R: 10, I: 60, A: 20, S: 50, E: 85, C: 40 },
    workValues: { independence: 2, income: 2 } },
  { id: "real-estate", title: "מתווך נדל\"ן", field: "ניהול ועסקים", requirements: "קורס תיווך + רישיון",
    riasec: { R: 10, I: 20, A: 20, S: 60, E: 90, C: 30 },
    workStyle: { fastVsCalmPace: 50, independenceVsFramework: 40 },
    workValues: { income: 3, independence: 2 } },
  { id: "insurance-agent", title: "סוכן ביטוח ופיננסים", field: "ניהול ועסקים", requirements: "רישיון סוכן ביטוח/פנסיוני",
    riasec: { R: 10, I: 40, A: 10, S: 50, E: 80, C: 50 },
    workValues: { income: 3, independence: 1 } },
  { id: "digital-marketing", title: "מנהל שיווק דיגיטלי", field: "עיצוב ותוכן", requirements: "קורס שיווק דיגיטלי, ניסיון בפלטפורמות",
    riasec: { R: 10, I: 40, A: 70, S: 40, E: 75, C: 40 },
    workStyle: { routineVsVariety: 50 },
    workValues: { creativity: 2, advancement: 2 } },
  { id: "qa-tester", title: "בודק תוכנה (QA)", field: "טכנולוגיה", requirements: "קורס QA, ללא דרישת תואר בהכרח",
    riasec: { R: 30, I: 75, A: 10, S: 30, E: 10, C: 70 },
    workStyle: { handsVsThinking: 40 },
    workValues: { stability: 2 } },
  { id: "systems-engineer", title: "מהנדס מערכות / תשתיות", field: "טכנולוגיה", requirements: "תואר הנדסה רלוונטי",
    riasec: { R: 70, I: 75, A: 10, S: 20, E: 20, C: 50 },
    workValues: { stability: 2, income: 2 } },
  { id: "video-editor", title: "עורך וידאו ואנימציה", field: "עיצוב ותוכן", requirements: "קורס עריכה/אנימציה, תיק עבודות",
    riasec: { R: 30, I: 20, A: 90, S: 20, E: 20, C: 30 },
    workStyle: { aloneVsPeople: -30, routineVsVariety: 50 },
    workValues: { creativity: 3 } },
  { id: "photographer", title: "צלם אירועים ומוצר", field: "עיצוב ותוכן", requirements: "ציוד + תיק עבודות, לרוב עצמאי",
    riasec: { R: 30, I: 10, A: 85, S: 50, E: 40, C: 20 },
    workStyle: { officeVsField: 50, publicVsBackstage: 30 },
    workValues: { creativity: 3, flexibility: 2 } },
  { id: "interior-designer", title: "מעצב פנים", field: "עיצוב ותוכן", requirements: "לימודי עיצוב פנים",
    riasec: { R: 30, I: 20, A: 85, S: 40, E: 40, C: 30 },
    workValues: { creativity: 3, flexibility: 1 } },
  { id: "logistics-manager", title: "מנהל לוגיסטיקה ומלאי", field: "כלכלה ומינהל", requirements: "ניסיון ארגוני, לרוב ללא דרישת תואר",
    riasec: { R: 40, I: 40, A: 10, S: 20, E: 30, C: 90 },
    workStyle: { structureVsAmbiguity: -60 },
    workValues: { stability: 2, jobSecurity: 2 } },
  { id: "budget-analyst", title: "בקר תקציב / אנליסט פיננסי", field: "כלכלה ומינהל", requirements: "תואר בכלכלה/מימון",
    riasec: { R: 10, I: 70, A: 10, S: 20, E: 30, C: 85 },
    workValues: { stability: 2, income: 2 } },
  { id: "nurse", title: "אח / אחות (סיעוד)", field: "חינוך וטיפול", requirements: "תואר בסיעוד + רישוי",
    riasec: { R: 40, I: 40, A: 10, S: 90, E: 20, C: 40 },
    workStyle: { aloneVsPeople: 60, fastVsCalmPace: 30 },
    workValues: { mission: 3, stability: 2 } },
  { id: "fundraiser", title: "מגייס משאבים לארגון", field: "ניהול ועסקים", requirements: "ניסיון בגיוס משאבים / שיווק",
    riasec: { R: 10, I: 30, A: 30, S: 70, E: 80, C: 30 },
    workValues: { mission: 2, income: 1 } },
  { id: "actuary", title: "אקטואר / חוקר שוק", field: "כלכלה ומינהל", requirements: "תואר במתמטיקה/סטטיסטיקה + הסמכה",
    riasec: { R: 10, I: 90, A: 10, S: 20, E: 30, C: 60 },
    workValues: { stability: 2, income: 2 } },
  { id: "musician", title: "מוזיקאי / אמן במה", field: "עיצוב ותוכן", requirements: "כישרון + לימוד מוזיקה, לרוב עצמאי",
    riasec: { R: 20, I: 20, A: 90, S: 50, E: 40, C: 10 },
    workStyle: { publicVsBackstage: 60, routineVsVariety: 60, independenceVsFramework: 50 },
    workValues: { creativity: 3, meaning: 2 } },
];

export interface CareerMatch {
  career: CareerProfile;
  matchScore: number; // 0-100
  sharedRiasec: RiasecKey[]; // הממדים שבהם המשתמש והמקצוע גבוהים במקביל
  sharedWorkValues: WorkValueKey[];
}

function riasecCloseness(userRelative: Record<RiasecKey, number>, career: Scores): number {
  let weightedSum = 0;
  let weightTotal = 0;
  for (const k of RIASEC_KEYS) {
    const importance = career[k]; // 0-100, כמה חשוב הממד הזה למקצוע
    const closeness = 100 - Math.abs(userRelative[k] - career[k]);
    weightedSum += importance * Math.max(0, closeness);
    weightTotal += importance;
  }
  if (weightTotal === 0) return 50;
  return weightedSum / weightTotal;
}

function workStyleCloseness(userStyle: WorkStyleDimension[], careerStyle?: Partial<WorkStyleScores>): number | null {
  if (!careerStyle || Object.keys(careerStyle).length === 0) return null;
  let sum = 0;
  let count = 0;
  const userMap = Object.fromEntries(userStyle.map((d) => [d.key, d.value])) as Record<WorkStyleKey, number>;
  for (const [k, v] of Object.entries(careerStyle)) {
    const target = v ?? 0;
    const userVal = userMap[k as WorkStyleKey] ?? 0;
    const closeness = 100 - Math.abs(userVal - target) / 2; // הפרש מקסימלי 200 -> 0-100
    sum += Math.max(0, closeness);
    count += 1;
  }
  return count > 0 ? sum / count : null;
}

function workValuesCloseness(
  userValues: WorkValueDimension[],
  careerValues?: Partial<WorkValueScores>,
): { score: number | null; shared: WorkValueKey[] } {
  if (!careerValues || Object.keys(careerValues).length === 0) return { score: null, shared: [] };
  const userMap = Object.fromEntries(userValues.map((d) => [d.key, d.percentOfMax])) as Record<WorkValueKey, number>;
  let weightedSum = 0;
  let weightTotal = 0;
  const shared: WorkValueKey[] = [];
  for (const [k, importance] of Object.entries(careerValues)) {
    const w = importance ?? 0;
    const userScore = userMap[k as WorkValueKey] ?? 0;
    weightedSum += w * userScore;
    weightTotal += w;
    if (userScore >= 50) shared.push(k as WorkValueKey);
  }
  return { score: weightTotal > 0 ? weightedSum / weightTotal : null, shared };
}

/**
 * חישוב Match Score בין פרופיל המשתמש למקצוע, על בסיס RIASEC + Work Style + Work Values יחד.
 * במכוון לא משתמשים בלוגיקה פשטנית של "אות דומיננטית אחת = מקצוע" -
 * ההתאמה משוקללת על פני שלושת המרכיבים, ומקצוע שלא מגדיר Work Style/Values
 * מקבל את מלוא המשקל היחסי שלו מ-RIASEC.
 */
export function matchCareers(profile: Profile, limit = 8): CareerMatch[] {
  const userRelative = Object.fromEntries(profile.riasec.map((d) => [d.key, d.relativePercent])) as Record<
    RiasecKey,
    number
  >;

  const results: CareerMatch[] = CAREER_PROFILES.map((career) => {
    const riasecScore = riasecCloseness(userRelative, career.riasec);
    const styleScore = workStyleCloseness(profile.workStyle, career.workStyle);
    const { score: valuesScore, shared: sharedWorkValues } = workValuesCloseness(profile.workValues, career.workValues);

    let wRiasec = 0.6;
    let wStyle = 0.25;
    let wValues = 0.15;

    if (styleScore == null) {
      wRiasec += wStyle;
      wStyle = 0;
    }
    if (valuesScore == null) {
      wRiasec += wValues;
      wValues = 0;
    }

    const matchScore = Math.round(
      wRiasec * riasecScore + wStyle * (styleScore ?? 0) + wValues * (valuesScore ?? 0),
    );

    const sharedRiasec = RIASEC_KEYS.filter((k) => career.riasec[k] >= 60 && userRelative[k] >= 60);

    return { career, matchScore: Math.max(0, Math.min(100, matchScore)), sharedRiasec, sharedWorkValues };
  });

  return results.sort((a, b) => b.matchScore - a.matchScore).slice(0, limit);
}

/** מקצועות/סוגי עבודה שעשויים להתאים פחות, לפי הממדים החלשים ביותר של המשתמש */
export function leastFitNotes(profile: Profile): TypeInfo[] {
  return [...profile.riasec]
    .sort((a, b) => a.raw - b.raw)
    .slice(0, 2)
    .map((d) => d.info);
}

// --------------------------------- Helpers כלליים ---------------------------------

export function computeTop(scores: Scores, count = 3): RiasecKey[] {
  return [...RIASEC_KEYS]
    .sort((a, b) => scores[b] - scores[a])
    .slice(0, count)
    .filter((k) => scores[k] > 0);
}

export function hollandCode(top: RiasecKey[]): string {
  return top.slice(0, 3).join("");
}

/** נורמליזציה יחסית לממד החזק ביותר אצל המשתמש - משמשת לתצוגה גרפית (רדאר) בלבד */
export function normalize(scores: Scores): { key: RiasecKey; value: number; label: string }[] {
  const max = Math.max(1, ...RIASEC_KEYS.map((k) => scores[k]));
  return RIASEC_KEYS.map((k) => ({
    key: k,
    value: Math.round((scores[k] / max) * 100),
    label: TYPES[k].title.split(" ")[0] ?? TYPES[k].key,
  }));
}

export const STORAGE_KEY = "riasec-progress-v2";
export const RESULT_KEY = "riasec-result-v2";
export const WHATSAPP_GROUP = "https://chat.whatsapp.com/EfbcQPOzYc823iSisDwizd?s=cl&p=a&mlu=4";
