import type { Plugin } from 'vite';

/** Archivo de Inter que usan las páginas (subconjunto latin, eje de peso). */
export const FONT_ASSET = /^assets\/inter-latin-wght-normal-[\w-]+\.woff2$/;

/** Busca el archivo de la fuente entre los del build; falla si no hay exactamente uno. */
export function findFontAsset(fileNames: readonly string[]): string {
  const found = fileNames.filter((name) => FONT_ASSET.test(name));
  const [file] = found;
  if (found.length !== 1 || file === undefined) {
    throw new Error(`font-preload: se esperaba un archivo de Inter latin y hay ${found.length}`);
  }
  return file;
}

/** Prefijo relativo desde una página ("/juegos/x/index.html") hasta la raíz del sitio. */
export function rootPrefix(pagePath: string): string {
  const depth = pagePath.split('/').filter(Boolean).length - 1;
  return depth > 0 ? '../'.repeat(depth) : './';
}

/**
 * `<link rel="preload">` de la fuente, relativo a la página. `crossorigin` es obligatorio en la
 * precarga de fuentes (se piden en modo CORS); el archivo es del mismo origen.
 */
export const fontPreloadTag = (fileName: string, pagePath: string) =>
  `<link rel="preload" href="${rootPrefix(pagePath)}${fileName}" as="font" type="font/woff2" crossorigin>`;

/**
 * Plugin propio (sin dependencias), solo en build: precarga Inter en todas las páginas. Sin esto
 * la fuente se pide después de leer el CSS, y el titular (el LCP del inicio) se repinta tarde.
 */
export function fontPreload(): Plugin {
  return {
    name: 'portal-font-preload',
    apply: 'build',
    transformIndexHtml: {
      order: 'post',
      handler(html, ctx) {
        if (!ctx.bundle) return html;
        const tag = fontPreloadTag(findFontAsset(Object.keys(ctx.bundle)), ctx.path);
        if (!html.includes('</head>')) throw new Error(`${ctx.path}: falta </head>`);
        return html.replace('</head>', `${tag}</head>`);
      },
    },
  };
}
