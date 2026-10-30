import { describe, expect, it } from 'vitest';
import { loadCatalog } from '../build/catalog.ts';
import { absolutizeRootPaths, buildCsp, frameSources } from '../build/csp.ts';
import type { Game } from '../src/data/games.schema.ts';

const games = loadCatalog();
const deadShift = games[0]!;
const csp = buildCsp(games);
const directive = (name: string) =>
  csp
    .split('; ')
    .find((d) => d.startsWith(`${name} `))
    ?.slice(name.length + 1);

describe('Content-Security-Policy', () => {
  it('todo desde el propio sitio por defecto', () => {
    expect(directive('default-src')).toBe("'self'");
    expect(directive('script-src')).toBe("'self'");
    expect(directive('style-src')).toBe("'self'");
    expect(directive('img-src')).toBe("'self' data:");
    expect(directive('font-src')).toBe("'self'");
    expect(directive('connect-src')).toBe("'self'");
    expect(directive('object-src')).toBe("'none'");
  });

  it('sin unsafe-inline, unsafe-eval ni comodines', () => {
    expect(csp).not.toMatch(/unsafe-inline|unsafe-eval|\*/);
  });

  it('frame-src solo permite el origen de Dead Shift', () => {
    expect(directive('frame-src')).toBe('https://dannnyusssssss.github.io');
  });

  it('frame-src se deriva del catálogo: orígenes únicos de los juegos embebibles y disponibles', () => {
    const other: Game = { ...deadShift, id: 'otro', url: 'https://ejemplo.com/otro/' };
    const relative: Game = { ...deadShift, id: 'local', url: 'juegos-locales/x/' };
    const notEmbedded: Game = { ...deadShift, id: 'no', url: 'https://no.example/', embed: false };
    const wip: Game = {
      ...deadShift,
      id: 'wip',
      url: 'https://wip.example/',
      status: 'in-development',
    };
    expect(frameSources([deadShift, deadShift, other, relative, notEmbedded, wip])).toEqual([
      "'self'",
      'https://dannnyusssssss.github.io',
      'https://ejemplo.com',
    ]);
  });

  it('sin juegos embebibles, frame-src es none', () => {
    expect(frameSources([{ ...deadShift, embed: false }])).toEqual(["'none'"]);
  });
});

describe('404 con rutas absolutas', () => {
  it('convierte las rutas relativas a la raíz y deja intactos anclas y mailto', () => {
    const html =
      '<link rel="stylesheet" href="./assets/a.css"><a href="./#juegos">x</a>' +
      '<a href="#contenido">y</a><a href="mailto:a">z</a><img src="./games/x.svg">';
    expect(absolutizeRootPaths(html, '/Cuarto-Juegos/')).toBe(
      '<link rel="stylesheet" href="/Cuarto-Juegos/assets/a.css"><a href="/Cuarto-Juegos/#juegos">x</a>' +
        '<a href="#contenido">y</a><a href="mailto:a">z</a><img src="/Cuarto-Juegos/games/x.svg">',
    );
  });
});
