const ARABIC_DIGITS = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];

export function toArabicDigits(num: number | string): string {
  return String(num).replace(/[0-9]/g, (d) => ARABIC_DIGITS[parseInt(d, 10)]);
}

export function coercePriceNumber(value: number | string | null | undefined): number | null {
  if (value === null || value === undefined) return null;

  const raw = String(value).trim();
  if (!raw || raw === 'null' || raw === 'undefined' || raw.toLowerCase() === 'nan') {
    return null;
  }

  const normalized = raw
    .replace(/[٬،]/g, '')
    .replace(/[٠-٩]/g, (digit) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(digit)))
    .replace(/[^0-9.\-]/g, ' ')
    .trim();

  if (!normalized) return null;

  const match = normalized.match(/-?\d+(?:\.\d+)?/);
  if (!match) return null;

  const parsed = Number(match[0]);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

export function hasPriceDigits(value?: string | null): boolean {
  return typeof value === 'string' && value.trim().length > 0 && /[0-9٠-٩]/.test(value.trim());
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
  const safePrice = coercePriceNumber(price);

  if (priceText && typeof priceText === 'string' && priceText.trim()) {
    const raw = priceText.trim();
    if (hasPriceDigits(raw)) {
      let clean = raw;
      clean = clean
        .replace(/^(السعر|االسعر|المقاس والسعر|الحجم والسعر|الوزن والسعر)\s*\n?/, '')
        .trim();
      if (clean) {
        return toArabicDigits(clean);
      }
    }
  }

  if (safePrice === null) {
    return 'السعر عند الطلب';
  }

  return `${toArabicDigits(safePrice)} ج.مصري`;
}
