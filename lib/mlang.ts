/**
 * Extract English text from Moodle mlang content.
 * Moodle wraps multilingual content as: {mlang en_US}English text{mlang}
 * Mirrors backend extract_english_from_mlang logic.
 */
const MLANG_PATTERN = /\{mlang\s+([a-zA-Z_-]+)\}(.*?)\{mlang\}/gis;

export function extractEnglishFromMlang(text: string): string {
  if (!text || !text.toLowerCase().includes("mlang")) return text;

  const matches = [...text.matchAll(MLANG_PATTERN)];
  if (matches.length === 0) return text;

  const languageMap: Record<string, string> = {};
  for (const [, langCode, content] of matches) {
    const key = langCode.toLowerCase().replace(/-/g, "_");
    if (!languageMap[key]) languageMap[key] = content.trim();
  }

  if (languageMap["en_us"]) return languageMap["en_us"];
  if (languageMap["en"]) return languageMap["en"];
  for (const [key, value] of Object.entries(languageMap)) {
    if (key.startsWith("en_") && value) return value;
  }
  return text;
}
