'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { IssueSnapshot } from '../services/publishIssue';
import { FlipbookClient } from './FlipbookClient';
import { Grid3x3Page } from '../components/Grid3x3Page';
import { TocDrawer } from '../components/TocDrawer';
import { ListViewGrid } from '../components/ListViewGrid';

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
  const [viewMode, setViewMode] = useState<'flipbook' | 'list'>('flipbook');

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    // Sync URL without full page reload
    window.history.replaceState(null, '', `/magazine?p=${newPage}`);
  };

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col">
      {/* Top Reader Navbar */}
      <nav className="w-full bg-white border-b border-stone-200 px-6 py-3 flex items-center justify-between sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-4">
          <img src="/brand/lotus_logo.png" alt="لوتس" className="h-9 w-auto object-contain" />
          <span className="font-extrabold text-[#443000] text-base hidden sm:inline">
            قائمة أسعار لوتس A4
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          {/* Table of contents button */}
          <button
            onClick={() => setIsTocOpen(true)}
            className="px-3.5 py-1.5 rounded-lg border border-stone-300 hover:border-[#B68763] text-xs font-bold text-[#443000] flex items-center gap-1.5 transition-all"
          >
            <span>📑</span>
            <span>الفهرس</span>
          </button>

          {/* View mode toggle */}
          <button
            onClick={() => setViewMode(viewMode === 'flipbook' ? 'list' : 'flipbook')}
            className="px-3.5 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-xs font-bold text-[#443000] flex items-center gap-1.5 transition-all"
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
              <Grid3x3Page
                key={pageData.position}
                pageNumber={pageData.position}
                sectionTitle={pageData.section_title}
                slots={pageData.slots}
                isInteractive={true}
              />
            ))}
          </FlipbookClient>
        ) : (
          <ListViewGrid pages={initialIssue.pages} />
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
    </div>
  );
}
