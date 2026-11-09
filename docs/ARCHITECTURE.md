# Arquitectura

Descripción técnica del sitio: cómo está organizado el código, cómo se generan las páginas y qué decisiones lo definen. El código es la referencia final; este documento se actualiza cuando cambian la estructura o una decisión de diseño.

**Última revisión:** 9 de noviembre de 2026.

## Resumen

Sitio estático multipágina que lista y embebe juegos web propios. Se construye con Vite y TypeScript, se publica en GitHub Pages bajo `/Cuarto-Juegos/` y no tiene backend, cuentas, formularios ni cookies. Todo el HTML se genera durante el build a partir de datos tipados; en el navegador solo se ejecuta JavaScript en la página de cada juego (reproductor) y en la política de privacidad (botón de borrado). No hay dependencias de runtime: las de `package.json` son todas `devDependencies`.

## Mapa de carpetas

| Ruta | Contenido |
|---|---|
| `index.html`, `404.html` | Páginas de la raíz, con marcadores que se sustituyen en el build |
| `styleguide.html` | Guía de estilo; solo en desarrollo, no se incluye en el build |
| `src/data/` | Datos del sitio: `site.ts` (nombre, responsable, URL), `games.json` (catálogo), `games.schema.ts` (validación), `home.ts`, `legal.ts`, `embed.ts` (atributos del iframe), `storage.ts` (prefijos de borrado) |
| `src/components/` | Funciones que devuelven HTML escapado: cabecera, pie, tarjeta de juego, badges, botones, metaetiquetas |
| `src/pages/` | Contenido de las páginas: inicio, juego, legales y 404 |
| `src/styles/` | `tokens.css` (variables CSS), `base.css`, `components.css` y `styleguide.css` |
| `src/main.ts` | Entrada común: tipografía y hojas de estilo |
| `src/game-page.ts`, `src/privacy-page.ts` | Únicos scripts con lógica en el navegador |
| `build/` | Plugins propios de Vite, plantilla `page.html` y utilidades del build |
| `public/` | Archivos copiados tal cual: favicon, imagen Open Graph, licencia de la tipografía y portadas en `public/games/<id>/` |
| `scripts/make-og-image.mjs` | Genera `public/og-default.png`; se ejecuta a mano con `npm run og:image` |
| `tests/` | Pruebas con Vitest |
| `docs/` | Documentación pública: arquitectura, licencias e inventario de datos |
| `.github/workflows/deploy.yml` | Lint, pruebas, build y despliegue en GitHub Pages |
| `DESIGN.md` | Especificación visual: colores, tipografía, medidas y componentes |

## Módulos

- **Datos (`src/data/`).** Fuente única de nombres, textos y catálogo. Ningún otro archivo escribe el nombre del sitio ni los datos del responsable: se leen de `SITE` en `site.ts`. El catálogo se valida con `validateCatalog` (`games.schema.ts`) sin dependencias externas.
- **Componentes (`src/components/`).** Funciones puras que reciben datos y devuelven HTML. Todo texto procedente de datos pasa por `escapeHtml` (`escape.ts`). No acceden al DOM ni al almacenamiento.
- **Páginas (`src/pages/`).** Componen los componentes en el contenido de cada página. Reciben el prefijo relativo hasta la raíz del sitio (`./`, `../`, `../../`) para que los enlaces funcionen en cualquier profundidad.
- **Build (`build/`).** Plugins de Vite propios, registrados en `vite.config.ts`:
  - `htmlPartials` (`html-partials.ts`): sustituye los marcadores `<!-- @component nombre -->` de los HTML por el resultado de los componentes.
  - `virtualPages` (`virtual-pages.ts`): genera páginas que no existen en disco (una por juego y las tres legales) a partir de la plantilla `page.html`. La lista de páginas está en `site-pages.ts`.
  - `productionSecurity` (`csp.ts`): añade la política de seguridad de contenido y la política de referrer, y vuelve absolutas las rutas de `404.html`.
  - `sitemap` (`sitemap.ts`): genera `sitemap.xml` con las páginas públicas.
  - `publishCheck` (`publish-check.ts`): revisa el HTML final antes de publicar.
- **Navegador.** `game-page.ts` crea el iframe del juego al pulsar «Jugar», gestiona la ayuda de teclado y la pantalla completa. `privacy-page.ts` implementa el botón de borrado de datos con confirmación en dos pasos. Ambos construyen el DOM con `createElement`, `setAttribute` y `textContent`.

## Flujo principal

```
src/data/games.json
        │
        ▼
build/catalog.ts ── loadCatalog(): lee, valida el esquema y comprueba que existen las portadas
        │            (si algo falla, el build se detiene con la lista de problemas)
        ▼
build/site-pages.ts ── una página por juego (juegos/<id>/) + privacidad/, terminos/, creditos/
        │
        ▼
build/virtual-pages.ts ── plantilla build/page.html + componentes de src/components y src/pages
        │
        ▼
Vite ── index.html y 404.html (con build/html-partials.ts) + páginas virtuales
        │
        ▼
build/csp.ts ── CSP y referrer en <meta>; rutas absolutas en 404.html
build/sitemap.ts ── sitemap.xml
build/publish-check.ts ── bloqueo si quedan datos pendientes
        │
        ▼
dist/ ── GitHub Pages
```

En desarrollo (`npm run dev`), `virtualPages` sirve las páginas virtuales desde memoria y `htmlPartials` recarga la página cuando cambia `games.json`.

## Decisiones técnicas

| Decisión | Motivo |
|---|---|
| Sin dependencias de runtime; plugins de build propios | El sitio es estático y la lógica en el navegador se limita a dos scripts. Lo publicado no incluye código de terceros; el único recurso de terceros es la tipografía Inter (ver `docs/LICENSES.md`). |
| HTML generado en el build, no en el navegador | Las páginas se leen sin JavaScript y el contenido llega completo en la primera respuesta. En el navegador, ESLint prohíbe `innerHTML`, `outerHTML`, `insertAdjacentHTML`, `document.write` y `eval`. |
| Multipágina real, sin rutas de SPA | Cada página es un archivo `index.html` propio, que GitHub Pages sirve como archivo estático. `base: './'` mantiene las rutas de los recursos relativas. |
| Política de seguridad de contenido en `<meta>` | GitHub Pages no permite cabeceras HTTP propias. Por esa razón la política no incluye `frame-ancestors`, que los navegadores ignoran en `<meta>`. Solo se aplica en el build, no en desarrollo. |
| `frame-src` derivado del catálogo | Solo pueden embeberse los orígenes de los juegos disponibles con `embed: true` (`frameSources` en `csp.ts`). |
| Iframe con `sandbox="allow-scripts allow-same-origin allow-pointer-lock"` y `allow="fullscreen"` | Los juegos necesitan ejecutar scripts, guardar datos en `localStorage` y capturar el cursor. Los juegos y el sitio comparten origen, así que `allow-same-origin` da al juego acceso al mismo almacenamiento y al documento del sitio: **el iframe no aísla al juego del sitio**. Los atributos están fijados en `src/data/embed.ts`. |
| El iframe se crea al pulsar «Jugar» | Antes de esa acción no se descarga nada del juego. Sin JavaScript, «Jugar» es un enlace normal al juego. |
| Catálogo validado en cada build | Una entrada inválida, una portada ausente o una URL con parámetros (`?…`) detienen el build. Las URL de los juegos solo admiten `https://` o rutas relativas. |
| Agregar un juego no modifica componentes | Tarjeta, página, badges, CSP, sitemap y prefijos de borrado se derivan de la entrada en `games.json`. |
| Borrado de datos solo por prefijos declarados | El origen `dannnyusssssss.github.io` puede alojar otros sitios. El botón borra solo las claves con el prefijo `portal:` o con el `storagePrefix` de un juego del mismo origen (`keysToClear` en `storage.ts`). |
| Bloqueo de publicación | En GitHub Actions (`CI=true`) o con `npm run build:publish`, el build falla si el HTML contiene marcadores de dato pendiente o el nombre provisional del sitio. En un build local solo muestra un aviso. |
| Estilos solo con variables CSS | Colores, tipografía y medidas se definen en `src/styles/tokens.css`, que refleja `DESIGN.md`. Una prueba comprueba que el resto del CSS no contiene valores fijos. |
| Acciones de GitHub fijadas por hash de commit | El despliegue usa siempre el mismo código de cada acción, con la versión anotada en un comentario. |

## Pruebas

`npm run test` ejecuta Vitest sobre la lógica pura y sobre el HTML generado. Cobertura por archivo:

| Archivo | Comprueba |
|---|---|
| `tests/games-schema.test.ts` | Validez del catálogo real y reglas del esquema |
| `tests/home.test.ts` | Inicio, tarjetas, badges y que una entrada nueva aparece sin tocar componentes |
| `tests/game-pages.test.ts` | Páginas de juego, atributos del iframe y página 404 |
| `tests/legal.test.ts` | Páginas legales, prefijos de borrado y fecha de actualización |
| `tests/components.test.ts` | Escapado de HTML, botones, badges, cabecera y pie |
| `tests/csp.test.ts` | Política de seguridad de contenido y rutas de la 404 |
| `tests/a11y.test.ts` | Accesibilidad básica de todas las páginas publicadas |
| `tests/contrast.test.ts` | Contraste WCAG AA (4,5:1) de los pares de texto y fondo |
| `tests/tokens.test.ts` | Correspondencia entre `tokens.css` y `DESIGN.md` |
| `tests/no-hardcoded.test.ts` | Ausencia de valores fijos en el CSS |
| `tests/no-external.test.ts` | Ausencia de peticiones a dominios externos |
| `tests/publish.test.ts` | Bloqueo de publicación, `sitemap.xml`, favicon e imagen Open Graph |

`npm run lint` ejecuta ESLint (configuración estricta de typescript-eslint) y comprueba el formato con Prettier. El flujo de despliegue ejecuta lint, pruebas y build antes de publicar.

Se revisan a mano, en un navegador real: el aspecto visual, la pantalla completa, la captura del cursor, el control táctil, el sonido de los juegos y los lectores de pantalla.

## Cómo se agrega un juego

1. Añadir una entrada en `src/data/games.json` con los campos que exige `games.schema.ts`: `id`, `title`, `tagline`, `description`, `cover`, `url`, `embed`, `controls`, `tags`, `status`, `contentNote`, `ageHint` y `addedAt`; opcionalmente `screenshots` y `storagePrefix`.
2. Copiar la portada en `public/games/<id>/`.
3. Si el juego guarda datos, declarar su `storagePrefix`: minúsculas, números y guiones terminados en `:` (por ejemplo, `apagon:`), único en el catálogo y distinto de `portal:`, que está reservado.
4. Ejecutar `npm run lint && npm run test && npm run build:publish`.

La página `juegos/<id>/`, la tarjeta del inicio, el `frame-src` de la CSP, el sitemap y el botón de borrado se actualizan sin cambios en el código.

## Límites conocidos

- El iframe no aísla los juegos del sitio, porque comparten origen (ver «Decisiones técnicas»).
- La política de seguridad de contenido se entrega en `<meta>`, así que no admite `frame-ancestors` ni otras directivas que solo funcionan como cabecera HTTP.
- La tecla Esc solo saca el foco del juego cuando el juego es del mismo origen que el sitio. En otro caso, la salida con teclado es Tab.
- Las pruebas automáticas no cubren el comportamiento dentro de los juegos; cada juego se mantiene en su propio repositorio.
- No hay metas de rendimiento definidas ni medidas.
