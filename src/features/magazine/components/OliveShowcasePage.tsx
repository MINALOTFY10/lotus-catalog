import React from 'react';
import Link from 'next/link';
import { PageShell } from './PageShell';

interface OliveShowcasePageProps {
  pageNumber?: number;
  isInteractive?: boolean;
  highlightedCode?: number | null;
}

export function OliveShowcasePage({
  pageNumber = 5,
  isInteractive = true,
  highlightedCode = null,
}: OliveShowcasePageProps) {
  const isOlive500Highlighted = highlightedCode === 55;
  const olive500Card = (
    <div
      className={`w-full bg-white rounded-xs shadow-[0_1px_3px_rgba(0,0,0,0.05)] flex flex-col justify-between overflow-hidden shrink-0 transition-all duration-300 ${
        isInteractive ? 'hover:shadow-lg hover:border-[#B68763]/60 cursor-pointer' : ''
      } ${
        isOlive500Highlighted
          ? 'border-2 border-[#B68763] ring-4 ring-[#B68763]/40 shadow-[0_0_25px_rgba(182,135,99,0.5)] scale-[1.02] z-20 animate-pulse'
          : 'border border-stone-200/50'
      }`}
      style={{ height: 'calc(295 * var(--u, 1px))' }}
    >
      <div className="w-full h-[54%] overflow-hidden bg-stone-100/50 shrink-0">
        <img
          src="/magazine/assets/p4_olive_750ml.webp"
          alt="زيت زيتون بكر ممتاز 500 ML"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="flex-1 p-[calc(8*var(--u,1px))] flex flex-col justify-between">
        <div>
          <h4 className="font-extrabold text-[#443000] text-[calc(10.5*var(--u,1px))] leading-tight group-hover:text-[#B68763] transition-colors">
            زيت زيتون بكر ممتاز 500 ML
          </h4>
          <p className="text-[calc(7.8*var(--u,1px))] text-stone-600 font-medium leading-snug mt-1 opacity-90">
            مصري إكسترا فيرجين أوليف أويل علامة WAG تجارية من مزارع الزيتون النقية.
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
            575 L.E
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <PageShell sectionTitle="عسل نقي NA7LA" pageNumber={pageNumber}>
      {/* Exact Authentic Canva Layout for Page 5 (Olive Oil Solo Showcase) */}
      <div
        className="flex flex-col w-full select-none animate-rise-bottom-delayed"
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
          {/* Right Column: 500 ML Product & Olive Groves Collage */}
          <div
            className="flex flex-col h-full justify-between"
            style={{ gap: 'calc(8 * var(--u, 1px))' }}
          >
            {/* 1. Olive Oil 500 ML Product Container */}
            <div
              className="w-full shrink-0 animate-card-rise"
              style={{
                height: 'calc(295 * var(--u, 1px))',
                animationDelay: '0.08s',
              }}
            >
              {isInteractive ? (
                <Link
                  href="/products/prod-55-زيت-زيتون-بكر-ممتاز-500-ML"
                  className="block w-full h-full no-underline group focus:outline-none"
                >
                  {olive500Card}
                </Link>
              ) : (
                olive500Card
              )}
            </div>

            {/* 2. Olive Oil Triptych / Groves Photo Collage Container */}
            <div
              className="w-full bg-white rounded-xs shadow-[0_1px_3px_rgba(0,0,0,0.05)] border border-stone-200/50 overflow-hidden flex items-center justify-center select-none flex-1 animate-card-rise"
              style={{ animationDelay: '0.16s' }}
            >
              <img
                src="/magazine/assets/p5_olive_collage.webp"
                alt="زيت زيتون واج في مزارع الزيتون"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Left Column: Tall Vertical Olive Branch Natural Card */}
          <div
            className="w-full h-full bg-white rounded-xs shadow-[0_1px_3px_rgba(0,0,0,0.05)] border border-stone-200/50 overflow-hidden flex items-center justify-center select-none animate-card-rise"
            style={{ animationDelay: '0.12s' }}
          >
            <img
              src="/magazine/assets/p5_left_tall_olive_card.webp"
              alt="طبيعي من مناحل صندوق دعم الصناعات الريفية والبيئية مصر"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Bottom Full-Width WAJ Brand Card (Exact Authentic Canva) */}
        <div
          className="w-full bg-white rounded-xs shadow-[0_1px_3px_rgba(0,0,0,0.05)] border border-stone-200/50 overflow-hidden flex items-center justify-center select-none shrink-0 animate-card-rise"
          style={{
            height: 'calc(155 * var(--u, 1px))',
            animationDelay: '0.22s',
          }}
        >
          <img
            src="/magazine/assets/p5_waj_bottom_card.webp"
            alt="شعار واج WAJ زيت زيتون بكر ممتاز"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </PageShell>
  );
}
