'use client';

import React from 'react';
import { MagazinePageData, ProductData } from '../types';
import { ShowcaseHoneyPage } from './ShowcaseHoneyPage';
import { ShowcaseFoodPage } from './ShowcaseFoodPage';
import { Grid3x3Page } from './Grid3x3Page';
import { Grid2x3Page } from './Grid2x3Page';
import { GridCustomPage } from './GridCustomPage';

interface MagazinePageRendererProps {
  page: MagazinePageData;
  isInteractive?: boolean;
  highlightedCode?: number | null;
  onProductClick?: (product: ProductData) => void;
}

export function MagazinePageRenderer({
  page,
  isInteractive = true,
  highlightedCode,
  onProductClick,
}: MagazinePageRendererProps) {
  const pageNumber = page.position || page.pageNumber;
  const sectionTitle = page.section_title || page.sectionTitle;
  const slots = page.slots || [];
  const template = page.template;

  switch (template) {
    case 'showcase-honey':
      return (
        <ShowcaseHoneyPage
          slots={slots}
          pageNumber={pageNumber}
          sectionTitle={sectionTitle}
          isInteractive={isInteractive}
          highlightedCode={highlightedCode}
          onProductClick={onProductClick}
        />
      );

    case 'showcase-food':
      return (
        <ShowcaseFoodPage
          slots={slots}
          pageNumber={pageNumber}
          sectionTitle={sectionTitle}
          isInteractive={isInteractive}
          highlightedCode={highlightedCode}
          onProductClick={onProductClick}
        />
      );

    case 'grid2x3':
      return (
        <Grid2x3Page
          slots={slots}
          pageNumber={pageNumber}
          sectionTitle={sectionTitle}
          isInteractive={isInteractive}
          highlightedCode={highlightedCode}
          onProductClick={onProductClick}
        />
      );

    case 'grid2x2':
    case 'hero-split':
    case 'grid-custom':
      return (
        <GridCustomPage
          slots={slots}
          pageNumber={pageNumber}
          sectionTitle={sectionTitle}
          template={template}
          isInteractive={isInteractive}
          highlightedCode={highlightedCode}
          onProductClick={onProductClick}
        />
      );

    case 'grid3x3':
    default:
      return (
        <Grid3x3Page
          slots={slots}
          pageNumber={pageNumber}
          sectionTitle={sectionTitle}
          isInteractive={isInteractive}
          highlightedCode={highlightedCode}
          onProductClick={onProductClick}
        />
      );
  }
}
