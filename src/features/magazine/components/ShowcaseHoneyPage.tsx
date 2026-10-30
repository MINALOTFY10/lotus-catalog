'use client';

import React from 'react';
import { PageShell } from './PageShell';
import { ProductCard } from './ProductCard';
import { PageSlotData } from '../types';

interface ShowcaseHoneyPageProps {
  slots: PageSlotData[];
  pageNumber?: number;
  sectionTitle?: string | null;
  isInteractive?: boolean;
  highlightedCode?: number | null;
}

export function ShowcaseHoneyPage({
  slots,
  pageNumber = 1,
  sectionTitle = 'مجموعة عسل نحلة الطبيعي',
  isInteractive = true,
  highlightedCode,
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
            className="w-full flex flex-col items-center justify-center bg-white rounded-[calc(7*var(--u,1px))] border border-[#E8DEC8]/80 shadow-[0_2px_6px_rgba(40,30,15,0.05)]"
            style={{ height: '31%', padding: 'calc(10 * var(--u, 1px))' }}
          >
            {/* Hand-drawn Bee Icon */}
            <svg
              viewBox="0 0 100 80"
              className="text-[#443000] w-[calc(42*var(--u,1px))] h-[calc(34*var(--u,1px))] mb-[calc(4*var(--u,1px))]"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <ellipse cx="50" cy="40" rx="14" ry="24" />
              <path d="M50 20 L50 64" />
              <path d="M40 32 Q50 35 60 32" />
              <path d="M40 44 Q50 47 60 44" />
              <path d="M42 56 Q50 59 58 56" />
              {/* Wings */}
              <ellipse cx="30" cy="30" rx="18" ry="12" transform="rotate(-30 30 30)" />
              <ellipse cx="70" cy="30" rx="18" ry="12" transform="rotate(30 70 30)" />
              {/* Antennae */}
              <path d="M46 18 Q40 10 36 12" />
              <path d="M54 18 Q60 10 64 12" />
            </svg>
            <h2 className="font-extrabold text-[#3B2904] text-[calc(16*var(--u,1px))] tracking-tight">نحلة</h2>
            <span className="font-extrabold tracking-widest text-[#B68763] text-[calc(10*var(--u,1px))] uppercase mt-0.5">
              NA7LA
            </span>
            <span className="text-[calc(8*var(--u,1px))] font-bold text-stone-600 mt-[calc(2*var(--u,1px))]">
              عسل برسيم طبيعي ١٠٠٪
            </span>
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
              />
            )}
          </div>

          {/* Bottom: Natural Ecological Apiaries Certificate Badge */}
          <div
            className="w-full flex flex-col items-center justify-center bg-white rounded-[calc(7*var(--u,1px))] border border-[#E8DEC8]/80 shadow-[0_2px_6px_rgba(40,30,15,0.05)] text-center relative overflow-hidden"
            style={{ height: '31%', padding: 'calc(10 * var(--u, 1px))' }}
          >
            {/* Subtle Honeycomb Pattern */}
            <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#B68763_1px,transparent_1px)] [background-size:12px_12px]" />

            <span className="font-extrabold text-[#3B2904] text-[calc(11*var(--u,1px))] uppercase tracking-wider mb-1">
              Natural
            </span>
            <p className="text-[calc(7.8*var(--u,1px))] font-semibold text-stone-700 leading-tight max-w-[85%]">
              From the Apiaries of the
              <br />
              Rural and Environmental
              <br />
              Industries Support Fund
            </p>
            <span className="font-extrabold tracking-widest text-[#B68763] text-[calc(9*var(--u,1px))] mt-2 uppercase">
              EGYPT
            </span>

            {/* Environmental Icons (leaf, recycle, sun) */}
            <div className="flex items-center gap-3 mt-2 text-[#443000]/70">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 0 0 8 20C19 20 22 3 22 3c-1 2-8 2.25-13 3.75A11.77 11.77 0 0 0 1.5 13H4c.67-2.33 3-5 7-5 2.5 0 4.67.5 6 0z" />
              </svg>
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm1 14.93V17a1 1 0 0 1-2 0v-.07A7.003 7.003 0 0 1 5.07 11H5a1 1 0 0 1 0-2h.07A7.003 7.003 0 0 1 11 5.07V5a1 1 0 0 1 2 0v.07A7.003 7.003 0 0 1 18.93 11H19a1 1 0 0 1 0 2h-.07A7.003 7.003 0 0 1 13 16.93z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
