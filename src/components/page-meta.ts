import { escapeHtml } from './escape.ts';

export interface PageMetaProps {
  title: string;
  description: string;
  /** URL absoluta y canónica de la página. Sin ella (p. ej. en la 404) no se publica canonical ni og:url. */
  canonical?: string;
  /** Páginas que no deben indexarse (p. ej. la 404). */
  noindex?: boolean;
  /** Prefijo relativo hasta la raíz del sitio ('./', '../'…), para el favicon. */
  root: string;
  /** URL absoluta de la imagen Open Graph. Sin ella no se publica og:image. */
  image?: string;
}

/** <title>, descripción, canonical y Open Graph de una página. */
export function renderPageMeta({
  title,
  description,
  canonical,
  noindex = false,
  root,
  image,
}: PageMetaProps): string {
  const t = escapeHtml(title);
  const d = escapeHtml(description);
  const tags = [
    `<title>${t}</title>`,
    `<meta name="description" content="${d}" />`,
    noindex ? `<meta name="robots" content="noindex" />` : '',
    canonical ? `<link rel="canonical" href="${escapeHtml(canonical)}" />` : '',
    `<meta property="og:type" content="website" />`,
    `<meta property="og:locale" content="es_EC" />`,
    `<meta property="og:title" content="${t}" />`,
    `<meta property="og:description" content="${d}" />`,
    canonical ? `<meta property="og:url" content="${escapeHtml(canonical)}" />` : '',
    image ? `<meta property="og:image" content="${escapeHtml(image)}" />` : '',
    `<link rel="icon" href="${escapeHtml(root)}favicon.svg" type="image/svg+xml" />`,
  ];
  return tags.filter(Boolean).join('');
}
