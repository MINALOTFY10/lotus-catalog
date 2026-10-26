import { IssueSnapshot } from '@/features/magazine/types';
import { PublicProduct } from '../types';

/**
 * Extracts and maps all products from an IssueSnapshot, enriching them with
 * magazine page metadata and strictly sanitizing them (removing cost_price).
 * Pure function safe for both client and server components.
 */
export function extractProductsFromIssue(issue: IssueSnapshot): PublicProduct[] {
  const map = new Map<string, PublicProduct>();

  for (const page of issue.pages) {
    if (!page.slots) continue;
    for (const slot of page.slots) {
      if (!slot.product) continue;
      const p = slot.product;
      const key = p.slug || p.id;

      if (!map.has(key)) {
        map.set(key, {
          id: p.id,
          cashier_code: p.cashier_code ?? null,
          slug: p.slug,
          name_ar: (slot.title_override || p.name_ar) ?? '',
          description_ar: (slot.description_override || p.description_ar) || undefined,
          category: page.sectionTitle || page.section_title || undefined,
          sale_price: slot.price_override ?? p.sale_price ?? 0,
          in_stock: true,
          primary_image_url: slot.image_override || p.primary_image_url || '/brand/lotus_logo.png',
          magazinePageNumber: page.pageNumber ?? page.position,
          magazineSlot: slot.slot,
          sectionTitle: page.sectionTitle || page.section_title || undefined,
        });
      }
    }
  }

  return Array.from(map.values());
}
