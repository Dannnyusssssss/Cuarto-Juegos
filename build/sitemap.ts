import type { Plugin } from 'vite';
import { escapeHtml } from '../src/components/escape.ts';
import { absoluteUrl } from '../src/data/site.ts';

/**
 * sitemap.xml con las páginas públicas. `hrefs` son rutas relativas a la raíz ('' = inicio).
 * Nunca incluye la guía de estilo ni la 404.
 */
export function renderSitemap(hrefs: readonly string[]): string {
  const urls = hrefs
    .map((href) => `  <url><loc>${escapeHtml(absoluteUrl(href))}</loc></url>`)
    .join('\n');
  return (
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`
  );
}

/** Emite sitemap.xml en el build. `getHrefs` se llama al generar, con el catálogo actual. */
export function sitemap(getHrefs: () => string[]): Plugin {
  return {
    name: 'portal-sitemap',
    apply: 'build',
    generateBundle() {
      this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: renderSitemap(getHrefs()) });
    },
  };
}
