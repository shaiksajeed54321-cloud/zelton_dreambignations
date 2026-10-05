import { useEffect, useState } from "react";

export interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  finished: boolean;
}

function getTimeLeft(target: number): TimeLeft {
  // An invalid date gives NaN; treat it like "nothing left" so we never show NaN.
  const diff = Number.isFinite(target) ? Math.max(target - Date.now(), 0) : 0;
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    finished: diff === 0,
  };
}

/** Counts down to `isoDate` (must include a timezone offset, e.g. 2026-11-28T09:00:00+05:30). */
export function useCountdown(isoDate: string): TimeLeft {
  const target = new Date(isoDate).getTime();
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() => getTimeLeft(target));

  useEffect(() => {
    setTimeLeft(getTimeLeft(target));
    const id = setInterval(() => {
      const next = getTimeLeft(target);
      setTimeLeft(next);
      if (next.finished) clearInterval(id);
    }, 1000);
    return () => clearInterval(id);
  }, [target]);

  return timeLeft;
}
