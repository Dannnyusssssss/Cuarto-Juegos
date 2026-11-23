/**
 * Atributos del iframe de los juegos embebidos.
 *
 * - allow-scripts: los juegos son TypeScript y Canvas.
 * - allow-same-origin: los juegos guardan récords, partidas y ajustes en localStorage o IndexedDB.
 * - allow-pointer-lock: permite a un juego capturar el cursor; Esc siempre lo libera.
 * Sin popups, ventanas modales, formularios ni navegación de la página superior.
 * La pantalla completa la pide el portal sobre el iframe, con allow="fullscreen".
 */

/**
 * Funciones del navegador que se niegan al juego de forma explícita. Sin esto, un iframe del mismo
 * origen hereda las que por defecto se permiten al propio sitio (cámara, micrófono, ubicación…), y
 * el aviso de permiso saldría a nombre del sitio. Frena a un juego con un fallo, no a uno
 * malicioso: uno del mismo origen puede pedirlas desde la página del sitio.
 */
export const DENIED_FEATURES = [
  'camera',
  'microphone',
  'geolocation',
  'display-capture',
  'usb',
  'serial',
  'hid',
  'bluetooth',
  'payment',
] as const;

export const GAME_FRAME_ATTRIBUTES = {
  sandbox: 'allow-scripts allow-same-origin allow-pointer-lock',
  allow: ['fullscreen', ...DENIED_FEATURES.map((feature) => `${feature} 'none'`)].join('; '),
  referrerpolicy: 'strict-origin-when-cross-origin',
  loading: 'lazy',
} as const;

/**
 * Lista blanca de orígenes desde los que se puede embeber un juego: solo juegos propios.
 * El esquema del catálogo rechaza cualquier otro origen https, así que el build falla antes de
 * que llegue a frame-src. Hoy es el mismo origen del sitio: con allow-same-origin, un juego de
 * este origen tiene el mismo poder que el sitio (no hay aislamiento).
 */
export const GAME_ORIGINS: readonly string[] = ['https://dannnyusssssss.github.io'];

/** Título accesible del iframe. */
export const gameFrameTitle = (title: string) => `${title} (juego)`;
