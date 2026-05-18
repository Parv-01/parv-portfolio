import type { ReactNode } from 'react';

type Props = {
  children: ReactNode;
  padding?: 'small' | 'default' | 'large';
  background?: 'transparent' | 'surface';
  className?: string;
  innerClassName?: string;
};

const PADDING_MAP: Record<NonNullable<Props['padding']>, string> = {
  small: 'py-10 md:py-14',
  default: 'py-16 md:py-24',
  large: 'py-20 md:py-32',
};

export function Section({
  children,
  padding = 'default',
  background = 'transparent',
  className = '',
  innerClassName = '',
}: Props) {
  const surfaceStyle =
    background === 'surface'
      ? {
          background: 'color-mix(in srgb, var(--bg-elevated) 32%, transparent)',
          backdropFilter: 'blur(2px)',
          borderTop: '1px solid var(--border-hairline)',
          borderBottom: '1px solid var(--border-hairline)',
        }
      : undefined;

  return (
    <section className={`relative w-full ${PADDING_MAP[padding]} ${className}`} style={surfaceStyle}>
      <div className={`mx-auto max-w-[1200px] px-4 md:px-6 lg:px-8 ${innerClassName}`}>
        {children}
      </div>
    </section>
  );
}
