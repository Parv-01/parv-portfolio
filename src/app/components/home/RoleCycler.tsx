import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';

const ROLES = [
  'Hardware-Aware AI Researcher',
  'NLP / LLM Engineer',
  'Quantum-ML Explorer',
  'Embedded Engineer',
  'Brain-Inspired Computing Enthusiast',
  'Tech Generalist',
  'Curious Mind'
];

export function RoleCycler() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => setIdx((i) => (i + 1) % ROLES.length), 2400);
    return () => window.clearInterval(id);
  }, []);

  return (
    <span className="relative inline-block align-baseline">
      <AnimatePresence mode="wait">
        <motion.span
          key={ROLES[idx]}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.35 }}
          className="inline-block"
          style={{
            fontFamily: 'var(--font-serif)',
            fontStyle: 'italic',
            color: 'var(--accent)',
          }}
        >
          {ROLES[idx]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
