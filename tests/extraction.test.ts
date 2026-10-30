import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Canva Catalog Extraction', () => {
  it('should have exactly 48 pages in live_issue.json', () => {
    const issuePath = path.resolve(process.cwd(), 'data/live_issue.json');
    expect(fs.existsSync(issuePath)).toBe(true);
    const issue = JSON.parse(fs.readFileSync(issuePath, 'utf-8'));
    expect(issue.pages.length).toBe(48);
    expect(issue.totalPages).toBe(48);
  });

  it('should have authentic products without placeholder text in products_seed.json', () => {
    const seedPath = path.resolve(process.cwd(), 'data/products_seed.json');
    expect(fs.existsSync(seedPath)).toBe(true);
    const products = JSON.parse(fs.readFileSync(seedPath, 'utf-8'));
    expect(products.length).toBeGreaterThan(250);

    for (const p of products) {
      expect(p.name_ar).not.toMatch(/^منتج لوتس/);
      expect(p.name_ar).not.toMatch(/^منتج تراثي/);
      expect(p.name_ar.length).toBeGreaterThan(2);
      expect(p.primary_image_url).toMatch(/^\/magazine\/canva_products\/p\d+_s\d+\.webp$/);
      const imgPath = path.resolve(process.cwd(), 'public', p.primary_image_url.slice(1));
      expect(fs.existsSync(imgPath), `Missing image: ${imgPath}`).toBe(true);
    }
  });
});
