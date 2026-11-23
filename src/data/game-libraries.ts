/**
 * Librerías de terceros incluidas dentro de cada juego. No se publican con el sitio: viajan en el
 * bundle de cada juego, con su aviso de licencia. La página de créditos las lista.
 *
 * Cada aviso es una ruta relativa a la `url` del juego en el catálogo, para que el enlace siempre
 * apunte al propio juego. Sin aviso publicado como archivo, `notices` queda vacío y el texto
 * indica que el aviso va dentro del código del juego.
 */
export interface LibraryNotice {
  label: string;
  path: string;
  /** Idioma del archivo, para el texto del enlace. Por defecto, inglés. */
  language?: 'inglés' | 'español e inglés';
}

export interface GameLibrary {
  gameId: string;
  library: string;
  license: string;
  notices: readonly LibraryNotice[];
}

export const GAME_LIBRARIES: readonly GameLibrary[] = [
  {
    gameId: 'trazada',
    library: 'three.js',
    license: 'MIT',
    notices: [{ label: 'aviso de licencia', path: 'THIRD-PARTY-LICENSES.md' }],
  },
  { gameId: 'fulgor', library: 'three.js', license: 'MIT', notices: [] },
  {
    gameId: 'zumbido',
    library: 'three.js',
    license: 'MIT',
    notices: [{ label: 'aviso de licencia', path: 'third-party-licenses.md' }],
  },
  {
    gameId: 'ceniza-y-luz',
    library: 'Babylon.js',
    license: 'Apache 2.0',
    notices: [
      { label: 'licencia', path: 'licenses/babylonjs-core-LICENSE.md' },
      { label: 'aviso NOTICE', path: 'licenses/babylonjs-core-NOTICE.md' },
    ],
  },
  {
    gameId: 'cerrojo',
    library: 'three.js',
    license: 'MIT',
    notices: [{ label: 'aviso de licencia', path: 'third-party-licenses.md' }],
  },
  {
    gameId: 'dead-shift-3d',
    library: 'Godot Engine',
    license: 'MIT',
    notices: [{ label: 'avisos de licencia', path: 'LICENCIAS.txt', language: 'español e inglés' }],
  },
  {
    // CC0 no exige atribución; se acredita igual, como dicen los términos.
    gameId: 'dead-shift-3d',
    library: 'materiales, animaciones, personajes y sonidos de ambientCG, Quaternius y Kenney',
    license: 'CC0 1.0',
    notices: [{ label: 'avisos de licencia', path: 'LICENCIAS.txt', language: 'español e inglés' }],
  },
];

/** Ruta relativa segura: sin esquema, sin subir de carpeta, sin query ni fragmento. */
export const NOTICE_PATH = /^(?!.*\.\.)[A-Za-z0-9][A-Za-z0-9._/-]*$/;
