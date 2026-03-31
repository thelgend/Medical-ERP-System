/**
 * Normalizes Arabic text to improve search accuracy by:
 * - Handling Alef variations (أ، ا، آ، إ) -> ا
 * - Handling Taa Marbouta vs Haa (ة، ه) -> ه
 * - Removing diacritics (Tashkeel)
 * - Removing extra spaces
 */
export function normalizeArabic(text) {
  if (!text) return '';
  
  return text
    .trim()
    .replace(/[\u064B-\u0652]/g, "") // Remove Tashkeel (diacritics)
    .replace(/[أإآ]/g, "ا")             // Normalize Alef
    .replace(/ة/g, "ه")                // Normalize Taa Marbouta to Haa
    .replace(/\s+/g, " ");               // Normalize multiple spaces to a single space
}

/**
 * Checks if a search term matches a target string using Arabic normalization.
 */
export function arabicSearchCompare(target, searchTerm) {
  if (!target || !searchTerm) return false;
  
  const normalizedTarget = normalizeArabic(target).toLowerCase();
  const normalizedSearch = normalizeArabic(searchTerm).toLowerCase();
  
  return normalizedTarget.includes(normalizedSearch);
}
