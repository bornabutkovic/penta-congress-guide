import { Link, useRouter } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { type ReactNode } from "react";

export function PageHeader({ title, back = true, right }: { title: string; back?: boolean; right?: ReactNode }) {
  const router = useRouter();
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-2 border-b border-border bg-background/90 px-4 py-3 backdrop-blur-md">
      <div className="flex w-10 justify-start">
        {back ? (
          <button
            onClick={() => router.history.back()}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-foreground transition active:scale-95"
            aria-label="Natrag"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        ) : (
          <Link to="/home" className="text-sm font-semibold text-gradient-brand">Penta</Link>
        )}
      </div>
      <h1 className="text-base font-semibold">{title}</h1>
      <div className="flex w-10 justify-end">{right}</div>
    </header>
  );
}
