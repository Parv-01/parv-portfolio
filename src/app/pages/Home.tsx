import { Link } from 'react-router';
import { motion } from 'motion/react';
import { ArrowRight, Brain, Cpu, Atom, GitBranch, Layers, Sparkles, Languages, Waypoints } from 'lucide-react';
import { Section } from '../components/layout/Section';
import { ProjectCard } from '../components/cards/ProjectCard';
import { TerminalWindow } from '../components/playground/TerminalWindow';
import { RoleCycler } from '../components/home/RoleCycler';
import { SpotlightCard } from '../components/system/SpotlightCard';
import { AnimatedCounter } from '../components/system/AnimatedCounter';
import { RevealOnScroll } from '../components/system/RevealOnScroll';
import { MagneticButton } from '../components/system/MagneticButton';
import MascotViewport from '@/three/MascotViewport';
import { projects } from '@/content/projects';

const featured = projects.filter((p) => p.status !== 'archived').slice(0, 3);

const capabilities = [
  { icon: Brain, label: 'Brain Inspired Computing', desc: 'Brain-inspired LLMs, spiking decoders, Hopfield retrieval' },
  { icon: Waypoints , label: 'NLP and LLMs', desc: 'DAPT, SFT, PEFT, RAG, low-resource Indic adaptation' },
  { icon: Atom, label: 'Quantum Computing & QML', desc: 'Quantum Computing Basics, Quantum-Classical Hybrids, QFT, Quantum Algorithms' },
  { icon: Cpu, label: 'Electronics', desc: 'STM32, Raspberry Pi, Embedded C, 8085, Instrument Control' },
  { icon: Layers, label: 'ML & AI', desc: 'Deep learning, Multi-Model Workflow, Transformers, Model Optimisation' },
  { icon: GitBranch, label: 'Full-Stack AI Pipelines', desc: 'Supabase,React, Next.js, TypeScript, MERN, MLOps' },
  {icon: Languages, label: 'Languages', desc: 'Python, C/C++, Golang, Rust, JavaScript, SQL, MATLAB, Verilog, VHDL' },
  {icon: Sparkles, label: 'Research', desc: 'Publication-first mindset, Reproducibility, Open Science' },
];

export function Home() {
  return (
    <div>
      <Section padding="large" className="relative overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center min-h-[calc(100vh-10rem)]">
          <motion.div
            className="lg:col-span-7 flex flex-col gap-6"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <span
              className="uppercase tracking-[0.2em]"
              style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', fontWeight: 500, color: 'var(--fg-muted)' }}
            >
               AI Researcher · Systems-Focused Engineer
            </span>

            <div
              className="inline-flex items-center gap-2 self-start px-3 py-1.5 rounded-full glass-pill"
              style={{ border: '1px solid var(--border-accent)' }}
            >
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'var(--accent)' }} />
              <span
                style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 500, color: 'var(--accent)' }}
              >
                Junior Research Associate (Technical) · AI-NLP-ML Lab · IIT Patna
              </span>
            </div>

            <h1
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
                fontWeight: 500,
                lineHeight: 1.0,
                letterSpacing: '-0.035em',
                color: 'var(--fg-primary)',
              }}
            >
              Parv
              <br />
              Agarwal <span style={{ color: 'var(--accent)' }}>.</span>
            </h1>

            <div
              style={{
                fontSize: 'clamp(1.125rem, 2vw, 1.5rem)',
                fontWeight: 400,
                letterSpacing: '-0.01em',
                color: 'var(--fg-secondary)',
              }}
            >
              <span>I am a </span>
              <RoleCycler />
              <span> .</span>
            </div>

            <p
              className="max-w-[560px]"
              style={{ fontSize: '1.0625rem', lineHeight: 1.75, color: 'var(--fg-secondary)' }}
            >
              At the IIT Patna AI-NLP-ML Lab, I build hardware-aware AI across deep learning efficiency, low-resource NLP/LLMs and brain-inspired (neuromorphic) computing. 
            <br />
              I thrive in collaborative environments that turn clear questions into reproducible experiments, papers and usable systems, while expanding into quantum computing and quantum machine learning through grounded, measurable work.
            </p>

            <div className="flex items-center gap-3 mt-2">
              <MagneticButton
                href="/projects"
                className="px-6 py-3.5 rounded-xl transition-all duration-200"
                style={{
                  background: 'var(--accent)',
                  color: 'var(--accent-fg)',
                  boxShadow: '0 0 24px var(--accent-glow)',
                }}
              >
                <span style={{ fontSize: '0.9375rem', fontWeight: 500 }}>View Projects</span>
                <ArrowRight size={16} />
              </MagneticButton>
              <MagneticButton
                href="/about"
                className="px-6 py-3.5 rounded-xl transition-all duration-200"
                style={{
                  border: '1px solid var(--border-accent)',
                  color: 'var(--accent)',
                }}
              >
                <span style={{ fontSize: '0.9375rem', fontWeight: 500 }}>About Me</span>
              </MagneticButton>
            </div>
          </motion.div>

          <motion.div
            className="lg:col-span-5 flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div
              className="relative w-full max-w-[420px] aspect-square rounded-full overflow-hidden"
              style={{
                border: '1px solid var(--border-accent)',
                background: 'radial-gradient(circle, var(--accent-soft) 0%, transparent 70%)',
              }}
            >
              <MascotViewport rotationY={-0.2} cameraZ={5.0} cameraY={0.9} fov={30} fit={3.8} offsetX={4.3} offsetY={-0.5} animationSpeed={0.7} />
              <span
                className="absolute bottom-4 left-1/2 -translate-x-1/2 uppercase tracking-[0.22em] pointer-events-none"
                style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: 'var(--fg-faint)' }}
              >
                Parv.Agarwal
              </span>
            </div>
          </motion.div>
        </div>
      </Section>

      <Section background="surface">
        <RevealOnScroll className="flex flex-col gap-12">
          <div className="flex flex-col gap-3" data-reveal>
            <span
              className="uppercase tracking-[0.2em]"
              style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', fontWeight: 500, color: 'var(--accent)' }}
            >
              Core Competencies
            </span>
            <h2
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 'clamp(1.875rem, 3vw, 2.5rem)',
                fontWeight: 500,
                lineHeight: 1.15,
                letterSpacing: '-0.02em',
                color: 'var(--fg-primary)',
              }}
            >
              Research &amp; Engineering
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {capabilities.map((cap) => (
              <SpotlightCard key={cap.label} variant="glass" className="p-5" data-reveal>
                <div className="flex items-start gap-4">
                  <div
                    className="shrink-0 w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{
                      background: 'var(--bg-elevated)',
                      border: '1px solid var(--border-hairline)',
                      color: 'var(--accent)',
                    }}
                  >
                    <cap.icon size={18} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span style={{ fontSize: '0.9375rem', fontWeight: 500, color: 'var(--fg-primary)' }}>
                      {cap.label}
                    </span>
                    <span style={{ fontSize: '0.8125rem', lineHeight: 1.55, color: 'var(--fg-muted)' }}>
                      {cap.desc}
                    </span>
                  </div>
                </div>
              </SpotlightCard>
            ))}
          </div>
        </RevealOnScroll>
      </Section>

      <Section>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="LinkedIn Connections" value={11000} suffix="+" />
          <StatCard label="Patent Published" value={1} />
          <StatCard label="Quantum Research Tours" value={6} suffix="+" />
          <StatCard label="Global Rank · NYUAD" value={3} prefix="#" />
        </div>
      </Section>

      <Section background="surface">
        <RevealOnScroll className="flex flex-col gap-12">
          <div className="flex items-end justify-between gap-4" data-reveal>
            <div className="flex flex-col gap-3">
              <span
                className="uppercase tracking-[0.2em]"
                style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', fontWeight: 500, color: 'var(--accent)' }}
              >
                Featured Work
              </span>
              <h2
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: 'clamp(1.875rem, 3vw, 2.5rem)',
                  fontWeight: 500,
                  lineHeight: 1.15,
                  letterSpacing: '-0.02em',
                  color: 'var(--fg-primary)',
                }}
              >
                Selected Research
              </h2>
            </div>
            <Link
              to="/projects"
              className="hidden sm:inline-flex items-center gap-2 no-underline transition-colors duration-200"
              style={{ fontSize: '0.875rem', color: 'var(--accent)' }}
            >
              View all
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {featured.map((project) => (
              <div key={project.id} data-reveal>
                <ProjectCard project={project} />
              </div>
            ))}
          </div>
        </RevealOnScroll>
      </Section>

      <Section>
        <RevealOnScroll className="flex flex-col gap-12">
          <div className="flex flex-col gap-3" data-reveal>
            <span
              className="uppercase tracking-[0.2em]"
              style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', fontWeight: 500, color: 'var(--accent)' }}
            >
              Quick Look
            </span>
            <h2
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 'clamp(1.875rem, 3vw, 2.5rem)',
                fontWeight: 500,
                lineHeight: 1.15,
                letterSpacing: '-0.02em',
                color: 'var(--fg-primary)',
              }}
            >
              System Overview
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4" data-reveal>
            <TerminalWindow title="profile.json">
              <div className="flex flex-col gap-1" style={{ color: 'var(--fg-secondary)' }}>
                <span>{'{'}</span>
                <span className="pl-4">
                  <span style={{ color: 'var(--accent)' }}>"name"</span>:{' '}
                  <span style={{ color: 'var(--accent-hover)' }}>"Parv Agarwal"</span>,
                </span>
                <span className="pl-4">
                  <span style={{ color: 'var(--accent)' }}>"role"</span>:{' '}
                  <span style={{ color: 'var(--accent-hover)' }}>"Junior Research Associate (Technical)"</span>,
                </span>
                <span className="pl-4">
                  <span style={{ color: 'var(--accent)' }}>"affiliation"</span>:{' '}
                  <span style={{ color: 'var(--accent-hover)' }}>"AI-NLP-ML Lab, IIT Patna"</span>,
                </span>
                <span className="pl-4">
                  <span style={{ color: 'var(--accent)' }}>"focus"</span>: [
                </span>
                <span className="pl-8">
                  <span style={{ color: 'var(--accent-hover)' }}>"Quantum Computing & Hybrid QML"</span>,
                </span>
                <span className="pl-8">
                  <span style={{ color: 'var(--accent-hover)' }}>"Brain-Inspired Computing"</span>,
                </span>
                <span className="pl-8">
                  <span style={{ color: 'var(--accent-hover)' }}>"AI, NLP and LLMs"</span>
                </span>
                <span className="pl-4">],</span>
                <span className="pl-4">
                  <span style={{ color: 'var(--accent)' }}>"status"</span>:{' '}
                  <span style={{ color: 'var(--success)' }}>"actively_researching"</span>
                </span>
                <span>{'}'}</span>
              </div>
            </TerminalWindow>

            <TerminalWindow title="stats --summary">
              <div className="flex flex-col gap-3" style={{ color: 'var(--fg-secondary)' }}>
                <div className="flex items-center gap-3">
                  <span style={{ color: 'var(--accent)' }}>$</span>
                  <span>research stats --summary</span>
                </div>
                <div className="h-px" style={{ background: 'var(--border-hairline)' }} />
                <div className="grid grid-cols-2 gap-y-3 gap-x-6">
                  <Stat label="Patent" value="1 published" />
                  <Stat label="Hackathon" value="World 3rd" />
                  <Stat label="Quantum Research Tours" value="6+" />
                  <Stat label="LinkedIn Connections" value="11k+" />
                </div>
                <div className="h-px" style={{ background: 'var(--border-hairline)' }} />
                <span style={{ fontSize: '0.75rem', color: 'var(--success)' }}>
                  All systems nominal.
                </span>
              </div>
            </TerminalWindow>
          </div>
        </RevealOnScroll>
      </Section>
    </div>
  );
}

function StatCard({
  label,
  value,
  suffix,
  prefix,
}: {
  label: string;
  value: number;
  suffix?: string;
  prefix?: string;
}) {
  return (
    <SpotlightCard variant="glass" className="p-6">
      <span
        className="uppercase tracking-wider"
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.6875rem',
          color: 'var(--fg-muted)',
        }}
      >
        {label}
      </span>
      <AnimatedCounter
        value={value}
        suffix={suffix}
        prefix={prefix}
        className="block mt-2"
      />
    </SpotlightCard>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span style={{ fontSize: '0.6875rem', color: 'var(--fg-muted)' }}>{label}</span>
      <span
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: '1.25rem',
          fontWeight: 500,
          color: 'var(--fg-primary)',
        }}
      >
        {value}
      </span>
    </div>
  );
}
