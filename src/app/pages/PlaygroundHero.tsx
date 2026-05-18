import { Lightbulb } from 'lucide-react';
import { PageHero } from '../components/layout/PageHero';

export function PlaygroundHero() {
  return (
    <PageHero
      eyebrow="Playground"
      title={
        <>
          8085 Hybrid<br />
          <em style={{ fontStyle: 'italic' }}>simulator</em>
        </>
      }
      body={
        <>
          <p className="mb-3">
            A retro-modern 8085 microprocessor sandbox. Step through fetch / decode /
            execute / memory phases, watch registers update, and read clear errors
            with line numbers when something doesn't parse.
          </p>
          <p className="mb-3">
            Built as a small proof of systems thinking {"->"} deterministic state
            machine, explicit halt semantics, timer-safe Run loop and a
            developer-grade error surface.
          </p>
          <p className="inline-flex items-start gap-2" style={{ color: 'var(--fg-muted)' }}>
            <Lightbulb size={16} className="mt-1 shrink-0" style={{ color: 'var(--warning)' }} />
            <span>Teaching-grade subset of the ISA; full emulation is on the roadmap.</span>
          </p>
        </>
      }
      mascotPose={{ rotationY: -0.2, cameraZ: 5.0, cameraY: 0.6, fov: 30, fit: 2.7, offsetX: 2.9, offsetY: 0.5 ,animationSpeed:0.5}}
    />
  );
}
