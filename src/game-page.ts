import { GAME_FRAME_ATTRIBUTES, gameFrameTitle } from './data/embed.ts';

/**
 * Página de un juego: el iframe se crea solo cuando el visitante pulsa "Jugar"; antes no se carga
 * nada del origen del juego. Sin JavaScript, "Jugar" es un enlace normal al juego.
 */
const HELP_ESC_OR_TAB =
  'Esc pausa el juego y te saca de él. Tab también sale, después de pasar por los botones del juego.';
const HELP_TAB =
  'Para salir del juego con el teclado, pulsa Tab. Primero pasa por los botones del juego.';
const HELP_LEFT = 'Saliste del juego. Para volver, haz clic en él o pulsa Mayús+Tab.';

/** Primer control visible de la barra: tras salir, Mayús+Tab desde ahí vuelve directo al juego. */
function firstToolbarControl(toolbar: HTMLElement): HTMLElement | undefined {
  return [...toolbar.querySelectorAll<HTMLElement>('a, button')].find((control) => !control.hidden);
}

function setupPlayer(): void {
  const player = document.querySelector<HTMLElement>('.game-player');
  const stage = document.querySelector<HTMLElement>('[data-game-stage]');
  const play = document.querySelector<HTMLAnchorElement>('a[data-game-play]');
  const help = document.querySelector<HTMLElement>('[data-game-help]');
  const toolbar = document.querySelector<HTMLElement>('.game-player__toolbar');
  const fullscreen = document.querySelector<HTMLButtonElement>('[data-game-fullscreen]');
  if (!player || !stage || !play || !help || !toolbar || !fullscreen) return;

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

    let playingHelp = HELP_TAB;
    help.textContent = playingHelp;
    help.hidden = false;

    // Esc solo se puede escuchar si el juego es del mismo origen que el portal.
    // Si no lo es, el acceso lanza un error y queda Tab como forma de salir.
    frame.addEventListener('load', () => {
      try {
        frame.contentWindow?.addEventListener('keydown', (key) => {
          if (key.key === 'Escape') firstToolbarControl(toolbar)?.focus();
        });
        playingHelp = HELP_ESC_OR_TAB;
      } catch {
        playingHelp = HELP_TAB;
      }
      if (document.activeElement === frame) help.textContent = playingHelp;
    });

    // Avisa al salir del juego (con Esc, Tab o un clic fuera): el foco pasa a un elemento del portal.
    document.addEventListener('focusin', (event) => {
      if (event.target !== frame) help.textContent = HELP_LEFT;
    });
    // Al entrar al juego (con clic o Mayús+Tab) la ventana del portal pierde el foco y el iframe
    // queda como elemento activo; el iframe no siempre recibe su propio evento focus.
    window.addEventListener('blur', () => {
      if (document.activeElement === frame) help.textContent = playingHelp;
    });

    frame.src = src;
    stage.replaceChildren(frame);
    frame.focus({ preventScroll: true });
    // El reproductor entero (juego, ayuda y botones) queda a la vista.
    player.scrollIntoView({ block: 'center' });

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
