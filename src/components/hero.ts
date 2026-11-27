import { renderButton } from './button.ts';
import { escapeHtml } from './escape.ts';
import { renderEyebrow } from './eyebrow.ts';
import { COVER_HEIGHT, COVER_WIDTH } from './game-card.ts';
import { renderPicture } from './picture.ts';

/** Vértices de un hexágono regular centrado en el origen. */
function hexagon(radius: number, rotationDeg: number): string {
  return Array.from({ length: 6 }, (_, i) => {
    const angle = ((60 * i + rotationDeg - 90) * Math.PI) / 180;
    return `${(radius * Math.cos(angle)).toFixed(1)},${(radius * Math.sin(angle)).toFixed(1)}`;
  }).join(' ');
}

/** Anillos del vórtice: de fuera hacia dentro, cada uno más pequeño, girado y opaco. */
const RINGS = [
  { r: 290, rot: 0, tone: 'violet', opacity: 0.25, width: 1 },
  { r: 240, rot: 12, tone: 'white', opacity: 0.2, width: 1 },
  { r: 195, rot: 24, tone: 'violet', opacity: 0.45, width: 1.5 },
  { r: 155, rot: 36, tone: 'white', opacity: 0.35, width: 1.5 },
  { r: 118, rot: 48, tone: 'violet', opacity: 0.7, width: 2 },
  { r: 84, rot: 60, tone: 'white', opacity: 0.6, width: 2 },
  { r: 54, rot: 72, tone: 'violet', opacity: 1, width: 3 },
] as const;

/** Portal original: vórtice de hexágonos violeta y blanco. Decorativo. */
export const PORTAL_ART_SVG =
  '<svg class="portal-art" viewBox="-300 -300 600 600" aria-hidden="true" focusable="false">' +
  RINGS.map(
    ({ r, rot, tone, opacity, width }) =>
      `<polygon class="portal-art__ring portal-art__ring--${tone}" points="${hexagon(r, rot)}" ` +
      `opacity="${opacity}" stroke-width="${width}"/>`,
  ).join('') +
  `<polygon class="portal-art__core" points="${hexagon(30, 84)}"/>` +
  '</svg>';

/** Una diapositiva del hero: un juego destacado. */
export interface HeroSlide {
  id: string;
  title: string;
  tagline: string;
  /** Portada, relativa a la raíz del sitio. */
  cover: string;
  /** Ficha del juego, relativa a la raíz del sitio. */
  href: string;
}

export interface HeroProps {
  eyebrow: string;
  title: string;
  lead: string;
  /** Enlace al catálogo: es el primario si no hay destacados y el secundario si los hay. */
  browse: { label: string; href: string };
  /** Texto del botón primario para una diapositiva. */
  playLabel?: (title: string) => string;
  /** Hasta 3 juegos destacados; sin ninguno, el hero queda sin imagen. */
  slides?: readonly HeroSlide[];
  /** Prefijo relativo hasta la raíz del sitio ('./' o '../'). */
  root?: string;
  /** Nivel del titular: 1 en la página de inicio. */
  headingLevel?: 1 | 2;
}

const defaultPlayLabel = (title: string) => `Jugar ${title}`;

function renderSlides(
  slides: readonly HeroSlide[],
  root: string,
  playLabel: (title: string) => string,
): string {
  return slides
    .map((slide, index) => {
      const first = index === 0;
      const picture = renderPicture({
        src: root + slide.cover,
        alt: `Portada de ${slide.title}`,
        width: COVER_WIDTH,
        height: COVER_HEIGHT,
        loading: first ? 'eager' : 'lazy',
        fetchpriority: first ? 'high' : 'low',
      });
      // Sin JavaScript solo se ve la primera; las demás las muestra el script del hero.
      return (
        `<div class="hero__slide"${first ? '' : ' hidden'} data-hero-slide data-game="${escapeHtml(slide.id)}" ` +
        `data-title="${escapeHtml(slide.title)}" data-tagline="${escapeHtml(slide.tagline)}" ` +
        `data-href="${escapeHtml(root + slide.href)}" ` +
        `data-play="${escapeHtml(playLabel(slide.title))}">${picture}</div>`
      );
    })
    .join('');
}

function renderRail(slides: readonly HeroSlide[], root: string): string {
  if (slides.length < 2) return '';
  const thumbs = slides
    .map(
      (slide, index) =>
        `<button type="button" class="hero__thumb" aria-pressed="${index === 0}" ` +
        `aria-label="${escapeHtml(`Mostrar ${slide.title}`)}" data-hero-thumb>` +
        renderPicture({
          src: root + slide.cover,
          alt: '',
          width: COVER_WIDTH,
          height: COVER_HEIGHT,
          loading: 'lazy',
          fetchpriority: 'low',
        }) +
        `</button>`,
    )
    .join('');
  // Oculto hasta que el script lo muestre: sin JavaScript los botones no harían nada.
  return `<div class="hero__rail" hidden data-hero-rail>${thumbs}</div>`;
}

export function renderHero({
  eyebrow,
  title,
  lead,
  browse,
  playLabel = defaultPlayLabel,
  slides = [],
  root = './',
  headingLevel = 1,
}: HeroProps): string {
  const h = `h${headingLevel}`;
  const active = slides[0];
  // Un solo primario: «Jugar {título}» con destacados; si no, «Ver juegos» y sin ghost.
  const actions = active
    ? renderButton({
        label: playLabel(active.title),
        variant: 'primary',
        href: root + active.href,
        dataAttr: 'data-hero-play',
      }) + renderButton({ label: browse.label, variant: 'ghost', href: browse.href })
    : renderButton({ label: browse.label, variant: 'primary', href: browse.href });
  // La portada del juego activo va en la tarjeta, delante del vórtice. Su enlace es solo para ratón
  // y táctil: el teclado y los lectores ya tienen «Jugar {título}» con el mismo destino.
  const card = active
    ? `<div class="hero__card"><a class="hero__cover-link" href="${escapeHtml(root + active.href)}" ` +
      `tabindex="-1" aria-hidden="true" data-hero-cover>` +
      `<div class="hero__slides">${renderSlides(slides, root, playLabel)}</div></a></div>`
    : '';
  const media =
    `<div class="hero__media"><div class="hero__art" aria-hidden="true">${PORTAL_ART_SVG}</div>` +
    `${card}</div>`;
  const caption = active
    ? `<div class="hero__caption" data-hero-caption aria-live="polite">` +
      `<p class="hero__caption-title">${escapeHtml(active.title)}</p>` +
      `<p class="hero__caption-tagline">${escapeHtml(active.tagline)}</p>` +
      `<a class="hero__caption-link" href="${escapeHtml(root + active.href)}">` +
      `Ver ${escapeHtml(active.title)}</a></div>`
    : '';
  // Oculto hasta que el script lo muestre: sin JavaScript no hay avance automático que pausar.
  const pause =
    slides.length >= 2
      ? '<button type="button" class="btn btn--ghost hero__pause" hidden data-hero-pause>Pausar</button>'
      : '';
  const rail = renderRail(slides, root);
  const controls = rail ? `<div class="hero__controls">${rail}${pause}</div>` : '';
  return (
    // data-accent: el vórtice toma el color del juego activo (CSS generado desde el catálogo).
    `<section class="hero" aria-labelledby="hero-title"${active ? ` data-accent="${escapeHtml(active.id)}"` : ''}>` +
    `<div class="container hero__inner">` +
    media +
    `<div class="hero__panel">` +
    renderEyebrow(eyebrow) +
    `<${h} class="heading" id="hero-title">${escapeHtml(title)}</${h}>` +
    `<p class="hero__lead">${escapeHtml(lead)}</p>` +
    `<div class="hero__actions">${actions}</div></div>` +
    (active ? `<div class="hero__showcase">${caption}${controls}</div>` : '') +
    `</div><div class="hero__sentinel" data-hero-top aria-hidden="true"></div></section>`
  );
}
