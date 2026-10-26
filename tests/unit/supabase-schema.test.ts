import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Supabase Schema Migration', () => {
  it('contains products and issue_versions tables with RLS', () => {
    const sqlPath = path.resolve(__dirname, '../../supabase/migrations/20261026000000_init_schema.sql');
    expect(fs.existsSync(sqlPath)).toBe(true);

    const sql = fs.readFileSync(sqlPath, 'utf8');
    expect(sql).toContain('create table if not exists products');
    expect(sql).toContain('create table if not exists categories');
    expect(sql).toContain('create table if not exists issues');
    expect(sql).toContain('create table if not exists pages');
    expect(sql).toContain('create table if not exists page_slots');
    expect(sql).toContain('create table if not exists issue_versions');
    expect(sql).toContain('alter table products enable row level security;');
    expect(sql).toContain('create policy public_read_products on products');
    expect(sql).toContain('create policy public_read_live_versions on issue_versions');
  });
});
