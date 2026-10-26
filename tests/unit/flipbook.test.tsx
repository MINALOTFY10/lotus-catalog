import { describe, it, expect } from 'vitest';
import { calculateRtlPageIndex, resolveCurrentPage } from '@/features/magazine/reader/useFlipbook';

describe('useFlipbook RTL page mapping', () => {
  it('maps page index correctly for right-to-left spreads', () => {
    // In a 65 page catalog:
    // Page 1 is the front cover on the right side
    expect(calculateRtlPageIndex(1, 65)).toBe(1);
    expect(calculateRtlPageIndex(2, 65)).toBe(2);
    expect(calculateRtlPageIndex(65, 65)).toBe(65);
  });

  it('safely resolves query string page parameter within 1..totalPages range', () => {
    expect(resolveCurrentPage('12', 65)).toBe(12);
    expect(resolveCurrentPage('0', 65)).toBe(1);
    expect(resolveCurrentPage('100', 65)).toBe(65);
    expect(resolveCurrentPage('-5', 65)).toBe(1);
    expect(resolveCurrentPage(undefined, 65)).toBe(1);
    expect(resolveCurrentPage('invalid', 65)).toBe(1);
  });
});
