'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { PublicHeader } from './PublicHeader';
import { PublicFooter } from './PublicFooter';

export function PublicLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isMagazineReader = pathname.startsWith('/magazine');

  if (isMagazineReader) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900">
      <PublicHeader />
      <main className="flex-1">{children}</main>
      <PublicFooter />
    </div>
  );
}
