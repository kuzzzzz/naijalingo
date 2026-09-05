import { Suspense } from "react";
import { ContributionForm } from "@/components/contribution/ContributionForm";

export const metadata = {
  title: "Contribute – NaijaLingo",
  description: "Submit English ↔ Urhobo translation pairs",
};

export default function ContributePage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Contribute a translation</h1>
        <p className="mt-1 max-w-2xl text-stone-600">
          Native speakers and careful translators: share pairs, corrections, and context. Your
          contributions help build higher-quality data for Nigerian language technology. We only
          collect what is necessary.
        </p>
      </div>
      <Suspense fallback={<p className="text-stone-500">Loading form…</p>}>
        <ContributionForm />
      </Suspense>
    </div>
  );
}
