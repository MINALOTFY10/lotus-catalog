import React from 'react';
import fs from 'fs';
import path from 'path';
import { Metadata } from 'next';
import { AdminProductsTable } from '@/features/admin/products/AdminProductsTable';
import { AdminProductRecord } from '@/features/admin/products/actions';

export const metadata: Metadata = {
  title: 'إدارة المنتجات والأسعار | لوحة تحكم لوتس',
};

export default async function AdminProductsPage() {
  const seedPath = path.resolve(process.cwd(), 'data', 'products_seed.json');
  let products: AdminProductRecord[] = [];

  if (fs.existsSync(seedPath)) {
    try {
      products = JSON.parse(fs.readFileSync(seedPath, 'utf8'));
    } catch (e) {
      console.error('Failed to read products_seed.json in admin:', e);
    }
  }

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
