"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";

type AutoRefreshProps = {
  intervalMs?: number;
  enabled?: boolean;
  showStatus?: boolean;
  showButton?: boolean;
  className?: string;
};

export function AutoRefresh({
  intervalMs = 30000,
  enabled = true,
  showStatus = false,
  showButton = true,
  className = "",
}: AutoRefreshProps) {
  const router = useRouter();
  const [lastRefreshLabel, setLastRefreshLabel] = useState<string | null>(null);
  const refreshTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearRefreshLabel = useCallback(() => {
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }

    refreshTimeoutRef.current = setTimeout(() => {
      setLastRefreshLabel(null);
    }, 3500);
  }, []);

  const refresh = useCallback(() => {
    if (!enabled || document.hidden) {
      return;
    }

    router.refresh();
    setLastRefreshLabel("Atualizado agora");
    clearRefreshLabel();
  }, [clearRefreshLabel, enabled, router]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const interval = window.setInterval(() => {
      if (!document.hidden) {
        refresh();
      }
    }, intervalMs);

    return () => {
      window.clearInterval(interval);
    };
  }, [enabled, intervalMs, refresh]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const refreshWhenVisible = () => {
      if (!document.hidden) {
        refresh();
      }
    };

    window.addEventListener("focus", refreshWhenVisible);
    document.addEventListener("visibilitychange", refreshWhenVisible);

    return () => {
      window.removeEventListener("focus", refreshWhenVisible);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
    };
  }, [enabled, refresh]);

  useEffect(() => {
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, []);

  if (!showButton && !showStatus) {
    return null;
  }

  return (
    <div
      className={`flex flex-wrap items-center justify-end gap-3 ${className}`}
    >
      {showStatus && lastRefreshLabel ? (
        <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-xs font-bold text-emerald-200">
          {lastRefreshLabel}
        </span>
      ) : null}

      {showButton ? (
        <button
          type="button"
          onClick={refresh}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 text-sm font-extrabold text-white transition hover:border-white/20 hover:bg-white hover:text-slate-950 active:scale-[0.98]"
        >
          <RefreshCw className="h-4 w-4" />
          Atualizar
        </button>
      ) : null}
    </div>
  );
}
