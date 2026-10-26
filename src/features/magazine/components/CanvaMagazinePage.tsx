'use client';

import React from 'react';

interface CanvaMagazinePageProps {
  pageNumber: number;
  sectionTitle?: string | null;
  priority?: boolean;
}

export function CanvaMagazinePage({
  pageNumber,
  sectionTitle,
  priority = false,
}: CanvaMagazinePageProps) {
  const pageSrc = `/magazine/pages/page_${pageNumber}.webp`;

  return (
    <div
      className="magazine-page-container w-full h-full relative select-none bg-white overflow-hidden flex items-center justify-center shadow-lg"
      style={{
        aspectRatio: '595.5 / 842.25',
      }}
    >
      {/* Exact Canva High-Definition Page Render */}
      <img
        src={pageSrc}
        alt={`صفحة ${pageNumber} ${sectionTitle ? `- ${sectionTitle}` : ''}`}
        className="w-full h-full object-contain pointer-events-none block"
        loading={priority ? 'eager' : 'lazy'}
      />

      {/* Subtle corner page curl indicator for realism */}
      <div className="absolute bottom-0 right-0 w-8 h-8 pointer-events-none bg-gradient-to-tl from-black/10 via-transparent to-transparent opacity-40" />
    </div>
  );
}
