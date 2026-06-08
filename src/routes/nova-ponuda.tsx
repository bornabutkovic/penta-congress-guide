import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { MobileFrame } from "@/components/MobileFrame";
import { BottomNav } from "@/components/BottomNav";
import { PageHeader } from "@/components/PageHeader";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/nova-ponuda")({
  head: () => ({
    meta: [
      { title: "Penta — Nova ponuda" },
      { name: "description", content: "Kreiraj novu kongresnu ponudu." },
    ],
  }),
  component: NovaPonudaPage,
});

const WEBHOOK_URL = "https://penta.app.n8n.cloud/webhook/form-intake";

type CabinClass = "economy" | "business";

interface FormState {
  client_name: string;
  client_email: string;
  client_phone: string;
  congress: string;
  origin_city: string;
  pax_count: number;
  cabin_class: CabinClass;
  checkin: string;
  checkout: string;
  flight_needed: boolean;
  hotel_needed: boolean;
  transfer_needed: boolean;
  transfer_address: string;
}

const initialState: FormState = {
  client_name: "",
  client_email: "",
  client_phone: "",
  congress: "",
  origin_city: "",
  pax_count: 1,
  cabin_class: "economy",
  checkin: "",
  checkout: "",
  flight_needed: true,
  hotel_needed: true,
  transfer_needed: true,
  transfer_address: "",
};

type Errors = Partial<Record<keyof FormState, string>>;

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mt-6 mb-2">
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

function NovaPonudaPage() {
  const [form, setForm] = useState<FormState>(initialState);
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function validate(): boolean {
    const e: Errors = {};
    if (!form.client_name.trim()) e.client_name = "Obavezno polje";
    if (!form.client_email.trim()) e.client_email = "Obavezno polje";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.client_email)) e.client_email = "Neispravan email";
    if (!form.client_phone.trim()) e.client_phone = "Obavezno polje";
    if (!form.congress.trim()) e.congress = "Obavezno polje";
    if (!form.origin_city.trim()) e.origin_city = "Obavezno polje";
    if (!form.pax_count || form.pax_count < 1 || form.pax_count > 20) e.pax_count = "Broj putnika 1-20";
    if (!form.checkin) e.checkin = "Obavezno polje";
    if (!form.checkout) e.checkout = "Obavezno polje";
    if (form.checkin && form.checkout && form.checkout <= form.checkin) {
      e.checkout = "Datum odlaska mora biti nakon dolaska";
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: "app_form",
          client_name: form.client_name.trim(),
          client_email: form.client_email.trim(),
          client_phone: form.client_phone.trim(),
          congress: form.congress.trim(),
          origin_city: form.origin_city.trim(),
          pax_count: Number(form.pax_count),
          cabin_class: form.cabin_class,
          checkin: form.checkin,
          checkout: form.checkout,
          flight_needed: form.flight_needed,
          hotel_needed: form.hotel_needed,
          transfer_needed: form.transfer_needed,
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setSuccess(form.client_email.trim());
    } catch {
      setSubmitError("Greška pri slanju. Pokušajte ponovo.");
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
      <PageHeader title="Nova ponuda" back={false} />
      <div className="flex-1 overflow-y-auto bg-surface px-5 py-4">
        {success ? (
          <div className="mt-8 rounded-2xl bg-card p-6 shadow-card text-center">
            <div className="mx-auto h-16 w-16 rounded-full bg-gradient-brand-soft flex items-center justify-center">
              <CheckCircle2 className="h-10 w-10 text-gradient-brand" style={{ color: "var(--brand-orange)" }} />
            </div>
            <h2 className="mt-4 text-lg font-bold">Zahtjev je primljen!</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Ponuda će biti pripremljena i poslana na {success}
            </p>
            <button
              onClick={resetForm}
              className="mt-6 w-full h-11 rounded-xl border border-border bg-card text-sm font-semibold active:scale-[0.99]"
            >
              Nova ponuda
            </button>
          </div>
        ) : (
          <form onSubmit={onSubmit} noValidate>
            {submitError && (
              <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {submitError}
              </div>
            )}

            <SectionLabel>Klijent</SectionLabel>
            <div className="space-y-3">
              <div>
                <FieldLabel htmlFor="client_name">Ime i prezime</FieldLabel>
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
                <FieldLabel htmlFor="client_phone">Telefon</FieldLabel>
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

            <SectionLabel>Kongres</SectionLabel>
            <div className="space-y-3">
              <div>
                <FieldLabel htmlFor="congress">Naziv kongresa</FieldLabel>
                <input
                  id="congress"
                  type="text"
                  placeholder="npr. ESC Congress 2026"
                  className={inputClass}
                  value={form.congress}
                  onChange={(e) => update("congress", e.target.value)}
                />
                <ErrorText msg={errors.congress} />
              </div>
              <div>
                <FieldLabel htmlFor="origin_city">Grad polaska</FieldLabel>
                <input
                  id="origin_city"
                  type="text"
                  placeholder="npr. Zagreb"
                  className={inputClass}
                  value={form.origin_city}
                  onChange={(e) => update("origin_city", e.target.value)}
                />
                <ErrorText msg={errors.origin_city} />
              </div>
            </div>

            <SectionLabel>Putovanje</SectionLabel>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <FieldLabel htmlFor="pax_count">Broj putnika</FieldLabel>
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
                <div>
                  <FieldLabel htmlFor="cabin_class">Klasa</FieldLabel>
                  <select
                    id="cabin_class"
                    className={inputClass}
                    value={form.cabin_class}
                    onChange={(e) => update("cabin_class", e.target.value as CabinClass)}
                  >
                    <option value="economy">Economy</option>
                    <option value="business">Business</option>
                  </select>
                </div>
              </div>
              <div>
                <FieldLabel htmlFor="checkin">Datum dolaska (check-in)</FieldLabel>
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
                <FieldLabel htmlFor="checkout">Datum odlaska (check-out)</FieldLabel>
                <input
                  id="checkout"
                  type="date"
                  className={inputClass}
                  value={form.checkout}
                  onChange={(e) => update("checkout", e.target.value)}
                />
                <ErrorText msg={errors.checkout} />
              </div>
            </div>

            <SectionLabel>Usluge</SectionLabel>
            <div className="space-y-2 rounded-2xl bg-card p-4 shadow-card">
              {([
                ["flight_needed", "Let"],
                ["hotel_needed", "Hotel"],
                ["transfer_needed", "Transfer"],
              ] as const).map(([key, label]) => (
                <label key={key} className="flex items-center gap-3 py-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    className="h-5 w-5 rounded accent-[var(--brand-orange)]"
                    checked={form[key]}
                    onChange={(e) => update(key, e.target.checked)}
                  />
                  <span className="text-sm font-medium">{label}</span>
                </label>
              ))}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className={cn(
                "mt-6 mb-2 w-full h-12 rounded-xl bg-gradient-brand text-white text-sm font-semibold shadow-elevated transition active:scale-[0.99] flex items-center justify-center gap-2",
                submitting && "opacity-70 cursor-not-allowed",
              )}
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Šaljem...
                </>
              ) : (
                "Pošalji zahtjev"
              )}
            </button>
          </form>
        )}
      </div>
      <BottomNav />
    </MobileFrame>
  );
}
