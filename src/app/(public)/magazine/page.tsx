import React, { Suspense } from 'react';
import { Metadata } from 'next';
import { getLiveIssue } from '@/features/magazine/services/publishIssue';
import { resolveCurrentPage } from '@/features/magazine/reader/useFlipbook';
import { MagazineReaderView } from '@/features/magazine/reader/MagazineReaderView';

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
    <Suspense
      fallback={
        <div className="min-h-screen bg-stone-100 flex items-center justify-center font-bold text-[#443000]">
          جاري تحميل المجلة...
        </div>
      }
    >
      <MagazineContent {...props} />
    </Suspense>
  );
}
