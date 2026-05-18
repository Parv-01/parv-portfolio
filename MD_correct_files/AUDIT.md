# Executive Summary

This codebase is a Vite client-rendered SPA, not a Next.js/SSR app. That means the main performance problem is not server rendering or hydration bugs, but the amount of JavaScript, WebGL, and media the browser must parse and execute before the page feels usable.

The site’s strongest performance-positive choice is the retro easter egg: `/retro` is correctly lazy-loaded as a sibling route and does not pull its CSS or game assets into the homepage path. That isolation is good.

The biggest real-world bottlenecks are:

1. All top-level routes are statically imported in `src/app/routes.ts`, so route-level code splitting is largely absent.
2. `Layout.tsx` always mounts `GlobalCanvas`, `BootLoader`, `AudioPrimer`, and `CmdKPalette` on every route.
3. `PageHero.tsx` always mounts `MascotViewport`, which brings in `three`, `@react-three/fiber`, `@react-three/drei`, `three-stdlib`, and a 2.1MB GLB model on many routes.
4. `Home.tsx` mounts a second WebGL canvas via `MascotViewport` while `Layout` already mounts `GlobalCanvas`, so the homepage pays for two always-on 3D scenes.
5. `src/content/blog/index.ts` eagerly imports all MDX posts, which turns content into shipped JavaScript.
6. `public/images/logo.png` is about 1.0MB and is used in the header/footer logo path, so a tiny UI element is carrying a huge asset cost.
7. `public/audio/ambient.mp3` is 5.5MB and gets fetched after the first interaction through the global audio system.

The production build confirms the issue: one JS chunk is 1,370.92 kB minified (391.78 kB gzip), which is far above what you want for a high-performing portfolio site.

# Performance Score Estimation

| Metric | Likely Current Score | Why |
| --- | --- | --- |
| Lighthouse Performance | 35-55 mobile, 65-80 desktop | Large initial JS, two WebGL canvases, eager 3D model, external fonts, global animation/runtime work |
| Lighthouse Accessibility | 85-95 | Good semantic structure, labels, reduced-motion support in retro, but decorative canvases and modal focus handling could be stronger |
| Lighthouse Best Practices | 85-95 | Good rel=noopener usage and security headers, but heavy client runtime and large unoptimized public assets reduce score headroom |
| Lighthouse SEO | 70-85 | Metadata is present, but the site is client-rendered, so crawl/render reliability is weaker than SSR/SSG |

Likely Core Web Vitals trend on mid-range mobile:

| Metric | Risk |
| --- | --- |
| LCP | High risk, likely 3.5-6.5s on heavier routes |
| CLS | Low to moderate risk, likely 0.02-0.10 |
| INP | Moderate to high risk, especially on routes with WebGL, hover effects, and global listeners |
| TTFB | Low risk if hosted statically |
| FCP | Moderate to high risk because the first meaningful render waits on JS and fonts |
| TBT | High risk due to parse/compile and continuous animation work |

# Critical Bottlenecks

- `src/app/routes.ts:1-36` statically imports every page component. This defeats route-level code splitting and likely keeps most of the app in the initial bundle.
- `src/app/components/layout/Layout.tsx:67-118` mounts a fixed full-screen `GlobalCanvas`, a global command palette, boot overlay, and audio listeners on every route.
- `src/three/GlobalCanvas.tsx:1-95` creates an always-on WebGL canvas with two animated starfields and a camera drift loop.
- `src/app/components/layout/PageHero.tsx:13-78` mounts `MascotViewport` on every page that uses the shared hero.
- `src/three/MascotViewport.tsx:8, 40-89, 204` pulls in the full 3D stack and calls `useGLTF.preload(MODEL)` at module scope, which eagerly starts loading a 2.1MB GLB.
- `src/content/blog/index.ts:14-37` uses `import.meta.glob(..., { eager: true })`, so all MDX blog posts and their compiled React components are bundled up front.
- `public/images/logo.png` is roughly 1,035,292 bytes and is used by the header/footer logo path, so a small UI element forces a large image transfer.
- `public/audio/ambient.mp3` is 5,481,671 bytes. It is deferred, but once audio is unlocked it becomes a very large secondary payload.

# Route-by-Route Analysis

## `/` Home

- Worst route for runtime cost.
- `src/app/components/layout/Layout.tsx:102-104` mounts `GlobalCanvas` behind the whole app.
- `src/app/pages/Home.tsx:121-142` mounts a second `MascotViewport` in the hero.
- `src/app/pages/Home.tsx:147-248` adds multiple `RevealOnScroll`, `SpotlightCard`, and `AnimatedCounter` instances.
- The page combines two WebGL canvases, motion animations, hover-driven card effects, and several heavy sections.
- This route is the most likely to feel slow on mobile because it hits JS parse, GPU, paint, and input latency all at once.

## `/about`

- `PageHero` loads `MascotViewport`, so the route still pays for the 3D avatar and GLB.
- Timeline and skill cards are visually fine, but they sit on top of the same app-wide `GlobalCanvas`.
- Good content density, but the hero is over-engineered for a content page.

## `/projects`

- Heavier than it looks because it still uses `PageHero` and therefore the 3D hero stack.
- The filter UI is lightweight, but the `motion.div` wrapper around every card adds runtime cost.
- Large project lists will scale linearly in DOM and animation work.

## `/blog`

- `src/content/blog/index.ts:14-37` eagerly bundles all MDX post components and frontmatter.
- The list page itself is fine, but the content architecture scales poorly as more posts are added.
- This route can easily become one of the biggest bundle-growth vectors in the app.

## `/blog/:slug`

- Same eager MDX issue, plus `src/app/components/system/ReadingProgress.tsx:6-19` runs a requestAnimationFrame loop for the progress bar.
- This is not catastrophic, but it is continuous main-thread work on a content page.
- If blog traffic matters, this route deserves a leaner content strategy.

## `/playground`

- Uses `PageHero`, so it inherits the 3D hero cost.
- `src/app/pages/Playground.tsx:105-136` uses `setTimeout` and `setInterval` without cleanup, which is a real stability risk.
- The simulator itself is modest, but it does not need the full 3D hero stack to function.

## `/contact`

- Functionally simple, but it still loads the 3D hero through `PageHero`.
- This is a poor tradeoff for a route whose primary task is a form and contact details.

## `/retro`

- Correctly isolated and lazy-loaded.
- No header, footer, or global canvas inheritance.
- No retro CSS or game assets appear to leak into the main path.
- This route is the healthiest part of the architecture from a performance isolation perspective.

# Bundle Analysis

## Production evidence

- `dist/assets/index-t-6vS0Hl.js` is 1,370.92 kB minified and 391.78 kB gzip.
- `dist/assets/anime.es-DiUdx77N.js` is only 18.09 kB minified and 7.42 kB gzip, which shows the dynamic import pattern is working for anime.
- Vite emitted a warning that some chunks exceed 500 kB.

## Main causes

- `src/app/routes.ts:1-36` imports every route component up front, so route code splitting is mostly lost.
- `src/app/components/layout/Layout.tsx:1-118` imports `GlobalCanvas`, `BootLoader`, and `CmdKPalette` into the root tree.
- `src/app/components/layout/PageHero.tsx:1-82` imports `MascotViewport` directly, so every shared hero route pulls in the 3D stack.
- `src/three/MascotViewport.tsx:1-204` imports `@react-three/fiber`, `@react-three/drei`, `three`, and `three-stdlib`.
- `src/three/GlobalCanvas.tsx:1-95` imports `@react-three/fiber` and `three` again and mounts a second canvas.
- `src/content/blog/index.ts:14-37` eagerly compiles all MDX content into the client bundle.
- `src/app/pages/Home.tsx:1-385` imports multiple motion and system components, plus `MascotViewport` and content arrays.
- `src/app/pages/About.tsx`, `Projects.tsx`, `Blog.tsx`, `Contact.tsx`, and `Playground.tsx` all statically import `PageHero`, so the 3D hero is not route-gated.

## Likely size contributors

- `three`, `@react-three/fiber`, `@react-three/drei`, and `three-stdlib`: major shared cost, likely hundreds of KB minified once combined.
- `motion`: moderate shared cost across multiple pages.
- MDX blog content: small today, but linear growth risk as more posts are added.
- `lucide-react`: usually tree-shakes well, so this is not a primary issue.

## What is already good

- `src/lib/anime.ts:5-9` dynamically imports anime only when needed.
- `/retro` is lazily loaded and isolated.
- The audio system is deferred until interaction rather than autoplayed.

# Hydration Analysis

There is no SSR hydration in this app today. `ReactDOM.createRoot` mounts a client-only SPA, so the real cost is client boot, not hydration mismatch.

Implications:

- There is no server HTML stream to hide the JS cost.
- Every route must execute enough JavaScript before it becomes interactive.
- Any future SSR/SSG migration would need careful handling of browser-only code in `ThemeProvider`, `AudioManager`, `BootLoader`, `GlobalCanvas`, and `MascotViewport`.

Current hydration-like risks are mostly boot-time browser dependencies:

- `src/app/theme/ThemeProvider.tsx:14-42` reads `window`, `document`, and localStorage.
- `src/audio/AudioManager.ts:30-37` initializes global audio state in the browser only.
- `src/app/components/layout/Layout.tsx:10-23` and `:26-61` register global listeners on mount.

# Rendering Analysis

- `src/styles/theme.css:204-237` defines glass surfaces with `backdrop-filter` and translucent backgrounds. These look good, but stacked blur layers are expensive on low-end GPUs.
- `src/app/components/layout/Section.tsx:24-36` applies blur and hairline borders to surface sections, increasing the number of composited layers on long pages.
- `src/app/components/layout/Header.tsx:40-47` and `Footer.tsx:35-41` use fixed translucent backgrounds and blur. That is fine visually, but should stay subtle on mobile.
- `src/app/components/system/SpotlightCard.tsx:25-33` writes CSS variables on every pointer move. On pages with many cards, this becomes a repeated paint trigger.
- `src/app/components/system/ReadingProgress.tsx:6-19` continuously updates `--progress` on every animation frame, even when the user is not scrolling.
- `src/three/GlobalCanvas.tsx:7-15` and `Starfield.tsx:73-80` continuously update the scene every frame.
- `src/three/MascotViewport.tsx:165-193` runs a `useFrame` loop for camera and head motion.

Net effect: the page is visually refined, but it leans heavily on compositor and GPU work that can become battery and thermal noise on mobile.

# Animation Analysis

- `src/three/GlobalCanvas.tsx:7-15` is always-on camera drift.
- `src/three/Starfield.tsx:73-80` is always-on per-frame rotation and opacity modulation.
- `src/three/MascotViewport.tsx:143-153, 165-193` animates the avatar and follow-cursor motion continuously.
- `src/app/components/system/BootLoader.tsx:25-81` runs a startup animation with anime on first visit.
- `src/app/components/system/AnimatedCounter.tsx:27-56` is reasonable and lazy-ish, but it still creates observer and animation work for each counter.
- `src/app/pages/Projects.tsx:100-157` and `Blog.tsx:67-111` animate panels/cards into view.
- `src/app/pages/retro/retro.css:89-304` has energetic animations, but they are isolated to the retro route and respect reduced motion.

Best parts:

- `src/app/components/system/EasterEggLogo.css:69-144` uses transform/opacity-based animations, which is compositor-friendly.
- `src/lib/anime.ts` is only loaded when those animations are needed.

Main concern:

- The homepage and shared hero routes combine multiple animation systems at once, which increases input delay and battery drain.

# Asset Analysis

Measured asset sizes:

| Asset | Size | Risk |
| --- | --- | --- |
| `public/images/logo.png` | 1,035,292 bytes | Critical. Used in header/footer logo path; too large for a small UI icon |
| `public/models/standing.glb` | 2,121,524 bytes | Critical. Shared 3D hero model, likely fetched on many routes |
| `public/audio/ambient.mp3` | 5,481,671 bytes | High. Deferred, but very expensive once audio is unlocked |
| `public/audio/click.mp3` | 35,325 bytes | Fine |
| `public/images/og.png` | 70 bytes | Not a performance issue, but likely a placeholder-quality social image |
| `public/resume/parv-agarwal-resume.pdf` | 733 bytes | Not a performance issue, but likely a placeholder |

Important asset notes:

- `src/app/components/system/EasterEggLogo.tsx:46-54` defaults to `/images/logo.png` and the header uses `loading="eager"`, so the large PNG is paid immediately.
- `src/three/MascotViewport.tsx:8, 204` preloads the GLB at module scope, so the 3D asset can begin fetching earlier than the UI needs it.
- `src/audio/AudioManager.ts:81-103` loads both ambient and click audio after unlock. The ambient track is the largest hidden post-interaction payload in the app.

Bandwidth opportunities:

- Replace the logo PNG with an SVG or a far smaller AVIF/WebP.
- Compress or simplify the GLB, ideally with Meshopt/Draco and lower geometry complexity.
- Re-encode ambient audio to a smaller loop or gate it behind an explicit sound toggle.
- Move public images under hashed build assets or add strong cache headers for `/images/*`.

# Retro Easter Egg Analysis

This part is mostly well implemented.

Positive findings:

- `src/app/routes.ts:27-35` declares `/retro` as a separate lazy route.
- `src/app/pages/retro/RetroPage.tsx:24-43` restores theme and body overflow on unmount.
- `src/app/pages/retro/retro.css:13-304` scopes styling under `.retro-root`, so it does not contaminate the main theme.
- `src/app/pages/retro/RetroGame.tsx:73-115, 123-235` cleans up keyboard, touch, and animation-frame listeners.
- `src/app/components/system/EasterEggLogo.tsx` does not navigate on every tap and does not preload retro assets.

Residual risks:

- The trigger system, logo component, and shared audio manager still live in the main bundle, but they do not appear to load the retro route eagerly.
- The retro route itself is visually heavy, but that cost is isolated and acceptable because it is behind explicit user interaction.

# Lighthouse Risk Analysis

## Performance

- Highest risk area.
- Root causes: large initial JS, two WebGL canvases on many routes, eager 3D model loading, external fonts, and frequent animation work.

## Accessibility

- Mostly good, but a few fixes would help:
- Decorative canvases should be hidden from assistive tech.
- The command palette should behave like a true modal dialog with focus management.
- Reduced motion should cover Motion-based page transitions too, not only the retro route.

## Best Practices

- Good: `rel="noreferrer noopener"`, security headers in `netlify.toml`, and no obvious mixed-content issues.
- Risk: large public assets, global browser listeners, and long-lived animation loops can still hurt production stability.

## SEO

- Good metadata and OG tags exist in `index.html:9-30`.
- However, the site is client-rendered, so full content availability depends on JS execution.
- Blog content is in the client bundle, which is not ideal for crawl reliability or first-load text discovery.

# Core Web Vitals Risk Analysis

## LCP

- Likely affected by JS boot time, fonts, and the 3D hero stack.
- The biggest single LCP risk is not one image; it is the combination of JS, WebGL, and font loading before stable paint.

## CLS

- Likely decent because most major areas have explicit sizing.
- Risk comes from animation-driven layout changes, late-loading canvas content, and any fallback/content shifts during boot.

## INP

- At risk on mobile because of global listeners, canvas work, hover effects, and continuous RAF loops.
- The biggest route-specific risk is the homepage and any route with the 3D hero.

## TTFB

- Likely fine on static hosting.
- Not the bottleneck.

## FCP

- Likely delayed on slower devices because the browser must fetch and parse a large JS payload before the UI settles.

## TBT

- High risk.
- Main-thread parse/compile from the 1.37MB JS chunk, plus animation setup and WebGL initialization, will dominate here.

# Dependency Risk Analysis

- `three`, `@react-three/fiber`, `@react-three/drei`, `three-stdlib`: highest runtime and bundle risk. They are justified only if the 3D hero is a core brand requirement.
- `motion`: moderate cost. It is spread across most pages, so it should be used sparingly and ideally kept route-local once routes split.
- `animejs`: acceptable because it is dynamically imported via `src/lib/anime.ts:5-9`.
- `react-router`: necessary for the SPA, but the current static route import pattern prevents it from paying off.
- `@mdx-js/react` and MDX tooling: fine for the build pipeline, but eager MDX bundling makes content heavier than it should be.

# Accessibility + Stability Findings

- `src/app/pages/Playground.tsx:105-136` has uncancelled `setTimeout` and `setInterval` work. This can keep firing after pause or route changes and can update state after unmount.
- `src/app/components/system/CmdKPalette.tsx:143-269` behaves like a modal but does not appear to implement focus trapping or `aria-modal`. That is both an accessibility and keyboard-stability gap.
- `src/three/GlobalCanvas.tsx:59-93` and `src/three/MascotViewport.tsx:66-90` are decorative visual systems and should be treated as such in the accessibility tree.
- `src/app/components/system/ReadingProgress.tsx:6-19` is safe but continuous; it should not become a source of unbounded work if the route stays mounted for a long session.
- `src/app/components/layout/Layout.tsx:26-61` adds global listeners for audio unlocking and clicks. The cleanup exists, which is good, but the pattern is still global and should remain minimal.
- `src/app/components/system/EasterEggLogo.tsx` has good cleanup behavior and keyboard activation support.
- The retro route respects reduced motion, which is good.

# Prioritized Optimization Table

| Priority | Category | Problem | File/Component | Estimated Impact | Why It Matters | Recommended Fix |
| -------- | -------- | ------- | -------------- | ---------------- | -------------- | --------------- |
| Critical | Bundle | All routes are statically imported, so route splitting is effectively lost | `src/app/routes.ts:1-36` | Save hundreds of KB from the initial bundle; major parse/compile reduction | Forces the browser to load every page module up front | Convert each route to lazy imports or route-level `lazy` modules |
| Critical | Rendering | Two WebGL canvases run on the homepage and one runs on every shared hero page | `src/app/components/layout/Layout.tsx:102-104`, `src/three/GlobalCanvas.tsx:1-95`, `src/app/components/layout/PageHero.tsx:13-78`, `src/three/MascotViewport.tsx:1-204` | Multiple seconds of mobile CPU/GPU time saved | Continuous rendering is the biggest runtime cost in the app | Lazy-load or gate canvases by viewport/interaction; disable on low-power devices |
| Critical | Asset | The header/footer logo PNG is ~1MB | `public/images/logo.png`, `src/app/components/layout/Header.tsx:54`, `Footer.tsx:48` | 700KB-900KB bandwidth savings is realistic | A tiny logo should not dominate first paint bandwidth | Replace with SVG or a tiny compressed AVIF/WebP and cache it strongly |
| Critical | Asset | 3D model is 2.1MB and preloaded from a shared hero component | `public/models/standing.glb`, `src/three/MascotViewport.tsx:8, 204` | >2MB network savings on routes that no longer fetch it eagerly | This is one of the largest payloads in the app | Defer loading until visible/idle/interaction; simplify/compress the model |
| Critical | Content Bundling | MDX posts are eagerly bundled into the client | `src/content/blog/index.ts:14-37` | Keeps current JS smaller and prevents linear growth with blog content | Content should not become permanent JS weight | Switch to lazy-loaded MDX per route or pre-render blog pages |
| High | Rendering | Global canvas uses continuous RAF and high-performance GPU settings | `src/three/GlobalCanvas.tsx:59-93`, `Starfield.tsx:73-80` | Noticeable battery/thermals improvement on mobile | The background animates forever even when the user is idle | Reduce star count, gate by motion preference, or staticize on mobile |
| High | Asset/Network | Ambient audio is 5.5MB and loads after the first interaction | `src/audio/AudioManager.ts:81-103, 130-178`, `public/audio/ambient.mp3` | Large post-interaction bandwidth savings | First click can unexpectedly trigger a major download | Compress heavily or load only after explicit sound opt-in |
| High | Fonts | Three Google font families and many weights are render-blocking | `index.html:32-37` | Smaller font payload and faster FCP | Fonts are part of the critical rendering path | Self-host and subset to only the weights actually used |
| High | Rendering | Many surfaces use `backdrop-filter` and translucent layers | `src/styles/theme.css:203-237`, `Section.tsx:24-36`, `Header.tsx:40-47`, `Footer.tsx:35-41` | Better scroll performance on low-end devices | Blur layers are expensive when stacked repeatedly | Use blur more sparingly and disable/reduce on mobile |
| High | Stability | Playground timers are not cleaned up | `src/app/pages/Playground.tsx:105-136` | Avoids stale updates and unpredictable state | `setInterval` can keep running after pause or navigation | Store timer IDs and clear them on pause/unmount |
| Medium | Accessibility | Command palette lacks clear modal focus management | `src/app/components/system/CmdKPalette.tsx:143-269` | Better keyboard UX and screen-reader behavior | Modal overlays should trap focus and restore it cleanly | Add focus trap, `aria-modal`, and return focus on close |
| Medium | Animation | Page-level Motion animations run across many routes without reduced-motion gating | `src/app/pages/Home.tsx`, `About.tsx`, `Projects.tsx`, `Blog.tsx`, `Contact.tsx`, `Playground.tsx` | Lower INP and fewer transition costs on motion-sensitive devices | Motion work adds up across many views | Respect user motion preference globally |
| Medium | Network/Caching | `/images/*` is not covered by explicit cache headers | `netlify.toml:21-36` | Better repeat-visit performance | The huge logo and OG image live under `/images` and may revalidate too often | Add cache headers for `/images/*` or move files into hashed build assets |
| Medium | Rendering | Spotlight hover effects do per-mouse-move rect work on many cards | `src/app/components/system/SpotlightCard.tsx:25-33` | Lower hover CPU overhead | The effect is repeated across cards in multiple routes | Throttle/limit on desktop only or disable on low-power devices |
| Low | Bundle | `useMemo(() => loadPosts(), [])` is redundant | `src/app/pages/Blog.tsx:10-15` | Small cleanup only | No meaningful perf gain today | Remove if you want simpler code; not urgent |
| Low | Stability | Decorative canvases are not explicitly hidden from assistive tech | `src/three/GlobalCanvas.tsx`, `src/three/MascotViewport.tsx` | Small a11y improvement | Decorative visuals should not pollute the accessibility tree | Mark them as presentational/hidden to AT |

# Safe Optimization Roadmap

## Phase 1: Highest-impact, safest wins

- Split routes so each page loads on demand instead of all at once.
- Remove the 1MB logo bottleneck by replacing the PNG with a tiny optimized asset.
- Stop preloading or eagerly loading the 2.1MB GLB before the hero is actually needed.
- Add cache rules for `/images/*` or move logo/OG files into hashed build assets.
- Fix the Playground timer cleanup bug.

## Phase 2: Medium improvements

- Reduce the always-on WebGL footprint by gating `GlobalCanvas` and `MascotViewport`.
- Simplify or defer the homepage’s second canvas.
- Trim Google font families/weights and self-host if possible.
- Reduce stacked blur and glass surfaces on mobile.
- Add modal focus management to the command palette.

## Phase 3: Advanced optimizations

- Replace eager MDX bundling with route-level MDX loading or pre-rendered static blog pages.
- Compress the GLB and evaluate whether a lighter poster image can stand in until interaction.
- Make the starfield and hero canvas responsive to device capability and motion preference.
- Consider route pre-rendering/SSG if SEO and FCP become a priority.

## Phase 4: Optional micro-optimizations

- Remove redundant memoization and minor derived-state wrappers.
- Throttle hover effects on dense card grids.
- Audit whether every icon and animation is worth the shared cost once the big wins are done.
