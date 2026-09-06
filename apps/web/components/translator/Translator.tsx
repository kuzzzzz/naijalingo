"use client";

import { useState } from "react";
import { getEnabledLanguages } from "@/lib/languages";
import { canSpeak, speakText, stopSpeaking } from "@/lib/speech";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

type Confidence = "high" | "medium" | "low" | "unknown";

interface TranslationResponse {
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
  confidence?: Confidence;
  notes?: string;
}

export function Translator() {
  const languages = getEnabledLanguages();
  const [sourceLang, setSourceLang] = useState("en");
  const [targetLang, setTargetLang] = useState("urhobo");
  const [text, setText] = useState("");
  const [result, setResult] = useState<TranslationResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [speaking, setSpeaking] = useState(false);

  function swapLanguages() {
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
    if (result) {
      setText(result.translatedText);
      setResult(null);
    }
  }

  async function handleTranslate() {
    if (!text.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    stopSpeaking();
    setSpeaking(false);

    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceLanguage: sourceLang,
          targetLanguage: targetLang,
          text: text.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Translation failed");
      }
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  function handleClear() {
    setText("");
    setResult(null);
    setError(null);
    stopSpeaking();
    setSpeaking(false);
  }

  function handleCopy() {
    if (result?.translatedText) {
      navigator.clipboard.writeText(result.translatedText);
    }
  }

  function handleListen() {
    if (!result?.translatedText) return;
    if (speaking) {
      stopSpeaking();
      setSpeaking(false);
      return;
    }
    if (!canSpeak()) {
      setError("Speech is not supported in this browser.");
      return;
    }
    setSpeaking(true);
    speakText(result.translatedText, result.targetLanguage);
    // Approximate end of speech for short phrases
    const ms = Math.min(15000, Math.max(1500, result.translatedText.length * 80));
    window.setTimeout(() => setSpeaking(false), ms);
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex flex-col gap-1 text-sm font-medium text-stone-700">
          From
          <select
            value={sourceLang}
            onChange={(e) => setSourceLang(e.target.value)}
            className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-stone-900 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
          >
            {languages.map((l) => (
              <option key={l.code} value={l.code}>
                {l.name}
              </option>
            ))}
          </select>
        </label>

        <button
          type="button"
          onClick={swapLanguages}
          className="mt-6 rounded-full p-2 text-stone-500 hover:bg-stone-100 hover:text-stone-800"
          aria-label="Swap languages"
        >
          ⇄
        </button>

        <label className="flex flex-col gap-1 text-sm font-medium text-stone-700">
          To
          <select
            value={targetLang}
            onChange={(e) => setTargetLang(e.target.value)}
            className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-stone-900 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
          >
            {languages.map((l) => (
              <option key={l.code} value={l.code}>
                {l.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div>
        <label htmlFor="source-text" className="mb-1 block text-sm font-medium text-stone-700">
          Text to translate
        </label>
        <textarea
          id="source-text"
          rows={5}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter English or Urhobo text…"
          className="w-full resize-y rounded-xl border border-stone-300 bg-white px-4 py-3 text-stone-900 placeholder:text-stone-400 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <Button onClick={handleTranslate} loading={loading} disabled={!text.trim()}>
          Translate
        </Button>
        <Button variant="secondary" onClick={handleClear} disabled={!text && !result}>
          Clear
        </Button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
          {error}
        </div>
      )}

      {result && (
        <div className="space-y-3 rounded-xl border border-stone-200 bg-stone-50 p-5">
          <div className="flex items-start justify-between gap-4">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-500">
              Translation
            </h2>
            <div className="flex gap-1">
              <Button variant="ghost" onClick={handleListen} className="!px-2 !py-1 text-xs">
                {speaking ? "Stop" : "Listen"}
              </Button>
              <Button variant="ghost" onClick={handleCopy} className="!px-2 !py-1 text-xs">
                Copy
              </Button>
            </div>
          </div>
          <p className="whitespace-pre-wrap text-lg leading-relaxed text-stone-900">
            {result.translatedText}
          </p>
          {result.notes && (
            <p className="text-sm text-stone-600 italic">{result.notes}</p>
          )}
          <p className="text-xs text-stone-500">
            Translations are machine-assisted and not authoritative. Browser speech is only an
            approximation — especially for Urhobo. Native speaker recordings will improve this.
          </p>
          <div className="flex flex-wrap gap-4 text-sm font-medium">
            <Link
              href={`/contribute?source=${encodeURIComponent(text)}&target=${encodeURIComponent(result.translatedText)}&sourceLang=${sourceLang}&targetLang=${targetLang}`}
              className="text-emerald-700 hover:underline"
            >
              Improve this translation →
            </Link>
            <Link
              href={`/contribute?mode=voice&source=${encodeURIComponent(text)}&target=${encodeURIComponent(result.translatedText)}&sourceLang=${sourceLang}&targetLang=${targetLang}`}
              className="text-emerald-700 hover:underline"
            >
              Suggest better pronunciation →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
