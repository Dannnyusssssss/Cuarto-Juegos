# Cuarto Juegos

Juegos web propios para jugar en el navegador, sin cuentas ni descargas.

Sitio publicado: <https://dannnyusssssss.github.io/Cuarto-Juegos/>

## Qué es

Un sitio estático que reúne y muestra juegos web propios. Cada juego tiene su ficha (descripción, controles, edad orientativa y nota de contenido) y se juega dentro de la página o en su propia dirección. Los juegos viven en sus propios repositorios; este repositorio solo los enlaza y los muestra en un marco.

## Datos y privacidad

El sitio **no recolecta datos personales**: no tiene servidor, cuentas, formularios, analítica, publicidad ni cookies. Lo único que se guarda son los récords, partidas y ajustes de los juegos, en el `localStorage` del propio navegador, y nunca salen de él. La página `/privacidad/` lo explica y tiene un botón para borrar esos datos.

Detalle de cada dato guardado: [`docs/PRIVACY-INVENTORY.md`](docs/PRIVACY-INVENTORY.md).

## Requisitos

- Node.js 24.21.0 (la misma versión que usa el despliegue).
- Sin dependencias de ejecución: todas son de desarrollo y están fijadas en `package-lock.json`.

## Uso

```sh
npm ci                 # instala las dependencias exactas del lockfile
npm run dev            # servidor de desarrollo
npm run lint           # ESLint y Prettier
npm run test           # pruebas (Vitest)
npm run build          # build en dist/
npm run build:publish  # build de publicación: además bloquea datos pendientes de completar
npm run preview        # sirve dist/ en http://localhost:4173/
```

## Despliegue

Cada push a `main` ejecuta el workflow `.github/workflows/deploy.yml`: instala desde el lockfile, audita las dependencias, ejecuta lint y pruebas, construye el sitio con las mismas comprobaciones que `npm run build:publish`, busca claves en los archivos versionados y en lo construido, y despliega `dist/` en GitHub Pages en un job aparte. Si una comprobación falla, no se despliega.

## Agregar un juego

Una entrada válida en `src/data/games.json` y su portada en `public/games/<id>/`; las páginas, la política de seguridad de contenido y el sitemap se generan solos. Los pasos completos están en [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md#cómo-se-agrega-un-juego).

## Documentación

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md): cómo está hecho el sitio y por qué.
- [`docs/PRIVACY-INVENTORY.md`](docs/PRIVACY-INVENTORY.md): inventario de datos.
- [`docs/LICENSES.md`](docs/LICENSES.md): licencias propias y de terceros.

## Licencia

Todos los derechos reservados. Titular: Danny Sivinta. Ver [`LICENSE`](LICENSE). Las obras de terceros conservan sus licencias ([`docs/LICENSES.md`](docs/LICENSES.md)).
