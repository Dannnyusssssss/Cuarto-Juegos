import type { Plugin } from 'vite';
import { SITE } from '../src/data/site.ts';

/** Nombre provisional de desarrollo: no puede publicarse. */
export const PROVISIONAL_NAME = 'Portal';

/** Texto visible de un HTML: sin etiquetas, scripts ni estilos (las clases CSS no cuentan). */
function visibleText(html: string): string {
  return html
    .replace(/<(script|style)\b[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ');
}

/** Atributos que el visitante ve o que se publican (descripción, Open Graph, alt…). */
function publicAttributes(html: string): string {
  return [...html.matchAll(/\s(?:content|alt|title|aria-label)="([^"]*)"/g)]
    .map((m) => m[1])
    .join(' ');
}

/** Problemas que impiden publicar un HTML: [COMPLETAR] o el nombre provisional. */
export function publishProblems(
  file: string,
  html: string,
  siteName: string = SITE.name,
): string[] {
  const problems: string[] = [];
  // [COMPLETAR] no puede quedar en ninguna parte del HTML (tampoco en un mailto: o un atributo).
  const pending = html.match(/\[COMPLETAR/g)?.length ?? 0;
  if (pending > 0) problems.push(`${file}: quedan ${pending} [COMPLETAR]`);
  const text = `${visibleText(html)} ${publicAttributes(html)}`;
  if (siteName === PROVISIONAL_NAME) {
    problems.push(`${file}: el nombre del sitio sigue siendo el provisional "${PROVISIONAL_NAME}"`);
  } else if (new RegExp(`\\b${PROVISIONAL_NAME}\\b`).test(text)) {
    problems.push(`${file}: aparece el nombre provisional "${PROVISIONAL_NAME}"`);
  }
  return problems;
}

/** Modo de Vite de `npm run build:publish`. */
export const PUBLISH_MODE = 'publish';

/** ¿Este build se va a publicar? En GitHub Actions (CI=true) o con `npm run build:publish`. */
export const isPublishBuild = (mode: string, env: NodeJS.ProcessEnv = process.env) =>
  env.CI === 'true' || mode === PUBLISH_MODE;

/**
 * Revisa todo el HTML generado al final del build. Si quedan datos pendientes, en un build de
 * publicación falla (y no hay despliegue); en un build local solo avisa con la lista.
 */
export function publishCheck(): Plugin {
  let strict = false;
  return {
    name: 'portal-publish-check',
    apply: 'build',
    enforce: 'post',
    configResolved(config) {
      strict = isPublishBuild(config.mode);
    },
    generateBundle(_, bundle) {
      const problems = Object.values(bundle)
        .filter((file) => file.type === 'asset' && file.fileName.endsWith('.html'))
        .flatMap((file) =>
          publishProblems(file.fileName, String(file.type === 'asset' ? file.source : '')),
        );
      if (problems.length === 0) return;
      const message = `No se puede publicar todavía:\n- ${problems.join('\n- ')}`;
      if (strict) this.error(message);
      this.warn(
        `${message}\n(Build local: se permite. En GitHub Actions o con build:publish falla.)`,
      );
    },
  };
}
