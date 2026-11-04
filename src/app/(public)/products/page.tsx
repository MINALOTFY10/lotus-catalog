import React from 'react';
import { Metadata } from 'next';
import { getAllPublicProducts } from '@/features/products/services/publicProducts';
import { ProductsCatalogView } from '@/features/products/components/ProductsCatalogView';
import { getBaseUrl, generateBreadcrumbSchema, safeJsonLd } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'دليل المنتجات والأسعار | كتالوج لوتس - صندوق دعم الصناعات',
  description:
    'تصفح كتالوج منتجات لوتس الكامل وقائمة الأسعار الرسمية الصادرة عن صندوق دعم الصناعات الريفية والبيئية: عسل نحل طبيعي، فخار وخزف، مشغولات خشب سرسوع، حلي تراثية وإكسسوارات مصرية.',
  alternates: {
    canonical: '/products',
  },
  openGraph: {
    title: 'دليل المنتجات والأسعار | كتالوج لوتس - صندوق دعم الصناعات',
    description:
      'قائمة أسعار ومعروضات المنتجات التراثية واليدوية في كتالوج لوتس الصادر عن صندوق دعم الصناعات الريفية والبيئية.',
    url: '/products',
  },
};

export default async function ProductsPage() {
  const products = await getAllPublicProducts();
  const baseUrl = getBaseUrl();

  // Extract unique categories
  const categoriesSet = new Set<string>();
  products.forEach((p) => {
    if (p.category) {
      categoriesSet.add(p.category.trim());
    }
  });
  const categories = Array.from(categoriesSet);

  // Generate ItemList JSON-LD for rich Google listing
  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'قائمة منتجات كتالوج لوتس - صندوق دعم الصناعات الريفية والبيئية',
    itemListElement: products.slice(0, 30).map((prod, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: `${baseUrl}/products/${encodeURIComponent(prod.slug)}`,
      name: prod.name_ar,
    })),
  };

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'الرئيسية', url: '/' },
    { name: 'دليل المنتجات والأسعار', url: '/products' },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(itemListSchema) }}
      />
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
