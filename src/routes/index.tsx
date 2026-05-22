import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useState } from "react";
import logo from "@/assets/penta-logo.webp";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Penta — Prijava" },
      { name: "description", content: "Prijavite se u Penta — vaš kongresni asistent." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("marko@klinika.hr");
  const [password, setPassword] = useState("••••••••");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate({ to: "/home" });
  };

  return (
    <div className="min-h-dvh w-full bg-gradient-bg flex justify-center">
      <div className="flex w-full max-w-[430px] flex-col px-6 pt-16 pb-10">
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center"
        >
          <div className="h-20 w-20 rounded-3xl bg-white shadow-card flex items-center justify-center overflow-hidden">
            <img src={logo} alt="Penta" className="h-14 w-auto object-contain" />
          </div>
          <p className="mt-5 text-sm font-medium text-muted-foreground tracking-wide">
            Vaš kongresni asistent
          </p>
        </motion.div>

        <motion.form
          onSubmit={submit}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mt-12 flex flex-col gap-4"
        >
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 rounded-2xl border border-border bg-white px-4 text-sm shadow-card focus:outline-none focus:ring-2 focus:ring-[color:var(--brand-orange)]/40"
              placeholder="vase.ime@klinika.hr"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Lozinka</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-12 rounded-2xl border border-border bg-white px-4 text-sm shadow-card focus:outline-none focus:ring-2 focus:ring-[color:var(--brand-orange)]/40"
              placeholder="••••••••"
            />
          </label>

          <button
            type="submit"
            className="mt-2 h-13 rounded-2xl bg-gradient-brand py-3.5 text-base font-semibold text-white shadow-elevated transition active:scale-[0.98]"
          >
            Prijava
          </button>

          <button type="button" className="text-center text-sm font-medium text-muted-foreground py-2">
            Zaboravljena lozinka?
          </button>
        </motion.form>

        <div className="mt-auto pt-10 text-center text-xs text-muted-foreground">
          <Link to="/home" className="text-gradient-brand font-semibold">Nastavi kao gost →</Link>
        </div>
      </div>
    </div>
  );
}
