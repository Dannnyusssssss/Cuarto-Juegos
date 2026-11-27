/**
 * Propone el color de cada juego del catálogo a partir de su portada (public/games/<id>/cover.png):
 * busca el tono dominante entre los píxeles con color y lo lleva a la misma luminosidad y croma
 * que el violeta del sitio (OKLCH), para que todos se vean igual de intensos sobre el negro.
 * Solo imprime la propuesta; no modifica el catálogo. Script manual de desarrollo: no forma parte
 * del build.
 *
 *   node scripts/suggest-colors.mjs
 *
 * Usa solo Node y el Chrome instalado (headless; el resultado se lee con --dump-dom); sin
 * dependencias. Ruta de Chrome: variable CHROME_PATH o la instalación habitual del sistema.
 */
import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
/** Violeta del sitio (`--color-portal-violet`): da la luminosidad y el croma de referencia. */
const REFERENCE = '#b296f8';

// ---------- Color: sRGB <-> OKLab (fórmulas publicadas de OKLab) ----------
const toLinear = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const toGamma = (c) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);

function rgbToOklch([r, g, b]) {
  const [lr, lg, lb] = [r, g, b].map((v) => toLinear(v / 255));
  const l = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb);
  const m = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb);
  const s = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb);
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  return [L, Math.hypot(A, B), ((Math.atan2(B, A) * 180) / Math.PI + 360) % 360];
}

/** OKLCH -> sRGB lineal sin recortar (puede salir de 0..1 si está fuera de gama). */
function oklchToLinear([L, C, h]) {
  const A = C * Math.cos((h * Math.PI) / 180);
  const B = C * Math.sin((h * Math.PI) / 180);
  const l = (L + 0.3963377774 * A + 0.2158037573 * B) ** 3;
  const m = (L - 0.1055613458 * A - 0.0638541728 * B) ** 3;
  const s = (L - 0.0894841775 * A - 1.291485548 * B) ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
}

/** Hex del color con esa luminosidad y tono; baja el croma hasta que entra en la gama sRGB. */
function oklchToHex([L, C, h]) {
  let chroma = C;
  let rgb = oklchToLinear([L, chroma, h]);
  while (rgb.some((v) => v < 0 || v > 1) && chroma > 0) {
    chroma -= 0.002;
    rgb = oklchToLinear([L, chroma, h]);
  }
  return (
    '#' +
    rgb
      .map((v) =>
        Math.round(toGamma(Math.min(1, Math.max(0, v))) * 255)
          .toString(16)
          .padStart(2, '0'),
      )
      .join('')
  );
}

const hexToRgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));

/** Tono dominante (grados) de una lista de píxeles RGB, ponderado por croma. */
function dominantHue(pixels) {
  const BINS = 36;
  const weight = new Array(BINS).fill(0);
  const samples = [];
  for (const px of pixels) {
    const [L, C, h] = rgbToOklch(px);
    // Ignora grises, negros y blancos: no dicen nada del color del juego.
    if (C < 0.04 || L < 0.2 || L > 0.95) continue;
    weight[Math.floor(h / (360 / BINS)) % BINS] += C;
    samples.push([C, h]);
  }
  if (samples.length === 0) return null;
  const top = weight.indexOf(Math.max(...weight));
  // Media circular de los tonos del intervalo ganador y sus vecinos.
  let x = 0;
  let y = 0;
  for (const [C, h] of samples) {
    const bin = Math.floor(h / (360 / BINS)) % BINS;
    const dist = Math.min(Math.abs(bin - top), BINS - Math.abs(bin - top));
    if (dist > 1) continue;
    x += C * Math.cos((h * Math.PI) / 180);
    y += C * Math.sin((h * Math.PI) / 180);
  }
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
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

const games = JSON.parse(readFileSync(join(ROOT, 'src/data/games.json'), 'utf8'));
const ids = games.map((game) => game.id);
for (const id of ids) {
  if (typeof id !== 'string' || !SLUG.test(id)) {
    console.error(`Id de juego no válido: ${String(id)}`);
    process.exit(1);
  }
}

const chrome = findChrome();
if (!chrome) {
  console.error('No se encontró Chrome. Indica su ruta con la variable CHROME_PATH.');
  process.exit(1);
}

const [refL, refC] = rgbToOklch(hexToRgb(REFERENCE));
const dir = mkdtempSync(join(tmpdir(), 'suggest-colors-'));
try {
  for (const id of ids) {
    const png = join(ROOT, 'public', 'games', id, 'cover.png');
    // Dentro del try se lanza un error en vez de process.exit(): así el finally borra el temporal.
    if (!existsSync(png)) throw new Error(`Falta ${png}`);
    const html = join(dir, `${id}.html`);
    // La página reduce la portada a 96×54 y deja sus píxeles RGB en hexadecimal en <pre id="out">.
    writeFileSync(
      html,
      `<!doctype html><meta charset="utf-8"><pre id="out"></pre><script>
const img = new Image();
img.onload = () => {
  const c = document.createElement('canvas');
  c.width = 96; c.height = 54;
  const ctx = c.getContext('2d');
  ctx.drawImage(img, 0, 0, c.width, c.height);
  const d = ctx.getImageData(0, 0, c.width, c.height).data;
  let s = '';
  for (let i = 0; i < d.length; i += 4) s += ((1 << 24) | (d[i] << 16) | (d[i + 1] << 8) | d[i + 2]).toString(16).slice(1);
  document.getElementById('out').textContent = s;
};
img.onerror = () => { document.getElementById('out').textContent = 'error'; };
img.src = ${JSON.stringify(pathToFileURL(png).href)};
</script>`,
    );
    const run = spawnSync(
      chrome,
      [
        '--headless=new',
        '--disable-gpu',
        '--allow-file-access-from-files',
        `--user-data-dir=${join(dir, 'profile')}`,
        '--virtual-time-budget=5000',
        '--dump-dom',
        pathToFileURL(html).href,
      ],
      { encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 },
    );
    const match = /<pre id="out">([0-9a-f]+)<\/pre>/.exec(run.stdout ?? '');
    if (run.status !== 0 || !match) throw new Error(`Chrome no leyó la portada de ${id}.`);
    const pixels = match[1].match(/.{6}/g).map((hex) => hexToRgb(`#${hex}`));
    const hue = dominantHue(pixels);
    const color = hue === null ? REFERENCE : oklchToHex([refL, refC, hue]);
    console.log(`${id}: ${color}${hue === null ? ' (portada sin color: violeta)' : ''}`);
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
} finally {
  rmSync(dir, { recursive: true, force: true });
}
