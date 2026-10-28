import React, { Suspense } from 'react';
import { Metadata } from 'next';
import { getLiveIssue } from '@/features/magazine/services/publishIssue';
import { resolveCurrentPage } from '@/features/magazine/reader/useFlipbook';
import { MagazineReaderView } from '@/features/magazine/reader/MagazineReaderView';

import { MagazineSkeleton } from '@/features/magazine/components/MagazineSkeleton';

export const metadata: Metadata = {
  title: 'مجلة لوتس التفاعلية | كتالوج المنتجات',
  description: 'تصفح كتالوج ومجلة لوتس للمنتجات اليدوية والتراثية المصرية بتجربة تفاعلية ثلاثية الأبعاد',
};

interface HomePageProps {
  searchParams: Promise<{ p?: string }>;
}

async function HomeMagazineContent({ searchParams }: HomePageProps) {
  const { p } = await searchParams;
  const liveIssue = await getLiveIssue();
  const initialPage = resolveCurrentPage(p, liveIssue.totalPages);

  return (
    <MagazineReaderView
      initialIssue={liveIssue}
      initialPage={initialPage}
    />
  );
}

export default function Home(props: HomePageProps) {
  return (
    <Suspense fallback={<MagazineSkeleton />}>
      <HomeMagazineContent {...props} />
    </Suspense>
  );
}
