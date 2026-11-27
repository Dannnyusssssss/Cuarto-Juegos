import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { loadCatalog } from '../build/catalog.ts';
import {
  FILTER_ALL,
  controlFilter,
  genreFilter,
  genreSlug,
  isValidFilter,
  matchesFilter,
} from '../src/catalog-filter.ts';
import { filterChips, renderFilterChips } from '../src/components/filter-chips.ts';
import { cardBadges } from '../src/components/game-badges.ts';
import { renderGameCard, renderGameGrid } from '../src/components/game-card.ts';
import type { Game } from '../src/data/games.schema.ts';
import { renderHome } from '../src/pages/home.ts';

const games = loadCatalog();
const base = games[0]!;
const read = (path: string) => readFileSync(new URL(path, import.meta.url), 'utf8');

const make = (id: string, genres: string[], controls: Game['controls'] = ['keyboard']): Game => ({
  ...base,
  id,
  controls,
  tags: genres.map((label) => ({ label, kind: 'genre' as const })),
});

describe('badges de la tarjeta', () => {
  it('un solo badge azul de controles y sin «Disponible»', () => {
    const badges = cardBadges(base);
    expect(badges).toEqual([{ label: 'Teclado y táctil', kind: 'platform' }]);
    expect(badges.map((b) => b.label)).not.toContain('Disponible');
  });

  it('en desarrollo suma el badge verde y nunca pasa de 2', () => {
    const badges = cardBadges({ ...base, status: 'in-development' });
    expect(badges).toEqual([
      { label: 'Teclado y táctil', kind: 'platform' },
      { label: 'En desarrollo', kind: 'status' },
    ]);
    for (const game of games) expect(cardBadges(game).length).toBeLessThanOrEqual(2);
  });

  it('solo teclado y ratón: el badge dice «Teclado»', () => {
    const fulgor = games.find((g) => g.id === 'fulgor')!;
    expect(cardBadges(fulgor)).toEqual([{ label: 'Teclado', kind: 'platform' }]);
  });
});

describe('nota de la tarjeta', () => {
  it('lleva la edad orientativa (cifras tabulares) y el contenido en cada tarjeta', () => {
    for (const game of games) {
      const html = renderGameCard(game, { root: './' });
      expect(html).toContain(
        `Edad orientativa: <span class="game-card__age">${game.ageHint}</span>. Contenido: `,
      );
    }
    expect(read('../src/styles/components.css')).toMatch(
      /\.game-card__age\s*\{\s*font-variant-numeric: tabular-nums;/,
    );
  });

  it('escapa la edad y el contenido', () => {
    const html = renderGameCard(
      { ...base, ageHint: '<b>12+</b>', contentNote: '"><script>' },
      { root: './' },
    );
    expect(html).not.toContain('<b>');
    expect(html).not.toContain('<script>');
  });
});

describe('chips de filtro', () => {
  it('lista cerrada: Todos, controles y géneros con 2 o más juegos (sin ser de todos), alfabético', () => {
    const catalog = [
      make('a', ['Terror', 'Zombis'], ['touch', 'keyboard']),
      make('b', ['Terror', 'Acción']),
      make('c', ['Acción', 'Único']),
      make('d', ['Terror']),
    ];
    expect(filterChips(catalog).map((c) => c.label)).toEqual([
      'Todos',
      'Táctil',
      'Acción',
      'Terror',
    ]);
    expect(filterChips(catalog).map((c) => c.filter)).toEqual([
      'all',
      'control:touch',
      'genre:accion',
      'genre:terror',
    ]);
  });

  it('un género con un solo juego no tiene chip (umbral de 2)', () => {
    expect(filterChips([make('a', ['Raro']), make('b', ['Otro'])]).map((c) => c.label)).toEqual([
      'Todos',
    ]);
  });

  it('un chip que mostraría todo el catálogo (control o género de todos) no se genera', () => {
    const catalog = [make('a', ['Terror'], ['keyboard']), make('b', ['Terror'], ['keyboard'])];
    expect(filterChips(catalog).map((c) => c.label)).toEqual(['Todos']);
  });

  it('el catálogo real genera chips: «Todos» pulsado y el contenedor oculto', () => {
    const html = renderFilterChips(games);
    expect(html).toMatch(/^<div class="filter-chips"[^>]* data-filter-chips hidden>/);
    expect(html).toContain('data-filter="all" aria-pressed="true">Todos</button>');
    expect(html.match(/aria-pressed="true"/g)).toHaveLength(1);
    expect(html.match(/<button type="button" class="filter-chip"/g)).toHaveLength(
      filterChips(games).length,
    );
    expect(html).not.toMatch(/<input|contenteditable/);
  });

  it('sin nada que filtrar no se genera nada', () => {
    expect(renderFilterChips([])).toBe('');
  });

  it('el inicio los incluye con el estado vacío', () => {
    const html = renderHome(games);
    expect(html).toContain('data-filter-chips hidden');
    expect(html).toContain('role="status"');
    expect(html).toContain('data-message="No hay juegos con este filtro."');
    expect(html).toContain('data-filter-reset hidden>Ver todos</button>');
  });
});

describe('datos de filtro en cada tarjeta', () => {
  it('cada <li> lleva data-controls y data-genres normalizados', () => {
    const html = renderGameGrid(games, { root: './' });
    const items = [...html.matchAll(/<li data-controls="([^"]*)" data-genres="([^"]*)">/g)];
    expect(items).toHaveLength(games.length);
    for (const [, controls, genres] of items) {
      expect(controls).toMatch(/^[a-z]+(?: [a-z]+)*$/);
      expect(genres).toMatch(/^[a-z0-9-]+(?: [a-z0-9-]+)*$/);
    }
  });

  it('los valores salen normalizados aunque la etiqueta sea hostil', () => {
    const evil = make('x', ['"><script>alert(1)</script>', 'Escape room']);
    const html = renderGameGrid([evil], { root: './' });
    expect(html).toContain('data-genres="script-alert-1-script escape-room"');
    expect(html).not.toContain('<script>');
  });
});

describe('lógica pura del filtro', () => {
  const card = { controls: 'keyboard touch', genres: 'terror escape-room' };

  it('Todos muestra todo', () => {
    expect(matchesFilter(FILTER_ALL, card)).toBe(true);
    expect(matchesFilter(FILTER_ALL, { controls: '', genres: '' })).toBe(true);
  });

  it('Táctil y Teclado y ratón miran los controles', () => {
    expect(matchesFilter(controlFilter('touch'), card)).toBe(true);
    expect(matchesFilter(controlFilter('touch'), { controls: 'keyboard mouse', genres: '' })).toBe(
      false,
    );
    expect(matchesFilter(controlFilter('keyboard'), card)).toBe(true);
  });

  it('un género coincide por valor exacto, no por fragmento', () => {
    expect(matchesFilter(genreFilter('terror'), card)).toBe(true);
    expect(matchesFilter(genreFilter('escape-room'), card)).toBe(true);
    expect(matchesFilter(genreFilter('escape'), card)).toBe(false);
    expect(matchesFilter(genreFilter('accion'), card)).toBe(false);
  });

  it('sin resultados: ninguna tarjeta coincide', () => {
    const cards = [card, { controls: 'keyboard', genres: 'carreras' }];
    expect(cards.filter((c) => matchesFilter(genreFilter('puzzle'), c))).toHaveLength(0);
  });

  it('un filtro desconocido o mal formado no muestra nada', () => {
    for (const bad of [
      '',
      'x',
      'control:',
      'genre:A B',
      'genre:<img>',
      'all ',
      'control:touch x',
    ]) {
      expect(isValidFilter(bad), bad).toBe(false);
      expect(matchesFilter(bad, card), bad).toBe(false);
    }
  });

  it('genreSlug quita acentos y símbolos', () => {
    expect(genreSlug('Acción')).toBe('accion');
    expect(genreSlug('Escape room')).toBe('escape-room');
    expect(genreSlug('"><')).toBe('');
  });
});

describe('scripts del inicio', () => {
  const APIS =
    /innerHTML|outerHTML|insertAdjacentHTML|srcdoc|eval\(|new Function|document\.write|DOMParser|setAttribute\(\s*['"]style['"]/;

  it('home-page.ts y catalog-filter.ts no usan APIs prohibidas ni importan datos', () => {
    for (const file of ['../src/home-page.ts', '../src/catalog-filter.ts']) {
      const code = read(file);
      expect(code, file).not.toMatch(APIS);
      expect(code, file).not.toMatch(/from\s+['"][^'"]*\/data\//);
    }
  });
});

describe('CSS del catálogo', () => {
  const css = read('../src/styles/components.css');

  it('animation-timeline: view() solo dentro de @supports y de movimiento permitido', () => {
    const block =
      /@supports \(animation-timeline: view\(\)\) \{\s*@media \(prefers-reduced-motion: no-preference\) \{[\s\S]*?\n {2}\}\n\}\n/;
    expect(css).toMatch(block);
    expect(css.replace(block, '').replace(/\/\*[\s\S]*?\*\//g, '')).not.toMatch(/view\(\)/);
  });

  it('el movimiento de la tarjeta solo se aplica con movimiento permitido', () => {
    const outside = css.replace(
      /@media \(prefers-reduced-motion: no-preference\) \{[\s\S]*?\n\}\n/g,
      '',
    );
    expect(outside).not.toMatch(/\.game-card\s*\{[^}]*transform:/);
    expect(outside).not.toMatch(/scale\(var\(--game-card-zoom\)\)/);
  });
});
