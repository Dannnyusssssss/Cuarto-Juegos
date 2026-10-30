import { renderFooter } from '../src/components/footer.ts';
import { renderHeader } from '../src/components/header.ts';
import { renderPageMeta } from '../src/components/page-meta.ts';
import { absoluteUrl, SITE } from '../src/data/site.ts';
import { renderHome } from '../src/pages/home.ts';
import { renderNotFound } from '../src/pages/not-found.ts';
import { loadCatalog } from './catalog.ts';
import type { PartialRenderer } from './html-partials.ts';
import { renderStyleguide } from './styleguide.ts';

/** Parciales disponibles en los .html (marcador <!-- @component nombre -->). */
export const PARTIALS: Record<string, PartialRenderer> = {
  header: () => renderHeader({ root: './' }),
  'header-home': () => renderHeader({ root: './', current: '' }),
  footer: () => renderFooter({ root: './' }),
  'meta-home': () =>
    renderPageMeta({ title: SITE.name, description: SITE.description, canonical: absoluteUrl() }),
  // La 404 se sirve en cualquier ruta rota: no lleva canonical y no se indexa.
  'meta-404': () =>
    renderPageMeta({
      title: `Página no encontrada · ${SITE.name}`,
      description: SITE.description,
      noindex: true,
    }),
  'not-found': () => renderNotFound('./'),
  // El catálogo se lee en cada render: un games.json inválido detiene el build con el error.
  home: () => renderHome(loadCatalog(), './'),
  styleguide: renderStyleguide,
};
