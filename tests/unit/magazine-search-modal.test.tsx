import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { MagazineSearchModal } from '@/features/magazine/components/MagazineSearchModal';
import { IssueSnapshot } from '@/features/magazine/types';

vi.mock('next/image', () => ({
  default: ({ alt }: { alt: string }) => <span role="img" aria-label={alt} />,
}));

const issue: IssueSnapshot = {
  issueSlug: 'test-issue',
  title_ar: 'مجلة لوتس',
  version: 1,
  publishedAt: '2026-10-27T00:00:00.000Z',
  totalPages: 1,
  pages: [
    {
      position: 1,
      pageNumber: 1,
      template: 'grid3x3',
      section_title: 'عسل',
      slots: [
        {
          slot: 1,
          product: {
            id: 'honey-1',
            slug: 'honey-1',
            name_ar: 'عسل برسيم',
            sale_price: 450,
            primary_image_url: '/honey.webp',
          },
        },
      ],
    },
  ],
};

describe('MagazineSearchModal', () => {
  it('can open after rendering closed and exposes the search dialog accessibly', () => {
    const onClose = vi.fn();
    const { rerender } = render(
      <MagazineSearchModal
        isOpen={false}
        onClose={onClose}
        issue={issue}
        onNavigateToPage={vi.fn()}
      />
    );

    rerender(
      <MagazineSearchModal
        isOpen
        onClose={onClose}
        issue={issue}
        onNavigateToPage={vi.fn()}
      />
    );

    expect(screen.getByRole('dialog', { name: 'البحث في صفحات المجلة' })).toBeDefined();
    const searchInput = screen.getByRole('textbox', { name: 'ابحث في منتجات المجلة' });
    expect(searchInput).toBeDefined();

    fireEvent.keyDown(searchInput, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('filters products when a suggested category is selected', () => {
    const onClose = vi.fn();
    const onNavigateToPage = vi.fn();

    render(
      <MagazineSearchModal
        isOpen
        onClose={onClose}
        issue={issue}
        onNavigateToPage={onNavigateToPage}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'عسل' }));

    expect(screen.getByText('عسل برسيم')).toBeDefined();
    expect(screen.getByText(/تم العثور على 1 منتج/)).toBeDefined();

    fireEvent.click(screen.getByRole('button', { name: /عسل برسيم/ }));
    expect(onNavigateToPage).toHaveBeenCalledWith(1);
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('offers the full-search route when no products match', () => {
    render(
      <MagazineSearchModal
        isOpen
        onClose={vi.fn()}
        issue={issue}
        onNavigateToPage={vi.fn()}
      />
    );

    fireEvent.change(screen.getByRole('textbox', { name: 'ابحث في منتجات المجلة' }), {
      target: { value: 'منتج غير موجود' },
    });

    expect(screen.getByText(/لم يتم العثور على منتجات تطابق/)).toBeDefined();
    expect(screen.getByRole('link', { name: 'فتح صفحة البحث المتقدمة' }).getAttribute('href'))
      .toBe('/search?q=%D9%85%D9%86%D8%AA%D8%AC%20%D8%BA%D9%8A%D8%B1%20%D9%85%D9%88%D8%AC%D9%88%D8%AF');
  });
});
