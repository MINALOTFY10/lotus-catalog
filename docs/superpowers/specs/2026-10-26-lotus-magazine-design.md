# Lotus Magazine Website - Technical Design Specification

**Date:** October 26, 2026  
**Status:** Approved by Stakeholder  
**Topic:** Arabic-First Digital Magazine & Admin CMS (Canva Replica)  
**Stack:** Next.js 16 (App Router), React 19, TypeScript, Supabase (Postgres & Storage), Tailwind CSS

---

## 1. Executive Summary & Goals

The Lotus Magazine platform transforms the static Canva 65-page A4 catalog into an interactive, high-performance digital publication. The platform serves two primary audiences:
1. **Public Visitors & Customers:** An Arabic-first, luxurious digital magazine reader featuring realistic right-to-left page-turning physics on desktop, responsive touch gestures on mobile, and standalone product/category pages optimized for Google search.
2. **Internal Staff:** A single-role administrative dashboard enabling non-technical staff to update product descriptions, prices, and imagery, visually arrange products across 3×3 magazine page slots, and publish frozen immutable snapshots to the live site.

### Key Success Criteria
- **1:1 Canva Replica:** Exact visual parity with the Canva A4 pricelist (`lotus Pricelist A4 .pdf`) across typography, colors, 3×3 card grid layout, side calligraphy titles, and vector logos.
- **Dynamic Content:** Staff can edit any product or page slot without touching code or developer workflows.
- **RTL Book Physics:** Natural right-to-left page opening and page-turning experience tailored for Arabic literature.
- **SEO & Sharability:** Every product possesses a permanent URL (`/products/[slug]`) with JSON-LD structured data and OpenGraph tags.
- **Instant Magazine Boot:** Magazine reader loads via a single pre-compiled JSON payload cached with `use cache`, achieving < 2s initial render.

---

## 2. Design Tokens & Geometry Calibration

Measurements extracted directly from `lotus Pricelist A4 .pdf` (595.5 × 842.25 pt, standard A4 ratio 1 : 1.414).

### 2.1 CSS Variables & Design Tokens

```css
/* styles/magazine-tokens.css */
:root {
  --mag-bg: #EFEFEF;          /* Canvas background: rgb(239, 239, 239) */
  --mag-card: #FFFFFF;        /* Card surface: crisp white */
  --mag-ink: #443000;         /* Heritage brown text: rgb(68, 48, 0) */
  --mag-accent: #B68763;      /* Bronze accent: rgb(182, 135, 99) */
  --mag-font-ar: var(--font-noto-arabic), system-ui, sans-serif;
  --mag-font-en: var(--font-noto-sans), system-ui, sans-serif;
  --mag-font-serif: var(--font-amiri), serif;
}

.magazine-page-container {
  aspect-ratio: 595 / 842;
  container-type: inline-size;
  background-color: var(--mag-bg);
  color: var(--mag-ink);
  font-family: var(--mag-font-ar);
  direction: rtl;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}
```

### 2.2 Responsive Unit Scaling Formula
To preserve exact proportions across mobile phones (360px) and large 4K monitors (2560px), all template dimensions are defined using container query units:
$$\text{--u} = \text{calc}(100\text{cqw} / 595)$$
Every coordinate, padding, and font size in the template is written as `calc(N * var(--u))`.

### 2.3 Layout Measurements
- **Page Dimensions:** 595.5 pt wide × 842.25 pt high.
- **Top Header Area (0 to 135 pt):**
  - **Gold Laurel Branch:** Placed at top-right corner (`x: 410pt` to `595.5pt`, `y: 0` to `65pt`).
  - **Centered Emblems:** Lotus Crest (`x: 164pt` to `275pt`, `y: 8pt` to `118pt`) and Rural & Environmental Fund Seal (`x: 320pt` to `428pt`, `y: 8pt` to `118pt`).
- **Right Sidebar (x: 433 pt to 595 pt):**
  - Reserved margin for vertical collection title: `writing-mode: vertical-rl; transform: rotate(180deg);`.
  - Font: `Noto Sans Arabic Bold`, size `28pt`, color `#443000`.
  - Fixed prefix: `"قائمة الأسعار "` followed by Section Name (e.g. `"مجموعة التراث المصري"`).
- **The 3×3 Grid Catalog Area (x: 28 pt to 433 pt, y: 143 pt to 820 pt):**
  - Total catalog grid width: `~405 pt`.
  - 3 columns of `~126 pt` each with `~11 pt` horizontal gutters.
  - 3 rows of `~228 pt` to `238 pt` with `~16 pt` vertical gutters.
  - Slot 1 is top-right; slots advance right-to-left, then top-to-bottom.

---

## 3. Brand Assets & Extracted Media

Extracted directly from the original Canva PDF into `public/brand/`:
1. `public/brand/lotus_logo.png`: Lotus "Heritage Meets Artistry / التراث يلتقي الفن" gold/teal emblem.
2. `public/brand/fund_seal.png`: Official Egyptian Eagle seal of the Rural and Environmental Industries Support Fund.
3. `public/brand/laurel_top_right.png`: Gold laurel decorative branch.

---

## 4. Database Architecture & Supabase Schema

### 4.1 Tables & Types

```sql
create type product_status as enum ('draft', 'published', 'hidden');

create table categories (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name_ar text not null,
  name_en text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table products (
  id uuid primary key default gen_random_uuid(),
  cashier_code int unique not null,
  slug text unique not null,
  name_ar text not null,
  name_en text,
  description_ar text,
  description_en text,
  category_id uuid references categories(id) on delete set null,
  supplier text,
  sale_price numeric(10,2) not null,
  cost_price numeric(10,2),
  variants jsonb not null default '[]',
  in_stock boolean not null default true,
  show_stock_badge boolean not null default false,
  status product_status not null default 'published',
  primary_image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  storage_path text not null,
  width int,
  height int,
  blur_data_url text,
  sort_order int not null default 0,
  is_primary boolean not null default false
);

create table issues (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null default 'lotus-pricelist-a4',
  title_ar text not null default 'قائمة أسعار لوتس',
  theme jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create table sections (
  id uuid primary key default gen_random_uuid(),
  issue_id uuid not null references issues(id) on delete cascade,
  title_ar text not null,
  sort_order int not null default 0
);

create table pages (
  id uuid primary key default gen_random_uuid(),
  issue_id uuid not null references issues(id) on delete cascade,
  section_id uuid references sections(id) on delete set null,
  position int not null,
  template text not null check (template in ('cover', 'grid3x3', 'grid2x2', 'single', 'info')),
  unique (issue_id, position) deferrable initially deferred
);

create table page_slots (
  id uuid primary key default gen_random_uuid(),
  page_id uuid not null references pages(id) on delete cascade,
  slot int not null check (slot between 1 and 9),
  product_id uuid references products(id) on delete set null,
  title_override text,
  description_override text,
  price_override numeric(10,2),
  image_override text,
  unique (page_id, slot)
);

create table issue_versions (
  id uuid primary key default gen_random_uuid(),
  issue_id uuid not null references issues(id) on delete cascade,
  version int not null,
  payload jsonb not null,
  is_live boolean not null default false,
  created_at timestamptz not null default now(),
  unique (issue_id, version)
);
create unique index idx_one_live_issue on issue_versions(issue_id) where is_live;
```

### 4.2 Security & Row Level Security (RLS)
- **Public (Anon):** Can select rows from `products` where `status = 'published'`, and `issue_versions` where `is_live = true`. Cost price (`cost_price`) is omitted from public queries.
- **Authenticated Staff:** Single role; all authenticated staff can read and modify `products`, `categories`, `pages`, `page_slots`, and execute the `publish_issue` Server Action.

---

## 5. Magazine Rendering & Flipbook Engine

### 5.1 Architecture & Page Components
- `PageShell`: Provides the container query A4 wrapper, background `#EFEFEF`, header logos, laurel branch, and vertical side title.
- `CoverPage`: Front cover spread.
- `Grid3x3Page`: 9-card catalog grid (slot 1 at top-right).
- `Grid2x2Page`: 4-card showcase grid.
- `SingleHeroPage`: Editorial spotlight page.
- `InfoStoryPage`: Heritage and artisan background story.
- `ProductCard`:
  - Top WebP image (4:3 ratio).
  - Bold Arabic title (`Noto Sans Arabic Bold`, 11–12.5pt).
  - Description clamped to 2–3 lines (`Noto Sans Arabic Regular`, 7.5–8.5pt).
  - Price block: `"السعر"` in bronze accent (`#B68763`) + price formatted as Latin numbers + `"L.E"` (e.g. `405 L.E`).
  - Seamless link to `/products/[slug]`.

### 5.2 Reader UX
- **Desktop (>= 768px):** Two-page spread opening from right-to-left. Pages curl and turn realistically via `StPageFlip` (client-only dynamic import).
- **Mobile (< 768px):** Single-page view with touch swipe and full container query auto-scaling.
- **Navigation Controls:**
  - Page counter: `صفحة 12 من 65`.
  - Table of Contents drawer: Direct navigation to sections (*NA7LA Honey, Egyptian Heritage, Woodcraft*).
  - List View Toggle: Accessible fallback switching from 3D flipbook to an infinite-scroll card grid.
  - URL Sync: `?p=12` reflects active page and supports deep linking.

---

## 6. Admin Dashboard Features

1. **Staff Login (`/admin/login`):** Email & password authentication via Supabase Auth.
2. **Products Catalog (`/admin/products`):**
   - Instant search across Arabic name, English name, and cashier code.
   - Filter by category, missing image, or missing price.
   - In-place modal to edit title, description, sale price, and upload new photos.
3. **Interactive 3×3 Page Composer (`/admin/composer`):**
   - Visual canvas displaying exact A4 container query pages.
   - Drag or click to assign products to slots 1–9.
   - Auto-Layout Button: Sequentially places category products 9-per-page.
   - Per-slot overrides (custom title, custom price, custom image).
4. **Publishing & Snapshot Rollback (`/admin/publish`):**
   - Diff preview showing changes between draft and live issue.
   - **Publish Live** Server Action: Resolves all slots, freezes issue JSON into `issue_versions`, flips `is_live = true`, and revalidates `updateTag('live-issue')`.
   - **Rollback:** Instant 1-click restore to any previous version.
5. **Data Import (`/admin/import`):**
   - Upload new Excel (`.xlsx`) or CSV files.
   - Dry-run validation displaying new, updated, and unchanged products.

---

## 7. Phased Implementation Roadmap

- **Phase 0: Spikes & Calibration (Days 1–2):**
  - Spike A: Test RTL `StPageFlip` / `react-pageflip` inside Next.js 16 (React 19).
  - Spike B: Calibrate CSS container query units against `canva_renders/page_6.png` to achieve 100% visual parity.
- **Phase 1: Project Scaffolding & Database (Days 3–5):**
  - Initialize Next.js 16 app with TypeScript, Tailwind CSS, and shadcn/ui.
  - Setup Supabase migrations, tables, and RLS policies.
  - Configure Supabase Auth and `proxy.ts` route protection.
- **Phase 2: Master Data Seed & Image Pipeline (Days 6–8):**
  - Build Excel parser for `products_sheet_master.xlsx` (453 products).
  - Extract embedded images from `xl/media/` and upload optimized WebP variants to Supabase Storage.
- **Phase 3: Public Magazine Reader (Days 9–14):**
  - Implement `PageShell`, `ProductCard`, and templates.
  - Implement desktop two-page RTL reader and mobile swipe viewer.
  - Auto-generate initial draft from sheet and publish Version 1.
- **Phase 4: Public Catalog & SEO (Days 15–18):**
  - Implement `/products`, `/products/[slug]`, `/categories/[slug]`, `/search`.
  - Add JSON-LD schema, sitemap, and OpenGraph share cards.
- **Phase 5: Staff Admin Dashboard (Days 19–27):**
  - Build `/admin/products`, `/admin/composer` with 3×3 drag-and-drop, and `/admin/publish`.
- **Phase 6: Quality, Accessibility & Launch (Days 28–30):**
  - Keyboard accessibility, Lighthouse 90+ optimization, load testing, and staff training guide.
