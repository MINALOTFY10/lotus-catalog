import { describe, it, expect } from 'vitest';
import { generateAutoLayout } from '@/features/magazine/services/autoLayout';
import { compileIssueSnapshot } from '@/features/magazine/services/publishIssue';
import { ProductData } from '@/features/magazine/types';

describe('generateAutoLayout', () => {
  it('creates 9-card pages grouped by section title and assigns slot numbers 1 to 9', () => {
    const mockProducts: ProductData[] = Array.from({ length: 18 }, (_, i) => ({
      id: `p-${i + 1}`,
      cashier_code: i + 1,
      slug: `product-${i + 1}`,
      name_ar: `منتج ${i + 1}`,
      sale_price: 100 * (i + 1),
      category: 'مجموعة التراث المصري',
    }));

    const pages = generateAutoLayout(mockProducts);
    expect(pages.length).toBe(2);
    expect(pages[0].position).toBe(1);
    expect(pages[0].template).toBe('grid3x3');
    expect(pages[0].section_title).toBe('مجموعة التراث المصري');
    expect(pages[0].slots.length).toBe(9);
    expect(pages[0].slots[0].slot).toBe(1);
    expect(pages[0].slots[8].slot).toBe(9);
  });
});

describe('compileIssueSnapshot', () => {
  it('compiles a frozen JSON payload with metadata, page count, and resolved slots', () => {
    const mockProducts: ProductData[] = [
      {
        id: 'p-1',
        cashier_code: 1,
        slug: 'p-1',
        name_ar: 'عسل',
        sale_price: 620,
      },
    ];

    const pages = generateAutoLayout(mockProducts);
    const snapshot = compileIssueSnapshot('lotus-pricelist', 'قائمة أسعار لوتس', pages);

    expect(snapshot.issueSlug).toBe('lotus-pricelist');
    expect(snapshot.title_ar).toBe('قائمة أسعار لوتس');
    expect(snapshot.totalPages).toBe(pages.length);
    expect(snapshot.pages[0].slots[0].product?.name_ar).toBe('عسل');
    expect(snapshot.publishedAt).toBeDefined();
  });
});
