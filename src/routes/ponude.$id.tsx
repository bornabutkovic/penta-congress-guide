import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Plane, BedDouble, Car, Ticket, MapPin, Calendar, Check, Loader2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { MobileFrame } from "@/components/MobileFrame";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import {
  parseRequestData,
  statusMap,
  formatEur,
  type Quote,
  type QuoteDbStatus,
} from "@/hooks/useQuotes";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/ponude/$id")({
  head: () => ({
    meta: [
      { title: "Penta — Ponuda" },
      { name: "description", content: "Detalji ponude." },
    ],
  }),
  component: QuoteDetailPage,
});

const timelineSteps = ["Kreirano", "Na pregledu", "Odobreno", "Poslano"] as const;

function currentStep(status: QuoteDbStatus) {
  switch (status) {
    case "approved": return 2;
    case "sent": return 3;
    case "draft":
    case "pending_approval":
    case "rejected":
    case "error":
    default:
      return 1;
  }
}

function pick(obj: Record<string, unknown>, keys: string[]): string | undefined {
  for (const k of keys) {
    const v = obj?.[k];
    if (v !== undefined && v !== null && v !== "") return String(v);
  }
  return undefined;
}

function pickNum(obj: Record<string, unknown>, keys: string[]): number | undefined {
  for (const k of keys) {
    const v = obj?.[k];
    if (v === undefined || v === null || v === "") continue;
    const n = typeof v === "number" ? v : Number(v);
    if (!Number.isNaN(n)) return n;
  }
  return undefined;
}

function QuoteDetailPage() {
  const { id } = Route.useParams();
  const { user } = useAuth();
  const { profile } = useProfile();
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState<string | null>("flight");
  const [mutating, setMutating] = useState<null | "approve" | "reject">(null);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectComment, setRejectComment] = useState("");

  const fetchQuote = useCallback(async () => {
    const { data, error } = await supabase
      .from("quotes")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error) setError(error.message);
    setQuote((data as unknown as Quote) ?? null);
    setLoading(false);
  }, [id]);

  useEffect(() => {
    setLoading(true);
    fetchQuote();
  }, [fetchQuote]);

  const approvedBy = profile?.full_name || user?.email || "agent";
  const isAgent = profile?.role === "agent";

  async function handleApprove() {
    if (!quote) return;
    setMutating("approve");
    try {
      const res = await fetch(
        `https://penta.app.n8n.cloud/webhook/approve?token=${encodeURIComponent(quote.approval_token ?? "")}&approved_by=${encodeURIComponent(approvedBy)}`,
      );
      if (!res.ok) throw new Error("Odobrenje nije uspjelo (HTTP " + res.status + ")");
      toast.success("Ponuda odobrena");
      await fetchQuote();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Greška pri odobravanju");
    } finally {
      setMutating(null);
    }
  }

  async function handleReject() {
    if (!quote) return;
    setMutating("reject");
    try {
      const res = await fetch("https://penta.app.n8n.cloud/webhook/reject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: quote.approval_token,
          comment: rejectComment.trim() || undefined,
          approved_by: approvedBy,
        }),
      });
      if (!res.ok) throw new Error("Odbijanje nije uspjelo (HTTP " + res.status + ")");
      toast.success("Ponuda odbijena");
      setRejectOpen(false);
      setRejectComment("");
      await fetchQuote();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Greška pri odbijanju");
    } finally {
      setMutating(null);
    }
  }


  if (loading) {
    return (
      <MobileFrame>
        <PageHeader title="Detalji ponude" />
        <div className="flex-1 overflow-y-auto bg-surface p-5 space-y-3">
          <Skeleton className="h-24 w-full rounded-2xl" />
          <Skeleton className="h-16 w-full rounded-2xl" />
          <Skeleton className="h-16 w-full rounded-2xl" />
        </div>
      </MobileFrame>
    );
  }

  if (error) {
    return (
      <MobileFrame>
        <PageHeader title="Greška" />
        <div className="flex flex-1 items-center justify-center p-8 text-center text-sm text-muted-foreground">
          {error}
        </div>
      </MobileFrame>
    );
  }

  if (!quote) {
    return (
      <MobileFrame>
        <PageHeader title="Ponuda" />
        <div className="flex flex-1 items-center justify-center p-8 text-center text-sm text-muted-foreground">
          Ponuda nije pronađena.
        </div>
      </MobileFrame>
    );
  }

  const req = parseRequestData(quote.request_data);
  const flight = parseRequestData(quote.flight_data);
  const hotel = parseRequestData(quote.hotel_data);
  const transfer = parseRequestData(quote.transfer_data);
  const fee = parseRequestData(quote.fee_data);

  const congressName = (req.congress_name as string) || quote.client_name || "Ponuda";
  const city = (req.city as string) || "";
  const country = (req.country as string) || "";
  const checkin = req.checkin as string | undefined;
  const checkout = req.checkout as string | undefined;
  const dates = checkin && checkout ? `${checkin} – ${checkout}` : checkin || checkout || "";
  const origin = (req.origin_city as string) || "";

  const uiStatus = statusMap[quote.status] ?? "pending";
  const step = currentStep(quote.status);

  const has = (o: Record<string, unknown>) => o && Object.keys(o).length > 0;

  const sections = [
    {
      key: "flight",
      label: "Let",
      icon: Plane,
      present: has(flight),
      body: (() => {
        const from = pick(flight, ["from", "origin", "origin_city", "departure"]) || origin;
        const to = pick(flight, ["to", "destination", "arrival"]) || city;
        const airline = pick(flight, ["airline", "carrier"]);
        const flightDates = pick(flight, ["dates", "date", "departure_date"]);
        const price = pickNum(flight, ["price", "total", "amount"]);
        return (
          <div className="text-sm space-y-1.5">
            {(from || to) && (
              <p><span className="text-muted-foreground">Ruta:</span> <b>{from} → {to}</b></p>
            )}
            {airline && <p><span className="text-muted-foreground">Aviokompanija:</span> {airline}</p>}
            {flightDates && <p><span className="text-muted-foreground">Datumi:</span> {flightDates}</p>}
            {price !== undefined && <p className="pt-1 font-bold">{formatEur(price)}</p>}
          </div>
        );
      })(),
    },
    {
      key: "hotel",
      label: "Smještaj",
      icon: BedDouble,
      present: has(hotel),
      body: (() => {
        const name = pick(hotel, ["name", "hotel_name", "hotel"]);
        const room = pick(hotel, ["room", "room_name", "room_type"]);
        const nights = pick(hotel, ["nights"]);
        const price = pickNum(hotel, ["price", "total", "amount"]);
        return (
          <div className="text-sm space-y-1.5">
            {name && <p><b>{name}</b></p>}
            {room && <p><span className="text-muted-foreground">Soba:</span> {room}</p>}
            {nights && <p><span className="text-muted-foreground">Noćenja:</span> {nights}</p>}
            {price !== undefined && <p className="pt-1 font-bold">{formatEur(price)}</p>}
          </div>
        );
      })(),
    },
    {
      key: "transfer",
      label: "Transfer",
      icon: Car,
      present: has(transfer),
      body: (() => {
        const type = pick(transfer, ["type", "name", "description"]);
        const price = pickNum(transfer, ["price", "total", "amount"]);
        return (
          <div className="text-sm space-y-1.5">
            {type && <p>{type}</p>}
            {price !== undefined && <p className="pt-1 font-bold">{formatEur(price)}</p>}
          </div>
        );
      })(),
    },
    {
      key: "fee",
      label: "Kotizacija",
      icon: Ticket,
      present: has(fee),
      body: (() => {
        const name = pick(fee, ["name", "type", "description"]);
        const price = pickNum(fee, ["price", "total", "amount"]);
        return (
          <div className="text-sm space-y-1.5">
            {name && <p>{name}</p>}
            {price !== undefined && <p className="pt-1 font-bold">{formatEur(price)}</p>}
          </div>
        );
      })(),
    },
  ];

  return (
    <MobileFrame>
      <PageHeader title="Detalji ponude" />

      <div className="flex-1 overflow-y-auto bg-surface">
        <div className="relative px-5 pt-5 pb-6 bg-gradient-bg">
          <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-brand" />
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="text-lg font-bold leading-tight">{congressName}</h2>
              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                {(city || country) && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3 w-3" />{[city, country].filter(Boolean).join(", ")}
                  </span>
                )}
                {dates && (
                  <span className="inline-flex items-center gap-1"><Calendar className="h-3 w-3" />{dates}</span>
                )}
              </div>
            </div>
            <StatusBadge status={uiStatus} />
          </div>

          <div className="mt-5 rounded-2xl bg-white p-4 shadow-card">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Ukupno</p>
            <p className="mt-1 text-3xl font-extrabold text-gradient-brand">
              {quote.total_price ? formatEur(Number(quote.total_price)) : "Na upit"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">Uključuje sve stavke ponude</p>
          </div>
        </div>

        <div className="px-5 mt-4 space-y-3">
          {sections.map(({ key, label, icon: Icon, present, body }) => {
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
                  <div className="px-4 pb-4 pl-[68px]">
                    {present ? body : (
                      <p className="text-sm text-muted-foreground">Nije uključeno u ponudu</p>
                    )}
                  </div>
                </motion.div>
              </div>
            );
          })}
        </div>

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

        {isAgent && quote.status === "pending_approval" && (
          <div className="px-5 mt-2 mb-8 space-y-2">
            <button
              onClick={handleApprove}
              disabled={mutating !== null}
              className={cn(
                "w-full h-12 rounded-xl bg-gradient-brand text-white text-sm font-semibold shadow-elevated flex items-center justify-center gap-2 active:scale-[0.99] transition",
                mutating !== null && "opacity-70 cursor-not-allowed",
              )}
            >
              {mutating === "approve" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Odobri
            </button>
            <button
              onClick={() => setRejectOpen(true)}
              disabled={mutating !== null}
              className={cn(
                "w-full h-12 rounded-xl border border-destructive text-destructive text-sm font-semibold active:scale-[0.99] transition",
                mutating !== null && "opacity-70 cursor-not-allowed",
              )}
            >
              Odbij
            </button>
          </div>
        )}
      </div>

      <Dialog open={rejectOpen} onOpenChange={(o) => !mutating && setRejectOpen(o)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Odbij ponudu</DialogTitle>
          </DialogHeader>
          <Textarea
            value={rejectComment}
            onChange={(e) => setRejectComment(e.target.value)}
            placeholder="Razlog odbijanja (opcionalno)"
            rows={4}
          />
          <DialogFooter>
            <button
              onClick={() => setRejectOpen(false)}
              disabled={mutating !== null}
              className="h-10 px-4 rounded-xl border border-border text-sm font-medium"
            >
              Odustani
            </button>
            <button
              onClick={handleReject}
              disabled={mutating !== null}
              className={cn(
                "h-10 px-4 rounded-xl bg-destructive text-destructive-foreground text-sm font-semibold flex items-center gap-2",
                mutating !== null && "opacity-70 cursor-not-allowed",
              )}
            >
              {mutating === "reject" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Odbij ponudu
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MobileFrame>
  );
}
