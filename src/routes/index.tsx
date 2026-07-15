import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";

/* ---------- Animation hooks ---------- */
function useInView<T extends HTMLElement>(threshold = 0.35) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    if (!ref.current || inView) return;
    const io = new IntersectionObserver(
      ([e]) => e.isIntersecting && setInView(true),
      { threshold },
    );
    io.observe(ref.current);
    return () => io.disconnect();
  }, [inView, threshold]);
  return [ref, inView] as const;
}

function useCountUp(target: number, active: boolean, duration = 1400, delay = 0) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!active) return;
    let raf = 0;
    let start = 0;
    const t0 = performance.now() + delay;
    const tick = (t: number) => {
      if (t < t0) {
        raf = requestAnimationFrame(tick);
        return;
      }
      if (!start) start = t;
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.round(target * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, active, duration, delay]);
  return n;
}

export const Route = createFileRoute("/")({
  component: Landing,
});

function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div className="relative size-6 rounded-md bg-brand flex items-center justify-center shadow-[0_0_0_1px_rgba(37,99,235,0.4),0_6px_16px_-4px_rgba(37,99,235,0.5)]">
        <div className="size-2 rounded-full bg-white" />
      </div>
      <span className="text-[15px] font-semibold tracking-tight text-foreground">
        CareerScore
      </span>
    </div>
  );
}

function Nav() {
  return (
    <nav className="fixed top-0 inset-x-0 z-50 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-10">
          <Logo />
          <div className="hidden md:flex items-center gap-7 text-[13px] text-muted-foreground">
            <a href="#produto" className="hover:text-foreground transition-colors">Produto</a>
            <a href="#metodologia" className="hover:text-foreground transition-colors">Metodologia</a>
            <a href="#vagas" className="hover:text-foreground transition-colors">Vagas</a>
            <a href="#precos" className="hover:text-foreground transition-colors">Preços</a>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="hidden sm:inline-flex text-[13px] text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-md transition-colors">
            Entrar
          </button>
          <button className="inline-flex items-center gap-2 text-[13px] font-medium bg-brand text-brand-foreground pl-3 pr-3.5 py-1.5 rounded-md ring-1 ring-inset ring-white/10 shadow-[0_1px_0_0_rgba(255,255,255,0.15)_inset,0_6px_16px_-6px_rgba(37,99,235,0.6)] hover:brightness-110 transition-all active:scale-[0.98]">
            Começar diagnóstico
            <span aria-hidden className="text-white/60">→</span>
          </button>
        </div>
      </div>
    </nav>
  );
}

/* ---------- Dashboard preview mockup used in hero ---------- */
function DashboardPreview() {
  return (
    <div className="relative">
      {/* soft ambient glow */}
      <div
        aria-hidden
        className="absolute -inset-24 -z-10 opacity-60"
        style={{
          background:
            "radial-gradient(60% 50% at 50% 40%, rgba(37,99,235,0.18), transparent 70%), radial-gradient(40% 40% at 70% 70%, rgba(139,92,246,0.12), transparent 70%)",
        }}
      />

      <div className="relative rounded-2xl bg-sidebar/90 ring-1 ring-white/5 shadow-elevated overflow-hidden">
        {/* window chrome */}
        <div className="h-9 border-b border-border/70 flex items-center px-3.5 gap-3">
          <div className="flex gap-1.5">
            <div className="size-2.5 rounded-full bg-white/10" />
            <div className="size-2.5 rounded-full bg-white/10" />
            <div className="size-2.5 rounded-full bg-white/10" />
          </div>
          <div className="flex-1 flex justify-center">
            <div className="text-[10.5px] font-mono text-muted-foreground/80 tracking-wider">
              careerscore.app / intelligence
            </div>
          </div>
          <div className="w-10" />
        </div>

        <div className="grid grid-cols-[168px_1fr]">
          {/* mini sidebar */}
          <aside className="border-r border-border/70 bg-sidebar p-3 space-y-1 text-[12px]">
            <div className="px-2 pb-2 text-[10px] font-mono uppercase tracking-widest text-muted-foreground/70">
              Workspace
            </div>
            <div className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-md bg-white/[0.04] text-foreground ring-1 ring-inset ring-white/5">
              <span className="size-1.5 rounded-full bg-brand" />
              Intelligence
            </div>
            {["Evolution", "Oportunidades", "Currículo ATS", "Skills"].map((l) => (
              <div
                key={l}
                className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-muted-foreground hover:text-foreground"
              >
                <span className="size-1.5 rounded-full bg-border" />
                {l}
              </div>
            ))}
            <div className="pt-4 px-2 text-[10px] font-mono uppercase tracking-widest text-muted-foreground/70">
              Sinais
            </div>
            <div className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-muted-foreground">
              <span className="size-1.5 rounded-full bg-emerald animate-pulse-dot" />
              1.240 novos
            </div>
          </aside>

          {/* main */}
          <CareerScoreMain />
        </div>
      </div>

      {/* floating job card */}
      <div className="hidden lg:block absolute -right-8 -bottom-8 w-64 rounded-xl bg-card ring-1 ring-border shadow-elevated p-4 rotate-[1.5deg]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="size-7 rounded-md bg-elevated ring-1 ring-border flex items-center justify-center text-[10px] font-semibold text-muted-foreground">
              LN
            </div>
            <div className="text-[12px] font-medium text-foreground">Linear</div>
          </div>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald/10 text-emerald ring-1 ring-emerald/25">
            94% match
          </span>
        </div>
        <div className="text-[13px] font-medium text-foreground">Senior Product Engineer</div>
        <div className="text-[11px] text-muted-foreground mt-0.5">Remoto · Europa</div>
        <div className="flex gap-1 mt-3">
          {["React", "TypeScript", "Design Systems"].map((t) => (
            <span
              key={t}
              className="text-[9.5px] px-1.5 py-0.5 rounded bg-elevated text-muted-foreground ring-1 ring-border/60"
            >
              {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function CareerScoreMain() {
  const [ref, inView] = useInView<HTMLDivElement>(0.3);
  // Loading → calculating → revealed
  const [phase, setPhase] = useState<"loading" | "calculating" | "ready">("loading");

  useEffect(() => {
    if (!inView) return;
    const t1 = setTimeout(() => setPhase("calculating"), 350);
    const t2 = setTimeout(() => setPhase("ready"), 1100);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [inView]);

  const score = useCountUp(84, phase === "ready", 1600);
  const delta = useCountUp(12, phase === "ready", 1400, 200);

  return (
    <div ref={ref} className="p-5 space-y-4 bg-background">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
            <span>Career Score</span>
            {phase !== "ready" && (
              <span className="inline-flex items-center gap-1 text-violet/90 normal-case tracking-normal">
                <span className="size-1 rounded-full bg-violet animate-pulse-dot" />
                <span className="text-[10px]">recalculando…</span>
              </span>
            )}
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span
              className={`text-[46px] leading-none font-semibold tracking-tight tabular-nums transition-colors duration-500 ${
                phase === "ready" ? "text-emerald" : "text-muted-foreground/40"
              }`}
            >
              {phase === "loading" ? "—" : score}
            </span>
            <span className="text-sm text-muted-foreground">/ 100</span>
            <span
              className={`ml-1 text-[11px] font-mono tabular-nums transition-opacity duration-500 ${
                phase === "ready" ? "opacity-100 text-emerald/90" : "opacity-0"
              }`}
            >
              +{delta} este mês
            </span>
          </div>
          {/* thin progress track under the score */}
          <div className="mt-3 h-[3px] w-56 rounded-full bg-elevated overflow-hidden">
            <div
              className={`h-full rounded-full transition-[width,background-color] duration-[1400ms] ease-out ${
                phase === "ready" ? "bg-emerald" : "bg-violet/60"
              }`}
              style={{ width: phase === "loading" ? "0%" : phase === "calculating" ? "40%" : "84%" }}
            />
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-violet px-2 py-1 rounded-md bg-violet/10 ring-1 ring-violet/25">
          <span className="size-1.5 rounded-full bg-violet animate-pulse-dot" />
          IA analisando
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <MetricBar label="Aderência ao mercado" value={72} tone="emerald" delta="+4%" active={phase === "ready"} delay={100} />
        <MetricBar label="Competitividade ATS" value={45} tone="amber" delta="Ajustar keywords" active={phase === "ready"} delay={220} />
        <MetricBar label="Senioridade projetada" value={88} tone="brand" delta="Senior · 14 meses" active={phase === "ready"} delay={340} />
      </div>

      <div className="rounded-xl bg-card ring-1 ring-border/60 p-4 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
            Próximos passos
          </span>
          <span className="text-[10px] font-mono text-muted-foreground tabular-nums">3 de 7</span>
        </div>
        <StepRow color="brand" text="Atualizar certificação Cloud Practitioner" />
        <StepRow color="amber" text="Reescrever bullet de liderança com métricas" />
        <StepRow color="violet" text="Otimizar seção de skills para ATS Tier-1" muted />
      </div>
    </div>
  );
}

function MetricBar({
  label,
  value,
  tone,
  delta,
  active = true,
  delay = 0,
}: {
  label: string;
  value: number;
  tone: "emerald" | "amber" | "brand" | "violet";
  delta: string;
  active?: boolean;
  delay?: number;
}) {
  const barColor = {
    emerald: "bg-emerald",
    amber: "bg-amber",
    brand: "bg-brand",
    violet: "bg-violet",
  }[tone];
  const textColor = {
    emerald: "text-emerald",
    amber: "text-amber",
    brand: "text-brand",
    violet: "text-violet",
  }[tone];
  return (
    <div className="rounded-xl bg-card ring-1 ring-border/60 p-3.5 space-y-2.5">
      <div className="text-[10.5px] text-muted-foreground">{label}</div>
      <div className="h-1 rounded-full bg-elevated overflow-hidden relative">
        <div
          className={`h-full ${barColor} transition-[width] duration-[1200ms] ease-out`}
          style={{ width: active ? `${value}%` : "0%", transitionDelay: `${delay}ms` }}
        />
        {!active && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.06] to-transparent animate-shimmer" />
        )}
      </div>
      <div
        className={`text-[10px] font-mono ${textColor} transition-opacity duration-500`}
        style={{ opacity: active ? 1 : 0, transitionDelay: `${delay + 200}ms` }}
      >
        {delta}
      </div>
    </div>
  );
}

function StepRow({
  color,
  text,
  muted = false,
}: {
  color: "brand" | "amber" | "violet";
  text: string;
  muted?: boolean;
}) {
  const dot = { brand: "bg-brand", amber: "bg-amber", violet: "bg-violet" }[color];
  return (
    <div
      className={`flex items-center gap-3 px-2.5 py-2 rounded-md bg-white/[0.02] ring-1 ring-inset ring-white/5 ${
        muted ? "opacity-50" : ""
      }`}
    >
      <span className={`size-1.5 rounded-full ${dot}`} />
      <span className="text-[12px] text-foreground/90">{text}</span>
    </div>
  );
}

/* ---------- Sections ---------- */

function Hero() {
  return (
    <section className="relative pt-32 pb-24 px-6">
      <div className="max-w-6xl mx-auto grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] gap-16 items-center">
        <div className="animate-fade-up">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-2.5 py-1 text-[11px] font-mono uppercase tracking-widest text-muted-foreground">
            <span className="size-1.5 rounded-full bg-emerald animate-pulse-dot" />
            Inteligência de carreira · v2.4
          </div>

          <h1 className="mt-6 text-[44px] md:text-[54px] leading-[1.02] font-semibold tracking-tight text-balance text-foreground">
            Descubra o que realmente está{" "}
            <span className="text-muted-foreground">impedindo sua carreira</span> de evoluir.
          </h1>

          <p className="mt-6 text-[16px] leading-relaxed text-muted-foreground max-w-[52ch] text-pretty">
            Pare de enviar currículos no escuro. O CareerScore mapeia sua posição no mercado,
            identifica lacunas críticas e entrega um plano de evolução baseado em dados reais —
            não em achismos.
          </p>

          <div className="mt-8 flex items-center gap-3">
            <button className="inline-flex items-center gap-2 text-sm font-medium bg-brand text-brand-foreground px-4 py-2.5 rounded-lg ring-1 ring-inset ring-white/10 shadow-[0_1px_0_0_rgba(255,255,255,0.15)_inset,0_10px_28px_-10px_rgba(37,99,235,0.7)] hover:brightness-110 transition-all active:scale-[0.98]">
              Começar diagnóstico gratuito
              <span aria-hidden className="text-white/70">→</span>
            </button>
            <button className="text-sm text-foreground/80 hover:text-foreground px-4 py-2.5 rounded-lg border border-border hover:bg-white/[0.03] transition-colors">
              Ver como funciona
            </button>
          </div>

          <div className="mt-10 flex items-center gap-6 text-[11.5px] text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-emerald" />
              12.400 análises este mês
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-brand" />
              Compatível com 340+ sistemas ATS
            </div>
          </div>
        </div>

        <div className="animate-fade-up [animation-delay:120ms]">
          <DashboardPreview />
        </div>
      </div>
    </section>
  );
}

function LogoStrip() {
  const brands = ["Nubank", "iFood", "Stone", "Loft", "Movile", "QuintoAndar", "Creditas"];
  return (
    <section className="py-12 border-y border-border/60 bg-sidebar/40">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center text-[11px] font-mono uppercase tracking-[0.22em] text-muted-foreground mb-6">
          Profissionais de tecnologia de
        </div>
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-3">
          {brands.map((b) => (
            <span key={b} className="text-[14px] tracking-tight text-muted-foreground/70 hover:text-foreground/80 transition-colors">
              {b}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function Problem() {
  const items = [
    {
      n: "01",
      title: "Currículos que somem",
      text: "Você envia dezenas de candidaturas e não recebe uma única resposta. Não é azar — é filtro.",
    },
    {
      n: "02",
      title: "Estagnação invisível",
      text: "Estuda por conta, faz cursos, adiciona ferramentas. Mas o mercado não reconhece.",
    },
    {
      n: "03",
      title: "Vagas incompatíveis",
      text: "Aplica por título e salário. Descobre no processo que a stack e a cultura não batem.",
    },
    {
      n: "04",
      title: "Sem clareza de rota",
      text: "Não sabe o que estudar primeiro, qual gap fecha mais rápido, nem o que te leva ao próximo nível.",
    },
  ];
  return (
    <section className="py-28 px-6" id="metodologia">
      <div className="max-w-6xl mx-auto">
        <div className="max-w-2xl">
          <div className="text-[11px] font-mono uppercase tracking-[0.22em] text-danger/90 mb-4">
            O problema
          </div>
          <h2 className="text-[32px] md:text-[38px] leading-[1.1] font-semibold tracking-tight text-balance">
            Sua carreira não está parada por falta de esforço. Está parada por falta de{" "}
            <span className="text-muted-foreground">informação certa.</span>
          </h2>
        </div>

        <div className="mt-16 grid md:grid-cols-2 gap-x-12 gap-y-10">
          {items.map((it) => (
            <div key={it.n} className="border-l border-border pl-6">
              <div className="text-[11px] font-mono text-danger">{it.n}</div>
              <div className="mt-2 text-[17px] font-medium text-foreground">{it.title}</div>
              <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground text-pretty max-w-[46ch]">
                {it.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Solution() {
  return (
    <section className="py-28 px-6 bg-sidebar/40 border-y border-border/60" id="produto">
      <div className="max-w-6xl mx-auto">
        <div className="max-w-2xl">
          <div className="text-[11px] font-mono uppercase tracking-[0.22em] text-brand mb-4">
            A resposta
          </div>
          <h2 className="text-[32px] md:text-[38px] leading-[1.1] font-semibold tracking-tight text-balance">
            Um sistema que enxerga sua carreira{" "}
            <span className="text-muted-foreground">como um produto em evolução.</span>
          </h2>
        </div>

        <div className="mt-16 grid lg:grid-cols-[1.15fr_1fr] gap-10 items-start">
          {/* left: numbered flow */}
          <div className="space-y-6">
            {([
              {
                step: "Passo 1",
                title: "Diagnóstico contínuo",
                text: "Analisamos seu perfil contra milhares de sinais de mercado em tempo real e traduzimos em um Health Score.",
                color: "emerald",
              },
              {
                step: "Passo 2",
                title: "Mapeamento de lacunas",
                text: "Descobrimos exatamente quais competências, palavras e sinalizações estão te barrando no próximo nível.",
                color: "amber",
              },
              {
                step: "Passo 3",
                title: "Plano de evolução",
                text: "Recebe uma sequência priorizada de ações — não uma lista genérica de cursos.",
                color: "brand",
              },
              {
                step: "Passo 4",
                title: "Currículo, vagas e evolução",
                text: "Gera currículos otimizados para ATS, recebe vagas de fato compatíveis e acompanha o quanto você evoluiu.",
                color: "violet",
              },
            ] as const).map((s) => (
              <FlowRow key={s.step} {...s} />
            ))}
          </div>

          {/* right: stat card */}
          <div className="lg:sticky lg:top-24">
            <div className="rounded-2xl bg-card ring-1 ring-border p-6 space-y-6 glass-stroke">
              <div className="flex items-baseline justify-between">
                <span className="text-[10.5px] font-mono uppercase tracking-widest text-muted-foreground">
                  Impacto médio em 90 dias
                </span>
                <span className="text-[10.5px] font-mono text-emerald">+12%</span>
              </div>

              <div>
                <div className="text-[64px] leading-none font-semibold tracking-tight text-foreground">
                  3,4<span className="text-3xl text-muted-foreground">x</span>
                </div>
                <div className="mt-2 text-sm text-muted-foreground">
                  mais chamadas para entrevista após aplicar o plano de evolução.
                </div>
              </div>

              <div className="pt-4 border-t border-border grid grid-cols-2 gap-4">
                <MiniStat label="Vagas compatíveis" value="+218%" tone="emerald" />
                <MiniStat label="Tempo até oferta" value="−41%" tone="brand" />
                <MiniStat label="Aprovação em ATS" value="94%" tone="violet" />
                <MiniStat label="Satisfação" value="4,9/5" tone="amber" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FlowRow({
  step,
  title,
  text,
  color,
}: {
  step: string;
  title: string;
  text: string;
  color: "emerald" | "amber" | "brand" | "violet";
}) {
  const dot = { emerald: "bg-emerald", amber: "bg-amber", brand: "bg-brand", violet: "bg-violet" }[color];
  const ring = {
    emerald: "ring-emerald/20",
    amber: "ring-amber/20",
    brand: "ring-brand/20",
    violet: "ring-violet/20",
  }[color];
  return (
    <div className="group flex gap-5 rounded-xl p-4 -mx-4 hover:bg-white/[0.02] transition-colors">
      <div className={`shrink-0 mt-1 size-8 rounded-full bg-background ring-1 ${ring} flex items-center justify-center`}>
        <span className={`size-2 rounded-full ${dot}`} />
      </div>
      <div>
        <div className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground">
          {step}
        </div>
        <div className="mt-1 text-[17px] font-medium text-foreground">{title}</div>
        <p className="mt-1.5 text-[14px] leading-relaxed text-muted-foreground text-pretty max-w-[52ch]">
          {text}
        </p>
      </div>
    </div>
  );
}

function MiniStat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "emerald" | "amber" | "brand" | "violet";
}) {
  const c = { emerald: "text-emerald", amber: "text-amber", brand: "text-brand", violet: "text-violet" }[tone];
  return (
    <div>
      <div className={`text-lg font-semibold tracking-tight ${c}`}>{value}</div>
      <div className="text-[11px] text-muted-foreground">{label}</div>
    </div>
  );
}

/* ---------- Benefits ---------- */
function Benefits() {
  return (
    <section className="py-28 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-end justify-between flex-wrap gap-6 mb-14">
          <div>
            <div className="text-[11px] font-mono uppercase tracking-[0.22em] text-muted-foreground mb-3">
              Recursos como benefícios
            </div>
            <h2 className="text-[32px] md:text-[38px] leading-[1.1] font-semibold tracking-tight max-w-[22ch] text-balance">
              Nada de funcionalidades soltas. Cada recurso resolve um problema real.
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* big card */}
          <div className="col-span-12 lg:col-span-7 rounded-2xl bg-card ring-1 ring-border p-8 glass-stroke relative overflow-hidden">
            <div
              aria-hidden
              className="absolute -right-24 -top-24 size-64 rounded-full opacity-40"
              style={{ background: "radial-gradient(circle, rgba(139,92,246,0.25), transparent 70%)" }}
            />
            <div className="relative">
              <div className="inline-flex items-center gap-2 text-[10.5px] font-mono uppercase tracking-widest text-violet px-2 py-1 rounded-md bg-violet/10 ring-1 ring-violet/20">
                <span className="size-1.5 rounded-full bg-violet" />
                Currículo ATS
              </div>
              <h3 className="mt-5 text-[26px] font-semibold tracking-tight leading-tight max-w-[24ch]">
                Passe pelos filtros iniciais dos recrutadores.
              </h3>
              <p className="mt-3 text-[14.5px] text-muted-foreground max-w-[54ch] text-pretty leading-relaxed">
                Editor em tempo real que reescreve, valida e pontua cada seção do seu currículo
                contra 340+ sistemas ATS de mercado. Antes de enviar, você já sabe se vai passar.
              </p>

              <div className="mt-8 rounded-xl bg-background ring-1 ring-border overflow-hidden">
                <div className="h-8 border-b border-border flex items-center px-3 gap-3">
                  <div className="flex gap-1.5">
                    <div className="size-2 rounded-full bg-white/10" />
                    <div className="size-2 rounded-full bg-white/10" />
                    <div className="size-2 rounded-full bg-white/10" />
                  </div>
                  <div className="text-[10px] font-mono text-muted-foreground">
                    curriculo_v3.pdf
                  </div>
                </div>
                <div className="grid grid-cols-[1fr_180px]">
                  <div className="p-5 space-y-3">
                    <div className="text-[15px] font-semibold text-foreground">Ana Ribeiro</div>
                    <div className="text-[11px] text-muted-foreground">Senior Software Engineer · São Paulo</div>
                    <div className="pt-3 space-y-2">
                      <div className="h-2 w-4/5 rounded bg-elevated" />
                      <div className="h-2 w-full rounded bg-elevated" />
                      <div className="h-2 w-3/4 rounded bg-elevated" />
                    </div>
                    <div className="mt-3 rounded-md border border-violet/25 bg-violet/[0.06] p-3">
                      <div className="text-[10px] font-mono uppercase tracking-widest text-violet mb-1">
                        Sugestão IA
                      </div>
                      <p className="text-[12px] leading-relaxed text-foreground/90">
                        Troque <span className="line-through text-muted-foreground">“Trabalhei com React”</span>{" "}
                        por <span className="text-emerald">“Liderei a migração para React 18, reduzindo o TTI em 42%.”</span>
                      </p>
                    </div>
                  </div>
                  <div className="border-l border-border p-4 bg-sidebar/60 space-y-3">
                    <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                      Score por seção
                    </div>
                    <ScoreLine label="Resumo" value={90} tone="emerald" />
                    <ScoreLine label="Experiência" value={65} tone="amber" />
                    <ScoreLine label="Skills" value={82} tone="emerald" />
                    <ScoreLine label="Keywords" value={48} tone="amber" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* smaller stacked cards */}
          <div className="col-span-12 lg:col-span-5 grid grid-cols-1 gap-6">
            <BenefitCard
              tag="Plano de ação"
              tagColor="amber"
              title="Saiba exatamente o que estudar primeiro."
              text="Roadmap ordenado por impacto real na sua próxima vaga — não por popularidade do curso."
            >
              <div className="mt-5 space-y-2">
                {[
                  { t: "Terraform · Cloud Practitioner", d: "+18 pts", color: "amber" },
                  { t: "System Design (livro + prática)", d: "+11 pts", color: "brand" },
                  { t: "Reescrever cases de liderança", d: "+7 pts", color: "violet" },
                ].map((r) => (
                  <div
                    key={r.t}
                    className="flex items-center justify-between rounded-md bg-background ring-1 ring-border px-3 py-2"
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`size-1.5 rounded-full ${
                          r.color === "amber" ? "bg-amber" : r.color === "brand" ? "bg-brand" : "bg-violet"
                        }`}
                      />
                      <span className="text-[12.5px] text-foreground">{r.t}</span>
                    </div>
                    <span className="text-[10.5px] font-mono text-emerald">{r.d}</span>
                  </div>
                ))}
              </div>
            </BenefitCard>

            <BenefitCard
              tag="Análise"
              tagColor="emerald"
              title="Descubra seus pontos fortes e diferenciais."
              text="A gente destaca o que o mercado valoriza em você — e você aprende a comunicar em entrevista."
            >
              <div className="mt-5 grid grid-cols-3 gap-2">
                {[
                  { l: "Arquitetura", v: 92 },
                  { l: "Liderança", v: 78 },
                  { l: "Produto", v: 84 },
                ].map((s) => (
                  <div key={s.l} className="rounded-md bg-background ring-1 ring-border p-3">
                    <div className="text-[10px] text-muted-foreground">{s.l}</div>
                    <div className="text-[20px] font-semibold text-emerald tracking-tight leading-none mt-1">
                      {s.v}
                    </div>
                  </div>
                ))}
              </div>
            </BenefitCard>
          </div>
        </div>
      </div>
    </section>
  );
}

function ScoreLine({ label, value, tone }: { label: string; value: number; tone: "emerald" | "amber" }) {
  const c = tone === "emerald" ? "text-emerald" : "text-amber";
  const b = tone === "emerald" ? "bg-emerald" : "bg-amber";
  return (
    <div>
      <div className="flex justify-between text-[10.5px] mb-1">
        <span className="text-muted-foreground">{label}</span>
        <span className={c}>{value}%</span>
      </div>
      <div className="h-1 bg-elevated rounded-full overflow-hidden">
        <div className={`h-full ${b}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function BenefitCard({
  tag,
  tagColor,
  title,
  text,
  children,
}: {
  tag: string;
  tagColor: "amber" | "emerald" | "violet" | "brand";
  title: string;
  text: string;
  children?: React.ReactNode;
}) {
  const colorMap = {
    amber: { text: "text-amber", bg: "bg-amber/10", ring: "ring-amber/20", dot: "bg-amber" },
    emerald: { text: "text-emerald", bg: "bg-emerald/10", ring: "ring-emerald/20", dot: "bg-emerald" },
    violet: { text: "text-violet", bg: "bg-violet/10", ring: "ring-violet/20", dot: "bg-violet" },
    brand: { text: "text-brand", bg: "bg-brand/10", ring: "ring-brand/20", dot: "bg-brand" },
  }[tagColor];
  return (
    <div className="rounded-2xl bg-card ring-1 ring-border p-6 glass-stroke">
      <div
        className={`inline-flex items-center gap-2 text-[10.5px] font-mono uppercase tracking-widest ${colorMap.text} px-2 py-1 rounded-md ${colorMap.bg} ring-1 ${colorMap.ring}`}
      >
        <span className={`size-1.5 rounded-full ${colorMap.dot}`} />
        {tag}
      </div>
      <h3 className="mt-4 text-[19px] font-semibold tracking-tight text-foreground leading-snug">
        {title}
      </h3>
      <p className="mt-2 text-[13.5px] text-muted-foreground leading-relaxed text-pretty">{text}</p>
      {children}
    </div>
  );
}

/* ---------- Jobs ---------- */
function Jobs() {
  const jobs = [
    {
      logo: "ST",
      company: "Stripe",
      location: "Remoto · Global",
      role: "Senior Product Designer",
      match: 94,
      tags: ["Design Systems", "Figma", "Prototipagem"],
      reason: "Sua experiência com sistemas escaláveis é exatamente o que o time procura.",
      featured: false,
    },
    {
      logo: "LN",
      company: "Linear",
      location: "Remoto · Europa",
      role: "Product Engineer",
      match: 91,
      tags: ["React", "TypeScript", "Realtime"],
      reason: "Alta compatibilidade com seu histórico em performance de frontend.",
      featured: true,
    },
    {
      logo: "VC",
      company: "Vercel",
      location: "Global",
      role: "Staff Frontend Architect",
      match: 78,
      tags: ["Next.js", "Rust", "Edge"],
      reason: "Faltam 2 competências para se destacar. Plano gerado.",
      featured: false,
      warning: true,
    },
  ];
  return (
    <section className="py-28 px-6 bg-sidebar/40 border-y border-border/60" id="vagas">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-end justify-between flex-wrap gap-6 mb-14">
          <div>
            <div className="text-[11px] font-mono uppercase tracking-[0.22em] text-muted-foreground mb-3">
              Oportunidades
            </div>
            <h2 className="text-[32px] md:text-[38px] leading-[1.1] font-semibold tracking-tight max-w-[22ch] text-balance">
              Só vagas onde você tem chance real. E o motivo da recomendação, transparente.
            </h2>
          </div>
          <button className="text-sm text-foreground/80 hover:text-foreground px-4 py-2 rounded-lg border border-border hover:bg-white/[0.03] transition-colors">
            Ver todas as vagas
          </button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {jobs.map((j) => (
            <JobCard key={j.company} {...j} />
          ))}
        </div>
      </div>
    </section>
  );
}

function JobCard({
  logo,
  company,
  location,
  role,
  match,
  tags,
  reason,
  featured,
  warning,
}: {
  logo: string;
  company: string;
  location: string;
  role: string;
  match: number;
  tags: string[];
  reason: string;
  featured?: boolean;
  warning?: boolean;
}) {
  const matchColor = warning ? "text-amber bg-amber/10 ring-amber/25" : "text-emerald bg-emerald/10 ring-emerald/25";
  return (
    <div
      className={`group rounded-2xl bg-card p-5 ring-1 transition-all hover:-translate-y-0.5 hover:bg-elevated ${
        featured ? "ring-brand/40 shadow-[0_20px_60px_-30px_rgba(37,99,235,0.5)]" : "ring-border"
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`size-10 rounded-lg flex items-center justify-center text-[11px] font-semibold ring-1 ${
              featured ? "bg-brand/15 text-brand ring-brand/25" : "bg-elevated text-muted-foreground ring-border"
            }`}
          >
            {logo}
          </div>
          <div>
            <div className="text-[13px] font-medium text-foreground leading-tight">{company}</div>
            <div className="text-[11px] text-muted-foreground">{location}</div>
          </div>
        </div>
        <span className={`text-[10.5px] font-mono px-1.5 py-0.5 rounded ring-1 ${matchColor}`}>
          {match}% match
        </span>
      </div>

      <div className="mt-5 text-[15.5px] font-medium tracking-tight text-foreground">{role}</div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {tags.map((t) => (
          <span
            key={t}
            className="text-[10.5px] px-1.5 py-0.5 rounded bg-background text-muted-foreground ring-1 ring-border"
          >
            {t}
          </span>
        ))}
      </div>

      <div className="mt-5 pt-4 border-t border-border/70">
        <div className="flex gap-2.5 items-start">
          <span
            className={`mt-1 size-1.5 rounded-full shrink-0 ${warning ? "bg-amber" : "bg-emerald"}`}
          />
          <p className="text-[12px] leading-relaxed text-muted-foreground">{reason}</p>
        </div>
      </div>
    </div>
  );
}

/* ---------- CTA / footer ---------- */
function CTA() {
  return (
    <section className="px-6 pt-24 pb-16" id="precos">
      <div className="max-w-6xl mx-auto relative rounded-3xl bg-card ring-1 ring-border p-14 overflow-hidden glass-stroke">
        <div
          aria-hidden
          className="absolute -inset-x-20 -top-40 h-80 opacity-60"
          style={{
            background:
              "radial-gradient(50% 60% at 50% 100%, rgba(37,99,235,0.22), transparent 70%)",
          }}
        />
        <div className="relative text-center max-w-2xl mx-auto">
          <div className="text-[11px] font-mono uppercase tracking-[0.22em] text-brand mb-4">
            Comece hoje
          </div>
          <h2 className="text-[36px] md:text-[44px] leading-[1.05] font-semibold tracking-tight text-balance">
            Pare de contar com sorte. Comece a operar sua carreira com dados.
          </h2>
          <p className="mt-4 text-muted-foreground text-[15px] text-pretty">
            Diagnóstico gratuito em 4 minutos. Sem cartão. Sem instalação.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <button className="inline-flex items-center gap-2 text-sm font-medium bg-brand text-brand-foreground px-5 py-3 rounded-lg ring-1 ring-inset ring-white/10 shadow-[0_1px_0_0_rgba(255,255,255,0.15)_inset,0_10px_28px_-10px_rgba(37,99,235,0.7)] hover:brightness-110 transition-all active:scale-[0.98]">
              Criar meu Health Score
              <span aria-hidden className="text-white/70">→</span>
            </button>
            <button className="text-sm text-foreground/85 hover:text-foreground px-5 py-3 rounded-lg border border-border hover:bg-white/[0.03] transition-colors">
              Falar com o time
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="px-6 pb-14">
      <div className="max-w-6xl mx-auto pt-10 border-t border-border/60 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <Logo />
          <span className="text-[11px] font-mono text-muted-foreground">v2.4 · São Paulo</span>
        </div>
        <div className="flex items-center gap-6 text-[12.5px] text-muted-foreground">
          <a href="#" className="hover:text-foreground transition-colors">Privacidade</a>
          <a href="#" className="hover:text-foreground transition-colors">Termos</a>
          <a href="#" className="hover:text-foreground transition-colors">Status</a>
          <a href="#" className="hover:text-foreground transition-colors">Contato</a>
        </div>
        <div className="text-[11.5px] text-muted-foreground">
          © 2026 CareerScore
        </div>
      </div>
    </footer>
  );
}

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <Nav />
      <main>
        <Hero />
        <LogoStrip />
        <Problem />
        <Solution />
        <Benefits />
        <Jobs />
        <CTA />
      </main>
      <Footer />
      {/* keep Link import used for tree-shake friendliness */}
      <Link to="/" className="sr-only" aria-hidden>home</Link>
    </div>
  );
}
