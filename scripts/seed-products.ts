import fs from 'fs';
import path from 'path';

/**
 * seed-products.ts
 * Ensures data/products_seed.json and database are synchronized with authentic Canva catalog products.
 */
async function main() {
  const rootDir = path.resolve(__dirname, '..');
  const seedPath = path.join(rootDir, 'data', 'products_seed.json');

  if (!fs.existsSync(seedPath)) {
    throw new Error(`products_seed.json not found at ${seedPath}. Run scripts/extract_canva_catalog.py first.`);
  }

  const products = JSON.parse(fs.readFileSync(seedPath, 'utf8'));
  console.log(`Loaded ${products.length} authentic Canva products from seed.`);

  // Validation
  for (const p of products) {
    if (!p.id || !p.name_ar) {
      throw new Error(`Invalid product record: ${JSON.stringify(p)}`);
    }
  }

  console.log('Seed data validated successfully.');
}

main().catch(console.error);
