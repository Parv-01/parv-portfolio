import { useEffect, useRef, useState } from 'react';
import { getAnime, animeEase } from '@/lib/anime';

type Props = {
  value: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
  className?: string;
};

export function AnimatedCounter({
  value,
  suffix = '',
  prefix = '',
  duration = 1200,
  className,
}: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || done) return;
    let cancelled = false;

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          io.disconnect();
          getAnime().then((anime) => {
            if (cancelled) return;
            const counter = { v: 0 };
            anime({
              targets: counter,
              v: value,
              round: 1,
              duration,
              easing: animeEase.outExpo,
              update: () => {
                if (el) el.textContent = `${prefix}${counter.v.toLocaleString()}${suffix}`;
              },
              complete: () => setDone(true),
            });
          });
        }
      },
      { rootMargin: '0px 0px -20% 0px' }
    );
    io.observe(el);
    return () => {
      cancelled = true;
      io.disconnect();
    };
  }, [value, prefix, suffix, duration, done]);

  return (
    <span
      ref={ref}
      className={className}
      style={{
        fontFamily: 'var(--font-serif)',
        fontSize: '2rem',
        fontWeight: 600,
        letterSpacing: '-0.02em',
      }}
    >
      {prefix}0{suffix}
    </span>
  );
}
