import js from '@eslint/js';
import { defineConfig } from 'eslint/config';
import prettier from 'eslint-config-prettier';
import tseslint from 'typescript-eslint';

const XSS_MESSAGE = 'Prohibido (Parte A.6): usa textContent y creación de nodos.';

export default defineConfig(
  { ignores: ['dist/', 'node_modules/'] },
  js.configs.recommended,
  tseslint.configs.strict,
  prettier,
  {
    rules: {
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      'no-restricted-properties': [
        'error',
        { property: 'innerHTML', message: XSS_MESSAGE },
        { property: 'outerHTML', message: XSS_MESSAGE },
        { property: 'insertAdjacentHTML', message: XSS_MESSAGE },
        { object: 'document', property: 'write', message: 'Prohibido (Parte A.9).' },
        { object: 'document', property: 'writeln', message: 'Prohibido (Parte A.9).' },
      ],
    },
  },
  {
    // En los tests, los grupos de las regex y los índices están garantizados por el propio test.
    files: ['tests/**/*.ts'],
    rules: { '@typescript-eslint/no-non-null-assertion': 'off' },
  },
);
