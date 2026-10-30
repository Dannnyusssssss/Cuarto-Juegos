import { escapeHtml } from './escape.ts';

/** Logo original (res. C.10): hexágonos concéntricos que sugieren un vórtice. */
export const BRAND_MARK_SVG =
  '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-linejoin="round">' +
  '<path d="M12 1.5 21.1 6.75v10.5L12 22.5 2.9 17.25V6.75Z" stroke-width="1.5"/>' +
  '<path d="M17.25 12 14.63 16.55H9.37L6.75 12l2.62-4.55h5.26Z" stroke-width="1.5"/>' +
  '<path d="M12 9.4 14.25 10.7v2.6L12 14.6 9.75 13.3v-2.6Z" fill="currentColor" stroke="none"/>' +
  '</svg>';

export interface BrandProps {
  name: string;
  href: string;
}

export function renderBrand({ name, href }: BrandProps): string {
  return (
    `<a class="brand" href="${escapeHtml(href)}">` +
    `<span class="brand__mark">${BRAND_MARK_SVG}</span>` +
    `<span class="brand__name">${escapeHtml(name)}</span>` +
    `</a>`
  );
}
