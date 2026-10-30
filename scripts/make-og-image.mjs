/**
 * Genera public/og-default.png (1200×630), la imagen que muestran las redes al compartir el sitio.
 * Script manual de desarrollo: no forma parte del build ni del despliegue.
 *
 *   npm run og:image
 *
 * Usa solo Node y el Chrome instalado (chrome --headless --screenshot); sin dependencias.
 * Ruta de Chrome: variable CHROME_PATH o la instalación habitual del sistema.
 * Se niega a ejecutarse mientras el sitio tenga el nombre provisional.
 */
import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { escapeHtml } from '../src/components/escape.ts';
import { SITE } from '../src/data/site.ts';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const OUTPUT = join(ROOT, 'public', 'og-default.png');
const WIDTH = 1200;
const HEIGHT = 630;

if (SITE.name === 'Portal' || SITE.name.includes('[COMPLETAR')) {
  console.error(
    'El sitio aún tiene el nombre provisional. Define el nombre definitivo en src/data/site.ts y vuelve a ejecutar.',
  );
  process.exit(1);
}

function findChrome() {
  const candidates = [
    process.env.CHROME_PATH,
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
  ].filter(Boolean);
  return candidates.find((path) => existsSync(path));
}

/** Valores de los tokens de color, leídos de tokens.css para no repetirlos a mano. */
function readTokens() {
  const css = readFileSync(join(ROOT, 'src/styles/tokens.css'), 'utf8');
  const token = (name) => {
    const match = new RegExp(`--${name}:\\s*([^;]+);`).exec(css);
    if (!match) throw new Error(`No se encontró el token --${name}`);
    return match[1].trim();
  };
  return {
    black: token('color-void-black'),
    surface: token('color-obsidian-surface'),
    violet: token('color-portal-violet'),
    white: token('color-foil-highlight'),
    platinum: token('color-platinum-text'),
    muted: token('color-steel-muted'),
  };
}

/** Hexágonos concéntricos rotados (mismo motivo que el arte del portal del inicio). */
function portalArt(t) {
  const hexagon = (r) =>
    Array.from({ length: 6 }, (_, i) => {
      const a = (Math.PI / 3) * i - Math.PI / 2;
      return `${(r * Math.cos(a)).toFixed(1)},${(r * Math.sin(a)).toFixed(1)}`;
    }).join(' ');
  const rings = [250, 215, 180, 145, 110, 78, 48]
    .map(
      (r, i) =>
        `<polygon points="${hexagon(r)}" transform="rotate(${i * 9})" fill="none" ` +
        `stroke="${i % 2 ? t.white : t.violet}" stroke-width="${i % 2 ? 2 : 4}" stroke-linejoin="round"/>`,
    )
    .join('');
  return (
    `<svg class="art" viewBox="-270 -270 540 540" aria-hidden="true">${rings}` +
    `<polygon points="${hexagon(26)}" fill="${t.white}"/></svg>`
  );
}

function page(t) {
  const font = pathToFileURL(
    join(ROOT, 'node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2'),
  ).href;
  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><style>
@font-face { font-family: 'Inter Variable'; src: url('${font}') format('woff2'); font-weight: 100 900; }
html, body { margin: 0; width: ${WIDTH}px; height: ${HEIGHT}px; overflow: hidden; }
body {
  background: radial-gradient(circle at 78% 50%, color-mix(in srgb, ${t.violet} 30%, transparent) 0, transparent 55%), ${t.black};
  font-family: 'Inter Variable', sans-serif; color: ${t.white};
  display: flex; align-items: center; padding: 0 72px; box-sizing: border-box;
}
.text { position: relative; z-index: 1; max-width: 640px; display: flex; flex-direction: column; gap: 24px; }
.eyebrow { color: ${t.muted}; font-size: 20px; font-weight: 500; letter-spacing: 0.2em; text-transform: uppercase; }
h1 { margin: 0; font-size: 96px; font-weight: 900; line-height: 1; letter-spacing: -0.025em; }
p { margin: 0; color: ${t.platinum}; font-size: 28px; line-height: 1.4; letter-spacing: 0.05em; }
.art { position: absolute; right: 40px; top: 50%; width: 560px; height: 560px; transform: translateY(-50%);
  filter: drop-shadow(0 0 16px color-mix(in srgb, ${t.violet} 60%, transparent)); }
</style></head><body>
${portalArt(t)}
<div class="text">
  <span class="eyebrow">Juegos web</span>
  <h1>${escapeHtml(SITE.name)}</h1>
  <p>${escapeHtml(SITE.description)}</p>
</div>
</body></html>`;
}

const chrome = findChrome();
if (!chrome) {
  console.error('No se encontró Chrome. Indica su ruta con la variable CHROME_PATH.');
  process.exit(1);
}

const dir = mkdtempSync(join(tmpdir(), 'og-image-'));
try {
  const html = join(dir, 'og.html');
  writeFileSync(html, page(readTokens()));
  const run = spawnSync(
    chrome,
    [
      '--headless=new',
      '--disable-gpu',
      '--hide-scrollbars',
      '--force-device-scale-factor=1',
      `--user-data-dir=${join(dir, 'profile')}`,
      `--window-size=${WIDTH},${HEIGHT}`,
      '--virtual-time-budget=2000',
      `--screenshot=${OUTPUT}`,
      pathToFileURL(html).href,
    ],
    { stdio: 'inherit' },
  );
  if (run.status !== 0 || !existsSync(OUTPUT)) {
    console.error('Chrome no generó la imagen.');
    process.exit(1);
  }
  console.log(
    `Imagen generada: public/og-default.png (${WIDTH}×${HEIGHT}). Revísala antes de publicar.`,
  );
} finally {
  rmSync(dir, { recursive: true, force: true });
}
