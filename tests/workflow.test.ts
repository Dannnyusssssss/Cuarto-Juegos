import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

/**
 * Comprobaciones del workflow de despliegue, leído como texto (sin dependencias de YAML).
 * Protegen la configuración de seguridad del CI frente a cambios accidentales.
 */
const workflow = readFileSync(
  new URL('../.github/workflows/deploy.yml', import.meta.url),
  'utf8',
).replace(/\r\n/g, '\n');

/** Bloque de un job: desde `  <nombre>:` hasta el siguiente job o el final. */
function jobBlock(name: string): string {
  const match = new RegExp(`\\n  ${name}:\\n([\\s\\S]*?)(?=\\n  [a-z-]+:\\n|$)`).exec(workflow);
  if (!match?.[1]) throw new Error(`No se encontró el job ${name}`);
  return match[1];
}

/** Permisos globales: el bloque `permissions:` sin sangría. */
function topLevelPermissions(): string[] {
  const match = /\npermissions:\n((?: {2}\S.*\n)+)/.exec(workflow);
  return (match?.[1] ?? '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

describe('workflow de despliegue: permisos mínimos', () => {
  it('por defecto solo concede lectura del contenido', () => {
    expect(topLevelPermissions()).toEqual(['contents: read']);
  });

  it('el job que instala y compila no recibe escritura en Pages ni el token de despliegue', () => {
    const build = jobBlock('build');
    expect(build).not.toMatch(/pages:\s*write/);
    expect(build).not.toMatch(/id-token:/);
  });

  it('solo el job de despliegue recibe pages: write e id-token: write', () => {
    const deploy = jobBlock('deploy');
    expect(deploy).toMatch(/permissions:\n\s+pages: write\n\s+id-token: write/);
    expect(workflow.match(/pages: write/g)).toHaveLength(1);
    expect(workflow.match(/id-token: write/g)).toHaveLength(1);
  });

  it('todas las acciones están fijadas por hash de commit', () => {
    const uses = [...workflow.matchAll(/uses:\s*(\S+)/g)].map((m) => m[1]!);
    expect(uses.length).toBeGreaterThan(0);
    for (const action of uses) expect(action).toMatch(/^actions\/[a-z-]+@[0-9a-f]{40}$/);
  });

  it('el checkout no deja credenciales guardadas', () => {
    expect(workflow).toContain('persist-credentials: false');
  });
});

describe('workflow de despliegue: entorno reproducible', () => {
  it('fija la versión exacta de Node (mayor.menor.parche)', () => {
    const versions = [...workflow.matchAll(/node-version:\s*(\S+)/g)].map((m) => m[1]);
    expect(versions).toHaveLength(1);
    expect(versions[0]).toMatch(/^\d+\.\d+\.\d+$/);
  });

  it('instala desde el lockfile', () => {
    expect(workflow).toMatch(/run: npm ci\n/);
  });
});

describe('workflow de despliegue: bloqueos antes de publicar', () => {
  const steps = [...jobBlock('build').matchAll(/run: (.+)/g)].map((m) => m[1]!.trim());

  it('audita todas las dependencias (también las de desarrollo) y bloquea con avisos altos', () => {
    expect(steps).toContain('npm audit --audit-level=high');
    expect(steps.some((step) => step.includes('--omit=dev'))).toBe(false);
  });

  it('busca secretos después del build y antes de subir el sitio', () => {
    const build = jobBlock('build');
    expect(steps.indexOf('npm run check:secrets')).toBeGreaterThan(steps.indexOf('npm run build'));
    expect(build.indexOf('check:secrets')).toBeLessThan(build.indexOf('upload-pages-artifact'));
  });

  it('el orden es: instalar, auditar, lint, tests, build y búsqueda de secretos', () => {
    expect(steps).toEqual([
      'npm ci',
      'npm audit --audit-level=high',
      'npm run lint',
      'npm run test',
      'npm run build',
      'npm run check:secrets',
    ]);
  });
});
