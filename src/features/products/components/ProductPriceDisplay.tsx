import React from 'react';
import { formatMagazinePrice } from '@/lib/format/price';

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
  // If priceText is provided, clean section headers
  if (priceText && typeof priceText === 'string' && priceText.trim()) {
    let clean = priceText.trim();
    clean = clean
      .replace(/^(السعر|المقاس والسعر|الحجم والسعر|الوزن والسعر)\s*\n?/, '')
      .trim();

    const lines = clean
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l && l !== 'ال' && l !== 'الـ' && l !== 'ا');

    if (lines.length > 1) {
      // Multi-tier pricing (e.g. honey: 650g vs 1.5kg)
      return (
        <div className={`mt-2.5 pt-2 border-t border-stone-100 flex flex-col gap-1 text-right ${className}`}>
          <span className="text-[10px] font-bold text-[#B68763] block">السعر</span>
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
                  <span className="text-stone-500 font-normal">{size}</span>
                  <span className="font-extrabold text-[#443000]">{price}</span>
                </div>
              );
            }
            return (
              <div key={idx} className="font-extrabold text-xs sm:text-sm text-[#443000]">
                {line}
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
        return (
          <div className={`mt-2.5 pt-2 border-t border-stone-100 flex flex-col gap-1 text-right ${className}`}>
            <span className="text-[10px] font-bold text-[#B68763] block">السعر</span>
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <span className="text-stone-500 font-normal">{size}</span>
              <span className="font-extrabold text-[#443000]">{price}</span>
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
              {line}
            </span>
          </div>
        );
      }

      // Short single price (e.g. "715 ج.مصري")
      return (
        <div className={`mt-2.5 pt-2 border-t border-stone-100 flex items-center justify-between ${className}`}>
          <span className="text-[10px] font-bold text-[#B68763]">السعر</span>
          <span className="font-extrabold text-xs sm:text-sm text-[#443000]">
            {line}
          </span>
        </div>
      );
    }
  }

  // Standard numeric fallback formatted via formatMagazinePrice
  const fallback = formatMagazinePrice(salePrice);
  return (
    <div className={`mt-2.5 pt-2 border-t border-stone-100 flex items-center justify-between ${className}`}>
      <span className="text-[10px] font-bold text-[#B68763]">السعر</span>
      <span className="font-extrabold text-xs sm:text-sm text-[#443000]">
        {fallback}
      </span>
    </div>
  );
}
