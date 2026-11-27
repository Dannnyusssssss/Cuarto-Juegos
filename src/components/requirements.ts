import type { Control, Game } from '../data/games.schema.ts';
import { escapeHtml } from './escape.ts';

/** Iconos propios de línea (24×24, trazo de 1,5 como el de la marca), decorativos. */
const ICON_PATHS = {
  keyboard:
    '<path d="M2.75 6.75h18.5v10.5H2.75Z"/><path d="M6 10h1m2.5 0h1m2.5 0h1m2.5 0h1M7 14h10"/>',
  mouse:
    '<path d="M12 3.75a4.25 4.25 0 0 1 4.25 4.25v7.5a4.25 4.25 0 0 1-8.5 0V8A4.25 4.25 0 0 1 12 3.75Z"/><path d="M12 6.5v3"/>',
  touch: '<path d="M6.75 2.75h10.5v18.5H6.75Z"/><path d="M10.5 18h3"/>',
  fullscreen: '<path d="M3.75 9V3.75H9m6 0h5.25V9m0 6v5.25H15m-6 0H3.75V15"/>',
  saves:
    '<path d="M2.75 4.75h18.5v14.5H2.75Z"/><path d="M2.75 8.75h18.5M12 11v5m-2.25-2.25L12 16l2.25-2.25"/>',
  noAccount:
    '<path d="M15.25 8.5a3.25 3.25 0 1 1-6.5 0 3.25 3.25 0 0 1 6.5 0Z"/><path d="M5.75 19.25c.8-3.3 3.3-5 6.25-5s5.45 1.7 6.25 5M4 4l16 16"/>',
} as const;

export type RequirementIcon = keyof typeof ICON_PATHS;

export interface Requirement {
  icon: RequirementIcon;
  label: string;
}

const CONTROL_REQUIREMENT: Record<Control, Requirement> = {
  keyboard: { icon: 'keyboard', label: 'Teclado' },
  mouse: { icon: 'mouse', label: 'Ratón' },
  touch: { icon: 'touch', label: 'Pantalla táctil' },
};

/**
 * Qué necesita y qué hace un juego, sacado solo del catálogo: sus controles, pantalla completa si
 * se juega dentro del sitio, si guarda datos en el navegador y que no pide cuentas (el sitio no
 * tiene cuentas).
 */
export function gameRequirements(game: Game): Requirement[] {
  const items = game.controls.map((control) => CONTROL_REQUIREMENT[control]);
  if (game.embed && game.status === 'available') {
    items.push({ icon: 'fullscreen', label: 'Pantalla completa' });
  }
  if (game.storagePrefix !== undefined || game.indexedDb !== undefined) {
    items.push({ icon: 'saves', label: 'Guarda datos solo en este navegador' });
  }
  items.push({ icon: 'noAccount', label: 'Sin cuentas' });
  return items;
}

const icon = (name: RequirementIcon) =>
  `<svg class="requirement-list__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${ICON_PATHS[name]}</svg>`;

/** Requirement List de DESIGN.md: icono decorativo y texto que lleva el significado. */
export function renderRequirementList(items: readonly Requirement[]): string {
  return (
    `<ul class="requirement-list">` +
    items
      .map((item) => `<li>${icon(item.icon)}<span>${escapeHtml(item.label)}</span></li>`)
      .join('') +
    `</ul>`
  );
}
