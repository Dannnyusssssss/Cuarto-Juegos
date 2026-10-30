import { escapeHtml } from './escape.ts';

export type BadgeKind = 'status' | 'platform' | 'genre' | 'event';

/** Res. C.11: verde = estado, azul = plataforma y controles, violeta = género, rosa = evento. */
export const BADGE_CLASS: Record<BadgeKind, string> = {
  status: 'badge--success',
  platform: 'badge--info',
  genre: 'badge--violet',
  event: 'badge--pink',
};

export interface BadgeProps {
  label: string;
  kind: BadgeKind;
}

export function renderBadge({ label, kind }: BadgeProps): string {
  return `<span class="badge ${BADGE_CLASS[kind]}">${escapeHtml(label)}</span>`;
}

export function renderBadgeList(badges: readonly BadgeProps[]): string {
  return `<ul class="badge-list">${badges.map((b) => `<li>${renderBadge(b)}</li>`).join('')}</ul>`;
}
