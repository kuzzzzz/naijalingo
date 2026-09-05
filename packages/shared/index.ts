/**
 * Shared types and constants for NaijaLingo.
 * Keep language-agnostic so additional Nigerian languages can be added later.
 */

export interface Language {
  code: string;
  name: string;
  nativeName: string;
  enabled: boolean;
}

export const SUPPORTED_LANGUAGES: Language[] = [
  {
    code: "en",
    name: "English",
    nativeName: "English",
    enabled: true,
  },
  {
    code: "urhobo",
    name: "Urhobo",
    nativeName: "Urhobo",
    enabled: true,
  },
  // Future: Isoko, Itsekiri, Edo, Igbo, Yoruba, Hausa, etc.
];

export function getLanguageByCode(code: string): Language | undefined {
  return SUPPORTED_LANGUAGES.find((l) => l.code === code);
}

export function getEnabledLanguages(): Language[] {
  return SUPPORTED_LANGUAGES.filter((l) => l.enabled);
}
