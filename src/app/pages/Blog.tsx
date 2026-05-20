import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { Clock, ArrowUpRight, SlidersHorizontal, X } from 'lucide-react';
import { Section } from '../components/layout/Section';
import { PageHero } from '../components/layout/PageHero';
import { SpotlightCard } from '../components/system/SpotlightCard';
import { PlatformBadge } from '../components/blog/PlatformBadge';
import { FloatingBlogStats } from '../components/blog/FloatingBlogStats';
import { loadLocalUnified } from '@/content/blog/loader';
import { useUnifiedPosts } from '@/lib/blog/aggregate';
import {
  EXTERNAL_SOURCES,
  platformDisplayName,
} from '@/lib/blog/sources.config';
import type { UnifiedPost, UnifiedPostSource } from '@/lib/blog/types';
import { SEO } from '../components/system/SEO';

export function Blog() {
  const localPosts = useMemo(() => loadLocalUnified(), []);
  const state = useUnifiedPosts(localPosts);
  const posts = state.posts;
  const localCount = localPosts.length;

  const allTags = useMemo(() => {
    const map = new Map<string, string>();
    for (const p of posts) {
      for (const t of p.tags) {
        const trimmed = t.trim();
        if (!trimmed) continue;
        const key = trimmed.toLowerCase();
        if (!map.has(key)) map.set(key, trimmed);
      }
    }
    return Array.from(map.values()).sort((a, b) => a.localeCompare(b));
  }, [posts]);

  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const filtered = useMemo(() => {
    if (!activeTag) return posts;
    const needle = activeTag.toLowerCase();
    return posts.filter((p) => p.tags.some((t) => t.toLowerCase() === needle));
  }, [posts, activeTag]);

  const platformsActive = useMemo(() => {
    const sources: UnifiedPostSource[] = ['local', 'hashnode', 'devto', 'medium'];
    return sources.reduce((n, s) => (state.perSource[s] > 0 ? n + 1 : n), 0);
  }, [state.perSource]);

  const showSkeletons = state.loading && posts.length === localCount;

  return (
    <div>
      <SEO
        title="Blog | Parv Agarwal"
        description="Technical notes on neuromorphic LLMs, low-resource NLP, quantum computing and engineering. Research write-ups, notebooks and implementation-minded essays by Parv Agarwal."
        canonicalPath="/blog"
        ogType="website"
      />
      <PageHero
        eyebrow="Blog"
        title={
          <>
            Writing &amp;<br />
            <em style={{ fontStyle: 'italic' }}>Technical notes</em>
          </>
        }
        body="Field notes from research -> quantum computing, low-resource NLP, neuromorphic architectures, brain-inspired memory and the strange middle where they all meet."
        mascotPose={{ rotationY: -0.2, cameraZ: 5.0, cameraY: 0.6, fov: 30, fit: 2.7, offsetX: 2.9, offsetY: 0.5, animationSpeed: 0.7 }}
      />

      <Section background="surface">
        <div className="lg:hidden mb-6 flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.6875rem',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'var(--fg-muted)',
              }}
            >
              {activeTag ? `tag · ${activeTag}` : 'all posts'} · {filtered.length}
            </span>
            <button
              onClick={() => setMobileOpen((o) => !o)}
              aria-expanded={mobileOpen}
              aria-controls="blog-filter-panel"
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer bg-transparent"
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                letterSpacing: '0.06em',
                border: '1px solid var(--border-hairline)',
                color: 'var(--fg-secondary)',
              }}
            >
              {mobileOpen ? <X size={14} /> : <SlidersHorizontal size={14} />}
              {mobileOpen ? 'CLOSE' : 'TOPICS'}
            </button>
          </div>
          <AnimatePresence initial={false}>
            {mobileOpen && (
              <motion.div
                key="blog-filter-panel"
                id="blog-filter-panel"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                className="overflow-hidden"
              >
                <div
                  className="rounded-lg p-3 flex flex-wrap gap-2"
                  style={{
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border-hairline)',
                  }}
                >
                  <TagChip
                    label="All"
                    active={activeTag === null}
                    onClick={() => { setActiveTag(null); setMobileOpen(false); }}
                  />
                  {allTags.map((tag) => (
                    <TagChip
                      key={tag}
                      label={tag}
                      active={activeTag?.toLowerCase() === tag.toLowerCase()}
                      onClick={() => { setActiveTag(tag); setMobileOpen(false); }}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div id="blog-posts-list" className="lg:col-span-8 flex flex-col gap-4">
            {filtered.map((post, i) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.42, delay: Math.min(i, 6) * 0.05, ease: [0.22, 1, 0.36, 1] }}
              >
                <PostCard post={post} />
              </motion.div>
            ))}
            {showSkeletons && <SkeletonRow />}
            {filtered.length === 0 && !showSkeletons && (
              <div className="py-16 text-center">
                <p style={{ fontSize: '0.875rem', color: 'var(--fg-muted)' }}>
                  No posts found for this tag.
                </p>
              </div>
            )}
          </div>

          <aside className="hidden lg:block lg:col-span-4">
            <div className="lg:sticky lg:top-24 flex flex-col gap-6">
              <SpotlightCard variant="glass" className="p-5">
                <span
                  className="uppercase tracking-wider block mb-4"
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.6875rem',
                    fontWeight: 600,
                    color: 'var(--fg-muted)',
                  }}
                >
                  Filter by Topic
                </span>
                <div className="flex flex-wrap gap-2">
                  <TagChip label="All" active={activeTag === null} onClick={() => setActiveTag(null)} />
                  {allTags.map((tag) => (
                    <TagChip
                      key={tag}
                      label={tag}
                      active={activeTag?.toLowerCase() === tag.toLowerCase()}
                      onClick={() => setActiveTag(tag)}
                    />
                  ))}
                </div>
              </SpotlightCard>

              <SpotlightCard variant="glass" className="p-5">
                <span
                  className="uppercase tracking-wider block mb-4"
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.6875rem',
                    fontWeight: 600,
                    color: 'var(--fg-muted)',
                  }}
                >
                  Writing Stats
                </span>
                <div className="flex flex-col gap-3">
                  <Row label="Total Posts" value={`${posts.length}`} />
                  <Row label="Topics" value={`${allTags.length}`} />
                  <Row label="Platforms" value={`${platformsActive}`} />
                </div>
              </SpotlightCard>

              <SpotlightCard variant="glass" className="p-5">
                <span
                  className="uppercase tracking-wider block mb-4"
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.6875rem',
                    fontWeight: 600,
                    color: 'var(--fg-muted)',
                  }}
                >
                  Cross-posted on
                </span>
                <div
                  className="flex flex-col gap-2"
                  style={{ fontSize: '0.8125rem', color: 'var(--fg-secondary)' }}
                >
                  {EXTERNAL_SOURCES.map((src) => {
                    const count = state.perSource[src.kind as UnifiedPostSource] ?? 0;
                    const errored = state.errored.includes(src.kind as UnifiedPostSource);
                    const name = platformDisplayName(src.kind);
                    const inert = errored || (count === 0 && !state.loading);
                    return (
                      <a
                        key={src.kind}
                        href={src.profileUrl}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="no-underline transition-colors flex items-center justify-between"
                        style={{ opacity: inert ? 0.7 : 1 }}
                      >
                        <span style={{ color: 'var(--fg-primary)' }}>
                          {name} <span style={{ color: 'var(--fg-muted)' }}>→ {src.displayName}</span>
                        </span>
                        <span
                          style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.6875rem',
                            color: inert ? 'var(--fg-faint)' : 'var(--fg-secondary)',
                          }}
                        >
                          {inert ? '—' : count + ' ' + (count === 1 ? 'post' : 'posts')}
                        </span>
                      </a>
                    );
                  })}
                </div>
              </SpotlightCard>
            </div>
          </aside>
        </div>
      </Section>

      <FloatingBlogStats state={state} />
    </div>
  );
}

function PostCard({ post }: { post: UnifiedPost }) {
  const inner = (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3 flex-wrap">
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.6875rem',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--fg-muted)',
          }}
        >
          {formatDate(post.date)}
        </span>
        <span className="w-1 h-1 rounded-full" style={{ background: 'var(--fg-faint)' }} />
        <span
          className="inline-flex items-center gap-1.5"
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.6875rem',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--fg-muted)',
          }}
        >
          <Clock size={12} />
          {post.readTime}
        </span>
        {post.external && post.platformLabel && (
          <PlatformBadge variant={post.platformLabel} />
        )}
        {post.paywalled && <PlatformBadge variant="MEMBER-ONLY" />}
        {post.featured && (
          <>
            <span className="w-1 h-1 rounded-full" style={{ background: 'var(--fg-faint)' }} />
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.6875rem',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                fontWeight: 500,
                color: 'var(--accent)',
              }}
            >
              featured
            </span>
          </>
        )}
      </div>
      <h3
        className="transition-colors duration-200"
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: '1.5rem',
          fontWeight: 500,
          lineHeight: 1.3,
          letterSpacing: '-0.015em',
          color: 'var(--fg-primary)',
        }}
      >
        {post.title}
      </h3>
      <p style={{ fontSize: '0.9375rem', lineHeight: 1.75, color: 'var(--fg-secondary)' }}>
        {post.excerpt}
      </p>
      <div className="flex items-center justify-between gap-3 mt-auto pt-2">
        <div className="flex flex-wrap gap-1.5">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 rounded"
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.6875rem',
                background: 'var(--bg-chip)',
                color: 'var(--fg-muted)',
                border: '1px solid var(--border-hairline)',
              }}
            >
              {tag}
            </span>
          ))}
        </div>
        <span
          className="shrink-0 transition-colors duration-200 inline-flex items-center gap-1"
          style={{ color: 'var(--fg-muted)' }}
        >
          <ArrowUpRight size={14} />
        </span>
      </div>
    </div>
  );

  return (
    <SpotlightCard
      variant="glass"
      className="p-6"
      style={post.featured ? { border: '1px solid var(--border-accent)' } : undefined}
    >
      {post.external ? (
        <a href={post.href} target="_blank" rel="noreferrer noopener" className="no-underline">
          {inner}
        </a>
      ) : (
        <Link to={post.href} className="no-underline">
          {inner}
        </Link>
      )}
    </SpotlightCard>
  );
}

function SkeletonRow() {
  return (
    <>
      {[0, 1].map((i) => (
        <div
          key={'skel-' + i}
          className="p-6 rounded-xl"
          style={{
            border: '1px solid var(--border-hairline)',
            background: 'var(--bg-elevated)',
            opacity: 0.6,
            animation: 'parv-blog-skel 1.4s ease-in-out infinite',
          }}
        >
          <div style={{ height: '0.75rem', width: '40%', background: 'var(--bg-chip)', borderRadius: '0.25rem', marginBottom: '0.9rem' }} />
          <div style={{ height: '1.2rem', width: '85%', background: 'var(--bg-chip)', borderRadius: '0.25rem', marginBottom: '0.6rem' }} />
          <div style={{ height: '0.6rem', width: '95%', background: 'var(--bg-chip)', borderRadius: '0.25rem', marginBottom: '0.4rem' }} />
          <div style={{ height: '0.6rem', width: '70%', background: 'var(--bg-chip)', borderRadius: '0.25rem' }} />
        </div>
      ))}
      <style>{`
        @keyframes parv-blog-skel {
          0%, 100% { opacity: 0.45; }
          50%      { opacity: 0.75; }
        }
        @media (prefers-reduced-motion: reduce) {
          @keyframes parv-blog-skel { 0%,100% { opacity: 0.6; } 50% { opacity: 0.6; } }
        }
      `}</style>
    </>
  );
}

function formatDate(input: string): string {
  if (!input) return '';
  const m = input.match(/^(\d{4}-\d{2}-\d{2})/);
  return m ? m[1] : input;
}

function TagChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="px-3 py-1.5 rounded-lg cursor-pointer transition-all duration-200 bg-transparent"
      style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '0.75rem',
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        border: '1px solid ' + (active ? 'var(--border-accent)' : 'var(--border-hairline)'),
        color: active ? 'var(--accent)' : 'var(--fg-muted)',
        background: active ? 'var(--accent-soft)' : 'transparent',
      }}
    >
      {label}
    </button>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span style={{ fontSize: '0.8125rem', color: 'var(--fg-muted)' }}>{label}</span>
      <span
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.8125rem',
          fontWeight: 500,
          color: 'var(--fg-primary)',
        }}
      >
        {value}
      </span>
    </div>
  );
}
