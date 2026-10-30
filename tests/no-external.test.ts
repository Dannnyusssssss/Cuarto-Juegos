import { readdirSync, readFileSync, statSync } from 'node:fs';
import { extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { SITE } from '../src/data/site.ts';
import { GITHUB_PRIVACY_URL } from '../src/pages/legal.ts';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
/** Archivos que el navegador carga o que generan HTML. Los .txt de licencias quedan fuera. */
const CODE_EXT = new Set(['.ts', '.css', '.html', '.svg', '.json']);

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

const files = [
  ...['src', 'public', 'build'].flatMap((d) => walk(join(ROOT, d))),
  join(ROOT, 'index.html'),
  join(ROOT, '404.html'),
  join(ROOT, 'styleguide.html'),
  join(ROOT, 'vite.config.ts'),
].filter((f) => CODE_EXT.has(extname(f)));

/**
 * Únicas URLs absolutas permitidas: los espacios de nombres de SVG y de sitemap (no son peticiones),
 * las `url` de los juegos del catálogo (enlaces e iframes de juegos propios, que se cargan solo
 * al pulsar "Jugar"), el origen público del sitio (canonical y Open Graph, no se cargan) y la
 * declaración de privacidad de GitHub (un enlace en la política de privacidad, no un recurso).
 */
const catalog = JSON.parse(readFileSync(join(ROOT, 'src/data/games.json'), 'utf8')) as {
  url: string;
}[];
/** Espacios de nombres XML: identificadores, no recursos que se carguen. */
const NAMESPACES = ['http://www.w3.org/2000/svg', 'http://www.sitemaps.org/schemas/sitemap/0.9'];
const ALLOWED = new Set([
  ...NAMESPACES,
  SITE.url,
  GITHUB_PRIVACY_URL,
  ...catalog.map((g) => g.url).filter((u) => u.startsWith('https://')),
]);
const ABSOLUTE_URL = /(?:https?:)?\/\/[a-z0-9-]+\.[a-z][^\s"'`)<>]*/gi;

describe('sin peticiones a dominios externos', () => {
  it('hay archivos que revisar', () => {
    expect(files.length).toBeGreaterThan(10);
  });

  it('la lista blanca solo contiene URLs https y el namespace SVG', () => {
    for (const url of ALLOWED) {
      expect(NAMESPACES.includes(url) || url.startsWith('https://'), url).toBe(true);
    }
  });

  for (const file of files) {
    it(file.slice(ROOT.length), () => {
      const found = readFileSync(file, 'utf8').match(ABSOLUTE_URL) ?? [];
      expect(found.filter((url) => !ALLOWED.has(url))).toEqual([]);
    });
  }
});
