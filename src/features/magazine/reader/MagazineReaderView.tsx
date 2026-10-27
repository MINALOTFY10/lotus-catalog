'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { IssueSnapshot } from '../types';
import { FlipbookClient } from './FlipbookClient';
import { HoneyShowcasePage } from '../components/HoneyShowcasePage';
import { BasketsShowcasePage } from '../components/BasketsShowcasePage';
import { OliveDatesPage } from '../components/OliveDatesPage';
import { Grid3x3Page } from '../components/Grid3x3Page';
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
    <div className="min-h-screen bg-[#F3F4F7] flex flex-col">
      {/* Top Reader Navbar */}
      <nav className="w-full bg-white border-b border-stone-200 px-4 sm:px-6 py-3 flex items-center justify-between sticky top-0 z-40 shadow-xs">
        <div className="mr-5 flex items-center gap-3">
          <div className="relative h-12 w-12 flex-shrink-0">
            <Image
              src="/brand/lotus_logo.png"
              alt="شعار لوتس"
              fill
              sizes="48px"
              className="object-contain"
              priority
            />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-extrabold tracking-tight text-[#443000] sm:text-2xl">
              لوتس
            </span>
            <span className="-mt-1 text-[10px] font-medium tracking-wider text-stone-500">
              كتالوج المنتجات اليدوية والتراثية
            </span>
          </div>
        </div>

        {/* Action Controls - Unified Luxury Toolbar */}
        <div className="flex items-center gap-1.5 sm:gap-2 bg-stone-100/80 p-1 rounded-2xl border border-stone-200/70">
          {/* In-Magazine Search Button */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="px-3 sm:px-3.5 py-1.5 rounded-xl bg-white hover:bg-amber-50/60 border border-stone-200/80 hover:border-[#B68763]/50 text-xs font-bold text-[#443000] hover:text-[#B68763] flex items-center gap-2 transition-all duration-200 shadow-2xs group"
            title="بحث في المجلة"
          >
            <svg
              className="w-3.5 h-3.5 text-[#B68763] group-hover:scale-110 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth="2.2"
            >
              <circle cx="11" cy="11" r="7" />
              <path strokeLinecap="round" d="m20 20-3.5-3.5" />
            </svg>
            <span>بحث في المجلة</span>
          </button>

          {/* Table of contents button */}
          <button
            onClick={() => setIsTocOpen(true)}
            className="px-3 sm:px-3.5 py-1.5 rounded-xl hover:bg-white text-xs font-bold text-[#443000] hover:text-[#B68763] hover:shadow-2xs border border-transparent hover:border-stone-200/80 flex items-center gap-2 transition-all duration-200 group"
            title="فهرس المجلة"
          >
            <svg
              className="w-3.5 h-3.5 text-stone-500 group-hover:text-[#B68763] transition-colors"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth="2"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h10M4 18h16" />
            </svg>
            <span>الفهرس</span>
          </button>

          {/* View mode toggle */}
          <button
            onClick={() => setViewMode(viewMode === 'flipbook' ? 'list' : 'flipbook')}
            className="px-3 sm:px-3.5 py-1.5 rounded-xl hover:bg-white text-xs font-bold text-[#443000] hover:text-[#B68763] hover:shadow-2xs border border-transparent hover:border-stone-200/80 flex items-center gap-2 transition-all duration-200 group"
            title={viewMode === 'flipbook' ? 'عرض القائمة' : 'عرض المجلة'}
          >
            {viewMode === 'flipbook' ? (
              <>
                <svg
                  className="w-3.5 h-3.5 text-stone-500 group-hover:text-[#B68763] transition-colors"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                >
                  <rect x="3" y="3" width="7" height="7" rx="1.5" />
                  <rect x="14" y="3" width="7" height="7" rx="1.5" />
                  <rect x="14" y="14" width="7" height="7" rx="1.5" />
                  <rect x="3" y="14" width="7" height="7" rx="1.5" />
                </svg>
                <span>عرض القائمة</span>
              </>
            ) : (
              <>
                <svg
                  className="w-3.5 h-3.5 text-stone-500 group-hover:text-[#B68763] transition-colors"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <span>عرض المجلة</span>
              </>
            )}
          </button>
        </div>
      </nav>

      {/* Main Reader View */}
      <main className="flex-1 flex flex-col items-center justify-center">
        {viewMode === 'flipbook' ? (
          <FlipbookClient initialPage={currentPage} onPageChange={handlePageChange}>
            {initialIssue.pages.map((pageData) => {
              if (pageData.position === 1) {
                return <HoneyShowcasePage key={pageData.position} pageNumber={1} />;
              }
              if (pageData.position === 2) {
                return <BasketsShowcasePage key={pageData.position} pageNumber={2} />;
              }
              if (pageData.position >= 3 && pageData.position <= 5) {
                return (
                  <OliveDatesPage
                    key={pageData.position}
                    pageNumber={pageData.position}
                  />
                );
              }
              return (
                <Grid3x3Page
                  key={pageData.position}
                  pageNumber={pageData.position}
                  sectionTitle={pageData.section_title}
                  slots={pageData.slots}
                  isInteractive={true}
                />
              );
            })}
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
