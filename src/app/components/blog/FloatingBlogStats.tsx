/**
 * FloatingBlogStats — the mobile/tablet floating pill that surfaces blog
 * platform stats and profile links when the desktop right-sidebar is hidden.
 *
 * Collapsed: 44 px wide vertical pill (book icon over total count).
 * Expanded:  spring-animated card with per-platform rows + "View all" link.
 *
 * Hidden ≥ lg via the wrapper's `lg:hidden`. Z-index 40 sits above page
 * content and below the global command-palette overlay.
 */

import { forwardRef, useEffect, useId, useRef, useState } from 'react';
import { useLocation } from 'react-router';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { BookOpen, ChevronRight, ExternalLink, X } from 'lucide-react';
import {
  EXTERNAL_SOURCES,
  platformDisplayName,
  type ExternalSource,
} from '@/lib/blog/sources.config';
import type { LoadState } from '@/lib/blog/aggregate';
import type { UnifiedPostSource } from '@/lib/blog/types';

type Props = { state: LoadState };

const POSTS_ANCHOR = 'blog-posts-list';

export function FloatingBlogStats({ state }: Props) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();
  const location = useLocation();
  const reduced = useReducedMotion() ?? false;

  const total = state.posts.length;

  // Close on route change.
  useEffect(() => {
    if (open) setOpen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  // Escape + outside click.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    const onPointer = (e: PointerEvent) => {
      const t = e.target as Node | null;
      if (!t) return;
      if (panelRef.current && panelRef.current.contains(t)) return;
      if (triggerRef.current && triggerRef.current.contains(t)) return;
      setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('pointerdown', onPointer);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('pointerdown', onPointer);
    };
  }, [open]);

  // Focus management.
  useEffect(() => {
    if (open) {
      const id = window.setTimeout(() => closeBtnRef.current?.focus(), 0);
      return () => window.clearTimeout(id);
    }
    triggerRef.current?.focus();
    return undefined;
  }, [open]);

  const handleViewAll = () => {
    setOpen(false);
    const el = document.getElementById(POSTS_ANCHOR);
    if (el) {
      el.scrollIntoView({
        behavior: reduced ? 'auto' : 'smooth',
        block: 'start',
      });
    }
  };

  return (
    <div className="lg:hidden fixed right-3 z-40" style={{ top: '45%', transform: 'translateY(-50%)' }}>
      <PillTrigger
        ref={triggerRef}
        open={open}
        loading={state.loading}
        reduced={reduced}
        total={total}
        panelId={panelId}
        onToggle={() => setOpen((o) => !o)}
      />

      <AnimatePresence>
        {open && (
          <motion.div
            key="blog-stats-panel"
            id={panelId}
            ref={panelRef}
            role="dialog"
            aria-modal="false"
            aria-label="Blog stats and platform links"
            initial={reduced ? { opacity: 0 } : { opacity: 0, x: 24, scale: 0.96 }}
            animate={reduced ? { opacity: 1 } : { opacity: 1, x: 0, scale: 1 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, x: 24, scale: 0.96 }}
            transition={
              reduced
                ? { duration: 0.12 }
                : { type: 'spring', stiffness: 300, damping: 30 }
            }
            className="absolute right-0 rounded-xl overflow-hidden"
            style={{
              top: '100%',
              marginTop: '0.5rem',
              width: 'min(86vw, 320px)',
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-hairline)',
              boxShadow: '0 12px 32px -12px rgba(0,0,0,0.45)',
            }}
          >
            <PanelHeader onClose={() => setOpen(false)} closeRef={closeBtnRef} />
            <div className="flex flex-col" style={{ borderTop: '1px solid var(--border-hairline)' }}>
              <LocalRow count={state.perSource.local} />
              {EXTERNAL_SOURCES.map((src) => (
                <ExternalRow
                  key={src.kind}
                  src={src}
                  count={state.perSource[src.kind as UnifiedPostSource] ?? 0}
                  errored={state.errored.includes(src.kind as UnifiedPostSource)}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={handleViewAll}
              className="w-full cursor-pointer bg-transparent text-left"
              style={{
                padding: '0.75rem 1rem',
                borderTop: '1px solid var(--border-hairline)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: 'var(--accent)',
              }}
            >
              View all posts ↓
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ---------------- Internal pieces ---------------- */

type TriggerProps = {
  open: boolean;
  loading: boolean;
  reduced: boolean;
  total: number;
  panelId: string;
  onToggle: () => void;
};

const PillTrigger = forwardRef<HTMLButtonElement, TriggerProps>(function PillTrigger(
  { open, loading, reduced, total, panelId, onToggle },
  ref
) {
  return (
    <button
      ref={ref}
      type="button"
      onClick={onToggle}
      aria-expanded={open}
      aria-controls={panelId}
      aria-label={`Blog stats, ${total} posts`}
      className="flex flex-col items-center justify-center cursor-pointer"
      style={{
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border-hairline)',
        borderRadius: '999px',
        padding: '0.55rem 0.45rem',
        minWidth: '44px',
        minHeight: '60px',
        color: 'var(--fg-primary)',
        animation: loading && !reduced ? 'parv-blog-pulse 1.6s ease-in-out infinite' : 'none',
        transition: 'transform 0.2s ease',
      }}
    >
      <BookOpen size={16} style={{ color: 'var(--fg-secondary)' }} />
      <span
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.75rem',
          fontWeight: 600,
          marginTop: '0.2rem',
          color: 'var(--fg-primary)',
        }}
      >
        {total}
      </span>
      <style>{`
        @keyframes parv-blog-pulse {
          0%, 100% { box-shadow: 0 0 0 0 var(--accent-soft); }
          50%      { box-shadow: 0 0 0 6px transparent; }
        }
        @media (prefers-reduced-motion: reduce) {
          @keyframes parv-blog-pulse { 0%,100% { box-shadow: none; } 50% { box-shadow: none; } }
        }
      `}</style>
    </button>
  );
});

function PanelHeader({
  onClose,
  closeRef,
}: {
  onClose: () => void;
  closeRef: React.Ref<HTMLButtonElement>;
}) {
  return (
    <div className="flex items-center justify-between" style={{ padding: '0.85rem 1rem' }}>
      <span
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.6875rem',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: 'var(--fg-muted)',
          fontWeight: 600,
        }}
      >
        Where I write
      </span>
      <button
        ref={closeRef}
        type="button"
        onClick={onClose}
        aria-label="Close blog stats panel"
        className="inline-flex items-center justify-center cursor-pointer bg-transparent"
        style={{
          width: '28px',
          height: '28px',
          border: '1px solid var(--border-hairline)',
          borderRadius: '999px',
          color: 'var(--fg-muted)',
        }}
      >
        <X size={14} />
      </button>
    </div>
  );
}

function LocalRow({ count }: { count: number }) {
  return (
    <div
      className="flex items-center justify-between"
      style={{
        padding: '0.7rem 1rem',
        borderTop: '1px solid var(--border-hairline)',
      }}
    >
      <span style={{ fontSize: '0.875rem', color: 'var(--fg-primary)' }}>
        This site
      </span>
      <span
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.75rem',
          color: 'var(--fg-muted)',
        }}
      >
        {count} {count === 1 ? 'post' : 'posts'}
      </span>
    </div>
  );
}

function ExternalRow({
  src,
  count,
  errored,
}: {
  src: ExternalSource;
  count: number;
  errored: boolean;
}) {
  const name = platformDisplayName(src.kind);
  const inert = errored || count === 0;
  return (
    <a
      href={src.profileUrl}
      target="_blank"
      rel="noreferrer noopener"
      className="flex items-center justify-between no-underline transition-colors"
      style={{
        padding: '0.7rem 1rem',
        borderTop: '1px solid var(--border-hairline)',
        color: 'var(--fg-primary)',
        opacity: inert ? 0.7 : 1,
      }}
    >
      <span className="flex flex-col">
        <span style={{ fontSize: '0.875rem', color: 'var(--fg-primary)' }}>{name}</span>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.6875rem',
            color: 'var(--fg-muted)',
            marginTop: '0.1rem',
          }}
        >
          {src.displayName}
        </span>
      </span>
      <span className="inline-flex items-center gap-2">
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.75rem',
            color: 'var(--fg-secondary)',
          }}
        >
          {inert ? '—' : count + ' ' + (count === 1 ? 'post' : 'posts')}
        </span>
        <ExternalLink size={12} style={{ color: 'var(--fg-muted)' }} />
        <ChevronRight size={14} style={{ color: 'var(--fg-muted)' }} />
      </span>
    </a>
  );
}
