import fs from 'fs';
import path from 'path';
import { parseProductsExcel } from '../src/lib/importer/parseProductsExcel';
import { extractMediaFromExcel } from '../src/lib/importer/extractMedia';

async function main() {
  const rootDir = path.resolve(__dirname, '..');
  const excelPath = path.join(rootDir, 'products_sheet_master.xlsx');
  const uploadDir = path.join(rootDir, 'public', 'uploads', 'products');
  const dataDir = path.join(rootDir, 'data');

  fs.mkdirSync(dataDir, { recursive: true });
  fs.mkdirSync(uploadDir, { recursive: true });

  console.log('1. Extracting embedded images from Excel...');
  const images = extractMediaFromExcel(excelPath, uploadDir);
  console.log(`Extracted ${images.length} images to ${uploadDir}`);

  console.log('2. Parsing product records...');
  const products = parseProductsExcel(excelPath);
  console.log(`Parsed ${products.length} products`);

  // Map each product to existing image if available
  const mappedProducts = products.map((p, idx) => {
    // If an extracted image exists matching the product index
    const fallbackImage = images[idx % images.length];
    return {
      ...p,
      primary_image_url: `/uploads/products/${fallbackImage || 'image1.jpg'}`,
    };
  });

  const seedOutputPath = path.join(dataDir, 'products_seed.json');
  fs.writeFileSync(seedOutputPath, JSON.stringify(mappedProducts, null, 2), 'utf8');
  console.log(`Saved seed data to ${seedOutputPath} (${(fs.statSync(seedOutputPath).size / 1024).toFixed(1)} KB)`);
}

main().catch(console.error);
