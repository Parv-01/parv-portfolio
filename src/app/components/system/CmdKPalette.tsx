import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  ArrowRight,
  Compass,
  FileDown,
  Github,
  Linkedin,
  Mail,
  Search,
  Terminal,
  Volume2,
} from 'lucide-react';
import { audioManager } from '@/audio/AudioManager';

type Action = {
  id: string;
  label: string;
  hint?: string;
  group: 'Navigate' | 'Profile' | 'Quick';
  icon: typeof Search;
  run: () => void;
};

export function CmdKPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const actions = useMemo<Action[]>(
    () => [
      { id: 'go-home', label: 'Go to Home', group: 'Navigate', icon: Compass, run: () => navigate('/') },
      { id: 'go-about', label: 'Go to About', group: 'Navigate', icon: Compass, run: () => navigate('/about') },
      { id: 'go-projects', label: 'Go to Projects', group: 'Navigate', icon: Compass, run: () => navigate('/projects') },
      { id: 'go-blog', label: 'Go to Blog', group: 'Navigate', icon: Compass, run: () => navigate('/blog') },
      { id: 'go-playground', label: 'Go to Playground', group: 'Navigate', icon: Terminal, run: () => navigate('/playground') },
      { id: 'go-contact', label: 'Go to Contact', group: 'Navigate', icon: Compass, run: () => navigate('/contact') },
      {
        id: 'email',
        label: 'Copy email address',
        hint: 'parvagarwal9759+portfolio@gmail.com',
        group: 'Profile',
        icon: Mail,
        run: () => { navigator.clipboard?.writeText('parvagarwal9759+portfolio@gmail.com').catch(() => {}); },
      },
      {
        id: 'github',
        label: 'Open GitHub',
        hint: '@Parv-01',
        group: 'Profile',
        icon: Github,
        run: () => window.open('https://github.com/Parv-01', '_blank', 'noopener,noreferrer'),
      },
      {
        id: 'linkedin',
        label: 'Open LinkedIn',
        hint: '/in/parvagarwal',
        group: 'Profile',
        icon: Linkedin,
        run: () => window.open('https://www.linkedin.com/in/parvagarwal', '_blank', 'noopener,noreferrer'),
      },
      {
        id: 'resume',
        label: 'Download resume',
        hint: '/resume.pdf',
        group: 'Profile',
        icon: FileDown,
        run: () => window.open('/resume/parv-agarwal-resume.pdf', '_blank', 'noopener,noreferrer'),
      },
      {
        id: 'toggle-audio',
        label: 'Toggle ambient audio',
        group: 'Quick',
        icon: Volume2,
        run: () => {
          audioManager.playClick();
          audioManager.toggleMute();
        },
      },
    ],
    [navigate]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return actions;
    return actions.filter(
      (a) => a.label.toLowerCase().includes(q) || (a.hint?.toLowerCase().includes(q) ?? false)
    );
  }, [query, actions]);

  const grouped = useMemo(() => {
    const groups: Record<Action['group'], Action[]> = { Navigate: [], Profile: [], Quick: [] };
    filtered.forEach((a) => groups[a.group].push(a));
    return groups;
  }, [filtered]);

  useEffect(() => { setCursor(0); }, [query]);

  useEffect(() => {
    if (open) {
      const id = window.requestAnimationFrame(() => inputRef.current?.focus());
      return () => window.cancelAnimationFrame(id);
    }
    setQuery('');
    setCursor(0);
  }, [open]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      const meta = e.metaKey || e.ctrlKey;
      if (meta && k === 'k') { e.preventDefault(); setOpen((v) => !v); return; }
      if (k === '/' && !open) {
        const ae = document.activeElement;
        if (ae && (ae.tagName === 'INPUT' || ae.tagName === 'TEXTAREA' || (ae as HTMLElement).isContentEditable)) return;
        e.preventDefault();
        setOpen(true);
        return;
      }
      if (k === 'escape' && open) { setOpen(false); return; }
      if (open) {
        if (k === 'arrowdown') { e.preventDefault(); setCursor((c) => Math.min(c + 1, filtered.length - 1)); }
        else if (k === 'arrowup') { e.preventDefault(); setCursor((c) => Math.max(c - 1, 0)); }
        else if (k === 'enter') {
          e.preventDefault();
          const action = filtered[cursor];
          if (action) { action.run(); setOpen(false); }
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, filtered, cursor]);

  const close = useCallback(() => setOpen(false), []);
  if (!open) return null;

  let runningIndex = 0;

  return (
    <div
      role="dialog"
      aria-label="Command palette"
      className="fixed inset-0 z-[80] flex items-start justify-center pt-[18vh] px-4"
      onClick={close}
    >
      <div
        className="absolute inset-0"
        style={{
          background: 'color-mix(in srgb, var(--bg-base) 70%, transparent)',
          backdropFilter: 'blur(4px)',
        }}
      />
      <div
        onClick={(e) => e.stopPropagation()}
        className="glass-deep relative w-full max-w-[600px] overflow-hidden rounded-2xl"
      >
        <div
          className="flex items-center gap-3 px-4 py-3"
          style={{ borderBottom: '1px solid var(--border-hairline)' }}
        >
          <Search size={16} style={{ color: 'var(--fg-muted)' }} />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or search…"
            className="flex-1 bg-transparent outline-none"
            style={{ fontSize: '0.9375rem', color: 'var(--fg-primary)' }}
          />
          <kbd
            className="px-2 py-0.5 rounded"
            style={{
              border: '1px solid var(--border-hairline)',
              color: 'var(--fg-muted)',
              fontFamily: 'var(--font-mono)',
              fontSize: '10px',
            }}
          >
            esc
          </kbd>
        </div>
        <div className="max-h-[60vh] overflow-auto py-2">
          {(['Navigate', 'Profile', 'Quick'] as const).map((g) => {
            const items = grouped[g];
            if (!items.length) return null;
            return (
              <div key={g} className="px-2 py-1">
                <div
                  className="px-3 py-1.5 uppercase tracking-wider"
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.6875rem',
                    color: 'var(--fg-muted)',
                    fontWeight: 600,
                  }}
                >
                  {g}
                </div>
                {items.map((a) => {
                  const idx = runningIndex++;
                  const active = idx === cursor;
                  const Icon = a.icon;
                  return (
                    <button
                      key={a.id}
                      onMouseEnter={() => setCursor(idx)}
                      onClick={() => { a.run(); setOpen(false); }}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer text-left bg-transparent"
                      style={{
                        background: active ? 'var(--accent-soft)' : 'transparent',
                        color: active ? 'var(--accent)' : 'var(--fg-primary)',
                      }}
                    >
                      <Icon size={14} style={{ color: 'var(--fg-muted)' }} />
                      <span style={{ fontSize: '0.875rem' }}>{a.label}</span>
                      {a.hint && (
                        <span
                          className="ml-auto"
                          style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.6875rem',
                            color: 'var(--fg-muted)',
                          }}
                        >
                          {a.hint}
                        </span>
                      )}
                      <ArrowRight size={12} style={{ color: 'var(--fg-faint)', marginLeft: a.hint ? 0 : 'auto' }} />
                    </button>
                  );
                })}
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="px-5 py-6 text-center" style={{ fontSize: '0.8125rem', color: 'var(--fg-muted)' }}>
              No results.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
