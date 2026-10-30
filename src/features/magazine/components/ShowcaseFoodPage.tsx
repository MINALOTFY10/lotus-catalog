'use client';

import React from 'react';
import { PageShell } from './PageShell';
import { ProductCard } from './ProductCard';
import { PageSlotData, ProductData } from '../types';

interface ShowcaseFoodPageProps {
  slots: PageSlotData[];
  pageNumber?: number;
  sectionTitle?: string | null;
  isInteractive?: boolean;
  priority?: boolean;
  highlightedCode?: number | null;
  onProductClick?: (product: ProductData) => void;
}

export function ShowcaseFoodPage({
  slots,
  pageNumber = 2,
  sectionTitle = 'مجموعة المنتجات الغذائية الطبيعية',
  isInteractive = true,
  priority = false,
  highlightedCode,
  onProductClick,
}: ShowcaseFoodPageProps) {
  // Slot 1: Waj olive oil (left col top)
  // Slot 2: Nakhla dates (right col mid)
  const oliveSlot = slots.find((s) => s.slot === 1) || slots[0];
  const datesSlot = slots.find((s) => s.slot === 2) || slots[1];

  return (
    <PageShell sectionTitle={sectionTitle} pageNumber={pageNumber}>
      <div
        className="w-full h-full flex flex-col justify-between"
        style={{
          gap: 'calc(8 * var(--u, 1px))',
          direction: 'rtl',
        }}
      >
        {/* Row 1: Nakhla Badge (Right) & Waj Olive Oil (Left) */}
        <div className="grid grid-cols-2 flex-1 min-h-0" style={{ gap: 'calc(8 * var(--u, 1px))' }}>
          {/* Nakhla Brand Badge (Col 1 Right) */}
          <div className="w-full h-full min-h-0 min-w-0 overflow-hidden rounded-[calc(5*var(--u,1px))] border border-stone-200/70 shadow-[0_2px_8px_rgba(0,0,0,0.04)] bg-white">
            <img
              src="/magazine/brand_cards/nakhla_brand_badge.webp"
              alt="تمور نخلة NAKHLA"
              className="w-full h-full object-cover block"
            />
          </div>

          {/* Waj Olive Oil Product Card (Col 2 Left) */}
          <div className="w-full h-full min-h-0 min-w-0">
            {oliveSlot && (
              <ProductCard
                product={oliveSlot.product}
                titleOverride={oliveSlot.title_override}
                descriptionOverride={oliveSlot.description_override}
                priceOverride={oliveSlot.price_override}
                priceText={oliveSlot.price_text}
                imageOverride={oliveSlot.image_override}
                isInteractive={isInteractive}
                priority={priority}
                isHighlighted={Boolean(highlightedCode && oliveSlot.product?.cashier_code === highlightedCode)}
                imageShare={54}
                onSelect={onProductClick}
              />
            )}
          </div>
        </div>

        {/* Row 2: Nakhla Dates (Right) & Waj Olive Tree Badge (Left) */}
        <div className="grid grid-cols-2 flex-1 min-h-0" style={{ gap: 'calc(8 * var(--u, 1px))' }}>
          {/* Nakhla Dates Product Card (Col 1 Right) */}
          <div className="w-full h-full min-h-0 min-w-0">
            {datesSlot && (
              <ProductCard
                product={datesSlot.product}
                titleOverride={datesSlot.title_override}
                descriptionOverride={datesSlot.description_override}
                priceOverride={datesSlot.price_override}
                priceText={datesSlot.price_text}
                imageOverride={datesSlot.image_override}
                isInteractive={isInteractive}
                priority={priority}
                isHighlighted={Boolean(highlightedCode && datesSlot.product?.cashier_code === highlightedCode)}
                imageShare={54}
                onSelect={onProductClick}
              />
            )}
          </div>

          {/* Waj Olive Tree Badge (Col 2 Left) */}
          <div className="w-full h-full min-h-0 min-w-0 overflow-hidden rounded-[calc(5*var(--u,1px))] border border-stone-200/70 shadow-[0_2px_8px_rgba(0,0,0,0.04)] bg-white">
            <img
              src="/magazine/brand_cards/waj_brand_badge.webp"
              alt="واج WAJ زيت زيتون"
              className="w-full h-full object-cover block"
            />
          </div>
        </div>

        {/* Row 3: Wide Full-Width Rural & Environmental Support Fund Certificate */}
        <div
          className="w-full flex-1 min-h-0 overflow-hidden rounded-[calc(5*var(--u,1px))] border border-stone-200/70 shadow-[0_2px_8px_rgba(0,0,0,0.04)] bg-white"
        >
          <img
            src="/magazine/brand_cards/food_eco_badge.webp"
            alt="Natural Egypt Apiaries and Environment Fund"
            className="w-full h-full object-cover block"
          />
        </div>
      </div>
    </PageShell>
  );
}
