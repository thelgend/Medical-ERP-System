/**
 * Normalizes Arabic text to improve search accuracy.
 */
function normalizeArabic(text) {
  if (!text) return "";

  return text
    .trim()
    .replace(/[\u064B-\u0652]/g, "") // Remove Tashkeel (diacritics)
    .replace(/[أإآ]/g, "ا")             // Normalize Alef
    .replace(/ة/g, "ه")                // Normalize Taa Marbouta to Haa
    .replace(/\s+/g, " ");               // Normalize multiple spaces to a single space
}

/**
 * Generates a regex pattern that matches Arabic character variations.
 */
function generateArabicRegex(text) {
  if (!text) return "";
  
  // Replace Alef characters with a group that matches any Alef variation
  let pattern = text
    .replace(/[أإآا]/g, "[أإآا]")
    .replace(/[ةه]/g, "[ةه]");
    
  return new RegExp(pattern, "i");
}

module.exports = {
  normalizeArabic,
  generateArabicRegex
};
