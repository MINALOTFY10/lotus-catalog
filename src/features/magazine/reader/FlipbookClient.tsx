'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { PageFlip } from 'page-flip';

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
  const containerRef = useRef<HTMLDivElement>(null);
  const bookRef = useRef<PageFlip | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(initialPage);
  const [totalPages, setTotalPages] = useState<number>(children.length);
  const [isReady, setIsReady] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Initialize PageFlip instance
  useEffect(() => {
    if (!containerRef.current) return;

    // Clean up previous instance if any
    if (bookRef.current) {
      bookRef.current.destroy();
      bookRef.current = null;
    }

    try {
      const pageFlip = new PageFlip(containerRef.current, {
        width: 595,
        height: 842,
        size: 'stretch',
        minWidth: 320,
        maxWidth: 1200,
        minHeight: 450,
        maxHeight: 1700,
        maxShadowOpacity: 0.5,
        showCover: true,
        usePortrait: true,
        startPage: Math.max(0, initialPage - 1),
        drawShadow: true,
        flippingTime: 650,
        useMouseEvents: true,
        mobileScrollSupport: false,
      });

      // Load children elements as pages
      const pageElements = containerRef.current.querySelectorAll<HTMLElement>('.page-item');
      if (pageElements.length > 0) {
        pageFlip.loadFromHTML(pageElements);
        setTotalPages(pageFlip.getPageCount());

        pageFlip.on('flip', (e) => {
          const newPage = e.data + 1;
          setCurrentPage(newPage);
          if (onPageChange) {
            onPageChange(newPage);
          }
        });

        bookRef.current = pageFlip;
        setIsReady(true);
      }
    } catch (err) {
      console.error('Error initializing flipbook:', err);
    }

    return () => {
      if (bookRef.current) {
        bookRef.current.destroy();
        bookRef.current = null;
      }
    };
  }, []);

  const flipNext = useCallback(() => {
    if (bookRef.current) {
      bookRef.current.flipNext('top');
    }
  }, []);

  const flipPrev = useCallback(() => {
    if (bookRef.current) {
      bookRef.current.flipPrev('top');
    }
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

  return (
    <div
      ref={wrapperRef}
      className={`relative w-full flex flex-col items-center justify-center ${
        isFullscreen ? 'h-screen bg-stone-900 py-4' : 'min-h-[85vh] py-6'
      }`}
    >
      {/* Top Floating Control Bar */}
      <div className="z-30 mb-4 px-4 py-2 bg-white/95 backdrop-blur shadow-md rounded-full border border-stone-200 flex items-center gap-4 text-xs font-medium">
        {/* Previous page (in Arabic RTL, prev advances to left/next page) */}
        <button
          onClick={flipNext}
          disabled={currentPage >= totalPages}
          className="px-3 py-1 bg-stone-100 hover:bg-stone-200 disabled:opacity-30 rounded-full text-[#443000] font-bold flex items-center gap-1 transition-all"
        >
          <span>التالي</span>
          <span>←</span>
        </button>

        {/* Page counter */}
        <span className="font-bold text-[#443000] px-2" dir="rtl">
          صفحة {currentPage} من {totalPages}
        </span>

        {/* Next page (in Arabic RTL, next goes back to right) */}
        <button
          onClick={flipPrev}
          disabled={currentPage <= 1}
          className="px-3 py-1 bg-stone-100 hover:bg-stone-200 disabled:opacity-30 rounded-full text-[#443000] font-bold flex items-center gap-1 transition-all"
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

      {/* The Flipbook Stage */}
      <div className="w-full max-w-[1240px] flex items-center justify-center overflow-hidden">
        <div
          ref={containerRef}
          className="w-full drop-shadow-2xl transition-opacity duration-300"
          style={{
            opacity: isReady ? 1 : 0.4,
            minHeight: '600px',
          }}
        >
          {children.map((child, index) => (
            <div
              key={index}
              className="page-item w-full h-full overflow-hidden bg-[#EFEFEF]"
              data-density={index === 0 || index === children.length - 1 ? 'hard' : 'soft'}
            >
              {child}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
