import type { Game } from '../data/games.schema.ts';
import { renderBadgeList } from '../components/badge.ts';
import { renderButton } from '../components/button.ts';
import { escapeHtml } from '../components/escape.ts';
import { renderEyebrow } from '../components/eyebrow.ts';
import { COVER_HEIGHT, COVER_WIDTH, isExternalUrl } from '../components/game-card.ts';
import { controlsText, gameBadges } from '../components/game-badges.ts';
import { renderHeading } from '../components/heading.ts';

function detail(id: string, title: string, body: string): string {
  return (
    `<section class="game-page__detail" aria-labelledby="${id}">` +
    renderHeading({ text: title, level: 2, size: 'heading-sm', id }) +
    body +
    `</section>`
  );
}

/**
 * Bloque del juego. Si se puede embeber, muestra la portada y un enlace "Jugar": el script de la
 * página lo convierte en iframe al pulsarlo, así que nada se carga del origen del juego antes.
 * Sin JavaScript, el enlace lleva directamente al juego.
 */
function renderPlayer(game: Game, root: string): string {
  if (game.status !== 'available') return '';
  const external = isExternalUrl(game.url);
  const href = external ? game.url : root + game.url;
  const label = `Jugar ${game.title}`;
  const back =
    `<a class="btn btn--ghost" href="${escapeHtml(root)}#juegos" data-game-back>` +
    `Volver al catálogo</a>`;

  if (!game.embed) {
    return (
      `<section class="game-player" id="jugar" aria-label="${escapeHtml(label)}">` +
      `<div class="game-player__toolbar">` +
      renderButton({ label, variant: 'primary', href, external }) +
      back +
      `</div></section>`
    );
  }

  return (
    `<section class="game-player" id="jugar" aria-label="${escapeHtml(label)}">` +
    `<div class="game-player__stage" data-game-stage>` +
    `<img class="game-player__cover" src="${escapeHtml(root + game.cover)}" alt="" ` +
    `width="${COVER_WIDTH}" height="${COVER_HEIGHT}" decoding="async">` +
    `<div class="game-player__start">` +
    `<a class="btn btn--primary" href="${escapeHtml(href)}" data-game-play ` +
    `data-game-title="${escapeHtml(game.title)}"${external ? ' rel="noopener noreferrer"' : ''}>` +
    `${escapeHtml(label)}</a>` +
    `</div></div>` +
    `<p class="game-player__help" data-game-help hidden></p>` +
    `<div class="game-player__toolbar">` +
    `<button type="button" class="btn btn--ghost" data-game-fullscreen hidden>Pantalla completa</button>` +
    `<a class="btn btn--ghost" href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer">` +
    `Abrir en pestaña nueva</a>` +
    back +
    `</div></section>`
  );
}

/** Contenido de <main> en la página de un juego. */
export function renderGamePage(game: Game, root: string): string {
  return (
    `<div class="container game-page">` +
    `<div class="game-page__intro">` +
    renderEyebrow('Juego') +
    renderHeading({ text: game.title, level: 1, size: 'display', id: 'game-title' }) +
    renderBadgeList(gameBadges(game)) +
    `<p class="game-page__lead">${escapeHtml(game.tagline)}</p>` +
    `</div>` +
    renderPlayer(game, root) +
    `<div class="game-page__details">` +
    detail('acerca-del-juego', 'Acerca del juego', `<p>${escapeHtml(game.description)}</p>`) +
    detail('controles', 'Controles', `<p>${escapeHtml(controlsText(game.controls))}</p>`) +
    detail(
      'contenido',
      'Contenido',
      `<p>${escapeHtml(game.contentNote)}</p>` +
        `<p>Edad orientativa: ${escapeHtml(game.ageHint)}</p>`,
    ) +
    `</div>` +
    `</div>`
  );
}
