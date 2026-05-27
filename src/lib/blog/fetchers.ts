/**
 * Runtime fetchers for external blog feeds. Each returns Promise<UnifiedPost[]>
 * and never throws — failures/timeouts/malformed payloads resolve to [].
 *
 * Production routes Dev.to and Medium through same-origin Netlify proxies
 * (/api/blog/...) so the browser doesn't issue cross-origin requests. Local
 * dev hits upstreams directly. See netlify.toml for the proxy rules.
 *
 * Hashnode: not fetched at runtime. Hashnode retired free GraphQL API access
 * on 2026-05-13 and their RSS feeds sit behind a Cloudflare bot challenge.
 * Hashnode posts come from a hand-maintained file at
 * src/content/blog/hashnode-posts.ts — edit that file when you publish.
 */

import { PAYWALLED_MEDIUM_SLUGS } from './paywalled-slugs';
import { HASHNODE_POSTS } from '@/content/blog/hashnode-posts';
import type { UnifiedPost } from './types';

const TIMEOUT_MS = 8000;
const FIVE_YEARS_MS = 5 * 365 * 24 * 60 * 60 * 1000;
const WPM = 200;

function isLocalhost(): boolean {
  if (typeof window === 'undefined') return false;
  const h = window.location.hostname;
  return h === 'localhost' || h === '127.0.0.1' || h.endsWith('.local');
}

function endpoint(kind: 'devto' | 'medium'): string {
  if (isLocalhost()) {
    if (kind === 'devto') return 'https://dev.to/api/articles';
    return 'https://api.rss2json.com/v1/api.json';
  }
  if (kind === 'devto') return '/api/blog/devto';
  return '/api/blog/medium';
}

function withTimeout(): { signal: AbortSignal; clear: () => void } {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  return { signal: ctrl.signal, clear: () => clearTimeout(t) };
}

function stripHtml(input: string): string {
  return input
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function makeExcerpt(text: string, max = 180): string {
  const cleaned = stripHtml(text);
  if (cleaned.length <= max) return cleaned;
  return cleaned.slice(0, max - 1).trimEnd() + '...';
}

function normalizeTags(tags: unknown): string[] {
  if (!Array.isArray(tags)) return [];
  const out: string[] = [];
  for (const t of tags) {
    if (typeof t === 'string') {
      const v = t.trim().toLowerCase();
      if (v) out.push(v);
    }
  }
  return Array.from(new Set(out));
}

function readTimeFromBody(text: string, fallback?: number): string {
  if (typeof fallback === 'number' && fallback > 0) {
    return Math.max(1, Math.round(fallback)) + ' min';
  }
  const words = stripHtml(text).split(/\s+/).filter(Boolean).length;
  const mins = Math.max(1, Math.round(words / WPM));
  return mins + ' min';
}

function isRecent(iso: string): boolean {
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return false;
  return Date.now() - t < FIVE_YEARS_MS;
}

function urlSlug(url: string): string {
  try {
    const u = new URL(url, 'https://example.com');
    const parts = u.pathname.split('/').filter(Boolean);
    return (parts[parts.length - 1] || '').toLowerCase();
  } catch {
    return '';
  }
}

// ---------------------------------------------------------------------------
// Hashnode — manual list (Hashnode killed free API access on 2026-05-13).
// Returns immediately; not a real fetch but keeps the call-site symmetric.
// ---------------------------------------------------------------------------

export async function fetchHashnode(_host: string): Promise<UnifiedPost[]> {
  return HASHNODE_POSTS.filter((p) => isRecent(p.date)).map((p) => ({
    id: 'hashnode:' + p.id,
    slug: p.id,
    title: p.title,
    excerpt: p.excerpt,
    date: p.date,
    readTime: p.readTime,
    tags: normalizeTags(p.tags),
    source: 'hashnode',
    href: p.url,
    external: true,
    paywalled: p.paywalled === true ? true : undefined,
    platformLabel: 'HASHNODE',
  }));
}

// ---------------------------------------------------------------------------
// Dev.to
// ---------------------------------------------------------------------------

type DevToArticle = {
  id: number;
  slug: string;
  title: string;
  description: string;
  published_at: string;
  reading_time_minutes?: number;
  tag_list?: string[];
  url: string;
};

export async function fetchDevTo(username: string): Promise<UnifiedPost[]> {
  const { signal, clear } = withTimeout();
  try {
    const base = endpoint('devto');
    const sep = base.includes('?') ? '&' : '?';
    const url =
      base + sep +
      'username=' + encodeURIComponent(username) +
      '&per_page=20&_t=' + Date.now();
    const res = await fetch(url, { signal, cache: 'no-store' });
    if (!res.ok) throw new Error('devto http ' + res.status);
    const items = (await res.json()) as DevToArticle[];
    if (!Array.isArray(items)) return [];
    return items
      .map((a) => {
        if (!a?.url || !a?.published_at || !isRecent(a.published_at)) return null;
        return {
          id: 'devto:' + a.id,
          slug: a.slug,
          title: a.title,
          excerpt: makeExcerpt(a.description ?? ''),
          date: a.published_at,
          readTime: readTimeFromBody(a.description ?? '', a.reading_time_minutes),
          tags: normalizeTags(a.tag_list ?? []),
          source: 'devto',
          href: a.url,
          external: true,
          platformLabel: 'DEV.TO',
        } as UnifiedPost;
      })
      .filter((p): p is UnifiedPost => p !== null);
  } catch (e) {
    console.warn('[blog] devto fetch failed', e);
    return [];
  } finally {
    clear();
  }
}

// ---------------------------------------------------------------------------
// Medium
// ---------------------------------------------------------------------------

type MediumRssItem = {
  guid?: string;
  link?: string;
  title?: string;
  pubDate?: string;
  description?: string;
  content?: string;
  categories?: string[];
};

const MEMBER_ONLY_RE = /members?[ -_]?only/i;

function detectPaywall(item: MediumRssItem): boolean {
  const cats = Array.isArray(item.categories) ? item.categories : [];
  if (cats.some((c) => typeof c === 'string' && MEMBER_ONLY_RE.test(c))) return true;
  const slug = urlSlug(item.link ?? '');
  if (slug && PAYWALLED_MEDIUM_SLUGS.map((s) => s.toLowerCase()).includes(slug)) {
    return true;
  }
  return false;
}

export async function fetchMedium(username: string): Promise<UnifiedPost[]> {
  const { signal, clear } = withTimeout();
  try {
    const feed = 'https://medium.com/feed/@' + username;
    const base = endpoint('medium');
    const sep = base.includes('?') ? '&' : '?';
    const url =
      base + sep +
      'rss_url=' + encodeURIComponent(feed) +
      '&_t=' + Date.now();
    const res = await fetch(url, { signal, cache: 'no-store' });
    if (!res.ok) throw new Error('medium http ' + res.status);
    const json = (await res.json()) as { items?: MediumRssItem[]; status?: string };
    if (json?.status && json.status !== 'ok') return [];
    const items = json?.items ?? [];
    return items
      .map((item) => {
        if (!item?.link || !item?.pubDate) return null;
        const isoDate = new Date(item.pubDate).toISOString();
        if (!isRecent(isoDate)) return null;
        const body = item.content ?? item.description ?? '';
        const slug = urlSlug(item.link);
        return {
          id: 'medium:' + (item.guid ?? item.link),
          slug,
          title: item.title ?? 'Untitled',
          excerpt: makeExcerpt(item.description ?? ''),
          date: isoDate,
          readTime: readTimeFromBody(body),
          tags: normalizeTags(item.categories ?? []),
          source: 'medium',
          href: item.link,
          external: true,
          paywalled: detectPaywall(item),
          platformLabel: 'MEDIUM',
        } as UnifiedPost;
      })
      .filter((p): p is UnifiedPost => p !== null);
  } catch (e) {
    console.warn('[blog] medium fetch failed', e);
    return [];
  } finally {
    clear();
  }
}
