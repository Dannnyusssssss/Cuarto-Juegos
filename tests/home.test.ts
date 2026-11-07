import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { loadCatalog } from '../build/catalog.ts';
import { applyPartials } from '../build/html-partials.ts';
import { PARTIALS } from '../build/pages.ts';
import { gameBadges } from '../src/components/game-badges.ts';
import { renderGameCard, renderGameGrid } from '../src/components/game-card.ts';
import { validateCatalog, type Game } from '../src/data/games.schema.ts';
import { HOME } from '../src/data/home.ts';
import { SITE } from '../src/data/site.ts';
import { renderHome } from '../src/pages/home.ts';

const games = loadCatalog();
const deadShift = games[0]!;
const indexHtml = applyPartials(
  readFileSync(new URL('../index.html', import.meta.url), 'utf8'),
  PARTIALS,
);

/** Una entrada nueva, tal como la escribiría alguien en games.json. */
const NEW_ENTRY = {
  id: 'otro-juego',
  title: 'Otro juego',
  tagline: 'Entrada de prueba.',
  description: 'Solo existe en este test.',
  cover: 'games/otro-juego/cover.png',
  url: 'games/otro-juego/play/',
  embed: false,
  controls: ['keyboard', 'touch'],
  tags: [
    { label: 'Puzle', kind: 'genre' },
    { label: 'Navegador', kind: 'platform' },
    { label: 'Game jam', kind: 'event' },
  ],
  status: 'in-development',
  contentNote: 'Sin violencia.',
  ageHint: '[COMPLETAR]',
  addedAt: '2026-11-01',
};

describe('agregar un juego = agregar una entrada a games.json', () => {
  it('una entrada nueva válida aparece como tarjeta sin tocar componentes', () => {
    const catalog = validateCatalog([...games, NEW_ENTRY]);
    const html = renderGameGrid(catalog, { root: './' });
    expect(html.match(/<article class="card game-card">/g)).toHaveLength(games.length + 1);
    expect(html).toContain('Otro juego');
    expect(html).toContain('src="./games/otro-juego/cover.png"');
  });

  it('la página de inicio también la incluye', () => {
    const catalog = validateCatalog([...games, NEW_ENTRY]);
    expect(renderHome(catalog)).toContain('<h3 class="card__title">Otro juego</h3>');
  });
});

describe('badges de un juego', () => {
  it('estado verde, género violeta, controles y plataforma azules, evento rosa, en ese orden', () => {
    const [game] = validateCatalog([NEW_ENTRY]);
    expect(gameBadges(game!)).toEqual([
      { label: 'En desarrollo', kind: 'status' },
      { label: 'Puzle', kind: 'genre' },
      { label: 'Teclado', kind: 'platform' },
      { label: 'Táctil', kind: 'platform' },
      { label: 'Navegador', kind: 'platform' },
      { label: 'Game jam', kind: 'event' },
    ]);
    const html = renderGameCard(game!, { root: './' });
    expect(html).toContain('<span class="badge badge--success">En desarrollo</span>');
    expect(html).toContain('<span class="badge badge--violet">Puzle</span>');
    expect(html).toContain('<span class="badge badge--info">Teclado</span>');
    expect(html).toContain('<span class="badge badge--pink">Game jam</span>');
  });

  it('Dead Shift: Disponible, Survivor-like, Zombis, Teclado y Táctil', () => {
    expect(gameBadges(deadShift).map((b) => b.label)).toEqual([
      'Disponible',
      'Survivor-like',
      'Zombis',
      'Teclado',
      'Táctil',
    ]);
  });
});

describe('tarjeta de juego', () => {
  const card = renderGameCard(deadShift, { root: './' });

  it('botón con texto claro que lleva a la página del juego', () => {
    expect(card).toContain(
      '<a class="btn btn--ghost" href="./juegos/dead-shift/#jugar">Jugar Dead Shift</a>',
    );
  });

  it('portada con alt, dimensiones y carga diferida', () => {
    expect(card).toMatch(
      /<img src="\.\/games\/dead-shift\/cover\.svg" alt="Portada de Dead Shift" width="\d+" height="\d+" loading="lazy"/,
    );
  });

  it('muestra la nota de contenido', () => {
    expect(card).toContain(`Contenido: ${deadShift.contentNote}`);
  });

  it('sin botón Jugar si el juego está en desarrollo', () => {
    const html = renderGameCard({ ...deadShift, status: 'in-development' }, { root: './' });
    expect(html).not.toContain('Jugar');
  });

  it('escapa los textos del catálogo', () => {
    const evil: Game = {
      ...deadShift,
      title: '<img src=x onerror=alert(1)>',
      tagline: '"><script>',
    };
    const html = renderGameCard(evil, { root: './' });
    expect(html).not.toContain('<img src=x');
    expect(html).not.toContain('<script>');
  });
});

describe('página de inicio', () => {
  it('un solo h1, que es el titular del hero', () => {
    expect(indexHtml.match(/<h1\b/g)).toHaveLength(1);
    expect(indexHtml).toContain(`<h1 class="display" id="hero-title">${HOME.hero.title}</h1>`);
  });

  it('hero con eyebrow, subtexto y dos CTAs (primario y ghost)', () => {
    expect(indexHtml).toContain(HOME.hero.eyebrow);
    expect(indexHtml).toContain(HOME.hero.lead);
    expect(indexHtml).toContain('class="btn btn--primary" href="#juegos">Ver los juegos</a>');
    expect(indexHtml).toContain('class="btn btn--ghost" href="#acerca">Acerca del sitio</a>');
  });

  it('el arte del portal es decorativo', () => {
    expect(indexHtml).toMatch(/<svg class="portal-art"[^>]*aria-hidden="true"/);
  });

  it('las anclas de la navegación existen', () => {
    for (const id of ['contenido', 'juegos', 'acerca']) {
      expect(indexHtml).toContain(`id="${id}"`);
    }
    expect(indexHtml).toContain('href="./#juegos"');
    expect(indexHtml).toContain('href="./#acerca"');
  });

  it('todos los enlaces https llevan rel="noopener noreferrer"', () => {
    const links = indexHtml.match(/<a [^>]*href="https:[^>]*>/g) ?? [];
    for (const link of links) expect(link).toContain('rel="noopener noreferrer"');
  });

  it('título, descripción, canonical y Open Graph con la URL publicada', () => {
    expect(indexHtml).toContain(`<title>${SITE.name}</title>`);
    expect(indexHtml).toContain(`<meta name="description" content="${SITE.description}" />`);
    expect(indexHtml).toContain(
      '<link rel="canonical" href="https://dannnyusssssss.github.io/Cuarto-Juegos/" />',
    );
    expect(indexHtml).toContain(
      '<meta property="og:url" content="https://dannnyusssssss.github.io/Cuarto-Juegos/" />',
    );
    expect(indexHtml).toContain(`<meta property="og:title" content="${SITE.name}" />`);
  });

  it('sin barra de anuncio ni formularios', () => {
    expect(indexHtml).not.toMatch(/announcement|<form|<input/);
  });

  it('la sección Acerca usa el texto aprobado', () => {
    expect(indexHtml).toContain(HOME.about.body);
  });

  it('la sección Acerca presenta al autor con su alias, no con el nombre real', () => {
    expect(HOME.about.body).toContain(`hechos por ${SITE.alias}.`);
    expect(HOME.about.body).not.toContain(SITE.owner);
  });
});
