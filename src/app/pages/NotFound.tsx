import { Link } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import { Section } from '../components/layout/Section';

export function NotFound() {
  return (
    <Section padding="large">
      <div className="min-h-[55vh] flex flex-col items-center justify-center text-center gap-6 max-w-[560px] mx-auto">
        <span
          className="uppercase tracking-[0.28em]"
          style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', fontWeight: 500, color: 'var(--accent)' }}
        >
          ERR 404 · ROUTE NOT FOUND
        </span>
        <h1
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(3rem, 8vw, 6rem)',
            fontWeight: 500,
            lineHeight: 0.95,
            letterSpacing: '-0.04em',
            color: 'var(--fg-primary)',
          }}
        >
          Lost in<br />
          <em style={{ fontStyle: 'italic' }}>orbit</em>
        </h1>
        <p style={{ fontSize: '1.0625rem', lineHeight: 1.7, color: 'var(--fg-secondary)' }}>
          This path drifted beyond our nav beacon. Use the link below to return to base.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl no-underline transition-all duration-200"
          style={{
            fontSize: '0.9375rem',
            fontWeight: 500,
            background: 'var(--accent)',
            color: 'var(--accent-fg)',
            boxShadow: '0 0 24px var(--accent-glow)',
          }}
        >
          <ArrowLeft size={15} /> Return Home
        </Link>
      </div>
    </Section>
  );
}
