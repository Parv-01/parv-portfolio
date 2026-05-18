import type anime from 'animejs';

let _anime: typeof anime | null = null;

export async function getAnime(): Promise<typeof anime> {
  if (_anime) return _anime;
  const mod = await import('animejs');
  _anime = (mod as unknown as { default: typeof anime }).default ?? (mod as unknown as typeof anime);
  return _anime;
}

export const animeEase = {
  smooth: 'cubicBezier(0.22, 1, 0.36, 1)',
  swift: 'cubicBezier(0.4, 0, 0.2, 1)',
  cinema: 'cubicBezier(0.83, 0, 0.17, 1)',
  outExpo: 'easeOutExpo',
  inOutQuart: 'easeInOutQuart',
} as const;
