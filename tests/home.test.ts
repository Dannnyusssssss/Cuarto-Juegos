import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { loadCatalog } from '../build/catalog.ts';
import { applyPartials } from '../build/html-partials.ts';
import { PARTIALS } from '../build/pages.ts';
import { controlsText, gameBadges } from '../src/components/game-badges.ts';
import { renderGameCard, renderGameGrid } from '../src/components/game-card.ts';
import { validateCatalog, type Game } from '../src/data/games.schema.ts';
import { HOME, heroTitle, selectFeatured } from '../src/data/home.ts';
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
    // La tarjeta muestra menos: controles juntos y «En desarrollo» (ver cardBadges).
    const html = renderGameCard(game!, { root: './' });
    expect(html).toContain('<span class="badge badge--success">En desarrollo</span>');
    expect(html).toContain('<span class="badge badge--info">Teclado y táctil</span>');
    expect(html).not.toContain('Puzle</span>');
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

  it('Apagón: Disponible, Terror, Sigilo, Teclado y Táctil', () => {
    const apagon = games.find((g) => g.id === 'apagon')!;
    expect(gameBadges(apagon).map((b) => b.label)).toEqual([
      'Disponible',
      'Terror',
      'Sigilo',
      'Teclado',
      'Táctil',
    ]);
    expect(controlsText(apagon.controls)).toBe('Teclado, ratón y táctil');
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
      /<img src="\.\/games\/dead-shift\/cover\.png" alt="Portada de Dead Shift" width="\d+" height="\d+" loading="lazy"/,
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

describe('juegos destacados y titular del hero', () => {
  const make = (id: string, addedAt: string, status: Game['status'] = 'available'): Game => ({
    ...deadShift,
    id,
    addedAt,
    status,
  });

  it('ordena por fecha descendente y respeta el orden de entrada en empate', () => {
    const input = [
      make('a', '2026-01-01'),
      make('b', '2026-03-01'),
      make('c', '2026-02-01'),
      make('d', '2026-03-01'),
    ];
    expect(selectFeatured(input, 4).map((g) => g.id)).toEqual(['b', 'd', 'c', 'a']);
  });

  it('devuelve como máximo 3 por defecto', () => {
    const input = ['a', 'b', 'c', 'd'].map((id, i) => make(id, `2026-01-0${i + 1}`));
    expect(selectFeatured(input)).toHaveLength(3);
  });

  it('con menos de 3 disponibles devuelve los que haya', () => {
    expect(
      selectFeatured([make('a', '2026-01-01'), make('b', '2026-01-02', 'in-development')]),
    ).toHaveLength(1);
  });

  it('sin disponibles devuelve una lista vacía', () => {
    expect(selectFeatured([make('a', '2026-01-01', 'in-development')])).toEqual([]);
    expect(selectFeatured([])).toEqual([]);
  });

  it('ignora los juegos en desarrollo aunque sean más recientes', () => {
    const input = [make('viejo', '2026-01-01'), make('nuevo', '2026-06-01', 'in-development')];
    expect(selectFeatured(input).map((g) => g.id)).toEqual(['viejo']);
  });

  it('no muta la entrada', () => {
    const input = [make('a', '2026-01-01'), make('b', '2026-02-01', 'in-development')];
    const copy = [...input];
    selectFeatured(input);
    expect(input).toEqual(copy);
  });

  it('heroTitle: 0, 1 y n', () => {
    expect(heroTitle(0)).toBe('Juegos propios para jugar en el navegador');
    expect(heroTitle(1)).toBe('1 juego propio para jugar en el navegador');
    expect(heroTitle(5)).toBe('5 juegos propios para jugar en el navegador');
  });

  it('el h1 renderizado lleva el total real de juegos disponibles', () => {
    const catalog = [...games, validateCatalog([NEW_ENTRY])[0]!];
    const total = catalog.filter((g) => g.status === 'available').length;
    expect(renderHome(catalog)).toContain(heroTitle(total));
    expect(renderHome(catalog)).toContain(`>${total} juegos propios`);
  });
});

describe('página de inicio', () => {
  it('un solo h1, que es el titular del hero', () => {
    expect(indexHtml.match(/<h1\b/g)).toHaveLength(1);
    const total = games.filter((g) => g.status === 'available').length;
    expect(indexHtml).toContain(
      `<h1 class="heading" id="hero-title">${total} juegos propios para jugar en el navegador</h1>`,
    );
    expect(indexHtml).toContain(`<h1 class="heading" id="hero-title">${heroTitle(total)}</h1>`);
  });

  it('hero con eyebrow, subtexto y dos CTAs (primario con la diapositiva activa y ghost)', () => {
    const first = selectFeatured(games)[0]!;
    expect(indexHtml).toContain(HOME.hero.eyebrow);
    expect(indexHtml).toContain(HOME.hero.lead);
    expect(indexHtml).toContain(
      `<a class="btn btn--primary" data-hero-play href="./juegos/${first.id}/">Jugar ${first.title}</a>`,
    );
    expect(indexHtml).toContain('class="btn btn--ghost" href="#juegos">Ver juegos</a>');
    expect(indexHtml.match(/class="btn btn--primary"|btn btn--primary/g)).toHaveLength(1);
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

describe('cabecera del inicio', () => {
  const components = readFileSync(new URL('../src/styles/components.css', import.meta.url), 'utf8');

  it('lleva la marca de superposición y el hero su centinela', () => {
    expect(indexHtml).toContain('class="site-header site-header--overlay"');
    expect(indexHtml).toContain('data-hero-top');
  });

  it('solo el inicio carga home-page.ts', () => {
    expect(indexHtml).toContain('<script type="module" src="/src/home-page.ts"></script>');
    const pages = ['../src/pages/game.ts', '../src/pages/legal.ts', '../build/site-pages.ts'];
    for (const file of pages) {
      expect(readFileSync(new URL(file, import.meta.url), 'utf8')).not.toContain('home-page');
    }
    expect(PARTIALS['header']!()).not.toContain('site-header--overlay');
  });

  it('sin script es sólida y el script solo usa dataset', () => {
    const rule = /\.site-header--overlay\s*\{[^}]*\}/.exec(components)![0];
    expect(rule).toContain('position: fixed');
    expect(rule).toContain('var(--layer-header)');
    expect(rule).toContain('blur(var(--blur-header))');
    const script = readFileSync(new URL('../src/home-page.ts', import.meta.url), 'utf8');
    expect(script).not.toMatch(/innerHTML|eval\(|setAttribute\(\s*'style'/);
  });

  it('los estilos de hover están dentro de @media (hover: hover)', () => {
    const outside = components.replace(/@media \(hover: hover\) \{[\s\S]*?\n\}\n/g, '');
    expect(outside).not.toMatch(/:hover/);
    expect(components).toMatch(/@media \(hover: hover\)/);
  });

  it('la cabecera fija no tapa los saltos a sección ni el foco (scroll-padding-top)', () => {
    expect(components).toMatch(
      /html:has\(\.site-header--overlay\)\s*\{[^}]*scroll-padding-top:\s*calc\(var\(--tap-target-min\)/,
    );
  });
});

describe('tarjeta del catálogo: enlace extendido', () => {
  const card = renderGameCard(deadShift, { root: './' });
  const css = readFileSync(new URL('../src/styles/components.css', import.meta.url), 'utf8');

  it('un solo elemento enfocable por tarjeta, con el destino del botón Jugar', () => {
    expect(card.match(/<a\b/g)).toHaveLength(1);
    expect(card).not.toMatch(/<(?:button|input|select|textarea)\b|tabindex/);
    expect(card).toContain('href="./juegos/dead-shift/#jugar"');
  });

  it('el CSS extiende el enlace con ::after a toda la tarjeta y evita el transform al pulsar', () => {
    expect(css).toMatch(
      /\.game-card__actions \.btn::after\s*\{[^}]*position: absolute;[^}]*inset: 0;/,
    );
    expect(css).toMatch(/\.game-card\s*\{[^}]*position: relative;/);
    expect(css).toMatch(/\.game-card__actions \.btn:active\s*\{\s*transform: none;/);
  });
});

describe('hero con diapositivas', () => {
  const featured = selectFeatured(games);
  const hero = indexHtml.slice(
    indexHtml.indexOf('<section class="hero"'),
    indexHtml.indexOf('</section>'),
  );
  const slides = [...hero.matchAll(/<div class="hero__slide"[^>]*>[\s\S]*?<\/picture>/g)].map(
    (m) => m[0],
  );

  it('una diapositiva por destacado (máximo 3)', () => {
    expect(slides).toHaveLength(Math.min(3, featured.length));
  });

  it('la primera es visible, eager y de prioridad alta; las demás ocultas, lazy y de prioridad baja', () => {
    expect(slides[0]).not.toContain('hidden');
    expect(slides[0]).toContain('loading="eager"');
    expect(slides[0]).toContain('fetchpriority="high"');
    expect(slides[0]).not.toContain('lazy');
    for (const slide of slides.slice(1)) {
      expect(slide).toContain(' hidden');
      expect(slide).toContain('loading="lazy"');
      expect(slide).toContain('fetchpriority="low"');
    }
  });

  it('riel oculto con miniaturas accesibles y la primera pulsada', () => {
    if (featured.length < 2) return;
    expect(hero).toMatch(/<div class="hero__rail" hidden/);
    const thumbs = [...hero.matchAll(/<button type="button" class="hero__thumb"[^>]*>/g)].map(
      (m) => m[0],
    );
    expect(thumbs).toHaveLength(slides.length);
    thumbs.forEach((thumb, i) => {
      expect(thumb).toContain(`aria-label="Mostrar ${featured[i]!.title}"`);
      expect(thumb).toContain(`aria-pressed="${i === 0}"`);
    });
  });

  it('leyenda visible con título, tagline y enlace a la ficha', () => {
    const first = featured[0]!;
    const caption = hero.slice(hero.indexOf('data-hero-caption'));
    expect(caption).toContain(first.title);
    expect(caption).toContain(first.tagline);
    expect(caption).toContain(`href="./juegos/${first.id}/">Ver ${first.title}</a>`);
    expect(hero).not.toMatch(/<div class="hero__caption"[^>]*hidden/);
  });

  it('sin destacados el hero no se rompe: sin imagen, primario «Ver juegos» y sin ghost', () => {
    const html = renderHome([{ ...deadShift, status: 'in-development' }]);
    expect(html).not.toContain('data-hero-slide');
    expect(html).not.toContain('hero__caption');
    expect(html).toContain('class="btn btn--primary" href="#juegos">Ver juegos</a>');
    expect(html).not.toContain('btn--ghost" href="#juegos"');
    expect(html.match(/<h1\b/g)).toHaveLength(1);
  });

  it('estructura: vórtice y tarjeta en el contenedor, con las diapositivas dentro de la tarjeta', () => {
    expect(hero).toMatch(/<div class="hero__art" aria-hidden="true"><svg class="portal-art"/);
    const card = hero.slice(hero.indexOf('<div class="hero__card">'));
    const cardEnd = card.indexOf('</a></div>');
    expect(cardEnd).toBeGreaterThan(0);
    const inside = card.slice(0, cardEnd);
    expect(inside.match(/data-hero-slide/g)).toHaveLength(slides.length);
    expect(hero.match(/data-hero-slide/g)).toHaveLength(slides.length);
    expect(hero.indexOf('portal-art')).toBeLessThan(hero.indexOf('hero__card'));
  });

  it('la portada del hero es un enlace solo de ratón al juego activo', () => {
    const first = featured[0]!;
    const link = hero.match(/<a class="hero__cover-link"[^>]*>/)?.[0] ?? '';
    expect(link).toContain('tabindex="-1"');
    expect(link).toContain('aria-hidden="true"');
    expect(link).toContain('data-hero-cover');
    expect(link).toContain(`href="./juegos/${first.id}/"`);
    // El mismo destino que el botón primario.
    expect(hero).toContain(`data-hero-play href="./juegos/${first.id}/"`);
  });

  it('botón de pausa: oculto en el HTML (lo muestra el script), con texto y tipo button', () => {
    if (featured.length < 2) return;
    expect(hero).toContain(
      '<button type="button" class="btn btn--ghost hero__pause" hidden data-hero-pause>Pausar</button>',
    );
  });

  it('la leyenda empieza en polite (sin script no hay avance automático)', () => {
    expect(hero).toMatch(/data-hero-caption aria-live="polite"/);
  });

  it('sin estilos en línea ni título gigante del juego', () => {
    expect(hero).not.toMatch(/\sstyle=/);
    expect(hero.match(/<h1\b/g)).toHaveLength(1);
    expect(hero).not.toContain('hero__game-title');
  });
});
