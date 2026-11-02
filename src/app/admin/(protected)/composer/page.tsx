import React from 'react';
import { Metadata } from 'next';
import { connection } from 'next/server';
import { getLiveIssue } from '@/features/magazine/services/publishIssue';
import { ComposerView } from '@/features/admin/composer/ComposerView';
import { getAdminProductsList } from '@/features/admin/products/actions';

export const metadata: Metadata = {
  title: 'محرر صفحات المجلة التفاعلي | لوحة تحكم لوتس',
};

export const instant = false;

export default async function AdminComposerPage() {
  await connection();
  const liveIssue = await getLiveIssue({ forceFresh: true });
  const products = await getAdminProductsList();

  return (
    <ComposerView
      initialPages={liveIssue.pages}
      availableProducts={products}
    />
  );
}
