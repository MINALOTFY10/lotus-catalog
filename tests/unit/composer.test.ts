import { describe, it, expect } from 'vitest';
import { slotAssignSchema } from '@/features/admin/composer/schemas';
import {
  assignProductToSlot,
  removeProductFromSlot,
} from '@/features/admin/composer/actions';
import { MagazinePageData } from '@/features/magazine/types';

describe('slotAssignSchema', () => {
  it('validates page number and slot number between 1 and 9', () => {
    const valid = slotAssignSchema.safeParse({
      pageNumber: 2,
      slot: 1,
      product_id: 'prod-1',
    });
    expect(valid.success).toBe(true);

    const invalidSlotHigh = slotAssignSchema.safeParse({
      pageNumber: 2,
      slot: 10,
      product_id: 'prod-1',
    });
    expect(invalidSlotHigh.success).toBe(false);

    const invalidSlotLow = slotAssignSchema.safeParse({
      pageNumber: 2,
      slot: 0,
      product_id: 'prod-1',
    });
    expect(invalidSlotLow.success).toBe(false);
  });
});

describe('assignProductToSlot & removeProductFromSlot', () => {
  const initialPages: MagazinePageData[] = [
    {
      position: 2,
      pageNumber: 2,
      template: 'grid3x3',
      sectionTitle: 'عسل نحل',
      slots: [
        {
          slot: 1,
          product: {
            id: 'old-prod',
            slug: 'old-prod',
            name_ar: 'عسل قديم',
            sale_price: 100,
            primary_image_url: '/old.jpg',
          },
        },
      ],
    },
  ];

  it('assigns product to an existing slot and updates overrides', async () => {
    const newProduct = {
      id: 'new-prod',
      slug: 'new-prod',
      name_ar: 'عسل فاخر جديد',
      sale_price: 350,
      primary_image_url: '/new.jpg',
    };

    const updated = await assignProductToSlot(initialPages, 2, 1, newProduct, {
      title_override: 'عنوان خاص بالمجلة',
    });

    const page2 = updated.find((p) => p.pageNumber === 2);
    const slot1 = page2?.slots.find((s) => s.slot === 1);
    expect(slot1?.product?.id).toBe('new-prod');
    expect(slot1?.title_override).toBe('عنوان خاص بالمجلة');
  });

  it('preserves existing overrides and calculates formatted price_text in Arabic', async () => {
    const pagesWithOverrides: MagazinePageData[] = [
      {
        position: 3,
        pageNumber: 3,
        template: 'grid3x3',
        slots: [
          {
            slot: 2,
            image_override: '/custom-image.webp',
            description_override: 'وصف مخصص سابق',
            col_span: 2,
            row_span: 1,
            product: {
              id: 'p-override',
              slug: 'p-override',
              name_ar: 'منتج تجريبي',
              sale_price: 150,
            },
          },
        ],
      },
    ];

    const updated = await assignProductToSlot(pagesWithOverrides, 3, 2, pagesWithOverrides[0].slots[0].product, {
      price_override: 250,
      cashier_code: 9988,
    });

    const slot = updated[0].slots[0];
    expect(slot.price_override).toBe(250);
    expect(slot.price_text).toBe('٢٥٠ ج.مصري');
    expect(slot.image_override).toBe('/custom-image.webp');
    expect(slot.description_override).toBe('وصف مخصص سابق');
    expect(slot.col_span).toBe(2);
    expect(slot.product?.cashier_code).toBe(9988);
  });
});
