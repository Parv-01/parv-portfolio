import { useEffect, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { Search, SlidersHorizontal, X, Github, FileText, ArrowUpRight, Sparkles } from 'lucide-react';
import { Section } from '../components/layout/Section';
import { PageHero } from '../components/layout/PageHero';
import { ProjectCard } from '../components/cards/ProjectCard';
import { projects, type Project } from '@/content/projects';

const statusFilters = ['all', 'active', 'experimental', 'archived'] as const;

export function Projects() {
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const reduced = useReducedMotion() ?? false;

  // Close modal on Escape.
  useEffect(() => {
    if (!selectedProject) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedProject(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedProject]);

  // Lock background scroll while modal is open.
  useEffect(() => {
    if (!selectedProject) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [selectedProject]);

  const filtered = projects.filter((p) => {
    const matchesStatus = activeFilter === 'all' || p.status === activeFilter;
    const matchesSearch =
      searchQuery === '' ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.stack.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  return (
    <div>
      <PageHero
        eyebrow="Projects"
        title={
          <>
            Research &amp;<br />
            <em style={{ fontStyle: 'italic' }}>explorations</em>
          </>
        }
        body="A collection of research projects spanning AI/ML, NLP, quantum computing, neuromorphic systems, embedded engineering and full-stack architecture. Some shipped, some experimental, all real."
        mascotPose={{ rotationY: -0.2, cameraZ: 5.0, cameraY: 0.6, fov: 30, fit: 2.6, offsetX: 2.9, offsetY: 0.5, animationSpeed: 0.8 }}
      />

      <Section background="surface">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--fg-muted)' }}
                />
                <input
                  type="text"
                  placeholder="Search the archive…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-lg outline-none transition-colors duration-200"
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.8125rem',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-hairline)',
                    color: 'var(--fg-primary)',
                  }}
                />
              </div>
              <button
                onClick={() => setMobileOpen((o) => !o)}
                aria-expanded={mobileOpen}
                aria-controls="project-filter-panel"
                className="md:hidden inline-flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer bg-transparent shrink-0"
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.75rem',
                  letterSpacing: '0.06em',
                  border: '1px solid var(--border-hairline)',
                  color: 'var(--fg-secondary)',
                }}
              >
                {mobileOpen ? <X size={14} /> : <SlidersHorizontal size={14} />}
                {mobileOpen ? 'CLOSE' : 'FILTERS'}
              </button>
            </div>

            <div className="hidden md:flex items-center gap-2 flex-wrap">
              {statusFilters.map((filter) => (
                <FilterChip
                  key={filter}
                  label={filter}
                  active={activeFilter === filter}
                  onClick={() => setActiveFilter(filter)}
                />
              ))}
            </div>

            <AnimatePresence initial={false}>
              {mobileOpen && (
                <motion.div
                  key="filter-panel"
                  id="project-filter-panel"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                  className="md:hidden overflow-hidden"
                >
                  <div
                    className="rounded-lg p-3 flex flex-wrap gap-2"
                    style={{
                      background: 'var(--bg-elevated)',
                      border: '1px solid var(--border-hairline)',
                    }}
                  >
                    {statusFilters.map((filter) => (
                      <FilterChip
                        key={filter}
                        label={filter}
                        active={activeFilter === filter}
                        onClick={() => {
                          setActiveFilter(filter);
                          setMobileOpen(false);
                        }}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.6875rem',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--fg-muted)',
            }}
          >
            Showing {filtered.length} of {projects.length} · catalogued
          </span>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((project, i) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.42, delay: i * 0.04, ease: [0.22, 1, 0.36, 1] }}
              >
                <ProjectCard
                  project={project}
                  onClick={
                    project.links?.demo || project.links?.github || project.links?.paper
                      ? undefined
                      : () => setSelectedProject(project)
                  }
                />
              </motion.div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="py-16 text-center">
              <p style={{ fontSize: '0.875rem', color: 'var(--fg-muted)' }}>
                No entries match this query.
              </p>
            </div>
          )}
        </div>
      </Section>

      <AnimatePresence>
        {selectedProject && (
          <ProjectModal
            project={selectedProject}
            reduced={reduced}
            onClose={() => setSelectedProject(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function ProjectModal({
  project,
  reduced,
  onClose,
}: {
  project: Project;
  reduced: boolean;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="project-modal-title"
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: reduced ? 0.1 : 0.2 }}
        onClick={onClose}
        className="absolute inset-0 cursor-pointer"
        style={{
          background: 'color-mix(in srgb, var(--bg-base) 70%, transparent)',
          backdropFilter: 'blur(4px)',
        }}
      />
      <motion.div
        initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 16 }}
        animate={reduced ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
        exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 16 }}
        transition={
          reduced ? { duration: 0.12 } : { type: 'spring', stiffness: 300, damping: 30 }
        }
        className="relative w-full max-w-lg rounded-2xl overflow-hidden"
        style={{
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-hairline)',
          boxShadow: '0 24px 64px -24px rgba(0,0,0,0.55)',
        }}
      >
        <div
          className="flex items-center justify-between gap-3"
          style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-hairline)' }}
        >
          <span
            className="uppercase tracking-[0.18em]"
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.625rem',
              fontWeight: 500,
              color: 'var(--fg-muted)',
            }}
          >
            {project.status}
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close details"
            className="inline-flex items-center justify-center cursor-pointer bg-transparent"
            style={{
              width: '28px',
              height: '28px',
              border: '1px solid var(--border-hairline)',
              borderRadius: '999px',
              color: 'var(--fg-muted)',
            }}
          >
            <X size={14} />
          </button>
        </div>

        <div className="flex flex-col gap-4" style={{ padding: '1.25rem' }}>
          <h2
            id="project-modal-title"
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '1.5rem',
              fontWeight: 500,
              lineHeight: 1.25,
              letterSpacing: '-0.015em',
              color: 'var(--fg-primary)',
            }}
          >
            {project.title}
          </h2>

          {project.highlight && (
            <span
              className="inline-flex items-center gap-1.5"
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.6875rem',
                color: 'var(--fg-muted)',
              }}
            >
              <Sparkles size={11} style={{ color: 'var(--warning)' }} />
              {project.highlight}
            </span>
          )}

          <p
            style={{
              fontSize: '0.9375rem',
              lineHeight: 1.7,
              color: 'var(--fg-secondary)',
            }}
          >
            {project.longDescription || project.description}
          </p>

          <div className="flex flex-wrap gap-1.5">
            {project.stack.map((s) => (
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

          {(project.links?.github || project.links?.paper || project.links?.demo) && (
            <div
              className="flex items-center gap-3 pt-3"
              style={{ borderTop: '1px solid var(--border-hairline)' }}
            >
              {project.links?.github && (
                <a
                  href={project.links.github}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-1.5 no-underline"
                  style={{ fontSize: '0.8125rem', color: 'var(--fg-secondary)' }}
                >
                  <Github size={13} /> GitHub
                </a>
              )}
              {project.links?.paper && (
                <a
                  href={project.links.paper}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-1.5 no-underline"
                  style={{ fontSize: '0.8125rem', color: 'var(--fg-secondary)' }}
                >
                  <FileText size={13} /> Paper
                </a>
              )}
              {project.links?.demo && (
                <a
                  href={project.links.demo}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-1.5 ml-auto no-underline"
                  style={{ fontSize: '0.8125rem', color: 'var(--accent)' }}
                >
                  Live demo <ArrowUpRight size={12} />
                </a>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="px-3 py-1.5 rounded-lg cursor-pointer transition-all duration-200 bg-transparent"
      style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '0.75rem',
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        border: '1px solid ' + (active ? 'var(--border-accent)' : 'var(--border-hairline)'),
        color: active ? 'var(--accent)' : 'var(--fg-muted)',
        background: active ? 'var(--accent-soft)' : 'transparent',
      }}
    >
      {label}
    </button>
  );
}
