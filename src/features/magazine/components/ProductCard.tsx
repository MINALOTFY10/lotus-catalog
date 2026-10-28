import React from 'react';
import Link from 'next/link';
import { ProductData } from '../types';

interface ProductCardProps {
  product?: ProductData | null;
  titleOverride?: string | null;
  descriptionOverride?: string | null;
  priceOverride?: number | null;
  imageOverride?: string | null;
  isInteractive?: boolean;
  isHighlighted?: boolean;
}

export function ProductCard({
  product,
  titleOverride,
  descriptionOverride,
  priceOverride,
  imageOverride,
  isInteractive = true,
  isHighlighted = false,
}: ProductCardProps) {
  if (!product && !titleOverride) {
    return <div className="w-full h-full" />;
  }

  const rawTitle = titleOverride || product?.name_ar || '';
  if (rawTitle.startsWith('منتج لوتس')) {
    return <div className="w-full h-full" />;
  }

  const title = rawTitle || 'منتج لوتس';
  const description = descriptionOverride || product?.description_ar || '';
  const price = priceOverride !== undefined && priceOverride !== null ? priceOverride : product?.sale_price;
  const imageUrl = imageOverride || product?.primary_image_url || '/brand/lotus_logo.png';
  const slug = product?.slug || '#';
  const hasDescription = Boolean(description && description.trim());
  const copyLength = title.length + description.length;
  const isDense = copyLength > 300 || title.length > 80;
  const isCompact = !isDense && (copyLength > 180 || title.length > 45);
  const imageShare = hasDescription ? (isDense ? 22 : isCompact ? 30 : 40) : 56;
  const titleFontSize = title.length > 80 ? 7.6 : title.length > 45 ? 8.6 : 9.6;
  const descriptionFontSize = isDense ? 6.2 : isCompact ? 6.8 : 7.4;

  const cardContent = (
    <div
      className={`w-full h-full flex flex-col justify-between overflow-hidden bg-white shadow-[0_1px_4px_rgba(0,0,0,0.07)] hover:shadow-lg transition-all duration-300 rounded-[calc(6*var(--u,1px))] ${
        isHighlighted
          ? 'border-2 border-[#B68763] ring-4 ring-[#B68763]/40 shadow-[0_0_25px_rgba(182,135,99,0.5)] scale-[1.03] z-20 animate-pulse'
          : 'border border-stone-200/90 hover:border-[#B68763]/60'
      }`}
    >
      <div
        className="w-full shrink-0 overflow-hidden bg-stone-50/60 flex items-center justify-center relative border-b border-stone-100"
        style={{ flexBasis: `${imageShare}%`, height: `${imageShare}%` }}
      >
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          loading="lazy"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = '/brand/lotus_logo.png';
            target.className = 'w-12 h-12 object-contain opacity-25 p-2';
          }}
        />
      </div>

      <div
        className="flex-1 flex flex-col justify-between min-h-0 bg-white"
        style={{
          padding: 'calc(8 * var(--u, 1px)) calc(9 * var(--u, 1px)) calc(8 * var(--u, 1px))',
        }}
      >
        <div className="min-w-0 flex-1 flex flex-col justify-start">
          <h3
            className="font-extrabold text-[#443000] tracking-tight"
            title={title}
            style={{
              fontSize: `calc(${titleFontSize} * var(--u, 1px))`,
              lineHeight: 1.28,
              overflowWrap: 'break-word',
            }}
          >
            {title}
          </h3>

          {/* Description */}
          {hasDescription && (
            <p
              className="text-stone-600 opacity-90 leading-snug mt-[calc(2.5*var(--u,1px))]"
              title={description}
              style={{
                fontSize: `calc(${descriptionFontSize} * var(--u, 1px))`,
                lineHeight: 1.25,
                overflowWrap: 'break-word',
              }}
            >
              {description}
            </p>
          )}
        </div>

        {price !== undefined && price !== null && (
          <div
            className="mt-auto flex items-baseline justify-between border-t border-stone-100 shrink-0"
            style={{
              paddingTop: 'calc(5 * var(--u, 1px))',
            }}
          >
            <span
              className="font-bold select-none"
              style={{
                color: 'var(--mag-accent, #B68763)',
                fontSize: 'calc(8.5 * var(--u, 1px))',
              }}
            >
              السعر
            </span>
            <span
              dir="ltr"
              className="font-extrabold tracking-tight select-none"
              style={{
                color: 'var(--mag-ink, #443000)',
                fontSize: 'calc(10.5 * var(--u, 1px))',
                fontFamily: 'var(--mag-font-en)',
              }}
            >
              {price} L.E
            </span>
          </div>
        )}
      </div>
    </div>
  );

  if (!isInteractive || !product?.slug) {
    return cardContent;
  }

  return (
    <Link href={`/products/${slug}`} className="block w-full h-full no-underline">
      {cardContent}
    </Link>
  );
}
