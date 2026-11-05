import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { SlotPickerModal } from '@/features/admin/composer/SlotPickerModal';
import { AdminProductRecord } from '@/features/admin/products/actions';

vi.mock('next/image', () => ({
  default: ({ alt }: { alt: string }) => <span role="img" aria-label={alt} />,
}));

vi.mock('@/features/admin/composer/actions', () => ({
  saveSlotAssignmentAction: vi.fn().mockResolvedValue({ success: true }),
}));

const mockProducts: AdminProductRecord[] = [
  {
    id: 'prod-1',
    name_ar: 'عسل سدر جبلي',
    slug: 'asal-sidr',
    category: 'عسل',
    sale_price: 320,
    in_stock: true,
    primary_image_url: '/products/honey.webp',
    cashier_code: 101,
  },
  {
    id: 'prod-2',
    name_ar: 'زيت زيتون بكر',
    slug: 'zayt-zaytoun',
    category: 'زيوت',
    sale_price: 180,
    in_stock: true,
    primary_image_url: '/products/oil.webp',
    cashier_code: 102,
  },
];

describe('SlotPickerModal', () => {
  it('renders nothing when isOpen is false without hook violations', () => {
    const { container, rerender } = render(
      <SlotPickerModal
        pageNumber={1}
        slotNumber={1}
        isOpen={false}
        availableProducts={mockProducts}
        onClose={vi.fn()}
        onSuccess={vi.fn()}
      />
    );
    expect(container.firstChild).toBeNull();

    // Rerender open to verify hook consistency between renders
    rerender(
      <SlotPickerModal
        pageNumber={1}
        slotNumber={1}
        isOpen={true}
        availableProducts={mockProducts}
        onClose={vi.fn()}
        onSuccess={vi.fn()}
      />
    );
    expect(screen.getByText('تخصيص الخانة 1 - صفحة 1')).toBeDefined();
  });

  it('allows customizing title, price, custom choice toggle, and description', () => {
    render(
      <SlotPickerModal
        pageNumber={1}
        slotNumber={1}
        isOpen={true}
        currentSlotData={{
          slot: 1,
          product: mockProducts[0],
          price_override: 320,
        }}
        onClose={vi.fn()}
        onSuccess={vi.fn()}
      />
    );

    expect(screen.getByText('تخصيص الخانة 1 - صفحة 1')).toBeDefined();
    expect(screen.getByPlaceholderText('أدخل وصف المنتج، المكونات، طريقة الاستخدام، أو أي مواصفات تفصيلية...')).toBeDefined();
    const customChoiceBtn = screen.getByText('يحدد علي حسب الاختيار');
    expect(customChoiceBtn).toBeDefined();

    // Toggle custom choice
    fireEvent.click(customChoiceBtn);
    const priceInput = screen.getByPlaceholderText('يحدد علي حسب الاختيار') as HTMLInputElement;
    expect(priceInput.disabled).toBe(true);
  });
});
