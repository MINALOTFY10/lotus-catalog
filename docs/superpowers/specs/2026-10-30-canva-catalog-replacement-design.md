# Canva Catalog Complete Replacement - Technical Design Specification

**Date:** October 30, 2026  
**Status:** Approved (Approach 1: Dynamic Template-Driven Canvas System)  
**Topic:** Complete Replacement of Magazine Content, Seed Data, and Layout with Canva Reference  
**Source of Truth:** Canva Catalog "Arabic Lotus Pricelist – A4" (`https://www.canva.com/design/DAHXb8asCEs/6uugW6v_sNAZrmIeFQ0w_A/edit`)  
**Direct Asset:** `canva_catalog_official.pdf` (Downloaded directly from Canva, 48 pages, 59MB)  
**Stack:** Next.js 16 (App Router), React 19, TypeScript, PyMuPDF, Tailwind CSS

---

## 1. Executive Summary & Intent

The existing magazine content, legacy product seed data, low-quality crops, and hardcoded legacy page layouts will be completely decommissioned and replaced with the authentic **48-page Canva catalog**. 

The goal is to produce a digital publication that looks and behaves like an exact, luxurious interactive digital edition of the Canva catalog, eliminating all placeholder texts (e.g. `منتج لوتس`, `AL 7 AN`, fake descriptions) and artificial 9-card padding.

### Core Deliverables
1. **Zero Legacy Data**: Purge all outdated seeded products, legacy cropped images, and artificial fallbacks.
2. **Authentic Product Extraction**: Extract all products from the official 48-page Canva catalog with 100% fidelity:
   - Exact Arabic product titles.
   - Exact Arabic product descriptions.
   - Exact original sequence and page assignment.
   - Exact prices in Egyptian Pounds (EGP).
   - High-resolution product images extracted directly from the PDF stream without downscaling artifacts.
3. **Template-Driven Layout Engine**:
   - **Page 1 (Showcase Honey)**: Na7la Honey brand showcase (clover honey jar, comb honey, nuts honey, wicker basket, brand identity badges).
   - **Page 2 (Showcase Food)**: Nakhla Palm Dates & Waj Extra Virgin Olive Oil showcase (with 500g/1kg and 500ml/750ml/1L size variant cards and badges).
   - **3×3 Grid Pages (9 Products)**: Pages 4–10, 15–20, 24–25, 27–34, 36–38, 40–42, 44–46.
   - **2×3 Grid Pages (6 Products)**: Pages 12, 14, 21, 22, 23, 26, 43.
   - **Custom Layout Pages**: Pages 3 (8 rugs), 11 (7 beaded bags), 13 (8 stained glass), 35 (8 amulets), 39 (8 coasters), 47 (4 inlaid trays/coasters in 2×2), and 48 (2 wooden bags + 1 wide hero card with variant thumbnails).
4. **Visual Parity**:
   - Authentic Canva top header banner (`/brand/canva_header_strip.webp`).
   - Symmetrical vertical Arabic calligraphy titles on the outer margins ("قائمة اسعار" + exact Section Title).
   - Authentic olive/gold wreath ornament at the outer margins.
   - Container-query responsive geometry with proportional scaling (`var(--u)`).
5. **Database & Seed Sync**:
   - `data/products_seed.json`: Clean, comprehensive seed of all ~350 authentic Canva products.
   - `data/live_issue.json`: Complete 48-page snapshot structure matching the reader.
   - Full compatibility with search modal, product pages (`/products/[slug]`), and table of contents.

---

## 2. Catalog Structure & Page Mapping (48 Pages)

| Page Range | Section Title (Arabic) | Category | Layout Type | Product Count |
|---|---|---|---|---|
| **Page 01** | مجموعة عسل نحلة الطبيعي | عسل نحل ومنتجات طبيعية | Showcase Honey (6 cards: 4 products + 2 badges) | 4 |
| **Page 02** | مجموعة المنتجات الغذائية الطبيعية | منتجات غذائية طبيعية | Showcase Food (4 cards + 1 banner: 2 products with variants) | 2 |
| **Page 03** | مجموعة السجاد والكليم | سجاد وكليم يدوي | Grid 8 (2×4 or 3-row custom) | 8 |
| **Page 04** | مجموعة المفروشات والوسائد | مفروشات ووسائد | Grid 3×3 | 9 |
| **Page 05** | مجموعة الخوص والنسيج الطبيعي | خوص طبيعي | Grid 3×3 | 9 |
| **Page 06** | مجموعة المفروشات والوسائد | مفروشات ووسائد | Grid 3×3 | 9 |
| **Page 07** | مجموعة الحقائب والخوص | حقائب وخوص يدوي | Grid 3×3 | 9 |
| **Pages 08–10** | مجموعة الملابس الــمــصــرية اليدوية | ملابس وقفاطين يدوية | Grid 3×3 (9 per page) | 27 |
| **Page 11** | مجموعة الاكسسورات المتنوعة اليدوية | إكسسوارات يدوية | Grid 7 | 7 |
| **Page 12** | مجموعة الاكسسورات المتنوعة اليدوية | إكسسوارات يدوية | Grid 2×3 (6 products) | 6 |
| **Page 13** | مجموعة الزجاج المعشق الــمــصــري اليدوي | زجاج معشق | Grid 8 | 8 |
| **Page 14** | مجموعة اللوحات الرملية اليدوية | لوحات رملية | Grid 2×3 (6 products) | 6 |
| **Pages 15–20** | مجموعة السيراميك والخزف | سيراميك وخزف يدوي | Grid 3×3 (9 per page) | 54 |
| **Page 21** | مجموعة السيراميك والخزف | سيراميك وخزف يدوي | Grid 2×3 (6 products) | 6 |
| **Pages 22–23** | مجموعة الصابون الــمــصــري اليدوي | صابون طبيعي | Grid 2×3 (6 per page) | 12 |
| **Pages 24–25** | مجموعة النحاس والمعادن التراثية | صواني ونحاسيات | Grid 3×3 (9 per page) | 18 |
| **Page 26** | مجموعة الملح الــمــصــري اليدوي | منتجات ملح سيوة | Grid 2×3 (6 products) | 6 |
| **Pages 27–34** | مجموعة الحلي والمجوهرات التراثية | مجوهرات وأحجار كريمة | Grid 3×3 (9 per page) | 72 |
| **Page 35** | مجموعة الحلي والمجوهرات التراثية | ميداليات وتمائم | Grid 8 | 8 |
| **Pages 36–38** | مجموعة التماثيل والتحف الفرعونية | تحف وتماثيل فرعونية | Grid 3×3 (9 per page) | 27 |
| **Page 39** | مجموعة الكونكريت والشموع | كوستر وكونكريت | Grid 8 | 8 |
| **Pages 40–42** | مجموعة الشموع المعطرة والماندالا | شموع وفواحات | Grid 3×3 (9 per page) | 27 |
| **Page 43** | مجموعة الديكور الــمــصــري اليدوي | ديكور منزلي | Grid 2×3 (6 products) | 6 |
| **Pages 44–46** | مجموعة الصدف والأخشاب التراثية | علب وأطباق خشبية | Grid 3×3 (9 per page) | 27 |
| **Page 47** | مجموعة الصدف الــمــصــرية اليدوية | صواني وكوسترات صدف | Grid 2×2 (4 products) | 4 |
| **Page 48** | مجموعة الحقائب الخشبية اليدوية | حقائب خشبية مطعمة | Hero Layout (2 top cards + 1 hero card) | 3 |
| **Total** | **48 Pages** | **Full Authentic Collection** | **Dynamic Multi-Grid** | **~350 Products** |

---

## 3. High-Resolution Asset Extraction Pipeline

### 3.1 Extraction Script (`scripts/extract_canva_catalog.py`)
Using `fitz` (PyMuPDF):
1. Parse `canva_catalog_official.pdf` page by page.
2. For each page:
   - Extract raw text blocks with normalized NFKC Arabic text.
   - Detect card boundaries using image locations and coordinate clustering.
   - Extract embedded product images directly via `doc.extract_image(xref)` or high-res bounding crops at 300 DPI (`fitz.Matrix(2.5, 2.5)`), guaranteeing clean, uncompressed, un-blurred photography.
   - Save images to `public/magazine/canva_products/p{page}_s{slot}.webp` (optimized WebP quality 92).
   - Match exact Arabic product title, description, and price.
   - Generate SEO-friendly slug: `prod-p{page}-s{slot}-{arabic-title-snippet}`.
3. Output unified dataset:
   - `data/canva_catalog_extracted.json`: Raw verified extracted pages and slots.
   - `data/products_seed.json`: Flat product database seed with complete metadata.
   - `data/live_issue.json`: 48-page magazine layout snapshot.

---

## 4. Layout Architecture & Component Hierarchy

### 4.1 Page Shell (`PageShell.tsx`)
- Container aspect ratio: `595 / 842` (A4 format).
- Responsive unit: `var(--u)` = `calc(100cqw / 595)`.
- Background: `#FFFFFF` / luxury warm ivory canvas.
- Top Header Strip: Exact Canva header with Lotus logo, "التراث يلتقي الفن", and Fund Seal.
- Vertical Left Title: Exact section title in Arabic calligraphy rotated vertically with "قائمة اسعار" inner title.
- Leaf wreath ornament on outer margins.

### 4.2 Dynamic Layout Components
1. **`ShowcaseHoneyPage.tsx` (Page 1)**:
   - 2-column layout matching Canva Page 1.
   - Right: Na7la logo badge, comb honey card, wicker basket card.
   - Left: Clover honey card (with multiple size options), nuts honey card, ecological apiary certificate badge.
2. **`ShowcaseFoodPage.tsx` (Page 2)**:
   - 2-column layout matching Canva Page 2.
   - Right: Nakhla dates identity badge, date box card with 500g/1kg variants.
   - Left: Waj olive oil bottle card with 500ml/750ml/1L variants, Waj tree logo badge.
   - Bottom: Full-width rural & environmental support fund certificate card.
3. **`Grid3x3Page.tsx`**:
   - 3 columns × 3 rows for all 9-product pages.
   - Strict proportional card sizing, balanced image-to-text ratios.
4. **`Grid2x3Page.tsx`**:
   - 2 columns × 3 rows for all 6-product pages (pages 12, 14, 21, 22, 23, 26, 43).
   - Wider aspect ratio cards tailored for spacious presentation of soaps, salt lamps, accessories, and art plates.
5. **`GridCustomPage.tsx`**:
   - Flexible responsive grid supporting:
     - 8 cards (Page 3, 13, 35, 39).
     - 7 cards (Page 11).
     - 4 cards (Page 47, 2×2 grid).
     - 3 cards (Page 48, 2 top cards + 1 wide hero card with variant thumbnails).
6. **`ProductCard.tsx`**:
   - Modern luxury aesthetic: subtle gradient surface, warm border `#E8DEC8`, smooth hover lift.
   - Clean Arabic typography with line clamping, responsive font scaling.
   - Authentic price tag with EGP currency formatting (`ج.مصري` or `L.E`).

---

## 5. Flipbook & Magazine Reader View Integration

In `src/features/magazine/reader/MagazineReaderView.tsx`:
- Render the 48 pages dynamically according to their `template` property in `initialIssue.pages`:
  - `template: 'showcase-honey'` -> `<ShowcaseHoneyPage />`
  - `template: 'showcase-food'` -> `<ShowcaseFoodPage />`
  - `template: 'grid3x3'` -> `<Grid3x3Page />`
  - `template: 'grid2x3'` -> `<Grid2x3Page />`
  - `template: 'grid2x2'` -> `<GridCustomPage columns={2} rows={2} />`
  - `template: 'hero-split'` -> `<HeroFeaturedPage />` (Page 48)
  - `template: 'grid-custom'` -> `<GridCustomPage count={slotCount} />`
- TOC Drawer (`TocDrawer.tsx`): Updated to list all 48 authentic sections.
- Search Modal (`MagazineSearchModal.tsx`): Searches across all ~350 authentic Canva products and navigates directly to the target page with highlighted card animation.
- List View Mode (`ListViewGrid.tsx`): Updated to display thumbnails of all 48 pages.

---

## 6. Verification and Validation Plan

1. **Extraction Validation**:
   - Verify all 48 pages have slots extracted.
   - Verify zero occurrences of placeholder titles (`منتج لوتس`, `dummy`, `test`).
   - Verify every product has a valid, non-empty Arabic title and price.
   - Verify every image exists on disk in `public/magazine/canva_products/` and renders cleanly.
2. **Visual Consistency Inspection**:
   - Compare all 48 rendered pages side-by-side with `canva_catalog_official.pdf`.
   - Verify RTL reading direction, text alignment, fonts, and borders.
3. **End-to-End Application Testing**:
   - Flipbook page turning from Page 1 to Page 48.
   - In-magazine search for products (e.g. "عسل نحلة", "كليم", "قفطان", "صابون سيوة", "حقيبة يد خشبية").
   - TOC navigation jumping to various pages.
   - Product click navigation to `/products/[slug]`.
   - Build test: `npm run build` to verify TypeScript, Next.js routing, and SSR compilation.
