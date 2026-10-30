import React from 'react';
import { Metadata } from 'next';
import { getLiveIssue } from '@/features/magazine/services/publishIssue';
import { ComposerView } from '@/features/admin/composer/ComposerView';
import { getAdminProductsList } from '@/features/admin/products/actions';

export const metadata: Metadata = {
  title: 'محرر صفحات المجلة (3×3) | لوحة تحكم لوتس',
};

export default async function AdminComposerPage() {
  const liveIssue = await getLiveIssue();
  const products = await getAdminProductsList();

  return (
    <ComposerView
      initialPages={liveIssue.pages}
      availableProducts={products}
    />
  );
}
