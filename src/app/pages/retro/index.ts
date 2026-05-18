/**
 * Lazy-load entry for the /retro route.
 *
 * React Router 7's `lazy` field expects the module to export a `Component`
 * (or `default`) field; we re-export RetroPage so the bundler emits a
 * dedicated chunk that's only fetched after the easter egg fires.
 */
export { RetroPage as Component } from './RetroPage';
export { RetroPage as default } from './RetroPage';
