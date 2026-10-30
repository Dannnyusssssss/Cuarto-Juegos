import { gamePageHref } from '../src/components/game-card.ts';
import type { Game } from '../src/data/games.schema.ts';
import { SITE } from '../src/data/site.ts';
import { renderGamePage } from '../src/pages/game.ts';
import { renderCredits, renderPrivacy, renderTerms } from '../src/pages/legal.ts';
import { loadCatalog } from './catalog.ts';
import type { VirtualPage } from './virtual-pages.ts';

/** Página de un juego del catálogo. */
export const gameVirtualPage = (game: Game): VirtualPage => ({
  href: gamePageHref(game),
  meta: { title: `${game.title} · ${SITE.name}`, description: game.tagline },
  content: (root) => renderGamePage(game, root),
  scripts: ['/src/game-page.ts'],
});

/** Páginas legales (sus rutas coinciden con los enlaces del footer). */
export const legalVirtualPages = (games: readonly Game[]): VirtualPage[] => [
  {
    href: 'privacidad/',
    meta: {
      title: `Política de privacidad · ${SITE.name}`,
      description: `Qué datos trata ${SITE.name} (ninguno fuera de tu navegador) y cómo borrarlos.`,
    },
    content: () => renderPrivacy(games),
    scripts: ['/src/privacy-page.ts'],
  },
  {
    href: 'terminos/',
    meta: {
      title: `Términos y condiciones · ${SITE.name}`,
      description: `Condiciones de uso de ${SITE.name}.`,
    },
    content: () => renderTerms(),
  },
  {
    href: 'creditos/',
    meta: {
      title: `Créditos · ${SITE.name}`,
      description: `Autoría y licencias de ${SITE.name} y de sus recursos.`,
    },
    content: (root) => renderCredits(games, root),
  },
];

/** Todas las páginas generadas desde datos. Lee el catálogo en cada llamada. */
export function sitePages(games: readonly Game[] = loadCatalog()): VirtualPage[] {
  return [...legalVirtualPages(games), ...games.map(gameVirtualPage)];
}
