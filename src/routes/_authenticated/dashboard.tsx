import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  careerScore,
  mockAnalysis,
  mockProfile,
  scoreLabel,
  type Analysis,
  type AnalysisStatus,
} from "@/lib/careerscore";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Diagnóstico — CareerScore" },
      {
        name: "description",
        content: "Seu Career Score, pontos fortes, lacunas de competência e cargos recomendados.",
      },
      { property: "og:title", content: "Diagnóstico — CareerScore" },
      { property: "og:description", content: "Pontos fortes, lacunas e cargos recomendados a partir do seu perfil." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DiagnosticPage,
});

function useCountUp(target: number, active: boolean, duration = 1400, delay = 0) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!active) {
      setValue(0);
      return;
    }
    let raf = 0;
    const t = setTimeout(() => {
      const start = performance.now();
      const step = (now: number) => {
        const p = Math.min(1, (now - start) / duration);
        setValue(Math.round(target * (1 - Math.pow(1 - p, 3))));
        if (p < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    }, delay);
    return () => {
      clearTimeout(t);
      cancelAnimationFrame(raf);
    };
  }, [target, active, duration, delay]);
  return value;
}

function DiagnosticPage() {
  const profile = mockProfile;
  const [analysis, setAnalysis] = useState<Analysis>(mockAnalysis);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 300);
    return () => clearTimeout(t);
  }, []);

  /** Simula POST /api/v1/analysis/ (pending -> completed). */
  function runAnalysis() {
    setReady(false);
    setAnalysis((a) => ({ ...a, status: "pending" }));
    setTimeout(() => {
      setAnalysis({ ...mockAnalysis, created_at: new Date().toISOString() });
      setReady(true);
    }, 2200);
  }

  const pending = analysis.status === "pending";
  const score = careerScore(profile, analysis.status === "completed" ? analysis : null);
  const shown = useCountUp(score.total, ready && !pending);

  return (
    <div className="space-y-8">
      <header className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <p className="text-[12px] text-muted-foreground">Diagnóstico de carreira</p>
          <h1 className="mt-1 text-[26px] font-semibold tracking-tight">{profile.target_role}</h1>
          <p className="mt-1 text-[12.5px] text-muted-foreground">
            {profile.headline} · {profile.city}
          </p>
        </div>
        <button
          onClick={runAnalysis}
          disabled={pending}
          className="rounded-lg bg-brand px-4 py-2.5 text-[13px] font-medium text-brand-foreground transition-all hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          {pending ? "Analisando…" : "Rodar nova análise"}
        </button>
      </header>

      <StatusRow status={analysis.status} createdAt={analysis.created_at} />

      {/* Career Score */}
      <section className="rounded-2xl border border-border bg-card shadow-elevated overflow-hidden">
        <div className="grid md:grid-cols-[320px_1fr]">
          <div className="p-7 border-b md:border-b-0 md:border-r border-border/70">
            <p className="text-[11.5px] uppercase tracking-[0.14em] text-muted-foreground">Career Score</p>
            <div className="mt-4 flex items-end gap-2">
              <span
                className={`font-mono text-[64px] leading-none tracking-tight transition-opacity duration-500 ${
                  pending ? "opacity-40" : "opacity-100"
                }`}
              >
                {pending ? "—" : shown}
              </span>
              <span className="mb-2 text-[13px] text-muted-foreground">/100</span>
            </div>
            <p className="mt-2 text-[12.5px] text-emerald">{pending ? "Recalculando…" : scoreLabel(score.total)}</p>

            <div className="mt-5 h-1 rounded-full bg-elevated overflow-hidden">
              <div
                className={`h-full rounded-full bg-emerald transition-[width] duration-[1600ms] ease-out ${
                  pending ? "animate-shimmer" : ""
                }`}
                style={{ width: pending ? "35%" : `${score.total}%` }}
              />
            </div>
          </div>

          <div className="p-7 grid sm:grid-cols-3 gap-6">
            <Metric label="Perfil completo" value={score.completeness} active={ready && !pending} color="emerald" />
            <Metric label="Pontos fortes" value={score.strengths} active={ready && !pending} color="violet" delay={140} />
            <Metric label="Sem lacunas" value={score.gaps} active={ready && !pending} color="amber" delay={280} />
          </div>
        </div>
      </section>

      {/* Resultado da análise */}
      <div className="grid md:grid-cols-2 gap-5">
        <ListCard
          title="Pontos fortes"
          hint="result.strengths"
          accent="emerald"
          items={analysis.result.strengths}
          loading={pending}
        />
        <ListCard
          title="Lacunas de competência"
          hint="result.missing_skills"
          accent="amber"
          items={analysis.result.missing_skills}
          loading={pending}
        />
      </div>

      <section className="rounded-2xl border border-border bg-elevated p-7">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="text-[11.5px] uppercase tracking-[0.14em] text-violet">Cargos recomendados</p>
            <p className="mt-1 text-[12.5px] text-muted-foreground">
              Sugeridos a partir das suas experiências e competências.
            </p>
          </div>
          <Link
            to="/vagas"
            className="text-[12.5px] text-brand hover:underline underline-offset-4"
          >
            Ver vagas compatíveis →
          </Link>
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          {analysis.result.recommended_roles.map((role) => (
            <span
              key={role}
              className="rounded-lg border border-violet/25 bg-violet/10 px-3 py-2 text-[12.5px] text-foreground transition-colors hover:border-violet/50"
            >
              {role}
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}

function StatusRow({ status, createdAt }: { status: AnalysisStatus; createdAt: string }) {
  const map: Record<AnalysisStatus, { label: string; color: string }> = {
    pending: { label: "Análise em andamento", color: "bg-amber" },
    completed: { label: "Análise concluída", color: "bg-emerald" },
    failed: { label: "Não foi possível concluir a análise", color: "bg-danger" },
  };
  const s = map[status];
  const when = new Date(createdAt).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });

  return (
    <div className="flex items-center gap-2.5 text-[12px] text-muted-foreground">
      <span className={`size-1.5 rounded-full ${s.color} animate-pulse-dot`} />
      {s.label}
      <span className="text-border">·</span>
      <span className="font-mono">{when}</span>
    </div>
  );
}

function Metric({
  label,
  value,
  active,
  color,
  delay = 0,
}: {
  label: string;
  value: number;
  active: boolean;
  color: "emerald" | "violet" | "amber";
  delay?: number;
}) {
  const shown = useCountUp(value, active, 1100, delay);
  const bar = { emerald: "bg-emerald", violet: "bg-violet", amber: "bg-amber" }[color];
  return (
    <div>
      <p className="text-[12px] text-muted-foreground">{label}</p>
      <p className="mt-1.5 font-mono text-[24px] leading-none">{active ? shown : "—"}</p>
      <div className="mt-3 h-[3px] rounded-full bg-background/60 overflow-hidden">
        <div
          className={`h-full rounded-full ${bar} transition-[width] duration-1000 ease-out`}
          style={{ width: active ? `${value}%` : "0%", transitionDelay: `${delay}ms` }}
        />
      </div>
    </div>
  );
}

function ListCard({
  title,
  hint,
  items,
  accent,
  loading,
}: {
  title: string;
  hint: string;
  items: string[];
  accent: "emerald" | "amber";
  loading: boolean;
}) {
  const dot = accent === "emerald" ? "bg-emerald" : "bg-amber";
  return (
    <section className="rounded-2xl border border-border bg-card p-6 transition-colors hover:border-border/100">
      <div className="flex items-baseline justify-between">
        <h2 className="text-[14px] font-medium tracking-tight">{title}</h2>
        <span className="font-mono text-[10.5px] text-muted-foreground">{hint}</span>
      </div>
      <ul className="mt-4 space-y-3">
        {loading
          ? [0, 1, 2].map((i) => (
              <li key={i} className="h-4 rounded bg-elevated animate-shimmer" style={{ width: `${90 - i * 12}%` }} />
            ))
          : items.map((item, i) => (
              <li
                key={item}
                className="flex gap-2.5 text-[13px] leading-relaxed animate-fade-up"
                style={{ animationDelay: `${i * 70}ms` }}
              >
                <span className={`mt-[7px] size-1.5 shrink-0 rounded-full ${dot}`} />
                {item}
              </li>
            ))}
      </ul>
    </section>
  );
}
