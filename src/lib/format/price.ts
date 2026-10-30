const ARABIC_DIGITS = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];

export function toArabicDigits(num: number | string): string {
  return String(num).replace(/[0-9]/g, (d) => ARABIC_DIGITS[parseInt(d, 10)]);
}

/**
 * Formats numeric prices according to Canva Lotus Pricelist standards:
 * - Uses authentic Arabic numerals and Egyptian Pound currency (e.g. "٢٠٩٥ ج.مصري") exactly matching the magazine
 * - If priceText from the magazine is provided, cleans the section label and returns the exact magazine pricing text
 * - If price is null, undefined, or 0, returns the Arabic fallback "السعر عند الطلب"
 */
export function formatMagazinePrice(
  price: number | null | undefined,
  priceText?: string | null
): string {
  if (priceText && typeof priceText === 'string' && priceText.trim()) {
    let clean = priceText.trim();
    clean = clean
      .replace(/^(السعر|المقاس والسعر|الحجم والسعر|الوزن والسعر)\s*\n?/, '')
      .trim();
    if (clean) {
      return clean;
    }
  }

  if (price === null || price === undefined || price <= 0 || isNaN(price)) {
    return 'السعر عند الطلب';
  }

  return `${toArabicDigits(price)} ج.مصري`;
}
