import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { checkAssets, loadCatalog } from '../build/catalog.ts';
import {
  CatalogError,
  checkGameUrl,
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
  ])('rechaza la url %s', (url, message) => {
    expect(problemsFor({ url }).join('\n')).toMatch(message);
  });

  it.each(['https://ejemplo.com/juego/', 'games/dead-shift/play/', './juego/index.html'])(
    'acepta la url %s',
    (url) => {
      expect(checkGameUrl(url)).toBeNull();
    },
  );

  it('tagline de máximo 90 caracteres', () => {
    expect(problemsFor({ tagline: 'a'.repeat(90) })).toEqual([]);
    expect(problemsFor({ tagline: 'a'.repeat(91) })).toEqual(['[0].tagline: máx. 90 caracteres']);
  });

  it('id: slug y único', () => {
    expect(problemsFor({ id: 'Dead Shift' }).join()).toMatch(/slug/);
    expect(problemsFor({}, [{ ...base }]).join()).toMatch(/repetido/);
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
