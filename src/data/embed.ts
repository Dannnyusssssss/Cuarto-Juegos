/**
 * Atributos del iframe de los juegos embebidos.
 *
 * - allow-scripts: los juegos son TypeScript y Canvas.
 * - allow-same-origin: los juegos guardan récords, partidas y ajustes en localStorage.
 * - allow-pointer-lock: permite a un juego capturar el cursor; Esc siempre lo libera.
 * Sin popups, ventanas modales, formularios ni navegación de la página superior.
 * La pantalla completa la pide el portal sobre el iframe, con allow="fullscreen".
 */
export const GAME_FRAME_ATTRIBUTES = {
  sandbox: 'allow-scripts allow-same-origin allow-pointer-lock',
  allow: 'fullscreen',
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
