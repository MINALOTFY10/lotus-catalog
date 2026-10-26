'use server';

import fs from 'fs';
import path from 'path';
import { revalidatePath } from 'next/cache';
import { productUpdateSchema, ProductUpdateInput } from './schemas';

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
 * Server Action to update a product's price, title, or photo
 */
export async function updateProductAction(
  productId: string,
  rawInput: unknown
): Promise<{ success: boolean; error?: string }> {
  const parseResult = productUpdateSchema.safeParse(rawInput);
  if (!parseResult.success) {
    const firstError = parseResult.error.issues[0]?.message || 'بيانات غير صالحة';
    return { success: false, error: firstError };
  }

  const updates = parseResult.data;
  const seedPath = path.resolve(process.cwd(), 'data', 'products_seed.json');

  try {
    if (fs.existsSync(seedPath)) {
      const currentProducts: AdminProductRecord[] = JSON.parse(
        fs.readFileSync(seedPath, 'utf8')
      );

      const updatedProducts = await updateProductInStore(
        currentProducts,
        productId,
        updates
      );

      fs.writeFileSync(seedPath, JSON.stringify(updatedProducts, null, 2), 'utf8');
    }

    // Also synchronize live_issue.json if the product is in any page slot
    const liveIssuePath = path.resolve(process.cwd(), 'data', 'live_issue.json');
    if (fs.existsSync(liveIssuePath)) {
      const issue = JSON.parse(fs.readFileSync(liveIssuePath, 'utf8'));
      let modified = false;

      for (const page of issue.pages) {
        if (!page.slots) continue;
        for (const slot of page.slots) {
          if (slot.product && (slot.product.id === productId || slot.product.slug === productId)) {
            if (updates.name_ar) slot.product.name_ar = updates.name_ar;
            if (updates.sale_price) slot.product.sale_price = updates.sale_price;
            if (updates.primary_image_url) slot.product.primary_image_url = updates.primary_image_url;
            if (updates.description_ar) slot.product.description_ar = updates.description_ar;
            modified = true;
          }
        }
      }

      if (modified) {
        fs.writeFileSync(liveIssuePath, JSON.stringify(issue, null, 2), 'utf8');
      }
    }

    // Revalidate public and admin paths
    revalidatePath('/products');
    revalidatePath('/magazine');
    revalidatePath('/admin/products');

    return { success: true };
  } catch (err: any) {
    console.error('Failed to update product:', err);
    return { success: false, error: err.message || 'حدث خطأ أثناء حفظ التعديلات' };
  }
}
