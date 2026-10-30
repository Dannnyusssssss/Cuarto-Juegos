import { GAME_FRAME_ATTRIBUTES, gameFrameTitle } from './data/embed.ts';

/**
 * Página de un juego: el iframe se crea solo cuando el visitante pulsa "Jugar"; antes no se carga
 * nada del origen del juego. Sin JavaScript, "Jugar" es un enlace normal al juego.
 */
const HELP_ESC_OR_TAB = 'Para salir del juego con el teclado, pulsa Esc o Tab.';
const HELP_TAB = 'Para salir del juego con el teclado, pulsa Tab.';

function setupPlayer(): void {
  const stage = document.querySelector<HTMLElement>('[data-game-stage]');
  const play = document.querySelector<HTMLAnchorElement>('a[data-game-play]');
  const help = document.querySelector<HTMLElement>('[data-game-help]');
  const fullscreen = document.querySelector<HTMLButtonElement>('[data-game-fullscreen]');
  const back = document.querySelector<HTMLAnchorElement>('[data-game-back]');
  if (!stage || !play || !help || !fullscreen || !back) return;

  const title = play.dataset.gameTitle ?? '';
  const src = play.href;

  play.addEventListener('click', (event) => {
    // Ctrl, Cmd, Mayús o clic central abren el enlace como siempre.
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return;
    }
    event.preventDefault();

    const frame = document.createElement('iframe');
    for (const [name, value] of Object.entries(GAME_FRAME_ATTRIBUTES)) {
      frame.setAttribute(name, value);
    }
    frame.setAttribute('title', gameFrameTitle(title));
    frame.className = 'game-player__frame';

    help.textContent = HELP_TAB;
    help.hidden = false;

    // Esc solo se puede escuchar si el juego es del mismo origen que el portal.
    // Si no lo es, el acceso lanza un error y queda Tab como forma de salir.
    frame.addEventListener('load', () => {
      try {
        frame.contentWindow?.addEventListener('keydown', (key) => {
          if (key.key === 'Escape') back.focus();
        });
        help.textContent = HELP_ESC_OR_TAB;
      } catch {
        help.textContent = HELP_TAB;
      }
    });

    frame.src = src;
    stage.replaceChildren(frame);
    frame.focus();

    if (document.fullscreenEnabled) {
      fullscreen.hidden = false;
      fullscreen.addEventListener('click', () => {
        frame.requestFullscreen().catch(() => {
          fullscreen.hidden = true;
        });
      });
    }
  });
}

setupPlayer();
