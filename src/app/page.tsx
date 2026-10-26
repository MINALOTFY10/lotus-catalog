'use client';

import React, { useState } from 'react';
import { Grid3x3Page } from '@/features/magazine/components/Grid3x3Page';
import { PageSlotData } from '@/features/magazine/types';

const SAMPLE_SLOTS: PageSlotData[] = [
  {
    slot: 1,
    product: {
      id: 'p1',
      cashier_code: 1,
      slug: 'honey-1-5kg',
      name_ar: 'عسل كيلو و نص',
      description_ar: 'عسل نقي طبيعي فاخر من مناحل الصندوق غني بالطاقة والإنزيمات',
      sale_price: 620,
      primary_image_url: '/brand/lotus_logo.png',
    },
  },
  {
    slot: 2,
    product: {
      id: 'p2',
      cashier_code: 2,
      slug: 'honey-650g-plain',
      name_ar: 'عسل 650 جرام ساده',
      description_ar: 'عسل نحل طبيعي فاخر 100% زهرة البرسيم',
      sale_price: 385,
      primary_image_url: '/brand/lotus_logo.png',
    },
  },
  {
    slot: 3,
    product: {
      id: 'p3',
      cashier_code: 3,
      slug: 'honey-650g-nuts',
      name_ar: 'عسل 650 جرام مكسرات',
      description_ar: 'عسل مع تشكيلة مكسرات فاخرة مقرمشة',
      sale_price: 715,
      primary_image_url: '/brand/lotus_logo.png',
    },
  },
  {
    slot: 4,
    product: {
      id: 'p4',
      cashier_code: 4,
      slug: 'honey-650g-wax',
      name_ar: 'عسل 650 جرام شمع',
      description_ar: 'عسل مع قرص الشمع الطبيعي الخام',
      sale_price: 520,
      primary_image_url: '/brand/lotus_logo.png',
    },
  },
  {
    slot: 5,
    product: {
      id: 'p5',
      cashier_code: 5,
      slug: 'pottery-bottle-large',
      name_ar: 'ازازه فخار كبير',
      description_ar: 'مصنوع يدويًا فخار مصري تقليدي مبرد للماء',
      sale_price: 225,
      primary_image_url: '/brand/lotus_logo.png',
    },
  },
  {
    slot: 6,
    product: {
      id: 'p6',
      cashier_code: 6,
      slug: 'pottery-bottle-medium',
      name_ar: 'ازازه فخار وسط',
      description_ar: 'فخار صحي طبيعي بحرفية تراثية أصيلة',
      sale_price: 190,
      primary_image_url: '/brand/lotus_logo.png',
    },
  },
  {
    slot: 7,
    product: {
      id: 'p7',
      cashier_code: 7,
      slug: 'sarsoo-wood-set',
      name_ar: 'طقم خشب سرسوع',
      description_ar: 'طقم أواني وضيافة من خشب السرسوع الطبيعي الفاخر',
      sale_price: 1080,
      primary_image_url: '/brand/lotus_logo.png',
    },
  },
  {
    slot: 8,
    product: {
      id: 'p8',
      cashier_code: 8,
      slug: 'sarsoo-oval-set',
      name_ar: 'طقم خشب سرسوع بيضاوي',
      description_ar: 'صواني تقديم بيضاوية مشغولة يدويًا بنقوش بارزة',
      sale_price: 550,
      primary_image_url: '/brand/lotus_logo.png',
    },
  },
  {
    slot: 9,
    product: {
      id: 'p9',
      cashier_code: 9,
      slug: 'jewelry-earring-set',
      name_ar: 'طقم اكسسوار بحلق',
      description_ar: 'مجوهرات نحاسية براسس يدوية بتصميم فرعوني مع حلق متناسق',
      sale_price: 405,
      primary_image_url: '/brand/lotus_logo.png',
    },
  },
];

export default function Home() {
  const [scalePreset, setScalePreset] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  const widthStyle = {
    desktop: 'max-w-[720px] w-full',
    tablet: 'max-w-[520px] w-full',
    mobile: 'max-w-[360px] w-full',
  }[scalePreset];

  return (
    <div className="min-h-screen bg-stone-200/70 py-8 px-4 flex flex-col items-center justify-start">
      {/* Top Controls Bar */}
      <div className="w-full max-w-4xl bg-white rounded-xl shadow-sm border border-stone-200/80 p-4 mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#443000] flex items-center gap-2">
            <span>لوتس</span>
            <span className="text-xs px-2 py-0.5 bg-[#B68763]/15 text-[#B68763] rounded font-medium">
              معاينة الصفحة الحية (Canva Replica)
            </span>
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            نموذج A4 تفاعلي مع وحدات الاستعلام الحاوية (Container Queries) وتدرجات ألوان كانفا الأصلية
          </p>
        </div>

        {/* Responsive viewport presets */}
        <div className="flex items-center gap-2 bg-stone-100 p-1 rounded-lg text-xs font-medium">
          <button
            onClick={() => setScalePreset('desktop')}
            className={`px-3 py-1.5 rounded-md transition-all ${
              scalePreset === 'desktop'
                ? 'bg-white text-[#443000] shadow-sm font-bold'
                : 'text-stone-600 hover:text-black'
            }`}
          >
            كمبيوتر (720px)
          </button>
          <button
            onClick={() => setScalePreset('tablet')}
            className={`px-3 py-1.5 rounded-md transition-all ${
              scalePreset === 'tablet'
                ? 'bg-white text-[#443000] shadow-sm font-bold'
                : 'text-stone-600 hover:text-black'
            }`}
          >
            تابلت (520px)
          </button>
          <button
            onClick={() => setScalePreset('mobile')}
            className={`px-3 py-1.5 rounded-md transition-all ${
              scalePreset === 'mobile'
                ? 'bg-white text-[#443000] shadow-sm font-bold'
                : 'text-stone-600 hover:text-black'
            }`}
          >
            موبايل (360px)
          </button>
        </div>
      </div>

      {/* The A4 Canvas Container */}
      <div className={`${widthStyle} transition-all duration-300 mx-auto drop-shadow-2xl`}>
        <Grid3x3Page
          sectionTitle="مجموعة التراث المصري"
          pageNumber={6}
          slots={SAMPLE_SLOTS}
          isInteractive={true}
        />
      </div>
    </div>
  );
}
