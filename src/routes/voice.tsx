import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, PhoneOff, Keyboard } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { RetellWebClient } from "retell-client-js-sdk";
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

const AGENT_ID = "agent_7108f761dd1304a9998d2003ab";
const RETELL_API_KEY = "key_f78549c8884e3d2a3bb39dd00ba5";

function VoicePage() {
  const [state, setState] = useState<OrbState>("idle");
  const [muted, setMuted] = useState(false);
  const [transcript, setTranscript] = useState("Dodirnite mikrofon za početak...");
  const retellClientRef = useRef<RetellWebClient | null>(null);
  const stateRef = useRef<OrbState>("idle");

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    const client = new RetellWebClient();
    retellClientRef.current = client;

    client.on("call_started", () => setState("listening"));
    client.on("call_ended", () => setState("idle"));
    client.on("agent_start_talking", () => setState("speaking"));
    client.on("agent_stop_talking", () => setState("listening"));
    client.on("error", (err: unknown) => {
      console.error("Retell error", err);
      setState("idle");
    });
    client.on("update", (update: { transcript?: Array<{ role: string; content: string }> | string }) => {
      if (!update?.transcript) return;
      if (typeof update.transcript === "string") {
        setTranscript(update.transcript);
      } else if (Array.isArray(update.transcript) && update.transcript.length > 0) {
        const last = update.transcript[update.transcript.length - 1];
        if (last?.content) setTranscript(last.content);
      }
    });

    return () => {
      if (stateRef.current !== "idle") {
        try { client.stopCall(); } catch { /* noop */ }
      }
    };
  }, []);

  const startCall = async () => {
    try {
      setTranscript("Povezivanje...");
      const res = await fetch("https://api.retellai.com/v2/create-web-call", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${RETELL_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          agent_id: AGENT_ID,
          retell_llm_dynamic_variables: {
            client_name: mockUser.name,
            client_email: mockUser.email,
            client_phone: mockUser.phone,
          },
        }),
      });
      if (!res.ok) throw new Error(`Token request failed: ${res.status}`);
      const data = await res.json();
      const accessToken = data.access_token;
      if (!accessToken) throw new Error("No access_token in response");

      await retellClientRef.current?.startCall({
        accessToken,
        sampleRate: 24000,
      });
    } catch (err) {
      console.error(err);
      setTranscript("Greška pri pokretanju poziva.");
      setState("idle");
    }
  };

  const onPhoneButton = () => {
    if (state === "idle") {
      startCall();
    } else {
      try { retellClientRef.current?.stopCall(); } catch { /* noop */ }
      setState("idle");
    }
  };

  const toggleMute = () => {
    const client = retellClientRef.current;
    if (!client) return;
    if (muted) {
      try { client.unmute?.(); } catch { /* noop */ }
    } else {
      try { client.mute?.(); } catch { /* noop */ }
    }
    setMuted((m) => !m);
  };

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
                key={transcript}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.3 }}
              >
                {transcript}
              </motion.p>
            </AnimatePresence>
          </div>

          <div className="mt-6 flex items-center justify-center gap-5">
            <button
              onClick={toggleMute}
              className="flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-card transition active:scale-95"
              aria-label={muted ? "Uključi mikrofon" : "Utišaj"}
            >
              {muted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </button>

            <button
              onClick={onPhoneButton}
              className="flex h-16 w-16 items-center justify-center rounded-full bg-[color:var(--brand-red)] text-white shadow-elevated transition active:scale-95"
              aria-label={state === "idle" ? "Pokreni poziv" : "Prekini"}
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
