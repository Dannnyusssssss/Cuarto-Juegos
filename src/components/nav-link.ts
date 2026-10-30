import { escapeHtml } from './escape.ts';

export interface NavLinkProps {
  label: string;
  href: string;
  current?: boolean;
}

export function renderNavLink({ label, href, current = false }: NavLinkProps): string {
  const aria = current ? ' aria-current="page"' : '';
  return `<a class="nav-link" href="${escapeHtml(href)}"${aria}>${escapeHtml(label)}</a>`;
}
