import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ProductCard } from '@/features/magazine/components/ProductCard';
import { PageShell } from '@/features/magazine/components/PageShell';
import { Grid3x3Page } from '@/features/magazine/components/Grid3x3Page';

describe('PageShell', () => {
  it('renders section title on the right margin and header brand assets', () => {
    render(
      <PageShell sectionTitle="مجموعة التراث المصري" pageNumber={6}>
        <div>Slot Content</div>
      </PageShell>
    );
    expect(screen.getByText('مجموعة التراث المصري')).toBeDefined();
    expect(screen.getByText('قائمة الأسعار')).toBeDefined();
    expect(screen.getByAltText('لوتس')).toBeDefined();
    expect(screen.getByAltText('صندوق دعم الصناعات')).toBeDefined();
  });
});

describe('ProductCard', () => {
  it('renders product photo, title, description, and price formatted with L.E', () => {
    render(
      <ProductCard
        product={{
          id: 'prod-1',
          cashier_code: 9,
          slug: 'jewelry-set-9',
          name_ar: 'طقم اكسسوار بحلق',
          description_ar: 'مصنوع يدويا براسس مجوهرات طقم مع حلق متناسق',
          sale_price: 405,
          primary_image_url: '/uploads/products/image9.jpg',
        }}
      />
    );
    expect(screen.getByText('طقم اكسسوار بحلق')).toBeDefined();
    expect(screen.getByText('السعر')).toBeDefined();
    expect(screen.getByText('405 L.E')).toBeDefined();
    expect(screen.getByText('مصنوع يدويا براسس مجوهرات طقم مع حلق متناسق')).toBeDefined();
  });
});
