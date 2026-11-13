/**
 * Esquema del catálogo de juegos (games.json), validado sin dependencias.
 * Agregar un juego = agregar una entrada válida; el build falla si alguna no lo es.
 */
import { GAME_ORIGINS } from './embed.ts';

export const CONTROLS = ['keyboard', 'mouse', 'touch'] as const;
export const TAG_KINDS = ['genre', 'platform', 'status', 'event'] as const;
export const STATUSES = ['available', 'in-development'] as const;

export type Control = (typeof CONTROLS)[number];
export type TagKind = (typeof TAG_KINDS)[number];
export type GameStatus = (typeof STATUSES)[number];

export interface GameTag {
  label: string;
  kind: TagKind;
}

export interface Game {
  id: string;
  title: string;
  tagline: string;
  description: string;
  cover: string;
  screenshots?: string[];
  url: string;
  /** Prefijo de las claves que el juego guarda en localStorage (p. ej. "deadshift:"). */
  storagePrefix?: string;
  embed: boolean;
  controls: Control[];
  tags: GameTag[];
  status: GameStatus;
  contentNote: string;
  ageHint: string;
  addedAt: string;
}

export const TAGLINE_MAX = 90;

const REQUIRED_KEYS = [
  'id',
  'title',
  'tagline',
  'description',
  'cover',
  'url',
  'embed',
  'controls',
  'tags',
  'status',
  'contentNote',
  'ageHint',
  'addedAt',
] as const;
const ALLOWED_KEYS = new Set<string>([...REQUIRED_KEYS, 'screenshots', 'storagePrefix']);

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const STORAGE_PREFIX = /^[a-z0-9]+(?:-[a-z0-9]+)*:$/;
/** Prefijo reservado para lo que guarde el propio portal. */
export const PORTAL_STORAGE_PREFIX = 'portal:';
const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;
const IMAGE_FILE = /^[a-z0-9][a-z0-9._-]*\.(?:svg|png|jpe?g|webp|avif)$/;

export class CatalogError extends Error {
  readonly problems: string[];

  constructor(problems: string[]) {
    super(`games.json no es válido:\n- ${problems.join('\n- ')}`);
    this.name = 'CatalogError';
    this.problems = problems;
  }
}

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

const isNonEmptyString = (v: unknown): v is string => typeof v === 'string' && v.trim() !== '';

function isValidDate(value: string): boolean {
  const match = ISO_DATE.exec(value);
  if (!match) return false;
  const [y, m, d] = [match[1], match[2], match[3]].map(Number) as [number, number, number];
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d;
}

/**
 * Solo https o rutas relativas, sin esquemas peligrosos. Tampoco se admiten parámetros (?…):
 * los juegos usan parámetros de depuración (god, debug, spawn…) que el portal nunca debe enlazar.
 * Una URL https solo puede apuntar a un origen de la lista blanca (GAME_ORIGINS): juegos propios.
 */
export function checkGameUrl(value: string): string | null {
  if (value.trim() !== value || value === '') return 'no puede estar vacía ni tener espacios';
  if (value.startsWith('//')) return 'no se permiten URLs sin esquema (//host)';
  const hasScheme = /^[a-z][a-z0-9+.-]*:/i.test(value);
  if (hasScheme && !value.toLowerCase().startsWith('https://')) {
    return 'solo se permite https:// o una ruta relativa';
  }
  let parsed: URL;
  try {
    parsed = new URL(value, 'file:///base/');
  } catch {
    return 'no es una URL válida';
  }
  if (value.includes('?')) {
    const params = [...parsed.searchParams.keys()].join(', ');
    return `no se permiten parámetros${params ? ` (${params})` : ''}: podrían activar modos de depuración`;
  }
  if (hasScheme) {
    if (parsed.username !== '' || parsed.password !== '') {
      return 'no se permiten usuario ni contraseña en la URL';
    }
    if (!GAME_ORIGINS.includes(parsed.origin)) {
      return `origen no permitido (${parsed.origin}): solo juegos propios de la lista blanca (src/data/embed.ts)`;
    }
  }
  return null;
}

function checkImagePath(value: unknown, id: string): string | null {
  if (typeof value !== 'string') return 'debe ser una ruta (texto)';
  const prefix = `games/${id}/`;
  if (!value.startsWith(prefix)) return `debe estar en ${prefix}`;
  if (!IMAGE_FILE.test(value.slice(prefix.length))) {
    return 'nombre de archivo no válido (minúsculas, sin subcarpetas; svg, png, jpg, webp o avif)';
  }
  return null;
}

function validateGame(raw: unknown, at: string, problems: string[]): void {
  const fail = (field: string, message: string) => problems.push(`${at}.${field}: ${message}`);

  if (!isRecord(raw)) {
    problems.push(`${at}: debe ser un objeto`);
    return;
  }

  for (const key of Object.keys(raw)) {
    if (!ALLOWED_KEYS.has(key)) fail(key, 'campo desconocido');
  }
  for (const key of REQUIRED_KEYS) {
    if (!(key in raw)) fail(key, 'campo obligatorio');
  }

  const id = typeof raw.id === 'string' ? raw.id : '';
  if ('id' in raw && !SLUG.test(id)) fail('id', 'debe ser un slug (minúsculas, números y guiones)');

  for (const field of ['title', 'description', 'contentNote', 'ageHint'] as const) {
    if (field in raw && !isNonEmptyString(raw[field])) fail(field, 'debe ser un texto no vacío');
  }

  if ('tagline' in raw) {
    if (!isNonEmptyString(raw.tagline)) fail('tagline', 'debe ser un texto no vacío');
    else if (raw.tagline.length > TAGLINE_MAX) fail('tagline', `máx. ${TAGLINE_MAX} caracteres`);
  }

  if ('cover' in raw) {
    const error = checkImagePath(raw.cover, id);
    if (error) fail('cover', error);
  }

  if ('screenshots' in raw) {
    if (!Array.isArray(raw.screenshots)) fail('screenshots', 'debe ser una lista');
    else {
      raw.screenshots.forEach((shot: unknown, i: number) => {
        const error = checkImagePath(shot, id);
        if (error) fail(`screenshots[${i}]`, error);
      });
    }
  }

  if ('url' in raw) {
    const error = typeof raw.url === 'string' ? checkGameUrl(raw.url) : 'debe ser texto';
    if (error) fail('url', error);
  }

  if ('embed' in raw && typeof raw.embed !== 'boolean') fail('embed', 'debe ser true o false');

  if ('storagePrefix' in raw) {
    const prefix = raw.storagePrefix;
    if (typeof prefix !== 'string' || !STORAGE_PREFIX.test(prefix)) {
      fail(
        'storagePrefix',
        'debe ser minúsculas, números o guiones y terminar en ":" (p. ej. "deadshift:")',
      );
    } else if (prefix === PORTAL_STORAGE_PREFIX) {
      fail('storagePrefix', `"${PORTAL_STORAGE_PREFIX}" está reservado para el portal`);
    }
  }

  if ('controls' in raw) {
    const controls = raw.controls;
    if (!Array.isArray(controls) || controls.length === 0) {
      fail('controls', `debe ser una lista no vacía de: ${CONTROLS.join(', ')}`);
    } else {
      controls.forEach((c: unknown, i: number) => {
        if (!CONTROLS.includes(c as Control))
          fail(`controls[${i}]`, `debe ser ${CONTROLS.join(' o ')}`);
      });
      if (new Set(controls).size !== controls.length) fail('controls', 'tiene valores repetidos');
    }
  }

  if ('tags' in raw) {
    if (!Array.isArray(raw.tags)) fail('tags', 'debe ser una lista');
    else {
      raw.tags.forEach((tag: unknown, i: number) => {
        const where = `tags[${i}]`;
        if (!isRecord(tag)) return fail(where, 'debe ser { label, kind }');
        for (const key of Object.keys(tag)) {
          if (key !== 'label' && key !== 'kind') fail(`${where}.${key}`, 'campo desconocido');
        }
        if (!isNonEmptyString(tag.label)) fail(`${where}.label`, 'debe ser un texto no vacío');
        if (!TAG_KINDS.includes(tag.kind as TagKind)) {
          fail(`${where}.kind`, `debe ser ${TAG_KINDS.join(', ')}`);
        } else if (tag.kind === 'status') {
          // El estado sale solo del campo "status", para que no haya dos fuentes que se contradigan.
          fail(`${where}.kind`, 'el estado se indica con el campo "status", no con un tag');
        }
      });
    }
  }

  if ('status' in raw && !STATUSES.includes(raw.status as GameStatus)) {
    fail('status', `debe ser ${STATUSES.join(' o ')}`);
  }

  if ('addedAt' in raw && !(typeof raw.addedAt === 'string' && isValidDate(raw.addedAt))) {
    fail('addedAt', 'debe ser una fecha ISO válida (AAAA-MM-DD)');
  }
}

/** Valida el catálogo completo y devuelve los juegos tipados, o lanza CatalogError con todos los problemas. */
export function validateCatalog(data: unknown): Game[] {
  if (!Array.isArray(data)) throw new CatalogError(['la raíz debe ser una lista de juegos']);
  const problems: string[] = [];
  data.forEach((game, i) => validateGame(game, `[${i}]`, problems));

  for (const field of ['id', 'storagePrefix'] as const) {
    const seen = new Set<string>();
    data.forEach((game, i) => {
      const value = isRecord(game) ? game[field] : undefined;
      if (typeof value !== 'string') return;
      if (seen.has(value)) problems.push(`[${i}].${field}: "${value}" está repetido`);
      seen.add(value);
    });
  }

  if (problems.length > 0) throw new CatalogError(problems);
  return data as Game[];
}
