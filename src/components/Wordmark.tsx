import { cn } from "@/lib/utils";

export function Wordmark({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "font-display flex items-baseline font-bold tracking-tight text-primary",
        className,
      )}
      aria-label="PICCARD na treću"
    >
      <span>PICCARD</span>
      <sup className="ml-0.5 self-start text-[0.5em] leading-none">3</sup>
    </div>
  );
}