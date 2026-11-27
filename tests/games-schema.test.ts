import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { checkAssets, loadCatalog, svgProblems } from '../build/catalog.ts';
import { frameSources } from '../build/csp.ts';
import { GAME_ORIGINS } from '../src/data/embed.ts';
import { SITE } from '../src/data/site.ts';
import {
  CatalogError,
  checkGameUrl,
  TEXT_MAX,
  validateCatalog,
  type Game,
} from '../src/data/games.schema.ts';

const raw = JSON.parse(
  readFileSync(new URL('../src/data/games.json', import.meta.url), 'utf8'),
) as Game[];
const base = raw[0]!;

/** Valida una copia de la primera entrada con cambios y devuelve los problemas. */
function problemsFor(patch: Record<string, unknown>, extra: unknown[] = []): string[] {
  try {
    validateCatalog([{ ...base, ...patch }, ...extra]);
    return [];
  } catch (error) {
    expect(error).toBeInstanceOf(CatalogError);
    return (error as CatalogError).problems;
  }
}

describe('games.json real', () => {
  it('es válido y Dead Shift es la primera entrada', () => {
    const games = loadCatalog();
    expect(games[0]?.id).toBe('dead-shift');
  });

  it('todas las portadas y capturas existen en public/', () => {
    expect(checkAssets(loadCatalog())).toEqual([]);
  });

  it('cada juego tiene su portada .webp en public/', () => {
    for (const game of loadCatalog()) {
      if (!/\.(?:png|jpe?g)$/i.test(game.cover)) continue;
      const webp = game.cover.replace(/\.(?:png|jpe?g)$/i, '.webp');
      expect(existsSync(new URL(`../public/${webp}`, import.meta.url)), game.id).toBe(true);
    }
  });

  it('los SVG publicados (portadas y favicon) no llevan contenido activo', () => {
    for (const path of ['favicon.svg']) {
      const svg = readFileSync(new URL(`../public/${path}`, import.meta.url), 'utf8');
      expect(svgProblems(svg), path).toEqual([]);
    }
  });

  it.each([
    ['<svg><script>alert(document.domain)</script></svg>', /<script>/],
    ['<svg><rect onload="alert(1)"/></svg>', /manejadores/],
    ['<svg><rect\nONCLICK = "x"/></svg>', /manejadores/],
    ['<svg><foreignObject><div>x</div></foreignObject></svg>', /foreignObject/],
    ['<svg><a href="javascript:alert(1)"><text>x</text></a></svg>', /javascript/],
    ['<svg:svg xmlns:svg="x"><svg:script>alert(1)</svg:script></svg:svg>', /<script>/],
    ['<svg><x:foreignObject/></svg>', /foreignObject/],
    ['<svg><a href="javascript&#58;alert(1)"><text>x</text></a></svg>', /javascript/],
    ['<svg><set attributeName="href" to="JavaScript&#x3A;alert(1)"/></svg>', /javascript/],
  ])('detecta contenido activo en un SVG: %s', (svg, message) => {
    expect(svgProblems(svg).join()).toMatch(message);
  });

  it('la edad orientativa es la que decidió el responsable (no una clasificación oficial)', () => {
    expect(base.ageHint).toBe('12+');
  });
});

describe('validación del esquema', () => {
  it('la raíz debe ser una lista', () => {
    expect(() => validateCatalog({})).toThrow(CatalogError);
  });

  it.each([
    ['javascript:alert(1)', /https/],
    ['data:text/html,hola', /https/],
    ['http://ejemplo.com/', /https/],
    ['//ejemplo.com/juego', /sin esquema/],
    ['https://ejemplo.com/?debug', /depuración/],
    ['juego/?god=1', /depuración/],
    ['https://ejemplo.com/juego/?spawn=5', /parámetros \(spawn\)/],
    ['https://ejemplo.com/juego/?', /parámetros/],
    ['', /vacía/],
    ['https://ejemplo.com/juego/', /origen no permitido/],
    ['https://dannnyusssssss.github.io.ejemplo.com/juego/', /origen no permitido/],
    ['https://ejemplo.github.io/juego/', /origen no permitido/],
    ['https://dannnyusssssss.github.io:8443/juego/', /origen no permitido/],
    ['https://usuario@dannnyusssssss.github.io/juego/', /usuario ni contraseña/],
    ['https://dannnyusssssss.github.io/juego/#god=1', /fragmentos/],
    ['juego/#debug', /fragmentos/],
  ])('rechaza la url %s', (url, message) => {
    expect(problemsFor({ url }).join('\n')).toMatch(message);
  });

  it.each([
    'https://dannnyusssssss.github.io/juego/',
    'games/dead-shift/play/',
    './juego/index.html',
  ])('acepta la url %s', (url) => {
    expect(checkGameUrl(url)).toBeNull();
  });

  /*
   * URLs que parecen relativas o inofensivas aquí, pero que el navegador abre en otro origen o
   * como javascript: (quita tabuladores, saltos de línea y controles, y lee «\» como «/»).
   */
  it.each([
    ['tabulador en el esquema', 'ht\ttps://ejemplo.com/'],
    ['tabulador en javascript:', 'java\tscript:alert(1)'],
    ['salto de línea en javascript:', 'java\nscript:alert(1)'],
    ['control al inicio', '\u0001javascript:alert(1)'],
    ['barra invertida tras la barra', '/\\ejemplo.com/'],
    ['dos barras invertidas', '\\\\ejemplo.com/'],
    ['barra invertida y barra', '\\/ejemplo.com/'],
    ['tabulador entre barras', '/\t/ejemplo.com/'],
    ['espacio al final', 'juego/ '],
    ['espacio sin separar', `juego${String.fromCodePoint(0xa0)}/`],
    ['carácter invisible', `juego${String.fromCodePoint(0x200b)}/`],
    ['cambio de dirección del texto', `juego${String.fromCodePoint(0x202e)}/`],
  ])('rechaza la url con %s', (_caso, url) => {
    expect(problemsFor({ url }).join('\n')).toMatch(
      /espacios, caracteres de control o invisibles ni barras invertidas/,
    );
  });

  it('cada url que rechaza por caracteres raros la abriría el navegador fuera de lo validado', () => {
    // Prueba de que el riesgo es real: el analizador del navegador (WHATWG) las reinterpreta.
    const base = `${SITE.url}${SITE.basePath}`;
    expect(new URL('ht\ttps://ejemplo.com/', base).origin).toBe('https://ejemplo.com');
    expect(new URL('/\\ejemplo.com/', base).origin).toBe('https://ejemplo.com');
    expect(new URL('java\tscript:alert(1)', base).protocol).toBe('javascript:');
  });

  it('la lista blanca de orígenes es solo el origen propio del sitio', () => {
    expect(GAME_ORIGINS).toEqual([new URL(SITE.url).origin]);
  });

  it('un juego de un origen ajeno hace fallar la validación del catálogo (y con ella el build)', () => {
    expect(() => validateCatalog([{ ...base, url: 'https://ejemplo.com/juego/' }])).toThrow(
      /url: origen no permitido \(https:\/\/ejemplo\.com\)/,
    );
  });

  it('frame-src del catálogo real solo contiene orígenes de la lista blanca', () => {
    for (const source of frameSources(loadCatalog())) expect(GAME_ORIGINS).toContain(source);
  });

  it('tagline de máximo 90 caracteres', () => {
    expect(problemsFor({ tagline: 'a'.repeat(90) })).toEqual([]);
    expect(problemsFor({ tagline: 'a'.repeat(91) })).toEqual(['[0].tagline: máx. 90 caracteres']);
  });

  it.each([
    ['title', TEXT_MAX.title],
    ['description', TEXT_MAX.description],
    ['contentNote', TEXT_MAX.contentNote],
    ['ageHint', TEXT_MAX.ageHint],
  ] as const)('%s: tiene un tope de %i caracteres', (field, max) => {
    expect(problemsFor({ [field]: 'a'.repeat(max) })).toEqual([]);
    expect(problemsFor({ [field]: 'a'.repeat(max + 1) })).toEqual([
      `[0].${field}: máx. ${max} caracteres`,
    ]);
  });

  it('una descripción de 2 MB se rechaza', () => {
    expect(problemsFor({ description: 'a'.repeat(2 * 1024 * 1024) }).join()).toMatch(/máx\./);
  });

  it.each([
    ['nulo', 0x0],
    ['campana', 0x7],
    ['tabulador', 0x9],
    ['salto de línea', 0xa],
    ['control C1', 0x85],
    ['guion suave', 0xad],
    ['espacio de ancho cero', 0x200b],
    ['marca de derecha a izquierda', 0x200f],
    ['separador de línea', 0x2028],
    ['inversión de dirección (U+202E)', 0x202e],
    ['aislamiento de dirección', 0x2066],
    ['marca de orden de bytes', 0xfeff],
  ])('los textos rechazan el carácter %s', (_nombre, code) => {
    const bad = `Juego${String.fromCodePoint(code)}x`;
    const message = /caracteres de control, invisibles ni de dirección del texto/;
    for (const field of ['title', 'tagline', 'description', 'contentNote', 'ageHint']) {
      expect(problemsFor({ [field]: bad }).join(), field).toMatch(message);
    }
    expect(problemsFor({ tags: [{ label: bad, kind: 'genre' }] }).join()).toMatch(message);
  });

  it('los textos aceptan tildes, eñes, signos de apertura y espacios sin separación', () => {
    const nbsp = String.fromCodePoint(0xa0);
    expect(problemsFor({ title: `¿Señal? Árbol${nbsp}12 «sí» — ok…` })).toEqual([]);
  });

  it('indexedDb: sus textos siguen las mismas reglas', () => {
    const indexedDb = { folder: 'x', clearButton: 'Borrar', clearIn: 'el menú' };
    expect(problemsFor({ indexedDb })).toEqual([]);
    expect(
      problemsFor({ indexedDb: { ...indexedDb, clearButton: 'a'.repeat(61) } }).join(),
    ).toMatch(/indexedDb\.clearButton: máx\. 60/);
    expect(
      problemsFor({
        indexedDb: { ...indexedDb, clearIn: `menú${String.fromCodePoint(0x202e)}` },
      }).join(),
    ).toMatch(/indexedDb\.clearIn: no puede tener caracteres de control/);
  });

  it('id: slug y único', () => {
    expect(problemsFor({ id: 'Dead Shift' }).join()).toMatch(/slug/);
    expect(problemsFor({}, [{ ...base }]).join()).toMatch(/repetido/);
  });

  it('indexedDb: opcional, con carpeta slug única y textos del botón del juego', () => {
    const db = { folder: 'mi-juego', clearButton: 'Borrar datos', clearIn: 'el menú' };
    expect(problemsFor({ indexedDb: db })).toEqual([]);
    expect(problemsFor({ indexedDb: 'mi-juego' })).toContain(
      '[0].indexedDb: debe ser { folder, clearButton, clearIn }',
    );
    expect(problemsFor({ indexedDb: { ...db, folder: '../otro' } }).join()).toMatch(
      /indexedDb\.folder: debe ser un slug/,
    );
    expect(problemsFor({ indexedDb: { ...db, clearButton: ' ' } })).toContain(
      '[0].indexedDb.clearButton: debe ser un texto no vacío',
    );
    expect(problemsFor({ indexedDb: { folder: 'mi-juego', clearButton: 'x' } })).toContain(
      '[0].indexedDb.clearIn: debe ser un texto no vacío',
    );
    expect(problemsFor({ indexedDb: { ...db, extra: 1 } })).toContain(
      '[0].indexedDb.extra: campo desconocido',
    );
    expect(
      problemsFor({ indexedDb: db }, [
        { ...base, id: 'otro', storagePrefix: 'otro:', indexedDb: db },
      ]),
    ).toContain('[1].indexedDb.folder: "mi-juego" está repetido');
  });

  it('rechaza campos desconocidos y exige los obligatorios', () => {
    expect(problemsFor({ titel: 'x' })).toContain('[0].titel: campo desconocido');
    const withoutTitle: Partial<Game> = { ...base };
    delete withoutTitle.title;
    expect(() => validateCatalog([withoutTitle])).toThrow(/title: campo obligatorio/);
  });

  it('tags: kind válido y sin tags de estado', () => {
    expect(problemsFor({ tags: [{ label: 'X', kind: 'color' }] }).join()).toMatch(/kind/);
    expect(problemsFor({ tags: [{ label: 'Disponible', kind: 'status' }] }).join()).toMatch(
      /campo "status"/,
    );
    expect(problemsFor({ tags: [{ label: '', kind: 'genre' }] }).join()).toMatch(/label/);
  });

  it('controls: lista no vacía, sin repetidos y valores conocidos', () => {
    expect(problemsFor({ controls: [] }).join()).toMatch(/no vacía/);
    expect(problemsFor({ controls: ['keyboard', 'keyboard'] }).join()).toMatch(/repetidos/);
    expect(problemsFor({ controls: ['gamepad'] }).join()).toMatch(/keyboard o mouse o touch/);
  });

  it('status, embed y addedAt', () => {
    expect(problemsFor({ status: 'beta' }).join()).toMatch(/status/);
    expect(problemsFor({ embed: 'si' }).join()).toMatch(/embed/);
    expect(problemsFor({ addedAt: '2026-02-30' }).join()).toMatch(/fecha/);
    expect(problemsFor({ addedAt: '30/10/2026' }).join()).toMatch(/fecha/);
  });

  it('portada y capturas dentro de games/<id>/', () => {
    expect(problemsFor({ cover: 'otra/cover.png' }).join()).toMatch(/games\/dead-shift\//);
    expect(problemsFor({ cover: 'games/dead-shift/../x.png' }).join()).toMatch(/nombre/);
    expect(problemsFor({ screenshots: ['games/dead-shift/a.gif'] }).join()).toMatch(/nombre/);
    expect(problemsFor({ screenshots: ['games/dead-shift/a.png'] })).toEqual([]);
  });

  it('reporta todos los problemas a la vez', () => {
    expect(
      problemsFor({ tagline: 'a'.repeat(91), status: 'beta', url: 'http://x.y' }),
    ).toHaveLength(3);
  });
});
