/**
 * Lógica pura del filtro del catálogo (sin DOM ni datos del sitio). El build escribe en cada
 * tarjeta sus controles y géneros ya normalizados; el filtro elegido es uno de una lista cerrada.
 *
 * Valores de filtro: `all`, `control:<control>` o `genre:<género normalizado>`.
 */
export const FILTER_ALL = 'all';

export const controlFilter = (control: string): string => `control:${control}`;
export const genreFilter = (slug: string): string => `genre:${slug}`;

/** Género en una forma estable para comparar: minúsculas, sin acentos y con guiones («Escape room» → «escape-room»). */
export function genreSlug(label: string): string {
  return label
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const VALID_FILTER = /^(?:all|control:[a-z]+|genre:[a-z0-9]+(?:-[a-z0-9]+)*)$/;

/** ¿Tiene el valor la forma de un filtro conocido? Lo que no la tenga, el script lo ignora. */
export const isValidFilter = (filter: string): boolean => VALID_FILTER.test(filter);

/** Atributos de una tarjeta: listas separadas por espacios (`data-controls` y `data-genres`). */
export interface CardAttributes {
  controls: string;
  genres: string;
}

const words = (list: string): string[] => list.split(/\s+/).filter(Boolean);

/** ¿Se muestra la tarjeta con este filtro? Un filtro desconocido no muestra nada. */
export function matchesFilter(filter: string, card: CardAttributes): boolean {
  if (!isValidFilter(filter)) return false;
  if (filter === FILTER_ALL) return true;
  const separator = filter.indexOf(':');
  const kind = filter.slice(0, separator);
  const value = filter.slice(separator + 1);
  return words(kind === 'control' ? card.controls : card.genres).includes(value);
}
