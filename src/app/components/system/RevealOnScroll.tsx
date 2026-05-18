import { useEffect, useRef, type ReactNode } from 'react';
import { getAnime, animeEase } from '@/lib/anime';

type Props = {
  children: ReactNode;
  selector?: string;
  stagger?: number;
  className?: string;
};

export function RevealOnScroll({
  children,
  selector = '[data-reveal]',
  stagger = 70,
  className = '',
}: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrap = ref.current;
    if (!wrap) return;
    const targets = wrap.querySelectorAll<HTMLElement>(selector);
    if (!targets.length) return;

    targets.forEach((t) => {
      t.style.opacity = '0';
      t.style.transform = 'translateY(18px)';
      t.style.willChange = 'opacity, transform';
    });

    let cancelled = false;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          io.unobserve(e.target);
          getAnime().then((anime) => {
            if (cancelled) return;
            anime({
              targets: Array.from(targets),
              opacity: [0, 1],
              translateY: [18, 0],
              duration: 620,
              delay: anime.stagger(stagger),
              easing: animeEase.smooth,
            });
          });
        }
      },
      { rootMargin: '-15% 0px -15% 0px' }
    );
    io.observe(wrap);
    return () => {
      cancelled = true;
      io.disconnect();
    };
  }, [selector, stagger]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
