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
  priority?: boolean;
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
  priority = false,
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

  // Canva card: image = 151.2px of 283.5px = 53.3% of the card height
  const finalImageShare = imageShare ?? 53.3;

  // Split priceText into golden label and value
  let priceLabel = 'السعر';
  let priceVal = priceText
    ? priceText.trim()
    : price !== undefined && price !== null
    ? `${price} L.E`
    : 'حسب الاختيار';

  if (priceText) {
    // Clean any stray prefix like "الالسعر" or "الـالسعر"
    const cleanText = priceText.replace(/^ال+السعر/, 'السعر').trim();

    if (cleanText.includes('المقاس والسعر')) {
      priceLabel = 'المقاس والسعر';
      priceVal = cleanText.replace('المقاس والسعر', '').trim();
    } else if (cleanText.includes('الحجم والسعر')) {
      priceLabel = 'الحجم والسعر';
      priceVal = cleanText.replace('الحجم والسعر', '').trim();
    } else if (cleanText.includes('الوزن والسعر')) {
      priceLabel = 'الوزن والسعر';
      priceVal = cleanText.replace('الوزن والسعر', '').trim();
    } else if (cleanText.includes('السعر')) {
      priceLabel = 'السعر';
      priceVal = cleanText.replace('السعر', '').trim();
    } else if (cleanText.includes('سم')) {
      priceLabel = 'المقاس والسعر';
      priceVal = cleanText;
    } else if (
      cleanText.includes('جرام') ||
      cleanText.includes('كيلو') ||
      cleanText.includes('مل') ||
      cleanText.includes('لتر')
    ) {
      priceLabel = 'الحجم والسعر';
      priceVal = cleanText;
    } else {
      priceVal = cleanText;
    }
  }

  // Format title into 2 authentic lines matching Canva where appropriate
  let formattedTitle: React.ReactNode = title;
  if (title.includes('عسل نحلة عسل')) {
    formattedTitle = (
      <>
        <span className="block">عسل نحلة</span>
        <span className="block">{title.replace('عسل نحلة ', '')}</span>
      </>
    );
  } else if (title.includes('تمور نخلة رطب')) {
    formattedTitle = (
      <>
        <span className="block">تمور نخلة</span>
        <span className="block">رطب سكري</span>
      </>
    );
  } else if (title.includes('حقيبة من الحلفا مع')) {
    formattedTitle = (
      <>
        <span className="block">حقيبة من الحلفا</span>
        <span className="block">مع اختيارك من منتجات نحلة</span>
      </>
    );
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
          loading={priority ? 'eager' : 'lazy'}
          fetchPriority={priority ? 'high' : 'auto'}
          decoding="async"
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
          // Canva: 9.45px side inset, ~11.7px below the image, 9.5px above the card bottom
          padding: 'calc(8.8 * var(--u, 1px)) calc(7.1 * var(--u, 1px)) calc(7.1 * var(--u, 1px))',
          direction: 'rtl',
        }}
      >
        <div className="min-w-0 flex-1 flex flex-col justify-start overflow-hidden text-right">
          {/* Title: Canva ~13.33px bold, slightly enlarged to 11.2u (+12%) for enhanced legibility */}
          <h3
            className="font-bold text-right"
            title={title}
            style={{
              fontSize: 'calc(11.2 * var(--u, 1px))',
              lineHeight: 1.35,
              color: 'var(--mag-text)',
              overflowWrap: 'break-word',
              fontFamily: 'var(--mag-font-ar)',
            }}
          >
            {formattedTitle}
          </h3>

          {/* Description: Canva ~8.5px regular, slightly enlarged to 7.4u */}
          {hasDescription && (
            <p
              className="font-normal select-text text-right line-clamp-2"
              title={description}
              style={{
                marginTop: 'calc(2.5 * var(--u, 1px))',
                fontSize: 'calc(7.4 * var(--u, 1px))',
                lineHeight: 1.35,
                color: 'rgba(68, 48, 0, 0.8)',
                overflowWrap: 'break-word',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                fontFamily: 'var(--mag-font-ar)',
              }}
            >
              {description}
            </p>
          )}
        </div>

        {/* Price block: Canva ~9.33px, slightly enlarged to 8.4u / 9.1u for extra clarity */}
        <div
          className="shrink-0 select-none text-right"
          style={{
            marginTop: 'calc(2.5 * var(--u, 1px))',
            fontSize: 'calc(8.4 * var(--u, 1px))',
            lineHeight: 1.35,
            color: 'var(--mag-text)',
            fontFamily: 'var(--mag-font-ar)',
          }}
        >
          <span className="font-bold block" style={{ color: 'var(--mag-label-gold)' }}>
            {priceLabel}
          </span>
          {priceVal.split('\n').map((line, idx) => {
            let cleanLine = line.trim();
            // Discard stray "ال", "الـ", "ا" or empty lines
            if (!cleanLine || cleanLine === 'ال' || cleanLine === 'الـ' || cleanLine === 'ا') return null;

            // Normalize currency order if currency was placed before number (e.g. "ج.مصري ٤٠٥" -> "٤٠٥ ج.مصري")
            cleanLine = cleanLine.replace(/^(ج\.مصري|ج\.م|ج)\s+([٠-٩0-9]+(?:\.[٠-٩0-9]+)?)/, '$2 $1');

            if (!cleanLine.includes('|')) {
              return (
                <span
                  key={idx}
                  className="block font-bold"
                  style={{
                    fontSize: 'calc(9.1 * var(--u, 1px))',
                    fontFamily: cleanLine.includes('L.E') ? 'var(--mag-font-en)' : 'var(--mag-font-ar)',
                  }}
                >
                  {cleanLine}
                </span>
              );
            }

            const parts = cleanLine.split('|');
            let p1 = parts[0].trim();
            let p2 = parts[1].trim();

            // Also check p2 if currency was before number: e.g. "ج.مصري 405" -> "405 ج.مصري"
            p2 = p2.replace(/^(ج\.مصري|ج\.م|ج)\s+([٠-٩0-9]+(?:\.[٠-٩0-9]+)?)/, '$2 $1');

            const currencyKeywords = ['ج.مصري', 'ج.م', 'ج', 'l.e', 'le', 'egp'];
            const sizeKeywords = ['سم', 'قطر', '*', 'جرام', 'كيلو', 'مل', 'لتر', 'صغير', 'كبير', 'وسط', 'قفطان', 'بنطلون'];

            const p1Lower = p1.toLowerCase();
            const p2Lower = p2.toLowerCase();

            const p1HasCurrency = currencyKeywords.some((c) => p1Lower.includes(c));
            const p2HasCurrency = currencyKeywords.some((c) => p2Lower.includes(c));

            const p1HasSize = sizeKeywords.some((s) => p1.includes(s));
            const p2HasSize = sizeKeywords.some((s) => p2.includes(s));

            let isP1Price = false;
            if (p1HasCurrency && !p2HasCurrency) {
              isP1Price = true;
            } else if (p2HasCurrency && !p1HasCurrency) {
              isP1Price = false;
            } else if (p1HasSize && !p2HasSize) {
              isP1Price = false;
            } else if (p2HasSize && !p1HasSize) {
              isP1Price = true;
            } else {
              const p1Digits = (p1.match(/[0-9٠-٩]/g) || []).length;
              const p2Digits = (p2.match(/[0-9٠-٩]/g) || []).length;
              isP1Price = p1Digits >= p2Digits;
            }

            return (
              <span
                key={idx}
                className="block"
                style={{
                  fontSize: 'calc(9.1 * var(--u, 1px))',
                  fontFamily: cleanLine.includes('L.E') ? 'var(--mag-font-en)' : 'var(--mag-font-ar)',
                }}
              >
                <span className={isP1Price ? 'font-bold' : 'font-normal'}>{p1}</span>
                <span className="font-normal text-stone-400 mx-1">|</span>
                <span className={isP1Price ? 'font-normal' : 'font-bold'}>{p2}</span>
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
