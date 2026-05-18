import { useEffect, useRef, useState, type ReactNode } from 'react';
import { getAnime, animeEase } from '@/lib/anime';

const STORAGE_KEY = 'nebula.booted';
const ORBIT_COUNT = 16;

/**
 * Boot preloader — a stack of nested rotating rings in a 3D perspective box,
 * inspired by orrery / armillary sphere instruments. Theme-aware: the ring
 * stroke comes from --fg-primary so it reads on both light and dark sky.
 */
export function BootLoader({ children }: { children: ReactNode }) {
  const [show, setShow] = useState<boolean | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const taglineRef = useRef<HTMLParagraphElement>(null);
  const orbitsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const booted = window.sessionStorage.getItem(STORAGE_KEY) === '1';
    setShow(!booted);
  }, []);

  useEffect(() => {
    if (show !== true) return;
    let cancelled = false;

    getAnime().then((anime) => {
      if (cancelled) return;
      const tl = anime.timeline({ easing: animeEase.smooth });

      tl.add({
        targets: orbitsRef.current,
        opacity: [0, 1],
        scale: [0.85, 1],
        duration: 700,
        easing: animeEase.outExpo,
      });

      tl.add(
        {
          targets: titleRef.current,
          opacity: [0, 1],
          translateY: [10, 0],
          duration: 500,
        },
        '-=350'
      );

      tl.add(
        {
          targets: taglineRef.current,
          opacity: [0, 1],
          translateY: [8, 0],
          duration: 500,
        },
        '-=250'
      );

      tl.add({
        targets: overlayRef.current,
        opacity: [1, 0],
        duration: 520,
        delay: 900,
        easing: animeEase.outExpo,
        complete: () => {
          try {
            window.sessionStorage.setItem(STORAGE_KEY, '1');
          } catch {
            /* noop */
          }
          setShow(false);
        },
      });
    });

    return () => {
      cancelled = true;
    };
  }, [show]);

  return (
    <>
      {children}
      {show === true && (
        <div
          ref={overlayRef}
          aria-hidden
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden"
          style={{
            background:
              'radial-gradient(70% 70% at 50% 50%, color-mix(in srgb, var(--accent-soft) 80%, transparent) 0%, transparent 60%), var(--bg-base)',
            willChange: 'opacity',
          }}
        >
          <div
            ref={orbitsRef}
            className="orbit-stage"
            style={{ opacity: 0 }}
            aria-hidden
          >
            <div className="orbit-container">
              {Array.from({ length: ORBIT_COUNT }, (_, i) => (
                <span key={i} className="orbit-ring" data-index={i + 1} />
              ))}
            </div>
          </div>

          <div
            ref={titleRef}
            className="mt-10 flex items-center gap-2.5"
            style={{ opacity: 0 }}
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'var(--accent-soft)', border: '1px solid var(--border-accent)' }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: 'var(--accent)',
                }}
              >
                PA
              </span>
            </div>
            <span
              className="uppercase tracking-[0.28em]"
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.6875rem',
                color: 'var(--fg-muted)',
              }}
            >
              parv · agarwal
            </span>
          </div>

          <p
            ref={taglineRef}
            className="mt-4 text-center px-6 max-w-[560px]"
            style={{
              opacity: 0,
              fontFamily: 'var(--font-serif)',
              fontStyle: 'italic',
              fontSize: 'clamp(0.95rem, 1.6vw, 1.125rem)',
              lineHeight: 1.6,
              color: 'var(--fg-secondary)',
              letterSpacing: '-0.005em',
            }}
          >
            charting orbits of curiosity — at the meeting point of
            language, quantum and the brain.
          </p>
        </div>
      )}
    </>
  );
}
