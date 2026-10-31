# Inventario de datos

Inventario de los datos que trata el sitio. La política de privacidad (`/privacidad/`) se basa en este documento, y los dos deben describir lo mismo. Si algo cambia, actualiza los dos y la fecha `LEGAL_UPDATED_AT` en `src/data/legal.ts`.

**Última revisión:** 30 de octubre de 2026.

## a) Datos que recolecta el sitio

**Ninguno.** El sitio es estático y no tiene:

- Backend ni base de datos.
- Cuentas ni inicio de sesión.
- Formularios ni subida de archivos.
- Analítica, publicidad, píxeles ni chat.

El único contacto es un enlace `mailto:`. Si alguien escribe, el correo llega al buzón del responsable y queda fuera del sitio.

## b) Datos guardados en el navegador (localStorage)

| Quién | Prefijo de clave | Contenido | Conservación |
|---|---|---|---|
| Portal | `portal:` | Nada por ahora (prefijo reservado) | — |
| Dead Shift | `deadshift:` (`deadshift:v1`) | Récords por dificultad (mejor hora y victorias), zombis derribados en total y ajustes: sonido, dificultad y depuración | Hasta que el jugador los borre |
| Apagón | `apagon:` (`apagon:v1`) | Mejor tiempo y ajustes: silencio y reducir parpadeos | Hasta que el jugador los borre |

- Los datos no salen del navegador: ni el portal ni los juegos los envían a ningún servidor. Se revisaron los bundles publicados de Dead Shift y de Apagón el 30 de octubre de 2026: en los dos, la única llamada `fetch` es la precarga de sus propios módulos, y no usan `XMLHttpRequest`, `sendBeacon`, WebSocket, cookies, `sessionStorage` ni IndexedDB.
- El botón "Borrar datos guardados en este navegador" (`/privacidad/`) borra **solo** las claves con prefijos declarados: `portal:` y el `storagePrefix` de cada juego del mismo origen en `games.json`. Nunca borra claves sin prefijo declarado.
- El portal, Dead Shift y Apagón comparten el origen `https://dannnyusssssss.github.io`, así que el botón sí borra los datos de los dos juegos en el sitio publicado. Si un juego se sirve desde otro origen, la política explica que sus datos se borran desde la configuración del navegador.
- `sessionStorage`, IndexedDB y cookies: no se usan.

## c) Terceros que reciben datos

| Tercero | Qué recibe | Cuándo | Documento |
|---|---|---|---|
| GitHub, Inc. (GitHub Pages, hosting) | Dirección IP, user agent y datos técnicos de la petición | En cada visita al portal y al cargar un juego | [Declaración de privacidad de GitHub](https://docs.github.com/en/site-policy/privacy-policies/github-privacy-statement) |

- El portal no carga fuentes, scripts, imágenes ni iframes de otros dominios. La CSP lo impone (`default-src 'self'`; `frame-src` solo con el origen de los juegos).
- Los juegos embebidos están en el mismo hosting (GitHub Pages) y solo se cargan cuando el jugador pulsa "Jugar".
- **Transferencia internacional:** GitHub tiene servidores fuera del Ecuador. Duda para el abogado: ¿hace falta informarlo como transferencia internacional en la política?

## d) Cookies

**Ninguna.** El sitio no fija cookies, ni propias ni de terceros. No hace falta banner de cookies; la política lo declara.

## Pendiente

- Datos del responsable completados (2026-10-30): Danny Sivinta, Quito (Ecuador), cuartojuegos.contacto@gmail.com. Sin RUC: esa línea no se muestra.
- Revisión por un abogado ecuatoriano: si basta con nombre, ciudad y correo para identificar al responsable sin RUC; base legal de cada tratamiento, plazo de 15 días para atender derechos, transferencia internacional (hosting en EE. UU.), menores y obligaciones ante la Superintendencia.
