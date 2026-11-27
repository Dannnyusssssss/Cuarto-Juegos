import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { webpPath } from '../src/components/picture.ts';
import { CatalogError, validateCatalog, type Game } from '../src/data/games.schema.ts';

export const CATALOG_PATH = fileURLToPath(new URL('../src/data/games.json', import.meta.url));
const PUBLIC_DIR = new URL('../public/', import.meta.url);

/**
 * Contenido activo dentro de un SVG: scripts, manejadores de eventos, HTML incrustado y enlaces
 * javascript:. Dentro de <img> no se ejecuta, pero un SVG abierto directamente sí, en el origen
 * del sitio y sin la CSP de las páginas.
 */
const SVG_ACTIVE_CONTENT: readonly [RegExp, string][] = [
  // También con prefijo de espacio de nombres (<svg:script>).
  [/<([\w.-]+:)?script\b/i, 'lleva <script>'],
  [/\son[a-z]+\s*=/i, 'lleva manejadores de eventos (on…=)'],
  [/<([\w.-]+:)?foreignObject\b/i, 'lleva <foreignObject> (HTML incrustado)'],
  // La palabra sola: los «:» pueden venir como entidad (javascript&#58;) y el XML la decodifica.
  [/javascript/i, 'menciona javascript (posible enlace javascript:)'],
];

/** Problemas de seguridad de un SVG (lista vacía si no lleva contenido activo). */
export const svgProblems = (svg: string): string[] =>
  SVG_ACTIVE_CONTENT.filter(([pattern]) => pattern.test(svg)).map(([, message]) => message);

/** Comprueba que las imágenes referenciadas existen en public/ y que los SVG no llevan scripts. */
export function checkAssets(games: readonly Game[]): string[] {
  const problems: string[] = [];
  games.forEach((game, i) => {
    for (const path of [game.cover, ...(game.screenshots ?? [])]) {
      const file = new URL(path, PUBLIC_DIR);
      if (!existsSync(file)) {
        problems.push(`[${i}] ${game.id}: no existe public/${path}`);
      } else if (path.endsWith('.svg')) {
        for (const problem of svgProblems(readFileSync(file, 'utf8'))) {
          problems.push(`[${i}] ${game.id}: public/${path} ${problem}`);
        }
      }
    }
    // La portada raster se publica también en WebP (<picture>), junto al original.
    if (/\.(?:png|jpe?g)$/i.test(game.cover)) {
      const webp = webpPath(game.cover);
      if (!existsSync(new URL(webp, PUBLIC_DIR))) {
        problems.push(`[${i}] ${game.id}: no existe public/${webp}`);
      }
    }
  });
  return problems;
}

/** Lee, valida y comprueba el catálogo. Lanza un error (y detiene el build) si algo falla. */
export function loadCatalog(): Game[] {
  let data: unknown;
  try {
    data = JSON.parse(readFileSync(CATALOG_PATH, 'utf8'));
  } catch (error) {
    throw new CatalogError([`no se pudo leer como JSON (${(error as Error).message})`]);
  }
  const games = validateCatalog(data);
  const missing = checkAssets(games);
  if (missing.length > 0) throw new CatalogError(missing);
  return games;
}
