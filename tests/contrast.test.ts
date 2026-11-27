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

  // Mezclas en oklab de «Interaction States» (valores precalculados; la cuenta en oklab no se repite aquí).
  it('botón primario: hover (#bba3fa), pulsado (#9c84d9) y texto oscuro', () => {
    const text = hex('--color-on-accent');
    expect(contrast(text, '#bba3fa')).toBeGreaterThanOrEqual(4.5);
    expect(contrast(text, '#9c84d9')).toBeGreaterThanOrEqual(4.5);
  });

  it('chip de filtro: seleccionado (#ede9fe sobre #4b3f71, 7,87:1) y en reposo (#e6e6e6 sobre #000000)', () => {
    expect(contrast(hex('--color-lavender-mist'), hex('--color-indigo-plum'))).toBeCloseTo(7.87, 1);
    expect(contrast('#ede9fe', '#4b3f71')).toBeGreaterThanOrEqual(4.5);
    expect(contrast('#e6e6e6', '#000000')).toBeGreaterThanOrEqual(4.5);
    // El borde violeta del chip seleccionado sobre el lienzo (no es texto: 3:1).
    expect(
      contrast(hex('--color-portal-violet'), hex('--color-void-black')),
    ).toBeGreaterThanOrEqual(3);
  });

  it('Canvas Glow: todo el texto sobre el lienzo iluminado ≥ 4.5:1 (en el catálogo, con el anillo blanco del vórtice encima)', () => {
    const alpha = (name: string): number => {
      const match = /color-mix\(in oklab, (#[0-9a-f]{6}) (\d+)%, transparent\)/.exec(hex(name));
      expect(match, name).not.toBeNull();
      expect(match![1], `${name} es violeta`).toBe(hex('--color-portal-violet'));
      return Number(match![2]) / 100;
    };
    const black = hex('--color-void-black');
    const violet = hex('--color-portal-violet');
    const glow = blend(violet, alpha('--glow-canvas'), black);
    // Fondo del catálogo: anillo blanco al 60 % con el vórtice al 25 % = blanco al 15 % encima.
    const catalog = blend('#ffffff', 0.15, blend(violet, alpha('--glow-canvas-soft'), black));
    for (const fg of TEXT_ON_DARK) {
      expect(contrast(hex(fg), glow), `${fg} sobre ${glow}`).toBeGreaterThanOrEqual(4.5);
      expect(contrast(hex(fg), catalog), `${fg} sobre ${catalog}`).toBeGreaterThanOrEqual(4.5);
    }
  });

  it('Game Light: todo el texto ≥ 4.5:1 sobre la luz de cada color del catálogo (y el violeta)', async () => {
    const { loadCatalog } = await import('../build/catalog.ts');
    const mix = /^(\d+)%$/.exec(tokens.get('--glow-game-mix') ?? '');
    expect(mix, '--glow-game-mix en %').not.toBeNull();
    const alpha = Number(mix?.[1]) / 100;
    const colors = [
      hex('--color-portal-violet'),
      ...loadCatalog().flatMap((game) => (game.color ? [game.color] : [])),
    ];
    expect(colors.length).toBeGreaterThan(1);
    for (const color of colors) {
      const light = blend(color, alpha, hex('--color-void-black'));
      for (const fg of TEXT_ON_DARK) {
        expect(contrast(hex(fg), light), `${fg} sobre ${light}`).toBeGreaterThanOrEqual(4.5);
      }
    }
  });

  it('cabecera sólida (85 % obsidiana) sobre blanco: texto claro ≥ 4.5:1', () => {
    expect(contrast('#e6e6e6', '#2c2c30')).toBeGreaterThanOrEqual(4.5);
  });

  it('velo del hero al 70 % sobre blanco: #e6e6e6 y blanco ≥ 4.5:1', () => {
    expect(contrast('#e6e6e6', '#4c4c50')).toBeGreaterThanOrEqual(4.5);
    expect(contrast('#ffffff', '#4c4c50')).toBeGreaterThanOrEqual(4.5);
  });

  it('leyenda del hero: título, tagline y enlace violeta sobre su fondo en el peor caso (blanco debajo)', () => {
    const css = readFileSync(new URL('../src/styles/components.css', import.meta.url), 'utf8');
    const caption =
      /\.hero__caption\s*\{[^}]*color-mix\(in srgb, var\(--color-obsidian-surface\) (\d+)%/.exec(
        css,
      );
    expect(caption, 'la leyenda usa obsidiana semitransparente').not.toBeNull();
    const worst = blend(hex('--color-obsidian-surface'), Number(caption![1]) / 100, '#ffffff');
    for (const fg of ['--color-foil-highlight', '--color-platinum-text', '--color-portal-violet']) {
      expect(contrast(hex(fg), worst), `${fg} sobre ${worst}`).toBeGreaterThanOrEqual(4.5);
    }
  });

  it('el fundido inferior termina en el lienzo, no en un tono que baje el contraste', () => {
    expect(hex('--surface-void')).toBe('#000000');
  });
});
