import { motion } from 'motion/react';
import { MapPin, Calendar, Award, BookOpen } from 'lucide-react';
import { Section } from '../components/layout/Section';
import { PageHero } from '../components/layout/PageHero';
import { TimelineItem } from '../components/timeline/TimelineItem';
import { SpotlightCard } from '../components/system/SpotlightCard';
import { RevealOnScroll } from '../components/system/RevealOnScroll';
import { timeline } from '@/content/timeline';

const skills = {
  'Machine Learning': ['PyTorch', 'TensorFlow', 'Hugging Face', 'PEFT / LoRA', 'DAPT','scikit-learn', 'Evaluation'],
  'NLP and LLMs': ['Transformers', 'RAG Systems', 'Sentence-Transformers', 'Tokenisation', 'Semantic Search'],
  'Quantum Computing': ['Qiskit', 'PennyLane', 'LCU / Trotterisation','Simulation'],
  'Electronics': ['STM32', '8085', 'Embedded C / C++', 'VHDL', 'MATLAB', 'IAR EW', 'Visual Basic .NET'],
  'Full-Stack': ['React', 'Next.js', 'TypeScript', 'Node.js', 'MERN', 'Tailwind', 'Framer Motion'],
  'Languages': ['Python', 'C / C++', 'JavaScript / TypeScript', 'Go', 'Rust', 'R', 'LaTeX'],
};

const badges = [
  { icon: MapPin, text: 'Patna, India' },
  { icon: Calendar, text: 'Joined IIT Patna · Jul 2025' },
  { icon: Award, text: 'Patent · Estimation of DEE using ML in Indian Obese Women' },
  { icon: BookOpen, text: 'World 3rd · NYUAD International Hackathon (Quantum)' },
];

export function About() {
  return (
    <div>
      <PageHero
        eyebrow="About"
        title={
          <>
            Background &amp;<br />
            <em style={{ fontStyle: 'italic' }}>Research Journey</em>
          </>
        }
        body={
          <>
            <p className="mb-3">
              Junior Research Associate (Technical) at the IIT Patna AI-NLP-ML Laboratory & a 
              M.Tech candidate (Class of 2027) bridging the gap between physical hardware,learning algorithms and model behavior.
              With a deep foundation in Electronics and Communication from The LNM Institute of Information Technology (LNMIIT), Jaipur, my 
              trajectory spans from engineering low-level embedded defense systems to deploying 
              sophisticated, reproducible ML pipelines, data curation and experiment tracking.
              <br/>
              <strong><em>Question → Experiment design → Evaluation/ablations → Write-up</em></strong>
            </p>
            <p>
              I focus on architectures for efficient, hardware-aware AI, from modern language models and NLP systems to brain-inspired computing. 
              I work in a tight research loop, translating questions into reproducible experiments, strong baselines and clear evaluation, 
              then carrying the best ideas through to robust implementations that others can build on.
            </p>
          </>
        }
        extra={
          <div className="flex flex-wrap gap-2 mt-2">
            {badges.map((b) => (
              <div
                key={b.text}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg glass-pill"
                style={{ fontSize: '0.8125rem', color: 'var(--fg-secondary)' }}
              >
                <b.icon size={14} style={{ color: 'var(--accent)' }} />
                {b.text}
              </div>
            ))}
          </div>
        }
        mascotPose={{ rotationY: -0.2, cameraZ: 5.0, cameraY: 0.6, fov: 30, fit: 2.6, offsetX: 2.9, offsetY: 0.5, animationSpeed:0.7}}
      />

      <Section background="surface">
        <RevealOnScroll className="flex flex-col gap-12">
          <div className="flex flex-col gap-3" data-reveal>
            <span
              className="uppercase tracking-[0.2em]"
              style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', fontWeight: 500, color: 'var(--accent)' }}
            >
              Trajectory
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
              Research & Engineering Timeline
            </h2>
          </div>

          <div className="max-w-[720px]">
            {timeline.map((entry, i) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: -12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
              >
                <TimelineItem entry={entry} />
              </motion.div>
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
              Technical Stack
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
              Skills &amp; tools
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Object.entries(skills).map(([category, items]) => (
              <SpotlightCard
                key={category}
                variant="glass"
                className="p-6 flex flex-col gap-4"
                data-reveal
              >
                <h4
                  style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--fg-primary)' }}
                >
                  {category}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {items.map((skill) => (
                    <span
                      key={skill}
                      className="px-2.5 py-1 rounded-md"
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.75rem',
                        background: 'var(--bg-chip)',
                        color: 'var(--fg-secondary)',
                        border: '1px solid var(--border-hairline)',
                      }}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </SpotlightCard>
            ))}
          </div>
        </RevealOnScroll>
      </Section>
    </div>
  );
}
