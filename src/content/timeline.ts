export type TimelineEntry = {
  id: string;
  date: string;
  title: string;
  org: string;
  location?: string;
  description: string;
  type: 'research' | 'work' | 'education' | 'award';
};

export const timeline: TimelineEntry[] = [
  {
    id: 'iitp-jra',
    date: 'Jan 2026 — Present',
    title: 'Junior Research Associate(Technical)',
    org: 'AI-NLP-ML Research Lab, IIT Patna',
    location: 'Patna, India',
    description:
      'Working on Low-Resource Indic NLP(Sanskrit Inspired),Quantum-Classical hybrid systems and Newer Architectures. Co-authoring papers, building experimental pipelines, Mentoring Undergraduate/Graduate researchers.',
    type: 'research',
  },
  {
    id: 'iitp-mtech',
    date: 'Jul 2025 — June 2027(expected)',
    title: 'M.Tech · Artificial Intelligence and Data Science',
    org: 'IIT Patna',
    location: 'Patna, India',
    description:
     'As an M.Tech candidate in Artificial Intelligence and Data Science at IIT Patna, I operate at the convergence of advanced deep learning, natural language processing and decentralized systems. My trajectory is grounded in both the mathematical logic of the Theory of Computation (TOC) and the practical execution of Federated Learning and advanced AI pipelines. Driven by a high velocity of learning, I bridge rigorous theoretical research with scalable software architecture -> exploring the privacy-preserving, next-generation computational frameworks that will define the future of intelligent data engineering.',
    type: 'education',
  },
  {
    id: 'poornima',
    date: 'Sep 2024 — Apr 2025',
    title: 'Teaching Associate(AI/ML & Cloud Computing)',
    org: 'Poornima University',
    location: 'Jaipur, India',
    description:
      'Designed and taught the ML/DL curriculum for undergraduate and CS cohorts -> from linear algebra through transformers to GANs, with hands-on labs on Cloud Computing on AWS/GCP platforms.Besides this mentored students on projects and research, and conducted workshops on ML and Cloud topics.Had an indian Patent published on Estimation of Daily Energy Expenditure in Indian Obese Women using LiSkD ML.',
    type: 'work',
  },
  {
    id: 'paras',
    date: 'Feb 2024 — Aug 2024',
    title: 'Embedded Software Engineer intern',
    org: 'Paras Anti-Drone Technologies',
    location: 'Navi Mumbai, India',
    description:
      'Operating at the boundary of hardware constraints and system mechanics, I engineer low-latency firmware in Embedded C for STM32 and ESP-based systems, focusing on real-time signal processing workloads for drone detection and electronic mitigation. Deeply fascinated by the intersection of physical hardware and artificial intelligence, I have actively explored the foundational mechanics of tiny machine learning (TinyML)->testing the theoretical trade-offs of deploying lightweight architectures like TensorFlow Lite (TFLite) and post-training integer quantization on resource-constrained microcontrollers and Raspberry Pi platforms. This rigorous curiosity regarding physical constraints extends to my work in industrial automation, where I design desktop control applications in VB.NET to interface directly with high-tier laboratory instruments from Keysight, Rigol and Spectrum Hound. By automating the real-time telemetry, wave synthesis and diagnostic calibration of spectrum analyzers and Vector Network Analyzers (VNAs), I successfully bridge deterministic hardware engineering with modern, software-driven automation.',
    type: 'work',
  },
  {
    id: 'nyuad',
    date: 'Apr 2022',
    title: 'World 3rd · NYUAD International Hackathon',
    org: 'NYU Abu Dhabi',
    location: 'Abu Dhabi, UAE',
    description:
      'During my sophomore year, my research trajectory accelerated onto the global stage when I was selected as one of only five students from India for the fully sponsored NYU Abu Dhabi International Hackathon for Social Good. Competing internationally, our team engineered MedQure: a privacy-preserving Blind Quantum Computing (BQC) architecture for secure medical image processing. Operating under intense constraints, we built a protocol that leverages Quantum One-Time Pads (QOTP) and QRNG keys to encrypt sensitive patient MRI data on computationally limited client devices. The encrypted matrices were then securely delegated to an untrusted cloud server, where we implemented an 8-qubit Blind Grover\'s Search algorithm to achieve quadratic speedups in tumor detection without ever decrypting the underlying data. This framework won 3rd Prize globally, proving my ability to turn highly abstract quantum mechanics into functional, mathematically sound code early in my career.',
    type: 'award',
  },
  {
    id: 'lnmiit',
    date: '2020 — 2024',
    title: 'B.Tech · Electronics & Communication',
    org: 'The LNM Institute of Information Technology',
    location: 'Jaipur, India',
    description:
      'Grounded in a B.Tech in Electronics and Communication Engineering from LNMIIT, my expertise centers on the internal mechanics of computing hardware -> specifically low-level register dynamics, embedded systems and signal processing. Fascinated by hardware-software interfaces and decentralized architectures, I developed a final-year project leveraging blockchain frameworks within smart grid environments to optimize distributed, secure energy data routing. This deep dive into secure, low-level data systems naturally catalyzed my entry into quantum information, leading to an internship in quantum computing where I explored quantum-classical acceleration and algorithmic optimization',
    type: 'education',
  },
];
