import React, { Suspense } from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { getLiveIssue } from '@/features/magazine/services/publishIssue';
import { resolveCurrentPage } from '@/features/magazine/reader/useFlipbook';
import { MagazineReaderView } from '@/features/magazine/reader/MagazineReaderView';
import { MagazineSkeleton } from '@/features/magazine/components/MagazineSkeleton';
import { buildOpenGraph } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'المجلة التفاعلية | كتالوج لوتس - صندوق دعم الصناعات',
  description:
    'استعرض صفحات مجلة لوتس التفاعلية ثلاثية الأبعاد، وتصفح معروضات صندوق دعم الصناعات الريفية والبيئية مع إمكانية البحث وتكبير المنتجات ومعرفة الأسعار الرسمية.',
  alternates: {
    canonical: '/magazine',
  },
  openGraph: buildOpenGraph({
    title: 'المجلة التفاعلية | كتالوج لوتس - صندوق دعم الصناعات',
    description:
      'استعرض صفحات مجلة لوتس التفاعلية ثلاثية الأبعاد مع قائمة أسعار منتجات صندوق دعم الصناعات الريفية والبيئية.',
    url: '/magazine',
  }),
};

interface MagazinePageProps {
  searchParams: Promise<{ p?: string }>;
}

async function MagazineContent({ searchParams }: MagazinePageProps) {
  const { p } = await searchParams;
  const liveIssue = await getLiveIssue();
  const initialPage = resolveCurrentPage(p, liveIssue.totalPages);

  return (
    <>
      <section className="sr-only" aria-label="عن مجلة لوتس">
        <h1>مجلة لوتس التفاعلية | كتالوج صندوق دعم الصناعات الريفية والبيئية</h1>
        <p>
          تصفح مجلة وكتالوج لوتس التفاعلي الصادر عن صندوق دعم الصناعات الريفية والبيئية.
          يتيح لك هذا العرض التفاعلي تقليب الصفحات وتكبير المعروضات والاطلاع على أسعار المنتجات المصرية التراثية.
        </p>
        <nav aria-label="روابط سريعة">
          <Link href="/products">دليل المنتجات الكامل</Link>
          <Link href="/search">البحث في الكتالوج</Link>
        </nav>
      </section>

      <MagazineReaderView
        initialIssue={liveIssue}
        initialPage={initialPage}
      />
    </>
  );
}

export default function MagazinePage(props: MagazinePageProps) {
  return (
    <Suspense fallback={<MagazineSkeleton />}>
      <MagazineContent {...props} />
    </Suspense>
  );
}
