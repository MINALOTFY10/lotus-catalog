import React from 'react';

interface PageShellProps {
  sectionTitle?: string | null;
  pageNumber?: number;
  children: React.ReactNode;
}

export function PageShell({
  sectionTitle = 'NA7LA عسل نقي',
  pageNumber,
  children,
}: PageShellProps) {
  return (
    <div
      className="magazine-page-container select-none relative w-full h-full overflow-hidden"
      style={{
        backgroundColor: 'var(--mag-bg, #EFEFEF)',
      }}
    >
      {/* 1. Top-Right Laurel Decorative Branch */}
      <div
        className="absolute top-0 right-0 pointer-events-none z-10"
        style={{
          width: 'calc(148 * var(--u, 1px))',
          height: 'calc(53 * var(--u, 1px))',
        }}
      >
        <img
          src="/brand/laurel_top_right.png"
          alt=""
          className="w-full h-full object-contain object-top-right"
        />
      </div>

      {/* 2. Top Header Logos: Centered Horizontally Above Content Area */}
      <header
        className="absolute flex items-center justify-center z-10"
        style={{
          top: 'calc(18 * var(--u, 1px))',
          left: 'calc(35 * var(--u, 1px))',
          width: 'calc(435 * var(--u, 1px))',
          height: 'calc(102 * var(--u, 1px))',
          gap: 'calc(40 * var(--u, 1px))',
          direction: 'ltr', // Lotus crest on left, Fund seal on right
        }}
      >
        {/* Lotus Crest */}
        <div className="h-full flex items-center justify-center">
          <img
            src="/brand/lotus_logo.png"
            alt="لوتس"
            className="h-full w-auto max-h-[calc(102*var(--u,1px))] object-contain drop-shadow-2xs"
          />
        </div>

        {/* Fund Seal */}
        <div className="h-full flex items-center justify-center">
          <img
            src="/brand/fund_seal.png"
            alt="صندوق دعم الصناعات"
            className="h-full w-auto max-h-[calc(102*var(--u,1px))] object-contain drop-shadow-2xs"
          />
        </div>
      </header>

      {/* 3. Right Sidebar Vertical Title: Scaled to prevent any overflow */}
      <aside
        className="absolute flex flex-col items-center justify-center z-10 pointer-events-none text-center"
        style={{
          right: 'calc(14 * var(--u, 1px))',
          top: 'calc(350 * var(--u, 1px))',
          height: 'calc(260 * var(--u, 1px))',
          width: 'calc(45 * var(--u, 1px))',
          writingMode: 'vertical-rl',
          transform: 'rotate(180deg)',
          transformOrigin: 'center center',
          color: 'var(--mag-ink, #443000)',
          direction: 'ltr',
        }}
      >
        <span
          className="font-extrabold tracking-tight whitespace-nowrap block"
          style={{
            fontSize: 'calc(18 * var(--u, 1px))',
            letterSpacing: 'calc(0.5 * var(--u, 1px))',
          }}
        >
          قائمة الأسعار
        </span>

        {sectionTitle && (
          <span
            className="font-bold tracking-tight whitespace-nowrap block opacity-95 mt-1"
            style={{
              fontSize: 'calc(16 * var(--u, 1px))',
              letterSpacing: 'calc(0.5 * var(--u, 1px))',
            }}
          >
            {sectionTitle}
          </span>
        )}
      </aside>

      {/* 4. Main Catalog Content Area */}
      <main
        className="absolute z-0"
        style={{
          left: 'calc(35 * var(--u, 1px))',
          top: 'calc(145 * var(--u, 1px))',
          width: 'calc(435 * var(--u, 1px))',
          height: 'calc(675 * var(--u, 1px))',
        }}
      >
        {children}
      </main>

      {/* 5. Page Number (Footer) */}
      {pageNumber !== undefined && (
        <footer
          className="absolute bottom-[calc(10*var(--u,1px))] left-[calc(35*var(--u,1px))] text-[calc(9*var(--u,1px))] opacity-50 font-semibold"
          style={{ color: 'var(--mag-ink, #443000)' }}
        >
          {pageNumber}
        </footer>
      )}
    </div>
  );
}
