import { useEffect } from 'react';
import { Link } from 'react-router';
import { RetroGame } from './RetroGame';
import './retro.css';

/**
 * RetroPage — fully isolated synthwave easter egg page.
 *
 * Isolation contract:
 *   • Sits OUTSIDE the main Layout (see routes.ts) — no header, no footer,
 *     no global canvas, no theme provider read.
 *   • All styling scoped under `.retro-root`. Uses zero --bg-base / --accent
 *     site variables, so light/dark toggles on the rest of the site have
 *     zero visual effect.
 *   • While mounted, we force the document data-theme to a sentinel value
 *     ("retro") and restore it on unmount. This prevents any global
 *     scrollbar / color-scheme inheritance.
 *
 * Performance contract:
 *   • This file + RetroGame + retro.css are split into their own chunk by
 *     React Router's `lazy` field (see routes.ts).
 *   • No assets are preloaded.
 */
export function RetroPage() {
  useEffect(() => {
    const html = document.documentElement;
    const prevTheme = html.getAttribute('data-theme');
    const prevColorScheme = html.style.colorScheme;
    const prevOverflow = document.body.style.overflow;

    html.setAttribute('data-theme', 'retro');
    html.style.colorScheme = 'dark';
    document.body.style.overflow = 'hidden';

    return () => {
      if (prevTheme) html.setAttribute('data-theme', prevTheme);
      else html.removeAttribute('data-theme');
      html.style.colorScheme = prevColorScheme;
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  return (
    <div className="retro-root" role="main">
      <div className="retro-sun" aria-hidden="true" />
      <div className="retro-grid" aria-hidden="true" />
      <div className="retro-vignette" aria-hidden="true" />
      <div className="retro-scanlines" aria-hidden="true" />

      <Link to="/" className="retro-exit" aria-label="Exit retro mode">
        ← EXIT
      </Link>

      <div className="retro-content">
        <p className="retro-subtitle">// SECRET ZONE · ACCESS GRANTED</p>
        <h1 className="retro-title">PARV.SYS</h1>
        <p className="retro-subtitle" style={{ opacity: 0.7 }}>
          Welcome to the arcade
        </p>

        <RetroGame />

        <p className="retro-hint" style={{ marginTop: 24 }}>
          Built with ♥ — return any time by tapping the logo 5× quickly
        </p>
      </div>
    </div>
  );
}

export default RetroPage;
