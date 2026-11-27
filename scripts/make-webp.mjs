/**
 * Genera public/games/<id>/cover.webp a partir de cover.png de cada juego del catálogo
 * (mismo tamaño; calidad 0.8). Script manual de desarrollo: no forma parte del build.
 *
 *   node scripts/make-webp.mjs
 *
 * Usa solo Node y el Chrome instalado (headless; el resultado del canvas se lee con
 * --dump-dom); sin dependencias.
 * Ruta de Chrome: variable CHROME_PATH o la instalación habitual del sistema.
 */
import { Buffer } from 'node:buffer';
import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const QUALITY = 0.8;

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

const dir = mkdtempSync(join(tmpdir(), 'make-webp-'));
try {
  for (const id of ids) {
    const png = join(ROOT, 'public', 'games', id, 'cover.png');
    // Dentro del try se lanza un error en vez de process.exit(): así el finally borra el temporal.
    if (!existsSync(png)) throw new Error(`Falta ${png}`);
    const html = join(dir, `${id}.html`);
    // La página dibuja el PNG en un canvas y deja el WebP como data URL en <pre id="out">.
    writeFileSync(
      html,
      `<!doctype html><meta charset="utf-8"><pre id="out"></pre><script>
const img = new Image();
img.onload = () => {
  const c = document.createElement('canvas');
  c.width = img.naturalWidth; c.height = img.naturalHeight;
  c.getContext('2d').drawImage(img, 0, 0);
  document.getElementById('out').textContent = c.width + 'x' + c.height + '|' + c.toDataURL('image/webp', ${QUALITY});
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
      { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 },
    );
    const match = /<pre id="out">(\d+x\d+)\|data:image\/webp;base64,([A-Za-z0-9+/=]+)<\/pre>/.exec(
      run.stdout ?? '',
    );
    if (run.status !== 0 || !match) throw new Error(`Chrome no generó la imagen de ${id}.`);
    const out = join(ROOT, 'public', 'games', id, 'cover.webp');
    writeFileSync(out, Buffer.from(match[2], 'base64'));
    console.log(`${id}: cover.webp (${match[1]})`);
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
} finally {
  rmSync(dir, { recursive: true, force: true });
}
