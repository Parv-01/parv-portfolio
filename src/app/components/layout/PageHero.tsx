import { motion } from 'motion/react';
import { Section } from './Section';
import MascotViewport, { type MascotPose } from '@/three/MascotViewport';

type Props = {
  eyebrow: string;
  title: React.ReactNode;
  body: React.ReactNode;
  extra?: React.ReactNode;
  mascotPose?: MascotPose;
};

export function PageHero({ eyebrow, title, body, extra, mascotPose }: Props) {
  return (
    <Section padding="large">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
        <motion.div
          className="lg:col-span-7 flex flex-col gap-6"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span
            className="uppercase tracking-[0.2em]"
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.6875rem',
              fontWeight: 500,
              color: 'var(--accent)',
            }}
          >
            {eyebrow}
          </span>
          <h1
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(2.25rem, 4.5vw, 3.5rem)',
              fontWeight: 500,
              lineHeight: 1.05,
              letterSpacing: '-0.025em',
              color: 'var(--fg-primary)',
            }}
          >
            {title}
          </h1>
          <div style={{ fontSize: '1.0625rem', lineHeight: 1.7, color: 'var(--fg-secondary)' }}>
            {body}
          </div>
          {extra}
        </motion.div>

        <motion.div
          className="lg:col-span-5 flex items-center justify-center"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div
            className="glass relative w-full max-w-[420px] aspect-square rounded-3xl overflow-hidden"
            style={{
              backgroundImage:
                'radial-gradient(circle at 30% 20%, var(--accent-soft) 0%, transparent 60%)',
            }}
          >
            <MascotViewport {...(mascotPose ?? {})} />
            <div
              className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center"
              style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem' }}
            >
              <span
                className="uppercase tracking-[0.22em]"
                style={{ color: 'var(--fg-faint)' }}
              >
                Parv Agarwal
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </Section>
  );
}
