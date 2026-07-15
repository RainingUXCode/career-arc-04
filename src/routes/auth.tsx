import { createFileRoute, Link, useNavigate, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";

const searchSchema = z.object({
  mode: z.enum(["signin", "signup"]).catch("signup"),
});

export const Route = createFileRoute("/auth")({
  validateSearch: searchSchema,
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getSession();
    if (data.session) throw redirect({ to: "/dashboard" });
  },
  head: () => ({
    meta: [
      { title: "Entrar — CareerScore" },
      { name: "description", content: "Acesse sua conta CareerScore ou crie uma para começar seu diagnóstico." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { mode: initialMode } = Route.useSearch();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => setMode(initialMode), [initialMode]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/dashboard` },
        });
        if (error) throw error;
        const { data: session } = await supabase.auth.getSession();
        if (session.session) {
          navigate({ to: "/dashboard" });
        } else {
          setNotice("Enviamos um link de confirmação para seu email.");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/dashboard" });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível concluir.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setError(null);
    setLoading(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin + "/dashboard",
    });
    if (result.error) {
      setError(result.error.message ?? "Falha ao entrar com Google.");
      setLoading(false);
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/dashboard" });
  }

  const isSignup = mode === "signup";

  return (
    <div className="min-h-screen bg-background text-foreground relative">
      {/* subtle grid backdrop, matching landing */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
          backgroundSize: "56px 56px",
        }}
      />
      <div className="relative max-w-6xl mx-auto px-6 pt-6">
        <Link to="/" className="inline-flex items-center gap-2 text-[13px] text-muted-foreground hover:text-foreground transition-colors">
          <span aria-hidden>←</span> Voltar
        </Link>
      </div>

      <div className="relative flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-[400px]">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-6">
              <div className="size-6 rounded-md bg-brand grid place-items-center ring-1 ring-inset ring-white/15 shadow-[0_1px_0_0_rgba(255,255,255,0.15)_inset]">
                <span className="text-[11px] font-bold text-brand-foreground">C</span>
              </div>
              <span className="text-[14px] font-semibold tracking-tight">CareerScore</span>
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {isSignup ? "Crie sua conta" : "Entre na sua conta"}
            </h1>
            <p className="mt-2 text-[13px] text-muted-foreground">
              {isSignup
                ? "Diagnóstico gratuito em 4 minutos. Sem cartão."
                : "Continue de onde parou seu diagnóstico."}
            </p>
          </div>

          <div className="rounded-xl border border-border bg-surface/60 backdrop-blur-sm p-6 shadow-[0_10px_40px_-20px_rgba(0,0,0,0.6)]">
            <button
              type="button"
              onClick={handleGoogle}
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2.5 text-[13px] font-medium bg-white/[0.04] hover:bg-white/[0.07] text-foreground px-4 py-2.5 rounded-lg border border-border transition-colors disabled:opacity-50"
            >
              <GoogleIcon />
              Continuar com Google
            </button>

            <div className="flex items-center gap-3 my-5">
              <div className="h-px flex-1 bg-border" />
              <span className="text-[11px] uppercase tracking-wider text-muted-foreground">ou</span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-[11.5px] font-medium text-muted-foreground mb-1.5">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="voce@empresa.com"
                  className="w-full text-[13px] bg-background/60 border border-border rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand/40 transition-all"
                />
              </div>
              <div>
                <label className="block text-[11.5px] font-medium text-muted-foreground mb-1.5">Senha</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={isSignup ? "Mínimo 6 caracteres" : "••••••••"}
                  className="w-full text-[13px] bg-background/60 border border-border rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand/40 transition-all"
                />
              </div>

              {error && (
                <div className="text-[12px] text-danger bg-danger/10 border border-danger/20 rounded-md px-3 py-2">
                  {error}
                </div>
              )}
              {notice && (
                <div className="text-[12px] text-emerald bg-emerald/10 border border-emerald/20 rounded-md px-3 py-2">
                  {notice}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 text-[13px] font-medium bg-brand text-brand-foreground px-4 py-2.5 rounded-lg ring-1 ring-inset ring-white/10 shadow-[0_1px_0_0_rgba(255,255,255,0.15)_inset,0_10px_28px_-10px_rgba(37,99,235,0.7)] hover:brightness-110 transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? "Aguarde…" : isSignup ? "Criar conta" : "Entrar"}
              </button>
            </form>
          </div>

          <p className="mt-6 text-center text-[12.5px] text-muted-foreground">
            {isSignup ? "Já tem uma conta?" : "Ainda não tem uma conta?"}{" "}
            <button
              type="button"
              onClick={() => setMode(isSignup ? "signin" : "signup")}
              className="text-foreground hover:text-brand transition-colors font-medium"
            >
              {isSignup ? "Entrar" : "Criar conta"}
            </button>
          </p>

          <p className="mt-8 text-center text-[11px] text-muted-foreground leading-relaxed">
            Ao continuar você concorda com nossos{" "}
            <a href="#" className="underline underline-offset-2 hover:text-foreground">Termos</a> e{" "}
            <a href="#" className="underline underline-offset-2 hover:text-foreground">Privacidade</a>.
          </p>
        </div>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
      <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.24 1.4-1.66 4.1-5.5 4.1-3.3 0-6-2.74-6-6.1s2.7-6.1 6-6.1c1.88 0 3.14.8 3.86 1.49l2.63-2.54C16.83 3.36 14.66 2.4 12 2.4 6.79 2.4 2.6 6.59 2.6 12s4.19 9.6 9.4 9.6c5.42 0 9.02-3.81 9.02-9.18 0-.62-.07-1.1-.16-1.62H12z"/>
    </svg>
  );
}
