'use client';

import React from 'react';

export function MagazineSkeleton() {
  return (
    <div className="min-h-screen bg-[#F3F4F7] flex flex-col select-none overflow-hidden" dir="rtl">
      {/* Top Reader Navbar Skeleton */}
      <nav className="w-full bg-white border-b border-stone-200 px-4 sm:px-6 py-3 flex items-center justify-between sticky top-0 z-40 shadow-xs">
        {/* Brand Area */}
        <div className="flex items-center gap-3.5">
          <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-2xl bg-stone-200/80 animate-pulse shrink-0" />
          <div className="flex flex-col gap-1.5">
            <div className="h-4 w-16 sm:w-20 bg-stone-300/80 rounded-md animate-pulse" />
            <div className="h-2.5 w-28 sm:w-36 bg-stone-200/70 rounded-md animate-pulse" />
          </div>
        </div>

        {/* Action Controls Skeleton */}
        <div className="flex items-center gap-2 bg-stone-100/90 p-1 rounded-2xl border border-stone-200/70">
          <div className="h-7 w-24 sm:w-28 rounded-xl bg-white shadow-2xs border border-stone-200/60 animate-pulse" />
          <div className="h-7 w-16 sm:w-20 rounded-xl bg-stone-200/60 animate-pulse" />
          <div className="h-7 w-20 sm:w-24 rounded-xl bg-stone-200/60 animate-pulse" />
        </div>
      </nav>

      {/* Main Magazine Stage Skeleton */}
      <main className="flex-1 flex flex-col items-center justify-center p-3 sm:py-6 sm:px-4">
        {/* Two-page Spread Container */}
        <div className="w-full flex items-center justify-center flex-1">
          {/* Mobile Single Page Skeleton */}
          <div className="md:hidden w-full max-w-[420px] aspect-[595.5/842.25] bg-white rounded-xl shadow-2xl border border-stone-200 p-3 sm:p-4 flex flex-col justify-between">
            {/* Page Header */}
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <div className="h-3 w-28 bg-[#B68763]/20 rounded-md animate-pulse" />
              <div className="h-3 w-8 bg-stone-200 rounded-md animate-pulse" />
            </div>

            {/* 3x3 Card Grid */}
            <div className="grid grid-cols-3 grid-rows-3 gap-2 flex-1 my-2">
              {Array.from({ length: 9 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-lg border border-stone-200/70 bg-stone-50/70 p-1 flex flex-col justify-between overflow-hidden"
                >
                  <div className="w-full h-[55%] bg-stone-200/70 rounded-md animate-pulse" />
                  <div className="space-y-1 mt-1">
                    <div className="h-2 w-full bg-stone-200/90 rounded-sm animate-pulse" />
                    <div className="h-1.5 w-2/3 bg-stone-200/60 rounded-sm animate-pulse" />
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-stone-100">
                    <div className="h-1.5 w-4 bg-stone-200 rounded-xs" />
                    <div className="h-2 w-7 bg-[#B68763]/30 rounded-xs animate-pulse" />
                  </div>
                </div>
              ))}
            </div>

            {/* Page Footer */}
            <div className="flex items-center justify-center pt-1 border-t border-stone-100">
              <div className="h-2.5 w-6 bg-stone-200 rounded-sm" />
            </div>
          </div>

          {/* Desktop Two-Page Open Book Spread Skeleton */}
          <div
            className="hidden md:flex items-center justify-center w-full max-w-[1140px] drop-shadow-2xl relative"
            style={{ direction: 'ltr' }}
          >
            {/* Left Page Skeleton */}
            <div className="w-1/2 max-w-[570px] aspect-[595.5/842.25] bg-white rounded-l-2xl border-y border-l border-r border-stone-300/70 shadow-[-12px_0_24px_-12px_rgba(0,0,0,0.18)] p-5 flex flex-col justify-between relative overflow-hidden" dir="rtl">
              {/* Subtle Canva-like Sideline Header Skeleton */}
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <div className="flex items-center gap-2">
                  <div className="h-3.5 w-32 bg-[#B68763]/25 rounded-md animate-pulse" />
                  <div className="h-2.5 w-16 bg-stone-200/80 rounded-md animate-pulse" />
                </div>
                <div className="h-3 w-10 bg-stone-200 rounded-md" />
              </div>

              {/* 3x3 Grid */}
              <div className="grid grid-cols-3 grid-rows-3 gap-2.5 flex-1 my-3">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-stone-200/80 bg-stone-50/50 p-1.5 flex flex-col justify-between overflow-hidden shadow-2xs"
                  >
                    <div className="w-full h-[56%] bg-stone-200/75 rounded-lg animate-pulse" />
                    <div className="space-y-1.5 my-1">
                      <div className="h-2.5 w-full bg-stone-200/90 rounded-sm animate-pulse" />
                      <div className="h-2 w-3/4 bg-stone-200/60 rounded-sm animate-pulse" />
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-stone-100">
                      <div className="h-2 w-6 bg-stone-200/70 rounded-xs" />
                      <div className="h-2.5 w-10 bg-[#B68763]/30 rounded-xs animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>

              {/* Page Number Footer */}
              <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-[10px] text-stone-400">
                <div className="h-2 w-16 bg-stone-200/60 rounded-sm" />
                <div className="h-3 w-5 bg-stone-200 rounded-sm" />
              </div>
            </div>

            {/* Center Book Spine Shadow */}
            <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-8 pointer-events-none z-20 bg-gradient-to-r from-black/15 via-transparent to-black/15" />

            {/* Right Page Skeleton */}
            <div className="w-1/2 max-w-[570px] aspect-[595.5/842.25] bg-white rounded-r-2xl border-y border-r border-l border-stone-300/70 shadow-[12px_0_24px_-12px_rgba(0,0,0,0.18)] p-5 flex flex-col justify-between relative overflow-hidden" dir="rtl">
              {/* Sideline Header Skeleton */}
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <div className="flex items-center gap-2">
                  <div className="h-3.5 w-32 bg-[#B68763]/25 rounded-md animate-pulse" />
                  <div className="h-2.5 w-16 bg-stone-200/80 rounded-md animate-pulse" />
                </div>
                <div className="h-3 w-10 bg-stone-200 rounded-md" />
              </div>

              {/* 3x3 Grid */}
              <div className="grid grid-cols-3 grid-rows-3 gap-2.5 flex-1 my-3">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-stone-200/80 bg-stone-50/50 p-1.5 flex flex-col justify-between overflow-hidden shadow-2xs"
                  >
                    <div className="w-full h-[56%] bg-stone-200/75 rounded-lg animate-pulse" />
                    <div className="space-y-1.5 my-1">
                      <div className="h-2.5 w-full bg-stone-200/90 rounded-sm animate-pulse" />
                      <div className="h-2 w-3/4 bg-stone-200/60 rounded-sm animate-pulse" />
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-stone-100">
                      <div className="h-2 w-6 bg-stone-200/70 rounded-xs" />
                      <div className="h-2.5 w-10 bg-[#B68763]/30 rounded-xs animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>

              {/* Page Number Footer */}
              <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-[10px] text-stone-400">
                <div className="h-3 w-5 bg-stone-200 rounded-sm" />
                <div className="h-2 w-16 bg-stone-200/60 rounded-sm" />
              </div>
            </div>
          </div>
        </div>

        {/* Floating Control Bar Skeleton at Bottom */}
        <div className="z-30 mt-4 sm:mt-6 px-4 py-2 bg-white/95 shadow-md rounded-full border border-stone-200 flex items-center gap-4 text-xs">
          <div className="h-7 w-20 bg-stone-200/80 rounded-full animate-pulse" />
          <div className="h-4 w-28 bg-[#B68763]/25 rounded-md animate-pulse" />
          <div className="h-7 w-20 bg-stone-200/80 rounded-full animate-pulse" />
          <div className="h-7 w-7 bg-stone-200/60 rounded-full animate-pulse" />
        </div>
      </main>
    </div>
  );
}
