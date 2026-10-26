'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { PageSlotData } from '@/features/magazine/types';
import { AdminProductRecord } from '../products/actions';
import { saveSlotAssignmentAction } from './actions';
import { normalizeArabic } from '@/lib/format/arabic';

interface SlotPickerModalProps {
  pageNumber: number;
  slotNumber: number;
  currentSlotData?: PageSlotData;
  availableProducts: AdminProductRecord[];
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function SlotPickerModal({
  pageNumber,
  slotNumber,
  currentSlotData,
  availableProducts,
  isOpen,
  onClose,
  onSuccess,
}: SlotPickerModalProps) {
  if (!isOpen) return null;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<AdminProductRecord | null>(
    (currentSlotData?.product as AdminProductRecord) || null
  );
  const [titleOverride, setTitleOverride] = useState(currentSlotData?.title_override || '');
  const [priceOverride, setPriceOverride] = useState(
    currentSlotData?.price_override ? String(currentSlotData.price_override) : ''
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return availableProducts.slice(0, 30);
    const q = normalizeArabic(searchQuery);
    return availableProducts.filter((p) => {
      const name = normalizeArabic(p.name_ar);
      const code = p.cashier_code ? String(p.cashier_code) : '';
      const cat = normalizeArabic(p.category || '');
      return name.includes(q) || cat.includes(q) || code === searchQuery.trim();
    });
  }, [availableProducts, searchQuery]);

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    const priceNum = priceOverride ? parseFloat(priceOverride) : undefined;
    const overrides = {
      title_override: titleOverride.trim() || undefined,
      price_override: priceNum && !isNaN(priceNum) ? priceNum : undefined,
    };

    const res = await saveSlotAssignmentAction(
      pageNumber,
      slotNumber,
      selectedProduct?.id || null,
      overrides
    );

    if (!res.success) {
      setError(res.error || 'فشل في حفظ التعيين');
      setSaving(false);
      return;
    }

    setSaving(false);
    onSuccess();
    onClose();
  };

  const handleClearSlot = async () => {
    setSaving(true);
    setError(null);

    const res = await saveSlotAssignmentAction(pageNumber, slotNumber, null);
    if (!res.success) {
      setError(res.error || 'فشل في إفراغ الخانة');
      setSaving(false);
      return;
    }

    setSaving(false);
    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-stone-200 w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 flex flex-col justify-between">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-stone-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#443000] text-[#B68763] flex items-center justify-center font-extrabold text-sm">
                #{slotNumber}
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#443000]">
                  تخصيص الخانة {slotNumber} - صفحة {pageNumber}
                </h3>
                <p className="text-xs text-stone-500">
                  اختر منتجًا من الكتالوج لتعيينه في هذه الخانة أو عدل النصوص المعروضة
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100"
            >
              ✕
            </button>
          </div>

          {error && (
            <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold">
              {error}
            </div>
          )}

          {/* Active Selection Display */}
          <div className="my-5 p-4 rounded-2xl bg-amber-50/50 border border-[#B68763]/30 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3.5 w-full sm:w-auto">
              <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-white border border-stone-200 flex-shrink-0">
                <Image
                  src={selectedProduct?.primary_image_url || '/brand/lotus_logo.png'}
                  alt="المنتج المختار"
                  fill
                  sizes="56px"
                  className="object-cover"
                />
              </div>
              <div>
                <span className="text-[10px] font-bold text-[#B68763] block">
                  المنتج المعين حاليًا
                </span>
                <h4 className="text-sm font-extrabold text-[#443000]">
                  {selectedProduct ? selectedProduct.name_ar : 'خانة فارغة (غير مخصصة)'}
                </h4>
                {selectedProduct && (
                  <span className="text-xs font-mono font-bold text-stone-500">
                    {selectedProduct.sale_price} L.E (كود: #{selectedProduct.cashier_code})
                  </span>
                )}
              </div>
            </div>

            {selectedProduct && (
              <button
                type="button"
                onClick={handleClearSlot}
                disabled={saving}
                className="text-xs font-bold text-red-600 hover:bg-red-50 border border-red-200 px-3 py-1.5 rounded-lg transition-colors"
              >
                إفراغ الخانة
              </button>
            )}
          </div>

          {/* Overrides row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 p-4 rounded-2xl bg-stone-50 border border-stone-200">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                تخصيص عنوان المنتج (اختياري - للمجلة فقط)
              </label>
              <input
                type="text"
                value={titleOverride}
                onChange={(e) => setTitleOverride(e.target.value)}
                placeholder={selectedProduct?.name_ar || 'العنوان الافتراضي...'}
                className="w-full text-xs bg-white border border-stone-300 rounded-xl px-3 py-2 text-stone-900 focus:outline-hidden focus:border-[#B68763]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                تخصيص السعر (اختياري - للمجلة فقط)
              </label>
              <input
                type="number"
                value={priceOverride}
                onChange={(e) => setPriceOverride(e.target.value)}
                placeholder={selectedProduct ? String(selectedProduct.sale_price) : 'السعر...'}
                className="w-full text-xs font-mono bg-white border border-stone-300 rounded-xl px-3 py-2 text-stone-900 focus:outline-hidden focus:border-[#B68763]"
              />
            </div>
          </div>

          {/* Search Catalog */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">
              اختيار منتج آخر من الكتالوج (البحث في 453 منتج)
            </label>
            <div className="relative mb-3">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث بالاسم، الكود (#) أو القسم..."
                className="w-full text-xs bg-stone-50 border border-stone-200 rounded-xl py-2 pl-9 pr-3 text-stone-900 focus:outline-hidden focus:border-[#B68763] focus:bg-white"
              />
              <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {/* Product selection list */}
            <div className="max-h-56 overflow-y-auto divide-y divide-stone-100 border border-stone-200 rounded-xl">
              {filteredProducts.map((p) => {
                const isSelected = selectedProduct?.id === p.id;
                return (
                  <div
                    key={p.id}
                    onClick={() => setSelectedProduct(p)}
                    className={`p-2.5 flex items-center justify-between cursor-pointer transition-colors ${
                      isSelected ? 'bg-amber-100/50' : 'hover:bg-stone-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative w-9 h-9 rounded-lg overflow-hidden bg-stone-100 flex-shrink-0">
                        <Image
                          src={p.primary_image_url || '/brand/lotus_logo.png'}
                          alt={p.name_ar}
                          fill
                          sizes="36px"
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[#443000]">{p.name_ar}</div>
                        <div className="text-[10px] text-stone-400">
                          كود: #{p.cashier_code || '-'} | {p.category || 'عام'}
                        </div>
                      </div>
                    </div>
                    <div className="text-left font-mono font-extrabold text-xs text-[#443000]">
                      {p.sale_price} L.E
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-6 pt-4 border-t border-stone-200 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="px-5 py-2.5 text-xs font-bold text-stone-600 hover:bg-stone-100 rounded-xl"
          >
            إلغاء
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !selectedProduct}
            className="px-6 py-2.5 text-xs font-extrabold bg-[#443000] hover:bg-[#5c4205] text-white rounded-xl shadow-xs transition-all disabled:opacity-50"
          >
            {saving ? 'جاري الحفظ...' : 'تثبيت المنتج في الخانة'}
          </button>
        </div>
      </div>
    </div>
  );
}
