import { NextRequest, NextResponse } from "next/server";
import { TranslationContributionSchema } from "@naijalingo/data";
import { addContribution } from "@/lib/store";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const parsed = TranslationContributionSchema.omit({
      id: true,
      status: true,
      createdAt: true,
    }).safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid contribution", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    if (!parsed.data.consentForResearch) {
      return NextResponse.json(
        { error: "Consent for research use is required to submit a contribution" },
        { status: 400 }
      );
    }

    const record = addContribution(parsed.data);

    return NextResponse.json(
      {
        success: true,
        id: record.id,
        message: "Thank you. Your contribution has been received and is pending review.",
      },
      { status: 201 }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Contribution failed";
    console.error("[contribute]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
