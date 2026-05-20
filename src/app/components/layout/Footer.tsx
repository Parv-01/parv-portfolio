import { Link } from 'react-router';
import { Github, Linkedin, Mail, FileText } from 'lucide-react';
import { EasterEggLogo } from '../system/EasterEggLogo';

const year = new Date().getFullYear();

const socials = [
  { icon: Github, label: 'GitHub', href: 'https://github.com/Parv-01' },
  { icon: Linkedin, label: 'LinkedIn', href: 'https://www.linkedin.com/in/parvagarwal' },
  { icon: Mail, label: 'Email', href: 'mailto:parvagarwal9759+portfolio@gmail.com' },
  { icon: FileText, label: 'Resume', href: '/resume/parv-agarwal-resume.pdf' },
];

const navGroups: { title: string; links: { label: string; to: string }[] }[] = [
  {
    title: 'Site',
    links: [
      { label: 'Home', to: '/' },
      { label: 'About', to: '/about' },
      { label: 'Projects', to: '/projects' },
    ],
  },
  {
    title: 'Notes',
    links: [
      { label: 'Blog', to: '/blog' },
      { label: 'Playground', to: '/playground' },
      { label: 'Contact', to: '/contact' },
    ],
  },
];

export function Footer() {
  return (
    <footer
      className="relative z-10 mt-16"
      style={{
        borderTop: '1px solid var(--border-hairline)',
        background: 'color-mix(in srgb, var(--bg-base) 60%, transparent)',
        backdropFilter: 'blur(12px)',
      }}
    >
      <div className="mx-auto max-w-[1200px] px-4 md:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-12 gap-10">
        <div className="md:col-span-5 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <EasterEggLogo size={32} ariaLabel="Parv Agarwal" loading="lazy" />
            <span
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '1.0625rem',
                fontWeight: 500,
                letterSpacing: '-0.01em',
                color: 'var(--fg-primary)',
              }}
            >
              Parv Agarwal
            </span>
          </div>
          <p
            className="max-w-[360px]"
            style={{ fontSize: '0.875rem', lineHeight: 1.7, color: 'var(--fg-muted)' }}
          >
            Building intelligent systems at the intersection of artificial intelligence, quantum computing, neuromorphic engineering & biological cognition {'->'} driven by Research, Curiosity and a Lifelong Pursuit of Learning.
          </p>

          <div className="flex items-center gap-2 mt-2">
            {socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target={s.href.startsWith('http') ? '_blank' : undefined}
                rel={s.href.startsWith('http') ? 'noreferrer noopener' : undefined}
                title={s.label}
                className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors duration-200"
                style={{
                  color: 'var(--fg-muted)',
                  border: '1px solid var(--border-hairline)',
                }}
              >
                <s.icon size={15} />
              </a>
            ))}
          </div>
        </div>

        {navGroups.map((g) => (
          <div key={g.title} className="md:col-span-3 flex flex-col gap-3">
            <span
              className="uppercase tracking-[0.2em]"
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.6875rem',
                fontWeight: 500,
                color: 'var(--fg-muted)',
              }}
            >
              {g.title}
            </span>
            <ul className="flex flex-col gap-2">
              {g.links.map((l) => (
                <li key={l.to}>
                  <Link
                    to={l.to}
                    className="no-underline transition-colors duration-200"
                    style={{ fontSize: '0.9375rem', color: 'var(--fg-secondary)' }}
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div className="md:col-span-1 flex flex-col gap-3">
          <span
            className="uppercase tracking-[0.2em]"
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.6875rem',
              fontWeight: 500,
              color: 'var(--fg-muted)',
            }}
          >
            Status
          </span>
          <div className="inline-flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'var(--success)' }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--success)' }}>
              online
            </span>
          </div>
        </div>
      </div>

      <div style={{ borderTop: '1px solid var(--border-hairline)' }}>
        <div className="mx-auto max-w-[1200px] px-4 md:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span
            style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--fg-muted)' }}
          >
            © {year} <a href="mailto:parvagarwal9759+portfolio@gmail.com" target="_blank" rel="noreferrer noopener" style={{ color: 'var(--accent)' }}>Parv Agarwal</a> · designed and built with 💖
          </span>
          <span
            style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: 'var(--fg-faint)' }}
          >
            Open to Opportunities · Always learning
          </span>
        </div>
      </div>
    </footer>
  );
}
