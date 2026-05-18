import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router';
import { Header } from './Header';
import { Footer } from './Footer';
import GlobalCanvas from '@/three/GlobalCanvas';
import { audioManager } from '@/audio/AudioManager';
import { BootLoader } from '../system/BootLoader';
import { CmdKPalette } from '../system/CmdKPalette';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function AmbientByRoute() {
  const { pathname } = useLocation();
  useEffect(() => {
    audioManager.setAmbientGain(pathname === '/' ? 0.18 : 0.09);
  }, [pathname]);
  return null;
}

function AudioPrimer() {
  useEffect(() => {
    const unlock = () => {
      void audioManager.unlock();
    };

    const handleClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (target.closest('[data-no-click-sound]')) return;
      if (!target.closest('button, a, [role="button"], [data-click-sound]')) return;
      audioManager.playClick();
    };

    const handleKey = (event: KeyboardEvent) => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      const el = document.activeElement;
      if (!(el instanceof Element)) return;
      if (!el.matches('button, a, [role="button"], [data-click-sound]')) return;
      audioManager.playClick();
    };

    window.addEventListener('pointerdown', unlock, { once: true });
    window.addEventListener('keydown', unlock, { once: true });
    window.addEventListener('touchstart', unlock, { once: true, passive: true });

    window.addEventListener('click', handleClick);
    window.addEventListener('keydown', handleKey);

    return () => {
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
      window.removeEventListener('touchstart', unlock);
      window.removeEventListener('click', handleClick);
      window.removeEventListener('keydown', handleKey);
    };
  }, []);

  return null;
}

function CelestialBackground() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      <div className="absolute inset-0" style={{ backgroundColor: 'var(--bg-base)' }} />
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 50% 40%, color-mix(in srgb, var(--bg-elevated) 60%, transparent) 0%, transparent 70%)',
        }}
      />
      <div className="aurora" />
    </div>
  );
}

function Vignette() {
  return (
    <div
      className="fixed inset-0 pointer-events-none z-[2]"
      style={{
        background:
          'radial-gradient(circle at center, transparent 60%, color-mix(in srgb, var(--bg-base) 60%, transparent) 100%)',
      }}
    />
  );
}

export function Layout() {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <BootLoader>
      <div className="relative min-h-screen w-full flex flex-col">
        <CelestialBackground />
        <GlobalCanvas cinematic={isHome} />
        <Vignette />
        <ScrollToTop />
        <AmbientByRoute />
        <AudioPrimer />

        <div className="relative z-10 flex flex-col min-h-screen">
          <Header />
          <main className="flex-1 pt-16">
            <Outlet />
          </main>
          <Footer />
        </div>

        <CmdKPalette />
      </div>
    </BootLoader>
  );
}
