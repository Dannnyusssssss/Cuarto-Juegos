/**
 * Datos del sitio: única fuente del nombre y de los datos del responsable.
 * Nunca escribas el nombre a mano en otros archivos. No inventes datos: si falta uno, usa '[COMPLETAR]'.
 */
export const SITE = {
  name: 'Cuarto Juegos',
  description: 'Juegos web propios para jugar en el navegador, sin cuentas ni descargas.',
  email: 'cuartojuegos.contacto@gmail.com',
  /** Nombre real del responsable: footer, privacidad, términos, créditos y licencia. */
  owner: 'Danny Sivinta',
  /** Alias de presentación: solo en textos visibles como la sección Acerca, nunca en lo legal. */
  alias: 'Dannnyu',
  /** RUC del responsable; null si no tiene (entonces no se muestra). Nunca se publica la cédula. */
  ruc: null as string | null,
  city: 'Quito',
  country: 'Ecuador',
  /** Origen público del sitio (GitHub Pages). */
  url: 'https://dannnyusssssss.github.io',
  /**
   * Ruta base absoluta del sitio publicado. Los assets usan rutas relativas (base './');
   * esta constante solo se usa donde hace falta una ruta absoluta: 404.html, canonical y Open Graph.
   */
  basePath: '/Cuarto-Juegos/',
  /** Licencia del código del portal y de los juegos propios. */
  license: 'Todos los derechos reservados. Titular: Danny Sivinta',
} as const;

/** URL absoluta de una página publicada, a partir de su ruta relativa a la raíz del sitio. */
export const absoluteUrl = (path = '') => `${SITE.url}${SITE.basePath}${path}`;

export interface NavItem {
  label: string;
  href: string;
}

/** Rutas relativas a la raíz del sitio. */
export const NAV: readonly NavItem[] = [
  { label: 'Inicio', href: '' },
  { label: 'Juegos', href: '#juegos' },
  { label: 'Acerca', href: '#acerca' },
];

/** Páginas legales; sus rutas son las de las páginas generadas. */
export const LEGAL_LINKS: readonly NavItem[] = [
  { label: 'Privacidad', href: 'privacidad/' },
  { label: 'Términos', href: 'terminos/' },
  { label: 'Créditos', href: 'creditos/' },
];
