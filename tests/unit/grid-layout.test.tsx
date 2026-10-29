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

import { OliveShowcasePage } from '@/features/magazine/components/OliveShowcasePage';

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

describe('showcase pages interactive product links (Pages 1 to 5)', () => {
  it('renders 3 clickable product links on HoneyShowcasePage (Page 1) when interactive', () => {
    const { container } = render(<HoneyShowcasePage pageNumber={1} isInteractive={true} />);
    const links = Array.from(container.querySelectorAll('a[href^="/products/"]')) as HTMLAnchorElement[];
    expect(links).toHaveLength(3);
    const hrefs = links.map((l) => decodeURIComponent(l.getAttribute('href') || ''));
    expect(hrefs).toContain('/products/prod-4-NA7LA-عسل-نقي-مع-قرص-العسل-650-G');
    expect(hrefs).toContain('/products/prod-1-NA7LA-عسل-نقي-15-KG');
    expect(hrefs).toContain('/products/prod-3-NA7LA-عسل-نقي-مع-مكسرات-650-G');
  });

  it('renders 2 clickable product links on BasketsShowcasePage (Page 2) when interactive', () => {
    const { container } = render(<BasketsShowcasePage pageNumber={2} isInteractive={true} />);
    const links = Array.from(container.querySelectorAll('a[href^="/products/"]')) as HTMLAnchorElement[];
    expect(links).toHaveLength(2);
    const hrefs = links.map((l) => decodeURIComponent(l.getAttribute('href') || ''));
    expect(hrefs).toContain('/products/prod-na7la-عسل-سلة-NA7LA');
    expect(hrefs).toContain('/products/prod-na7la-عسل-سلة-NA7LA-هاندكرافتيد');
  });

  it('renders 2 clickable product links on OliveDatesPage (Page 3) when interactive', () => {
    const { container } = render(<OliveDatesPage pageNumber={3} isInteractive={true} />);
    const links = Array.from(container.querySelectorAll('a[href^="/products/"]')) as HTMLAnchorElement[];
    expect(links).toHaveLength(2);
    const hrefs = links.map((l) => decodeURIComponent(l.getAttribute('href') || ''));
    expect(hrefs).toContain('/products/prod-nakhla-تمور-طبيعية-حلوة-طازجة-1-KG');
    expect(hrefs).toContain('/products/prod-53-زيت-زيتون-بكر-ممتاز-1L');
  });

  it('renders 2 clickable product links on OliveDatesPage (Page 4) when interactive', () => {
    const { container } = render(<OliveDatesPage pageNumber={4} isInteractive={true} />);
    const links = Array.from(container.querySelectorAll('a[href^="/products/"]')) as HTMLAnchorElement[];
    expect(links).toHaveLength(2);
    const hrefs = links.map((l) => decodeURIComponent(l.getAttribute('href') || ''));
    expect(hrefs).toContain('/products/prod-nakhla-تمور-طبيعية-حلوة-طازجة-500-G');
    expect(hrefs).toContain('/products/prod-54-زيت-زيتون-بكر-ممتاز-750-ML');
  });

  it('renders 1 clickable product link on OliveShowcasePage (Page 5) when interactive', () => {
    const { container } = render(<OliveShowcasePage pageNumber={5} isInteractive={true} />);
    const links = Array.from(container.querySelectorAll('a[href^="/products/"]')) as HTMLAnchorElement[];
    expect(links).toHaveLength(1);
    const hrefs = links.map((l) => decodeURIComponent(l.getAttribute('href') || ''));
    expect(hrefs).toContain('/products/prod-55-زيت-زيتون-بكر-ممتاز-500-ML');
  });

  it('renders zero links when isInteractive is false across all showcase pages', () => {
    const { container } = render(
      <>
        <HoneyShowcasePage pageNumber={1} isInteractive={false} />
        <BasketsShowcasePage pageNumber={2} isInteractive={false} />
        <OliveDatesPage pageNumber={3} isInteractive={false} />
        <OliveDatesPage pageNumber={4} isInteractive={false} />
        <OliveShowcasePage pageNumber={5} isInteractive={false} />
      </>
    );
    const links = container.querySelectorAll('a[href^="/products/"]');
    expect(links).toHaveLength(0);
  });
});
