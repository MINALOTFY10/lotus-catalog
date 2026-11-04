import { describe, it, expect } from 'vitest';
import nextConfig from '../../next.config';

describe('HTTP Security Headers', () => {
  it('defines essential security headers for all routes', async () => {
    if (!nextConfig.headers) throw new Error('Headers function missing in next.config.ts');
    const headerConfigs = await nextConfig.headers();
    const globalConfig = headerConfigs.find((h: any) => h.source === '/:path*');
    expect(globalConfig).toBeDefined();

    const headersMap = new Map(globalConfig?.headers.map((h: any) => [h.key, h.value]));
    expect(headersMap.get('X-Frame-Options')).toBe('SAMEORIGIN');
    expect(headersMap.get('X-Content-Type-Options')).toBe('nosniff');
    expect(headersMap.get('Referrer-Policy')).toBe('strict-origin-when-cross-origin');
    expect(headersMap.get('Strict-Transport-Security')).toContain('max-age=');
    expect(headersMap.get('Permissions-Policy')).toBeDefined();
  });
});
