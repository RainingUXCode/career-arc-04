import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  employmentTypeLabel,
  jobMatch,
  matchedSkills,
  mockJobs,
  mockProfile,
  type Job,
} from "@/lib/careerscore";

export const Route = createFileRoute("/_authenticated/vagas")({
  head: () => ({
    meta: [
      { title: "Vagas compatíveis — CareerScore" },
      {
        name: "description",
        content: "Busca de vagas por cargo alvo e competências, com compatibilidade calculada pelo seu perfil.",
      },
      { property: "og:title", content: "Vagas compatíveis — CareerScore" },
      { property: "og:description", content: "Vagas ordenadas pela compatibilidade com o seu perfil." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: JobsPage,
});

function JobsPage() {
  const profile = mockProfile;
  const [targetRole, setTargetRole] = useState(profile.target_role);
  const [skills, setSkills] = useState(profile.skills.join(", "));
  const [loading, setLoading] = useState(false);
  const [jobs, setJobs] = useState<Job[]>(mockJobs);

  /** Simula GET /api/v1/jobs/search/?target_role=&skills= */
  function search(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      const query = targetRole.toLowerCase();
      setJobs(
        mockJobs.filter(
          (job) => !query || job.job_title.toLowerCase().includes(query.split(" ")[0] ?? "") || true,
        ),
      );
      setLoading(false);
    }, 1200);
  }

  const ordered = [...jobs].sort((a, b) => jobMatch(b, profile) - jobMatch(a, profile));

  return (
    <div className="space-y-8">
      <header>
        <p className="text-[12px] text-muted-foreground">Vagas compatíveis</p>
        <h1 className="mt-1 text-[26px] font-semibold tracking-tight">
          Onde o seu perfil já é competitivo
        </h1>
        <p className="mt-1 text-[12.5px] text-muted-foreground">
          A busca usa o cargo alvo e as competências do seu perfil.
        </p>
      </header>

      <form
        onSubmit={search}
        className="rounded-2xl border border-border bg-card p-5 grid md:grid-cols-[1fr_1fr_auto] gap-3"
      >
        <label className="block">
          <span className="text-[11.5px] text-muted-foreground font-mono">target_role</span>
          <input
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-input bg-background/50 px-3.5 py-2.5 text-[13px] outline-none transition-colors focus:border-brand/60 focus:ring-2 focus:ring-brand/15"
          />
        </label>
        <label className="block">
          <span className="text-[11.5px] text-muted-foreground font-mono">skills</span>
          <input
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-input bg-background/50 px-3.5 py-2.5 text-[13px] outline-none transition-colors focus:border-brand/60 focus:ring-2 focus:ring-brand/15"
          />
        </label>
        <button
          type="submit"
          disabled={loading}
          className="self-end rounded-lg bg-brand px-5 py-2.5 text-[13px] font-medium text-brand-foreground transition-all hover:brightness-110 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          {loading ? "Buscando…" : "Buscar vagas"}
        </button>
      </form>

      <div className="space-y-3">
        {loading
          ? [0, 1, 2].map((i) => (
              <div key={i} className="h-[132px] rounded-2xl border border-border bg-card animate-shimmer" />
            ))
          : ordered.map((job, i) => (
              <JobCard key={job.job_id} job={job} index={i} featured={i === 0} />
            ))}
      </div>
    </div>
  );
}

function JobCard({ job, index, featured }: { job: Job; index: number; featured: boolean }) {
  const match = jobMatch(job, mockProfile);
  const { have, missing } = matchedSkills(job, mockProfile);

  return (
    <article
      className={`group rounded-2xl border p-6 transition-all duration-300 animate-fade-up hover:-translate-y-0.5 ${
        featured
          ? "border-border bg-elevated shadow-elevated"
          : "border-border/70 bg-card hover:border-border"
      }`}
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="flex items-start justify-between gap-6 flex-wrap">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
            <span className="text-foreground/90">{job.employer_name}</span>
            <span className="text-border">·</span>
            <span>
              {job.job_is_remote ? "Remoto" : `${job.job_city}, ${job.job_country}`}
            </span>
            <span className="text-border">·</span>
            <span>{employmentTypeLabel[job.job_employment_type] ?? job.job_employment_type}</span>
          </div>
          <h2 className="mt-1.5 text-[15.5px] font-medium tracking-tight">{job.job_title}</h2>
          <p className="mt-2 max-w-2xl text-[12.5px] leading-relaxed text-muted-foreground">
            {job.job_description}
          </p>
        </div>

        <div className="text-right shrink-0">
          <p className="font-mono text-[26px] leading-none text-emerald">{match}%</p>
          <p className="mt-1 text-[11px] text-muted-foreground">compatibilidade</p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-1.5">
        {have.map((s) => (
          <span
            key={s}
            className="rounded-md border border-emerald/25 bg-emerald/10 px-2.5 py-1 text-[11.5px]"
          >
            {s}
          </span>
        ))}
        {missing.map((s) => (
          <span
            key={s}
            className="rounded-md border border-amber/25 bg-amber/10 px-2.5 py-1 text-[11.5px] text-foreground/80"
          >
            {s}
          </span>
        ))}
      </div>

      <div className="mt-5 flex items-center justify-between gap-4 border-t border-border/60 pt-4">
        <span className="font-mono text-[11px] text-muted-foreground">{job.job_posted_at}</span>
        <a
          href={job.job_apply_link}
          target="_blank"
          rel="noreferrer"
          className="text-[12.5px] text-brand transition-opacity hover:underline underline-offset-4"
        >
          Ver vaga →
        </a>
      </div>
    </article>
  );
}
