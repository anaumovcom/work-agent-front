import { useCallback, useEffect, useRef, useState } from "react";

import { vdiApi, type VdiFrameDto } from "../api/vdiApi";
import { wsClient } from "../api/wsClient";

export interface UseVdiFrameOptions {
  initialIntervalMs?: number;
  staleWarningMs?: number;
  staleBlockMs?: number;
}

export interface VdiFrameState {
  frame: VdiFrameDto | null;
  loading: boolean;
  error: string | null;
  ageMs: number;
  isStaleWarning: boolean;
  isStaleBlock: boolean;
  autoRefresh: boolean;
  setAutoRefresh: (v: boolean) => void;
  refreshIntervalMs: number;
  setRefreshIntervalMs: (ms: number) => void;
  refresh: () => Promise<void>;
}

export function useVdiFrame(opts: UseVdiFrameOptions = {}): VdiFrameState {
  const {
    initialIntervalMs = 1000,
    staleWarningMs = 5000,
    staleBlockMs = 15000,
  } = opts;

  const [frame, setFrame] = useState<VdiFrameDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshIntervalMs, setRefreshIntervalMs] = useState(initialIntervalMs);
  const [now, setNow] = useState<number>(Date.now());

  const inflight = useRef<Promise<void> | null>(null);

  const refresh = useCallback(async () => {
    if (inflight.current) return inflight.current;
    setLoading(true);
    const p = (async () => {
      try {
        const f = await vdiApi.refreshFrame();
        setFrame(f);
        setError(null);
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      } finally {
        setLoading(false);
        inflight.current = null;
      }
    })();
    inflight.current = p;
    return p;
  }, []);

  // initial load
  useEffect(() => {
    void (async () => {
      setLoading(true);
      try {
        const f = await vdiApi.currentFrame();
        setFrame(f);
        setError(null);
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // auto-refresh loop
  useEffect(() => {
    if (!autoRefresh) return;
    const id = window.setInterval(() => {
      void refresh();
    }, refreshIntervalMs);
    return () => window.clearInterval(id);
  }, [autoRefresh, refreshIntervalMs, refresh]);

  // tick now() each second so age recomputes
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  // listen vdi.frame.updated WS events for "after-action refresh"
  useEffect(() => {
    const off = wsClient.on((evt) => {
      if (evt.type === "vdi.frame.updated") {
        const f = evt.payload as unknown as VdiFrameDto;
        if (f && f.frameId) {
          setFrame(f);
          setError(null);
        }
      }
    });
    return () => {
      off();
    };
  }, []);

  const ts = frame ? Date.parse(frame.timestamp) : 0;
  const ageMs = ts ? Math.max(0, now - ts) : 0;

  return {
    frame,
    loading,
    error,
    ageMs,
    isStaleWarning: !!frame && ageMs > staleWarningMs,
    isStaleBlock: !!frame && ageMs > staleBlockMs,
    autoRefresh,
    setAutoRefresh,
    refreshIntervalMs,
    setRefreshIntervalMs,
    refresh,
  };
}
