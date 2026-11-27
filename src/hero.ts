/**
 * Lógica pura del hero (sin DOM): qué diapositiva está activa y qué hacer al elegir otra.
 *
 * Política durante un barrido: un clic mientras hay uno en curso se ignora. Es lo más simple y
 * robusto: el barrido dura menos de un segundo, nunca hay tres diapositivas a la vez y el estado
 * (aria-pressed, leyenda, botón) siempre coincide con la diapositiva visible.
 *
 * Avance automático: cada cierto tiempo pasa a la siguiente (cíclico), salvo que algo lo detenga
 * (ver `shouldAutoplay`).
 */
export interface HeroState {
  /** Índice de la diapositiva activa (la de la miniatura pulsada). */
  active: number;
  /** Hay un barrido en curso. */
  sweeping: boolean;
}

export interface HeroChange {
  /** Estado tras la elección. */
  state: HeroState;
  /** Qué diapositiva sale y cuál entra. */
  from: number;
  to: number;
}

export const initialHeroState = (): HeroState => ({ active: 0, sweeping: false });

/** Elige la diapositiva `index`. `null` si no hay nada que hacer (mismo índice, fuera de rango o barrido en curso). */
export function selectSlide(state: HeroState, index: number, count: number): HeroChange | null {
  if (!Number.isInteger(index) || index < 0 || index >= count) return null;
  if (index === state.active || state.sweeping) return null;
  return { state: { active: index, sweeping: true }, from: state.active, to: index };
}

/** Marca el barrido como terminado. */
export const finishSweep = (state: HeroState): HeroState => ({ ...state, sweeping: false });

/** Índice de la diapositiva siguiente, volviendo a la primera tras la última. */
export function nextIndex(active: number, count: number): number {
  if (!Number.isInteger(active) || !Number.isInteger(count) || count < 1) return 0;
  return (active + 1) % count;
}

/** Condiciones que detienen el avance automático. */
export interface AutoplayConditions {
  /** El usuario pulsó «Pausar». */
  paused: boolean;
  /** El puntero está sobre el hero. */
  pointerInside: boolean;
  /** El foco está dentro del hero. */
  focusInside: boolean;
  /** La pestaña está oculta. */
  tabHidden: boolean;
  /** El usuario pidió reducir el movimiento. */
  reducedMotion: boolean;
  /** Hay un barrido en curso. */
  sweeping: boolean;
}

/** El avance automático solo corre si ninguna condición lo detiene. */
export const shouldAutoplay = (c: AutoplayConditions): boolean =>
  !(c.paused || c.pointerInside || c.focusInside || c.tabHidden || c.reducedMotion || c.sweeping);

/** Valor de `aria-pressed` de cada miniatura: solo la activa está pulsada. */
export const pressedStates = (active: number, count: number): boolean[] =>
  Array.from({ length: count }, (_, i) => i === active);

/**
 * Lista blanca: solo rutas relativas del propio sitio como `./juegos/<id>/` o `../juegos/<id>/`.
 * Así no pasan esquemas (`javascript:`, también con espacios o controles delante), `//` ni barras
 * invertidas, que el navegador interpretaría como otro origen.
 */
const SITE_PATH = /^\.{1,2}\/(?:[a-z0-9-]+\/)*$/;
export const isSafeHref = (href: string): boolean => SITE_PATH.test(href);
