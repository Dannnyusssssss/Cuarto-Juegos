# Arquitectura

Descripción técnica del sitio: cómo está organizado el código, cómo se generan las páginas y qué decisiones lo definen. El código es la referencia final; este documento se actualiza cuando cambian la estructura o una decisión de diseño.

**Última revisión:** 26 de noviembre de 2026.

## Resumen

Sitio estático multipágina que lista y embebe juegos web propios. Se construye con Vite y TypeScript, se publica en GitHub Pages bajo `/Cuarto-Juegos/` y no tiene backend, cuentas, formularios ni cookies. Todo el HTML se genera durante el build a partir de datos tipados; en el navegador solo se ejecuta JavaScript en el inicio (cabecera, hero y filtros), en la página de cada juego (reproductor) y en la política de privacidad (botón de borrado). Todo ese JavaScript es una mejora: sin él, las páginas se leen completas. No hay dependencias de runtime: las de `package.json` son todas `devDependencies`.

## Mapa de carpetas

| Ruta | Contenido |
|---|---|
| `index.html`, `404.html` | Páginas de la raíz, con marcadores que se sustituyen en el build |
| `styleguide.html` | Guía de estilo; solo en desarrollo, no se incluye en el build |
| `src/data/` | Datos del sitio: `site.ts` (nombre, responsable, URL), `games.json` (catálogo), `games.schema.ts` (validación), `home.ts`, `legal.ts`, `embed.ts` (atributos del iframe), `storage.ts` (prefijos de borrado y juegos que guardan en IndexedDB), `game-libraries.ts` (librerías de terceros dentro de los juegos, para los créditos) |
| `src/components/` | Funciones que devuelven HTML escapado: cabecera, pie, tarjeta de juego, badges, botones, metaetiquetas y requisitos de un juego con sus iconos (`requirements.ts`) |
| `src/pages/` | Contenido de las páginas: inicio, juego, legales y 404 |
| `src/styles/` | `tokens.css` (variables CSS), `base.css`, `components.css` y `styleguide.css` |
| `src/main.ts` | Entrada común: tipografía, hojas de estilo y el CSS generado desde el catálogo (`virtual:game-theme.css`) |
| `src/game-page.ts`, `src/privacy-page.ts`, `src/home-page.ts` | Scripts con lógica en el navegador (`src/framing.ts`: comprobación de si la página está enmarcada; `src/hero.ts` y `src/catalog-filter.ts`: lógica pura, sin DOM, del cambio de diapositiva y del filtro del catálogo) |
| `build/` | Plugins propios de Vite, plantilla `page.html` y utilidades del build |
| `public/` | Archivos copiados tal cual: favicon, imagen Open Graph, licencia de la tipografía y portadas en `public/games/<id>/` (PNG y su copia WebP) |
| `scripts/make-og-image.mjs` | Genera `public/og-default.png`; se ejecuta a mano con `npm run og:image` |
| `scripts/make-webp.mjs` | Genera `cover.webp` a partir de `cover.png` de cada juego con Chrome sin ventana y sin dependencias; se ejecuta a mano con `node scripts/make-webp.mjs` |
| `scripts/suggest-colors.mjs` | Propone el color de cada juego a partir de su portada (tono dominante llevado a la luminosidad del violeta del sitio) con Chrome sin ventana y sin dependencias; solo imprime la propuesta. Se ejecuta a mano con `node scripts/suggest-colors.mjs` |
| `scripts/check-secrets.mjs` | Busca claves y tokens en los archivos versionados y en `dist/` (`npm run check:secrets`); lo ejecuta también el despliegue |
| `tests/` | Pruebas con Vitest |
| `docs/` | Documentación pública: arquitectura, licencias e inventario de datos |
| `.github/workflows/deploy.yml` | Auditoría de dependencias, lint, pruebas, build, búsqueda de claves y despliegue en GitHub Pages |
| `DESIGN.md` | Especificación visual: colores, tipografía, medidas y componentes |

## Módulos

- **Datos (`src/data/`).** Fuente única de nombres, textos y catálogo. Ningún otro archivo escribe el nombre del sitio ni los datos del responsable: se leen de `SITE` en `site.ts`. El catálogo se valida con `validateCatalog` (`games.schema.ts`) sin dependencias externas.
- **Componentes (`src/components/`).** Funciones puras que reciben datos y devuelven HTML. Todo texto procedente de datos pasa por `escapeHtml` (`escape.ts`). No acceden al DOM ni al almacenamiento.
- **Páginas (`src/pages/`).** Componen los componentes en el contenido de cada página. Reciben el prefijo relativo hasta la raíz del sitio (`./`, `../`, `../../`) para que los enlaces funcionen en cualquier profundidad.
- **Build (`build/`).** Plugins de Vite propios, registrados en `vite.config.ts`:
  - `htmlPartials` (`html-partials.ts`): sustituye los marcadores `<!-- @component nombre -->` de los HTML por el resultado de los componentes.
  - `virtualPages` (`virtual-pages.ts`): genera páginas que no existen en disco (una por juego y las tres legales) a partir de la plantilla `page.html`. La lista de páginas está en `site-pages.ts`.
  - `gameTheme` (`game-theme.ts`): sirve el módulo CSS virtual `virtual:game-theme.css`, generado desde el catálogo: el color de cada juego (`[data-accent]`), el tinte del fondo del catálogo y el nombre de transición de cada portada (`[data-vt]`). Vuelve a comprobar que cada `id` es un slug y cada color un `#rrggbb`; si no, detiene el build.
  - `fontPreload` (`font-preload.ts`): solo en el build, añade a cada página la precarga de la tipografía (subconjunto latin), con la ruta relativa a la página.
  - `productionSecurity` (`csp.ts`): añade la política de seguridad de contenido y la política de referrer, y vuelve absolutas las rutas de `404.html`.
  - `sitemap` (`sitemap.ts`): genera `sitemap.xml` con las páginas públicas.
  - `publishCheck` (`publish-check.ts`): revisa el HTML final antes de publicar.

  `secrets.ts` no es un plugin: contiene la detección de claves que usa `scripts/check-secrets.mjs`.
- **Navegador.** `game-page.ts` crea el iframe del juego al pulsar «Jugar» o la portada, muestra «Cargando {título}…» con el escenario marcado como ocupado (`aria-busy`) hasta que el juego carga, pasa el escenario a todo el ancho y gestiona la ayuda de teclado y la pantalla completa. `privacy-page.ts` implementa el botón de borrado de datos con confirmación en dos pasos; el botón no se muestra si la página está dentro de un marco (`isFramed` en `framing.ts`). Ambos construyen el DOM con `createElement`, `setAttribute` y `textContent`. `home-page.ts` vuelve transparente la cabecera fija mientras la página está arriba del todo (`IntersectionObserver`), cambia la diapositiva del hero al pulsar una miniatura o cada 7 segundos (avance automático con botón de pausa), indica el juego activo en `data-accent` (solo si el id es un slug, `isSafeSlug`) y filtra el catálogo con los chips; solo alterna `hidden`, clases, `dataset`, `textContent`, `aria-pressed` y `href`. No importa módulos de `src/data/`: los textos que necesita llegan en atributos `data-` generados en el build.

## Flujo principal

```
src/data/games.json
        │
        ▼
build/catalog.ts ── loadCatalog(): lee, valida el esquema, comprueba que existen las portadas y que los SVG no llevan scripts
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
build/game-theme.ts ── CSS generado desde el catálogo (colores y nombres de transición)
build/font-preload.ts ── precarga de la tipografía en cada página
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
| HTML generado en el build, no en el navegador | Las páginas se leen sin JavaScript y el contenido llega completo en la primera respuesta. En el navegador, ESLint prohíbe `innerHTML`, `outerHTML`, `insertAdjacentHTML`, `srcdoc`, `setHTMLUnsafe`, `parseHTMLUnsafe`, `createContextualFragment`, `DOMParser`, `document.write` y `eval`. |
| Multipágina real, sin rutas de SPA | Cada página es un archivo `index.html` propio, que GitHub Pages sirve como archivo estático. `base: './'` mantiene las rutas de los recursos relativas. |
| Política de seguridad de contenido en `<meta>` | GitHub Pages no permite cabeceras HTTP propias. Por esa razón la política no incluye `frame-ancestors`, que los navegadores ignoran en `<meta>`. Solo se aplica en el build, no en desarrollo. |
| `frame-src` derivado del catálogo | Solo pueden embeberse los orígenes de los juegos disponibles con `embed: true` (`frameSources` en `csp.ts`). Como el catálogo se valida antes, esos orígenes siempre pertenecen a la lista blanca `GAME_ORIGINS`. |
| Iframe con `sandbox="allow-scripts allow-same-origin allow-pointer-lock"` y `allow` que concede solo `fullscreen` | Los juegos necesitan ejecutar scripts, guardar datos en `localStorage` o IndexedDB y capturar el cursor. `allow` niega de forma explícita cámara, micrófono, ubicación, captura de pantalla, USB, puerto serie, HID, Bluetooth y pagos (`DENIED_FEATURES`): sin esa negación, un iframe del mismo origen las heredaría. Esto frena a un juego con un fallo, no a uno malicioso. Los juegos y el sitio comparten origen, así que `allow-same-origin` da al juego acceso al mismo almacenamiento y al documento del sitio: **el iframe no aísla al juego del sitio**. Los atributos están fijados en `src/data/embed.ts`. |
| El iframe se crea al pulsar «Jugar» | Antes de esa acción no se descarga nada del juego. Sin JavaScript, «Jugar» es un enlace normal al juego. |
| Catálogo validado en cada build | Una entrada inválida, una portada ausente, un SVG con scripts o una URL con parámetros (`?…`) o fragmento (`#…`) detienen el build. Las URL de los juegos solo admiten rutas relativas o `https://` hacia un origen de la lista blanca `GAME_ORIGINS` (`src/data/embed.ts`, hoy solo el del propio sitio): un juego de otro origen también detiene el build. Se rechazan los espacios, los caracteres de control o invisibles y la barra invertida, porque el navegador los ignora o los reinterpreta y una URL que parece relativa podría abrirse en otro origen. Los textos tienen tope de longitud y no admiten caracteres de control, invisibles ni de dirección del texto. |
| El JavaScript del inicio es una mejora | Sin JavaScript se leen el hero y todas las tarjetas, la cabecera queda sólida y no aparecen el riel de miniaturas ni los chips, que no funcionarían. El script no lee la URL ni guarda nada. Los enlaces que toma de los atributos `data-` se aceptan solo si son rutas relativas del sitio (`isSafeHref`). Las animaciones van en CSS dentro de `prefers-reduced-motion: no-preference`; las ligadas al desplazamiento, además, dentro de `@supports`. Lo único que se mueve solo es el avance automático del hero: tiene un botón de pausa, se detiene con el puntero o el foco dentro del hero y con la pestaña oculta, no existe con movimiento reducido, y mientras avanza la leyenda no se anuncia a los lectores de pantalla. |
| Tarjeta entera clicable con un solo enlace | El enlace «Jugar» de cada tarjeta se extiende sobre toda la tarjeta con un pseudoelemento, de modo que la imagen también abre el juego sin añadir enlaces repetidos para el teclado ni para los lectores de pantalla. En el hero, la portada es un enlace solo para ratón y táctil (`tabindex="-1"`, `aria-hidden`), porque el botón «Jugar» ofrece el mismo destino. |
| Portadas en WebP con respaldo PNG | `<picture>` sirve la WebP (en conjunto, unas 15 veces más ligeras que los PNG) y deja el PNG para navegadores sin soporte. La primera portada del hero se pide con prioridad alta y sin carga diferida; el resto, con carga diferida. El build falla si falta la WebP de una portada PNG o JPG. |
| Color de cada juego solo en el vórtice decorativo | El campo opcional `color` del catálogo (`#rrggbb`, validado) tiñe el vórtice del hero, el de la ficha y el fondo del catálogo; botones, enlaces, foco y badges siguen en el violeta del sitio. El color llega como CSS generado en el build (`gameTheme`): el navegador no escribe estilos, y el script del inicio solo cambia `data-accent` con un id validado. Sin `color`, el vórtice es violeta. |
| Transiciones entre páginas solo con CSS | `@view-transition` (transiciones entre documentos) y el desplazamiento suave van dentro de `prefers-reduced-motion: no-preference`. La cabecera tiene un nombre fijo y la portada de cada juego el suyo (`cover-<id>`), que aparece como máximo una vez por página: así viaja de la tarjeta a la ficha. Donde el navegador no las admite, la navegación es una carga normal. |
| Ficha del juego en dos columnas | Portada (y capturas, si existen) a un lado e información al otro desde 1000 px; debajo se apilan. Un único botón primario, en el panel «Jugar», junto a la edad orientativa, los controles y la nota de contenido. Los requisitos (controles, pantalla completa, si guarda datos en el navegador, sin cuentas) salen del catálogo. «Más juegos» muestra hasta tres juegos disponibles, primero los que comparten género. La portada es la imagen más grande de la página y se pide sin carga diferida y con prioridad alta. |
| Precarga de la tipografía | Sin precarga, Inter se pide después de leer el CSS y el titular se repinta tarde. El archivo es del propio sitio; el plugin falla si no encuentra exactamente uno. |
| Agregar un juego no modifica componentes | Tarjeta, página, badges, CSP, sitemap y prefijos de borrado se derivan de la entrada en `games.json`. |
| Borrado de datos solo por prefijos declarados | El origen `dannnyusssssss.github.io` puede alojar otros sitios. El botón borra solo las claves con el prefijo `portal:` o con el `storagePrefix` de un juego del mismo origen (`keysToClear` en `storage.ts`). No borra lo que un juego guarda en IndexedDB: para esos juegos, la política indica el botón de borrado del propio juego (campo `indexedDb`). |
| Bloqueo de publicación | En GitHub Actions (`CI=true`) o con `npm run build:publish`, el build falla si el HTML contiene marcadores de dato pendiente o el nombre provisional del sitio. En un build local solo muestra un aviso. |
| Estilos solo con variables CSS | Colores, tipografía y medidas se definen en `src/styles/tokens.css`, que refleja `DESIGN.md`. Una prueba comprueba que el resto del CSS no contiene valores fijos. |
| Acciones de GitHub fijadas por hash de commit | El despliegue usa siempre el mismo código de cada acción, con la versión anotada en un comentario. La versión de Node también es exacta. |
| Permisos mínimos en el despliegue | Por defecto el flujo solo lee el repositorio. El permiso de publicar en Pages lo recibe únicamente el job que despliega, no el que instala dependencias y compila. |
| Bloqueos antes de publicar | El despliegue se detiene si la auditoría de dependencias (incluidas las de desarrollo, que se ejecutan al compilar) encuentra avisos altos o críticos, o si aparece algo con forma de clave o token en el repositorio o en `dist/`. |

## Pruebas

`npm run test` ejecuta Vitest sobre la lógica pura y sobre el HTML generado. Cobertura por archivo:

| Archivo | Comprueba |
|---|---|
| `tests/games-schema.test.ts` | Validez del catálogo real, reglas del esquema, URL y textos hostiles, y SVG sin scripts |
| `tests/home.test.ts` | Inicio, hero, cabecera, tarjetas, badges y que una entrada nueva aparece sin tocar componentes |
| `tests/hero.test.ts` | Lógica del cambio de diapositiva, rutas aceptadas, script del inicio sin APIs prohibidas ni datos del sitio, y animaciones solo con movimiento permitido |
| `tests/catalog-filter.test.ts` | Chips del catálogo (lista cerrada) y lógica del filtro |
| `tests/game-pages.test.ts` | Páginas de juego (un primario, imagen principal, requisitos, «Más juegos», nombres de transición únicos), atributos del iframe y página 404 |
| `tests/game-theme.test.ts` | CSS generado desde el catálogo (una regla por juego, solo slugs y colores, entradas hostiles) y transiciones solo con movimiento permitido |
| `tests/font-preload.test.ts` | Precarga de la tipografía: archivo correcto y ruta relativa a cada página |
| `tests/legal.test.ts` | Páginas legales, prefijos de borrado, botón oculto dentro de un marco y fecha de actualización |
| `tests/components.test.ts` | Escapado de HTML, botones, badges, cabecera y pie |
| `tests/csp.test.ts` | Política de seguridad de contenido y rutas de la 404 |
| `tests/a11y.test.ts` | Accesibilidad básica de todas las páginas publicadas |
| `tests/contrast.test.ts` | Contraste WCAG AA (4,5:1) de los pares de texto y fondo |
| `tests/tokens.test.ts` | Correspondencia entre `tokens.css` y `DESIGN.md` |
| `tests/no-hardcoded.test.ts` | Ausencia de valores fijos en el CSS |
| `tests/no-external.test.ts` | Ausencia de peticiones a dominios externos |
| `tests/publish.test.ts` | Bloqueo de publicación, `sitemap.xml`, favicon e imagen Open Graph |
| `tests/secrets.test.ts` | Detección de claves y tokens, sin falsos positivos con textos normales |
| `tests/workflow.test.ts` | Permisos, orden de los pasos, acciones fijadas y versión de Node del flujo de despliegue |

`npm run lint` ejecuta ESLint (configuración estricta de typescript-eslint) y comprueba el formato con Prettier. El flujo de despliegue ejecuta auditoría de dependencias, lint, pruebas, build y búsqueda de claves antes de publicar.

Se revisan a mano, en un navegador real: el aspecto visual, la pantalla completa, la captura del cursor, el control táctil, el sonido de los juegos y los lectores de pantalla.

## Cómo se agrega un juego

1. Añadir una entrada en `src/data/games.json` con los campos que exige `games.schema.ts`: `id`, `title`, `tagline`, `description`, `cover`, `url`, `embed`, `controls`, `tags`, `status`, `contentNote`, `ageHint` y `addedAt`; opcionalmente `screenshots`, `storagePrefix`, `indexedDb` y `color` (propuesto con `node scripts/suggest-colors.mjs`).
2. Copiar la portada en `public/games/<id>/` y, si es PNG o JPG, generar su WebP con `node scripts/make-webp.mjs`.
3. Si el juego guarda datos, declarar su `storagePrefix`: minúsculas, números y guiones terminados en `:` (por ejemplo, `apagon:`), único en el catálogo y distinto de `portal:`, que está reservado. Si guarda en IndexedDB, declarar `indexedDb`: su carpeta propia (slug único), el texto del botón del juego que borra sus datos y dónde está ese botón.
4. Si el juego incluye librerías de terceros, añadirlas en `src/data/game-libraries.ts` con la ruta de su aviso de licencia, relativa a la URL del juego.
5. Ejecutar `npm run lint && npm run test && npm run build:publish`.

La página `juegos/<id>/`, la tarjeta del inicio, el `frame-src` de la CSP, el color del vórtice, el nombre de transición de la portada, el sitemap y el botón de borrado se actualizan sin cambios en el código.

## Límites conocidos

- El iframe no aísla los juegos del sitio, porque comparten origen (ver «Decisiones técnicas»).
- La política de seguridad de contenido se entrega en `<meta>`, así que no admite `frame-ancestors` ni otras directivas que solo funcionan como cabecera HTTP.
- La tecla Esc solo saca el foco del juego cuando el juego es del mismo origen que el sitio. En otro caso, la salida con teclado es Tab.
- Las pruebas automáticas no cubren el comportamiento dentro de los juegos; cada juego se mantiene en su propio repositorio.
- Las transiciones entre páginas dependen del navegador; donde no existen, la navegación es una carga normal.
- El rendimiento se mide en laboratorio (Chrome con la red y la CPU limitadas); el sitio no mide nada en el navegador de los visitantes.
