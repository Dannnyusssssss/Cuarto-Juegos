import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

/** Fuera de tokens.css no se escriben colores, fuentes ni medidas a mano (Parte C.1). */
const FILES = ['base.css', 'components.css', 'styleguide.css'];
/** Único valor literal permitido: el punto de corte de la res. C.7 (las media queries no aceptan var()). */
const ALLOWED_MEDIA = /@media \((?:max-width: 639\.98px|min-width: 640px)\)/g;

describe('CSS sin valores hardcodeados', () => {
  for (const file of FILES) {
    const css = readFileSync(new URL(`../src/styles/${file}`, import.meta.url), 'utf8')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(ALLOWED_MEDIA, '');

    it(`${file}: sin colores literales`, () => {
      expect(css).not.toMatch(/#[0-9a-f]{3,8}\b/i);
      expect(css).not.toMatch(/\b(?:rgba?|hsla?|oklch|lab)\(/i);
    });

    it(`${file}: sin medidas en px/rem literales`, () => {
      expect(css).not.toMatch(/\d(?:px|rem)\b/);
    });

    it(`${file}: fuentes solo por token`, () => {
      for (const [, value] of css.matchAll(/font-family:\s*([^;]+);/g)) {
        expect(value).toMatch(/^var\(--font-[\w-]+\)$/);
      }
    });
  }
});
