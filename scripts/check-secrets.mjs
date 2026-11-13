/**
 * Busca claves y tokens antes de publicar. Sin dependencias.
 *
 *   npm run check:secrets            Archivos versionados (git ls-files) y dist/ si existe.
 *   node scripts/check-secrets.mjs <rutas…>   Solo las rutas indicadas (archivos o carpetas).
 *
 * Si encuentra algo, muestra archivo, línea y tipo (nunca el valor) y termina con código 1.
 * Una clave que llegó al repo se rota: borrarla no basta.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { findSecrets, isBinary } from '../build/secrets.ts';

const ROOT = fileURLToPath(new URL('..', import.meta.url));

/** Archivos de una carpeta, recursivo. */
function walk(path) {
  if (!statSync(path).isDirectory()) return [path];
  return readdirSync(path).flatMap((entry) => walk(join(path, entry)));
}

function defaultFiles() {
  const tracked = execFileSync('git', ['ls-files', '-z'], { cwd: ROOT, encoding: 'utf8' })
    .split('\0')
    .filter(Boolean)
    .map((file) => join(ROOT, file));
  const dist = join(ROOT, 'dist');
  return [...tracked, ...(existsSync(dist) ? walk(dist) : [])];
}

const args = process.argv.slice(2);
const files = args.length > 0 ? args.flatMap((path) => walk(path)) : defaultFiles();

const problems = [];
for (const file of files) {
  if (!existsSync(file)) continue; // Versionado pero borrado en el árbol de trabajo.
  const content = readFileSync(file);
  if (isBinary(content)) continue;
  for (const hit of findSecrets(content.toString('utf8'))) {
    problems.push(`${relative(ROOT, file) || file}:${hit.line}: posible ${hit.kind}`);
  }
}

if (problems.length > 0) {
  console.error(
    `Posibles secretos encontrados (no se muestran sus valores):\n- ${problems.join('\n- ')}`,
  );
  process.exit(1);
}
console.log(`Sin secretos en ${files.length} archivos revisados.`);
