import { escapeHtml } from './escape.ts';

export type ButtonVariant = 'primary' | 'ghost';

export interface ButtonProps {
  label: string;
  variant: ButtonVariant;
  /** Con href se genera un enlace; sin href, un <button type="button">. */
  href?: string;
  /** Enlace a otro origen: añade rel="noopener noreferrer". */
  external?: boolean;
}

export function renderButton({ label, variant, href, external = false }: ButtonProps): string {
  const className = `btn btn--${variant}`;
  const text = escapeHtml(label);
  if (href === undefined) {
    return `<button type="button" class="${className}">${text}</button>`;
  }
  const rel = external ? ' rel="noopener noreferrer"' : '';
  return `<a class="${className}" href="${escapeHtml(href)}"${rel}>${text}</a>`;
}
