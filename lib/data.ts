export type Focus = {
  index: string;
  title: string;
  gloss: string;
  description: string;
  icon: "waves" | "globe" | "cpu" | "bot";
};

export const focusAreas: Focus[] = [
  {
    index: "01",
    title: "QGSW Dynamics",
    gloss: "quasi-geostrophic shallow water",
    description:
      "Vortex-in-cell modeling of quasi-geostrophic shallow-water flow on the sphere — potential vorticity, streamfunctions, and stable discretizations.",
    icon: "waves",
  },
  {
    index: "02",
    title: "MITgcm Systems",
    gloss: "ocean general circulation",
    description:
      "Reproducible simulation workflows for atmosphere–ocean dynamics: build systems, verification experiments, and diagnostics.",
    icon: "globe",
  },
  {
    index: "03",
    title: "CUDA / HPC",
    gloss: "GPU computing",
    description:
      "Kernels shaped around memory locality and measured throughput — reductions, stencils, coarsening, occupancy optimization.",
    icon: "cpu",
  },
  {
    index: "04",
    title: "LLM Tooling",
    gloss: "scientific interfaces",
    description:
      "Retrieval-augmented agents that read model documentation, modify code, and launch simulations from natural language.",
    icon: "bot",
  },
];

export type Product = {
  index: string;
  name: string;
  status: "in-development" | "shipped" | "research";
  tagline: string;
  description: string;
  tags: string[];
  href?: string;
  featured?: boolean;
};

export const products: Product[] = [
  {
    index: "P-01",
    name: "LLM APA",
    status: "in-development",
    tagline: "Incoming project — specifics to be announced.",
    description:
      "A new LLM-powered product currently in development. Technical details, scope, and launch notes will be published here.",
    tags: ["LLM", "Agents", "In development"],
    featured: true,
  },
  {
    index: "P-02",
    name: "Agentic MITgcm Interface",
    status: "research",
    tagline: "Natural language in, ocean simulations out.",
    description:
      "An LLM/RAG system that queries MITgcm documentation, edits model code, and executes simulations through conversational commands.",
    tags: ["RAG", "Python", "MITgcm"],
    href: "https://github.com/Hoda-Hashemi",
  },
  {
    index: "P-03",
    name: "VIC-QGSW Solver",
    status: "research",
    tagline: "Vortex-in-cell dynamics on the sphere.",
    description:
      "A vortex-in-cell model for quasi-geostrophic shallow-water equations over spherical geometry — PV conservation as a first-class diagnostic.",
    tags: ["Julia", "Numerical methods", "GFD"],
    href: "https://github.com/Hoda-Hashemi",
  },
  {
    index: "P-04",
    name: "CUDA Needleman–Wunsch",
    status: "shipped",
    tagline: "Sequence alignment at GPU speed.",
    description:
      "Parallel Needleman–Wunsch on CUDA and the Octopus HPC cluster: reduction trees, stencils, thread coarsening, occupancy tuning.",
    tags: ["CUDA", "C++", "HPC"],
    href: "https://github.com/Hoda-Hashemi",
  },
];

export type Article = {
  index: string;
  title: string;
  description: string;
  href: string;
  tags: string[];
  kind: "notes" | "lecture";
};

export const articles: Article[] = [
  {
    index: "A-01",
    title: "Navier–Stokes from First Principles",
    description:
      "Conservation of mass and momentum, stress tensors, and incompressibility — the full derivation, term by term.",
    href: "/notes/NS.html",
    tags: ["Fluid dynamics", "Derivation"],
    kind: "lecture",
  },
  {
    index: "A-02",
    title: "The Shallow-Water Equations",
    description:
      "From Navier–Stokes to shallow water: hydrostatic balance, scaling arguments, and the kinematic boundary condition.",
    href: "/notes/SW.html",
    tags: ["GFD", "Derivation"],
    kind: "lecture",
  },
  {
    index: "A-03",
    title: "Quasi-Geostrophic Shallow Water",
    description:
      "Rossby numbers, geostrophic balance, and potential vorticity — deriving the QGSW model used across my research.",
    href: "/notes/QSW.html",
    tags: ["QGSW", "Derivation"],
    kind: "lecture",
  },
  {
    index: "A-04",
    title: "QGSW on the Sphere",
    description:
      "Spherical coordinates, unit vectors, and the primitive equations — extending QGSW to global geometry.",
    href: "/notes/SphericalQSW.html",
    tags: ["QGSW", "Spherical geometry"],
    kind: "lecture",
  },
  {
    index: "A-05",
    title: "Installing MITgcm",
    description:
      "A practical walkthrough of dependencies, build configuration, and first runs of the MIT General Circulation Model.",
    href: "/notes/InstallingMITGCM.html",
    tags: ["MITgcm", "Guide"],
    kind: "notes",
  },
  {
    index: "A-06",
    title: "Understanding MITgcm",
    description:
      "Model anatomy: packages, verification experiments, and how the source tree maps to the physics.",
    href: "/notes/UnderstandingMITGCM.html",
    tags: ["MITgcm", "Guide"],
    kind: "notes",
  },
];

export const education = [
  {
    period: "2023 — present",
    degree: "M.Sc. Computational Science",
    school: "American University of Beirut",
    note: "Optimization, GPU computing, statistical learning, finite elements, vortex methods.",
  },
  {
    period: "2019 — 2023",
    degree: "B.Sc. Theoretical Physics · Minor in Pure Mathematics",
    school: "American University of Beirut",
    note: "Analysis, differential equations, algebra, manifolds, probability, numerical computing.",
  },
  {
    period: "2021 — 2022",
    degree: "Exchange Program",
    school: "Pitzer College, Claremont CA",
    note: "Statistical physics, French, and R programming.",
  },
];

export const experience = [
  {
    period: "2025 — present",
    role: "Graduate Research Assistant",
    org: "Microflows & Microscale Heat Transfer Lab, AUB",
    note: "Numerical modeling of microscale flow and heat-transfer systems.",
  },
  {
    period: "2024 — present",
    role: "MITgcm Simulations of Atmosphere–Ocean Dynamics",
    org: "Research project",
    note: "Simulation workflows and numerical experiments in climate dynamics.",
  },
  {
    period: "2024 — present",
    role: "Vortex-in-Cell QGSW on the Sphere",
    org: "M.Sc. research",
    note: "Computational modeling of quasi-geostrophic shallow-water equations over spherical geometry.",
  },
];

export const projects = [
  {
    period: "2025",
    name: "Agentic System for MITgcm",
    note: "LLM/RAG interface for querying documentation, modifying code, and executing simulations in natural language.",
  },
  {
    period: "2024",
    name: "Needleman–Wunsch on CUDA",
    note: "Parallel implementation on CUDA + Octopus HPC with reduction trees, stencils, coarsening, occupancy optimization.",
  },
  {
    period: "2023",
    name: "Diffusion–Convection PDE on a T-Membrane",
    note: "Finite-element and Galerkin analysis in FreeFem and MATLAB with numerical–analytical comparison.",
  },
  {
    period: "2023",
    name: "Inference of Nonlinear Dynamical Systems",
    note: "Data assimilation for the Van der Pol oscillator via adjoint-based BFGS and Bayesian optimization.",
  },
];

export const skills = [
  { group: "Languages", items: ["Python", "Julia", "Fortran", "C/C++", "MATLAB", "R"] },
  { group: "HPC", items: ["CUDA", "Slurm", "MPI basics", "Profiling"] },
  { group: "Scientific", items: ["MITgcm", "FreeFem++", "FEM", "Vortex methods", "Data assimilation"] },
  { group: "Tooling", items: ["LLM/RAG", "Git", "LaTeX", "Linux"] },
];
