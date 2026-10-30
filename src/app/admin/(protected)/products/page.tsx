import React from 'react';
import { Metadata } from 'next';
import { AdminProductsTable } from '@/features/admin/products/AdminProductsTable';
import { getAdminProductsList } from '@/features/admin/products/actions';

export const metadata: Metadata = {
  title: 'إدارة المنتجات والأسعار | لوحة تحكم لوتس',
};

export default async function AdminProductsPage() {
  const products = await getAdminProductsList();

  // Extract unique categories
  const categoriesSet = new Set<string>();
  products.forEach((p) => {
    if (p.category) categoriesSet.add(p.category);
  });
  const categories = Array.from(categoriesSet);

  return (
    <AdminProductsTable
      initialProducts={products}
      categories={categories}
    />
  );
}
