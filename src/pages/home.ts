import type { Game } from '../data/games.schema.ts';
import { HOME, heroTitle, selectFeatured } from '../data/home.ts';
import { escapeHtml } from '../components/escape.ts';
import { renderEyebrow } from '../components/eyebrow.ts';
import { renderFilterChips, renderFilterEmpty } from '../components/filter-chips.ts';
import { gamePageHref, renderGameGrid } from '../components/game-card.ts';
import { renderHeading } from '../components/heading.ts';
import { PORTAL_ART_SVG, renderHero } from '../components/hero.ts';

function sectionHeader(id: string, eyebrow: string, title: string): string {
  return (
    `<div class="section-header">` +
    renderEyebrow(eyebrow) +
    renderHeading({ text: title, level: 2, size: 'heading', id: `${id}-title` }) +
    `</div>`
  );
}

/** Contenido de <main> en la página de inicio: hero, catálogo y Acerca. */
export function renderHome(games: readonly Game[], root = './'): string {
  const { hero, games: catalog, about } = HOME;
  const chips = renderFilterChips(games);
  return (
    renderHero({
      ...hero,
      title: heroTitle(games.filter((game) => game.status === 'available').length),
      root,
      slides: selectFeatured(games).map((game) => ({
        id: game.id,
        title: game.title,
        tagline: game.tagline,
        cover: game.cover,
        href: gamePageHref(game),
      })),
    }) +
    `<div class="container">` +
    `<section class="section catalog" id="${catalog.id}" aria-labelledby="${catalog.id}-title" data-catalog>` +
    // Fondo decorativo: vórtice grande y tenue que gira con el scroll y toma el color de la
    // tarjeta con el foco o bajo el puntero (CSS generado desde el catálogo).
    `<div class="catalog__backdrop" aria-hidden="true"><div class="catalog__backdrop-art">${PORTAL_ART_SVG}</div></div>` +
    sectionHeader(catalog.id, catalog.eyebrow, catalog.title) +
    chips +
    renderGameGrid(games, { root }) +
    (chips ? renderFilterEmpty() : '') +
    `</section>` +
    `<section class="section about" id="${about.id}" aria-labelledby="${about.id}-title">` +
    sectionHeader(about.id, about.eyebrow, about.title) +
    `<p class="about__body">${escapeHtml(about.body)}</p>` +
    `</section>` +
    `</div>`
  );
}
