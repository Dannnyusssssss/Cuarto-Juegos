import { escapeHtml } from '../components/escape.ts';
import { renderEyebrow } from '../components/eyebrow.ts';
import { renderHeading } from '../components/heading.ts';
import type { Game } from '../data/games.schema.ts';
import { LEGAL_UPDATED_AT } from '../data/legal.ts';
import { SITE } from '../data/site.ts';
import { clearableGames, clearablePrefixes } from '../data/storage.ts';

/** Declaración de privacidad de GitHub (aloja el sitio en GitHub Pages). */
export const GITHUB_PRIVACY_URL =
  'https://docs.github.com/en/site-policy/privacy-policies/github-privacy-statement';

/** Bloques de texto: cada cadena es un párrafo; una lista se escribe como arreglo. */
type Block = string | readonly string[] | { html: string };

interface Section {
  id: string;
  title: string;
  blocks: readonly Block[];
}

const p = (text: string) => `<p>${escapeHtml(text)}</p>`;
const list = (items: readonly string[]) =>
  `<ul class="legal__list">${items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`;

function renderBlock(block: Block): string {
  if (typeof block === 'string') return p(block);
  if ('html' in block) return block.html;
  return list(block);
}

function renderSection({ id, title, blocks }: Section): string {
  return (
    `<section class="legal__section" aria-labelledby="${id}">` +
    renderHeading({ text: title, level: 2, size: 'heading-sm', id }) +
    blocks.map(renderBlock).join('') +
    `</section>`
  );
}

function renderLegalPage(eyebrow: string, title: string, sections: readonly Section[]): string {
  return (
    `<div class="container legal">` +
    `<div class="legal__intro">` +
    renderEyebrow(eyebrow) +
    renderHeading({ text: title, level: 1, size: 'display' }) +
    `<p class="legal__updated">Última actualización: ` +
    `<time datetime="${LEGAL_UPDATED_AT}">${escapeHtml(formatDate(LEGAL_UPDATED_AT))}</time></p>` +
    `</div>` +
    sections.map(renderSection).join('') +
    `</div>`
  );
}

const MONTHS = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
];

/** "2026-10-30" → "30 de octubre de 2026" (sin depender de la configuración regional). */
export function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number) as [number, number, number];
  return `${d} de ${MONTHS[m - 1]} de ${y}`;
}

const mailto = () => {
  const email = escapeHtml(SITE.email);
  return `<a class="legal__link" href="mailto:${email}">${email}</a>`;
};

const owner = (): Section => ({
  id: 'responsable',
  title: 'Responsable',
  blocks: [
    [
      `Nombre o razón social: ${SITE.owner}`,
      `RUC: ${SITE.ruc}`,
      `Ciudad y país: ${SITE.city}, ${SITE.country}`,
    ],
    { html: `<p>Correo de contacto: ${mailto()}</p>` },
  ],
});

/* ---------- Privacidad ---------- */

/** Bloque del botón para borrar datos. Sin JavaScript queda oculto y vale el texto alternativo. */
function renderClearData(games: readonly Game[]): string {
  const names = clearableGames(games).map((game) => game.title);
  const what =
    names.length > 0 ? `tus récords y ajustes de ${names.join(', ')}` : 'los datos del sitio';
  return (
    `<div class="clear-data" data-clear-data data-prefixes="${escapeHtml(clearablePrefixes(games).join(' '))}" hidden>` +
    `<button type="button" class="btn btn--primary" data-clear-start>` +
    `Borrar datos guardados en este navegador</button>` +
    `<div class="clear-data__confirm" data-clear-confirm hidden>` +
    `<p id="clear-data-question">¿Seguro? Se borrarán ${escapeHtml(what)} de este navegador. ` +
    `No se puede deshacer.</p>` +
    `<div class="clear-data__actions" role="group" aria-labelledby="clear-data-question">` +
    `<button type="button" class="btn btn--primary" data-clear-yes>Sí, borrar</button>` +
    `<button type="button" class="btn btn--ghost" data-clear-cancel>Cancelar</button>` +
    `</div></div>` +
    `<p class="clear-data__status" role="status" data-clear-status></p>` +
    `</div>`
  );
}

export function renderPrivacy(games: readonly Game[]): string {
  const host = new URL(SITE.url).host;
  const stored = games.filter((game) => game.storagePrefix !== undefined);
  const elsewhere = stored.filter((game) => !clearableGames(games).includes(game));
  const github =
    `<a class="legal__link" href="${GITHUB_PRIVACY_URL}" target="_blank" rel="noopener noreferrer">` +
    `declaración de privacidad de GitHub (se abre en una pestaña nueva, en inglés)</a>`;

  return renderLegalPage('Legal', 'Política de privacidad', [
    owner(),
    {
      id: 'resumen',
      title: 'Resumen',
      blocks: [
        `${SITE.name} no recolecta datos personales: no tiene cuentas, formularios, analítica, publicidad ni cookies, y no envía tus datos a ningún servidor propio.`,
        'Lo único que se guarda son los récords y ajustes de los juegos, y se guardan en tu propio navegador.',
      ],
    },
    {
      id: 'datos',
      title: 'Qué datos se tratan y para qué',
      blocks: [
        'Datos guardados en tu navegador (localStorage). Los juegos guardan récords y ajustes para que no los pierdas al volver. Se quedan en tu equipo; ni el sitio ni el responsable los reciben.',
        stored.length > 0
          ? stored.map((game) => `${game.title}: claves que empiezan por «${game.storagePrefix}».`)
          : ['Ningún juego guarda datos por ahora.'],
        {
          html:
            `<p>Registros del alojamiento. El sitio está alojado en GitHub Pages, un servicio de GitHub, Inc. ` +
            `Al visitarlo, tu navegador se conecta a los servidores de GitHub, que pueden registrar tu dirección IP ` +
            `y datos técnicos de la visita según su propia política: ${github}. ` +
            `El responsable de este sitio no tiene acceso a esos registros.</p>`,
        },
        `Juegos embebidos. Los juegos también se sirven desde ${host} (GitHub Pages). Solo se cargan cuando pulsas «Jugar»; antes no se hace ninguna conexión al juego.`,
        'Ningún otro tercero. La tipografía y todos los recursos se sirven desde el propio sitio. No hay fuentes externas, píxeles de seguimiento, videos ni mapas de terceros.',
      ],
    },
    {
      id: 'base-legal',
      title: 'Base legal',
      blocks: [
        'Los datos guardados en tu navegador no los trata el responsable: se crean y se quedan en tu equipo para que el juego funcione, y puedes borrarlos cuando quieras.',
        'Los registros técnicos del alojamiento los trata GitHub para prestar el servicio y mantenerlo seguro, según su propia política.',
      ],
    },
    {
      id: 'conservacion',
      title: 'Tiempo de conservación',
      blocks: [
        'En tu navegador: hasta que los borres con el botón de esta página o desde la configuración del navegador.',
        'En servidores del responsable: ninguno, porque el sitio no tiene servidor propio ni base de datos.',
        'En GitHub: el tiempo que indique su política.',
      ],
    },
    {
      id: 'cookies',
      title: 'Cookies',
      blocks: [
        'El sitio no usa cookies ni tecnologías de rastreo. Por eso no muestra un aviso de cookies. El único almacenamiento es el localStorage de los juegos descrito arriba.',
      ],
    },
    {
      id: 'borrar',
      title: 'Borrar tus datos',
      blocks: [
        {
          html:
            p(
              'Este botón borra solo los datos con los prefijos declarados por el portal y por sus juegos. Nunca borra datos sin un prefijo declarado, para no tocar los de otros sitios que compartan el mismo dominio.',
            ) + renderClearData(games),
        },
        `También puedes borrarlos desde la configuración de tu navegador, eliminando los datos del sitio ${host}. Ten en cuenta que así también se borran los de otros sitios alojados en ${host}.`,
        ...elsewhere.map(
          (game) =>
            `${game.title} se sirve desde otro dominio: sus datos se borran desde la configuración del navegador para ese dominio.`,
        ),
      ],
    },
    {
      id: 'derechos',
      title: 'Tus derechos',
      blocks: [
        'Según la Ley Orgánica de Protección de Datos Personales (LOPDP) del Ecuador, tienes derecho a:',
        [
          'Acceso a tus datos.',
          'Rectificación y actualización.',
          'Eliminación.',
          'Oposición.',
          'Portabilidad.',
          'Suspensión del tratamiento.',
          'No ser objeto de decisiones basadas únicamente en valoraciones automatizadas.',
        ],
        {
          html: `<p>Para ejercerlos, escribe a ${mailto()}. Responderemos en un plazo máximo de 15 días.</p>`,
        },
        'Como el sitio no guarda datos tuyos fuera de tu navegador, normalmente la forma más rápida de eliminarlos es el botón de esta página.',
        'Si crees que no se atendieron tus derechos, puedes presentar un reclamo ante la Superintendencia de Protección de Datos Personales.',
      ],
    },
    {
      id: 'menores',
      title: 'Niñas, niños y adolescentes',
      blocks: [
        'El sitio no pide ni recoge datos de nadie, tampoco de menores de edad: no hay cuentas, chat ni formularios.',
        'Cada juego muestra una nota de contenido y una edad orientativa. Recomendamos que las personas menores de edad jueguen con el acompañamiento de su madre, padre o representante.',
      ],
    },
    {
      id: 'cambios',
      title: 'Cambios en esta política',
      blocks: [
        'Si el sitio cambia lo que hace con los datos, esta página se actualizará antes del cambio y se indicará la nueva fecha arriba.',
      ],
    },
  ]);
}

/* ---------- Términos ---------- */

export function renderTerms(): string {
  return renderLegalPage('Legal', 'Términos y condiciones', [
    owner(),
    {
      id: 'uso',
      title: 'Uso del sitio',
      blocks: [
        `${SITE.name} ofrece juegos web para uso personal y no comercial. Puedes jugarlos gratis en tu navegador.`,
        'No está permitido usar el sitio para fines ilegales, intentar dañarlo o interferir con su funcionamiento.',
      ],
    },
    {
      id: 'propiedad-intelectual',
      title: 'Propiedad intelectual',
      blocks: [
        `Código del sitio: ${SITE.license}`,
        `Juegos propios: ${SITE.license}`,
        'La tipografía Inter y las demás obras de terceros conservan sus propias licencias, indicadas en la página de créditos.',
        'No está permitido copiar, distribuir ni modificar los juegos o el sitio sin autorización del titular.',
      ],
    },
    {
      id: 'disponibilidad',
      title: 'Disponibilidad de los juegos',
      blocks: [
        'Los juegos se ofrecen tal como están. Pueden tener errores, cambiar o dejar de estar disponibles sin aviso previo.',
      ],
    },
    {
      id: 'datos',
      title: 'Datos personales',
      blocks: [
        'El sitio no recolecta datos personales. Los detalles están en la política de privacidad.',
      ],
    },
    {
      id: 'enlaces',
      title: 'Enlaces a otros sitios',
      blocks: [
        'Algunas páginas enlazan a sitios de terceros, como la declaración de privacidad de GitHub. Esos sitios tienen sus propias condiciones.',
      ],
    },
    {
      id: 'ley',
      title: 'Ley aplicable',
      blocks: ['Estos términos se rigen por las leyes de la República del Ecuador.'],
    },
    {
      id: 'cambios',
      title: 'Cambios y contacto',
      blocks: [
        'Estos términos pueden actualizarse; la fecha de arriba indica la última versión.',
        { html: `<p>Para cualquier consulta, escribe a ${mailto()}.</p>` },
      ],
    },
  ]);
}

/* ---------- Créditos ---------- */

export function renderCredits(games: readonly Game[], root: string): string {
  const ofl = `<a class="legal__link" href="${escapeHtml(root)}fonts/Inter-OFL.txt">texto de la licencia</a>`;
  return renderLegalPage('Legal', 'Créditos', [
    {
      id: 'autoria',
      title: 'Autoría',
      blocks: [
        `Diseño y desarrollo del sitio: ${SITE.owner}.`,
        `Licencia del código: ${SITE.license}`,
      ],
    },
    {
      id: 'juegos',
      title: 'Juegos',
      blocks: [games.map((game) => `${game.title}: ${SITE.license}`)],
    },
    {
      id: 'tipografia',
      title: 'Tipografía',
      blocks: [
        {
          html:
            `<p>Inter, de The Inter Project Authors. Licencia SIL Open Font License 1.1 (${ofl}). ` +
            `Se sirve desde este sitio mediante el paquete @fontsource-variable/inter, con la misma licencia.</p>`,
        },
      ],
    },
    {
      id: 'graficos',
      title: 'Gráficos',
      blocks: [
        'El logotipo, el arte del portal y los íconos son originales de este sitio, dibujados en SVG.',
        'Las portadas de los juegos son propias. Las que aún no existen se muestran con una imagen provisional generada.',
      ],
    },
    {
      id: 'herramientas',
      title: 'Herramientas de desarrollo',
      blocks: [
        'El sitio se construye con Vite, TypeScript, Vitest, ESLint y Prettier. Son herramientas de desarrollo: su código no se incluye en las páginas publicadas.',
      ],
    },
  ]);
}
