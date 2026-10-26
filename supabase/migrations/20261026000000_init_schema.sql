-- Lotus Magazine Initial Schema Migration
-- Created: 2026-10-26

-- 1. Custom Types
create type product_status as enum ('draft', 'published', 'hidden');

-- 2. Categories
create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name_ar text not null,
  name_en text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- 3. Products
create table if not exists products (
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

-- 4. Product Images
create table if not exists product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  storage_path text not null,
  width int,
  height int,
  blur_data_url text,
  sort_order int not null default 0,
  is_primary boolean not null default false
);

-- 5. Magazine Issues
create table if not exists issues (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null default 'lotus-pricelist-a4',
  title_ar text not null default 'قائمة أسعار لوتس',
  theme jsonb not null default '{}',
  created_at timestamptz not null default now()
);

-- 6. Sections (Vertical Side Title in Magazine)
create table if not exists sections (
  id uuid primary key default gen_random_uuid(),
  issue_id uuid not null references issues(id) on delete cascade,
  title_ar text not null,
  sort_order int not null default 0
);

-- 7. Pages
create table if not exists pages (
  id uuid primary key default gen_random_uuid(),
  issue_id uuid not null references issues(id) on delete cascade,
  section_id uuid references sections(id) on delete set null,
  position int not null,
  template text not null check (template in ('cover', 'grid3x3', 'grid2x2', 'single', 'info')),
  unique (issue_id, position) deferrable initially deferred
);

-- 8. Page Slots (1 to 9 slots per page)
create table if not exists page_slots (
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

-- 9. Issue Versions (Frozen JSON Payloads for Instant Reader Loading)
create table if not exists issue_versions (
  id uuid primary key default gen_random_uuid(),
  issue_id uuid not null references issues(id) on delete cascade,
  version int not null,
  payload jsonb not null,
  is_live boolean not null default false,
  created_at timestamptz not null default now(),
  unique (issue_id, version)
);
create unique index if not exists idx_one_live_issue on issue_versions(issue_id) where is_live;

-- 10. Enable Row Level Security (RLS)
alter table categories enable row level security;
alter table products enable row level security;
alter table product_images enable row level security;
alter table issues enable row level security;
alter table sections enable row level security;
alter table pages enable row level security;
alter table page_slots enable row level security;
alter table issue_versions enable row level security;

-- Public (Anonymous) Read Policies
create policy public_read_categories on categories for select to anon, authenticated using (true);
create policy public_read_products on products for select to anon, authenticated using (status = 'published');
create policy public_read_product_images on product_images for select to anon, authenticated using (true);
create policy public_read_issues on issues for select to anon, authenticated using (true);
create policy public_read_sections on sections for select to anon, authenticated using (true);
create policy public_read_pages on pages for select to anon, authenticated using (true);
create policy public_read_page_slots on page_slots for select to anon, authenticated using (true);
create policy public_read_live_versions on issue_versions for select to anon, authenticated using (is_live = true);

-- Staff (Authenticated) Full Access Policies
create policy staff_all_categories on categories for all to authenticated using (true) with check (true);
create policy staff_all_products on products for all to authenticated using (true) with check (true);
create policy staff_all_product_images on product_images for all to authenticated using (true) with check (true);
create policy staff_all_issues on issues for all to authenticated using (true) with check (true);
create policy staff_all_sections on sections for all to authenticated using (true) with check (true);
create policy staff_all_pages on pages for all to authenticated using (true) with check (true);
create policy staff_all_page_slots on page_slots for all to authenticated using (true) with check (true);
create policy staff_all_issue_versions on issue_versions for all to authenticated using (true) with check (true);
