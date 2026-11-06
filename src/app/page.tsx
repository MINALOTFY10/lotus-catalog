import React, { Suspense } from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { getLiveIssue } from '@/features/magazine/services/publishIssue';
import { resolveCurrentPage } from '@/features/magazine/reader/useFlipbook';
import { MagazineReaderView } from '@/features/magazine/reader/MagazineReaderView';
import { MagazineSkeleton } from '@/features/magazine/components/MagazineSkeleton';
import { buildOpenGraph } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'كتالوج لوتس الرسمي | صندوق دعم الصناعات الريفية والبيئية',
  description:
    'تصفح الكتالوج الرسمي ومجلة لوتس الصادرة عن صندوق دعم الصناعات الريفية والبيئية. استكشف قائمة الأسعار والمنتجات التراثية واليدوية، عسل النحل، الفخار، خشب السرسوع والحلي المصرية.',
  alternates: {
    canonical: '/',
  },
  openGraph: buildOpenGraph({
    title: 'كتالوج لوتس | صندوق دعم الصناعات الريفية والبيئية',
    description:
      'الكتالوج الرقمي لمجلة لوتس - منتجات يدوية وتراثية مصرية بتجربة تفاعلية ثلاثية الأبعاد مع قائمة الأسعار الرسمية.',
    url: '/',
  }),
};

interface HomePageProps {
  searchParams: Promise<{ p?: string }>;
}

async function HomeMagazineContent({ searchParams }: HomePageProps) {
  const { p } = await searchParams;
  const liveIssue = await getLiveIssue();
  const initialPage = resolveCurrentPage(p, liveIssue.totalPages);

  // Extract section titles for crawlable semantic navigation
  const sections = Array.from(
    new Set(
      liveIssue.pages
        .map((page) => page.sectionTitle || page.section_title)
        .filter((s): s is string => Boolean(s && s.trim()))
    )
  );

  return (
    <>
      {/* Semantic Crawlable Document Structure for Search Engines (Googlebot) & Screen Readers */}
      <section className="sr-only" aria-label="عن كتالوج لوتس وصندوق دعم الصناعات">
        <h1>كتالوج لوتس الرسمي | صندوق دعم الصناعات الريفية والبيئية</h1>
        <p>
          الكتالوج الرقمي ومجلة لوتس الصادرة عن صندوق دعم الصناعات الريفية والبيئية والإنعاش الريفي (وزارة التضامن الاجتماعي - جمهورية مصر العربية).
          يحتوي الكتالوج على قائمة الأسعار الرسمية وتفاصيل المنتجات اليدوية والتراثية المصرية الأصيلة.
        </p>
        <h2>أقسام ومعروضات كتالوج لوتس</h2>
        <nav aria-label="أقسام الكتالوج">
          <ul>
            <li>
              <Link href="/magazine">المجلة التفاعلية ثلاثية الأبعاد</Link>
            </li>
            <li>
              <Link href="/products">دليل المنتجات الكامل وقائمة الأسعار</Link>
            </li>
            <li>
              <Link href="/search">البحث في منتجات ومعروضات الكتالوج</Link>
            </li>
            {sections.map((section, idx) => (
              <li key={idx}>
                <Link href={`/categories/${encodeURIComponent(section)}`}>
                  {section} - كتالوج لوتس
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div>
          <h3>بيانات صندوق دعم الصناعات الريفية والبيئية</h3>
          <p>العنوان: 19 شارع المراغي - العجوزة، الجيزة (الدور الثالث) / الحي الحكومي بالعاصمة الإدارية الجديدة</p>
          <p>البريد الإلكتروني الرسمي: Reis.Fund@moss.gov.eg</p>
        </div>
      </section>

      {/* Interactive 3D Magazine Experience */}
      <MagazineReaderView
        initialIssue={liveIssue}
        initialPage={initialPage}
      />
    </>
  );
}

export default function Home(props: HomePageProps) {
  return (
    <Suspense fallback={<MagazineSkeleton />}>
      <HomeMagazineContent {...props} />
    </Suspense>
  );
}
