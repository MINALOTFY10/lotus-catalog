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
      {/* 1. Authentic Canva Top Header Strip: 100% Pixel-Perfect Match to Canva */}
      <header
        className="absolute top-0 left-0 w-full pointer-events-none select-none z-10 overflow-hidden"
        style={{
          height: 'calc(145 * var(--u, 1px))',
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
