'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { PublicProduct } from '../types';
import { formatMagazinePrice } from '@/lib/format/price';
import { normalizeArabic } from '@/lib/format/arabic';

interface SearchClientViewProps {
  initialProducts: PublicProduct[];
  initialQuery?: string;
}

export function SearchClientView({
  initialProducts,
  initialQuery = '',
}: SearchClientViewProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);

  const results = useMemo(() => {
    const q = normalizeArabic(query);
    if (!q) return [];

    return initialProducts.filter((p) => {
      const name = normalizeArabic(p.name_ar);
      const cat = normalizeArabic(p.category || '');
      const code = p.cashier_code ? String(p.cashier_code) : '';
      return name.includes(q) || cat.includes(q) || code === query.trim();
    });
  }, [initialProducts, query]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Search Header Form */}
      <div className="max-w-3xl mx-auto text-center mb-10">
        <h1 className="text-2xl sm:text-4xl font-extrabold text-[#443000] mb-3">
          البحث في كتالوج لوتس
        </h1>
        <p className="text-stone-500 text-sm mb-6">
          ابحث عن أي منتج باسمه، تصنيفه، أو برقم الكود المعتمد في المجلة
        </p>

        <form onSubmit={handleSearchSubmit} className="relative shadow-md rounded-2xl">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="اكتب اسم المنتج (مثل: عسل، فخار، كليم) أو الكود (مثل: 9)..."
            className="w-full text-base bg-white border-2 border-stone-200 focus:border-[#B68763] rounded-2xl py-4 pr-12 pl-32 text-stone-900 placeholder-stone-400 focus:outline-hidden transition-all shadow-inner"
            autoFocus
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <button
            type="submit"
            className="absolute left-2.5 top-1/2 -translate-y-1/2 bg-[#443000] hover:bg-[#5c4205] text-white text-sm font-bold px-6 py-2.5 rounded-xl transition-colors"
          >
            بحث
          </button>
        </form>

        {/* Quick Search Suggestions */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-4 text-xs">
          <span className="text-stone-400">عمليات بحث شائعة:</span>
          {['عسل', 'سيراميك', 'شمع', 'فرعوني', 'نحاس'].map((tag) => (
            <button
              key={tag}
              onClick={() => setQuery(tag)}
              className="bg-stone-200/70 hover:bg-[#B68763]/20 hover:text-[#443000] text-stone-700 px-3 py-1 rounded-full font-medium transition-colors"
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Results Section */}
      <div>
        {query.trim() === '' ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-stone-200/80 max-w-2xl mx-auto p-8 shadow-xs">
            <div className="w-16 h-16 bg-amber-50 text-[#B68763] rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-stone-700">ابدأ البحث في الكتالوج</h3>
            <p className="text-stone-500 text-xs mt-1">
              أدخل كلمة أو كود للبحث في أكثر من 450 منتج مسجل في قائمة أسعار لوتس
            </p>
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-stone-200/80 max-w-2xl mx-auto p-8 shadow-xs">
            <h3 className="text-lg font-bold text-stone-700">لم يتم العثور على نتائج لـ "{query}"</h3>
            <p className="text-stone-500 text-xs mt-1">
              تأكد من كتابة الكلمة بشكل صحيح أو جرب كلمات مفتاحية عامة
            </p>
            <Link
              href="/products"
              className="inline-block mt-4 text-xs font-bold text-[#B68763] hover:underline"
            >
              تصفح كل المنتجات بدليل الكتالوج ←
            </Link>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-6 pb-2 border-b border-stone-200">
              <h2 className="text-base font-bold text-stone-800">
                نتائج البحث عن "{query}": <span className="text-[#B68763]">{results.length} نتيجة</span>
              </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {results.map((product) => (
                <div
                  key={product.id || product.slug}
                  className="group bg-white rounded-xl border border-stone-200 overflow-hidden shadow-2xs hover:shadow-md hover:border-[#B68763]/50 transition-all flex flex-col justify-between"
                >
                  <div>
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

                    <div className="p-3 sm:p-4">
                      {product.category && (
                        <span className="text-[10px] font-medium text-[#B68763] block truncate mb-1">
                          {product.category}
                        </span>
                      )}
                      <Link
                        href={`/products/${encodeURIComponent(product.slug)}`}
                        className="block font-bold text-sm text-[#443000] hover:text-[#B68763] transition-colors line-clamp-2 min-h-[2.5rem]"
                      >
                        {product.name_ar}
                      </Link>

                      <div className="mt-3 pt-2 border-t border-stone-100 flex items-center justify-between">
                        <span className="text-xs font-bold text-[#B68763]">السعر</span>
                        <span className="font-extrabold font-mono text-sm sm:text-base text-[#443000]">
                          {formatMagazinePrice(product.sale_price)}
                        </span>
                      </div>
                    </div>
                  </div>

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
          </div>
        )}
      </div>
    </div>
  );
}
