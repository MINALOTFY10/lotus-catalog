'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { IssueSnapshot } from '../types';
import { extractProductsFromIssue } from '@/features/products/utils/extractProducts';
import { normalizeArabic } from '@/lib/format/arabic';
import { formatMagazinePrice } from '@/lib/format/price';
import { PublicProduct } from '@/features/products/types';

interface MagazineSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  issue: IssueSnapshot;
  onNavigateToPage: (pageNumber: number, cashierCode?: number | null) => void;
}

export function MagazineSearchModal({
  isOpen,
  onClose,
  issue,
  onNavigateToPage,
}: MagazineSearchModalProps) {
  const [query, setQuery] = useState('');

  const allProducts: PublicProduct[] = useMemo(() => {
    return extractProductsFromIssue(issue);
  }, [issue]);

  const results = useMemo(() => {
    const q = normalizeArabic(query);
    if (!q) return [];

    return allProducts.filter((p) => {
      const name = normalizeArabic(p.name_ar);
      const cat = normalizeArabic(p.category || '');
      const code = p.cashier_code ? String(p.cashier_code) : '';
      return name.includes(q) || cat.includes(q) || code === query.trim();
    });
  }, [allProducts, query]);

  const handleProductClick = (pageNumber?: number, cashierCode?: number | null) => {
    if (pageNumber) {
      if (cashierCode !== undefined && cashierCode !== null) {
        onNavigateToPage(pageNumber, cashierCode);
      } else {
        onNavigateToPage(pageNumber);
      }
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/45 p-3 backdrop-blur-[2px] animate-in fade-in duration-200 sm:p-6"
      dir="rtl"
      onClick={onClose}
      onKeyDown={(event) => {
        if (event.key === 'Escape') onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="magazine-search-title"
        className="flex max-h-[min(84dvh,44rem)] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-[0_24px_70px_rgba(68,48,0,0.2)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="shrink-0 border-b border-stone-200 px-4 py-4 sm:px-6 sm:py-5">
          <div className="flex items-center justify-between gap-4">
            <h2
              id="magazine-search-title"
              className="text-base font-extrabold text-[#443000] sm:text-lg"
            >
              البحث في صفحات المجلة
            </h2>
            <button
              type="button"
              aria-label="إغلاق نافذة البحث"
              onClick={onClose}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-stone-200 text-stone-500 transition-colors hover:border-stone-300 hover:bg-stone-50 hover:text-[#443000] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B68763]"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m6 6 12 12M18 6 6 18" />
              </svg>
            </button>
          </div>

          <div className="relative mt-4">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="ابحث في منتجات المجلة"
              placeholder="ابحث باسم المنتج أو الفئة أو الكود..."
              className="w-full rounded-xl border border-stone-300 bg-stone-50 py-3 pr-11 pl-4 text-sm text-stone-900 shadow-sm transition-colors placeholder:text-stone-400 focus:border-[#B68763] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#B68763]/15"
              autoFocus
            />
            <svg
              className="absolute right-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-stone-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="me-1 text-xs font-semibold text-stone-500">اقتراحات سريعة</span>
            {['عسل', 'سيراميك', 'شمع', 'فرعوني', 'نحاس'].map((tag) => (
              <button
                key={tag}
                type="button"
                aria-pressed={query === tag}
                onClick={() => setQuery(tag)}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B68763] ${
                  query === tag
                    ? 'border-[#B68763]/60 bg-[#B68763]/10 text-[#443000]'
                    : 'border-stone-200 bg-white text-stone-600 hover:border-[#B68763]/50 hover:bg-[#B68763]/10 hover:text-[#443000]'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto bg-stone-50/60 p-4 sm:p-5">
          {!query.trim() ? (
            <div className="flex min-h-48 flex-col items-center justify-center rounded-xl border border-dashed border-stone-200 bg-white px-5 py-8 text-center">
              <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#B68763]/10 text-[#8A6747]">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="m21 21-4.3-4.3m1.3-5.2a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z" />
                </svg>
              </span>
              <p className="text-sm font-bold text-stone-700">ابحث في جميع منتجات المجلة</p>
              <p className="mt-1 text-xs leading-5 text-stone-500">
                اكتب اسم المنتج أو الفئة أو الكود للوصول إلى صفحته
              </p>
            </div>
          ) : results.length === 0 ? (
            <div className="flex min-h-48 flex-col items-center justify-center rounded-xl border border-dashed border-stone-200 bg-white px-5 py-8 text-center">
              <p className="text-sm font-bold text-stone-700">
                لم يتم العثور على منتجات تطابق &quot;{query}&quot;
              </p>
              <Link
                href={`/search?q=${encodeURIComponent(query)}`}
                onClick={onClose}
                className="mt-3 text-xs font-bold text-[#8A6747] hover:underline"
              >
                فتح صفحة البحث المتقدمة
              </Link>
            </div>
          ) : (
            <div>
              <div className="mb-3 flex items-center justify-between gap-3 text-xs">
                <span className="font-bold text-stone-700">تم العثور على {results.length} منتج</span>
                <span className="text-stone-500">اضغط على المنتج لفتح صفحته</span>
              </div>

              <div className="space-y-2">
                {results.map((product) => (
                  <button
                    key={product.id || product.slug}
                    type="button"
                    onClick={() => handleProductClick(product.magazinePageNumber, product.cashier_code)}
                    className="group flex w-full items-center justify-between gap-3 rounded-xl border border-stone-200 bg-white p-3 text-right transition-colors hover:border-[#B68763]/60 hover:bg-amber-50/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B68763]"
                  >
                    <span className="flex min-w-0 items-center gap-3">
                      <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-stone-200 bg-stone-100">
                        <Image
                          src={product.primary_image_url || '/brand/lotus_logo.png'}
                          alt={product.name_ar}
                          fill
                          sizes="48px"
                          className="object-cover group-hover:scale-105 transition-transform"
                        />
                      </span>
                      <span className="min-w-0">
                        <span className="flex items-center gap-2">
                          <span className="truncate text-sm font-bold text-[#443000] transition-colors group-hover:text-[#8A6747]">
                            {product.name_ar}
                          </span>
                          {product.cashier_code && (
                            <span className="rounded bg-stone-100 px-1.5 py-0.5 font-mono text-[10px] text-stone-600">
                              #{product.cashier_code}
                            </span>
                          )}
                        </span>
                        <span className="mt-0.5 block truncate text-xs text-stone-500">
                          {product.category || 'عام'}
                        </span>
                      </span>
                    </span>

                    <span className="flex shrink-0 items-center gap-3">
                      <span className="text-left">
                        <span className="block font-mono text-xs font-extrabold text-[#443000] sm:text-sm">
                          {formatMagazinePrice(product.sale_price)}
                        </span>
                        {product.magazinePageNumber && (
                          <span className="mt-1 inline-block rounded bg-[#F3EEE8] px-2 py-0.5 text-[10px] font-bold text-[#654B35]">
                            صفحة {product.magazinePageNumber}
                          </span>
                        )}
                      </span>

                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-stone-100 text-stone-400 transition-colors group-hover:bg-[#443000] group-hover:text-white">
                        <svg className="h-4 w-4 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                        </svg>
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex shrink-0 items-center justify-between gap-3 border-t border-stone-200 bg-white px-4 py-3 text-xs font-bold sm:px-6">
          <Link
            href="/search"
            onClick={onClose}
            className="flex items-center gap-2 text-stone-600 transition-colors hover:text-[#443000]"
          >
            <span>البحث المتقدم في جميع المنتجات</span>
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
