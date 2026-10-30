'use client';

import React from 'react';
import { PageHeader } from './PageHeader';
import { VerticalHeadline } from './VerticalHeadline';

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
      {/* 1. Header: Lotus logo + Fund seal, placed like in Canva */}
      <PageHeader />

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

        {/* Left vertical headline: outside = قائمة اسعار, inside = section title (as in Canva) */}
        <VerticalHeadline title={sectionTitle} />

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
          /* Canva grid box: 3 cards x 127.5u + 2 gaps x 12.7u, 3 rows x 212.4u + 2 gaps x 11.1u */
          left: 'calc(144.2 * var(--u, 1px))',
          top: 'calc(139.4 * var(--u, 1px))',
          width: 'calc(407.9 * var(--u, 1px))',
          height: 'calc(659.4 * var(--u, 1px))',
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
