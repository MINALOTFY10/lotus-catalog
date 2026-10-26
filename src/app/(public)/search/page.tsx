import React, { Suspense } from 'react';
import { Metadata } from 'next';
import { getAllPublicProducts } from '@/features/products/services/publicProducts';
import { SearchClientView } from '@/features/products/components/SearchClientView';

export const metadata: Metadata = {
  title: 'البحث في الكتالوج | لوتس للمنتجات اليدوية',
  description: 'ابحث في قائمة أسعار ومنتجات لوتس بالاسم أو الكود أو القسم',
};

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

async function SearchPageContent({ searchParams }: SearchPageProps) {
  const { q } = await searchParams;
  const products = await getAllPublicProducts();

  return (
    <SearchClientView
      initialProducts={products}
      initialQuery={q || ''}
    />
  );
}

export default function SearchPage(props: SearchPageProps) {
  return (
    <Suspense
      fallback={
        <div className="min-h-[50vh] flex items-center justify-center text-stone-500 font-bold text-sm">
          جاري تجهيز البحث...
        </div>
      }
    >
      <SearchPageContent {...props} />
    </Suspense>
  );
}
