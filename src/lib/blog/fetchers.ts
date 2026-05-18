/**
 * Runtime fetchers for external blog feeds. Each returns Promise<UnifiedPost[]>
 * and never throws — failures/timeouts/malformed payloads resolve to [].
 */

import { PAYWALLED_MEDIUM_SLUGS } from './paywalled-slugs';
import type { UnifiedPost } from './types';

const TIMEOUT_MS = 6000;
const FIVE_YEARS_MS = 5 * 365 * 24 * 60 * 60 * 1000;
const WPM = 200;

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
    } else if (t && typeof t === 'object' && 'name' in (t as Record<string, unknown>)) {
      const name = (t as { name?: unknown }).name;
      if (typeof name === 'string') {
        const v = name.trim().toLowerCase();
        if (v) out.push(v);
      }
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
    const u = new URL(url);
    const parts = u.pathname.split('/').filter(Boolean);
    return (parts[parts.length - 1] || '').toLowerCase();
  } catch {
    return '';
  }
}

type HashnodeEdgeNode = {
  id: string;
  slug: string;
  title: string;
  brief?: string;
  publishedAt: string;
  readTimeInMinutes?: number;
  tags?: Array<{ name: string }>;
  url: string;
};

export async function fetchHashnode(host: string): Promise<UnifiedPost[]> {
  const { signal, clear } = withTimeout();
  try {
    const res = await fetch('https://gql.hashnode.com', {
      method: 'POST',
      signal,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: 'query Posts($host: String!) { publication(host: $host) { posts(first: 20) { edges { node { id slug title brief publishedAt readTimeInMinutes tags { name } url } } } } }',
        variables: { host },
      }),
    });
    if (!res.ok) throw new Error('hashnode http ' + res.status);
    const json = (await res.json()) as {
      data?: { publication?: { posts?: { edges?: Array<{ node: HashnodeEdgeNode }> } } };
    };
    const edges = json?.data?.publication?.posts?.edges ?? [];
    return edges
      .map(({ node }) => {
        if (!node?.url || !node?.publishedAt || !isRecent(node.publishedAt)) return null;
        return {
          id: 'hashnode:' + node.id,
          slug: node.slug,
          title: node.title,
          excerpt: makeExcerpt(node.brief ?? ''),
          date: node.publishedAt,
          readTime: readTimeFromBody(node.brief ?? '', node.readTimeInMinutes),
          tags: normalizeTags(node.tags ?? []),
          source: 'hashnode',
          href: node.url,
          external: true,
          platformLabel: 'HASHNODE',
        } as UnifiedPost;
      })
      .filter((p): p is UnifiedPost => p !== null);
  } catch (e) {
    console.warn('[blog] hashnode fetch failed', e);
    return [];
  } finally {
    clear();
  }
}

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
    const url = 'https://dev.to/api/articles?username=' + encodeURIComponent(username) + '&per_page=20';
    const res = await fetch(url, { signal, headers: { Accept: 'application/json' } });
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
    const url = 'https://api.rss2json.com/v1/api.json?rss_url=' + encodeURIComponent(feed);
    const res = await fetch(url, { signal });
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
