import { MagazinePageData, PageSlotData } from './types';

/**
 * Computes the effective dimensions (col_span and row_span) for a slot.
 * If explicit custom dimensions are saved on the slot, they take precedence.
 * Otherwise, the dimensions are derived from the page's template and slot position.
 */
export function getEffectiveSlotDimensions(
  page: MagazinePageData,
  slotData?: PageSlotData | null,
  slotIdx?: number
): { col_span: number; row_span: number } {
  // 1. If explicit custom dimensions (> 0) are saved on the slot, use them
  if (slotData && typeof slotData.col_span === 'number' && slotData.col_span > 0) {
    return {
      col_span: Math.min(Math.max(slotData.col_span, 1), 3),
      row_span: Math.min(Math.max(slotData.row_span || 1, 1), 3),
    };
  }

  const template = page.template || 'grid3x3';
  const totalSlots = page.slots?.length || 9;
  const idx = slotIdx !== undefined ? slotIdx : (slotData?.slot ? slotData.slot - 1 : 0);

  // 2. Hero-split (3 cards: 2 top, 1 hero bottom)
  if (template === 'hero-split' || (template === 'grid-custom' && totalSlots === 3)) {
    if (idx === 2) {
      return { col_span: 3, row_span: 2 };
    }
    return { col_span: 1, row_span: 1 };
  }

  // 3. Grid 2x2 (4 cards: 2 cols x 2 rows, each card is 2x2)
  if (template === 'grid2x2' || (template === 'grid-custom' && totalSlots === 4)) {
    return { col_span: 2, row_span: 2 };
  }

  // 4. Grid 2x3 (6 cards: 2 cols x 3 rows, each card spans half width = 2x1)
  if (template === 'grid2x3') {
    return { col_span: 2, row_span: 1 };
  }

  // 5. 8-card layout (e.g. Page 3: rows 1-2 have 3 cards, row 3 has 2 wide cards)
  if (totalSlots === 8) {
    if (idx >= 6) {
      return { col_span: 2, row_span: 1 };
    }
    return { col_span: 1, row_span: 1 };
  }

  // 6. 7-card layout (e.g. Page 15, 18, 29, 47: rows 1-2 have 3 cards, row 3 has 1 wide hero card)
  if (totalSlots === 7) {
    if (idx === 6) {
      return { col_span: 3, row_span: 1 };
    }
    return { col_span: 1, row_span: 1 };
  }

  // Default standard 1x1
  return { col_span: 1, row_span: 1 };
}
