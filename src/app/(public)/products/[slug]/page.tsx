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
import { formatMagazinePrice } from '@/lib/format/price';

interface ProductDetailPageProps {
  params: Promise<{ slug: string }>;
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
      title: 'المنتج غير موجود | لوتس',
    };
  }

  return {
    title: `${product.name_ar} | لوتس للمنتجات اليدوية`,
    description:
      product.description_ar ||
      `تفاصيل وسعر ${product.name_ar} في كتالوج لوتس الرسمي للمنتجات اليدوية المصرية.`,
    openGraph: {
      title: `${product.name_ar} - لوتس`,
      description: product.description_ar,
      images: [product.primary_image_url],
    },
  };
}

async function ProductDetailPageContent({ params }: ProductDetailPageProps) {
  const { slug } = await params;
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

  return (
    <>
      {/* Schema.org Product JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-stone-500 mb-6 font-medium">
          <Link href="/" className="hover:text-[#443000] transition-colors">
            الرئيسية
          </Link>
          <span>/</span>
          <Link href="/products" className="hover:text-[#443000] transition-colors">
            المنتجات
          </Link>
          {activeProduct.category && (
            <>
              <span>/</span>
              <span className="text-stone-700">{activeProduct.category}</span>
            </>
          )}
          <span>/</span>
          <span className="text-[#443000] font-bold truncate max-w-xs">{activeProduct.name_ar}</span>
        </nav>

        {/* Product Showcase Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-xs flex flex-col md:flex-row items-center md:items-stretch gap-6 sm:gap-10">
          {/* Image Column - Compact, elegant square thumbnail */}
          <div className="w-full md:w-[320px] shrink-0 flex items-center justify-center">
            <div className="relative w-full max-w-[280px] sm:max-w-[320px] aspect-square rounded-2xl overflow-hidden bg-stone-50 border border-stone-200 shadow-inner group">
              <Image
                src={activeProduct.primary_image_url}
                alt={activeProduct.name_ar}
                fill
                sizes="(max-width: 768px) 280px, 320px"
                className="object-contain sm:object-cover group-hover:scale-105 transition-transform duration-500"
                priority
              />
              {activeProduct.cashier_code && (
                <div className="absolute top-3 right-3 bg-black/75 backdrop-blur-md text-white text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full shadow-sm">
                  كود المنتج: #{activeProduct.cashier_code}
                </div>
              )}
            </div>
          </div>

          {/* Details Column */}
          <div className="flex-1 w-full flex flex-col justify-between">
            <div>
              {/* Category Badge */}
              {activeProduct.category && (
                <div className="mb-2.5">
                  <span className="inline-block text-xs font-bold text-[#B68763] bg-[#B68763]/10 border border-[#B68763]/20 px-3 py-1 rounded-full">
                    {activeProduct.category}
                  </span>
                </div>
              )}

              {/* Title */}
              <h1 className="text-xl sm:text-2xl font-extrabold text-[#443000] leading-snug">
                {activeProduct.name_ar}
              </h1>

              {/* Simple Description */}
              <p className="mt-3 text-stone-600 text-sm leading-relaxed">
                {simpleDescription}
              </p>
            </div>

            {/* Price & Magazine Action (at the bottom) */}
            <div className="mt-6 pt-5 border-t border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[11px] font-bold text-stone-400 block mb-0.5">السعر</span>
                <div className="text-2xl sm:text-3xl font-extrabold text-[#443000] tracking-tight">
                  {formatMagazinePrice(activeProduct.sale_price, activeProduct.price_text)
                    .split('\n')
                    .map((line, idx) => (
                      <div key={idx} className="leading-snug">
                        {line}
                      </div>
                    ))}
                </div>
              </div>

              {activeProduct.magazinePageNumber ? (
                <Link
                  href={`/magazine?p=${activeProduct.magazinePageNumber}`}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#443000] hover:bg-[#B68763] text-white text-xs sm:text-sm font-bold shadow-xs hover:shadow-md transition-all duration-200"
                >
                  <svg
                    className="w-4 h-4 shrink-0"
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
                  <span>عرض في المجلة (صفحة {activeProduct.magazinePageNumber})</span>
                </Link>
              ) : (
                <Link
                  href="/magazine"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#443000] hover:bg-[#B68763] text-white text-xs sm:text-sm font-bold shadow-xs hover:shadow-md transition-all duration-200"
                >
                  <span>فتح المجلة</span>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <div className="mt-14">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-extrabold text-[#443000]">
                منتجات مشابهة في {activeProduct.category}
              </h3>
              <Link
                href="/products"
                className="text-xs font-bold text-[#B68763] hover:underline"
              >
                عرض كل المنتجات ←
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
              {relatedProducts.map((rel) => (
                <Link
                  key={rel.id || rel.slug}
                  href={`/products/${encodeURIComponent(rel.slug)}`}
                  className="group bg-white rounded-xl border border-stone-200 overflow-hidden shadow-2xs hover:shadow-md hover:border-[#B68763]/50 transition-all p-3 flex flex-col justify-between"
                >
                  <div>
                    <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-stone-100 mb-2">
                      <Image
                        src={rel.primary_image_url}
                        alt={rel.name_ar}
                        fill
                        sizes="(max-width: 640px) 50vw, 25vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <h4 className="font-bold text-xs sm:text-sm text-[#443000] group-hover:text-[#B68763] transition-colors line-clamp-2">
                      {rel.name_ar}
                    </h4>
                  </div>
                  <div className="mt-3 pt-2 border-t border-stone-100 flex items-center justify-between">
                    <span className="text-[10px] text-stone-400">السعر</span>
                    <span className="font-extrabold text-xs sm:text-sm text-[#443000]">
                      {formatMagazinePrice(rel.sale_price, rel.price_text)}
                    </span>
                  </div>
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

