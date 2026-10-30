import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import { CATALOG_PATH } from './build/catalog.ts';
import { htmlPartials } from './build/html-partials.ts';
import { PARTIALS } from './build/pages.ts';

const page = (file: string) => fileURLToPath(new URL(file, import.meta.url));

export default defineConfig({
  base: './',
  plugins: [htmlPartials(PARTIALS, [CATALOG_PATH])],
  build: {
    // Sin polyfill de modulepreload: el portal no tiene JS propio que precargar.
    modulePreload: { polyfill: false },
    rolldownOptions: {
      // Solo las páginas de producción. styleguide.html queda fuera a propósito (solo desarrollo).
      input: {
        main: page('./index.html'),
      },
    },
  },
});
