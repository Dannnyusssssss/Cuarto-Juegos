import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import { CATALOG_PATH } from './build/catalog.ts';
import { productionSecurity } from './build/csp.ts';
import { htmlPartials } from './build/html-partials.ts';
import { PARTIALS } from './build/pages.ts';
import { sitePages } from './build/site-pages.ts';
import { virtualPages } from './build/virtual-pages.ts';

const page = (file: string) => fileURLToPath(new URL(file, import.meta.url));

export default defineConfig({
  base: './',
  plugins: [
    htmlPartials(PARTIALS, [CATALOG_PATH]),
    virtualPages(() => sitePages()),
    productionSecurity(),
  ],
  build: {
    // Sin polyfill de modulepreload: el script de las páginas de juego no lo necesita.
    modulePreload: { polyfill: false },
    rolldownOptions: {
      // Solo las páginas de producción (las legales y las de cada juego las agrega virtualPages).
      // styleguide.html queda fuera a propósito (solo desarrollo).
      input: {
        main: page('./index.html'),
        notFound: page('./404.html'),
      },
    },
  },
});
