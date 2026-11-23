/**
 * ¿La página está dentro de un marco? GitHub Pages no permite enviar frame-ancestors ni
 * X-Frame-Options, así que cualquier web puede enmarcar el sitio y engañar al usuario para que
 * pulse un botón invisible (clickjacking). Las acciones con efecto se ocultan si la página está
 * enmarcada. Si no se puede comprobar, se asume que sí lo está.
 */
export function isFramed(win: { readonly self: object; readonly top: object | null }): boolean {
  try {
    return win.top !== win.self;
  } catch {
    return true;
  }
}
