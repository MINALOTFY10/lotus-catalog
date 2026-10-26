'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';

interface FlipbookClientProps {
  children: React.ReactNode[];
  initialPage?: number;
  onPageChange?: (page: number) => void;
}

export function FlipbookClient({
  children,
  initialPage = 1,
  onPageChange,
}: FlipbookClientProps) {
  const [currentPage, setCurrentPage] = useState<number>(initialPage);
  const [isFlipping, setIsFlipping] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);

  const totalPages = children.length;

  // Responsive check
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 860);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Sync state if initialPage changes
  useEffect(() => {
    setCurrentPage(initialPage);
  }, [initialPage]);

  // Turn page handler
  const goToPage = useCallback(
    (page: number) => {
      const clamped = Math.max(1, Math.min(page, totalPages));
      if (clamped === currentPage || isFlipping) return;

      setIsFlipping(true);
      setCurrentPage(clamped);
      if (onPageChange) {
        onPageChange(clamped);
      }

      setTimeout(() => {
        setIsFlipping(false);
      }, 500);
    },
    [currentPage, isFlipping, onPageChange, totalPages]
  );

  // In Arabic books (RTL):
  // "Next" (التالي) turns page forward (moving left)
  // "Prev" (السابق) turns page backward (moving right)
  const nextPage = useCallback(() => {
    if (isMobile) {
      goToPage(currentPage + 1);
    } else {
      // On desktop spread: page 1 is cover alone, then 2-3, 4-5, etc.
      if (currentPage === 1) {
        goToPage(2);
      } else {
        goToPage(Math.min(currentPage + 2, totalPages));
      }
    }
  }, [currentPage, isMobile, goToPage, totalPages]);

  const prevPage = useCallback(() => {
    if (isMobile) {
      goToPage(currentPage - 1);
    } else {
      if (currentPage <= 3) {
        goToPage(1);
      } else {
        goToPage(Math.max(currentPage - 2, 2));
      }
    }
  }, [currentPage, isMobile, goToPage]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        nextPage();
      } else if (e.key === 'ArrowRight') {
        prevPage();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextPage, prevPage]);

  // Touch swipe support
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(diff) > 50) {
      if (diff < 0) {
        // Swiped left -> next page
        nextPage();
      } else {
        // Swiped right -> prev page
        prevPage();
      }
    }
    touchStartX.current = null;
  };

  const toggleFullscreen = () => {
    if (!wrapperRef.current) return;
    if (!document.fullscreenElement) {
      wrapperRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Determine active pages for spread
  // In Arabic desktop spread:
  // - Page 1 (Cover): sits alone on the right side
  // - Pages 2 & 3: Page 3 on right, Page 2 on left (or Page 2 on right in standard 2-spread)
  // For standard Arabic 2-page spread:
  // Right side = Even page (e.g. Page 2), Left side = Odd page (e.g. Page 3)
  const isCover = currentPage === 1;
  const rightPageIndex = isCover ? 0 : Math.floor((currentPage - 2) / 2) * 2 + 1; // 0-based
  const leftPageIndex = isCover ? -1 : rightPageIndex + 1; // 0-based

  return (
    <div
      ref={wrapperRef}
      className={`relative w-full flex flex-col items-center justify-start select-none ${
        isFullscreen ? 'h-screen bg-stone-900 py-6 overflow-y-auto' : 'py-6 px-4'
      }`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Top Floating Control Bar */}
      <div className="z-30 mb-6 px-4 py-2 bg-white/95 backdrop-blur shadow-md rounded-full border border-stone-200 flex items-center gap-4 text-xs font-medium">
        {/* Next page (advances in RTL) */}
        <button
          onClick={nextPage}
          disabled={currentPage >= totalPages}
          className="px-3 py-1 bg-stone-100 hover:bg-[#B68763] hover:text-white disabled:opacity-30 rounded-full text-[#443000] font-bold flex items-center gap-1.5 transition-all"
        >
          <span>التالي</span>
          <span>←</span>
        </button>

        {/* Page counter */}
        <span className="font-bold text-[#443000] px-3 text-sm" dir="rtl">
          صفحة {currentPage} من {totalPages}
        </span>

        {/* Previous page */}
        <button
          onClick={prevPage}
          disabled={currentPage <= 1}
          className="px-3 py-1 bg-stone-100 hover:bg-[#B68763] hover:text-white disabled:opacity-30 rounded-full text-[#443000] font-bold flex items-center gap-1.5 transition-all"
        >
          <span>→</span>
          <span>السابق</span>
        </button>

        <span className="w-px h-4 bg-stone-200" />

        {/* Fullscreen button */}
        <button
          onClick={toggleFullscreen}
          className="text-stone-500 hover:text-stone-800 transition-colors"
          title="ملء الشاشة"
        >
          {isFullscreen ? '⛶ تصغير' : '⛶ ملء الشاشة'}
        </button>
      </div>

      {/* Book Stage */}
      <div
        className="w-full flex items-center justify-center"
        style={{ perspective: '2000px' }}
      >
        {isMobile ? (
          /* Mobile Single Page View */
          <div className="w-full max-w-[420px] drop-shadow-2xl transition-transform duration-300">
            {children[currentPage - 1] || children[0]}
          </div>
        ) : isCover ? (
          /* Desktop Cover (Single page centered with spine shadow) */
          <div className="w-full max-w-[560px] drop-shadow-2xl transition-transform duration-300 relative border-l-4 border-stone-300">
            {children[0]}
          </div>
        ) : (
          /* Desktop Two-Page Spread (Left page + Right page with Center Spine Shadow) */
          <div className="flex items-center justify-center max-w-[1140px] w-full drop-shadow-2xl transition-all duration-300 relative">
            {/* Left Page */}
            <div className="w-1/2 max-w-[560px] relative border-r border-stone-300/60 shadow-[-10px_0_20px_-10px_rgba(0,0,0,0.15)]">
              {leftPageIndex < children.length ? (
                children[leftPageIndex]
              ) : (
                <div className="magazine-page-container bg-[#EFEFEF]" />
              )}
            </div>

            {/* Center Book Spine Shadow */}
            <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-6 pointer-events-none z-20 bg-gradient-to-r from-black/10 via-transparent to-black/10" />

            {/* Right Page */}
            <div className="w-1/2 max-w-[560px] relative border-l border-stone-300/60 shadow-[10px_0_20px_-10px_rgba(0,0,0,0.15)]">
              {children[rightPageIndex] || (
                <div className="magazine-page-container bg-[#EFEFEF]" />
              )}
            </div>
          </div>
        )}
      </div>

      {/* Quick jump thumbnails strip */}
      <div className="mt-8 flex items-center gap-2 overflow-x-auto max-w-2xl px-4 py-2 bg-white/70 backdrop-blur rounded-lg border border-stone-200/80">
        <span className="text-[11px] font-bold text-stone-500 whitespace-nowrap">انتقال:</span>
        {Array.from({ length: Math.min(20, totalPages) }, (_, i) => i + 1).map((p) => (
          <button
            key={p}
            onClick={() => goToPage(p)}
            className={`min-w-7 h-7 rounded text-xs font-bold transition-all ${
              p === currentPage
                ? 'bg-[#B68763] text-white shadow-sm'
                : 'bg-stone-100 hover:bg-stone-200 text-stone-600'
            }`}
          >
            {p}
          </button>
        ))}
      </div>
    </div>
  );
}
