/**
 * Tiny localStorage cache for the blog aggregator.
 *
 * TTL is intentionally short (5 minutes) so a newly-published external post
 * shows up on the very next page visit instead of waiting for a slow stale
 * window. The KEY_PREFIX is versioned ("v2"); bump it whenever you change the
 * UnifiedPost shape or want every existing visitor to refetch on next load.
 */

type Entry<T> = { data: T; ts: number };

const TTL_MS = 5 * 60 * 1000;
const KEY_PREFIX = 'parv.blog.cache.v6';

function safeGet(): Storage | null {
  try {
    if (typeof window === 'undefined') return null;
    return window.localStorage;
  } catch {
    return null;
  }
}

function makeKey(kind: string, identifier: string): string {
  return KEY_PREFIX + '.' + kind + '.' + identifier;
}

export function readCache<T>(
  kind: string,
  identifier: string
): { data: T | null; fresh: boolean } {
  const ls = safeGet();
  if (!ls) return { data: null, fresh: false };
  try {
    const raw = ls.getItem(makeKey(kind, identifier));
    if (!raw) return { data: null, fresh: false };
    const parsed = JSON.parse(raw) as Entry<T>;
    if (!parsed || typeof parsed.ts !== 'number') {
      return { data: null, fresh: false };
    }
    const fresh = Date.now() - parsed.ts < TTL_MS;
    return { data: parsed.data, fresh };
  } catch {
    return { data: null, fresh: false };
  }
}

export function writeCache<T>(kind: string, identifier: string, data: T): void {
  const ls = safeGet();
  if (!ls) return;
  try {
    const entry: Entry<T> = { data, ts: Date.now() };
    ls.setItem(makeKey(kind, identifier), JSON.stringify(entry));
  } catch {
    // Quota exceeded or serialization error — ignore.
  }
}
