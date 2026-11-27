import type { Game } from '../data/games.schema.ts';
import { renderBadgeList } from './badge.ts';
import { renderButton } from './button.ts';
import { escapeHtml } from './escape.ts';
import { gameGenres } from './filter-chips.ts';
import { cardBadges } from './game-badges.ts';
import { renderPicture } from './picture.ts';

/** Dimensiones nominales de la portada (16:9); evitan saltos de diseño mientras carga. */
export const COVER_WIDTH = 640;
export const COVER_HEIGHT = 360;

export const isExternalUrl = (url: string) => url.startsWith('https://');

/**
 * Enlace al juego desde una página del sitio: la URL tal cual si es https y, si es relativa,
 * resuelta desde la raíz del sitio (root = './', '../'…), no desde la página actual.
 */
export const gameHref = (game: Pick<Game, 'url'>, root: string) =>
  isExternalUrl(game.url) ? game.url : root + game.url;

/** Ruta de la página de un juego, relativa a la raíz del sitio. */
export const gamePageHref = (game: Pick<Game, 'id'>) => `juegos/${game.id}/`;

export interface GameCardOptions {
  /** Prefijo relativo hasta la raíz del sitio ('./' o '../'). */
  root: string;
}

export function renderGameCard(game: Game, { root }: GameCardOptions): string {
  // La tarjeta lleva a la página del juego, donde está el botón para jugar.
  const href = `${root}${gamePageHref(game)}#jugar`;
  const title = escapeHtml(game.title);
  const action =
    game.status === 'available'
      ? `<div class="game-card__actions">${renderButton({ label: `Jugar ${game.title}`, variant: 'ghost', href })}</div>`
      : '';
  return (
    `<article class="card game-card">` +
    `<div class="card__media" data-vt="${escapeHtml(game.id)}">${renderPicture({
      src: root + game.cover,
      alt: `Portada de ${game.title}`,
      width: COVER_WIDTH,
      height: COVER_HEIGHT,
      loading: 'lazy',
    })}</div>` +
    renderBadgeList(cardBadges(game)) +
    `<h3 class="card__title">${title}</h3>` +
    `<p class="card__body">${escapeHtml(game.tagline)}</p>` +
    `<p class="game-card__note">Edad orientativa: <span class="game-card__age">${escapeHtml(game.ageHint)}</span>. Contenido: ${escapeHtml(game.contentNote)}</p>` +
    action +
    `</article>`
  );
}

export function renderGameGrid(games: readonly Game[], options: GameCardOptions): string {
  // Valores normalizados (solo letras minúsculas, cifras y guiones) para que el script filtre.
  const items = games
    .map((game) => {
      const controls = escapeHtml(game.controls.join(' '));
      const genres = escapeHtml(
        gameGenres(game)
          .map((genre) => genre.slug)
          .join(' '),
      );
      const accent = escapeHtml(game.id);
      return `<li data-accent="${accent}" data-controls="${controls}" data-genres="${genres}">${renderGameCard(game, options)}</li>`;
    })
    .join('');
  return `<ul class="game-grid">${items}</ul>`;
}
