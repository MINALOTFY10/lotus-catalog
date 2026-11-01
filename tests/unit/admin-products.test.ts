import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { productUpdateSchema } from '@/features/admin/products/schemas';
import { updateProductInStore } from '@/features/admin/products/actions';
import { ProductEditModal } from '@/features/admin/products/ProductEditModal';

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

describe('ProductEditModal', () => {
  it('renders the product description field and syncs values when the selected product changes', () => {
    const product = {
      id: 'prod-edit-desc',
      cashier_code: 77,
      slug: 'prod-edit-desc',
      name_ar: 'منتج تجريبي',
      sale_price: 320,
      primary_image_url: '/old.jpg',
      description_ar: 'وصف أصلي للمنتج',
      category: 'مجوهرات',
      stock_status: 'متاح',
      in_stock: true,
    };

    const { rerender } = render(
      React.createElement(ProductEditModal, {
        product: null,
        isOpen: false,
        onClose: () => undefined,
        onSuccess: () => undefined,
      })
    );

    expect(screen.queryByLabelText(/الوصف والمواصفات التفصيلية/i)).toBeNull();

    rerender(
      React.createElement(ProductEditModal, {
        product,
        isOpen: true,
        onClose: () => undefined,
        onSuccess: () => undefined,
      })
    );

    const descriptionInput = screen.getByLabelText(/الوصف والمواصفات التفصيلية/i) as HTMLTextAreaElement;
    expect(descriptionInput.value).toBe('وصف أصلي للمنتج');
    expect(screen.getByDisplayValue('منتج تجريبي')).toBeDefined();

    fireEvent.change(descriptionInput, { target: { value: 'وصف جديد' } });
    expect(descriptionInput.value).toBe('وصف جديد');
  });
});
