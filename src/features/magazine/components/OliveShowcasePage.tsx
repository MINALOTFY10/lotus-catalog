import React from 'react';
import { PageShell } from './PageShell';

interface OliveShowcasePageProps {
  pageNumber?: number;
}

export function OliveShowcasePage({ pageNumber = 2 }: OliveShowcasePageProps) {
  return (
    <PageShell sectionTitle="سلال وزيوت طبيعية" pageNumber={pageNumber}>
      <div
        className="grid grid-cols-2 grid-rows-3 w-full h-full"
        style={{
          gap: 'calc(10 * var(--u, 1px)) calc(12 * var(--u, 1px))',
          direction: 'rtl',
        }}
      >
        {/* Row 1, Col 1: Wicker Basket Big */}
        <div className="w-full h-full bg-white shadow-[0_1px_4px_rgba(0,0,0,0.06)] rounded-xs overflow-hidden flex flex-col justify-between border border-stone-200/40">
          <div className="w-full h-[50%] shrink-0 overflow-hidden bg-stone-50">
            <img
              src="/magazine/assets/p2_basket_1.webp"
              alt="عسل سلة NA7LA كبير"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-h-0 flex flex-col justify-between p-[calc(6*var(--u,1px))]">
            <div className="overflow-hidden">
              <h3 className="font-bold text-[#443000] text-[calc(9.5*var(--u,1px))] line-clamp-1 truncate">
                عسل سلة نخل فاخر كبير
              </h3>
              <p className="text-[calc(7.2*var(--u,1px))] text-stone-600 leading-snug line-clamp-2 mt-1 opacity-85">
                سلة يدوية منسوجة من سعف النخيل تتضمن تشكيلة فاخرة من عسل الصعيد والدلتا والمكسرات.
              </p>
            </div>
            <div className="mt-auto flex items-center justify-between border-t border-stone-100 pt-[calc(3.5*var(--u,1px))]">
              <span className="font-bold text-[#B68763] text-[calc(8.5*var(--u,1px))]">السعر</span>
              <span dir="ltr" className="font-extrabold text-[#443000] text-[calc(10.5*var(--u,1px))]">
                3000 L.E
              </span>
            </div>
          </div>
        </div>

        {/* Row 1, Col 2: Wicker Basket Medium */}
        <div className="w-full h-full bg-white shadow-[0_1px_4px_rgba(0,0,0,0.06)] rounded-xs overflow-hidden flex flex-col justify-between border border-stone-200/40">
          <div className="w-full h-[50%] shrink-0 overflow-hidden bg-stone-50">
            <img
              src="/magazine/assets/p2_honey_jar.webp"
              alt="عسل سلة NA7LA وسط"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-h-0 flex flex-col justify-between p-[calc(6*var(--u,1px))]">
            <div className="overflow-hidden">
              <h3 className="font-bold text-[#443000] text-[calc(9.5*var(--u,1px))] line-clamp-1 truncate">
                عسل سلة هاندكرافتد وسط
              </h3>
              <p className="text-[calc(7.2*var(--u,1px))] text-stone-600 leading-snug line-clamp-2 mt-1 opacity-85">
                سلة سعف نخيل يدوية تضم برطمان عسل طبيعي فاخر مع قرص العسل.
              </p>
            </div>
            <div className="mt-auto flex items-center justify-between border-t border-stone-100 pt-[calc(3.5*var(--u,1px))]">
              <span className="font-bold text-[#B68763] text-[calc(8.5*var(--u,1px))]">السعر</span>
              <span dir="ltr" className="font-extrabold text-[#443000] text-[calc(10.5*var(--u,1px))]">
                400 L.E
              </span>
            </div>
          </div>
        </div>

        {/* Row 2, Col 1: Olive Oil 750ml */}
        <div className="w-full h-full bg-white shadow-[0_1px_4px_rgba(0,0,0,0.06)] rounded-xs overflow-hidden flex flex-col justify-between border border-stone-200/40">
          <div className="w-full h-[50%] shrink-0 overflow-hidden bg-stone-50">
            <img
              src="/uploads/products/image197.jpg"
              alt="زيت زيتون بكر ممتاز 750 ML"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-h-0 flex flex-col justify-between p-[calc(6*var(--u,1px))]">
            <div className="overflow-hidden">
              <h3 className="font-bold text-[#443000] text-[calc(9.5*var(--u,1px))] line-clamp-1 truncate">
                زيت زيتون بكر ممتاز 750 ML
              </h3>
              <p className="text-[calc(7.2*var(--u,1px))] text-stone-600 leading-snug line-clamp-2 mt-1 opacity-85">
                عصرة أولى على البارد من مزارع الزيتون المصرية النقية، حموضة منخفضة ونكهة غنية.
              </p>
            </div>
            <div className="mt-auto flex items-center justify-between border-t border-stone-100 pt-[calc(3.5*var(--u,1px))]">
              <span className="font-bold text-[#B68763] text-[calc(8.5*var(--u,1px))]">السعر</span>
              <span dir="ltr" className="font-extrabold text-[#443000] text-[calc(10.5*var(--u,1px))]">
                575 L.E
              </span>
            </div>
          </div>
        </div>

        {/* Row 2, Col 2: Olive Oil 1L */}
        <div className="w-full h-full bg-white shadow-[0_1px_4px_rgba(0,0,0,0.06)] rounded-xs overflow-hidden flex flex-col justify-between border border-stone-200/40">
          <div className="w-full h-[50%] shrink-0 overflow-hidden bg-stone-50">
            <img
              src="/uploads/products/image2.jpg"
              alt="زيت زيتون بكر ممتاز 1 لتر"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-h-0 flex flex-col justify-between p-[calc(6*var(--u,1px))]">
            <div className="overflow-hidden">
              <h3 className="font-bold text-[#443000] text-[calc(9.5*var(--u,1px))] line-clamp-1 truncate">
                زيت زيتون بكر ممتاز 1 لتر
              </h3>
              <p className="text-[calc(7.2*var(--u,1px))] text-stone-600 leading-snug line-clamp-2 mt-1 opacity-85">
                زيت زيتون فيرجين إكسترا نقي، معبأ بأعلى معايير الجودة لصندوق دعم الصناعات.
              </p>
            </div>
            <div className="mt-auto flex items-center justify-between border-t border-stone-100 pt-[calc(3.5*var(--u,1px))]">
              <span className="font-bold text-[#B68763] text-[calc(8.5*var(--u,1px))]">السعر</span>
              <span dir="ltr" className="font-extrabold text-[#443000] text-[calc(10.5*var(--u,1px))]">
                750 L.E
              </span>
            </div>
          </div>
        </div>

        {/* Row 3, Col 1: Bottom Rural Seal */}
        <div className="w-full h-full bg-white shadow-[0_1px_4px_rgba(0,0,0,0.06)] rounded-xs overflow-hidden flex flex-col items-center justify-center p-3 text-center border border-stone-200/40">
          <div className="h-[65%] flex items-center justify-center">
            <img
              src="/magazine/assets/p2_rural_seal.webp"
              alt="من مناحل ومزارع صندوق دعم الصناعات الريفية"
              className="max-h-full max-w-full object-contain"
            />
          </div>
          <div className="mt-1 text-center">
            <span className="text-[calc(7.5*var(--u,1px))] text-stone-500 font-bold">إنتاج مصري أصيل</span>
            <p className="text-[calc(7.5*var(--u,1px))] text-[#443000] font-bold mt-0.5">صندوق دعم الصناعات الريفية والبيئية</p>
          </div>
        </div>

        {/* Row 3, Col 2: Dates 1KG */}
        <div className="w-full h-full bg-white shadow-[0_1px_4px_rgba(0,0,0,0.06)] rounded-xs overflow-hidden flex flex-col justify-between border border-stone-200/40">
          <div className="w-full h-[50%] shrink-0 overflow-hidden bg-stone-50">
            <img
              src="/uploads/products/image20.jpg"
              alt="تمور نخلة طبيعية 1 KG"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-h-0 flex flex-col justify-between p-[calc(6*var(--u,1px))]">
            <div className="overflow-hidden">
              <h3 className="font-bold text-[#443000] text-[calc(9.5*var(--u,1px))] line-clamp-1 truncate">
                تمور واحات طبيعية 1 KG
              </h3>
              <p className="text-[calc(7.2*var(--u,1px))] text-stone-600 leading-snug line-clamp-2 mt-1 opacity-85">
                تمور فاخرة من أراضي الواحات المصرية، ناعمة وحلوة المذاق وغنية بالمعادن والألياف.
              </p>
            </div>
            <div className="mt-auto flex items-center justify-between border-t border-stone-100 pt-[calc(3.5*var(--u,1px))]">
              <span className="font-bold text-[#B68763] text-[calc(8.5*var(--u,1px))]">السعر</span>
              <span dir="ltr" className="font-extrabold text-[#443000] text-[calc(10.5*var(--u,1px))]">
                400 L.E
              </span>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
