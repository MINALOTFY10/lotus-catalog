'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

export function PublicHeader() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: '/magazine', label: 'المجلة التفاعلية', highlight: true },
    { href: '/products', label: 'دليل المنتجات' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo & Title */}
          <Link href="/" className="flex items-center gap-3.5 group">
            <div className="relative w-14 h-14 sm:w-[58px] sm:h-[58px] flex-shrink-0 transition-transform duration-200 group-hover:scale-105">
              <Image
                src="/brand/lotus_logo.png"
                alt="شعار لوتس"
                fill
                sizes="58px"
                className="object-contain"
                priority
              />
            </div>
            <div className="flex flex-col justify-center">
              <span className="font-extrabold text-lg sm:text-xl text-[#443000] tracking-tight leading-snug group-hover:text-[#B68763] transition-colors">
                لوتس
              </span>
              <span className="text-[11px] font-medium text-stone-500 mt-0.5 leading-tight">
                كتالوج المنتجات اليدوية والتراثية
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1.5 lg:gap-3">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-bold px-3 py-1.5 rounded-lg transition-all ${
                    link.highlight
                      ? 'bg-[#B68763] text-white shadow-xs hover:bg-[#966b4b]'
                      : isActive
                      ? 'text-[#443000] bg-stone-100 font-extrabold'
                      : 'text-stone-700 hover:text-[#443000] hover:bg-stone-50'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-stone-600 hover:bg-stone-100 focus:outline-hidden"
              aria-label="القائمة"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-stone-200 flex flex-col gap-3 animate-in fade-in duration-200">
            <div className="flex flex-col gap-1 pt-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`text-sm font-bold px-3 py-2 rounded-lg flex items-center justify-between ${
                    link.highlight
                      ? 'bg-[#B68763] text-white'
                      : 'text-stone-800 hover:bg-stone-100'
                  }`}
                >
                  <span>{link.label}</span>
                  {link.highlight && (
                    <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full">
                      Canva Replica
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
