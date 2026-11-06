import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ListViewGrid } from '@/features/magazine/components/ListViewGrid';

vi.mock('@/features/magazine/components/MagazinePagePreview', () => ({
  MagazinePagePreview: () => <div data-testid="page-preview" />,
}));

describe('ListViewGrid mobile responsiveness and layout', () => {
  const dummyPages = [
    {
      position: 1,
      pageNumber: 1,
      template: 'showcase-honey',
      section_title: 'مجموعة عسل نحلة الطبيعي',
      slots: [],
    },
    {
      position: 2,
      pageNumber: 2,
      template: 'grid3x3',
      section_title: 'مجموعة الفخار والخزف',
      slots: [],
    },
  ] as any;

  it('renders the page count badge with non-wrapping and non-shrinking styling', () => {
    render(<ListViewGrid pages={dummyPages} />);

    const badge = screen.getByText('2 صفحة');
    expect(badge).toBeDefined();
    expect(badge.className).toContain('shrink-0');
    expect(badge.className).toContain('whitespace-nowrap');
  });

  it('renders card footers with proper truncation and non-wrapping actions', () => {
    render(<ListViewGrid pages={dummyPages} />);

    const openLinks = screen.getAllByText('فتح في المجلة ←');
    expect(openLinks.length).toBe(2);
    openLinks.forEach((link) => {
      expect(link.className).toContain('shrink-0');
      expect(link.className).toContain('whitespace-nowrap');
    });
  });
});

