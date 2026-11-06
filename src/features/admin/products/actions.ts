'use server';

import fs from 'fs';
import path from 'path';
import { revalidatePath, updateTag, revalidateTag } from 'next/cache';
import { productUpdateSchema, ProductUpdateInput } from './schemas';
import { coercePriceNumber, toArabicDigits } from '@/lib/format/price';
import { syncLiveIssueToSupabase, getLiveIssue, safeWriteJsonFile } from '@/features/magazine/services/publishIssue';
import { requireStaffSession } from '@/lib/auth/session';
import { createAdminClient } from '@/lib/supabase/admin';

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
function resolveEffectivePrice(
  slotPrice: number | string | null | undefined,
  fallbackPrice: number | string | null | undefined
): number {
  const parsedSlot = coercePriceNumber(slotPrice);
  if (parsedSlot !== null) return parsedSlot;

  const parsedFallback = coercePriceNumber(fallbackPrice);
  return parsedFallback ?? 0;
}

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
            sale_price: resolveEffectivePrice(slot.price_override, p.sale_price),
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
 * Safely extracts the internal Supabase storage path from a public or relative URL.
 * Returns null if the URL is not a Supabase storage URL or points to protected assets (like brand/).
 */
export async function extractStoragePath(
  url?: string | null,
  bucket: string = 'magazine'
): Promise<string | null> {
  if (!url || typeof url !== 'string') return null;

  try {
    const cleanUrl = url.trim();

    // 1. Matches: https://<project>.supabase.co/storage/v1/object/public/<bucket>/<path>
    const pubMarker = `/storage/v1/object/public/${bucket}/`;
    const pubIdx = cleanUrl.indexOf(pubMarker);
    if (pubIdx !== -1) {
      const extracted = decodeURIComponent(cleanUrl.slice(pubIdx + pubMarker.length).split('?')[0]);
      return sanitizeStoragePath(extracted);
    }

    // 2. Matches: https://<project>.supabase.co/storage/v1/object/<bucket>/<path>
    const objMarker = `/storage/v1/object/${bucket}/`;
    const objIdx = cleanUrl.indexOf(objMarker);
    if (objIdx !== -1) {
      const extracted = decodeURIComponent(cleanUrl.slice(objIdx + objMarker.length).split('?')[0]);
      return sanitizeStoragePath(extracted);
    }

    // 3. Matches rewrite: /magazine/<path>
    if (cleanUrl.startsWith('/magazine/')) {
      const extracted = decodeURIComponent(cleanUrl.slice('/magazine/'.length).split('?')[0]);
      return sanitizeStoragePath(extracted);
    }

    return null;
  } catch {
    return null;
  }
}

function sanitizeStoragePath(p: string): string | null {
  if (!p) return null;
  // Never delete or modify brand logos, canva assets, or system data files
  if (
    p.startsWith('brand/') ||
    p.startsWith('/brand/') ||
    p.startsWith('data/') ||
    p.startsWith('/data/') ||
    p.startsWith('canva_products/') ||
    p.startsWith('/canva_products/') ||
    p.startsWith('assets/') ||
    p.startsWith('/assets/') ||
    p.startsWith('pages/') ||
    p.startsWith('/pages/')
  ) {
    return null;
  }
  // ONLY previous custom uploads in uploads/products/ can be cleaned up
  if (p.startsWith('uploads/products/')) {
    return p;
  }
  return null;
}

export interface UploadImageResult {
  success: boolean;
  url?: string;
  storagePath?: string;
  error?: string;
}

/**
 * Server Action to upload a new product image to Supabase Storage,
 * verify its upload, and replace/remove the old image in Supabase.
 */
export async function uploadProductImageAction(
  formData: FormData
): Promise<UploadImageResult> {
  try {
    await requireStaffSession();
  } catch {
    return { success: false, error: 'غير مصرح: يجب تسجيل الدخول كمسؤول' };
  }

  const file = formData.get('file');
  const productId = (formData.get('productId') as string | null)?.trim() || 'product';
  const oldImageUrl = (formData.get('oldImageUrl') as string | null)?.trim();

  if (!file || !(file instanceof File)) {
    return { success: false, error: 'يرجى اختيار ملف صورة صالح' };
  }

  if (file.size === 0) {
    return { success: false, error: 'ملف الصورة المختار فارغ' };
  }

  // 5 MB limit
  const MAX_SIZE = 5 * 1024 * 1024;
  if (file.size > MAX_SIZE) {
    return { success: false, error: 'حجم الصورة كبير جدًا (الحد الأقصى 5 ميجابايت)' };
  }

  // Allowed mime types
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/avif',
  ];
  if (!allowedTypes.includes(file.type)) {
    return {
      success: false,
      error: 'نوع الملف غير مدعوم. يرجى اختيار صورة بصيغة JPG أو PNG أو WebP أو AVIF',
    };
  }

  try {
    const bucket = process.env.SUPABASE_STORAGE_BUCKET || 'magazine';
    const supabase = createAdminClient();

    // Determine extension
    const extMatch = file.name.match(/\.[a-zA-Z0-9]+$/);
    let extension = extMatch ? extMatch[0].toLowerCase() : '.webp';
    if (!extension.startsWith('.')) extension = `.${extension}`;

    // Clean safe filename: uploads/products/<clean-id>-<timestamp><ext>
    const cleanId = productId.replace(/[^a-zA-Z0-9_-]/g, '_');
    const fileName = `${cleanId}-${Date.now()}${extension}`;
    const storagePath = `uploads/products/${fileName}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 1. Upload new image to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(storagePath, buffer, {
        contentType: file.type,
        upsert: true,
        cacheControl: '3600',
      });

    if (uploadError || !uploadData) {
      console.error('Database upload error:', uploadError);
      return {
        success: false,
        error: `فشل في رفع الصورة إلى قاعدة البيانات: ${uploadError?.message || 'خطأ أثناء الرفع'}`,
      };
    }

    // 2. Retrieve public URL
    const { data: publicData } = supabase.storage
      .from(bucket)
      .getPublicUrl(storagePath);

    const newPublicUrl = publicData.publicUrl;

    // 3. Replace old image in Supabase:
    // If oldImageUrl was hosted in Supabase storage, remove the old file so it doesn't leave orphaned files
    if (oldImageUrl) {
      const oldStoragePath = await extractStoragePath(oldImageUrl, bucket);
      if (oldStoragePath && oldStoragePath !== storagePath) {
        try {
          const { error: removeError } = await supabase.storage
            .from(bucket)
            .remove([oldStoragePath]);
          if (removeError) {
            console.warn(`Could not remove previous image from Supabase (${oldStoragePath}):`, removeError);
          } else {
            console.log(`Replaced and removed previous image from Supabase: ${oldStoragePath}`);
          }
        } catch (removeErr) {
          console.warn(`Exception while removing old image (${oldStoragePath}):`, removeErr);
        }
      }
    }

    return {
      success: true,
      url: newPublicUrl,
      storagePath,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'حدث خطأ غير متوقع أثناء رفع الصورة';
    console.error('Exception in uploadProductImageAction:', err);
    return {
      success: false,
      error: errorMsg,
    };
  }
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
    let previousImageUrl: string | null = null;

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
            if (!previousImageUrl && p.primary_image_url) {
              previousImageUrl = p.primary_image_url;
            }
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
            if (!previousImageUrl && prod.primary_image_url) {
              previousImageUrl = prod.primary_image_url;
            }
            const nextProd: any = {
              ...prod,
              ...updates,
            };
            if (updates.primary_image_url) {
              nextProd.images = {
                sm: updates.primary_image_url,
                md: updates.primary_image_url,
                lg: updates.primary_image_url,
              };
            }
            return nextProd;
          }
          return prod;
        });

        if (!foundInSeed) {
          // If it was one of the products not yet in seed, append so it stays synced
          const newEntry: any = {
            id: productId,
            slug: productId,
            name_ar: updates.name_ar || '',
            sale_price: updates.sale_price || 0,
            primary_image_url: updates.primary_image_url || '/brand/lotus_logo.png',
            description_ar: updates.description_ar || '',
            category: updates.category || 'عام',
            in_stock: true,
            stock_status: updates.stock_status || 'متاح',
          };
          if (updates.primary_image_url) {
            newEntry.images = {
              sm: updates.primary_image_url,
              md: updates.primary_image_url,
              lg: updates.primary_image_url,
            };
          }
          updatedProducts.push(newEntry);
        }

        safeWriteJsonFile(seedPath, updatedProducts);
      } catch (seedErr) {
        console.warn('Could not update seedPath:', seedErr);
      }
    }

    // Clean up replaced old image from Supabase storage if URL changed
    if (
      updates.primary_image_url &&
      previousImageUrl &&
      previousImageUrl !== updates.primary_image_url
    ) {
      const bucket = process.env.SUPABASE_STORAGE_BUCKET || 'magazine';
      const oldStoragePath = await extractStoragePath(previousImageUrl, bucket);
      if (oldStoragePath) {
        try {
          const supabase = createAdminClient();
          await supabase.storage.from(bucket).remove([oldStoragePath]);
        } catch (delErr) {
          console.warn('Could not remove replaced old image from Supabase storage:', delErr);
        }
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
