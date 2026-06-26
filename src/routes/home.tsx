import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Plane, Mic, ListChecks, ChevronRight, Bell, LogOut } from "lucide-react";
import { motion } from "framer-motion";
import { MobileFrame } from "@/components/MobileFrame";
import { BottomNav } from "@/components/BottomNav";
import { StatusBadge } from "@/components/StatusBadge";
import { quotes, formatEur } from "@/lib/mock-data";
import { useAuth } from "@/hooks/useAuth";
import logo from "@/assets/penta-logo.webp";

export const Route = createFileRoute("/home")({
  head: () => ({
    meta: [
      { title: "Penta — Početna" },
      { name: "description", content: "Pregled ponuda i brze akcije." },
    ],
  }),
  component: HomePage,
});

const actions = [
  { to: "/ponude", title: "Nova ponuda", icon: Plane, desc: "Kreiraj putovanje" },
  { to: "/voice", title: "Razgovaraj s agentom", icon: Mic, desc: "Glasovni asistent" },
  { to: "/ponude", title: "Moje ponude", icon: ListChecks, desc: "Pregled svih" },
] as const;

function HomePage() {
  const recent = quotes.slice(0, 3);
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate({ to: "/", replace: true });
  };

  return (
    <MobileFrame>
      <div className="flex-1 overflow-y-auto pb-6">
        <header className="bg-gradient-bg px-5 pt-6 pb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-white shadow-card flex items-center justify-center overflow-hidden">
                <img src={logo} alt="Penta" className="h-6 w-auto" />
              </div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Penta</div>
            </div>
            <div className="flex items-center gap-2">
              <button className="relative h-10 w-10 rounded-full bg-white shadow-card flex items-center justify-center">
                <Bell className="h-4 w-4" />
                <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-gradient-brand" />
              </button>
              <button
                onClick={handleLogout}
                aria-label="Odjava"
                className="h-10 w-10 rounded-full bg-white shadow-card flex items-center justify-center"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>

          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-6">
            <h1 className="text-[26px] font-bold leading-tight">Dobrodošli, Marko! 👋</h1>
            <p className="mt-1 text-sm text-muted-foreground">Spreman za sljedeći kongres?</p>
          </motion.div>
        </header>

        <section className="px-5 -mt-4">
          <div className="grid grid-cols-3 gap-3">
            {actions.map(({ to, title, icon: Icon, desc }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * i }}
              >
                <Link
                  to={to}
                  className="block h-full rounded-2xl bg-card p-3 shadow-card transition active:scale-[0.97]"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-brand text-white shadow-elevated">
                    <Icon className="h-5 w-5" strokeWidth={2.2} />
                  </span>
                  <p className="mt-3 text-[13px] font-semibold leading-tight">{title}</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground leading-tight">{desc}</p>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="px-5 mt-8">
          <div className="flex items-end justify-between">
            <h2 className="text-base font-semibold">Nedavne ponude</h2>
            <Link to="/ponude" className="text-sm font-semibold text-gradient-brand">Vidi sve</Link>
          </div>

          <ul className="mt-3 flex flex-col gap-3">
            {recent.map((q) => (
              <li key={q.id}>
                <Link
                  to="/ponude/$id"
                  params={{ id: q.id }}
                  className="flex items-center gap-3 rounded-2xl bg-card p-4 shadow-card transition active:scale-[0.99]"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-brand-soft">
                    <span className="text-sm font-bold text-gradient-brand">{q.shortName.split(" ")[0].slice(0,3).toUpperCase()}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{q.congress}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <StatusBadge status={q.status} />
                      <span className="text-xs text-muted-foreground truncate">{q.city}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gradient-brand">{formatEur(q.total)}</p>
                    <ChevronRight className="ml-auto mt-1 h-4 w-4 text-muted-foreground" />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
      <BottomNav />
    </MobileFrame>
  );
}
