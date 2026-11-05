'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { PageSlotData } from '@/features/magazine/types';
import { AdminProductRecord } from '../products/actions';
import { saveSlotAssignmentAction } from './actions';
import { toArabicDigits } from '@/lib/format/price';

interface SlotPickerModalProps {
  pageNumber: number;
  slotNumber: number;
  currentSlotData?: PageSlotData;
  availableProducts?: AdminProductRecord[];
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedSlot?: PageSlotData) => void;
}

export function SlotPickerModal({
  pageNumber,
  slotNumber,
  currentSlotData,
  isOpen,
  onClose,
  onSuccess,
}: SlotPickerModalProps) {
  const [selectedProduct, setSelectedProduct] = useState<AdminProductRecord | null>(
    (currentSlotData?.product as AdminProductRecord) || null
  );
  const initialTitle = currentSlotData?.title_override || currentSlotData?.product?.name_ar || '';
  const [titleOverride, setTitleOverride] = useState(initialTitle);
  const [priceOverride, setPriceOverride] = useState(
    currentSlotData?.price_override ? String(currentSlotData.price_override) : (currentSlotData?.product?.sale_price ? String(currentSlotData.product.sale_price) : '')
  );
  const [codeOverride, setCodeOverride] = useState(
    currentSlotData?.product?.cashier_code ? String(currentSlotData.product.cashier_code) : ''
  );
  const [descriptionOverride, setDescriptionOverride] = useState(
    currentSlotData?.description_override || currentSlotData?.product?.description_ar || ''
  );
  const [colSpan, setColSpan] = useState<number>(Number(currentSlotData?.col_span) || 1);
  const [rowSpan, setRowSpan] = useState<number>(Number(currentSlotData?.row_span) || 1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync state whenever currentSlotData changes or modal opens
  React.useEffect(() => {
    if (!isOpen) return;
    const prod = (currentSlotData?.product as AdminProductRecord) || null;
    setSelectedProduct(prod);
    setTitleOverride(currentSlotData?.title_override || prod?.name_ar || '');
    setPriceOverride(
      currentSlotData?.price_override
        ? String(currentSlotData.price_override)
        : (prod?.sale_price ? String(prod.sale_price) : '')
    );
    setCodeOverride(prod?.cashier_code ? String(prod.cashier_code) : '');
    setDescriptionOverride(currentSlotData?.description_override || prod?.description_ar || '');
    setColSpan(Number(currentSlotData?.col_span) || 1);
    setRowSpan(Number(currentSlotData?.row_span) || 1);
  }, [currentSlotData, isOpen]);

  if (!isOpen) return null;

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    const priceNum = priceOverride ? parseFloat(priceOverride) : undefined;
    const codeNum = codeOverride.trim() ? parseInt(codeOverride.trim(), 10) : null;
    const finalName = titleOverride.trim() || selectedProduct?.name_ar;
    const descTrimmed = descriptionOverride.trim();
    const overrides = {
      title_override: finalName || undefined,
      price_override: priceNum && !isNaN(priceNum) ? priceNum : undefined,
      cashier_code: codeNum && !isNaN(codeNum) ? codeNum : null,
      description_override: descTrimmed !== '' ? descTrimmed : undefined,
      col_span: colSpan,
      row_span: rowSpan,
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
    const baseProd = selectedProduct || (currentSlotData?.product as AdminProductRecord | undefined);
    const updatedProd = baseProd
      ? {
          ...baseProd,
          ...(overrides.title_override ? { name_ar: overrides.title_override } : {}),
          ...(overrides.cashier_code !== undefined ? { cashier_code: overrides.cashier_code } : {}),
          ...(overrides.price_override !== undefined ? { sale_price: overrides.price_override } : {}),
          ...(overrides.description_override !== undefined ? { description_ar: overrides.description_override } : {}),
        }
      : undefined;

    const effectivePrice =
      overrides.price_override !== undefined
        ? overrides.price_override
        : updatedProd?.sale_price;

    const computedPriceText =
      effectivePrice !== undefined && effectivePrice !== null
        ? `${toArabicDigits(effectivePrice)} ج.مصري`
        : currentSlotData?.price_text;

    onSuccess({
      slot: slotNumber,
      product: updatedProd,
      title_override: overrides.title_override,
      price_override: overrides.price_override,
      price_text: computedPriceText,
      image_override: currentSlotData?.image_override,
      description_override: overrides.description_override,
      col_span: overrides.col_span,
      row_span: overrides.row_span,
    });
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
    onSuccess({
      slot: slotNumber,
      product: undefined,
      col_span: 1,
      row_span: 1,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-stone-200 w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 flex flex-col justify-between">
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
                  تعديل أبعاد الخانة، الاسم، السعر، الكود، والوصف والمواصفات التفصيلية
                </p>
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
                  {selectedProduct ? (titleOverride.trim() || selectedProduct.name_ar) : 'خانة فارغة (غير مخصصة)'}
                </h4>
                {selectedProduct && (
                  <span className="text-xs font-mono font-bold text-stone-500">
                    {currentSlotData?.price_text || selectedProduct.price_text
                      ? toArabicDigits((currentSlotData?.price_text || selectedProduct.price_text || '').replace(/\n/g, ' • '))
                      : `${toArabicDigits(priceOverride || selectedProduct.sale_price)} ج.مصري`}{' '}
                    (كود: #{codeOverride || selectedProduct.cashier_code || 'غير محدد'})
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

          {/* Overrides & Dimensions row */}
          <div className="space-y-4 mb-4 p-4 rounded-2xl bg-stone-50 border border-stone-200">
            {/* Dimensions selector */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">
                حجم وأبعاد الكارت في الصفحة (الافتراضي 1×1)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { label: 'عادي (1×1)', col: 1, row: 1, desc: 'حجم عادي' },
                  { label: 'عرضي (2×1)', col: 2, row: 1, desc: 'عمودين × صف' },
                  { label: 'طولي (1×2)', col: 1, row: 2, desc: 'عمود × صفين' },
                  { label: 'مربع كبير (2×2)', col: 2, row: 2, desc: 'عمودين × صفين' },
                  { label: 'عريض كامل (3×1)', col: 3, row: 1, desc: '3 أعمدة (صف كامل)' },
                  { label: 'بانر كبير (3×2)', col: 3, row: 2, desc: '3 أعمدة × صفين' },
                ].map((sizeOpt) => {
                  const isActive = colSpan === sizeOpt.col && rowSpan === sizeOpt.row;
                  return (
                    <button
                      key={`${sizeOpt.col}-${sizeOpt.row}`}
                      type="button"
                      onClick={() => {
                        setColSpan(sizeOpt.col);
                        setRowSpan(sizeOpt.row);
                      }}
                      className={`p-2.5 rounded-xl border text-right transition-all flex flex-col justify-between cursor-pointer ${
                        isActive
                          ? 'bg-[#443000] text-white border-[#443000] shadow-sm'
                          : 'bg-white text-stone-700 border-stone-200 hover:border-[#B68763] hover:bg-amber-50/40'
                      }`}
                    >
                      <span className="text-xs font-bold block">{sizeOpt.label}</span>
                      <span className={`text-[10px] mt-0.5 block ${isActive ? 'text-amber-200' : 'text-stone-400'}`}>
                        {sizeOpt.desc}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Title, price, and code overrides */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2 border-t border-stone-200/80">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  كود المنتج / الكاشير (#)
                </label>
                <input
                  type="number"
                  step="1"
                  value={codeOverride}
                  onChange={(e) => setCodeOverride(e.target.value)}
                  placeholder={selectedProduct?.cashier_code ? String(selectedProduct.cashier_code) : 'مثال: 101'}
                  className="w-full text-xs font-mono font-bold bg-white border border-stone-300 rounded-xl px-3 py-2 text-[#443000] focus:outline-hidden focus:border-[#B68763]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  تخصيص السعر (L.E)
                </label>
                <input
                  type="number"
                  value={priceOverride}
                  onChange={(e) => setPriceOverride(e.target.value)}
                  placeholder={selectedProduct ? String(selectedProduct.sale_price) : 'السعر...'}
                  className="w-full text-xs font-mono bg-white border border-stone-300 rounded-xl px-3 py-2 text-stone-900 focus:outline-hidden focus:border-[#B68763]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  اسم وعنوان المنتج
                </label>
                <input
                  type="text"
                  value={titleOverride}
                  onChange={(e) => setTitleOverride(e.target.value)}
                  placeholder={selectedProduct?.name_ar || 'اسم المنتج...'}
                  className="w-full text-xs font-bold bg-white border border-stone-300 rounded-xl px-3 py-2 text-[#443000] focus:outline-hidden focus:border-[#B68763]"
                />
              </div>
            </div>

            {/* Description and detailed specifications */}
            <div className="pt-2 border-t border-stone-200/80">
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-stone-700">
                  الوصف والمواصفات التفصيلية
                </label>
                <span className="text-[10px] text-stone-400">
                  يظهر في نافذة تفاصيل المنتج وكارت العرض
                </span>
              </div>
              <textarea
                rows={3}
                value={descriptionOverride}
                onChange={(e) => setDescriptionOverride(e.target.value)}
                placeholder="أدخل وصف المنتج، المكونات، طريقة الاستخدام، أو أي مواصفات تفصيلية..."
                className="w-full text-xs bg-white border border-stone-300 rounded-xl p-3 text-stone-900 focus:outline-hidden focus:border-[#B68763] resize-y"
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-4 pt-4 border-t border-stone-200 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="px-5 py-2.5 text-xs font-bold text-stone-600 hover:bg-stone-100 rounded-xl transition-colors cursor-pointer"
          >
            إلغاء
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !selectedProduct}
            className="px-6 py-2.5 text-xs font-extrabold bg-[#443000] hover:bg-[#5c4205] text-white rounded-xl shadow-xs transition-all disabled:opacity-50 cursor-pointer"
          >
            {saving ? 'جاري الحفظ...' : 'حفظ التعديلات في الخانة'}
          </button>
        </div>
      </div>
    </div>
  );
}
