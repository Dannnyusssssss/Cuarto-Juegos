import type { Game } from './games.schema.ts';
import { PORTAL_STORAGE_PREFIX } from './games.schema.ts';
import { SITE } from './site.ts';

/** ¿El juego se sirve desde el mismo origen que el portal publicado (comparte su localStorage)? */
export const sharesPortalOrigin = (game: Game) =>
  !game.url.startsWith('https://') || new URL(game.url).origin === SITE.url;

/** Juegos con datos guardados que el botón del portal puede borrar (mismo origen y prefijo conocido). */
export const clearableGames = (games: readonly Game[]) =>
  games.filter((game) => game.storagePrefix !== undefined && sharesPortalOrigin(game));

/** Prefijos que borra el botón: el del portal y los de los juegos del mismo origen. */
export const clearablePrefixes = (games: readonly Game[]) => [
  PORTAL_STORAGE_PREFIX,
  ...clearableGames(games).flatMap((game) => (game.storagePrefix ? [game.storagePrefix] : [])),
];

/**
 * Claves que se deben borrar. Solo las de prefijos conocidos: el origen puede ser compartido con
 * otros sitios (p. ej. otras páginas de la misma cuenta) y sus datos no se tocan.
 */
export function keysToClear(keys: readonly string[], prefixes: readonly string[]): string[] {
  // Un prefijo vacío o mal formado coincidiría con claves ajenas: se descarta.
  const valid = prefixes.filter((prefix) => /^[a-z0-9-]+:$/.test(prefix));
  return keys.filter((key) => valid.some((prefix) => key.startsWith(prefix)));
}
