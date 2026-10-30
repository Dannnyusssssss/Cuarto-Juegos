# Licencias

Inventario de licencias del sitio. La página `/creditos/` muestra la misma información.

**Última revisión:** 30 de octubre de 2026.

## Obras propias

| Obra | Licencia |
|---|---|
| Código del portal | Todos los derechos reservados. Titular: Danny Sivinta |
| Dead Shift | Todos los derechos reservados. Titular: Danny Sivinta |
| Logotipo, arte del portal (hexágonos) e íconos | Originales del sitio (SVG); misma licencia que el código |
| Portada provisional de Dead Shift (`public/games/dead-shift/cover.svg`) | Generada para el sitio; se reemplazará por la portada real |

La licencia se define en una sola constante, `SITE.license` en `src/data/site.ts`. Si se elige otra (por ejemplo MIT), solo aplica a las versiones publicadas desde ese cambio.

## Terceros incluidos en lo publicado

| Recurso | Autor | Licencia | Dónde |
|---|---|---|---|
| Inter (tipografía variable, `.woff2`) | The Inter Project Authors | SIL Open Font License 1.1 | `dist/assets/*.woff2`; licencia en `public/fonts/Inter-OFL.txt` |
| `@fontsource-variable/inter` 5.3.0 (CSS `@font-face`) | Fontsource | OFL-1.1 (según su `package.json`) | Incluido en el CSS del sitio |

## Herramientas de desarrollo (no se publican)

Vite, TypeScript, Vitest, ESLint, typescript-eslint, eslint-config-prettier, Prettier y `@types/node`. Son `devDependencies`: se usan para construir y probar el sitio, y su código no se incluye en `dist/`. Sus licencias están en `node_modules/<paquete>/LICENSE`.

## Sin verificar

- **Recursos internos de Dead Shift** (sonidos, fuentes, sprites): viven en el repo del juego y no se revisaron aquí. El bundle parece generar los sonidos por código (Web Audio), pero hay que confirmarlo en el repo del juego. Si usa recursos de terceros, se acreditan en `/creditos/`.
