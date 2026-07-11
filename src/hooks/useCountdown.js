import { useState, useEffect } from 'react';

export function useCountdown(endAt) {
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    if (!endAt) return;
    const tick = () => {
      const diff = new Date(endAt) - Date.now();
      if (diff <= 0) { setTimeLeft({ h: 0, m: 0, s: 0, expired: true }); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft({ h, m, s, expired: false, urgent: diff < 180000 });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endAt]);

  if (!timeLeft) return { display: '--:--:--', urgent: false, expired: false };
  const pad = n => String(n).padStart(2, '0');
  return {
    display: `${pad(timeLeft.h)}:${pad(timeLeft.m)}:${pad(timeLeft.s)}`,
    urgent: timeLeft.urgent,
    expired: timeLeft.expired,
  };
}
