import React from 'react';
import { PageShell } from './PageShell';
import { ProductCard } from './ProductCard';
import { PageSlotData } from '../types';

interface Grid3x3PageProps {
  sectionTitle?: string | null;
  pageNumber?: number;
  slots: PageSlotData[];
  isInteractive?: boolean;
  highlightedCode?: number | null;
}

export function Grid3x3Page({
  sectionTitle,
  pageNumber,
  slots,
  isInteractive = true,
  highlightedCode,
}: Grid3x3PageProps) {
  // Ensure array has 9 slot entries
  const slotList: (PageSlotData | null)[] = Array.from({ length: 9 }, (_, index) => {
    return slots.find((s) => s.slot === index + 1) || null;
  });

  return (
    <PageShell sectionTitle={sectionTitle} pageNumber={pageNumber}>
      <div
        className="grid grid-cols-3 grid-rows-3 w-full h-full"
        style={{
          gap: 'calc(8 * var(--u, 1px)) calc(8 * var(--u, 1px))',
          direction: 'rtl',
        }}
      >
        {slotList.map((slotData, index) => (
          <div
            key={index}
            className="w-full h-full min-h-0 min-w-0 animate-card-rise"
            style={{
              animationDelay: `calc(${index} * 0.035s + 0.12s)`,
            }}
          >
            {slotData ? (
              <ProductCard
                product={slotData.product}
                titleOverride={slotData.title_override}
                descriptionOverride={slotData.description_override}
                priceOverride={slotData.price_override}
                imageOverride={slotData.image_override}
                isInteractive={isInteractive}
                isHighlighted={Boolean(highlightedCode && slotData.product?.cashier_code === highlightedCode)}
              />
            ) : (
              <div className="w-full h-full" />
            )}
          </div>
        ))}
      </div>
    </PageShell>
  );
}
