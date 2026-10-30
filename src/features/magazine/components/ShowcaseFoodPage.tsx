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
  highlightedCode?: number | null;
  onProductClick?: (product: ProductData) => void;
}

export function ShowcaseFoodPage({
  slots,
  pageNumber = 2,
  sectionTitle = 'مجموعة المنتجات الغذائية الطبيعية',
  isInteractive = true,
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
        {/* Top 2 Columns Area (Olive Oil & Dates) */}
        <div className="w-full flex-1 min-h-0 grid grid-cols-2" style={{ gap: 'calc(8 * var(--u, 1px))' }}>
          {/* Right Column (Col 1 in RTL) */}
          <div className="w-full h-full flex flex-col justify-between" style={{ gap: 'calc(8 * var(--u, 1px))' }}>
            {/* Nakhla Brand Badge */}
            <div
              className="w-full overflow-hidden rounded-[calc(5*var(--u,1px))] border border-stone-200/70 shadow-[0_2px_8px_rgba(0,0,0,0.04)] bg-white"
              style={{ height: '48%' }}
            >
              <img
                src="/magazine/brand_cards/nakhla_brand_badge.webp"
                alt="تمور نخلة NAKHLA"
                className="w-full h-full object-cover block"
              />
            </div>

            {/* Dates Product Card */}
            <div className="w-full flex-1 min-h-0">
              {datesSlot && (
                <ProductCard
                  product={datesSlot.product}
                  titleOverride={datesSlot.title_override}
                  descriptionOverride={datesSlot.description_override}
                  priceOverride={datesSlot.price_override}
                  priceText={datesSlot.price_text}
                  imageOverride={datesSlot.image_override}
                  isInteractive={isInteractive}
                  isHighlighted={Boolean(highlightedCode && datesSlot.product?.cashier_code === highlightedCode)}
                  imageShare={56}
                  onSelect={onProductClick}
                />
              )}
            </div>
          </div>

          {/* Left Column (Col 2 in RTL) */}
          <div className="w-full h-full flex flex-col justify-between" style={{ gap: 'calc(8 * var(--u, 1px))' }}>
            {/* Olive Oil Product Card */}
            <div className="w-full flex-1 min-h-0">
              {oliveSlot && (
                <ProductCard
                  product={oliveSlot.product}
                  titleOverride={oliveSlot.title_override}
                  descriptionOverride={oliveSlot.description_override}
                  priceOverride={oliveSlot.price_override}
                  priceText={oliveSlot.price_text}
                  imageOverride={oliveSlot.image_override}
                  isInteractive={isInteractive}
                  isHighlighted={Boolean(highlightedCode && oliveSlot.product?.cashier_code === highlightedCode)}
                  imageShare={56}
                  onSelect={onProductClick}
                />
              )}
            </div>

            {/* Waj Olive Tree Badge */}
            <div
              className="w-full overflow-hidden rounded-[calc(5*var(--u,1px))] border border-stone-200/70 shadow-[0_2px_8px_rgba(0,0,0,0.04)] bg-white"
              style={{ height: '48%' }}
            >
              <img
                src="/magazine/brand_cards/waj_brand_badge.webp"
                alt="واج WAJ زيت زيتون"
                className="w-full h-full object-cover block"
              />
            </div>
          </div>
        </div>

        {/* Bottom Full-Width Rural & Environmental Support Fund Certificate */}
        <div
          className="w-full overflow-hidden rounded-[calc(5*var(--u,1px))] border border-stone-200/70 shadow-[0_2px_8px_rgba(0,0,0,0.04)] bg-white"
          style={{ height: '24%' }}
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
