import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import { useNavigate } from 'react-router';
import { recordTap, resetTaps } from './easterEggTracker';
import './EasterEggLogo.css';

/**
 * EasterEggLogo
 * ─────────────────────────────────────────────────────────────────────────
 * A drop-in logo component that doubles as a secret 5-tap activation trigger.
 *
 *   • Looks like a normal logo (img + decorative orbital ring).
 *   • Five rapid taps (≤ 1500ms total) → cinematic portal animation → /retro.
 *   • A single tap does nothing (so it's safe to drop inside or beside
 *     a <Link>; the parent decides whether clicking the logo navigates).
 *   • GPU-accelerated CSS transforms only; no JS animation loops.
 *   • Respects `prefers-reduced-motion`.
 *   • No memory leaks: timers and listeners are cleaned up on unmount.
 *
 * Drop the actual logo asset at:  public/images/logo.png
 * (PNG, SVG, or WebP all work — pass `src` to override.)
 */

export interface EasterEggLogoProps {
  /** Pixel size of the (square) logo. Default 32. */
  size?: number;
  /** Override the image source. Defaults to /images/logo.png. */
  src?: string;
  /** Accessible label for screen readers. */
  ariaLabel?: string;
  /** Extra class on the root button. */
  className?: string;
  /** Extra inline style on the root button. */
  style?: CSSProperties;
  /** Whether to render the decorative orbital ring overlay. Default true. */
  showOrbit?: boolean;
  /** Image `loading` attribute. Default 'eager' for navbar, but pass 'lazy' for below-the-fold. */
  loading?: 'eager' | 'lazy';
  /** Activation hook — fires AFTER the 5th tap is detected and BEFORE navigation. */
  onActivate?: () => void;
  /** Destination path on activation. Default '/retro'. */
  destination?: string;
}

const ACTIVATION_MS = 1100;

export function EasterEggLogo({
  size = 32,
  src = '/images/logo.png',
  ariaLabel = 'Parv Agarwal logo',
  className = '',
  style,
  showOrbit = true,
  loading = 'eager',
  onActivate,
  destination = '/retro',
}: EasterEggLogoProps) {
  const navigate = useNavigate();
  const [activating, setActivating] = useState(false);
  const activationTimer = useRef<number | null>(null);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      if (activationTimer.current !== null) {
        window.clearTimeout(activationTimer.current);
        activationTimer.current = null;
      }
    };
  }, []);

  const handleTap = useCallback(
    (e: React.MouseEvent | React.KeyboardEvent) => {
      if ('button' in e && (e as React.MouseEvent).button !== 0) return;
      e.stopPropagation();

      if (activating) return;

      const triggered = recordTap();
      if (!triggered) return;

      onActivate?.();
      setActivating(true);
      resetTaps();

      activationTimer.current = window.setTimeout(() => {
        if (!mounted.current) return;
        navigate(destination);
      }, ACTIVATION_MS);
    },
    [activating, navigate, onActivate, destination]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleTap(e);
      }
    },
    [handleTap]
  );

  return (
    <>
      <button
        type="button"
        aria-label={ariaLabel}
        title={ariaLabel}
        onClick={handleTap}
        onKeyDown={handleKeyDown}
        className={`eel-root ${activating ? 'eel-activating' : ''} ${className}`}
        style={{ width: size, height: size, ...style }}
        data-no-click-sound=""
      >
        <img
          className="eel-img rounded-full object-cover"
          style={{ borderRadius: '80%', objectFit: 'cover' }}
          src={src}
          alt=""
          width={size}
          height={size}
          loading={loading}
          decoding="async"
          draggable={false}
        />
        {showOrbit && (
          <svg
            className="eel-orbit"
            viewBox="0 0 100 100"
            aria-hidden="true"
            focusable="false"
          >
            <ellipse
              cx="50"
              cy="50"
              rx="46"
              ry="18"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.8"
              opacity="0.5"
              transform="rotate(20 50 50)"
            />
            <ellipse
              cx="50"
              cy="50"
              rx="46"
              ry="18"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.8"
              opacity="0.4"
              transform="rotate(-25 50 50)"
            />
            <circle cx="50" cy="50" r="2" fill="currentColor" />
          </svg>
        )}
      </button>
      {activating && <div className="eel-flash" aria-hidden="true" />}
    </>
  );
}

export default EasterEggLogo;
