import React, { Suspense } from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getLiveIssue } from '@/features/magazine/services/publishIssue';
import {
  getPublicProductBySlug,
  getAllPublicProducts,
  generateProductJsonLd,
} from '@/features/products/services/publicProducts';
import { formatMagazinePrice, toArabicDigits } from '@/lib/format/price';
import { ProductPriceDisplay } from '@/features/products/components/ProductPriceDisplay';
import { ProductBackButton } from '@/features/products/components/ProductBackButton';
import { generateBreadcrumbSchema } from '@/lib/seo';

interface ProductDetailPageProps {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ fromPage?: string; p?: string }>;
}

export async function generateMetadata({
  params,
}: ProductDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  const liveIssue = await getLiveIssue();
  const product = getPublicProductBySlug(decodedSlug, liveIssue);

  if (!product) {
    return {
      title: 'المنتج غير موجود | كتالوج لوتس',
    };
  }

  const title = `${product.name_ar} | كتالوج لوتس - صندوق دعم الصناعات`;
  const description =
    product.description_ar ||
    `تعرف على مواصفات وسعر ${product.name_ar} في كتالوج ومجلة لوتس الصادرة عن صندوق دعم الصناعات الريفية والبيئية.`;

  return {
    title,
    description,
    alternates: {
      canonical: `/products/${encodeURIComponent(decodedSlug)}`,
    },
    openGraph: {
      title,
      description,
      url: `/products/${encodeURIComponent(decodedSlug)}`,
      images: [
        {
          url: product.primary_image_url,
          alt: product.name_ar,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [product.primary_image_url],
    },
  };
}

function renderHeroPrice(rawPrice: number | null | undefined, priceText?: string | null) {
  const formatted = formatMagazinePrice(rawPrice, priceText);
  const lines = formatted
    .split('\n')
    .map((l) => toArabicDigits(l.trim()))
    .filter(Boolean);

  if (lines.length === 1) {
    const single = lines[0];
    const match = single.match(/^([\u0660-\u06690-9.,]+)\s*(.+)$/);
    if (match) {
      return (
        <div className="flex items-baseline gap-1.5 flex-wrap">
          <span className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#443000] tracking-tight">
            {toArabicDigits(match[1])}
          </span>
          <span className="text-xs sm:text-sm lg:text-base font-bold text-[#8A6747]">
            {toArabicDigits(match[2])}
          </span>
        </div>
      );
    }
    return (
      <div className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-[#443000] tracking-tight">
        {toArabicDigits(single)}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 w-full max-w-sm sm:max-w-md">
      {lines.map((line, idx) => {
        if (line.includes('|')) {
          const parts = line.split('|').map((p) => p.trim());
          const hasCurrency = (s: string) => /ج\.مصري|ج\.م|ج|l\.e|egp/i.test(s);
          let label = parts[0];
          let price = parts[1];
          if (hasCurrency(parts[0]) && !hasCurrency(parts[1])) {
            price = parts[0];
            label = parts[1];
          }
          return (
            <div
              key={idx}
              className="flex items-center justify-between gap-4 px-4 py-2.5 rounded-xl bg-amber-50/70 border border-amber-200/60 shadow-2xs"
            >
              <span className="text-sm sm:text-base font-bold text-stone-700">
                {toArabicDigits(label)}
              </span>
              <span className="text-base sm:text-xl font-black text-[#443000]">
                {toArabicDigits(price)}
              </span>
            </div>
          );
        }
        return (
          <div key={idx} className="text-base sm:text-lg font-extrabold text-[#443000]">
            {toArabicDigits(line)}
          </div>
        );
      })}
    </div>
  );
}

async function ProductDetailPageContent({ params, searchParams }: ProductDetailPageProps) {
  const { slug } = await params;
  const sParams = searchParams ? await searchParams : {};
  const fromPageStr = sParams.fromPage || sParams.p;
  const decodedSlug = decodeURIComponent(slug);
  const liveIssue = await getLiveIssue();
  const product = getPublicProductBySlug(decodedSlug, liveIssue);

  if (!product) {
    // If not found in live issue, check if in all products
    const allProducts = await getAllPublicProducts(liveIssue);
    const fallbackProduct = allProducts.find((p) => p.slug === decodedSlug || p.id === decodedSlug);
    if (!fallbackProduct) {
      notFound();
    }
  }

  const activeProduct = product || (await getAllPublicProducts(liveIssue)).find(
    (p) => p.slug === decodedSlug || p.id === decodedSlug
  )!;

  const returnPage = fromPageStr
    ? parseInt(fromPageStr, 10)
    : activeProduct.magazinePageNumber || 1;
  const returnUrl = `/?p=${returnPage}`;

  const jsonLd = generateProductJsonLd(activeProduct);

  // Find related products in same category
  const allProducts = await getAllPublicProducts(liveIssue);
  const relatedProducts = allProducts
    .filter((p) => p.category === activeProduct.category && p.slug !== activeProduct.slug)
    .slice(0, 4);

  // Generate a clean, simple description if not provided
  const simpleDescription =
    activeProduct.description_ar?.trim() ||
    (activeProduct.category?.includes('عسل')
      ? 'عسل نحل طبيعي نقي 100% مستخلص بعناية من أفضل المناحل المصرية.'
      : activeProduct.category?.includes('فخار') || activeProduct.category?.includes('خزف')
      ? 'قطعة فنية مشغولة يدوياً من الفخار والخزف بتشطيب متقن يجمع بين الأصالة والاستخدام العملي.'
      : activeProduct.category?.includes('مجوهرات') || activeProduct.category?.includes('حلي')
      ? 'تصميم تراثي أنيق مشغول يدوياً ليعكس أصالة وجمال الحرف المصرية.'
      : 'صناعة يدوية مصرية متقنة تجسد عراقة الفنون التراثية بمظهر جذاب.');

  // Breadcrumbs schema for Google rich results
  const breadcrumbItems = [
    { name: 'الرئيسية', url: '/' },
    { name: 'دليل المنتجات', url: '/products' },
  ];
  if (activeProduct.category) {
    breadcrumbItems.push({
      name: activeProduct.category,
      url: `/categories/${encodeURIComponent(activeProduct.category)}`,
    });
  }
  breadcrumbItems.push({
    name: activeProduct.name_ar,
    url: `/products/${encodeURIComponent(activeProduct.slug)}`,
  });
  const breadcrumbJsonLd = generateBreadcrumbSchema(breadcrumbItems);

  return (
    <>
      {/* Schema.org Product JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Schema.org BreadcrumbList JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        {/* Top Breadcrumb & Back Action Bar */}
        <div className="flex items-center justify-between gap-3 mb-5 sm:mb-8">
          <nav className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-stone-500 font-medium overflow-x-auto py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <Link
              href={returnUrl}
              className="hidden sm:inline hover:text-[#443000] transition-colors whitespace-nowrap"
            >
              الرئيسية
            </Link>
            <span className="hidden sm:inline text-stone-300">/</span>
            <Link
              href={returnUrl}
              className="hover:text-[#443000] transition-colors whitespace-nowrap font-medium"
            >
              المجلة (صفحة {toArabicDigits(returnPage)})
            </Link>
            {activeProduct.category && (
              <>
                <span className="text-stone-300">/</span>
                <span className="hidden md:inline text-stone-700 whitespace-nowrap">
                  {activeProduct.category}
                </span>
                <span className="hidden md:inline text-stone-300">/</span>
              </>
            )}
            <span className="text-[#443000] font-bold truncate max-w-[130px] sm:max-w-xs">
              {activeProduct.name_ar}
            </span>
          </nav>

          <ProductBackButton fallbackUrl={returnUrl} fallbackPage={returnPage} />
        </div>

        {/* Product Showcase Card */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 lg:p-7 border border-stone-200/80 shadow-xs flex flex-col md:flex-row items-center md:items-stretch gap-5 sm:gap-8">
          {/* Image Column */}
          <div className="w-full md:w-[240px] lg:w-[270px] shrink-0 flex items-center justify-center">
            <div className="relative w-full max-w-[210px] sm:max-w-[240px] lg:max-w-[270px] aspect-square rounded-xl overflow-hidden bg-stone-50 border border-stone-200 shadow-inner group">
              <Image
                src={activeProduct.primary_image_url}
                alt={activeProduct.name_ar}
                fill
                sizes="(max-width: 768px) 210px, (max-width: 1024px) 240px, 270px"
                className="object-contain sm:object-cover group-hover:scale-105 transition-transform duration-500"
                priority
              />
            </div>
          </div>

          {/* Details Column */}
          <div className="flex-1 w-full flex flex-col justify-between">
            <div>
              {/* Category Badge */}
              {activeProduct.category && (
                <div className="mb-2">
                  <span className="text-[11px] sm:text-xs font-bold text-[#8A6747] bg-amber-50/90 border border-amber-200/60 px-2.5 py-1 rounded-full inline-block">
                    {activeProduct.category}
                  </span>
                </div>
              )}

              {/* Title */}
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-[#443000] leading-snug tracking-tight">
                {activeProduct.name_ar}
              </h1>

              {/* Simple Description */}
              <p className="mt-2.5 text-stone-600 text-xs sm:text-sm lg:text-base leading-relaxed max-w-2xl">
                {simpleDescription}
              </p>
            </div>

            {/* Price & Magazine Action (at the bottom) */}
            <div className="mt-5 sm:mt-6 pt-4 sm:pt-5 border-t border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
              <div>
                <span className="text-[11px] sm:text-xs font-bold text-[#8A6747] block mb-1">
                  {activeProduct.price_text && (activeProduct.price_text.includes('\n') || activeProduct.price_text.includes('|'))
                    ? activeProduct.price_text.includes('جرام') || activeProduct.price_text.includes('كيلو') || activeProduct.price_text.includes('مل') || activeProduct.price_text.includes('لتر') || activeProduct.price_text.includes('الحجم')
                      ? 'الحجم والسعر المتاح'
                      : activeProduct.price_text.includes('سم') || activeProduct.price_text.includes('*') || activeProduct.price_text.includes('المقاس') || activeProduct.price_text.includes('صغير') || activeProduct.price_text.includes('وسط') || activeProduct.price_text.includes('كبير')
                      ? 'المقاس والسعر المتاح'
                      : 'خيارات الأسعار المتاحة'
                    : 'السعر'}
                </span>
                {renderHeroPrice(activeProduct.sale_price, activeProduct.price_text)}
              </div>

              <Link
                href={returnUrl}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#443000] hover:bg-[#B68763] text-white text-xs sm:text-sm font-bold shadow-xs hover:shadow-md transition-all duration-200 active:scale-[0.98] whitespace-nowrap"
              >
                <span className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4 shrink-0 translate-y-[-1px]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                  <span className="leading-normal">الرجوع للمجلة (صفحة {toArabicDigits(returnPage)})</span>
                </span>
              </Link>
            </div>
          </div>
        </div>

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <div className="mt-12 sm:mt-16">
            <div className="flex items-center justify-between mb-5 sm:mb-6">
              <h3 className="text-lg sm:text-2xl font-extrabold text-[#443000]">
                منتجات مشابهة في {activeProduct.category}
              </h3>
              <Link
                href="/products"
                className="text-xs sm:text-sm font-bold text-[#B68763] hover:text-[#443000] hover:underline transition-colors"
              >
                عرض كل المنتجات ←
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 sm:gap-6">
              {relatedProducts.map((rel) => (
                <Link
                  key={rel.id || rel.slug}
                  href={`/products/${encodeURIComponent(rel.slug)}`}
                  className="group bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-2xs hover:shadow-md hover:border-[#B68763]/50 transition-all p-3 sm:p-4 flex flex-col justify-between"
                >
                  <div>
                    <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-stone-100 mb-2 sm:mb-3">
                      <Image
                        src={rel.primary_image_url}
                        alt={rel.name_ar}
                        fill
                        sizes="(max-width: 640px) 50vw, 25vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <h4 className="font-bold text-xs sm:text-sm text-[#443000] group-hover:text-[#B68763] transition-colors line-clamp-2 leading-snug">
                      {rel.name_ar}
                    </h4>
                  </div>
                  <ProductPriceDisplay
                    salePrice={rel.sale_price}
                    priceText={rel.price_text}
                  />
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}


export default function ProductDetailPage(props: ProductDetailPageProps) {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center font-bold text-[#443000] text-sm">
          جاري تحميل بيانات المنتج...
        </div>
      }
    >
      <ProductDetailPageContent {...props} />
    </Suspense>
  );
}

