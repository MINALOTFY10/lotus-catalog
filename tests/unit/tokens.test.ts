import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Design Tokens', () => {
  it('defines exact Canva tokens in magazine-tokens.css', () => {
    const cssPath = path.resolve(__dirname, '../../src/styles/magazine-tokens.css');
    expect(fs.existsSync(cssPath)).toBe(true);
    
    const css = fs.readFileSync(cssPath, 'utf8');
    expect(css).toContain('--mag-bg: #EFEFEF;');
    expect(css).toContain('--mag-card: #FFFFFF;');
    expect(css).toContain('--mag-ink: #443000;');
    expect(css).toContain('--mag-accent: #B68763;');
    expect(css).toContain('aspect-ratio: 595 / 842;');
    expect(css).toContain('--u: calc(100cqw / 595);');
  });
});
