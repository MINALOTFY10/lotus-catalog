# Lotus Magazine Website Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a luxury Arabic-first digital magazine website replicating the 65-page Canva A4 catalog with RTL page flipping, standalone product/category pages, and a staff admin CMS for editing and publishing via Next.js 16 and Supabase.

**Architecture:** Next.js 16 App Router application rendering magazine pages as semantic HTML components in an A4 container query box (`aspect-ratio: 595/842`, unit `--u: calc(100cqw/595)`). Reads published issues from pre-compiled frozen JSON snapshots in Supabase Postgres for instant loading (<2s), while maintaining live indexed routes (`/products/[slug]`) and a single-role administrative portal (`/admin`) for product updates and 3×3 visual page composition.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS (RTL logical properties), Supabase (Postgres & Storage), StPageFlip (`react-pageflip`), Sharp, TanStack Table, Zod.

**Spec:** [`docs/superpowers/specs/2026-10-26-lotus-magazine-design.md`](file:///d:/Open%20Projects/lotus%20catolog/docs/superpowers/specs/2026-10-26-lotus-magazine-design.md)

---

## Global Constraints

- **Platform & Language:** Arabic-first (`<html lang="ar" dir="rtl">`) with Noto Sans Arabic typography; Latin digits used for prices (`405 L.E`).
- **Exact Canva Tokens:** Page background `#EFEFEF`, card surface `#FFFFFF`, text ink `#443000`, bronze accent `#B68763`.
- **Scaling Formula:** All magazine design elements scale strictly using `--u: calc(100cqw / 595)` to preserve A4 portrait proportions across all devices.
- **RTL Reading Order:** Arabic books open and flip right-to-left; slot 1 of the 3×3 grid is top-right.
- **Price Integrity:** Sale price in the master sheet (`سعر التكلفة` column with values matching Canva e.g. 405) is the public sale price; internal cost price is never displayed to public visitors.
- **Admin Access:** Single authenticated staff role with email/password; unauthenticated `/admin/*` requests are intercepted by `proxy.ts`.

---

## Review Focus

1. **RTL Flip Physics on Mobile:** StPageFlip orientation inversion must not reverse page order or break touch swipes on mobile touch screens.
2. **Text Overlaps in Product Cards:** Long product titles or descriptions must clamp gracefully with ellipsis without overflowing card borders or covering the price block.
3. **Container Query Fallback:** Browsers with varying container query support must maintain the 595:842 aspect ratio without layout collapse.
4. **Publish Snapshot Integrity:** Publishing must produce an immutable JSON snapshot in `issue_versions` that remains readable even if underlying product records are subsequently edited.
5. **Image Aspect Ratios:** Product photos with non-standard aspect ratios must use `object-cover` inside a fixed 4:3 container to prevent card distortion.

---

## Task Breakdown

### Task 1: Next.js 16 Scaffolding & Design System Tokens

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`, `src/app/layout.tsx`, `src/styles/magazine-tokens.css`, `src/styles/globals.css`
- Assets: `public/brand/*` (already extracted)
- Test: `tests/unit/tokens.test.ts`

**Interfaces:**
- Produces: CSS custom properties (`--mag-bg`, `--mag-card`, `--mag-ink`, `--mag-accent`, `--u`) and base RTL layout wrapper.

- [ ] **Step 1: Write failing test for CSS tokens and typography**
```typescript
// tests/unit/tokens.test.ts
import { describe, it, expect } from 'vitest';
import fs from 'fs';

describe('Design Tokens', () => {
  it('defines exact Canva tokens in magazine-tokens.css', () => {
    const css = fs.readFileSync('src/styles/magazine-tokens.css', 'utf8');
    expect(css).toContain('--mag-bg: #EFEFEF;');
    expect(css).toContain('--mag-card: #FFFFFF;');
    expect(css).toContain('--mag-ink: #443000;');
    expect(css).toContain('--mag-accent: #B68763;');
    expect(css).toContain('aspect-ratio: 595 / 842;');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**
Run: `npx vitest run tests/unit/tokens.test.ts`  
Expected: FAIL (file not found).

- [ ] **Step 3: Initialize Next.js 16 app and configure Tailwind with RTL tokens**
Create `src/styles/magazine-tokens.css` with exact Canva color variables and container query formula:
`--u: calc(100cqw / 595)`. Configure `src/app/layout.tsx` with `<html lang="ar" dir="rtl">` and Google Fonts `Noto Sans Arabic` + `Noto Sans`.

- [ ] **Step 4: Run test to verify it passes**
Run: `npx vitest run tests/unit/tokens.test.ts`  
Expected: PASS.

- [ ] **Step 5: Commit**
```bash
git add src/ tests/ package.json tsconfig.json next.config.ts
git commit -m "feat: scaffold Next.js 16 app with Canva design tokens and RTL configuration"
```

---

### Task 2: PageShell & 3×3 Grid Canvas Visual Parity Spike

**Files:**
- Create: `src/features/magazine/components/PageShell.tsx`, `src/features/magazine/components/Grid3x3Page.tsx`, `src/features/magazine/components/ProductCard.tsx`
- Test: `tests/unit/grid-layout.test.tsx`

**Interfaces:**
- Consumes: Design tokens from `magazine-tokens.css`.
- Produces: `PageShell` component accepting `sectionTitle`, `pageNumber`, and children; `Grid3x3Page` rendering 9 slots; `ProductCard` rendering photo, title, description, and price.

- [ ] **Step 1: Write failing test for PageShell and ProductCard rendering**
```typescript
// tests/unit/grid-layout.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ProductCard } from '@/features/magazine/components/ProductCard';

describe('ProductCard', () => {
  it('renders title, price with L.E suffix, and product link', () => {
    render(
      <ProductCard
        product={{
          id: '1',
          slug: 'honey-1-5kg',
          name_ar: 'عسل كيلو و نص',
          sale_price: 620,
          description_ar: 'عسل نقي فاخر',
          primary_image_url: '/test.jpg'
        }}
      />
    );
    expect(screen.getByText('عسل كيلو و نص')).toBeDefined();
    expect(screen.getByText('620 L.E')).toBeDefined();
    expect(screen.getByText('السعر')).toBeDefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**
Run: `npx vitest run tests/unit/grid-layout.test.tsx`  
Expected: FAIL.

- [ ] **Step 3: Implement PageShell, Grid3x3Page, and ProductCard**
- `PageShell`: Places Lotus Crest, Fund seal, top-right laurel, and vertical right side title with `writing-mode: vertical-rl; transform: rotate(180deg)`.
- `Grid3x3Page`: 3-column × 3-row grid scaled with `--u`. Slot 1 is positioned at top-right.
- `ProductCard`: Responsive image, bold Arabic title, 2-line description clamp, and bronze price row (`405 L.E`).

- [ ] **Step 4: Run test to verify it passes**
Run: `npx vitest run tests/unit/grid-layout.test.tsx`  
Expected: PASS.

- [ ] **Step 5: Commit**
```bash
git add src/features/magazine/ tests/
git commit -m "feat: implement PageShell and 3x3 Grid components with Canva geometry"
```

---

### Task 3: RTL Page Flip Reader Spike (`StPageFlip`)

**Files:**
- Create: `src/features/magazine/reader/FlipbookClient.tsx`, `src/features/magazine/reader/useFlipbook.ts`
- Test: `tests/unit/flipbook.test.tsx`

**Interfaces:**
- Consumes: Array of page render components.
- Produces: Interactive flipbook reader with desktop 2-page RTL spread, mobile single-page swipe, and page change callback.

- [ ] **Step 1: Write failing test for flipbook state and page numbering**
```typescript
// tests/unit/flipbook.test.tsx
import { describe, it, expect } from 'vitest';
import { calculateRtlPageIndex } from '@/features/magazine/reader/useFlipbook';

describe('useFlipbook RTL page mapping', () => {
  it('maps page index correctly for right-to-left spreads', () => {
    expect(calculateRtlPageIndex(1, 65)).toBe(1);
    expect(calculateRtlPageIndex(2, 65)).toBe(2);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**
Run: `npx vitest run tests/unit/flipbook.test.tsx`  
Expected: FAIL.

- [ ] **Step 3: Implement FlipbookClient with StPageFlip dynamic browser import**
Ensure `react-pageflip` (or underlying `page-flip` core) handles Arabic right-to-left layout without SSR errors (`dynamic(() => import(...), { ssr: false })`). Add window resize listeners to toggle between 2-page spread (desktop) and 1-page portrait (mobile).

- [ ] **Step 4: Run test to verify it passes**
Run: `npx vitest run tests/unit/flipbook.test.tsx`  
Expected: PASS.

- [ ] **Step 5: Commit**
```bash
git add src/features/magazine/reader/ tests/
git commit -m "feat: implement RTL flipbook client with desktop spread and mobile touch swipe"
```

---

### Task 4: Supabase Client, Schema Migrations & RLS Policies

**Files:**
- Create: `supabase/migrations/20261026000000_init_schema.sql`, `src/lib/supabase/client.ts`, `src/lib/supabase/server.ts`, `src/lib/supabase/admin.ts`, `src/types/database.ts`
- Test: `tests/unit/supabase-schema.test.ts`

**Interfaces:**
- Produces: Fully typed Supabase database clients (`createClient`, `createAdminClient`) and database TypeScript definitions.

- [ ] **Step 1: Write SQL migration file with core tables and RLS**
Implement tables: `categories`, `products`, `product_images`, `issues`, `sections`, `pages`, `page_slots`, `issue_versions`. Add public select policies for published products and live issue versions.

- [ ] **Step 2: Write test verifying schema types and export validity**
```typescript
// tests/unit/supabase-schema.test.ts
import { describe, it, expect } from 'vitest';
import fs from 'fs';

describe('Supabase Schema Migration', () => {
  it('contains products and issue_versions tables with RLS', () => {
    const sql = fs.readFileSync('supabase/migrations/20261026000000_init_schema.sql', 'utf8');
    expect(sql).toContain('create table products');
    expect(sql).toContain('create table issue_versions');
    expect(sql).toContain('alter table products enable row level security;');
  });
});
```

- [ ] **Step 3: Run test and generate TypeScript types**
Run: `npx vitest run tests/unit/supabase-schema.test.ts`  
Expected: PASS. Create typed client helpers in `src/lib/supabase/`.

- [ ] **Step 4: Commit**
```bash
git add supabase/ src/lib/supabase/ src/types/ tests/
git commit -m "feat: add Supabase schema migrations, RLS policies, and typed client"
```

---

### Task 5: Master Excel Importer & Image Extractor

**Files:**
- Create: `src/lib/importer/parseProductsExcel.ts`, `src/lib/importer/extractMedia.ts`, `scripts/seed-products.ts`
- Test: `tests/unit/excel-importer.test.ts`

**Interfaces:**
- Consumes: `products_sheet_master.xlsx` (453 products).
- Produces: Validated product records with cashier code, name_ar, category, sale_price, and mapped image paths.

- [ ] **Step 1: Write failing test for Excel parser**
```typescript
// tests/unit/excel-importer.test.ts
import { describe, it, expect } from 'vitest';
import { parseProductsExcel } from '@/lib/importer/parseProductsExcel';

describe('parseProductsExcel', () => {
  it('extracts all 453 products and correctly reads sale prices', () => {
    const products = parseProductsExcel('products_sheet_master.xlsx');
    expect(products.length).toBe(453);
    const item9 = products.find(p => p.cashier_code === 9);
    expect(item9?.sale_price).toBe(405);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**
Run: `npx vitest run tests/unit/excel-importer.test.ts`  
Expected: FAIL.

- [ ] **Step 3: Implement parseProductsExcel and extractMedia**
- Parse `sheet2.xml` (`Products` tab) resolving shared strings.
- Map Column A (`كود المنتج`) to `cashier_code`, Column B to `name_ar`, Column C to `category`, Column G/M to `sale_price`.
- Extract embedded `.jpg` images from `xl/media/` and generate 320/640/1280 WebP files.

- [ ] **Step 4: Run test to verify it passes**
Run: `npx vitest run tests/unit/excel-importer.test.ts`  
Expected: PASS.

- [ ] **Step 5: Commit**
```bash
git add src/lib/importer/ scripts/ tests/
git commit -m "feat: implement Excel catalog parser and WebP image extractor"
```

---

### Task 6: Initial Magazine Auto-Layout & Snapshot Publisher

**Files:**
- Create: `src/features/magazine/services/autoLayout.ts`, `src/features/magazine/services/publishIssue.ts`
- Test: `tests/unit/publish.test.ts`

**Interfaces:**
- Consumes: List of 453 products.
- Produces: 65 pages distributed into categories (Honey, Egyptian Heritage, Woodcraft) and generates frozen immutable snapshot in `issue_versions`.

- [ ] **Step 1: Write failing test for autoLayout and snapshot compiler**
```typescript
// tests/unit/publish.test.ts
import { describe, it, expect } from 'vitest';
import { generateAutoLayout } from '@/features/magazine/services/autoLayout';

describe('generateAutoLayout', () => {
  it('creates 9-card pages grouped by section title', () => {
    const mockProducts = Array.from({ length: 18 }, (_, i) => ({
      id: `${i}`,
      cashier_code: i + 1,
      name_ar: `منتج ${i + 1}`,
      sale_price: 100,
      category: 'مجموعة التراث المصري'
    }));
    const pages = generateAutoLayout(mockProducts);
    expect(pages.length).toBe(2);
    expect(pages[0].slots.length).toBe(9);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**
Run: `npx vitest run tests/unit/publish.test.ts`  
Expected: FAIL.

- [ ] **Step 3: Implement autoLayout and publish snapshot service**
Group products by category and distribute into 3×3 grid pages (slot 1 to 9). Serialize the complete resolved issue (pages, slots, titles, prices, image URLs) into JSON format for `issue_versions`.

- [ ] **Step 4: Run test to verify it passes**
Run: `npx vitest run tests/unit/publish.test.ts`  
Expected: PASS.

- [ ] **Step 5: Commit**
```bash
git add src/features/magazine/services/ tests/
git commit -m "feat: implement auto-layout generator and issue snapshot compilation"
```

---

### Task 7: Public Flipbook Reader Route (`/magazine`)

**Files:**
- Create: `src/app/(public)/magazine/page.tsx`, `src/features/magazine/components/TocDrawer.tsx`, `src/features/magazine/components/ListViewGrid.tsx`
- Test: `tests/unit/reader-route.test.tsx`

**Interfaces:**
- Consumes: `getLiveIssue()` service.
- Produces: `/magazine` route with URL page syncing (`?p=12`), Table of Contents drawer, and List View toggle.

- [ ] **Step 1: Write failing test for reader page data resolution**
```typescript
// tests/unit/reader-route.test.tsx
import { describe, it, expect } from 'vitest';
import { resolveCurrentPage } from '@/features/magazine/reader/useFlipbook';

describe('resolveCurrentPage', () => {
  it('defaults to page 1 and parses valid ?p query param', () => {
    expect(resolveCurrentPage('12', 65)).toBe(12);
    expect(resolveCurrentPage('999', 65)).toBe(65);
    expect(resolveCurrentPage(undefined, 65)).toBe(1);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**
Run: `npx vitest run tests/unit/reader-route.test.tsx`  
Expected: FAIL.

- [ ] **Step 3: Implement `/magazine` page and navigation accessories**
- Implement `src/app/(public)/magazine/page.tsx` using `use cache` tagged with `live-issue`.
- Build `TocDrawer` listing sections for direct page jumps.
- Build `ListViewGrid` providing an accessible non-3D card list.

- [ ] **Step 4: Run test to verify it passes**
Run: `npx vitest run tests/unit/reader-route.test.tsx`  
Expected: PASS.

- [ ] **Step 5: Commit**
```bash
git add src/app/(public)/magazine/ src/features/magazine/ tests/
git commit -m "feat: create public magazine reader page with TOC drawer and list view"
```

---

### Task 8: Public Catalog, Product Detail & Search (`/products`, `/products/[slug]`)

**Files:**
- Create: `src/app/(public)/products/page.tsx`, `src/app/(public)/products/[slug]/page.tsx`, `src/app/(public)/categories/[slug]/page.tsx`, `src/app/(public)/search/page.tsx`
- Test: `tests/unit/product-detail.test.tsx`

**Interfaces:**
- Produces: SEO-indexed product detail view with image gallery, price in EGP, description, and link back to magazine page.

- [ ] **Step 1: Write failing test for product detail formatting**
```typescript
// tests/unit/product-detail.test.tsx
import { describe, it, expect } from 'vitest';
import { formatMagazinePrice } from '@/lib/format/price';

describe('formatMagazinePrice', () => {
  it('formats numeric price to Latin digits with L.E suffix', () => {
    expect(formatMagazinePrice(405)).toBe('405 L.E');
    expect(formatMagazinePrice(null)).toBe('السعر عند الطلب');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**
Run: `npx vitest run tests/unit/product-detail.test.tsx`  
Expected: FAIL.

- [ ] **Step 3: Implement product routes, search, and JSON-LD schema**
Build `/products`, `/products/[slug]`, and `/search`. Include JSON-LD `Product` schema with name, priceCurrency (`EGP`), price, and image.

- [ ] **Step 4: Run test to verify it passes**
Run: `npx vitest run tests/unit/product-detail.test.tsx`  
Expected: PASS.

- [ ] **Step 5: Commit**
```bash
git add src/app/(public)/products/ src/lib/format/ tests/
git commit -m "feat: implement public product pages, search, and JSON-LD structured data"
```

---

### Task 9: Staff Admin Dashboard & Products Management

**Files:**
- Create: `src/app/admin/login/page.tsx`, `src/app/admin/(protected)/products/page.tsx`, `src/features/admin/products/ProductEditModal.tsx`, `src/features/admin/products/actions.ts`
- Test: `tests/unit/admin-products.test.ts`

**Interfaces:**
- Produces: Protected admin routes, product list with TanStack Table, search, and Server Action for updating prices and photos.

- [ ] **Step 1: Write failing test for product update action validation**
```typescript
// tests/unit/admin-products.test.ts
import { describe, it, expect } from 'vitest';
import { productUpdateSchema } from '@/features/admin/products/schemas';

describe('productUpdateSchema', () => {
  it('validates price and name correctly', () => {
    const valid = productUpdateSchema.safeParse({ name_ar: 'كليم يدوي', sale_price: 450 });
    expect(valid.success).toBe(true);
    const invalid = productUpdateSchema.safeParse({ name_ar: '', sale_price: -10 });
    expect(invalid.success).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**
Run: `npx vitest run tests/unit/admin-products.test.ts`  
Expected: FAIL.

- [ ] **Step 3: Implement login page, products table, and edit modal**
- Setup `/admin/login` with Supabase Auth.
- Setup `src/proxy.ts` (Next.js 16 middleware) redirecting unauthenticated staff.
- Build filterable product table with quick-edit modal for sale price and image upload.

- [ ] **Step 4: Run test to verify it passes**
Run: `npx vitest run tests/unit/admin-products.test.ts`  
Expected: PASS.

- [ ] **Step 5: Commit**
```bash
git add src/app/admin/ src/features/admin/products/ src/proxy.ts tests/
git commit -m "feat: implement staff authentication and products management screen"
```

---

### Task 10: Interactive 3×3 Page Composer (`/admin/composer`)

**Files:**
- Create: `src/app/admin/(protected)/composer/page.tsx`, `src/features/admin/composer/SlotPickerModal.tsx`, `src/features/admin/composer/actions.ts`
- Test: `tests/unit/composer.test.ts`

**Interfaces:**
- Consumes: Draft pages and slots.
- Produces: Interactive visual page composer allowing staff to assign products to slots 1–9, add pages, and override slot titles.

- [ ] **Step 1: Write failing test for slot assignment action**
```typescript
// tests/unit/composer.test.ts
import { describe, it, expect } from 'vitest';
import { slotAssignSchema } from '@/features/admin/composer/schemas';

describe('slotAssignSchema', () => {
  it('validates page_id and slot number between 1 and 9', () => {
    expect(slotAssignSchema.safeParse({ page_id: 'abc', slot: 1, product_id: 'p1' }).success).toBe(true);
    expect(slotAssignSchema.safeParse({ page_id: 'abc', slot: 10, product_id: 'p1' }).success).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**
Run: `npx vitest run tests/unit/composer.test.ts`  
Expected: FAIL.

- [ ] **Step 3: Implement Page Composer with live preview**
Render pages with the same `PageShell` component used in the public reader. Add slot click handler opening `SlotPickerModal` to search and pick any product. Add "Auto-Layout" button to re-run category distribution.

- [ ] **Step 4: Run test to verify it passes**
Run: `npx vitest run tests/unit/composer.test.ts`  
Expected: PASS.

- [ ] **Step 5: Commit**
```bash
git add src/app/admin/(protected)/composer/ src/features/admin/composer/ tests/
git commit -m "feat: implement interactive 3x3 page composer with slot picker"
```

---

### Task 11: Publishing Engine & Snapshot Rollback (`/admin/publish`)

**Files:**
- Create: `src/app/admin/(protected)/publish/page.tsx`, `src/features/admin/publish/actions.ts`
- Test: `tests/unit/publish-action.test.ts`

**Interfaces:**
- Produces: Live publishing Server Action, diff viewer between draft and live issue, and one-click rollback.

- [ ] **Step 1: Write failing test for publish Server Action**
```typescript
// tests/unit/publish-action.test.ts
import { describe, it, expect } from 'vitest';
import { computeIssueDiff } from '@/features/admin/publish/diff';

describe('computeIssueDiff', () => {
  it('identifies changed slot prices and new pages', () => {
    const draft = [{ position: 1, slots: [{ slot: 1, price: 500 }] }];
    const live = [{ position: 1, slots: [{ slot: 1, price: 400 }] }];
    const diff = computeIssueDiff(draft, live);
    expect(diff.changedSlotsCount).toBe(1);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**
Run: `npx vitest run tests/unit/publish-action.test.ts`  
Expected: FAIL.

- [ ] **Step 3: Implement Publish and Rollback Server Actions**
- On Publish: Resolve all page slots, save a new `issue_versions` record with `is_live = true`, and call `revalidateTag('live-issue')`.
- On Rollback: Flip `is_live = true` to an older version ID in one atomic transaction.

- [ ] **Step 4: Run test to verify it passes**
Run: `npx vitest run tests/unit/publish-action.test.ts`  
Expected: PASS.

- [ ] **Step 5: Commit**
```bash
git add src/app/admin/(protected)/publish/ src/features/admin/publish/ tests/
git commit -m "feat: implement publishing engine with diff viewer and version rollback"
```

---

### Task 12: Quality, Verification & Performance Gate

**Files:**
- Create: `tests/e2e/reader-flow.spec.ts`
- Verify: Lighthouse mobile performance, responsive breakpoints, keyboard navigation.

- [ ] **Step 1: Write Playwright E2E test for magazine browsing**
```typescript
// tests/e2e/reader-flow.spec.ts
import { test, expect } from '@playwright/test';

test('visitor can browse magazine and navigate to product page', async ({ page }) => {
  await page.goto('/magazine');
  await expect(page.locator('text=قائمة الأسعار')).toBeVisible();
  // Click first product card
  await page.locator('.product-card').first().click();
  await expect(page).toHaveURL(/\/products\/.+/);
  await expect(page.locator('text=L.E')).toBeVisible();
});
```

- [ ] **Step 2: Run E2E test**
Run: `npx playwright test tests/e2e/reader-flow.spec.ts`  
Expected: PASS.

- [ ] **Step 3: Verify visual match against `canva_renders/page_6.png`**
Verify side-by-side that fonts, colors, borders, logos, and badges match the Canva PDF render.

- [ ] **Step 4: Commit**
```bash
git add tests/e2e/
git commit -m "test: add Playwright E2E reader verification test"
```
