import { NextRequest, NextResponse } from "next/server";
import { createTranslationProvider, TranslationRequestSchema } from "@/lib/translation";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = TranslationRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const provider = createTranslationProvider();
    const result = await provider.translate(parsed.data);

    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Translation failed";
    console.error("[translate]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
