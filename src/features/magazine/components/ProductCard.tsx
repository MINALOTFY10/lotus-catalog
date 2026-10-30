'use client';

import React from 'react';
import Link from 'next/link';
import { ProductData } from '../types';

interface ProductCardProps {
  product?: ProductData | null;
  titleOverride?: string | null;
  descriptionOverride?: string | null;
  priceOverride?: number | null;
  priceText?: string | null;
  imageOverride?: string | null;
  isInteractive?: boolean;
  isHighlighted?: boolean;
  imageShare?: number; // Optional custom height % for image
  onSelect?: (product: ProductData) => void;
}

export function ProductCard({
  product,
  titleOverride,
  descriptionOverride,
  priceOverride,
  priceText,
  imageOverride,
  isInteractive = true,
  isHighlighted = false,
  imageShare,
  onSelect,
}: ProductCardProps) {
  if (!product && !titleOverride) {
    return <div className="product-card w-full h-full" />;
  }

  const title = (titleOverride || product?.name_ar || '').trim();
  const description = (descriptionOverride || product?.description_ar || '').trim();
  const price = priceOverride !== undefined && priceOverride !== null ? priceOverride : product?.sale_price;
  const imageUrl = imageOverride || product?.primary_image_url || '/brand/lotus_logo.png';
  const slug = product?.slug || '#';
  const hasDescription = Boolean(description && description.length > 0);

  // Dynamic image percentage based on description presence
  const finalImageShare = imageShare ?? (hasDescription ? 48 : 62);

  // Split priceText into golden label and value
  let priceLabel = 'السعر';
  let priceVal = priceText
    ? priceText.trim()
    : price !== undefined && price !== null
    ? `${price} L.E`
    : 'حسب الاختيار';

  if (priceText) {
    if (priceText.includes('المقاس والسعر')) {
      priceLabel = 'المقاس والسعر';
      priceVal = priceText.replace('المقاس والسعر', '').trim();
    } else if (priceText.includes('الحجم والسعر')) {
      priceLabel = 'الحجم والسعر';
      priceVal = priceText.replace('الحجم والسعر', '').trim();
    } else if (priceText.includes('الوزن والسعر')) {
      priceLabel = 'الوزن والسعر';
      priceVal = priceText.replace('الوزن والسعر', '').trim();
    } else if (priceText.includes('السعر')) {
      priceLabel = 'السعر';
      priceVal = priceText.replace('السعر', '').trim();
    } else if (priceText.includes('سم')) {
      priceLabel = 'المقاس والسعر';
    } else if (
      priceText.includes('جرام') ||
      priceText.includes('كيلو') ||
      priceText.includes('مل') ||
      priceText.includes('لتر')
    ) {
      priceLabel = 'الحجم والسعر';
    }
  }

  const cardContent = (
    <div
      className={`product-card group w-full h-full flex flex-col justify-between overflow-hidden bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_20px_rgba(0,0,0,0.08)] transition-all duration-300 rounded-[calc(5*var(--u,1px))] ${
        isHighlighted
          ? 'border-2 border-[#C39B42] ring-4 ring-[#C39B42]/40 shadow-[0_0_25px_rgba(195,155,66,0.5)] scale-[1.03] z-20 animate-pulse'
          : 'border border-stone-200/70 hover:border-stone-300 hover:-translate-y-[calc(1*var(--u,1px))]'
      }`}
    >
      {/* Product Image Area - Clean edge-to-edge top matching Canva */}
      <div
        className="w-full shrink-0 overflow-hidden bg-white flex items-center justify-center relative"
        style={{ flexBasis: `${finalImageShare}%`, height: `${finalImageShare}%` }}
      >
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = '/brand/lotus_logo.png';
            target.className = 'w-12 h-12 object-contain opacity-25 p-2';
          }}
        />
        <div className="absolute inset-0 pointer-events-none bg-black/0 group-hover:bg-black/3 transition-colors duration-300" />
      </div>

      {/* Product Information Area - RTL right-aligned */}
      <div
        className="flex-1 flex flex-col justify-between min-h-0 text-right"
        style={{
          padding: 'calc(5 * var(--u, 1px)) calc(7 * var(--u, 1px)) calc(5.5 * var(--u, 1px))',
          direction: 'rtl',
        }}
      >
        <div className="min-w-0 flex-1 flex flex-col justify-start overflow-hidden text-right">
          {/* Title */}
          <h3
            className="font-bold text-[#191919] tracking-tight leading-snug text-right"
            title={title}
            style={{
              fontSize: 'calc(9.8 * var(--u, 1px))',
              overflowWrap: 'break-word',
            }}
          >
            {title}
          </h3>

          {/* Arabic Description */}
          {hasDescription && (
            <p
              className="text-[#444444] font-normal leading-normal mt-[calc(2.5*var(--u,1px))] select-text line-clamp-2 text-right"
              title={description}
              style={{
                fontSize: 'calc(7.2 * var(--u, 1px))',
                lineHeight: 1.35,
                overflowWrap: 'break-word',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {description}
            </p>
          )}
        </div>

        {/* Price & Specs Area - Authentic stacked right-aligned format */}
        <div
          className="mt-auto shrink-0 select-none text-right"
          style={{
            marginTop: 'calc(2.5 * var(--u, 1px))',
          }}
        >
          <span
            className="font-bold block tracking-normal text-[#C39B42]"
            style={{
              fontSize: 'calc(7.2 * var(--u, 1px))',
            }}
          >
            {priceLabel}
          </span>
          {priceVal.split('\n').map((line, idx) => {
            const cleanLine = line.trim();
            if (!cleanLine) return null;
            return (
              <span
                key={idx}
                className="font-bold text-[#191919] block leading-tight mt-[calc(1.5*var(--u,1px))]"
                style={{
                  fontSize: 'calc(8.8 * var(--u, 1px))',
                  fontFamily: cleanLine.includes('L.E') ? 'var(--mag-font-en)' : 'inherit',
                }}
              >
                {cleanLine}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );

  if (onSelect && product && isInteractive) {
    return (
      <button
        type="button"
        onClick={() => onSelect(product)}
        className="block w-full h-full text-right no-underline cursor-pointer bg-transparent border-0 p-0"
        aria-label={`عرض تفاصيل ${title}`}
      >
        {cardContent}
      </button>
    );
  }

  if (!isInteractive || !slug || slug === '#') {
    return cardContent;
  }

  return (
    <Link href={`/products/${slug}`} className="block w-full h-full no-underline cursor-pointer">
      {cardContent}
    </Link>
  );
}
