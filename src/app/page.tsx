'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Grid3x3Page } from '@/features/magazine/components/Grid3x3Page';
import { PageSlotData } from '@/features/magazine/types';
import { PublicHeader } from '@/components/layout/PublicHeader';
import { PublicFooter } from '@/components/layout/PublicFooter';

const SAMPLE_SLOTS: PageSlotData[] = [
  {
    slot: 1,
    product: {
      id: 'p1',
      cashier_code: 1,
      slug: 'prod-1-عسل-كيلو-و-نص',
      name_ar: 'عسل كيلو و نص',
      description_ar: 'عسل نقي طبيعي فاخر من مناحل الصندوق غني بالطاقة والإنزيمات',
      sale_price: 620,
      primary_image_url: '/uploads/products/image1.jpg',
    },
  },
  {
    slot: 2,
    product: {
      id: 'p2',
      cashier_code: 2,
      slug: 'prod-2-عسل-650-جرام-ساده',
      name_ar: 'عسل 650 جرام ساده',
      description_ar: 'عسل نحل طبيعي فاخر 100% زهرة البرسيم',
      sale_price: 385,
      primary_image_url: '/uploads/products/image10.jpg',
    },
  },
  {
    slot: 3,
    product: {
      id: 'p3',
      cashier_code: 3,
      slug: 'prod-3-عسل-650-جرام-مكسرات',
      name_ar: 'عسل 650 جرام مكسرات',
      description_ar: 'عسل مع تشكيلة مكسرات فاخرة مقرمشة',
      sale_price: 715,
      primary_image_url: '/uploads/products/image18.jpg',
    },
  },
  {
    slot: 4,
    product: {
      id: 'p4',
      cashier_code: 4,
      slug: 'prod-4-عسل-650-جرام-شمع',
      name_ar: 'عسل 650 جرام شمع',
      description_ar: 'عسل مع قرص الشمع الطبيعي الخام',
      sale_price: 520,
      primary_image_url: '/uploads/products/image20.jpg',
    },
  },
  {
    slot: 5,
    product: {
      id: 'p5',
      cashier_code: 5,
      slug: 'prod-5-ازازه-فخار-كبير',
      name_ar: 'ازازه فخار كبير',
      description_ar: 'مصنوع يدويًا فخار مصري تقليدي مبرد للماء',
      sale_price: 225,
      primary_image_url: '/uploads/products/image26.jpg',
    },
  },
  {
    slot: 6,
    product: {
      id: 'p6',
      cashier_code: 6,
      slug: 'prod-6-ازازه-فخار-وسط',
      name_ar: 'ازازه فخار وسط',
      description_ar: 'فخار صحي طبيعي بحرفية تراثية أصيلة',
      sale_price: 190,
      primary_image_url: '/uploads/products/image28.jpg',
    },
  },
  {
    slot: 7,
    product: {
      id: 'p7',
      cashier_code: 7,
      slug: 'prod-7-طقم-خشب-سرسوع',
      name_ar: 'طقم خشب سرسوع',
      description_ar: 'طقم أواني وضيافة من خشب السرسوع الطبيعي الفاخر',
      sale_price: 1080,
      primary_image_url: '/uploads/products/image34.jpg',
    },
  },
  {
    slot: 8,
    product: {
      id: 'p8',
      cashier_code: 8,
      slug: 'prod-8-طقم-خشب-سرسوع-بيضاوي',
      name_ar: 'طقم خشب سرسوع بيضاوي',
      description_ar: 'صواني تقديم بيضاوية مشغولة يدويًا بنقوش بارزة',
      sale_price: 550,
      primary_image_url: '/uploads/products/image35.jpg',
    },
  },
  {
    slot: 9,
    product: {
      id: 'p9',
      cashier_code: 9,
      slug: 'prod-9-طقم-اكسسوار-بحلق',
      name_ar: 'طقم اكسسوار بحلق',
      description_ar: 'مجوهرات نحاسية براسس يدوية بتصميم فرعوني مع حلق متناسق',
      sale_price: 405,
      primary_image_url: '/uploads/products/image36.jpg',
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
    <div className="min-h-screen flex flex-col bg-stone-100/60">
      <PublicHeader />

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-white via-amber-50/30 to-stone-100 py-12 sm:py-16 border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-[#B68763]/15 text-[#443000] text-xs font-bold px-4 py-1.5 rounded-full mb-6">
            <span className="w-2 h-2 rounded-full bg-[#B68763] animate-pulse"></span>
            <span>تصميم كانفا الأصلي طبق الأصل A4 (Canva Replica)</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-[#443000] tracking-tight mb-4 max-w-3xl mx-auto leading-tight">
            مجلة وكتالوج لوتس للمنتجات اليدوية والتراثية
          </h1>

          <p className="text-stone-600 text-sm sm:text-base max-w-2xl mx-auto mb-8 leading-relaxed">
            استمتع بتجربة تقليب صفحات المجلة بتقنية 3D التفاعلية على أبعاد ورقة A4 الدقيقة، أو تصفح دليل المنتجات الكامل مع البحث والتفاصيل الفورية.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/magazine"
              className="bg-[#443000] hover:bg-[#5c4205] text-white font-extrabold text-sm sm:text-base px-8 py-3.5 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-3"
            >
              <span>فتح المجلة التفاعلية (A4)</span>
              <svg className="w-5 h-5 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>

            <Link
              href="/products"
              className="bg-white hover:bg-stone-50 text-[#443000] font-bold text-sm sm:text-base px-8 py-3.5 rounded-xl border border-stone-300 shadow-xs hover:border-[#B68763] transition-all"
            >
              دليل كل المنتجات (453 منتج)
            </Link>
          </div>
        </div>
      </section>

      {/* Canva Interactive A4 Showcase Section */}
      <section className="py-12 px-4 flex flex-col items-center justify-start">
        <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xs border border-stone-200/80 p-5 mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-[#443000] flex items-center gap-2">
              <span>معاينة حية لصفحة المجلة (3×3 Grid)</span>
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              جرب تغيير حجم العرض لاختبار دقة وحدات الاستعلام الحاوية وعدم حدوث أي انكسار أو تداخل
            </p>
          </div>

          {/* Viewport size buttons */}
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

        {/* The Live A4 Canvas Container */}
        <div className={`${widthStyle} transition-all duration-300 mx-auto drop-shadow-2xl`}>
          <Grid3x3Page
            sectionTitle="مجموعة التراث المصري"
            pageNumber={6}
            slots={SAMPLE_SLOTS}
            isInteractive={true}
          />
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
