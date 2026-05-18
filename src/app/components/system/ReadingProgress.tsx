import { useEffect, useRef } from 'react';

export function ReadingProgress() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const el = ref.current;
      if (el) {
        const total = document.documentElement.scrollHeight - window.innerHeight;
        const p = total > 0 ? Math.min(1, Math.max(0, window.scrollY / total)) : 0;
        el.style.setProperty('--progress', String(p));
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return <div ref={ref} className="progress-bar" aria-hidden />;
}
