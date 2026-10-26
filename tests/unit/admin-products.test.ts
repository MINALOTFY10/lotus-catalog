import { describe, it, expect } from 'vitest';
import { productUpdateSchema } from '@/features/admin/products/schemas';
import { updateProductInStore } from '@/features/admin/products/actions';

describe('productUpdateSchema', () => {
  it('validates price and name correctly', () => {
    const valid = productUpdateSchema.safeParse({
      name_ar: 'كليم يدوي أصيل',
      sale_price: 450,
      description_ar: 'منسوج يدويًا من الصوف الطبيعي',
    });
    expect(valid.success).toBe(true);

    const invalidEmptyName = productUpdateSchema.safeParse({
      name_ar: '',
      sale_price: 450,
    });
    expect(invalidEmptyName.success).toBe(false);

    const invalidNegativePrice = productUpdateSchema.safeParse({
      name_ar: 'فخار',
      sale_price: -10,
    });
    expect(invalidNegativePrice.success).toBe(false);
  });
});

describe('updateProductInStore', () => {
  it('updates product fields and preserves id and cashier_code', async () => {
    const mockProducts = [
      {
        id: 'prod-test-1',
        cashier_code: 99,
        slug: 'prod-test-1',
        name_ar: 'منتج قديم',
        sale_price: 100,
        primary_image_url: '/old.jpg',
        in_stock: true,
      },
    ];

    const updated = await updateProductInStore(mockProducts, 'prod-test-1', {
      name_ar: 'منتج مجدد فاخر',
      sale_price: 150,
    });

    expect(updated).not.toBeNull();
    expect(updated?.find((p) => p.id === 'prod-test-1')?.name_ar).toBe('منتج مجدد فاخر');
    expect(updated?.find((p) => p.id === 'prod-test-1')?.sale_price).toBe(150);
    expect(updated?.find((p) => p.id === 'prod-test-1')?.cashier_code).toBe(99);
  });
});
