import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Plane, BedDouble, Car, Ticket, MapPin, Calendar, Check, Loader2, Send } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { MobileFrame } from "@/components/MobileFrame";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import {
  parseRequestData,
  statusMap,
  formatEur,
  type Quote,
  type QuoteDbStatus,
} from "@/hooks/useQuotes";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/ponude_/$id")({
  head: ({ params }) => ({
    meta: [
      { title: "Detalji ponude | PICCARD³" },
      { name: "description", content: "Detalji ponude." },
      { property: "og:title", content: "Detalji ponude | PICCARD³" },
      { property: "og:description", content: "Detalji ponude za kongresno putovanje." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `https://penta-travel.lovable.app/ponude/${params.id}` },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: `https://penta-travel.lovable.app/ponude/${params.id}` }],
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
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState<string | null>("flight");

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



  if (loading) {
    return (
      <MobileFrame>
        <PageHeader title="Detalji ponude" />
        <div className="flex-1 min-h-0 overflow-y-auto bg-surface p-5 space-y-3">
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
            {price !== undefined && <p className="font-display pt-1 font-bold">{formatEur(price)}</p>}
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
            {price !== undefined && <p className="font-display pt-1 font-bold">{formatEur(price)}</p>}
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
            {price !== undefined && <p className="font-display pt-1 font-bold">{formatEur(price)}</p>}
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
            {price !== undefined && <p className="font-display pt-1 font-bold">{formatEur(price)}</p>}
          </div>
        );
      })(),
    },
  ];

  return (
    <MobileFrame>
      <PageHeader title="Detalji ponude" />

      <div className="flex-1 min-h-0 overflow-y-auto bg-surface">
        <div className="relative px-5 pt-5 pb-6 bg-gradient-bg">
          <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-brand" />
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="font-display text-lg font-bold leading-tight">{congressName}</h2>
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

          <div className="mt-5 rounded-2xl bg-card p-4 shadow-card">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Ukupno</p>
            <p className="font-display mt-1 text-3xl font-bold text-gradient-brand">
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
          <h3 className="font-display mb-3 text-sm font-semibold">Status</h3>
          <div className="rounded-2xl bg-card p-5 shadow-card">
            <ol className="space-y-4">
              {timelineSteps.map((label, i) => {
                const done = i <= step;
                const current = i === step;
                return (
                  <li key={label} className="flex items-center gap-3">
                    <span className={cn(
                      "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold",
                      done ? "bg-gradient-brand text-primary-foreground shadow-elevated" : "bg-secondary text-muted-foreground",
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

        <div className="px-5 mb-8">
          <BookingRequestCard
            quoteId={quote.id}
            data={{ flight, hotel, transfer, fee }}
            present={{
              flight: has(flight),
              hotel: has(hotel),
              transfer: has(transfer),
              fee: has(fee),
            }}
          />
        </div>
      </div>
    </MobileFrame>
  );
}

type BookingKey = "flight" | "hotel" | "transfer" | "fee";

const bookingMeta: Record<BookingKey, { label: string; icon: typeof Plane }> = {
  flight: { label: "Let", icon: Plane },
  hotel: { label: "Smještaj", icon: BedDouble },
  transfer: { label: "Transfer", icon: Car },
  fee: { label: "Kotizacija", icon: Ticket },
};

const bookingStatusLabels: Record<string, string> = {
  requested: "Zahtjev poslan — čeka ručnu rezervaciju",
  manually_booked: "Rezervirano",
  cancelled: "Zahtjev otkazan",
};

interface BookingRequestRow {
  id: string;
  status: string;
  created_at: string;
  include_flight: boolean;
  include_hotel: boolean;
  include_transfer: boolean;
  include_fee: boolean;
}

function BookingRequestCard({
  quoteId,
  data,
  present,
}: {
  quoteId: string;
  data: Record<BookingKey, Record<string, unknown>>;
  present: Record<BookingKey, boolean>;
}) {
  const { user } = useAuth();
  const availableKeys = (Object.keys(bookingMeta) as BookingKey[]).filter((k) => present[k]);
  const [request, setRequest] = useState<BookingRequestRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selected, setSelected] = useState<Record<BookingKey, boolean>>({
    flight: present.flight,
    hotel: present.hotel,
    transfer: present.transfer,
    fee: present.fee,
  });

  const load = useCallback(async () => {
    const { data: rows, error } = await supabase
      .from("booking_requests")
      .select("id,status,created_at,include_flight,include_hotel,include_transfer,include_fee")
      .eq("quote_id", quoteId)
      .order("created_at", { ascending: false })
      .limit(1);
    if (error) {
      toast.error("Greška pri učitavanju zahtjeva za rezervaciju");
    } else {
      setRequest((rows?.[0] as BookingRequestRow | undefined) ?? null);
    }
    setLoading(false);
  }, [quoteId]);

  useEffect(() => {
    load();
  }, [load]);

  const anySelected = availableKeys.some((k) => selected[k]);

  async function handleSubmit() {
    setSubmitting(true);
    try {
      const { error } = await supabase.from("booking_requests").insert({
        quote_id: quoteId,
        include_flight: !!selected.flight && present.flight,
        include_hotel: !!selected.hotel && present.hotel,
        include_transfer: !!selected.transfer && present.transfer,
        include_fee: !!selected.fee && present.fee,
        selected_flight: selected.flight && present.flight ? data.flight : null,
        selected_hotel: selected.hotel && present.hotel ? data.hotel : null,
        selected_transfer: selected.transfer && present.transfer ? data.transfer : null,
        selected_fee: selected.fee && present.fee ? data.fee : null,
        requested_by_email: user?.email ?? null,
      });
      if (error) throw new Error(error.message);
      toast.success("Zahtjev za rezervaciju poslan");
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Greška pri slanju zahtjeva");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <Skeleton className="h-28 w-full rounded-2xl" />;
  }

  if (request) {
    const includedKeys = (Object.keys(bookingMeta) as BookingKey[]).filter(
      (k) =>
        request[`include_${k}` as "include_flight" | "include_hotel" | "include_transfer" | "include_fee"],
    );
    return (
      <div className="rounded-2xl bg-card p-5 shadow-card">
        <h3 className="font-display text-sm font-semibold">Zahtjev za rezervaciju</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Zahtjev za rezervaciju poslan — Penta agent će ručno dovršiti rezervaciju.
        </p>
        <div className="mt-4 space-y-2">
          {includedKeys.map((k) => {
            const Icon = bookingMeta[k].icon;
            return (
              <div key={k} className="flex items-center gap-2 text-sm">
                <Icon className="h-4 w-4 text-primary" strokeWidth={2.2} />
                {bookingMeta[k].label}
              </div>
            );
          })}
        </div>
        <div className="mt-4 border-t border-border pt-3 text-xs text-muted-foreground space-y-1">
          <p>
            <span className="font-semibold">Status:</span>{" "}
            {bookingStatusLabels[request.status] ?? request.status}
          </p>
          <p>
            <span className="font-semibold">Poslano:</span>{" "}
            {new Date(request.created_at).toLocaleDateString("hr-HR")}
          </p>
        </div>
      </div>
    );
  }

  if (availableKeys.length === 0) return null;

  return (
    <div className="rounded-2xl bg-card p-5 shadow-card">
      <h3 className="font-display text-sm font-semibold">Zahtjev za rezervaciju</h3>
      <p className="mt-1 text-xs text-muted-foreground">
        Odaberite stavke koje želite rezervirati. Penta agent zatim ručno dovršava rezervaciju.
      </p>
      <div className="mt-4 space-y-2">
        {availableKeys.map((k) => {
          const Icon = bookingMeta[k].icon;
          return (
            <label key={k} className="flex items-center gap-3 py-1.5 cursor-pointer">
              <input
                type="checkbox"
                className="h-5 w-5 rounded accent-primary"
                checked={!!selected[k]}
                onChange={(e) => setSelected((s) => ({ ...s, [k]: e.target.checked }))}
              />
              <Icon className="h-4 w-4 text-primary" strokeWidth={2.2} />
              <span className="text-sm font-medium">{bookingMeta[k].label}</span>
            </label>
          );
        })}
      </div>
      <button
        onClick={handleSubmit}
        disabled={submitting || !anySelected}
        className={cn(
          "mt-5 w-full h-12 rounded-xl bg-gradient-brand text-primary-foreground text-sm font-semibold shadow-elevated flex items-center justify-center gap-2 active:scale-[0.99] transition",
          (submitting || !anySelected) && "opacity-60 cursor-not-allowed",
        )}
      >
        {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        Pošalji zahtjev za rezervaciju
      </button>
    </div>
  );
}
