import type { Game } from '../data/games.schema.ts';
import { HOME } from '../data/home.ts';
import { escapeHtml } from '../components/escape.ts';
import { renderEyebrow } from '../components/eyebrow.ts';
import { renderGameGrid } from '../components/game-card.ts';
import { renderHeading } from '../components/heading.ts';
import { renderHero } from '../components/hero.ts';

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
  return (
    renderHero(hero) +
    `<div class="container">` +
    `<section class="section" id="${catalog.id}" aria-labelledby="${catalog.id}-title">` +
    sectionHeader(catalog.id, catalog.eyebrow, catalog.title) +
    renderGameGrid(games, { root }) +
    `</section>` +
    `<section class="section about" id="${about.id}" aria-labelledby="${about.id}-title">` +
    sectionHeader(about.id, about.eyebrow, about.title) +
    `<p class="about__body">${escapeHtml(about.body)}</p>` +
    `</section>` +
    `</div>`
  );
}
