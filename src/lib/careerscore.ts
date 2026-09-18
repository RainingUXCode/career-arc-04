/**
 * Camada de dados espelhando exatamente os contratos da CareerScoreAPI (Django/DRF).
 *
 *  POST /api/v1/auth/register/      -> User
 *  POST /api/v1/auth/login/         -> User
 *  GET|POST|PATCH /api/v1/profile/  -> Profile
 *  POST /api/v1/analysis/           -> Analysis
 *  GET  /api/v1/analysis/latest/    -> Analysis
 *  GET  /api/v1/jobs/search/        -> { data: Job[] }  (JSearch)
 *
 * Os dados abaixo são de exemplo: as telas já usam os mesmos campos da API,
 * então trocar o mock por `fetch` é uma substituição direta.
 */

export type User = {
  id: number;
  name: string;
  email: string;
};

export type Experience = {
  role: string;
  company: string;
  start: string;
  end: string;
  description: string;
};

export type Education = {
  degree: string;
  institution: string;
  year: string;
};

export type Profile = {
  id: number;
  headline: string;
  summary: string;
  city: string;
  target_role: string;
  skills: string[];
  experiences: Experience[];
  education: Education[];
  created_at: string;
  updated_at: string;
};

export type AnalysisStatus = "pending" | "completed" | "failed";

export type AnalysisResult = {
  strengths: string[];
  missing_skills: string[];
  recommended_roles: string[];
};

export type Analysis = {
  id: number;
  profile: number;
  result: AnalysisResult;
  status: AnalysisStatus;
  created_at: string;
};

/** Formato bruto devolvido pelo JSearch em `data[]`. */
export type Job = {
  job_id: string;
  job_title: string;
  employer_name: string;
  employer_logo: string | null;
  job_city: string | null;
  job_country: string | null;
  job_is_remote: boolean;
  job_employment_type: string;
  job_posted_at: string;
  job_apply_link: string;
  job_description: string;
  job_required_skills: string[];
};

/* ------------------------------------------------------------------ */
/* Career Score — derivado dos dados que a API já devolve               */
/* ------------------------------------------------------------------ */

export type ScoreBreakdown = {
  total: number;
  completeness: number;
  strengths: number;
  gaps: number;
};

const FIELDS: (keyof Profile)[] = [
  "headline",
  "summary",
  "city",
  "target_role",
  "skills",
  "experiences",
  "education",
];

export function profileCompleteness(profile: Profile | null): number {
  if (!profile) return 0;
  const filled = FIELDS.filter((field) => {
    const value = profile[field];
    return Array.isArray(value) ? value.length > 0 : String(value ?? "").trim().length > 0;
  }).length;
  return Math.round((filled / FIELDS.length) * 100);
}

/**
 * 50% preenchimento do perfil, 30% pontos fortes reconhecidos,
 * 20% ausência de lacunas críticas.
 */
export function careerScore(profile: Profile | null, analysis: Analysis | null): ScoreBreakdown {
  const completeness = profileCompleteness(profile);
  const strengths = analysis?.status === "completed" ? Math.min(100, analysis.result.strengths.length * 20) : 0;
  const missing = analysis?.status === "completed" ? analysis.result.missing_skills.length : 5;
  const gaps = Math.max(0, 100 - missing * 20);

  return {
    total: Math.round(completeness * 0.5 + strengths * 0.3 + gaps * 0.2),
    completeness,
    strengths,
    gaps,
  };
}

export function scoreLabel(total: number): string {
  if (total >= 85) return "Pronto para se candidatar";
  if (total >= 70) return "Competitivo, com ajustes";
  if (total >= 50) return "Em construção";
  return "Precisa de base";
}

/* ------------------------------------------------------------------ */
/* Dados de exemplo                                                     */
/* ------------------------------------------------------------------ */

export const mockProfile: Profile = {
  id: 1,
  headline: "Desenvolvedora back-end Python | Django & APIs",
  summary:
    "Quatro anos construindo APIs REST em Django e integrações com serviços externos. Foco em qualidade de código, testes e observabilidade. Buscando evoluir para posições de senioridade com responsabilidade de arquitetura.",
  city: "São Paulo, SP",
  target_role: "Desenvolvedora Back-end Sênior",
  skills: ["Python", "Django", "Django REST Framework", "PostgreSQL", "Docker", "Git", "Pytest"],
  experiences: [
    {
      role: "Desenvolvedora Back-end Pleno",
      company: "Northbase",
      start: "2023",
      end: "Atual",
      description: "APIs de cobrança em Django REST, migração para PostgreSQL particionado e cobertura de testes de 45% para 86%.",
    },
    {
      role: "Desenvolvedora Back-end Júnior",
      company: "Arvo Tech",
      start: "2021",
      end: "2023",
      description: "Integrações com gateways de pagamento e automação de rotinas internas em Python.",
    },
  ],
  education: [
    { degree: "Análise e Desenvolvimento de Sistemas", institution: "FIAP", year: "2021" },
  ],
  created_at: "2026-02-11T14:02:00Z",
  updated_at: "2026-09-16T09:41:00Z",
};

export const mockAnalysis: Analysis = {
  id: 12,
  profile: 1,
  status: "completed",
  created_at: "2026-09-16T09:44:00Z",
  result: {
    strengths: [
      "Domínio consistente de Django e Django REST Framework",
      "Histórico comprovado de elevar cobertura de testes",
      "Experiência real com PostgreSQL em volume",
      "Familiaridade com containerização e entrega contínua",
    ],
    missing_skills: [
      "Arquitetura de sistemas distribuídos",
      "Observabilidade (tracing e métricas)",
      "Mensageria assíncrona (Kafka ou RabbitMQ)",
    ],
    recommended_roles: [
      "Desenvolvedora Back-end Sênior",
      "Engenheira de Plataforma",
      "Tech Lead Back-end",
    ],
  },
};

export const mockJobs: Job[] = [
  {
    job_id: "jsr-001",
    job_title: "Pessoa Desenvolvedora Back-end Sênior (Python)",
    employer_name: "Nubank",
    employer_logo: null,
    job_city: "São Paulo",
    job_country: "BR",
    job_is_remote: true,
    job_employment_type: "FULLTIME",
    job_posted_at: "há 2 dias",
    job_apply_link: "https://example.com/vaga/1",
    job_description:
      "Construção e evolução de serviços de alta disponibilidade em Python, com foco em confiabilidade e escala.",
    job_required_skills: ["Python", "Django", "PostgreSQL", "Kafka", "AWS"],
  },
  {
    job_id: "jsr-002",
    job_title: "Engenheira de Software Back-end",
    employer_name: "Loft",
    employer_logo: null,
    job_city: "São Paulo",
    job_country: "BR",
    job_is_remote: false,
    job_employment_type: "FULLTIME",
    job_posted_at: "há 4 dias",
    job_apply_link: "https://example.com/vaga/2",
    job_description: "APIs REST em Django, integrações com parceiros e melhoria contínua da base de testes.",
    job_required_skills: ["Python", "Django REST Framework", "Docker", "Pytest"],
  },
  {
    job_id: "jsr-003",
    job_title: "Back-end Engineer | Plataforma",
    employer_name: "Stone",
    employer_logo: null,
    job_city: "Rio de Janeiro",
    job_country: "BR",
    job_is_remote: true,
    job_employment_type: "FULLTIME",
    job_posted_at: "há 1 semana",
    job_apply_link: "https://example.com/vaga/3",
    job_description: "Time de plataforma responsável por ferramentas internas, observabilidade e padrões de serviço.",
    job_required_skills: ["Python", "Observabilidade", "Kubernetes", "PostgreSQL"],
  },
  {
    job_id: "jsr-004",
    job_title: "Desenvolvedora Python Pleno/Sênior",
    employer_name: "iFood",
    employer_logo: null,
    job_city: "Campinas",
    job_country: "BR",
    job_is_remote: true,
    job_employment_type: "CONTRACTOR",
    job_posted_at: "há 9 dias",
    job_apply_link: "https://example.com/vaga/4",
    job_description: "Serviços de catálogo e pedidos, com forte cultura de testes automatizados.",
    job_required_skills: ["Python", "Django", "RabbitMQ", "Git"],
  },
];

/** Compatibilidade calculada localmente: interseção entre skills do perfil e da vaga. */
export function jobMatch(job: Job, profile: Profile | null): number {
  if (!profile || job.job_required_skills.length === 0) return 0;
  const owned = new Set(profile.skills.map((s) => s.toLowerCase()));
  const hits = job.job_required_skills.filter((s) => owned.has(s.toLowerCase())).length;
  return Math.round((hits / job.job_required_skills.length) * 100);
}

export function matchedSkills(job: Job, profile: Profile | null) {
  const owned = new Set((profile?.skills ?? []).map((s) => s.toLowerCase()));
  return {
    have: job.job_required_skills.filter((s) => owned.has(s.toLowerCase())),
    missing: job.job_required_skills.filter((s) => !owned.has(s.toLowerCase())),
  };
}

export const employmentTypeLabel: Record<string, string> = {
  FULLTIME: "Tempo integral",
  PARTTIME: "Meio período",
  CONTRACTOR: "Contrato",
  INTERN: "Estágio",
};
