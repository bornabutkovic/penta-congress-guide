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
