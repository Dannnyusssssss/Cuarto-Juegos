import type { Game } from '../data/games.schema.ts';
import { renderBadgeList } from './badge.ts';
import { renderButton } from './button.ts';
import { escapeHtml } from './escape.ts';
import { gameBadges } from './game-badges.ts';

/** Dimensiones nominales de la portada (16:9); evitan saltos de diseño mientras carga. */
export const COVER_WIDTH = 640;
export const COVER_HEIGHT = 360;

export const isExternalUrl = (url: string) => url.startsWith('https://');

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
    `<div class="card__media"><img src="${escapeHtml(root + game.cover)}" alt="Portada de ${title}" ` +
    `width="${COVER_WIDTH}" height="${COVER_HEIGHT}" loading="lazy" decoding="async"></div>` +
    renderBadgeList(gameBadges(game)) +
    `<h3 class="card__title">${title}</h3>` +
    `<p class="card__body">${escapeHtml(game.tagline)}</p>` +
    `<p class="game-card__note">Contenido: ${escapeHtml(game.contentNote)}</p>` +
    action +
    `</article>`
  );
}

export function renderGameGrid(games: readonly Game[], options: GameCardOptions): string {
  const items = games.map((game) => `<li>${renderGameCard(game, options)}</li>`).join('');
  return `<ul class="game-grid">${items}</ul>`;
}
