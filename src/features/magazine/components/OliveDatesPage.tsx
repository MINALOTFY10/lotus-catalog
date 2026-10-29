import React from 'react';
import Link from 'next/link';
import { PageShell } from './PageShell';

interface OliveDatesPageProps {
  pageNumber: number;
  isInteractive?: boolean;
  highlightedCode?: number | null;
}

export function OliveDatesPage({
  pageNumber,
  isInteractive = true,
  highlightedCode = null,
}: OliveDatesPageProps) {
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

  const oliveSlug = isPage3
    ? 'prod-53-زيت-زيتون-بكر-ممتاز-1L'
    : 'prod-54-زيت-زيتون-بكر-ممتاز-750-ML';

  const oliveCode = isPage3 ? 53 : 54;

  const datesTitle = isPage3
    ? 'تمور طبيعية حلوة طازجة 1 KG'
    : 'تمور طبيعية حلوة طازجة 500 G';

  const datesPrice = isPage3 ? '400 L.E' : '280 L.E';

  const datesImg = isPage3
    ? '/magazine/assets/p3_dates_1kg.webp'
    : '/magazine/assets/p4_dates_500g.webp';

  const datesSlug = isPage3
    ? 'prod-nakhla-تمور-طبيعية-حلوة-طازجة-1-KG'
    : 'prod-nakhla-تمور-طبيعية-حلوة-طازجة-500-G';

  const datesCode = isPage3 ? 903 : 904;

  // Dates Card
  const isDatesHighlighted = highlightedCode === datesCode;
  const datesCard = (
    <div
      className={`w-full bg-white rounded-xs shadow-[0_1px_3px_rgba(0,0,0,0.05)] flex flex-col justify-between overflow-hidden flex-1 transition-all duration-300 ${
        isInteractive ? 'hover:shadow-lg hover:border-[#B68763]/60 cursor-pointer' : ''
      } ${
        isDatesHighlighted
          ? 'border-2 border-[#B68763] ring-4 ring-[#B68763]/40 shadow-[0_0_25px_rgba(182,135,99,0.5)] scale-[1.02] z-20 animate-pulse'
          : 'border border-stone-200/50'
      }`}
    >
      <div className="w-full h-[52%] overflow-hidden bg-stone-100/50 shrink-0">
        <img
          src={datesImg}
          alt={datesTitle}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="flex-1 p-[calc(8*var(--u,1px))] flex flex-col justify-between">
        <div>
          <h4 className="font-extrabold text-[#443000] text-[calc(10.5*var(--u,1px))] leading-tight group-hover:text-[#B68763] transition-colors">
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
  );

  // Olive Oil Card
  const isOliveHighlighted = highlightedCode === oliveCode;
  const oliveCard = (
    <div
      className={`w-full bg-white rounded-xs shadow-[0_1px_3px_rgba(0,0,0,0.05)] flex flex-col justify-between overflow-hidden transition-all duration-300 ${
        isInteractive ? 'hover:shadow-lg hover:border-[#B68763]/60 cursor-pointer' : ''
      } ${
        isOliveHighlighted
          ? 'border-2 border-[#B68763] ring-4 ring-[#B68763]/40 shadow-[0_0_25px_rgba(182,135,99,0.5)] scale-[1.02] z-20 animate-pulse'
          : 'border border-stone-200/50'
      }`}
      style={{ height: 'calc(315 * var(--u, 1px))' }}
    >
      <div className="w-full h-[54%] overflow-hidden bg-stone-100/50 shrink-0">
        <img
          src={oliveImg}
          alt={oliveTitle}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="flex-1 p-[calc(8*var(--u,1px))] flex flex-col justify-between">
        <div>
          <h4 className="font-extrabold text-[#443000] text-[calc(11*var(--u,1px))] leading-tight group-hover:text-[#B68763] transition-colors">
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
  );

  return (
    <PageShell sectionTitle="عسل نقي NA7LA" pageNumber={pageNumber}>
      {/* Exact Authentic Canva Layout for Olive Oil & Dates (Pages 3 & 4) */}
      <div
        className="flex flex-col w-full h-full justify-between"
        style={{
          gap: 'calc(8 * var(--u, 1px))',
          direction: 'rtl',
        }}
      >
        {/* Top 2-Column Section */}
        <div
          className="grid grid-cols-2 w-full shrink-0"
          style={{
            height: 'calc(485 * var(--u, 1px))',
            gap: 'calc(8 * var(--u, 1px))',
          }}
        >
          {/* Right Column (Contains NAKHLA Brand & Dates Product) */}
          <div
            className="flex flex-col h-full justify-between"
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
            {isInteractive ? (
              <Link
                href={`/products/${datesSlug}`}
                className="block w-full no-underline group focus:outline-none flex-1 flex flex-col"
              >
                {datesCard}
              </Link>
            ) : (
              datesCard
            )}
          </div>

          {/* Left Column (Contains Olive Oil Product, WAJ Brand Card) */}
          <div
            className="flex flex-col h-full justify-between"
            style={{ gap: 'calc(8 * var(--u, 1px))' }}
          >
            {/* 1. Olive Oil Product Container */}
            {isInteractive ? (
              <Link
                href={`/products/${oliveSlug}`}
                className="block w-full no-underline group focus:outline-none"
                style={{ height: 'calc(315 * var(--u, 1px))' }}
              >
                {oliveCard}
              </Link>
            ) : (
              oliveCard
            )}

            {/* 2. WAJ Olive Oil Brand Container (NO product, NO price) */}
            <div
              className="w-full bg-white rounded-xs shadow-[0_1px_3px_rgba(0,0,0,0.05)] border border-stone-200/50 flex flex-col items-center justify-center p-[calc(10*var(--u,1px))] select-none overflow-hidden flex-1"
            >
              <img
                src="/magazine/assets/p3_waj_brand.webp"
                alt="شعار واج WAJ"
                className="max-h-[85%] w-auto object-contain"
              />
            </div>
          </div>
        </div>

        {/* Bottom Full-Width Rural Natural Banner (Exact Authentic Canva) */}
        <div
          className="w-full bg-white rounded-xs shadow-[0_1px_3px_rgba(0,0,0,0.05)] border border-stone-200/50 overflow-hidden flex items-center justify-center select-none shrink-0"
          style={{ height: 'calc(160 * var(--u, 1px))' }}
        >
          <img
            src="/magazine/assets/p3_bottom_natural_banner.webp"
            alt="طبيعي من مناحل صندوق دعم الصناعات الريفية والبيئية مصر"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </PageShell>
  );
}
