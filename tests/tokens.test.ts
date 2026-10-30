import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { readTokens, resolveToken } from '../build/tokens.ts';

const design = readFileSync(new URL('../DESIGN.md', import.meta.url), 'utf8');
const tokens = readTokens();
const norm = (v: string) => v.replace(/\s+/g, ' ').trim().toLowerCase();

describe('tokens.css refleja DESIGN.md', () => {
  it('colores de la tabla', () => {
    const rows = [
      ...design.matchAll(/^\|[^|\n]+\|\s*`(#[0-9a-f]{6})`\s*\|\s*`(--color-[\w-]+)`/gim),
    ];
    expect(rows.length).toBe(18);
    for (const [, hex, name] of rows) {
      expect(tokens.get(name!), name).toBe(hex!.toLowerCase());
    }
  });

  it('superficies', () => {
    const rows = [...design.matchAll(/^\|\s*\d\s*\|\s*([\w ]+?)\s*\|\s*`(#[0-9a-f]{6})`/gim)];
    expect(rows.length).toBe(4);
    for (const [, label, hex] of rows) {
      const name = `--surface-${label!.toLowerCase().replace(/\s+/g, '-')}`;
      expect(tokens.get(name), name).toBe(hex!.toLowerCase());
    }
  });

  it('escala tipográfica (tamaño y line-height)', () => {
    const rows = [
      ...design.matchAll(
        /^\|\s*([\w-]+)\s*\|[^|]*\|[^|]*\|\s*(\d+px)\s*\|\s*([\d.]+)\s*\|\s*(-?[\d.]+)px\s*\|\s*`--text-/gim,
      ),
    ];
    expect(rows.length).toBe(7);
    for (const [, role, size, leading, tracking] of rows) {
      expect(tokens.get(`--text-${role}`), role).toBe(size);
      expect(Number(tokens.get(`--leading-${role}`)), role).toBe(Number(leading));
      // La tabla de DESIGN.md da el tracking en px; la prosa confirma que son em.
      expect(tokens.get(`--tracking-${role}`), role).toBe(`${Number(tracking)}em`);
    }
  });

  it('tracking en em: -0.025em titulares, 0.05em cuerpo, 0.2em etiquetas', () => {
    for (const role of ['display', 'heading', 'heading-sm']) {
      expect(tokens.get(`--tracking-${role}`)).toBe('-0.025em');
    }
    for (const role of ['body', 'body-sm', 'subheading']) {
      expect(tokens.get(`--tracking-${role}`)).toBe('0.05em');
    }
    expect(tokens.get('--tracking-caption')).toBe('0.2em');
    expect(tokens.get('--tracking-label')).toBe('0.2em');
  });

  it('pesos tipográficos', () => {
    expect(tokens.get('--font-weight-regular')).toBe('400');
    expect(tokens.get('--font-weight-medium')).toBe('500');
    expect(tokens.get('--font-weight-semibold')).toBe('600');
    expect(tokens.get('--font-weight-black')).toBe('900');
  });

  it('espaciado', () => {
    const rows = [...design.matchAll(/^\|\s*\d+\s*\|\s*(\d+px)\s*\|\s*`(--spacing-\d+)`/gim)];
    expect(rows.length).toBe(11);
    for (const [, value, name] of rows) expect(tokens.get(name!), name).toBe(value);
  });

  it('radios: un solo valor de 10px', () => {
    const rows = [
      ...design.matchAll(/^\|\s*(nav|cards|badges|inputs|buttons)\s*\|\s*(\d+px)\s*\|/gim),
    ];
    expect(rows.length).toBe(5);
    for (const [, element, value] of rows) {
      expect(tokens.get(`--radius-${element}`), element).toBe(value);
    }
    const radii = [...tokens].filter(([n]) => n.startsWith('--radius-')).map(([, v]) => v);
    expect(new Set(radii)).toEqual(new Set(['10px']));
  });

  it('sombras', () => {
    const rows = [
      ...design.matchAll(/^\|\s*\w+\s*\|\s*`(rgba\([^`]+)`\s*\|\s*`(--shadow-\w+)`/gim),
    ];
    expect(rows.length).toBe(2);
    for (const [, value, name] of rows) expect(norm(tokens.get(name!)!), name).toBe(norm(value!));
  });

  it('layout', () => {
    const layout: Record<string, string> = {
      'Page max-width': '--page-max-width',
      'Section gap': '--section-gap',
      'Card padding': '--card-padding',
      'Element gap': '--element-gap',
    };
    for (const [label, name] of Object.entries(layout)) {
      const value = new RegExp(`\\*\\*${label}:\\*\\*\\s*(\\d+px)`).exec(design)?.[1];
      expect(tokens.get(name), name).toBe(value);
    }
  });

  it('tokens añadidos: fuente, texto sobre acento, foco y objetivo táctil', () => {
    // C.9: Inter servida en local, primera en la pila; el token conserva su nombre.
    expect(tokens.get('--font-suisse-intl')).toMatch(/^'Inter Variable', 'Inter',/);
    // C.1: texto oscuro sobre el violeta.
    expect(resolveToken(tokens, '--color-on-accent')).toBe('#0f0f13');
    // C.5: foco visible.
    expect(resolveToken(tokens, '--focus-ring')).toBe('2px solid #b296f8');
    expect(tokens.get('--focus-ring-offset')).toBe('2px');
    // C.6: objetivo táctil de 44px.
    expect(resolveToken(tokens, '--tap-target-min')).toBe('calc(40px + 4px)');
  });
});
