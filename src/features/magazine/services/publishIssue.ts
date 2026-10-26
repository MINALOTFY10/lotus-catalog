import fs from 'fs';
import path from 'path';
import { MagazinePageData } from '../types';

export interface IssueSnapshot {
  issueSlug: string;
  title_ar: string;
  version: number;
  publishedAt: string;
  totalPages: number;
  pages: MagazinePageData[];
  theme?: Record<string, string>;
}

export function compileIssueSnapshot(
  slug: string,
  titleAr: string,
  pages: MagazinePageData[],
  version: number = 1
): IssueSnapshot {
  return {
    issueSlug: slug,
    title_ar: titleAr,
    version,
    publishedAt: new Date().toISOString(),
    totalPages: pages.length,
    pages,
  };
}

export async function getLiveIssue(): Promise<IssueSnapshot> {
  const localSnapshotPath = path.resolve(process.cwd(), 'data', 'live_issue.json');

  if (fs.existsSync(localSnapshotPath)) {
    try {
      const data = fs.readFileSync(localSnapshotPath, 'utf8');
      return JSON.parse(data) as IssueSnapshot;
    } catch (err) {
      console.warn('Failed to parse local live_issue.json, falling back to seed generation:', err);
    }
  }

  // Fallback: load seed products and compile default layout
  const seedPath = path.resolve(process.cwd(), 'data', 'products_seed.json');
  let products = [];
  if (fs.existsSync(seedPath)) {
    products = JSON.parse(fs.readFileSync(seedPath, 'utf8'));
  }

  const { generateAutoLayout } = await import('./autoLayout');
  const pages = generateAutoLayout(products);
  return compileIssueSnapshot('lotus-pricelist', 'مجلة لوتس', pages, 1);
}
