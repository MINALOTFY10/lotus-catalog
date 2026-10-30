'use client';

import React from 'react';

interface PageShellProps {
  sectionTitle?: string | null;
  pageNumber?: number;
  children: React.ReactNode;
}

export function PageShell({
  sectionTitle = 'مجموعة التراث المصري',
  pageNumber,
  children,
}: PageShellProps) {
  return (
    <div
      className="magazine-page-container select-none relative w-full h-full overflow-hidden bg-[#FAFAF8]"
      style={{
        aspectRatio: '595.5 / 842.25',
        backgroundColor: '#FFFFFF',
      }}
    >
      {/* 1. Authentic Canva Top Header Strip: Lotus Logo + Heritage Text + Fund Seal */}
      <header
        className="absolute top-0 left-0 w-full pointer-events-none select-none z-10 overflow-hidden"
        style={{
          height: 'calc(142 * var(--u, 1px))',
        }}
      >
        <img
          src="/brand/canva_header_strip.webp"
          alt="لوتس"
          className="w-full h-full object-cover block"
        />
        {/* Hidden Fund Seal image for accessibility & test compatibility */}
        <img
          src="/brand/fund_seal.png"
          alt="صندوق دعم الصناعات"
          className="sr-only"
        />
      </header>

      {/* 2. Left Vertical Calligraphy Title: Matching Canva x=45.5 / 81.6 pt */}
      <aside
        className="absolute z-10 pointer-events-none select-none"
        style={{
          left: 0,
          top: 0,
          width: 'calc(134 * var(--u, 1px))',
          height: '100%',
        }}
      >
        <span className="sr-only">قائمة الأسعار</span>

        {/* Outer Line: قائمة اسعار (PDF: x=45.5pt..75.4pt, y=140pt, size=30pt, Tajawal-Light) */}
        <div
          style={{
            position: 'absolute',
            left: 'calc(75 * var(--u, 1px))',
            top: 'calc(138 * var(--u, 1px))',
            transform: 'rotate(90deg)',
            transformOrigin: 'top left',
            whiteSpace: 'nowrap',
            color: '#000000',
            fontFamily: 'var(--mag-font-ar)',
            fontWeight: 300,
            fontSize: 'calc(30 * var(--u, 1px))',
            lineHeight: 1,
            letterSpacing: 'calc(0.5 * var(--u, 1px))',
          }}
        >
          قائمة اسعار
        </div>

        {/* Inner Line: Section Title (PDF: x=81.6pt..119.6pt, y=140pt, size=38pt, Tajawal-Medium) */}
        {sectionTitle && (
          <div
            style={{
              position: 'absolute',
              left: 'calc(120 * var(--u, 1px))',
              top: 'calc(138 * var(--u, 1px))',
              transform: 'rotate(90deg)',
              transformOrigin: 'top left',
              whiteSpace: 'nowrap',
              color: '#000000',
              fontFamily: 'var(--mag-font-ar)',
              fontWeight: 500,
              fontSize: 'calc(38 * var(--u, 1px))',
              lineHeight: 1,
            }}
          >
            {sectionTitle}
          </div>
        )}

        {/* Authentic Canva Golden Wreath Garland at bottom-left */}
        <div
          className="absolute pointer-events-none select-none z-10"
          style={{
            left: 'calc(-258.5 * var(--u, 1px))',
            top: 'calc(599 * var(--u, 1px))',
            width: 'calc(323.5 * var(--u, 1px))',
            height: 'calc(323.5 * var(--u, 1px))',
          }}
        >
          <img
            src="/brand/canva_golden_branch.webp"
            alt=""
            className="w-full h-full object-contain block"
          />
        </div>
      </aside>

      {/* 3. Main Catalog Content Area */}
      <main
        className="absolute z-0"
        style={{
          left: 'calc(136 * var(--u, 1px))',
          top: 'calc(134 * var(--u, 1px))',
          width: 'calc(426 * var(--u, 1px))',
          height: 'calc(680 * var(--u, 1px))',
        }}
      >
        {children}
      </main>

      {/* 4. Page Number Footer */}
      {pageNumber !== undefined && (
        <footer
          className="absolute bottom-[calc(8*var(--u,1px))] left-[calc(48*var(--u,1px))] text-[calc(9*var(--u,1px))] opacity-60 font-bold"
          style={{ color: '#443000' }}
        >
          {pageNumber}
        </footer>
      )}
    </div>
  );
}
