import type { Control, Game, GameStatus } from '../data/games.schema.ts';
import type { BadgeProps } from './badge.ts';

export const STATUS_LABEL: Record<GameStatus, string> = {
  available: 'Disponible',
  'in-development': 'En desarrollo',
};

export const CONTROL_LABEL: Record<Control, string> = {
  keyboard: 'Teclado',
  mouse: 'Ratón',
  touch: 'Táctil',
};

/** El ratón acompaña al teclado: no tiene badge propio y solo se nombra en la página del juego. */
const BADGE_CONTROLS: readonly Control[] = ['keyboard', 'touch'];

/** Lista en texto corrido, p. ej. "A, B y C". */
export function listText(words: readonly string[]): string {
  return words.length > 1 ? `${words.slice(0, -1).join(', ')} y ${words.at(-1)}` : (words[0] ?? '');
}

/** Controles en texto corrido, p. ej. "Teclado y ratón". */
export function controlsText(controls: readonly Control[]): string {
  return listText(
    controls.map((c, i) => (i === 0 ? CONTROL_LABEL[c] : CONTROL_LABEL[c].toLowerCase())),
  );
}

/**
 * Badges de un juego, en orden: estado (verde), géneros (violeta),
 * controles y plataforma (azul) y eventos (rosa). El estado sale solo de `status`
 * y los controles solo de `controls`.
 */
export function gameBadges(game: Game): BadgeProps[] {
  const byKind = (kind: BadgeProps['kind']) =>
    game.tags.filter((t) => t.kind === kind).map((t) => ({ label: t.label, kind }));
  return [
    { label: STATUS_LABEL[game.status], kind: 'status' },
    ...byKind('genre'),
    ...game.controls
      .filter((c) => BADGE_CONTROLS.includes(c))
      .map((c) => ({ label: CONTROL_LABEL[c], kind: 'platform' as const })),
    ...byKind('platform'),
    ...byKind('event'),
  ];
}

/**
 * Badges de la tarjeta (máximo 2): los controles que ayudan a elegir en un solo badge azul
 * («Teclado y táctil») y, solo si el juego aún no se puede jugar, el estado «En desarrollo».
 * «Disponible» no se repite en cada tarjeta: sería relleno.
 */
export function cardBadges(game: Game): BadgeProps[] {
  const controls = game.controls.filter((c) => BADGE_CONTROLS.includes(c));
  const badges: BadgeProps[] = [];
  if (controls.length > 0) badges.push({ label: controlsText(controls), kind: 'platform' });
  if (game.status === 'in-development') {
    badges.push({ label: STATUS_LABEL[game.status], kind: 'status' });
  }
  return badges;
}
