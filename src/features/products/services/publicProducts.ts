import fs from 'fs';
import path from 'path';
import { IssueSnapshot, getLiveIssue } from '@/features/magazine/services/publishIssue';
import { PublicProduct, ProductJsonLd } from '../types';
import { normalizeArabic } from '@/lib/format/arabic';

export { normalizeArabic };


/**
 * Extracts and maps all products from an IssueSnapshot, enriching them with
 * magazine page metadata and strictly sanitizing them (removing cost_price).
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
          price_text: slot.price_text || null,
        });
      }
    }
  }

  return Array.from(map.values());
}

/**
 * Loads all public products using the live issue snapshot as primary source
 * and seed products as supplementary source for unplaced items.
 */
export async function getAllPublicProducts(providedIssue?: IssueSnapshot): Promise<PublicProduct[]> {
  const issue = providedIssue || (await getLiveIssue());
  const fromIssue = extractProductsFromIssue(issue);
  const seenSlugs = new Set(fromIssue.map((p) => p.slug));

  // If there are additional products in seed that weren't assigned to pages, include them
  try {
    const seedPath = path.resolve(process.cwd(), 'data', 'products_seed.json');
    if (fs.existsSync(seedPath)) {
      const seedRaw = JSON.parse(fs.readFileSync(seedPath, 'utf8'));
      for (const item of seedRaw) {
        if (!seenSlugs.has(item.slug)) {
          fromIssue.push({
            id: item.id,
            cashier_code: item.cashier_code ?? null,
            slug: item.slug,
            name_ar: item.name_ar,
            description_ar: item.description_ar,
            category: item.category,
            sale_price: item.sale_price ?? 0,
            original_qty: item.original_qty,
            stock_status: item.stock_status,
            in_stock: item.in_stock ?? true,
            primary_image_url: item.primary_image_url || '/brand/lotus_logo.png',
          });
          seenSlugs.add(item.slug);
        }
      }
    }
  } catch (err) {
    console.warn('Could not read seed products:', err);
  }

  return fromIssue;
}

/**
 * Finds a single public product by its slug
 */
export function getPublicProductBySlug(
  slug: string,
  issue: IssueSnapshot
): PublicProduct | null {
  const products = extractProductsFromIssue(issue);
  const found = products.find((p) => {
    if (p.slug === slug || p.id === slug) return true;
    if (slug.startsWith('prod-') && p.cashier_code) {
      const match = slug.match(/^prod-(\d+)/);
      if (match && Number(match[1]) === p.cashier_code) return true;
    }
    return false;
  });
  return found || null;
}

/**
 * Synchronous version for testing or when issue is passed directly
 */
export function searchPublicProducts(
  query: string,
  issue: IssueSnapshot
): PublicProduct[] {
  const normalizedQuery = normalizeArabic(query);
  if (!normalizedQuery) return [];

  const products = extractProductsFromIssue(issue);

  return products.filter((p) => {
    const normName = normalizeArabic(p.name_ar);
    const normCategory = normalizeArabic(p.category || '');
    const codeStr = p.cashier_code ? String(p.cashier_code) : '';

    return (
      normName.includes(normalizedQuery) ||
      normCategory.includes(normalizedQuery) ||
      codeStr === query.trim()
    );
  });
}

/**
 * Generates JSON-LD schema.org/Product structured data for SEO indexing
 */
export function generateProductJsonLd(
  product: PublicProduct,
  baseUrl: string = 'https://lotus.eg'
): ProductJsonLd {
  const cleanBase = baseUrl.replace(/\/$/, '');
  const productUrl = `${cleanBase}/products/${encodeURIComponent(product.slug)}`;
  const imageUrl = product.primary_image_url.startsWith('http')
    ? product.primary_image_url
    : `${cleanBase}${product.primary_image_url}`;

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name_ar,
    image: imageUrl,
    description: product.description_ar || product.name_ar,
    sku: product.cashier_code ? String(product.cashier_code) : product.id,
    offers: {
      '@type': 'Offer',
      price: String(product.sale_price),
      priceCurrency: 'EGP',
      availability: product.in_stock !== false
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      url: productUrl,
    },
  };
}
