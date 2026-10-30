import { renderFooter } from '../src/components/footer.ts';
import { renderHeader } from '../src/components/header.ts';
import { renderHome } from '../src/pages/home.ts';
import { loadCatalog } from './catalog.ts';
import type { PartialRenderer } from './html-partials.ts';
import { renderStyleguide } from './styleguide.ts';

/** Parciales disponibles en los .html (marcador <!-- @component nombre -->). */
export const PARTIALS: Record<string, PartialRenderer> = {
  header: () => renderHeader({ root: './' }),
  'header-home': () => renderHeader({ root: './', current: '' }),
  footer: () => renderFooter({ root: './' }),
  // El catálogo se lee en cada render: un games.json inválido detiene el build con el error.
  home: () => renderHome(loadCatalog(), './'),
  styleguide: renderStyleguide,
};
