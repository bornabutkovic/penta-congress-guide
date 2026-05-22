import { statusLabels, type QuoteStatus } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const styles: Record<QuoteStatus, string> = {
  pending: "bg-[color:var(--status-pending)]/10 text-[color:var(--status-pending)]",
  approved: "bg-[color:var(--status-approved)]/10 text-[color:var(--status-approved)]",
  sent: "bg-[color:var(--status-sent)]/10 text-[color:var(--status-sent)]",
  rejected: "bg-[color:var(--status-rejected)]/10 text-[color:var(--status-rejected)]",
};

export function StatusBadge({ status, className }: { status: QuoteStatus; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap",
        styles[status],
        className,
      )}
    >
      <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current" />
      {statusLabels[status]}
    </span>
  );
}
