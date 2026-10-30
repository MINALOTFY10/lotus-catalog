'use client';

import React from 'react';
import { PageShell } from './PageShell';
import { ProductCard } from './ProductCard';
import { PageSlotData, ProductData } from '../types';

interface ShowcaseHoneyPageProps {
  slots: PageSlotData[];
  pageNumber?: number;
  sectionTitle?: string | null;
  isInteractive?: boolean;
  highlightedCode?: number | null;
  onProductClick?: (product: ProductData) => void;
}

export function ShowcaseHoneyPage({
  slots,
  pageNumber = 1,
  sectionTitle = 'مجموعة عسل نحلة الطبيعي',
  isInteractive = true,
  highlightedCode,
  onProductClick,
}: ShowcaseHoneyPageProps) {
  // Slots:
  // slot 1: Clover honey (left col top)
  // slot 2: Comb honey (right col mid)
  // slot 3: Nuts honey (left col mid)
  // slot 4: Wicker basket (right col bot)
  const slot1 = slots.find((s) => s.slot === 1) || slots[0];
  const slot2 = slots.find((s) => s.slot === 2) || slots[1];
  const slot3 = slots.find((s) => s.slot === 3) || slots[2];
  const slot4 = slots.find((s) => s.slot === 4) || slots[3];

  return (
    <PageShell sectionTitle={sectionTitle} pageNumber={pageNumber}>
      <div
        className="w-full h-full grid grid-cols-2"
        style={{
          gap: 'calc(8 * var(--u, 1px))',
          direction: 'rtl',
        }}
      >
        {/* Right Column (Col 1 in RTL) */}
        <div className="w-full h-full flex flex-col justify-between" style={{ gap: 'calc(8 * var(--u, 1px))' }}>
          {/* Top: Na7la Brand Badge Card */}
          <div
            className="w-full overflow-hidden rounded-[calc(5*var(--u,1px))] border border-stone-200/70 shadow-[0_2px_8px_rgba(0,0,0,0.04)] bg-white"
            style={{ height: '31%' }}
          >
            <img
              src="/magazine/brand_cards/na7la_brand_badge.webp"
              alt="نحلة NA7LA"
              className="w-full h-full object-cover block"
            />
          </div>

          {/* Middle: Comb Honey Product Card */}
          <div className="w-full flex-1 min-h-0">
            {slot2 && (
              <ProductCard
                product={slot2.product}
                titleOverride={slot2.title_override}
                descriptionOverride={slot2.description_override}
                priceOverride={slot2.price_override}
                priceText={slot2.price_text}
                imageOverride={slot2.image_override}
                isInteractive={isInteractive}
                isHighlighted={Boolean(highlightedCode && slot2.product?.cashier_code === highlightedCode)}
                imageShare={56}
                onSelect={onProductClick}
              />
            )}
          </div>

          {/* Bottom: Wicker Basket Product Card */}
          <div className="w-full flex-1 min-h-0">
            {slot4 && (
              <ProductCard
                product={slot4.product}
                titleOverride={slot4.title_override}
                descriptionOverride={slot4.description_override}
                priceOverride={slot4.price_override}
                priceText={slot4.price_text}
                imageOverride={slot4.image_override}
                isInteractive={isInteractive}
                isHighlighted={Boolean(highlightedCode && slot4.product?.cashier_code === highlightedCode)}
                imageShare={56}
                onSelect={onProductClick}
              />
            )}
          </div>
        </div>

        {/* Left Column (Col 2 in RTL) */}
        <div className="w-full h-full flex flex-col justify-between" style={{ gap: 'calc(8 * var(--u, 1px))' }}>
          {/* Top: Clover Honey Product Card */}
          <div className="w-full flex-1 min-h-0">
            {slot1 && (
              <ProductCard
                product={slot1.product}
                titleOverride={slot1.title_override}
                descriptionOverride={slot1.description_override}
                priceOverride={slot1.price_override}
                priceText={slot1.price_text}
                imageOverride={slot1.image_override}
                isInteractive={isInteractive}
                isHighlighted={Boolean(highlightedCode && slot1.product?.cashier_code === highlightedCode)}
                imageShare={56}
                onSelect={onProductClick}
              />
            )}
          </div>

          {/* Middle: Nuts Honey Product Card */}
          <div className="w-full flex-1 min-h-0">
            {slot3 && (
              <ProductCard
                product={slot3.product}
                titleOverride={slot3.title_override}
                descriptionOverride={slot3.description_override}
                priceOverride={slot3.price_override}
                priceText={slot3.price_text}
                imageOverride={slot3.image_override}
                isInteractive={isInteractive}
                isHighlighted={Boolean(highlightedCode && slot3.product?.cashier_code === highlightedCode)}
                imageShare={56}
                onSelect={onProductClick}
              />
            )}
          </div>

          {/* Bottom: Natural Ecological Apiaries Certificate Badge */}
          {/* Bottom: Natural Ecological Apiaries Certificate Badge */}
          <div
            className="w-full overflow-hidden rounded-[calc(5*var(--u,1px))] border border-stone-200/70 shadow-[0_2px_8px_rgba(0,0,0,0.04)] bg-white"
            style={{ height: '31%' }}
          >
            <img
              src="/magazine/brand_cards/honey_eco_badge.webp"
              alt="Natural Egypt Apiaries"
              className="w-full h-full object-cover block"
            />
          </div>
        </div>
      </div>
    </PageShell>
  );
}
