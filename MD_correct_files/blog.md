# MASTER PROMPT — Blog Page Upgrade (Live Multi-Platform + Floating Mobile Pill)

> Paste this entire file as the prompt into a fresh Claude/Cowork session that has
> access to this repo. Do not summarise it. Claude must follow every constraint
> verbatim. The goal is a surgical upgrade of the **blog page only** — no other
> page, route, component, style token, theme variable, layout primitive,
> Three.js scene, audio, header, footer, router, or build config may be edited.

---

## 0. Repository context (read this first, do not skip)

- Stack: **React 18 + TypeScript + Vite 6 + Tailwind 4 + React Router 7 + Motion (Framer) + anime.js + MDX**.
- Blog page lives at `src/app/pages/Blog.tsx`.
- Individual post page lives at `src/app/pages/BlogPost.tsx`.
- Local posts are MDX files in `src/content/blog/*.mdx`, aggregated by
  `src/content/blog/index.ts` via `import.meta.glob('./*.mdx', { eager: true })`.
- Post type is exported as `BlogPost` from `src/content/blog/index.ts`.
- Tailwind classes use the v4 syntax; theme variables are CSS custom properties
  (`var(--fg-primary)`, `var(--accent)`, `var(--bg-elevated)`, `var(--border-hairline)`,
  `var(--font-mono)`, `var(--font-serif)`, `var(--accent-soft)`, etc.). Use the
  existing variables only — do not introduce new color literals.
- Reusable primitives already exist: `SpotlightCard`, `Section`, `PageHero`,
  `RevealOnScroll`, `MagneticButton`. Reuse them where natural.
- Reduced-motion: respect `prefers-reduced-motion: reduce` everywhere new
  animation is added (mirror how existing components do it).
- Path alias `@/` resolves to `src/`.

---

## 1. What the user wants (plain English)

1. **Fix mobile/tablet visibility**: on `<lg` screens the right-hand sidebar is
   hidden (`hidden lg:block`), which buries the "Cross-posted on" platform
   profile links. Surface them on small screens — but **not** by simply unhiding
   the sidebar. Surface them through a new floating pill (item 2).

2. **Floating Blog Stats Pill** (mobile + tablet only, hidden ≥ `lg`):
   - Anchored to the right edge of the viewport, vertically centered-ish
     (around `top: 45%`) so it never collides with the page header, the
     command-palette FAB, or the footer.
   - Collapsed state: a small vertical pill, ~44 px wide, showing a book icon
     stacked above the **total live post count** (local MDX + Hashnode + Dev.to
     + Medium combined). Tap target ≥ 44×44 px.
   - Expanded state (on tap): slides out into a card showing:
     - Heading: "Where I write"
     - Per-platform rows, each with platform name, live count for that platform,
       and a link to the **profile page** (not to a single post). Example:
       `Hashnode · 5 posts · @parvagarwal →`
     - A "View all" footer link that scrolls to the post list on the same page.
     - A close (X) button.
   - Dismisses on: tap on X, tap outside the card, `Escape` key, route change.
   - Animation: spring slide-in from the right via Motion; respects
     reduced-motion (instant fade instead of slide if reduced-motion).
   - Accessible: `role="dialog"` when open, focus trapped, `aria-expanded` on
     the trigger, `aria-label` on the trigger ("Blog stats, N posts").
   - Hidden on `lg:` and up using `lg:hidden`.
   - Z-index sits above page content but below the global command palette
     overlay (use `z-40`).

3. **Live multi-platform aggregation** (free, no backend, no extra build step):
   - Fetch posts at runtime from:
     - **Hashnode** (free GraphQL at `https://gql.hashnode.com`)
     - **Dev.to** (free REST at `https://dev.to/api/articles?username=...`)
     - **Medium** (RSS via the free public bridge
       `https://api.rss2json.com/v1/api.json?rss_url=https://medium.com/feed/@USERNAME`
       — no API key, CORS-enabled)
   - Local MDX posts **must keep working unchanged**. They are the source of
     truth for anything authored in this repo.
   - All four sources merge into a single sorted list (newest first).
   - Visitor sees **live data** on each visit, with localStorage caching to
     avoid hammering APIs. Cache key per source, TTL = 15 minutes, with a
     stale-while-revalidate pattern (render cached immediately, refetch in
     background, swap when ready).
   - On network failure for any source: silently fall back to the cached value
     (if any) and otherwise omit that source. Never block the page. Local MDX
     posts must always render even if every external call fails.
   - No new heavy runtime dependencies. Use native `fetch`. Do **not** install
     any new npm package unless absolutely necessary; if you must, justify it
     in a comment and keep it tiny (< 10 kB gzipped).

4. **Medium paywall handling** (some Medium posts are members-only, some aren't):
   - Medium RSS exposes a `categories` array. If it contains a tag matching
     `/members?[ -_]?only/i` or the post URL contains `?source=...` patterns
     known to indicate paywall, mark `paywalled: true`.
   - Also support a manual override file: `src/content/blog/paywalled-slugs.ts`
     exporting `export const PAYWALLED_MEDIUM_SLUGS: string[] = [...]`. Any
     Medium post whose URL slug appears here is forced `paywalled: true`.
   - When rendering a paywalled post card, show a small uppercase mono badge
     reading `MEMBER-ONLY` next to the date, using `var(--fg-muted)` text and
     `var(--border-hairline)` border. Do not block the link — visitors click
     through to Medium and Medium handles the paywall.

5. **External post cards behave like local cards** visually, but:
   - The card link goes to the **external URL** (open in new tab,
     `rel="noreferrer noopener"`), not to `/blog/:slug`.
   - Show a small platform label in the card meta row:
     `HASHNODE` / `DEV.TO` / `MEDIUM` (mono, uppercase, `var(--fg-muted)`).
   - Local MDX cards continue to link internally to `/blog/:slug` and show no
     platform label (or show `LOCAL` only if it helps — your call, but be
     consistent).

6. **Tag filtering still works** across the merged set. External tags coming
   from each API get normalized (lowercased, trimmed) before being merged into
   the existing tag list so duplicates collapse.

7. **Writing Stats card** in the desktop sidebar updates to show:
   - Total Posts: combined count
   - Topics: combined tag count
   - Optional new row: "Platforms · 4" (or however many are configured)

8. **Cross-posted on card** in the desktop sidebar updates to be **driven by
   the same config** as the floating pill (single source of truth — see §3).

---

## 2. Hard constraints (do not violate)

- ✅ Touch only:
  - `src/app/pages/Blog.tsx`
  - `src/content/blog/index.ts`
  - **NEW** files inside `src/app/components/blog/` and `src/lib/blog/` and
    `src/content/blog/`.
- 🚫 Do **not** modify any of:
  - `src/app/pages/BlogPost.tsx` (must keep rendering local MDX posts)
  - `src/app/pages/Home.tsx`, `About.tsx`, `Projects.tsx`, `Playground.tsx`,
    `Contact.tsx`, `NotFound.tsx`, `retro/`
  - `src/app/components/layout/*`, `system/*`, `cards/*`, `home/*`,
    `playground/*`, `timeline/*`
  - `src/app/theme/*`, `src/app/routes.ts`
  - `src/three/*`, `src/audio/*`, `src/styles/*`
  - `src/main.tsx`, `index.html`, `vite.config.ts`, `tsconfig*.json`,
    `package.json` (unless installing is unavoidable — see §1.3), `netlify.toml`
- 🚫 Do not change existing CSS variables, theme tokens, fonts, or global
  layout primitives.
- 🚫 Do not add or remove any route.
- 🚫 Do not change the existing MDX pipeline or the shape of the local
  `BlogPost` type beyond **purely additive** optional fields.
- 🚫 Do not introduce a service worker, SSR, or build-time fetch script.
- 🚫 Do not use environment variables that require a `.env` file the user has
  to create. All API endpoints used must be callable anonymously.
- ✅ TypeScript strict — no `any` unless narrowly scoped with a comment.
- ✅ Must pass `npm run typecheck` and `npm run build` with zero new errors.
- ✅ Bundle impact: target < 10 kB gzipped added to the blog route. No new
  dependency unless strictly required.

---

## 3. File-by-file specification

### 3.1 NEW — `src/content/blog/sources.config.ts`

Single source of truth for which external accounts to pull from. Pure data,
no logic. Shape:

```ts
export type ExternalSource =
  | { kind: 'hashnode'; host: string;     profileUrl: string; displayName: string }
  | { kind: 'devto';    username: string; profileUrl: string; displayName: string }
  | { kind: 'medium';   username: string; profileUrl: string; displayName: string };

export const EXTERNAL_SOURCES: ExternalSource[] = [
  { kind: 'hashnode', host: 'parvagarwal.hashnode.dev', profileUrl: 'https://hashnode.com/@parvagarwal', displayName: '@parvagarwal' },
  { kind: 'devto',    username: 'parvagarwal',         profileUrl: 'https://dev.to/parvagarwal',         displayName: '@parvagarwal' },
  { kind: 'medium',   username: 'parvagarwal',         profileUrl: 'https://medium.com/@parvagarwal',    displayName: '@parvagarwal' },
];
```

> The user (Parv) will edit the actual handles/hosts after the feature ships.
> Leave the placeholder values above as defaults but add a `// TODO: confirm`
> comment beside each.

### 3.2 NEW — `src/content/blog/paywalled-slugs.ts`

```ts
// Manual override: Medium post slugs that are members-only.
// Slug = the part of the URL between '/p/' or '/<title>-' and the trailing id,
// or just the last path segment of the canonical URL. Add lowercase strings.
export const PAYWALLED_MEDIUM_SLUGS: string[] = [];
```

### 3.3 NEW — `src/lib/blog/types.ts`

```ts
export type UnifiedPost = {
  id: string;                 // unique across all sources, used as React key
  slug: string;               // for local: filename; for external: full URL
  title: string;
  excerpt: string;
  date: string;               // ISO-ish, sortable lexicographically
  readTime: string;
  tags: string[];
  featured?: boolean;
  source: 'local' | 'hashnode' | 'devto' | 'medium';
  href: string;               // internal /blog/:slug for local, absolute URL for external
  external: boolean;
  paywalled?: boolean;
  platformLabel?: string;     // 'HASHNODE' | 'DEV.TO' | 'MEDIUM'
};
```

### 3.4 NEW — `src/lib/blog/cache.ts`

Tiny localStorage wrapper:

```ts
type Entry<T> = { data: T; ts: number };
const TTL_MS = 15 * 60 * 1000;

export function readCache<T>(key: string): { data: T | null; fresh: boolean } { ... }
export function writeCache<T>(key: string, data: T): void { ... }
```

- Wrap all `localStorage` access in `try/catch` (SSR-safe / privacy-mode safe).
- `fresh = (Date.now() - ts) < TTL_MS`.
- Namespace keys: `parv.blog.cache.v1.<sourceKind>.<identifier>`.

### 3.5 NEW — `src/lib/blog/fetchers.ts`

Three functions, each returns `Promise<UnifiedPost[]>`. All must:
- Be wrapped in try/catch and return `[]` on any failure.
- Use a 6-second `AbortController` timeout.
- Normalize `tags` to lowercase trimmed strings.
- Compute a sensible `readTime` ("N min") from body length when the API
  doesn't supply one (assume 200 wpm).
- Compute `excerpt` (max 180 chars, strip HTML/markdown).
- Skip posts older than 5 years (sanity guard).

**Hashnode** (`fetchHashnode(host: string)`):
- POST `https://gql.hashnode.com` with body:
  ```graphql
  query Posts($host: String!) {
    publication(host: $host) {
      posts(first: 20) {
        edges { node {
          id slug title brief publishedAt readTimeInMinutes
          tags { name } url
        } }
      }
    }
  }
  ```
- Map each edge to `UnifiedPost` with `source: 'hashnode'`, `external: true`,
  `href: node.url`, `platformLabel: 'HASHNODE'`.

**Dev.to** (`fetchDevTo(username: string)`):
- GET `https://dev.to/api/articles?username=${username}&per_page=20`.
- Map fields: `id`, `slug`, `title`, `description`, `published_at` → date,
  `reading_time_minutes`, `tag_list`, `url`. `source: 'devto'`,
  `platformLabel: 'DEV.TO'`.

**Medium** (`fetchMedium(username: string)`):
- GET `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent('https://medium.com/feed/@' + username)}`.
- Map `items[]`: `guid` → id, `link` → href, `title`, `pubDate` → date,
  `description` → excerpt (strip HTML), `categories` → tags.
- Paywall detection:
  - `paywalled = categories.some(c => /members?[ -_]?only/i.test(c))`
  - OR `PAYWALLED_MEDIUM_SLUGS` includes the last path segment of the link.
- `platformLabel: 'MEDIUM'`.

### 3.6 NEW — `src/lib/blog/aggregate.ts`

```ts
export type LoadState = {
  posts: UnifiedPost[];
  loading: boolean;
  perSource: Record<UnifiedPost['source'], number>;
  errored: UnifiedPost['source'][];
};

export function useUnifiedPosts(localPosts: UnifiedPost[]): LoadState { ... }
```

Behavior:
1. Immediately return `{ posts: localPosts + cachedExternal, loading: true }`.
2. Kick off `Promise.allSettled` against all configured external sources.
3. For each settled result: write to cache, update state.
4. Final state: `loading: false`, `errored: [sources that failed and had no cache]`.
5. Always sort newest-first by `date`.
6. Dedupe by `id`.

### 3.7 NEW — `src/app/components/blog/PlatformBadge.tsx`

Small presentational component: renders `HASHNODE` / `DEV.TO` / `MEDIUM` /
`MEMBER-ONLY` chips. Mono, uppercase, 0.6875rem, `var(--fg-muted)` text,
`var(--border-hairline)` border, no fill. Accepts `variant` prop.

### 3.8 NEW — `src/app/components/blog/FloatingBlogStats.tsx`

The mobile/tablet floating pill described in §1.2.

Skeleton:

```tsx
'use client';
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { BookOpen, X, ExternalLink } from 'lucide-react';
import { EXTERNAL_SOURCES } from '@/content/blog/sources.config';
import type { LoadState } from '@/lib/blog/aggregate';

export function FloatingBlogStats({ state }: { state: LoadState }) { ... }
```

Requirements:
- Outer wrapper: `<div className="lg:hidden fixed right-3 top-[45%] -translate-y-1/2 z-40">`.
- Collapsed button:
  - `aria-expanded`, `aria-controls="blog-stats-panel"`,
    `aria-label={`Blog stats, ${total} posts`}`.
  - Background: `var(--bg-elevated)`, border `1px solid var(--border-hairline)`,
    border-radius 999px, padding `0.6rem 0.45rem`.
  - Content: `<BookOpen size={16} />` above a number in mono font.
  - Subtle pulsing ring while `state.loading` (CSS animation, respect
    reduced-motion).
- Expanded panel:
  - Width clamp `min(86vw, 320px)`.
  - Use Motion: `initial={{ opacity: 0, x: 24, scale: 0.96 }}` →
    `animate={{ opacity: 1, x: 0, scale: 1 }}`, spring stiffness ~300 damping ~30.
  - Inside: heading, list of rows (Local + each `EXTERNAL_SOURCES` entry with
    its live count from `state.perSource`), close button, "View all" link that
    scrolls to `#blog-posts-list` (the post list `<div>` in `Blog.tsx` must
    receive that id).
  - Each row: name on left, count + chevron on right, entire row is a link
    (`<a target="_blank" rel="noreferrer noopener">`) to `profileUrl`.
  - Errored sources show a tiny `var(--fg-faint)` "—" instead of count and are
    not clickable.
- Close on: X button, outside click (`useRef` + `pointerdown` listener),
  `Escape` keydown, route change (`useLocation` from `react-router`).
- Focus management: when opening, move focus to the close button; when
  closing, return focus to the trigger.
- Reduced motion: replace slide/spring with a 120 ms opacity fade.

### 3.9 MODIFY — `src/content/blog/index.ts`

Additive only. Keep `loadPosts()` and `findPost()` exactly as they are
(BlogPost.tsx depends on them). Add:

```ts
import type { UnifiedPost } from '@/lib/blog/types';

export function loadLocalUnified(): UnifiedPost[] {
  return loadPosts().map((p) => ({
    id: `local:${p.slug}`,
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt,
    date: p.date,
    readTime: p.readTime,
    tags: p.tags.map((t) => t.trim()),
    featured: p.featured,
    source: 'local',
    href: `/blog/${p.slug}`,
    external: false,
  }));
}
```

The original `BlogPost` type and `Component` field stay intact — `BlogPost.tsx`
keeps using `findPost(slug)` unchanged.

### 3.10 MODIFY — `src/app/pages/Blog.tsx`

Changes:
1. Replace the source of truth: instead of `loadPosts()`, call
   `useUnifiedPosts(loadLocalUnified())`. Use the returned `posts` list in
   place of the old `posts`.
2. Render an extra meta row item in each card:
   - If `post.external`, show a `<PlatformBadge variant={post.platformLabel} />`.
   - If `post.paywalled`, also show `<PlatformBadge variant="MEMBER-ONLY" />`.
3. Card link logic:
   - If `post.external`: render `<a href={post.href} target="_blank" rel="noreferrer noopener">` instead of `<Link to={...}>`.
   - Else: keep `<Link to={post.href}>`.
4. Add `id="blog-posts-list"` to the `<div className="lg:col-span-8 ...">`
   wrapper so the floating pill's "View all" link can scroll to it.
5. Update the desktop "Cross-posted on" `SpotlightCard` to map over
   `EXTERNAL_SOURCES` (single source of truth), each row showing
   `displayName` and the per-source live count from `state.perSource`.
6. Update "Writing Stats": Total Posts uses combined count, Topics uses
   combined deduped tag count, add a new "Platforms" row equal to the number
   of sources currently returning ≥ 1 post (local always counts).
7. Mount `<FloatingBlogStats state={state} />` once at the bottom of the
   returned tree (still inside the page root `<div>`).
8. Loading UX: when `state.loading` and `posts.length === localCount`, render
   2–3 skeleton cards beneath the local posts (pulsing `var(--bg-elevated)`
   blocks, no shimmer libraries — pure CSS via inline style + Tailwind).
9. Empty state copy unchanged.
10. Keep all existing animations, the `PageHero`, `Section`, mobile filter
    drawer, tag chips, and `SpotlightCard` usage. Do not restructure the grid.

### 3.11 Anything not listed above

Do not touch. If a change feels necessary outside this scope, **stop and ask
the user first** in a single concise question. Do not assume permission.

---

## 4. Acceptance criteria (the upgrade is "done" only when all of these pass)

- [ ] `npm run typecheck` passes with zero errors.
- [ ] `npm run build` succeeds, output bundle for the blog route grows by
      < 12 kB gzipped vs main.
- [ ] On a fresh browser session, opening `/blog` shows local MDX posts
      instantly (before any network response).
- [ ] Within ~2 s, external posts from Hashnode, Dev.to, and Medium appear
      and merge into the sorted list, newest first.
- [ ] Disabling network (DevTools offline) on second visit still shows all
      previously cached posts.
- [ ] Killing the Medium API specifically (block `api.rss2json.com` in
      DevTools) still shows local + Hashnode + Dev.to posts; the Medium row
      in the floating pill shows "—" and is non-clickable; no console error
      escapes (it's logged via `console.warn`, not `throw`).
- [ ] On viewport widths < 1024 px:
  - The post cards are visible and tappable (regression check).
  - The floating pill is visible on the right edge.
  - Tapping it opens the panel; tapping outside, X, or pressing Esc closes it.
  - All three external profile links open in a new tab to the correct URLs.
- [ ] On viewport widths ≥ 1024 px:
  - The floating pill is **not** rendered (`lg:hidden` works).
  - The desktop "Cross-posted on" card lists all three platforms with live
    counts.
- [ ] A Medium post listed in `PAYWALLED_MEDIUM_SLUGS` shows a `MEMBER-ONLY`
      badge next to its date in the card.
- [ ] Tag filter chips include normalized tags from all four sources; clicking
      a tag filters the merged list correctly.
- [ ] `prefers-reduced-motion: reduce` removes spring/slide animation from the
      floating pill (only opacity fade remains).
- [ ] No other page in the app has any visual or behavior change.
      Specifically verify: Home, About, Projects, **BlogPost (single post
      view)**, Playground, Contact, NotFound, /retro.
- [ ] No new top-level npm dependency unless §1.3 was unavoidable and
      justified in a comment in `package.json`'s nearest related file.

---

## 5. Execution order (do not deviate)

1. Create `src/lib/blog/types.ts`.
2. Create `src/lib/blog/cache.ts`.
3. Create `src/content/blog/sources.config.ts`.
4. Create `src/content/blog/paywalled-slugs.ts`.
5. Create `src/lib/blog/fetchers.ts`.
6. Create `src/lib/blog/aggregate.ts`.
7. Edit `src/content/blog/index.ts` — additive `loadLocalUnified` only.
8. Create `src/app/components/blog/PlatformBadge.tsx`.
9. Create `src/app/components/blog/FloatingBlogStats.tsx`.
10. Edit `src/app/pages/Blog.tsx` — wire everything up.
11. Run `npm run typecheck`. Fix all errors before moving on.
12. Run `npm run build`. Confirm success.
13. Manually verify `/blog/:slug` still renders a local MDX post (e.g.
    `/blog/lcu-and-trotterization`). If it doesn't, you broke a constraint;
    revert and try again.
14. Report a concise change summary listing each file created/modified, the
    final typecheck + build status, and any deviations (there should be none).

---

## 6. Style & code-quality rules

- Match the existing code style in `Blog.tsx`: inline styles using CSS
  variables for color/typography, Tailwind for layout/spacing/responsive.
- No new global CSS; reuse existing variables.
- All new components are functional + hooks, no classes.
- All event listeners added in `useEffect` are cleaned up.
- All `fetch` calls have abortable timeouts; no unhandled promise rejections.
- Use `Motion`'s `AnimatePresence` for mount/unmount transitions (the rest of
  the codebase does — e.g. the mobile filter drawer in `Blog.tsx`).
- Icons come from `lucide-react` only (already in dependencies).
- Keep functions small (< 60 lines) and components readable.
- Add a short JSDoc block at the top of each new file describing its purpose.

---

## 7. Out-of-scope wishlist (do NOT implement, only note in your summary)

- Build-time pre-fetch via a Node script.
- Server-side caching via Netlify Functions.
- Search bar inside the blog page.
- View counts, likes, or comments.
- RSS feed generation for this site.

End of master prompt.
