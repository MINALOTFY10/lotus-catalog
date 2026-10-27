import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ProductCard } from '@/features/magazine/components/ProductCard';
import { PageShell } from '@/features/magazine/components/PageShell';
import { Grid3x3Page } from '@/features/magazine/components/Grid3x3Page';
import { HoneyShowcasePage } from '@/features/magazine/components/HoneyShowcasePage';
import { BasketsShowcasePage } from '@/features/magazine/components/BasketsShowcasePage';
import { OliveDatesPage } from '@/features/magazine/components/OliveDatesPage';

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

  it('lets long product titles and descriptions wrap without truncation', () => {
    const title = 'Handcrafted catalog title '.repeat(5).trim();
    const description = 'Detailed product description '.repeat(12).trim();

    render(
      <ProductCard
        product={{
          id: 'prod-long-copy',
          slug: 'long-copy-product',
          name_ar: title,
          description_ar: description,
          sale_price: 405,
        }}
      />
    );

    expect(screen.getByRole('heading', { name: title }).className).not.toContain(
      'truncate'
    );
    expect(screen.getByText(description).className).not.toContain('line-clamp');
  });
});

describe('showcase product copy', () => {
  it('keeps opening-page product descriptions visible without line clamps', () => {
    const { container } = render(
      <>
        <HoneyShowcasePage />
        <BasketsShowcasePage />
        <OliveDatesPage pageNumber={3} />
      </>
    );

    expect(container.querySelectorAll('p.line-clamp-2, p.line-clamp-3')).toHaveLength(
      0
    );
  });
});
