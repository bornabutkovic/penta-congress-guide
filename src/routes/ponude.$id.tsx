import { createFileRoute, notFound } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Plane, BedDouble, Car, Ticket, MapPin, Calendar, Check } from "lucide-react";
import { useState } from "react";
import { MobileFrame } from "@/components/MobileFrame";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { quotes, formatEur, type Quote } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/ponude/$id")({
  loader: ({ params }) => {
    const quote = quotes.find((q) => q.id === params.id);
    if (!quote) throw notFound();
    return { quote };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `Penta — ${loaderData?.quote.congress ?? "Ponuda"}` },
      { name: "description", content: `Detalji ponude: ${loaderData?.quote.congress ?? ""}` },
    ],
  }),
  notFoundComponent: () => (
    <MobileFrame>
      <PageHeader title="Ponuda" />
      <div className="flex flex-1 items-center justify-center p-8 text-center text-sm text-muted-foreground">
        Ponuda nije pronađena.
      </div>
    </MobileFrame>
  ),
  errorComponent: ({ error }) => (
    <MobileFrame>
      <PageHeader title="Greška" />
      <div className="flex flex-1 items-center justify-center p-8 text-center text-sm text-muted-foreground">
        {error.message}
      </div>
    </MobileFrame>
  ),
  component: QuoteDetailPage,
});

const timelineSteps = ["Kreirano", "Na pregledu", "Odobreno", "Poslano"] as const;

function currentStep(status: Quote["status"]) {
  switch (status) {
    case "pending": return 1;
    case "approved": return 2;
    case "sent": return 3;
    case "rejected": return 1;
  }
}

function QuoteDetailPage() {
  const { quote } = Route.useLoaderData();
  const [open, setOpen] = useState<string | null>("flight");
  const step = currentStep(quote.status);

  const sections = [
    { key: "flight", label: "Let", icon: Plane, body: (
      <div className="text-sm space-y-1.5">
        <p><span className="text-muted-foreground">Ruta:</span> <b>{quote.sections.flight.from} → {quote.sections.flight.to}</b></p>
        <p><span className="text-muted-foreground">Aviokompanija:</span> {quote.sections.flight.airline}</p>
        <p><span className="text-muted-foreground">Datumi:</span> {quote.sections.flight.dates}</p>
        <p className="pt-1 font-bold">{formatEur(quote.sections.flight.price)}</p>
      </div>
    )},
    { key: "hotel", label: "Smještaj", icon: BedDouble, body: (
      <div className="text-sm space-y-1.5">
        <p><b>{quote.sections.hotel.name}</b></p>
        <p><span className="text-muted-foreground">Soba:</span> {quote.sections.hotel.room}</p>
        <p><span className="text-muted-foreground">Noćenja:</span> {quote.sections.hotel.nights}</p>
        <p className="pt-1 font-bold">{formatEur(quote.sections.hotel.price)}</p>
      </div>
    )},
    { key: "transfer", label: "Transfer", icon: Car, body: (
      <div className="text-sm space-y-1.5">
        <p>{quote.sections.transfer.type}</p>
        <p className="pt-1 font-bold">{formatEur(quote.sections.transfer.price)}</p>
      </div>
    )},
    { key: "fee", label: "Kotizacija", icon: Ticket, body: (
      <div className="text-sm space-y-1.5">
        <p>{quote.sections.fee.name}</p>
        <p className="pt-1 font-bold">{formatEur(quote.sections.fee.price)}</p>
      </div>
    )},
  ];

  return (
    <MobileFrame>
      <PageHeader title="Detalji ponude" />

      <div className="flex-1 overflow-y-auto bg-surface">
        {/* Header card */}
        <div className="relative px-5 pt-5 pb-6 bg-gradient-bg">
          <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-brand" />
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="text-lg font-bold leading-tight">{quote.congress}</h2>
              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" />{quote.city}, {quote.country}</span>
                <span className="inline-flex items-center gap-1"><Calendar className="h-3 w-3" />{quote.dates}</span>
              </div>
            </div>
            <StatusBadge status={quote.status} />
          </div>

          <div className="mt-5 rounded-2xl bg-white p-4 shadow-card">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Ukupno</p>
            <p className="mt-1 text-3xl font-extrabold text-gradient-brand">{formatEur(quote.total)}</p>
            <p className="mt-1 text-xs text-muted-foreground">Uključuje sve stavke ponude</p>
          </div>
        </div>

        {/* Sections accordion */}
        <div className="px-5 mt-4 space-y-3">
          {sections.map(({ key, label, icon: Icon, body }) => {
            const isOpen = open === key;
            return (
              <div key={key} className="rounded-2xl bg-card shadow-card overflow-hidden">
                <button
                  onClick={() => setOpen(isOpen ? null : key)}
                  className="flex w-full items-center gap-3 p-4"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-brand-soft text-gradient-brand">
                    <Icon className="h-5 w-5" strokeWidth={2.2} />
                  </span>
                  <span className="flex-1 text-left text-sm font-semibold">{label}</span>
                  <span className={cn("text-xs text-muted-foreground transition", isOpen && "rotate-180")}>▾</span>
                </button>
                <motion.div
                  initial={false}
                  animate={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-4 pl-[68px]">{body}</div>
                </motion.div>
              </div>
            );
          })}
        </div>

        {/* Timeline */}
        <div className="px-5 mt-6 mb-8">
          <h3 className="mb-3 text-sm font-semibold">Status</h3>
          <div className="rounded-2xl bg-card p-5 shadow-card">
            <ol className="space-y-4">
              {timelineSteps.map((label, i) => {
                const done = i <= step;
                const current = i === step;
                return (
                  <li key={label} className="flex items-center gap-3">
                    <span className={cn(
                      "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold",
                      done ? "bg-gradient-brand text-white shadow-elevated" : "bg-secondary text-muted-foreground",
                    )}>
                      {done ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : i + 1}
                    </span>
                    <span className={cn("text-sm", current ? "font-bold" : done ? "font-medium" : "text-muted-foreground")}>
                      {label}
                    </span>
                    {current && <span className="ml-auto text-[10px] font-semibold text-gradient-brand uppercase tracking-wider">Trenutno</span>}
                  </li>
                );
              })}
            </ol>
          </div>
        </div>

        <div className="px-5 pb-8">
          <button className="w-full rounded-2xl bg-gradient-brand py-3.5 text-sm font-semibold text-white shadow-elevated active:scale-[0.99]">
            Pošalji na odobrenje
          </button>
        </div>
      </div>
    </MobileFrame>
  );
}
