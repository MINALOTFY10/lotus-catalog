'use client';

import { useEffect, useRef } from 'react';
import { MagazinePageData } from '../types';

const BRAND_PRELOAD_ASSETS = [
  '/brand/lotus_logo.png',
  '/brand/fund_seal_header.webp',
  '/brand/canva_golden_branch.webp',
  '/magazine/brand_cards/na7la_brand_badge.webp',
  '/magazine/brand_cards/nakhla_brand_badge.webp',
  '/magazine/brand_cards/waj_brand_badge.webp',
  '/magazine/brand_cards/honey_eco_badge.webp',
  '/magazine/brand_cards/food_eco_badge.webp',
];

/**
 * Intelligent Image Preloader for Lotus Catalog Magazine.
 * 
 * Automatically pre-fetches images in advance into the browser cache:
 * 1. Preloads common brand badges and headers on initial mount.
 * 2. Preloads the current visible spread with priority.
 * 3. Proactively preloads adjacent spreads (next 2 spreads ahead, previous spread behind)
 *    during browser idle time so page flips are completely instantaneous with 0ms delay.
 */
export function useMagazinePreload(pages: MagazinePageData[], currentPage: number) {
  const preloadedUrls = useRef<Set<string>>(new Set());

  // Helper to safely trigger browser image prefetch
  const preloadImage = (url: string) => {
    if (!url || preloadedUrls.current.has(url)) return;
    preloadedUrls.current.add(url);

    const img = new Image();
    img.decoding = 'async';
    img.src = url;
  };

  // Helper to extract image URLs from a page
  const getPageImages = (page: MagazinePageData): string[] => {
    const urls: string[] = [];
    if (!page?.slots) return urls;

    for (const slot of page.slots) {
      const url = slot.image_override || slot.product?.primary_image_url;
      if (url) {
        urls.push(url);
      }
    }
    return urls;
  };

  // 1. Initial mount: Preload brand assets and the first 2 spreads (Pages 1-4)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Preload brand assets
    BRAND_PRELOAD_ASSETS.forEach(preloadImage);

    // Preload initial pages
    const initialPages = pages.filter((p) => (p.position || p.pageNumber) <= 4);
    for (const p of initialPages) {
      for (const url of getPageImages(p)) {
        preloadImage(url);
      }
    }
  }, [pages]);

  // 2. On currentPage change: Preload adjacent pages (next 2 spreads + previous spread)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const currentSpreadStart = Math.floor((currentPage - 1) / 2) * 2 + 1;
    // Spread window: current spread + next 2 spreads (ahead by 4 pages) + 1 spread behind (2 pages)
    const minPage = Math.max(1, currentSpreadStart - 2);
    const maxPage = Math.min(pages.length, currentSpreadStart + 5);

    const targetPages = pages.filter((p) => {
      const pos = p.position || p.pageNumber;
      return pos >= minPage && pos <= maxPage;
    });

    const urlsToPreload: string[] = [];
    for (const p of targetPages) {
      urlsToPreload.push(...getPageImages(p));
    }

    // Schedule preloading during idle time to never block animations
    const scheduleLoad = () => {
      urlsToPreload.forEach(preloadImage);
    };

    if ('requestIdleCallback' in window) {
      const handle = (window as unknown as { requestIdleCallback: (cb: () => void) => number }).requestIdleCallback(scheduleLoad);
      return () => {
        if ('cancelIdleCallback' in window) {
          (window as unknown as { cancelIdleCallback: (id: number) => void }).cancelIdleCallback(handle);
        }
      };
    } else {
      const timeoutId = setTimeout(scheduleLoad, 50);
      return () => clearTimeout(timeoutId);
    }
  }, [currentPage, pages]);
}
