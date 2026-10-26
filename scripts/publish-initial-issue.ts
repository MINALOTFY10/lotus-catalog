import fs from 'fs';
import path from 'path';
import { generateAutoLayout } from '../src/features/magazine/services/autoLayout';
import { compileIssueSnapshot } from '../src/features/magazine/services/publishIssue';

async function main() {
  const rootDir = path.resolve(__dirname, '..');
  const seedPath = path.join(rootDir, 'data', 'products_seed.json');

  if (!fs.existsSync(seedPath)) {
    console.error('Seed file not found at:', seedPath);
    process.exit(1);
  }

  const products = JSON.parse(fs.readFileSync(seedPath, 'utf8'));
  console.log(`Loaded ${products.length} products for issue publishing`);

  const pages = generateAutoLayout(products, 9);
  console.log(`Generated ${pages.length} magazine pages with 3x3 layout`);

  const snapshot = compileIssueSnapshot(
    'lotus-pricelist-a4',
    'قائمة أسعار لوتس A4',
    pages,
    1
  );

  const outputPath = path.join(rootDir, 'data', 'live_issue.json');
  fs.writeFileSync(outputPath, JSON.stringify(snapshot, null, 2), 'utf8');
  console.log(`Successfully compiled and published live issue to ${outputPath} (${(fs.statSync(outputPath).size / 1024).toFixed(1)} KB)`);
}

main().catch(console.error);
