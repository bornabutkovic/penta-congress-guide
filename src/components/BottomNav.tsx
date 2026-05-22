import { Link, useLocation } from "@tanstack/react-router";
import { Home, Mic, MessageSquare, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { to: "/home", label: "Početna", icon: Home },
  { to: "/voice", label: "Glas", icon: Mic },
  { to: "/chat", label: "Chat", icon: MessageSquare },
  { to: "/ponude", label: "Ponude", icon: FileText },
] as const;

export function BottomNav() {
  const { pathname } = useLocation();

  return (
    <nav className="sticky bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur-md pb-[env(safe-area-inset-bottom)]">
      <ul className="grid grid-cols-4">
        {items.map(({ to, label, icon: Icon }) => {
          const active = pathname === to || (to !== "/home" && pathname.startsWith(to));
          return (
            <li key={to}>
              <Link
                to={to}
                className="flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium"
              >
                <span
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-2xl transition-all",
                    active ? "bg-gradient-brand text-white shadow-elevated" : "text-muted-foreground",
                  )}
                >
                  <Icon className="h-[18px] w-[18px]" strokeWidth={2.2} />
                </span>
                <span className={cn(active ? "text-gradient-brand font-semibold" : "text-muted-foreground")}>
                  {label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
