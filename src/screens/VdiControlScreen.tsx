import { useEffect, useState } from "react";
import { OverlayToggles, type Overlays } from "../components/vdi/OverlayToggles";
import { LiveVdiScreen } from "../components/vdi/LiveVdiScreen";
import { useVdiFrame } from "../app/useVdiFrame";
import { vdiApi, type FrameStatusDto } from "../api/vdiApi";
import type { Mode } from "../types";

interface Props {
  mode: Mode;
  overlays: Overlays;
  onOverlaysChange: (next: Overlays) => void;
  vdiFocused: boolean;
  onVdiFocus: () => void;
  onVdiBlur: () => void;
  emergencyStop: boolean;
  esp32Connected: boolean;
}

export function VdiControlScreen({
  mode: _mode,
  overlays,
  onOverlaysChange,
  vdiFocused,
  onVdiFocus,
  onVdiBlur,
  emergencyStop,
  esp32Connected,
}: Props) {
  const frame = useVdiFrame();
  const [frameStatus, setFrameStatus] = useState<FrameStatusDto | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const s = await vdiApi.frameStatus();
        if (!cancelled) setFrameStatus(s);
      } catch {
        /* ignore */
      }
    };
    load();
    const id = window.setInterval(load, 3000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, []);

  const blockReasons: string[] = [];
  if (emergencyStop) blockReasons.push("Emergency Stop активирован");
  if (!esp32Connected) blockReasons.push("ESP32 не подключён");
  if (frame.isStaleBlock) blockReasons.push("Кадр устарел — действия заблокированы");
  const blockInput = blockReasons.length > 0;
  const blockReason = blockReasons.join(" · ") || undefined;

  let staleWarning: string | null = null;
  if (frame.isStaleBlock) {
    staleWarning = `Кадр устарел (${Math.round(frame.ageMs / 1000)}с). Обновите экран.`;
  } else if (frame.isStaleWarning) {
    staleWarning = `Кадр старше ${Math.round(frame.ageMs / 1000)}с — возможно, экран не актуален.`;
  }

  const obsBadge = frameStatus
    ? `${frameStatus.provider}${frameStatus.connected ? " · ok" : " · offline"}`
    : "—";
  const esp32Badge = esp32Connected ? "ESP32 · ok" : "ESP32 · offline";

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="px-4 py-3 border-b border-white/10 flex items-center gap-3 flex-wrap">
        <h2 className="text-sm font-semibold tracking-wide uppercase text-zinc-300">
          VDI Control
        </h2>
        <span className="text-[11px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
          OBS · {obsBadge}
        </span>
        <span
          className={`text-[11px] px-2 py-0.5 rounded ${
            esp32Connected ? "bg-emerald-900/60 text-emerald-200" : "bg-rose-900/60 text-rose-200"
          }`}
        >
          {esp32Badge}
        </span>
        {emergencyStop && (
          <span className="text-[11px] px-2 py-0.5 rounded bg-rose-700 text-white">
            EMERGENCY STOP
          </span>
        )}
        <div className="ml-auto">
          <OverlayToggles value={overlays} onChange={onOverlaysChange} />
        </div>
      </div>
      <div className="flex-1 min-h-0 p-4">
        <LiveVdiScreen
          overlays={overlays}
          focused={vdiFocused}
          onFocus={onVdiFocus}
          onBlur={onVdiBlur}
          blockInput={blockInput}
          blockReason={blockReason}
          staleWarning={staleWarning}
          frame={frame.frame}
          loading={frame.loading}
          error={frame.error}
          autoRefresh={frame.autoRefresh}
          onAutoRefreshChange={frame.setAutoRefresh}
          refreshIntervalMs={frame.refreshIntervalMs}
          onRefreshIntervalChange={frame.setRefreshIntervalMs}
          onManualRefresh={frame.refresh}
        />
      </div>
    </div>
  );
}
