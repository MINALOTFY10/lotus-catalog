import React from 'react';
import { formatMagazinePrice, toArabicDigits } from '@/lib/format/price';

interface ProductPriceDisplayProps {
  salePrice?: number | null;
  priceText?: string | null;
  className?: string;
}

/**
 * Robust, elegant price display component that handles:
 * 1. Multi-tier sizes & prices (e.g. 650g vs 1.5kg) on separate lines with size normal & price bold
 * 2. Dimension & price combos (e.g. 475 ج.م | 70 سم*140)
 * 3. Descriptive pricing text (e.g. "يحدد علي حسب الاختيار") without cramping against the "السعر" label
 * 4. Standard single prices (e.g. "715 ج.مصري") with generous breathing room
 * Completely prevents text cramping on mobile without shrinking font sizes.
 */
export function ProductPriceDisplay({
  salePrice,
  priceText,
  className = '',
}: ProductPriceDisplayProps) {
  // If priceText is provided, clean section headers, but ignore malformed labels without digits
  if (priceText && typeof priceText === 'string' && priceText.trim()) {
    const raw = priceText.trim();
    if (!/[0-9٠-٩]/.test(raw)) {
      // malformed data such as "االسعر\nج.مصري" should not override the real numeric price
    } else {
      let clean = toArabicDigits(raw);
      clean = clean
        .replace(/^(السعر|االسعر|المقاس والسعر|الحجم والسعر|الوزن والسعر)\s*\n?/, '')
        .trim();

      const lines = clean
        .split('\n')
        .map((l) => l.trim())
        .filter((l) => l && l !== 'ال' && l !== 'الـ' && l !== 'ا');

    let dynamicLabel = 'السعر';
    const raw = priceText;
    if (raw.includes('جرام') || raw.includes('كيلو') || raw.includes('مل') || raw.includes('لتر') || raw.includes('الحجم')) {
      dynamicLabel = 'الحجم والسعر';
    } else if (raw.includes('سم') || raw.includes('متر') || raw.includes('*') || raw.includes('المقاس') || raw.includes('صغير') || raw.includes('وسط') || raw.includes('كبير')) {
      dynamicLabel = 'المقاس والسعر';
    } else if (raw.includes('الوزن')) {
      dynamicLabel = 'الوزن والسعر';
    }

      if (lines.length > 1) {
        // Multi-tier pricing (e.g. honey: 650g vs 1.5kg)
        return (
          <div className={`mt-2.5 pt-2 border-t border-stone-100 flex flex-col gap-1 text-right ${className}`}>
            <span className="text-[10px] font-bold text-[#B68763] block">{dynamicLabel}</span>
            {lines.map((line, idx) => {
              if (line.includes('|')) {
                const parts = line.split('|').map((p) => p.trim());
                const hasCurrency = (s: string) => /ج\.مصري|ج\.م|ج|l\.e|egp/i.test(s);
                let size = parts[0];
                let price = parts[1];
                if (hasCurrency(parts[0]) && !hasCurrency(parts[1])) {
                  price = parts[0];
                  size = parts[1];
                }
                return (
                  <div key={idx} className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="text-stone-500 font-normal">{toArabicDigits(size)}</span>
                    <span className="font-extrabold text-[#443000]">{toArabicDigits(price)}</span>
                  </div>
                );
              }
              return (
                <div key={idx} className="font-extrabold text-xs sm:text-sm text-[#443000]">
                  {toArabicDigits(line)}
                </div>
              );
            })}
          </div>
        );
      }

      if (lines.length === 1) {
        const line = lines[0];

        // If line contains '|' (e.g. 475 ج.مصري | 70 سم*140)
        if (line.includes('|')) {
          const parts = line.split('|').map((p) => p.trim());
          const hasCurrency = (s: string) => /ج\.مصري|ج\.م|ج|l\.e|egp/i.test(s);
          let size = parts[0];
          let price = parts[1];
          if (hasCurrency(parts[0]) && !hasCurrency(parts[1])) {
            price = parts[0];
            size = parts[1];
          }
          size = size.replace(/([٠-٩0-9]+)\s*سم\s*\*\s*([٠-٩0-9]+)/, '$1*$2 سم');
          size = size.replace(/([٠-٩0-9]+)\s*\*\s*([٠-٩0-9]+)\s*سم/, '$1*$2 سم');
          return (
            <div className={`mt-2.5 pt-2 border-t border-stone-100 flex flex-col gap-1 text-right ${className}`}>
              <span className="text-[10px] font-bold text-[#B68763] block">{dynamicLabel}</span>
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="text-stone-500 font-normal">{toArabicDigits(size)}</span>
                <span className="font-extrabold text-[#443000]">{toArabicDigits(price)}</span>
              </div>
            </div>
          );
        }

        // If text is long (e.g. "يحدد علي حسب الاختيار"), stack label above so it has 100% width
        if (line.length > 12) {
          return (
            <div className={`mt-2.5 pt-2 border-t border-stone-100 flex flex-col gap-0.5 text-right ${className}`}>
              <span className="text-[10px] font-bold text-[#B68763] block">السعر</span>
              <span className="font-extrabold text-xs sm:text-sm text-[#443000] leading-snug">
                {toArabicDigits(line)}
              </span>
            </div>
          );
        }

        // Short single price (e.g. "715 ج.مصري")
        return (
          <div className={`mt-2.5 pt-2 border-t border-stone-100 flex items-center justify-between ${className}`}>
            <span className="text-[10px] font-bold text-[#B68763]">السعر</span>
            <span className="font-extrabold text-xs sm:text-sm text-[#443000]">
              {toArabicDigits(line)}
            </span>
          </div>
        );
      }
    }
  }

  // Standard numeric fallback formatted via formatMagazinePrice
  const fallback = formatMagazinePrice(salePrice);
  return (
    <div className={`mt-2.5 pt-2 border-t border-stone-100 flex items-center justify-between ${className}`}>
      <span className="text-[10px] font-bold text-[#B68763]">السعر</span>
      <span className="font-extrabold text-xs sm:text-sm text-[#443000]">
        {toArabicDigits(fallback)}
      </span>
    </div>
  );
}
