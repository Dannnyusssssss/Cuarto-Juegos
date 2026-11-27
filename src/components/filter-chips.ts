import type { Control, Game } from '../data/games.schema.ts';
import { FILTER_ALL, controlFilter, genreFilter, genreSlug } from '../catalog-filter.ts';
import { escapeHtml } from './escape.ts';

/** Mínimo de juegos para que un género tenga su chip. */
export const GENRE_CHIP_MIN_GAMES = 2;

export interface FilterChip {
  /** Valor estable que compara el script (`data-filter`). */
  filter: string;
  label: string;
}

/** Controles con chip propio, en este orden. */
const CONTROL_CHIPS: readonly { control: Control; label: string }[] = [
  { control: 'touch', label: 'Táctil' },
  { control: 'keyboard', label: 'Teclado y ratón' },
];

/** Géneros de un juego como valores normalizados, sin repetir. */
export function gameGenres(game: Pick<Game, 'tags'>): { slug: string; label: string }[] {
  const seen = new Map<string, string>();
  for (const tag of game.tags) {
    if (tag.kind !== 'genre') continue;
    const slug = genreSlug(tag.label);
    if (slug && !seen.has(slug)) seen.set(slug, tag.label);
  }
  return [...seen].map(([slug, label]) => ({ slug, label }));
}

/**
 * Chips del catálogo: «Todos», los controles que usan algunos juegos (no todos) y un chip por cada
 * género con 2 o más juegos, sin ser de todos (alfabético). Un chip que mostraría el catálogo
 * entero no filtra nada: es relleno y no se genera. Lista cerrada derivada del catálogo.
 */
export function filterChips(games: readonly Game[]): FilterChip[] {
  const chips: FilterChip[] = [{ filter: FILTER_ALL, label: 'Todos' }];
  for (const { control, label } of CONTROL_CHIPS) {
    const count = games.filter((game) => game.controls.includes(control)).length;
    if (count > 0 && count < games.length) {
      chips.push({ filter: controlFilter(control), label });
    }
  }
  const genres = new Map<string, { label: string; count: number }>();
  for (const game of games) {
    for (const { slug, label } of gameGenres(game)) {
      const entry = genres.get(slug);
      if (entry) entry.count += 1;
      else genres.set(slug, { label, count: 1 });
    }
  }
  const frequent = [...genres]
    .filter(([, { count }]) => count >= GENRE_CHIP_MIN_GAMES && count < games.length)
    .sort(([, a], [, b]) => a.label.localeCompare(b.label, 'es'));
  for (const [slug, { label }] of frequent) chips.push({ filter: genreFilter(slug), label });
  return chips;
}

/**
 * Chips y estado vacío. El contenedor lleva `hidden`: sin JavaScript no se ven y se muestran todos
 * los juegos. Sin nada que filtrar (solo «Todos»), no se genera nada.
 */
export function renderFilterChips(games: readonly Game[]): string {
  const chips = filterChips(games);
  if (chips.length < 2) return '';
  const buttons = chips
    .map(
      ({ filter, label }) =>
        `<button type="button" class="filter-chip" data-filter="${escapeHtml(filter)}" aria-pressed="${filter === FILTER_ALL}">${escapeHtml(label)}</button>`,
    )
    .join('');
  return `<div class="filter-chips" role="group" aria-label="Filtrar juegos" data-filter-chips hidden>${buttons}</div>`;
}

/** Aviso (región de estado) y botón para volver a «Todos»; el script los muestra solo sin resultados. */
export function renderFilterEmpty(): string {
  return (
    `<div class="catalog-empty">` +
    `<p class="catalog-empty__text" role="status" data-filter-status data-message="No hay juegos con este filtro."></p>` +
    `<button type="button" class="btn btn--ghost" data-filter-reset hidden>Ver todos</button>` +
    `</div>`
  );
}
