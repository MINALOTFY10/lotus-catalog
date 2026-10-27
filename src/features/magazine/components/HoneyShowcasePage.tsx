import React from 'react';
import { PageShell } from './PageShell';

interface HoneyShowcasePageProps {
  pageNumber?: number;
}

export function HoneyShowcasePage({ pageNumber = 1 }: HoneyShowcasePageProps) {
  return (
    <PageShell sectionTitle="عسل نقي NA7LA" pageNumber={pageNumber}>
      {/* 2-Column Exact Authentic Canva Layout */}
      <div
        className="grid grid-cols-2 w-full h-full"
        style={{
          gap: 'calc(8 * var(--u, 1px))',
          direction: 'rtl',
        }}
      >
        {/* Right Column (Contains Bee Emblem, Comb Jar, Trust Badge) */}
        <div
          className="flex flex-col h-full"
          style={{ gap: 'calc(8 * var(--u, 1px))' }}
        >
          {/* 1. Bee Brand Emblem Container (NO product, NO price) */}
          <div
            className="w-full bg-white rounded-xs shadow-[0_1px_3px_rgba(0,0,0,0.05)] border border-stone-200/50 flex flex-col items-center justify-center p-[calc(8*var(--u,1px))] text-center select-none"
            style={{ height: 'calc(175 * var(--u, 1px))' }}
          >
            <div className="h-[52%] flex items-center justify-center mb-1">
              <img
                src="/magazine/assets/clean_bee_logo.webp"
                alt="شعار نحلة"
                className="max-h-full w-auto object-contain"
              />
            </div>
            <h3 className="font-extrabold text-[#443000] text-[calc(12*var(--u,1px))] leading-none">
              نحلة
            </h3>
            <span className="font-bold text-[#443000] text-[calc(9.5*var(--u,1px))] tracking-wider mt-0.5">
              NA7LA
            </span>
            <p className="font-bold text-[#7E4A13] text-[calc(9*var(--u,1px))] mt-1">
              عسل برسيم طبيعي 100%
            </p>
          </div>

          {/* 2. Honey with Comb Product Container */}
          <div
            className="w-full bg-white rounded-xs shadow-[0_1px_3px_rgba(0,0,0,0.05)] border border-stone-200/50 flex flex-col justify-between overflow-hidden"
            style={{ height: 'calc(300 * var(--u, 1px))' }}
          >
            <div className="w-full h-[54%] overflow-hidden bg-stone-100/50 shrink-0">
              <img
                src="/magazine/assets/p1_honey_comb_clean.webp"
                alt="نقي عسل مع قرص العسل"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 p-[calc(8*var(--u,1px))] flex flex-col justify-between">
              <div>
                <h4 className="font-extrabold text-[#443000] text-[calc(10.5*var(--u,1px))] leading-tight">
                  نقي عسل مع قرص العسل 650 G
                </h4>
                <p className="text-[calc(7.8*var(--u,1px))] text-stone-600 font-medium leading-snug mt-1 opacity-90">
                  فاخر برطمان من طبيعي البرسيم عسل مملوء بقرص العسل الذهبي الغني بالمذاق الطبيعي.
                </p>
              </div>
              <div className="flex items-center justify-between border-t border-stone-100 pt-[calc(3*var(--u,1px))] mt-auto">
                <span className="font-bold text-[#B68763] text-[calc(9*var(--u,1px))]">
                  السعر
                </span>
                <span
                  dir="ltr"
                  className="font-extrabold text-[#443000] text-[calc(11.5*var(--u,1px))]"
                >
                  470 L.E
                </span>
              </div>
            </div>
          </div>

          {/* 3. Rural Fund Trust Badge Container (NO product, NO price) */}
          <div
            className="w-full bg-white rounded-xs shadow-[0_1px_3px_rgba(0,0,0,0.05)] border border-stone-200/50 overflow-hidden flex items-center justify-center"
            style={{ height: 'calc(176 * var(--u, 1px))' }}
          >
            <img
              src="/magazine/assets/authentic_trust_card.webp"
              alt="شهادة أصالة صندوق دعم الصناعات الريفية والبيئية"
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        {/* Left Column (Contains 1.5KG Honey Jar, Nuts Honey Card) */}
        <div
          className="flex flex-col h-full"
          style={{ gap: 'calc(8 * var(--u, 1px))' }}
        >
          {/* 1. Honey 1.5 KG Product Container */}
          <div
            className="w-full bg-white rounded-xs shadow-[0_1px_3px_rgba(0,0,0,0.05)] border border-stone-200/50 flex flex-col justify-between overflow-hidden"
            style={{ height: 'calc(355 * var(--u, 1px))' }}
          >
            <div className="w-full h-[54%] overflow-hidden bg-stone-100/50 shrink-0">
              <img
                src="/magazine/assets/p1_honey_1_5kg_clean.webp"
                alt="عسل نقي NA7LA 1.5 KG"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 p-[calc(8*var(--u,1px))] flex flex-col justify-between">
              <div>
                <h4 className="font-extrabold text-[#443000] text-[calc(11*var(--u,1px))] leading-tight">
                  عسل نقي NA7LA 1.5 KG
                </h4>
                <p className="text-[calc(7.8*var(--u,1px))] text-stone-600 font-medium leading-snug mt-1 opacity-90">
                  هو فاخر البرسيم عسل، غني في طبيعي NA7LA— فيتامينات و إنزيمات الذي دعم المناعة و طاقة بطبيعية.
                </p>
              </div>
              <div className="flex items-center justify-between border-t border-stone-100 pt-[calc(3*var(--u,1px))] mt-auto">
                <span className="font-bold text-[#B68763] text-[calc(9*var(--u,1px))]">
                  السعر
                </span>
                <span
                  dir="ltr"
                  className="font-extrabold text-[#443000] text-[calc(11.5*var(--u,1px))]"
                >
                  560 L.E
                </span>
              </div>
            </div>
          </div>

          {/* 2. Honey with Nuts Tall Card (NO photo on top, exact authentic Canva) */}
          <div
            className="w-full bg-white rounded-xs shadow-[0_1px_3px_rgba(0,0,0,0.05)] border border-stone-200/50 flex flex-col justify-between p-[calc(8*var(--u,1px))]"
            style={{ height: 'calc(296 * var(--u, 1px))' }}
          >
            <div className="flex-1 flex flex-col justify-center">
              <h4 className="font-extrabold text-[#443000] text-[calc(11.5*var(--u,1px))] leading-snug">
                عسل نقي مع مكسرات 650G
              </h4>
              <p className="text-[calc(8*var(--u,1px))] text-stone-600 font-medium leading-relaxed mt-3 opacity-90">
                عسل مع مكسرات — فاخر مزيج من نقي البرسيم NA7LA، عسل و مقرمشة طبيعي مكسرات، غنية مع بروتينات، فيتامينات، و طاقة لـ مفيد تعزيز.
              </p>
            </div>
            <div className="flex items-center justify-between border-t border-stone-100 pt-[calc(3*var(--u,1px))] mt-auto">
              <span className="font-bold text-[#B68763] text-[calc(9*var(--u,1px))]">
                السعر
              </span>
              <span
                dir="ltr"
                className="font-extrabold text-[#443000] text-[calc(11.5*var(--u,1px))]"
              >
                650 L.E
              </span>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
