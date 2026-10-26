'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { AdminProductRecord } from './actions';
import { ProductEditModal } from './ProductEditModal';
import { normalizeArabic } from '@/lib/format/arabic';

interface AdminProductsTableProps {
  initialProducts: AdminProductRecord[];
  categories: string[];
}

export function AdminProductsTable({
  initialProducts,
  categories,
}: AdminProductsTableProps) {
  const [products, setProducts] = useState<AdminProductRecord[]>(initialProducts);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [editingProduct, setEditingProduct] = useState<AdminProductRecord | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 25;

  const filtered = useMemo(() => {
    let result = [...products];

    if (selectedCategory !== 'all') {
      result = result.filter((p) => p.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const q = normalizeArabic(searchQuery);
      result = result.filter((p) => {
        const name = normalizeArabic(p.name_ar);
        const code = p.cashier_code ? String(p.cashier_code) : '';
        const cat = normalizeArabic(p.category || '');
        return name.includes(q) || cat.includes(q) || code === searchQuery.trim();
      });
    }

    return result;
  }, [products, selectedCategory, searchQuery]);

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const pageItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage, pageSize]);

  const handleProductUpdated = (updated: AdminProductRecord) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === updated.id ? updated : p))
    );
  };

  return (
    <div className="space-y-6">
      {/* Title & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#443000]">إدارة المنتجات والأسعار</h1>
          <p className="text-xs text-stone-500 mt-0.5">
            تعديل الأسعار، الصور، والبيانات وتعميمها على المجلة والدليل العام
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white border border-stone-200 px-4 py-2 rounded-xl text-xs font-bold text-stone-700 shadow-2xs">
            إجمالي المنتجات: <span className="text-[#443000]">{products.length}</span>
          </div>
          <Link
            href="/admin/composer"
            className="bg-[#443000] hover:bg-[#5c4205] text-white text-xs font-bold px-4 py-2 rounded-xl shadow-xs transition-colors"
          >
            الانتقال لمحرر المجلة ←
          </Link>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="بحث بالاسم، الكود (#) أو التصنيف..."
            className="w-full text-xs bg-stone-50 border border-stone-200 rounded-xl py-2.5 pl-9 pr-3 text-stone-900 placeholder-stone-400 focus:outline-hidden focus:border-[#B68763] focus:bg-white"
          />
          <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Categories selector */}
        <div className="flex items-center gap-2 overflow-x-auto max-w-lg scrollbar-thin">
          <button
            onClick={() => {
              setSelectedCategory('all');
              setCurrentPage(1);
            }}
            className={`text-xs font-bold px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
              selectedCategory === 'all'
                ? 'bg-[#443000] text-white'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            الكل ({products.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                setCurrentPage(1);
              }}
              className={`text-xs font-bold px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-[#443000] text-white'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200 text-stone-600 text-xs font-bold">
                <th className="py-3 px-4">الصورة</th>
                <th className="py-3 px-4">الكود</th>
                <th className="py-3 px-4">اسم المنتج</th>
                <th className="py-3 px-4">القسم</th>
                <th className="py-3 px-4">سعر البيع (L.E)</th>
                <th className="py-3 px-4">سعر التكلفة</th>
                <th className="py-3 px-4">المخزون</th>
                <th className="py-3 px-4 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-xs">
              {pageItems.map((prod) => (
                <tr key={prod.id} className="hover:bg-amber-50/20 transition-colors">
                  <td className="py-2.5 px-4">
                    <div className="relative w-11 h-11 rounded-lg overflow-hidden bg-stone-100 border border-stone-200">
                      <Image
                        src={prod.primary_image_url || '/brand/lotus_logo.png'}
                        alt={prod.name_ar}
                        fill
                        sizes="44px"
                        className="object-cover"
                      />
                    </div>
                  </td>
                  <td className="py-2.5 px-4 font-mono font-bold text-stone-500">
                    #{prod.cashier_code ?? '-'}
                  </td>
                  <td className="py-2.5 px-4 font-bold text-[#443000]">
                    <div>{prod.name_ar}</div>
                    <div className="text-[10px] text-stone-400 font-mono font-normal">
                      {prod.slug}
                    </div>
                  </td>
                  <td className="py-2.5 px-4 text-stone-600">
                    <span className="bg-stone-100 text-stone-700 px-2 py-0.5 rounded text-[11px] font-medium">
                      {prod.category || 'عام'}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 font-extrabold font-mono text-[#443000] text-sm">
                    {prod.sale_price} L.E
                  </td>
                  <td className="py-2.5 px-4 font-mono text-stone-400 text-[11px]">
                    {prod.cost_price ? `${prod.cost_price} ج.م` : '-'}
                  </td>
                  <td className="py-2.5 px-4">
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      {prod.stock_status || 'متاح'}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => setEditingProduct(prod)}
                        className="bg-[#443000] hover:bg-[#5c4205] text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-2xs transition-colors"
                      >
                        تعديل
                      </button>
                      <Link
                        href={`/products/${encodeURIComponent(prod.slug)}`}
                        target="_blank"
                        className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 transition-colors"
                        title="معاينة في الموقع"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="bg-stone-50 px-4 py-3 border-t border-stone-200 flex items-center justify-between text-xs font-medium text-stone-600">
          <span>
            عرض {pageItems.length} من {filtered.length} منتج
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="px-2.5 py-1 bg-white border border-stone-200 rounded text-stone-700 disabled:opacity-40"
            >
              السابق
            </button>
            <span>
              صفحة {currentPage} من {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-2.5 py-1 bg-white border border-stone-200 rounded text-stone-700 disabled:opacity-40"
            >
              التالي
            </button>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <ProductEditModal
        product={editingProduct}
        isOpen={!!editingProduct}
        onClose={() => setEditingProduct(null)}
        onSuccess={handleProductUpdated}
      />
    </div>
  );
}
