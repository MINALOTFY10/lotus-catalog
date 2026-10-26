'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';

export function PublicHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  const navLinks = [
    { href: '/magazine', label: 'المجلة التفاعلية', highlight: true },
    { href: '/products', label: 'دليل المنتجات' },
    { href: '/search', label: 'بحث في الكتالوج' },
    { href: '/admin', label: 'لوحة التحكم', admin: true },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Brand Logo & Title */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-12 h-12 flex-shrink-0">
              <Image
                src="/brand/lotus_logo.png"
                alt="شعار لوتس"
                fill
                sizes="48px"
                className="object-contain"
                priority
              />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-xl sm:text-2xl text-[#443000] tracking-tight group-hover:text-[#B68763] transition-colors">
                لوتس
              </span>
              <span className="text-[10px] font-medium text-stone-500 -mt-1 tracking-wider">
                كتالوج المنتجات اليدوية والتراثية
              </span>
            </div>
          </Link>

          {/* Desktop Search Bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden md:flex items-center flex-1 max-w-xs mx-6 relative"
          >
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث بالاسم أو الكود..."
              className="w-full text-xs bg-stone-100/90 text-stone-800 placeholder-stone-400 rounded-full py-2 pl-9 pr-4 border border-stone-200 focus:outline-hidden focus:border-[#B68763] focus:bg-white transition-all"
            />
            <button
              type="submit"
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-[#443000]"
              aria-label="بحث"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>
          </form>

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
                      : link.admin
                      ? 'text-stone-500 hover:text-stone-900 border border-dashed border-stone-300 hover:border-stone-400'
                      : isActive
                      ? 'text-[#443000] bg-stone-100 font-extrabold'
                      : 'text-stone-700 hover:text-[#443000] hover:bg-stone-50'
                  }`}
                >
                  {link.label}
                  {link.highlight && (
                    <span className="mr-1.5 text-[10px] bg-white/25 px-1.5 py-0.2 rounded-full font-sans uppercase">
                      A4
                    </span>
                  )}
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
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث بالاسم أو الكود..."
                className="w-full text-xs bg-stone-100 text-stone-800 placeholder-stone-400 rounded-lg py-2 pl-9 pr-3 border border-stone-200 focus:outline-hidden focus:border-[#B68763]"
              />
              <button
                type="submit"
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </button>
            </form>

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
