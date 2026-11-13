/**
 * Detección de claves y tokens con formato inequívoco (pocos falsos positivos).
 * La usa scripts/check-secrets.mjs sobre los archivos versionados y sobre dist/ antes de publicar.
 * Nunca devuelve el valor encontrado: solo la línea y el tipo, para no repetirlo en los registros.
 */
export const SECRET_PATTERNS: readonly { kind: string; pattern: RegExp }[] = [
  { kind: 'clave privada', pattern: /-----BEGIN (?:[A-Z]+ )*PRIVATE KEY-----/ },
  { kind: 'token de GitHub', pattern: /\bgh[pousr]_[A-Za-z0-9]{36,}\b/ },
  { kind: 'token de GitHub', pattern: /\bgithub_pat_[A-Za-z0-9_]{22,}\b/ },
  { kind: 'clave de AWS', pattern: /\bAKIA[0-9A-Z]{16}\b/ },
  { kind: 'clave de API (sk-)', pattern: /\bsk-[A-Za-z0-9_-]{20,}\b/ },
  { kind: 'clave de Google', pattern: /\bAIza[0-9A-Za-z_-]{35}\b/ },
  { kind: 'token de Slack', pattern: /\bxox[abprs]-[A-Za-z0-9-]{10,}\b/ },
];

export interface SecretHit {
  line: number;
  kind: string;
}

/** Líneas de `text` que contienen algo con forma de secreto. */
export function findSecrets(text: string): SecretHit[] {
  const hits: SecretHit[] = [];
  text.split(/\r?\n/).forEach((content, index) => {
    for (const { kind, pattern } of SECRET_PATTERNS) {
      if (pattern.test(content)) hits.push({ line: index + 1, kind });
    }
  });
  return hits;
}

/** Un archivo con bytes nulos se trata como binario y no se revisa como texto. */
export const isBinary = (content: Buffer) => content.includes(0);
