import React from 'react';
import { Metadata } from 'next';
import { getAllPublicProducts } from '@/features/products/services/publicProducts';
import { ProductsCatalogView } from '@/features/products/components/ProductsCatalogView';

export const metadata: Metadata = {
  title: 'دليل المنتجات | لوتس للمنتجات اليدوية والتراثية',
  description: 'تصفح كتالوج منتجات لوتس اليدوية من عسل النحل، الفخار، خشب السرسوع، الإكسسوارات والمشغولات التراثية المصرية',
};

export default async function ProductsPage() {
  const products = await getAllPublicProducts();

  // Extract unique categories
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
