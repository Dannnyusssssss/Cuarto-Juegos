import type { Plugin } from 'vite';
import { escapeHtml } from '../src/components/escape.ts';
import { SITE } from '../src/data/site.ts';

export type PartialRenderer = () => string;

const COMPONENT_MARKER = /<!--\s*@component\s+([\w-]+)\s*-->/g;

/** Sustituye marcadores y datos del sitio en un HTML. Exportado para los tests. */
export function applyPartials(html: string, partials: Record<string, PartialRenderer>): string {
  return html
    .replace(COMPONENT_MARKER, (_, name: string) => {
      const render = partials[name];
      if (render === undefined) throw new Error(`Parcial desconocido: ${name}`);
      return render();
    })
    .replaceAll('{{site.name}}', escapeHtml(SITE.name))
    .replaceAll('{{site.description}}', escapeHtml(SITE.description));
}

/**
 * Plugin propio (sin dependencias): inserta componentes renderizados en build y en dev,
 * de modo que header y footer viajan en el HTML estático sin depender de JavaScript.
 */
export function htmlPartials(partials: Record<string, PartialRenderer>): Plugin {
  return {
    name: 'portal-html-partials',
    transformIndexHtml: {
      order: 'pre',
      handler: (html) => applyPartials(html, partials),
    },
  };
}
