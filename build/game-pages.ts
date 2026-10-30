import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { normalizePath, type Plugin, type ViteDevServer } from 'vite';
import { renderFooter } from '../src/components/footer.ts';
import { renderHeader } from '../src/components/header.ts';
import { renderPageMeta } from '../src/components/page-meta.ts';
import type { Game } from '../src/data/games.schema.ts';
import { absoluteUrl, SITE } from '../src/data/site.ts';
import { gamePageHref } from '../src/components/game-card.ts';
import { GAME_PAGE_ROOT, renderGamePage } from '../src/pages/game.ts';
import { loadCatalog } from './catalog.ts';
import { applyPartials } from './html-partials.ts';

const TEMPLATE = fileURLToPath(new URL('./juego.html', import.meta.url));

/** HTML completo de la página de un juego, a partir de la plantilla única. */
export function renderGamePageHtml(game: Game, template = readFileSync(TEMPLATE, 'utf8')): string {
  const root = GAME_PAGE_ROOT;
  return applyPartials(template, {
    meta: () =>
      renderPageMeta({
        title: `${game.title} · ${SITE.name}`,
        description: game.tagline,
        canonical: absoluteUrl(gamePageHref(game)),
      }),
    header: () => renderHeader({ root }),
    footer: () => renderFooter({ root }),
    game: () => renderGamePage(game, root),
  });
}

/** Entradas de build (nombre → ruta absoluta del HTML) de las páginas de juego. */
export function gamePageInputs(games: readonly Game[], root: string): Record<string, string> {
  return Object.fromEntries(
    games.map((game) => [
      `juego-${game.id}`,
      normalizePath(resolve(root, gamePageHref(game), 'index.html')),
    ]),
  );
}

/**
 * Plugin propio (sin dependencias): una página por juego de games.json, generada desde una
 * plantilla única. Las páginas son HTML virtuales: no existen en disco y Vite las procesa como
 * cualquier otra página (assets con hash y rutas relativas).
 */
export function gamePages(): Plugin {
  let root = process.cwd();
  let pages = new Map<string, Game>();

  const refresh = () => {
    const games = loadCatalog();
    pages = new Map(
      Object.entries(gamePageInputs(games, root)).map(([name, path]) => {
        const game = games.find((g) => `juego-${g.id}` === name);
        return [path, game as Game];
      }),
    );
    return games;
  };

  const serveDev = (server: ViteDevServer) => {
    server.middlewares.use((req, res, next) => {
      const url = req.url?.split(/[?#]/)[0] ?? '';
      const match = /^\/juegos\/([^/]+)(\/(?:index\.html)?)?$/.exec(url);
      if (!match) return next();
      if (!match[2]) {
        res.statusCode = 301;
        res.setHeader('Location', `${url}/`);
        return res.end();
      }
      const game = loadCatalog().find((g) => g.id === match[1]);
      const page = game
        ? renderGamePageHtml(game)
        : readFileSync(resolve(root, '404.html'), 'utf8');
      server
        .transformIndexHtml(req.url ?? url, page)
        .then((html) => {
          res.statusCode = game ? 200 : 404;
          res.setHeader('Content-Type', 'text/html; charset=utf-8');
          res.end(html);
        })
        .catch(next);
    });
  };

  return {
    name: 'portal-game-pages',
    config(config) {
      root = resolve(config.root ?? process.cwd());
      return { build: { rolldownOptions: { input: gamePageInputs(refresh(), root) } } };
    },
    resolveId(id) {
      const path = normalizePath(id);
      return pages.has(path) ? path : null;
    },
    load(id) {
      const game = pages.get(normalizePath(id));
      return game ? renderGamePageHtml(game) : null;
    },
    configureServer: serveDev,
  };
}
