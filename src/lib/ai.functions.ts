import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const InputSchema = z.object({
  question: z.string().min(1).max(400),
  text: z.string().trim().min(2).max(500),
});

export type AiTagResult = {
  scores: Record<"R" | "I" | "A" | "S" | "E" | "C", number>;
  summary: string;
};

const SYSTEM = `אתה מומחה לאבחון תעסוקתי לפי מודל RIASEC (הולנד), המתמחה בקהל החרדי בישראל.
קיבלת שאלה מתוך שאלון נטיות תעסוקתיות ותשובה חופשית של הנבדק.
תייג את התשובה: תן ציון 0 עד 3 לכל אחת משש הקטגוריות לפי מידת ההתאמה של התשובה.
R=מעשי/טכני, I=חוקר/אנליטי, A=יוצר/אמנותי, S=חברתי/מסייע, E=יזמי/מנהיגותי, C=מסודר/מנהלי.
הימנע לחלוטין מהמלצות שאינן תואמות את אורח החיים החרדי (צבא, משטרה, בידור חילוני).
כתוב summary קצר בעברית, עד 12 מילים, שמסכם את מה שהבנת מהתשובה.`;

export const analyzeFreeText = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => InputSchema.parse(data))
  .handler(async ({ data }): Promise<AiTagResult> => {
    const key = process.env["LOVABLE_API_KEY"];
    if (!key) throw new Error("Missing LOVABLE_API_KEY");

    const res = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": key,
        "X-Lovable-AIG-SDK": "fetch",
      },
      body: JSON.stringify({
        model: "openai/gpt-5.6-sol",
        stream: true,
        instructions: SYSTEM,
        input: [
          {
            role: "user",
            content: [
              {
                type: "input_text",
                text: `שאלה: ${data.question}\nתשובה חופשית: ${data.text}`,
              },
            ],
          },
        ],
        reasoning: { effort: "low", summary: "auto" },
        text: {
          format: {
            type: "json_schema",
            name: "riasec_tagging",
            strict: true,
            schema: {
              type: "object",
              additionalProperties: false,
              properties: {
                R: { type: "integer" },
                I: { type: "integer" },
                A: { type: "integer" },
                S: { type: "integer" },
                E: { type: "integer" },
                C: { type: "integer" },
                summary: { type: "string" },
              },
              required: ["R", "I", "A", "S", "E", "C", "summary"],
            },
          },
        },
      }),
    });

    if (!res.ok || !res.body) {
      const body = await res.text().catch(() => "");
      console.error(`AI gateway failed [${res.status}]: ${body}`);
      throw new Error(`AI gateway failed [${res.status}]: ${body}`);
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let out = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";
      for (const line of lines) {
        if (!line.startsWith("data:")) continue;
        const payload = line.slice(5).trim();
        if (!payload || payload === "[DONE]") continue;
        try {
          const evt = JSON.parse(payload) as {
            type?: string;
            delta?: string;
            response?: { output_text?: string };
          };
          if (evt.type === "response.output_text.delta" && typeof evt.delta === "string") {
            out += evt.delta;
          } else if (evt.type === "response.completed" && evt.response?.output_text) {
            if (!out) out = evt.response.output_text;
          }
        } catch {
          /* ignore partial frames */
        }
      }
    }

    const clamp = (n: unknown) =>
      typeof n === "number" && Number.isFinite(n) ? Math.max(0, Math.min(3, Math.round(n))) : 0;

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
    } catch {
      console.error("AI returned unparsable output:", out.slice(0, 300));
      return { scores: { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 }, summary: "" };
    }
  });
