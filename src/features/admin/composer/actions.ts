'use server';

import fs from 'fs';
import path from 'path';
import { revalidatePath } from 'next/cache';
import { MagazinePageData, PageSlotData } from '@/features/magazine/types';
import { SlotAssignInput, slotAssignSchema } from './schemas';
import { generateAutoLayout } from '@/features/magazine/services/autoLayout';

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
    if (page.pageNumber !== pageNumber) return page;

    const slots = [...(page.slots || [])];
    const existingIndex = slots.findIndex((s) => s.slot === slotNumber);

    const newSlot: PageSlotData = {
      slot: slotNumber,
      product,
      title_override: overrides?.title_override,
      price_override: overrides?.price_override,
      image_override: overrides?.image_override,
      description_override: overrides?.description_override,
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
    if (page.pageNumber !== pageNumber) return page;

    const slots = (page.slots || []).map((s) => {
      if (s.slot === slotNumber) {
        return {
          slot: slotNumber,
          product: undefined,
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
  }
): Promise<{ success: boolean; error?: string }> {
  const liveIssuePath = path.resolve(process.cwd(), 'data', 'live_issue.json');
  const seedPath = path.resolve(process.cwd(), 'data', 'products_seed.json');

  if (!fs.existsSync(liveIssuePath)) {
    return { success: false, error: 'ملف المجلة الحية غير موجود' };
  }

  try {
    const issue = JSON.parse(fs.readFileSync(liveIssuePath, 'utf8'));

    let productObj: any = undefined;
    if (productId && fs.existsSync(seedPath)) {
      const allSeed = JSON.parse(fs.readFileSync(seedPath, 'utf8'));
      productObj = allSeed.find((p: any) => p.id === productId || p.slug === productId);
    }

    if (productId && productObj) {
      issue.pages = await assignProductToSlot(
        issue.pages,
        pageNumber,
        slotNumber,
        productObj,
        overrides
      );
    } else {
      issue.pages = await removeProductFromSlot(issue.pages, pageNumber, slotNumber);
    }

    fs.writeFileSync(liveIssuePath, JSON.stringify(issue, null, 2), 'utf8');

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
 * Server Action to regenerate pages using the 9-per-category auto-layout engine
 */
export async function runAutoLayoutAction(): Promise<{ success: boolean; totalPages?: number; error?: string }> {
  const seedPath = path.resolve(process.cwd(), 'data', 'products_seed.json');
  const liveIssuePath = path.resolve(process.cwd(), 'data', 'live_issue.json');

  try {
    if (!fs.existsSync(seedPath)) {
      return { success: false, error: 'ملف المنتجات غير موجود' };
    }

    const products = JSON.parse(fs.readFileSync(seedPath, 'utf8'));
    const newPages = generateAutoLayout(products);

    const issue = fs.existsSync(liveIssuePath)
      ? JSON.parse(fs.readFileSync(liveIssuePath, 'utf8'))
      : {
          issueSlug: 'lotus-pricelist-a4',
          title_ar: 'قائمة أسعار لوتس A4',
          version: 1,
        };

    issue.pages = newPages;
    issue.totalPages = newPages.length;
    issue.publishedAt = new Date().toISOString();

    fs.writeFileSync(liveIssuePath, JSON.stringify(issue, null, 2), 'utf8');

    revalidatePath('/magazine');
    revalidatePath('/admin/composer');
    revalidatePath('/products');

    return { success: true, totalPages: newPages.length };
  } catch (err: any) {
    console.error('Failed to run auto layout:', err);
    return { success: false, error: err.message || 'فشل في إعادة التوليد التلقائي' };
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
      revalidatePath('/magazine');
      revalidatePath('/admin/composer');
      return { success: true };
    }
    return { success: false, error: 'الصفحة غير موجودة' };
  } catch (err: any) {
    return { success: false, error: err.message || 'حدث خطأ' };
  }
}
