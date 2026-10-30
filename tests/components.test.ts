import { describe, expect, it } from 'vitest';
import { applyPartials } from '../build/html-partials.ts';
import { renderStyleguide } from '../build/styleguide.ts';
import { BADGE_CLASS, renderBadge } from '../src/components/badge.ts';
import { renderBrand } from '../src/components/brand.ts';
import { renderButton } from '../src/components/button.ts';
import { escapeHtml } from '../src/components/escape.ts';
import { renderFooter } from '../src/components/footer.ts';
import { renderHeader } from '../src/components/header.ts';
import { renderNavLink } from '../src/components/nav-link.ts';
import { SITE } from '../src/data/site.ts';

const EVIL = '<script>alert("x")</script>&\'';

describe('escapeHtml', () => {
  it('neutraliza HTML y comillas', () => {
    expect(escapeHtml(EVIL)).toBe('&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;&amp;&#39;');
  });

  it('los componentes escapan texto y atributos', () => {
    const html =
      renderButton({ label: EVIL, variant: 'primary', href: EVIL }) +
      renderBadge({ label: EVIL, kind: 'genre' }) +
      renderNavLink({ label: EVIL, href: EVIL }) +
      renderBrand({ name: EVIL, href: EVIL });
    expect(html).not.toContain('<script>');
    expect(html).not.toContain('"x"');
  });
});

describe('botones', () => {
  it('primario y ghost usan sus clases', () => {
    expect(renderButton({ label: 'A', variant: 'primary' })).toBe(
      '<button type="button" class="btn btn--primary">A</button>',
    );
    expect(renderButton({ label: 'A', variant: 'ghost', href: '#x' })).toContain('btn--ghost');
  });

  it('enlace externo con rel="noopener noreferrer" (Parte A.7)', () => {
    expect(renderButton({ label: 'A', variant: 'ghost', href: 'x', external: true })).toContain(
      'rel="noopener noreferrer"',
    );
  });
});

describe('badges (res. C.11)', () => {
  it('cada tipo usa su familia de color', () => {
    expect(BADGE_CLASS).toEqual({
      status: 'badge--success',
      platform: 'badge--info',
      genre: 'badge--violet',
      event: 'badge--pink',
    });
    expect(renderBadge({ label: 'Teclado', kind: 'platform' })).toBe(
      '<span class="badge badge--info">Teclado</span>',
    );
  });
});

describe('header y footer', () => {
  const header = renderHeader({ root: './', current: '' });
  const footer = renderFooter({ root: './' });

  it('header: salto al contenido primero, marca, nav y CTA mailto (res. C.12)', () => {
    expect(header.startsWith('<a class="skip-link" href="#contenido">')).toBe(true);
    expect(header).toContain(`<span class="brand__name">${SITE.name}</span>`);
    expect(header).toContain('aria-current="page"');
    expect(header).toContain(`href="mailto:${escapeHtml(SITE.email)}"`);
    expect(header).not.toMatch(/<form|<input/);
  });

  it('footer: enlaces legales y datos del responsable', () => {
    for (const path of ['privacidad/', 'terminos/', 'creditos/']) {
      expect(footer).toContain(`href="./${path}"`);
    }
    expect(footer).toContain('<address');
    expect(footer).toContain('Ecuador');
  });

  it('el nombre del sitio solo sale de SITE', () => {
    expect(applyPartials('<title>{{site.name}}</title>', {})).toBe(`<title>${SITE.name}</title>`);
  });

  it('un parcial desconocido rompe el build', () => {
    expect(() => applyPartials('<!-- @component nope -->', {})).toThrow(/nope/);
  });
});

describe('guía de estilo', () => {
  const guide = renderStyleguide();

  it('un solo h1', () => {
    expect(guide.match(/<h1\b/g)).toHaveLength(1);
  });

  it('muestra todos los componentes del Hito 1', () => {
    for (const cls of [
      'btn--primary',
      'btn--ghost',
      'nav-link',
      'brand',
      'badge--success',
      'badge--info',
      'badge--violet',
      'badge--pink',
      'class="card"',
      'eyebrow',
      'class="display"',
      'class="heading"',
    ]) {
      expect(guide, cls).toContain(cls);
    }
  });
});
