import React, { Suspense } from 'react';
import { PublicLayoutWrapper } from '@/components/layout/PublicLayoutWrapper';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={null}>
      <PublicLayoutWrapper>{children}</PublicLayoutWrapper>
    </Suspense>
  );
}
