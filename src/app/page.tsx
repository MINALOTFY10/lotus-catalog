import React, { Suspense } from 'react';
import { Metadata } from 'next';
import { getLiveIssue } from '@/features/magazine/services/publishIssue';
import { resolveCurrentPage } from '@/features/magazine/reader/useFlipbook';
import { MagazineReaderView } from '@/features/magazine/reader/MagazineReaderView';

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
    <Suspense
      fallback={
        <div className="min-h-screen bg-stone-100 flex items-center justify-center font-bold text-[#443000] text-sm">
          جاري فتح مجلة لوتس التفاعلية...
        </div>
      }
    >
      <HomeMagazineContent {...props} />
    </Suspense>
  );
}
