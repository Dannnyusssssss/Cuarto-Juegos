/**
 * Esquema del catálogo de juegos (games.json), validado sin dependencias.
 * Agregar un juego = agregar una entrada válida; el build falla si alguna no lo es.
 */
import { GAME_ORIGINS } from './embed.ts';
import { SITE } from './site.ts';

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

/**
 * Datos que un juego guarda en IndexedDB (p. ej. un motor que escribe sus archivos ahí). El botón
 * del portal no los borra: la política indica el botón del propio juego que lo hace.
 */
export interface GameIndexedDb {
  /** Carpeta propia del juego dentro del almacenamiento del motor (p. ej. "dead-shift-3d"). */
  folder: string;
  /** Texto del botón del juego que borra sus datos (p. ej. "Borrar datos guardados"). */
  clearButton: string;
  /** Dónde está ese botón, para la frase «…, en <clearIn> del juego» (p. ej. "el menú principal"). */
  clearIn: string;
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
  /** Datos guardados en IndexedDB, si el juego los guarda ahí. */
  indexedDb?: GameIndexedDb;
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
const ALLOWED_KEYS = new Set<string>([
  ...REQUIRED_KEYS,
  'screenshots',
  'storagePrefix',
  'indexedDb',
]);
const INDEXED_DB_KEYS = ['folder', 'clearButton', 'clearIn'] as const;

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
 * Caracteres de control, invisibles o que cambian la dirección del texto. En un texto permiten
 * mostrar algo distinto de lo que se lee en el código (p. ej. invertir parte de una frase).
 */
function isControlOrInvisibleChar(code: number): boolean {
  return (
    code < 0x20 || // controles C0 (tabulador, saltos de línea…)
    (code >= 0x7f && code <= 0x9f) || // DEL y controles C1
    code === 0xad || // guion suave (invisible)
    (code >= 0x200b && code <= 0x200f) || // espacios de ancho cero y marcas de dirección
    (code >= 0x2028 && code <= 0x202e) || // separadores de línea y controles de dirección
    (code >= 0x2060 && code <= 0x2069) || // unión invisible y aislamientos de dirección
    code === 0xfeff // marca de orden de bytes
  );
}

const hasChar = (value: string, test: (code: number) => boolean) =>
  [...value].some((char) => test(char.codePointAt(0) ?? 0));

/**
 * En una URL, además, el espacio, el espacio sin separación y la barra invertida. El navegador
 * ignora o reinterpreta todos estos caracteres (quita tabuladores y saltos de línea, y lee la
 * barra invertida como «/»): una URL con un tabulador dentro de «https» o que empieza por barra y
 * barra invertida parecería relativa aquí, y el navegador la abriría en otro origen. Se rechazan
 * antes de mirar el esquema.
 */
const isForbiddenUrlChar = (code: number) =>
  isControlOrInvisibleChar(code) || code === 0x20 || code === 0xa0 || code === 0x5c;

/** Tope de longitud de cada texto del catálogo (holgado: evita textos desmedidos o pegados por error). */
export const TEXT_MAX = {
  title: 60,
  description: 600,
  contentNote: 400,
  ageHint: 20, // cabe «[COMPLETAR]», el marcador de un juego nuevo
  tagLabel: 30,
  indexedDbText: 60,
} as const;

/** Texto no vacío, sin caracteres de control ni invisibles y con un tope de longitud. */
function checkText(value: unknown, max: number): string | null {
  if (!isNonEmptyString(value)) return 'debe ser un texto no vacío';
  if (hasChar(value, isControlOrInvisibleChar)) {
    return 'no puede tener caracteres de control, invisibles ni de dirección del texto';
  }
  if (value.length > max) return `máx. ${max} caracteres`;
  return null;
}

/**
 * Solo https o rutas relativas, sin esquemas peligrosos. Tampoco se admiten parámetros (?…) ni
 * fragmentos (#…): los juegos usan parámetros de depuración (god, debug, spawn…) que el portal
 * nunca debe enlazar. Una URL https solo puede apuntar a un origen de la lista blanca
 * (GAME_ORIGINS): juegos propios. Una relativa se resuelve como la resolvería el navegador y debe
 * quedar en el origen del sitio.
 */
export function checkGameUrl(value: string): string | null {
  if (value === '') return 'no puede estar vacía';
  if (hasChar(value, isForbiddenUrlChar)) {
    return 'no puede tener espacios, caracteres de control o invisibles ni barras invertidas';
  }
  if (value.startsWith('//')) return 'no se permiten URLs sin esquema (//host)';
  const hasScheme = /^[a-z][a-z0-9+.-]*:/i.test(value);
  if (hasScheme && !value.toLowerCase().startsWith('https://')) {
    return 'solo se permite https:// o una ruta relativa';
  }
  let parsed: URL;
  try {
    parsed = new URL(value, `${SITE.url}${SITE.basePath}`);
  } catch {
    return 'no es una URL válida';
  }
  if (value.includes('?')) {
    const params = [...parsed.searchParams.keys()].join(', ');
    return `no se permiten parámetros${params ? ` (${params})` : ''}: podrían activar modos de depuración`;
  }
  if (value.includes('#')) {
    return 'no se permiten fragmentos (#…): podrían activar modos de depuración';
  }
  if (parsed.protocol !== 'https:') return 'solo se permite https:// o una ruta relativa';
  if (parsed.username !== '' || parsed.password !== '') {
    return 'no se permiten usuario ni contraseña en la URL';
  }
  if (hasScheme && !GAME_ORIGINS.includes(parsed.origin)) {
    return `origen no permitido (${parsed.origin}): solo juegos propios de la lista blanca (src/data/embed.ts)`;
  }
  if (!hasScheme && parsed.origin !== new URL(SITE.url).origin) {
    return `la ruta relativa sale del origen del sitio (${parsed.origin})`;
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

  const texts = [
    ['title', TEXT_MAX.title],
    ['tagline', TAGLINE_MAX],
    ['description', TEXT_MAX.description],
    ['contentNote', TEXT_MAX.contentNote],
    ['ageHint', TEXT_MAX.ageHint],
  ] as const;
  for (const [field, max] of texts) {
    if (!(field in raw)) continue;
    const error = checkText(raw[field], max);
    if (error) fail(field, error);
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

  if ('indexedDb' in raw) {
    const db = raw.indexedDb;
    if (!isRecord(db)) fail('indexedDb', 'debe ser { folder, clearButton, clearIn }');
    else {
      for (const key of Object.keys(db)) {
        if (!(INDEXED_DB_KEYS as readonly string[]).includes(key)) {
          fail(`indexedDb.${key}`, 'campo desconocido');
        }
      }
      if (typeof db.folder !== 'string' || !SLUG.test(db.folder)) {
        fail('indexedDb.folder', 'debe ser un slug (minúsculas, números y guiones)');
      }
      for (const key of ['clearButton', 'clearIn'] as const) {
        const error = checkText(db[key], TEXT_MAX.indexedDbText);
        if (error) fail(`indexedDb.${key}`, error);
      }
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
        const labelError = checkText(tag.label, TEXT_MAX.tagLabel);
        if (labelError) fail(`${where}.label`, labelError);
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

  const folders = new Set<string>();
  data.forEach((game, i) => {
    const db = isRecord(game) ? game.indexedDb : undefined;
    const folder = isRecord(db) ? db.folder : undefined;
    if (typeof folder !== 'string') return;
    if (folders.has(folder)) problems.push(`[${i}].indexedDb.folder: "${folder}" está repetido`);
    folders.add(folder);
  });

  if (problems.length > 0) throw new CatalogError(problems);
  return data as Game[];
}
