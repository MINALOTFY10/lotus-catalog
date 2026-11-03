-- Migration: Add multi-pricing options and tiers support to products and magazine slots
-- Date: 2026-11-03

alter table products add column if not exists price_text text;
alter table products add column if not exists price_tiers jsonb not null default '[]';

comment on column products.price_text is 'Formatted multi-tier price string (e.g. ٦٥٠ جرام | ٣٥٠ ج.مصري \n ١.٥ كيلو | ٥٦٠ ج.مصري)';
comment on column products.price_tiers is 'Structured array of price options [{label: string, price: number}]';

alter table page_slots add column if not exists price_tiers jsonb default '[]';
