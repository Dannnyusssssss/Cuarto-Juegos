import { FILTER_ALL, isValidFilter, matchesFilter } from './catalog-filter.ts';
import {
  finishSweep,
  initialHeroState,
  isSafeHref,
  isSafeSlug,
  nextIndex,
  pressedStates,
  selectSlide,
  shouldAutoplay,
} from './hero.ts';

/**
 * Inicio: la cabecera fija es transparente solo con la página arriba del todo y sólida en cuanto
 * se desplaza (así el texto del hero nunca pasa por debajo de una cabecera transparente).
 * Sin JavaScript (o sin IntersectionObserver) se queda sólida.
 */
function setupHeader(): void {
  const header = document.querySelector<HTMLElement>('.site-header--overlay');
  const sentinel = document.querySelector<HTMLElement>('[data-hero-top]');
  if (!header || !sentinel || typeof IntersectionObserver === 'undefined') return;

  // Se observa la ventana entera: el centinela está a poca distancia del borde superior de la
  // página, así que se ve solo con la página arriba del todo y sale al desplazar unos píxeles.
  // (Con un margen que restara la cabecera, el centinela quedaría siempre fuera y el observador
  // no volvería a avisar.)
  const observer = new IntersectionObserver(([entry]) => {
    if (!entry) return;
    if (entry.isIntersecting) header.dataset.overHero = '';
    else delete header.dataset.overHero;
  });
  observer.observe(sentinel);
}

setupHeader();

/** Milisegundos de un token de duración como `900ms` (o `0.9s`); `fallback` si no se entiende. */
function parseMs(value: string, fallback: number): number {
  const number = parseFloat(value);
  if (Number.isNaN(number)) return fallback;
  return value.trim().endsWith('ms') ? number : number * 1000;
}

/** Tras el evento load, las diapositivas ocultas se cargan ya (así el barrido no muestra un hueco). */
function preloadHiddenSlides(slides: readonly HTMLElement[]): void {
  const preload = () => {
    for (const slide of slides) {
      for (const image of slide.querySelectorAll('img')) image.loading = 'eager';
    }
  };
  if (document.readyState === 'complete') preload();
  else window.addEventListener('load', preload, { once: true });
}

function setupHero(): void {
  const hero = document.querySelector<HTMLElement>('.hero');
  const container = document.querySelector<HTMLElement>('.hero__slides');
  const rail = document.querySelector<HTMLElement>('[data-hero-rail]');
  const caption = document.querySelector<HTMLElement>('[data-hero-caption]');
  const play = document.querySelector<HTMLAnchorElement>('[data-hero-play]');
  const cover = document.querySelector<HTMLAnchorElement>('[data-hero-cover]');
  const pause = document.querySelector<HTMLButtonElement>('[data-hero-pause]');
  const art = document.querySelector<HTMLElement>('.hero__art .portal-art');
  const title = caption?.querySelector<HTMLElement>('.hero__caption-title');
  const tagline = caption?.querySelector<HTMLElement>('.hero__caption-tagline');
  const link = caption?.querySelector<HTMLAnchorElement>('.hero__caption-link');
  const slides = [...document.querySelectorAll<HTMLElement>('[data-hero-slide]')];
  const thumbs = [...document.querySelectorAll<HTMLButtonElement>('[data-hero-thumb]')];
  if (!hero || !container || !rail || !title || !tagline || !link || !play || !caption) return;
  if (slides.length < 2 || slides.length !== thumbs.length) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const rootStyle = getComputedStyle(document.documentElement);
  const slideMs = parseMs(rootStyle.getPropertyValue('--duration-slide'), 900);
  const autoplayMs = parseMs(rootStyle.getPropertyValue('--duration-autoplay'), 7000);
  let state = initialHeroState();
  let paused = false;
  let pointerInside = false;
  let focusInside = false;
  let timer: number | undefined;
  rail.hidden = false;
  preloadHiddenSlides(slides.slice(1));

  const showText = (slide: HTMLElement): void => {
    const gameTitle = slide.dataset.title ?? '';
    title.textContent = gameTitle;
    tagline.textContent = slide.dataset.tagline ?? '';
    link.textContent = `Ver ${gameTitle}`;
    // El texto del primario se genera en el build (data-play): el script no importa datos del sitio.
    play.textContent = slide.dataset.play ?? `Jugar ${gameTitle}`;
    // El vórtice toma el color del juego: solo se escribe un id validado; el color sale del CSS.
    const game = slide.dataset.game ?? '';
    if (isSafeSlug(game)) hero.dataset.accent = game;
    const href = slide.dataset.href ?? '';
    // Se valida aquí, junto a la escritura, aunque quien llama ya lo haya hecho.
    if (!isSafeHref(href)) return;
    link.setAttribute('href', href);
    play.setAttribute('href', href);
    cover?.setAttribute('href', href);
  };

  /** Programa (o cancela) el siguiente avance según las condiciones actuales; reinicia la cuenta. */
  const refresh = (): void => {
    window.clearTimeout(timer);
    timer = undefined;
    const run = shouldAutoplay({
      paused,
      pointerInside,
      focusInside,
      tabHidden: document.hidden,
      reducedMotion: reducedMotion.matches,
      sweeping: state.sweeping,
    });
    if (run)
      timer = window.setTimeout(
        () => goTo(nextIndex(state.active, slides.length), false),
        autoplayMs,
      );
  };

  /** Patrón de carrusel: sin anuncios mientras avanza solo; con anuncios si lo pidió el usuario. */
  const setLive = (polite: boolean): void => {
    caption.setAttribute('aria-live', polite ? 'polite' : 'off');
  };

  const goTo = (index: number, byUser: boolean): void => {
    const incoming = slides[index];
    if (!incoming || !isSafeHref(incoming.dataset.href ?? '')) return;
    const change = selectSlide(state, index, slides.length);
    if (!change) return;
    state = change.state;
    const outgoing = slides[change.from];
    if (!outgoing) return;

    setLive(byUser || paused);
    pressedStates(state.active, thumbs.length).forEach((pressed, i) => {
      thumbs[i]?.setAttribute('aria-pressed', String(pressed));
    });
    showText(incoming);
    incoming.hidden = false;

    let done = false;
    // Un oyente por barrido; se quita al terminar para que no se acumulen.
    const listeners = new AbortController();
    const finish = (): void => {
      if (done) return;
      done = true;
      listeners.abort();
      outgoing.hidden = true;
      outgoing.classList.remove('hero__slide--out');
      incoming.classList.remove('hero__slide--in');
      container.classList.remove('hero__slides--sweeping');
      art?.classList.remove('portal-art--turn');
      state = finishSweep(state);
      refresh();
    };

    // Con movimiento reducido el cambio es instantáneo: sin clases de animación.
    if (reducedMotion.matches) {
      finish();
      return;
    }
    refresh();
    incoming.classList.add('hero__slide--in');
    outgoing.classList.add('hero__slide--out');
    container.classList.add('hero__slides--sweeping');
    // El vórtice gira y se ilumina durante el barrido (la animación vive en el CSS).
    art?.classList.add('portal-art--turn');
    incoming.addEventListener(
      'animationend',
      (event) => {
        if (event.target === incoming && event.animationName === 'hero-sweep') finish();
      },
      { signal: listeners.signal },
    );
    // Tope por si animationend no llega (pestaña en segundo plano, animaciones desactivadas).
    window.setTimeout(finish, slideMs + 300);
  };

  thumbs.forEach((thumb, index) => {
    thumb.addEventListener('click', () => goTo(index, true));
  });

  // Pausas: puntero encima, foco dentro y pestaña oculta. Cada cambio reinicia la cuenta.
  hero.addEventListener('pointerenter', () => {
    pointerInside = true;
    refresh();
  });
  hero.addEventListener('pointerleave', () => {
    pointerInside = false;
    refresh();
  });
  hero.addEventListener('focusin', () => {
    focusInside = true;
    refresh();
  });
  hero.addEventListener('focusout', (event) => {
    focusInside = event.relatedTarget instanceof Node && hero.contains(event.relatedTarget);
    refresh();
  });
  document.addEventListener('visibilitychange', refresh);

  // Botón «Pausar»/«Reanudar»: solo existe mientras haya avance automático posible.
  const syncPauseButton = (): void => {
    if (!pause) return;
    pause.hidden = reducedMotion.matches;
    pause.textContent = paused ? 'Reanudar' : 'Pausar';
  };
  pause?.addEventListener('click', () => {
    paused = !paused;
    setLive(paused);
    syncPauseButton();
    refresh();
  });
  // Si cambia la preferencia en vivo: con reducir movimiento se detiene y el botón desaparece.
  reducedMotion.addEventListener('change', () => {
    syncPauseButton();
    refresh();
  });

  syncPauseButton();
  setLive(paused || reducedMotion.matches);
  refresh();
}

setupHero();

/**
 * Filtro del catálogo: los chips vienen del build con `hidden` (sin script no se ven y se muestran
 * todos los juegos). Al elegir uno se marca `aria-pressed` y se oculta cada tarjeta que no coincide.
 * Solo se leen atributos `data-*` del HTML generado en el build; no se escribe HTML.
 */
function setupCatalogFilter(): void {
  const container = document.querySelector<HTMLElement>('[data-filter-chips]');
  const status = document.querySelector<HTMLElement>('[data-filter-status]');
  const reset = document.querySelector<HTMLButtonElement>('[data-filter-reset]');
  const chips = [
    ...document.querySelectorAll<HTMLButtonElement>('[data-filter-chips] [data-filter]'),
  ];
  const cards = [...document.querySelectorAll<HTMLElement>('.game-grid > li[data-controls]')];
  if (!container || !status || !reset || chips.length === 0 || cards.length === 0) return;

  const apply = (filter: string): void => {
    if (!isValidFilter(filter)) return;
    for (const chip of chips) {
      chip.setAttribute('aria-pressed', String(chip.dataset.filter === filter));
    }
    let visible = 0;
    for (const card of cards) {
      const show = matchesFilter(filter, {
        controls: card.dataset.controls ?? '',
        genres: card.dataset.genres ?? '',
      });
      card.hidden = !show;
      if (show) visible += 1;
    }
    // Región de estado: el texto cambia (no aparece de golpe) para que se anuncie.
    status.textContent = visible === 0 ? (status.dataset.message ?? '') : '';
    reset.hidden = visible > 0;
  };

  for (const chip of chips) {
    chip.addEventListener('click', () => apply(chip.dataset.filter ?? ''));
  }
  reset.addEventListener('click', () => {
    apply(FILTER_ALL);
    // El botón desaparece: el foco pasa al chip «Todos» para no perderse.
    chips.find((chip) => chip.dataset.filter === FILTER_ALL)?.focus();
  });
  container.hidden = false;
}

setupCatalogFilter();
