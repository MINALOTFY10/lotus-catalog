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

  const cardContent = (
    <div
      className={`product-card group w-full h-full flex flex-col justify-between overflow-hidden bg-gradient-to-b from-white via-[#FDFCFA] to-[#FAF7F2] shadow-[0_2px_6px_rgba(40,30,15,0.05)] hover:shadow-[0_10px_24px_rgba(182,135,99,0.18)] transition-all duration-300 rounded-[calc(7*var(--u,1px))] ${
        isHighlighted
          ? 'border-2 border-[#B68763] ring-4 ring-[#B68763]/40 shadow-[0_0_25px_rgba(182,135,99,0.5)] scale-[1.03] z-20 animate-pulse'
          : 'border border-[#E8DEC8]/80 hover:border-[#B68763]/70 hover:-translate-y-[calc(1.5*var(--u,1px))]'
      }`}
    >
      {/* Product Image Area */}
      <div
        className="w-full shrink-0 overflow-hidden bg-stone-50/80 flex items-center justify-center relative border-b border-[#EFE7DC]/80"
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
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Product Information Area */}
      <div
        className="flex-1 flex flex-col justify-between min-h-0"
        style={{
          padding: 'calc(6 * var(--u, 1px)) calc(8 * var(--u, 1px)) calc(5.5 * var(--u, 1px))',
        }}
      >
        <div className="min-w-0 flex-1 flex flex-col justify-start overflow-hidden">
          {/* Title */}
          <h3
            className="font-extrabold text-[#3B2904] tracking-tight leading-snug"
            title={title}
            style={{
              fontSize: 'calc(9.5 * var(--u, 1px))',
              overflowWrap: 'break-word',
            }}
          >
            {title}
          </h3>

          {/* Arabic Description */}
          {hasDescription && (
            <p
              className="text-stone-600 font-medium opacity-90 leading-relaxed mt-[calc(3.5*var(--u,1px))] select-text"
              title={description}
              style={{
                fontSize: 'calc(7.6 * var(--u, 1px))',
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

        {/* Price Tag Footer */}
        <div
          className="mt-auto flex items-baseline justify-between border-t border-[#EDE4D5]/90 shrink-0"
          style={{
            paddingTop: 'calc(3.5 * var(--u, 1px))',
            marginTop: 'calc(2.5 * var(--u, 1px))',
          }}
        >
          <span
            className="font-bold select-none text-[#B68763] tracking-wide"
            style={{
              fontSize: 'calc(8 * var(--u, 1px))',
            }}
          >
            السعر
          </span>
          <span
            dir="ltr"
            className="font-extrabold tracking-tight select-none text-[#3B2904]"
            style={{
              fontSize: 'calc(10 * var(--u, 1px))',
              fontFamily: 'var(--mag-font-en)',
            }}
          >
            {priceText && !priceText.includes('ج.مصري')
              ? priceText
              : price !== undefined && price !== null
              ? `${price} L.E`
              : 'حسب الاختيار'}
          </span>
        </div>
      </div>
    </div>
  );

  if (!isInteractive || !slug || slug === '#') {
    return cardContent;
  }

  return (
    <Link href={`/products/${slug}`} className="block w-full h-full no-underline">
      {cardContent}
    </Link>
  );
}
