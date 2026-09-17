import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Plane, BedDouble, Car, Ticket, MapPin, Calendar, Check, Loader2, Send, Star } from "lucide-react";
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
  raw: Record<string, unknown>;
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
      const stops = num(outbound?.stops) ?? 0;
      const layover = (outbound?.layover_summary as string) || (stops > 0 ? `${stops} presjedanja` : "Direktan let");
      const bags = num(o.bags_included) ?? 0;
      return {
        key: String(o.offer_id ?? i),
        title: `${o.airline ?? "Let"} · ${outbound?.origin ?? ""} → ${outbound?.destination ?? ""}`,
        subtitle: [layover, inbound ? "povratni uključen" : "samo u jednom smjeru", bags > 0 ? `${bags}× predana prtljaga` : "bez predane prtljage"].join(" · "),
        price: num(o.price_total),
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
};

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
      .select("id,status,created_at,include_flight,include_hotel,include_transfer,include_fee,selected_flight,selected_hotel,selected_transfer,selected_fee")
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

      const { error } = await supabase.from("booking_requests").insert({
        quote_id: quote.id,
        include_flight: !!selFlight,
        include_hotel: !!selHotel,
        include_transfer: !!selTransfer,
        include_fee: !!selFee,
        selected_flight: selFlight as unknown as Json,
        selected_hotel: selHotel as unknown as Json,
        selected_transfer: selTransfer as unknown as Json,
        selected_fee: selFee as unknown as Json,
        requested_by_email: user?.email ?? null,
      });
      if (error) throw new Error(error.message);
      toast.success("Zahtjev za rezervaciju poslan");
      await fetchBookingRequest();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Greška pri slanju zahtjeva");
    } finally {
      setSubmitting(false);
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

function ReservationSummary({
  bookingLoading,
  bookingRequest,
  bookable,
  anySelected,
  submitting,
  onSubmit,
}: {
  bookingLoading: boolean;
  bookingRequest: BookingRequestRow | null;
  bookable: CategoryView[];
  anySelected: boolean;
  submitting: boolean;
  onSubmit: () => void;
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

    return (
      <div className="rounded-2xl bg-card p-5 shadow-card">
        <h3 className="font-display text-sm font-semibold">Zahtjev za rezervaciju</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Zahtjev za rezervaciju poslan — Penta agent će ručno dovršiti rezervaciju odabranih opcija.
        </p>
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
