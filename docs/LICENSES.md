# Licencias

Inventario de licencias del sitio. La página `/creditos/` muestra la misma información.

**Última revisión:** 13 de noviembre de 2026.

## Obras propias

| Obra | Licencia |
|---|---|
| Código del portal | Todos los derechos reservados. Titular: Danny Sivinta |
| Dead Shift | Todos los derechos reservados. Titular: Danny Sivinta |
| Apagón | Todos los derechos reservados. Titular: Danny Sivinta |
| Trazada | Todos los derechos reservados. Titular: Danny Sivinta |
| Fulgor | Todos los derechos reservados. Titular: Danny Sivinta |
| Zumbido | Todos los derechos reservados. Titular: Danny Sivinta |
| Ceniza y Luz | Todos los derechos reservados. Titular: Danny Sivinta |
| Cerrojo | Todos los derechos reservados. Titular: Danny Sivinta |
| Logotipo, arte del portal (hexágonos) e íconos | Originales del sitio (SVG); misma licencia que el código |
| Portada de Dead Shift (`public/games/dead-shift/cover.svg`) | Ícono del propio juego, aportado por el titular. Todos los derechos reservados. Titular: Danny Sivinta |
| Portada de Apagón (`public/games/apagon/cover.png`) | Portada del propio juego (`https://dannnyusssssss.github.io/Apagon/cover.png`), del titular. Todos los derechos reservados. Titular: Danny Sivinta |
| Portada de Trazada (`public/games/trazada/cover.png`) | Portada del propio juego (`https://dannnyusssssss.github.io/Trazada/cover.png`), del titular. Todos los derechos reservados. Titular: Danny Sivinta |
| Portada de Fulgor (`public/games/fulgor/cover.png`) | Portada del propio juego (`https://dannnyusssssss.github.io/Fulgor/cover.png`), del titular. Todos los derechos reservados. Titular: Danny Sivinta |
| Portada de Zumbido (`public/games/zumbido/cover.png`) | Portada del propio juego (`https://dannnyusssssss.github.io/Zumbido/cover.png`), del titular: una imagen del propio juego. Todos los derechos reservados. Titular: Danny Sivinta |
| Portada de Ceniza y Luz (`public/games/ceniza-y-luz/cover.png`) | Portada del propio juego (`https://dannnyusssssss.github.io/Ceniza-y-Luz/cover.png`), del titular. Todos los derechos reservados. Titular: Danny Sivinta |
| Portada de Cerrojo (`public/games/cerrojo/cover.png`) | Portada del propio juego (`https://dannnyusssssss.github.io/Cerrojo/cover.png`), del titular. Todos los derechos reservados. Titular: Danny Sivinta |

La licencia se define en una sola constante, `SITE.license` en `src/data/site.ts`. Si se elige otra (por ejemplo MIT), solo aplica a las versiones publicadas desde ese cambio.

## Terceros incluidos en lo publicado

| Recurso | Autor | Licencia | Dónde |
|---|---|---|---|
| Inter (tipografía variable, `.woff2`) | The Inter Project Authors | SIL Open Font License 1.1 | `dist/assets/*.woff2`; licencia en `public/fonts/Inter-OFL.txt` |
| `@fontsource-variable/inter` 5.3.0 (CSS `@font-face`) | Fontsource | OFL-1.1 (según su `package.json`) | Incluido en el CSS del sitio |

## Librerías de terceros dentro de los juegos

No se publican con el portal: van en el bundle de cada juego, en su propio repo.

| Librería | Juego | Licencia | Aviso de licencia |
|---|---|---|---|
| three.js (r187 en Trazada) | Trazada y Fulgor | MIT | Presente en los dos bundles publicados (comentario `/*! three.js ... */`). Hay que mantenerlo en cada build del juego. |
| three.js (r187) | Zumbido | MIT | **Falta.** El bundle publicado (`assets/index-5uKknZME.js`, revisado el 7 de noviembre de 2026) incluye three.js, pero no su comentario de licencia. Hay que agregarlo en el build del juego (por ejemplo, conservando el comentario `/*! ... */` o publicando el aviso MIT junto al juego). |
| Babylon.js 9.35.0 (`@babylonjs/core`, `@babylonjs/materials`, `@babylonjs/loaders`) | Ceniza y Luz | Apache-2.0 | Presente: se publica junto al juego en `https://dannnyusssssss.github.io/Ceniza-y-Luz/licenses/` (licencia de cada paquete y `NOTICE` de `core`). Hay que mantenerlo en cada build del juego. |
| three.js 0.187.0 (r187) | Cerrojo | MIT | Presente: se publica junto al juego en `https://dannnyusssssss.github.io/Cerrojo/third-party-licenses.md` (texto completo de la licencia MIT; revisado el 13 de noviembre de 2026). Hay que mantenerlo en cada build del juego. |

## Herramientas de desarrollo (no se publican)

Vite, TypeScript, Vitest, ESLint, typescript-eslint, eslint-config-prettier, Prettier y `@types/node`. Son `devDependencies`: se usan para construir y probar el sitio, y su código no se incluye en `dist/`. Sus licencias están en `node_modules/<paquete>/LICENSE`.

## Sin verificar

- **Recursos internos de Dead Shift** (sonidos, fuentes, sprites): viven en el repo del juego y no se revisaron aquí. El bundle parece generar los sonidos por código (Web Audio), pero hay que confirmarlo en el repo del juego. Si usa recursos de terceros, se acreditan en `/creditos/`.
- **Recursos internos de Apagón** (sonidos, fuentes, sprites): viven en el repo del juego y no se revisaron aquí. Su bundle no carga archivos de audio ni de fuentes, pero hay que confirmarlo en el repo del juego.
- **Recursos internos de Trazada y Fulgor** (sonidos, música, fuentes, modelos): viven en el repo de cada juego y no se revisaron aquí. Sus bundles no cargan archivos de otros dominios. Trazada genera la música por código ("música generativa"), pero hay que confirmarlo en el repo del juego, igual que el resto de recursos.
- **Recursos internos de Zumbido** (sonidos, texturas, fuentes): viven en el repo del juego y no se revisaron aquí. Su bundle no carga archivos de otros dominios y parece generar el sonido por código (Web Audio), pero hay que confirmarlo en el repo del juego.
- **Recursos internos de Ceniza y Luz** (modelos, música, sonidos): según su titular, los modelos son propios y la música y los sonidos se sintetizan en el juego, sin archivos de terceros. El bundle solo carga modelos de su propio origen; la autoría no se comprobó de forma independiente.
