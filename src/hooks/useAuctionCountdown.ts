import { useState, useEffect, useRef } from "react";

export interface CountdownValue {
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
  isUrgent: boolean;
  display: string;
}

export function useAuctionCountdown(endTime: string | null): CountdownValue {
  const [now, setNow] = useState(Date.now());
  const ref = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    ref.current = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(ref.current);
  }, []);

  if (!endTime) return { hours: 0, minutes: 0, seconds: 0, total: 0, isUrgent: false, display: "00:00:00" };

  const diff = Math.max(0, new Date(endTime).getTime() - now);
  const totalSeconds = Math.floor(diff / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const isUrgent = totalSeconds < 300 && totalSeconds > 0; // under 5 min

  const pad = (n: number) => String(n).padStart(2, "0");
  const display = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;

  return { hours, minutes, seconds, total: totalSeconds, isUrgent, display };
}
