import { describe, it, expect } from 'vitest';
import { safeJsonLd } from '@/lib/seo';
import { productUpdateSchema } from '@/features/admin/products/schemas';

describe('JSON-LD XSS Prevention', () => {
  it('escapes script tags to prevent HTML parser breakout', () => {
    const maliciousPayload = {
      name: '</script><script>alert("XSS")</script>',
      description: 'Test <tag> & "quote"',
    };

    const serialized = safeJsonLd(maliciousPayload);
    expect(serialized).not.toContain('</script>');
    expect(serialized).not.toContain('<script>');
    expect(serialized).toContain('\\u003c/script\\u003e');
    expect(serialized).toContain('\\u003cscript\\u003e');
  });

  it('can be parsed back to identical JSON data via JSON.parse', () => {
    const data = { title: 'فخار قنا المميز </script>' };
    const serialized = safeJsonLd(data);
    const parsed = JSON.parse(serialized);
    expect(parsed.title).toBe('فخار قنا المميز </script>');
  });
});

describe('Image URL Protocol Validation', () => {
  it('accepts valid relative and https image URLs', () => {
    const valid1 = productUpdateSchema.safeParse({
      name_ar: 'منتج',
      sale_price: 100,
      primary_image_url: '/brand/lotus_logo.png',
    });
    expect(valid1.success).toBe(true);

    const valid2 = productUpdateSchema.safeParse({
      name_ar: 'منتج',
      sale_price: 100,
      primary_image_url: 'https://ruvocydftemvsjjkdyqe.supabase.co/storage/v1/object/public/magazine/img.webp',
    });
    expect(valid2.success).toBe(true);
  });

  it('rejects javascript: and dangerous pseudoprotocols', () => {
    const malicious = productUpdateSchema.safeParse({
      name_ar: 'منتج',
      sale_price: 100,
      primary_image_url: 'javascript:alert(1)',
    });
    expect(malicious.success).toBe(false);
  });
});
