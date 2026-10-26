'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { AdminProductRecord, updateProductAction } from './actions';

interface ProductEditModalProps {
  product: AdminProductRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updated: AdminProductRecord) => void;
}

export function ProductEditModal({
  product,
  isOpen,
  onClose,
  onSuccess,
}: ProductEditModalProps) {
  if (!isOpen || !product) return null;

  const [nameAr, setNameAr] = useState(product.name_ar);
  const [salePrice, setSalePrice] = useState(String(product.sale_price || ''));
  const [category, setCategory] = useState(product.category || '');
  const [descriptionAr, setDescriptionAr] = useState(product.description_ar || '');
  const [imageUrl, setImageUrl] = useState(product.primary_image_url || '');
  const [stockStatus, setStockStatus] = useState(product.stock_status || 'متاح');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const priceNum = parseFloat(salePrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      setError('يرجى إدخال سعر بيع صحيح أكبر من صفر');
      setSaving(false);
      return;
    }

    const payload = {
      name_ar: nameAr.trim(),
      sale_price: priceNum,
      category: category.trim(),
      description_ar: descriptionAr.trim(),
      primary_image_url: imageUrl.trim(),
      stock_status: stockStatus,
    };

    const res = await updateProductAction(product.id, payload);
    if (!res.success) {
      setError(res.error || 'فشل في حفظ التعديلات');
      setSaving(false);
      return;
    }

    onSuccess({
      ...product,
      ...payload,
    });
    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-stone-200 w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#443000] text-white flex items-center justify-center font-bold text-xs">
              #{product.cashier_code || '?'}
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#443000]">تعديل بيانات المنتج</h2>
              <span className="text-xs text-stone-500 font-mono">{product.id}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 transition-colors"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          {/* Photo & Basic details row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-start">
            {/* Image Preview & URL */}
            <div className="flex flex-col items-center">
              <div className="relative w-full aspect-square rounded-2xl bg-stone-100 border border-stone-200 overflow-hidden mb-2">
                <Image
                  src={imageUrl || '/brand/lotus_logo.png'}
                  alt="معاينة"
                  fill
                  sizes="180px"
                  className="object-cover"
                />
              </div>
              <label className="text-[10px] text-stone-400 font-medium mb-1">
                معاينة الصورة الحالية
              </label>
            </div>

            {/* Title & Category inputs */}
            <div className="sm:col-span-2 space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  اسم المنتج بالعربية *
                </label>
                <input
                  type="text"
                  value={nameAr}
                  onChange={(e) => setNameAr(e.target.value)}
                  required
                  className="w-full text-sm bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-900 focus:outline-hidden focus:border-[#B68763] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  القسم / التصنيف
                </label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full text-sm bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-900 focus:outline-hidden focus:border-[#B68763] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  رابط الصورة (URL)
                </label>
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full text-xs font-mono bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-900 focus:outline-hidden focus:border-[#B68763] focus:bg-white"
                />
              </div>
            </div>
          </div>

          {/* Pricing & Stock Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-stone-50 border border-stone-200">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                سعر البيع للجمهور (L.E) *
              </label>
              <input
                type="number"
                step="1"
                value={salePrice}
                onChange={(e) => setSalePrice(e.target.value)}
                required
                className="w-full text-base font-extrabold font-mono bg-white border border-stone-300 rounded-xl px-3 py-2 text-[#443000] focus:outline-hidden focus:border-[#B68763]"
              />
              <span className="text-[10px] text-stone-400 mt-0.5 block">
                يظهر مباشرة في المجلة والدليل
              </span>
            </div>

            {product.cost_price !== undefined && (
              <div>
                <label className="block text-xs font-bold text-stone-500 mb-1">
                  سعر التكلفة الداخلي (سري)
                </label>
                <div className="w-full text-base font-mono bg-stone-200/60 border border-stone-300 rounded-xl px-3 py-2 text-stone-600 cursor-not-allowed">
                  {product.cost_price} ج.م
                </div>
                <span className="text-[10px] text-amber-700 mt-0.5 block">
                  لا يظهر للجمهور مطلقًا
                </span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                حالة المخزون
              </label>
              <select
                value={stockStatus}
                onChange={(e) => setStockStatus(e.target.value)}
                className="w-full text-xs font-bold bg-white border border-stone-300 rounded-xl px-3 py-2.5 text-stone-800 focus:outline-hidden focus:border-[#B68763]"
              >
                <option value="متاح">متاح في المعرض</option>
                <option value="كمية محدودة">كمية محدودة</option>
                <option value="نفد من المعرض">نفد من المعرض</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              الوصف والمواصفات التفصيلية
            </label>
            <textarea
              rows={3}
              value={descriptionAr}
              onChange={(e) => setDescriptionAr(e.target.value)}
              className="w-full text-sm bg-stone-50 border border-stone-200 rounded-xl p-3 text-stone-900 focus:outline-hidden focus:border-[#B68763] focus:bg-white"
            />
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-200">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-5 py-2.5 text-xs font-bold text-stone-600 hover:bg-stone-100 rounded-xl transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 text-xs font-extrabold bg-[#443000] hover:bg-[#5c4205] text-white rounded-xl shadow-sm transition-all disabled:opacity-50"
            >
              {saving ? 'جاري الحفظ والتعميم...' : 'حفظ التعديلات'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
