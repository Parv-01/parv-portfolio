import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AlertTriangle, Cpu, Pause, Play, RotateCcw, X } from 'lucide-react';
import { Section } from '../components/layout/Section';
import { SpotlightCard } from '../components/system/SpotlightCard';
import { TerminalWindow } from '../components/playground/TerminalWindow';
import { PlaygroundHero } from './PlaygroundHero';

type Phase = 'idle' | 'fetch' | 'decode' | 'execute' | 'memory';

type Regs = {
  A: number;
  B: number;
  C: number;
  D: number;
  E: number;
  H: number;
  L: number;
  PC: number;
  SP: number;
};

type ErrKind = 'parse' | 'unsupported' | 'runtime';

type SimError = {
  kind: ErrKind;
  message: string;
  line: number;
  op?: string;
  hint?: string;
  quip?: string;
};

type StepResult = {
  regs: Regs;
  halted: boolean;
  error?: Omit<SimError, 'line' | 'quip'>;
  opcode?: string;
  operands?: string[];
};

const DEFAULT_REGS: Regs = { A: 0, B: 0, C: 0, D: 0, E: 0, H: 0, L: 0, PC: 0x0000, SP: 0xffff };

const SUPPORTED_OPS = ['MVI', 'ADD', 'SUB', 'INR', 'DCR', 'MOV', 'HLT'] as const;
const REG8 = new Set(['A', 'B', 'C', 'D', 'E', 'H', 'L']);

const SPEEDS = [
  { label: 'Slow', ms: 500 },
  { label: 'Normal', ms: 220 },
  { label: 'Fast', ms: 80 },
] as const;

type Example = { name: string; src: string };
const EXAMPLES: Example[] = [
  {
    name: 'Add two numbers',
    src: `; Add two numbers\nMVI A, 0AH\nMVI B, 14H\nADD B\nHLT\n`,
  },
  {
    name: 'Register move chain',
    src: `; Propagate A through B, C, D\nMVI A, 42H\nMOV B, A\nMOV C, B\nMOV D, C\nHLT\n`,
  },
  {
    name: 'Increment sequence',
    src: `; Unrolled increment\nMVI A, 00H\nINR A\nINR A\nINR A\nINR A\nHLT\n`,
  },
  {
    name: 'Subtract',
    src: `; A = 0x20 - 0x0C\nMVI A, 20H\nMVI B, 0CH\nSUB B\nHLT\n`,
  },
];

const QUIPS = [
  'Plato — precision starts with definitions.',
  'Robert Greene — isolate the variable, test the move.',
  'Schrodinger — model the state before you evolve it.',
  'Shor — use structure when brute force fails.',
  'Grover — know the objective; the search gets sharper.',
];

const QUIP_COOLDOWN_MS = 60_000;

function hex(v: number, pad = 2) {
  return v.toString(16).padStart(pad, '0').toUpperCase();
}

/**
 * Parse a numeric literal. Accepts:
 *   - 0AH, 14H  (8085-style hex with trailing H)
 *   - 0x0A      (C-style hex)
 *   - 10        (plain decimal)
 * Returns null on anything else.
 */
function parseLiteral(raw: string): number | null {
  if (!raw) return null;
  const s = raw.trim();
  if (/^0x[0-9a-f]+$/i.test(s)) return parseInt(s.slice(2), 16);
  if (/^[0-9a-f]+H$/i.test(s)) return parseInt(s.slice(0, -1), 16);
  if (/^[0-9]+$/.test(s)) return parseInt(s, 10);
  return null;
}

function supportedList() {
  return SUPPORTED_OPS.join(', ');
}

/**
 * Execute a single source line against the given registers. Always returns a
 * StepResult — never throws. Unknown opcodes and malformed operands surface
 * as explicit errors instead of being silently ignored.
 */
function execLine(line: string, regs: Regs): StepResult {
  const trimmed = line.trim().replace(/;.*$/, '').trim();
  if (!trimmed) {
    return { regs: { ...regs, PC: (regs.PC + 1) & 0xffff }, halted: false };
  }

  const tokens = trimmed.split(/[\s,]+/).filter(Boolean);
  const [opRaw, ...operands] = tokens;
  const op = (opRaw ?? '').toUpperCase();
  const r: Regs = { ...regs };

  const setReg = (k: string, v: number) => {
    (r as unknown as Record<string, number>)[k] = v & 0xff;
  };
  const getReg = (k: string) => (r as unknown as Record<string, number>)[k];

  const advance = (): Regs => ({ ...r, PC: (r.PC + 1) & 0xffff });

  switch (op) {
    case 'HLT': {
      return { regs: r, halted: true, opcode: op, operands };
    }

    case 'MVI': {
      const [regName, val] = operands;
      const dst = (regName ?? '').toUpperCase();
      if (!dst || !REG8.has(dst)) {
        return {
          regs: r,
          halted: false,
          opcode: op,
          operands,
          error: {
            kind: 'parse',
            message: `MVI needs a destination register (A, B, C, D, E, H, or L).`,
            op,
            hint: `Try: MVI A, 0AH`,
          },
        };
      }
      const n = parseLiteral(val ?? '');
      if (n === null) {
        return {
          regs: r,
          halted: false,
          opcode: op,
          operands,
          error: {
            kind: 'parse',
            message: `Could not parse literal "${val ?? ''}".`,
            op,
            hint: `Use 0AH (hex), 0x0A, or plain decimal like 10.`,
          },
        };
      }
      setReg(dst, n);
      return { regs: advance(), halted: false, opcode: op, operands };
    }

    case 'ADD': {
      const src = (operands[0] ?? '').toUpperCase();
      if (!REG8.has(src)) {
        return {
          regs: r,
          halted: false,
          opcode: op,
          operands,
          error: {
            kind: 'parse',
            message: `ADD expects an 8-bit register operand, got "${operands[0] ?? ''}".`,
            op,
            hint: `Try: ADD B`,
          },
        };
      }
      r.A = (r.A + getReg(src)) & 0xff;
      return { regs: advance(), halted: false, opcode: op, operands };
    }

    case 'SUB': {
      const src = (operands[0] ?? '').toUpperCase();
      if (!REG8.has(src)) {
        return {
          regs: r,
          halted: false,
          opcode: op,
          operands,
          error: {
            kind: 'parse',
            message: `SUB expects an 8-bit register operand, got "${operands[0] ?? ''}".`,
            op,
            hint: `Try: SUB B`,
          },
        };
      }
      r.A = (r.A - getReg(src)) & 0xff;
      return { regs: advance(), halted: false, opcode: op, operands };
    }

    case 'INR': {
      const dst = (operands[0] ?? '').toUpperCase();
      if (!REG8.has(dst)) {
        return {
          regs: r,
          halted: false,
          opcode: op,
          operands,
          error: {
            kind: 'parse',
            message: `INR expects an 8-bit register operand, got "${operands[0] ?? ''}".`,
            op,
            hint: `Try: INR A`,
          },
        };
      }
      setReg(dst, getReg(dst) + 1);
      return { regs: advance(), halted: false, opcode: op, operands };
    }

    case 'DCR': {
      const dst = (operands[0] ?? '').toUpperCase();
      if (!REG8.has(dst)) {
        return {
          regs: r,
          halted: false,
          opcode: op,
          operands,
          error: {
            kind: 'parse',
            message: `DCR expects an 8-bit register operand, got "${operands[0] ?? ''}".`,
            op,
            hint: `Try: DCR A`,
          },
        };
      }
      setReg(dst, getReg(dst) - 1);
      return { regs: advance(), halted: false, opcode: op, operands };
    }

    case 'MOV': {
      const dst = (operands[0] ?? '').toUpperCase();
      const src = (operands[1] ?? '').toUpperCase();
      if (!REG8.has(dst) || !REG8.has(src)) {
        return {
          regs: r,
          halted: false,
          opcode: op,
          operands,
          error: {
            kind: 'parse',
            message: `MOV expects two 8-bit registers, got "${operands.join(', ')}".`,
            op,
            hint: `Try: MOV B, A`,
          },
        };
      }
      setReg(dst, getReg(src));
      return { regs: advance(), halted: false, opcode: op, operands };
    }

    default:
      return {
        regs: r,
        halted: false,
        opcode: op,
        operands,
        error: {
          kind: 'unsupported',
          message: `Unsupported opcode "${op}".`,
          op,
          hint: `Supported: ${supportedList()}.`,
        },
      };
  }
}

export function Playground() {
  const [src, setSrc] = useState(EXAMPLES[0].src);
  const [regs, setRegs] = useState<Regs>(DEFAULT_REGS);
  const [pc, setPc] = useState(0);
  const [phase, setPhase] = useState<Phase>('idle');
  const [running, setRunning] = useState(false);
  const [halted, setHalted] = useState(false);
  const [error, setError] = useState<SimError | null>(null);
  const [speedMs, setSpeedMs] = useState<number>(SPEEDS[1].ms);

  const lines = useMemo(() => src.split('\n').map((l) => l.replace(/\r$/, '')), [src]);

  const runIntervalRef = useRef<number | null>(null);
  const stepTimeoutsRef = useRef<number[]>([]);
  const stepInFlightRef = useRef(false);

  const pcRef = useRef(pc);
  const regsRef = useRef(regs);
  const linesRef = useRef(lines);
  useEffect(() => { pcRef.current = pc; }, [pc]);
  useEffect(() => { regsRef.current = regs; }, [regs]);
  useEffect(() => { linesRef.current = lines; }, [lines]);

  const consecutiveErrorsRef = useRef(0);
  const lastQuipAtRef = useRef(0);
  const quipIndexRef = useRef(0);

  const clearStepTimeouts = useCallback(() => {
    for (const id of stepTimeoutsRef.current) window.clearTimeout(id);
    stepTimeoutsRef.current = [];
    stepInFlightRef.current = false;
  }, []);

  const clearRunInterval = useCallback(() => {
    if (runIntervalRef.current !== null) {
      window.clearInterval(runIntervalRef.current);
      runIntervalRef.current = null;
    }
  }, []);

  const clearAllTimers = useCallback(() => {
    clearStepTimeouts();
    clearRunInterval();
  }, [clearStepTimeouts, clearRunInterval]);

  useEffect(() => {
    return () => clearAllTimers();
  }, [clearAllTimers]);

  const maybeAttachQuip = useCallback((): string | undefined => {
    const now = Date.now();
    const consecutive = consecutiveErrorsRef.current;
    const cooledDown = now - lastQuipAtRef.current >= QUIP_COOLDOWN_MS;
    if (consecutive < 2 && !cooledDown) return undefined;
    const quip = QUIPS[quipIndexRef.current % QUIPS.length];
    quipIndexRef.current += 1;
    lastQuipAtRef.current = now;
    return quip;
  }, []);

  const recordError = useCallback(
    (line: number, raw: NonNullable<StepResult['error']>) => {
      consecutiveErrorsRef.current += 1;
      const quip = maybeAttachQuip();
      setError({
        kind: raw.kind,
        message: raw.message,
        op: raw.op,
        hint: raw.hint,
        line,
        quip,
      });
    },
    [maybeAttachQuip],
  );

  const recordSuccess = useCallback(() => {
    consecutiveErrorsRef.current = 0;
  }, []);

  const reset = useCallback(() => {
    clearAllTimers();
    setRegs(DEFAULT_REGS);
    setPc(0);
    setPhase('idle');
    setRunning(false);
    setHalted(false);
    setError(null);
    consecutiveErrorsRef.current = 0;
  }, [clearAllTimers]);

  const performStep = useCallback((): { ok: boolean; halted: boolean } => {
    const p = pcRef.current;
    const ls = linesRef.current;
    if (p >= ls.length) return { ok: false, halted: false };
    const result = execLine(ls[p] ?? '', regsRef.current);
    if (result.error) {
      recordError(p + 1, result.error);
      return { ok: false, halted: false };
    }
    recordSuccess();
    regsRef.current = result.regs;
    setRegs(result.regs);
    if (result.halted) {
      setHalted(true);
      return { ok: true, halted: true };
    }
    pcRef.current = p + 1;
    setPc(p + 1);
    return { ok: true, halted: false };
  }, [recordError, recordSuccess]);

  const onStep = useCallback(() => {
    if (running || halted) return;
    if (pcRef.current >= linesRef.current.length) return;
    if (stepInFlightRef.current) clearStepTimeouts();
    setError(null);
    stepInFlightRef.current = true;

    setPhase('fetch');
    stepTimeoutsRef.current.push(
      window.setTimeout(() => setPhase('decode'), 120),
      window.setTimeout(() => setPhase('execute'), 240),
      window.setTimeout(() => {
        performStep();
        setPhase('idle');
        stepTimeoutsRef.current = [];
        stepInFlightRef.current = false;
      }, 360),
    );
  }, [running, halted, clearStepTimeouts, performStep]);

  const startRun = useCallback(() => {
    if (halted) return;
    if (pcRef.current >= linesRef.current.length) return;
    setError(null);
    setRunning(true);
    runIntervalRef.current = window.setInterval(() => {
      const result = performStep();
      if (!result.ok || result.halted || pcRef.current >= linesRef.current.length) {
        clearRunInterval();
        setRunning(false);
        setPhase('idle');
      }
    }, speedMs);
  }, [halted, performStep, clearRunInterval, speedMs]);

  const pauseRun = useCallback(() => {
    clearRunInterval();
    setRunning(false);
    setPhase('idle');
  }, [clearRunInterval]);

  const onRun = useCallback(() => {
    if (running) pauseRun();
    else startRun();
  }, [running, pauseRun, startRun]);

  useEffect(() => {
    if (!running) return;
    clearRunInterval();
    runIntervalRef.current = window.setInterval(() => {
      const result = performStep();
      if (!result.ok || result.halted || pcRef.current >= linesRef.current.length) {
        clearRunInterval();
        setRunning(false);
        setPhase('idle');
      }
    }, speedMs);
    return () => clearRunInterval();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [speedMs]);

  const loadExample = useCallback(
    (name: string) => {
      const ex = EXAMPLES.find((e) => e.name === name);
      if (!ex) return;
      clearAllTimers();
      setSrc(ex.src);
      setRegs(DEFAULT_REGS);
      setPc(0);
      setPhase('idle');
      setRunning(false);
      setHalted(false);
      setError(null);
      consecutiveErrorsRef.current = 0;
    },
    [clearAllTimers],
  );

  const runDisabled = halted || pc >= lines.length;
  const stepDisabled = running || halted || pc >= lines.length;
  const errorColor = '#c97b7b';

  return (
    <div>
      <PlaygroundHero />

      <Section background="surface">
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3 flex-wrap">
              <Cpu size={18} style={{ color: 'var(--accent)' }} />
              <span
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '1.25rem',
                  fontWeight: 500,
                  letterSpacing: '-0.015em',
                  color: 'var(--fg-primary)',
                }}
              >
                8085 simulator
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.6875rem',
                  color: 'var(--fg-muted)',
                }}
              >
                phase: {phase}
              </span>
              {halted && (
                <span
                  className="inline-flex items-center px-2 py-0.5 rounded uppercase tracking-[0.18em]"
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.625rem',
                    color: 'var(--accent)',
                    border: '1px solid var(--border-accent)',
                    background: 'color-mix(in srgb, var(--accent) 10%, transparent)',
                  }}
                >
                  HALTED
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <label
                className="inline-flex items-center gap-1.5"
                style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--fg-muted)' }}
              >
                speed
                <select
                  value={speedMs}
                  onChange={(e) => setSpeedMs(Number(e.target.value))}
                  className="rounded px-1.5 py-0.5 bg-transparent outline-none"
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.75rem',
                    color: 'var(--fg-secondary)',
                    border: '1px solid var(--border-hairline)',
                  }}
                >
                  {SPEEDS.map((s) => (
                    <option key={s.label} value={s.ms} style={{ background: 'var(--bg-elevated)' }}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </label>

              <label
                className="inline-flex items-center gap-1.5"
                style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--fg-muted)' }}
              >
                example
                <select
                  defaultValue=""
                  onChange={(e) => {
                    if (e.target.value) {
                      loadExample(e.target.value);
                      e.target.value = '';
                    }
                  }}
                  className="rounded px-1.5 py-0.5 bg-transparent outline-none"
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.75rem',
                    color: 'var(--fg-secondary)',
                    border: '1px solid var(--border-hairline)',
                  }}
                >
                  <option value="" style={{ background: 'var(--bg-elevated)' }}>load…</option>
                  {EXAMPLES.map((e) => (
                    <option key={e.name} value={e.name} style={{ background: 'var(--bg-elevated)' }}>
                      {e.name}
                    </option>
                  ))}
                </select>
              </label>

              <button
                onClick={onStep}
                disabled={stepDisabled}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-transparent transition-colors"
                style={{
                  fontSize: '0.8125rem',
                  border: '1px solid var(--border-accent)',
                  color: 'var(--accent)',
                  opacity: stepDisabled ? 0.4 : 1,
                  cursor: stepDisabled ? 'not-allowed' : 'pointer',
                }}
              >
                <Play size={12} /> Step
              </button>
              <button
                onClick={onRun}
                disabled={!running && runDisabled}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors"
                style={{
                  fontSize: '0.8125rem',
                  fontWeight: 500,
                  background: 'var(--accent)',
                  color: 'var(--accent-fg)',
                  opacity: !running && runDisabled ? 0.4 : 1,
                  cursor: !running && runDisabled ? 'not-allowed' : 'pointer',
                }}
              >
                {running ? <Pause size={12} /> : <Play size={12} />}
                {running ? 'Pause' : 'Run'}
              </button>
              <button
                onClick={reset}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-transparent transition-colors"
                style={{
                  fontSize: '0.8125rem',
                  border: '1px solid var(--border-hairline)',
                  color: 'var(--fg-secondary)',
                }}
              >
                <RotateCcw size={12} /> Reset
              </button>
            </div>
          </div>

          {error && (
            <div
              className="flex items-start gap-3 px-4 py-3 rounded-lg"
              style={{
                border: `1px solid ${errorColor}`,
                background: `color-mix(in srgb, ${errorColor} 8%, transparent)`,
              }}
              role="alert"
            >
              <AlertTriangle size={16} style={{ color: errorColor, marginTop: 2 }} />
              <div className="flex flex-col gap-1 flex-1 min-w-0">
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.8125rem',
                    color: 'var(--fg-primary)',
                    lineHeight: 1.5,
                  }}
                >
                  <span style={{ color: errorColor, fontWeight: 600 }}>
                    line {error.line}
                    {error.op ? ` · ${error.op}` : ''}
                  </span>
                  <span> — {error.message}</span>
                </div>
                {error.hint && (
                  <div
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.75rem',
                      color: 'var(--fg-secondary)',
                    }}
                  >
                    {error.hint}
                  </div>
                )}
                {error.quip && (
                  <div
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.6875rem',
                      color: 'var(--fg-muted)',
                      fontStyle: 'italic',
                      marginTop: 2,
                    }}
                  >
                    aside · {error.quip}
                  </div>
                )}
              </div>
              <button
                onClick={() => setError(null)}
                className="inline-flex items-center gap-1 px-2 py-1 rounded"
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.6875rem',
                  color: 'var(--fg-muted)',
                  border: '1px solid var(--border-hairline)',
                  background: 'transparent',
                }}
                aria-label="Clear error"
              >
                <X size={11} /> Clear
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            <div className="lg:col-span-3 flex flex-col gap-4">
              <TerminalWindow title={running ? 'program.asm · readonly (running)' : 'program.asm'}>
                <textarea
                  value={src}
                  onChange={(e) => setSrc(e.target.value)}
                  spellCheck={false}
                  readOnly={running}
                  className="w-full min-h-[200px] bg-transparent outline-none resize-vertical"
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.875rem',
                    lineHeight: 1.7,
                    color: 'var(--fg-secondary)',
                    opacity: running ? 0.7 : 1,
                  }}
                />
                {running && (
                  <div
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.6875rem',
                      color: 'var(--fg-muted)',
                      marginTop: 4,
                    }}
                  >
                    Pause to edit.
                  </div>
                )}
              </TerminalWindow>

              <TerminalWindow title="rom · execution view">
                <div className="flex flex-col">
                  {lines.length === 0 || (lines.length === 1 && lines[0] === '') ? (
                    <span style={{ color: 'var(--fg-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.8125rem' }}>
                      (empty program)
                    </span>
                  ) : (
                    lines.map((ln, i) => {
                      const isCurrent = i === pc && !halted && pc < lines.length;
                      const isErrorLine = !!error && i === error.line - 1;
                      const isPast = i < pc;
                      let background = 'transparent';
                      let color: string = 'var(--fg-secondary)';
                      if (isErrorLine) {
                        background = `color-mix(in srgb, ${errorColor} 12%, transparent)`;
                        color = 'var(--fg-primary)';
                      } else if (isCurrent) {
                        background = 'color-mix(in srgb, var(--accent) 14%, transparent)';
                        color = 'var(--fg-primary)';
                      } else if (isPast) {
                        color = 'var(--fg-muted)';
                      }
                      return (
                        <div
                          key={i}
                          className="flex items-baseline gap-3 px-2 py-0.5 rounded"
                          style={{
                            background,
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.8125rem',
                            lineHeight: 1.7,
                          }}
                        >
                          <span
                            style={{
                              color: 'var(--fg-muted)',
                              width: '2.5ch',
                              textAlign: 'right',
                              userSelect: 'none',
                              opacity: 0.7,
                            }}
                          >
                            {i + 1}
                          </span>
                          <span style={{ color: 'var(--accent)', width: '1ch' }}>
                            {isCurrent ? '▸' : ' '}
                          </span>
                          <span style={{ color, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                            {ln || ' '}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              </TerminalWindow>
            </div>

            <SpotlightCard variant="glass" className="lg:col-span-2 p-5">
              <div className="flex flex-col gap-3">
                <span
                  className="uppercase tracking-[0.2em]"
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.6875rem',
                    color: 'var(--fg-muted)',
                  }}
                >
                  Registers
                </span>
                <div
                  className="grid grid-cols-3 gap-x-3 gap-y-2"
                  style={{ fontFamily: 'var(--font-mono)', fontSize: '0.875rem' }}
                >
                  {(Object.entries(regs) as [keyof Regs, number][]).map(([k, v]) => (
                    <div key={k} className="flex items-baseline justify-between gap-2">
                      <span style={{ color: 'var(--fg-muted)' }}>{k}</span>
                      <span style={{ color: 'var(--fg-primary)' }}>
                        0x{hex(v, k === 'PC' || k === 'SP' ? 4 : 2)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="h-px my-1" style={{ background: 'var(--border-hairline)' }} />
                <div className="flex items-baseline justify-between">
                  <span
                    style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--fg-muted)' }}
                  >
                    line
                  </span>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.875rem',
                      color: halted ? 'var(--accent)' : 'var(--success)',
                    }}
                  >
                    {Math.min(pc, lines.length)} / {lines.length}
                  </span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span
                    style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--fg-muted)' }}
                  >
                    status
                  </span>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.75rem',
                      color: halted
                        ? 'var(--accent)'
                        : running
                        ? 'var(--success)'
                        : error
                        ? errorColor
                        : 'var(--fg-secondary)',
                    }}
                  >
                    {halted ? 'halted' : running ? 'running' : error ? 'error' : 'ready'}
                  </span>
                </div>
              </div>
            </SpotlightCard>
          </div>

          <p
            className="max-w-[640px]"
            style={{ fontSize: '0.875rem', lineHeight: 1.7, color: 'var(--fg-muted)' }}
          >
            Supported: <code>MVI</code>, <code>ADD</code>, <code>SUB</code>, <code>INR</code>,{' '}
            <code>DCR</code>, <code>MOV</code>, <code>HLT</code>. Literals: <code>0AH</code>,{' '}
            <code>0x0A</code>, or decimal. Lines starting with <code>;</code> are comments.
          </p>
        </div>
      </Section>
    </div>
  );
}
