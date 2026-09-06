import { createFileRoute } from "@tanstack/react-router";

const SYSTEM = `אתה מומחה לאבחון תעסוקתי לפי מודל RIASEC (הולנד).
קיבלת שאלה מתוך שאלון נטיות תעסוקתיות ותשובה חופשית של הנבדק.
תייג את התשובה: תן ציון 0 עד 3 לכל אחת משש הקטגוריות לפי מידת ההתאמה של התשובה.
R=מעשי/טכני, I=חוקר/אנליטי, A=יוצר/אמנותי, S=חברתי/מסייע, E=יזמי/מנהיגותי, C=מסודר/מנהלי.
הימנע לחלוטין מהמלצות שאינן תואמות אורח חיים שמרני (צבא, משטרה, בידור חילוני).
כתוב summary קצר בעברית, עד 12 מילים, שמסכם את מה שהבנת מהתשובה.
החזר JSON בלבד.`;

export const Route = createFileRoute("/api/analyze")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const { question, text } = (await request.json()) as {
            question?: string;
            text?: string;
          };
          if (!text || typeof text !== "string") {
            return Response.json({ error: "Missing text" }, { status: 400 });
          }

          const apiKey =
            process.env["GEMINI_API_KEY"] || process.env["VITE_GEMINI_API_KEY"];
          if (!apiKey) {
            console.error("[analyze] Missing GEMINI_API_KEY env var");
            return Response.json(
              { error: "Missing GEMINI_API_KEY" },
              { status: 500 },
            );
          }

          const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`;
          const prompt = `${SYSTEM}\n\nשאלה: ${question ?? ""}\nתשובה חופשית: ${text.slice(0, 500)}`;

          const res = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: {
                temperature: 0.2,
                responseMimeType: "application/json",
              },
            }),
          });

          if (!res.ok) {
            const errBody = await res.text().catch(() => "");
            console.error("[analyze] Gemini API error:", {
              status: res.status,
              body: errBody,
            });
            return Response.json(
              { error: `Gemini API failed [${res.status}]` },
              { status: 502 },
            );
          }

          const json = (await res.json()) as {
            candidates?: Array<{
              content?: { parts?: Array<{ text?: string }> };
            }>;
          };
          const out =
            json.candidates?.[0]?.content?.parts
              ?.map((p) => p.text ?? "")
              .join("") ?? "";

          let parsed: Record<string, unknown>;
          try {
            parsed = JSON.parse(out) as Record<string, unknown>;
          } catch (err) {
            console.error("[analyze] JSON parse failed:", err, "raw:", out);
            return Response.json({
              scores: { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 },
              summary: "",
            });
          }

          const clamp = (n: unknown) =>
            typeof n === "number" && Number.isFinite(n)
              ? Math.max(0, Math.min(3, Math.round(n)))
              : 0;

          return Response.json({
            scores: {
              R: clamp(parsed["R"]),
              I: clamp(parsed["I"]),
              A: clamp(parsed["A"]),
              S: clamp(parsed["S"]),
              E: clamp(parsed["E"]),
              C: clamp(parsed["C"]),
            },
            summary: typeof parsed["summary"] === "string" ? parsed["summary"] : "",
          });
        } catch (err) {
          console.error("[analyze] Unexpected error:", err);
          return Response.json(
            { error: (err as Error).message },
            { status: 500 },
          );
        }
      },
    },
  },
});
