import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function HomePage() {
  return (
    <div className="space-y-16">
      <section className="space-y-6 pt-6 text-center sm:pt-12">
        <p className="text-sm font-medium uppercase tracking-widest text-emerald-700">
          Nigerian language technology
        </p>
        <h1 className="text-4xl font-bold tracking-tight text-stone-900 sm:text-5xl">
          NaijaLingo
        </h1>
        <p className="mx-auto max-w-2xl text-lg leading-relaxed text-stone-600">
          Starting with English ↔ Urhobo. Building tools that respect natural phrasing, local usage,
          and cultural context — and collecting high-quality data with native speakers so the next
          generation of models can do better.
        </p>
        <div className="flex flex-wrap justify-center gap-4 pt-2">
          <Link href="/translate">
            <Button>Translate</Button>
          </Link>
          <Link href="/contribute">
            <Button variant="secondary">Help build Nigerian language AI</Button>
          </Link>
        </div>
      </section>

      <section className="grid gap-8 sm:grid-cols-3">
        <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
          <h2 className="mb-2 font-semibold text-stone-900">Usable translator</h2>
          <p className="text-sm leading-relaxed text-stone-600">
            A clean English–Urhobo interface powered by a swappable provider. Mock for local demos;
            real LLM when configured.
          </p>
        </div>
        <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
          <h2 className="mb-2 font-semibold text-stone-900">Community contributions</h2>
          <p className="text-sm leading-relaxed text-stone-600">
            Native speakers can submit pairs, corrections, and context. Consent-aware and ready for
            later dataset export.
          </p>
        </div>
        <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
          <h2 className="mb-2 font-semibold text-stone-900">Built to grow</h2>
          <p className="text-sm leading-relaxed text-stone-600">
            Language-agnostic types, provider abstraction, and a clear path to more Nigerian
            languages and eventually custom models.
          </p>
        </div>
      </section>

      <section className="rounded-2xl border border-amber-200 bg-amber-50/80 px-6 py-5 text-center text-sm text-amber-950">
        Machine translations are not authoritative. The long-term value of this project depends on
        native-speaker review, corrections, and high-quality contributions.
      </section>
    </div>
  );
}
