export type Publication = {
  id: string;
  title: string;
  authors: string[];
  venue: string;
  year: number;
  date: string;
  abstract: string;
  tags: string[];
  links: {
    arxiv?: string;
    pdf?: string;
    github?: string;
    demo?: string;
  };
  highlight?: string;
};

export const publications: Publication[] = [
  {
    id: 'gpualert-2026',
    title:
      'GPUAlert: A Zero-Instrumentation Process-Boundary Monitor for Diagnosing GPU Training-Job Failures',
    authors: ['Parv Agarwal', 'Asif Ekbal'],
    venue: 'arXiv preprint',
    year: 2026,
    date: '2026-07-01',
    abstract:
      'GPU training jobs fail often — roughly two in five on large production clusters — yet the operator typically learns of a failure only by reconnecting hours later. GPUAlert is a command-line wrapper that monitors any training command at the process boundary, and with no change to that command, emails a structured notification on completion carrying a classified failure cause, durable logs, and output artifacts. It needs no import, no account, and no connectivity beyond an SMTP relay.',
    tags: ['MLOps', 'GPU', 'Systems', 'Deep Learning'],
    links: {
      arxiv: 'https://arxiv.org/abs/2607.01409',
      pdf: 'https://arxiv.org/pdf/2607.01409',
      github: 'https://github.com/Parv-01/gpualert',
    },
    highlight: 'arXiv:2607.01409',
  },
];
