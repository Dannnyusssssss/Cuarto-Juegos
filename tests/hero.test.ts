import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  finishSweep,
  initialHeroState,
  isSafeHref,
  isSafeSlug,
  nextIndex,
  pressedStates,
  selectSlide,
  shouldAutoplay,
  type AutoplayConditions,
} from '../src/hero.ts';

describe('lógica del hero', () => {
  it('estado inicial: primera activa, sin barrido', () => {
    expect(initialHeroState()).toEqual({ active: 0, sweeping: false });
  });

  it('elegir otro índice da el siguiente estado y entre qué diapositivas se barre', () => {
    const change = selectSlide(initialHeroState(), 2, 3);
    expect(change).toEqual({ state: { active: 2, sweeping: true }, from: 0, to: 2 });
  });

  it('el mismo índice no hace nada', () => {
    expect(selectSlide({ active: 1, sweeping: false }, 1, 3)).toBeNull();
  });

  it('fuera de rango o no entero no hace nada', () => {
    for (const index of [-1, 3, 99, 1.5, Number.NaN]) {
      expect(selectSlide(initialHeroState(), index, 3), String(index)).toBeNull();
    }
  });

  it('un clic durante el barrido se ignora; al terminar vuelve a funcionar', () => {
    const change = selectSlide(initialHeroState(), 1, 3)!;
    expect(selectSlide(change.state, 2, 3)).toBeNull();
    const done = finishSweep(change.state);
    expect(done).toEqual({ active: 1, sweeping: false });
    expect(selectSlide(done, 2, 3)?.to).toBe(2);
  });

  it('aria-pressed: solo la activa', () => {
    expect(pressedStates(0, 3)).toEqual([true, false, false]);
    expect(pressedStates(2, 3)).toEqual([false, false, true]);
  });

  it('isSafeHref acepta rutas del sitio y rechaza esquemas y //', () => {
    expect(isSafeHref('./juegos/dead-shift/')).toBe(true);
    expect(isSafeHref('../juegos/x/')).toBe(true);
    const bad = [
      '',
      'javascript:alert(1)',
      'JavaScript:x',
      ' javascript:alert(1)',
      'java\tscript:alert(1)',
      '\x01javascript:alert(1)',
      'https://ajeno/',
      'data:x',
      '//ajeno/',
      '/\\ajeno.example/',
      '\\\\ajeno.example/',
      './juegos/x/?debug=1',
      './juegos/x/#y',
    ];
    for (const href of bad) expect(isSafeHref(href), href).toBe(false);
  });
});

describe('avance automático (lógica)', () => {
  const free: AutoplayConditions = {
    paused: false,
    pointerInside: false,
    focusInside: false,
    tabHidden: false,
    reducedMotion: false,
    sweeping: false,
  };

  it('nextIndex es cíclico', () => {
    expect(nextIndex(0, 3)).toBe(1);
    expect(nextIndex(1, 3)).toBe(2);
    expect(nextIndex(2, 3)).toBe(0);
    expect(nextIndex(0, 1)).toBe(0);
  });

  it('nextIndex con entradas inválidas vuelve a 0', () => {
    expect(nextIndex(0, 0)).toBe(0);
    expect(nextIndex(Number.NaN, 3)).toBe(0);
    expect(nextIndex(1, 2.5)).toBe(0);
  });

  it('avanza solo si no hay ninguna condición de pausa', () => {
    expect(shouldAutoplay(free)).toBe(true);
  });

  it('cada condición por separado lo detiene', () => {
    const keys = Object.keys(free) as (keyof AutoplayConditions)[];
    expect(keys).toHaveLength(6);
    for (const key of keys) {
      expect(shouldAutoplay({ ...free, [key]: true }), key).toBe(false);
    }
  });
});

describe('scripts del navegador del inicio y de la ficha', () => {
  for (const file of ['home-page.ts', 'hero.ts', 'catalog-filter.ts', 'game-page.ts']) {
    const source = readFileSync(new URL(`../src/${file}`, import.meta.url), 'utf8');

    it(`${file}: no usa APIs prohibidas`, () => {
      expect(source).not.toMatch(
        /innerHTML|outerHTML|insertAdjacentHTML|srcdoc|setHTMLUnsafe|parseHTMLUnsafe|createContextualFragment|eval\(|new Function|document\.write|DOMParser|setAttribute\(\s*['"]style['"]/,
      );
    });

    it(`${file}: no lee la URL ni guarda nada (el sitio no recolecta datos)`, () => {
      expect(source).not.toMatch(
        /\blocation\b|localStorage|sessionStorage|indexedDB|URLSearchParams|document\.cookie|postMessage|\bfetch\(|XMLHttpRequest|sendBeacon/,
      );
    });
  }

  it('cada data-href generado en el build pasa isSafeHref', async () => {
    const { renderHome } = await import('../src/pages/home.ts');
    const { loadCatalog } = await import('../build/catalog.ts');
    const html = renderHome(loadCatalog());
    const hrefs = [...html.matchAll(/data-href="([^"]*)"/g)].map((m) => m[1] ?? '');
    expect(hrefs.length).toBeGreaterThan(0);
    for (const href of hrefs) expect(isSafeHref(href), href).toBe(true);
  });
});

describe('home-page.ts', () => {
  const script = readFileSync(new URL('../src/home-page.ts', import.meta.url), 'utf8');

  it('gestiona la pausa del avance: pestaña, puntero, foco y movimiento reducido', () => {
    expect(script).toContain("addEventListener('visibilitychange'");
    expect(script).toContain("addEventListener('pointerenter'");
    expect(script).toContain("addEventListener('pointerleave'");
    expect(script).toContain("addEventListener('focusin'");
    expect(script).toContain("addEventListener('focusout'");
    expect(script).toContain('matchMedia(');
    expect(script).toMatch(/reducedMotion\.addEventListener\('change'/);
    expect(script).toContain('--duration-autoplay');
  });

  it('la leyenda pasa de aria-live off (avance solo) a polite (usuario o pausa)', () => {
    expect(script).toMatch(/setAttribute\('aria-live', polite \? 'polite' : 'off'\)/);
    expect(script).toContain('goTo(index, true)');
    expect(script).toContain('nextIndex(state.active, slides.length), false');
  });

  it('actualiza el href de la portada junto con el del botón primario', () => {
    expect(script).toContain("cover?.setAttribute('href', href)");
  });

  it('respeta prefers-reduced-motion y solo precarga tras load', () => {
    expect(script).toContain('prefers-reduced-motion: reduce');
    expect(script).toContain("addEventListener('load'");
  });
});

describe('CSS del barrido', () => {
  const css = readFileSync(new URL('../src/styles/components.css', import.meta.url), 'utf8');

  it('registra la propiedad y anima solo con movimiento permitido', () => {
    expect(css).toMatch(/@property --hero-sweep\s*\{[^}]*<percentage>[^}]*inherits: false/);
    const outside = css.replace(
      /@media \(prefers-reduced-motion: no-preference\) \{[\s\S]*?\n\}\n/g,
      '',
    );
    expect(outside).not.toMatch(/animation-name: hero-(?:sweep|push)/);
  });
});

describe('datos que llegan al navegador', () => {
  it('ni home-page.ts ni nada que importe (recursivo) trae módulos de datos al JS publicado', () => {
    const seen = new Set<string>();
    const visit = (url: URL): void => {
      if (seen.has(url.href)) return;
      seen.add(url.href);
      const source = readFileSync(url, 'utf8');
      for (const [, spec = ''] of source.matchAll(/(?:from|import)\s*\(?\s*['"]([^'"]+)['"]/g)) {
        expect(spec, `${url.pathname} importa ${spec}`).not.toMatch(/\/data\//);
        // Solo módulos propios (rutas relativas); un paquete externo en el navegador también falla.
        expect(spec.startsWith('.'), `${url.pathname} importa ${spec}`).toBe(true);
        visit(new URL(spec, url));
      }
    };
    visit(new URL('../src/home-page.ts', import.meta.url));
    expect(seen.size).toBeGreaterThan(1);
  });

  it('géneros distintos del catálogo dan valores de filtro distintos y no vacíos', async () => {
    const { genreSlug } = await import('../src/catalog-filter.ts');
    const { loadCatalog } = await import('../build/catalog.ts');
    const labels = new Set(
      loadCatalog().flatMap((g) => g.tags.filter((t) => t.kind === 'genre').map((t) => t.label)),
    );
    const slugs = [...labels].map((label) => genreSlug(label));
    for (const slug of slugs) expect(slug).not.toBe('');
    expect(new Set(slugs).size).toBe(labels.size);
  });

  it('cada diapositiva trae el texto de su botón primario generado en el build', async () => {
    const { renderHome } = await import('../src/pages/home.ts');
    const { selectFeatured } = await import('../src/data/home.ts');
    const { loadCatalog } = await import('../build/catalog.ts');
    const games = loadCatalog();
    const html = renderHome(games);
    for (const game of selectFeatured(games)) {
      expect(html).toContain(`data-play="Jugar ${game.title}"`);
    }
  });
});

describe('CSS del efecto al desplazar', () => {
  const css = readFileSync(new URL('../src/styles/components.css', import.meta.url), 'utf8');

  it('animation-timeline solo dentro de @supports y de movimiento permitido', () => {
    const block =
      /@supports \(animation-timeline: scroll\(\)\) \{\s*@media \(prefers-reduced-motion: no-preference\) \{[\s\S]*?\n {2}\}\n\}\n/;
    expect(css).toMatch(block);
    // La entrada de las tarjetas (view()) tiene su propio bloque protegido: se prueba en catalog-filter.test.ts.
    const viewBlock =
      /@supports \(animation-timeline: view\(\)\) \{\s*@media \(prefers-reduced-motion: no-preference\) \{[\s\S]*?\n {2}\}\n\}\n/;
    const withoutComments = css
      .replace(block, '')
      .replace(new RegExp(viewBlock.source, 'g'), '')
      .replace(/\/\*[\s\S]*?\*\//g, '');
    expect(withoutComments).not.toMatch(/animation-timeline/);
  });

  it('una miniatura enfocada nunca queda atenuada', () => {
    expect(css).toMatch(/\.hero__rail:focus-within\s*\{\s*animation: none;/);
  });

  it('home-page.ts no escucha el scroll (el efecto es solo CSS)', () => {
    const script = readFileSync(new URL('../src/home-page.ts', import.meta.url), 'utf8');
    expect(script).not.toMatch(/['"]scroll['"]|onscroll/);
  });
});

describe('CSS del vórtice', () => {
  const css = readFileSync(new URL('../src/styles/components.css', import.meta.url), 'utf8');

  it('entrada y giro del vórtice solo con movimiento permitido', () => {
    const outside = css.replace(
      /@media \(prefers-reduced-motion: no-preference\) \{[\s\S]*?\n\}\n/g,
      '',
    );
    expect(css).toMatch(
      /\.portal-art--turn\s*\{[^}]*animation: portal-turn var\(--duration-slide\) var\(--ease-move\)/,
    );
    expect(css).toMatch(/\.hero__art\s*\{[^}]*animation: hero-art-enter/);
    expect(outside).not.toMatch(/animation:\s*(?:portal-turn|hero-art-enter)/);
    expect(outside).not.toContain('.portal-art--turn');
  });

  it('el efecto al desplazar se aplica al conjunto vórtice + tarjeta', () => {
    expect(css).toMatch(/\.hero__media\s*\{\s*animation: hero-lag linear both;/);
    expect(css).not.toMatch(/\.hero__slides\s*\{\s*animation: hero-lag/);
  });

  it('ya no hay velo ni fundido sobre una imagen a sangre', () => {
    expect(css).not.toMatch(/\.hero__media::(?:before|after)/);
  });

  it('la tarjeta del hero: 16:9, obsidiana, radio y sombra por token, imagen recortada', () => {
    const card = css.match(/\.hero__card\s*\{[^}]*\}/)?.[0] ?? '';
    expect(card).toContain('aspect-ratio: 16 / 9');
    expect(card).toContain('background: var(--surface-obsidian)');
    expect(card).toContain('border-radius: var(--radius-cards)');
    expect(card).toContain('box-shadow: var(--shadow-xl)');
    expect(card).toContain('overflow: clip');
    expect(css).toMatch(/\.hero__slide img\s*\{[^}]*object-fit: cover/);
  });
});

describe('color del juego en el vórtice (Game Accent)', () => {
  it('isSafeSlug solo acepta ids de juego', () => {
    for (const ok of ['dead-shift', 'trazada', 'dead-shift-3d'])
      expect(isSafeSlug(ok), ok).toBe(true);
    for (const bad of ['', 'Dead', 'a"]', 'a b', '-a', 'a-', 'a--b', 'x}body{', '../x']) {
      expect(isSafeSlug(bad), bad).toBe(false);
    }
  });

  it('el hero lleva el color del primer destacado y cada diapositiva su id', async () => {
    const { renderHome } = await import('../src/pages/home.ts');
    const { loadCatalog } = await import('../build/catalog.ts');
    const { selectFeatured } = await import('../src/data/home.ts');
    const games = loadCatalog();
    const html = renderHome(games);
    const featured = selectFeatured(games);
    expect(html).toContain(
      `<section class="hero" aria-labelledby="hero-title" data-accent="${featured[0]!.id}">`,
    );
    for (const game of featured) expect(html).toContain(`data-game="${game.id}"`);
    expect(html).toMatch(
      /<section class="section catalog" id="juegos" aria-labelledby="juegos-title" data-catalog><div class="catalog__backdrop" aria-hidden="true">/,
    );
  });

  it('home-page.ts solo escribe data-accent con un id validado (nunca estilos)', () => {
    const script = readFileSync(new URL('../src/home-page.ts', import.meta.url), 'utf8');
    expect(script).toContain('if (isSafeSlug(game)) hero.dataset.accent = game;');
    expect(script.match(/dataset\.accent\s*=/g)).toHaveLength(1);
    expect(script).not.toMatch(/\.style\b|setProperty/);
  });
});
