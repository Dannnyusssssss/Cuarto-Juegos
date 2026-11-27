import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { loadCatalog } from '../build/catalog.ts';
import { gameVirtualPage, sitePages } from '../build/site-pages.ts';
import { renderVirtualPage, virtualPageInputs } from '../build/virtual-pages.ts';
import { applyPartials } from '../build/html-partials.ts';
import { PARTIALS } from '../build/pages.ts';
import { controlsText, gameBadges } from '../src/components/game-badges.ts';
import { gameRequirements } from '../src/components/requirements.ts';
import { MORE_GAMES_MAX, selectMoreGames } from '../src/pages/game.ts';
import { GAME_FRAME_ATTRIBUTES, gameFrameTitle } from '../src/data/embed.ts';
import { validateCatalog, type Game } from '../src/data/games.schema.ts';

const games = loadCatalog();
const deadShift = games[0]!;
const renderGamePageHtml = (game: Game) => renderVirtualPage(gameVirtualPage(game));
const gameInputs = (catalog: readonly Game[]) =>
  Object.fromEntries(
    Object.entries(virtualPageInputs(sitePages(catalog), '/raiz')).filter(([name]) =>
      name.startsWith('juegos-'),
    ),
  );
const page = renderGamePageHtml(deadShift);

/** Una entrada nueva, tal como la escribiría alguien en games.json. */
const NEW_ENTRY = {
  id: 'otro-juego',
  title: 'Otro juego',
  tagline: 'Entrada de prueba.',
  description: 'Solo existe en este test.',
  cover: 'games/otro-juego/cover.png',
  url: 'https://dannnyusssssss.github.io/otro-juego/',
  embed: true,
  controls: ['touch'],
  tags: [{ label: 'Puzle', kind: 'genre' }],
  status: 'available',
  contentNote: 'Sin violencia.',
  ageHint: '[COMPLETAR]',
  addedAt: '2026-11-01',
};

describe('una página por juego, generada desde games.json', () => {
  it('cada juego tiene su entrada de build en juegos/<id>/index.html', () => {
    const inputs = gameInputs(games);
    expect(Object.keys(inputs)).toEqual([
      'juegos-dead-shift',
      'juegos-apagon',
      'juegos-trazada',
      'juegos-fulgor',
      'juegos-zumbido',
      'juegos-ceniza-y-luz',
      'juegos-cerrojo',
      'juegos-dead-shift-3d',
    ]);
    // En Windows, resolve() antepone la unidad (C:/raiz/...).
    expect(inputs['juegos-dead-shift']).toMatch(/\/raiz\/juegos\/dead-shift\/index\.html$/);
  });

  it('agregar una entrada válida agrega su página sin tocar el código', () => {
    const catalog = validateCatalog([...games, NEW_ENTRY]);
    expect(Object.keys(gameInputs(catalog))).toEqual([
      'juegos-dead-shift',
      'juegos-apagon',
      'juegos-trazada',
      'juegos-fulgor',
      'juegos-zumbido',
      'juegos-ceniza-y-luz',
      'juegos-cerrojo',
      'juegos-dead-shift-3d',
      'juegos-otro-juego',
    ]);
    const html = renderGamePageHtml(catalog[8]!);
    expect(html).toContain('<h1 class="display" id="game-title">Otro juego</h1>');
    expect(html).toContain('<p>Controles: Táctil</p>');
  });
});

describe('página de Dead Shift', () => {
  it('un solo h1, lang="es" y salto al contenido', () => {
    expect(page.match(/<h1\b/g)).toHaveLength(1);
    expect(page).toContain('<html lang="es">');
    expect(page).toContain('href="#contenido"');
    expect(page).toContain('<main id="contenido">');
  });

  it('enlaces del sitio relativos a la raíz desde juegos/<id>/', () => {
    expect(page).toContain('href="../../#juegos"');
    expect(page).toContain('href="../../privacidad/"');
  });

  it('título, descripción, canonical y Open Graph propios', () => {
    const url = 'https://dannnyusssssss.github.io/Cuarto-Juegos/juegos/dead-shift/';
    expect(page).toMatch(/<title>Dead Shift · .+<\/title>/);
    expect(page).toContain(`<meta name="description" content="${deadShift.tagline}" />`);
    expect(page).toContain(`<link rel="canonical" href="${url}" />`);
    expect(page).toContain(`<meta property="og:url" content="${url}" />`);
    expect(page).toContain('<meta property="og:title" content="Dead Shift');
  });

  it('badges, descripción, controles y nota de contenido', () => {
    for (const badge of gameBadges(deadShift)) expect(page).toContain(`>${badge.label}</span>`);
    expect(page).toContain(`<p class="game-detail__description">${deadShift.description}</p>`);
    expect(page).toContain('<p>Controles: Teclado, ratón y táctil</p>');
    expect(page).toContain(`<p>Contenido: ${deadShift.contentNote}</p>`);
    expect(page).toContain(
      `<p>Edad orientativa: <span class="play-panel__age">${deadShift.ageHint}</span></p>`,
    );
  });

  it('"Jugar Dead Shift" es un enlace al juego (funciona sin JavaScript)', () => {
    expect(page).toContain(
      `<a class="btn btn--primary" href="${deadShift.url}" data-game-play data-game-title="Dead Shift" rel="noopener noreferrer">Jugar Dead Shift</a>`,
    );
  });

  it('el HTML no trae iframe: se crea solo al pulsar "Jugar"', () => {
    expect(page).not.toContain('<iframe');
  });

  it('controles fuera del juego: pantalla completa, pestaña nueva y volver al catálogo', () => {
    expect(page).toContain('data-game-fullscreen hidden>Pantalla completa</button>');
    expect(page).toContain(
      `href="${deadShift.url}" target="_blank" rel="noopener noreferrer">Abrir en pestaña nueva</a>`,
    );
    expect(page).toContain('href="../../#juegos">Volver al catálogo</a>');
  });

  it('la ayuda para salir del juego se anuncia a los lectores de pantalla', () => {
    expect(page).toContain(
      '<p class="game-player__help" data-game-help aria-live="polite" hidden></p>',
    );
  });

  it('todos los enlaces https llevan rel="noopener noreferrer"', () => {
    const links = page.match(/<a [^>]*href="https:[^>]*>/g) ?? [];
    expect(links.length).toBeGreaterThan(0);
    for (const link of links) expect(link).toContain('rel="noopener noreferrer"');
  });

  it('carga el script de la página y no tiene scripts ni estilos inline', () => {
    expect(page).toContain('<script type="module" src="/src/game-page.ts"></script>');
    expect(page).not.toMatch(/<script(?![^>]*\bsrc=)[^>]*>/);
    expect(page).not.toMatch(/\sstyle=/);
  });

  it('escapa los textos del catálogo', () => {
    const evil: Game = { ...deadShift, title: '<img src=x onerror=alert(1)>', description: '<b>' };
    const html = renderGamePageHtml(evil);
    expect(html).not.toContain('<img src=x');
    expect(html).not.toContain('<b>');
  });
});

describe('ficha (Game Detail)', () => {
  const main = (html: string) => html.slice(html.indexOf('<main'), html.indexOf('</main>'));

  it('un solo botón primario, dentro del Play Panel, y el ancla #jugar en el panel', () => {
    expect(main(page).match(/btn--primary/g)).toHaveLength(1);
    expect(page).toMatch(/<div class="play-panel" id="jugar"><a class="btn btn--primary"/);
    expect(page.match(/id="jugar"/g)).toHaveLength(1);
  });

  it('la portada grande es la imagen LCP: WebP, sin carga diferida y con prioridad alta', () => {
    expect(page).toContain('<source type="image/webp" srcset="../../games/dead-shift/cover.webp">');
    expect(page).toMatch(
      /<img src="\.\.\/\.\.\/games\/dead-shift\/cover\.png" alt="Portada de Dead Shift" [^>]*loading="eager" decoding="async" fetchpriority="high" class="game-player__cover">/,
    );
  });

  it('la página lleva el color del juego y la portada su nombre de transición', () => {
    expect(page).toContain('<div class="container game-page" data-accent="dead-shift">');
    expect(page).toContain('<div class="game-player__stage" data-game-stage data-vt="dead-shift">');
  });

  it('el vórtice va dentro de la escena, detrás de la portada y nunca sobre los botones', () => {
    expect(page).toContain(
      '<div class="game-player__scene"><div class="game-detail__art" aria-hidden="true">',
    );
    // La escena termina antes de la barra de botones.
    const scene = page.indexOf('class="game-player__scene"');
    expect(scene).toBeGreaterThan(-1);
    expect(page.indexOf('class="game-player__toolbar"')).toBeGreaterThan(scene);
    expect(page.match(/class="game-detail__art"/g)).toHaveLength(1);
    const css = readFileSync(new URL('../src/styles/components.css', import.meta.url), 'utf8');
    expect(css).toMatch(/\.game-player__scene\s*\{[^}]*isolation: isolate;/);
    expect(css).toMatch(/\.game-detail__art\s*\{[^}]*z-index: -1;[^}]*mask-image:/);
    // Game Light: fija a la ventana y detrás del contenido.
    expect(css).toMatch(/\.game-page::before\s*\{[^}]*position: fixed;[^}]*z-index: -1;/);
  });

  it('estado de carga con el título, oculto hasta pulsar «Jugar»', () => {
    expect(page).toContain(
      '<p class="game-player__loading" data-game-loading hidden>Cargando Dead Shift…</p>',
    );
  });

  it('requisitos fieles al catálogo', () => {
    const labels = (game: Game) => gameRequirements(game).map((r) => r.label);
    expect(labels(deadShift)).toEqual([
      'Teclado',
      'Ratón',
      'Pantalla táctil',
      'Pantalla completa',
      'Guarda datos solo en este navegador',
      'Sin cuentas',
    ]);
    const trazada = games.find((game) => game.id === 'trazada')!;
    expect(labels(trazada)).toEqual([
      'Teclado',
      'Pantalla táctil',
      'Pantalla completa',
      'Guarda datos solo en este navegador',
      'Sin cuentas',
    ]);
    // Dead Shift 3D guarda en IndexedDB, no en localStorage: también cuenta.
    const ds3d = games.find((game) => game.id === 'dead-shift-3d')!;
    expect(ds3d.storagePrefix).toBeUndefined();
    expect(labels(ds3d)).toContain('Guarda datos solo en este navegador');
    // Sin embed no hay pantalla completa del sitio; sin datos guardados no se promete nada.
    const bare: Game = { ...deadShift, embed: false };
    delete bare.storagePrefix;
    expect(labels(bare)).toEqual(['Teclado', 'Ratón', 'Pantalla táctil', 'Sin cuentas']);
    for (const label of labels(deadShift)) expect(page).toContain(`<span>${label}</span>`);
  });

  it('los iconos de requisitos son decorativos', () => {
    const icons = page.match(/<svg class="requirement-list__icon"[^>]*>/g) ?? [];
    expect(icons).toHaveLength(gameRequirements(deadShift).length);
    for (const icon of icons) expect(icon).toContain('aria-hidden="true"');
  });

  it('«Más juegos»: hasta 3, sin el actual, primero los que comparten género', () => {
    for (const game of games) {
      const more = selectMoreGames(game, games);
      expect(more.length).toBeLessThanOrEqual(MORE_GAMES_MAX);
      expect(more.map((g) => g.id)).not.toContain(game.id);
      expect(more.every((g) => g.status === 'available')).toBe(true);
    }
    // Dead Shift (zombis) prioriza a Dead Shift 3D, que comparte género.
    expect(selectMoreGames(deadShift, games)[0]!.id).toBe('dead-shift-3d');
    const html = main(page);
    const section = html.slice(html.indexOf('<section class="more-games"'));
    expect(section).not.toContain('data-accent="dead-shift"');
    expect(section.match(/<li data-accent=/g)).toHaveLength(MORE_GAMES_MAX);
  });

  it('cada nombre de transición aparece como máximo una vez en cada página generada', () => {
    for (const vp of sitePages(games)) {
      const html = renderVirtualPage(vp);
      const names = [...html.matchAll(/data-vt="([^"]+)"/g)].map(([, id]) => id);
      expect(new Set(names).size, vp.href).toBe(names.length);
    }
  });
});

describe('variantes de la página', () => {
  it('sin embed: "Jugar" es un enlace directo y no hay reproductor', () => {
    const html = renderGamePageHtml({ ...deadShift, embed: false });
    expect(html).not.toContain('data-game-stage');
    expect(html).toContain(
      `<a class="btn btn--primary" href="${deadShift.url}" rel="noopener noreferrer">Jugar Dead Shift</a>`,
    );
  });

  it('en desarrollo: sin "Jugar" ni reproductor', () => {
    const html = renderGamePageHtml({ ...deadShift, status: 'in-development' });
    expect(html).not.toContain('>Jugar Dead Shift<');
    expect(html).not.toContain('data-game-play');
    expect(html).not.toContain('data-game-stage');
  });
});

describe('iframe del juego', () => {
  it('sandbox y permisos exactos', () => {
    expect(GAME_FRAME_ATTRIBUTES).toEqual({
      sandbox: 'allow-scripts allow-same-origin allow-pointer-lock',
      allow:
        "fullscreen; camera 'none'; microphone 'none'; geolocation 'none'; " +
        "display-capture 'none'; usb 'none'; serial 'none'; hid 'none'; bluetooth 'none'; " +
        "payment 'none'",
      referrerpolicy: 'strict-origin-when-cross-origin',
      loading: 'lazy',
    });
    expect(gameFrameTitle('Dead Shift')).toBe('Dead Shift (juego)');
  });

  it('allow solo concede la pantalla completa; lo demás que nombra lo niega', () => {
    const [first, ...rest] = GAME_FRAME_ATTRIBUTES.allow.split('; ');
    expect(first).toBe('fullscreen');
    for (const directive of rest) expect(directive).toMatch(/^[a-z-]+ 'none'$/);
    for (const feature of ['camera', 'microphone', 'geolocation']) {
      expect(rest).toContain(`${feature} 'none'`);
    }
  });

  it('nunca permite popups, ventanas modales, formularios ni navegar la página superior', () => {
    expect(GAME_FRAME_ATTRIBUTES.sandbox).not.toMatch(/allow-(popups|modals|forms|top-navigation)/);
  });
});

describe('controles en texto', () => {
  it('une los controles en español', () => {
    expect(controlsText(['keyboard'])).toBe('Teclado');
    expect(controlsText(['keyboard', 'mouse'])).toBe('Teclado y ratón');
    expect(controlsText(['keyboard', 'mouse', 'touch'])).toBe('Teclado, ratón y táctil');
  });

  it('el ratón no tiene badge propio', () => {
    expect(gameBadges(deadShift).map((b) => b.label)).not.toContain('Ratón');
  });
});

describe('página 404', () => {
  const html = applyPartials(
    readFileSync(new URL('../404.html', import.meta.url), 'utf8'),
    PARTIALS,
  );

  it('un solo h1, no se indexa y enlaza al inicio', () => {
    expect(html.match(/<h1\b/g)).toHaveLength(1);
    expect(html).toContain('Página no encontrada');
    expect(html).toContain('<meta name="robots" content="noindex" />');
    expect(html).not.toContain('rel="canonical"');
    expect(html).toContain('>Volver al inicio</a>');
  });
});
