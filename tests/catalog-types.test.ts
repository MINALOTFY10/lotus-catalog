import { describe, it, expect } from 'vitest';
import { IssueSnapshot, MagazinePageData } from '../src/features/magazine/types';
import issueData from '../data/live_issue.json';

describe('Magazine Issue Types & Templates', () => {
  it('validates all page templates match supported types', () => {
    const issue = issueData as unknown as IssueSnapshot;
    const allowedTemplates: MagazinePageData['template'][] = [
      'showcase-honey',
      'showcase-food',
      'grid3x3',
      'grid2x3',
      'grid2x2',
      'grid-custom',
      'hero-split',
    ];

    for (const page of issue.pages) {
      expect(allowedTemplates).toContain(page.template);
      expect(page.slots.length).toBeGreaterThan(0);
    }
  });
});
