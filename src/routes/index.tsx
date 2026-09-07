import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Wordmark } from "@/components/Wordmark";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Prijava — PICCARD³" },
      { name: "description", content: "Prijavite se u PICCARD³, vašeg asistenta za kongresna putovanja." },
      { property: "og:title", content: "Prijava — PICCARD³" },
      { property: "og:description", content: "Prijavite se u PICCARD³, vašeg asistenta za kongresna putovanja." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://penta-travel.lovable.app/" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: "https://penta-travel.lovable.app/" }],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { signIn, user, loading: authLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && user) navigate({ to: "/home", replace: true });
  }, [user, authLoading, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const { error: err } = await signIn(email, password);
    setSubmitting(false);
    if (err) {
      setError("Pogrešan email ili lozinka.");
      return;
    }
    navigate({ to: "/home", replace: true });
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
          <Wordmark className="text-[30px]" />
          <p className="mt-3 text-sm font-medium tracking-widest text-brand-gold">
            PLAN. BOOK. GO.
          </p>
          <p className="mt-2 text-xs font-medium text-brand-graphite">
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
              required
              autoComplete="email"
              className="h-12 rounded-2xl border border-border bg-card px-4 text-sm shadow-card focus:outline-none focus:ring-2 focus:ring-ring/40"
              placeholder="vase.ime@klinika.hr"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Lozinka</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="h-12 rounded-2xl border border-border bg-card px-4 text-sm shadow-card focus:outline-none focus:ring-2 focus:ring-ring/40"
              placeholder="••••••••"
            />
          </label>

          <button
            type="submit"
            disabled={submitting}
            className="mt-2 h-13 rounded-2xl bg-gradient-brand py-3.5 text-base font-semibold text-primary-foreground shadow-elevated transition active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Prijavljivanje...
              </>
            ) : (
              "Prijava"
            )}
          </button>

          {error && (
            <p className="text-center text-sm font-medium text-destructive">{error}</p>
          )}

          <button type="button" className="text-center text-sm font-medium text-muted-foreground py-2">
            Zaboravljena lozinka?
          </button>
        </motion.form>
      </div>
    </div>
  );
}
