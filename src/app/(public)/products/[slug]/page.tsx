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

  return (
    <>
      {/* Schema.org Product JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-stone-500 mb-8 font-medium">
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

        {/* Product Showcase Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 bg-white rounded-3xl p-6 sm:p-10 border border-stone-200/80 shadow-xs">
          {/* Right Column: Image */}
          <div className="flex flex-col items-center">
            <div className="relative w-full aspect-4/3 sm:aspect-square max-w-lg rounded-2xl overflow-hidden bg-stone-100 border border-stone-200 shadow-inner">
              <Image
                src={activeProduct.primary_image_url}
                alt={activeProduct.name_ar}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-contain sm:object-cover hover:scale-105 transition-transform duration-500"
                priority
              />
              {activeProduct.cashier_code && (
                <div className="absolute top-4 right-4 bg-black/75 backdrop-blur-md text-white text-xs font-mono font-bold px-3 py-1 rounded-full shadow-sm">
                  كود المنتج: #{activeProduct.cashier_code}
                </div>
              )}
            </div>

            {/* Quality Note below image */}
            <div className="flex items-center gap-3 mt-4 text-xs text-stone-500">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>صناعة يدوية مصرية أصيلة بجودة معتمدة</span>
            </div>
          </div>

          {/* Left Column: Product Info & Magazine CTA */}
          <div className="flex flex-col justify-between">
            <div>
              {/* Category & Status Badges */}
              <div className="flex items-center gap-3 mb-3">
                {activeProduct.category && (
                  <span className="text-xs font-bold text-[#B68763] bg-[#B68763]/10 px-3 py-1 rounded-full">
                    {activeProduct.category}
                  </span>
                )}
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-3 py-1 rounded-full flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  {activeProduct.stock_status || 'متاح في المعرض'}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#443000] leading-snug">
                {activeProduct.name_ar}
              </h1>

              {/* Price Box */}
              <div className="mt-6 p-4 sm:p-5 rounded-2xl bg-stone-50 border border-stone-200/80 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-stone-500 block">السعر الرسمي بالكتالوج</span>
                  <span className="text-2xl sm:text-3xl font-extrabold font-mono text-[#443000] tracking-tight">
                    {formatMagazinePrice(activeProduct.sale_price)}
                  </span>
                </div>
                <div className="text-left text-[11px] text-stone-400 font-medium">
                  شامل ضريبة القيمة المضافة<br />وفق قائمة أسعار لوتس A4
                </div>
              </div>

              {/* Description */}
              <div className="mt-6">
                <h2 className="text-sm font-bold text-stone-800 mb-2">الوصف والمواصفات</h2>
                <p className="text-stone-600 text-sm leading-relaxed whitespace-pre-line bg-stone-50/50 p-4 rounded-xl border border-stone-100">
                  {activeProduct.description_ar ||
                    'منتج يدوي فاخر مصنوع بعناية فائقة يجمع بين التصميم التراثي وجودة المواد الطبيعية.'}
                </p>
              </div>
            </div>

            {/* Interactive Magazine Connection Box */}
            <div className="mt-8 pt-6 border-t border-stone-200">
              {activeProduct.magazinePageNumber ? (
                <div className="bg-gradient-to-l from-amber-50 to-orange-50/50 border border-[#B68763]/30 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-xl bg-[#443000] text-white flex items-center justify-center font-bold text-sm shadow-xs flex-shrink-0">
                      p.{activeProduct.magazinePageNumber}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#443000]">معروض في المجلة التفاعلية</h4>
                      <p className="text-xs text-stone-600">
                        {activeProduct.sectionTitle
                          ? `قسم ${activeProduct.sectionTitle} - صفحة ${activeProduct.magazinePageNumber}`
                          : `صفحة ${activeProduct.magazinePageNumber} بتقسيم كانفا A4`}
                      </p>
                    </div>
                  </div>

                  <Link
                    href={`/magazine?p=${activeProduct.magazinePageNumber}`}
                    className="w-full sm:w-auto bg-[#443000] hover:bg-[#5c4205] text-white text-xs font-bold px-5 py-3 rounded-xl shadow-xs transition-colors text-center flex items-center justify-center gap-2 whitespace-nowrap"
                  >
                    <span>عرض الصفحة في المجلة</span>
                    <svg className="w-4 h-4 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </Link>
                </div>
              ) : (
                <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 flex items-center justify-between">
                  <span className="text-xs text-stone-600 font-medium">
                    تصفح جميع الصفحات في المجلة الرقمية الكاملة
                  </span>
                  <Link
                    href="/magazine"
                    className="text-xs font-bold text-[#B68763] hover:underline"
                  >
                    فتح المجلة
                  </Link>
                </div>
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
                    <span className="font-extrabold font-mono text-xs sm:text-sm text-[#443000]">
                      {formatMagazinePrice(rel.sale_price)}
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

