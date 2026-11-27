/**
 * Lógica pura del indicador del menú en el inicio: qué sección («Juegos», «Acerca») está a la
 * vista mientras se desplaza la página. El DOM vive en `home-page.ts`.
 */

/**
 * Franja de referencia para el IntersectionObserver: una banda fina al 40 % del alto de la
 * ventana. La sección que la cruza es la que se está leyendo.
 */
export const SPY_BAND = '-40% 0px -59% 0px';

/** Proporción visible a partir de la cual la última sección cuenta como entera a la vista. */
export const SPY_FULL = 0.99;

/**
 * Índice de la sección activa. Si la última sección se ve entera, manda ella (una sección corta
 * al pie de la página nunca llega a la franja). Si no, la última que cruza la franja. -1 si
 * ninguna: arriba del todo manda «Inicio».
 */
export function activeSectionIndex(inBand: readonly boolean[], lastFullyVisible: boolean): number {
  if (inBand.length === 0) return -1;
  if (lastFullyVisible) return inBand.length - 1;
  return inBand.lastIndexOf(true);
}

/**
 * Id de la sección del inicio a la que apunta un enlace del menú (`./#juegos`), o null si el
 * enlace no es a una sección de esta misma página.
 */
export function sectionIdFromHref(href: string): string | null {
  return /^\.\/#([a-z0-9-]{1,40})$/.exec(href)?.[1] ?? null;
}
