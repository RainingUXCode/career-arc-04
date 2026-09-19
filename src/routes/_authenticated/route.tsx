import { createFileRoute, Outlet, redirect, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth", search: { mode: "signin" } });
    return { user: data.user };
  },
  component: AppShell,
});

const NAV = [
  { to: "/dashboard", label: "Diagnóstico", hint: "Análise mais recente" },
  { to: "/perfil", label: "Meu perfil", hint: "Dados profissionais" },
  { to: "/vagas", label: "Vagas", hint: "Busca por compatibilidade" },
] as const;

function AppShell() {
  const { user } = Route.useRouteContext();
  const navigate = useNavigate();
  const email = user.email ?? "";

  async function handleSignOut() {
    await supabase.auth.signOut();
    navigate({ to: "/auth", search: { mode: "signin" }, replace: true });
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden lg:flex w-[236px] shrink-0 flex-col border-r border-border/60 bg-sidebar min-h-screen sticky top-0">
          <Link to="/" className="flex items-center gap-2 px-5 h-14 border-b border-border/50">
            <div className="size-6 rounded-md bg-brand grid place-items-center ring-1 ring-inset ring-white/15">
              <span className="text-[11px] font-bold text-brand-foreground">C</span>
            </div>
            <span className="text-[14px] font-semibold tracking-tight">CareerScore</span>
          </Link>

          <nav className="p-3 space-y-1">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="group block rounded-lg px-3 py-2.5 transition-colors hover:bg-elevated/60"
                activeProps={{ className: "bg-elevated" }}
              >
                {({ isActive }) => (
                  <span className="flex items-start gap-2.5">
                    <span
                      className={`mt-[7px] size-1.5 rounded-full transition-colors ${
                        isActive ? "bg-brand" : "bg-border group-hover:bg-muted-foreground"
                      }`}
                    />
                    <span>
                      <span
                        className={`block text-[13px] leading-tight ${
                          isActive ? "text-foreground font-medium" : "text-sidebar-foreground"
                        }`}
                      >
                        {item.label}
                      </span>
                      <span className="block text-[11px] text-muted-foreground mt-0.5">{item.hint}</span>
                    </span>
                  </span>
                )}
              </Link>
            ))}
          </nav>

          <div className="mt-auto p-4 text-[11px] text-muted-foreground border-t border-border/50">
            Conectado à CareerScoreAPI
            <span className="mt-1.5 flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-emerald animate-pulse-dot" />
              <span className="font-mono">api/v1</span>
            </span>
          </div>
        </aside>

        <div className="flex-1 min-w-0">
          <TopBar email={email} onSignOut={handleSignOut} />
          <main className="max-w-5xl mx-auto px-6 pt-8 pb-24">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}

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
      <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-1 lg:hidden">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="rounded-md px-2.5 py-1.5 text-[12.5px] text-muted-foreground transition-colors hover:text-foreground"
              activeProps={{ className: "bg-elevated text-foreground" }}
            >
              {item.label}
            </Link>
          ))}
        </div>
        <span className="hidden lg:block text-[12px] text-muted-foreground">
          Sessão ativa
        </span>

        <div className="relative" ref={ref}>
          <button
            onClick={() => setOpen(!open)}
            className="size-8 rounded-full bg-elevated border border-border grid place-items-center text-[11px] font-medium hover:border-brand/40 transition-colors"
            aria-label="Menu do usuário"
          >
            {email.slice(0, 1).toUpperCase()}
          </button>
          {open && (
            <div className="absolute right-0 top-10 w-56 rounded-lg border border-border bg-popover shadow-elevated p-1.5 animate-fade-up">
              <div className="px-2.5 py-2 border-b border-border mb-1">
                <p className="text-[12px] text-muted-foreground">Conta</p>
                <p className="text-[12.5px] truncate">{email}</p>
              </div>
              <Link
                to="/perfil"
                onClick={() => setOpen(false)}
                className="block rounded-md px-2.5 py-2 text-[12.5px] hover:bg-elevated transition-colors"
              >
                Meu perfil
              </Link>
              <button
                onClick={onSignOut}
                className="w-full text-left rounded-md px-2.5 py-2 text-[12.5px] text-danger hover:bg-elevated transition-colors"
              >
                Sair
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
