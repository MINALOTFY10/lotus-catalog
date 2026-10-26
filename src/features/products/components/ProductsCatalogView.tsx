'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { PublicProduct } from '../types';
import { formatMagazinePrice } from '@/lib/format/price';
import { normalizeArabic } from '@/lib/format/arabic';

interface ProductsCatalogViewProps {
  initialProducts: PublicProduct[];
  categories: string[];
}

export function ProductsCatalogView({
  initialProducts,
  categories,
}: ProductsCatalogViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc'>('default');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 24;

  const filteredProducts = useMemo(() => {
    let result = [...initialProducts];

    // Category filter
    if (selectedCategory !== 'all') {
      result = result.filter((p) => p.category === selectedCategory);
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = normalizeArabic(searchQuery);
      result = result.filter((p) => {
        const name = normalizeArabic(p.name_ar);
        const code = p.cashier_code ? String(p.cashier_code) : '';
        const cat = normalizeArabic(p.category || '');
        return name.includes(q) || cat.includes(q) || code === searchQuery.trim();
      });
    }

    // Sorting
    if (sortBy === 'price-asc') {
      result.sort((a, b) => (a.sale_price || 0) - (b.sale_price || 0));
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => (b.sale_price || 0) - (a.sale_price || 0));
    }

    return result;
  }, [initialProducts, selectedCategory, searchQuery, sortBy]);

  const totalPages = Math.ceil(filteredProducts.length / pageSize) || 1;
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredProducts.slice(start, start + pageSize);
  }, [filteredProducts, currentPage, pageSize]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Title & Magazine Promo Banner */}
      <div className="bg-gradient-to-r from-[#443000] via-[#5c4205] to-[#B68763] rounded-2xl p-6 sm:p-8 text-white shadow-lg mb-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#B68763] bg-white/10 px-3 py-1 rounded-full inline-block mb-2">
            دليل الكتالوج الرسمي
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold">قائمة منتجات لوتس</h1>
          <p className="text-stone-200 text-sm mt-1 max-w-xl">
            تصفح جميع المنتجات المتوفرة، أو انتقل إلى المجلة التفاعلية لتقليب الصفحات بتصميم كانفا الأنيق.
          </p>

        </div>
        <Link
          href="/magazine"
          className="flex-shrink-0 bg-white text-[#443000] hover:bg-stone-100 font-extrabold px-6 py-3 rounded-xl shadow-md transition-all flex items-center gap-2"
        >
          <span>فتح المجلة التفاعلية</span>
          <svg className="w-4 h-4 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white rounded-xl border border-stone-200 p-4 mb-6 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search input */}
        <div className="relative flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="ابحث بالاسم، التصنيف أو كود المنتج..."
            className="w-full text-sm bg-stone-50 border border-stone-200 rounded-lg py-2.5 pl-10 pr-4 text-stone-900 placeholder-stone-400 focus:outline-hidden focus:border-[#B68763] focus:bg-white transition-all"
          />
          <svg
            className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        {/* Sort selector & Count */}
        <div className="flex items-center gap-3 justify-between md:justify-end">
          <span className="text-xs font-bold text-stone-500 whitespace-nowrap">
            {filteredProducts.length} منتج
          </span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="text-xs font-bold bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-stone-700 focus:outline-hidden focus:border-[#B68763]"
          >
            <option value="default">الترتيب: الافتراضي</option>
            <option value="price-asc">السعر: من الأقل للأعلى</option>
            <option value="price-desc">السعر: من الأعلى للأقل</option>
          </select>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 scrollbar-thin">
        <button
          onClick={() => {
            setSelectedCategory('all');
            setCurrentPage(1);
          }}
          className={`text-xs font-bold px-4 py-2 rounded-full whitespace-nowrap transition-all ${
            selectedCategory === 'all'
              ? 'bg-[#443000] text-white shadow-xs'
              : 'bg-white text-stone-700 border border-stone-200 hover:border-stone-400'
          }`}
        >
          الكل ({initialProducts.length})
        </button>
        {categories.map((cat) => {
          const count = initialProducts.filter((p) => p.category === cat).length;
          return (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                setCurrentPage(1);
              }}
              className={`text-xs font-bold px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-[#443000] text-white shadow-xs'
                  : 'bg-white text-stone-700 border border-stone-200 hover:border-stone-400'
              }`}
            >
              {cat} ({count})
            </button>
          );
        })}
      </div>

      {/* Product Grid */}
      {paginatedProducts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center my-8">
          <p className="text-base font-bold text-stone-600">لا توجد نتائج تطابق بحثك</p>
          <p className="text-xs text-stone-400 mt-1">جرب البحث بكلمة أخرى أو قم بإلغاء الفلاتر</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
            }}
            className="mt-4 text-xs font-bold bg-[#B68763] text-white px-4 py-2 rounded-lg hover:bg-[#966b4b] transition-colors"
          >
            إعادة تعيين الفلاتر
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {paginatedProducts.map((product) => (
            <div
              key={product.id || product.slug}
              className="group bg-white rounded-xl border border-stone-200 overflow-hidden shadow-2xs hover:shadow-md hover:border-[#B68763]/50 transition-all flex flex-col justify-between"
            >
              <div>
                {/* Image Container */}
                <Link
                  href={`/products/${encodeURIComponent(product.slug)}`}
                  className="block relative aspect-4/3 w-full bg-stone-100 overflow-hidden"
                >
                  <Image
                    src={product.primary_image_url}
                    alt={product.name_ar}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  {product.cashier_code && (
                    <span className="absolute top-2 right-2 bg-black/70 backdrop-blur-xs text-white text-[10px] font-mono px-2 py-0.5 rounded">
                      #{product.cashier_code}
                    </span>
                  )}
                  {product.magazinePageNumber && (
                    <span className="absolute bottom-2 left-2 bg-[#443000]/85 text-[#B68763] text-[9px] font-bold px-1.5 py-0.5 rounded">
                      صفحة {product.magazinePageNumber}
                    </span>
                  )}
                </Link>

                {/* Details */}
                <div className="p-3 sm:p-4">
                  {product.category && (
                    <span className="text-[10px] font-medium text-[#B68763] block truncate mb-1">
                      {product.category}
                    </span>
                  )}
                  <Link
                    href={`/products/${encodeURIComponent(product.slug)}`}
                    className="block font-bold text-sm text-[#443000] hover:text-[#B68763] transition-colors line-clamp-2 min-h-[2.5rem]"
                    title={product.name_ar}
                  >
                    {product.name_ar}
                  </Link>

                  {/* Price Block */}
                  <div className="mt-3 pt-2 border-t border-stone-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-[#B68763]">السعر</span>
                    <span className="font-extrabold font-mono text-sm sm:text-base text-[#443000]">
                      {formatMagazinePrice(product.sale_price)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="p-3 pt-0 flex items-center gap-1.5">
                <Link
                  href={`/products/${encodeURIComponent(product.slug)}`}
                  className="flex-1 text-center text-xs font-bold bg-stone-100 hover:bg-stone-200 text-stone-800 py-1.5 rounded-lg transition-colors"
                >
                  تفاصيل
                </Link>
                {product.magazinePageNumber && (
                  <Link
                    href={`/magazine?p=${product.magazinePageNumber}`}
                    className="text-center text-xs font-bold bg-[#B68763]/15 hover:bg-[#B68763]/25 text-[#443000] px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                    title={`عرض في المجلة (صفحة ${product.magazinePageNumber})`}
                  >
                    <span>المجلة</span>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="mt-10 flex items-center justify-center gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1.5 text-xs font-bold bg-white border border-stone-200 rounded-lg text-stone-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-stone-50 transition-colors"
          >
            السابق
          </button>
          <span className="text-xs font-bold text-stone-600 px-3">
            صفحة {currentPage} من {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-3 py-1.5 text-xs font-bold bg-white border border-stone-200 rounded-lg text-stone-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-stone-50 transition-colors"
          >
            التالي
          </button>
        </div>
      )}
    </div>
  );
}
