'use server';

import fs from 'fs';
import path from 'path';
import { revalidatePath } from 'next/cache';
import { MagazinePageData, PageSlotData } from '@/features/magazine/types';
import { SlotAssignInput, slotAssignSchema } from './schemas';

/**
 * Pure function to update/assign a product to a slot within page list
 */
export async function assignProductToSlot(
  pages: MagazinePageData[],
  pageNumber: number,
  slotNumber: number,
  product: any,
  overrides?: Partial<SlotAssignInput>
): Promise<MagazinePageData[]> {
  return pages.map((page) => {
    if ((page.pageNumber || page.position) !== pageNumber) return page;

    const slots = [...(page.slots || [])];
    const existingIndex = slots.findIndex((s) => s.slot === slotNumber);

    const updatedProduct = product ? {
      ...product,
      cashier_code: overrides?.cashier_code !== undefined ? overrides.cashier_code : product.cashier_code,
    } : product;

    const newSlot: PageSlotData = {
      slot: slotNumber,
      product: updatedProduct,
      title_override: overrides?.title_override,
      price_override: overrides?.price_override,
      image_override: overrides?.image_override,
      description_override: overrides?.description_override,
      col_span: overrides?.col_span ?? 1,
      row_span: overrides?.row_span ?? 1,
    };

    if (existingIndex >= 0) {
      slots[existingIndex] = newSlot;
    } else {
      slots.push(newSlot);
      slots.sort((a, b) => a.slot - b.slot);
    }

    return {
      ...page,
      slots,
    };
  });
}

/**
 * Pure function to remove a product from a page slot
 */
export async function removeProductFromSlot(
  pages: MagazinePageData[],
  pageNumber: number,
  slotNumber: number
): Promise<MagazinePageData[]> {
  return pages.map((page) => {
    if ((page.pageNumber || page.position) !== pageNumber) return page;

    const slots = (page.slots || []).map((s) => {
      if (s.slot === slotNumber) {
        return {
          slot: slotNumber,
          product: undefined,
          col_span: 1,
          row_span: 1,
        };
      }
      return s;
    });

    return {
      ...page,
      slots,
    };
  });
}

/**
 * Server Action to save a slot assignment into the live_issue snapshot
 */
export async function saveSlotAssignmentAction(
  pageNumber: number,
  slotNumber: number,
  productId: string | null,
  overrides?: {
    title_override?: string;
    price_override?: number;
    image_override?: string;
    description_override?: string;
    col_span?: number;
    row_span?: number;
    cashier_code?: number | null;
  }
): Promise<{ success: boolean; error?: string }> {
  const liveIssuePath = path.resolve(process.cwd(), 'data', 'live_issue.json');
  const seedPath = path.resolve(process.cwd(), 'data', 'products_seed.json');

  if (!fs.existsSync(liveIssuePath)) {
    return { success: false, error: 'ملف المجلة الحية غير موجود' };
  }

  try {
    const issue = JSON.parse(fs.readFileSync(liveIssuePath, 'utf8'));

    const targetPage = (issue.pages || []).find(
      (p: any) => (p.pageNumber || p.position) === pageNumber
    );
    const currentSlot = targetPage?.slots?.find((s: any) => s.slot === slotNumber);

    let productObj: any = undefined;

    if (productId) {
      // 1. If same product as currently in this slot, reuse currentSlot.product directly
      if (
        currentSlot?.product &&
        (currentSlot.product.id === productId || currentSlot.product.slug === productId)
      ) {
        productObj = currentSlot.product;
      }

      // 2. Otherwise search across all pages in issue
      if (!productObj) {
        for (const page of issue.pages || []) {
          for (const slot of page.slots || []) {
            if (slot.product && (slot.product.id === productId || slot.product.slug === productId)) {
              productObj = slot.product;
              break;
            }
          }
          if (productObj) break;
        }
      }

      // 3. If not found in issue, check seed catalog
      if (!productObj && fs.existsSync(seedPath)) {
        const allSeed = JSON.parse(fs.readFileSync(seedPath, 'utf8'));
        productObj = allSeed.find((p: any) => p.id === productId || p.slug === productId);
      }
    } else if (overrides && currentSlot?.product) {
      // If productId was not explicitly provided but overrides (dimensions/text) are being set, retain current product
      productObj = currentSlot.product;
    }

    if (productObj) {
      if (overrides?.cashier_code !== undefined) {
        productObj.cashier_code = overrides.cashier_code;
      }
      issue.pages = await assignProductToSlot(
        issue.pages,
        pageNumber,
        slotNumber,
        productObj,
        overrides
      );

      // Sync cashier_code to products_seed.json if seed exists
      if (overrides?.cashier_code !== undefined && fs.existsSync(seedPath)) {
        try {
          const currentSeed = JSON.parse(fs.readFileSync(seedPath, 'utf8'));
          const targetId = productObj.id || productObj.slug;
          const updatedSeed = currentSeed.map((p: any) => {
            if (p.id === targetId || p.slug === targetId) {
              return { ...p, cashier_code: overrides.cashier_code };
            }
            return p;
          });
          fs.writeFileSync(seedPath, JSON.stringify(updatedSeed, null, 2), 'utf8');
        } catch (e) {
          console.error('Error syncing cashier_code to seed:', e);
        }
      }
    } else {
      issue.pages = await removeProductFromSlot(issue.pages, pageNumber, slotNumber);
    }

    fs.writeFileSync(liveIssuePath, JSON.stringify(issue, null, 2), 'utf8');

    revalidatePath('/', 'layout');
    revalidatePath('/');
    revalidatePath('/magazine');
    revalidatePath('/admin/composer');
    revalidatePath('/products');

    return { success: true };
  } catch (err: any) {
    console.error('Error saving slot assignment:', err);
    return { success: false, error: err.message || 'فشل في حفظ تعيين الخانة' };
  }
}

/**
 * Server Action to swap or move two slots on the same page (for drag-and-drop)
 */
export async function swapPageSlotsAction(
  pageNumber: number,
  sourceSlotIndex: number,
  targetSlotIndex: number
): Promise<{ success: boolean; error?: string }> {
  const liveIssuePath = path.resolve(process.cwd(), 'data', 'live_issue.json');
  try {
    if (!fs.existsSync(liveIssuePath)) {
      return { success: false, error: 'ملف المجلة غير موجود' };
    }

    const issue = JSON.parse(fs.readFileSync(liveIssuePath, 'utf8'));
    const pageIndex = (issue.pages || []).findIndex(
      (p: any) => (p.pageNumber || p.position) === pageNumber
    );

    if (pageIndex === -1) {
      return { success: false, error: 'الصفحة غير موجودة' };
    }

    const page = issue.pages[pageIndex];
    const slots = [...(page.slots || [])];

    if (
      sourceSlotIndex < 0 ||
      sourceSlotIndex >= slots.length ||
      targetSlotIndex < 0 ||
      targetSlotIndex >= slots.length
    ) {
      return { success: false, error: 'مؤشر الخانة غير صحيح' };
    }

    // Swap the slot contents while maintaining their .slot number order
    const sourceSlotNum = slots[sourceSlotIndex].slot || sourceSlotIndex + 1;
    const targetSlotNum = slots[targetSlotIndex].slot || targetSlotIndex + 1;

    const sourceData = { ...slots[sourceSlotIndex] };
    const targetData = { ...slots[targetSlotIndex] };

    // Swap product and overrides
    slots[sourceSlotIndex] = {
      ...targetData,
      slot: sourceSlotNum,
    };
    slots[targetSlotIndex] = {
      ...sourceData,
      slot: targetSlotNum,
    };

    page.slots = slots;
    issue.pages[pageIndex] = page;

    fs.writeFileSync(liveIssuePath, JSON.stringify(issue, null, 2), 'utf8');

    revalidatePath('/', 'layout');
    revalidatePath('/');
    revalidatePath('/magazine');
    revalidatePath('/admin/composer');
    revalidatePath('/products');

    return { success: true };
  } catch (err: any) {
    console.error('Error swapping page slots:', err);
    return { success: false, error: err.message || 'فشل في تبديل أماكن المنتجات' };
  }
}

/**
 * Server Action to rename a page section title
 */
export async function updatePageSectionTitleAction(
  pageNumber: number,
  newTitle: string
): Promise<{ success: boolean; error?: string }> {
  const liveIssuePath = path.resolve(process.cwd(), 'data', 'live_issue.json');
  try {
    if (!fs.existsSync(liveIssuePath)) {
      return { success: false, error: 'ملف المجلة غير موجود' };
    }

    const issue = JSON.parse(fs.readFileSync(liveIssuePath, 'utf8'));
    const page = issue.pages.find((p: any) => p.pageNumber === pageNumber);
    if (page) {
      page.sectionTitle = newTitle.trim();
      fs.writeFileSync(liveIssuePath, JSON.stringify(issue, null, 2), 'utf8');
      revalidatePath('/', 'layout');
      revalidatePath('/');
      revalidatePath('/magazine');
      revalidatePath('/admin/composer');
      return { success: true };
    }
    return { success: false, error: 'الصفحة غير موجودة' };
  } catch (err: any) {
    return { success: false, error: err.message || 'حدث خطأ' };
  }
}
