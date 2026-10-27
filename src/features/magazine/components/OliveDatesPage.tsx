import React from 'react';
import { PageShell } from './PageShell';

interface OliveDatesPageProps {
  pageNumber: number;
}

export function OliveDatesPage({ pageNumber }: OliveDatesPageProps) {
  const isPage3 = pageNumber === 3;
  const isPage4 = pageNumber === 4;

  const oliveTitle = isPage3
    ? 'زيت زيتون بكر ممتاز 1L'
    : isPage4
    ? 'زيت زيتون بكر ممتاز 750 ML'
    : 'زيت زيتون بكر ممتاز 500 ML';

  const olivePrice = isPage3 ? '750 L.E' : '575 L.E';

  const oliveImg = isPage3
    ? '/magazine/assets/p3_olive_1l.webp'
    : '/magazine/assets/p4_olive_750ml.webp';

  const datesTitle = isPage3
    ? 'تمور طبيعية حلوة طازجة 1 KG'
    : 'تمور طبيعية حلوة طازجة 500 G';

  const datesPrice = isPage3 ? '400 L.E' : '280 L.E';

  const datesImg = isPage3
    ? '/magazine/assets/p3_dates_1kg.webp'
    : '/magazine/assets/p4_dates_500g.webp';

  return (
    <PageShell sectionTitle="سلال وزيوت طبيعية" pageNumber={pageNumber}>
      {/* 2-Column Exact Authentic Canva Layout for Olive Oil & Dates */}
      <div
        className="grid grid-cols-2 w-full h-full"
        style={{
          gap: 'calc(8 * var(--u, 1px))',
          direction: 'rtl',
        }}
      >
        {/* Right Column (Contains NAKHLA Brand, Dates Product, Trust Badge) */}
        <div
          className="flex flex-col h-full"
          style={{ gap: 'calc(8 * var(--u, 1px))' }}
        >
          {/* 1. NAKHLA Dates Brand Container (NO product, NO price) */}
          <div
            className="w-full bg-white rounded-xs shadow-[0_1px_3px_rgba(0,0,0,0.05)] border border-stone-200/50 overflow-hidden flex items-center justify-center select-none"
            style={{ height: 'calc(175 * var(--u, 1px))' }}
          >
            <img
              src="/magazine/assets/p3_nakhla_brand.webp"
              alt="شعار تمور نخلة NAKHLA"
              className="w-full h-full object-contain p-[calc(6*var(--u,1px))]"
            />
          </div>

          {/* 2. Dates Product Container */}
          <div
            className="w-full bg-white rounded-xs shadow-[0_1px_3px_rgba(0,0,0,0.05)] border border-stone-200/50 flex flex-col justify-between overflow-hidden"
            style={{ height: 'calc(300 * var(--u, 1px))' }}
          >
            <div className="w-full h-[54%] overflow-hidden bg-stone-100/50 shrink-0">
              <img
                src={datesImg}
                alt={datesTitle}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 p-[calc(8*var(--u,1px))] flex flex-col justify-between">
              <div>
                <h4 className="font-extrabold text-[#443000] text-[calc(10.5*var(--u,1px))] leading-tight">
                  {datesTitle}
                </h4>
                <p className="text-[calc(7.8*var(--u,1px))] text-stone-600 font-medium leading-snug mt-1 opacity-90">
                  ناكهلاه التمور - مزروعة في الأراضي المصرية فاخر نخيل التمور.
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
                  {datesPrice}
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

        {/* Left Column (Contains Olive Oil Product, WAJ Brand Card) */}
        <div
          className="flex flex-col h-full"
          style={{ gap: 'calc(8 * var(--u, 1px))' }}
        >
          {/* 1. Olive Oil Product Container */}
          <div
            className="w-full bg-white rounded-xs shadow-[0_1px_3px_rgba(0,0,0,0.05)] border border-stone-200/50 flex flex-col justify-between overflow-hidden"
            style={{ height: 'calc(355 * var(--u, 1px))' }}
          >
            <div className="w-full h-[54%] overflow-hidden bg-stone-100/50 shrink-0">
              <img
                src={oliveImg}
                alt={oliveTitle}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 p-[calc(8*var(--u,1px))] flex flex-col justify-between">
              <div>
                <h4 className="font-extrabold text-[#443000] text-[calc(11*var(--u,1px))] leading-tight">
                  {oliveTitle}
                </h4>
                <p className="text-[calc(7.8*var(--u,1px))] text-stone-600 font-medium leading-snug mt-1 opacity-90">
                  مصري إكسترا فيرجين أوليفي ويل علامة تجارية من مزارع الزيتون المصرية النقية.
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
                  {olivePrice}
                </span>
              </div>
            </div>
          </div>

          {/* 2. WAJ Olive Oil Brand Container (NO product, NO price) */}
          <div
            className="w-full bg-white rounded-xs shadow-[0_1px_3px_rgba(0,0,0,0.05)] border border-stone-200/50 flex flex-col items-center justify-center p-[calc(12*var(--u,1px))] select-none overflow-hidden"
            style={{ height: 'calc(296 * var(--u, 1px))' }}
          >
            <img
              src="/magazine/assets/p3_waj_brand.webp"
              alt="شعار واج WAJ"
              className="max-h-[85%] w-auto object-contain"
            />
          </div>
        </div>
      </div>
    </PageShell>
  );
}
