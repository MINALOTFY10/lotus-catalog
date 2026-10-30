'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { ProductData } from '../types';

interface ProductDetailModalProps {
  product: ProductData | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ProductDetailModal({
  product,
  isOpen,
  onClose,
}: ProductDetailModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen || !product) return null;

  const title = product.name_ar || 'منتج لوتس';
  const description = product.description_ar || 'منتج أصيل من كتالوج لوتس للتراث المصري.';
  const imageUrl = product.primary_image_url || '/brand/lotus_logo.png';
  const price = product.sale_price;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-product-title"
      dir="rtl"
    >
      <div
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[92vh] flex flex-col overflow-hidden border border-[#E8DEC8] animate-in zoom-in-95 duration-200 relative"
      >
        {/* Header with Close Button */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-stone-100 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#B68763]" />
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
              تفاصيل المنتج
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 hover:text-stone-900 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="إغلاق النافذة"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* High-Resolution Product Image Frame */}
          <div className="w-full bg-stone-50/80 rounded-2xl p-4 flex items-center justify-center border border-stone-200/60 shadow-inner min-h-[220px] max-h-[300px]">
            <img
              src={imageUrl}
              alt={title}
              className="max-h-64 w-auto object-contain drop-shadow-md hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/brand/lotus_logo.png';
              }}
            />
          </div>

          {/* Product Category & Status */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            {product.category && (
              <span className="text-xs font-bold text-[#B68763] bg-[#FAF6F0] px-3 py-1 rounded-full border border-[#E8DEC8]">
                {product.category}
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200/60">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              متوفر للطلب
            </span>
          </div>

          {/* Title */}
          <h2
            id="modal-product-title"
            className="text-xl sm:text-2xl font-extrabold text-[#3B2904] leading-snug tracking-tight"
          >
            {title}
          </h2>

          {/* Description */}
          <p className="text-sm sm:text-base text-stone-600 leading-relaxed font-normal select-text">
            {description}
          </p>

          {/* Price Section */}
          <div className="pt-4 border-t border-stone-100 flex items-baseline justify-between">
            <span className="text-sm font-bold text-[#B68763]">السعر الأصلي</span>
            <span className="text-2xl sm:text-3xl font-black text-[#443000] tracking-tight">
              {price ? `${price} ج.مصري` : 'يحدد حسب الاختيار'}
            </span>
          </div>
        </div>

        {/* Action Footer */}
        <div className="p-4 sm:p-5 bg-stone-50/80 border-t border-stone-100 flex items-center gap-3 shrink-0">
          <Link
            href={`/products/${product.slug}`}
            className="flex-1 py-3 px-4 rounded-xl bg-[#443000] hover:bg-[#322300] text-[#FFFFFF] text-center font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <span>عرض الصفحة الكاملة للمنتج</span>
            <svg className="w-4 h-4 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
          <button
            onClick={onClose}
            className="py-3 px-5 rounded-xl bg-white hover:bg-stone-100 text-stone-700 font-bold text-sm border border-stone-200/80 transition-colors cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
}
