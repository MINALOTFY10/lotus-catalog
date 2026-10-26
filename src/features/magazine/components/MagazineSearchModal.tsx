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
  onNavigateToPage: (pageNumber: number) => void;
}

export function MagazineSearchModal({
  isOpen,
  onClose,
  issue,
  onNavigateToPage,
}: MagazineSearchModalProps) {
  if (!isOpen) return null;

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

  const handleProductClick = (pageNumber?: number) => {
    if (pageNumber) {
      onNavigateToPage(pageNumber);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-stone-200 w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col mt-8 sm:mt-12">
        {/* Search Input Header */}
        <div className="p-4 sm:p-5 border-b border-stone-200 bg-stone-50/70">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#B68763]"></span>
              <h3 className="font-extrabold text-sm sm:text-base text-[#443000]">
                البحث السريع في صفحات المجلة
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-200/60 transition-colors"
            >
              ✕
            </button>
          </div>

          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ابحث باسم المنتج (عسل، فخار، كليم) أو الكود (#)..."
              className="w-full text-sm bg-white border border-stone-300 focus:border-[#B68763] rounded-2xl py-3 pr-11 pl-4 text-stone-900 placeholder-stone-400 focus:outline-hidden shadow-xs transition-all"
              autoFocus
            />
            <svg
              className="w-5 h-5 absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Quick Filter Tags */}
          <div className="flex items-center gap-1.5 mt-2.5 overflow-x-auto scrollbar-thin text-xs">
            <span className="text-stone-400 text-[11px] whitespace-nowrap">اقتراحات:</span>
            {['عسل', 'فخار', 'سرسوع', 'إكسسوار', 'طقم', 'شمع'].map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setQuery(tag)}
                className="bg-white hover:bg-[#B68763]/20 hover:text-[#443000] text-stone-600 px-2.5 py-1 rounded-full border border-stone-200 transition-colors whitespace-nowrap text-[11px] font-medium"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Results Body */}
        <div className="flex-1 overflow-y-auto p-4 divide-y divide-stone-100">
          {!query.trim() ? (
            <div className="py-12 text-center text-stone-400 text-xs">
              <p className="font-bold text-stone-600 mb-1">ابحث في جميع منتجات المجلة</p>
              <p>اضغط على أي منتج للانتقال فوراً لصفحته في المجلة</p>
            </div>
          ) : results.length === 0 ? (
            <div className="py-12 text-center text-stone-500 text-xs">
              <p className="font-bold text-stone-700">لم يتم العثور على منتجات تطابق "{query}"</p>
              <Link
                href={`/search?q=${encodeURIComponent(query)}`}
                onClick={onClose}
                className="inline-block mt-3 text-xs font-bold text-[#B68763] hover:underline"
              >
                فتح صفحة البحث المتقدمة ←
              </Link>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between pb-2 mb-2 text-xs font-bold text-stone-500">
                <span>تم العثور على {results.length} منتج:</span>
                <span className="text-[11px] text-[#B68763]">اضغط على المنتج لفتح صفحته</span>
              </div>

              <div className="space-y-2">
                {results.map((product) => (
                  <div
                    key={product.id || product.slug}
                    onClick={() => handleProductClick(product.magazinePageNumber)}
                    className="p-2.5 rounded-xl border border-stone-200/80 hover:border-[#B68763] hover:bg-amber-50/40 cursor-pointer transition-all flex items-center justify-between gap-3 group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-stone-100 flex-shrink-0 border border-stone-200">
                        <Image
                          src={product.primary_image_url || '/brand/lotus_logo.png'}
                          alt={product.name_ar}
                          fill
                          sizes="48px"
                          className="object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-xs sm:text-sm text-[#443000] truncate group-hover:text-[#B68763] transition-colors">
                            {product.name_ar}
                          </h4>
                          {product.cashier_code && (
                            <span className="text-[10px] font-mono bg-stone-100 text-stone-600 px-1.5 py-0.2 rounded">
                              #{product.cashier_code}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-stone-500 truncate mt-0.5">
                          {product.category || 'عام'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className="text-left">
                        <div className="font-extrabold font-mono text-xs sm:text-sm text-[#443000]">
                          {formatMagazinePrice(product.sale_price)}
                        </div>
                        {product.magazinePageNumber && (
                          <span className="inline-block text-[10px] font-bold bg-[#443000] text-[#B68763] px-2 py-0.5 rounded mt-0.5">
                            صفحة {product.magazinePageNumber}
                          </span>
                        )}
                      </div>

                      <div className="w-7 h-7 rounded-full bg-stone-100 group-hover:bg-[#443000] group-hover:text-white flex items-center justify-center text-stone-400 transition-colors">
                        <svg className="w-3.5 h-3.5 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Link to Full Search */}
        <div className="p-3 bg-stone-50 border-t border-stone-200 flex items-center justify-between text-xs font-bold">
          <Link
            href="/search"
            onClick={onClose}
            className="text-stone-600 hover:text-[#443000] flex items-center gap-1 transition-colors"
          >
            <span>فتح صفحة البحث المتقدم الكاملة</span>
            <svg className="w-3.5 h-3.5 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="text-stone-400 hover:text-stone-700"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
}
