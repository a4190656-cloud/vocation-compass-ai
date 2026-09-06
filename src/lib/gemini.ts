export type AiTagResult = {
  scores: Record<"R" | "I" | "A" | "S" | "E" | "C", number>;
  summary: string;
};

const SYSTEM = `אתה מומחה לאבחון תעסוקתי לפי מודל RIASEC (הולנד).
קיבלת שאלה מתוך שאלון נטיות תעסוקתיות ותשובה חופשית של הנבדק.
תייג את התשובה: תן ציון 0 עד 3 לכל אחת משש הקטגוריות לפי מידת ההתאמה של התשובה.
R=מעשי/טכני, I=חוקר/אנליטי, A=יוצר/אמנותי, S=חברתי/מסייע, E=יזמי/מנהיגותי, C=מסודר/מנהלי.
הימנע לחלוטין מהמלצות שאינן תואמות אורח חיים שמרני (צבא, משטרה, בידור חילוני).
כתוב summary קצר בעברית, עד 12 מילים, שמסכם את מה שהבנת מהתשובה.
החזר JSON בלבד.`;

const MODEL = "gemini-1.5-flash";

const clamp = (n: unknown) =>
  typeof n === "number" && Number.isFinite(n) ? Math.max(0, Math.min(3, Math.round(n))) : 0;

export async function analyzeFreeText(input: {
  question: string;
  text: string;
}): Promise<AiTagResult> {
  const apiKey = import.meta.env["VITE_GEMINI_API_KEY"] as string | undefined;
  if (!apiKey) {
    console.error("[Gemini] Missing VITE_GEMINI_API_KEY env var");
    throw new Error("Missing VITE_GEMINI_API_KEY");
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${encodeURIComponent(apiKey)}`;
  const prompt = `${SYSTEM}\n\nשאלה: ${input.question}\nתשובה חופשית: ${input.text.slice(0, 500)}`;

  const body = {
    contents: [
      {
        parts: [{ text: prompt }],
      },
    ],
    generationConfig: {
      temperature: 0.2,
      responseMimeType: "application/json",
    },
  };

  let res: Response;
  try {
    res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch (err) {
    console.error("[Gemini] fetch threw:", err);
    throw new Error(`Gemini fetch failed: ${(err as Error).message}`);
  }

  if (!res.ok) {
    const errBody = await res.text().catch(() => "");
    console.error("[Gemini] API error:", {
      status: res.status,
      statusText: res.statusText,
      body: errBody,
    });
    throw new Error(`Gemini API failed [${res.status}]: ${errBody}`);
  }

  const json = (await res.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    promptFeedback?: unknown;
  };
  const out =
    json.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") ?? "";

  try {
    const parsed = JSON.parse(out) as Record<string, unknown>;
    return {
      scores: {
        R: clamp(parsed["R"]),
        I: clamp(parsed["I"]),
        A: clamp(parsed["A"]),
        S: clamp(parsed["S"]),
        E: clamp(parsed["E"]),
        C: clamp(parsed["C"]),
      },
      summary: typeof parsed["summary"] === "string" ? parsed["summary"] : "",
    };
  } catch (err) {
    console.error("[Gemini] JSON parse failed:", err, "raw:", out);
    return { scores: { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 }, summary: "" };
  }
}
