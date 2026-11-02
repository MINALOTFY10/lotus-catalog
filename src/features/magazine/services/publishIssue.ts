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

export function safeWriteJsonFile(filePath: string, data: any): boolean {
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      try {
        fs.mkdirSync(dir, { recursive: true });
      } catch (mkdirErr: any) {
        if (mkdirErr.code === 'EROFS' || mkdirErr.message?.includes('read-only')) {
          return false;
        }
      }
    }
    const content = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
    fs.writeFileSync(filePath, content, 'utf8');
    return true;
  } catch (err: any) {
    if (err.code === 'EROFS' || err.message?.includes('read-only')) {
      console.warn(`[Serverless Read-Only] Skipping local file write to ${filePath}`);
      return false;
    }
    console.warn(`[safeWriteJsonFile] Failed to write to ${filePath}:`, err.message);
    return false;
  }
}

export async function syncLiveIssueToSupabase(snapshot: IssueSnapshot | object): Promise<boolean> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '');
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const bucket = process.env.SUPABASE_STORAGE_BUCKET || 'magazine';

  if (!supabaseUrl || !serviceKey || supabaseUrl.includes('placeholder')) {
    console.warn('[syncLiveIssueToSupabase] Supabase credentials missing or invalid:', {
      hasUrl: !!supabaseUrl,
      hasKey: !!serviceKey,
    });
    return false;
  }

  try {
    const remoteUrl = `${supabaseUrl}/storage/v1/object/${bucket}/data/live_issue.json`;
    const body = typeof snapshot === 'string' ? snapshot : JSON.stringify(snapshot, null, 2);
    const res = await fetch(remoteUrl, {
      method: 'PUT',
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        'Content-Type': 'application/json',
        'x-upsert': 'true',
      },
      body,
    });

    if (!res.ok) {
      console.warn('Failed to sync live_issue.json to Supabase:', res.status, await res.text());
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Error syncing live_issue.json to Supabase:', err);
    return false;
  }
}

export async function getLiveIssue(options?: { forceFresh?: boolean }): Promise<IssueSnapshot> {
  const isDev = process.env.NODE_ENV === 'development';
  const localSnapshotPath = path.resolve(process.cwd(), 'data', 'live_issue.json');

  // 1. In local development: prioritize local live_issue.json for instant reflection of edits
  if (isDev && fs.existsSync(localSnapshotPath)) {
    try {
      const data = fs.readFileSync(localSnapshotPath, 'utf8');
      return JSON.parse(data) as IssueSnapshot;
    } catch (err) {
      console.warn('Failed to parse local live_issue.json in dev mode, falling back:', err);
    }
  }

  // 2. Production or fallback: Fetch from Supabase Storage if configured
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const bucket = process.env.SUPABASE_STORAGE_BUCKET || 'magazine';

  if (supabaseUrl && !supabaseUrl.includes('placeholder')) {
    try {
      // Use timestamp query param to prevent Cloudflare/CDN edge cache from serving stale data
      const remoteUrl = `${supabaseUrl.replace(/\/$/, '')}/storage/v1/object/public/${bucket}/data/live_issue.json?t=${Date.now()}`;
      const fetchOptions: RequestInit = options?.forceFresh
        ? { cache: 'no-store' }
        : { next: { revalidate: 30, tags: ['live-issue'] } };

      const res = await fetch(remoteUrl, fetchOptions);
      if (res.ok) {
        return (await res.json()) as IssueSnapshot;
      }
    } catch (err) {
      console.warn('Failed to fetch live issue from Supabase Storage, falling back to local:', err);
    }
  }

  // 3. Fallback: Local snapshot if present
  if (fs.existsSync(localSnapshotPath)) {
    try {
      const data = fs.readFileSync(localSnapshotPath, 'utf8');
      return JSON.parse(data) as IssueSnapshot;
    } catch (err) {
      console.warn('Failed to parse local live_issue.json, falling back to seed generation:', err);
    }
  }

  // 4. Fallback: load seed products and compile default layout
  const seedPath = path.resolve(process.cwd(), 'data', 'products_seed.json');
  let products = [];
  if (fs.existsSync(seedPath)) {
    products = JSON.parse(fs.readFileSync(seedPath, 'utf8'));
  }

  const { generateAutoLayout } = await import('./autoLayout');
  const pages = generateAutoLayout(products);
  return compileIssueSnapshot('lotus-pricelist', 'مجلة لوتس', pages, 1);
}

