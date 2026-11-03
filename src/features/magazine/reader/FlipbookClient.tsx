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
  const touchStartY = useRef<number | null>(null);
  const touchStartTime = useRef<number>(0);
  const isMultiTouch = useRef<boolean>(false);

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

  // Sync state if initialPage changes from parent
  useEffect(() => {
    if (initialPage) {
      const clamped = Math.max(1, Math.min(initialPage, totalPages));
      if (clamped !== currentPage) {
        setCurrentPage(clamped);
      }
    }
  }, [initialPage, totalPages, currentPage]);

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

  // Check if user is currently zoomed in (via pinch-zoom on mobile)
  const isZoomedIn = useCallback(() => {
    if (typeof window !== 'undefined' && window.visualViewport) {
      return window.visualViewport.scale > 1.05;
    }
    return false;
  }, []);

  // Touch swipe support (safeguarded against pinch-to-zoom and multi-touch)
  const handleTouchStart = (e: React.TouchEvent) => {
    // If more than 1 finger is touching, user is pinching/zooming -> ignore swipe completely
    if (e.touches.length > 1) {
      isMultiTouch.current = true;
      touchStartX.current = null;
      touchStartY.current = null;
      return;
    }

    isMultiTouch.current = false;
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    touchStartTime.current = Date.now();
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    // If a second finger touches during movement, cancel any swipe action
    if (e.touches.length > 1) {
      isMultiTouch.current = true;
      touchStartX.current = null;
      touchStartY.current = null;
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    // Never flip pages if:
    // 1. User performed a multi-touch (pinch-to-zoom) gesture
    // 2. Browser viewport is currently zoomed in (scale > 1.05, user is panning)
    // 3. No valid single-touch start recorded
    if (
      isMultiTouch.current ||
      isZoomedIn() ||
      touchStartX.current === null ||
      touchStartY.current === null ||
      !e.changedTouches[0]
    ) {
      touchStartX.current = null;
      touchStartY.current = null;
      isMultiTouch.current = false;
      return;
    }

    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const diffX = touchEndX - touchStartX.current;
    const diffY = touchEndY - touchStartY.current;
    const elapsed = Date.now() - touchStartTime.current;

    // Strict horizontal swipe criteria:
    // - Clear horizontal distance (at least 60px)
    // - Horizontal movement significantly dominates vertical movement (at least 1.5x)
    // - Performed in under 750ms (intentional quick swipe, not slow drag/pan)
    if (Math.abs(diffX) > 60 && Math.abs(diffX) > Math.abs(diffY) * 1.5 && elapsed < 750) {
      if (diffX < 0) {
        // Swiped left -> previous page
        prevPage();
      } else {
        // Swiped right -> next page
        nextPage();
      }
    }

    touchStartX.current = null;
    touchStartY.current = null;
    isMultiTouch.current = false;
  };

  const handleTouchCancel = () => {
    touchStartX.current = null;
    touchStartY.current = null;
    isMultiTouch.current = false;
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
          ? 'h-screen w-screen bg-[#F3F4F7] p-1 flex flex-col justify-between items-center overflow-hidden'
          : 'pt-8 sm:pt-14 pb-4 sm:pb-12 px-0.5 sm:px-4 justify-start items-center'
      }`}
      style={{ touchAction: 'pan-y pinch-zoom' }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchCancel}
    >
      {/* Book Stage */}
      <div
        className="w-full flex items-center justify-center flex-1 min-h-0 animate-rise-bottom-delayed"
        style={{ perspective: '2000px' }}
      >
        {isMobile ? (
          /* Mobile Single Page View */
          <div
            className="w-full drop-shadow-2xl transition-transform duration-300 flex items-center justify-center mx-auto my-auto"
            style={{
              maxWidth: isFullscreen
                ? 'min(calc((100vh - 68px) * (595 / 842)), calc(100vw - 4px))'
                : 'min(calc(100vw - 4px), 520px)',
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
                : 'min(94vw, 1260px)',
            }}
          >
            {/* Left Page */}
            <div
              className="w-1/2 relative border-r border-stone-300/60 shadow-[-10px_0_20px_-10px_rgba(0,0,0,0.15)]"
              style={{
                maxWidth: isFullscreen
                  ? 'min(49vw, calc((100vh - 68px) * (595 / 842)))'
                  : '630px',
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
                  : '630px',
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
        className={`z-30 px-2 sm:px-4 py-1.5 sm:py-2 bg-white/95 backdrop-blur shadow-md rounded-full border border-stone-200 flex items-center justify-center gap-1 sm:gap-3 text-xs font-medium transition-all max-w-[calc(100vw-20px)] mx-auto shrink-0 animate-rise-toolbar ${
          isFullscreen ? 'mt-2 mb-1 shadow-lg' : 'mt-3 sm:mt-6 mb-2 sm:mb-0'
        }`}
      >
        {/* Previous page button */}
        <button
          onClick={prevPage}
          disabled={isMobile ? currentPage <= 1 : rightPageIndex <= 0}
          className="px-2 sm:px-3 py-1 sm:py-1.5 bg-stone-100 hover:bg-[#B68763] hover:text-white disabled:opacity-30 rounded-full text-[#443000] font-bold flex items-center gap-1 sm:gap-1.5 transition-all shadow-2xs shrink-0 whitespace-nowrap cursor-pointer"
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
          className="px-2 sm:px-3 py-1 sm:py-1.5 bg-stone-100 hover:bg-[#B68763] hover:text-white disabled:opacity-30 rounded-full text-[#443000] font-bold flex items-center gap-1 sm:gap-1.5 transition-all shadow-2xs shrink-0 whitespace-nowrap cursor-pointer"
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
