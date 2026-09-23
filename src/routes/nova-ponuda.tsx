import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { MobileFrame } from "@/components/MobileFrame";
import { BottomNav } from "@/components/BottomNav";
import { PageHeader } from "@/components/PageHeader";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/nova-ponuda")({
  head: () => ({
    meta: [
      { title: "New proposal | PICCARD³" },
      { name: "description", content: "Create a new congress travel proposal." },
      { property: "og:title", content: "New proposal | PICCARD³" },
      { property: "og:description", content: "Create a new proposal for congress travel." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://penta-travel.lovable.app/nova-ponuda" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: "https://penta-travel.lovable.app/nova-ponuda" }],
  }),
  component: NovaPonudaPage,
});

const WEBHOOK_URL = "https://penta.app.n8n.cloud/webhook/form-intake";

type CabinClass = "economy" | "premium_economy" | "business" | "first";
type TimeWindow = "all_day" | "morning" | "afternoon";

interface FormState {
  client_name: string;
  client_email: string;
  client_phone: string;
  congress_needed: boolean;
  congress: string;
  destination_city: string;
  origin_city: string;
  pax_count: number;
  rooms: string;
  cabin_class: CabinClass;
  departure_time_window: TimeWindow;
  return_time_window: TimeWindow;
  checked_baggage: boolean;
  checkin: string;
  checkout: string;
  flight_needed: boolean;
  hotel_needed: boolean;
  transfer_needed: boolean;
  transfer_address: string;
  destination_transfer_needed: boolean;
  fee_needed: boolean;
  hotel_id_override: string;
}

const initialState: FormState = {
  client_name: "",
  client_email: "",
  client_phone: "",
  congress_needed: true,
  congress: "",
  destination_city: "",
  origin_city: "",
  pax_count: 1,
  rooms: "",
  cabin_class: "economy",
  departure_time_window: "all_day",
  return_time_window: "all_day",
  checked_baggage: true,
  checkin: "",
  checkout: "",
  flight_needed: true,
  hotel_needed: true,
  transfer_needed: true,
  transfer_address: "",
  destination_transfer_needed: true,
  fee_needed: true,
  hotel_id_override: "",
};

type Errors = Partial<Record<keyof FormState, string>>;

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-display text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mt-6 mb-2">
      {children}
    </h2>
  );
}

function FieldLabel({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className="block text-sm font-medium mb-1.5">
      {children}
    </label>
  );
}

const inputClass =
  "w-full h-11 rounded-xl border border-border bg-card px-3 text-sm shadow-card focus:outline-none focus:ring-2 focus:ring-ring";

function ErrorText({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="mt-1 text-xs text-destructive">{msg}</p>;
}

const AUTOCOMPLETE_URL = "https://penta.app.n8n.cloud/webhook/location-autocomplete";

interface LocationResult {
  iata?: string;
  subType?: string;
  city?: string;
  name?: string;
  countryCode?: string;
  isPrimary?: boolean;
  submitText: string;
  label: string;
}

function CityAutocompleteInput({
  id,
  label,
  value,
  onChange,
  placeholder,
  error,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
}) {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<LocationResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const blurTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestIdRef = useRef(0);

  useEffect(() => {
    setQuery((prev) => (prev === value ? prev : value));
  }, [value]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (blurTimerRef.current) clearTimeout(blurTimerRef.current);
    };
  }, []);

  const handleChange = (text: string) => {
    setQuery(text);
    onChange(text);

    if (timerRef.current) clearTimeout(timerRef.current);
    const trimmed = text.trim();
    if (trimmed.length < 2) {
      setSuggestions([]);
      setIsOpen(false);
      setLoading(false);
      return;
    }

    timerRef.current = setTimeout(async () => {
      const requestId = ++requestIdRef.current;
      setLoading(true);
      try {
        const res = await fetch(`${AUTOCOMPLETE_URL}?q=${encodeURIComponent(trimmed)}`, {
          headers: { "x-penta-key": "pnt_fi_a3f81c92d6b44e07_zg26" },
        });
        const data = (await res.json()) as { results?: LocationResult[] };
        if (requestId !== requestIdRef.current) return;
        const results = Array.isArray(data?.results) ? data.results : [];
        setSuggestions(results);
        setIsOpen(results.length > 0);
      } catch {
        if (requestId === requestIdRef.current) {
          setSuggestions([]);
          setIsOpen(false);
        }
      } finally {
        if (requestId === requestIdRef.current) setLoading(false);
      }
    }, 300);
  };

  const select = (result: LocationResult) => {
    onChange(result.submitText);
    setQuery(result.submitText);
    setIsOpen(false);
    setSuggestions([]);
  };

  return (
    <div>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <div className="relative">
        <input
          id={id}
          type="text"
          autoComplete="off"
          placeholder={placeholder}
          className={inputClass}
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => {
            if (suggestions.length > 0) setIsOpen(true);
          }}
          onBlur={() => {
            if (blurTimerRef.current) clearTimeout(blurTimerRef.current);
            blurTimerRef.current = setTimeout(() => setIsOpen(false), 150);
          }}
        />
        {loading && (
          <Loader2 className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
        )}
        {isOpen && suggestions.length > 0 && (
          <ul className="absolute left-0 right-0 top-[calc(100%+4px)] z-30 max-h-56 overflow-y-auto rounded-xl border border-border bg-card shadow-card">
            {suggestions.map((result, i) => (
              <li key={`${result.submitText}-${result.iata ?? i}`}>
                <button
                  type="button"
                  className="block w-full px-3 py-2.5 text-left text-sm hover:bg-accent"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    select(result);
                  }}
                >
                  {result.label}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <ErrorText msg={error} />
    </div>
  );
}


function NovaPonudaPage() {
  const [form, setForm] = useState<FormState>(initialState);
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [certMode, setCertMode] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setCertMode(params.get("cert") === "1");
  }, []);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => {
      const next = { ...f, [key]: value };
      if (key === "flight_needed" && value === false) {
        next.transfer_needed = false;
      }
      if (key === "congress_needed" && value === false) {
        next.fee_needed = false;
      }
      return next;
    });
  }

  function validate(): boolean {
    const e: Errors = {};
    if (!form.client_name.trim()) e.client_name = "Required field";
    if (!form.client_email.trim()) e.client_email = "Required field";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.client_email)) e.client_email = "Invalid email";
    if (!form.client_phone.trim()) e.client_phone = "Required field";
    if (form.congress_needed) {
      if (!form.congress.trim()) e.congress = "Required field";
    } else if (!form.destination_city.trim()) {
      e.destination_city = "Required field";
    }
    if (form.flight_needed && !form.origin_city.trim()) e.origin_city = "Required field";
    if (!form.pax_count || form.pax_count < 1 || form.pax_count > 20) e.pax_count = "Number of guests 1-20";
    if (form.hotel_needed && form.rooms.trim()) {
      const rooms = Number(form.rooms);
      if (!Number.isInteger(rooms) || rooms < 1 || rooms > Number(form.pax_count)) {
        e.rooms = "Rooms cannot exceed the number of guests";
      }
    }
    if (!form.checkin) e.checkin = "Required field";
    if (!form.checkout) e.checkout = "Required field";
    if (form.checkin && form.checkout && form.checkout <= form.checkin) {
      e.checkout = "Check-out must be after check-in";
    }
    if (form.transfer_needed && !form.transfer_address.trim()) {
      e.transfer_address = "Required field";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function onSubmit(ev: FormEvent) {
    ev.preventDefault();
    setSubmitError(null);
    if (!validate()) return;
    setSubmitting(true);
    try {
      const res = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-penta-key": "pnt_fi_a3f81c92d6b44e07_zg26",
        },
        body: JSON.stringify({
          source: "app_form",
          client_name: form.client_name.trim(),
          client_email: form.client_email.trim(),
          client_phone: form.client_phone.trim(),
          congress: form.congress_needed ? form.congress.trim() : "",
          destination_city: form.congress_needed ? "" : form.destination_city.trim(),
          origin_city: form.flight_needed ? form.origin_city.trim() : "",
          pax_count: Number(form.pax_count),
          rooms: form.hotel_needed && form.rooms.trim() ? Number(form.rooms) : null,
          cabin_class: form.flight_needed ? form.cabin_class : "economy",
          departure_time_window: form.flight_needed ? form.departure_time_window : "all_day",
          return_time_window: form.flight_needed ? form.return_time_window : "all_day",
          checked_baggage: form.flight_needed ? form.checked_baggage : true,
          checkin: form.checkin,
          checkout: form.checkout,
          flight_needed: form.flight_needed,
          hotel_needed: form.hotel_needed,
          transfer_needed: form.transfer_needed,
          transfer_address: form.transfer_needed ? form.transfer_address.trim() : null,
          destination_transfer_needed: form.hotel_needed ? form.destination_transfer_needed : false,
          fee_needed: form.congress_needed ? form.fee_needed : false,
          hotel_id_override: certMode ? form.hotel_id_override.trim() : "",
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setSuccess(form.client_email.trim());
    } catch {
      setSubmitError("Sending failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function resetForm() {
    setForm(initialState);
    setErrors({});
    setSubmitError(null);
    setSuccess(null);
  }

  return (
    <MobileFrame>
      <PageHeader title="New proposal" back={false} />
      <div className="flex-1 min-h-0 overflow-y-auto bg-surface px-5 py-4">
        {success ? (
          <div className="mt-8 rounded-2xl bg-card p-6 shadow-card text-center">
            <div className="mx-auto h-16 w-16 rounded-full bg-gradient-brand-soft flex items-center justify-center">
              <CheckCircle2 className="h-10 w-10 text-primary" />
            </div>
            <h2 className="font-display mt-4 text-lg font-bold">Request received!</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              The proposal will be prepared and sent to {success}
            </p>
            <button
              onClick={resetForm}
              className="mt-6 w-full h-11 rounded-xl border border-border bg-card text-sm font-semibold active:scale-[0.99]"
            >
              New proposal
            </button>
          </div>
        ) : (
          <form onSubmit={onSubmit} noValidate>
            {submitError && (
              <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {submitError}
              </div>
            )}

            <SectionLabel>Client</SectionLabel>
            <div className="space-y-3">
              <div>
                <FieldLabel htmlFor="client_name">Full name</FieldLabel>
                <input
                  id="client_name"
                  type="text"
                  className={inputClass}
                  value={form.client_name}
                  onChange={(e) => update("client_name", e.target.value)}
                />
                <ErrorText msg={errors.client_name} />
              </div>
              <div>
                <FieldLabel htmlFor="client_email">Email</FieldLabel>
                <input
                  id="client_email"
                  type="email"
                  className={inputClass}
                  value={form.client_email}
                  onChange={(e) => update("client_email", e.target.value)}
                />
                <ErrorText msg={errors.client_email} />
              </div>
              <div>
                <FieldLabel htmlFor="client_phone">Phone</FieldLabel>
                <input
                  id="client_phone"
                  type="tel"
                  className={inputClass}
                  value={form.client_phone}
                  onChange={(e) => update("client_phone", e.target.value)}
                />
                <ErrorText msg={errors.client_phone} />
              </div>
            </div>

            <SectionLabel>Services</SectionLabel>
            <div className="space-y-2 rounded-2xl bg-card p-4 shadow-card">
              {([
                ["congress_needed", "Congress"],
                ["flight_needed", "Flight"],
                ["hotel_needed", "Hotel"],
              ] as const).map(([key, label]) => (
                <label key={key} className="flex items-center gap-3 py-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    className="h-5 w-5 rounded accent-primary"
                    checked={form[key]}
                    onChange={(e) => update(key, e.target.checked)}
                  />
                  <span className="text-sm font-medium">{label}</span>
                </label>
              ))}
              <AnimatePresence initial={false}>
                {form.congress_needed && (
                  <motion.div
                    key="fee_needed"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className="overflow-hidden"
                  >
                    <label className="flex items-center gap-3 py-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        className="h-5 w-5 rounded accent-primary"
                        checked={form.fee_needed}
                        onChange={(e) => update("fee_needed", e.target.checked)}
                      />
                      <span className="text-sm font-medium">Registration fee</span>
                    </label>
                  </motion.div>
                )}
                {form.flight_needed && (
                  <motion.div
                    key="transfer_home"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className="overflow-hidden"
                  >
                    <label className="flex items-center gap-3 py-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        className="h-5 w-5 rounded accent-primary"
                        checked={form.transfer_needed}
                        onChange={(e) => update("transfer_needed", e.target.checked)}
                      />
                      <span className="text-sm font-medium">Transfer: home address → airport</span>
                    </label>
                  </motion.div>
                )}
                {form.hotel_needed && (
                  <motion.div
                    key="destination_transfer"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className="overflow-hidden"
                  >
                    <label className="flex items-center gap-3 py-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        className="h-5 w-5 rounded accent-primary"
                        checked={form.destination_transfer_needed}
                        onChange={(e) => update("destination_transfer_needed", e.target.checked)}
                      />
                      <span className="text-sm font-medium">Transfer: airport → hotel (destination)</span>
                    </label>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <AnimatePresence initial={false}>
              {form.transfer_needed && form.flight_needed && (
                <motion.div
                  key="transfer_address"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="overflow-hidden"
                >
                  <div className="pt-3">
                    <FieldLabel htmlFor="transfer_address">Departure address</FieldLabel>
                    <input
                      id="transfer_address"
                      type="text"
                      placeholder="e.g. Ilica 42, Zagreb"
                      className={inputClass}
                      value={form.transfer_address}
                      onChange={(e) => update("transfer_address", e.target.value)}
                    />
                    <ErrorText msg={errors.transfer_address} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <SectionLabel>{form.congress_needed ? "Congress" : "Destination"}</SectionLabel>
            <div className="space-y-3">
              {form.congress_needed ? (
                <div>
                  <FieldLabel htmlFor="congress">Congress name</FieldLabel>
                  <input
                    id="congress"
                    type="text"
                    placeholder="e.g. ESC Congress 2026"
                    className={inputClass}
                    value={form.congress}
                    onChange={(e) => update("congress", e.target.value)}
                  />
                  <ErrorText msg={errors.congress} />
                </div>
              ) : (
                <div>
                  <FieldLabel htmlFor="destination_city">City</FieldLabel>
                  <input
                    id="destination_city"
                    type="text"
                    placeholder="e.g. Vienna"
                    className={inputClass}
                    value={form.destination_city}
                    onChange={(e) => update("destination_city", e.target.value)}
                  />
                  <ErrorText msg={errors.destination_city} />
                </div>
              )}
              <AnimatePresence initial={false}>
                {form.flight_needed && (
                  <motion.div
                    key="origin_city"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className="overflow-hidden"
                  >
                    <div>
                      <FieldLabel htmlFor="origin_city">Departure city</FieldLabel>
                      <input
                        id="origin_city"
                        type="text"
                        placeholder="e.g. Zagreb"
                        className={inputClass}
                        value={form.origin_city}
                        onChange={(e) => update("origin_city", e.target.value)}
                      />
                      <ErrorText msg={errors.origin_city} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <SectionLabel>Trip</SectionLabel>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <FieldLabel htmlFor="pax_count">Number of guests</FieldLabel>
                  <input
                    id="pax_count"
                    type="number"
                    min={1}
                    max={20}
                    className={inputClass}
                    value={form.pax_count}
                    onChange={(e) => update("pax_count", Number(e.target.value))}
                  />
                  <ErrorText msg={errors.pax_count} />
                </div>
                {form.hotel_needed && (
                  <div>
                    <FieldLabel htmlFor="rooms">Number of rooms</FieldLabel>
                    <input
                      id="rooms"
                      type="number"
                      min={1}
                      max={form.pax_count || 1}
                      placeholder="Default: one room per guest"
                      className={inputClass}
                      value={form.rooms}
                      onChange={(e) => update("rooms", e.target.value)}
                    />
                    <ErrorText msg={errors.rooms} />
                  </div>
                )}
              </div>
              <AnimatePresence initial={false}>
                {form.flight_needed && (
                  <motion.div
                    key="flight_preferences"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-3">
                      <div>
                        <FieldLabel htmlFor="cabin_class">Cabin class</FieldLabel>
                        <select
                          id="cabin_class"
                          className={inputClass}
                          value={form.cabin_class}
                          onChange={(e) => update("cabin_class", e.target.value as CabinClass)}
                        >
                          <option value="economy">Economy</option>
                          <option value="premium_economy">Premium Economy</option>
                          <option value="business">Business</option>
                          <option value="first">First</option>
                        </select>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <FieldLabel htmlFor="departure_time_window">Departure time</FieldLabel>
                          <select
                            id="departure_time_window"
                            className={inputClass}
                            value={form.departure_time_window}
                            onChange={(e) => update("departure_time_window", e.target.value as TimeWindow)}
                          >
                            <option value="all_day">All day</option>
                            <option value="morning">Morning</option>
                            <option value="afternoon">Afternoon</option>
                          </select>
                        </div>
                        <div>
                          <FieldLabel htmlFor="return_time_window">Return time</FieldLabel>
                          <select
                            id="return_time_window"
                            className={inputClass}
                            value={form.return_time_window}
                            onChange={(e) => update("return_time_window", e.target.value as TimeWindow)}
                          >
                            <option value="all_day">All day</option>
                            <option value="morning">Morning</option>
                            <option value="afternoon">Afternoon</option>
                          </select>
                        </div>
                      </div>
                      <label className="flex items-center gap-3 rounded-xl bg-card py-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          className="h-5 w-5 rounded accent-primary"
                          checked={form.checked_baggage}
                          onChange={(e) => update("checked_baggage", e.target.checked)}
                        />
                        <span className="text-sm font-medium">Checked baggage required</span>
                      </label>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <div>
                <FieldLabel htmlFor="checkin">Check-in date</FieldLabel>
                <input
                  id="checkin"
                  type="date"
                  className={inputClass}
                  value={form.checkin}
                  onChange={(e) => update("checkin", e.target.value)}
                />
                <ErrorText msg={errors.checkin} />
              </div>
              <div>
                <FieldLabel htmlFor="checkout">Check-out date</FieldLabel>
                <input
                  id="checkout"
                  type="date"
                  className={inputClass}
                  value={form.checkout}
                  onChange={(e) => update("checkout", e.target.value)}
                />
                <ErrorText msg={errors.checkout} />
              </div>
              {certMode && (
                <div>
                  <FieldLabel htmlFor="hotel_id_override">Hotel ID override (certification test only)</FieldLabel>
                  <input
                    id="hotel_id_override"
                    type="text"
                    placeholder="test_hotel_do_not_book"
                    className={inputClass}
                    value={form.hotel_id_override}
                    onChange={(e) => update("hotel_id_override", e.target.value)}
                  />
                </div>
              )}
            </div>

            {certMode && (
              <div className="mt-4 rounded-xl border border-status-pending/30 bg-status-pending/10 px-4 py-3 text-sm font-medium text-status-pending">
                Certification mode – test property only
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className={cn(
                "mt-6 mb-2 w-full h-12 rounded-xl bg-gradient-brand text-primary-foreground text-sm font-semibold shadow-elevated transition active:scale-[0.99] flex items-center justify-center gap-2",
                submitting && "opacity-70 cursor-not-allowed",
              )}
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send request"
              )}
            </button>
          </form>
        )}
      </div>
      <BottomNav />
    </MobileFrame>
  );
}
