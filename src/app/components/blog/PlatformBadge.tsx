/**
 * PlatformBadge — small uppercase mono chip used in blog post cards and the
 * mobile stats panel to indicate the source platform (or paywall status).
 *
 * Purely presentational. Uses CSS variables only; no fill, hairline border.
 */

export type PlatformBadgeVariant =
  | 'HASHNODE'
  | 'DEV.TO'
  | 'MEDIUM'
  | 'MEMBER-ONLY'
  | 'LOCAL'
  | string;

type Props = {
  variant: PlatformBadgeVariant;
  className?: string;
};

export function PlatformBadge({ variant, className }: Props) {
  return (
    <span
      className={className}
      style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '0.6875rem',
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        color: 'var(--fg-muted)',
        border: '1px solid var(--border-hairline)',
        borderRadius: '0.25rem',
        padding: '0.05rem 0.4rem',
        background: 'transparent',
        whiteSpace: 'nowrap',
        lineHeight: 1.4,
      }}
    >
      {variant}
    </span>
  );
}
