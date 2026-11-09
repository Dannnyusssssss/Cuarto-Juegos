import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { applyPartials } from '../build/html-partials.ts';
import { PARTIALS } from '../build/pages.ts';
import { sitePages } from '../build/site-pages.ts';
import { renderVirtualPage } from '../build/virtual-pages.ts';
import { LEGAL_LINKS } from '../src/data/site.ts';

const fromFile = (file: string) =>
  applyPartials(readFileSync(new URL(`../${file}`, import.meta.url), 'utf8'), PARTIALS);

/** Todas las páginas que se publican, ya renderizadas. */
const PAGES: Record<string, string> = {
  'index.html': fromFile('index.html'),
  '404.html': fromFile('404.html'),
  ...Object.fromEntries(sitePages().map((page) => [page.href, renderVirtualPage(page)])),
};

describe('accesibilidad básica en todas las páginas publicadas', () => {
  it('hay inicio, 404, páginas legales y de juego', () => {
    expect(Object.keys(PAGES)).toEqual(
      expect.arrayContaining([
        'index.html',
        '404.html',
        'privacidad/',
        'terminos/',
        'creditos/',
        'juegos/dead-shift/',
        'juegos/apagon/',
        'juegos/trazada/',
        'juegos/fulgor/',
        'juegos/zumbido/',
        'juegos/ceniza-y-luz/',
      ]),
    );
  });

  for (const [name, html] of Object.entries(PAGES)) {
    describe(name, () => {
      it('lang="es", un solo h1 y título', () => {
        expect(html).toContain('<html lang="es">');
        expect(html.match(/<h1\b/g)).toHaveLength(1);
        expect(html).toMatch(/<title>[^<]+<\/title>/);
      });

      it('enlace "Saltar al contenido" que apunta a <main id="contenido">', () => {
        expect(html).toContain('href="#contenido">Saltar al contenido</a>');
        expect(html).toContain('<main id="contenido">');
      });

      it('todas las imágenes tienen alt (vacío si son decorativas)', () => {
        for (const img of html.match(/<img\b[^>]*>/g) ?? []) expect(img).toMatch(/\salt="/);
      });

      it('los SVG inline son decorativos u ocultos a lectores de pantalla', () => {
        for (const svg of html.match(/<svg\b[^>]*>/g) ?? []) {
          expect(svg).toMatch(/aria-hidden="true"|role="img"/);
        }
      });

      it('el footer enlaza a Privacidad, Términos y Créditos', () => {
        for (const link of LEGAL_LINKS) expect(html).toContain(`>${link.label}</a>`);
      });

      it('los encabezados no saltan niveles', () => {
        const levels = [...html.matchAll(/<h([1-6])\b/g)].map((m) => Number(m[1]));
        levels.forEach((level, i) => {
          if (i > 0) expect(level - levels[i - 1]!).toBeLessThanOrEqual(1);
        });
      });

      it('los enlaces que abren pestaña nueva lo avisan y llevan noopener noreferrer', () => {
        for (const link of html.match(/<a [^>]*target="_blank"[^>]*>[^<]*/g) ?? []) {
          expect(link).toContain('rel="noopener noreferrer"');
          expect(link).toMatch(/pestaña nueva/);
        }
      });
    });
  }
});
