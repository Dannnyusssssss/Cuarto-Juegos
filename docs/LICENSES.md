# Licencias

Inventario de licencias del sitio. La página `/creditos/` muestra la misma información.

**Última revisión:** 23 de noviembre de 2026.

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
| Dead Shift 3D | Todos los derechos reservados. Titular: Danny Sivinta |
| Logotipo, arte del portal (hexágonos) e íconos | Originales del sitio (SVG); misma licencia que el código |
| Portada de Dead Shift (`public/games/dead-shift/cover.svg`) | Ícono del propio juego, aportado por el titular. Todos los derechos reservados. Titular: Danny Sivinta |
| Portada de Apagón (`public/games/apagon/cover.png`) | Portada del propio juego (`https://dannnyusssssss.github.io/Apagon/cover.png`), del titular. Todos los derechos reservados. Titular: Danny Sivinta |
| Portada de Trazada (`public/games/trazada/cover.png`) | Portada del propio juego (`https://dannnyusssssss.github.io/Trazada/cover.png`), del titular. Todos los derechos reservados. Titular: Danny Sivinta |
| Portada de Fulgor (`public/games/fulgor/cover.png`) | Portada del propio juego (`https://dannnyusssssss.github.io/Fulgor/cover.png`), del titular. Todos los derechos reservados. Titular: Danny Sivinta |
| Portada de Zumbido (`public/games/zumbido/cover.png`) | Portada del propio juego (`https://dannnyusssssss.github.io/Zumbido/cover.png`), del titular: una imagen del propio juego. Todos los derechos reservados. Titular: Danny Sivinta |
| Portada de Ceniza y Luz (`public/games/ceniza-y-luz/cover.png`) | Portada del propio juego (`https://dannnyusssssss.github.io/Ceniza-y-Luz/cover.png`), del titular. Todos los derechos reservados. Titular: Danny Sivinta |
| Portada de Cerrojo (`public/games/cerrojo/cover.png`) | Portada del propio juego (`https://dannnyusssssss.github.io/Cerrojo/cover.png`), del titular. Todos los derechos reservados. Titular: Danny Sivinta |
| Portada de Dead Shift 3D (`public/games/dead-shift-3d/cover.png`) | Portada del propio juego (`https://dannnyusssssss.github.io/dead-shift-3D/cover.png`), del titular: una captura del propio juego. Todos los derechos reservados. Titular: Danny Sivinta |

La licencia se define en una sola constante, `SITE.license` en `src/data/site.ts`. Si se elige otra (por ejemplo MIT), solo aplica a las versiones publicadas desde ese cambio.

## Terceros incluidos en lo publicado

| Recurso | Autor | Licencia | Dónde |
|---|---|---|---|
| Inter (tipografía variable, `.woff2`) | The Inter Project Authors | SIL Open Font License 1.1 | `dist/assets/*.woff2`; licencia en `public/fonts/Inter-OFL.txt` |
| `@fontsource-variable/inter` 5.3.0 (CSS `@font-face`) | Fontsource | OFL-1.1 (según su `package.json`) | Incluido en el CSS del sitio |

## Librerías de terceros dentro de los juegos

No se publican con el portal: van en el bundle de cada juego, en su propio repo. La sección "Librerías y recursos de terceros dentro de los juegos" de `/creditos/` las lista, junto con los recursos CC0 de Dead Shift 3D, con enlaces a cada aviso (datos en `src/data/game-libraries.ts`). Revisado en los juegos publicados el 22 de noviembre de 2026; Dead Shift 3D, el 23 de noviembre de 2026. Dead Shift y Apagón no incluyen librerías de terceros.

| Librería | Juego | Licencia | Aviso de licencia |
|---|---|---|---|
| three.js (r187) | Trazada | MIT | Presente: comentario `/*! three.js ... */` en el bundle y texto completo en `https://dannnyusssssss.github.io/Trazada/THIRD-PARTY-LICENSES.md`. |
| three.js (r187) | Fulgor | MIT | Presente: comentario `/*! three.js ... */` en el bundle (`assets/index-B3KnJVxW.js`). No publica un archivo aparte. |
| three.js 0.187.0 (r187) | Zumbido | MIT | Presente: texto completo en `https://dannnyusssssss.github.io/Zumbido/third-party-licenses.md`. Antes faltaba (bundle del 7 de noviembre de 2026); ya está corregido en el juego. |
| Babylon.js 9.35.0 (`@babylonjs/core`, `@babylonjs/materials`, `@babylonjs/loaders`) | Ceniza y Luz | Apache-2.0 | Presente: `https://dannnyusssssss.github.io/Ceniza-y-Luz/licenses/` (`babylonjs-core-LICENSE.md`, `babylonjs-core-NOTICE.md`, `babylonjs-loaders-LICENSE.md` y `babylonjs-materials-LICENSE.md`). |
| three.js 0.187.0 (r187) | Cerrojo | MIT | Presente: texto completo en `https://dannnyusssssss.github.io/Cerrojo/third-party-licenses.md`. |
| Godot Engine 4.7.2-stable (motor y plantilla de exportación web) | Dead Shift 3D | MIT | Presente: `https://dannnyusssssss.github.io/dead-shift-3D/LICENCIAS.txt` y, según el juego, en sus créditos. El motor incluye componentes de terceros con sus propias licencias (lista en `COPYRIGHT.txt` del repositorio de Godot). |

### Recursos de terceros dentro de los juegos

| Recursos | Juego | Licencia | Aviso |
|---|---|---|---|
| Materiales de ambientCG, animaciones y personajes de Quaternius (Universal Animation Library 1 y 2, Universal Base Characters) y sonidos de Kenney (Impact Sounds, Interface Sounds, RPG Audio, Sci-Fi Sounds) | Dead Shift 3D | CC0 1.0 Universal (no exige atribución) | Listados con su origen en `https://dannnyusssssss.github.io/dead-shift-3D/LICENCIAS.txt`. |

Cada juego debe mantener su aviso en cada build. Si un aviso cambia de ruta, se actualiza `src/data/game-libraries.ts`.

## Herramientas de desarrollo (no se publican)

Vite, TypeScript, Vitest, ESLint, typescript-eslint, eslint-config-prettier, Prettier y `@types/node`. Son `devDependencies`: se usan para construir y probar el sitio, y su código no se incluye en `dist/`. Sus licencias están en `node_modules/<paquete>/LICENSE`.

## Sin verificar

- **Recursos internos de Dead Shift** (sonidos, fuentes, sprites): viven en el repo del juego y no se revisaron aquí. El bundle parece generar los sonidos por código (Web Audio), pero hay que confirmarlo en el repo del juego. Si usa recursos de terceros, se acreditan en `/creditos/`.
- **Recursos internos de Apagón** (sonidos, fuentes, sprites): viven en el repo del juego y no se revisaron aquí. Su bundle no carga archivos de audio ni de fuentes, pero hay que confirmarlo en el repo del juego.
- **Recursos internos de Trazada y Fulgor** (sonidos, música, fuentes, modelos): viven en el repo de cada juego y no se revisaron aquí. Sus bundles no cargan archivos de otros dominios. Trazada genera la música por código ("música generativa"), pero hay que confirmarlo en el repo del juego, igual que el resto de recursos.
- **Recursos internos de Zumbido** (sonidos, texturas, fuentes): viven en el repo del juego y no se revisaron aquí. Su bundle no carga archivos de otros dominios y parece generar el sonido por código (Web Audio), pero hay que confirmarlo en el repo del juego.
- **Recursos internos de Ceniza y Luz** (modelos, música, sonidos): según su titular, los modelos son propios y la música y los sonidos se sintetizan en el juego, sin archivos de terceros. El bundle solo carga modelos de su propio origen; la autoría no se comprobó de forma independiente.
