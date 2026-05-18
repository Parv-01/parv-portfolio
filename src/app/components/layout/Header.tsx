import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router';
import { Volume2, VolumeX, Menu, X, Command } from 'lucide-react';
import { audioManager } from '@/audio/AudioManager';
import { ThemeToggle } from '../system/ThemeToggle';
import { EasterEggLogo } from '../system/EasterEggLogo';

const navItems = [
  { label: 'Home', path: '/' },
  { label: 'About', path: '/about' },
  { label: 'Projects', path: '/projects' },
  { label: 'Blog', path: '/blog' },
  { label: 'Playground', path: '/playground' },
  { label: 'Contact', path: '/contact' },
];

export function Header() {
  const location = useLocation();
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const handleAudioToggle = () => {
    audioManager.playClick();
    audioManager.toggleMute();
    setSoundEnabled(!audioManager.isMuted());
  };

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 h-16 transition-all duration-300"
      style={{
        background: 'transparent',
        borderBottom: '1px solid transparent',
      }}
    >
      <div className="w-full h-full px-2 sm:px-4 md:px-6 lg:px-8 flex items-center justify-between gap-2 sm:gap-8">
        <div
          className="flex items-center gap-2 shrink-0 rounded-full px-3 py-1.5 transition-all duration-300"
          style={{
            background: scrolled
              ? 'color-mix(in srgb, var(--bg-base) 16%, transparent)'
              : 'transparent',
            backdropFilter: scrolled ? 'blur(14px)' : 'none',
            WebkitBackdropFilter: scrolled ? 'blur(14px)' : 'none',
            border: scrolled
              ? '1px solid color-mix(in srgb, white 10%, transparent)'
              : '1px solid transparent',
            boxShadow: scrolled
              ? '0 4px 24px rgba(0,0,0,0.16)'
              : 'none',
          }}
        >
          <EasterEggLogo size={32} ariaLabel="tap 5× for easter egg" loading="eager" />
          <Link
            to="/"
            className="no-underline"
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '1rem',
              fontWeight: 500,
              letterSpacing: '-0.01em',
              color: 'var(--fg-primary)',
            }}
          >
            Parv Agarwal
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-1 glass-pill rounded-full px-1.5 py-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className="relative px-3 py-1.5 rounded-full no-underline transition-colors duration-200"
                style={{
                  fontSize: '0.8125rem',
                  fontWeight: 400,
                  color: isActive ? 'var(--accent)' : 'var(--fg-secondary)',
                }}
              >
                {isActive && (
                  <span
                    aria-hidden
                    className="absolute inset-0 -z-10 rounded-full"
                    style={{ background: 'var(--accent-soft)' }}
                  />
                )}
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div
            className={`flex items-center gap-0.5 sm:gap-1.5 shrink-0 transition-all duration-300 ${scrolled ? 'glass-pill px-1 sm:px-2 py-1 rounded-full' : 'px-1 sm:px-2 py-1'}`}          style={{
            background: scrolled
              ? 'color-mix(in srgb, var(--bg-base) 16%, transparent)'
              : 'transparent',
            backdropFilter: scrolled ? 'blur(14px)' : 'none',
            WebkitBackdropFilter: scrolled ? 'blur(14px)' : 'none',
            border: scrolled
              ? '1px solid color-mix(in srgb, white 10%, transparent)'
              : '1px solid transparent',
            boxShadow: scrolled
              ? '0 4px 24px rgba(0,0,0,0.16)'
              : 'none',
          }}
        >
          <button
            onClick={() => {
              audioManager.playClick();
              const ev = new KeyboardEvent('keydown', { key: 'k', metaKey: true, ctrlKey: true });
              window.dispatchEvent(ev);
            }}
            className="hidden md:inline-flex items-center gap-2 px-3 py-1.5 rounded-lg glass-pill border-0 cursor-pointer transition-colors duration-200"
            style={{ color: 'var(--fg-secondary)' }}
            title="Open command palette"
          >
            <Command size={13} />
            <span style={{ fontSize: '0.75rem' }}>Search</span>
            <kbd
              className="px-1 py-0.5 rounded"
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.625rem',
                background: 'var(--bg-input)',
                color: 'var(--fg-muted)',
              }}
            >
              ⌘K
            </kbd>
          </button>

          <ThemeToggle />

          <button
            onClick={handleAudioToggle}
            className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors duration-200 border-0 bg-transparent cursor-pointer"
            style={{ color: 'var(--fg-muted)' }}
            title={soundEnabled ? 'Audio on' : 'Audio off'}
          >
            {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>

          <button
            onClick={() => {
              audioManager.playClick();
              setMobileOpen(!mobileOpen);
            }}
            className="md:hidden w-9 h-9 rounded-lg flex items-center justify-center transition-colors duration-200 border-0 bg-transparent cursor-pointer"
            style={{ color: 'var(--fg-secondary)' }}
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div
          className="md:hidden"
          style={{
            background: 'color-mix(in srgb, var(--bg-elevated) 95%, transparent)',
            backdropFilter: 'blur(12px)',
          }}
        >
          <nav className="flex flex-col py-4 px-4 gap-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => audioManager.playClick()}
                  className="px-4 py-3 rounded-lg no-underline transition-colors duration-200"
                  style={{
                    color: isActive ? 'var(--accent)' : 'var(--fg-secondary)',
                    background: isActive ? 'var(--accent-soft)' : 'transparent',
                  }}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}
