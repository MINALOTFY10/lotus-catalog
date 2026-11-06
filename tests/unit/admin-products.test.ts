import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { productUpdateSchema } from '@/features/admin/products/schemas';
import {
  updateProductInStore,
  extractStoragePath,
  uploadProductImageAction,
} from '@/features/admin/products/actions';
import * as sessionModule from '@/lib/auth/session';
import * as supabaseAdminModule from '@/lib/supabase/admin';
import { ProductEditModal } from '@/features/admin/products/ProductEditModal';
import { AdminProductsTable } from '@/features/admin/products/AdminProductsTable';

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

describe('AdminProductsTable Cashier Code Sorting', () => {
  it('sorts products by cashier code ascending and descending', () => {
    const mockProducts = [
      { id: '1', name_ar: 'المنتج ب', cashier_code: 50, sale_price: 100, slug: 'b', in_stock: true, primary_image_url: '/img.jpg' },
      { id: '2', name_ar: 'المنتج أ', cashier_code: 5, sale_price: 200, slug: 'a', in_stock: true, primary_image_url: '/img.jpg' },
      { id: '3', name_ar: 'المنتج ج', cashier_code: null, sale_price: 300, slug: 'c', in_stock: true, primary_image_url: '/img.jpg' },
    ];

    const { container } = render(
      React.createElement(AdminProductsTable, {
        initialProducts: mockProducts,
        categories: [],
      })
    );

    expect(screen.getByText('الكود')).toBeDefined();

    // Click on Code header to sort ascending
    fireEvent.click(screen.getByText('الكود'));
    const rowsAsc = container.querySelectorAll('tbody tr');
    expect(rowsAsc[0].textContent).toContain('#5');
    expect(rowsAsc[1].textContent).toContain('#50');
    expect(rowsAsc[2].textContent).toContain('#-');

    // Click again to sort descending
    fireEvent.click(screen.getByText('الكود'));
    const rowsDesc = container.querySelectorAll('tbody tr');
    expect(rowsDesc[0].textContent).toContain('#50');
    expect(rowsDesc[1].textContent).toContain('#5');
    expect(rowsDesc[2].textContent).toContain('#-');
  });
});

describe('extractStoragePath', () => {
  it('extracts public URL storage path correctly', async () => {
    const url = 'https://project.supabase.co/storage/v1/object/public/magazine/uploads/products/item-1.webp';
    expect(await extractStoragePath(url, 'magazine')).toBe('uploads/products/item-1.webp');
  });

  it('extracts storage path from rewrite /magazine/ for custom uploads', async () => {
    const url = '/magazine/uploads/products/p1_s1.webp?v=123';
    expect(await extractStoragePath(url, 'magazine')).toBe('uploads/products/p1_s1.webp');
  });

  it('rejects protected canva assets, brand logos and system directories', async () => {
    expect(await extractStoragePath('/magazine/canva_products/p1_s1.webp')).toBeNull();
    expect(await extractStoragePath('/magazine/brand/lotus_logo.png')).toBeNull();
    expect(await extractStoragePath('https://project.supabase.co/storage/v1/object/public/magazine/brand/logo.png')).toBeNull();
    expect(await extractStoragePath('https://project.supabase.co/storage/v1/object/public/magazine/data/live_issue.json')).toBeNull();
  });

  it('rejects external non-supabase URLs', async () => {
    expect(await extractStoragePath('https://example.com/photo.jpg')).toBeNull();
    expect(await extractStoragePath('')).toBeNull();
    expect(await extractStoragePath(null)).toBeNull();
  });
});

describe('uploadProductImageAction', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('rejects unauthenticated staff', async () => {
    vi.spyOn(sessionModule, 'getStaffSession').mockResolvedValue(null);
    const fd = new FormData();
    const result = await uploadProductImageAction(fd);
    expect(result.success).toBe(false);
    expect(result.error).toContain('غير مصرح');
  });

  it('validates file existence and mime type', async () => {
    vi.spyOn(sessionModule, 'requireStaffSession').mockResolvedValue({
      email: 'admin@lotus.eg',
      role: 'staff',
      loggedAt: Date.now(),
    });

    const fdEmpty = new FormData();
    const emptyRes = await uploadProductImageAction(fdEmpty);
    expect(emptyRes.success).toBe(false);
    expect(emptyRes.error).toContain('ملف صورة');

    const invalidFile = new File(['text content'], 'document.pdf', { type: 'application/pdf' });
    const fdInvalid = new FormData();
    fdInvalid.append('file', invalidFile);
    const invalidRes = await uploadProductImageAction(fdInvalid);
    expect(invalidRes.success).toBe(false);
    expect(invalidRes.error).toContain('غير مدعوم');
  });

  it('rejects files exceeding 5MB size limit', async () => {
    vi.spyOn(sessionModule, 'requireStaffSession').mockResolvedValue({
      email: 'admin@lotus.eg',
      role: 'staff',
      loggedAt: Date.now(),
    });

    const oversizedFile = new File(['x'.repeat(10)], 'large.webp', { type: 'image/webp' });
    Object.defineProperty(oversizedFile, 'size', { value: 6 * 1024 * 1024 });

    const fd = new FormData();
    fd.append('file', oversizedFile);
    fd.append('productId', 'prod-123');

    const res = await uploadProductImageAction(fd);
    expect(res.success).toBe(false);
    expect(res.error).toContain('5 ميجابايت');
  });

  it('uploads file to supabase storage and deletes previous image', async () => {
    vi.spyOn(sessionModule, 'requireStaffSession').mockResolvedValue({
      email: 'admin@lotus.eg',
      role: 'staff',
      loggedAt: Date.now(),
    });

    const mockUpload = vi.fn().mockResolvedValue({ data: { path: 'uploads/products/mock.webp' }, error: null });
    const mockGetPublicUrl = vi.fn().mockReturnValue({
      data: { publicUrl: 'https://test.supabase.co/storage/v1/object/public/magazine/uploads/products/mock.webp' },
    });
    const mockRemove = vi.fn().mockResolvedValue({ data: [], error: null });

    const mockClient = {
      storage: {
        from: vi.fn().mockReturnValue({
          upload: mockUpload,
          getPublicUrl: mockGetPublicUrl,
          remove: mockRemove,
        }),
      },
    };

    vi.spyOn(supabaseAdminModule, 'createAdminClient').mockReturnValue(mockClient as any);

    const validFile = new File(['image-bytes'], 'new-product.webp', { type: 'image/webp' });
    const fd = new FormData();
    fd.append('file', validFile);
    fd.append('productId', 'prod-123');
    fd.append('oldImageUrl', 'https://test.supabase.co/storage/v1/object/public/magazine/uploads/products/old-image.webp');

    const result = await uploadProductImageAction(fd);

    expect(result.success).toBe(true);
    expect(result.url).toBe('https://test.supabase.co/storage/v1/object/public/magazine/uploads/products/mock.webp');
    expect(mockUpload).toHaveBeenCalled();
    expect(mockRemove).toHaveBeenCalledWith(['uploads/products/old-image.webp']);
  });
});

describe('ProductEditModal image upload interaction', () => {
  it('renders image upload options and file input', () => {
    const product = {
      id: 'prod-img-test',
      cashier_code: 42,
      slug: 'prod-img-test',
      name_ar: 'منتج فخار',
      sale_price: 250,
      primary_image_url: 'https://test.supabase.co/storage/v1/object/public/magazine/uploads/products/old.webp',
      category: 'فخار',
      stock_status: 'متاح',
      in_stock: true,
    };

    render(
      React.createElement(ProductEditModal, {
        product,
        isOpen: true,
        onClose: () => undefined,
        onSuccess: () => undefined,
      })
    );

    expect(screen.getByText(/رفع \/ تغيير الصورة/i)).toBeDefined();
    expect(screen.getByTestId('product-image-file-input')).toBeDefined();
    expect(screen.getByLabelText(/رابط الصورة في قاعدة البيانات \(URL\)/i)).toBeDefined();
  });

  it('stages selected image file and enables cancel action', async () => {
    // Mock URL.createObjectURL and revokeObjectURL for jsdom
    const origCreateObjectURL = global.URL.createObjectURL;
    const origRevokeObjectURL = global.URL.revokeObjectURL;
    global.URL.createObjectURL = vi.fn().mockReturnValue('blob:http://localhost/test-blob');
    global.URL.revokeObjectURL = vi.fn();

    const product = {
      id: 'prod-img-stage',
      cashier_code: 43,
      slug: 'prod-img-stage',
      name_ar: 'طبق خزف',
      sale_price: 300,
      primary_image_url: '/old.webp',
      category: 'خزف',
      stock_status: 'متاح',
      in_stock: true,
    };

    render(
      React.createElement(ProductEditModal, {
        product,
        isOpen: true,
        onClose: () => undefined,
        onSuccess: () => undefined,
      })
    );

    const fileInput = screen.getByTestId('product-image-file-input') as HTMLInputElement;
    const testFile = new File(['fake-png-data'], 'custom-ceramic.png', { type: 'image/png' });

    Object.defineProperty(fileInput, 'files', {
      value: [testFile],
      configurable: true,
    });
    fireEvent.change(fileInput);

    await waitFor(() => {
      expect(screen.getByText('custom-ceramic.png')).toBeDefined();
      expect(screen.getByText('رفع الآن إلى قاعدة البيانات')).toBeDefined();
      expect(screen.getByText('إلغاء الملف')).toBeDefined();
    });

    // Test canceling staged file
    fireEvent.click(screen.getByText('إلغاء الملف'));

    await waitFor(() => {
      expect(screen.queryByText('custom-ceramic.png')).toBeNull();
    });

    global.URL.createObjectURL = origCreateObjectURL;
    global.URL.revokeObjectURL = origRevokeObjectURL;
  });
});
