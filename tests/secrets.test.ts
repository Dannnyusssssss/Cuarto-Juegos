import { describe, expect, it } from 'vitest';
import { findSecrets, isBinary } from '../build/secrets.ts';

/**
 * Las muestras se arman al ejecutar el test para que este archivo no contenga ningún valor con
 * forma de secreto (la búsqueda del CI también revisa los tests).
 */
const join = (...parts: string[]) => parts.join('');
const SAMPLES: [string, string][] = [
  ['clave privada', join('-----BEGIN ', 'RSA PRIVATE', ' KEY-----')],
  ['clave privada', join('-----BEGIN ', 'PRIVATE', ' KEY-----')],
  ['token de GitHub', join('gh', 'p_', 'a'.repeat(36))],
  ['token de GitHub', join('github', '_pat_', 'A1'.repeat(15))],
  ['clave de AWS', join('AKI', 'A', 'B'.repeat(16))],
  ['clave de API (sk-)', join('s', 'k-', 'c'.repeat(24))],
  ['clave de Google', join('AIz', 'a', 'd'.repeat(35))],
  ['token de Slack', join('xo', 'xb-', '1'.repeat(12))],
];

describe('búsqueda de secretos', () => {
  it.each(SAMPLES)('detecta %s', (kind, sample) => {
    expect(findSecrets(`const a = 1;\nconst b = "${sample}";`)).toEqual([{ line: 2, kind }]);
  });

  it('no confunde los tokens de diseño ni textos normales con secretos', () => {
    const text = [
      '--color-portal-violet: #b296f8;',
      'readTokens() y el token de despliegue (id-token: write)',
      'secretos, contraseñas y claves: ninguna en el repo',
      'BEGIN PUBLIC KEY',
      'sk-corto',
    ].join('\n');
    expect(findSecrets(text)).toEqual([]);
  });

  it('nunca devuelve el valor encontrado', () => {
    const [hit] = findSecrets(join('AKI', 'A', 'B'.repeat(16)));
    expect(JSON.stringify(hit)).not.toContain('BBBB');
  });

  it('reconoce los binarios por sus bytes nulos', () => {
    expect(isBinary(Buffer.from([0x89, 0x50, 0x00, 0x01]))).toBe(true);
    expect(isBinary(Buffer.from('texto', 'utf8'))).toBe(false);
  });
});
