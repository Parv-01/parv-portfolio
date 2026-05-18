/**
 * easterEggTracker
 * ─────────────────────────────────────────────────────────────────────────
 * Module-scoped tap accumulator. Any EasterEggLogo instance (navbar, footer,
 * about page, etc.) reports a tap; if 5 taps land inside `WINDOW_MS`,
 * `recordTap` returns true so the caller can start the activation animation.
 *
 * Why module-scope and not React state?
 *   - Survives remounts (e.g. route changes between logo instances).
 *   - Zero rerenders of the host components.
 *   - No global window/event pollution.
 *
 * NOTE: this file ships in the main bundle (it's ~30 lines). The /retro page
 * itself is lazy-loaded — see routes.ts.
 */

const WINDOW_MS = 1500;
const REQUIRED_TAPS = 5;

let timestamps: number[] = [];

/** Record a tap. Returns true iff the threshold was just crossed. */
export function recordTap(): boolean {
  const now =
    typeof performance !== 'undefined' && performance.now
      ? performance.now()
      : Date.now();

  timestamps = timestamps.filter((t) => now - t <= WINDOW_MS);
  timestamps.push(now);

  if (timestamps.length >= REQUIRED_TAPS) {
    timestamps = [];
    return true;
  }
  return false;
}

/** Force-clear the buffer (used after activation or on unmount). */
export function resetTaps(): void {
  timestamps = [];
}

export const EASTER_EGG_CONFIG = {
  WINDOW_MS,
  REQUIRED_TAPS,
} as const;
