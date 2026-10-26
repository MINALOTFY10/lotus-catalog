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
    <div className="fixed inset-0 z-50 flex items-stretch justify-start bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="w-80 max-w-[85vw] bg-white h-full shadow-2xl flex flex-col p-6 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-200">
          <h2 className="text-lg font-bold text-[#443000]">فهرس المجلة</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-600 font-bold"
          >
            ✕
          </button>
        </div>

        {/* Section List */}
        <div className="mt-4 flex flex-col gap-2">
          {sections.map((sec, idx) => (
            <button
              key={idx}
              onClick={() => {
                onSelectPage(sec.startPage);
                onClose();
              }}
              className="text-right p-3 rounded-lg border border-stone-100 hover:border-[#B68763] hover:bg-stone-50 transition-all flex items-center justify-between"
            >
              <div>
                <p className="font-bold text-[#443000] text-sm">{sec.title}</p>
                <p className="text-xs text-stone-500 mt-0.5">{sec.count} صفحة</p>
              </div>
              <span className="text-xs font-semibold px-2 py-1 bg-stone-100 rounded text-[#B68763]">
                ص {sec.startPage}
              </span>
            </button>
          ))}
        </div>

        {/* Quick Page Jump Grid */}
        <div className="mt-8 pt-4 border-t border-stone-200">
          <p className="text-xs font-bold text-stone-400 mb-3">انتقال سريع للصفحات</p>
          <div className="grid grid-cols-5 gap-1.5">
            {pages.map((p) => (
              <button
                key={p.position}
                onClick={() => {
                  onSelectPage(p.position);
                  onClose();
                }}
                className={`h-8 rounded text-xs font-bold transition-all ${
                  p.position === currentPage
                    ? 'bg-[#B68763] text-white'
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
