import { NextResponse } from "next/server";
import translate from "google-translate-api-x";

export async function POST(req: Request) {
  try {
    const { text, target } = await req.json();

    if (!text || !target) {
      return NextResponse.json(
        { error: "Missing required fields: text, target" },
        { status: 400 }
      );
    }

    // Map our locale codes to Google Translate language codes
    const langMap: Record<string, string> = {
      en: "en",
      cn: "zh-CN",
      "zh-CN": "zh-CN",
    };

    const targetLang = langMap[target] ?? target;

    const result = await translate(text, { to: targetLang, from: "th" });

    // result can be a single TranslationResponse or array; handle both
    const translated = Array.isArray(result)
      ? result.map((r) => r.text).join("")
      : (result as any).text ?? String(result);

    return NextResponse.json({ translated });
  } catch (error: any) {
    console.error("Translation error:", error);
    return NextResponse.json(
      { error: error.message || "Translation failed" },
      { status: 500 }
    );
  }
}
