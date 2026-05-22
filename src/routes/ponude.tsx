import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { MapPin, Calendar, ChevronRight, Search } from "lucide-react";
import { motion } from "framer-motion";
import { MobileFrame } from "@/components/MobileFrame";
import { BottomNav } from "@/components/BottomNav";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { quotes, formatEur, type QuoteStatus } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/ponude")({
  head: () => ({
    meta: [
      { title: "Penta — Moje ponude" },
      { name: "description", content: "Pregled svih kongresnih ponuda." },
    ],
  }),
  component: PonudePage,
});

const tabs: { key: "all" | QuoteStatus; label: string }[] = [
  { key: "all", label: "Sve" },
  { key: "pending", label: "Na čekanju" },
  { key: "approved", label: "Odobreno" },
  { key: "sent", label: "Poslano" },
];

function PonudePage() {
  const [tab, setTab] = useState<(typeof tabs)[number]["key"]>("all");
  const filtered = tab === "all" ? quotes : quotes.filter((q) => q.status === tab);

  return (
    <MobileFrame>
      <PageHeader title="Moje ponude" back={false} right={
        <button className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary">
          <Search className="h-4 w-4" />
        </button>
      } />

      <div className="border-b border-border bg-background">
        <div className="flex gap-1 overflow-x-auto px-3 [scrollbar-width:none]">
          {tabs.map(({ key, label }) => {
            const active = tab === key;
            return (
              <button
                key={key}
                onClick={() => setTab(key)}
                className="relative whitespace-nowrap px-3 py-3 text-sm font-semibold"
              >
                <span className={active ? "text-gradient-brand" : "text-muted-foreground"}>{label}</span>
                {active && (
                  <motion.span
                    layoutId="tab-underline"
                    className="absolute inset-x-2 bottom-0 h-[3px] rounded-full bg-gradient-brand"
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-surface">
        {filtered.length === 0 && (
          <div className="rounded-2xl bg-card p-8 text-center text-sm text-muted-foreground shadow-card">
            Nema ponuda u ovoj kategoriji.
          </div>
        )}
        {filtered.map((q, i) => (
          <motion.div
            key={q.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
          >
            <Link
              to="/ponude/$id"
              params={{ id: q.id }}
              className={cn("block rounded-2xl bg-card p-4 shadow-card transition active:scale-[0.99]")}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-bold leading-tight">{q.congress}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" />{q.city}, {q.country}</span>
                    <span className="inline-flex items-center gap-1"><Calendar className="h-3 w-3" />{q.dates}</span>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                <StatusBadge status={q.status} />
                <p className="text-base font-bold text-gradient-brand">{formatEur(q.total)}</p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      <BottomNav />
    </MobileFrame>
  );
}
