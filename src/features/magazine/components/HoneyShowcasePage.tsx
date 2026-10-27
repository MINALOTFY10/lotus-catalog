import React from 'react';
import { PageShell } from './PageShell';

interface HoneyShowcasePageProps {
  pageNumber?: number;
}

export function HoneyShowcasePage({ pageNumber = 1 }: HoneyShowcasePageProps) {
  return (
    <PageShell sectionTitle="NA7LA عسل نقي" pageNumber={pageNumber}>
      <div
        className="grid grid-cols-2 grid-rows-3 w-full h-full"
        style={{
          gap: 'calc(10 * var(--u, 1px)) calc(12 * var(--u, 1px))',
          direction: 'rtl',
        }}
      >
        {/* Row 1, Col 1 (Right): Bee Brand Card */}
        <div className="w-full h-full bg-white shadow-[0_1px_4px_rgba(0,0,0,0.06)] rounded-xs overflow-hidden flex flex-col items-center justify-center p-3 text-center border border-stone-200/40">
          <div className="h-[55%] flex items-center justify-center">
            <img
              src="/magazine/assets/p1_bee_logo.webp"
              alt="شعار نحلة NA7LA"
              className="max-h-full max-w-full object-contain"
            />
          </div>
          <div className="mt-2 text-center">
            <h3 className="font-extrabold text-[#443000] text-[calc(10.5*var(--u,1px))]">نحلة NA7LA</h3>
            <p className="text-[calc(8*var(--u,1px))] text-stone-600 font-semibold mt-0.5">عسل برسيم طبيعي 100%</p>
          </div>
        </div>

        {/* Row 1, Col 2 (Left): 1.5 KG Honey Jar */}
        <div className="w-full h-full bg-white shadow-[0_1px_4px_rgba(0,0,0,0.06)] rounded-xs overflow-hidden flex flex-col justify-between border border-stone-200/40">
          <div className="w-full h-[50%] shrink-0 overflow-hidden bg-stone-50">
            <img
              src="/magazine/assets/p1_honey_1_5kg.webp"
              alt="عسل نقي NA7LA 1.5 KG"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-h-0 flex flex-col justify-between p-[calc(6*var(--u,1px))]">
            <div className="overflow-hidden">
              <h3 className="font-bold text-[#443000] text-[calc(9.5*var(--u,1px))] line-clamp-1 truncate">
                عسل نقي NA7LA 1.5 KG
              </h3>
              <p className="text-[calc(7.2*var(--u,1px))] text-stone-600 leading-snug line-clamp-2 mt-1 opacity-85">
                عسل برسيم طبيعي فاخر غني بالفيتامينات والإنزيمات الطبيعية لتعزيز الطاقة والمناعة.
              </p>
            </div>
            <div className="mt-auto flex items-center justify-between border-t border-stone-100 pt-[calc(3.5*var(--u,1px))]">
              <span className="font-bold text-[#B68763] text-[calc(8.5*var(--u,1px))]">السعر</span>
              <span dir="ltr" className="font-extrabold text-[#443000] text-[calc(10.5*var(--u,1px))]">
                560 L.E
              </span>
            </div>
          </div>
        </div>

        {/* Row 2, Col 1 (Right): Honey with Comb */}
        <div className="w-full h-full bg-white shadow-[0_1px_4px_rgba(0,0,0,0.06)] rounded-xs overflow-hidden flex flex-col justify-between border border-stone-200/40">
          <div className="w-full h-[50%] shrink-0 overflow-hidden bg-stone-50">
            <img
              src="/magazine/assets/p1_honey_comb.webp"
              alt="عسل نقي مع قرص العسل"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-h-0 flex flex-col justify-between p-[calc(6*var(--u,1px))]">
            <div className="overflow-hidden">
              <h3 className="font-bold text-[#443000] text-[calc(9.5*var(--u,1px))] line-clamp-1 truncate">
                عسل نقي مع قرص العسل 650G
              </h3>
              <p className="text-[calc(7.2*var(--u,1px))] text-stone-600 leading-snug line-clamp-2 mt-1 opacity-85">
                برطمان فاخر من عسل البرسيم الطبيعي مملوء بقرص العسل الذهبي الغني بالمذاق الطبيعي.
              </p>
            </div>
            <div className="mt-auto flex items-center justify-between border-t border-stone-100 pt-[calc(3.5*var(--u,1px))]">
              <span className="font-bold text-[#B68763] text-[calc(8.5*var(--u,1px))]">السعر</span>
              <span dir="ltr" className="font-extrabold text-[#443000] text-[calc(10.5*var(--u,1px))]">
                470 L.E
              </span>
            </div>
          </div>
        </div>

        {/* Row 2, Col 2 (Left): Honey with Nuts */}
        <div className="w-full h-full bg-white shadow-[0_1px_4px_rgba(0,0,0,0.06)] rounded-xs overflow-hidden flex flex-col justify-between border border-stone-200/40">
          <div className="w-full h-[50%] shrink-0 overflow-hidden bg-stone-50">
            <img
              src="/uploads/products/image100.jpg"
              alt="عسل نقي مع مكسرات"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-h-0 flex flex-col justify-between p-[calc(6*var(--u,1px))]">
            <div className="overflow-hidden">
              <h3 className="font-bold text-[#443000] text-[calc(9.5*var(--u,1px))] line-clamp-1 truncate">
                عسل نقي مع مكسرات 650G
              </h3>
              <p className="text-[calc(7.2*var(--u,1px))] text-stone-600 leading-snug line-clamp-2 mt-1 opacity-85">
                مزيج فاخر من عسل البرسيم الطبيعي ومكسرات طازجة مقرمشة، غنية بالبروتينات والطاقة المفيدة.
              </p>
            </div>
            <div className="mt-auto flex items-center justify-between border-t border-stone-100 pt-[calc(3.5*var(--u,1px))]">
              <span className="font-bold text-[#B68763] text-[calc(8.5*var(--u,1px))]">السعر</span>
              <span dir="ltr" className="font-extrabold text-[#443000] text-[calc(10.5*var(--u,1px))]">
                650 L.E
              </span>
            </div>
          </div>
        </div>

        {/* Row 3, Col 1 (Right): Honeycomb Seal */}
        <div className="w-full h-full bg-white shadow-[0_1px_4px_rgba(0,0,0,0.06)] rounded-xs overflow-hidden flex flex-col items-center justify-center p-3 text-center border border-stone-200/40">
          <div className="h-[65%] flex items-center justify-center">
            <img
              src="/magazine/assets/p1_honeycomb_seal.webp"
              alt="صندوق دعم الصناعات الريفية والبيئية"
              className="max-h-full max-w-full object-contain"
            />
          </div>
          <div className="mt-1 text-center">
            <span className="text-[calc(7.5*var(--u,1px))] text-stone-500 font-bold">طبيعي ١٠٠٪</span>
            <p className="text-[calc(7.5*var(--u,1px))] text-[#443000] font-bold mt-0.5">من مناحل دعم الصناعات الريفية - مصر</p>
          </div>
        </div>

        {/* Row 3, Col 2 (Left): Premium Honey Special */}
        <div className="w-full h-full bg-white shadow-[0_1px_4px_rgba(0,0,0,0.06)] rounded-xs overflow-hidden flex flex-col justify-between border border-stone-200/40">
          <div className="w-full h-[50%] shrink-0 overflow-hidden bg-stone-50">
            <img
              src="/uploads/products/image1.jpg"
              alt="عسل سدر جبلي فاخر"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-h-0 flex flex-col justify-between p-[calc(6*var(--u,1px))]">
            <div className="overflow-hidden">
              <h3 className="font-bold text-[#443000] text-[calc(9.5*var(--u,1px))] line-clamp-1 truncate">
                عسل سدر جبلي مصري 650G
              </h3>
              <p className="text-[calc(7.2*var(--u,1px))] text-stone-600 leading-snug line-clamp-2 mt-1 opacity-85">
                عسل نقي مستخلص من أزهار السدر البرية في واحات مصر، نكهة قوية وقيمة غذائية عالية.
              </p>
            </div>
            <div className="mt-auto flex items-center justify-between border-t border-stone-100 pt-[calc(3.5*var(--u,1px))]">
              <span className="font-bold text-[#B68763] text-[calc(8.5*var(--u,1px))]">السعر</span>
              <span dir="ltr" className="font-extrabold text-[#443000] text-[calc(10.5*var(--u,1px))]">
                720 L.E
              </span>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
