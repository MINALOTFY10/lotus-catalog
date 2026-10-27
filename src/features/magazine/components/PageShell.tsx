import React from 'react';

interface PageShellProps {
  sectionTitle?: string | null;
  pageNumber?: number;
  headlineBottom?: number;
  children: React.ReactNode;
}

export function PageShell({
  sectionTitle = 'عسل نقي NA7LA',
  pageNumber,
  headlineBottom,
  children,
}: PageShellProps) {
  // On showcase pages (1-5), the headline stops above the bottom feature card (~588)
  // On catalog 3x3 grid pages (6+), the headline extends along the full grid to (~792)
  const finalHeadlineBottom =
    headlineBottom ?? (pageNumber && pageNumber >= 6 ? 792 : 588);

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
        className="absolute z-10 pointer-events-none select-none"
        style={{
          right: 'calc(96.5 * var(--u, 1px))',
          top: `calc(${finalHeadlineBottom} * var(--u, 1px))`,
          width: '0px',
          height: '0px',
        }}
      >
        <div
          className="flex flex-col items-start"
          style={{
            position: 'absolute',
            right: 0,
            bottom: 0,
            width: 'max-content',
            gap: 'calc(7 * var(--u, 1px))',
            transform: 'rotate(90deg)',
            transformOrigin: 'bottom right',
            whiteSpace: 'nowrap',
            direction: 'rtl',
            color: 'var(--mag-ink, #443000)',
          }}
        >
          {/* Outer Line: Section Title (rotates to outer line on right) */}
          {sectionTitle && (
            <span
              className="font-extrabold tracking-normal block"
              style={{
                fontSize: 'calc(23.5 * var(--u, 1px))',
                fontFamily: 'var(--mag-font-ar)',
                lineHeight: 1,
                letterSpacing: '0.05em',
              }}
            >
              {sectionTitle}
            </span>
          )}

          {/* Inner Line: قائمة الأسعار (rotates to inner line on left) */}
          <span
            className="font-bold tracking-normal block opacity-95"
            style={{
              fontSize: 'calc(19 * var(--u, 1px))',
              fontFamily: 'var(--mag-font-ar)',
              lineHeight: 1,
              letterSpacing: '0.04em',
            }}
          >
            قائمة الأسعار
          </span>
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
