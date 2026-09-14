import { type ReactNode } from "react";

export function MobileFrame({ children }: { children: ReactNode }) {
  return (
    <div className="h-dvh w-full bg-surface flex justify-center">
      <div className="relative flex h-dvh w-full max-w-[430px] flex-col overflow-hidden bg-background shadow-card md:my-4 md:h-[calc(100dvh-2rem)] md:rounded-[32px]">
        {children}
      </div>
    </div>
  );
}
