import { SITE } from './site.ts';

/** Textos de la página de inicio. El nombre del sitio siempre sale de SITE. */
export const HOME = {
  hero: {
    eyebrow: 'Juegos web',
    title: 'Juegos propios para jugar en el navegador',
    lead: 'Sin cuentas ni descargas. Abre un juego y empieza a jugar.',
    primary: { label: 'Ver los juegos', href: '#juegos' },
    secondary: { label: 'Acerca del sitio', href: '#acerca' },
  },
  games: {
    id: 'juegos',
    eyebrow: 'Catálogo',
    title: 'Juegos',
  },
  about: {
    id: 'acerca',
    eyebrow: 'Acerca',
    title: `Qué es ${SITE.name}`,
    body: `${SITE.name} reúne juegos web hechos por ${SITE.alias}. Se juegan en el navegador y el sitio no usa cuentas, formularios ni analítica.`,
  },
} as const;
