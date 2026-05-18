import { Link } from 'react-router';
import type { MouseEvent, ReactNode } from 'react';
import { ArrowUpRight, Github, FileText, Sparkles } from 'lucide-react';
import { SpotlightCard } from '../system/SpotlightCard';
import type { Project } from '@/content/projects';

const STATUS = {
  active:       { color: 'var(--success)' },
  experimental: { color: 'var(--accent)' },
  archived:     { color: 'var(--fg-muted)' },
} as const;

type Props = {
  project: Project;
  onClick?: () => void;
};

export function ProjectCard({ project, onClick }: Props) {
  const status = STATUS[project.status];
  const primaryLink =
    project.links?.demo || project.links?.github || project.links?.paper;
  const stop = (e: MouseEvent) => e.stopPropagation();

  const innerContent: ReactNode = (
    <SpotlightCard variant="glass" className="p-5 flex flex-col gap-4 h-full">
      <div className="flex items-center justify-between gap-2">
        <div className="inline-flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: status.color }} />
          <span
            className="uppercase tracking-[0.18em]"
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.625rem',
              fontWeight: 500,
              color: status.color,
            }}
          >
            {project.status}
          </span>
        </div>

        {project.highlight && (
          <span
            className="inline-flex items-center gap-1"
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.625rem',
              color: 'var(--fg-muted)',
            }}
            title={project.highlight}
          >
            <Sparkles size={10} style={{ color: 'var(--warning)' }} />
            <span className="truncate max-w-[160px]">{project.highlight}</span>
          </span>
        )}
      </div>

      <div className="flex flex-col gap-2 flex-1">
        <h3
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '1.25rem',
            fontWeight: 500,
            lineHeight: 1.25,
            letterSpacing: '-0.015em',
            color: 'var(--fg-primary)',
          }}
        >
          {project.title}
        </h3>
        <p style={{ fontSize: '0.875rem', lineHeight: 1.7, color: 'var(--fg-secondary)' }}>
          {project.description}
        </p>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {project.stack.slice(0, 6).map((s) => (
          <span
            key={s}
            className="px-2 py-0.5 rounded-md"
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.6875rem',
              background: 'var(--bg-chip)',
              color: 'var(--fg-secondary)',
              border: '1px solid var(--border-hairline)',
            }}
          >
            {s}
          </span>
        ))}
      </div>

      <div
        className="flex items-center justify-between pt-2"
        style={{ borderTop: '1px solid var(--border-hairline)' }}
      >
        <div className="flex items-center gap-2">
          {project.links?.github && (
            <a
              href={project.links.github}
              target="_blank"
              rel="noreferrer noopener"
              onClick={stop}
              className="w-7 h-7 rounded flex items-center justify-center transition-colors duration-200"
              style={{ color: 'var(--fg-muted)' }}
              title="GitHub"
              aria-label={project.title + ' on GitHub'}
            >
              <Github size={13} />
            </a>
          )}
          {project.links?.paper && (
            <a
              href={project.links.paper}
              target="_blank"
              rel="noreferrer noopener"
              onClick={stop}
              className="w-7 h-7 rounded flex items-center justify-center transition-colors duration-200"
              style={{ color: 'var(--fg-muted)' }}
              title="Paper"
              aria-label={project.title + ' paper'}
            >
              <FileText size={13} />
            </a>
          )}
        </div>
        {project.links?.demo && (
          project.links.demo.startsWith('/') ? (
            <Link
              to={project.links.demo}
              onClick={stop}
              className="inline-flex items-center gap-1 no-underline transition-colors duration-200"
              style={{ fontSize: '0.75rem', color: 'var(--accent)' }}
            >
              Demo <ArrowUpRight size={11} />
            </Link>
          ) : (
            <a
              href={project.links.demo}
              target="_blank"
              rel="noreferrer noopener"
              onClick={stop}
              className="inline-flex items-center gap-1 no-underline transition-colors duration-200"
              style={{ fontSize: '0.75rem', color: 'var(--accent)' }}
            >
              Demo <ArrowUpRight size={11} />
            </a>
          )
        )}
        {!project.links?.demo && !primaryLink && (
          <span
            className="inline-flex items-center gap-1"
            style={{ fontSize: '0.75rem', color: 'var(--fg-muted)' }}
          >
            View details <ArrowUpRight size={11} />
          </span>
        )}
      </div>
    </SpotlightCard>
  );

  // If there's a primary link, the entire card becomes an <a> or <Link>.
  if (primaryLink) {
    const isInternal = primaryLink.startsWith('/');
    
    if (isInternal) {
      return (
        <Link
          to={primaryLink}
          className="block h-full no-underline transition-transform duration-200 hover:-translate-y-0.5"
          aria-label={'Open ' + project.title}
        >
          {innerContent}
        </Link>
      );
    }

    return (
      <a
        href={primaryLink}
        target="_blank"
        rel="noreferrer noopener"
        className="block h-full no-underline transition-transform duration-200 hover:-translate-y-0.5"
        aria-label={'Open ' + project.title}
      >
        {innerContent}
      </a>
    );
  }

  // No link → render as a button that opens the modal (via onClick).
  return (
    <button
      type="button"
      onClick={onClick}
      className="block w-full h-full text-left bg-transparent cursor-pointer transition-transform duration-200 hover:-translate-y-0.5"
      aria-label={'Open details for ' + project.title}
      style={{ border: 0, padding: 0 }}
    >
      {innerContent}
    </button>
  );
}
