import type { Game } from './games.schema.ts';
import { SITE } from './site.ts';

/** Hasta `count` juegos disponibles, los más recientes primero (empate: orden del catálogo). */
export function selectFeatured(games: readonly Game[], count = 3): Game[] {
  return games
    .filter((game) => game.status === 'available')
    .sort((a, b) => (a.addedAt < b.addedAt ? 1 : a.addedAt > b.addedAt ? -1 : 0))
    .slice(0, Math.max(0, count));
}

/** Titular del hero con el total real de juegos disponibles (siempre en cifras). */
export function heroTitle(availableCount: number): string {
  if (availableCount === 1) return '1 juego propio para jugar en el navegador';
  if (availableCount > 1) return `${availableCount} juegos propios para jugar en el navegador`;
  return 'Juegos propios para jugar en el navegador';
}

/** Textos de la página de inicio. El nombre del sitio siempre sale de SITE. */
export const HOME = {
  hero: {
    eyebrow: 'Juegos web',
    // Titular de respaldo; el que se muestra sale de heroTitle().
    title: heroTitle(0),
    lead: 'Sin cuentas ni descargas. Elige un juego y empieza a jugar.',
    browse: { label: 'Ver juegos', href: '#juegos' },
    playLabel: (title: string) => `Jugar ${title}`,
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
