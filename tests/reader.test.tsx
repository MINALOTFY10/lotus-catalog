import { describe, it, expect } from 'vitest';
import issueData from '../data/live_issue.json';

describe('Reader View Integration', () => {
  it('contains sequential pages in the live issue', () => {
    expect(issueData.pages.length).toBe(65);
    issueData.pages.forEach((p, idx) => {
      expect(p.position).toBe(idx + 1);
      expect(p.pageNumber).toBe(idx + 1);
      expect(p.section_title).toBeDefined();
    });
  });

  it('all slot products have valid names and links', () => {
    for (const page of issueData.pages) {
      for (const slot of page.slots) {
        if (slot.product) {
          expect(slot.product.name_ar).toBeTruthy();
          expect(slot.product.slug).toMatch(/^prod-/);
          expect(slot.product.primary_image_url).toMatch(/^(\/magazine\/canva_products\/|\/uploads\/)/);
        }
      }
    }
  });
});
