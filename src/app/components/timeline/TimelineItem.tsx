import { Briefcase, GraduationCap, Award, FlaskConical } from 'lucide-react';
import type { TimelineEntry } from '@/content/timeline';

const ICONS = {
  research: FlaskConical,
  work: Briefcase,
  education: GraduationCap,
  award: Award,
} as const;

const COLORS: Record<TimelineEntry['type'], string> = {
  research: 'var(--accent)',
  work: 'var(--accent-hover)',
  education: 'var(--success)',
  award: 'var(--warning)',
};

export function TimelineItem({ entry }: { entry: TimelineEntry }) {
  const Icon = ICONS[entry.type];
  const color = COLORS[entry.type];

  return (
    <div className="relative pl-10 pb-10" style={{ borderLeft: '1px solid var(--border-hairline)' }}>
      <div
        className="absolute left-0 top-0 -translate-x-1/2 w-7 h-7 rounded-full flex items-center justify-center"
        style={{
          background: 'var(--bg-base)',
          border: `1px solid ${color}`,
          color,
        }}
      >
        <Icon size={13} />
      </div>

      <span
        className="uppercase tracking-[0.18em]"
        style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--fg-muted)' }}
      >
        {entry.date}
      </span>

      <h3
        className="mt-1"
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: '1.25rem',
          fontWeight: 500,
          lineHeight: 1.25,
          letterSpacing: '-0.015em',
          color: 'var(--fg-primary)',
        }}
      >
        {entry.title}
      </h3>

      <div className="mt-1 flex flex-wrap items-baseline gap-2">
        <span style={{ fontSize: '0.9375rem', color: 'var(--fg-secondary)' }}>{entry.org}</span>
        {entry.location && (
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--fg-muted)' }}>
            · {entry.location}
          </span>
        )}
      </div>

      <p
        className="mt-2 max-w-[640px]"
        style={{ fontSize: '0.9375rem', lineHeight: 1.75, color: 'var(--fg-secondary)' }}
      >
        {entry.description}
      </p>
    </div>
  );
}
