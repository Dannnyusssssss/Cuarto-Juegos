import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { activeSectionIndex, sectionIdFromHref } from '../src/nav-spy.ts';
import { renderHeader } from '../src/components/header.ts';

describe('indicador del menú en el inicio', () => {
  it('arriba del todo (ninguna sección en la franja): manda Inicio', () => {
    expect(activeSectionIndex([false, false], false)).toBe(-1);
  });

  it('con el catálogo en la franja: manda el catálogo', () => {
    expect(activeSectionIndex([true, false], false)).toBe(0);
  });

  it('con Acerca en la franja: manda Acerca', () => {
    expect(activeSectionIndex([false, true], false)).toBe(1);
  });

  it('si la última sección se ve entera, manda ella aunque no llegue a la franja', () => {
    expect(activeSectionIndex([true, false], true)).toBe(1);
  });

  it('sin secciones no marca nada', () => {
    expect(activeSectionIndex([], true)).toBe(-1);
  });

  it('solo acepta enlaces a una sección de la misma página', () => {
    expect(sectionIdFromHref('./#juegos')).toBe('juegos');
    expect(sectionIdFromHref('./#acerca')).toBe('acerca');
    for (const href of [
      './',
      '',
      '#juegos',
      '../#juegos',
      './privacidad/',
      './#Juegos',
      './#a b',
      './#x"y',
      `./#${'a'.repeat(41)}`,
      'https://example.com/#juegos',
    ]) {
      expect(sectionIdFromHref(href), href).toBeNull();
    }
  });

  it('los enlaces de sección del menú del inicio se reconocen', () => {
    const html = renderHeader({ root: './', current: '', overlay: true });
    const hrefs = [...html.matchAll(/class="nav-link" href="([^"]*)"/g)].map((m) => m[1] ?? '');
    const ids = hrefs.map(sectionIdFromHref).filter((id) => id !== null);
    expect(ids).toEqual(['juegos', 'acerca']);
  });

  it('cada enlace del menú lleva su texto en data-label (reserva el ancho en negrita)', () => {
    const html = renderHeader({ root: './', current: '', overlay: true });
    const links = [...html.matchAll(/<a class="nav-link"[^>]*data-label="([^"]*)">([^<]*)<\/a>/g)];
    expect(links).toHaveLength(3);
    for (const [, label, text] of links) expect(label).toBe(text);
    const css = readFileSync(new URL('../src/styles/components.css', import.meta.url), 'utf8');
    expect(css).toMatch(/\.nav-link\[data-label\]::after\s*\{[^}]*visibility: hidden;/);
  });

  it('el CSS mueve el indicador a la sección y no lo deja también en Inicio', () => {
    const css = readFileSync(new URL('../src/styles/components.css', import.meta.url), 'utf8');
    expect(css).toMatch(/\.nav-link:is\(\[aria-current='page'\], \[aria-current='true'\]\)\s*\{/);
    expect(css).toMatch(
      /\.nav-list:has\(\.nav-link\[aria-current='true'\]\) \.nav-link\[aria-current='page'\]\s*\{[^}]*text-decoration-color: transparent;/,
    );
  });
});
