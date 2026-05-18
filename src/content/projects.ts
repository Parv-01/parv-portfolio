export type ProjectStatus = 'active' | 'experimental' | 'archived';
// This is the particular page where we list all the projects. Each project has an id, title, description, long description, stack, status, tags, and links to GitHub, papers, or demos. The projects are categorized as active, experimental, or archived based on their current state of development. 
export type Project = {
  id: string;
  title: string;
  description: string;
  longDescription?: string;
  stack: string[];
  status: ProjectStatus;
  tags: string[];
  links?: {
    github?: string;
    paper?: string;
    demo?: string;
  };
  highlight?: string;
};

// TODO: replace the placeholder GitHub URL below with the real per-project repo.
const PLACEHOLDER_REPO = 'https://github.com/Parv-01/Quantum-FDP-2025';

export const projects: Project[] = [
  {
  id: 'medqure',
  title: 'MedQure',
  description:
    'Privacy-preserving brain tumor classification from MRI data using Blind Quantum Computing and Grover’s search algorithm.',
  longDescription:
    'MedQure addresses critical privacy concerns in cloud-based healthcare AI by implementing a tumor classification system powered by Blind Quantum Computing (BQC). BQC allows computationally limited clients to delegate sensitive medical data processing to untrusted quantum servers, enabling arbitrary computations on encrypted data without ever requiring decryption. Alongside this secure infrastructure, the system utilizes Grover’s quantum search algorithm to optimize and accelerate the detection of brain tumors within MRI datasets, bridging quantum-secure cryptography with advanced medical diagnostics.',
  stack: ['Qiskit', 'Python', 'Quantum Cryptography', 'OpenCV', 'Grover Search'],
  status: 'archived', 
  tags: ['Quantum Computing', 'Healthcare', 'Privacy', 'Computer Vision'],
  links: { 
    github: 'https://github.com/Parv-01/NYUAD-2022/tree/main/MedQure' 
  },
  highlight: 'NYUAD Hackathon 2022',
},
  {
    id: '8085-simulator',
    title: '8085 Hybrid Simulator',
    description:
      'Retro-modern web simulator for the Intel 8085 with step-by-step fetch / decode / execute, memory map, and an instructional UI.',
    longDescription:
      'A teaching-grade 8085 simulator: a WebAssembly core that exposes register/flag/memory state per micro-step, with a React UI that visualises the fetch-decode-execute cycle, T-states, and the address/data buses. Built for first-year micro-architecture students who need to see why a MOV A,B takes 4 T-states.',
    stack: ['React', 'TypeScript', 'WebAssembly'],
    status: 'experimental',
    tags: ['Education', 'Systems', 'Web'],
    links: { demo: '/playground' },
  },
  {
  id: 'llm-huggingface-basics',
  title: 'LLM Hugging Face Basics',
  description:
    'A centralized repository of personal notes, hands-on tutorials, and implementation scripts covering foundational Large Language Model engineering concepts using the Hugging Face ecosystem.',
  longDescription:
    'A curated documentation and code workspace mapping out core concepts in LLM engineering. It serves as a study track for utilizing the Hugging Face ecosystem, focusing on the abstraction layers of the ecosystem—from high-level `pipeline` APIs for quick task deployment (sentiment analysis, NER, translation) to low-level control with tokenizers, models, and custom configurations. The material covers essential workflows including environment setups, loading and testing pre-trained causal models, working with the Hub datasets, half-precision execution (FP16), and optimizing text generation using the `generate()` API.',
  stack: ['Python', 'Transformers', 'Tokenizers', 'Datasets', 'PyTorch'],
  status: 'active', 
  tags: ['LLM Engineering', 'Hugging Face', 'Deep Learning', 'Study Notes'],
  links: { 
    github: 'https://github.com/Parv-01/LLM-Hugging-face-Basics/tree/main' 
  },
  highlight: 'Personal Knowledge Base ',
},
  ];
