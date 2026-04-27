import { Badge } from "../common/Badge";
import { Button } from "../common/Button";
import type { Mode } from "../../types";
import { systemStatus } from "../../mocks/systemStatus";

interface Props {
  mode: Mode;
  onModeChange: (m: Mode) => void;
  agentsPaused: boolean;
  onTogglePause: () => void;
  onEmergencyStop: () => void;
}

const modes: Mode[] = [
  "View",
  "Live Control",
  "Annotation",
  "Agent Assist",
  "Step Auto",
  "Observe",
];

export function TopBar({
  mode,
  onModeChange,
  agentsPaused,
  onTogglePause,
  onEmergencyStop,
}: Props) {
  return (
    <header className="flex h-14 items-center gap-3 border-b border-slate-200 bg-white px-4 shadow-sm">
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-cyan-500 to-violet-500 text-white font-bold">
          V
        </div>
        <div className="text-sm font-semibold tracking-tight text-slate-900">
          VDI AI Control Center
        </div>
      </div>

      <div className="ml-3 flex items-center gap-2 text-xs text-slate-500">
        <span>Рабочее пространство</span>
        <button className="flex items-center gap-1 rounded-md border border-slate-300 bg-white px-2 py-1 text-slate-700 hover:bg-slate-50">
          {systemStatus.workspace}
          <span className="text-slate-400">▾</span>
        </button>
      </div>

      <div className="mx-3 h-6 w-px bg-slate-200" />

      <div className="flex items-center gap-1.5 text-[11px]">
        <StatusChip label="VDI" value={systemStatus.vdi} tone="success" />
        <StatusChip label="OBS" value={systemStatus.obs} tone="info" />
        <StatusChip label="ESP32" value={systemStatus.esp32} tone="success" />
        <StatusChip label="AI" value={systemStatus.ai} tone="violet" />
        <StatusChip label="Память" value={systemStatus.memory} tone="success" />
      </div>

      <div className="ml-auto flex items-center gap-2">
        <label className="flex items-center gap-2 rounded-md border border-slate-300 bg-white px-2 py-1 text-xs">
          <span className="text-slate-500">Режим:</span>
          <select
            aria-label="Режим работы"
            value={mode}
            onChange={(e) => onModeChange(e.target.value as Mode)}
            className="bg-transparent text-slate-800 outline-none"
          >
            {modes.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </label>

        <Button
          variant="secondary"
          size="sm"
          onClick={onTogglePause}
          icon={<span>{agentsPaused ? "▶" : "❚❚"}</span>}
        >
          {agentsPaused ? "Возобновить" : "Пауза агентов"}
        </Button>

        <Button
          variant="danger"
          size="sm"
          onClick={onEmergencyStop}
          icon={<span>■</span>}
        >
          Аварийная остановка
        </Button>
      </div>
    </header>
  );
}

function StatusChip({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "success" | "info" | "violet" | "warn" | "danger";
}) {
  return (
    <div className="flex items-center gap-1 rounded-md border border-slate-200 bg-white px-1.5 py-1">
      <span className="text-slate-500">{label}:</span>
      <Badge tone={tone}>{value}</Badge>
    </div>
  );
}
