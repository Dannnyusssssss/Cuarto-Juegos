import { existsSync } from 'node:fs';
import { absoluteUrl } from '../src/data/site.ts';

/** Imagen Open Graph por defecto. La genera a mano `npm run og:image` (no el build). */
export const OG_IMAGE_FILE = 'og-default.png';

/** URL absoluta de la imagen OG, solo si el archivo existe (nunca se enlaza un archivo ausente). */
export function defaultOgImage(): string | undefined {
  const exists = existsSync(new URL(`../public/${OG_IMAGE_FILE}`, import.meta.url));
  return exists ? absoluteUrl(OG_IMAGE_FILE) : undefined;
}
