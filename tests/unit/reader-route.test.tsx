import { describe, it, expect } from 'vitest';
import { getLiveIssue } from '@/features/magazine/services/publishIssue';
import { resolveCurrentPage } from '@/features/magazine/reader/useFlipbook';

describe('Reader Page Data Resolution', () => {
  it('loads live issue snapshot with sequential pages and resolves requested page', async () => {
    const liveIssue = await getLiveIssue();
    expect(liveIssue.totalPages).toBe(65);
    // Page 1 is NA7LA honey with 4 featured items
    expect(liveIssue.pages[0].slots.length).toBe(4);
    // First grid page (page 6) is full 9-card page
    expect(liveIssue.pages[5].slots.length).toBe(9);

    const validPage = resolveCurrentPage('5', liveIssue.totalPages);
    expect(validPage).toBe(5);

    const clampedPage = resolveCurrentPage('999', liveIssue.totalPages);
    expect(clampedPage).toBe(liveIssue.totalPages);
  });
});
