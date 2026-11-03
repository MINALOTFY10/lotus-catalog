'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

interface ProductBackButtonProps {
  fallbackUrl?: string;
  fallbackPage?: number;
}

export function ProductBackButton({ fallbackUrl, fallbackPage = 1 }: ProductBackButtonProps) {
  const router = useRouter();
  const targetUrl = fallbackUrl || `/?p=${fallbackPage}`;

  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      window.history.back();
    } else {
      router.push(targetUrl);
    }
  };

  return (
    <button
      type="button"
      onClick={handleBack}
      className="shrink-0 inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white hover:bg-amber-50 text-[#443000] hover:text-[#B68763] text-xs font-bold transition-all border border-stone-200/90 hover:border-[#B68763]/40 shadow-2xs group cursor-pointer select-none"
      title="الرجوع إلى الصفحة السابقة في المجلة"
    >
      <span className="leading-none pt-[1px]">رجوع</span>
      <svg
        className="w-3.5 h-3.5 shrink-0 text-stone-500 group-hover:text-[#B68763] transition-transform group-hover:-translate-x-0.5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        strokeWidth="2.5"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
      </svg>
    </button>
  );
}
