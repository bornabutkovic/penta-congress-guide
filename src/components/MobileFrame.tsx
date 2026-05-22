import { type ReactNode } from "react";

export function MobileFrame({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh w-full bg-surface flex justify-center">
      <div className="relative flex w-full max-w-[430px] flex-col bg-background shadow-card md:my-4 md:min-h-[calc(100dvh-2rem)] md:rounded-[32px] md:overflow-hidden">
        {children}
      </div>
    </div>
  );
}
