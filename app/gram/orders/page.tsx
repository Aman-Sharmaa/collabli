"use client";

import { useEffect, useRef, useState } from "react";

type LiveOrdersData = {
  totalOrders: number;
  received: number;
  rejected: number;
  pending: number;
  pickup: number;
  totalDelivered: number;
  today: {
    totalOrders: number;
    received: number;
    rejected: number;
    pending: number;
    pickup: number;
    totalDelivered: number;
  };
  month: {
    totalOrders: number;
    received: number;
    rejected: number;
    pending: number;
    pickup: number;
    totalDelivered: number;
  };
};

type LiveOrdersResponse = {
  success: boolean;
  message: string;
  data: LiveOrdersData;
};

const POLL_INTERVAL_MS = 5000;

function formatNumber(value: number) {
  return value.toLocaleString("en-IN");
}

type Snapshot = {
  totalOrders: number;
  received: number;
  rejected: number;
  pending: number;
  pickup: number;
  totalDelivered: number;
};

const metricConfig: Array<{ key: keyof Snapshot; label: string }> = [
  { key: "totalOrders", label: "Total Orders" },
  { key: "received", label: "Received" },
  { key: "rejected", label: "Rejected" },
  { key: "pending", label: "Ready" },
  { key: "pickup", label: "Pickup" },
  { key: "totalDelivered", label: "Delivered" },
];

function HighlightStat({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <div className="rounded-xl border border-white/60 bg-white p-2.5 shadow-sm sm:rounded-2xl sm:p-4">
      <p className={`text-xl font-black leading-none sm:text-4xl ${color}`}>{formatNumber(value)}</p>
      <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500 sm:mt-2 sm:text-xs">{label}</p>
    </div>
  );
}

function MetricsGrid({ title, data }: { title: string; data: Snapshot | null | undefined }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-2.5 sm:p-3">
      <h3 className="mb-2 text-[11px] font-bold uppercase tracking-wide text-slate-500 sm:text-xs">{title}</h3>
      <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
        {metricConfig.map((metric) => (
          <div key={metric.key} className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 sm:px-2.5 sm:py-2">
            <p className="text-[10px] uppercase tracking-wide text-slate-500">{metric.label}</p>
            <p className="mt-0.5 text-base font-extrabold text-slate-900 sm:text-lg">
              {formatNumber(data?.[metric.key] ?? 0)}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function GramOrdersPage() {
  const [stats, setStats] = useState<LiveOrdersData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [soundBlocked, setSoundBlocked] = useState(false);
  const previousTodayOrdersRef = useRef<number | null>(null);
  const honkAudioRef = useRef<HTMLAudioElement | null>(null);
  const soundEnabledRef = useRef(true);

  useEffect(() => {
    soundEnabledRef.current = soundEnabled;
  }, [soundEnabled]);

  function getHonkAudio() {
    if (honkAudioRef.current) return honkAudioRef.current;
    const audio = new Audio("/honk.mp3");
    audio.preload = "auto";
    honkAudioRef.current = audio;
    return audio;
  }

  async function playHonk() {
    try {
      const audio = getHonkAudio();
      audio.currentTime = 0;
      audio.loop = false;
      audio.volume = 1;
      await audio.play();

      setSoundBlocked(false);
    } catch {
      setSoundBlocked(true);
    }
  }

  useEffect(() => {
    let isMounted = true;

    async function loadStats() {
      try {
        const response = await fetch("/api/gram/orders/live", {
          method: "GET",
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        const payload = (await response.json()) as LiveOrdersResponse;
        if (!payload.success) {
          throw new Error(payload.message || "Unable to load live stats");
        }

        const nextTodayOrders = payload.data.today.totalOrders;
        const previousTodayOrders = previousTodayOrdersRef.current;
        if (
          previousTodayOrders !== null &&
          nextTodayOrders > previousTodayOrders &&
          soundEnabledRef.current
        ) {
          await playHonk();
        }
        previousTodayOrdersRef.current = nextTodayOrders;

        if (isMounted) {
          setStats(payload.data);
          setError(null);
          setLastUpdated(new Date());
        }
      } catch (err) {
        if (isMounted) {
          const message = err instanceof Error ? err.message : "Unknown error";
          setError(message);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadStats();
    const intervalId = window.setInterval(loadStats, POLL_INTERVAL_MS);

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
      if (honkAudioRef.current) {
        honkAudioRef.current.pause();
        honkAudioRef.current.currentTime = 0;
      }
    };
  }, []);

  return (
    <main className="h-screen w-screen overflow-hidden bg-gradient-to-br from-[#f4f7ff] via-[#fffaf3] to-[#f6fff7] text-slate-900">
      <div className="h-full w-full px-2 py-2 sm:px-4 sm:py-4">
        <div className="mx-auto h-full w-full max-w-7xl">
          <div className="flex h-full min-h-0 flex-col rounded-3xl border border-white bg-white/80 p-3 shadow-xl backdrop-blur sm:p-4">
            <div className="text-center">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">Live Dashboard</p>
              <h1 className="mt-1 text-xl font-black sm:text-3xl">Gram Orders</h1>
              <p className="mt-1 text-[11px] text-slate-500 sm:text-xs">
                Real-time refresh every {POLL_INTERVAL_MS / 1000} seconds
              </p>
              <div className="mt-2 flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setSoundEnabled((prev) => !prev)}
                  className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-700 hover:bg-slate-50"
                >
                  {soundEnabled ? "Honk On" : "Honk Off"}
                </button>
                {soundBlocked ? (
                  <button
                    type="button"
                    onClick={playHonk}
                    className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-amber-700"
                  >
                    Tap To Enable Sound
                  </button>
                ) : null}
              </div>
            </div>

            <div className="mt-3 grid grid-cols-4 gap-2 sm:mt-4 sm:gap-3">
              <HighlightStat value={stats?.pending ?? 0} label="Ready" color="text-orange-600" />
              <HighlightStat value={stats?.received ?? 0} label="Received" color="text-blue-600" />
              <HighlightStat value={stats?.totalDelivered ?? 0} label="Total Delivered" color="text-emerald-600" />
              <div className="rounded-xl border border-white/60 bg-white p-2.5 shadow-sm sm:rounded-2xl sm:p-4">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 sm:text-xs">New Orders Today</p>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 sm:text-xs">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    Live
                  </span>
                </div>
                <p className="mt-1 text-xl font-black text-slate-900 sm:text-4xl">
                  {loading && !stats ? "--" : formatNumber(stats?.today.totalOrders ?? 0)}
                </p>
                <p className="mt-1 text-[10px] text-slate-500 sm:text-[11px]">
                  {lastUpdated
                    ? `Updated: ${lastUpdated.toLocaleTimeString("en-IN")}`
                    : "Waiting for first update..."}
                </p>
              </div>
            </div>

            <div className="mt-2 min-h-0 flex-1">
              <div className="grid h-full min-h-0 grid-cols-3 gap-2 sm:gap-3">
                <MetricsGrid title="Overall" data={stats} />
                <MetricsGrid title="This Month" data={stats?.month} />
                <MetricsGrid title="Today" data={stats?.today} />
              </div>
            </div>

            {error ? (
              <div className="mt-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-center text-xs text-red-700">
                Failed to load stats: {error}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </main>
  );
}
