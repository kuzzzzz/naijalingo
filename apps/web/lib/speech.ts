/**
 * Lightweight client-side TTS via the Web Speech API.
 * Free, no API key. Quality varies by browser and available voices.
 * Urhobo has no dedicated system voice — browsers will approximate with
 * the closest language (often English). Native speaker recordings remain the goal.
 */

export function canSpeak(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

export function speakText(text: string, langHint?: string): void {
  if (!canSpeak() || !text.trim()) return;

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text.trim());

  // Urhobo is not a standard BCP-47 tag in most browsers.
  // Use English as a fallback so something plays; native clips will replace this later.
  if (langHint === "urhobo") {
    utterance.lang = "en-NG"; // Nigerian English locale when available
  } else if (langHint === "en") {
    utterance.lang = "en-NG";
  } else if (langHint) {
    utterance.lang = langHint;
  }

  utterance.rate = 0.9;
  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking(): void {
  if (canSpeak()) {
    window.speechSynthesis.cancel();
  }
}
