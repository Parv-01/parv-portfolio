# Master Prompt For Claude (Playground Page Upgrade)

You are Claude (coding co-worker) working inside an existing React + Vite + TypeScript portfolio repo. Your task is to upgrade the **Playground** page into a **portfolio-proof engineering artifact**: correct execution semantics, strong observability, helpful errors, and a restrained personality layer (tasteful easter eggs).

## How To Work (Claude Instructions)

1. First, read the current implementations of:
   - `src/app/pages/Playground.tsx`
   - `src/app/pages/PlaygroundHero.tsx`
   - `src/app/components/playground/TerminalWindow.tsx`
2. Then implement changes in small, safe steps. Prefer minimal diffs.
3. Do not add heavy dependencies. Keep everything in TypeScript/React.
4. Do not change unrelated pages.
5. At the end, list:
   - files changed
   - what changed (1-2 sentences)
   - a manual test checklist and how you validated it

## Scope

- Primary files:
  - `src/app/pages/Playground.tsx`
  - `src/app/pages/PlaygroundHero.tsx`
  - `src/app/components/playground/TerminalWindow.tsx` (only if needed)
- Do not regress other pages.
- Keep changes minimal but complete.
- Prioritize portfolio-readiness over feature breadth.

## Non-Negotiables (Definition of Done)

1. **Run/Step correctness**
   - "Run" must not use stale `pc`/`regs` values.
   - Reset/Pause must stop any ongoing timers/intervals.
   - `HLT` must actually halt execution.

2. **Error handling**
   - Unsupported opcodes and parse errors must surface as explicit, helpful errors.
   - Errors must include line number (1-indexed for humans) and context.
   - When an error occurs during Run, stop the run loop.

3. **Observability**
   - Always show which line is currently executing.
   - Make it easy to spot what instruction caused an error.

4. **Portfolio polish**
   - The page must feel like a small, well-engineered tool.
   - Easter eggs must be subtle and never block the real error.
   - Default experience must be serious and credible.

## Current Baseline (What Exists)

- `Playground.tsx` is an 8085-like simulator.
  - Uses `setTimeout` sequences for phases on Step.
  - Uses `setInterval` for Run.
  - `step()` silently ignores unknown opcodes.
  - `HLT` does not stop execution.

## Goals (High-Level)

1. Turn the Playground into **portfolio proof** for:
   - state machine thinking
   - correctness-first iteration
   - developer UX (error messages + observability)
   - systems mindset (speed control, constraints, reproducible behavior)

2. Add tasteful easter eggs:
   - Only ever as a secondary line under a real, helpful error.
   - References must be subtle and on-brand.
   - Author/pioneer pool:
     - Plato
     - Robert Greene
     - Schrodinger, Shor, Grover
   - Rate-limit to avoid spam.

## Implementation Requirements (Detailed)

### A. Execution Engine: Halt + Errors + Determinism

Refactor the single-instruction executor so it can communicate more than just registers.

1. Change the execution result shape
   - Replace `step(line: string, regs: Regs): Regs` with a result object.
   - Include at minimum:
     - `regs: Regs`
     - `halted: boolean`
     - `error?: { kind: 'parse' | 'unsupported' | 'runtime'; message: string; op?: string }`
   - Also include the parsed opcode and operands (if useful) to build better errors.

2. `HLT` behavior
   - On `HLT`, set `halted: true`.
   - Do not keep incrementing PC indefinitely after halt.
   - Run loop must stop when halted.

3. Unsupported opcode behavior
   - If opcode not recognized, return `error` describing unsupported opcode.
   - Error message must list supported opcodes.

4. Parsing behavior
   - Trim comments (already done), but errors like missing operands should be surfaced.
   - For hex parsing, handle `0AH` style literals; if invalid, produce parse error.
   - If the user writes decimal literals or `0x..`, either support them explicitly or error with a clear hint. Do not silently misparse.

### B. State + Timer Hygiene (No Leaks, No Race Conditions)

1. Replace ad-hoc timers with managed refs
   - Use `useRef<number | null>` for:
     - run interval id
     - step timeouts (fetch/decode/execute/apply)
   - Implement a single helper that clears all timers.

2. Reset semantics
   - Reset must:
     - clear timers
     - clear errors
     - clear halted
     - reset regs/pc/phase/running

3. Step semantics
   - Prevent queueing multiple Step sequences:
     - disable Step while the phase animation is in progress, or clear previous timeouts before scheduling new.

4. Run semantics
   - Run must use a single source of truth.
   - Avoid stale closure bugs.
   - Ensure the program source used for execution is clearly defined (snapshot at Run start, or live, but be consistent).
   - Pause must clear the interval immediately.
   - Unmount must clear interval/timeouts.

### C. UX: Line Highlight + Error Presentation

1. Highlight current line
   - Provide a read-only view with line numbers and highlight for `pc`.
   - Keep the textarea for editing, but show a synced display panel OR implement a simple line-highlighting overlay.
   - Minimal acceptable approach:
     - Add a second panel (read-only) next to the textarea that renders `lines` with line numbers and a `pc` highlight.
   - Prefer this approach over attempting to highlight inside a textarea.

2. Error UI
   - Display primary error message near the simulator header (next to "phase").
   - Include:
     - line number (human-friendly: `pc + 1`)
     - opcode if present
     - short resolution hint
   - When error exists:
     - show a "Clear" action
     - keep the register state as-is (do not silently reset)

3. HLT UI
   - When halted:
     - show a visible "HALTED" status badge.
     - Run button should become "Reset" or remain disabled until Reset.

### D. Portfolio Enhancements: Examples + Speed

1. Example programs
   - Add 4-6 curated examples:
     - add two numbers (existing)
     - register move chain
     - increment/decrement loop (within supported ISA constraints)
     - subtract example
   - One-click load replaces textarea content and resets state.

2. Run speed control
   - Add a small slider or select (e.g., Slow/Normal/Fast or numeric ms).
   - Run loop interval uses this value.

3. Editing lock while running
   - Set textarea `readOnly` while running.
   - Show hint text: "Pause to edit".

### E. Easter Eggs (Tasteful, Rate-Limited, On-Brand)

1. Trigger rules
   - Easter egg quip should appear only:
     - after 2 consecutive errors OR
     - once every 60 seconds (cooldown)
   - Never show more than one quip per error event.

2. Placement
   - Show as a secondary line under the primary error.
   - Use muted color and smaller text.
   - Must not distract from the actual fix.

3. Content pool
   - Keep one-liners short and relevant.
   - Examples (paraphrase OK, keep subtle, no endorsement implied):
     - Plato: "Precision starts with definitions."
     - Robert Greene: "Isolate the variable; test the move."
     - Schrodinger: "Model the state before you evolve it."
     - Shor: "Use structure when brute force fails."
     - Grover: "Know the objective; search gets sharper."
   - Rotate quips; do not repeat too frequently.

4. No over-claiming
   - Do not imply endorsements.
   - Keep it as "notes" or "aside".

### F. Copy Tweaks (PlaygroundHero)

- Keep the teaching vibe, but add one line that positions this as proof of systems thinking.
- Avoid calling it a "toy" in the primary line; keep that as a secondary disclaimer.

## Testing Checklist (Must Pass)

1. Step multiple times quickly: no phase desync, no queued timeouts.
2. Run then Reset: interval stops, state resets deterministically.
3. Run then Pause then Step: uses correct current `pc`/`regs`.
4. Add an unsupported opcode (e.g., `JMP 0000H`):
   - error shown with line number
   - run stops
   - easter egg appears only under trigger rules
5. Add malformed hex literal: error shown.
6. `HLT` stops run and shows HALTED.
7. Mobile layout: readable; highlight and error UI remain usable.

## Deliverables (What You Must Produce)

1. Working code changes in the repo implementing all "Non-Negotiables".
2. A brief summary of the UX changes (line highlight, errors, halted state, speed, examples).
3. Confirmation that email/app redirects are NOT introduced here (Playground must remain self-contained).

## Notes

- Keep everything ASCII.
- Keep easter eggs tasteful. The page should still read as serious engineering work.

## Output Instructions

- Implement the changes directly in the repo.
- Keep the diff minimal and readable.
- Do not introduce new heavy dependencies.
- If you introduce any new helper types/functions, keep them colocated in `Playground.tsx` unless clearly reusable.
