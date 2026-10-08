// Shared motion rules. Motion (WAAPI build) handles UI state changes; Anime.js handles SVG and text.
import { animate } from 'motion/mini';

export const EASE = [0.22, 1, 0.36, 1] as const;

export const prefersReducedMotion = (): boolean => matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Shows what just changed after a user action: a short rise and fade. */
export function reveal(el: Element | null, distance = 10, delay = 0): void {
  if (!el || prefersReducedMotion()) return;
  animate(el, { opacity: [0, 1], transform: [`translateY(${distance}px)`, 'translateY(0)'] }, { duration: 0.36, delay, ease: EASE });
}

/** Moves focus without the browser jumping the page, used after the content under it changed. */
export function focusQuietly(el: HTMLElement | null): void {
  if (!el) return;
  if (!el.hasAttribute('tabindex') && !el.matches('a, button, input, select, textarea')) el.setAttribute('tabindex', '-1');
  el.focus({ preventScroll: true });
}
