import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Plane, BedDouble, Car, Ticket, MapPin, Calendar, Check, Loader2, Send, Star, Clock3, Luggage, BriefcaseBusiness } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { MobileFrame } from "@/components/MobileFrame";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/lib/supabase";
import type { Json } from "@/integrations/supabase/types";
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

type CategoryKind = "flight" | "hotel" | "transfer" | "fee";

interface NormalizedOption {
  key: string;
  title: string;
  subtitle?: string;
  price?: number;
  recommended?: boolean;
  flightDetails?: FlightOptionDetails;
  raw: Record<string, unknown>;
}

interface FlightSegmentDetail {
  flightNumber?: string;
  checkedBags?: number;
  cabinBags?: number;
}

interface FlightLegDetail {
  label: string;
  origin: string;
  destination: string;
  departureAt?: string;
  arrivalAt?: string;
  durationMinutes?: number;
  stops: number;
  layoverSummary?: string;
  segments: FlightSegmentDetail[];
}

interface FlightOptionDetails {
  legs: FlightLegDetail[];
  totalDurationMinutes?: number;
  checkedBags?: number;
  cabinBags?: number;
}

interface CategoryView {
  kind: CategoryKind;
  label: string;
  icon: typeof Plane;
  visible: boolean;
  items: NormalizedOption[];
  emptyMessage?: string;
}

const categoryMeta: Record<CategoryKind, { label: string; icon: typeof Plane }> = {
  flight: { label: "Let", icon: Plane },
  hotel: { label: "Smještaj", icon: BedDouble },
  transfer: { label: "Transfer", icon: Car },
  fee: { label: "Kotizacija", icon: Ticket },
};

function num(v: unknown): number | undefined {
  if (v === null || v === undefined || v === "") return undefined;
  const n = typeof v === "number" ? v : Number(v);
  return Number.isNaN(n) ? undefined : n;
}

function record(v: unknown): Record<string, unknown> | undefined {
  return v && typeof v === "object" && !Array.isArray(v) ? v as Record<string, unknown> : undefined;
}

function text(v: unknown): string | undefined {
  return typeof v === "string" && v.trim() ? v : undefined;
}

function buildFlightLeg(
  label: string,
  rawLeg: Record<string, unknown>,
  fareDetails: Record<string, unknown>[],
  fareOffset: number,
  fallbackCheckedBags?: number,
  fallbackCabinBags?: number,
): FlightLegDetail {
  const rawSegments = Array.isArray(rawLeg.segments) ? rawLeg.segments : [];
  const segments = rawSegments.map((rawSegment, index) => {
    const segment = record(rawSegment) ?? {};
    const fare = fareDetails[fareOffset + index] ?? {};
    return {
      flightNumber: text(segment.flight_number),
      checkedBags: num(record(fare.includedCheckedBags)?.quantity) ?? fallbackCheckedBags,
      cabinBags: num(record(fare.includedCabinBags)?.quantity) ?? fallbackCabinBags,
    };
  });

  return {
    label,
    origin: text(rawLeg.origin) ?? text(record(rawSegments[0])?.from) ?? "",
    destination: text(rawLeg.destination) ?? text(record(rawSegments.at(-1))?.to) ?? "",
    departureAt: text(rawLeg.departure_at),
    arrivalAt: text(rawLeg.arrival_at),
    durationMinutes: num(rawLeg.duration_minutes),
    stops: num(rawLeg.stops) ?? Math.max(segments.length - 1, 0),
    layoverSummary: text(rawLeg.layover_summary),
    segments,
  };
}

function buildCategoryView(kind: CategoryKind, data: Record<string, unknown>): CategoryView {
  const meta = categoryMeta[kind];
  const exists = !!data && Object.keys(data).length > 0;
  const reason = typeof data.reason === "string" ? data.reason : undefined;

  if (kind === "flight") {
    const notNeeded = reason === "no_flight_needed";
    const opts = Array.isArray(data.options) ? (data.options as Record<string, unknown>[]) : [];
    const items: NormalizedOption[] = opts.map((o, i) => {
      const outbound = o.outbound as Record<string, unknown> | undefined;
      const inbound = o.inbound as Record<string, unknown> | undefined;
      const rawOffer = record(o.raw_offer);
      const travelerPricings = Array.isArray(rawOffer?.travelerPricings) ? rawOffer.travelerPricings : [];
      const firstTraveler = record(travelerPricings[0]);
      const fareDetails = Array.isArray(firstTraveler?.fareDetailsBySegment)
        ? firstTraveler.fareDetailsBySegment.map((fare) => record(fare) ?? {})
        : [];
      const checkedBags = num(o.bags_included);
      const cabinBags = num(o.cabin_bags_included);
      const outboundSegmentCount = Array.isArray(outbound?.segments) ? outbound.segments.length : 0;
      const legs = [
        outbound ? buildFlightLeg("Odlazak", outbound, fareDetails, 0, checkedBags, cabinBags) : null,
        inbound ? buildFlightLeg("Povratak", inbound, fareDetails, outboundSegmentCount, checkedBags, cabinBags) : null,
      ].filter((leg): leg is FlightLegDetail => leg !== null);
      const flightNumbers = legs.flatMap((leg) => leg.segments.map((segment) => segment.flightNumber).filter(Boolean));
      return {
        key: String(o.offer_id ?? i),
        title: [o.airline ?? "Let", flightNumbers.join(", ")].filter(Boolean).join(" · "),
        price: num(o.price_total),
        flightDetails: {
          legs,
          totalDurationMinutes: num(o.total_duration_minutes),
          checkedBags,
          cabinBags,
        },
        raw: o,
      };
    });
    return {
      kind, label: meta.label, icon: meta.icon,
      visible: !notNeeded,
      items,
      emptyMessage: !notNeeded && items.length === 0
        ? "Pretraga nije vratila nijedan let (moguće da su svi letovi bez predane prtljage ili izvan traženog vremena) – potrebna ručna provjera."
        : undefined,
    };
  }

  if (kind === "hotel") {
    const notNeeded = reason === "no_hotel_needed";
    const opts = Array.isArray(data.options) ? (data.options as Record<string, unknown>[]) : [];
    const recommended = data.recommended as Record<string, unknown> | null | undefined;
    const recId = recommended ? String(recommended.hid ?? "") : null;
    const items: NormalizedOption[] = opts.map((o, i) => ({
      key: String(o.hid ?? i),
      title: (o.ratehawk_confirmed_name as string) || (o.room_name as string) || `Hotel #${i + 1}`,
      subtitle: [o.room_name, o.rate_label, o.rooms ? `${o.rooms} soba` : null].filter(Boolean).join(" · "),
      price: num(o.price),
      recommended: recId != null && String(o.hid) === recId,
      raw: o,
    }));
    const venueMsg = (data.venue as Record<string, unknown> | undefined)?.message as string | undefined;
    const centerMsg = (data.center as Record<string, unknown> | undefined)?.message as string | undefined;
    return {
      kind, label: meta.label, icon: meta.icon,
      visible: !notNeeded,
      items,
      emptyMessage: !notNeeded && items.length === 0
        ? (venueMsg || centerMsg || "Pretraga nije vratila dostupne hotele u traženoj kategoriji – potrebna ručna provjera.")
        : undefined,
    };
  }

  if (kind === "transfer") {
    const notNeeded = reason === "no_transfer_needed";
    const opts = Array.isArray(data.options) ? (data.options as Record<string, unknown>[]) : [];
    const items: NormalizedOption[] = opts.map((o, i) => ({
      key: String(i),
      title: (o.vehicle as string) || "Transfer",
      subtitle: o.route as string | undefined,
      price: num(o.price_total) ?? num(o.price_per_direction),
      raw: o,
    }));
    return {
      kind, label: meta.label, icon: meta.icon,
      visible: !notNeeded,
      items,
      emptyMessage: !notNeeded && items.length === 0
        ? "Pretraga transfera nije vratila opcije – potrebna ručna provjera."
        : undefined,
    };
  }

  const cats = Array.isArray(data.all_categories) ? (data.all_categories as Record<string, unknown>[]) : [];
  const preferred = data.preferred_category as Record<string, unknown> | null | undefined;
  const items: NormalizedOption[] = cats.map((c, i) => ({
    key: String(i),
    title: c.type as string,
    subtitle: c.deadline ? (c.is_expired ? `Istekao rok: ${c.deadline}` : `Rok: ${c.deadline}`) : undefined,
    price: num(c.price),
    recommended: !!preferred && preferred.type === c.type,
    raw: c,
  }));
  return {
    kind, label: meta.label, icon: meta.icon,
    visible: exists,
    items,
    emptyMessage: exists && items.length === 0
      ? ((data.notes as string) || "Nije pronađena kotizacija za ovaj kongres – potrebna ručna provjera.")
      : undefined,
  };
}

const bookingStatusLabels: Record<string, string> = {
  requested: "Zahtjev poslan — čeka ručnu rezervaciju",
  manually_booked: "Rezervirano",
  cancelled: "Zahtjev otkazan",
  booked: "Rezervirano",
};

const RESERVATION_GATEWAY_URL = "https://penta.app.n8n.cloud/webhook/penta-reservation";

interface BookingRequestRow {
  id: string;
  status: string;
  created_at: string;
  include_flight: boolean;
  include_hotel: boolean;
  include_transfer: boolean;
  include_fee: boolean;
  selected_flight: Record<string, unknown> | null;
  selected_hotel: Record<string, unknown> | null;
  selected_transfer: Record<string, unknown> | null;
  selected_fee: Record<string, unknown> | null;
  price_check: string | null;
  failure_reason: string | null;
  failed_at: string | null;
  booked_at: string | null;
  vendor_booking_reference: string | null;
}

function optionSummary(raw: Record<string, unknown> | null | undefined, kind: CategoryKind): string {
  if (!raw) return "";
  if (kind === "flight") return `${raw.airline ?? ""} — ${formatEur(num(raw.price_total) ?? 0)}`;
  if (kind === "hotel") return `${raw.ratehawk_confirmed_name ?? raw.room_name ?? ""} — ${formatEur(num(raw.price) ?? 0)}`;
  if (kind === "transfer") return `${raw.vehicle ?? ""} — ${formatEur(num(raw.price_total) ?? num(raw.price_per_direction) ?? 0)}`;
  return `${raw.type ?? ""} — ${formatEur(num(raw.price) ?? 0)}`;
}

function QuoteDetailPage() {
  const { id } = Route.useParams();
  const { user } = useAuth();
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [bookingRequest, setBookingRequest] = useState<BookingRequestRow | null>(null);
  const [bookingLoading, setBookingLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [priceCheckStatus, setPriceCheckStatus] = useState<"idle" | "checking" | "error">("idle");
  const [confirming, setConfirming] = useState(false);
  const [selected, setSelected] = useState<Record<CategoryKind, string | null>>({
    flight: null, hotel: null, transfer: null, fee: null,
  });

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

  const fetchBookingRequest = useCallback(async () => {
    const { data, error } = await supabase
      .from("booking_requests")
      .select("id,status,created_at,include_flight,include_hotel,include_transfer,include_fee,selected_flight,selected_hotel,selected_transfer,selected_fee,price_check,failure_reason,failed_at,booked_at,vendor_booking_reference")
      .eq("quote_id", id)
      .order("created_at", { ascending: false })
      .limit(1);
    if (error) {
      toast.error("Greška pri učitavanju zahtjeva za rezervaciju");
    } else {
      setBookingRequest((data?.[0] as unknown as BookingRequestRow | undefined) ?? null);
    }
    setBookingLoading(false);
  }, [id]);

  useEffect(() => {
    setLoading(true);
    fetchQuote();
  }, [fetchQuote]);

  useEffect(() => {
    setBookingLoading(true);
    fetchBookingRequest();
  }, [fetchBookingRequest]);

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
  const flightData = parseRequestData(quote.flight_data);
  const hotelData = parseRequestData(quote.hotel_data);
  const transferData = parseRequestData(quote.transfer_data);
  const feeData = parseRequestData(quote.fee_data);

  const congressName = (req.congress_name as string) || quote.client_name || "Ponuda";
  const city = (req.congress_city as string) || "";
  const country = (req.congress_country as string) || "";
  const checkin = req.checkin as string | undefined;
  const checkout = req.checkout as string | undefined;
  const dates = checkin && checkout ? `${checkin} – ${checkout}` : checkin || checkout || "";

  const uiStatus = statusMap[quote.status] ?? "pending";
  const step = currentStep(quote.status);

  const categories: CategoryView[] = [
    buildCategoryView("flight", flightData),
    buildCategoryView("hotel", hotelData),
    buildCategoryView("transfer", transferData),
    buildCategoryView("fee", feeData),
  ].filter((c) => c.visible);

  const bookable = categories.filter((c) => c.items.length > 0);
  const hasExistingRequest = !!bookingRequest;
  const anySelected = bookable.some((c) => selected[c.kind] != null);

  const selectedTotal = bookable.reduce((sum, c) => {
    const key = selected[c.kind];
    if (key == null) return sum;
    const item = c.items.find((i) => i.key === key);
    return sum + (item?.price ?? 0);
  }, 0);

  const displayTotal = !hasExistingRequest && anySelected
    ? selectedTotal
    : (quote.total_price ? Number(quote.total_price) : undefined);

  const totalCaption = !hasExistingRequest && anySelected
    ? "Zbroj odabranih stavki za rezervaciju"
    : "Uključuje sve stavke ponude";

  async function handleSubmit() {
    setSubmitting(true);
    try {
      const pickRaw = (kind: CategoryKind): Record<string, unknown> | null => {
        const cat = bookable.find((c) => c.kind === kind);
        const key = selected[kind];
        if (!cat || key == null) return null;
        return cat.items.find((i) => i.key === key)?.raw ?? null;
      };
      const selFlight = pickRaw("flight");
      const selHotel = pickRaw("hotel");
      const selTransfer = pickRaw("transfer");
      const selFee = pickRaw("fee");

      const { data: inserted, error } = await supabase.from("booking_requests").insert({
        quote_id: id,
        include_flight: !!selFlight,
        include_hotel: !!selHotel,
        include_transfer: !!selTransfer,
        include_fee: !!selFee,
        selected_flight: selFlight as unknown as Json,
        selected_hotel: selHotel as unknown as Json,
        selected_transfer: selTransfer as unknown as Json,
        selected_fee: selFee as unknown as Json,
        requested_by_email: user?.email ?? null,
      }).select().single();
      if (error) throw new Error(error.message);
      toast.success("Zahtjev za rezervaciju poslan");
      await fetchBookingRequest();
      setSubmitting(false);
      if (inserted?.id) void runPriceCheck(inserted.id);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Greška pri slanju zahtjeva");
    } finally {
      setSubmitting(false);
    }
  }

  async function callGateway(bookingRequestId: string, action: "price_check" | "confirm") {
    const res = await fetch(RESERVATION_GATEWAY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-penta-key": "pnt_res_9f2b6ac1d84e4310_zg26" },
      body: JSON.stringify({ booking_request_id: bookingRequestId, action }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json().catch(() => null);
    return (Array.isArray(json) ? json[0] : json) as Partial<BookingRequestRow> | null;
  }

  async function runPriceCheck(bookingRequestId: string) {
    setPriceCheckStatus("checking");
    try {
      await callGateway(bookingRequestId, "price_check");
      await fetchBookingRequest();
      setPriceCheckStatus("idle");
    } catch {
      toast.error("Provjera cijene nije uspjela");
      setPriceCheckStatus("error");
    }
  }

  async function handleConfirm() {
    if (!bookingRequest) return;
    setConfirming(true);
    try {
      const row = await callGateway(bookingRequest.id, "confirm");
      if (row && row.id) setBookingRequest((prev) => (prev ? { ...prev, ...row } : prev));
      await fetchBookingRequest();
    } catch {
      toast.error("Rezervacija nije uspjela");
    } finally {
      setConfirming(false);
    }
  }

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
              {displayTotal !== undefined ? formatEur(displayTotal) : "Na upit"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{totalCaption}</p>
          </div>
        </div>

        <div className="px-5 mt-4">
          <h3 className="font-display mb-3 text-sm font-semibold">Stavke ponude</h3>
          <p className="mb-3 text-xs text-muted-foreground">
            {hasExistingRequest
              ? "Prikazane su stavke koje su tražene u zahtjevu."
              : "Prikazane su samo stavke koje su tražene u zahtjevu. Odaberite po jednu opciju za svaku stavku koju želite poslati na rezervaciju."}
          </p>
        </div>

        <div className="px-5 space-y-3">
          {categories.length === 0 && (
            <div className="rounded-2xl bg-card p-5 shadow-card text-sm text-muted-foreground">
              Za ovu ponudu nije tražena nijedna stavka (let/smještaj/transfer/kotizacija).
            </div>
          )}
          {categories.map((cat) => (
            <CategorySection
              key={cat.kind}
              category={cat}
              selectable={!hasExistingRequest && cat.items.length > 0}
              selectedKey={selected[cat.kind]}
              onSelect={(key) => setSelected((s) => ({ ...s, [cat.kind]: key }))}
            />
          ))}
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
          <ReservationSummary
            bookingLoading={bookingLoading}
            bookingRequest={bookingRequest}
            bookable={bookable}
            anySelected={anySelected}
            submitting={submitting}
            onSubmit={handleSubmit}
            priceCheckStatus={priceCheckStatus}
            onRefreshPrice={() => bookingRequest && runPriceCheck(bookingRequest.id)}
            confirming={confirming}
            onConfirm={handleConfirm}
          />
        </div>
      </div>
    </MobileFrame>
  );
}

function CategorySection({
  category,
  selectable = false,
  selectedKey = null,
  onSelect,
}: {
  category: CategoryView;
  selectable?: boolean;
  selectedKey?: string | null;
  onSelect?: (key: string | null) => void;
}) {
  const [open, setOpen] = useState(selectable);
  const Icon = category.icon;
  const count = category.items.length;

  return (
    <div className="rounded-2xl bg-card shadow-card overflow-hidden">
      <button onClick={() => setOpen((o) => !o)} className="flex w-full items-center gap-3 p-4">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-brand-soft text-gradient-brand">
          <Icon className="h-5 w-5" strokeWidth={2.2} />
        </span>
        <span className="flex-1 text-left text-sm font-semibold">
          {category.label}
          {count > 0 && <span className="ml-2 text-xs font-normal text-muted-foreground">{count} {count === 1 ? "opcija" : "opcije"}</span>}
        </span>
        <span className={cn("text-xs text-muted-foreground transition", open && "rotate-180")}>▾</span>
      </button>
      <motion.div initial={false} animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }} className="overflow-hidden">
        <div className="px-4 pb-4 pl-[68px] space-y-2">
          {category.items.length === 0 && (
            <p className="text-sm text-amber-600">{category.emptyMessage}</p>
          )}
          {category.items.map((item) =>
            selectable ? (
              <label
                key={item.key}
                className={cn(
                  "flex items-start gap-3 rounded-xl border p-3 text-sm cursor-pointer transition",
                  selectedKey === item.key ? "border-primary bg-gradient-brand-soft" : "border-border",
                )}
              >
                <input
                  type="radio"
                  name={`option-${category.kind}`}
                  className="mt-1 h-4 w-4 accent-primary"
                  checked={selectedKey === item.key}
                  onChange={() => onSelect?.(item.key)}
                />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">
                    {item.title}
                    {item.recommended && (
                      <span className="ml-2 inline-flex items-center gap-0.5 text-[10px] font-semibold text-gradient-brand uppercase tracking-wider">
                        <Star className="h-3 w-3" /> Preporučeno
                      </span>
                    )}
                  </p>
                  {item.subtitle && <p className="mt-0.5 text-xs text-muted-foreground">{item.subtitle}</p>}
                  {item.flightDetails && <FlightDetails details={item.flightDetails} />}
                </div>
                {item.price !== undefined && <p className="font-display shrink-0 font-bold">{formatEur(item.price)}</p>}
              </label>
            ) : (
              <div key={item.key} className="rounded-xl border border-border p-3 text-sm">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold">
                      {item.title}
                      {item.recommended && (
                        <span className="ml-2 inline-flex items-center gap-0.5 text-[10px] font-semibold text-gradient-brand uppercase tracking-wider">
                          <Star className="h-3 w-3" /> Preporučeno
                        </span>
                      )}
                    </p>
                    {item.subtitle && <p className="mt-0.5 text-xs text-muted-foreground">{item.subtitle}</p>}
                    {item.flightDetails && <FlightDetails details={item.flightDetails} />}
                  </div>
                  {item.price !== undefined && <p className="font-display shrink-0 font-bold">{formatEur(item.price)}</p>}
                </div>
              </div>
            )
          )}
          {selectable && category.items.length > 0 && (
            <label
              className={cn(
                "flex items-center gap-3 rounded-xl border p-3 cursor-pointer text-sm text-muted-foreground transition",
                selectedKey === null ? "border-primary bg-secondary/50" : "border-border",
              )}
            >
              <input
                type="radio"
                name={`option-${category.kind}`}
                className="h-4 w-4 accent-primary"
                checked={selectedKey === null}
                onChange={() => onSelect?.(null)}
              />
              Ne uključuj u rezervaciju
            </label>
          )}
        </div>
      </motion.div>
    </div>
  );
}

function formatFlightDateTime(value?: string): string {
  if (!value) return "Vrijeme nije dostupno";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("hr-HR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatDuration(minutes?: number): string | null {
  if (minutes === undefined) return null;
  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;
  if (hours === 0) return `${remaining} min`;
  return remaining > 0 ? `${hours} h ${remaining} min` : `${hours} h`;
}

function formatStops(stops: number): string {
  if (stops === 0) return "Direktan let";
  if (stops === 1) return "1 presjedanje";
  return `${stops} presjedanja`;
}

function legBagCount(segments: FlightSegmentDetail[], kind: "checkedBags" | "cabinBags"): string {
  const values = segments.map((segment) => segment[kind]).filter((value): value is number => value !== undefined);
  if (values.length === 0) return "—";
  const unique = [...new Set(values)];
  return unique.join(" / ");
}

function FlightDetails({ details }: { details: FlightOptionDetails }) {
  return (
    <div className="mt-3 space-y-2.5 border-t border-border pt-3">
      {details.legs.map((leg) => {
        const numbers = leg.segments.map((segment) => segment.flightNumber).filter(Boolean).join(", ");
        const duration = formatDuration(leg.durationMinutes);
        return (
          <div key={`${leg.label}-${leg.origin}-${leg.destination}`} className="rounded-lg bg-secondary/50 p-2.5">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{leg.label}</p>
              {numbers && <p className="text-[10px] font-semibold text-foreground">{numbers}</p>}
            </div>
            <p className="mt-1 font-display text-sm font-semibold">{leg.origin} → {leg.destination}</p>
            <div className="mt-1.5 grid grid-cols-[1fr_auto_1fr] items-center gap-2 text-[11px]">
              <div>
                <p className="text-muted-foreground">Polazak</p>
                <p className="font-medium">{formatFlightDateTime(leg.departureAt)}</p>
              </div>
              <span className="text-muted-foreground">→</span>
              <div className="text-right">
                <p className="text-muted-foreground">Dolazak</p>
                <p className="font-medium">{formatFlightDateTime(leg.arrivalAt)}</p>
              </div>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-muted-foreground">
              {duration && <span className="inline-flex items-center gap-1"><Clock3 className="h-3 w-3" />{duration}</span>}
              <span>{formatStops(leg.stops)}</span>
              {leg.layoverSummary && <span>{leg.layoverSummary}</span>}
              <span className="inline-flex items-center gap-1"><Luggage className="h-3 w-3" />Predana: {legBagCount(leg.segments, "checkedBags")}</span>
              <span className="inline-flex items-center gap-1"><BriefcaseBusiness className="h-3 w-3" />Ručna: {legBagCount(leg.segments, "cabinBags")}</span>
            </div>
          </div>
        );
      })}
      {details.totalDurationMinutes !== undefined && (
        <p className="flex items-center gap-1 text-[10px] font-medium text-muted-foreground">
          <Clock3 className="h-3 w-3" />Ukupno trajanje putovanja: {formatDuration(details.totalDurationMinutes)}
        </p>
      )}
    </div>
  );
}

function parsePriceCheck(raw: unknown): Record<string, unknown> | null {
  if (raw == null) return null;
  let v: unknown = raw;
  try {
    if (typeof v === "string") v = JSON.parse(v);
    if (typeof v === "string") v = JSON.parse(v);
  } catch {
    return null;
  }
  return v && typeof v === "object" ? (v as Record<string, unknown>) : null;
}

function pickPrice(o: Record<string, unknown>, keys: string[]): number | undefined {
  for (const k of keys) {
    const n = num(o[k]);
    if (n !== undefined) return n;
  }
  return undefined;
}

function ReservationSummary({
  bookingLoading,
  bookingRequest,
  bookable,
  anySelected,
  submitting,
  onSubmit,
  priceCheckStatus,
  onRefreshPrice,
  confirming,
  onConfirm,
}: {
  bookingLoading: boolean;
  bookingRequest: BookingRequestRow | null;
  bookable: CategoryView[];
  anySelected: boolean;
  submitting: boolean;
  onSubmit: () => void;
  priceCheckStatus: "idle" | "checking" | "error";
  onRefreshPrice: () => void;
  confirming: boolean;
  onConfirm: () => void;
}) {
  if (bookingLoading) {
    return <Skeleton className="h-28 w-full rounded-2xl" />;
  }

  if (bookingRequest) {
    const rows: { kind: CategoryKind; raw: Record<string, unknown> | null }[] = ([
      { kind: "flight", raw: bookingRequest.selected_flight },
      { kind: "hotel", raw: bookingRequest.selected_hotel },
      { kind: "transfer", raw: bookingRequest.selected_transfer },
      { kind: "fee", raw: bookingRequest.selected_fee },
    ] as { kind: CategoryKind; raw: Record<string, unknown> | null }[]).filter((r) => r.raw);

    const pc = parsePriceCheck(bookingRequest.price_check);
    const pcItems = (["flight", "hotel"] as CategoryKind[])
      .map((kind) => {
        const sub = pc?.[kind];
        return sub && typeof sub === "object" ? { kind, sub: sub as Record<string, unknown> } : null;
      })
      .filter((x): x is { kind: CategoryKind; sub: Record<string, unknown> } => !!x);
    const isBooked = bookingRequest.status === "booked" && !!bookingRequest.vendor_booking_reference;
    const failureLines = (bookingRequest.failure_reason ?? "").split("\n").filter((l) => l.trim());

    return (
      <div className="space-y-4">
        <div className="rounded-2xl bg-card p-5 shadow-card">
          <h3 className="font-display text-sm font-semibold">Zahtjev za rezervaciju</h3>
          <div className="mt-4 space-y-2">
            {rows.map(({ kind, raw }) => {
              const Icon = categoryMeta[kind].icon;
              return (
                <div key={kind} className="flex items-center gap-2 text-sm">
                  <Icon className="h-4 w-4 text-primary shrink-0" strokeWidth={2.2} />
                  <span>
                    <span className="font-semibold">{categoryMeta[kind].label}:</span> {optionSummary(raw, kind)}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="mt-4 border-t border-border pt-3 text-xs text-muted-foreground space-y-1">
            <p><span className="font-semibold">Status:</span> {bookingStatusLabels[bookingRequest.status] ?? bookingRequest.status}</p>
            <p><span className="font-semibold">Poslano:</span> {new Date(bookingRequest.created_at).toLocaleDateString("hr-HR")}</p>
          </div>
        </div>

        {isBooked ? (
          <div className="rounded-2xl bg-card p-5 shadow-card border border-[color:var(--status-approved)]/40">
            <div className="flex items-center gap-2 text-[color:var(--status-approved)]">
              <Check className="h-5 w-5" />
              <h3 className="font-display text-sm font-semibold">Rezervacija potvrđena</h3>
            </div>
            <p className="mt-2 text-sm"><span className="font-semibold">Referenca:</span> {bookingRequest.vendor_booking_reference}</p>
            {bookingRequest.booked_at && (
              <p className="mt-1 text-xs text-muted-foreground">
                {new Date(bookingRequest.booked_at).toLocaleString("hr-HR")}
              </p>
            )}
          </div>
        ) : (
          <>
            {priceCheckStatus === "checking" ? (
              <div className="rounded-2xl bg-card p-5 shadow-card flex items-center gap-3 text-sm">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                Provjeravam trenutnu cijenu…
              </div>
            ) : (
              <div className="rounded-2xl bg-card p-5 shadow-card">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-sm font-semibold">Provjera cijene</h3>
                  <button
                    onClick={onRefreshPrice}
                    className="text-xs font-semibold text-primary active:opacity-70"
                  >
                    Osvježi cijenu
                  </button>
                </div>
                {pc ? (
                  <div className="mt-3 space-y-2">
                    {pcItems.map(({ kind, sub }) => {
                      const Icon = categoryMeta[kind].icon;
                      const st = String(sub.status ?? "");
                      const orig = pickPrice(sub, ["original_price", "original_price_per_room", "old_price", "expected_price", "quoted_price"]);
                      const next = pickPrice(sub, ["new_price", "new_price_per_room", "current_price", "price"]);
                      const label = st === "price_same" ? "isto" : st === "price_changed" ? "promijenjeno" : "greška";
                      const tone =
                        st === "price_same"
                          ? "bg-[color:var(--status-approved)]/10 text-[color:var(--status-approved)]"
                          : st === "price_changed"
                            ? "bg-[color:var(--status-pending)]/15 text-[color:var(--status-pending)]"
                            : "bg-[color:var(--status-rejected)]/10 text-[color:var(--status-rejected)]";
                      return (
                        <div key={kind} className="flex items-center gap-2 text-sm">
                          <Icon className="h-4 w-4 text-primary shrink-0" strokeWidth={2.2} />
                          <span className="font-semibold">{categoryMeta[kind].label}</span>
                          <span className="ml-auto text-xs text-muted-foreground">
                            {orig !== undefined ? formatEur(orig) : "—"} → {next !== undefined ? formatEur(next) : "—"}
                          </span>
                          <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold", tone)}>{label}</span>
                        </div>
                      );
                    })}
                    {pcItems.length === 0 && (
                      <p className="text-xs text-muted-foreground">Nema stavki za provjeru cijene.</p>
                    )}
                  </div>
                ) : (
                  <p className="mt-2 text-xs text-muted-foreground">
                    {priceCheckStatus === "error" ? "Provjera cijene nije uspjela." : "Cijena još nije provjerena."}
                  </p>
                )}
              </div>
            )}

            {failureLines.length > 0 && (
              <div className="rounded-2xl bg-card p-5 shadow-card border border-[color:var(--status-pending)]/50">
                <h3 className="font-display text-sm font-semibold text-[color:var(--status-pending)]">Rezervacija nije izvršena</h3>
                <ul className="mt-2 space-y-1 text-sm">
                  {failureLines.map((l, i) => (
                    <li key={i}>{l}</li>
                  ))}
                </ul>
              </div>
            )}

            <div>
              <button
                onClick={onConfirm}
                disabled={confirming || priceCheckStatus === "checking"}
                className={cn(
                  "w-full h-12 rounded-xl bg-gradient-brand text-primary-foreground text-sm font-semibold shadow-elevated flex items-center justify-center gap-2 active:scale-[0.99] transition",
                  (confirming || priceCheckStatus === "checking") && "opacity-60 cursor-not-allowed",
                )}
              >
                {confirming ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                Rezerviraj
              </button>
              {pc && pc.ready_to_confirm === false && (
                <p className="mt-2 text-xs text-[color:var(--status-pending)]">
                  Cijena se promijenila ili nije potvrđena — provjerite prije rezervacije.
                </p>
              )}
            </div>
          </>
        )}
      </div>
    );
  }

  if (bookable.length === 0) return null;

  return (
    <div className="rounded-2xl bg-card p-5 shadow-card">
      <h3 className="font-display text-sm font-semibold">Pošaljite zahtjev za rezervaciju</h3>
      <p className="mt-1 text-xs text-muted-foreground">
        Odabir opcija radite gore, u sekciji "Stavke ponude". Kad ste zadovoljni odabirom, pošaljite zahtjev — Penta agent zatim ručno dovršava rezervaciju odabranog.
      </p>
      <button
        onClick={onSubmit}
        disabled={submitting || !anySelected}
        className={cn(
          "mt-4 w-full h-12 rounded-xl bg-gradient-brand text-primary-foreground text-sm font-semibold shadow-elevated flex items-center justify-center gap-2 active:scale-[0.99] transition",
          (submitting || !anySelected) && "opacity-60 cursor-not-allowed",
        )}
      >
        {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        Pošalji zahtjev za rezervaciju
      </button>
    </div>
  );
}
