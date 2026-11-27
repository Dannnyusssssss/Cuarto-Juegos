import type { Plugin } from 'vite';
import { GAME_COLOR, type Game } from '../src/data/games.schema.ts';
import { CATALOG_PATH, loadCatalog } from './catalog.ts';

/** Módulo CSS virtual que importa `src/main.ts`. */
export const GAME_THEME_MODULE = 'virtual:game-theme.css';
const RESOLVED_ID = '\0game-theme.css';
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Nombre de transición de la portada de un juego (el mismo en la tarjeta y en la ficha). */
export const coverTransitionName = (id: string) => `cover-${id}`;

/**
 * CSS generado desde el catálogo, sin estilos en línea (la CSP no los permite):
 * - `[data-accent="<id>"]` define `--game-accent` (Game Accent de DESIGN.md): solo lo usa el
 *   vórtice decorativo.
 * - `[data-catalog]` toma el color de la tarjeta con el foco o bajo el puntero (`--catalog-accent`).
 * - `[data-vt="<id>"]` da a la portada su nombre de transición entre páginas, solo si el usuario
 *   no pidió reducir el movimiento.
 * El `id` y el `color` ya los valida el esquema; aquí se comprueban otra vez porque van dentro de
 * reglas CSS: cualquier otro valor detiene el build en lugar de escribirse.
 */
export function gameThemeCss(games: readonly Pick<Game, 'id' | 'color'>[]): string {
  for (const { id, color } of games) {
    if (typeof id !== 'string' || !SLUG.test(id)) {
      throw new Error(`game-theme: id de juego no válido: ${JSON.stringify(id)}`);
    }
    if (color !== undefined && (typeof color !== 'string' || !GAME_COLOR.test(color))) {
      throw new Error(`game-theme: color no válido en ${id}: ${JSON.stringify(color)}`);
    }
  }
  const colored = games.filter(
    (game): game is Pick<Game, 'id'> & { color: string } => game.color !== undefined,
  );
  const accents = colored.map(({ id, color }) => `[data-accent="${id}"]{--game-accent:${color}}`);
  const focus = colored.map(
    ({ id, color }) =>
      `[data-catalog]:has([data-accent="${id}"]:focus-within){--catalog-accent:${color}}`,
  );
  const hover = colored.map(
    ({ id, color }) => `[data-catalog]:has([data-accent="${id}"]:hover){--catalog-accent:${color}}`,
  );
  const names = games.map(
    ({ id }) => `[data-vt="${id}"]{view-transition-name:${coverTransitionName(id)}}`,
  );
  return (
    `/* Generado desde games.json en el build. */\n` +
    `${accents.join('\n')}\n` +
    `@media (hover:hover){\n${hover.join('\n')}\n}\n` +
    `${focus.join('\n')}\n` +
    `@media (prefers-reduced-motion:no-preference){\n${names.join('\n')}\n}\n`
  );
}

/** Plugin propio (sin dependencias): sirve el CSS generado como módulo virtual en dev y en build. */
export function gameTheme(getGames: () => readonly Game[] = loadCatalog): Plugin {
  return {
    name: 'portal-game-theme',
    resolveId(id) {
      return id === GAME_THEME_MODULE ? RESOLVED_ID : null;
    },
    load(id) {
      if (id !== RESOLVED_ID) return null;
      this.addWatchFile(CATALOG_PATH);
      return gameThemeCss(getGames());
    },
  };
}
