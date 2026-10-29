import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export function PublicFooter() {
  return (
    <footer className="bg-[#443000] text-stone-300 pt-10 pb-8 border-t border-amber-900/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start border-b border-white/10 pb-8">
          {/* 1. Official Entity & Logo (5 cols) */}
          <div className="md:col-span-5 flex items-center gap-4">
            <div className="relative w-16 h-16 bg-white/5 border border-amber-500/20 p-1.5 rounded-2xl flex-shrink-0">
              <Image
                src="/brand/fund_seal.png"
                alt="شعار صندوق دعم الصناعات الريفية والبيئية"
                fill
                sizes="64px"
                className="object-contain"
              />
            </div>
            <div>
              <h3 className="text-base font-bold text-white leading-snug">
                صندوق دعم الصناعات الريفية والبيئية
              </h3>
              <p className="text-[11px] text-stone-400 font-mono tracking-wider uppercase mt-0.5">
                Rural and Environmental Industries Support Fund
              </p>
            </div>
          </div>

          {/* 2. Quick Navigation (3 cols) */}
          <div className="md:col-span-3 md:pr-4">
            <h4 className="text-xs font-bold text-amber-200/90 tracking-wider uppercase mb-3">
              أقسام الكتالوج
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/magazine" className="text-stone-300 hover:text-[#B68763] transition-colors inline-flex items-center gap-1.5">
                  <span className="text-[#B68763]">‹</span>
                  المجلة التفاعلية
                </Link>
              </li>
              <li>
                <Link href="/products" className="text-stone-300 hover:text-[#B68763] transition-colors inline-flex items-center gap-1.5">
                  <span className="text-[#B68763]">‹</span>
                  دليل المنتجات
                </Link>
              </li>
              <li>
                <Link href="/search" className="text-stone-300 hover:text-[#B68763] transition-colors inline-flex items-center gap-1.5">
                  <span className="text-[#B68763]">‹</span>
                  البحث في المعروضات
                </Link>
              </li>
            </ul>
          </div>

          {/* 3. Official Contact Info (4 cols) */}
          <div className="md:col-span-4 flex flex-col text-xs text-stone-300 gap-3">
            <h4 className="text-xs font-bold text-amber-200/90 tracking-wider uppercase mb-0.5">
              بيانات التواصل
            </h4>

            {/* Social Media Links */}
            <div className="flex items-center gap-2 mb-1">
              <a
                href="https://www.facebook.com/reisfund"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="فيسبوك - صندوق دعم الصناعات الريفية والبيئية"
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-[#B68763] text-stone-200 hover:text-white flex items-center justify-center transition-all duration-200 shadow-xs"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                </svg>
              </a>

              <a
                href="https://www.instagram.com/reisfund"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="إنستغرام - صندوق دعم الصناعات الريفية والبيئية"
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-[#B68763] text-stone-200 hover:text-white flex items-center justify-center transition-all duration-200 shadow-xs"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>

              <a
                href="https://www.linkedin.com/company/reis-fund/posts/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="لينكد إن - صندوق دعم الصناعات الريفية والبيئية"
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-[#B68763] text-stone-200 hover:text-white flex items-center justify-center transition-all duration-200 shadow-xs"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </a>
            </div>
            
            <a
              href="mailto:Reis.Fund@moss.gov.eg"
              className="inline-flex items-center gap-2 text-stone-200 hover:text-[#B68763] transition-colors font-mono text-xs w-fit"
              dir="ltr"
            >
              <svg className="w-4 h-4 text-[#B68763] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span>Reis.Fund@moss.gov.eg</span>
            </a>

            <div className="flex items-start gap-2 text-[11px] text-stone-400 leading-relaxed">
              <svg className="w-4 h-4 text-[#B68763] shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>19 شارع المراغي - العجوزة، الجيزة (الدور الثالث)</span>
            </div>

            <div className="flex items-start gap-2 text-[11px] text-stone-400 leading-relaxed">
              <svg className="w-4 h-4 text-[#B68763] shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <span>الحي الحكومي - العاصمة الإدارية الجديدة (الدور الرابع)</span>
            </div>
          </div>
        </div>

        {/* Bottom Copyright Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-stone-500 gap-3">
          <p>صندوق دعم الصناعات الريفية والبيئية والإنعاش الريفي © 2026</p>
          <p>جميع الحقوق محفوظة</p>
        </div>
      </div>
    </footer>
  );
}
