'use client';

import React from 'react';
import { PageShell } from './PageShell';
import { ProductCard } from './ProductCard';
import { PageSlotData } from '../types';

interface ShowcaseFoodPageProps {
  slots: PageSlotData[];
  pageNumber?: number;
  sectionTitle?: string | null;
  isInteractive?: boolean;
  highlightedCode?: number | null;
}

export function ShowcaseFoodPage({
  slots,
  pageNumber = 2,
  sectionTitle = 'مجموعة المنتجات الغذائية الطبيعية',
  isInteractive = true,
  highlightedCode,
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
              className="w-full flex flex-col items-center justify-center bg-white rounded-[calc(7*var(--u,1px))] border border-[#E8DEC8]/80 shadow-[0_2px_6px_rgba(40,30,15,0.05)] text-center"
              style={{ height: '48%', padding: 'calc(10 * var(--u, 1px))' }}
            >
              <h2 className="font-extrabold text-[#3B2904] text-[calc(18*var(--u,1px))] tracking-tight">نخلة</h2>
              <span className="font-extrabold tracking-widest text-[#B68763] text-[calc(11*var(--u,1px))] uppercase mt-0.5">
                NAKHLA
              </span>
              <span className="text-[calc(8*var(--u,1px))] font-bold text-stone-700 mt-2">
                تمور نخلة | من أراضي مصرية
              </span>
              <span className="text-[calc(6.5*var(--u,1px))] font-semibold text-stone-500 uppercase tracking-widest mt-0.5">
                PREMIUM PALM DATES | FROM THE LANDS OF EGYPT
              </span>
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
                />
              )}
            </div>

            {/* Waj Olive Tree Badge */}
            <div
              className="w-full flex flex-col items-center justify-center bg-white rounded-[calc(7*var(--u,1px))] border border-[#E8DEC8]/80 shadow-[0_2px_6px_rgba(40,30,15,0.05)] text-center"
              style={{ height: '48%', padding: 'calc(10 * var(--u, 1px))' }}
            >
              <h2 className="font-extrabold text-[#3B2904] text-[calc(20*var(--u,1px))] tracking-tight">واج</h2>
              <span className="font-extrabold tracking-widest text-[#B68763] text-[calc(11*var(--u,1px))] uppercase mt-0.5">
                waj
              </span>
              <span className="text-[calc(8*var(--u,1px))] font-bold text-stone-700 mt-2">
                زيت زيتون بكر ممتاز
              </span>
              <span className="text-[calc(6.5*var(--u,1px))] font-semibold text-stone-500 uppercase tracking-widest mt-0.5">
                EXTRA VIRGIN OLIVE OIL
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Full-Width Rural & Environmental Support Fund Certificate */}
        <div
          className="w-full flex flex-col items-center justify-center bg-white rounded-[calc(7*var(--u,1px))] border border-[#E8DEC8]/80 shadow-[0_2px_6px_rgba(40,30,15,0.05)] text-center relative overflow-hidden"
          style={{ height: '24%', padding: 'calc(8 * var(--u, 1px))' }}
        >
          <span className="font-extrabold text-[#3B2904] text-[calc(11*var(--u,1px))] uppercase tracking-wider mb-1">
            Natural
          </span>
          <p className="text-[calc(8*var(--u,1px))] font-semibold text-stone-700 leading-tight">
            From the Apiaries of the Rural and Environmental Industries Support Fund
          </p>
          <span className="font-extrabold tracking-widest text-[#B68763] text-[calc(9*var(--u,1px))] mt-1 uppercase">
            EGYPT
          </span>
          <div className="flex items-center gap-4 mt-2 text-[#443000]/70">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 0 0 8 20C19 20 22 3 22 3c-1 2-8 2.25-13 3.75A11.77 11.77 0 0 0 1.5 13H4c.67-2.33 3-5 7-5 2.5 0 4.67.5 6 0z" />
            </svg>
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm1 14.93V17a1 1 0 0 1-2 0v-.07A7.003 7.003 0 0 1 5.07 11H5a1 1 0 0 1 0-2h.07A7.003 7.003 0 0 1 11 5.07V5a1 1 0 0 1 2 0v.07A7.003 7.003 0 0 1 18.93 11H19a1 1 0 0 1 0 2h-.07A7.003 7.003 0 0 1 13 16.93z" />
            </svg>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
