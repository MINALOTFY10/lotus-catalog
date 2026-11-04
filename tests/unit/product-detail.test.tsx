import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { formatMagazinePrice } from '@/lib/format/price';
import { ProductCard } from '@/features/magazine/components/ProductCard';
import { getPublicProductBySlug, searchPublicProducts, generateProductJsonLd } from '@/features/products/services/publicProducts';
import { IssueSnapshot } from '@/features/magazine/services/publishIssue';

describe('formatMagazinePrice', () => {
  it('formats numeric price to Arabic digits with ج.مصري suffix and supports magazine priceText', () => {
    expect(formatMagazinePrice(405)).toBe('٤٠٥ ج.مصري');
    expect(formatMagazinePrice(620)).toBe('٦٢٠ ج.مصري');
    expect(formatMagazinePrice(1080)).toBe('١٠٨٠ ج.مصري');
    expect(formatMagazinePrice(2095, 'السعر\n٢٠٩٥ ج.مصري')).toBe('٢٠٩٥ ج.مصري');
  });

  it('handles null, undefined, or zero with Arabic fallback', () => {
    expect(formatMagazinePrice(null)).toBe('السعر عند الطلب');
    expect(formatMagazinePrice(undefined)).toBe('السعر عند الطلب');
    expect(formatMagazinePrice(0)).toBe('السعر عند الطلب');
  });

  it('ignores malformed priceText without digits and falls back to the numeric price', () => {
    expect(formatMagazinePrice(250, 'االسعر\nج.مصري')).toBe('٢٥٠ ج.مصري');
  });

  it('keeps the real numeric price when the magazine slot override is blank', () => {
    render(
      <ProductCard
        product={{
          id: 'prod-365',
          slug: 'prod-365',
          name_ar: 'مبخرة نحاس',
          description_ar: 'وصف',
          sale_price: 365,
          in_stock: true,
          primary_image_url: '/img.jpg',
        }}
        priceOverride=""
        priceText="السعر\nج.مصري"
        isInteractive={false}
      />
    );

    expect(screen.getByText(/٣٦٥/)).toBeTruthy();
  });
});

describe('publicProducts service', () => {
  const mockIssue: IssueSnapshot = {
    issueSlug: 'lotus-test',
    title_ar: 'مجلة لوتس',
    version: 1,
    publishedAt: new Date().toISOString(),
    totalPages: 2,
    pages: [
      {
        position: 1,
        pageNumber: 1,
        template: 'cover',
        sectionTitle: 'الغلاف',
        slots: [],
      },
      {
        position: 2,
        pageNumber: 2,
        template: 'grid3x3',
        sectionTitle: 'عسل نحل فاخر',
        slots: [

          {
            slot: 1,
            product: {
              id: 'prod-1',
              cashier_code: 1,
              slug: 'prod-1-عسل-كيلو-و-نص',
              name_ar: 'عسل كيلو و نص',
              description_ar: 'عسل نقي طبيعي فاخر',
              sale_price: 620,
              primary_image_url: '/uploads/products/image1.jpg',
            },
          },
        ],
      },
    ],
  };

  it('retrieves product by slug, locates magazine page, and strips cost_price', () => {
    const result = getPublicProductBySlug('prod-1-عسل-كيلو-و-نص', mockIssue);
    expect(result).not.toBeNull();
    expect(result?.name_ar).toBe('عسل كيلو و نص');
    expect(result?.sale_price).toBe(620);
    expect(result?.magazinePageNumber).toBe(2);
    // CRITICAL SECURITY REQUIREMENT: cost_price must never leak to public
    expect((result as unknown as Record<string, unknown>).cost_price).toBeUndefined();
  });

  it('falls back to the product price when a magazine slot has a blank price override', () => {
    const issueWithBlankOverride: IssueSnapshot = {
      ...mockIssue,
      pages: [
        ...mockIssue.pages.map((page, index) =>
          index === 1
            ? {
                ...page,
                slots: [
                  {
                    slot: 1,
                    price_override: '',
                    product: {
                      ...page.slots[0].product,
                      sale_price: 940,
                    },
                  },
                ],
              }
            : page
        ),
      ],
    };

    const result = getPublicProductBySlug('prod-1-عسل-كيلو-و-نص', issueWithBlankOverride);
    expect(result).not.toBeNull();
    expect(result?.sale_price).toBe(940);
  });

  it('searches products by Arabic title or cashier code', () => {
    const results = searchPublicProducts('كيلو', mockIssue);
    expect(results.length).toBe(1);
    expect(results[0].name_ar).toBe('عسل كيلو و نص');

    const codeResults = searchPublicProducts('1', mockIssue);
    expect(codeResults.length).toBe(1);
    expect(codeResults[0].cashier_code).toBe(1);

    const emptyResults = searchPublicProducts('منتج_غير_موجود_نهائيا', mockIssue);
    expect(emptyResults.length).toBe(0);
  });

  it('generates valid schema.org Product JSON-LD structured data', () => {
    const product = getPublicProductBySlug('prod-1-عسل-كيلو-و-نص', mockIssue);
    expect(product).not.toBeNull();
    const jsonLd = generateProductJsonLd(product!, 'https://lotus.eg');

    expect(jsonLd['@context']).toBe('https://schema.org');
    expect(jsonLd['@type']).toBe('Product');
    expect(jsonLd.name).toBe('عسل كيلو و نص');
    expect(jsonLd.offers.price).toBe('620');
    expect(jsonLd.offers.priceCurrency).toBe('EGP');
  });
});
