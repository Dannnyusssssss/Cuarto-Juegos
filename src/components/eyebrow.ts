import { escapeHtml } from './escape.ts';

export function renderEyebrow(text: string): string {
  return `<p class="eyebrow">${escapeHtml(text)}</p>`;
}
