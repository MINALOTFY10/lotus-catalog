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
      <div className="w-full h-full bg-transparent border border-dashed border-stone-300/40 rounded flex items-center justify-center text-stone-400 text-[calc(9*var(--u,1px))]" />
    );
  }

  const title = titleOverride || product?.name_ar || 'منتج';
  const description = descriptionOverride || product?.description_ar || '';
  const price = priceOverride !== undefined && priceOverride !== null ? priceOverride : product?.sale_price;
  const imageUrl = imageOverride || product?.primary_image_url || '/brand/lotus_logo.png';
  const slug = product?.slug || '#';

  const cardContent = (
    <div
      className="w-full h-full flex flex-col justify-between overflow-hidden transition-all duration-200"
      style={{
        backgroundColor: 'var(--mag-card, #FFFFFF)',
        boxShadow: '0 calc(1*var(--u,1px)) calc(3*var(--u,1px)) rgba(0,0,0,0.06)',
      }}
    >
      {/* Top Image Container */}
      <div
        className="w-full overflow-hidden bg-stone-100 flex items-center justify-center relative"
        style={{ height: 'calc(130 * var(--u, 1px))' }}
      >
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          loading="lazy"
          onError={(e) => {
            // Graceful fallback to Lotus Logo if image fails
            (e.target as HTMLImageElement).src = '/brand/lotus_logo.png';
            (e.target as HTMLImageElement).className = 'w-16 h-16 object-contain opacity-30';
          }}
        />
      </div>

      {/* Content Container */}
      <div
        className="flex-1 flex flex-col justify-between"
        style={{
          padding: 'calc(8 * var(--u, 1px)) calc(7 * var(--u, 1px)) calc(6 * var(--u, 1px))',
        }}
      >
        <div>
          {/* Title */}
          <h3
            className="font-bold leading-snug line-clamp-2"
            style={{
              color: 'var(--mag-ink, #443000)',
              fontSize: 'calc(10.5 * var(--u, 1px))',
            }}
          >
            {title}
          </h3>

          {/* Description */}
          {description && (
            <p
              className="line-clamp-2 leading-relaxed opacity-85"
              style={{
                color: 'var(--mag-ink, #443000)',
                fontSize: 'calc(7.5 * var(--u, 1px))',
                marginTop: 'calc(4 * var(--u, 1px))',
              }}
            >
              {description}
            </p>
          )}
        </div>

        {/* Price Row */}
        <div
          className="flex items-baseline justify-between border-t border-stone-100/80"
          style={{
            marginTop: 'calc(6 * var(--u, 1px))',
            paddingTop: 'calc(4 * var(--u, 1px))',
          }}
        >
          <span
            className="font-bold"
            style={{
              color: 'var(--mag-accent, #B68763)',
              fontSize: 'calc(10 * var(--u, 1px))',
            }}
          >
            السعر
          </span>
          <span
            className="font-bold tracking-tight"
            style={{
              color: 'var(--mag-ink, #443000)',
              fontSize: 'calc(12 * var(--u, 1px))',
              fontFamily: 'var(--mag-font-en)',
            }}
          >
            {price !== undefined && price !== null ? `${price} L.E` : 'السعر عند الطلب'}
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
