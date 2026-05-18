import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * RetroGame — a lightweight Snake clone on a 2D canvas.
 *
 * Why Snake?
 *   • Zero deps. ~150 lines. Mobile + keyboard friendly.
 *   • Pure canvas → no DOM thrash, no reflows.
 *   • Fits the synthwave aesthetic with neon segments + grid floor.
 *
 * The game lives entirely inside this component — no global state, no
 * external assets. Cleans up its rAF + listeners on unmount.
 */

type Dir = { x: number; y: number };

const COLS = 24;
const ROWS = 15;
const TICK_MS = 110;

export function RetroGame() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastTickRef = useRef<number>(0);

  const snakeRef = useRef<Array<{ x: number; y: number }>>([
    { x: 8, y: 7 },
    { x: 7, y: 7 },
    { x: 6, y: 7 },
  ]);
  const dirRef = useRef<Dir>({ x: 1, y: 0 });
  const nextDirRef = useRef<Dir>({ x: 1, y: 0 });
  const foodRef = useRef<{ x: number; y: number }>({ x: 16, y: 7 });
  const aliveRef = useRef(true);

  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const placeFood = useCallback(() => {
    const occupied = new Set(snakeRef.current.map((s) => `${s.x},${s.y}`));
    let x = 0;
    let y = 0;
    do {
      x = Math.floor(Math.random() * COLS);
      y = Math.floor(Math.random() * ROWS);
    } while (occupied.has(`${x},${y}`));
    foodRef.current = { x, y };
  }, []);

  const reset = useCallback(() => {
    snakeRef.current = [
      { x: 8, y: 7 },
      { x: 7, y: 7 },
      { x: 6, y: 7 },
    ];
    dirRef.current = { x: 1, y: 0 };
    nextDirRef.current = { x: 1, y: 0 };
    aliveRef.current = true;
    setScore(0);
    setGameOver(false);
    placeFood();
  }, [placeFood]);

  const turn = useCallback((dx: number, dy: number) => {
    const cur = dirRef.current;
    if (cur.x === -dx && cur.y === -dy) return;
    nextDirRef.current = { x: dx, y: dy };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp': case 'w': case 'W': turn(0, -1); e.preventDefault(); break;
        case 'ArrowDown': case 's': case 'S': turn(0, 1); e.preventDefault(); break;
        case 'ArrowLeft': case 'a': case 'A': turn(-1, 0); e.preventDefault(); break;
        case 'ArrowRight': case 'd': case 'D': turn(1, 0); e.preventDefault(); break;
        case ' ': case 'Enter':
          if (gameOver) { reset(); e.preventDefault(); }
          break;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [turn, gameOver, reset]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let sx = 0;
    let sy = 0;
    const onStart = (e: TouchEvent) => {
      const t = e.touches[0];
      sx = t.clientX;
      sy = t.clientY;
    };
    const onEnd = (e: TouchEvent) => {
      const t = e.changedTouches[0];
      const dx = t.clientX - sx;
      const dy = t.clientY - sy;
      if (Math.abs(dx) < 20 && Math.abs(dy) < 20) return;
      if (Math.abs(dx) > Math.abs(dy)) turn(dx > 0 ? 1 : -1, 0);
      else turn(0, dy > 0 ? 1 : -1);
    };
    canvas.addEventListener('touchstart', onStart, { passive: true });
    canvas.addEventListener('touchend', onEnd);
    return () => {
      canvas.removeEventListener('touchstart', onStart);
      canvas.removeEventListener('touchend', onEnd);
    };
  }, [turn]);

  useEffect(() => {
    placeFood();
  }, [placeFood]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const cssWidth = canvas.clientWidth;
    const cssHeight = canvas.clientHeight;
    canvas.width = Math.floor(cssWidth * dpr);
    canvas.height = Math.floor(cssHeight * dpr);
    ctx.scale(dpr, dpr);

    const cellW = cssWidth / COLS;
    const cellH = cssHeight / ROWS;

    const tick = () => {
      dirRef.current = nextDirRef.current;
      const snake = snakeRef.current;
      const head = snake[0];
      const newHead = {
        x: head.x + dirRef.current.x,
        y: head.y + dirRef.current.y,
      };

      if (newHead.x < 0 || newHead.x >= COLS || newHead.y < 0 || newHead.y >= ROWS) {
        aliveRef.current = false;
        setGameOver(true);
        setBest((b) => Math.max(b, score));
        return;
      }
      for (const seg of snake) {
        if (seg.x === newHead.x && seg.y === newHead.y) {
          aliveRef.current = false;
          setGameOver(true);
          setBest((b) => Math.max(b, score));
          return;
        }
      }

      snake.unshift(newHead);
      if (newHead.x === foodRef.current.x && newHead.y === foodRef.current.y) {
        setScore((s) => s + 1);
        placeFood();
      } else {
        snake.pop();
      }
    };

    const draw = () => {
      ctx.fillStyle = 'rgba(5, 0, 16, 0.92)';
      ctx.fillRect(0, 0, cssWidth, cssHeight);

      ctx.strokeStyle = 'rgba(255, 46, 136, 0.12)';
      ctx.lineWidth = 1;
      for (let i = 1; i < COLS; i++) {
        ctx.beginPath();
        ctx.moveTo(i * cellW, 0);
        ctx.lineTo(i * cellW, cssHeight);
        ctx.stroke();
      }
      for (let j = 1; j < ROWS; j++) {
        ctx.beginPath();
        ctx.moveTo(0, j * cellH);
        ctx.lineTo(cssWidth, j * cellH);
        ctx.stroke();
      }

      const f = foodRef.current;
      ctx.fillStyle = '#fff200';
      ctx.shadowColor = '#fff200';
      ctx.shadowBlur = 14;
      ctx.fillRect(f.x * cellW + 3, f.y * cellH + 3, cellW - 6, cellH - 6);
      ctx.shadowBlur = 0;

      const snake = snakeRef.current;
      snake.forEach((seg, i) => {
        const t = 1 - i / snake.length;
        ctx.fillStyle =
          i === 0
            ? '#00f0ff'
            : `rgba(${Math.floor(255 * t)}, ${Math.floor(46 + 100 * (1 - t))}, ${Math.floor(136 + 119 * t)}, 1)`;
        ctx.shadowColor = i === 0 ? '#00f0ff' : '#ff2e88';
        ctx.shadowBlur = i === 0 ? 14 : 8;
        ctx.fillRect(seg.x * cellW + 1, seg.y * cellH + 1, cellW - 2, cellH - 2);
      });
      ctx.shadowBlur = 0;
    };

    const loop = (ts: number) => {
      if (!lastTickRef.current) lastTickRef.current = ts;
      if (aliveRef.current && ts - lastTickRef.current >= TICK_MS) {
        tick();
        lastTickRef.current = ts;
      }
      draw();
      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      lastTickRef.current = 0;
    };
  }, [placeFood, score]);

  return (
    <div className="retro-card">
      <div className="retro-game-header">
        <h2 className="retro-game-title">// NEON SNAKE</h2>
        <span className="retro-score">
          SCORE {String(score).padStart(3, '0')} · BEST {String(best).padStart(3, '0')}
        </span>
      </div>

      <canvas ref={canvasRef} className="retro-canvas" aria-label="Snake game canvas" />

      <p className="retro-hint">
        Arrows / WASD to move · Swipe on mobile · {gameOver ? 'GAME OVER — press RESTART' : 'Eat the cubes'}
      </p>

      <div className="retro-controls">
        <button className="retro-btn" onClick={reset} type="button">
          {gameOver ? 'Restart' : 'New Game'}
        </button>
      </div>

      <div className="retro-dpad" aria-label="Touch controls">
        <button className="dp-up" onClick={() => turn(0, -1)} aria-label="Up">▲</button>
        <button className="dp-lt" onClick={() => turn(-1, 0)} aria-label="Left">◀</button>
        <button className="dp-rt" onClick={() => turn(1, 0)} aria-label="Right">▶</button>
        <button className="dp-dn" onClick={() => turn(0, 1)} aria-label="Down">▼</button>
      </div>
    </div>
  );
}

export default RetroGame;
