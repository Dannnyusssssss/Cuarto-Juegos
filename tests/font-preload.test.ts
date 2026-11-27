import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { findFontAsset, fontPreloadTag, rootPrefix } from '../build/font-preload.ts';

const FONT = 'assets/inter-latin-wght-normal-Dx4kXJAl.woff2';

describe('precarga de Inter', () => {
  it('encuentra solo el subconjunto latin (no latin-ext ni otros alfabetos)', () => {
    const files = [
      'assets/main-abc.css',
      'assets/inter-latin-ext-wght-normal-DO1Apj_S.woff2',
      'assets/inter-cyrillic-wght-normal-DqGufNeO.woff2',
      FONT,
    ];
    expect(findFontAsset(files)).toBe(FONT);
  });

  it('falla cerrado si no hay ninguno o hay más de uno', () => {
    expect(() => findFontAsset(['assets/main.css'])).toThrow(/hay 0/);
    expect(() => findFontAsset([FONT, 'assets/inter-latin-wght-normal-OTRO.woff2'])).toThrow(
      /hay 2/,
    );
  });

  it('ruta relativa a cada página', () => {
    expect(rootPrefix('/index.html')).toBe('./');
    expect(rootPrefix('/404.html')).toBe('./');
    expect(rootPrefix('/privacidad/index.html')).toBe('../');
    expect(rootPrefix('/juegos/dead-shift/index.html')).toBe('../../');
    expect(fontPreloadTag(FONT, '/juegos/dead-shift/index.html')).toBe(
      `<link rel="preload" href="../../${FONT}" as="font" type="font/woff2" crossorigin>`,
    );
  });

  it('el plugin solo corre en build y antes de productionSecurity (rutas absolutas en la 404)', () => {
    const config = readFileSync(new URL('../vite.config.ts', import.meta.url), 'utf8');
    expect(config.indexOf('fontPreload()')).toBeGreaterThan(-1);
    expect(config.indexOf('fontPreload()')).toBeLessThan(config.indexOf('productionSecurity()'));
  });
});
