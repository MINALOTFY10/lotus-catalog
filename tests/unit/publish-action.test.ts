import { describe, it, expect } from 'vitest';
import { computeIssueDiff } from '@/features/admin/publish/diff';
import { MagazinePageData } from '@/features/magazine/types';

describe('computeIssueDiff', () => {
  it('identifies changed slot prices and slot counts', () => {
    const draft: MagazinePageData[] = [
      {
        position: 2,
        pageNumber: 2,
        template: 'grid3x3',
        sectionTitle: 'عسل',
        slots: [
          {
            slot: 1,
            price_override: 500,
            product: {
              id: 'p1',
              slug: 'p1',
              name_ar: 'عسل',
              sale_price: 500,
              primary_image_url: '/1.jpg',
            },
          },
        ],
      },
    ];

    const live: MagazinePageData[] = [
      {
        position: 2,
        pageNumber: 2,
        template: 'grid3x3',
        sectionTitle: 'عسل',
        slots: [
          {
            slot: 1,
            price_override: 400,
            product: {
              id: 'p1',
              slug: 'p1',
              name_ar: 'عسل',
              sale_price: 400,
              primary_image_url: '/1.jpg',
            },
          },
        ],
      },
    ];

    const diff = computeIssueDiff(draft, live);
    expect(diff.changedSlotsCount).toBe(1);
    expect(diff.priceChanges.length).toBe(1);
    expect(diff.priceChanges[0].oldPrice).toBe(400);
    expect(diff.priceChanges[0].newPrice).toBe(500);
  });

  it('detects added pages', () => {
    const draft: MagazinePageData[] = [
      { position: 1, pageNumber: 1, template: 'cover', sectionTitle: 'غلاف', slots: [] },
      { position: 2, pageNumber: 2, template: 'grid3x3', sectionTitle: 'جديد', slots: [] },
    ];
    const live: MagazinePageData[] = [
      { position: 1, pageNumber: 1, template: 'cover', sectionTitle: 'غلاف', slots: [] },
    ];

    const diff = computeIssueDiff(draft, live);
    expect(diff.addedPagesCount).toBe(1);
    expect(diff.hasChanges).toBe(true);
  });
});
