import { escapeHtml } from './escape.ts';

/** Placeholder SVG generado (sin imágenes de terceros) mientras no haya portada real. */
export const CARD_PLACEHOLDER_SVG =
  '<svg viewBox="0 0 160 90" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" class="card__placeholder">' +
  '<g transform="translate(80 45)" stroke-linejoin="round">' +
  '<path d="M0-36 31.2-18v36L0 36-31.2 18v-36Z" stroke-width="1" opacity="0.35"/>' +
  '<path d="M0-24 20.8-12v24L0 24-20.8 12v-24Z" stroke-width="1.5" opacity="0.6"/>' +
  '<path d="M0-12 10.4-6v12L0 12-10.4 6v-12Z" stroke-width="2"/>' +
  '</g></svg>';

export interface CardProps {
  title: string;
  body: string;
  /** Nivel del título según la jerarquía de la página. */
  headingLevel?: 2 | 3 | 4;
}

export function renderCard({ title, body, headingLevel = 3 }: CardProps): string {
  const h = `h${headingLevel}`;
  return (
    `<article class="card">` +
    `<div class="card__media">${CARD_PLACEHOLDER_SVG}</div>` +
    `<${h} class="card__title">${escapeHtml(title)}</${h}>` +
    `<p class="card__body">${escapeHtml(body)}</p>` +
    `</article>`
  );
}
