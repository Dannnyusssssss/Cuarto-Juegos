import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import { htmlPartials } from './build/html-partials.ts';
import { renderStyleguide } from './build/styleguide.ts';
import { renderFooter } from './src/components/footer.ts';
import { renderHeader } from './src/components/header.ts';

const page = (file: string) => fileURLToPath(new URL(file, import.meta.url));

export default defineConfig({
  base: './',
  plugins: [
    htmlPartials({
      header: () => renderHeader({ root: './' }),
      'header-home': () => renderHeader({ root: './', current: '' }),
      footer: () => renderFooter({ root: './' }),
      styleguide: renderStyleguide,
    }),
  ],
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
