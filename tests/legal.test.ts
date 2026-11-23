import { describe, expect, it } from 'vitest';
import { loadCatalog } from '../build/catalog.ts';
import { legalVirtualPages } from '../build/site-pages.ts';
import { renderVirtualPage } from '../build/virtual-pages.ts';
import { GAME_LIBRARIES, NOTICE_PATH } from '../src/data/game-libraries.ts';
import { PORTAL_STORAGE_PREFIX, validateCatalog, type Game } from '../src/data/games.schema.ts';
import { LEGAL_LINKS, SITE } from '../src/data/site.ts';
import { clearableGames, clearablePrefixes, keysToClear } from '../src/data/storage.ts';
import { formatDate, GITHUB_PRIVACY_URL } from '../src/pages/legal.ts';

const games = loadCatalog();
const deadShift = games[0]!;
const pages = Object.fromEntries(
  legalVirtualPages(games).map((page) => [page.href, renderVirtualPage(page)]),
);
const privacy = pages['privacidad/']!;
const terms = pages['terminos/']!;
const credits = pages['creditos/']!;

describe('páginas legales', () => {
  it('existen en las mismas rutas que los enlaces del footer', () => {
    expect(Object.keys(pages).sort()).toEqual(LEGAL_LINKS.map((link) => link.href).sort());
  });

  it('cada página marca su enlace del footer como página actual', () => {
    expect(privacy).toContain('<a class="nav-link" href="../privacidad/" aria-current="page">');
    expect(terms).toContain('<a class="nav-link" href="../terminos/" aria-current="page">');
    expect(credits).toContain('<a class="nav-link" href="../creditos/" aria-current="page">');
  });

  it('muestran los datos del responsable desde site.ts y la fecha de actualización', () => {
    for (const html of [privacy, terms]) {
      expect(html).toContain(`Nombre o razón social: ${SITE.owner}`);
      expect(html).toContain(`href="mailto:${SITE.email}"`);
    }
    // El alias es solo de presentación: lo legal y el footer usan el nombre real.
    for (const html of [privacy, terms, credits]) {
      expect(html).toContain(`Responsable: ${SITE.owner}`);
      expect(html).not.toContain(SITE.alias);
    }
    expect(credits).toContain(`Diseño y desarrollo del sitio: ${SITE.owner}.`);
    expect(privacy).toContain(
      'Última actualización: <time datetime="2026-11-23">23 de noviembre de 2026</time>',
    );
  });

  it('formatea fechas en español', () => {
    expect(formatDate('2027-01-05')).toBe('5 de enero de 2027');
  });
});

describe('política de privacidad', () => {
  it('declara que no hay cookies, cuentas, formularios ni analítica', () => {
    expect(privacy).toContain('no tiene cuentas, formularios, analítica, publicidad ni cookies');
    expect(privacy).toContain('El sitio no usa cookies ni tecnologías de rastreo.');
  });

  it('describe las claves que guarda cada juego', () => {
    expect(privacy).toContain('Dead Shift: claves de localStorage que empiezan por «deadshift:».');
    expect(privacy).toContain('Apagón: claves de localStorage que empiezan por «apagon:».');
    expect(privacy).toContain('Trazada: claves de localStorage que empiezan por «trazada:».');
    expect(privacy).toContain('Fulgor: claves de localStorage que empiezan por «fulgor:».');
    expect(privacy).toContain('Zumbido: claves de localStorage que empiezan por «zumbido:».');
    expect(privacy).toContain(
      'Ceniza y Luz: claves de localStorage que empiezan por «cenizayluz:».',
    );
    expect(privacy).toContain('Cerrojo: claves de localStorage que empiezan por «cerrojo:».');
  });

  it('declara IndexedDB para los juegos que guardan ahí y cómo borrar esos datos', () => {
    expect(privacy).toContain('Datos guardados en tu navegador (localStorage e IndexedDB).');
    expect(privacy).toContain(
      'Dead Shift 3D: archivos en IndexedDB, dentro de la carpeta «dead-shift-3d».',
    );
    expect(privacy).toContain(
      'El botón no borra los datos de Dead Shift 3D, porque se guardan en IndexedDB. Bórralos con el botón «Borrar datos guardados», en el menú principal del juego.',
    );
    expect(privacy).toContain(
      'así se borran los datos de todo el dominio dannnyusssssss.github.io: los de todos los juegos de este sitio y los de otros sitios alojados en él.',
    );
    expect(privacy).toContain(
      'El único almacenamiento es el de los juegos en tu navegador (localStorage e IndexedDB), descrito arriba.',
    );
    expect(privacy).toContain(
      'hasta que los borres con el botón de esta página, desde el propio juego o desde la configuración del navegador.',
    );
  });

  it('explica que GitHub Pages aloja el sitio y puede registrar IP, con enlace seguro', () => {
    expect(privacy).toContain('El sitio está alojado en GitHub Pages');
    expect(privacy).toContain('pueden registrar tu dirección IP');
    expect(privacy).toContain(
      `<a class="legal__link" href="${GITHUB_PRIVACY_URL}" target="_blank" rel="noopener noreferrer">`,
    );
  });

  it('enumera los derechos LOPDP, el plazo, la Superintendencia y los menores', () => {
    for (const right of [
      'Acceso',
      'Rectificación y actualización',
      'Eliminación',
      'Oposición',
      'Portabilidad',
      'Suspensión del tratamiento',
      'No ser objeto de decisiones',
    ]) {
      expect(privacy).toContain(right);
    }
    expect(privacy).toContain('15 días');
    expect(privacy).toContain('Superintendencia de Protección de Datos Personales');
    expect(privacy).toContain('Niñas, niños y adolescentes');
  });

  it('el botón para borrar datos está oculto sin JavaScript y lleva solo prefijos declarados', () => {
    expect(privacy).toContain(
      'data-clear-data data-prefixes="portal: deadshift: apagon: trazada: fulgor: zumbido: cenizayluz: cerrojo:" hidden>',
    );
    expect(privacy).toContain('>Borrar datos guardados en este navegador</button>');
    expect(privacy).toContain(
      'Se borrarán tus récords, partidas guardadas y ajustes de Dead Shift, Apagón, Trazada, Fulgor, Zumbido, Ceniza y Luz y Cerrojo de este navegador.',
    );
    expect(privacy).toContain('data-clear-yes>Sí, borrar</button>');
    expect(privacy).toContain('data-clear-cancel>Cancelar</button>');
    expect(privacy).toContain('role="status"');
    expect(privacy).toContain('<script type="module" src="/src/privacy-page.ts"></script>');
  });
});

describe('términos y créditos', () => {
  it('términos: uso personal, licencia, juegos tal cual, ley de Ecuador', () => {
    expect(terms).toContain('uso personal y no comercial');
    expect(terms).toContain(`Código del sitio: ${SITE.license}`);
    expect(terms).toContain('Los juegos se ofrecen tal como están');
    expect(terms).toContain('leyes de la República del Ecuador');
  });

  it('créditos: Inter con su licencia OFL servida localmente, y licencia de los juegos', () => {
    expect(credits).toContain('SIL Open Font License 1.1');
    expect(credits).toContain('href="../fonts/Inter-OFL.txt"');
    expect(credits).toContain(`Dead Shift: ${SITE.license}`);
    for (const game of games) expect(credits).toContain(`${game.title}: ${SITE.license}`);
  });

  it('créditos: las librerías de los juegos, con avisos que apuntan solo al propio juego', () => {
    expect(credits).toContain('Librerías dentro de los juegos');
    for (const entry of GAME_LIBRARIES) {
      const game = games.find((g) => g.id === entry.gameId);
      expect(game, `juego ${entry.gameId} en el catálogo`).toBeDefined();
      expect(credits).toContain(`${game!.title}: ${entry.library}, licencia ${entry.license}`);
      for (const notice of entry.notices) {
        expect(notice.path).toMatch(NOTICE_PATH);
        expect(credits).toContain(
          `href="${game!.url}${notice.path}" target="_blank" rel="noopener noreferrer"`,
        );
      }
    }
    expect(credits).toContain(
      'avisos de licencia (se abre en una pestaña nueva, en español e inglés)</a>',
    );
    expect(credits).toContain(
      'Fulgor: three.js, licencia MIT. El aviso de licencia va dentro del código del juego.',
    );
  });

  it('créditos: la ruta de un aviso no puede salir del juego', () => {
    for (const bad of [
      '../x.md',
      'https://otro.example/x',
      '//otro.example/x',
      'a?b=1',
      'a#b',
      '/x',
    ]) {
      expect(bad).not.toMatch(NOTICE_PATH);
    }
  });

  it('la licencia es "Todos los derechos reservados" con su titular', () => {
    expect(SITE.license).toBe('Todos los derechos reservados. Titular: Danny Sivinta');
  });

  it('sin RUC no se muestra esa línea (y nunca la cédula)', () => {
    expect(SITE.ruc).toBeNull();
    for (const html of [privacy, terms]) expect(html).not.toMatch(/RUC|[Cc]édula/);
  });
});

describe('borrar datos guardados', () => {
  it('borra solo claves con prefijos declarados', () => {
    const keys = ['deadshift:v1', 'portal:x', 'otro-sitio', 'deadshiftv1', 'misc:deadshift:'];
    expect(keysToClear(keys, ['portal:', 'deadshift:'])).toEqual(['deadshift:v1', 'portal:x']);
  });

  it('nunca borra claves sin prefijo declarado, aunque llegue un prefijo vacío o mal formado', () => {
    const keys = ['deadshift:v1', 'otro-sitio', 'tema'];
    expect(keysToClear(keys, [''])).toEqual([]);
    expect(keysToClear(keys, ['deadshift'])).toEqual([]);
    expect(keysToClear(keys, [])).toEqual([]);
  });

  it('prefijos: el del portal y los de juegos del mismo origen', () => {
    expect(clearablePrefixes(games)).toEqual([
      PORTAL_STORAGE_PREFIX,
      'deadshift:',
      'apagon:',
      'trazada:',
      'fulgor:',
      'zumbido:',
      'cenizayluz:',
      'cerrojo:',
    ]);
  });

  it('ningún prefijo es el comienzo de otro: borrar un juego no toca los datos de otro', () => {
    const prefixes = clearablePrefixes(games);
    for (const a of prefixes) {
      for (const b of prefixes) if (a !== b) expect(b.startsWith(a)).toBe(false);
    }
  });

  it('un juego en otro origen no entra en el botón y la política explica cómo borrarlo', () => {
    const other: Game = {
      ...deadShift,
      id: 'otro',
      title: 'Otro',
      url: 'https://ejemplo.com/otro/',
      storagePrefix: 'otro:',
    };
    expect(clearableGames([deadShift, other])).toEqual([deadShift]);
    const [page] = legalVirtualPages([deadShift, other]);
    expect(renderVirtualPage(page!)).toContain(
      'Otro se sirve desde otro dominio: sus datos se borran desde la configuración del navegador',
    );
  });
});

describe('esquema: storagePrefix', () => {
  const entry = (storagePrefix: unknown, id = 'x') => ({
    ...deadShift,
    id,
    cover: `games/${id}/cover.svg`,
    storagePrefix,
  });
  const problems = (data: unknown[]) => {
    try {
      validateCatalog(data);
      return [];
    } catch (error) {
      return (error as { problems: string[] }).problems;
    }
  };

  it('acepta un prefijo válido y lo hace opcional', () => {
    expect(problems([entry('mi-juego:')])).toEqual([]);
    const withoutPrefix: Record<string, unknown> = entry('x:');
    delete withoutPrefix.storagePrefix;
    expect(problems([withoutPrefix])).toEqual([]);
  });

  it('rechaza prefijos vacíos, sin ":", reservados o repetidos', () => {
    expect(problems([entry('')]).join()).toMatch(/storagePrefix/);
    expect(problems([entry('deadshift')]).join()).toMatch(/terminar en ":"/);
    expect(problems([entry('portal:')]).join()).toMatch(/reservado/);
    expect(problems([entry('a:', 'x'), entry('a:', 'y')]).join()).toMatch(/repetido/);
  });
});
