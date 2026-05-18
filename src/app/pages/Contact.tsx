import { useState, type FormEvent } from 'react';
import { motion } from 'motion/react';
import { Mail, Github, Linkedin, ArrowUpRight, Send, BookMarked } from 'lucide-react';
import { Section } from '../components/layout/Section';
import { PageHero } from '../components/layout/PageHero';
import { SpotlightCard } from '../components/system/SpotlightCard';

export function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent(formData.subject || 'Hello from your portfolio');
    const body = encodeURIComponent(
      `Name: ${formData.name}\nEmail: ${formData.email}\n\n${formData.message}`
    );
    window.location.href = `mailto:parvagarwal9759+portfolio@gmail.com?subject=${subject}&body=${body}`;
  };

  return (
    <div>
      <PageHero
        eyebrow="Contact"
        title={
          <>
            Get in<br />
            <em style={{ fontStyle: 'italic' }}>touch</em>
          </>
        }
        body="I build and ship AI systems end-to-end: LLM/RAG pipelines, evaluation harnesses and production integrations under real compute constraints. I’m also open to research collaborations and internships where we can turn a clear question into reproducible experiments and publishable work."
        mascotPose={{ rotationY: -0.2, cameraZ: 5.0, cameraY: 0.6, fov: 30, fit: 2.7, offsetX: 2.9, offsetY: 0.5 ,animationSpeed:0.8 }}
      />

      <Section background="surface">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <motion.div
            className="lg:col-span-7"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <SpotlightCard variant="glass-deep" className="p-6 md:p-8">
              <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                {[
                  { key: 'name', label: 'Name', placeholder: 'Your name', type: 'text' },
                  { key: 'email', label: 'Email', placeholder: 'you@email.com', type: 'email' },
                  { key: 'subject', label: 'Subject', placeholder: 'Freelance build / Research collab / Internship - topic', type: 'text' },
                ].map((field) => (
                  <div key={field.key} className="flex flex-col gap-1.5">
                    <label style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--fg-secondary)' }}>
                      {field.label}
                    </label>
                    <input
                      type={field.type}
                      placeholder={field.placeholder}
                      value={formData[field.key as keyof typeof formData]}
                      onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                      className="px-4 py-3 rounded-xl outline-none transition-colors duration-200"
                      style={{
                        fontSize: '0.9375rem',
                        background: 'var(--bg-input)',
                        border: '1px solid var(--border-hairline)',
                        color: 'var(--fg-primary)',
                      }}
                    />
                  </div>
                ))}

                <div className="flex flex-col gap-1.5">
                  <label style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--fg-secondary)' }}>
                    Message
                  </label>
                  <textarea
                    placeholder="What are you building / researching? Timeline? Links (repo/paper/brief)? Constraints (latency, cost, accuracy)?"
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="px-4 py-3 rounded-xl outline-none transition-colors duration-200 resize-none"
                    style={{
                      fontSize: '0.9375rem',
                      lineHeight: 1.6,
                      background: 'var(--bg-input)',
                      border: '1px solid var(--border-hairline)',
                      color: 'var(--fg-primary)',
                    }}
                  />
                </div>

                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border-0 cursor-pointer transition-all duration-200 self-start"
                  style={{
                    fontSize: '0.9375rem',
                    fontWeight: 500,
                    background: 'var(--accent)',
                    color: 'var(--accent-fg)',
                    boxShadow: '0 0 24px var(--accent-glow)',
                  }}
                >
                  Send Message <Send size={16} />
                </button>
              </form>
            </SpotlightCard>
          </motion.div>

          <motion.aside
            className="lg:col-span-5"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="lg:sticky lg:top-24 flex flex-col gap-6">
              <SpotlightCard variant="glass" className="p-6">
                <span
                  className="uppercase tracking-wider block mb-5"
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.6875rem',
                    fontWeight: 600,
                    color: 'var(--fg-muted)',
                  }}
                >
                  Direct Contact
                </span>
                <a
                  href="mailto:parvagarwal9759+portfolio@gmail.com"
                  className="flex items-center gap-3 transition-colors duration-200 no-underline"
                  style={{ fontSize: '0.875rem', color: 'var(--fg-secondary)' }}
                >
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-hairline)' }}
                  >
                    <Mail size={14} style={{ color: 'var(--accent)' }} />
                  </div>
                  <div className="flex flex-col">
                    <span style={{ fontSize: '0.9375rem', fontWeight: 500, color: 'var(--fg-primary)' }}>
                      Email
                    </span>
                    <span style={{ fontSize: '0.8125rem' }}>parvagarwal9759+portfolio@gmail.com</span>
                  </div>
                  <ArrowUpRight size={14} className="ml-auto" style={{ color: 'var(--fg-faint)' }} />
                </a>
              </SpotlightCard>

              <SpotlightCard variant="glass" className="p-6">
                <span
                  className="uppercase tracking-wider block mb-5"
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.6875rem',
                    fontWeight: 600,
                    color: 'var(--fg-muted)',
                  }}
                >
                  Profiles
                </span>
                <div className="flex flex-col gap-3">
                  {[
                    { icon: BookMarked, label: 'Google Scholar', handle: 'Parv Agarwal', href: 'https://scholar.google.com/citations?hl=en&authuser=1&user=xiWyRNEAAAAJ' },
                    { icon: Github, label: 'GitHub', handle: '@Parv-01', href: 'https://github.com/Parv-01' },
                    { icon: Linkedin, label: 'LinkedIn', handle: 'parvagarwal', href: 'https://www.linkedin.com/in/parvagarwal' },
                  ].map((link) => (
                    <a
                      key={link.label}
                      href={link.href}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="flex items-center gap-3 transition-colors duration-200 no-underline"
                      style={{ fontSize: '0.875rem', color: 'var(--fg-secondary)' }}
                    >
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                        style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-hairline)' }}
                      >
                        <link.icon size={14} style={{ color: 'var(--accent)' }} />
                      </div>
                      <div className="flex flex-col">
                        <span style={{ fontSize: '0.9375rem', fontWeight: 500, color: 'var(--fg-primary)' }}>
                          {link.label}
                        </span>
                        <span style={{ fontSize: '0.8125rem' }}>{link.handle}</span>
                      </div>
                      <ArrowUpRight size={14} className="ml-auto" style={{ color: 'var(--fg-faint)' }} />
                    </a>
                  ))}
                </div>
              </SpotlightCard>

              <SpotlightCard variant="glass" className="p-6">
                <span
                  className="uppercase tracking-wider block mb-4"
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.6875rem',
                    fontWeight: 600,
                    color: 'var(--fg-muted)',
                  }}
                >
                  Availability
                </span>
                <span style={{ fontSize: '0.875rem', color: 'var(--fg-muted)' }}>
                    Best fit: teams that want fast iteration, rigorous evaluation and clean delivery.
                    <br />
                </span>
                <div className="flex flex-col gap-3">
                  {[
                    'Freelance MVP builds (AI + web apps, from spec to deployment)',
                    'LLM/RAG systems (retrieval, evaluation, and production integration)',
                    'Full-stack engineering (React/Next.js, APIs, dashboards, data tooling)',
                    'Efficiency & hardware-aware AI (optimization, inference constraints, profiling)',
                    'Research collaborations & internships (reproducible baselines, experiments, publishable work)',
                    'Open-source collaborations, workshops and invited talks',
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--accent)', opacity: 0.6 }} />
                      <span style={{ fontSize: '0.875rem', color: 'var(--fg-secondary)' }}>{item}</span>
                    </div>
                  ))}
                </div>
              </SpotlightCard>
            </div>
          </motion.aside>
        </div>
      </Section>
    </div>
  );
}
