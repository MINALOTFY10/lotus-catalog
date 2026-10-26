'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MagazinePageData, PageSlotData } from '@/features/magazine/types';
import { Grid3x3Page } from '@/features/magazine/components/Grid3x3Page';
import { AdminProductRecord } from '../products/actions';
import { SlotPickerModal } from './SlotPickerModal';
import { runAutoLayoutAction, updatePageSectionTitleAction } from './actions';

interface ComposerViewProps {
  initialPages: MagazinePageData[];
  availableProducts: AdminProductRecord[];
}

export function ComposerView({
  initialPages,
  availableProducts,
}: ComposerViewProps) {
  const router = useRouter();
  const [pages, setPages] = useState<MagazinePageData[]>(initialPages);
  const [currentPageIndex, setCurrentPageIndex] = useState<number>(1); // Start on page 2 (first 3x3 catalog page)
  const [activeSlotNumber, setActiveSlotNumber] = useState<number | null>(null);
  const [isSlotModalOpen, setIsSlotModalOpen] = useState(false);
  const [sectionTitle, setSectionTitle] = useState(
    initialPages[1]?.sectionTitle || 'قائمة الأسعار'
  );
  const [savingTitle, setSavingTitle] = useState(false);
  const [autoLayoutLoading, setAutoLayoutLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const activePage = pages[currentPageIndex] || pages[0];

  const handlePageSelect = (index: number) => {
    setCurrentPageIndex(index);
    setSectionTitle(pages[index]?.sectionTitle || '');
  };

  const handleSlotClick = (slotNumber: number) => {
    setActiveSlotNumber(slotNumber);
    setIsSlotModalOpen(true);
  };

  const handleSlotSuccess = () => {
    setFeedback('تم تحديث الخانة بنجاح في المجلة');
    setTimeout(() => setFeedback(null), 3000);
    router.refresh();
  };

  const handleUpdateSectionTitle = async () => {
    setSavingTitle(true);
    const res = await updatePageSectionTitleAction(activePage.pageNumber, sectionTitle);
    if (res.success) {
      setPages((prev) =>
        prev.map((p) =>
          p.pageNumber === activePage.pageNumber ? { ...p, sectionTitle } : p
        )
      );
      setFeedback('تم حفظ عنوان القسم');
      setTimeout(() => setFeedback(null), 3000);
    }
    setSavingTitle(false);
  };

  const handleRunAutoLayout = async () => {
    if (!window.confirm('هل أنت متأكد من رغبتك في إعادة التوليد التلقائي لجميع الصفحات بناءً على تصنيفات المنتجات؟')) {
      return;
    }
    setAutoLayoutLoading(true);
    const res = await runAutoLayoutAction();
    if (res.success) {
      setFeedback(`تم إعادة توليد ${res.totalPages} صفحة تلقائيًا بنجاح`);
      setTimeout(() => setFeedback(null), 4000);
      router.refresh();
    } else {
      alert(res.error || 'حدث خطأ أثناء التوليد');
    }
    setAutoLayoutLoading(false);
  };

  const currentSlotData: PageSlotData | undefined = activePage.slots?.find(
    (s) => s.slot === activeSlotNumber
  );

  return (
    <div className="space-y-6">
      {/* Top Composer Bar */}
      <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Page navigation */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-stone-100 p-1 rounded-xl">
            <button
              onClick={() => handlePageSelect(Math.max(currentPageIndex - 1, 0))}
              disabled={currentPageIndex === 0}
              className="p-2 text-stone-700 hover:bg-white rounded-lg disabled:opacity-30 transition-colors"
              title="الصفحة السابقة"
            >
              <svg className="w-5 h-5 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <select
              value={currentPageIndex}
              onChange={(e) => handlePageSelect(Number(e.target.value))}
              className="text-xs font-bold bg-white border border-stone-200 rounded-lg px-3 py-1.5 text-stone-800 focus:outline-hidden focus:border-[#B68763]"
            >
              {pages.map((p, idx) => (
                <option key={p.pageNumber} value={idx}>
                  صفحة {p.pageNumber}: {p.sectionTitle || p.template}
                </option>
              ))}
            </select>

            <button
              onClick={() => handlePageSelect(Math.min(currentPageIndex + 1, pages.length - 1))}
              disabled={currentPageIndex === pages.length - 1}
              className="p-2 text-stone-700 hover:bg-white rounded-lg disabled:opacity-30 transition-colors"
              title="الصفحة التالية"
            >
              <svg className="w-5 h-5 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <span className="text-xs font-bold text-stone-500">
            صفحة {activePage.pageNumber} من {pages.length}
          </span>
        </div>

        {/* Section title editor */}
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <input
            type="text"
            value={sectionTitle}
            onChange={(e) => setSectionTitle(e.target.value)}
            placeholder="عنوان القسم الجانبي..."
            className="flex-1 text-xs bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-900 font-bold focus:outline-hidden focus:border-[#B68763] focus:bg-white"
          />
          <button
            type="button"
            onClick={handleUpdateSectionTitle}
            disabled={savingTitle}
            className="bg-[#443000] hover:bg-[#5c4205] text-white text-xs font-bold px-3 py-2 rounded-xl transition-colors disabled:opacity-50 whitespace-nowrap"
          >
            {savingTitle ? 'حفظ...' : 'حفظ العنوان'}
          </button>
        </div>

        {/* Utility buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleRunAutoLayout}
            disabled={autoLayoutLoading}
            className="bg-amber-100/70 hover:bg-amber-200/80 text-[#443000] text-xs font-bold px-4 py-2 rounded-xl transition-colors disabled:opacity-50 flex items-center gap-1.5"
          >
            <span>{autoLayoutLoading ? 'جاري التوزيع...' : 'إعادة التوزيع التلقائي (Auto-Layout)'}</span>
          </button>

          <Link
            href={`/magazine?p=${activePage.pageNumber}`}
            target="_blank"
            className="bg-[#B68763] hover:bg-[#966b4b] text-white text-xs font-bold px-4 py-2 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
          >
            <span>معاينة حية</span>
            <svg className="w-3.5 h-3.5 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </Link>
        </div>
      </div>

      {feedback && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-2xl text-center animate-in fade-in">
          {feedback}
        </div>
      )}

      {/* Editor Instruction Alert */}
      <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 text-xs text-stone-600 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#B68763]"></span>
          <span>
            <strong>وضع التحرير التفاعلي:</strong> اضغط على أي خانة من خانات الصفحة التسعة (1 إلى 9) لاختيار منتج أو تعديل بيانات العرض.
          </span>
        </div>
        <span className="text-[11px] text-stone-400 font-mono">
          أبعاد كانفا القياسية (595.5 × 842.25 pt)
        </span>

      </div>

      {/* Visual Canvas Area */}
      <div className="flex justify-center p-4 bg-stone-200/50 rounded-3xl border border-stone-200 overflow-hidden shadow-inner">
        <div className="max-w-[720px] w-full relative group">
          {/* Slot Click Overlay Layer for 3x3 Grid pages */}
          {activePage.template === 'grid3x3' ? (
            <div className="relative">
              <Grid3x3Page
                sectionTitle={activePage.sectionTitle}
                pageNumber={activePage.pageNumber}
                slots={activePage.slots || []}
                isInteractive={false}
              />

              {/* Interactive Hotspots for the 9 slots */}
              <div
                className="absolute inset-0 z-20 pointer-events-auto"
                style={{
                  top: 'calc(170 * var(--u))',
                  left: 'calc(24 * var(--u))',
                  width: 'calc(486 * var(--u))',
                  height: 'calc(640 * var(--u))',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gridTemplateRows: 'repeat(3, 1fr)',
                  gap: 'calc(10 * var(--u))',
                }}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((slotNum) => {
                  const slotProduct = activePage.slots?.find((s) => s.slot === slotNum);
                  return (
                    <button
                      key={slotNum}
                      type="button"
                      onClick={() => handleSlotClick(slotNum)}
                      className="group/slot relative w-full h-full rounded-lg border-2 border-dashed border-transparent hover:border-[#B68763] hover:bg-[#B68763]/10 transition-all flex flex-col items-center justify-center cursor-pointer"
                      title={`تعديل الخانة #${slotNum}`}
                    >
                      <div className="opacity-0 group-hover/slot:opacity-100 bg-[#443000]/90 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-1 rounded shadow-md transition-opacity flex items-center gap-1">
                        <span className="text-[#B68763]">#{slotNum}</span>
                        <span>{slotProduct?.product ? 'تغيير' : 'تعيين'}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-12 text-center border border-stone-200">
              <h3 className="text-xl font-bold text-[#443000]">{activePage.sectionTitle}</h3>
              <p className="text-xs text-stone-500 mt-2">
                هذه صفحة بنموذج {activePage.template}. التحرير متاح لصفحات الكتالوج 3×3.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Slot Picker Modal */}
      {activeSlotNumber && (
        <SlotPickerModal
          pageNumber={activePage.pageNumber}
          slotNumber={activeSlotNumber}
          currentSlotData={currentSlotData}
          availableProducts={availableProducts}
          isOpen={isSlotModalOpen}
          onClose={() => {
            setIsSlotModalOpen(false);
            setActiveSlotNumber(null);
          }}
          onSuccess={handleSlotSuccess}
        />
      )}
    </div>
  );
}
