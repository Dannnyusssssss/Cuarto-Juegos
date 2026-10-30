import type { Plugin } from 'vite';
import type { Game } from '../src/data/games.schema.ts';
import { SITE } from '../src/data/site.ts';
import { loadCatalog } from './catalog.ts';

/**
 * Orígenes que pueden cargarse en un iframe: los de los juegos con embed y URL https,
 * sin comodines. Las rutas relativas son del propio sitio ('self').
 */
export function frameSources(games: readonly Game[]): string[] {
  const sources = new Set<string>();
  for (const game of games) {
    if (!game.embed || game.status !== 'available') continue;
    sources.add(game.url.startsWith('https://') ? new URL(game.url).origin : "'self'");
  }
  return sources.size > 0 ? [...sources].sort() : ["'none'"];
}

/**
 * Content-Security-Policy de las páginas de producción.
 * Va en <meta> porque GitHub Pages no permite cabeceras propias; por eso no incluye
 * frame-ancestors (los navegadores la ignoran en <meta>).
 */
export function buildCsp(games: readonly Game[]): string {
  return [
    "default-src 'self'",
    "script-src 'self'",
    "style-src 'self'",
    "img-src 'self' data:",
    "font-src 'self'",
    "connect-src 'self'",
    `frame-src ${frameSources(games).join(' ')}`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'none'",
  ].join('; ');
}

/** Metaetiquetas de seguridad, para insertar justo después de <meta charset>. */
export function securityMetaTags(games: readonly Game[]): string {
  return (
    `<meta http-equiv="Content-Security-Policy" content="${buildCsp(games)}" />` +
    `<meta name="referrer" content="strict-origin-when-cross-origin" />`
  );
}

const CHARSET = /<meta charset="UTF-8" \/>/i;

/**
 * La 404 se sirve en cualquier ruta rota, así que sus rutas relativas a la raíz ("./…")
 * se vuelven absolutas con la ruta base del sitio.
 */
export function absolutizeRootPaths(html: string, basePath = SITE.basePath): string {
  return html.replace(/(\s(?:href|src))="\.\//g, `$1="${basePath}`);
}

/** Solo en build: CSP y referrer en todas las páginas, y rutas absolutas en la 404. */
export function productionSecurity(): Plugin {
  return {
    name: 'portal-production-security',
    apply: 'build',
    transformIndexHtml: {
      order: 'post',
      handler(html, ctx) {
        if (!CHARSET.test(html)) throw new Error(`${ctx.path}: falta <meta charset="UTF-8" />`);
        const out = html.replace(CHARSET, (tag) => tag + securityMetaTags(loadCatalog()));
        return ctx.path.endsWith('/404.html') ? absolutizeRootPaths(out) : out;
      },
    },
  };
}
