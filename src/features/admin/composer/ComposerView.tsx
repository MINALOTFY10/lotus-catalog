'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MagazinePageData, PageSlotData } from '@/features/magazine/types';
import { AdminProductRecord } from '../products/actions';
import { SlotPickerModal } from './SlotPickerModal';
import { updatePageSectionTitleAction, swapPageSlotsAction } from './actions';
import { PageShell } from '@/features/magazine/components/PageShell';
import { ProductCard } from '@/features/magazine/components/ProductCard';
import { getEffectiveSlotDimensions } from '@/features/magazine/dimensions';

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

  // Sync state when initialPages prop updates
  React.useEffect(() => {
    setPages(initialPages);
  }, [initialPages]);

  const [currentPageIndex, setCurrentPageIndex] = useState<number>(0);
  const [activeSlotNumber, setActiveSlotNumber] = useState<number | null>(null);
  const [isSlotModalOpen, setIsSlotModalOpen] = useState(false);
  const [savingTitle, setSavingTitle] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Fullscreen state
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  };

  // Drag and Drop state
  const [draggedSlotIdx, setDraggedSlotIdx] = useState<number | null>(null);
  const [dropTargetSlotIdx, setDropTargetSlotIdx] = useState<number | null>(null);
  const [isSwapping, setIsSwapping] = useState(false);

  const activePage = pages[currentPageIndex] || pages[0];
  const [sectionTitle, setSectionTitle] = useState(
    activePage?.section_title || activePage?.sectionTitle || ''
  );

  const handlePageSelect = (index: number) => {
    setCurrentPageIndex(index);
    const p = pages[index];
    setSectionTitle(p?.section_title || p?.sectionTitle || '');
    setDraggedSlotIdx(null);
    setDropTargetSlotIdx(null);
  };

  const handleSlotClick = (slotNumber: number) => {
    setActiveSlotNumber(slotNumber);
    setIsSlotModalOpen(true);
  };

  const handleSlotSuccess = (updatedSlot?: PageSlotData) => {
    setFeedback('تم تحديث بيانات المنتج بنجاح في المجلة');
    setTimeout(() => setFeedback(null), 3000);

    if (updatedSlot) {
      setPages((prevPages) =>
        prevPages.map((p, idx) => {
          if (idx !== currentPageIndex) return p;
          const currentSlots = [...(p.slots || [])];
          const slotIdx = currentSlots.findIndex((s) => s.slot === updatedSlot.slot);
          if (slotIdx >= 0) {
            currentSlots[slotIdx] = {
              ...currentSlots[slotIdx],
              ...updatedSlot,
            };
          } else {
            currentSlots.push(updatedSlot);
            currentSlots.sort((a, b) => a.slot - b.slot);
          }
          return {
            ...p,
            slots: currentSlots,
          };
        })
      );
    }

    router.refresh();
  };

  const handleUpdateSectionTitle = async () => {
    setSavingTitle(true);
    const pNum = activePage.position || activePage.pageNumber;
    const res = await updatePageSectionTitleAction(pNum, sectionTitle);
    if (res.success) {
      setPages((prev) =>
        prev.map((p) =>
          (p.position || p.pageNumber) === pNum
            ? { ...p, sectionTitle, section_title: sectionTitle }
            : p
        )
      );
      setFeedback('تم حفظ عنوان القسم');
      setTimeout(() => setFeedback(null), 3000);
    }
    setSavingTitle(false);
  };

  // Drag & Drop handlers
  const handleDragStart = (e: React.DragEvent, slotIdx: number) => {
    setDraggedSlotIdx(slotIdx);
    e.dataTransfer.setData('text/plain', String(slotIdx));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, slotIdx: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dropTargetSlotIdx !== slotIdx) {
      setDropTargetSlotIdx(slotIdx);
    }
  };

  const handleDragLeave = (_e: React.DragEvent, slotIdx: number) => {
    if (dropTargetSlotIdx === slotIdx) {
      setDropTargetSlotIdx(null);
    }
  };

  const handleDrop = async (e: React.DragEvent, targetSlotIdx: number) => {
    e.preventDefault();
    setDropTargetSlotIdx(null);
    const sourceIdxStr = e.dataTransfer.getData('text/plain');
    const sourceSlotIdx = sourceIdxStr !== '' ? Number(sourceIdxStr) : draggedSlotIdx;

    if (sourceSlotIdx === null || sourceSlotIdx === targetSlotIdx) {
      setDraggedSlotIdx(null);
      return;
    }

    // Optimistic local update
    const pNum = activePage.position || activePage.pageNumber;
    const oldSlots = [...(activePage.slots || [])];
    if (
      sourceSlotIdx < 0 ||
      sourceSlotIdx >= oldSlots.length ||
      targetSlotIdx < 0 ||
      targetSlotIdx >= oldSlots.length
    ) {
      setDraggedSlotIdx(null);
      return;
    }

    const newSlots = [...oldSlots];
    const sourceData = { ...newSlots[sourceSlotIdx] };
    const targetData = { ...newSlots[targetSlotIdx] };

    const srcNum = sourceData.slot || sourceSlotIdx + 1;
    const trgNum = targetData.slot || targetSlotIdx + 1;

    newSlots[sourceSlotIdx] = { ...targetData, slot: srcNum };
    newSlots[targetSlotIdx] = { ...sourceData, slot: trgNum };

    // Update in-memory state
    setPages((prev) =>
      prev.map((p) =>
        (p.position || p.pageNumber) === pNum ? { ...p, slots: newSlots } : p
      )
    );

    setDraggedSlotIdx(null);
    setIsSwapping(true);

    // Call server action
    const res = await swapPageSlotsAction(pNum, sourceSlotIdx, targetSlotIdx);
    setIsSwapping(false);

    if (res.success) {
      setFeedback('تم تبديل أماكن المنتجات بنجاح');
      setTimeout(() => setFeedback(null), 3000);
      router.refresh();
    } else {
      // Revert optimistic update on error
      setPages((prev) =>
        prev.map((p) =>
          (p.position || p.pageNumber) === pNum ? { ...p, slots: oldSlots } : p
        )
      );
      alert(res.error || 'فشل في تبديل أماكن المنتجات');
    }
  };

  const currentSlotData: PageSlotData | undefined = activePage.slots?.find(
    (s) => s.slot === activeSlotNumber
  );

  const effectiveModalDims = activeSlotNumber
    ? getEffectiveSlotDimensions(activePage, currentSlotData, activeSlotNumber - 1)
    : { col_span: 1, row_span: 1 };

  const modalSlotData: PageSlotData | undefined = currentSlotData
    ? {
        ...currentSlotData,
        col_span: currentSlotData.col_span || effectiveModalDims.col_span,
        row_span: currentSlotData.row_span || effectiveModalDims.row_span,
      }
    : activeSlotNumber
    ? {
        slot: activeSlotNumber,
        col_span: effectiveModalDims.col_span,
        row_span: effectiveModalDims.row_span,
      }
    : undefined;

  const pageNum = activePage.position || activePage.pageNumber;
  const currentSection = activePage.section_title || activePage.sectionTitle || 'مجموعة التراث المصري';
  const slots = activePage.slots || [];

  /**
   * Helper to render a card wrapper with Drag & Drop handles, Edit Button, and Dimensions Support
   */
  const renderCardSlot = (slotData: PageSlotData | null, slotIdx: number, applySpan = false) => {
    const slotNumber = slotData?.slot || slotIdx + 1;
    const isDragged = draggedSlotIdx === slotIdx;
    const isOver = dropTargetSlotIdx === slotIdx;
    const dims = getEffectiveSlotDimensions(activePage, slotData, slotIdx);
    const colSpan = dims.col_span;
    const rowSpan = dims.row_span;

    return (
      <div
        key={slotIdx}
        draggable={true}
        onDragStart={(e) => handleDragStart(e, slotIdx)}
        onDragOver={(e) => handleDragOver(e, slotIdx)}
        onDragLeave={(e) => handleDragLeave(e, slotIdx)}
        onDrop={(e) => handleDrop(e, slotIdx)}
        style={
          applySpan
            ? {
                gridColumn: `span ${colSpan} / span ${colSpan}`,
                gridRow: `span ${rowSpan} / span ${rowSpan}`,
              }
            : undefined
        }
        className={`group/composer-card relative w-full h-full min-h-0 min-w-0 rounded-[calc(5*var(--u,1px))] transition-all select-none ${
          isDragged ? 'opacity-40 scale-95 ring-2 ring-[#B68763]' : ''
        } ${isOver ? 'ring-4 ring-[#443000] scale-[1.02] z-30' : ''}`}
      >
        {/* The Actual Product Card */}
        {slotData ? (
          <ProductCard
            product={slotData.product}
            titleOverride={slotData.title_override}
            descriptionOverride={slotData.description_override}
            priceOverride={slotData.price_override}
            priceText={slotData.price_text}
            imageOverride={slotData.image_override}
            isInteractive={false}
            imageShare={rowSpan >= 2 ? 62 : colSpan >= 2 ? 56 : undefined}
          />
        ) : (
          <div className="product-card w-full h-full bg-stone-100/80 border border-dashed border-stone-300 rounded-[calc(5*var(--u,1px))] flex flex-col items-center justify-center text-stone-400 text-xs">
            <span>خانة فارغة #{slotNumber}</span>
          </div>
        )}

        {/* Hover / Action Overlay for Admin: Edit Button & Drag Handle */}
        <div className="absolute top-[calc(4*var(--u,1px))] left-[calc(4*var(--u,1px))] z-30 flex items-center gap-1.5 opacity-90 group-hover/composer-card:opacity-100 transition-opacity">
          {/* Edit Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleSlotClick(slotNumber);
            }}
            className="flex items-center gap-1 px-2 py-1 bg-[#443000] hover:bg-[#B68763] text-white text-[11px] font-bold rounded-lg shadow-md transition-all cursor-pointer"
            title={`تعديل بيانات وحجم المنتج في الخانة #${slotNumber}`}
          >
            <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.2"
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
              />
            </svg>
            <span>تعديل</span>
          </button>

          {/* Drag Handle Indicator */}
          <div
            className="flex items-center justify-center w-6 h-6 bg-white/95 text-stone-700 rounded-lg shadow-md cursor-grab active:cursor-grabbing border border-stone-200"
            title="اسحب لتغيير الترتيب (Drag & Drop)"
          >
            <svg className="w-3.5 h-3.5 text-stone-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 8h16M4 16h16" />
            </svg>
          </div>
        </div>

        {/* Slot Number & Dimensions Badge */}
        <div className="absolute bottom-[calc(4*var(--u,1px))] right-[calc(4*var(--u,1px))] z-20 pointer-events-none flex items-center gap-1">
          {(colSpan > 1 || rowSpan > 1) && (
            <span className="bg-[#443000]/85 text-amber-200 text-[9px] font-mono font-bold px-1 py-0.5 rounded">
              {colSpan}×{rowSpan}
            </span>
          )}
          <span className="bg-black/65 backdrop-blur-xs text-white text-[10px] font-mono font-bold px-1.5 py-0.5 rounded">
            #{slotNumber}
          </span>
        </div>
      </div>
    );
  };

  /**
   * Render layout matching the live magazine template
   */
  const renderLayoutContent = () => {
    // 1. Showcase honey page (Page 1)
    if (activePage.template === 'showcase-honey') {
      const slot1 = slots.find((s) => s.slot === 1) || slots[0];
      const slot2 = slots.find((s) => s.slot === 2) || slots[1];
      const slot3 = slots.find((s) => s.slot === 3) || slots[2];
      const slot4 = slots.find((s) => s.slot === 4) || slots[3];

      return (
        <div
          className="w-full h-full grid grid-cols-2 grid-rows-3"
          style={{ gap: 'calc(8 * var(--u, 1px))', direction: 'rtl' }}
        >
          {/* Row 1, Col 1: NA7LA Brand Badge */}
          <div className="w-full h-full min-h-0 min-w-0 overflow-hidden rounded-[calc(5*var(--u,1px))] border border-stone-200/70 shadow-[0_2px_8px_rgba(0,0,0,0.04)] bg-white">
            <img
              src="/magazine/brand_cards/na7la_brand_badge.webp"
              alt="نحلة NA7LA"
              className="w-full h-full object-cover block"
            />
          </div>
          {/* Row 1, Col 2: Slot 1 */}
          <div className="w-full h-full min-h-0 min-w-0">{renderCardSlot(slot1 || null, 0)}</div>
          {/* Row 2, Col 1: Slot 2 */}
          <div className="w-full h-full min-h-0 min-w-0">{renderCardSlot(slot2 || null, 1)}</div>
          {/* Row 2, Col 2: Slot 3 */}
          <div className="w-full h-full min-h-0 min-w-0">{renderCardSlot(slot3 || null, 2)}</div>
          {/* Row 3, Col 1: Slot 4 */}
          <div className="w-full h-full min-h-0 min-w-0">{renderCardSlot(slot4 || null, 3)}</div>
          {/* Row 3, Col 2: Honey Eco Badge */}
          <div className="w-full h-full min-h-0 min-w-0 overflow-hidden rounded-[calc(5*var(--u,1px))] border border-stone-200/70 shadow-[0_2px_8px_rgba(0,0,0,0.04)] bg-white">
            <img
              src="/magazine/brand_cards/honey_eco_badge.webp"
              alt="Natural Egypt Apiaries"
              className="w-full h-full object-cover block"
            />
          </div>
        </div>
      );
    }

    // 2. Showcase food page (Page 2)
    if (activePage.template === 'showcase-food') {
      const oliveSlot = slots.find((s) => s.slot === 1) || slots[0];
      const datesSlot = slots.find((s) => s.slot === 2) || slots[1];

      return (
        <div
          className="w-full h-full flex flex-col justify-between"
          style={{ gap: 'calc(8 * var(--u, 1px))', direction: 'rtl' }}
        >
          {/* Row 1 */}
          <div className="grid grid-cols-2 flex-1 min-h-0" style={{ gap: 'calc(8 * var(--u, 1px))' }}>
            <div className="w-full h-full min-h-0 min-w-0 overflow-hidden rounded-[calc(5*var(--u,1px))] border border-stone-200/70 shadow-[0_2px_8px_rgba(0,0,0,0.04)] bg-white">
              <img
                src="/magazine/brand_cards/nakhla_brand_badge.webp"
                alt="تمور نخلة NAKHLA"
                className="w-full h-full object-cover block"
              />
            </div>
            <div className="w-full h-full min-h-0 min-w-0">{renderCardSlot(oliveSlot || null, 0)}</div>
          </div>
          {/* Row 2 */}
          <div className="grid grid-cols-2 flex-1 min-h-0" style={{ gap: 'calc(8 * var(--u, 1px))' }}>
            <div className="w-full h-full min-h-0 min-w-0">{renderCardSlot(datesSlot || null, 1)}</div>
            <div className="w-full h-full min-h-0 min-w-0 overflow-hidden rounded-[calc(5*var(--u,1px))] border border-stone-200/70 shadow-[0_2px_8px_rgba(0,0,0,0.04)] bg-white">
              <img
                src="/magazine/brand_cards/waj_brand_badge.webp"
                alt="واج WAJ زيت زيتون"
                className="w-full h-full object-cover block"
              />
            </div>
          </div>
          {/* Row 3 */}
          <div className="w-full flex-1 min-h-0 overflow-hidden rounded-[calc(5*var(--u,1px))] border border-stone-200/70 shadow-[0_2px_8px_rgba(0,0,0,0.04)] bg-white">
            <img
              src="/magazine/brand_cards/food_eco_badge.webp"
              alt="صندوق دعم الصناعات الريفية والبيئية"
              className="w-full h-full object-cover block"
            />
          </div>
        </div>
      );
    }

    // 3. Grid 2x3 (6 cards)
    if (activePage.template === 'grid2x3') {
      const list = Array.from({ length: 6 }, (_, idx) => slots[idx] || null);
      return (
        <div
          className="grid grid-cols-2 grid-rows-3 w-full h-full"
          style={{ gap: 'calc(8 * var(--u, 1px))', direction: 'rtl' }}
        >
          {list.map((slotData, idx) => (
            <div key={idx} className="w-full h-full min-h-0 min-w-0">
              {renderCardSlot(slotData, idx)}
            </div>
          ))}
        </div>
      );
    }

    // 4. Grid 2x2 (4 cards)
    if (activePage.template === 'grid2x2' || (activePage.template === 'grid-custom' && slots.length === 4)) {
      const list = Array.from({ length: 4 }, (_, idx) => slots[idx] || null);
      return (
        <div
          className="grid grid-cols-2 grid-rows-2 w-full h-full"
          style={{ gap: 'calc(10 * var(--u, 1px))', direction: 'rtl' }}
        >
          {list.map((slotData, idx) => (
            <div key={idx} className="w-full h-full min-h-0 min-w-0">
              {renderCardSlot(slotData, idx)}
            </div>
          ))}
        </div>
      );
    }

    // 5. Hero-split (3 cards: 2 top, 1 hero bottom)
    if (activePage.template === 'hero-split' || (activePage.template === 'grid-custom' && slots.length === 3)) {
      const topSlots = slots.slice(0, 2);
      const heroSlot = slots[2] || null;
      return (
        <div
          className="w-full h-full flex flex-col justify-between"
          style={{ gap: 'calc(10 * var(--u, 1px))', direction: 'rtl' }}
        >
          <div className="grid grid-cols-2 flex-1 min-h-0" style={{ gap: 'calc(10 * var(--u, 1px))' }}>
            {topSlots.map((slotData, idx) => (
              <div key={idx} className="w-full h-full min-h-0 min-w-0">
                {renderCardSlot(slotData, idx)}
              </div>
            ))}
          </div>
          <div className="w-full" style={{ height: '52%' }}>
            {renderCardSlot(heroSlot, 2)}
          </div>
        </div>
      );
    }

    // 6. 8-card layout
    if (slots.length === 8) {
      const row1 = slots.slice(0, 3);
      const row2 = slots.slice(3, 6);
      const row3 = slots.slice(6, 8);
      return (
        <div
          className="w-full h-full flex flex-col justify-between"
          style={{ gap: 'calc(8 * var(--u, 1px))', direction: 'rtl' }}
        >
          <div className="grid grid-cols-3 flex-1 min-h-0" style={{ gap: 'calc(8 * var(--u, 1px))' }}>
            {row1.map((slotData, idx) => (
              <div key={idx} className="w-full h-full min-h-0 min-w-0">
                {renderCardSlot(slotData, idx)}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-3 flex-1 min-h-0" style={{ gap: 'calc(8 * var(--u, 1px))' }}>
            {row2.map((slotData, idx) => (
              <div key={idx} className="w-full h-full min-h-0 min-w-0">
                {renderCardSlot(slotData, idx + 3)}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 flex-1 min-h-0" style={{ gap: 'calc(8 * var(--u, 1px))' }}>
            {row3.map((slotData, idx) => (
              <div key={idx} className="w-full h-full min-h-0 min-w-0">
                {renderCardSlot(slotData, idx + 6)}
              </div>
            ))}
          </div>
        </div>
      );
    }

    // 7. 7-card layout
    if (slots.length === 7) {
      if (activePage.pageNumber === 11) {
        const row1 = slots.slice(0, 3);
        const row2 = slots.slice(3, 5);
        const row3 = slots.slice(5, 7);
        return (
          <div
            className="w-full h-full flex flex-col justify-between"
            style={{ gap: 'calc(8 * var(--u, 1px))', direction: 'rtl' }}
          >
            <div className="grid grid-cols-3 flex-1 min-h-0" style={{ gap: 'calc(8 * var(--u, 1px))' }}>
              {row1.map((slotData, idx) => (
                <div key={idx} className="w-full h-full min-h-0 min-w-0">
                  {renderCardSlot(slotData, idx)}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 flex-1 min-h-0" style={{ gap: 'calc(8 * var(--u, 1px))' }}>
              {row2.map((slotData, idx) => (
                <div key={idx} className="w-full h-full min-h-0 min-w-0">
                  {renderCardSlot(slotData, idx + 3)}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 flex-1 min-h-0" style={{ gap: 'calc(8 * var(--u, 1px))' }}>
              {row3.map((slotData, idx) => (
                <div key={idx} className="w-full h-full min-h-0 min-w-0">
                  {renderCardSlot(slotData, idx + 5)}
                </div>
              ))}
            </div>
          </div>
        );
      }

      const row1 = slots.slice(0, 3);
      const row2 = slots.slice(3, 6);
      const heroSlot = slots[6] || null;
      return (
        <div
          className="w-full h-full flex flex-col justify-between"
          style={{ gap: 'calc(8 * var(--u, 1px))', direction: 'rtl' }}
        >
          <div className="grid grid-cols-3 flex-1 min-h-0" style={{ gap: 'calc(8 * var(--u, 1px))' }}>
            {row1.map((slotData, idx) => (
              <div key={idx} className="w-full h-full min-h-0 min-w-0">
                {renderCardSlot(slotData, idx)}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-3 flex-1 min-h-0" style={{ gap: 'calc(8 * var(--u, 1px))' }}>
            {row2.map((slotData, idx) => (
              <div key={idx} className="w-full h-full min-h-0 min-w-0">
                {renderCardSlot(slotData, idx + 3)}
              </div>
            ))}
          </div>
          <div className="flex justify-center flex-1 min-h-0">
            <div className="w-1/3 h-full min-h-0 min-w-0">
              {renderCardSlot(heroSlot, 6)}
            </div>
          </div>
        </div>
      );
    }

    // 8. Standard 9-card (3x3) layout
    const list9 = Array.from({ length: 9 }, (_, idx) => slots[idx] || null);
    return (
      <div
        className="grid grid-cols-3 grid-rows-3 w-full h-full"
        style={{
          gap: 'calc(11.1 * var(--u, 1px)) calc(12.7 * var(--u, 1px))',
          direction: 'rtl',
        }}
      >
        {list9.map((slotData, idx) => (
          <React.Fragment key={idx}>
            {renderCardSlot(slotData, idx, true)}
          </React.Fragment>
        ))}
      </div>
    );
  };

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
              className="text-xs font-bold bg-white border border-stone-200 rounded-lg px-3 py-1.5 text-stone-800 focus:outline-hidden focus:border-[#B68763] cursor-pointer"
            >
              {pages.map((p, idx) => {
                const pos = p.position || p.pageNumber;
                const title = p.section_title || p.sectionTitle || p.template;
                return (
                  <option key={pos} value={idx}>
                    صفحة {pos}: {title}
                  </option>
                );
              })}
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

          <span className="text-xs font-bold text-stone-500 whitespace-nowrap">
            صفحة {pageNum} من {pages.length}
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
            className="bg-[#443000] hover:bg-[#5c4205] text-white text-xs font-bold px-3 py-2 rounded-xl transition-colors disabled:opacity-50 whitespace-nowrap cursor-pointer"
          >
            {savingTitle ? 'حفظ...' : 'حفظ العنوان'}
          </button>
        </div>

        {/* Live Preview Button */}
        <div className="flex items-center gap-2">
          <Link
            href={`/magazine?p=${pageNum}`}
            target="_blank"
            className="bg-[#B68763] hover:bg-[#966b4b] text-white text-xs font-bold px-4 py-2 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
          >
            <span>معاينة حية للمجلة</span>
            <svg className="w-3.5 h-3.5 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </Link>
        </div>
      </div>

      {feedback && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-2xl text-center animate-in fade-in">
          {feedback}
        </div>
      )}

      {isSwapping && (
        <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold rounded-2xl text-center animate-pulse">
          جاري حفظ الترتيب الجديد للمنتجات...
        </div>
      )}


      {/* Visual Canvas Area displaying the LIVE magazine page */}
      <div
        id="composer-canvas-container"
        className={`flex flex-col items-center justify-start p-4 bg-stone-200/50 rounded-3xl border border-stone-200 overflow-hidden shadow-inner relative transition-all ${
          isFullscreen ? 'fixed inset-0 z-50 rounded-none bg-[#F3F4F7] p-2 overflow-y-auto' : ''
        }`}
      >
        <div className="max-w-[720px] w-full relative">
          <PageShell sectionTitle={currentSection} pageNumber={pageNum}>
            {renderLayoutContent()}
          </PageShell>
        </div>

        {/* Floating Magazine Navigation & Control Bar */}
        <div className="sticky bottom-3 z-30 mt-4 px-2 sm:px-4 py-1.5 sm:py-2 bg-white/95 backdrop-blur shadow-md rounded-full border border-stone-200 flex items-center justify-center gap-1 sm:gap-3 text-xs font-medium transition-all max-w-[calc(100vw-20px)] mx-auto shrink-0 animate-rise-toolbar">
          {/* Next Page Button */}
          <button
            type="button"
            onClick={() => handlePageSelect(Math.min(currentPageIndex + 1, pages.length - 1))}
            disabled={currentPageIndex >= pages.length - 1}
            className="px-2 sm:px-3 py-1 sm:py-1.5 bg-stone-100 hover:bg-[#B68763] hover:text-white disabled:opacity-30 rounded-full text-[#443000] font-bold flex items-center gap-1 sm:gap-1.5 transition-all shadow-2xs shrink-0 whitespace-nowrap cursor-pointer"
            title="الصفحة التالية"
          >
            <span className="text-[11px] sm:text-xs">التالي</span>
            <svg
              className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Page Counter */}
          <span
            className="font-bold text-[#443000] px-1 sm:px-2.5 text-xs sm:text-sm select-none shrink-0 whitespace-nowrap text-center"
            dir="rtl"
          >
            صفحة {pageNum} من {pages.length}
          </span>

          {/* Previous Page Button */}
          <button
            type="button"
            onClick={() => handlePageSelect(Math.max(currentPageIndex - 1, 0))}
            disabled={currentPageIndex <= 0}
            className="px-2 sm:px-3 py-1 sm:py-1.5 bg-stone-100 hover:bg-[#B68763] hover:text-white disabled:opacity-30 rounded-full text-[#443000] font-bold flex items-center gap-1 sm:gap-1.5 transition-all shadow-2xs shrink-0 whitespace-nowrap cursor-pointer"
            title="الصفحة السابقة"
          >
            <svg
              className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-[11px] sm:text-xs">السابق</span>
          </button>

          <span className="w-px h-3.5 sm:h-4 bg-stone-200 shrink-0 mx-0.5" />

          {/* Fullscreen Button */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="text-stone-600 hover:text-[#B68763] hover:bg-stone-100/80 rounded-full transition-all px-1.5 sm:px-2.5 py-1 text-xs font-bold flex items-center gap-1 sm:gap-1.5 group shrink-0 whitespace-nowrap cursor-pointer"
            title={isFullscreen ? 'تصغير الشاشة' : 'ملء الشاشة'}
          >
            {isFullscreen ? (
              <svg
                className="w-3.5 h-3.5 text-stone-500 group-hover:text-[#B68763] transition-colors shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 14h6m0 0v6m0-6L3 21m17-7h-6m0 0v6m0-6l7 7M14 4v6m0 0h6m-6 0L21 3M10 4v6m0 0H4m6 0L3 3"
                />
              </svg>
            ) : (
              <svg
                className="w-3.5 h-3.5 text-stone-500 group-hover:text-[#B68763] transition-colors shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3"
                />
              </svg>
            )}
            <span className="hidden sm:inline">{isFullscreen ? 'تصغير' : 'ملء الشاشة'}</span>
          </button>
        </div>
      </div>

      {/* Slot Picker / Product Customization Modal */}
      {activeSlotNumber && (
        <SlotPickerModal
          key={`slot-modal-${pageNum}-${activeSlotNumber}-${modalSlotData?.col_span || 1}-${modalSlotData?.row_span || 1}`}
          pageNumber={pageNum}
          slotNumber={activeSlotNumber}
          currentSlotData={modalSlotData}
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
