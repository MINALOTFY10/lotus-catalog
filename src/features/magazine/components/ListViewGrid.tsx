'use client';

import React from 'react';
import { MagazinePageData } from '../types';
import { ProductCard } from './ProductCard';

interface ListViewGridProps {
  pages: MagazinePageData[];
}

export function ListViewGrid({ pages }: ListViewGridProps) {
  return (
    <div className="w-full max-w-6xl mx-auto py-8 px-4 flex flex-col gap-12">
      {pages.map((page) => (
        <section key={page.position} className="flex flex-col gap-4">
          <div className="flex items-center justify-between pb-2 border-b-2 border-[#B68763]/30">
            <h2 className="text-xl font-extrabold text-[#443000]">
              {page.section_title || 'مجموعة التراث المصري'}
            </h2>
            <span className="text-xs font-bold px-2.5 py-1 bg-[#B68763]/10 text-[#B68763] rounded-full">
              صفحة {page.position}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
            {page.slots.map((slot) => (
              <div key={slot.slot} className="h-[360px]">
                <ProductCard
                  product={slot.product}
                  titleOverride={slot.title_override}
                  descriptionOverride={slot.description_override}
                  priceOverride={slot.price_override}
                  imageOverride={slot.image_override}
                  isInteractive={true}
                />
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
