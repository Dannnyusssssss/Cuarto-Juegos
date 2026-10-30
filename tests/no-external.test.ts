import { readdirSync, readFileSync, statSync } from 'node:fs';
import { extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
/** Archivos que el navegador carga o que generan HTML. Los .txt de licencias quedan fuera. */
const CODE_EXT = new Set(['.ts', '.css', '.html', '.svg', '.json']);

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

const files = [
  ...['src', 'public', 'build'].flatMap((d) => walk(join(ROOT, d))),
  join(ROOT, 'index.html'),
  join(ROOT, 'styleguide.html'),
  join(ROOT, 'vite.config.ts'),
].filter((f) => CODE_EXT.has(extname(f)));

describe('sin peticiones a dominios externos (Parte A.2, B.6)', () => {
  it('hay archivos que revisar', () => {
    expect(files.length).toBeGreaterThan(10);
  });

  for (const file of files) {
    it(file.slice(ROOT.length), () => {
      expect(readFileSync(file, 'utf8')).not.toMatch(/(?:https?:)?\/\/[a-z0-9-]+\.[a-z]/i);
    });
  }
});
