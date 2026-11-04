import React from 'react';
import { Metadata } from 'next';
import { getAllPublicProducts } from '@/features/products/services/publicProducts';
import { ProductsCatalogView } from '@/features/products/components/ProductsCatalogView';
import { generateBreadcrumbSchema, safeJsonLd } from '@/lib/seo';

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const decoded = decodeURIComponent(slug);
  const title = `منتجات قسم ${decoded} | كتالوج لوتس - صندوق دعم الصناعات`;
  const description = `استعرض قائمة أسعار ومنتجات قسم ${decoded} في كتالوج ومجلة لوتس الصادرة عن صندوق دعم الصناعات الريفية والبيئية.`;

  return {
    title,
    description,
    alternates: {
      canonical: `/categories/${encodeURIComponent(decoded)}`,
    },
    openGraph: {
      title,
      description,
      url: `/categories/${encodeURIComponent(decoded)}`,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const decodedCategory = decodeURIComponent(slug);
  const products = await getAllPublicProducts();

  const categoriesSet = new Set<string>();
  products.forEach((p) => {
    if (p.category) {
      categoriesSet.add(p.category.trim());
    }
  });
  const categories = Array.from(categoriesSet);

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'الرئيسية', url: '/' },
    { name: 'دليل المنتجات', url: '/products' },
    { name: decodedCategory, url: `/categories/${encodeURIComponent(decodedCategory)}` },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbSchema) }}
      />
      <ProductsCatalogView
        initialProducts={products}
        categories={categories}
      />
    </>
  );
}
