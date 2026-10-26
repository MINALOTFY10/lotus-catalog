import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { ProductData } from '@/features/magazine/types';

export interface ParsedProduct extends ProductData {
  cost_price?: number | null;
  original_qty?: number;
  stock_status?: string;
  drive_image_url?: string;
}

export function parseProductsExcel(excelPath: string): ParsedProduct[] {
  const extractedDir = path.resolve(path.dirname(excelPath), 'sheet_extracted');
  const sharedStringsPath = path.join(extractedDir, 'xl', 'sharedStrings.xml');
  const sheet2Path = path.join(extractedDir, 'xl', 'worksheets', 'sheet2.xml');

  // If not yet extracted, extract XML files using tar
  if (!fs.existsSync(sharedStringsPath) || !fs.existsSync(sheet2Path)) {
    fs.mkdirSync(extractedDir, { recursive: true });
    try {
      execSync(`tar -xf "${excelPath}" -C "${extractedDir}" xl/sharedStrings.xml xl/worksheets/sheet2.xml`, {
        stdio: 'ignore',
      });
    } catch {
      // Ignore partial tar exit code on streamed archives
    }
  }

  // 1. Read shared strings
  const strings: string[] = [];
  if (fs.existsSync(sharedStringsPath)) {
    const ssXml = fs.readFileSync(sharedStringsPath, 'utf8');
    const siRegex = /<si>(.*?)<\/si>/gs;
    let match;
    while ((match = siRegex.exec(ssXml)) !== null) {
      const tMatch = match[1].match(/<t[^>]*>(.*?)<\/t>/gs);
      strings.push(tMatch ? tMatch.map((t) => t.replace(/<[^>]+>/g, '')).join('') : '');
    }
  }

  // 2. Read Products worksheet (sheet2.xml)
  if (!fs.existsSync(sheet2Path)) {
    throw new Error(`Worksheet sheet2.xml not found at ${sheet2Path}`);
  }

  const sheetXml = fs.readFileSync(sheet2Path, 'utf8');
  const rowRegex = /<row r="(\d+)"[^>]*>(.*?)<\/row>/gs;
  const products: ParsedProduct[] = [];

  let rowMatch;
  while ((rowMatch = rowRegex.exec(sheetXml)) !== null) {
    const rNum = parseInt(rowMatch[1], 10);
    // Data rows start at row 4
    if (rNum >= 4) {
      const rowXml = rowMatch[2];
      const cRegex = /<c r="([A-Z]+)\d+"(?: s="\d+")?(?: t="([a-z]+)")?[^>]*>(?:<f[^>]*>[^<]*<\/f>)?(?:<v>([^<]+)<\/v>)?(?:<is><t>([^<]+)<\/t><\/is>)?<\/c>/gs;
      
      const cols: Record<string, string> = {};
      let cMatch;
      while ((cMatch = cRegex.exec(rowXml)) !== null) {
        const col = cMatch[1];
        const type = cMatch[2];
        const vVal = cMatch[3];
        const isVal = cMatch[4];
        let val = '';
        if (isVal !== undefined) {
          val = isVal;
        } else if (type === 's' && vVal !== undefined) {
          val = strings[parseInt(vVal, 10)] || '';
        } else if (vVal !== undefined) {
          val = vVal;
        }
        cols[col] = val;
      }

      const codeRaw = cols['A'];
      if (!codeRaw) continue;

      const cashier_code = Math.floor(parseFloat(codeRaw));
      if (isNaN(cashier_code) || cashier_code < 1) continue;

      const name_ar = cols['B'] || `منتج ${cashier_code}`;
      const category = cols['C'] || null;
      const original_qty = cols['D'] ? parseInt(cols['D'], 10) : undefined;
      const cost_price = cols['G'] ? parseFloat(cols['G']) : null;
      const markup = cols['H'] ? parseFloat(cols['H']) : 0;
      const sale_i = cols['I'] ? parseFloat(cols['I']) : null;
      const sale_m = cols['M'] ? parseFloat(cols['M']) : null;
      const stock_status = cols['N'] || 'متاح';
      const drive_image_url = cols['O'] || undefined;

      // Determine public sale price:
      // Priority 1: Discounted sale price (Col M)
      // Priority 2: Explicit sale price (Col I)
      // Priority 3: Calculated formula = CEILING(cost * (1 + markup), 5)
      let sale_price = 0;
      if (sale_m !== null && !isNaN(sale_m)) {
        sale_price = sale_m;
      } else if (sale_i !== null && !isNaN(sale_i)) {
        sale_price = sale_i;
      } else if (cost_price !== null && !isNaN(cost_price)) {
        const calculated = Math.ceil((cost_price * (1 + markup)) / 5) * 5;
        sale_price = calculated;
      }

      const cleanSlug = `prod-${cashier_code}-${name_ar
        .trim()
        .toLowerCase()
        .replace(/[^\u0621-\u064A\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .slice(0, 40)}`;

      products.push({
        id: `prod-${cashier_code}`,
        cashier_code,
        slug: cleanSlug,
        name_ar,
        category,
        cost_price,
        sale_price,
        original_qty,
        stock_status,
        drive_image_url,
        in_stock: stock_status !== 'نفد',
        primary_image_url: `/uploads/products/image${cashier_code}.jpg`,
      });
    }
  }

  return products;
}
