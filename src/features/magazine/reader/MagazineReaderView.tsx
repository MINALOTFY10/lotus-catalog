'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { IssueSnapshot } from '../types';
import { FlipbookClient } from './FlipbookClient';
import { CanvaMagazinePage } from '../components/CanvaMagazinePage';
import { TocDrawer } from '../components/TocDrawer';
import { ListViewGrid } from '../components/ListViewGrid';
import { MagazineSearchModal } from '../components/MagazineSearchModal';

interface MagazineReaderViewProps {
  initialIssue: IssueSnapshot;
  initialPage: number;
}

export function MagazineReaderView({
  initialIssue,
  initialPage,
}: MagazineReaderViewProps) {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState<number>(initialPage);
  const [isTocOpen, setIsTocOpen] = useState<boolean>(false);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'flipbook' | 'list'>('flipbook');

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    // Sync URL without full page reload
    window.history.replaceState(null, '', `?p=${newPage}`);
  };

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col">
      {/* Top Reader Navbar */}
      <nav className="w-full bg-white border-b border-stone-200 px-4 sm:px-6 py-3 flex items-center justify-between sticky top-0 z-40 shadow-xs">
        <div className="flex items-center gap-3">
          <img src="/brand/lotus_logo.png" alt="لوتس" className="h-9 w-auto object-contain" />
          <span className="font-extrabold text-[#443000] text-base hidden sm:inline">
            قائمة أسعار لوتس
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* In-Magazine Search Button */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100/80 border border-[#B68763]/40 text-xs font-bold text-[#443000] flex items-center gap-1.5 transition-all shadow-2xs"
            title="بحث في المجلة"
          >
            <svg className="w-3.5 h-3.5 text-[#B68763]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span>بحث في المجلة</span>
          </button>

          {/* Table of contents button */}
          <button
            onClick={() => setIsTocOpen(true)}
            className="px-3 py-1.5 rounded-xl border border-stone-300 hover:border-[#B68763] text-xs font-bold text-[#443000] flex items-center gap-1.5 transition-all"
          >
            <span>📑</span>
            <span>الفهرس</span>
          </button>

          {/* View mode toggle */}
          <button
            onClick={() => setViewMode(viewMode === 'flipbook' ? 'list' : 'flipbook')}
            className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-xs font-bold text-[#443000] flex items-center gap-1.5 transition-all"
          >
            <span>{viewMode === 'flipbook' ? '📜 عرض القائمة' : '📖 عرض المجلة'}</span>
          </button>
        </div>
      </nav>

      {/* Main Reader View */}
      <main className="flex-1 flex flex-col items-center justify-center">
        {viewMode === 'flipbook' ? (
          <FlipbookClient initialPage={currentPage} onPageChange={handlePageChange}>
            {initialIssue.pages.map((pageData) => (
              <CanvaMagazinePage
                key={pageData.position}
                pageNumber={pageData.position}
                sectionTitle={pageData.section_title}
                priority={pageData.position <= 4}
              />
            ))}
          </FlipbookClient>
        ) : (
          <ListViewGrid
            pages={initialIssue.pages}
            onSelectPage={(targetPage) => {
              setCurrentPage(targetPage);
              setViewMode('flipbook');
              handlePageChange(targetPage);
            }}
          />
        )}
      </main>

      {/* Table of Contents Drawer */}
      <TocDrawer
        isOpen={isTocOpen}
        onClose={() => setIsTocOpen(false)}
        pages={initialIssue.pages}
        currentPage={currentPage}
        onSelectPage={(page) => {
          setCurrentPage(page);
          handlePageChange(page);
        }}
      />

      {/* In-Magazine Search Modal */}
      <MagazineSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        issue={initialIssue}
        onNavigateToPage={(targetPage) => {
          setCurrentPage(targetPage);
          handlePageChange(targetPage);
        }}
      />
    </div>
  );
}
