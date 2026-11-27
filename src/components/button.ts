import { escapeHtml } from './escape.ts';

export type ButtonVariant = 'primary' | 'ghost';

export interface ButtonProps {
  label: string;
  variant: ButtonVariant;
  /** Con href se genera un enlace; sin href, un <button type="button">. */
  href?: string;
  /** Enlace a otro origen: añade rel="noopener noreferrer". */
  external?: boolean;
  /** Atributo `data-*` sin valor para que un script lo encuentre (por ejemplo `data-hero-play`). */
  dataAttr?: `data-${string}`;
}

export function renderButton({
  label,
  variant,
  href,
  external = false,
  dataAttr,
}: ButtonProps): string {
  const className = `btn btn--${variant}`;
  const text = escapeHtml(label);
  if (href === undefined) {
    return `<button type="button" class="${className}">${text}</button>`;
  }
  const rel = external ? ' rel="noopener noreferrer"' : '';
  // Solo nombres data-* en minúsculas: el valor viene del código, no de datos.
  const data = dataAttr && /^data-[a-z0-9-]+$/.test(dataAttr) ? ` ${dataAttr}` : '';
  return `<a class="${className}"${data} href="${escapeHtml(href)}"${rel}>${text}</a>`;
}
