import React, { Suspense } from 'react';
import { Metadata } from 'next';
import { getLiveIssue } from '@/features/magazine/services/publishIssue';
import { resolveCurrentPage } from '@/features/magazine/reader/useFlipbook';
import { MagazineReaderView } from '@/features/magazine/reader/MagazineReaderView';

import { MagazineSkeleton } from '@/features/magazine/components/MagazineSkeleton';

export const metadata: Metadata = {
  title: 'مجلة لوتس التفاعلية',
  description: 'تصفح كتالوج لوتس الكامل بجودة عالية مع تجربة تقليب الصفحات التفاعلية',
};

interface MagazinePageProps {
  searchParams: Promise<{ p?: string }>;
}

async function MagazineContent({ searchParams }: MagazinePageProps) {
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

export default function MagazinePage(props: MagazinePageProps) {
  return (
    <Suspense fallback={<MagazineSkeleton />}>
      <MagazineContent {...props} />
    </Suspense>
  );
}
