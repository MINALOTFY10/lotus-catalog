import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { PublicHeader } from '@/components/layout/PublicHeader';

vi.mock('next/navigation', () => ({
  usePathname: () => '/',
  useRouter: () => ({ push: vi.fn() }),
}));

describe('PublicHeader', () => {
  it('omits the admin link, catalog search link, and search inputs', () => {
    render(<PublicHeader />);

    expect(screen.queryByText('لوحة التحكم')).toBeNull();
    expect(screen.queryByText('بحث في الكتالوج')).toBeNull();
    expect(screen.queryByPlaceholderText('ابحث بالاسم أو الكود...')).toBeNull();
    expect(screen.getByText('المجلة التفاعلية')).toBeDefined();
    expect(screen.getByText('دليل المنتجات')).toBeDefined();

    fireEvent.click(screen.getByRole('button', { name: 'القائمة' }));

    expect(screen.queryByText('لوحة التحكم')).toBeNull();
    expect(screen.queryByText('بحث في الكتالوج')).toBeNull();
    expect(screen.queryByPlaceholderText('ابحث بالاسم أو الكود...')).toBeNull();
  });
});
