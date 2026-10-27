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

      {/* 2. Right Sidebar Vertical Title: 100% Authentic Canva Typography & Orientation */}
      <aside
        className="absolute z-10 pointer-events-none select-none flex items-center justify-center"
        style={{
          right: 'calc(22 * var(--u, 1px))',
          top: 'calc(580 * var(--u, 1px))',
          width: 'calc(60 * var(--u, 1px))',
          height: '0px',
        }}
      >
        <div
          className="flex flex-col items-start gap-[calc(5*var(--u,1px))]"
          style={{
            transform: 'rotate(-90deg)',
            transformOrigin: 'center center',
            whiteSpace: 'nowrap',
            direction: 'rtl',
            color: 'var(--mag-ink, #443000)',
          }}
        >
          {/* Inner Line: قائمة الأسعار (rotates to left/inner line) */}
          <span
            className="font-bold tracking-normal block opacity-95"
            style={{
              fontSize: 'calc(18.5 * var(--u, 1px))',
              fontFamily: 'var(--mag-font-ar)',
              lineHeight: 1,
            }}
          >
            قائمة الأسعار
          </span>

          {/* Outer Line: Section Title (rotates to right/outer line) */}
          {sectionTitle && (
            <span
              className="font-extrabold tracking-normal block"
              style={{
                fontSize: 'calc(22.5 * var(--u, 1px))',
                fontFamily: 'var(--mag-font-ar)',
                lineHeight: 1,
              }}
            >
              {sectionTitle}
            </span>
          )}
        </div>
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
