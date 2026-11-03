import { describe, it, expect } from 'vitest';
import {
  getBaseUrl,
  generateOrganizationSchema,
  generateWebSiteSchema,
  generateBreadcrumbSchema,
  SEO_KEYWORDS,
} from '@/lib/seo';
import { generateProductJsonLd } from '@/features/products/services/publicProducts';
import robots from '@/app/robots';
import manifest from '@/app/manifest';

describe('SEO Utilities and Structured Data', () => {
  it('should return a valid base URL without trailing slash', () => {
    const url = getBaseUrl();
    expect(url).toMatch(/^https?:\/\//);
    expect(url.endsWith('/')).toBe(false);
  });

  it('includes critical search keywords for Google indexing', () => {
    expect(SEO_KEYWORDS).toContain('كتالوج لوتس');
    expect(SEO_KEYWORDS).toContain('كاتلوج لوتس');
    expect(SEO_KEYWORDS).toContain('صندوق دعم الصناعات');
    expect(SEO_KEYWORDS).toContain('كتالوج صندوق دعم الصناعات');
    expect(SEO_KEYWORDS).toContain('كاتلوج صندوق دعم الصناعات');
    expect(SEO_KEYWORDS).toContain('صندوق دعم الصناعات الريفية والبيئية');
    expect(SEO_KEYWORDS).toContain('مجلة لوتس');
  });

  it('generates valid Organization schema for صندوق دعم الصناعات', () => {
    const schema = generateOrganizationSchema('https://lotus-catalog.vercel.app');
    expect(schema['@context']).toBe('https://schema.org');
    expect(schema.name).toBe('صندوق دعم الصناعات الريفية والبيئية');
    expect(schema.alternateName).toContain('صندوق دعم الصناعات');
    expect(schema.logo.url).toBe('https://lotus-catalog.vercel.app/brand/fund_seal.png');
    expect(schema.sameAs.length).toBeGreaterThan(0);
  });

  it('generates valid WebSite schema with SearchAction', () => {
    const schema = generateWebSiteSchema('https://lotus-catalog.vercel.app');
    expect(schema['@context']).toBe('https://schema.org');
    expect(schema['@type']).toBe('WebSite');
    expect(schema.name).toBe('كتالوج لوتس');
    expect(schema.alternateName).toContain('كاتلوج لوتس');
    expect(schema.alternateName).toContain('كتالوج صندوق دعم الصناعات');
    expect(schema.potentialAction['@type']).toBe('SearchAction');
  });

  it('generates valid BreadcrumbList schema', () => {
    const breadcrumbs = generateBreadcrumbSchema(
      [
        { name: 'الرئيسية', url: '/' },
        { name: 'دليل المنتجات', url: '/products' },
      ],
      'https://lotus-catalog.vercel.app'
    );
    expect(breadcrumbs['@type']).toBe('BreadcrumbList');
    expect(breadcrumbs.itemListElement).toHaveLength(2);
    expect(breadcrumbs.itemListElement[0].name).toBe('الرئيسية');
    expect(breadcrumbs.itemListElement[0].item).toBe('https://lotus-catalog.vercel.app/');
    expect(breadcrumbs.itemListElement[1].name).toBe('دليل المنتجات');
    expect(breadcrumbs.itemListElement[1].item).toBe('https://lotus-catalog.vercel.app/products');
  });

  it('generates product JSON-LD with brand and government organization seller', () => {
    const product = {
      id: 'test-1',
      slug: 'honey-1',
      cashier_code: 101,
      name_ar: 'عسل نحل جبلي',
      sale_price: 150,
      in_stock: true,
      primary_image_url: '/brand/lotus_logo.png',
      category: 'عسل - الصندوق',
    };
    const jsonLd = generateProductJsonLd(product, 'https://lotus-catalog.vercel.app');
    expect(jsonLd['@type']).toBe('Product');
    expect(jsonLd.name).toBe('عسل نحل جبلي');
    expect(jsonLd.offers.price).toBe('150');
    expect(jsonLd.offers.seller?.name).toBe('صندوق دعم الصناعات الريفية والبيئية');
    expect(jsonLd.brand?.name).toContain('صندوق دعم الصناعات');
  });

  it('robots.txt points to correct sitemap location', () => {
    const r = robots();
    expect(r.sitemap).toContain('/sitemap.xml');
    expect(r.rules).toBeDefined();
  });

  it('manifest returns valid metadata with Arabic branding', () => {
    const m = manifest();
    expect(m.name).toContain('كتالوج لوتس');
    expect(m.name).toContain('صندوق دعم الصناعات');
    expect(m.start_url).toBe('/');
  });
});
