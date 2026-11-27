import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { loadCatalog } from '../build/catalog.ts';
import {
  GAME_THEME_MODULE,
  coverTransitionName,
  gameTheme,
  gameThemeCss,
} from '../build/game-theme.ts';

const games = loadCatalog();
const css = gameThemeCss(games);

/** Contenido de un bloque `@media (<condición>){…}` del CSS generado. */
function mediaBlock(condition: string): string {
  const start = css.indexOf(`@media (${condition}){`);
  expect(start, condition).toBeGreaterThanOrEqual(0);
  return css.slice(start, css.indexOf('\n}', start));
}

describe('CSS generado desde el catálogo', () => {
  it('una regla de color por juego, con su color del catálogo', () => {
    for (const game of games) {
      const rules = css.match(new RegExp(`^\\[data-accent="${game.id}"\\]\\{[^}]*\\}$`, 'gm'));
      expect(rules, game.id).toEqual([`[data-accent="${game.id}"]{--game-accent:${game.color}}`]);
    }
  });

  it('un nombre de transición por juego, todos distintos y solo con reducir movimiento desactivado', () => {
    const names = [...css.matchAll(/view-transition-name:([^}]+)\}/g)].map(([, name]) => name);
    expect(names).toEqual(games.map((game) => coverTransitionName(game.id)));
    expect(new Set(names).size).toBe(names.length);
    const motion = mediaBlock('prefers-reduced-motion:no-preference');
    for (const name of names) expect(motion).toContain(`view-transition-name:${name}}`);
  });

  it('el tinte del catálogo al pasar el puntero va dentro de (hover:hover); con el foco, siempre', () => {
    const hover = mediaBlock('hover:hover');
    for (const game of games) {
      expect(hover).toContain(`[data-catalog]:has([data-accent="${game.id}"]:hover)`);
      expect(css).toContain(
        `[data-catalog]:has([data-accent="${game.id}"]:focus-within){--catalog-accent:${game.color}}`,
      );
    }
  });

  it('solo slugs, colores #rrggbb y la sintaxis fija del generador', () => {
    const allowed = css
      .replace(/^\/\*[^*]*\*\/$/m, '')
      .replace(/\[data-(?:accent|vt)="[a-z0-9-]+"\]/g, '')
      .replace(/#[0-9a-f]{6}/g, '')
      .replace(/cover-[a-z0-9-]+/g, '');
    expect(allowed).toMatch(/^[a-z:(){}[\]@ \-\n]*$/);
    expect(css).not.toMatch(/url\(|@import|expression|\\|;/i);
  });

  it('un id o un color hostil detienen el build en vez de escribirse', () => {
    expect(() => gameThemeCss([{ id: 'x"]{}body{display:none}[a="', color: '#000000' }])).toThrow(
      /id de juego no válido/,
    );
    expect(() => gameThemeCss([{ id: 'Dead Shift' }])).toThrow(/id de juego no válido/);
    for (const color of ['#000000;}body{display:none', 'url(https://ajeno.example/x)', 'red']) {
      expect(() => gameThemeCss([{ id: 'ok', color }]), color).toThrow(/color no válido/);
    }
  });

  it('un juego sin color no lleva regla de color (queda el violeta)', () => {
    const out = gameThemeCss([{ id: 'sin-color' }]);
    expect(out).not.toContain('--game-accent');
    expect(out).toContain('[data-vt="sin-color"]{view-transition-name:cover-sin-color}');
  });

  it('el plugin sirve el módulo virtual y main.ts lo importa', () => {
    const plugin = gameTheme(() => games);
    const resolveId = plugin.resolveId as (id: string) => string | null;
    const resolved = resolveId(GAME_THEME_MODULE);
    expect(resolved).toMatch(/\.css$/);
    expect(resolveId('otro.css')).toBeNull();
    const main = readFileSync(new URL('../src/main.ts', import.meta.url), 'utf8');
    expect(main).toContain(`import '${GAME_THEME_MODULE}';`);
  });
});

describe('transiciones entre páginas', () => {
  const base = readFileSync(new URL('../src/styles/base.css', import.meta.url), 'utf8').replace(
    /\/\*[\s\S]*?\*\//g,
    '',
  );
  const motionStart = base.indexOf('@media (prefers-reduced-motion: no-preference) {');
  const motionEnd = base.indexOf('\n}\n', motionStart);
  const inside = base.slice(motionStart, motionEnd);
  const outside = base.slice(0, motionStart) + base.slice(motionEnd);

  it('@view-transition, nombres y desplazamiento suave solo sin reducir movimiento', () => {
    expect(motionStart).toBeGreaterThanOrEqual(0);
    expect(inside).toContain('@view-transition {\n    navigation: auto;\n  }');
    expect(inside).toContain('scroll-behavior: smooth;');
    expect(inside).toContain('view-transition-name: site-header;');
    expect(inside).toContain('animation-duration: var(--duration-page);');
    expect(outside).not.toMatch(/@view-transition|view-transition-name|scroll-behavior: smooth/);
    for (const file of ['components.css', 'styleguide.css']) {
      const css = readFileSync(new URL(`../src/styles/${file}`, import.meta.url), 'utf8');
      expect(css, file).not.toMatch(/@view-transition|view-transition-name/);
    }
  });

  it('en el inicio cada portada del catálogo tiene su nombre una sola vez y el hero no lleva ninguno', async () => {
    const { applyPartials } = await import('../build/html-partials.ts');
    const { PARTIALS } = await import('../build/pages.ts');
    const home = applyPartials(
      readFileSync(new URL('../index.html', import.meta.url), 'utf8'),
      PARTIALS,
    );
    const names = [...home.matchAll(/data-vt="([^"]+)"/g)].map(([, id]) => id);
    expect(names).toEqual(games.map((game) => game.id));
    const hero = home.slice(home.indexOf('class="hero'), home.indexOf('id="juegos"'));
    expect(hero).not.toContain('data-vt=');
  });
});
