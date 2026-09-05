import { useEffect, useState } from 'react';

/**
 * A ticking `Date`. Re-aligns to the top of each interval so the tray clock
 * flips at the same moment the system clock does, not `intervalMs` after mount.
 */
export function useClock(intervalMs = 30_000): Date {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    let interval: ReturnType<typeof setInterval>;

    const align = intervalMs - (Date.now() % intervalMs);
    timeout = setTimeout(() => {
      setNow(new Date());
      interval = setInterval(() => setNow(new Date()), intervalMs);
    }, align);

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [intervalMs]);

  return now;
}

/** `h:mm AM/PM`, the Win98 tray format. */
export function formatClockTime(date: Date): string {
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const suffix = date.getHours() >= 12 ? 'PM' : 'AM';
  const hours = date.getHours() % 12 || 12;
  return `${hours}:${minutes} ${suffix}`;
}
