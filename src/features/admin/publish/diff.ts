import { MagazinePageData } from '@/features/magazine/types';

export interface PriceChange {
  pageNumber: number;
  slotNumber: number;
  productName: string;
  oldPrice: number;
  newPrice: number;
}

export interface IssueDiffResult {
  hasChanges: boolean;
  addedPagesCount: number;
  removedPagesCount: number;
  changedSlotsCount: number;
  priceChanges: PriceChange[];
  titleChangesCount: number;
}

export function computeIssueDiff(
  draftPages: MagazinePageData[],
  livePages: MagazinePageData[]
): IssueDiffResult {
  let changedSlotsCount = 0;
  let titleChangesCount = 0;
  const priceChanges: PriceChange[] = [];

  const livePageMap = new Map<number, MagazinePageData>();
  livePages.forEach((p) => livePageMap.set(p.pageNumber, p));

  const draftPageMap = new Map<number, MagazinePageData>();
  draftPages.forEach((p) => draftPageMap.set(p.pageNumber, p));

  let addedPagesCount = 0;
  let removedPagesCount = 0;

  for (const draftPage of draftPages) {
    const livePage = livePageMap.get(draftPage.pageNumber);
    if (!livePage) {
      addedPagesCount++;
      continue;
    }

    const liveSlotMap = new Map<number, any>();
    (livePage.slots || []).forEach((s) => liveSlotMap.set(s.slot, s));

    for (const draftSlot of draftPage.slots || []) {
      const liveSlot = liveSlotMap.get(draftSlot.slot);

      if (!liveSlot) {
        if (draftSlot.product) changedSlotsCount++;
        continue;
      }

      const draftPrice = draftSlot.price_override ?? draftSlot.product?.sale_price;
      const livePrice = liveSlot.price_override ?? liveSlot.product?.sale_price;

      if (draftPrice !== livePrice && draftPrice !== undefined && livePrice !== undefined) {
        changedSlotsCount++;
        priceChanges.push({
          pageNumber: draftPage.pageNumber,
          slotNumber: draftSlot.slot,
          productName: draftSlot.title_override || draftSlot.product?.name_ar || 'منتج',
          oldPrice: livePrice,
          newPrice: draftPrice,
        });
      }

      if (draftSlot.title_override !== liveSlot.title_override) {
        titleChangesCount++;
      }

      if (draftSlot.product?.id !== liveSlot.product?.id) {
        changedSlotsCount++;
      }
    }
  }

  for (const livePage of livePages) {
    if (!draftPageMap.has(livePage.pageNumber)) {
      removedPagesCount++;
    }
  }

  const hasChanges =
    addedPagesCount > 0 ||
    removedPagesCount > 0 ||
    changedSlotsCount > 0 ||
    titleChangesCount > 0;

  return {
    hasChanges,
    addedPagesCount,
    removedPagesCount,
    changedSlotsCount,
    priceChanges,
    titleChangesCount,
  };
}
