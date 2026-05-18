import type { ReactNode } from 'react';

type Props = {
  title?: string;
  children: ReactNode;
  className?: string;
};

export function TerminalWindow({ title = 'terminal', children, className = '' }: Props) {
  return (
    <div
      className={`rounded-xl overflow-hidden ${className}`}
      style={{
        background: 'color-mix(in srgb, var(--bg-elevated) 70%, transparent)',
        backdropFilter: 'blur(12px)',
        border: '1px solid var(--border-hairline)',
      }}
    >
      <div
        className="flex items-center gap-2 px-4 py-2.5"
        style={{
          borderBottom: '1px solid var(--border-hairline)',
          background: 'color-mix(in srgb, var(--bg-input) 60%, transparent)',
        }}
      >
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: 'rgba(255, 95, 87, 0.7)' }} />
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: 'rgba(254, 188, 46, 0.7)' }} />
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: 'rgba(40, 200, 64, 0.7)' }} />
        </div>
        <span
          className="ml-2 truncate"
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.6875rem',
            letterSpacing: '0.04em',
            color: 'var(--fg-muted)',
          }}
        >
          {title}
        </span>
      </div>

      <div
        className="p-4 md:p-5"
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.8125rem',
          lineHeight: 1.7,
        }}
      >
        {children}
      </div>
    </div>
  );
}
