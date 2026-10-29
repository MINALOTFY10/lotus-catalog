import React from 'react';
import Link from 'next/link';
import { PageShell } from './PageShell';

interface HoneyShowcasePageProps {
  pageNumber?: number;
  isInteractive?: boolean;
  highlightedCode?: number | null;
}

export function HoneyShowcasePage({
  pageNumber = 1,
  isInteractive = true,
  highlightedCode = null,
}: HoneyShowcasePageProps) {
  // 1. Honey with Comb (Code 4)
  const isCombHighlighted = highlightedCode === 4;
  const combCard = (
    <div
      className={`w-full bg-white rounded-xs shadow-[0_1px_3px_rgba(0,0,0,0.05)] flex flex-col justify-between overflow-hidden transition-all duration-300 ${
        isInteractive ? 'hover:shadow-lg hover:border-[#B68763]/60 cursor-pointer' : ''
      } ${
        isCombHighlighted
          ? 'border-2 border-[#B68763] ring-4 ring-[#B68763]/40 shadow-[0_0_25px_rgba(182,135,99,0.5)] scale-[1.02] z-20 animate-pulse'
          : 'border border-stone-200/50'
      }`}
      style={{ height: 'calc(300 * var(--u, 1px))' }}
    >
      <div className="w-full h-[54%] overflow-hidden bg-stone-100/50 shrink-0">
        <img
          src="/magazine/assets/p1_honey_comb_clean.webp"
          alt="عسل نقي مع قرص العسل"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="flex-1 p-[calc(8*var(--u,1px))] flex flex-col justify-between">
        <div>
          <h4 className="font-extrabold text-[#443000] text-[calc(10.5*var(--u,1px))] leading-tight group-hover:text-[#B68763] transition-colors">
            عسل نقي مع قرص العسل 650 G
          </h4>
          <p className="text-[calc(7.8*var(--u,1px))] text-stone-600 font-medium leading-snug mt-1 opacity-90">
            برطمان فاخر من عسل البرسيم الطبيعي مملوء بقرص العسل الذهبي الغني بالمذاق الأصيل.
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
  );

  // 2. Honey 1.5 KG (Code 1)
  const is1_5kgHighlighted = highlightedCode === 1;
  const jar1_5kgCard = (
    <div
      className={`w-full bg-white rounded-xs shadow-[0_1px_3px_rgba(0,0,0,0.05)] flex flex-col justify-between overflow-hidden transition-all duration-300 ${
        isInteractive ? 'hover:shadow-lg hover:border-[#B68763]/60 cursor-pointer' : ''
      } ${
        is1_5kgHighlighted
          ? 'border-2 border-[#B68763] ring-4 ring-[#B68763]/40 shadow-[0_0_25px_rgba(182,135,99,0.5)] scale-[1.02] z-20 animate-pulse'
          : 'border border-stone-200/50'
      }`}
      style={{ height: 'calc(355 * var(--u, 1px))' }}
    >
      <div className="w-full h-[54%] overflow-hidden bg-stone-100/50 shrink-0">
        <img
          src="/magazine/assets/p1_honey_1_5kg_clean.webp"
          alt="عسل نقي NA7LA 1.5 KG"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="flex-1 p-[calc(8*var(--u,1px))] flex flex-col justify-between">
        <div>
          <h4 className="font-extrabold text-[#443000] text-[calc(11*var(--u,1px))] leading-tight group-hover:text-[#B68763] transition-colors">
            عسل نقي NA7LA 1.5 KG
          </h4>
          <p className="text-[calc(7.8*var(--u,1px))] text-stone-600 font-medium leading-snug mt-1 opacity-90">
            عسل برسيم طبيعي فاخر من NA7LA، غني بالفيتامينات والإنزيمات الطبيعية لتعزيز المناعة والطاقة.
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
  );

  // 3. Honey with Nuts 650G (Code 3)
  const isNutsHighlighted = highlightedCode === 3;
  const nutsCard = (
    <div
      className={`w-full bg-white rounded-xs shadow-[0_1px_3px_rgba(0,0,0,0.05)] flex flex-col justify-between p-[calc(8*var(--u,1px))] transition-all duration-300 ${
        isInteractive ? 'hover:shadow-lg hover:border-[#B68763]/60 cursor-pointer' : ''
      } ${
        isNutsHighlighted
          ? 'border-2 border-[#B68763] ring-4 ring-[#B68763]/40 shadow-[0_0_25px_rgba(182,135,99,0.5)] scale-[1.02] z-20 animate-pulse'
          : 'border border-stone-200/50'
      }`}
      style={{ height: 'calc(296 * var(--u, 1px))' }}
    >
      <div className="flex-1 flex flex-col justify-center">
        <h4 className="font-extrabold text-[#443000] text-[calc(11.5*var(--u,1px))] leading-snug group-hover:text-[#B68763] transition-colors">
          عسل نقي مع مكسرات 650G
        </h4>
        <p className="text-[calc(8*var(--u,1px))] text-stone-600 font-medium leading-relaxed mt-3 opacity-90">
          عسل مع مكسرات — مزيج فاخر من عسل برسيم NA7LA النقي والمكسرات الطبيعية المقرمشة، غني بالبروتينات والفيتامينات والطاقة.
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
  );

  return (
    <PageShell sectionTitle="عسل نقي NA7LA" pageNumber={pageNumber}>
      {/* 2-Column Exact Authentic Canva Layout */}
      <div
        className="grid grid-cols-2 w-full h-full animate-rise-bottom-delayed"
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
            className="w-full bg-white rounded-xs shadow-[0_1px_3px_rgba(0,0,0,0.05)] border border-stone-200/50 flex flex-col items-center justify-center p-[calc(8*var(--u,1px))] text-center select-none animate-card-rise"
            style={{
              height: 'calc(175 * var(--u, 1px))',
              animationDelay: '0.06s',
            }}
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
            className="w-full animate-card-rise"
            style={{
              height: 'calc(300 * var(--u, 1px))',
              animationDelay: '0.14s',
            }}
          >
            {isInteractive ? (
              <Link
                href="/products/prod-4-NA7LA-عسل-نقي-مع-قرص-العسل-650-G"
                className="block w-full h-full no-underline group focus:outline-none"
              >
                {combCard}
              </Link>
            ) : (
              combCard
            )}
          </div>

          {/* 3. Rural Fund Trust Badge Container (NO product, NO price) */}
          <div
            className="w-full bg-white rounded-xs shadow-[0_1px_3px_rgba(0,0,0,0.05)] border border-stone-200/50 overflow-hidden flex items-center justify-center animate-card-rise"
            style={{
              height: 'calc(176 * var(--u, 1px))',
              animationDelay: '0.22s',
            }}
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
            className="w-full animate-card-rise"
            style={{
              height: 'calc(355 * var(--u, 1px))',
              animationDelay: '0.10s',
            }}
          >
            {isInteractive ? (
              <Link
                href="/products/prod-1-NA7LA-عسل-نقي-15-KG"
                className="block w-full h-full no-underline group focus:outline-none"
              >
                {jar1_5kgCard}
              </Link>
            ) : (
              jar1_5kgCard
            )}
          </div>

          {/* 2. Honey with Nuts Tall Card (NO photo on top, exact authentic Canva) */}
          <div
            className="w-full animate-card-rise"
            style={{
              height: 'calc(296 * var(--u, 1px))',
              animationDelay: '0.18s',
            }}
          >
            {isInteractive ? (
              <Link
                href="/products/prod-3-NA7LA-عسل-نقي-مع-مكسرات-650-G"
                className="block w-full h-full no-underline group focus:outline-none"
              >
                {nutsCard}
              </Link>
            ) : (
              nutsCard
            )}
          </div>
        </div>
      </div>
    </PageShell>
  );
}
