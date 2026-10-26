import React from 'react';
import { Metadata } from 'next';
import { getAllPublicProducts } from '@/features/products/services/publicProducts';
import { ProductsCatalogView } from '@/features/products/components/ProductsCatalogView';

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const decoded = decodeURIComponent(slug);
  return {
    title: `منتجات قسم ${decoded} | لوتس`,
    description: `استعرض قائمة منتجات وأسعار قسم ${decoded} في كتالوج ومجلة لوتس للمنتجات اليدوية.`,
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const decodedCategory = decodeURIComponent(slug);
  const products = await getAllPublicProducts();

  const categoriesSet = new Set<string>();
  products.forEach((p) => {
    if (p.category) {
      categoriesSet.add(p.category);
    }
  });
  const categories = Array.from(categoriesSet);

  return (
    <ProductsCatalogView
      initialProducts={products}
      categories={categories}
    />
  );
}
