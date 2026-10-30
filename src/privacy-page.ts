import { keysToClear } from './data/storage.ts';

/**
 * Botón "Borrar datos guardados en este navegador", con confirmación en dos pasos.
 * Borra solo las claves de localStorage con los prefijos declarados (data-prefixes); las claves
 * sin prefijo declarado nunca se tocan, porque el dominio puede ser compartido con otros sitios.
 */
function setupClearData(): void {
  const root = document.querySelector<HTMLElement>('[data-clear-data]');
  const start = root?.querySelector<HTMLButtonElement>('[data-clear-start]');
  const confirm = root?.querySelector<HTMLElement>('[data-clear-confirm]');
  const yes = root?.querySelector<HTMLButtonElement>('[data-clear-yes]');
  const cancel = root?.querySelector<HTMLButtonElement>('[data-clear-cancel]');
  const status = root?.querySelector<HTMLElement>('[data-clear-status]');
  if (!root || !start || !confirm || !yes || !cancel || !status) return;

  const prefixes = (root.dataset.prefixes ?? '').split(' ').filter((p) => p.endsWith(':'));
  if (prefixes.length === 0) return;

  let storage: Storage;
  try {
    storage = window.localStorage;
  } catch {
    return; // Sin acceso a localStorage no hay nada que borrar: el botón sigue oculto.
  }
  root.hidden = false;

  const close = () => {
    confirm.hidden = true;
    start.hidden = false;
    start.focus();
  };

  start.addEventListener('click', () => {
    status.textContent = '';
    start.hidden = true;
    confirm.hidden = false;
    cancel.focus();
  });

  cancel.addEventListener('click', close);

  yes.addEventListener('click', () => {
    const keys = keysToClear(
      Array.from({ length: storage.length }, (_, i) => storage.key(i) ?? ''),
      prefixes,
    );
    try {
      for (const key of keys) storage.removeItem(key);
      status.textContent =
        keys.length > 0
          ? `Listo: se borraron ${keys.length} ${keys.length === 1 ? 'dato guardado' : 'datos guardados'}.`
          : 'No había datos guardados de este sitio en este navegador.';
    } catch {
      status.textContent =
        'No se pudieron borrar los datos. Prueba desde la configuración del navegador.';
    }
    close();
  });
}

setupClearData();
