'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  AdminProductRecord,
  updateProductAction,
  uploadProductImageAction,
  ProductPriceTier,
} from './actions';
import { toArabicDigits } from '@/lib/format/price';

function parseTiersFromText(text?: string | null): ProductPriceTier[] {
  if (!text || (!text.includes('\n') && !text.includes('|'))) return [];
  const clean = text.replace(/^(السعر|المقاس والسعر|الحجم والسعر|الوزن والسعر)\s*\n?/, '').trim();
  const lines = clean.split('\n').map((l) => l.trim()).filter(Boolean);
  const tiers: ProductPriceTier[] = [];

  for (const line of lines) {
    if (line.includes('|')) {
      const parts = line.split('|').map((p) => p.trim());
      const hasCurrency = (s: string) => /ج\.مصري|ج\.م|ج|l\.e|egp/i.test(s);
      let label = parts[0];
      let priceStr = parts[1];
      if (hasCurrency(parts[0]) && !hasCurrency(parts[1])) {
        priceStr = parts[0];
        label = parts[1];
      }
      const numMatch = priceStr
        .replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d).toString())
        .match(/\d+(?:\.\d+)?/);
      const price = numMatch ? parseFloat(numMatch[0]) : 0;
      if (label && price > 0) {
        tiers.push({ label, price });
      }
    }
  }
  return tiers;
}

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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [nameAr, setNameAr] = useState(product?.name_ar ?? '');
  const [salePrice, setSalePrice] = useState(product?.sale_price != null ? String(product.sale_price) : '');
  const [cashierCode, setCashierCode] = useState(product?.cashier_code ? String(product.cashier_code) : '');
  const [category, setCategory] = useState(product?.category ?? '');
  const [descriptionAr, setDescriptionAr] = useState(product?.description_ar ?? '');
  const [imageUrl, setImageUrl] = useState(product?.primary_image_url ?? '');
  const [stockStatus, setStockStatus] = useState(product?.stock_status ?? 'متاح');
  const [priceTiers, setPriceTiers] = useState<ProductPriceTier[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Image upload states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedSuccess, setUploadedSuccess] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (!product) return;

    setNameAr(product.name_ar ?? '');
    setSalePrice(product.sale_price != null ? String(product.sale_price) : '');
    setCashierCode(product.cashier_code ? String(product.cashier_code) : '');
    setCategory(product.category ?? '');
    setDescriptionAr(product.description_ar ?? '');
    setImageUrl(product.primary_image_url ?? '');
    setStockStatus(product.stock_status ?? 'متاح');
    setSelectedFile(null);
    setPreviewUrl(null);
    setUploadedSuccess(false);
    setError(null);

    if (product.price_tiers && product.price_tiers.length > 0) {
      setPriceTiers(product.price_tiers);
    } else {
      setPriceTiers(parseTiersFromText(product.price_text));
    }
  }, [product, isOpen]);

  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  if (!isOpen || !product) return null;

  const handleFileChange = (file: File | null) => {
    if (!file) return;
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
      'image/avif',
    ];
    if (!allowedTypes.includes(file.type)) {
      setError('صيغة الصورة غير مدعومة. يرجى اختيار ملف صورة صالح (JPG, PNG, WebP)');
      return;
    }
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
    if (file.size > MAX_FILE_SIZE) {
      setError('حجم الصورة كبير جدًا (الحد الأقصى 5 ميجابايت). يرجى اختيار صورة أصغر.');
      return;
    }

    setError(null);
    setSelectedFile(file);
    setUploadedSuccess(false);

    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    const newBlobUrl = URL.createObjectURL(file);
    setPreviewUrl(newBlobUrl);
  };

  const handleCancelSelectedFile = () => {
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    setUploadedSuccess(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAddTier = () => {
    setPriceTiers((prev) => [...prev, { label: '', price: 0 }]);
  };

  const handleRemoveTier = (index: number) => {
    setPriceTiers((prev) => prev.filter((_, i) => i !== index));
  };

  const handleTierChange = (index: number, field: 'label' | 'price', value: string) => {
    setPriceTiers((prev) =>
      prev.map((t, i) => {
        if (i !== index) return t;
        if (field === 'price') {
          return { ...t, price: parseFloat(value) || 0 };
        }
        return { ...t, label: value };
      })
    );
  };

  const executeSave = async () => {
    setSaving(true);
    setError(null);

    const priceNum = parseFloat(salePrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      setError('يرجى إدخال سعر بيع صحيح أكبر من صفر');
      setSaving(false);
      return;
    }

    const codeNum = cashierCode.trim() ? parseInt(cashierCode.trim(), 10) : null;

    let finalImageUrl = imageUrl.trim();

    try {
      // If user staged a new image file, upload it to database first
      if (selectedFile) {
        if (selectedFile.size > 5 * 1024 * 1024) {
          setError('حجم الصورة كبير جدًا (الحد الأقصى 5 ميجابايت). يرجى اختيار صورة أصغر.');
          setSaving(false);
          return;
        }

        setUploading(true);
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('productId', product.id);
        if (product.primary_image_url) {
          formData.append('oldImageUrl', product.primary_image_url);
        }

        const uploadRes = await uploadProductImageAction(formData);
        setUploading(false);

        if (!uploadRes.success || !uploadRes.url) {
          setError(uploadRes.error || 'فشل في رفع الصورة إلى قاعدة البيانات');
          setSaving(false);
          return;
        }

        finalImageUrl = uploadRes.url;
        setImageUrl(uploadRes.url);
        setUploadedSuccess(true);
      }

      const validTiers = priceTiers
        .map((t) => ({ label: t.label.trim(), price: Number(t.price) }))
        .filter((t) => t.label && t.price > 0);

      const builtPriceText =
        validTiers.length > 0
          ? validTiers.map((t) => `${t.label} | ${toArabicDigits(t.price)} ج.مصري`).join('\n')
          : null;

      const payload = {
        name_ar: nameAr.trim(),
        sale_price: priceNum,
        cashier_code: codeNum && !isNaN(codeNum) ? codeNum : null,
        category: category.trim(),
        description_ar: descriptionAr.trim(),
        primary_image_url: finalImageUrl,
        stock_status: stockStatus,
        price_tiers: validTiers.length > 0 ? validTiers : null,
        price_text: builtPriceText,
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
    } catch (err: unknown) {
      console.error('Failed to save product or upload image:', err);
      const errMsg = err instanceof Error ? err.message : '';
      if (
        errMsg.toLowerCase().includes('body exceeded') ||
        errMsg.includes('413') ||
        errMsg.toLowerCase().includes('limit')
      ) {
        setError('حجم الصورة يتجاوز الحد المسموح به (5 ميجابايت). يرجى ضغط الصورة أو اختيار صورة أصغر.');
      } else {
        setError('تعذر رفع الصورة أو حفظ التعديلات: حدث خطأ غير متوقع أثناء الاتصال بقاعدة البيانات.');
      }
      setUploading(false);
      setSaving(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await executeSave();
  };

  const handleSaveWithImageNow = async () => {
    await executeSave();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-stone-200 w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#443000] text-white flex items-center justify-center font-bold text-xs">
              #{cashierCode || product.cashier_code || '?'}
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
            {/* Image Preview & Upload Column */}
            <div className="flex flex-col items-center">
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  const file = e.dataTransfer.files?.[0];
                  if (file) handleFileChange(file);
                }}
                className={`relative w-full aspect-square rounded-2xl bg-stone-100 border-2 overflow-hidden mb-2 transition-all ${
                  isDragging ? 'border-[#B68763] bg-amber-50 scale-[1.02]' : 'border-stone-200'
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewUrl || imageUrl || '/brand/lotus_logo.png'}
                  alt="معاينة المنتج"
                  className="w-full h-full object-cover"
                />

                {uploading && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center text-white p-3 text-center z-10">
                    <svg className="animate-spin h-7 w-7 mb-2 text-white" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                    </svg>
                    <span className="text-xs font-bold">جاري الرفع إلى قاعدة البيانات...</span>
                  </div>
                )}

                {isDragging && (
                  <div className="absolute inset-0 bg-amber-500/20 backdrop-blur-xs flex items-center justify-center text-[#443000] font-extrabold text-xs">
                    أفلت الصورة هنا
                  </div>
                )}
              </div>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif,image/avif"
                className="hidden"
                data-testid="product-image-file-input"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileChange(file);
                }}
              />

              {/* Upload trigger button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading || saving}
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-bold text-[#443000] bg-amber-100/70 hover:bg-amber-200/80 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
              >
                <svg className="w-4 h-4 text-[#8A6747]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {selectedFile ? 'تغيير الصورة المحددة' : 'رفع / تغيير الصورة'}
              </button>

              {/* File details & instant upload option */}
              {selectedFile && (
                <div className="w-full mt-2 p-2.5 rounded-xl bg-amber-50/80 border border-amber-200/80 text-[11px] text-stone-700">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold truncate max-w-[130px]" title={selectedFile.name}>
                      {selectedFile.name}
                    </span>
                    <span className="text-[10px] text-stone-500 font-mono">
                      {(selectedFile.size / 1024).toFixed(0)} KB
                    </span>
                  </div>

                  {uploadedSuccess ? (
                    <div className="flex items-center gap-1 text-emerald-700 font-bold text-[10px] bg-emerald-50 p-1.5 rounded-lg border border-emerald-200">
                      <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                      </svg>
                      تم الرفع واستبدال الصورة في قاعدة البيانات
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-1.5 pt-1 border-t border-amber-200/50">
                      <button
                        type="button"
                        onClick={handleSaveWithImageNow}
                        disabled={uploading || saving}
                        className="text-[10px] font-extrabold text-white bg-[#443000] hover:bg-[#5c4205] px-2.5 py-1 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                        title="رفع الصورة وحفظ تعديل المنتج فوراً"
                      >
                        {uploading || saving ? 'جاري الحفظ...' : 'رفع الآن إلى قاعدة البيانات'}
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelSelectedFile}
                        disabled={uploading || saving}
                        className="text-[10px] font-bold text-stone-500 hover:text-red-600 px-1 py-1 transition-colors cursor-pointer"
                        title="إلغاء الملف المختار"
                      >
                        إلغاء الملف
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Title, Category & URL inputs */}
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
                <label htmlFor="product-image-url" className="block text-xs font-bold text-stone-700 mb-1">
                  رابط الصورة في قاعدة البيانات (URL)
                </label>
                <input
                  id="product-image-url"
                  type="text"
                  value={imageUrl}
                  onChange={(e) => {
                    setImageUrl(e.target.value);
                    setPreviewUrl(null);
                    setSelectedFile(null);
                  }}
                  placeholder="https://.../storage/v1/object/public/magazine/..."
                  className="w-full text-xs font-mono bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-900 focus:outline-hidden focus:border-[#B68763] focus:bg-white text-left dir-ltr"
                />
                <span className="text-[10px] text-stone-400 mt-0.5 block">
                  يتحدث تلقائيًا عند رفع صورة جديدة إلى قاعدة البيانات، أو يمكنك لصق رابط مباشر
                </span>
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

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                كود المنتج / الكاشير (#)
              </label>
              <input
                type="number"
                step="1"
                value={cashierCode}
                onChange={(e) => setCashierCode(e.target.value)}
                placeholder="مثال: 101"
                className="w-full text-base font-extrabold font-mono bg-white border border-stone-300 rounded-xl px-3 py-2 text-[#443000] focus:outline-hidden focus:border-[#B68763]"
              />
              <span className="text-[10px] text-stone-400 mt-0.5 block">
                كود الفاتورة والبحث السريع
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

          {/* Multi-tier Price Options */}
          <div className="p-4 rounded-2xl bg-amber-50/40 border border-amber-200/60">
            <div className="flex items-center justify-between mb-2">
              <div>
                <label className="block text-xs font-bold text-[#443000]">
                  خيارات وأسعار متعددة للمنتج (مثل الأحجام والمقاسات)
                </label>
                <span className="text-[11px] text-stone-500 block">
                  إذا كان المنتج يتوفر بأحجام أو مقاسات بأسعار مختلفة (مثال: ٦٥٠ جرام أو 1.5 كيلو).
                </span>
              </div>
              <button
                type="button"
                onClick={handleAddTier}
                className="text-xs font-bold text-[#8A6747] hover:text-[#443000] bg-amber-100/70 hover:bg-amber-200/70 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
              >
                + إضافة خيار سعر
              </button>
            </div>

            {priceTiers.length > 0 ? (
              <div className="space-y-2.5 mt-3">
                {priceTiers.map((tier, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-white p-2.5 rounded-xl border border-stone-200">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={tier.label}
                        onChange={(e) => handleTierChange(idx, 'label', e.target.value)}
                        placeholder="البيان / الحجم (مثال: ٦٥٠ جرام أو 70×140 سم)"
                        className="w-full text-xs font-bold bg-stone-50 border border-stone-200 rounded-lg px-2.5 py-1.5 text-stone-900 focus:outline-hidden focus:border-[#B68763] focus:bg-white"
                      />
                    </div>
                    <div className="w-32">
                      <div className="relative">
                        <input
                          type="number"
                          step="1"
                          value={tier.price || ''}
                          onChange={(e) => handleTierChange(idx, 'price', e.target.value)}
                          placeholder="السعر"
                          className="w-full text-xs font-extrabold font-mono bg-stone-50 border border-stone-200 rounded-lg px-2.5 py-1.5 text-[#443000] focus:outline-hidden focus:border-[#B68763] focus:bg-white text-left pl-8"
                        />
                        <span className="absolute left-2 top-1.5 text-[10px] text-stone-400 font-bold pointer-events-none">
                          ج.م
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveTier(idx)}
                      className="p-1.5 text-stone-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                      title="حذف هذا الخيار"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-2 text-center py-2.5 bg-white/50 rounded-xl border border-dashed border-stone-200 text-stone-400 text-xs">
                المنتج لديه سعر واحد أساسي حالياً. انقر على «+ إضافة خيار سعر» لإضافة أحجام أو مقاسات متعددة.
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="product-description" className="block text-xs font-bold text-stone-700 mb-1">
              الوصف والمواصفات التفصيلية
            </label>
            <textarea
              id="product-description"
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
              disabled={saving || uploading}
              className="px-5 py-2.5 text-xs font-bold text-stone-600 hover:bg-stone-100 rounded-xl transition-colors disabled:opacity-50"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={saving || uploading}
              className="px-6 py-2.5 text-xs font-extrabold bg-[#443000] hover:bg-[#5c4205] text-white rounded-xl shadow-sm transition-all disabled:opacity-50"
            >
              {saving || uploading
                ? uploading
                  ? 'جاري رفع الصورة إلى قاعدة البيانات...'
                  : 'جاري الحفظ والتعميم...'
                : 'حفظ التعديلات'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
