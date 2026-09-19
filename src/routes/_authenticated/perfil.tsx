import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { mockProfile, profileCompleteness, type Profile } from "@/lib/careerscore";

export const Route = createFileRoute("/_authenticated/perfil")({
  head: () => ({
    meta: [
      { title: "Meu perfil — CareerScore" },
      {
        name: "description",
        content: "Cargo alvo, resumo, competências, experiências e formação usados no seu diagnóstico.",
      },
      { property: "og:title", content: "Meu perfil — CareerScore" },
      { property: "og:description", content: "Os dados profissionais que alimentam o seu Career Score." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const [profile, setProfile] = useState<Profile>(mockProfile);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [skillDraft, setSkillDraft] = useState("");

  const completeness = profileCompleteness(profile);

  function update<K extends keyof Profile>(key: K, value: Profile[K]) {
    setProfile((p) => ({ ...p, [key]: value }));
    setSaved(false);
  }

  /** Simula PATCH /api/v1/profile/ */
  function save() {
    setSaving(true);
    setTimeout(() => {
      setProfile((p) => ({ ...p, updated_at: new Date().toISOString() }));
      setSaving(false);
      setSaved(true);
    }, 900);
  }

  function addSkill() {
    const value = skillDraft.trim();
    if (!value || profile.skills.includes(value)) return;
    update("skills", [...profile.skills, value]);
    setSkillDraft("");
  }

  return (
    <div className="space-y-8">
      <header className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <p className="text-[12px] text-muted-foreground">Meu perfil</p>
          <h1 className="mt-1 text-[26px] font-semibold tracking-tight">Dados profissionais</h1>
          <p className="mt-1 text-[12.5px] text-muted-foreground">
            São estes campos que a análise lê para gerar o seu Career Score.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {saved && <span className="text-[12px] text-emerald animate-fade-up">Perfil salvo</span>}
          <button
            onClick={save}
            disabled={saving}
            className="rounded-lg bg-brand px-4 py-2.5 text-[13px] font-medium text-brand-foreground transition-all hover:brightness-110 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            {saving ? "Salvando…" : "Salvar perfil"}
          </button>
        </div>
      </header>

      {/* Completeness */}
      <section className="rounded-2xl border border-border bg-elevated px-6 py-5 flex items-center gap-6">
        <div>
          <p className="text-[11.5px] uppercase tracking-[0.14em] text-muted-foreground">Preenchimento</p>
          <p className="mt-1.5 font-mono text-[28px] leading-none">{completeness}%</p>
        </div>
        <div className="flex-1 h-1 rounded-full bg-background/60 overflow-hidden">
          <div
            className="h-full rounded-full bg-emerald transition-[width] duration-700 ease-out"
            style={{ width: `${completeness}%` }}
          />
        </div>
      </section>

      <Card title="Identificação" hint="headline · target_role · city">
        <Field label="Cargo alvo" value={profile.target_role} onChange={(v) => update("target_role", v)} />
        <Field label="Headline" value={profile.headline} onChange={(v) => update("headline", v)} />
        <Field label="Cidade" value={profile.city} onChange={(v) => update("city", v)} />
      </Card>

      <Card title="Resumo profissional" hint="summary">
        <textarea
          value={profile.summary}
          onChange={(e) => update("summary", e.target.value)}
          rows={5}
          className="w-full rounded-lg border border-input bg-background/50 px-3.5 py-3 text-[13px] leading-relaxed outline-none transition-colors focus:border-brand/60 focus:ring-2 focus:ring-brand/15"
        />
      </Card>

      <Card title="Competências" hint="skills[]">
        <div className="flex flex-wrap gap-2">
          {profile.skills.map((skill) => (
            <span
              key={skill}
              className="group flex items-center gap-2 rounded-lg border border-border bg-background/40 px-3 py-1.5 text-[12.5px] transition-colors hover:border-brand/40"
            >
              {skill}
              <button
                onClick={() => update("skills", profile.skills.filter((s) => s !== skill))}
                className="text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:text-danger"
                aria-label={`Remover ${skill}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <div className="mt-4 flex gap-2">
          <input
            value={skillDraft}
            onChange={(e) => setSkillDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
            placeholder="Adicionar competência"
            className="flex-1 rounded-lg border border-input bg-background/50 px-3.5 py-2.5 text-[13px] outline-none transition-colors placeholder:text-muted-foreground focus:border-brand/60 focus:ring-2 focus:ring-brand/15"
          />
          <button
            onClick={addSkill}
            className="rounded-lg border border-border px-4 text-[12.5px] transition-colors hover:border-brand/50 hover:text-foreground"
          >
            Adicionar
          </button>
        </div>
      </Card>

      <Card title="Experiências" hint="experiences[]">
        <ol className="relative space-y-6 pl-5 before:absolute before:left-[3px] before:top-1.5 before:bottom-1.5 before:w-px before:bg-border">
          {profile.experiences.map((exp) => (
            <li key={`${exp.company}-${exp.start}`} className="relative">
              <span className="absolute -left-5 top-1.5 size-[7px] rounded-full bg-brand" />
              <div className="flex items-baseline justify-between gap-4 flex-wrap">
                <p className="text-[13.5px] font-medium">{exp.role}</p>
                <span className="font-mono text-[11px] text-muted-foreground">
                  {exp.start} — {exp.end}
                </span>
              </div>
              <p className="text-[12.5px] text-muted-foreground">{exp.company}</p>
              <p className="mt-2 text-[12.5px] leading-relaxed text-foreground/85">{exp.description}</p>
            </li>
          ))}
        </ol>
      </Card>

      <Card title="Formação" hint="education[]">
        <ul className="space-y-3">
          {profile.education.map((ed) => (
            <li key={ed.degree} className="flex items-baseline justify-between gap-4 flex-wrap">
              <div>
                <p className="text-[13.5px]">{ed.degree}</p>
                <p className="text-[12.5px] text-muted-foreground">{ed.institution}</p>
              </div>
              <span className="font-mono text-[11px] text-muted-foreground">{ed.year}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

function Card({ title, hint, children }: { title: string; hint: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-6">
      <div className="flex items-baseline justify-between">
        <h2 className="text-[14px] font-medium tracking-tight">{title}</h2>
        <span className="font-mono text-[10.5px] text-muted-foreground">{hint}</span>
      </div>
      <div className="mt-5 space-y-4">{children}</div>
    </section>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="text-[12px] text-muted-foreground">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1.5 w-full rounded-lg border border-input bg-background/50 px-3.5 py-2.5 text-[13px] outline-none transition-colors focus:border-brand/60 focus:ring-2 focus:ring-brand/15"
      />
    </label>
  );
}
