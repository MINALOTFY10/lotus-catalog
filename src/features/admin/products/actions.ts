'use server';

import fs from 'fs';
import path from 'path';
import { revalidatePath, updateTag, revalidateTag } from 'next/cache';
import { productUpdateSchema, ProductUpdateInput } from './schemas';
import { toArabicDigits } from '@/lib/format/price';
import { syncLiveIssueToSupabase, getLiveIssue, safeWriteJsonFile } from '@/features/magazine/services/publishIssue';
import { requireStaffSession } from '@/lib/auth/session';

import { ProductPriceTier } from '@/features/magazine/types';
export type { ProductPriceTier };

export interface AdminProductRecord {
  id: string;
  cashier_code?: number | null;
  slug: string;
  name_ar: string;
  category?: string;
  cost_price?: number;
  sale_price: number;
  original_qty?: number;
  stock_status?: string;
  in_stock: boolean;
  primary_image_url: string;
  description_ar?: string;
  price_text?: string | null;
  price_tiers?: ProductPriceTier[] | null;
}

/**
 * Returns all products for the admin table by extracting them directly
 * from the live magazine issue (495 products) supplemented by seed.
 */
export async function getAdminProductsList(): Promise<AdminProductRecord[]> {
  await requireStaffSession();
  const seedPath = path.resolve(process.cwd(), 'data', 'products_seed.json');
  const map = new Map<string, AdminProductRecord>();

  try {
    const issue = await getLiveIssue({ forceFresh: true });
    for (const page of issue.pages || []) {
      if (!page.slots) continue;
      for (const slot of page.slots) {
        const p: any = slot.product;
        if (!p) continue;
        const key = p.id || p.slug;
        if (!map.has(key)) {
          map.set(key, {
            id: p.id,
            cashier_code: p.cashier_code ?? null,
            slug: p.slug,
            name_ar: slot.title_override || p.name_ar || '',
            category: page.sectionTitle || page.section_title || p.category || 'عام',
            cost_price: p.cost_price,
            sale_price: slot.price_override ?? p.sale_price ?? 0,
            original_qty: p.original_qty ?? 10,
            stock_status: p.stock_status || 'متاح',
            in_stock: p.in_stock !== false,
            primary_image_url: slot.image_override || p.primary_image_url || '/brand/lotus_logo.png',
            description_ar: slot.description_override || p.description_ar || '',
            price_text: slot.price_text || p.price_text || null,
            price_tiers: slot.price_tiers || p.price_tiers || null,
          });
        }
      }
    }
  } catch (e) {
    console.error('Failed to read live_issue in getAdminProductsList:', e);
  }

  // Also include any seed products not yet placed in pages
  if (fs.existsSync(seedPath)) {
    try {
      const seedProducts: AdminProductRecord[] = JSON.parse(fs.readFileSync(seedPath, 'utf8'));
      for (const sp of seedProducts) {
        const key = sp.id || sp.slug;
        if (!map.has(key)) {
          map.set(key, sp);
        }
      }
    } catch (e) {
      console.error('Failed to read products_seed in getAdminProductsList:', e);
    }
  }

  return Array.from(map.values());
}

/**
 * Pure function to update a product record in a product array
 */
export async function updateProductInStore(
  products: AdminProductRecord[],
  productId: string,
  updates: Partial<ProductUpdateInput>
): Promise<AdminProductRecord[]> {
  return products.map((prod) => {
    if (prod.id === productId || prod.slug === productId) {
      return {
        ...prod,
        ...updates,
      };
    }
    return prod;
  });
}

/**
 * Server Action to update a product's price, title, or photo.
 * Fully synchronizes both live_issue.json (slots & overrides) and products_seed.json,
 * and immediately busts all router and layout caches so changes reflect in the magazine in 1 second.
 */
export async function updateProductAction(
  productId: string,
  rawInput: unknown
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireStaffSession();
  } catch {
    return { success: false, error: 'غير مصرح: يجب تسجيل الدخول كمسؤول' };
  }

  const parseResult = productUpdateSchema.safeParse(rawInput);
  if (!parseResult.success) {
    const firstError = parseResult.error.issues[0]?.message || 'بيانات غير صالحة';
    return { success: false, error: firstError };
  }

  const updates = parseResult.data;
  const liveIssuePath = path.resolve(process.cwd(), 'data', 'live_issue.json');
  const seedPath = path.resolve(process.cwd(), 'data', 'products_seed.json');

  try {
    let modifiedLive = false;

    // 1. Synchronize live_issue (The primary source for the magazine & catalog)
    const issue = await getLiveIssue({ forceFresh: true });
    if (issue && issue.pages) {
      for (const page of issue.pages || []) {
        if (!page.slots) continue;
        for (const slot of page.slots) {
          const p: any = slot.product;
          if (!p) continue;

          const isMatch =
            p.id === productId ||
            p.slug === productId ||
            (p.cashier_code && String(p.cashier_code) === String(productId));

          if (isMatch) {
            // Update product object
            if (updates.name_ar) p.name_ar = updates.name_ar;
            if (updates.sale_price !== undefined) p.sale_price = updates.sale_price;
            if (updates.primary_image_url) {
              p.primary_image_url = updates.primary_image_url;
              if (!p.images) p.images = {} as any;
              p.images.sm = updates.primary_image_url;
              p.images.md = updates.primary_image_url;
              p.images.lg = updates.primary_image_url;
            }
            if (updates.description_ar !== undefined) p.description_ar = updates.description_ar;
            if (updates.category) p.category = updates.category;
            if (updates.stock_status) p.stock_status = updates.stock_status;
            if (updates.cashier_code !== undefined) p.cashier_code = updates.cashier_code;

            // CRITICAL: Update slot overrides that the magazine reader directly renders!
            if (updates.name_ar) slot.title_override = updates.name_ar;
            if (updates.sale_price !== undefined) {
              slot.price_override = updates.sale_price;
            }

            // Multi-tier prices support
            if (updates.price_tiers !== undefined) {
              p.price_tiers = updates.price_tiers;
              slot.price_tiers = updates.price_tiers;
            }
            if (updates.price_text !== undefined && updates.price_text !== null) {
              p.price_text = updates.price_text;
              slot.price_text = updates.price_text;
            } else if (updates.price_tiers && updates.price_tiers.length > 0) {
              const multiText = updates.price_tiers
                .map((t) => `${t.label} | ${toArabicDigits(t.price)} ج.مصري`)
                .join('\n');
              p.price_text = multiText;
              slot.price_text = multiText;
            } else if (updates.sale_price !== undefined) {
              const existingText = slot.price_text || p.price_text;
              const hasMultipleTiers = existingText && (existingText.includes('\n') || existingText.includes('|'));
              if (!hasMultipleTiers) {
                slot.price_text = `${toArabicDigits(updates.sale_price)} ج.مصري`;
                p.price_text = `${toArabicDigits(updates.sale_price)} ج.مصري`;
              }
            }
            if (updates.primary_image_url) slot.image_override = updates.primary_image_url;
            if (updates.description_ar !== undefined) slot.description_override = updates.description_ar;

            modifiedLive = true;
          }
        }
      }

      if (modifiedLive) {
        safeWriteJsonFile(liveIssuePath, issue);
        // Synchronize with Supabase Storage so changes persist in cloud and on deployed site
        await syncLiveIssueToSupabase(issue);
      }
    }

    // 2. Synchronize products_seed.json
    if (fs.existsSync(seedPath)) {
      try {
        const currentProducts: AdminProductRecord[] = JSON.parse(
          fs.readFileSync(seedPath, 'utf8')
        );

        let foundInSeed = false;
        const updatedProducts = currentProducts.map((prod) => {
          if (
            prod.id === productId ||
            prod.slug === productId ||
            (prod.cashier_code && String(prod.cashier_code) === String(productId))
          ) {
            foundInSeed = true;
            return {
              ...prod,
              ...updates,
            };
          }
          return prod;
        });

        if (!foundInSeed) {
          // If it was one of the 123 products not yet in seed, append so it stays synced
          updatedProducts.push({
            id: productId,
            slug: productId,
            name_ar: updates.name_ar || '',
            sale_price: updates.sale_price || 0,
            primary_image_url: updates.primary_image_url || '/brand/lotus_logo.png',
            description_ar: updates.description_ar || '',
            category: updates.category || 'عام',
            in_stock: true,
            stock_status: updates.stock_status || 'متاح',
          });
        }

        safeWriteJsonFile(seedPath, updatedProducts);
      } catch (seedErr) {
        console.warn('Could not update seedPath:', seedErr);
      }
    }

    // 3. Immediately bust all cache layers across the app so edits show in one second!
    try {
      updateTag('live-issue');
      revalidateTag('live-issue', { expire: 0 });
    } catch (tagErr) {
      console.warn('tag revalidation error:', tagErr);
    }
    revalidatePath('/', 'layout');
    revalidatePath('/');
    revalidatePath('/magazine');
    revalidatePath('/products');
    revalidatePath('/admin/products');
    revalidatePath('/admin/composer');

    return { success: true };
  } catch (err: any) {
    console.error('Failed to update product:', err);
    return { success: false, error: err.message || 'حدث خطأ أثناء حفظ التعديلات' };
  }
}
