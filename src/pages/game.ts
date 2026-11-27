import type { Game } from '../data/games.schema.ts';
import { renderBadgeList } from '../components/badge.ts';
import { renderButton } from '../components/button.ts';
import { escapeHtml } from '../components/escape.ts';
import { renderEyebrow } from '../components/eyebrow.ts';
import {
  COVER_HEIGHT,
  COVER_WIDTH,
  gameHref,
  isExternalUrl,
  renderGameGrid,
} from '../components/game-card.ts';
import { controlsText, gameBadges } from '../components/game-badges.ts';
import { renderHeading } from '../components/heading.ts';
import { PORTAL_ART_SVG } from '../components/hero.ts';
import { renderPicture } from '../components/picture.ts';
import { gameRequirements, renderRequirementList } from '../components/requirements.ts';
import { gameFrameTitle } from '../data/embed.ts';

/** Máximo de tarjetas en «Más juegos». */
export const MORE_GAMES_MAX = 3;

const genresOf = (game: Game) =>
  new Set(game.tags.filter((tag) => tag.kind === 'genre').map((tag) => tag.label));

/**
 * «Más juegos»: otros juegos disponibles, primero los que comparten más géneros con este y luego
 * los más recientes; en un empate manda el orden de games.json. Nunca incluye el juego actual.
 */
export function selectMoreGames(
  game: Game,
  catalog: readonly Game[],
  max = MORE_GAMES_MAX,
): Game[] {
  const genres = genresOf(game);
  const shared = (other: Game) => [...genresOf(other)].filter((g) => genres.has(g)).length;
  return catalog
    .map((other, index) => ({ other, index, shared: shared(other) }))
    .filter(({ other }) => other.id !== game.id && other.status === 'available')
    .sort(
      (a, b) =>
        b.shared - a.shared || b.other.addedAt.localeCompare(a.other.addedAt) || a.index - b.index,
    )
    .slice(0, max)
    .map(({ other }) => other);
}

/** Portada grande de la ficha: es la imagen LCP, así que se carga ya y con prioridad alta. */
function cover(game: Game, root: string): string {
  return renderPicture({
    src: root + game.cover,
    alt: `Portada de ${game.title}`,
    width: COVER_WIDTH,
    height: COVER_HEIGHT,
    loading: 'eager',
    fetchpriority: 'high',
    class: 'game-player__cover',
  });
}

/**
 * Columna de la imagen. Si el juego se puede embeber, la portada es el escenario: el script de la
 * página lo convierte en iframe al pulsar «Jugar», así que nada se carga del origen del juego
 * antes. Sin JavaScript, «Jugar» lleva directamente al juego.
 */
function renderMedia(game: Game, root: string): string {
  const id = escapeHtml(game.id);
  const href = gameHref(game, root);
  const back = `<a class="btn btn--ghost" href="${escapeHtml(root)}#juegos">Volver al catálogo</a>`;
  const art = `<div class="game-detail__art" aria-hidden="true">${PORTAL_ART_SVG}</div>`;
  const embedded = game.embed && game.status === 'available';

  const stage = embedded
    ? `<div class="game-player__stage" data-game-stage data-vt="${id}">${cover(game, root)}` +
      `<p class="game-player__loading" data-game-loading hidden>` +
      `Cargando ${escapeHtml(game.title)}…</p></div>`
    : `<div class="game-player__stage" data-vt="${id}">${cover(game, root)}</div>`;

  const toolbar = embedded
    ? `<button type="button" class="btn btn--ghost" data-game-fullscreen hidden>Pantalla completa</button>` +
      `<a class="btn btn--ghost" href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer">` +
      `Abrir en pestaña nueva</a>` +
      back
    : back;

  const shots = (game.screenshots ?? [])
    .map(
      (shot, i) =>
        `<li>${renderPicture({
          src: root + shot,
          alt: `Captura ${i + 1} de ${game.title}`,
          width: COVER_WIDTH,
          height: COVER_HEIGHT,
        })}</li>`,
    )
    .join('');

  return (
    `<div class="game-detail__media">${art}` +
    `<section class="game-player" aria-label="${escapeHtml(gameFrameTitle(game.title))}">` +
    stage +
    (embedded ? `<p class="game-player__help" data-game-help aria-live="polite" hidden></p>` : '') +
    `<div class="game-player__toolbar">${toolbar}</div>` +
    `</section>` +
    (shots ? `<ul class="game-detail__shots">${shots}</ul>` : '') +
    `</div>`
  );
}

/** Play Panel: el único botón primario de la página, con la edad, los controles y el contenido. */
function renderPlayPanel(game: Game, root: string): string {
  let action = '';
  if (game.status === 'available') {
    const label = `Jugar ${game.title}`;
    const href = gameHref(game, root);
    const external = isExternalUrl(game.url);
    action = game.embed
      ? `<a class="btn btn--primary" href="${escapeHtml(href)}" data-game-play ` +
        `data-game-title="${escapeHtml(game.title)}"${external ? ' rel="noopener noreferrer"' : ''}>` +
        `${escapeHtml(label)}</a>`
      : renderButton({ label, variant: 'primary', href, external });
  }
  return (
    `<div class="play-panel" id="jugar">` +
    action +
    `<p>Edad orientativa: <span class="play-panel__age">${escapeHtml(game.ageHint)}</span></p>` +
    `<p>Controles: ${escapeHtml(controlsText(game.controls))}</p>` +
    `<p>Contenido: ${escapeHtml(game.contentNote)}</p>` +
    `</div>`
  );
}

/** Contenido de <main> en la página de un juego (Game Detail de DESIGN.md). */
export function renderGamePage(game: Game, root: string, catalog: readonly Game[] = []): string {
  const more = selectMoreGames(game, catalog);
  return (
    `<div class="container game-page" data-accent="${escapeHtml(game.id)}">` +
    `<div class="game-detail">` +
    renderMedia(game, root) +
    `<div class="game-detail__info">` +
    `<div class="game-detail__intro">` +
    renderEyebrow('Juego') +
    renderHeading({ text: game.title, level: 1, size: 'display', id: 'game-title' }) +
    renderBadgeList(gameBadges(game)) +
    `<p class="game-page__lead">${escapeHtml(game.tagline)}</p>` +
    `</div>` +
    `<p class="game-detail__description">${escapeHtml(game.description)}</p>` +
    renderPlayPanel(game, root) +
    `<section class="game-detail__requirements" aria-labelledby="requisitos">` +
    renderHeading({ text: 'Requisitos y datos', level: 2, size: 'heading-sm', id: 'requisitos' }) +
    renderRequirementList(gameRequirements(game)) +
    `</section>` +
    `</div>` +
    `</div>` +
    (more.length > 0
      ? `<section class="more-games" aria-labelledby="mas-juegos">` +
        renderHeading({ text: 'Más juegos', level: 2, size: 'heading-sm', id: 'mas-juegos' }) +
        renderGameGrid(more, { root }) +
        `</section>`
      : '') +
    `</div>`
  );
}
