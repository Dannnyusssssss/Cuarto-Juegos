import { renderBadgeList } from '../src/components/badge.ts';
import { renderBrand } from '../src/components/brand.ts';
import { renderButton } from '../src/components/button.ts';
import { renderCard } from '../src/components/card.ts';
import { escapeHtml } from '../src/components/escape.ts';
import { renderEyebrow } from '../src/components/eyebrow.ts';
import { renderHeading } from '../src/components/heading.ts';
import { renderGameGrid } from '../src/components/game-card.ts';
import { renderHero } from '../src/components/hero.ts';
import { renderNavLink } from '../src/components/nav-link.ts';
import { HOME } from '../src/data/home.ts';
import { SITE } from '../src/data/site.ts';
import { loadCatalog } from './catalog.ts';
import { readTokens } from './tokens.ts';

const TYPE_ROLES = ['display', 'heading', 'heading-sm', 'subheading', 'body', 'body-sm', 'caption'];

function section(id: string, eyebrow: string, title: string, content: string): string {
  return (
    `<section class="section sg-section" aria-labelledby="${id}">` +
    renderEyebrow(eyebrow) +
    renderHeading({ text: title, level: 2, size: 'heading-sm', id }) +
    content +
    `</section>`
  );
}

function tokenRow(name: string, value: string, demoClass: string): string {
  return (
    `<li class="sg-token">` +
    `<span class="${demoClass}" style="--sg-value: var(${escapeHtml(name)})" aria-hidden="true"></span>` +
    `<code>${escapeHtml(name)}</code><span class="sg-token__value">${escapeHtml(value)}</span>` +
    `</li>`
  );
}

/** Contenido de la guía de estilo (solo desarrollo). Los valores salen de tokens.css. */
export function renderStyleguide(): string {
  const tokens = readTokens();
  const catalog = loadCatalog();
  const byPrefix = (prefix: string) => [...tokens].filter(([name]) => name.startsWith(prefix));

  const colors = [...byPrefix('--color-'), ...byPrefix('--surface-')]
    .map(([n, v]) => tokenRow(n, v, 'sg-swatch'))
    .join('');

  const type = TYPE_ROLES.map((role) => {
    const size = role === 'display' || role === 'heading' ? `--size-${role}` : `--text-${role}`;
    const leading =
      role === 'display' || role === 'heading' ? `--size-${role}-leading` : `--leading-${role}`;
    // Los titulares van siempre en 900 (DESIGN.md, Display Heading).
    const weight = role.startsWith('display') || role.startsWith('heading') ? 'black' : 'regular';
    const meta = `${role} · ${tokens.get(`--text-${role}`)} / ${tokens.get(`--leading-${role}`)} / ${tokens.get(`--tracking-${role}`)}`;
    return (
      `<li class="sg-type">` +
      `<p class="sg-type__sample" style="font-size: var(${size}); line-height: var(${leading}); letter-spacing: var(--tracking-${role}); font-weight: var(--font-weight-${weight})">Texto de muestra</p>` +
      `<code>${escapeHtml(meta)}</code></li>`
    );
  }).join('');

  const weights = byPrefix('--font-weight-')
    .map(
      ([n, v]) =>
        `<li class="sg-type"><p class="sg-type__sample" style="font-weight: var(${n})">Peso ${escapeHtml(v)}</p><code>${escapeHtml(n)}</code></li>`,
    )
    .join('');

  const spacing = byPrefix('--spacing-')
    .filter(([n]) => n !== '--spacing-unit')
    .map(([n, v]) => tokenRow(n, v, 'sg-bar'))
    .join('');

  const shapes = [...byPrefix('--radius-'), ...byPrefix('--shadow-')]
    .map(([n, v]) => tokenRow(n, v, n.startsWith('--shadow-') ? 'sg-shadow' : 'sg-radius'))
    .join('');

  const components =
    `<h3 class="sg-label">Botones</h3><div class="sg-row">` +
    renderButton({ label: 'Botón primario', variant: 'primary', href: '#componentes' }) +
    renderButton({ label: 'Botón primario', variant: 'primary' }) +
    renderButton({ label: 'Botón ghost', variant: 'ghost', href: '#componentes' }) +
    renderButton({ label: 'Botón ghost', variant: 'ghost' }) +
    `</div>` +
    `<h3 class="sg-label">Enlaces de navegación</h3>` +
    `<nav aria-label="Ejemplo de navegación"><ul class="nav-list">` +
    `<li>${renderNavLink({ label: 'Página actual', href: '#componentes', current: true })}</li>` +
    `<li>${renderNavLink({ label: 'Otro enlace', href: '#componentes' })}</li>` +
    `</ul></nav>` +
    `<h3 class="sg-label">Marca</h3><div class="sg-row">${renderBrand({ name: SITE.name, href: '#componentes' })}</div>` +
    `<h3 class="sg-label">Badges</h3>` +
    renderBadgeList([
      { label: 'Disponible', kind: 'status' },
      { label: 'Teclado', kind: 'platform' },
      { label: 'Táctil', kind: 'platform' },
      { label: 'Género', kind: 'genre' },
      { label: 'Evento', kind: 'event' },
    ]) +
    `<h3 class="sg-label">Eyebrow y encabezados</h3><div class="sg-stack">` +
    renderEyebrow('Eyebrow de sección') +
    renderHeading({ text: 'Encabezado display', level: 2, size: 'display' }) +
    renderHeading({ text: 'Encabezado heading', level: 2, size: 'heading' }) +
    renderHeading({ text: 'Encabezado heading-sm', level: 2, size: 'heading-sm' }) +
    `</div>` +
    `<h3 class="sg-label">Tarjeta con glow</h3><div class="sg-grid">` +
    [1, 2, 3]
      .map((n) =>
        renderCard({
          title: `Tarjeta ${n}`,
          body: 'Texto de ejemplo de la guía de estilo. La portada es un placeholder SVG.',
          headingLevel: 4,
        }),
      )
      .join('') +
    `</div>` +
    `<h3 class="sg-label">Tarjeta de juego (disponible y en desarrollo)</h3>` +
    renderGameGrid(
      catalog.slice(0, 1).flatMap((game) => [game, { ...game, status: 'in-development' as const }]),
      { root: './' },
    ) +
    `<h3 class="sg-label">Hero con el portal</h3>` +
    `<div class="sg-hero">${renderHero({ ...HOME.hero, headingLevel: 2 })}</div>`;

  return (
    `<div class="container">` +
    `<div class="section sg-stack">` +
    renderEyebrow('Solo desarrollo') +
    renderHeading({ text: 'Guía de estilo', level: 1, size: 'display' }) +
    `<p class="sg-lead">Tokens de tokens.css y componentes del portal. Recorre la página con Tab para comprobar el foco.</p>` +
    `</div>` +
    section('colores', 'Tokens', 'Colores y superficies', `<ul class="sg-tokens">${colors}</ul>`) +
    section(
      'tipografia',
      'Tokens',
      'Tipografía',
      `<ul class="sg-list">${type}</ul><ul class="sg-list">${weights}</ul>`,
    ) +
    section('espaciado', 'Tokens', 'Espaciado', `<ul class="sg-list">${spacing}</ul>`) +
    section('formas', 'Tokens', 'Radios y sombras', `<ul class="sg-tokens">${shapes}</ul>`) +
    section('componentes', 'Componentes', 'Componentes', components) +
    `</div>`
  );
}
