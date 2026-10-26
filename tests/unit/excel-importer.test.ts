import { describe, it, expect } from 'vitest';
import path from 'path';
import { parseProductsExcel } from '@/lib/importer/parseProductsExcel';

describe('parseProductsExcel', () => {
  it('extracts all 453 products and correctly maps cashier_code and sale_price', () => {
    const excelPath = path.resolve(__dirname, '../../products_sheet_master.xlsx');
    const products = parseProductsExcel(excelPath);

    expect(products.length).toBe(453);

    // Verify Product 1: عسل كيلو و نص
    const p1 = products.find((p) => p.cashier_code === 1);
    expect(p1).toBeDefined();
    expect(p1?.name_ar).toBe('عسل كيلو و نص');
    expect(p1?.sale_price).toBe(620);

    // Verify Product 2: عسل 650 جرام ساده
    const p2 = products.find((p) => p.cashier_code === 2);
    expect(p2).toBeDefined();
    expect(p2?.name_ar).toBe('عسل 650 جرام ساده');
    expect(p2?.sale_price).toBe(385);

    // Verify Product 9: طقم اكسسوار بحلق
    const p9 = products.find((p) => p.cashier_code === 9);
    expect(p9).toBeDefined();
    expect(p9?.name_ar).toBe('طقم اكسسوار بحلق');
    expect(p9?.sale_price).toBe(405);
  });
});
