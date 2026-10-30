import type { Control, Game, GameStatus } from '../data/games.schema.ts';
import type { BadgeProps } from './badge.ts';

export const STATUS_LABEL: Record<GameStatus, string> = {
  available: 'Disponible',
  'in-development': 'En desarrollo',
};

export const CONTROL_LABEL: Record<Control, string> = {
  keyboard: 'Teclado',
  touch: 'Táctil',
};

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
    ...game.controls.map((c) => ({ label: CONTROL_LABEL[c], kind: 'platform' as const })),
    ...byKind('platform'),
    ...byKind('event'),
  ];
}
