/**
 * Datos del sitio: única fuente del nombre y de los datos del responsable.
 * Nunca escribas el nombre a mano en otros archivos. No inventes datos: '[COMPLETAR]'.
 */
export const SITE = {
  name: 'Portal',
  description: 'Portal de juegos web propios.',
  email: '[COMPLETAR]',
  owner: '[COMPLETAR]',
  ruc: '[COMPLETAR]',
  city: '[COMPLETAR]',
  country: 'Ecuador',
} as const;

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

/** Páginas legales (se crean en el Hito 4). */
export const LEGAL_LINKS: readonly NavItem[] = [
  { label: 'Privacidad', href: 'privacidad/' },
  { label: 'Términos', href: 'terminos/' },
  { label: 'Créditos', href: 'creditos/' },
];
