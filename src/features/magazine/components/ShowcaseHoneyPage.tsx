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
  priority?: boolean;
  highlightedCode?: number | null;
  onProductClick?: (product: ProductData) => void;
}

export function ShowcaseHoneyPage({
  slots,
  pageNumber = 1,
  sectionTitle = 'مجموعة عسل نحلة الطبيعي',
  isInteractive = true,
  priority = false,
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
        className="w-full h-full grid grid-cols-2 grid-rows-3"
        style={{
          gap: 'calc(8 * var(--u, 1px))',
          direction: 'rtl',
        }}
      >
        {/* Row 1, Col 1 (Right): NA7LA Brand Badge Card */}
        <div className="w-full h-full min-h-0 min-w-0 overflow-hidden rounded-[calc(5*var(--u,1px))] border border-stone-200/70 shadow-[0_2px_8px_rgba(0,0,0,0.04)] bg-white">
          <img
            src="/magazine/brand_cards/na7la_brand_badge.webp"
            alt="نحلة NA7LA"
            className="w-full h-full object-cover block"
          />
        </div>

        {/* Row 1, Col 2 (Left): Clover Honey Product Card */}
        <div className="w-full h-full min-h-0 min-w-0">
          {slot1 && (
            <ProductCard
              product={slot1.product}
              titleOverride={slot1.title_override}
              descriptionOverride={slot1.description_override}
              priceOverride={slot1.price_override}
              priceText={slot1.price_text}
              imageOverride={slot1.image_override}
              isInteractive={isInteractive}
              priority={priority}
              isHighlighted={Boolean(highlightedCode && slot1.product?.cashier_code === highlightedCode)}
              imageShare={54}
              onSelect={onProductClick}
            />
          )}
        </div>

        {/* Row 2, Col 1 (Right): Comb Honey Product Card */}
        <div className="w-full h-full min-h-0 min-w-0">
          {slot2 && (
            <ProductCard
              product={slot2.product}
              titleOverride={slot2.title_override}
              descriptionOverride={slot2.description_override}
              priceOverride={slot2.price_override}
              priceText={slot2.price_text}
              imageOverride={slot2.image_override}
              isInteractive={isInteractive}
              priority={priority}
              isHighlighted={Boolean(highlightedCode && slot2.product?.cashier_code === highlightedCode)}
              imageShare={54}
              onSelect={onProductClick}
            />
          )}
        </div>

        {/* Row 2, Col 2 (Left): Nuts Honey Product Card */}
        <div className="w-full h-full min-h-0 min-w-0">
          {slot3 && (
            <ProductCard
              product={slot3.product}
              titleOverride={slot3.title_override}
              descriptionOverride={slot3.description_override}
              priceOverride={slot3.price_override}
              priceText={slot3.price_text}
              imageOverride={slot3.image_override}
              isInteractive={isInteractive}
              priority={priority}
              isHighlighted={Boolean(highlightedCode && slot3.product?.cashier_code === highlightedCode)}
              imageShare={54}
              onSelect={onProductClick}
            />
          )}
        </div>

        {/* Row 3, Col 1 (Right): Halfa Bag Product Card */}
        <div className="w-full h-full min-h-0 min-w-0">
          {slot4 && (
            <ProductCard
              product={slot4.product}
              titleOverride={slot4.title_override}
              descriptionOverride={slot4.description_override}
              priceOverride={slot4.price_override}
              priceText={slot4.price_text}
              imageOverride={slot4.image_override}
              isInteractive={isInteractive}
              priority={priority}
              isHighlighted={Boolean(highlightedCode && slot4.product?.cashier_code === highlightedCode)}
              imageShare={54}
              onSelect={onProductClick}
            />
          )}
        </div>

        {/* Row 3, Col 2 (Left): Natural Ecological Apiaries Certificate Badge */}
        <div className="w-full h-full min-h-0 min-w-0 overflow-hidden rounded-[calc(5*var(--u,1px))] border border-stone-200/70 shadow-[0_2px_8px_rgba(0,0,0,0.04)] bg-white">
          <img
            src="/magazine/brand_cards/honey_eco_badge.webp"
            alt="Natural Egypt Apiaries"
            className="w-full h-full object-cover block"
          />
        </div>
      </div>
    </PageShell>
  );
}
