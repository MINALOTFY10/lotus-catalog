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
  const isLongTitle = title.length > 50;
  const isLongDescription = description.length > 120;
  
  // Consistent image share for clean grid alignment across rows
  const imageShare = hasDescription ? (isLongTitle ? 39 : 42) : 54;
  const titleFontSize = title.length > 70 ? 8.6 : title.length > 40 ? 9.4 : 10.2;
  const descriptionFontSize = isLongDescription ? 7.3 : 7.9;

  const cardContent = (
    <div
      className={`group w-full h-full flex flex-col justify-between overflow-hidden bg-gradient-to-b from-white via-[#FDFCFA] to-[#FAF7F2] shadow-[0_2px_6px_rgba(40,30,15,0.05)] hover:shadow-[0_10px_24px_rgba(182,135,99,0.18)] transition-all duration-300 rounded-[calc(7*var(--u,1px))] ${
        isHighlighted
          ? 'border-2 border-[#B68763] ring-4 ring-[#B68763]/40 shadow-[0_0_25px_rgba(182,135,99,0.5)] scale-[1.03] z-20 animate-pulse'
          : 'border border-[#E8DEC8]/80 hover:border-[#B68763]/70 hover:-translate-y-[calc(1.5*var(--u,1px))]'
      }`}
    >
      {/* Product Image Area */}
      <div
        className="w-full shrink-0 overflow-hidden bg-stone-50/80 flex items-center justify-center relative border-b border-[#EFE7DC]/80"
        style={{ flexBasis: `${imageShare}%`, height: `${imageShare}%` }}
      >
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-108"
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
          padding: 'calc(7 * var(--u, 1px)) calc(8.5 * var(--u, 1px)) calc(6.5 * var(--u, 1px))',
        }}
      >
        <div className="min-w-0 flex-1 flex flex-col justify-start overflow-hidden">
          {/* Title */}
          <h3
            className="font-extrabold text-[#3B2904] tracking-tight"
            title={title}
            style={{
              fontSize: `calc(${titleFontSize} * var(--u, 1px))`,
              lineHeight: 1.32,
              overflowWrap: 'break-word',
            }}
          >
            {title}
          </h3>

          {/* Arabic Description */}
          {hasDescription && (
            <p
              className="text-stone-600 font-medium opacity-90 leading-relaxed mt-[calc(4.5*var(--u,1px))] select-text line-clamp-2"
              title={description}
              style={{
                fontSize: `calc(${descriptionFontSize} * var(--u, 1px))`,
                lineHeight: 1.42,
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
        {price !== undefined && price !== null && (
          <div
            className="mt-auto flex items-baseline justify-between border-t border-[#EDE4D5]/90 shrink-0"
            style={{
              paddingTop: 'calc(4.5 * var(--u, 1px))',
              marginTop: 'calc(3.5 * var(--u, 1px))',
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
