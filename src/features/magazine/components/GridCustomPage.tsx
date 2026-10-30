'use client';

import React from 'react';
import { PageShell } from './PageShell';
import { ProductCard } from './ProductCard';
import { PageSlotData, ProductData } from '../types';

interface GridCustomPageProps {
  sectionTitle?: string | null;
  pageNumber?: number;
  slots: PageSlotData[];
  template?: string;
  isInteractive?: boolean;
  highlightedCode?: number | null;
  onProductClick?: (product: ProductData) => void;
}

export function GridCustomPage({
  sectionTitle,
  pageNumber,
  slots,
  template = 'grid-custom',
  isInteractive = true,
  highlightedCode,
  onProductClick,
}: GridCustomPageProps) {
  // 1. Page 47: Grid 2x2 (4 products)
  if (template === 'grid2x2' || slots.length === 4) {
    const list = Array.from({ length: 4 }, (_, idx) => slots[idx] || null);
    return (
      <PageShell sectionTitle={sectionTitle} pageNumber={pageNumber}>
        <div
          className="grid grid-cols-2 grid-rows-2 w-full h-full"
          style={{
            gap: 'calc(10 * var(--u, 1px)) calc(10 * var(--u, 1px))',
            direction: 'rtl',
          }}
        >
          {list.map((slotData, index) => (
            <div key={index} className="w-full h-full min-h-0 min-w-0 animate-card-rise">
              {slotData ? (
                <ProductCard
                  product={slotData.product}
                  titleOverride={slotData.title_override}
                  descriptionOverride={slotData.description_override}
                  priceOverride={slotData.price_override}
                  priceText={slotData.price_text}
                  imageOverride={slotData.image_override}
                  isInteractive={isInteractive}
                  isHighlighted={Boolean(highlightedCode && slotData.product?.cashier_code === highlightedCode)}
                  imageShare={58}
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

  // 2. Page 48: Hero split layout (2 cards top, 1 hero card bottom)
  if (template === 'hero-split' || slots.length === 3) {
    const topSlots = slots.slice(0, 2);
    const heroSlot = slots[2] || null;

    return (
      <PageShell sectionTitle={sectionTitle} pageNumber={pageNumber}>
        <div className="w-full h-full flex flex-col justify-between" style={{ gap: 'calc(10 * var(--u, 1px))', direction: 'rtl' }}>
          {/* Top 2 Cards Row */}
          <div className="grid grid-cols-2 flex-1 min-h-0" style={{ gap: 'calc(10 * var(--u, 1px))' }}>
            {topSlots.map((slotData, index) => (
              <div key={index} className="w-full h-full min-h-0 min-w-0">
                <ProductCard
                  product={slotData.product}
                  titleOverride={slotData.title_override}
                  descriptionOverride={slotData.description_override}
                  priceOverride={slotData.price_override}
                  priceText={slotData.price_text}
                  imageOverride={slotData.image_override}
                  isInteractive={isInteractive}
                  isHighlighted={Boolean(highlightedCode && slotData.product?.cashier_code === highlightedCode)}
                  imageShare={56}
                  onSelect={onProductClick}
                />
              </div>
            ))}
          </div>

          {/* Bottom Hero Card */}
          <div className="w-full" style={{ height: '52%' }}>
            {heroSlot && (
              <ProductCard
                product={heroSlot.product}
                titleOverride={heroSlot.title_override}
                descriptionOverride={heroSlot.description_override}
                priceOverride={heroSlot.price_override}
                priceText={heroSlot.price_text}
                imageOverride={heroSlot.image_override}
                isInteractive={isInteractive}
                isHighlighted={Boolean(highlightedCode && heroSlot.product?.cashier_code === highlightedCode)}
                imageShare={62}
                onSelect={onProductClick}
              />
            )}
          </div>
        </div>
      </PageShell>
    );
  }

  // 3. 8-card layout (e.g. Page 3: 3 cols in rows 1-2, 2 cols in row 3)
  if (slots.length === 8) {
    const row1 = slots.slice(0, 3);
    const row2 = slots.slice(3, 6);
    const row3 = slots.slice(6, 8);

    return (
      <PageShell sectionTitle={sectionTitle} pageNumber={pageNumber}>
        <div
          className="w-full h-full flex flex-col justify-between"
          style={{
            gap: 'calc(8 * var(--u, 1px))',
            direction: 'rtl',
          }}
        >
          {/* Row 1: 3 cards */}
          <div className="grid grid-cols-3 flex-1 min-h-0" style={{ gap: 'calc(8 * var(--u, 1px))' }}>
            {row1.map((slotData, idx) => (
              <div key={idx} className="w-full h-full min-h-0 min-w-0">
                <ProductCard
                  product={slotData.product}
                  titleOverride={slotData.title_override}
                  descriptionOverride={slotData.description_override}
                  priceOverride={slotData.price_override}
                  priceText={slotData.price_text}
                  imageOverride={slotData.image_override}
                  isInteractive={isInteractive}
                  isHighlighted={Boolean(highlightedCode && slotData.product?.cashier_code === highlightedCode)}
                  onSelect={onProductClick}
                />
              </div>
            ))}
          </div>

          {/* Row 2: 3 cards */}
          <div className="grid grid-cols-3 flex-1 min-h-0" style={{ gap: 'calc(8 * var(--u, 1px))' }}>
            {row2.map((slotData, idx) => (
              <div key={idx} className="w-full h-full min-h-0 min-w-0">
                <ProductCard
                  product={slotData.product}
                  titleOverride={slotData.title_override}
                  descriptionOverride={slotData.description_override}
                  priceOverride={slotData.price_override}
                  priceText={slotData.price_text}
                  imageOverride={slotData.image_override}
                  isInteractive={isInteractive}
                  isHighlighted={Boolean(highlightedCode && slotData.product?.cashier_code === highlightedCode)}
                  onSelect={onProductClick}
                />
              </div>
            ))}
          </div>

          {/* Row 3: 2 cards (50% width each!) */}
          <div className="grid grid-cols-2 flex-1 min-h-0" style={{ gap: 'calc(8 * var(--u, 1px))' }}>
            {row3.map((slotData, idx) => (
              <div key={idx} className="w-full h-full min-h-0 min-w-0">
                <ProductCard
                  product={slotData.product}
                  titleOverride={slotData.title_override}
                  descriptionOverride={slotData.description_override}
                  priceOverride={slotData.price_override}
                  priceText={slotData.price_text}
                  imageOverride={slotData.image_override}
                  isInteractive={isInteractive}
                  isHighlighted={Boolean(highlightedCode && slotData.product?.cashier_code === highlightedCode)}
                  onSelect={onProductClick}
                />
              </div>
            ))}
          </div>
        </div>
      </PageShell>
    );
  }

  // 4. 7-card layout (e.g. Pages 11, 13, 35: 3 cols in rows 1-2, 1 centered in row 3)
  if (slots.length === 7) {
    const row1 = slots.slice(0, 3);
    const row2 = slots.slice(3, 6);
    const heroSlot = slots[6] || null;

    return (
      <PageShell sectionTitle={sectionTitle} pageNumber={pageNumber}>
        <div
          className="w-full h-full flex flex-col justify-between"
          style={{
            gap: 'calc(8 * var(--u, 1px))',
            direction: 'rtl',
          }}
        >
          {/* Row 1: 3 cards */}
          <div className="grid grid-cols-3 flex-1 min-h-0" style={{ gap: 'calc(8 * var(--u, 1px))' }}>
            {row1.map((slotData, idx) => (
              <div key={idx} className="w-full h-full min-h-0 min-w-0">
                <ProductCard
                  product={slotData.product}
                  titleOverride={slotData.title_override}
                  descriptionOverride={slotData.description_override}
                  priceOverride={slotData.price_override}
                  priceText={slotData.price_text}
                  imageOverride={slotData.image_override}
                  isInteractive={isInteractive}
                  isHighlighted={Boolean(highlightedCode && slotData.product?.cashier_code === highlightedCode)}
                  onSelect={onProductClick}
                />
              </div>
            ))}
          </div>

          {/* Row 2: 3 cards */}
          <div className="grid grid-cols-3 flex-1 min-h-0" style={{ gap: 'calc(8 * var(--u, 1px))' }}>
            {row2.map((slotData, idx) => (
              <div key={idx} className="w-full h-full min-h-0 min-w-0">
                <ProductCard
                  product={slotData.product}
                  titleOverride={slotData.title_override}
                  descriptionOverride={slotData.description_override}
                  priceOverride={slotData.price_override}
                  priceText={slotData.price_text}
                  imageOverride={slotData.image_override}
                  isInteractive={isInteractive}
                  isHighlighted={Boolean(highlightedCode && slotData.product?.cashier_code === highlightedCode)}
                  onSelect={onProductClick}
                />
              </div>
            ))}
          </div>

          {/* Row 3: 1 centered card */}
          <div className="flex justify-center flex-1 min-h-0">
            {heroSlot && (
              <div className="w-1/3 h-full min-h-0 min-w-0">
                <ProductCard
                  product={heroSlot.product}
                  titleOverride={heroSlot.title_override}
                  descriptionOverride={heroSlot.description_override}
                  priceOverride={heroSlot.price_override}
                  priceText={heroSlot.price_text}
                  imageOverride={heroSlot.image_override}
                  isInteractive={isInteractive}
                  isHighlighted={Boolean(highlightedCode && heroSlot.product?.cashier_code === highlightedCode)}
                  onSelect={onProductClick}
                />
              </div>
            )}
          </div>
        </div>
      </PageShell>
    );
  }

  // 5. Fallback 3x3 layout
  const list = Array.from({ length: 9 }, (_, idx) => slots[idx] || null);
  return (
    <PageShell sectionTitle={sectionTitle} pageNumber={pageNumber}>
      <div
        className="grid grid-cols-3 grid-rows-3 w-full h-full"
        style={{
          gap: 'calc(11.1 * var(--u, 1px)) calc(12.7 * var(--u, 1px))',
          direction: 'rtl',
        }}
      >
        {list.map((slotData, index) => (
          <div key={index} className="w-full h-full min-h-0 min-w-0">
            {slotData ? (
              <ProductCard
                product={slotData.product}
                titleOverride={slotData.title_override}
                descriptionOverride={slotData.description_override}
                priceOverride={slotData.price_override}
                priceText={slotData.price_text}
                imageOverride={slotData.image_override}
                isInteractive={isInteractive}
                isHighlighted={Boolean(highlightedCode && slotData.product?.cashier_code === highlightedCode)}
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
