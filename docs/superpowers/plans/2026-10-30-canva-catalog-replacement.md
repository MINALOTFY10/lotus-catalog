# Canva Catalog Complete Replacement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Completely replace all existing magazine content, seed data, and page layouts with the authentic 48-page Canva catalog reference (`Arabic lotus Pricelist – A4`).

**Architecture:** An extraction pipeline (`scripts/extract_canva_catalog.py`) parses `canva_catalog_official.pdf` to extract ~350 products with exact Arabic titles, descriptions, EGP prices, and high-res photography into `public/magazine/canva_products/`. The extracted data seeds `data/products_seed.json` and `data/live_issue.json`. A dynamic layout engine (`ShowcaseHoneyPage`, `ShowcaseFoodPage`, `Grid3x3Page`, `Grid2x3Page`, `GridCustomPage`, `ProductCard`) renders all 48 pages with authentic Canva visual geometry and typography inside the interactive flipbook reader.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, PyMuPDF (fitz), Vitest, Tailwind CSS

**Spec:** [docs/superpowers/specs/2026-10-30-canva-catalog-replacement-design.md](file:///d:/Open%20Projects/lotus%20catolog/docs/superpowers/specs/2026-10-30-canva-catalog-replacement-design.md)

## Global Constraints
- Total pages: Exactly 48 pages matching Canva.
- Zero placeholder titles (`منتج لوتس`, `AL 7 AN`, `dummy`) or synthetic descriptions.
- Preserve exact original Arabic titles, punctuation, and authentic descriptions.
- Use original high-resolution photography extracted from the PDF streams without downsampling.
- Maintain full functionality of the flipbook reader, TOC drawer, search modal, and `/products/[slug]` routing.

## Review Focus
1. **Arabic Presentation Forms Normalization**: The PDF encodes Arabic in presentation glyphs; the extractor must normalize to standard Unicode (`NFKC`) so search, typography, and sorting function correctly.
2. **Multi-Layout Flexibility**: Pages have differing slot counts (4, 2, 8, 9, 7, 6, 4, 3); the layout engine must render each page in its exact layout rather than forcing a 3×3 grid.
3. **High-Resolution Photography**: Extracted images must be sharp (at least 600–1200px width/height) and served in modern WebP format.
4. **Price Parsing Fidelity**: Prices with size/weight variants (e.g. `٥٠٠ جرام | 280 ج.مصري`, `1 كيلو | 400 ج.مصري` on Page 2) must be preserved accurately in product data and card display.
5. **No Broken Links or Missing Assets**: Every product card across all 48 pages must reference a verified image file on disk.

---

### Task 1: High-Resolution Extraction Pipeline & Data Purge

**Files:**
- Create: `scripts/extract_canva_catalog.py`
- Create: `tests/extraction.test.ts`
- Output: `data/canva_catalog_extracted.json`, `data/products_seed.json`, `data/live_issue.json`, `public/magazine/canva_products/*.webp`

**Interfaces:**
- Consumes: `canva_catalog_official.pdf` (59MB PDF from Canva)
- Produces:
  - `data/products_seed.json`: `Array<ProductData>` (~350 items)
  - `data/live_issue.json`: `IssueSnapshot` (48 pages)
  - `public/magazine/canva_products/`: Extracted high-res WebP images

- [ ] **Step 1: Write the failing test for extraction validation**

In `tests/extraction.test.ts`:
```typescript
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/extraction.test.ts`
Expected: FAIL (files missing or old format)

- [ ] **Step 3: Implement `scripts/extract_canva_catalog.py`**

The script:
1. Opens `canva_catalog_official.pdf` using PyMuPDF (`fitz`).
2. Iterates across all 48 pages.
3. Renders and extracts high-resolution images for each card bounding box at 2.5× scale (150–200 DPI) or extracts native XObject images, writing to `public/magazine/canva_products/p{page}_s{slot}.webp`.
4. Extracts Arabic text, normalizes Unicode (`unicodedata.normalize('NFKC', text)`), resolves exact titles, descriptions, and prices.
5. Emits `data/canva_catalog_extracted.json`, `data/products_seed.json`, and `data/live_issue.json`.

- [ ] **Step 4: Execute extraction script and run test to verify it passes**

Run: `python scripts/extract_canva_catalog.py`
Run: `npx vitest run tests/extraction.test.ts`
Expected: PASS with 48 pages and ~350 valid products.

- [ ] **Step 5: Commit**

```bash
git add scripts/extract_canva_catalog.py tests/extraction.test.ts data/products_seed.json data/live_issue.json public/magazine/canva_products/
git commit -m "feat: extract 48 authentic pages and products from Canva catalog"
```

---

### Task 2: Update Magazine Types & Database Seeding

**Files:**
- Modify: `src/features/magazine/types.ts`
- Modify: `scripts/seed-products.ts`
- Test: `tests/catalog-types.test.ts`

**Interfaces:**
- Consumes: `data/products_seed.json`, `data/live_issue.json`
- Produces: Updated `MagazinePageData['template']` types and synchronized product seeds

- [ ] **Step 1: Write the failing test for types and template definitions**

In `tests/catalog-types.test.ts`:
```typescript
import { describe, it, expect } from 'vitest';
import { IssueSnapshot, MagazinePageData } from '../src/features/magazine/types';
import issueData from '../data/live_issue.json';

describe('Magazine Issue Types & Templates', () => {
  it('validates all page templates match supported types', () => {
    const issue = issueData as IssueSnapshot;
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/catalog-types.test.ts`
Expected: FAIL (template types mismatch)

- [ ] **Step 3: Update `src/features/magazine/types.ts` and `scripts/seed-products.ts`**

Update `MagazinePageData['template']` union to include:
`'showcase-honey' | 'showcase-food' | 'grid3x3' | 'grid2x3' | 'grid2x2' | 'grid-custom' | 'hero-split' | 'cover' | 'single' | 'info'`.
Update `scripts/seed-products.ts` to load from the new `products_seed.json`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/catalog-types.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/features/magazine/types.ts scripts/seed-products.ts tests/catalog-types.test.ts
git commit -m "feat: update magazine page template types and seed script"
```

---

### Task 3: Rebuild Layout Components for Canva Geometry

**Files:**
- Create: `src/features/magazine/components/ShowcaseHoneyPage.tsx`
- Create: `src/features/magazine/components/ShowcaseFoodPage.tsx`
- Create: `src/features/magazine/components/Grid2x3Page.tsx`
- Create: `src/features/magazine/components/GridCustomPage.tsx`
- Modify: `src/features/magazine/components/Grid3x3Page.tsx`
- Modify: `src/features/magazine/components/ProductCard.tsx`
- Modify: `src/features/magazine/components/PageShell.tsx`
- Test: `tests/components.test.tsx`

**Interfaces:**
- Consumes: `MagazinePageData`, `PageSlotData`, `ProductData`
- Produces: Interactive Arabic-first React components matching Canva geometry

- [ ] **Step 1: Write component render tests**

In `tests/components.test.tsx`:
```typescript
import { describe, it, expect } from 'vitest';
import React from 'react';
import { render } from '@testing-library/react';
import { Grid3x3Page } from '../src/features/magazine/components/Grid3x3Page';
import { Grid2x3Page } from '../src/features/magazine/components/Grid2x3Page';
import { ShowcaseHoneyPage } from '../src/features/magazine/components/ShowcaseHoneyPage';
import { ShowcaseFoodPage } from '../src/features/magazine/components/ShowcaseFoodPage';
import issueData from '../data/live_issue.json';

describe('Magazine Page Components', () => {
  it('renders ShowcaseHoneyPage for page 1', () => {
    const page1 = issueData.pages[0];
    const { getByText } = render(<ShowcaseHoneyPage slots={page1.slots} pageNumber={1} />);
    expect(getByText(/عسل نحلة/)).toBeDefined();
  });

  it('renders ShowcaseFoodPage for page 2', () => {
    const page2 = issueData.pages[1];
    const { getByText } = render(<ShowcaseFoodPage slots={page2.slots} pageNumber={2} />);
    expect(getByText(/تمور نخلة/)).toBeDefined();
  });

  it('renders Grid2x3Page with 6 slots', () => {
    const page12 = issueData.pages[11];
    const { container } = render(
      <Grid2x3Page pageNumber={12} sectionTitle={page12.sectionTitle} slots={page12.slots} />
    );
    expect(container.querySelectorAll('.product-card').length).toBe(6);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/components.test.tsx`
Expected: FAIL (missing components)

- [ ] **Step 3: Implement the layout components**

1. `ShowcaseHoneyPage.tsx`: Page 1 Canva layout (right: Na7la logo, comb honey, basket; left: clover honey with size options, nuts honey, eco certificate badge).
2. `ShowcaseFoodPage.tsx`: Page 2 Canva layout (right: Nakhla logo, dates box with variants; left: olive oil with variants, Waj tree logo; bottom: rural fund certificate).
3. `Grid2x3Page.tsx`: 2-column × 3-row layout for 6-card pages.
4. `GridCustomPage.tsx`: Multi-layout grid for 8-card, 7-card, 4-card (2×2), and 3-card (hero split) pages.
5. Refactor `ProductCard.tsx`: Ensure clean display for single price, multi-variant price (`٥٠٠ جرام / ١ كيلو`), line-clamped Arabic descriptions, and luxury styling.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/components.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/features/magazine/components/ tests/components.test.tsx
git commit -m "feat: rebuild layout components for Canva page layouts (Showcase, Grid3x3, Grid2x3, Custom)"
```

---

### Task 4: Flipbook Reader, TOC, and Search Modal Integration

**Files:**
- Modify: `src/features/magazine/reader/MagazineReaderView.tsx`
- Modify: `src/features/magazine/components/TocDrawer.tsx`
- Modify: `src/features/magazine/components/ListViewGrid.tsx`
- Modify: `src/features/magazine/components/MagazineSearchModal.tsx`
- Test: `tests/reader.test.tsx`

**Interfaces:**
- Consumes: `IssueSnapshot` with all 48 pages
- Produces: Integrated reader view with full navigation and search

- [ ] **Step 1: Write reader integration tests**

In `tests/reader.test.tsx`:
```typescript
import { describe, it, expect } from 'vitest';
import issueData from '../data/live_issue.json';

describe('Reader View Integration', () => {
  it('contains 48 sequential pages in the live issue', () => {
    expect(issueData.pages.length).toBe(48);
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
        }
      }
    }
  });
});
```

- [ ] **Step 2: Run test to verify it passes/fails**

Run: `npx vitest run tests/reader.test.tsx`

- [ ] **Step 3: Update `MagazineReaderView.tsx` and related components**

1. In `MagazineReaderView.tsx`: Replace hardcoded page position conditions with dynamic template matching:
   - `showcase-honey` -> `<ShowcaseHoneyPage />`
   - `showcase-food` -> `<ShowcaseFoodPage />`
   - `grid3x3` -> `<Grid3x3Page />`
   - `grid2x3` -> `<Grid2x3Page />`
   - `grid2x2` / `grid-custom` / `hero-split` -> `<GridCustomPage />`
2. Update `TocDrawer.tsx` to group or list sections across all 48 pages.
3. Update `ListViewGrid.tsx` to handle 48 pages cleanly.
4. Ensure `MagazineSearchModal.tsx` searches across all newly seeded Canva products.

- [ ] **Step 4: Run tests and Next.js dev check**

Run: `npx vitest run`
Expected: ALL PASS

- [ ] **Step 5: Commit**

```bash
git add src/features/magazine/ tests/reader.test.tsx
git commit -m "feat: integrate dynamic 48-page reader, updated TOC, and search"
```

---

### Task 5: End-to-End Visual Audit & Build Verification

**Files:**
- Output: Browser recording & verification artifacts

- [ ] **Step 1: Run production build**

Run: `npm run build`
Expected: Success with 0 TypeScript or SSR errors.

- [ ] **Step 2: Run side-by-side visual audit script**

Create `scripts/verify_visual_parity.py` that verifies:
1. Every page 1 to 48 renders with valid image assets.
2. No 404 images on any slot.
3. Every slot has valid Arabic text and price.

Run: `python scripts/verify_visual_parity.py`
Expected: Output showing 48/48 pages passed with 100% asset validity.

- [ ] **Step 3: Test reader with Playwright in browser**

Using Playwright subagent / tools:
1. Navigate to `http://localhost:3000/`.
2. Flip through pages (Page 1, 2, 3, 12, 21, 47, 48).
3. Test search modal for "عسل", "كليم", "قفطان", "صابون", "صدف".
4. Capture screenshots for visual proof.

- [ ] **Step 4: Final commit**

```bash
git add .
git commit -m "feat: complete Canva catalog replacement with 48 authentic pages"
```
