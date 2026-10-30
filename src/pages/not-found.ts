import { renderButton } from '../components/button.ts';
import { renderHeading } from '../components/heading.ts';

/** Contenido de <main> en la página 404. */
export function renderNotFound(root = './'): string {
  return (
    `<div class="container section not-found">` +
    renderHeading({ text: 'Página no encontrada', level: 1, size: 'heading' }) +
    `<p class="not-found__body">La dirección no existe o cambió.</p>` +
    renderButton({ label: 'Volver al inicio', variant: 'primary', href: root }) +
    `</div>`
  );
}
