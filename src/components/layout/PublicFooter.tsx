import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export function PublicFooter() {
  return (
    <footer className="bg-[#443000] text-stone-300 py-12 border-t border-amber-900/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center border-b border-amber-900/40 pb-8">
          {/* Logo & Description */}
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16 bg-white/10 p-1.5 rounded-full backdrop-blur-xs flex-shrink-0">
              <Image
                src="/brand/lotus_logo.png"
                alt="شعار لوتس"
                fill
                sizes="56px"
                className="object-contain"
              />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-white">لوتس  </h3>
              <p className="text-xs text-stone-300 mt-1 max-w-sm leading-relaxed">
                كتالوج متكامل يجسد أصالة الحرف التراثية والمنتجات الطبيعية المصرية المصنوعة بأيدي أمهر الحرفيين.
              </p>
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex flex-wrap items-center justify-start md:justify-center gap-6 text-sm font-bold">
            <Link href="/magazine" className="hover:text-[#B68763] transition-colors">
              المجلة التفاعلية
            </Link>
            <Link href="/products" className="hover:text-[#B68763] transition-colors">
              دليل المنتجات
            </Link>
            <Link href="/search" className="hover:text-[#B68763] transition-colors">
              البحث المتقدم
            </Link>
          </div>

          {/* Seal / Quality Stamp */}
          <div className="flex items-center justify-start md:justify-end gap-3">
            <div className="relative w-12 h-12 bg-white/10 p-1 rounded-full flex-shrink-0">
              <Image
                src="/brand/fund_seal.png"
                alt="ختم الجودة"
                fill
                sizes="48px"
                className="object-contain"
              />
            </div>
            <div className="text-xs text-stone-300">
              <span className="block font-bold text-white">منتجات أصلية معتمدة</span>
              <span className="text-[10px]">خاضعة لمعايير الجودة والتراث</span>
            </div>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-400 gap-4">
          <p>© 2026 لوتس. جميع الحقوق محفوظة.</p>
          <p className="flex items-center gap-2">
            <span>تصميم مستوحى من كانفا طبق الأصل</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#B68763]"></span>
            <span>القاهرة، جمهورية مصر العربية</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
