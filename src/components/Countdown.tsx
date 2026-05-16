"use client";

import { useEffect, useState } from "react";

const WEDDING_DATE = new Date("2026-09-26T16:00:00").getTime();

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function getTimeLeft(): TimeLeft {
  const now = Date.now();
  const diff = Math.max(0, WEDDING_DATE - now);

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

function TimeBlock({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-2xl sm:text-3xl md:text-5xl font-heading text-burgundy font-light tabular-nums">
        {String(value).padStart(2, "0")}
      </span>
      <span className="text-[10px] sm:text-xs text-burgundy/40 font-body uppercase tracking-widest mt-0.5">
        {label}
      </span>
    </div>
  );
}

export default function Countdown() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);

  useEffect(() => {
    setTimeLeft(getTimeLeft());
    const timer = setInterval(() => setTimeLeft(getTimeLeft()), 1000);
    return () => clearInterval(timer);
  }, []);

  const t = timeLeft ?? { days: 0, hours: 0, minutes: 0, seconds: 0 };

  return (
    <div>
      <p className="font-body italic text-burgundy/40 text-xs mb-4 tracking-wide">
        Încă puțin până la ziua cea mare:
      </p>
      <div className="flex justify-center gap-5 sm:gap-8 md:gap-12 px-2">
        <TimeBlock value={t.days} label="Zile" />
        <TimeBlock value={t.hours} label="Ore" />
        <TimeBlock value={t.minutes} label="Minute" />
        <TimeBlock value={t.seconds} label="Secunde" />
      </div>
    </div>
  );
}
