import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — CareerScore" },
      { name: "description", content: "Seu Career Score, próximos passos, vagas compatíveis e editor ATS." },
    ],
  }),
  component: Dashboard,
});

/* ---------- Animation hooks ---------- */
function useCountUp(target: number, active: boolean, duration = 1400, delay = 0) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!active) return;
    let raf = 0;
    const t = setTimeout(() => {
      const start = performance.now();
      const step = (now: number) => {
        const p = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - p, 3);
        setValue(Math.round(target * eased));
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

function Dashboard() {
  const { user } = Route.useRouteContext();
  const navigate = useNavigate();
  const [tab, setTab] = useState<"overview" | "plan" | "jobs" | "resume">("overview");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 400);
    return () => clearTimeout(t);
  }, []);

  async function handleSignOut() {
    await supabase.auth.signOut();
    navigate({ to: "/auth", search: { mode: "signin" }, replace: true });
  }

  const displayName = (user.user_metadata?.full_name as string | undefined) || user.email?.split("@")[0] || "profissional";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <TopBar email={user.email ?? ""} onSignOut={handleSignOut} />

      <main className="max-w-6xl mx-auto px-6 pt-8 pb-24">
        {/* Greeting */}
        <div className="flex items-end justify-between flex-wrap gap-4">
          <div>
            <p className="text-[12px] text-muted-foreground">Bem-vindo de volta</p>
            <h1 className="mt-1 text-[26px] font-semibold tracking-tight capitalize">{displayName}</h1>
          </div>
          <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
            <span className="size-1.5 rounded-full bg-emerald animate-pulse-dot" />
            Última análise há 2h
          </div>
        </div>

        <Tabs value={tab} onChange={setTab} />

        {tab === "overview" && <Overview ready={ready} />}
        {tab === "plan" && <PlanTab />}
        {tab === "jobs" && <JobsTab />}
        {tab === "resume" && <ResumeTab />}
      </main>
    </div>
  );
}

/* ---------- Top bar ---------- */
function TopBar({ email, onSignOut }: { email: string; onSignOut: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="size-6 rounded-md bg-brand grid place-items-center ring-1 ring-inset ring-white/15">
            <span className="text-[11px] font-bold text-brand-foreground">C</span>
          </div>
          <span className="text-[14px] font-semibold tracking-tight">CareerScore</span>
        </Link>
        <div className="flex items-center gap-4">
          <button className="text-[12.5px] text-muted-foreground hover:text-foreground transition-colors">
            Ajuda
          </button>
          <div className="relative" ref={ref}>
            <button
              onClick={() => setOpen(!open)}
              className="size-8 rounded-full bg-surface-2 border border-border grid place-items-center text-[11px] font-medium hover:border-brand/40 transition-colors"
              aria-label="Menu do usuário"
            >
              {email.slice(0, 1).toUpperCase()}
            </button>
            {open && (
              <div className="absolute right-0 top-10 w-56 rounded-lg border border-border bg-surface shadow-[0_16px_40px_-12px_rgba(0,0,0,0.6)] p-1.5">
                <div className="px-2.5 py-2 border-b border-border mb-1">
                  <p className="text-[12px] text-muted-foreground">Conectado como</p>
                  <p className="text-[12.5px] font-medium truncate">{email}</p>
                </div>
                <button className="w-full text-left text-[12.5px] px-2.5 py-1.5 rounded-md hover:bg-white/[0.04] transition-colors">
                  Configurações
                </button>
                <button
                  onClick={onSignOut}
                  className="w-full text-left text-[12.5px] px-2.5 py-1.5 rounded-md hover:bg-white/[0.04] text-danger transition-colors"
                >
                  Sair
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

/* ---------- Tabs ---------- */
type TabKey = "overview" | "plan" | "jobs" | "resume";
function Tabs({ value, onChange }: { value: TabKey; onChange: (v: TabKey) => void }) {
  const tabs: { key: TabKey; label: string }[] = [
    { key: "overview", label: "Visão geral" },
    { key: "plan", label: "Plano de evolução" },
    { key: "jobs", label: "Vagas compatíveis" },
    { key: "resume", label: "Currículo ATS" },
  ];
  return (
    <div className="mt-8 border-b border-border flex items-center gap-1">
      {tabs.map((t) => (
        <button
          key={t.key}
          onClick={() => onChange(t.key)}
          className={`relative px-3 py-2.5 text-[13px] transition-colors ${
            value === t.key ? "text-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {t.label}
          {value === t.key && <span className="absolute inset-x-0 -bottom-px h-px bg-brand" />}
        </button>
      ))}
    </div>
  );
}

/* ---------- Overview tab ---------- */
function Overview({ ready }: { ready: boolean }) {
  const score = useCountUp(84, ready, 1600);
  const delta = useCountUp(12, ready, 1400, 200);

  return (
    <div className="mt-8 grid grid-cols-12 gap-4">
      {/* Career Score panel */}
      <section className="col-span-12 lg:col-span-8 rounded-xl border border-border bg-surface p-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] uppercase tracking-wider text-muted-foreground">Career Score</span>
              <span className="text-[10px] font-medium bg-brand/10 text-brand px-1.5 py-0.5 rounded border border-brand/20">v2.4</span>
            </div>
            <div className="mt-4 flex items-baseline gap-3">
              <span className="text-[64px] leading-none font-semibold tracking-tight tabular-nums">
                {score}
              </span>
              <span className="text-[13px] text-muted-foreground">/ 100</span>
              <span className="ml-2 inline-flex items-center gap-1 text-[12px] font-medium text-emerald bg-emerald/10 border border-emerald/20 px-1.5 py-0.5 rounded">
                <span aria-hidden>↑</span> +{delta} esta semana
              </span>
            </div>
            <p className="mt-2 text-[13px] text-muted-foreground max-w-md">
              Você está no <span className="text-foreground font-medium">top 18%</span> de profissionais Senior Frontend do mercado brasileiro.
            </p>
          </div>
          <div className="hidden sm:block">
            <ScoreRing value={score} />
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-border grid grid-cols-3 gap-6">
          <Metric label="Aderência ao mercado" value={88} active={ready} delay={100} />
          <Metric label="ATS Score" value={91} active={ready} delay={220} tone="purple" />
          <Metric label="Senioridade percebida" value={76} active={ready} delay={340} />
        </div>
      </section>

      {/* Blockers card */}
      <aside className="col-span-12 lg:col-span-4 rounded-xl border border-border bg-surface p-6">
        <div className="flex items-center justify-between">
          <span className="text-[11px] uppercase tracking-wider text-muted-foreground">Bloqueadores</span>
          <span className="text-[11px] text-muted-foreground">3 abertos</span>
        </div>
        <ul className="mt-4 space-y-3">
          <BlockerItem tone="danger" title="Falta de projeto com escala" impact="-8 pts" />
          <BlockerItem tone="warn" title="Kubernetes ausente no CV" impact="-4 pts" />
          <BlockerItem tone="warn" title="Sem métricas de impacto quantificadas" impact="-3 pts" />
        </ul>
        <button className="mt-5 w-full text-[12.5px] font-medium bg-white/[0.04] hover:bg-white/[0.08] text-foreground px-3 py-2 rounded-md border border-border transition-colors">
          Ver plano de correção →
        </button>
      </aside>

      {/* Weekly evolution */}
      <section className="col-span-12 lg:col-span-8 rounded-xl border border-border bg-surface p-6">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-muted-foreground">Evolução</span>
            <p className="mt-1 text-[14px] font-medium">Últimas 8 semanas</p>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
            <span className="inline-flex items-center gap-1.5"><span className="size-1.5 rounded-full bg-brand" /> Score</span>
            <span className="inline-flex items-center gap-1.5"><span className="size-1.5 rounded-full bg-purple" /> ATS</span>
          </div>
        </div>
        <ChartMini ready={ready} />
      </section>

      {/* Next action */}
      <aside className="col-span-12 lg:col-span-4 rounded-xl border border-border bg-surface p-6">
        <span className="text-[11px] uppercase tracking-wider text-muted-foreground">Próxima ação</span>
        <p className="mt-3 text-[15px] font-medium leading-snug">
          Adicione uma métrica de impacto ao projeto <span className="text-brand">Checkout v3</span>.
        </p>
        <p className="mt-2 text-[12.5px] text-muted-foreground">
          Recrutadores de vagas Senior valorizam 3x mais bullets com número. Impacto estimado: <span className="text-emerald font-medium">+6 pts</span>.
        </p>
        <button className="mt-5 w-full text-[12.5px] font-medium bg-brand text-brand-foreground px-3 py-2 rounded-md ring-1 ring-inset ring-white/10">
          Editar bullet
        </button>
      </aside>
    </div>
  );
}

function Metric({
  label,
  value,
  active,
  delay,
  tone = "brand",
}: {
  label: string;
  value: number;
  active: boolean;
  delay: number;
  tone?: "brand" | "purple";
}) {
  const c = useCountUp(value, active, 1400, delay);
  const bar = tone === "purple" ? "bg-purple" : "bg-brand";
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="text-[11.5px] text-muted-foreground">{label}</span>
        <span className="text-[13px] font-medium tabular-nums">{c}</span>
      </div>
      <div className="mt-2 h-1 rounded-full bg-white/[0.05] overflow-hidden">
        <div
          className={`h-full ${bar} transition-all duration-[1400ms] ease-out`}
          style={{ width: active ? `${value}%` : "0%", transitionDelay: `${delay}ms` }}
        />
      </div>
    </div>
  );
}

function BlockerItem({ tone, title, impact }: { tone: "danger" | "warn"; title: string; impact: string }) {
  const dot = tone === "danger" ? "bg-danger" : "bg-warn";
  return (
    <li className="flex items-start gap-3">
      <span className={`mt-1.5 size-1.5 rounded-full ${dot}`} />
      <div className="flex-1 min-w-0">
        <p className="text-[13px] text-foreground leading-snug">{title}</p>
        <p className="text-[11.5px] text-muted-foreground mt-0.5">Impacto {impact}</p>
      </div>
    </li>
  );
}

function ScoreRing({ value }: { value: number }) {
  const size = 88;
  const stroke = 6;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (value / 100) * c;
  return (
    <svg width={size} height={size} className="rotate-[-90deg]">
      <circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} fill="none" />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        stroke="#2563EB"
        strokeWidth={stroke}
        strokeLinecap="round"
        fill="none"
        strokeDasharray={c}
        strokeDashoffset={offset}
        style={{ transition: "stroke-dashoffset 1.6s ease-out" }}
      />
    </svg>
  );
}

function ChartMini({ ready }: { ready: boolean }) {
  const points = [58, 61, 64, 67, 70, 74, 79, 84];
  const ats = [70, 72, 74, 78, 82, 85, 88, 91];
  const w = 640;
  const h = 140;
  const stepX = w / (points.length - 1);
  const path = (arr: number[]) =>
    arr
      .map((v, i) => {
        const x = i * stepX;
        const y = h - ((v - 50) / 50) * h;
        return `${i === 0 ? "M" : "L"} ${x} ${y}`;
      })
      .join(" ");
  return (
    <div className="mt-5 overflow-hidden">
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-[140px]">
        <defs>
          <linearGradient id="g1" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#2563EB" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#2563EB" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={`${path(points)} L ${w} ${h} L 0 ${h} Z`} fill="url(#g1)" opacity={ready ? 1 : 0} style={{ transition: "opacity 800ms 400ms" }} />
        <path
          d={path(points)}
          fill="none"
          stroke="#2563EB"
          strokeWidth={1.5}
          strokeDasharray={1200}
          strokeDashoffset={ready ? 0 : 1200}
          style={{ transition: "stroke-dashoffset 1.6s ease-out" }}
        />
        <path
          d={path(ats)}
          fill="none"
          stroke="#8B5CF6"
          strokeWidth={1.5}
          strokeDasharray={1200}
          strokeDashoffset={ready ? 0 : 1200}
          style={{ transition: "stroke-dashoffset 1.6s ease-out 200ms" }}
        />
      </svg>
    </div>
  );
}

/* ---------- Plan tab ---------- */
function PlanTab() {
  const items = [
    { impact: "+6", title: "Quantificar impacto em Checkout v3", desc: "Adicione métrica de conversão pós-refactor.", time: "10 min", tag: "Currículo" },
    { impact: "+4", title: "Certificação Kubernetes (CKAD)", desc: "Cobre gap crítico para 62% das vagas Senior FE mapeadas.", time: "3 semanas", tag: "Skill" },
    { impact: "+3", title: "Publicar case do sistema de design", desc: "Aumenta senioridade percebida — falta prova pública.", time: "1 semana", tag: "Portfólio" },
    { impact: "+2", title: "Atualizar bio do LinkedIn", desc: "Headline atual não menciona liderança técnica.", time: "5 min", tag: "Presença" },
  ];
  return (
    <div className="mt-8 rounded-xl border border-border bg-surface overflow-hidden">
      <div className="px-6 py-4 border-b border-border flex items-center justify-between">
        <div>
          <span className="text-[11px] uppercase tracking-wider text-muted-foreground">Plano priorizado</span>
          <p className="mt-1 text-[14px] font-medium">4 ações · impacto potencial +15 pts</p>
        </div>
        <button className="text-[12.5px] font-medium bg-white/[0.04] hover:bg-white/[0.08] px-3 py-1.5 rounded-md border border-border transition-colors">
          Gerar mais ações
        </button>
      </div>
      <ul>
        {items.map((it, i) => (
          <li key={i} className="px-6 py-4 border-b border-border last:border-b-0 flex items-start gap-4 hover:bg-white/[0.02] transition-colors">
            <div className="mt-0.5 min-w-[52px] h-7 rounded-md bg-emerald/10 border border-emerald/20 text-emerald text-[12.5px] font-medium grid place-items-center">
              {it.impact} pts
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-[13.5px] font-medium">{it.title}</p>
                <span className="text-[10.5px] text-muted-foreground border border-border rounded px-1.5 py-0.5">{it.tag}</span>
              </div>
              <p className="text-[12.5px] text-muted-foreground mt-1">{it.desc}</p>
            </div>
            <div className="text-[11.5px] text-muted-foreground whitespace-nowrap">{it.time}</div>
            <button className="text-[12px] text-brand hover:text-brand/80 font-medium">Iniciar</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ---------- Jobs tab ---------- */
function JobsTab() {
  const jobs = [
    { company: "Nubank", role: "Senior Frontend Engineer", match: 94, why: "Stack idêntico + experiência com fintech", stack: ["React", "TypeScript", "GraphQL"], salary: "R$ 22–28k" },
    { company: "Loft", role: "Staff Frontend", match: 88, why: "Match forte em performance e sistema de design", stack: ["Next.js", "Node", "AWS"], salary: "R$ 26–32k" },
    { company: "Stone", role: "Tech Lead Frontend", match: 82, why: "Gap: liderança formal de squad", stack: ["React", "K8s", "Go"], salary: "R$ 24–30k" },
    { company: "iFood", role: "Senior Software Engineer", match: 79, why: "Requer Kubernetes hands-on", stack: ["React", "Kotlin", "K8s"], salary: "R$ 20–26k" },
  ];
  return (
    <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
      {jobs.map((j) => (
        <article key={j.company} className="rounded-xl border border-border bg-surface p-5 hover:border-brand/30 transition-colors">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <div className="size-8 rounded-md bg-surface-2 border border-border grid place-items-center text-[12px] font-semibold">
                  {j.company.slice(0, 1)}
                </div>
                <div>
                  <p className="text-[13.5px] font-medium">{j.role}</p>
                  <p className="text-[11.5px] text-muted-foreground">{j.company} · Remoto</p>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[18px] font-semibold text-emerald tabular-nums leading-none">{j.match}%</div>
              <p className="text-[10.5px] text-muted-foreground mt-1">match</p>
            </div>
          </div>
          <p className="mt-4 text-[12.5px] text-muted-foreground leading-relaxed">
            <span className="text-foreground/80">Por que:</span> {j.why}
          </p>
          <div className="mt-3 flex items-center gap-1.5 flex-wrap">
            {j.stack.map((s) => (
              <span key={s} className="text-[10.5px] text-muted-foreground border border-border rounded px-1.5 py-0.5">{s}</span>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
            <span className="text-[12px] text-muted-foreground">{j.salary}</span>
            <button className="text-[12px] font-medium text-brand hover:text-brand/80">Ver vaga →</button>
          </div>
        </article>
      ))}
    </div>
  );
}

/* ---------- Resume tab ---------- */
function ResumeTab() {
  return (
    <div className="mt-8 grid grid-cols-12 gap-4">
      <div className="col-span-12 lg:col-span-8 rounded-xl border border-border bg-surface overflow-hidden">
        <div className="px-5 py-3 border-b border-border flex items-center justify-between bg-background/40">
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-danger/70" />
            <span className="size-2 rounded-full bg-warn/70" />
            <span className="size-2 rounded-full bg-emerald/70" />
            <span className="ml-3 text-[11.5px] text-muted-foreground">curriculo-v4.docx</span>
          </div>
          <span className="text-[10.5px] text-purple bg-purple/10 border border-purple/20 rounded px-1.5 py-0.5">
            IA ATS ativa
          </span>
        </div>
        <div className="p-8 bg-background/60 min-h-[420px] font-mono text-[12.5px] leading-relaxed">
          <p className="text-foreground font-semibold text-[15px]">Ana Silva</p>
          <p className="text-muted-foreground">Senior Frontend Engineer · São Paulo, BR</p>
          <div className="mt-6">
            <p className="text-muted-foreground text-[11px] uppercase tracking-wider">Experiência</p>
            <div className="mt-3">
              <p className="text-foreground">Frontend Lead · Empresa X (2022–hoje)</p>
              <ul className="mt-1.5 space-y-1 text-muted-foreground list-disc pl-4">
                <li>Liderou refactor do checkout v3 <span className="bg-warn/15 border border-warn/25 text-warn px-1 rounded">adicionar métrica de impacto</span></li>
                <li>Mentoria de 4 devs pleno</li>
                <li>Reduziu <span className="text-emerald">TTI em 38%</span> na home logada</li>
              </ul>
            </div>
          </div>
          <div className="mt-6">
            <p className="text-muted-foreground text-[11px] uppercase tracking-wider">Skills</p>
            <p className="mt-2 text-foreground/90">React, TypeScript, Next.js, GraphQL, Node.js <span className="bg-danger/15 border border-danger/25 text-danger px-1 rounded">Kubernetes ausente</span></p>
          </div>
        </div>
      </div>

      <aside className="col-span-12 lg:col-span-4 space-y-4">
        <div className="rounded-xl border border-border bg-surface p-5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider text-muted-foreground">ATS Score</span>
            <span className="text-[10.5px] text-purple bg-purple/10 border border-purple/20 rounded px-1.5 py-0.5">Live</span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-[42px] font-semibold tracking-tight tabular-nums">91</span>
            <span className="text-[12px] text-muted-foreground">/ 100</span>
          </div>
          <p className="mt-1 text-[12px] text-muted-foreground">Passa por 94% dos filtros iniciais.</p>
        </div>
        <div className="rounded-xl border border-border bg-surface p-5">
          <span className="text-[11px] uppercase tracking-wider text-muted-foreground">Sugestões IA</span>
          <ul className="mt-3 space-y-3 text-[12.5px]">
            <li className="flex items-start gap-2">
              <span className="mt-1 size-1.5 rounded-full bg-warn" />
              <span>Quantificar bullet do <span className="text-foreground">Checkout v3</span> (<span className="text-emerald">+6 pts</span>)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 size-1.5 rounded-full bg-danger" />
              <span>Adicionar Kubernetes à seção Skills (<span className="text-emerald">+4 pts</span>)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 size-1.5 rounded-full bg-warn" />
              <span>Trocar “ajudei” por verbo de ação (<span className="text-emerald">+2 pts</span>)</span>
            </li>
          </ul>
          <button className="mt-5 w-full text-[12.5px] font-medium bg-brand text-brand-foreground px-3 py-2 rounded-md ring-1 ring-inset ring-white/10">
            Aplicar todas
          </button>
        </div>
      </aside>
    </div>
  );
}
