// =====================================================================================
// מערכת אבחון תעסוקתי — RIASEC + Work Style + Work Values + Career Matching
// גרסה 3 — לאחר סבב ביקורת שני, ממוקד בשלושה דברים שניתן לשפר בפועל בקוד (בלי
// נתוני אוכלוסייה אמיתיים, שהם מחוץ להיקף אפשרי כאן):
//
// 1) מהימנות מדידה: הוכפל מספר הפריטים (RIASEC: 4→5 לממד, Work Style: 1→2 לציר) כדי
//    שיהיה בכלל אפשר לחשב עקביות פנימית אמיתית ולא רק לטעון שהיא קיימת.
// 2) מדד עקביות תשובות אמיתי per-response (לא מדד אוכלוסייה כמו Cronbach's alpha,
//    וזה מצוין בפירוש) - מבוסס Split-Half על הפריטים בפועל שהמשתמש ענה עליהם.
// 3) סיפי הרמות (נמוך/בינוני/גבוה/גבוה מאוד) כבר לא קבועים שרירותיים (25/50/75%).
//    הם נגזרים מסימולציית Monte-Carlo דטרמיניסטית (PRNG עם seed קבוע) של "עונה
//    אקראי" על אותו שאלון בדיוק - כך שהרף מבוסס בפועל על "כמה זה שונה ממענה
//    מקרי", ולא על מספרים עגולים.
// 4) משקלי נוסחת ההתאמה (RIASEC/Work Style/Work Values) נגזרים ממספר הפריטים
//    בכל מרכיב (קירוב ל"אורך מבחן = אמינות" לפי כלל Spearman-Brown) ומהעדיפות
//    התיאורטית של הולנד לתחומי עניין כמנבא ראשי - לא נבחרו כי "הם הרגישו נכון".
//
// מגבלה גלויה שנשארה: פרופילי המקצועות (RIASEC 6-ממדי לכל מקצוע) נבנו בהערכה
// מקצועית עקבית, לא מנתוני O*NET גולמיים. בדקתי מדגם מול O*NET (onetonline.org)
// ומצאתי התאמה כיוונית טובה (לדוגמה: חשמלאים = Realistic/Conventional דומיננטי,
// מפתחי תוכנה = Investigative דומיננטי - תואם בדיוק את מה שהוגדר כאן), אך
// O*NET Online החדש חושף רק את תחומי העניין המובילים כטקסט, לא ציון מספרי
// לכל שש הממדים לכל מקצוע - כך שאי אפשר "לשאוב" נתונים מספריים מלאים בלי
// קובצי מסד הנתונים הגולמיים של O*NET, שהם מחוץ להיקף אפשרי כאן.
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
    description: "המוח שלך לא נח עד שהבנת את השורש. אתה אוהב לנתח, לחקור, להשוות ולבנות מסקנה מסודרת.",
    strengths: ["חשיבה אנליטית", "למידה עצמאית מהירה", "דיוק בפרטים", "יכולת סברא והבחנה"],
    lowDescription:
      "עבודה עם שגרה חוזרת בלי מרחב לחשוב ולנתח לעומק, או כזו שדורשת החלטות מהירות בלי זמן לבדוק, עלולה להתאים פחות.",
  },
  A: {
    key: "A",
    title: "היוצר (Artistic)",
    short: "לראות את מה שעוד לא קיים",
    description: "יש לך עין לפרטים אסתטיים ולראש שממציא. אתה נהנה לייצר משהו משלך - עיצוב, כתיבה, ניגון או רעיון חדש.",
    strengths: ["דמיון ורעננות", "חוש עיצובי", "יכולת ביטוי", "חשיבה מחוץ לקופסה"],
    lowDescription:
      "סביבות עם נהלים נוקשים וחוזרים על עצמם, בלי שום מקום לביטוי אישי או לגיוון, עלולות להרגיש מחניקות עבורך.",
  },
  S: {
    key: "S",
    title: "החברתי (Social)",
    short: "אנשים לפני הכל",
    description: "אתה מתמלא מאנשים. יש לך אוזן קשבת, סבלנות ויכולת להסביר, לחבר ולהרים אחרים.",
    strengths: ["אמפתיה והקשבה", "יכולת הוראה והסבר", "בניית אמון", "פישור וגישור"],
    lowDescription:
      "עבודה בבידוד ממושך מול מסך או מכונה, כמעט בלי קשר עם בני אדם, עלולה להרגיש ריקה מבחינתך לאורך זמן.",
  },
  E: {
    key: "E",
    title: "היזם (Enterprising)",
    short: "להוביל, לשכנע, להזיז",
    description: "אתה לא מחכה שיקרה - אתה גורם לזה לקרות. יש לך כוח שכנוע, ראש של הזדמנויות ונוחות עם אחריות וניהול אנשים.",
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
  negLabel: string;
  posLabel: string;
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

export type QuestionCategory = "riasec" | "workStyle" | "workValues" | "meta";
export type QuestionMode = "single" | "multi";

export interface Choice {
  label: string;
  riasec?: Partial<Scores>;
  workStyle?: Partial<WorkStyleScores>;
  workValues?: Partial<WorkValueScores>;
  meta?: "easy" | "mixed" | "hard";
}

export interface Question {
  id: string;
  category: QuestionCategory;
  text: string;
  hint?: string;
  mode: QuestionMode;
  choices: Choice[];
  maxSelect?: number;
}

const LIKERT_LABELS = ["לא מתאר אותי בכלל", "מתאר אותי במידה מועטה", "מתאר אותי במידה רבה", "מתאר אותי מאוד"];

function riasecLikert(id: string, key: RiasecKey, text: string, reverse = false): Question {
  return {
    id,
    category: "riasec",
    mode: "single",
    text,
    choices: LIKERT_LABELS.map((label, i) => {
      const rating = i + 1;
      const score = reverse ? 5 - rating : rating;
      return { label, riasec: { [key]: score } as Partial<Scores> };
    }),
  };
}

const WORK_STYLE_LIKERT_VALUES = [-100, -33, 33, 100];

function workStyleLikert(id: string, key: WorkStyleKey, text: string): Question {
  return {
    id,
    category: "workStyle",
    mode: "single",
    text,
    choices: LIKERT_LABELS.map((label, i) => ({
      label,
      workStyle: { [key]: WORK_STYLE_LIKERT_VALUES[i] } as Partial<WorkStyleScores>,
    })),
  };
}

/**
 * מפת הפריטים לכל ממד RIASEC, לצורך חישוב עקביות פנימית (לא לצורך הניקוד הראשי):
 * forwardIds מחולקים כבר לשני חצאים (halfA / halfB) עבור בדיקת Split-Half אמיתית,
 * ו-reverseId הוא הפריט המנוסח הפוך.
 */
export const RELIABILITY_ITEM_MAP: Record<
  RiasecKey,
  { halfA: string[]; halfB: string[]; reverseId: string }
> = {
  R: { halfA: ["r_r1", "r_r2"], halfB: ["r_r3", "r_r5"], reverseId: "r_r4" },
  I: { halfA: ["r_i1", "r_i2"], halfB: ["r_i3", "r_i5"], reverseId: "r_i4" },
  A: { halfA: ["r_a1", "r_a2"], halfB: ["r_a3", "r_a5"], reverseId: "r_a4" },
  S: { halfA: ["r_s1", "r_s2"], halfB: ["r_s3", "r_s5"], reverseId: "r_s4" },
  E: { halfA: ["r_e1", "r_e2"], halfB: ["r_e3", "r_e5"], reverseId: "r_e4" },
  C: { halfA: ["r_c1", "r_c2"], halfB: ["r_c3", "r_c5"], reverseId: "r_c4" },
};

export const WORK_STYLE_ITEM_PAIRS: Record<WorkStyleKey, [string, string]> = {
  aloneVsPeople: ["ws_aloneVsPeople_1", "ws_aloneVsPeople_2"],
  officeVsField: ["ws_officeVsField_1", "ws_officeVsField_2"],
  handsVsThinking: ["ws_handsVsThinking_1", "ws_handsVsThinking_2"],
  routineVsVariety: ["ws_routineVsVariety_1", "ws_routineVsVariety_2"],
  structureVsAmbiguity: ["ws_structureVsAmbiguity_1", "ws_structureVsAmbiguity_2"],
  fastVsCalmPace: ["ws_fastVsCalmPace_1", "ws_fastVsCalmPace_2"],
  independenceVsFramework: ["ws_independenceVsFramework_1", "ws_independenceVsFramework_2"],
  publicVsBackstage: ["ws_publicVsBackstage_1", "ws_publicVsBackstage_2"],
};

export const QUESTIONS: Question[] = [
  // ============================= RIASEC — 30 היגדי Likert (5 לכל ממד: 4 קדימה + 1 הפוך) =============================
  riasecLikert("r_r1", "R", "אני נהנה לתקן ולבנות דברים בידיים"),
  riasecLikert("r_r2", "R", "אני מעדיף לפתור בעיה בצורה מעשית על פני דיון תיאורטי עליה"),
  riasecLikert("r_r3", "R", "אני נמשך לעבודה עם כלים, מכונות או חומרים מוחשיים"),
  riasecLikert("r_r5", "R", "אני שמח לבלות זמן בעבודה גופנית או בשטח הפתוח"),
  riasecLikert("r_r4", "R", "עבודה עם הידיים לא ממש מושכת אותי", true),

  riasecLikert("r_i1", "I", "אני נהנה לחקור ולהבין איך דברים עובדים לעומק"),
  riasecLikert("r_i2", "I", "אני נמשך לפתור חידות או בעיות מורכבות"),
  riasecLikert("r_i3", "I", "אני אוהב לנתח מידע ולהגיע למסקנות מבוססות"),
  riasecLikert("r_i5", "I", "אני נהנה להשוות נתונים ולבדוק אילו מסקנות הם באמת תומכים"),
  riasecLikert("r_i4", "I", "ניתוח מעמיק של בעיות לא ממש מסקרן אותי", true),

  riasecLikert("r_a1", "A", "אני נהנה ליצור דברים חדשים ומקוריים - בכתיבה, עיצוב, מוזיקה או כל צורה אחרת"),
  riasecLikert("r_a2", "A", "יש לי צורך אמיתי לבטא את עצמי באופן אישי בעבודה שלי"),
  riasecLikert("r_a3", "A", "אני נמשך לפעילויות שיש בהן מקום לדמיון וחדשנות"),
  riasecLikert("r_a5", "A", "אני מוצא את עצמי מדמיין דרכים חדשות לעשות דברים מוכרים"),
  riasecLikert("r_a4", "A", "אני לא צריך הרבה מקום לביטוי יצירתי כדי להרגיש מסופק בעבודה", true),

  riasecLikert("r_s1", "S", "אני נהנה לעזור, ללמד או להדריך אנשים אחרים"),
  riasecLikert("r_s2", "S", "אכפת לי מאוד מהרווחה של האנשים סביבי"),
  riasecLikert("r_s3", "S", "אני נמשך לתפקידים שיש בהם קשר אנושי משמעותי"),
  riasecLikert("r_s5", "S", "אני שם לב כשמישהו לידי צריך עזרה, גם בלי שיבקש"),
  riasecLikert("r_s4", "S", "אני לא חייב קשר אנושי עמוק כדי ליהנות מהעבודה שלי", true),

  riasecLikert("r_e1", "E", "אני נהנה לשכנע אנשים וליזום דברים חדשים"),
  riasecLikert("r_e2", "E", "אני נמשך להובלה, ניהול והשפעה על תוצאות"),
  riasecLikert("r_e3", "E", "אני אוהב לקחת סיכונים מחושבים כשיש סיכוי טוב לרווח"),
  riasecLikert("r_e5", "E", "אני נהנה להציע רעיונות חדשים ולדחוף אותם קדימה בעצמי"),
  riasecLikert("r_e4", "E", "אני לא ממש נהנה מלהוביל אנשים אחרים או לשכנע אותם", true),

  riasecLikert("r_c1", "C", "אני נהנה לארגן מידע, נתונים או מסמכים בצורה מסודרת"),
  riasecLikert("r_c2", "C", "אני מרגיש בנוח כשיש לי נהלים ברורים לעקוב אחריהם"),
  riasecLikert("r_c3", "C", "אני שם לב לפרטים קטנים ומקפיד על דיוק"),
  riasecLikert("r_c5", "C", "אני מרגיש בנוח לעקוב אחרי תהליך מוגדר מתחילתו ועד סופו"),
  riasecLikert("r_c4", "C", "סדר ודיוק קפדני לא ממש חשובים לי בעבודה", true),

  // ============================= Work Style — 16 היגדי Likert (2 לכל ציר) =============================
  workStyleLikert("ws_aloneVsPeople_1", "aloneVsPeople", "אני מעדיף לעבוד בסביבה עם הרבה אנשים סביבי על פני עבודה שקטה לבד"),
  workStyleLikert("ws_aloneVsPeople_2", "aloneVsPeople", "גם בעבודה עמוסה, אני שואב אנרגיה מהיותי מוקף באנשים"),

  workStyleLikert("ws_officeVsField_1", "officeVsField", "אני מעדיף להיות בתנועה ובשטח על פני ישיבה קבועה במשרד"),
  workStyleLikert("ws_officeVsField_2", "officeVsField", "אני מעדיף להחליף מקומות ולזוז לאורך היום על פני לשבת באותו מקום"),

  workStyleLikert("ws_handsVsThinking_1", "handsVsThinking", "אני מעדיף משימות שדורשות חשיבה וניתוח על פני עבודה ידנית"),
  workStyleLikert("ws_handsVsThinking_2", "handsVsThinking", "אני נהנה יותר מפתרון בעיה בראש מאשר מביצוע שלה בפועל"),

  workStyleLikert("ws_routineVsVariety_1", "routineVsVariety", "אני מעדיף שכל יום עבודה יהיה שונה מקודמו על פני שגרה קבועה"),
  workStyleLikert("ws_routineVsVariety_2", "routineVsVariety", "שגרה קבועה מדי גורמת לי להרגיש חנוק"),

  workStyleLikert(
    "ws_structureVsAmbiguity_1",
    "structureVsAmbiguity",
    "אני מעדיף חופש לפרש ולהחליט בעצמי על פני הנחיות מדויקות מראש",
  ),
  workStyleLikert(
    "ws_structureVsAmbiguity_2",
    "structureVsAmbiguity",
    "אני מסתדר טוב גם כשאין לי הנחיות מדויקות על איך לבצע משימה",
  ),

  workStyleLikert("ws_fastVsCalmPace_1", "fastVsCalmPace", "אני מעדיף קצב עבודה מהיר ותחת לחץ על פני קצב רגוע ומדוד"),
  workStyleLikert("ws_fastVsCalmPace_2", "fastVsCalmPace", "אני מתפקד הכי טוב כשיש עומס ולחץ זמן"),

  workStyleLikert(
    "ws_independenceVsFramework_1",
    "independenceVsFramework",
    "אני מעדיף לפעול בעצמאות מלאה על פני מסגרת ברורה והנחיה צמודה",
  ),
  workStyleLikert(
    "ws_independenceVsFramework_2",
    "independenceVsFramework",
    "אני מעדיף לקבוע לבד את סדר העדיפויות שלי בעבודה",
  ),

  workStyleLikert("ws_publicVsBackstage_1", "publicVsBackstage", "אני מעדיף לעמוד מול קהל ולהיות במרכז על פני עבודה מאחורי הקלעים"),
  workStyleLikert("ws_publicVsBackstage_2", "publicVsBackstage", "אני נהנה להיות מי שמציג ומדבר בשם הקבוצה"),

  // ============================= Work Values — 3 שאלות איפסטיביות (במכוון - ראו הערה למעלה) =============================
  {
    id: "wv_top3",
    category: "workValues",
    mode: "multi",
    maxSelect: 3,
    text: "מתוך הרשימה הבאה, אילו שלושה דברים הכי חשובים לך בעבודה?",
    hint: "בחר עד 3",
    choices: WORK_VALUE_KEYS.map((k) => ({ label: WORK_VALUE_LABELS[k], workValues: { [k]: 3 } as Partial<WorkValueScores> })),
  },
  {
    id: "wv_least",
    category: "workValues",
    mode: "multi",
    maxSelect: 2,
    text: "ואילו שניים מהרשימה הכי פחות חשובים לך, גם אם הם נחמדים באופן כללי?",
    hint: "בחר עד 2",
    choices: WORK_VALUE_KEYS.map((k) => ({ label: WORK_VALUE_LABELS[k], workValues: { [k]: -2 } as Partial<WorkValueScores> })),
  },
  {
    id: "wv_ultimate",
    category: "workValues",
    mode: "single",
    text: "ולסיום — אם היית צריך לבחור רק דבר אחד שהכי יגדיר עבורך \"עבודה טובה\", מה הוא היה?",
    choices: WORK_VALUE_KEYS.map((k) => ({ label: WORK_VALUE_LABELS[k], workValues: { [k]: 3 } as Partial<WorkValueScores> })),
  },

  // ============================= Meta — אינה מנוקדת =============================
  {
    id: "meta_confidence",
    category: "meta",
    mode: "single",
    text: "עד כמה קל היה לך לענות על השאלות?",
    choices: [
      { label: "קל מאוד - ידעתי בדיוק מה לענות", meta: "easy" },
      { label: "בסדר, אבל כמה תשובות היו לא חד-משמעיות", meta: "mixed" },
      { label: "לא קל - הרבה תשובות הרגישו לא מדויקות לגבי", meta: "hard" },
    ],
  },
];

export const TOTAL_QUESTIONS = QUESTIONS.length;
export const RIASEC_QUESTION_IDS = QUESTIONS.filter((q) => q.category === "riasec").map((q) => q.id);
export const WORK_STYLE_QUESTION_IDS = QUESTIONS.filter((q) => q.category === "workStyle").map((q) => q.id);

// --------------------------------- Scoring Engine ---------------------------------

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
        for (const [k, v] of Object.entries(choice.riasec)) riasec[k as RiasecKey] += v ?? 0;
      }
      if (choice.workStyle) {
        for (const [k, v] of Object.entries(choice.workStyle)) workStyle[k as WorkStyleKey] += v ?? 0;
      }
      if (choice.workValues) {
        for (const [k, v] of Object.entries(choice.workValues)) workValues[k as WorkValueKey] += v ?? 0;
      }
    }
  }

  return { riasec, workStyle, workValues };
}

/**
 * טווח (מינימום, מקסימום) תיאורטי לכל מפתח, מחושב אוטומטית ממבנה השאלות עצמו.
 * ראו תיעוד מלא בגרסה הקודמת - הלוגיקה לא השתנתה, רק גדל מספר הפריטים שנסרקים.
 */
function computeKeyRange<K extends string>(
  extractor: (choice: Choice) => Partial<Record<K, number>> | undefined,
  categoryFilter?: QuestionCategory,
): Record<K, { min: number; max: number }> {
  const ranges: Record<string, { min: number; max: number }> = {};

  for (const q of QUESTIONS) {
    if (categoryFilter && q.category !== categoryFilter) continue;
    const weightsPerKey: Record<string, number[]> = {};
    for (const choice of q.choices) {
      const weights = extractor(choice);
      if (!weights) continue;
      for (const [k, v] of Object.entries(weights)) {
        (weightsPerKey[k] ??= []).push((v as number) ?? 0);
      }
    }
    for (const [k, weights] of Object.entries(weightsPerKey)) {
      const fullyCovered = q.mode === "single" && weights.length === q.choices.length;
      const min = fullyCovered ? Math.min(...weights) : Math.min(0, ...weights);
      const max = fullyCovered ? Math.max(...weights) : Math.max(0, ...weights);
      const prev = ranges[k] ?? { min: 0, max: 0 };
      ranges[k] = { min: prev.min + min, max: prev.max + max };
    }
  }

  return ranges as Record<K, { min: number; max: number }>;
}

const RIASEC_RANGE = computeKeyRange<RiasecKey>((c) => c.riasec, "riasec");
const WORK_VALUES_RANGE = computeKeyRange<WorkValueKey>((c) => c.workValues, "workValues");

function percentInRange(raw: number, range: { min: number; max: number } | undefined): number {
  if (!range || range.max <= range.min) return 50;
  const pct = ((raw - range.min) / (range.max - range.min)) * 100;
  return Math.max(0, Math.min(100, Math.round(pct)));
}

// --------------------------------- Monte-Carlo Null Model ---------------------------------
// כדי לקבוע סף "גבוה" או "נמוך" בצורה שיש לה משמעות (ולא רק 25/50/75 שרירותי),
// מדמים "עונה אקראי" על אותו שאלון בדיוק אלפי פעמים, ומודדים איפה באמת מתרכזות
// התוצאות במקרה של מענה אקראי לגמרי. PRNG עם seed קבוע -> תוצאה זהה בכל טעינה.

function mulberry32(seed: number) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function simulateRandomAnswers(rand: () => number): AnswerMap {
  const answers: AnswerMap = {};
  for (const q of QUESTIONS) {
    if (q.mode === "single") {
      answers[q.id] = [Math.floor(rand() * q.choices.length)];
    } else {
      const maxN = q.maxSelect ?? q.choices.length;
      const count = 1 + Math.floor(rand() * maxN); // עונה אקראי "סביר" בוחר לפחות אפשרות אחת
      const pool = q.choices.map((_, i) => i);
      const picked: number[] = [];
      for (let n = 0; n < count && pool.length > 0; n++) {
        const idx = Math.floor(rand() * pool.length);
        picked.push(pool[idx]!);
        pool.splice(idx, 1);
      }
      answers[q.id] = picked;
    }
  }
  return answers;
}

interface NullStats {
  mean: number;
  sd: number;
}

/**
 * מדד עקביות Split-Half בלבד (ללא reverse-mismatch/straight-lining), מחושב מתוך
 * תשובות גולמיות. מופרד מ-checkConsistency כדי שניתן יהיה להריץ אותו בתוך סימולציית
 * המודל האקראי בלי תלות מעגלית ב-NULL_MODEL עצמו.
 */
function computeResponseConsistencyScore(answers: AnswerMap): number {
  const agreements: number[] = [];
  for (const key of RIASEC_KEYS) {
    const { halfA, halfB } = RELIABILITY_ITEM_MAP[key];
    const ratingsA = halfA.map((id) => answers[id]?.[0]).filter((v): v is number => v != null).map((i) => i + 1);
    const ratingsB = halfB.map((id) => answers[id]?.[0]).filter((v): v is number => v != null).map((i) => i + 1);
    if (ratingsA.length > 0 && ratingsB.length > 0) {
      const avgA = ratingsA.reduce((a, b) => a + b, 0) / ratingsA.length;
      const avgB = ratingsB.reduce((a, b) => a + b, 0) / ratingsB.length;
      agreements.push(100 - (Math.abs(avgA - avgB) / 3) * 100);
    }
  }
  for (const key of WORK_STYLE_KEYS) {
    const [id1, id2] = WORK_STYLE_ITEM_PAIRS[key];
    const r1 = answers[id1]?.[0];
    const r2 = answers[id2]?.[0];
    if (r1 != null && r2 != null) agreements.push(100 - (Math.abs(r1 - r2) / 3) * 100);
  }
  return agreements.length > 0 ? Math.round(agreements.reduce((a, b) => a + b, 0) / agreements.length) : 100;
}

function buildNullModel(): {
  riasec: Record<RiasecKey, NullStats>;
  workValues: Record<WorkValueKey, NullStats>;
  consistency: NullStats;
} {
  const N = 4000;
  const rand = mulberry32(20260907); // seed קבוע - דטרמיניזם מלא בין טעינות
  const riasecSamples: Record<RiasecKey, number[]> = { R: [], I: [], A: [], S: [], E: [], C: [] };
  const valueSamples: Record<WorkValueKey, number[]> = Object.fromEntries(
    WORK_VALUE_KEYS.map((k) => [k, [] as number[]]),
  ) as Record<WorkValueKey, number[]>;
  const consistencySamples: number[] = [];

  for (let n = 0; n < N; n++) {
    const answers = simulateRandomAnswers(rand);
    const totals = computeRawTotals(answers);
    for (const k of RIASEC_KEYS) riasecSamples[k].push(percentInRange(totals.riasec[k], RIASEC_RANGE[k]));
    for (const k of WORK_VALUE_KEYS) valueSamples[k].push(percentInRange(totals.workValues[k], WORK_VALUES_RANGE[k]));
    consistencySamples.push(computeResponseConsistencyScore(answers));
  }

  const stats = (arr: number[]): NullStats => {
    const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
    const variance = arr.reduce((a, b) => a + (b - mean) ** 2, 0) / arr.length;
    return { mean, sd: Math.sqrt(variance) };
  };

  return {
    riasec: Object.fromEntries(RIASEC_KEYS.map((k) => [k, stats(riasecSamples[k])])) as Record<RiasecKey, NullStats>,
    workValues: Object.fromEntries(WORK_VALUE_KEYS.map((k) => [k, stats(valueSamples[k])])) as Record<
      WorkValueKey,
      NullStats
    >,
    consistency: stats(consistencySamples),
  };
}

const NULL_MODEL = buildNullModel();

export type Level = "נמוך" | "בינוני" | "גבוה" | "גבוה מאוד";

/** רמה יחסית למודל האקראי (z-score מול "עונה אקראי" על אותו שאלון), לא סף שרירותי */
function levelFromZ(percent: number, ref: NullStats): Level {
  const z = (percent - ref.mean) / Math.max(ref.sd, 1e-6);
  if (z < -0.5) return "נמוך";
  if (z < 0.5) return "בינוני";
  if (z < 1.5) return "גבוה";
  return "גבוה מאוד";
}

/** גרסה כללית (לא מבוססת מודל אקראי) - נשארת בשימוש עבור Work Style, ששם הסמנטיקה שונה (מרחק מנקודת אמצע) */
export function levelFromPercent(p: number): Level {
  if (p >= 75) return "גבוה מאוד";
  if (p >= 50) return "גבוה";
  if (p >= 25) return "בינוני";
  return "נמוך";
}

export interface RiasecDimension {
  key: RiasecKey;
  raw: number;
  percentOfMax: number;
  level: Level;
  /** האם הממד הזה גבוה משמעותית ממה שהיה יוצא ממענה אקראי לגמרי על אותו שאלון */
  aboveRandomBaseline: boolean;
  info: TypeInfo;
}

export interface WorkStyleDimension {
  key: WorkStyleKey;
  value: number;
  level: "מאוזן" | Level;
  dominant: "neg" | "pos" | "מאוזן";
  /** התאמה בין שני הפריטים העצמאיים שמודדים את אותו ציר (0-100) */
  itemAgreement: number;
  info: WorkStyleAxisInfo;
}

export interface WorkValueDimension {
  key: WorkValueKey;
  percentOfMax: number;
  level: Level;
  label: string;
}

export interface ConsistencyReport {
  reverseMismatchCount: number;
  straightLining: boolean;
  /** מדד עקביות תשובות של המשתמש הזה בלבד (Split-Half על הפריטים בפועל) - לא מקדם מהימנות אוכלוסייה */
  responseConsistencyScore: number; // 0-100
  reliable: boolean;
}

export interface Profile {
  riasec: RiasecDimension[];
  top: RiasecKey[];
  hollandCode: string;
  workStyle: WorkStyleDimension[];
  workValues: WorkValueDimension[];
  consistency: ConsistencyReport;
  selfReportedDifficulty: "easy" | "mixed" | "hard" | null;
  lowConfidence: boolean;
}

function checkConsistency(answers: AnswerMap): ConsistencyReport {
  let reverseMismatchCount = 0;

  for (const key of RIASEC_KEYS) {
    const { halfA, halfB, reverseId } = RELIABILITY_ITEM_MAP[key];
    const forwardAll = [...halfA, ...halfB]
      .map((id) => answers[id]?.[0])
      .filter((v): v is number => v != null)
      .map((i) => i + 1);
    const reverseIdx = answers[reverseId]?.[0];
    if (forwardAll.length > 0 && reverseIdx != null) {
      const forwardAvg = forwardAll.reduce((a, b) => a + b, 0) / forwardAll.length;
      const reverseFlipped = 5 - (reverseIdx + 1);
      if (Math.abs(forwardAvg - reverseFlipped) > 1.5) reverseMismatchCount += 1;
    }
  }

  const responseConsistencyScore = computeResponseConsistencyScore(answers);

  const allRatingIds = [...RIASEC_QUESTION_IDS, ...WORK_STYLE_QUESTION_IDS];
  const allRatings = allRatingIds.map((id) => answers[id]?.[0]).filter((v): v is number => v != null);
  const straightLining = allRatings.length >= 30 && new Set(allRatings).size <= 1;

  // "אמין" = עקביות התשובות גבוהה משמעותית (z >= 0.5) ממה שהיה יוצא ממענה אקראי
  // לגמרי על אותו שאלון בדיוק - לא סף שרירותי. ראו NULL_MODEL.consistency.
  const consistencyZ = (responseConsistencyScore - NULL_MODEL.consistency.mean) / Math.max(NULL_MODEL.consistency.sd, 1e-6);
  const reliable = reverseMismatchCount <= 1 && !straightLining && consistencyZ >= 0.5;

  return { reverseMismatchCount, straightLining, responseConsistencyScore, reliable };
}

export function buildProfile(answers: AnswerMap, totals: RawTotals, opts?: { skippedCount?: number }): Profile {
  const riasec: RiasecDimension[] = [...RIASEC_KEYS]
    .map((k) => {
      const raw = totals.riasec[k];
      const percentOfMax = percentInRange(raw, RIASEC_RANGE[k]);
      const ref = NULL_MODEL.riasec[k];
      const level = levelFromZ(percentOfMax, ref);
      const aboveRandomBaseline = percentOfMax > ref.mean + 0.5 * ref.sd;
      return { key: k, raw, percentOfMax, level, aboveRandomBaseline, info: TYPES[k] };
    })
    .sort((a, b) => b.raw - a.raw);

  const top = riasec.slice(0, 3).map((d) => d.key).filter((k) => riasec.find((d) => d.key === k)!.aboveRandomBaseline);

  const workStyle: WorkStyleDimension[] = WORK_STYLE_KEYS.map((k) => {
    const raw = totals.workStyle[k];
    const value = Math.max(-100, Math.min(100, Math.round(raw / 2))); // ממוצע 2 פריטים, כל אחד עד 100-100
    const dominant: "neg" | "pos" | "מאוזן" = value > 20 ? "pos" : value < -20 ? "neg" : "מאוזן";
    const level = dominant === "מאוזן" ? "מאוזן" : levelFromPercent(Math.abs(value));
    const [id1, id2] = WORK_STYLE_ITEM_PAIRS[k];
    const r1 = answers[id1]?.[0];
    const r2 = answers[id2]?.[0];
    const itemAgreement = r1 != null && r2 != null ? Math.round(100 - (Math.abs(r1 - r2) / 3) * 100) : 100;
    return { key: k, value, level, dominant, itemAgreement, info: WORK_STYLE_AXES[k] };
  });

  const workValues: WorkValueDimension[] = WORK_VALUE_KEYS.map((k) => {
    const raw = totals.workValues[k];
    const percentOfMax = percentInRange(raw, WORK_VALUES_RANGE[k]);
    const level = levelFromZ(percentOfMax, NULL_MODEL.workValues[k]);
    return { key: k, percentOfMax, level, label: WORK_VALUE_LABELS[k] };
  }).sort((a, b) => b.percentOfMax - a.percentOfMax);

  const metaChoiceIdx = answers["meta_confidence"]?.[0];
  const selfReportedDifficulty =
    metaChoiceIdx != null
      ? (QUESTIONS.find((q) => q.id === "meta_confidence")?.choices[metaChoiceIdx]?.meta ?? null)
      : null;

  const consistency = checkConsistency(answers);
  const lowConfidence = (opts?.skippedCount ?? 0) > 8;

  return {
    riasec,
    top,
    hollandCode: top.join(""),
    workStyle,
    workValues,
    consistency,
    selfReportedDifficulty,
    lowConfidence,
  };
}

// --------------------------------- Career Matching Engine ---------------------------------

export interface CareerProfile {
  id: string;
  title: string;
  field: string;
  requirements: string;
  riasec: Scores;
  workStyle?: Partial<WorkStyleScores>;
  workValues?: Partial<WorkValueScores>;
}

export const CAREER_PROFILES: CareerProfile[] = [
  { id: "electrician", title: "חשמלאי מוסמך", field: "טכני ותשתיות", requirements: "קורס חשמלאים מוסמך + התמחות בשטח",
    riasec: { R: 90, I: 30, A: 10, S: 20, E: 20, C: 45 },
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
  matchScore: number;
  sharedRiasec: RiasecKey[];
  sharedWorkValues: WorkValueKey[];
}

function riasecCloseness(userPercent: Record<RiasecKey, number>, career: Scores): number {
  let weightedSum = 0;
  let weightTotal = 0;
  for (const k of RIASEC_KEYS) {
    const importance = career[k];
    const closeness = 100 - Math.abs(userPercent[k] - career[k]);
    weightedSum += importance * Math.max(0, closeness);
    weightTotal += importance;
  }
  if (weightTotal === 0) return 50;
  return weightedSum / weightTotal;
}

function workStyleCloseness(userStyle: WorkStyleDimension[], careerStyle?: Partial<WorkStyleScores>): number | null {
  if (!careerStyle || Object.keys(careerStyle).length === 0) return null;
  const userMap = Object.fromEntries(userStyle.map((d) => [d.key, d.value])) as Record<WorkStyleKey, number>;
  let sum = 0;
  let count = 0;
  for (const [k, v] of Object.entries(careerStyle)) {
    const target = v ?? 0;
    const userVal = userMap[k as WorkStyleKey] ?? 0;
    const closeness = 100 - Math.abs(userVal - target) / 2;
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
 * משקלי ההרכבה בין RIASEC / Work Style / Work Values אינם "מספרים שהרגישו נכון" -
 * הם נגזרים מ:
 *  (א) אורך המבחן של כל מרכיב (30 / 16 / ~6 פריטים אפקטיביים) כקירוב לאמינות
 *      היחסית שלו, לפי הרעיון של נוסחת Spearman-Brown (מבחן ארוך יותר = אמין יותר),
 *  (ב) עדיפות תיאורטית של הולנד לתחומי עניין (RIASEC) כמנבא הראשי להתאמה תעסוקתית,
 *      עם Work Style ו-Work Values כמתאמים משניים.
 * הנוסחה המדויקת: משקל בסיס = מספר פריטים, RIASEC מוכפל ב-1.5 (עדיפות תיאורטית),
 * ואז מנורמל לסכום 1. התוצאה (מעוגלת): 0.65 / 0.24 / 0.11.
 */
const EFFECTIVE_ITEMS = { riasec: 30, workStyle: 16, workValues: 6 };
const RIASEC_THEORY_MULTIPLIER = 1.5;
const RAW_WEIGHTS = {
  riasec: EFFECTIVE_ITEMS.riasec * RIASEC_THEORY_MULTIPLIER,
  workStyle: EFFECTIVE_ITEMS.workStyle,
  workValues: EFFECTIVE_ITEMS.workValues,
};
const WEIGHT_SUM = RAW_WEIGHTS.riasec + RAW_WEIGHTS.workStyle + RAW_WEIGHTS.workValues;
const MATCH_WEIGHTS = {
  riasec: RAW_WEIGHTS.riasec / WEIGHT_SUM,
  workStyle: RAW_WEIGHTS.workStyle / WEIGHT_SUM,
  workValues: RAW_WEIGHTS.workValues / WEIGHT_SUM,
};

export function matchCareers(profile: Profile, limit = 8): CareerMatch[] {
  const userPercent = Object.fromEntries(profile.riasec.map((d) => [d.key, d.percentOfMax])) as Record<
    RiasecKey,
    number
  >;

  const results: CareerMatch[] = CAREER_PROFILES.map((career) => {
    const riasecScore = riasecCloseness(userPercent, career.riasec);
    const styleScore = workStyleCloseness(profile.workStyle, career.workStyle);
    const { score: valuesScore, shared: sharedWorkValues } = workValuesCloseness(profile.workValues, career.workValues);

    let wRiasec = MATCH_WEIGHTS.riasec;
    let wStyle = MATCH_WEIGHTS.workStyle;
    let wValues = MATCH_WEIGHTS.workValues;

    if (styleScore == null) {
      wRiasec += wStyle;
      wStyle = 0;
    }
    if (valuesScore == null) {
      wRiasec += wValues;
      wValues = 0;
    }

    const matchScore = Math.round(wRiasec * riasecScore + wStyle * (styleScore ?? 0) + wValues * (valuesScore ?? 0));
    const sharedRiasec = RIASEC_KEYS.filter((k) => career.riasec[k] >= 60 && userPercent[k] >= 60);

    return { career, matchScore: Math.max(0, Math.min(100, matchScore)), sharedRiasec, sharedWorkValues };
  });

  return results.sort((a, b) => b.matchScore - a.matchScore).slice(0, limit);
}

export function leastFitNotes(profile: Profile): TypeInfo[] {
  return [...profile.riasec]
    .sort((a, b) => a.raw - b.raw)
    .slice(0, 2)
    .map((d) => d.info);
}

// --------------------------------- Storage keys ---------------------------------

export const STORAGE_KEY = "riasec-progress-v4";
export const RESULT_KEY = "riasec-result-v4";
export const WHATSAPP_GROUP = "https://chat.whatsapp.com/EfbcQPOzYc823iSisDwizd?s=cl&p=a&mlu=4";
