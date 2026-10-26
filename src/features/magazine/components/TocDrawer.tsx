'use client';

import React from 'react';
import { MagazinePageData } from '../types';

interface TocDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  pages: MagazinePageData[];
  onSelectPage: (page: number) => void;
  currentPage: number;
}

export function TocDrawer({
  isOpen,
  onClose,
  pages,
  onSelectPage,
  currentPage,
}: TocDrawerProps) {
  if (!isOpen) return null;

  // Extract distinct sections with their starting page number
  const sections: { title: string; startPage: number; count: number }[] = [];
  let currentSection = '';

  pages.forEach((p) => {
    const title = p.section_title || 'مجموعة التراث المصري';
    if (title !== currentSection) {
      currentSection = title;
      sections.push({ title, startPage: p.position, count: 1 });
    } else {
      sections[sections.length - 1].count++;
    }
  });

  return (
    <div className="fixed inset-0 z-50 flex items-stretch justify-start bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-88 max-w-[85vw] bg-white h-full shadow-2xl flex flex-col p-5 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-200">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#B68763]" />
            <h2 className="text-base font-extrabold text-[#443000]">فهرس أقسام المجلة</h2>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-600 font-bold transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Section List with Visual Thumbnails */}
        <div className="mt-4 flex flex-col gap-2.5">
          {sections.map((sec, idx) => (
            <button
              key={idx}
              onClick={() => {
                onSelectPage(sec.startPage);
                onClose();
              }}
              className="text-right p-2.5 rounded-xl border border-stone-200 hover:border-[#B68763] hover:bg-amber-50/40 transition-all flex items-center gap-3 group"
            >
              <div className="w-12 h-16 rounded-md overflow-hidden bg-stone-100 border border-stone-200 shrink-0 shadow-2xs">
                <img
                  src={`/magazine/thumbs/thumb_${sec.startPage}.webp`}
                  alt=""
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  loading="lazy"
                />
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-bold text-[#443000] text-xs sm:text-sm group-hover:text-[#B68763] transition-colors truncate">
                  {sec.title}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] text-stone-500 font-medium">
                    {sec.count} صفحة
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 bg-[#443000] text-[#B68763] rounded">
                    ص {sec.startPage}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Quick Page Jump Grid */}
        <div className="mt-6 pt-4 border-t border-stone-200">
          <p className="text-xs font-bold text-stone-500 mb-2.5">
            الانتقال السريع لجميع الصفحات ({pages.length} صفحة):
          </p>
          <div className="grid grid-cols-5 gap-1.5 max-h-64 overflow-y-auto p-1 scrollbar-thin">
            {pages.map((p) => (
              <button
                key={p.position}
                onClick={() => {
                  onSelectPage(p.position);
                  onClose();
                }}
                className={`h-8 rounded-lg text-xs font-bold transition-all ${
                  p.position === currentPage
                    ? 'bg-[#B68763] text-white shadow-xs'
                    : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                }`}
              >
                {p.position}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1" onClick={onClose} />
    </div>
  );
}
