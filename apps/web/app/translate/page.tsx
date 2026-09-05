import { Translator } from "@/components/translator/Translator";

export const metadata = {
  title: "Translate – NaijaLingo",
  description: "English ↔ Urhobo translation",
};

export default function TranslatePage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Translate</h1>
        <p className="mt-1 text-stone-600">
          English ↔ Urhobo. Results are machine-assisted and should be reviewed by native speakers.
        </p>
      </div>
      <Translator />
    </div>
  );
}
