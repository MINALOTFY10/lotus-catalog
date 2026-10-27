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
      className="magazine-page-container select-none"
      style={{
        backgroundColor: 'var(--mag-bg, #EFEFEF)',
      }}
    >
      {/* 1. Top-Right Laurel Decorative Branch */}
      <div
        className="absolute top-0 right-0 pointer-events-none z-10"
        style={{
          width: 'calc(185 * var(--u, 1px))',
          height: 'calc(65 * var(--u, 1px))',
        }}
      >
        <img
          src="/brand/laurel_top_right.png"
          alt=""
          className="w-full h-full object-contain object-top-right"
        />
      </div>

      {/* 2. Top Header Logos: Lotus Crest on Left, Fund Seal on Right */}
      <header
        className="absolute top-0 flex items-center justify-center gap-[calc(24*var(--u,1px))] z-10"
        style={{
          left: 'calc(26 * var(--u, 1px))',
          width: 'calc(418 * var(--u, 1px))',
          height: 'calc(125 * var(--u, 1px))',
          paddingTop: 'calc(12 * var(--u, 1px))',
          direction: 'ltr', // Keep Lotus on left and Fund Seal on right
        }}
      >
        {/* Lotus Crest */}
        <div style={{ height: 'calc(98 * var(--u, 1px))' }}>
          <img
            src="/brand/lotus_logo.png"
            alt="لوتس"
            className="h-full w-auto object-contain"
          />
        </div>

        {/* Fund Seal */}
        <div style={{ height: 'calc(98 * var(--u, 1px))' }}>
          <img
            src="/brand/fund_seal.png"
            alt="صندوق دعم الصناعات"
            className="h-full w-auto object-contain"
          />
        </div>
      </header>

      {/* 3. Right Sidebar Vertical Title: Elegant calligraphy styling */}
      <aside
        className="absolute flex items-start gap-[calc(8*var(--u,1px))] z-10 pointer-events-none"
        style={{
          right: 'calc(20 * var(--u, 1px))',
          top: 'calc(320 * var(--u, 1px))',
          height: 'calc(480 * var(--u, 1px))',
          writingMode: 'vertical-rl',
          transform: 'rotate(180deg)',
          color: 'var(--mag-ink, #443000)',
          direction: 'ltr',
        }}
      >
        {/* Outer line: قائمة الأسعار */}
        <span
          className="font-extrabold tracking-tight whitespace-nowrap"
          style={{
            fontSize: 'calc(26 * var(--u, 1px))',
            letterSpacing: 'calc(0.5 * var(--u, 1px))',
          }}
        >
          قائمة الأسعار
        </span>

        {/* Inner line: Section Title (e.g. مجموعة التراث المصري) */}
        {sectionTitle && (
          <span
            className="font-bold tracking-tight whitespace-nowrap opacity-90"
            style={{
              fontSize: 'calc(22 * var(--u, 1px))',
              letterSpacing: 'calc(0.5 * var(--u, 1px))',
            }}
          >
            {sectionTitle}
          </span>
        )}
      </aside>

      {/* 4. Main Catalog Content Area */}
      <main
        className="absolute"
        style={{
          left: 'calc(26 * var(--u, 1px))',
          top: 'calc(135 * var(--u, 1px))',
          width: 'calc(418 * var(--u, 1px))',
          height: 'calc(690 * var(--u, 1px))',
        }}
      >
        {children}
      </main>

      {/* 5. Page Number (Footer) */}
      {pageNumber !== undefined && (
        <footer
          className="absolute bottom-[calc(8*var(--u,1px))] left-[calc(26*var(--u,1px))] text-[calc(9*var(--u,1px))] opacity-50 font-semibold"
          style={{ color: 'var(--mag-ink, #443000)' }}
        >
          {pageNumber}
        </footer>
      )}
    </div>
  );
}
