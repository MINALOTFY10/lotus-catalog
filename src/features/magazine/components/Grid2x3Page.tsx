'use client';

import React from 'react';
import { PageShell } from './PageShell';
import { ProductCard } from './ProductCard';
import { PageSlotData, ProductData } from '../types';

interface Grid2x3PageProps {
  sectionTitle?: string | null;
  pageNumber?: number;
  slots: PageSlotData[];
  isInteractive?: boolean;
  priority?: boolean;
  highlightedCode?: number | null;
  onProductClick?: (product: ProductData) => void;
}

export function Grid2x3Page({
  sectionTitle,
  pageNumber,
  slots,
  isInteractive = true,
  priority = false,
  highlightedCode,
  onProductClick,
}: Grid2x3PageProps) {
  // Ensure array has 6 slot entries
  const slotList: (PageSlotData | null)[] = Array.from({ length: 6 }, (_, index) => {
    return slots.find((s) => s.slot === index + 1) || slots[index] || null;
  });

  return (
    <PageShell sectionTitle={sectionTitle} pageNumber={pageNumber}>
      <div
        className="grid grid-cols-2 grid-rows-3 w-full h-full"
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
              animationDelay: `calc(${index} * 0.04s + 0.05s)`,
            }}
          >
            {slotData ? (
              <ProductCard
                product={slotData.product}
                titleOverride={slotData.title_override}
                descriptionOverride={slotData.description_override}
                priceOverride={slotData.price_override}
                priceText={slotData.price_text}
                imageOverride={slotData.image_override}
                isInteractive={isInteractive}
                priority={priority}
                isHighlighted={Boolean(highlightedCode && slotData.product?.cashier_code === highlightedCode)}
                imageShare={56}
                onSelect={onProductClick}
              />
            ) : (
              <div className="product-card w-full h-full" />
            )}
          </div>
        ))}
      </div>
    </PageShell>
  );
}
