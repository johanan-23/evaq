"use client";

import { formatClock } from "@/lib/format";
import { useEffect, useState } from "react";

export function LiveClock({ className }: { className?: string }) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  if (!now) {
    return (
      <time className={className} dateTime="" aria-hidden="true">
        --:--:--
      </time>
    );
  }

  return (
    <time className={className} dateTime={now.toISOString()}>
      {formatClock(now)}
    </time>
  );
}
