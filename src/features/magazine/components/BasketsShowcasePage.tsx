import React from 'react';
import Link from 'next/link';
import { PageShell } from './PageShell';

interface BasketsShowcasePageProps {
  pageNumber?: number;
  isInteractive?: boolean;
  highlightedCode?: number | null;
}

export function BasketsShowcasePage({
  pageNumber = 2,
  isInteractive = true,
  highlightedCode = null,
}: BasketsShowcasePageProps) {
  // 1. Honey Basket Card (400 L.E, Code 901)
  const isHoneyBasketHighlighted = highlightedCode === 901;
  const honeyBasketCard = (
    <div
      className={`w-full bg-white rounded-xs shadow-[0_1px_3px_rgba(0,0,0,0.05)] flex flex-col justify-between overflow-hidden flex-1 transition-all duration-300 ${
        isInteractive ? 'hover:shadow-lg hover:border-[#B68763]/60 cursor-pointer' : ''
      } ${
        isHoneyBasketHighlighted
          ? 'border-2 border-[#B68763] ring-4 ring-[#B68763]/40 shadow-[0_0_25px_rgba(182,135,99,0.5)] scale-[1.02] z-20 animate-pulse'
          : 'border border-stone-200/50'
      }`}
      style={{ height: 'calc(476 * var(--u, 1px))' }}
    >
      <div className="w-full h-[50%] overflow-hidden bg-stone-100/50 shrink-0">
        <img
          src="/magazine/assets/p2_honey_clean.webp"
          alt="عسل سلة NA7LA"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="flex-1 p-[calc(8*var(--u,1px))] flex flex-col justify-between">
        <div>
          <h4 className="font-extrabold text-[#443000] text-[calc(11.5*var(--u,1px))] leading-tight group-hover:text-[#B68763] transition-colors">
            عسل سلة NA7LA
          </h4>
          <p className="text-[calc(7*var(--u,1px))] text-stone-600 font-medium leading-snug mt-1 opacity-90">
            هذا هاندكرافتيد منسوج من سعف النخيل عسل سلة يتضمن فاخر عسل NA7LA تشكيلة من نقي:
          </p>
          <ul className="text-[calc(6.8*var(--u,1px))] text-stone-700 font-medium leading-tight mt-1.5 space-y-0.5 pr-2">
            <li>نقي صعيد مصر عسل 1.5 KG</li>
            <li>نقي الدلتا عسل 1.5 KG</li>
            <li>عسل مع متنوع مكسرات 650 G</li>
            <li>عسل مع طبيعي قرص العسل 650 G</li>
          </ul>
        </div>
        <div className="flex items-center justify-between border-t border-stone-100 pt-[calc(3*var(--u,1px))] mt-auto">
          <span className="font-bold text-[#B68763] text-[calc(9*var(--u,1px))]">
            السعر
          </span>
          <span
            dir="ltr"
            className="font-extrabold text-[#443000] text-[calc(11.5*var(--u,1px))]"
          >
            400 L.E
          </span>
        </div>
      </div>
    </div>
  );

  // 2. Handcrafted Palm Basket (3000 L.E, Code 902)
  const isPalmBasketHighlighted = highlightedCode === 902;
  const palmBasketCard = (
    <div
      className={`w-full bg-white rounded-xs shadow-[0_1px_3px_rgba(0,0,0,0.05)] flex flex-col justify-between overflow-hidden transition-all duration-300 ${
        isInteractive ? 'hover:shadow-lg hover:border-[#B68763]/60 cursor-pointer' : ''
      } ${
        isPalmBasketHighlighted
          ? 'border-2 border-[#B68763] ring-4 ring-[#B68763]/40 shadow-[0_0_25px_rgba(182,135,99,0.5)] scale-[1.02] z-20 animate-pulse'
          : 'border border-stone-200/50'
      }`}
      style={{ height: 'calc(455 * var(--u, 1px))' }}
    >
      <div className="w-full h-[52%] overflow-hidden bg-stone-100/50 shrink-0">
        <img
          src="/magazine/assets/p2_basket_clean.webp"
          alt="عسل سلة NA7LA هاندكرافتيد"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="flex-1 p-[calc(8*var(--u,1px))] flex flex-col justify-between">
        <div>
          <h4 className="font-extrabold text-[#443000] text-[calc(11.5*var(--u,1px))] leading-tight group-hover:text-[#B68763] transition-colors">
            عسل سلة NA7LA
          </h4>
          <p className="text-[calc(7*var(--u,1px))] text-stone-600 font-medium leading-snug mt-1 opacity-90">
            هذا هاندكرافتيد منسوج من سعف النخيل عسل سلة يتضمن فاخر عسل NA7LA تشكيلة من نقي:
          </p>
          <ul className="text-[calc(6.8*var(--u,1px))] text-stone-700 font-medium leading-tight mt-1.5 space-y-0.5 pr-2">
            <li>نقي صعيد مصر عسل 1.5 KG</li>
            <li>نقي الدلتا عسل 1.5 KG</li>
            <li>عسل مع متنوع مكسرات 650 G</li>
            <li>عسل مع طبيعي قرص العسل 650 G</li>
          </ul>
        </div>
        <div className="flex items-center justify-between border-t border-stone-100 pt-[calc(3*var(--u,1px))] mt-auto">
          <span className="font-bold text-[#B68763] text-[calc(9*var(--u,1px))]">
            السعر
          </span>
          <span
            dir="ltr"
            className="font-extrabold text-[#443000] text-[calc(11.5*var(--u,1px))]"
          >
            3000 L.E
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <PageShell sectionTitle="عسل نقي NA7LA" pageNumber={pageNumber}>
      {/* 2-Column Exact Authentic Canva Layout for Page 2 */}
      <div
        className="grid grid-cols-2 w-full h-full"
        style={{
          gap: 'calc(8 * var(--u, 1px))',
          direction: 'rtl',
        }}
      >
        {/* Right Column (Contains Bee Emblem and Honey Jar Product) */}
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

          {/* 2. Honey Jar Product Container with Bullet Points */}
          {isInteractive ? (
            <Link
              href="/products/prod-na7la-عسل-سلة-NA7LA"
              className="block w-full no-underline group focus:outline-none flex-1 flex flex-col"
              style={{ height: 'calc(476 * var(--u, 1px))' }}
            >
              {honeyBasketCard}
            </Link>
          ) : (
            honeyBasketCard
          )}
        </div>

        {/* Left Column (Contains Handwoven Palm Basket and Trust Badge) */}
        <div
          className="flex flex-col h-full"
          style={{ gap: 'calc(8 * var(--u, 1px))' }}
        >
          {/* 1. Palm Basket Product Container with 4 Bullet Items */}
          {isInteractive ? (
            <Link
              href="/products/prod-na7la-عسل-سلة-NA7LA-هاندكرافتيد"
              className="block w-full no-underline group focus:outline-none"
              style={{ height: 'calc(455 * var(--u, 1px))' }}
            >
              {palmBasketCard}
            </Link>
          ) : (
            palmBasketCard
          )}

          {/* 2. Rural Fund Trust Badge Container (NO product, NO price) */}
          <div
            className="w-full bg-white rounded-xs shadow-[0_1px_3px_rgba(0,0,0,0.05)] border border-stone-200/50 overflow-hidden flex items-center justify-center flex-1"
            style={{ height: 'calc(196 * var(--u, 1px))' }}
          >
            <img
              src="/magazine/assets/authentic_trust_card.webp"
              alt="شهادة أصالة صندوق دعم الصناعات الريفية والبيئية"
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      </div>
    </PageShell>
  );
}
