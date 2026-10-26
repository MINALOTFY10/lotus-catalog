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

      {/* 2. Top Header Logos (Lotus Crest & Fund Seal) */}
      <header
        className="absolute top-0 flex items-center justify-center gap-[calc(20*var(--u,1px))] z-10"
        style={{
          left: 'calc(28 * var(--u, 1px))',
          width: 'calc(405 * var(--u, 1px))',
          height: 'calc(130 * var(--u, 1px))',
          paddingTop: 'calc(8 * var(--u, 1px))',
        }}
      >
        {/* Lotus Crest */}
        <div style={{ height: 'calc(105 * var(--u, 1px))' }}>
          <img
            src="/brand/lotus_logo.png"
            alt="لوتس"
            className="h-full w-auto object-contain"
          />
        </div>

        {/* Fund Seal */}
        <div style={{ height: 'calc(105 * var(--u, 1px))' }}>
          <img
            src="/brand/fund_seal.png"
            alt="صندوق دعم الصناعات"
            className="h-full w-auto object-contain"
          />
        </div>
      </header>

      {/* 3. Right Sidebar Vertical Title */}
      <aside
        className="absolute top-0 right-0 h-full flex flex-col items-center justify-center z-10 pointer-events-none"
        style={{
          width: 'calc(162 * var(--u, 1px))',
        }}
      >
        <div
          className="flex items-center gap-[calc(14*var(--u,1px))] font-extrabold tracking-tight whitespace-nowrap"
          style={{
            writingMode: 'vertical-rl',
            transform: 'rotate(180deg)',
            color: 'var(--mag-ink, #443000)',
            fontSize: 'calc(27 * var(--u, 1px))',
            letterSpacing: 'calc(0.5 * var(--u, 1px))',
          }}
        >
          <span>قائمة الأسعار</span>
          {sectionTitle && (
            <span className="opacity-90">{sectionTitle}</span>
          )}
        </div>
      </aside>

      {/* 4. Main Catalog Content Area */}
      <main
        className="absolute"
        style={{
          left: 'calc(28 * var(--u, 1px))',
          top: 'calc(135 * var(--u, 1px))',
          width: 'calc(405 * var(--u, 1px))',
          height: 'calc(685 * var(--u, 1px))',
        }}
      >
        {children}
      </main>

      {/* 5. Page Number (Footer) */}
      {pageNumber !== undefined && (
        <footer
          className="absolute bottom-[calc(8*var(--u,1px))] left-[calc(28*var(--u,1px))] text-[calc(9*var(--u,1px))] opacity-60 font-semibold"
          style={{ color: 'var(--mag-ink, #443000)' }}
        >
          {pageNumber}
        </footer>
      )}
    </div>
  );
}
