import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { applyPartials } from '../build/html-partials.ts';
import { defaultOgImage } from '../build/og-image.ts';
import { PARTIALS } from '../build/pages.ts';
import { isPublishBuild, publishProblems } from '../build/publish-check.ts';
import { sitePages } from '../build/site-pages.ts';
import { renderSitemap } from '../build/sitemap.ts';
import { renderVirtualPage } from '../build/virtual-pages.ts';
import { renderPageMeta } from '../src/components/page-meta.ts';

const CLEAN =
  '<html><head><title>Mi sitio</title><meta name="description" content="Juegos" /></head>' +
  '<body><div class="portal-art"></div><p>Hola</p></body></html>';

describe('bloqueo de publicación', () => {
  it('un HTML sin pendientes y con nombre definitivo se puede publicar', () => {
    expect(publishProblems('index.html', CLEAN, 'Mi sitio')).toEqual([]);
  });

  it('las clases CSS con "portal" no cuentan como el nombre provisional', () => {
    expect(
      publishProblems('a.html', '<div class="portal-art portal-art__ring"></div>', 'Mi sitio'),
    ).toEqual([]);
  });

  it('falla si queda algún [COMPLETAR], también dentro de un atributo', () => {
    expect(publishProblems('a.html', '<p>RUC: [COMPLETAR]</p>', 'Mi sitio')).toEqual([
      'a.html: quedan 1 [COMPLETAR]',
    ]);
    expect(
      publishProblems('a.html', '<a href="mailto:[COMPLETAR]">x</a>', 'Mi sitio'),
    ).toHaveLength(1);
    expect(publishProblems('a.html', '<p>[COMPLETAR: tu nombre]</p>', 'Mi sitio')).toHaveLength(1);
  });

  it('falla si el nombre del sitio sigue siendo "Portal"', () => {
    expect(publishProblems('a.html', CLEAN, 'Portal')).toEqual([
      'a.html: el nombre del sitio sigue siendo el provisional "Portal"',
    ]);
  });

  it('falla si "Portal" aparece como texto visible o en metadatos', () => {
    expect(publishProblems('a.html', '<h1>Portal</h1>', 'Mi sitio')).toHaveLength(1);
    expect(
      publishProblems(
        'a.html',
        '<meta property="og:title" content="Juego · Portal" />',
        'Mi sitio',
      ),
    ).toHaveLength(1);
  });

  it('el modo estricto se activa en CI o con build:publish', () => {
    expect(isPublishBuild('production', { CI: 'true' })).toBe(true);
    expect(isPublishBuild('publish', {})).toBe(true);
    expect(isPublishBuild('production', {})).toBe(false);
  });

  it('todas las páginas reales se pueden publicar: sin [COMPLETAR] ni nombre provisional', () => {
    const fromFile = (file: string) =>
      applyPartials(readFileSync(new URL(`../${file}`, import.meta.url), 'utf8'), PARTIALS);
    const pages: [string, string][] = [
      ['index.html', fromFile('index.html')],
      ['404.html', fromFile('404.html')],
      ...sitePages().map((page): [string, string] => [page.href, renderVirtualPage(page)]),
    ];
    expect(pages.flatMap(([file, html]) => publishProblems(file, html))).toEqual([]);
  });
});

describe('sitemap.xml', () => {
  const hrefs = ['', ...sitePages().map((page) => page.href)];
  const xml = renderSitemap(hrefs);

  it('incluye solo las páginas públicas, con URLs absolutas desde basePath', () => {
    const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]).sort();
    expect(locs).toEqual(
      [
        'https://dannnyusssssss.github.io/Cuarto-Juegos/',
        'https://dannnyusssssss.github.io/Cuarto-Juegos/creditos/',
        'https://dannnyusssssss.github.io/Cuarto-Juegos/juegos/dead-shift/',
        'https://dannnyusssssss.github.io/Cuarto-Juegos/juegos/apagon/',
        'https://dannnyusssssss.github.io/Cuarto-Juegos/juegos/trazada/',
        'https://dannnyusssssss.github.io/Cuarto-Juegos/juegos/fulgor/',
        'https://dannnyusssssss.github.io/Cuarto-Juegos/juegos/zumbido/',
        'https://dannnyusssssss.github.io/Cuarto-Juegos/privacidad/',
        'https://dannnyusssssss.github.io/Cuarto-Juegos/terminos/',
      ].sort(),
    );
  });

  it('excluye la guía de estilo y la 404', () => {
    expect(xml).not.toMatch(/styleguide|404/);
  });

  it('es XML de sitemap válido', () => {
    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
    expect(xml).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
  });
});

describe('favicon e imagen Open Graph', () => {
  it('cada página enlaza el favicon con su ruta relativa', () => {
    const game = sitePages().find((page) => page.href.startsWith('juegos/'))!;
    expect(renderVirtualPage(game)).toContain(
      '<link rel="icon" href="../../favicon.svg" type="image/svg+xml" />',
    );
  });

  it('no hay un favicon.svg en la raíz que tape el de public/', () => {
    // Vite resuelve ./favicon.svg desde el HTML de la raíz: si ahí existe un archivo con ese
    // nombre, lo publica con hash en lugar de enlazar public/favicon.svg.
    expect(existsSync(new URL('../favicon.svg', import.meta.url))).toBe(false);
    expect(existsSync(new URL('../public/favicon.svg', import.meta.url))).toBe(true);
  });

  it('og:image solo se publica si hay imagen', () => {
    const base = { title: 't', description: 'd', root: './' };
    expect(renderPageMeta(base)).not.toContain('og:image');
    expect(renderPageMeta({ ...base, image: 'https://x.example/og.png' })).toContain(
      '<meta property="og:image" content="https://x.example/og.png" />',
    );
  });

  it('og:image aparece en todas las páginas solo si public/og-default.png existe', () => {
    const image = defaultOgImage();
    const exists = existsSync(new URL('../public/og-default.png', import.meta.url));
    expect(image).toBe(
      exists ? 'https://dannnyusssssss.github.io/Cuarto-Juegos/og-default.png' : undefined,
    );
    for (const page of sitePages()) {
      const html = renderVirtualPage(page);
      if (exists) expect(html).toContain(`<meta property="og:image" content="${image}" />`);
      else expect(html).not.toContain('og:image');
    }
  });
});
