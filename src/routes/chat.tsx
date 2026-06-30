import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Mic, Send } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { MobileFrame } from "@/components/MobileFrame";
import { BottomNav } from "@/components/BottomNav";
import { PageHeader } from "@/components/PageHeader";
import logo from "@/assets/penta-logo.webp";

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title: "Penta — Chat" },
      { name: "description", content: "Pišite s Penta agentom." },
    ],
  }),
  component: ChatPage,
});

interface Msg { id: number; role: "user" | "agent"; text: string }

const initialMessages: Msg[] = [
  { id: 1, role: "agent", text: "Bok! Ja sam vaš Penta asistent. Kako vam mogu pomoći danas?" },
  { id: 2, role: "user", text: "Trebam ponudu za ESC Congress u Amsterdamu." },
  { id: 3, role: "agent", text: "Naravno! Polazak iz Zagreba, 27.08. – 02.09.? Mogu pripremiti opcije za let, hotel i transfer." },
];

const quickReplies = ["Pošalji ponudu", "Promijeni datume", "Drugi hotel", "Kontaktiraj agenta"];

function ChatPage() {
  const [messages, setMessages] = useState<Msg[]>(initialMessages);
  const [input, setInput] = useState("");
  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollerRef.current?.scrollTo({ top: scrollerRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const send = (text: string) => {
    if (!text.trim()) return;
    const id = messages.length + 1;
    setMessages((m) => [...m, { id, role: "user", text }]);
    setInput("");
    setTimeout(() => {
      setMessages((m) => [
        ...m,
        { id: id + 1, role: "agent", text: "Razumijem — pripremam detalje i šaljem vam ponudu na pregled." },
      ]);
    }, 800);
  };

  return (
    <MobileFrame>
      <PageHeader
        title="Penta agent"
        back={false}
        right={<span className="inline-flex h-2 w-2 rounded-full bg-[color:var(--status-approved)]" aria-label="online" />}
      />

      {false && (
        <>
          <div ref={scrollerRef} className="flex-1 overflow-y-auto px-4 py-5 space-y-3 bg-surface">
            {messages.map((m) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"} items-end gap-2`}
              >
                {m.role === "agent" && (
                  <div className="h-7 w-7 shrink-0 rounded-full bg-white shadow-card flex items-center justify-center overflow-hidden">
                    <img src={logo} alt="" className="h-4 w-auto" />
                  </div>
                )}
                <div
                  className={
                    m.role === "user"
                      ? "max-w-[78%] rounded-2xl rounded-br-md bg-gradient-brand px-4 py-2.5 text-sm text-white shadow-card"
                      : "max-w-[78%] rounded-2xl rounded-bl-md bg-[#F1F5F9] px-4 py-2.5 text-sm text-foreground"
                  }
                >
                  {m.text}
                </div>
              </motion.div>
            ))}
          </div>

          <div className="border-t border-border bg-background px-4 py-3">
            <div className="mb-2 flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 [scrollbar-width:none] [-ms-overflow-style:none]">
              {quickReplies.map((q) => (
                <button
                  key={q}
                  onClick={() => send(q)}
                  className="whitespace-nowrap rounded-full border-gradient-brand px-3.5 py-1.5 text-xs font-semibold text-gradient-brand"
                >
                  {q}
                </button>
              ))}
            </div>
            <form
              onSubmit={(e) => { e.preventDefault(); send(input); }}
              className="flex items-center gap-2 rounded-full bg-secondary px-2 py-1.5"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Pišite poruku..."
                className="flex-1 bg-transparent px-3 text-sm focus:outline-none"
              />
              {input.trim() ? (
                <button type="submit" className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-brand text-white shadow-elevated">
                  <Send className="h-4 w-4" />
                </button>
              ) : (
                <button type="button" className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-brand text-white shadow-elevated">
                  <Mic className="h-4 w-4" />
                </button>
              )}
            </form>
          </div>
        </>
      )}

      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center bg-surface">
        <p className="text-lg font-semibold text-foreground mb-2">
          Chat trenutno nije dostupan.
        </p>
        <p className="text-sm text-muted-foreground mb-6">
          Kontaktirajte nas putem WhatsAppa.
        </p>
        <a
          href="https://wa.me/385916059712"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-brand px-8 py-3 text-sm font-semibold text-white shadow-elevated active:opacity-90"
        >
          Otvori WhatsApp
        </a>
      </div>

      <BottomNav />
    </MobileFrame>
  );
}
