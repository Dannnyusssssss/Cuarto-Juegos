import { GAME_FRAME_ATTRIBUTES, gameFrameTitle } from './data/embed.ts';

/**
 * Página de un juego: el iframe se crea solo cuando el visitante pulsa "Jugar" (o hace clic en la
 * portada); antes no se carga nada del origen del juego. Sin JavaScript, "Jugar" es un enlace
 * normal al juego.
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

/** Clic normal: Ctrl, Cmd, Mayús, Alt o un botón que no sea el principal abren el enlace como siempre. */
const isPlainClick = (event: MouseEvent) =>
  event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;

function setupPlayer(): void {
  const detail = document.querySelector<HTMLElement>('.game-detail');
  const player = document.querySelector<HTMLElement>('.game-player');
  const stage = document.querySelector<HTMLElement>('[data-game-stage]');
  const play = document.querySelector<HTMLAnchorElement>('a[data-game-play]');
  const help = document.querySelector<HTMLElement>('[data-game-help]');
  const loading = document.querySelector<HTMLElement>('[data-game-loading]');
  const toolbar = document.querySelector<HTMLElement>('.game-player__toolbar');
  const fullscreen = document.querySelector<HTMLButtonElement>('[data-game-fullscreen]');
  if (!detail || !player || !stage || !play || !help || !loading || !toolbar || !fullscreen) {
    return;
  }

  const title = play.dataset.gameTitle ?? '';
  const src = play.href;
  let frame: HTMLIFrameElement | undefined;

  const start = () => {
    // Ya empezó: volver a pulsar «Jugar» solo lleva al juego, no lo recarga.
    if (frame) {
      frame.focus({ preventScroll: true });
      player.scrollIntoView({ block: 'center' });
      return;
    }

    const current = document.createElement('iframe');
    frame = current;
    for (const [name, value] of Object.entries(GAME_FRAME_ATTRIBUTES)) {
      current.setAttribute(name, value);
    }
    current.setAttribute('title', gameFrameTitle(title));
    current.className = 'game-player__frame';

    // Game Loading State: texto fijo en el escenario, marcado como ocupado hasta que el juego
    // cargue. La ayuda ya explica cómo salir (sin repetir «Cargando…»).
    let playingHelp = HELP_TAB;
    loading.hidden = false;
    stage.setAttribute('aria-busy', 'true');
    help.textContent = playingHelp;
    help.hidden = false;

    // Esc solo se puede escuchar si el juego es del mismo origen que el portal.
    // Si no lo es, el acceso lanza un error y queda Tab como forma de salir.
    current.addEventListener('load', () => {
      try {
        current.contentWindow?.addEventListener('keydown', (key) => {
          if (key.key === 'Escape') firstToolbarControl(toolbar)?.focus();
        });
        playingHelp = HELP_ESC_OR_TAB;
      } catch {
        playingHelp = HELP_TAB;
      }
      stage.removeAttribute('aria-busy');
      loading.hidden = true;
      // Si sigue la ayuda inicial (o el foco está en el juego), pasa a la definitiva (con Esc si se puede).
      if (document.activeElement === current || help.textContent === HELP_TAB) {
        help.textContent = playingHelp;
      }
    });

    // Avisa al salir del juego (con Esc, Tab o un clic fuera): el foco pasa a un elemento del portal.
    document.addEventListener('focusin', (event) => {
      if (event.target !== current) help.textContent = HELP_LEFT;
    });
    // Al entrar al juego (con clic o Mayús+Tab) la ventana del portal pierde el foco y el iframe
    // queda como elemento activo; el iframe no siempre recibe su propio evento focus.
    window.addEventListener('blur', () => {
      if (document.activeElement === current && !stage.hasAttribute('aria-busy')) {
        help.textContent = playingHelp;
      }
    });

    // El escenario pasa a todo el ancho; el texto de carga queda debajo del iframe.
    detail.classList.add('is-playing');
    stage.classList.remove('game-player__stage--ready');
    current.src = src;
    stage.replaceChildren(loading, current);
    current.focus({ preventScroll: true });
    // El reproductor entero (juego, ayuda y botones) queda a la vista.
    player.scrollIntoView({ block: 'center' });

    if (document.fullscreenEnabled) {
      fullscreen.hidden = false;
      fullscreen.addEventListener('click', () => {
        current.requestFullscreen().catch(() => {
          fullscreen.hidden = true;
        });
      });
    }
  };

  play.addEventListener('click', (event) => {
    if (!isPlainClick(event)) return;
    event.preventDefault();
    start();
  });

  // Atajo para ratón y táctil: un clic en la portada hace lo mismo que «Jugar». Con teclado se usa
  // el botón (la portada no es un control y no recibe el foco).
  stage.classList.add('game-player__stage--ready');
  stage.addEventListener('click', (event) => {
    if (frame || !isPlainClick(event)) return;
    start();
  });
}

setupPlayer();
