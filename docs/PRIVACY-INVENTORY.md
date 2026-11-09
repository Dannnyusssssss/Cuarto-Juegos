# Inventario de datos

Inventario de los datos que trata el sitio. La política de privacidad (`/privacidad/`) se basa en este documento, y los dos deben describir lo mismo. Si algo cambia, actualiza los dos y la fecha `LEGAL_UPDATED_AT` en `src/data/legal.ts`.

**Última revisión:** 8 de noviembre de 2026.

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
| Trazada | `trazada:` (`trazada:v1` y `trazada:ghost:<circuito>:v1`) | Récords, medallas, ajustes (sonido, reducir movimiento, calidad, ayudas de conducción) y el "fantasma" de cada circuito: la grabación de tu mejor vuelta, para correr contra ella | Hasta que el jugador los borre |
| Fulgor | `fulgor:` (`fulgor:v1`) | Mejores marcas, arenas desbloqueadas y ajustes (volumen, reducir destellos, reducir movimiento, sensibilidad) | Hasta que el jugador los borre |
| Zumbido | `zumbido:` (`zumbido:v1`) | Niveles desbloqueados, mejores tiempos, mejor partida, la última semilla del laberinto y ajustes (silencio, reducir parpadeo, reducir movimiento, sensibilidad, campo de visión, calidad, subtítulos, dificultad) | Hasta que el jugador los borre |
| Ceniza y Luz | `cenizayluz:` (`cenizayluz:save` y `cenizayluz:settings`) | La partida guardada (personaje, lugar, vida, objetos, habilidades, cofres, puzzles, puertas, jefes vencidos y avance de la historia) y ajustes (silencio, música, reducir parpadeo, reducir movimiento, sensibilidad, invertir eje, campo de visión, calidad, resolución, límite de FPS, daño recibido, tamaño de texto) | Hasta que el jugador los borre |

- Los datos no salen del navegador: ni el portal ni los juegos los envían a ningún servidor. Se revisaron los bundles publicados de Dead Shift y Apagón (30 de octubre de 2026) y de Trazada, Fulgor y Zumbido (7 de noviembre de 2026): en todos, la única llamada `fetch` es la precarga de sus propios módulos, y no usan `XMLHttpRequest`, `sendBeacon`, WebSocket, cookies, `sessionStorage` ni IndexedDB.
- También se revisó el bundle publicado de Ceniza y Luz (8 de noviembre de 2026): con `fetch` solo pide sus módulos y sus modelos 3D, de su propio origen, y no envía datos. Babylon.js, su motor, incluye código de `XMLHttpRequest`, direcciones de sus propios servidores y una función de micrófono, pero la política de seguridad del juego (`connect-src 'self'`) bloquea las conexiones a otros dominios, el juego no llama a esa función y el iframe solo permite la pantalla completa. No usa `sendBeacon`, WebSocket, cookies, `sessionStorage` ni IndexedDB.
- El botón "Borrar datos guardados en este navegador" (`/privacidad/`) borra **solo** las claves con prefijos declarados: `portal:` y el `storagePrefix` de cada juego del mismo origen en `games.json`. Nunca borra claves sin prefijo declarado.
- El portal y los seis juegos (Dead Shift, Apagón, Trazada, Fulgor, Zumbido y Ceniza y Luz) comparten el origen `https://dannnyusssssss.github.io`, así que el botón sí borra los datos de todos en el sitio publicado. Ningún prefijo es el comienzo de otro, así que borrar los datos de un juego no toca los de otro. Si un juego se sirve desde otro origen, la política explica que sus datos se borran desde la configuración del navegador.
- `sessionStorage`, IndexedDB y cookies: no se usan.
- El fantasma de Trazada es un récord (posiciones de tu coche en tu mejor vuelta), no un dato que identifique a la persona. La política lo incluye dentro de "récords y ajustes".
- Trazada y Fulgor leen el mando con la Gamepad API, que solo informa de los botones pulsados. No se guarda ni se envía nada del mando.
- La semilla de Zumbido es un código aleatorio que genera el laberinto. No identifica a la persona.

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
