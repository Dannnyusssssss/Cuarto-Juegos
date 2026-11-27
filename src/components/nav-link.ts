import { escapeHtml } from './escape.ts';

export interface NavLinkProps {
  label: string;
  href: string;
  current?: boolean;
}

export function renderNavLink({ label, href, current = false }: NavLinkProps): string {
  const aria = current ? ' aria-current="page"' : '';
  const text = escapeHtml(label);
  // data-label: el CSS reserva el ancho del texto en negrita para que marcar otro enlace no mueva
  // el menú.
  return `<a class="nav-link" href="${escapeHtml(href)}"${aria} data-label="${text}">${text}</a>`;
}
