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

  // Sync state if initialPage changes
  useEffect(() => {
    if (initialPage && initialPage !== currentPage) {
      goToPage(initialPage);
      wrapperRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [initialPage, currentPage, goToPage]);

  // In Arabic books (RTL):
  // "Next" (التالي) turns page forward (moving left)
  // "Prev" (السابق) turns page backward (moving right)
  const nextPage = useCallback(() => {
    if (isMobile) {
      goToPage(currentPage + 1);
    } else {
      const currentSpreadStart = Math.floor((currentPage - 1) / 2) * 2 + 1;
      const nextSpreadStart = currentSpreadStart + 2;
      if (nextSpreadStart <= totalPages) {
        goToPage(nextSpreadStart);
      }
    }
  }, [currentPage, isMobile, goToPage, totalPages]);

  const prevPage = useCallback(() => {
    if (isMobile) {
      goToPage(currentPage - 1);
    } else {
      const currentSpreadStart = Math.floor((currentPage - 1) / 2) * 2 + 1;
      const prevSpreadStart = currentSpreadStart - 2;
      if (prevSpreadStart >= 1) {
        goToPage(prevSpreadStart);
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

  // Sync fullscreen state if user exits via Esc or browser UI
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

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
  // Pairs: (Page 1 right, Page 2 left), (Page 3 right, Page 4 left), ...
  const rightPageIndex = Math.floor((currentPage - 1) / 2) * 2; // 0-based
  const leftPageIndex = rightPageIndex + 1; // 0-based

  return (
    <div
      ref={wrapperRef}
      className={`relative w-full flex flex-col items-center select-none overflow-x-hidden ${
        isFullscreen
          ? 'h-screen w-screen bg-[#F3F4F7] p-2 flex flex-col justify-between overflow-hidden'
          : 'py-3 sm:py-6 px-2 sm:px-4 justify-start'
      }`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Book Stage */}
      <div
        className="w-full flex items-center justify-center flex-1 min-h-0"
        style={{ perspective: '2000px' }}
      >
        {isMobile ? (
          /* Mobile Single Page View */
          <div
            className="w-full drop-shadow-2xl transition-transform duration-300 flex items-center justify-center mx-auto"
            style={{
              maxWidth: isFullscreen
                ? 'calc((100vh - 68px) * (595 / 842))'
                : 'min(calc(100vw - 24px), calc((100vh - 175px) * (595 / 842)), 440px)',
              width: '100%',
            }}
          >
            {children[currentPage - 1] || children[0]}
          </div>
        ) : (
          /* Desktop Two-Page Spread (Left page on physical Left, Right page on physical Right) */
          <div
            className="flex items-center justify-center w-full drop-shadow-2xl transition-all duration-300 relative"
            style={{
              direction: 'ltr',
              maxWidth: isFullscreen
                ? 'min(98vw, calc((100vh - 68px) * (1190 / 842)))'
                : '1140px',
            }}
          >
            {/* Left Page */}
            <div
              className="w-1/2 relative border-r border-stone-300/60 shadow-[-10px_0_20px_-10px_rgba(0,0,0,0.15)]"
              style={{
                maxWidth: isFullscreen
                  ? 'min(49vw, calc((100vh - 68px) * (595 / 842)))'
                  : '570px',
              }}
            >
              {leftPageIndex < children.length ? (
                children[leftPageIndex]
              ) : (
                <div className="magazine-page-container bg-[#EFEFEF]" />
              )}
            </div>

            {/* Center Book Spine Shadow */}
            <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-6 pointer-events-none z-20 bg-gradient-to-r from-black/10 via-transparent to-black/10" />

            {/* Right Page */}
            <div
              className="w-1/2 relative border-l border-stone-300/60 shadow-[10px_0_20px_-10px_rgba(0,0,0,0.15)]"
              style={{
                maxWidth: isFullscreen
                  ? 'min(49vw, calc((100vh - 68px) * (595 / 842)))'
                  : '570px',
              }}
            >
              {children[rightPageIndex] || (
                <div className="magazine-page-container bg-[#EFEFEF]" />
              )}
            </div>
          </div>
        )}
      </div>

      {/* Floating Control Bar at Bottom */}
      <div
        className={`z-30 px-2 sm:px-4 py-1.5 sm:py-2 bg-white/95 backdrop-blur shadow-md rounded-full border border-stone-200 flex items-center justify-center gap-1 sm:gap-3 text-xs font-medium transition-all max-w-[calc(100vw-20px)] mx-auto shrink-0 ${
          isFullscreen ? 'mt-2 mb-1 shadow-lg' : 'mt-3 sm:mt-6'
        }`}
      >
        {/* Previous page button */}
        <button
          onClick={prevPage}
          disabled={isMobile ? currentPage <= 1 : rightPageIndex <= 0}
          className="px-2 sm:px-3 py-1 sm:py-1.5 bg-stone-100 hover:bg-[#B68763] hover:text-white disabled:opacity-30 rounded-full text-[#443000] font-bold flex items-center gap-1 sm:gap-1.5 transition-all shadow-2xs shrink-0 whitespace-nowrap"
          title="الصفحة السابقة"
        >
          <svg
            className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.5"
              d="M9 5l7 7-7 7"
            />
          </svg>
          <span className="text-[11px] sm:text-xs">السابق</span>
        </button>

        {/* Page counter */}
        <span
          className="font-bold text-[#443000] px-1 sm:px-2.5 text-xs sm:text-sm select-none shrink-0 whitespace-nowrap text-center"
          dir="rtl"
        >
          صفحة {isMobile ? currentPage : `${rightPageIndex + 1}${leftPageIndex < totalPages ? ` - ${leftPageIndex + 1}` : ''}`} من {totalPages}
        </span>

        {/* Next page button */}
        <button
          onClick={nextPage}
          disabled={isMobile ? currentPage >= totalPages : rightPageIndex + 2 > totalPages}
          className="px-2 sm:px-3 py-1 sm:py-1.5 bg-stone-100 hover:bg-[#B68763] hover:text-white disabled:opacity-30 rounded-full text-[#443000] font-bold flex items-center gap-1 sm:gap-1.5 transition-all shadow-2xs shrink-0 whitespace-nowrap"
          title="الصفحة التالية"
        >
          <span className="text-[11px] sm:text-xs">التالي</span>
          <svg
            className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.5"
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        <span className="w-px h-3.5 sm:h-4 bg-stone-200 shrink-0 mx-0.5" />

        {/* Fullscreen button */}
        <button
          onClick={toggleFullscreen}
          className="text-stone-600 hover:text-[#B68763] hover:bg-stone-100/80 rounded-full transition-all px-1.5 sm:px-2.5 py-1 text-xs font-bold flex items-center gap-1 sm:gap-1.5 group shrink-0 whitespace-nowrap"
          title={isFullscreen ? 'تصغير الشاشة' : 'ملء الشاشة'}
        >
          {isFullscreen ? (
            <svg
              className="w-3.5 h-3.5 text-stone-500 group-hover:text-[#B68763] transition-colors shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 14h6m0 0v6m0-6L3 21m17-7h-6m0 0v6m0-6l7 7M14 4v6m0 0h6m-6 0L21 3M10 4v6m0 0H4m6 0L3 3"
              />
            </svg>
          ) : (
            <svg
              className="w-3.5 h-3.5 text-stone-500 group-hover:text-[#B68763] transition-colors shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3"
              />
            </svg>
          )}
          <span className="hidden sm:inline">{isFullscreen ? 'تصغير' : 'ملء الشاشة'}</span>
        </button>
      </div>
    </div>
  );
}
