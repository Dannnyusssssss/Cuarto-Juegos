import { readFileSync } from 'node:fs';

export const TOKENS_PATH = new URL('../src/styles/tokens.css', import.meta.url);

/** Lee las custom properties del bloque :root de un CSS, en orden. */
export function parseTokens(css: string): Map<string, string> {
  const tokens = new Map<string, string>();
  const withoutComments = css.replace(/\/\*[\s\S]*?\*\//g, '');
  for (const match of withoutComments.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) {
    const [, name, value] = match;
    if (name !== undefined && value !== undefined) {
      tokens.set(name, value.replace(/\s+/g, ' ').trim());
    }
  }
  return tokens;
}

export function readTokens(): Map<string, string> {
  return parseTokens(readFileSync(TOKENS_PATH, 'utf8'));
}

/** Resuelve cadenas var(--x) hasta un valor final. */
export function resolveToken(tokens: Map<string, string>, name: string, depth = 0): string {
  const value = tokens.get(name);
  if (value === undefined) throw new Error(`Token inexistente: ${name}`);
  if (depth > 10) throw new Error(`Referencia circular en ${name}`);
  return value.replace(/var\((--[\w-]+)\)/g, (_, ref: string) =>
    resolveToken(tokens, ref, depth + 1),
  );
}
