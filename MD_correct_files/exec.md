# EXEC.md — Portfolio Performance Hardening Playbook

> Single source of truth for executing the AUDIT.md findings with Claude Cowork.
> Optimized for: minimum tokens per turn, maximum verifiable progress per commit, zero feature regressions.

---

## 0. How to use this document

1. Open Claude Cowork in this workspace (`parv-portfolio-new`).
2. Attach **AUDIT.md** *and* **exec.md** to the session.
3. Paste the **Master Prompt** in §6 verbatim. Do not paraphrase.
4. Approve each phase only after the **Acceptance Gate** in §5 passes.
5. After all four phases ship, run §7 (Regression Prevention) once and forget.

This file is the "runbook." AUDIT.md is the "diagnosis." Claude only needs both — never re-summarize them in chat.

---

## 1. Mission & Non‑Negotiables

**Mission.** Take the site from ~1.37 MB initial JS / Lighthouse mobile 35–55 → sub-200 KB initial JS / mobile 90+, while preserving every visible feature: glassmorphism, mascot, starfield, retro easter egg, audio system, blog, command palette.

**Non‑Negotiables.**
- No visual regression on desktop. Mobile may degrade decorations (blur depth, star count) under explicit feature flags.
- No removal of routes, pages, or user-facing components.
- `/retro` stays isolated. Do not touch its bundle boundary.
- Every change must build (`npm run build`) and pass type-check before being committed.
- One logical change = one commit. Never batch unrelated edits.

---

## 2. Token-Optimization Strategy (why this playbook is short)

Most Cowork sessions waste tokens by:
- Re-reading the same files every turn.
- Re-summarizing the audit in chat.
- Asking permission for every tiny edit.
- Producing verbose explanations instead of diffs.

This playbook eliminates that by:

| Tactic | Saves tokens because… |
| --- | --- |
| AUDIT.md already contains file paths + line numbers — Claude doesn't re-grep | Skips redundant `Read`/`Grep` calls |
| Phased batches with explicit "stop & verify" gates | Prevents Claude from spiraling into unrelated refactors |
| The Master Prompt forbids prose explanations between edits | Replies become diffs + 1-line confirmations |
| Reference files by path, not by quoted source | Eliminates re-pasted code blocks |
| Single "scoreboard" message format (§5.1) | Status fits in one short table per phase |
| Subagent delegation only for verification (build/bundle audit) | Keeps main context lean |

Net effect: a 4-phase refactor should fit comfortably in one or two Cowork sessions instead of 6–10.

---

## 3. Phased Execution Plan

Each phase maps 1:1 to AUDIT.md §"Safe Optimization Roadmap" but with **explicit batches**, **expected diffs**, and **acceptance gates**. Phases are sequential; do not parallelize.

### Phase 1 — Bundle & Asset Triage (Critical, lowest risk, highest ROI)

Goal: cut initial JS by 50–70% and kill the worst asset offenders before touching runtime.

Batches:

1. **Route code-splitting.** Convert every entry in `src/app/routes.ts` to `React.lazy()` + a top-level `<Suspense>` boundary in `Layout.tsx`. Provide a minimal skeleton fallback (no animations).
2. **MDX lazy loading.** Refactor `src/content/blog/index.ts:14-37` from `{ eager: true }` to a manifest of frontmatter (small JSON-like) + `() => import(...)` per slug. List page reads frontmatter only; post page imports the MDX on demand.
3. **Logo asset.** Replace `public/images/logo.png` (1 MB) with an SVG (preferred — design the mark in code) or AVIF ≤ 8 KB. Update `EasterEggLogo.tsx:46-54`, Header, Footer. Header logo `loading="eager"` is fine *after* the swap.
4. **GLB defer.** Remove module-scope `useGLTF.preload(MODEL)` in `src/three/MascotViewport.tsx:8, 204`. Wrap `MascotViewport` consumers in an intersection-observer gate (`useInView`) and `<Suspense>` with a static poster image fallback (PNG export of the mascot at ~30 KB).
5. **Cache headers / hashing.** Add `[[headers]]` block to `netlify.toml` for `/images/*` and `/audio/*` (`Cache-Control: public, max-age=31536000, immutable`). For non-hashed paths, prefer moving assets through Vite (`src/assets/`) so they get content hashes.
6. **Playground timer fix.** In `src/app/pages/Playground.tsx:105-136`, hold `setInterval`/`setTimeout` IDs in refs and clear them on pause, unmount, and route change.

**Expected bundle delta:** initial JS chunk ≤ 500 KB minified (≤ 150 KB gzip) after Phase 1.

### Phase 2 — Runtime & Rendering Diet

Goal: kill always-on GPU/CPU work without removing the look.

Batches:

1. **Gate `GlobalCanvas`.** In `src/app/components/layout/Layout.tsx:102-104`, mount it only when (`!prefersReducedMotion && !isMobile && navigator.hardwareConcurrency >= 4`). Expose a `<DecorContext>` so consumers can opt out.
2. **Mascot single-instance rule.** The homepage currently mounts two canvases (`Layout`'s `GlobalCanvas` + `Home.tsx:121-142`'s `MascotViewport`). Pick one per route. Recommendation: on `/` use only the mascot; suppress `GlobalCanvas` via context. Elsewhere, keep `GlobalCanvas` and drop the mascot from `PageHero`.
3. **Starfield diet.** In `src/three/Starfield.tsx:73-80` and `GlobalCanvas.tsx:7-15`, cut star count ~60% on mobile, pause the RAF loop when `document.hidden`.
4. **Backdrop-filter reduction.** In `src/styles/theme.css:203-237`, gate stacked blur behind `@media (min-width: 768px) and (hover: hover)`. Mobile gets flat translucent surfaces.
5. **SpotlightCard throttle.** In `src/app/components/system/SpotlightCard.tsx:25-33`, switch to `requestAnimationFrame`-coalesced pointer updates and disable on `(pointer: coarse)`.
6. **Motion preference globally.** Wrap page-level `motion.*` transitions in a `useReducedMotionSafe()` helper that returns 0-duration variants when the user opts out — applied across Home/About/Projects/Blog/Contact/Playground.
7. **ReadingProgress.** `src/app/components/system/ReadingProgress.tsx:6-19` — switch from continuous RAF to a passive `scroll` listener with `requestAnimationFrame` coalescing; stop the loop when the article scrolls out of view.

**Expected runtime delta:** TBT drops by ≥ 40% on mid-tier mobile; idle CPU on homepage near 0% when not interacting.

### Phase 3 — Fonts, Audio, Accessibility

Goal: critical-path cleanup + a11y compliance.

Batches:

1. **Self-host & subset fonts.** Remove `<link>` to Google Fonts in `index.html:32-37`. Use Fontsource (or `@fontsource-variable/<family>`) for the *exact* weights/styles used in the app (audit with `grep -RIn "font-weight" src/`). Preload only the LCP face.
2. **Audio gating.** In `src/audio/AudioManager.ts:81-103`, do not fetch `ambient.mp3` on first interaction. Add an explicit "sound on" toggle (header button). Re-encode the ambient track to ≤ 600 KB Opus (or trim loop). Keep `click.mp3` as-is.
3. **CmdK palette modal.** `src/app/components/system/CmdKPalette.tsx:143-269` — wrap with `role="dialog" aria-modal="true"`, implement focus trap (no extra dep — small custom hook is fine), return focus to trigger on close, add Escape handling, mark backdrop `aria-hidden`.
4. **Decorative canvases hidden from AT.** Add `aria-hidden="true"` + `role="presentation"` to `GlobalCanvas` and `MascotViewport` wrappers.

**Expected delta:** FCP −500 ms on cold load; a11y score ≥ 95; ambient audio fetch only on user opt-in.

### Phase 4 — Hardening & Future-Proofing

Goal: lock the gains in so they cannot regress.

Batches:

1. **Bundle budgets.** Add `build.rollupOptions.output.manualChunks` to split `three`, `@react-three/*`, `motion` into vendor chunks. Set `build.chunkSizeWarningLimit: 250`.
2. **Per-route size budgets.** Use `rollup-plugin-visualizer` (dev-only) and commit a small `scripts/check-bundle.mjs` that fails CI if `dist/assets/index-*.js` gzip > 180 KB, mascot vendor chunk > 250 KB gzip, or any single chunk > 500 KB minified.
3. **Lint guardrails.** Add ESLint rule `no-restricted-imports` to forbid direct `import 'three'` outside `src/three/`; forbid `import.meta.glob(..., { eager: true })` repo-wide.
4. **Perf CI.** Add a GitHub Action (or Netlify build hook) that runs `vite build` + the bundle checker. Optionally `@unlighthouse/cli` on PRs.
5. **Image pipeline.** Adopt `vite-imagetools` for any future raster images (`logo`, `og`, project thumbnails) — automatic AVIF/WebP variants + responsive `srcset`.
6. **Pre-rendering option (deferred).** Document — but don't yet implement — a path to `vite-plugin-ssg` or `vike` if SEO becomes a priority. Blog routes and `/` benefit most.
7. **Skill cleanup.** Remove the `useMemo` in `src/app/pages/Blog.tsx:10-15` (low-priority but clean).

---

## 4. Architectural Invariants (so future edits stay safe)

Anyone (human or AI) editing this repo from now on must respect:

- **No eager `import.meta.glob`.** Use lazy variants for all content collections.
- **No top-level `three` imports outside `src/three/`.** Pages that need 3D must lazy-load a wrapper.
- **One decorative canvas per route, max.** Use the `<DecorContext>` to coordinate.
- **All `setInterval`/`setTimeout`/RAF loops have cleanup paths.** Reviewer-enforced.
- **Public assets are budgeted.** Anything > 100 KB needs justification in the PR description.
- **Motion is gated by `useReducedMotionSafe()`.** Never call `motion.*` raw on a page-level wrapper.
- **`/retro` boundary is sacred.** Its CSS, assets, and game code never leak into the main path.

---

## 5. Acceptance Gates (run between phases)

### 5.1 Scoreboard format (Claude responds with this after each phase)

```
Phase: <n>
Build: pass | fail
Type-check: pass | fail
Initial JS (gzip): <kb>      target: P1 ≤150, P2 ≤120, P3 ≤110, P4 ≤100
Largest chunk (min): <kb>    target: ≤500
Lighthouse mobile (perf):    P1 ≥70 / P2 ≥85 / P3 ≥90 / P4 ≥92
Diffs: <commit hashes>
Notes: <one line, blockers only>
```

### 5.2 Per-phase gates

- **P1 gate.** `npm run build` succeeds. `dist/assets/index-*.js` gzip ≤ 150 KB. `/retro` route still works (manual smoke). Mascot visible on `/` and `/about`. Blog list still loads.
- **P2 gate.** Homepage shows one canvas only. Mobile (DevTools throttling: Slow 4G, 4× CPU) reaches interactive in ≤ 3 s. `document.hidden` pauses canvas (verify via `Performance` tab).
- **P3 gate.** Lighthouse a11y ≥ 95. Audio fetch does *not* fire until user clicks the new sound toggle (verify via Network tab). Tab/Shift-Tab cycles inside the open command palette only.
- **P4 gate.** `npm run build` triggers the bundle checker; deliberately push an oversized import and confirm CI fails.

---

## 6. THE MASTER PROMPT (paste into Cowork verbatim)

> Copy everything between the fences. Do not edit. Variables are intentionally absent.

```
You are operating on the Vite + React SPA in this workspace (parv-portfolio-new).
Your scope, constraints, and execution plan are defined in two files attached to this session:
  - AUDIT.md  (diagnosis: bottlenecks, file paths, line numbers, priorities)
  - exec.md   (this playbook: phases, batches, gates, invariants)

ROLE
You are a senior performance + frontend engineer. You are not a chatbot. You ship diffs.

GROUND RULES
1. Do NOT re-read or summarize AUDIT.md or exec.md in chat. Reference sections by number.
2. Do NOT explain your reasoning unless I ask. Reply with: short action header → diffs → scoreboard.
3. Work in the order defined in exec.md §3. Finish a batch before starting the next.
4. After each batch: run `npm run build` and `npx tsc --noEmit`. If either fails, stop and report.
5. After each PHASE: emit the scoreboard from exec.md §5.1 and WAIT for my "proceed" before the next phase.
6. Never delete a user-facing feature. If a fix requires it, stop and ask.
7. Respect every invariant in exec.md §4. They apply to all future edits, not just yours.
8. Commit per logical change: `<type>(<scope>): <short imperative>`. Examples:
     perf(routes): convert all top-level routes to React.lazy
     perf(assets): replace 1MB logo PNG with inline SVG mark
     fix(playground): clear interval on pause and unmount
9. Use the Read/Edit/Write tools for files. Use the bash tool only for builds, tsc, du, and the bundle checker.
10. For any decision not covered by AUDIT.md or exec.md, prefer the safer/smaller-diff option. Note the choice in the scoreboard's Notes line.

CONTEXT EFFICIENCY
- Don't re-grep files whose paths and line numbers are already in AUDIT.md.
- Don't paste full file contents back at me. Use diffs or 3-line context windows.
- Don't ask permission for individual edits within an approved phase. Just do them.
- If a sub-task explodes in scope, stop immediately and surface a one-line question.

VERIFICATION
- Before scoreboard, run: `npm run build` and capture initial JS gzip size from Vite's report.
- For Phase 1 and Phase 4, additionally run the bundle checker (`node scripts/check-bundle.mjs` if it exists; otherwise compute manually with `gzip -c dist/assets/index-*.js | wc -c`).
- For Phase 3, additionally take a 5-bullet a11y self-check on the command palette and the new sound toggle.

KICKOFF
Begin with Phase 1 from exec.md §3. Acknowledge with the single line:
    "Phase 1 starting — batches 1..6."
Then execute batch 1. Stop at each batch boundary only if a build/tsc check fails.
```

---

## 7. Regression Prevention (one-time setup, after Phase 4 ships)

These belong in the repo permanently. The Master Prompt instructs Claude to add them in Phase 4, but they're listed here so you can verify them yourself.

**`scripts/check-bundle.mjs`** — fails CI if budgets are blown.

```js
import { statSync, readdirSync } from "node:fs";
import { gzipSync } from "node:zlib";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const DIST = "dist/assets";
const BUDGETS = { entryGzipKB: 180, vendorGzipKB: 250, anyChunkMinKB: 500 };

const files = readdirSync(DIST).filter(f => f.endsWith(".js"));
let failed = false;

for (const f of files) {
  const buf = readFileSync(join(DIST, f));
  const minKB = buf.length / 1024;
  const gzKB = gzipSync(buf).length / 1024;
  if (minKB > BUDGETS.anyChunkMinKB) { console.error(`FAIL ${f} min=${minKB.toFixed(1)}kB > ${BUDGETS.anyChunkMinKB}`); failed = true; }
  if (f.startsWith("index-") && gzKB > BUDGETS.entryGzipKB) { console.error(`FAIL entry gzip=${gzKB.toFixed(1)}kB > ${BUDGETS.entryGzipKB}`); failed = true; }
  if (f.includes("three") && gzKB > BUDGETS.vendorGzipKB) { console.error(`FAIL three vendor gzip=${gzKB.toFixed(1)}kB > ${BUDGETS.vendorGzipKB}`); failed = true; }
}
process.exit(failed ? 1 : 0);
```

**`.eslintrc` additions** — forbid the patterns that caused the original audit problems.

```jsonc
{
  "rules": {
    "no-restricted-syntax": [
      "error",
      {
        "selector": "CallExpression[callee.object.property.name='glob'][arguments.1.properties] :matches(Property[key.name='eager'][value.value=true])",
        "message": "Eager import.meta.glob bloats the bundle. Use lazy loaders."
      }
    ],
    "no-restricted-imports": [
      "error",
      { "paths": [{ "name": "three", "message": "Import three only from src/three/* wrappers." }] }
    ]
  }
}
```

**`netlify.toml` snippet** — cache discipline.

```toml
[[headers]]
  for = "/images/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/audio/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

**`package.json`** — wire the checker.

```jsonc
{
  "scripts": {
    "build": "vite build && node scripts/check-bundle.mjs"
  }
}
```

---

## 8. Rollback & Safety

- All work happens on a branch named `perf/phase-N`. Merge to `main` only after the corresponding gate in §5.2 passes.
- Tag `pre-perf-baseline` on `main` *before* Phase 1 starts. If anything breaks in production, `git revert <merge>` or hard-reset to the tag.
- Keep the original `public/images/logo.png` in git history; do not force-push.
- The 2.1 MB GLB stays in the repo but is no longer preloaded. If a regression is reported, re-enabling `useGLTF.preload` is a one-line revert.
- The sound toggle has a default of OFF. If users dislike the discoverability change, flipping the default is one line.

---

## 9. Quick Reference — Files Touched (by phase)

| Phase | Files |
| --- | --- |
| 1 | `src/app/routes.ts`, `src/app/components/layout/Layout.tsx`, `src/content/blog/index.ts`, `src/three/MascotViewport.tsx`, `src/app/components/system/EasterEggLogo.tsx`, header & footer logo refs, `public/images/logo.png` (replace), `netlify.toml`, `src/app/pages/Playground.tsx` |
| 2 | `src/app/components/layout/Layout.tsx`, `src/three/GlobalCanvas.tsx`, `src/three/Starfield.tsx`, `src/three/MascotViewport.tsx`, `src/app/pages/Home.tsx`, `src/app/components/layout/PageHero.tsx`, `src/styles/theme.css`, `src/app/components/system/SpotlightCard.tsx`, `src/app/components/system/ReadingProgress.tsx`, page files using `motion.*` |
| 3 | `index.html`, `src/audio/AudioManager.ts`, `src/app/components/system/CmdKPalette.tsx`, `src/three/GlobalCanvas.tsx`, `src/three/MascotViewport.tsx` |
| 4 | `vite.config.ts`, `.eslintrc.*`, `package.json`, `scripts/check-bundle.mjs`, `netlify.toml`, optional CI yaml |

---

## 10. Definition of Done

The portfolio is "phenomenal and future-proof" when *all* of the following are true:

- Initial JS ≤ 100 KB gzip; no chunk > 500 KB minified.
- Lighthouse mobile: Performance ≥ 92, Accessibility ≥ 95, Best Practices ≥ 95, SEO ≥ 90.
- LCP ≤ 2.0 s, INP ≤ 200 ms, CLS ≤ 0.05 on Slow 4G + 4× CPU throttling.
- One WebGL canvas per route, paused when tab is hidden.
- All public assets > 100 KB are justified in a `public/README.md`.
- `npm run build` fails the bundle checker when budgets are blown — verified by deliberate violation.
- `/retro` still works, still isolated, still respects reduced motion.
- A fresh visitor experiences no audio download until they explicitly opt in.
- The repo lints clean and `tsc --noEmit` passes.
