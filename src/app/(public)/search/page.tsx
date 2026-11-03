import React, { Suspense } from 'react';
import { Metadata } from 'next';
import { getAllPublicProducts } from '@/features/products/services/publicProducts';
import { SearchClientView } from '@/features/products/components/SearchClientView';
import { generateBreadcrumbSchema } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'البحث في الكتالوج | كتالوج لوتس - صندوق دعم الصناعات',
  description:
    'ابحث في قائمة أسعار ومنتجات كتالوج لوتس التابع لصندوق دعم الصناعات الريفية والبيئية بالاسم، الكود، أو القسم الحرفي.',
  alternates: {
    canonical: '/search',
  },
  openGraph: {
    title: 'البحث في الكتالوج | كتالوج لوتس - صندوق دعم الصناعات',
    description:
      'ابحث في قائمة أسعار ومنتجات كتالوج لوتس التابع لصندوق دعم الصناعات الريفية والبيئية بالاسم، الكود، أو القسم الحرفي.',
    url: '/search',
  },
};

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

async function SearchPageContent({ searchParams }: SearchPageProps) {
  const { q } = await searchParams;
  const products = await getAllPublicProducts();

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'الرئيسية', url: '/' },
    { name: 'البحث في الكتالوج', url: '/search' },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <SearchClientView
        initialProducts={products}
        initialQuery={q || ''}
      />
    </>
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
