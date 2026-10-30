import { NAV, SITE } from '../data/site.ts';
import { renderBrand } from './brand.ts';
import { renderButton } from './button.ts';
import { renderNavLink } from './nav-link.ts';

export interface HeaderProps {
  /** Prefijo relativo hasta la raíz del sitio ('./' o '../'). */
  root: string;
  /** href (relativo a la raíz) de la página actual, para aria-current. */
  current?: string;
}

export function renderHeader({ root, current }: HeaderProps): string {
  const links = NAV.map(
    (item) =>
      `<li>${renderNavLink({ label: item.label, href: root + item.href, current: item.href === current })}</li>`,
  ).join('');
  return (
    `<a class="skip-link" href="#contenido">Saltar al contenido</a>` +
    `<header class="site-header"><div class="container site-header__inner">` +
    renderBrand({ name: SITE.name, href: root }) +
    `<nav aria-label="Principal"><ul class="nav-list">${links}</ul></nav>` +
    renderButton({ label: 'Contacto', variant: 'ghost', href: `mailto:${SITE.email}` }) +
    `</div></header>`
  );
}
