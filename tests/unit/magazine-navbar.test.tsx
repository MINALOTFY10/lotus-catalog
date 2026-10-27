import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { MagazineReaderView } from '@/features/magazine/reader/MagazineReaderView';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock('@/features/magazine/reader/FlipbookClient', () => ({
  FlipbookClient: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('@/features/magazine/components/HoneyShowcasePage', () => ({
  HoneyShowcasePage: () => <div />,
}));

vi.mock('@/features/magazine/components/BasketsShowcasePage', () => ({
  BasketsShowcasePage: () => <div />,
}));

vi.mock('@/features/magazine/components/OliveDatesPage', () => ({
  OliveDatesPage: () => <div />,
}));

vi.mock('@/features/magazine/components/Grid3x3Page', () => ({
  Grid3x3Page: () => <div />,
}));

vi.mock('@/features/magazine/components/TocDrawer', () => ({
  TocDrawer: () => null,
}));

vi.mock('@/features/magazine/components/ListViewGrid', () => ({
  ListViewGrid: () => null,
}));

vi.mock('@/features/magazine/components/MagazineSearchModal', () => ({
  MagazineSearchModal: () => null,
}));

describe('MagazineReaderView navbar', () => {
  it('shows the home-page logo and brand text in its navbar', () => {
    render(
      <MagazineReaderView
        initialPage={1}
        initialIssue={{
          issueSlug: 'issue-1',
          title_ar: 'Magazine',
          version: 1,
          publishedAt: '2026-10-27T00:00:00.000Z',
          totalPages: 0,
          pages: [],
        }}
      />
    );

    expect(screen.getByAltText('شعار لوتس')).toBeDefined();
    expect(screen.getByText('لوتس')).toBeDefined();
    expect(screen.getByText('كتالوج المنتجات اليدوية والتراثية')).toBeDefined();
  });
});
