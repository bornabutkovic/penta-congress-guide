import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, PhoneOff, Keyboard } from "lucide-react";
import { useEffect, useState } from "react";
import { MobileFrame } from "@/components/MobileFrame";
import { BottomNav } from "@/components/BottomNav";
import { PageHeader } from "@/components/PageHeader";

export const Route = createFileRoute("/voice")({
  head: () => ({
    meta: [
      { title: "Penta — Glasovni agent" },
      { name: "description", content: "Razgovarajte s Penta agentom glasom." },
    ],
  }),
  component: VoicePage,
});

type OrbState = "idle" | "listening" | "speaking";

const transcripts = [
  "Slušam vas...",
  "Tražim let Zagreb – Amsterdam za ESC Congress.",
  "Provjeravam dostupnost hotela uz kongresni centar.",
  "Pronašao sam tri opcije s odličnim ocjenama.",
];

function VoicePage() {
  const [state, setState] = useState<OrbState>("listening");
  const [muted, setMuted] = useState(false);
  const [tIndex, setTIndex] = useState(0);

  useEffect(() => {
    if (state !== "listening" && state !== "speaking") return;
    const id = setInterval(() => setTIndex((i) => (i + 1) % transcripts.length), 2800);
    return () => clearInterval(id);
  }, [state]);

  return (
    <MobileFrame>
      <PageHeader title="Glasovni agent" back={false} />

      <div className="flex flex-1 flex-col items-center justify-between px-6 py-8 bg-gradient-bg">
        <div className="text-center">
          <h2 className="text-xl font-bold">Razgovarajte s agentom</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {state === "idle" ? "Dodirnite mikrofon" : state === "listening" ? "Slušam..." : "Agent govori..."}
          </p>
        </div>

        {/* Orb */}
        <div className="relative flex h-72 w-72 items-center justify-center">
          {(state === "listening" || state === "speaking") && (
            <>
              <span className="absolute inset-0 rounded-full bg-gradient-brand opacity-20 blur-2xl" style={{ animation: "orb-pulse 2.4s ease-in-out infinite" }} />
              <span className="absolute inset-6 rounded-full bg-gradient-brand opacity-30" style={{ animation: "orb-ripple 2.2s ease-out infinite" }} />
              <span className="absolute inset-10 rounded-full bg-gradient-brand opacity-25" style={{ animation: "orb-ripple 2.2s ease-out infinite 0.7s" }} />
            </>
          )}
          <motion.div
            className="relative h-48 w-48 rounded-full bg-gradient-brand shadow-elevated"
            style={{ animation: "orb-float 4s ease-in-out infinite" }}
            animate={{ scale: state === "speaking" ? [1, 1.04, 1] : 1 }}
            transition={{ duration: 0.9, repeat: state === "speaking" ? Infinity : 0 }}
          >
            <div className="absolute inset-3 rounded-full bg-gradient-to-br from-white/40 to-transparent" />
            <div className="absolute top-8 left-10 h-12 w-12 rounded-full bg-white/30 blur-md" />
          </motion.div>
        </div>

        <div className="w-full">
          <div className="min-h-[64px] rounded-2xl bg-white px-5 py-4 text-center text-sm text-muted-foreground shadow-card">
            <AnimatePresence mode="wait">
              <motion.p
                key={tIndex}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.3 }}
              >
                {transcripts[tIndex]}
              </motion.p>
            </AnimatePresence>
          </div>

          <div className="mt-6 flex items-center justify-center gap-5">
            <button
              onClick={() => setMuted((m) => !m)}
              className="flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-card transition active:scale-95"
              aria-label="Utišaj"
            >
              {muted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </button>

            <button
              onClick={() => setState(state === "idle" ? "listening" : "idle")}
              className="flex h-16 w-16 items-center justify-center rounded-full bg-[color:var(--brand-red)] text-white shadow-elevated transition active:scale-95"
              aria-label="Prekini"
            >
              <PhoneOff className="h-6 w-6" />
            </button>

            <Link
              to="/chat"
              className="flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-card transition active:scale-95"
              aria-label="Chat"
            >
              <Keyboard className="h-5 w-5" />
            </Link>
          </div>

          <div className="mt-4 text-center">
            <Link to="/chat" className="text-sm font-semibold text-gradient-brand">
              ili pišite →
            </Link>
          </div>
        </div>
      </div>

      <BottomNav />
    </MobileFrame>
  );
}
