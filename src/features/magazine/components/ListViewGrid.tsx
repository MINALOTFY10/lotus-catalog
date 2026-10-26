'use client';

import React from 'react';
import { MagazinePageData } from '../types';

interface ListViewGridProps {
  pages: MagazinePageData[];
  onSelectPage?: (page: number) => void;
}

export function ListViewGrid({ pages, onSelectPage }: ListViewGridProps) {
  return (
    <div className="w-full max-w-6xl mx-auto py-8 px-4 flex flex-col gap-8">
      <div className="flex items-center justify-between pb-4 border-b border-stone-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#443000]">
            تصفح جميع صفحات المجلة
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            اضغط على أي صفحة لفتحها في القارئ التفاعلي ثلاثي الأبعاد
          </p>
        </div>
        <span className="text-xs font-bold px-3 py-1.5 bg-[#443000] text-[#B68763] rounded-full">
          {pages.length} صفحة
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-8">
        {pages.map((page) => (
          <div
            key={page.position}
            onClick={() => onSelectPage?.(page.position)}
            className="group cursor-pointer bg-white rounded-2xl p-3 shadow-md hover:shadow-2xl border border-stone-200 hover:border-[#B68763] transition-all duration-300 flex flex-col"
          >
            <div className="relative w-full aspect-[595.5/842.25] overflow-hidden rounded-xl bg-stone-100 border border-stone-200/60 shadow-inner">
              <img
                src={`/magazine/pages/page_${page.position}.webp`}
                alt={`صفحة ${page.position}`}
                className="w-full h-full object-contain group-hover:scale-102 transition-transform duration-300"
                loading="lazy"
              />
              <div className="absolute top-2.5 right-2.5 px-2.5 py-1 bg-black/60 backdrop-blur-xs text-white text-[11px] font-bold rounded-lg shadow-sm">
                صفحة {page.position}
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between px-1">
              <span className="text-xs font-bold text-[#443000] truncate">
                {page.section_title || 'مجموعة التراث المصري'}
              </span>
              <span className="text-[11px] font-semibold text-[#B68763] group-hover:underline">
                فتح في المجلة ←
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
