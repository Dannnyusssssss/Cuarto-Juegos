import { LEGAL_LINKS, SITE } from '../data/site.ts';
import { escapeHtml } from './escape.ts';
import { renderNavLink } from './nav-link.ts';

export interface FooterProps {
  root: string;
  /** href (relativo a la raíz) de la página actual, para aria-current. */
  current?: string;
}

export function renderFooter({ root, current }: FooterProps): string {
  const links = LEGAL_LINKS.map(
    (item) =>
      `<li>${renderNavLink({ label: item.label, href: root + item.href, current: item.href === current })}</li>`,
  ).join('');
  const email = escapeHtml(SITE.email);
  return (
    `<footer class="site-footer"><div class="container site-footer__inner">` +
    `<nav aria-label="Legal"><ul class="nav-list">${links}</ul></nav>` +
    `<address class="site-footer__owner">` +
    `Responsable: ${escapeHtml(SITE.owner)} · ` +
    (SITE.ruc ? `RUC: ${escapeHtml(SITE.ruc)} · ` : '') +
    `${escapeHtml(SITE.city)}, ${escapeHtml(SITE.country)} · ` +
    `<a class="nav-link" href="mailto:${email}">${email}</a>` +
    `</address>` +
    `</div></footer>`
  );
}
