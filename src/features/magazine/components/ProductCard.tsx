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
    return (
      <div className="w-full h-full bg-white/40 border border-dashed border-stone-300/40 rounded flex items-center justify-center text-stone-400 text-[calc(9*var(--u,1px))]" />
    );
  }

  const title = titleOverride || product?.name_ar || 'منتج لوتس';
  const description = descriptionOverride || product?.description_ar || '';
  const price = priceOverride !== undefined && priceOverride !== null ? priceOverride : product?.sale_price;
  const imageUrl = imageOverride || product?.primary_image_url || '/brand/lotus_logo.png';
  const slug = product?.slug || '#';

  const cardContent = (
    <div
      className="w-full h-full flex flex-col justify-between overflow-hidden bg-white shadow-[0_1px_4px_rgba(0,0,0,0.06)] hover:shadow-md transition-all duration-200 border border-stone-200/40 rounded-xs"
    >
      {/* Top Image: Fixed 50% height with clean object-cover */}
      <div className="w-full h-[50%] shrink-0 overflow-hidden bg-stone-50 flex items-center justify-center relative">
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

      {/* Content Container: Guaranteed No-Overflow */}
      <div
        className="flex-1 min-h-0 flex flex-col justify-between"
        style={{
          padding: 'calc(6 * var(--u, 1px)) calc(7 * var(--u, 1px)) calc(5 * var(--u, 1px))',
        }}
      >
        {/* Text Section with Strict Line Clamping */}
        <div className="overflow-hidden min-h-0">
          {/* Title */}
          <h3
            className="font-bold leading-tight line-clamp-1 truncate text-[#443000]"
            title={title}
            style={{
              fontSize: 'calc(9.5 * var(--u, 1px))',
            }}
          >
            {title}
          </h3>

          {/* Description */}
          {description && (
            <p
              className="line-clamp-2 leading-snug text-stone-600 opacity-85 mt-[calc(2.5*var(--u,1px))]"
              title={description}
              style={{
                fontSize: 'calc(7.2 * var(--u, 1px))',
              }}
            >
              {description}
            </p>
          )}
        </div>

        {/* Bottom Price Row: Dedicated pinned footer, never collides with text */}
        <div
          className="mt-auto flex items-center justify-between border-t border-stone-100 shrink-0"
          style={{
            paddingTop: 'calc(3.5 * var(--u, 1px))',
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
            {price !== undefined && price !== null ? `${price} L.E` : 'عند الطلب'}
          </span>
        </div>
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
