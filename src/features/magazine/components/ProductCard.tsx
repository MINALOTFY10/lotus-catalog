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
}

export function ProductCard({
  product,
  titleOverride,
  descriptionOverride,
  priceOverride,
  imageOverride,
  isInteractive = true,
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
  const copyLength = title.length + description.length;
  const isDense = copyLength > 300 || title.length > 80;
  const isCompact = !isDense && (copyLength > 180 || title.length > 45);
  const imageShare = isDense ? 18 : isCompact ? 27 : 38;
  const titleFontSize = title.length > 80 ? 7.5 : title.length > 45 ? 8.5 : 9.5;
  const descriptionFontSize = isDense ? 6.2 : isCompact ? 6.6 : 7.2;

  const cardContent = (
    <div
      className="w-full h-full flex flex-col justify-between overflow-hidden bg-white shadow-[0_1px_3px_rgba(0,0,0,0.05)] hover:shadow-md transition-all duration-200 border border-stone-200/50 rounded-xs"
    >
      <div
        className="w-full shrink-0 overflow-hidden bg-stone-50 flex items-center justify-center relative"
        style={{ flexBasis: `${imageShare}%`, height: `${imageShare}%` }}
      >
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          loading="lazy"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = '/brand/lotus_logo.png';
            target.className = 'w-12 h-12 object-contain opacity-25 p-2';
          }}
        />
      </div>

      <div
        className="flex-1 flex flex-col justify-between"
        style={{
          padding: 'calc(4 * var(--u, 1px))',
          minHeight: 'max-content',
        }}
      >
        <div className="min-w-0 flex-none">
          <h3
            className="font-extrabold leading-tight text-[#443000]"
            title={title}
            style={{
              fontSize: `calc(${titleFontSize} * var(--u, 1px))`,
              lineHeight: 1.1,
              overflowWrap: 'anywhere',
            }}
          >
            {title}
          </h3>

          {/* Description */}
          {description && (
            <p
              className="leading-snug text-stone-600 opacity-85 mt-[calc(2*var(--u,1px))]"
              title={description}
              style={{
                fontSize: `calc(${descriptionFontSize} * var(--u, 1px))`,
                lineHeight: 1.15,
                overflowWrap: 'anywhere',
              }}
            >
              {description}
            </p>
          )}
        </div>

        {price !== undefined && price !== null && (
          <div
            className="mt-auto flex items-center justify-between border-t border-stone-100 shrink-0"
            style={{
              paddingTop: 'calc(3 * var(--u, 1px))',
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
