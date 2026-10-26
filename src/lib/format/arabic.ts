/**
 * Normalizes Arabic letters (e.g. أ, إ, آ -> ا; ة -> ه; ى -> ي) and removes diacritics
 * for fast, accurate client & server searching.
 */
export function normalizeArabic(text: string): string {
  if (!text) return '';
  return text
    .trim()
    .toLowerCase()
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/[\u064B-\u065F]/g, ''); // Remove Arabic tashkeel (diacritics)
}
