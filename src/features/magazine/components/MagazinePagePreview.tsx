'use client';

import React from 'react';
import { MagazinePageData } from '../types';
import { HoneyShowcasePage } from './HoneyShowcasePage';
import { BasketsShowcasePage } from './BasketsShowcasePage';
import { OliveDatesPage } from './OliveDatesPage';
import { OliveShowcasePage } from './OliveShowcasePage';
import { Grid3x3Page } from './Grid3x3Page';

interface MagazinePagePreviewProps {
  page: MagazinePageData;
  className?: string;
}

export function MagazinePagePreview({ page, className = '' }: MagazinePagePreviewProps) {
  return (
    <div
      className={`w-full h-full relative overflow-hidden select-none pointer-events-none ${className}`}
      aria-label={`معاينة صفحة ${page.position}`}
    >
      {page.position === 1 ? (
        <HoneyShowcasePage pageNumber={1} />
      ) : page.position === 2 ? (
        <BasketsShowcasePage pageNumber={2} />
      ) : page.position === 3 ? (
        <OliveDatesPage pageNumber={3} />
      ) : page.position === 4 ? (
        <OliveDatesPage pageNumber={4} />
      ) : page.position === 5 ? (
        <OliveShowcasePage pageNumber={5} />
      ) : (
        <Grid3x3Page
          pageNumber={page.position}
          sectionTitle={page.section_title}
          slots={page.slots}
          isInteractive={false}
        />
      )}
    </div>
  );
}
