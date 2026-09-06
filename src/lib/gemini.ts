export type AiTagResult = {
  scores: Record<"R" | "I" | "A" | "S" | "E" | "C", number>;
  summary: string;
};

export async function analyzeFreeText(input: {
  question: string;
  text: string;
}): Promise<AiTagResult> {
  const res = await fetch("/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question: input.question, text: input.text }),
  });

  if (!res.ok) {
    const errBody = await res.text().catch(() => "");
    console.error("[analyze] Server error:", {
      status: res.status,
      body: errBody,
    });
    throw new Error(`Analysis failed [${res.status}]`);
  }

  return (await res.json()) as AiTagResult;
}
