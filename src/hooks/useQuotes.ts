import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { QuoteStatus } from "@/lib/mock-data";

export const statusMap: Record<QuoteDbStatus, QuoteStatus> = {
  draft: "pending",
  pending_approval: "pending",
  approved: "approved",
  sent: "sent",
  rejected: "rejected",
  error: "rejected",
};

export const formatEur = (n: number) =>
  new Intl.NumberFormat("hr-HR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);

export type QuoteDbStatus =
  | "draft"
  | "pending_approval"
  | "approved"
  | "sent"
  | "rejected"
  | "error";

export interface Quote {
  id: string;
  client_name: string;
  client_email: string;
  status: QuoteDbStatus;
  total_price: number | null;
  html_content: string | null;
  request_data: string;
  flight_data: string | null;
  hotel_data: string | null;
  transfer_data: string | null;
  fee_data: string | null;
  created_at: string;
}

export function useQuotes() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchQuotes = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from("quotes")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      setError(error.message);
      setQuotes([]);
    } else {
      setQuotes((data ?? []) as unknown as Quote[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchQuotes();

    const channel = supabase
      .channel("quotes-changes")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "quotes" },
        () => fetchQuotes(),
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "quotes" },
        () => fetchQuotes(),
      )
      .subscribe();

    const onVis = () => {
      if (document.visibilityState === "visible") fetchQuotes();
    };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      supabase.removeChannel(channel);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [fetchQuotes]);

  return { quotes, loading, error, refetch: fetchQuotes };
}

export function parseRequestData(raw: string | null | undefined): Record<string, unknown> {
  if (!raw) return {};
  try {
    return typeof raw === "string" ? JSON.parse(raw) : (raw as Record<string, unknown>);
  } catch {
    return {};
  }
}
