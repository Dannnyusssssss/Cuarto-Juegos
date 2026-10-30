import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { normalizePath, type Plugin, type ViteDevServer } from 'vite';
import { renderFooter } from '../src/components/footer.ts';
import { renderHeader } from '../src/components/header.ts';
import { renderPageMeta, type PageMetaProps } from '../src/components/page-meta.ts';
import { absoluteUrl } from '../src/data/site.ts';
import { applyPartials } from './html-partials.ts';

const TEMPLATE = fileURLToPath(new URL('./page.html', import.meta.url));

export interface VirtualPage {
  /** Ruta relativa a la raíz del sitio, terminada en "/" (p. ej. "privacidad/"). */
  href: string;
  meta: Omit<PageMetaProps, 'canonical'>;
  /** Contenido de <main>; recibe el prefijo relativo hasta la raíz ("../", "../../"…). */
  content: (root: string) => string;
  /** Scripts propios de la página, además de /src/main.ts. */
  scripts?: readonly string[];
}

/** Prefijo relativo desde una página hasta la raíz del sitio. */
export const rootFor = (href: string) => '../'.repeat(href.split('/').filter(Boolean).length);

/** Nombre de la entrada de build ("juegos/dead-shift/" → "juegos-dead-shift"). */
export const inputName = (href: string) => href.split('/').filter(Boolean).join('-');

/** HTML completo de una página, a partir de la plantilla única. */
export function renderVirtualPage(
  page: VirtualPage,
  template = readFileSync(TEMPLATE, 'utf8'),
): string {
  const root = rootFor(page.href);
  return applyPartials(template, {
    meta: () => renderPageMeta({ ...page.meta, canonical: absoluteUrl(page.href) }),
    scripts: () =>
      (page.scripts ?? []).map((src) => `<script type="module" src="${src}"></script>`).join(''),
    header: () => renderHeader({ root }),
    footer: () => renderFooter({ root, current: page.href }),
    content: () => page.content(root),
  });
}

/** Entradas de build (nombre → ruta absoluta del HTML). */
export function virtualPageInputs(
  pages: readonly VirtualPage[],
  projectRoot: string,
): Record<string, string> {
  return Object.fromEntries(
    pages.map((page) => [
      inputName(page.href),
      normalizePath(resolve(projectRoot, page.href, 'index.html')),
    ]),
  );
}

/**
 * Plugin propio (sin dependencias): páginas generadas desde datos (una por juego de games.json y
 * las páginas legales) con una plantilla única. Son HTML virtuales: no existen en disco y Vite las
 * procesa como cualquier otra página (assets con hash y rutas relativas).
 * `getPages` se llama en cada render, así que un games.json inválido detiene el build.
 */
export function virtualPages(getPages: () => VirtualPage[]): Plugin {
  let projectRoot = process.cwd();
  let byPath = new Map<string, VirtualPage>();

  const refresh = () => {
    const pages = getPages();
    byPath = new Map(
      pages.map((page) => [normalizePath(resolve(projectRoot, page.href, 'index.html')), page]),
    );
    return virtualPageInputs(pages, projectRoot);
  };

  const serveDev = (server: ViteDevServer) => {
    server.middlewares.use((req, res, next) => {
      const path = (req.url ?? '').replace(/[?#].*$/, '').replace(/index\.html$/, '');
      const pages = getPages();
      const page = pages.find((p) => `/${p.href}` === path);
      const withoutSlash = pages.find((p) => `/${p.href}` === `${path}/`);
      if (withoutSlash) {
        res.statusCode = 301;
        res.setHeader('Location', `${path}/`);
        return res.end();
      }
      // Rutas bajo /juegos/ que no son un juego del catálogo: 404.
      if (!page && !path.startsWith('/juegos/')) return next();
      const html = page
        ? renderVirtualPage(page)
        : readFileSync(resolve(projectRoot, '404.html'), 'utf8');
      server
        .transformIndexHtml(req.url ?? path, html)
        .then((out) => {
          res.statusCode = page ? 200 : 404;
          res.setHeader('Content-Type', 'text/html; charset=utf-8');
          res.end(out);
        })
        .catch(next);
    });
  };

  return {
    name: 'portal-virtual-pages',
    config(config) {
      projectRoot = resolve(config.root ?? process.cwd());
      return { build: { rolldownOptions: { input: refresh() } } };
    },
    resolveId(id) {
      const path = normalizePath(id);
      return byPath.has(path) ? path : null;
    },
    load(id) {
      const page = byPath.get(normalizePath(id));
      return page ? renderVirtualPage(page) : null;
    },
    configureServer: serveDev,
  };
}
