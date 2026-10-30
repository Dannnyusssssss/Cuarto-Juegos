import { renderButton } from './button.ts';
import { escapeHtml } from './escape.ts';
import { renderEyebrow } from './eyebrow.ts';

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

export interface HeroProps {
  eyebrow: string;
  title: string;
  lead: string;
  primary: { label: string; href: string };
  secondary: { label: string; href: string };
  /** Nivel del titular: 1 en la página de inicio. */
  headingLevel?: 1 | 2;
}

export function renderHero({
  eyebrow,
  title,
  lead,
  primary,
  secondary,
  headingLevel = 1,
}: HeroProps): string {
  const h = `h${headingLevel}`;
  return (
    `<section class="hero" aria-labelledby="hero-title">` +
    `<div class="hero__art">${PORTAL_ART_SVG}</div>` +
    `<div class="container hero__inner"><div class="hero__panel">` +
    renderEyebrow(eyebrow) +
    `<${h} class="display" id="hero-title">${escapeHtml(title)}</${h}>` +
    `<p class="hero__lead">${escapeHtml(lead)}</p>` +
    `<div class="hero__actions">` +
    renderButton({ label: primary.label, variant: 'primary', href: primary.href }) +
    renderButton({ label: secondary.label, variant: 'ghost', href: secondary.href }) +
    `</div></div></div></section>`
  );
}
