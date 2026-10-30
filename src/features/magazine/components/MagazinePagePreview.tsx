'use client';

import React from 'react';
import { MagazinePageData } from '../types';
import { MagazinePageRenderer } from './MagazinePageRenderer';

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
      <MagazinePageRenderer page={page} isInteractive={false} />
    </div>
  );
}
