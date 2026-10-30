import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { CatalogError, validateCatalog, type Game } from '../src/data/games.schema.ts';

export const CATALOG_PATH = fileURLToPath(new URL('../src/data/games.json', import.meta.url));
const PUBLIC_DIR = new URL('../public/', import.meta.url);

/** Comprueba que las imágenes referenciadas existen en public/. */
export function checkAssets(games: readonly Game[]): string[] {
  const problems: string[] = [];
  games.forEach((game, i) => {
    for (const path of [game.cover, ...(game.screenshots ?? [])]) {
      if (!existsSync(new URL(path, PUBLIC_DIR))) {
        problems.push(`[${i}] ${game.id}: no existe public/${path}`);
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
