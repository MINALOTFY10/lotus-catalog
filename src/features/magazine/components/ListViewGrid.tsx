'use client';

import React from 'react';
import { MagazinePageData } from '../types';

import { MagazinePagePreview } from './MagazinePagePreview';

interface ListViewGridProps {
  pages: MagazinePageData[];
  onSelectPage?: (page: number) => void;
}

export function ListViewGrid({ pages, onSelectPage }: ListViewGridProps) {
  return (
    <div className="w-full max-w-6xl mx-auto py-5 sm:py-8 px-3 sm:px-4 flex flex-col gap-6 sm:gap-8 min-w-0">
      <div className="flex items-start sm:items-center justify-between gap-3 pb-4 border-b border-stone-200">
        <div className="min-w-0 flex-1">
          <h1 className="text-lg sm:text-2xl font-extrabold text-[#443000] leading-snug">
            تصفح جميع صفحات المجلة
          </h1>
          <p className="text-xs text-stone-500 mt-1 leading-normal">
            اضغط على أي صفحة لفتحها في القارئ التفاعلي ثلاثي الأبعاد
          </p>
        </div>
        <span className="shrink-0 whitespace-nowrap text-xs font-bold px-3 py-1.5 bg-[#443000] text-[#B68763] rounded-full shadow-2xs">
          {pages.length} صفحة
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6 sm:gap-8">
        {pages.map((page, index) => (
          <div
            key={page.position}
            onClick={() => onSelectPage?.(page.position)}
            className="group cursor-pointer bg-white rounded-2xl p-3 shadow-md hover:shadow-2xl border border-stone-200 hover:border-[#B68763] transition-all duration-300 flex flex-col animate-card-rise"
            style={{
              animationDelay: `calc(${Math.min(index, 12)} * 0.04s + 0.08s)`,
            }}
          >
            <div className="relative w-full aspect-[595.5/945] overflow-hidden rounded-xl bg-stone-100 border border-stone-200/60 shadow-inner group-hover:scale-102 transition-transform duration-300">
              <div className="w-full h-full pointer-events-none select-none">
                <MagazinePagePreview page={page} />
              </div>
              <div className="absolute top-2.5 right-2.5 px-2.5 py-1 bg-black/60 backdrop-blur-xs text-white text-[11px] font-bold rounded-lg shadow-sm z-20 shrink-0 whitespace-nowrap">
                صفحة {page.position}
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between px-1 gap-2">
              <span className="text-xs font-bold text-[#443000] truncate min-w-0 flex-1">
                {page.section_title || 'مجموعة التراث المصري'}
              </span>
              <span className="text-[11px] font-semibold text-[#B68763] group-hover:underline shrink-0 whitespace-nowrap">
                فتح في المجلة ←
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
