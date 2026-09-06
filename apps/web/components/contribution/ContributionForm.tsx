"use client";

import { useState, useEffect, FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import { getEnabledLanguages } from "@/lib/languages";
import { Button } from "@/components/ui/Button";

export function ContributionForm() {
  const languages = getEnabledLanguages();
  const searchParams = useSearchParams();
  const isVoiceMode = searchParams.get("mode") === "voice";

  const [sourceLang, setSourceLang] = useState("en");
  const [targetLang, setTargetLang] = useState("urhobo");
  const [sourceText, setSourceText] = useState("");
  const [targetText, setTargetText] = useState("");
  const [context, setContext] = useState("");
  const [dialect, setDialect] = useState("");
  const [contributorName, setContributorName] = useState("");
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const s = searchParams.get("source");
    const t = searchParams.get("target");
    const sl = searchParams.get("sourceLang");
    const tl = searchParams.get("targetLang");
    if (s) setSourceText(s);
    if (t) setTargetText(t);
    if (sl) setSourceLang(sl);
    if (tl) setTargetLang(tl);
    if (isVoiceMode) {
      setContext((prev) =>
        prev
          ? prev
          : "Pronunciation note: (describe how this should sound, stress, tone, or dialect)")
      );
    }
  }, [searchParams, isVoiceMode]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/contribute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceLanguage: sourceLang,
          targetLanguage: targetLang,
          sourceText: sourceText.trim(),
          targetText: targetText.trim(),
          context: context.trim() || undefined,
          dialect: dialect.trim() || undefined,
          contributorName: contributorName.trim() || undefined,
          consentForResearch: consent,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Submission failed");
      }

      setSuccess(
        data.message ||
          (isVoiceMode
            ? "Thank you. Pronunciation notes received. Audio upload is coming next."
            : "Thank you for your contribution.")
      );
      setSourceText("");
      setTargetText("");
      setContext("");
      setDialect("");
      setContributorName("");
      setConsent(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto w-full max-w-2xl space-y-6">
      {isVoiceMode && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-950">
          <strong>Pronunciation feedback.</strong> Browser speech is only an approximation for
          Urhobo. Add clear notes on how this should sound (tone, stress, dialect). Short audio
          recording upload is planned next so native speakers can contribute real clips.
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm font-medium text-stone-700">
          Source language
          <select
            value={sourceLang}
            onChange={(e) => setSourceLang(e.target.value)}
            className="rounded-lg border border-stone-300 bg-white px-3 py-2 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
            required
          >
            {languages.map((l) => (
              <option key={l.code} value={l.code}>
                {l.name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium text-stone-700">
          Target language
          <select
            value={targetLang}
            onChange={(e) => setTargetLang(e.target.value)}
            className="rounded-lg border border-stone-300 bg-white px-3 py-2 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
            required
          >
            {languages.map((l) => (
              <option key={l.code} value={l.code}>
                {l.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="flex flex-col gap-1 text-sm font-medium text-stone-700">
        Source text
        <textarea
          rows={3}
          value={sourceText}
          onChange={(e) => setSourceText(e.target.value)}
          required
          className="rounded-xl border border-stone-300 bg-white px-4 py-3 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm font-medium text-stone-700">
        Your translation
        <textarea
          rows={3}
          value={targetText}
          onChange={(e) => setTargetText(e.target.value)}
          required
          className="rounded-xl border border-stone-300 bg-white px-4 py-3 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm font-medium text-stone-700">
        {isVoiceMode ? "Pronunciation notes" : "Context (optional)"}
        <textarea
          rows={3}
          value={context}
          onChange={(e) => setContext(e.target.value)}
          placeholder={
            isVoiceMode
              ? "How should this sound? Tone, stress, dialect, similar words…"
              : "When or how this phrase is used…"
          }
          className="rounded-xl border border-stone-300 bg-white px-4 py-3 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm font-medium text-stone-700">
          Dialect / location (optional)
          <input
            type="text"
            value={dialect}
            onChange={(e) => setDialect(e.target.value)}
            placeholder="e.g. region or variety"
            className="rounded-lg border border-stone-300 bg-white px-3 py-2 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium text-stone-700">
          Your name (optional)
          <input
            type="text"
            value={contributorName}
            onChange={(e) => setContributorName(e.target.value)}
            placeholder="First name or nickname"
            className="rounded-lg border border-stone-300 bg-white px-3 py-2 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
          />
        </label>
      </div>

      <label className="flex items-start gap-3 text-sm text-stone-700">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-1 h-4 w-4 rounded border-stone-300 text-emerald-700 focus:ring-emerald-600"
          required
        />
        <span>
          I consent to this contribution being used for research and for improving Nigerian language
          technology (including possible future model training). No unnecessary personal data is
          collected.
        </span>
      </label>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          {success}
        </div>
      )}

      <Button type="submit" loading={loading} disabled={!consent || !sourceText.trim() || !targetText.trim()}>
        {isVoiceMode ? "Submit pronunciation notes" : "Submit contribution"}
      </Button>
    </form>
  );
}
