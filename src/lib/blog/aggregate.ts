/**
 * useUnifiedPosts: merges local MDX posts with live external feeds.
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { EXTERNAL_SOURCES } from './sources.config';
import { readCache, writeCache } from './cache';
import { fetchDevTo, fetchHashnode, fetchMedium } from './fetchers';
import type { UnifiedPost, UnifiedPostSource } from './types';

export type LoadState = {
  posts: UnifiedPost[];
  loading: boolean;
  perSource: Record<UnifiedPostSource, number>;
  errored: UnifiedPostSource[];
};

const SOURCE_KEYS: UnifiedPostSource[] = ['local', 'hashnode', 'devto', 'medium'];

function emptyPerSource(): Record<UnifiedPostSource, number> {
  return SOURCE_KEYS.reduce(
    (acc, k) => {
      acc[k] = 0;
      return acc;
    },
    {} as Record<UnifiedPostSource, number>
  );
}

function sortDedupe(posts: UnifiedPost[]): UnifiedPost[] {
  const seen = new Set<string>();
  const unique: UnifiedPost[] = [];
  for (const p of posts) {
    if (seen.has(p.id)) continue;
    seen.add(p.id);
    unique.push(p);
  }
  unique.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  return unique;
}

function tallyPerSource(posts: UnifiedPost[]): Record<UnifiedPostSource, number> {
  const acc = emptyPerSource();
  for (const p of posts) acc[p.source] += 1;
  return acc;
}

type SourceLoad = { posts: UnifiedPost[]; errored: boolean };

function readCachedFor(source: UnifiedPostSource, identifier: string): UnifiedPost[] {
  const { data } = readCache<UnifiedPost[]>(source, identifier);
  return Array.isArray(data) ? data : [];
}

async function fetchSource(
  src: (typeof EXTERNAL_SOURCES)[number]
): Promise<SourceLoad> {
  try {
    if (src.kind === 'hashnode') {
      const posts = await fetchHashnode(src.host);
      return { posts, errored: posts.length === 0 };
    }
    if (src.kind === 'devto') {
      const posts = await fetchDevTo(src.username);
      return { posts, errored: posts.length === 0 };
    }
    const posts = await fetchMedium(src.username);
    return { posts, errored: posts.length === 0 };
  } catch {
    return { posts: [], errored: true };
  }
}

function identifierOf(src: (typeof EXTERNAL_SOURCES)[number]): string {
  return src.kind === 'hashnode' ? src.host : src.username;
}

export function useUnifiedPosts(localPosts: UnifiedPost[]): LoadState {
  const initialCached = useMemo<UnifiedPost[]>(() => {
    const out: UnifiedPost[] = [];
    for (const src of EXTERNAL_SOURCES) {
      out.push(...readCachedFor(src.kind, identifierOf(src)));
    }
    return out;
  }, []);

  const [externalPosts, setExternalPosts] = useState<UnifiedPost[]>(initialCached);
  const [loading, setLoading] = useState<boolean>(true);
  const [errored, setErrored] = useState<UnifiedPostSource[]>([]);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    let cancelled = false;

    (async () => {
      const results = await Promise.allSettled(
        EXTERNAL_SOURCES.map((src) => fetchSource(src))
      );
      if (cancelled || !mountedRef.current) return;

      const next: UnifiedPost[] = [];
      const failed: UnifiedPostSource[] = [];

      results.forEach((r, i) => {
        const src = EXTERNAL_SOURCES[i];
        if (r.status === 'fulfilled') {
          if (r.value.posts.length > 0) {
            next.push(...r.value.posts);
            writeCache(src.kind, identifierOf(src), r.value.posts);
          } else {
            const cached = readCachedFor(src.kind, identifierOf(src));
            if (cached.length > 0) {
              next.push(...cached);
            } else {
              failed.push(src.kind);
            }
          }
        } else {
          const cached = readCachedFor(src.kind, identifierOf(src));
          if (cached.length > 0) {
            next.push(...cached);
          } else {
            failed.push(src.kind);
          }
        }
      });

      setExternalPosts(next);
      setErrored(failed);
      setLoading(false);
    })();

    return () => {
      cancelled = true;
      mountedRef.current = false;
    };
  }, []);

  return useMemo(() => {
    const merged = sortDedupe([...localPosts, ...externalPosts]);
    return {
      posts: merged,
      loading,
      perSource: tallyPerSource(merged),
      errored,
    };
  }, [localPosts, externalPosts, loading, errored]);
}
