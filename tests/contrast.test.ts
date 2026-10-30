import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { readTokens, resolveToken } from '../build/tokens.ts';

const tokens = readTokens();

function luminance(hex: string): number {
  const channels = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const [r, g, b] = channels.map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!;
}

function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi! + 0.05) / (lo! + 0.05);
}

const hex = (name: string) => resolveToken(tokens, name);

/** Colores de texto usados en el portal y los fondos sobre los que aparecen. */
const TEXT_ON_DARK = [
  '--color-platinum-text',
  '--color-foil-highlight',
  '--color-steel-muted',
  '--color-portal-violet',
  '--color-mint-whisper',
  '--color-ice-blue',
  '--color-lavender-mist',
];
const DARK_BACKGROUNDS = ['--color-void-black', '--color-obsidian-surface'];

/** Mezcla `top` (con opacidad `alpha`) sobre `bottom`, como color-mix(... top N%, transparent) sobre un fondo. */
function blend(top: string, alpha: number, bottom: string): string {
  const ch = (h: string, i: number) => parseInt(h.slice(i, i + 2), 16);
  return (
    '#' +
    [1, 3, 5]
      .map((i) => Math.round(ch(top, i) * alpha + ch(bottom, i) * (1 - alpha)))
      .map((v) => v.toString(16).padStart(2, '0'))
      .join('')
  );
}

describe('contraste WCAG AA (4.5:1)', () => {
  it('texto del hero sobre el peor fondo del panel (arte blanco debajo)', () => {
    const css = readFileSync(new URL('../src/styles/components.css', import.meta.url), 'utf8');
    const panel =
      /\.hero__panel\s*\{[^}]*color-mix\(in srgb, var\(--color-obsidian-surface\) (\d+)%/.exec(css);
    expect(panel, 'el panel del hero usa obsidiana semitransparente').not.toBeNull();
    const worst = blend(hex('--color-obsidian-surface'), Number(panel![1]) / 100, '#ffffff');
    for (const fg of ['--color-foil-highlight', '--color-platinum-text', '--color-steel-muted']) {
      expect(contrast(hex(fg), worst), `${fg} sobre ${worst}`).toBeGreaterThanOrEqual(4.5);
    }
  });

  it('fórmula de referencia', () => {
    expect(contrast('#000000', '#ffffff')).toBeCloseTo(21, 5);
  });

  for (const fg of TEXT_ON_DARK) {
    for (const bg of DARK_BACKGROUNDS) {
      it(`${fg} sobre ${bg}`, () => {
        expect(contrast(hex(fg), hex(bg))).toBeGreaterThanOrEqual(4.5);
      });
    }
  }

  it('botón primario: --color-on-accent sobre --color-portal-violet (4.5:1)', () => {
    expect(contrast(hex('--color-on-accent'), hex('--color-portal-violet'))).toBeGreaterThanOrEqual(
      4.5,
    );
  });

  it('el texto blanco de DESIGN.md sobre el violeta no cumple (por eso el texto del botón es oscuro)', () => {
    expect(contrast('#ffffff', hex('--color-portal-violet'))).toBeLessThan(4.5);
  });

  it('anillo de foco sobre el lienzo ≥ 3:1', () => {
    expect(
      contrast(hex('--color-portal-violet'), hex('--color-void-black')),
    ).toBeGreaterThanOrEqual(3);
  });

  it('todo color de texto usado en el CSS tiene su par evaluado aquí', () => {
    const files = ['base.css', 'components.css', 'styleguide.css'];
    const css = files
      .map((f) => readFileSync(new URL(`../src/styles/${f}`, import.meta.url), 'utf8'))
      .join('\n');
    const used = [...css.matchAll(/(?:^|[\s;{])color:\s*var\((--[\w-]+)\)/g)].map((m) => m[1]!);
    for (const name of new Set(used)) {
      expect([...TEXT_ON_DARK, '--color-on-accent'], name).toContain(name);
    }
  });
});
