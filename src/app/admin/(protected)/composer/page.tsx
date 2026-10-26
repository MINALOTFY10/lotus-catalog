import React from 'react';
import fs from 'fs';
import path from 'path';
import { Metadata } from 'next';
import { getLiveIssue } from '@/features/magazine/services/publishIssue';
import { ComposerView } from '@/features/admin/composer/ComposerView';
import { AdminProductRecord } from '@/features/admin/products/actions';

export const metadata: Metadata = {
  title: 'محرر صفحات المجلة (3×3) | لوحة تحكم لوتس',
};

export default async function AdminComposerPage() {
  const liveIssue = await getLiveIssue();

  const seedPath = path.resolve(process.cwd(), 'data', 'products_seed.json');
  let products: AdminProductRecord[] = [];

  if (fs.existsSync(seedPath)) {
    try {
      products = JSON.parse(fs.readFileSync(seedPath, 'utf8'));
    } catch (e) {
      console.error('Failed to read products_seed.json:', e);
    }
  }

  return (
    <ComposerView
      initialPages={liveIssue.pages}
      availableProducts={products}
    />
  );
}
