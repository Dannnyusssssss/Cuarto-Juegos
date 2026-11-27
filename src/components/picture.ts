import { escapeHtml } from './escape.ts';

export interface PictureOptions {
  /** Ruta del PNG (respaldo); el WebP es la misma ruta con extensión .webp. */
  src: string;
  alt: string;
  width: number;
  height: number;
  loading?: 'lazy' | 'eager';
  /** 'auto' (por defecto) omite el atributo. */
  fetchpriority?: 'high' | 'low' | 'auto';
  class?: string;
}

/** Ruta del WebP que acompaña a una imagen raster (misma ruta, extensión .webp). */
export const webpPath = (src: string) => src.replace(/\.(?:png|jpe?g)$/i, '.webp');

/** `<picture>` con WebP y la imagen original como respaldo. */
export function renderPicture(options: PictureOptions): string {
  const { src, alt, width, height, loading = 'lazy', fetchpriority = 'auto' } = options;
  const priority = fetchpriority === 'auto' ? '' : ` fetchpriority="${escapeHtml(fetchpriority)}"`;
  const cls = options.class ? ` class="${escapeHtml(options.class)}"` : '';
  return (
    `<picture><source type="image/webp" srcset="${escapeHtml(webpPath(src))}">` +
    `<img src="${escapeHtml(src)}" alt="${escapeHtml(alt)}" width="${escapeHtml(String(width))}" ` +
    `height="${escapeHtml(String(height))}" loading="${escapeHtml(loading)}" decoding="async"${priority}${cls}></picture>`
  );
}
