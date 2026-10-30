import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ProductCard } from '@/features/magazine/components/ProductCard';
import { ProductDetailModal } from '@/features/magazine/components/ProductDetailModal';
import { MagazinePageRenderer } from '@/features/magazine/components/MagazinePageRenderer';
import { MagazinePageData, ProductData } from '@/features/magazine/types';

describe('Product Interaction & Modal', () => {
  const sampleProduct: ProductData = {
    id: 'prod-honey-1',
    slug: 'honey-clover-pure',
    name_ar: 'عسل نحلة عسل برسيم طبيعي',
    description_ar: 'نحلة عسل برسيم فاخر، غني بالفيتامينات والإنزيمات الطبيعية التي تدعم المناعة وتعزز الطاقة.',
    sale_price: 350,
    category: 'عسل نحل ومنتجات طبيعية',
    primary_image_url: '/magazine/canva_products/p1_s1.webp',
  };

  it('renders interactive ProductCard and calls onSelect when clicked', () => {
    const handleSelect = vi.fn();
    render(
      <ProductCard
        product={sampleProduct}
        onSelect={handleSelect}
        isInteractive={true}
      />
    );

    const cardButton = screen.getByRole('button', { name: /عرض تفاصيل عسل نحلة عسل برسيم طبيعي/i });
    expect(cardButton).toBeDefined();
    fireEvent.click(cardButton);
    expect(handleSelect).toHaveBeenCalledWith(sampleProduct);
  });

  it('renders ProductDetailModal with full product details and handles close', () => {
    const handleClose = vi.fn();
    const { rerender } = render(
      <ProductDetailModal
        product={sampleProduct}
        isOpen={true}
        onClose={handleClose}
      />
    );

    expect(screen.getByText('عسل نحلة عسل برسيم طبيعي')).toBeDefined();
    expect(screen.getByText(/نحلة عسل برسيم فاخر/)).toBeDefined();
    expect(screen.getByText('350 ج.مصري')).toBeDefined();
    expect(screen.getByText('عسل نحل ومنتجات طبيعية')).toBeDefined();

    // Close button
    const closeBtn = screen.getByLabelText('إغلاق النافذة');
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);

    // Escape key
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(handleClose).toHaveBeenCalledTimes(2);

    // Rerender as closed
    rerender(
      <ProductDetailModal
        product={sampleProduct}
        isOpen={false}
        onClose={handleClose}
      />
    );
    expect(screen.queryByText('عسل نحلة عسل برسيم طبيعي')).toBeNull();
  });

  it('renders authentic interactive page via MagazinePageRenderer with real React components', () => {
    const handleProductClick = vi.fn();
    const pageData: MagazinePageData = {
      position: 6,
      pageNumber: 6,
      template: 'grid3x3',
      section_title: 'مجموعة الحلفا المصري اليدوي',
      slots: [
        {
          slot: 1,
          product: {
            id: 'prod-p6-s1',
            slug: 'cushion-khaysh',
            name_ar: 'غطاء وسادة الخيش مطرز يدويًا',
            description_ar: 'غطاء وسادة من الخيش الطبيعي مزين بتطريزات ملونة مستوحاة من الريف المصري.',
            sale_price: 1015,
            primary_image_url: '/magazine/canva_products/p6_s1.webp',
          },
        },
      ],
    };

    render(
      <MagazinePageRenderer
        page={pageData}
        isInteractive={true}
        onProductClick={handleProductClick}
      />
    );

    expect(screen.getByText('مجموعة الحلفا المصري اليدوي')).toBeDefined();
    expect(screen.getByText('قائمة الأسعار')).toBeDefined();
    expect(screen.getByText('غطاء وسادة الخيش مطرز يدويًا')).toBeDefined();

    // Click on the rendered product card button
    const card = screen.getByRole('button', { name: /عرض تفاصيل غطاء وسادة الخيش مطرز يدويًا/i });
    fireEvent.click(card);
    expect(handleProductClick).toHaveBeenCalledWith(pageData.slots[0].product);
  });
});
