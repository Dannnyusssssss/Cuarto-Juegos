import { escapeHtml } from './escape.ts';

export type HeadingSize = 'display' | 'heading' | 'heading-sm';

export interface HeadingProps {
  text: string;
  level: 1 | 2 | 3;
  size: HeadingSize;
  id?: string;
}

export function renderHeading({ text, level, size, id }: HeadingProps): string {
  const idAttr = id === undefined ? '' : ` id="${escapeHtml(id)}"`;
  return `<h${level} class="${size}"${idAttr}>${escapeHtml(text)}</h${level}>`;
}
