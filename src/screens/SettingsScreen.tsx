import { useEffect, useState, type ReactNode } from "react";
import { settingsApi, type AppSettingsDto } from "../api/settingsApi";
import { Badge } from "../components/common/Badge";
import { Button } from "../components/common/Button";
import { Card } from "../components/common/Card";

type Section =
  | "general"
  | "vdi"
  | "obs"
  | "esp32"
  | "agents"
  | "memory"
  | "llm"
  | "security"
  | "approvals"
  | "appearance";

const sections: { key: Section; label: string; icon: string }[] = [
  { key: "general", label: "Общие", icon: "⚙" },
  { key: "vdi", label: "VDI", icon: "▣" },
  { key: "obs", label: "OBS / Захват", icon: "🎥" },
  { key: "esp32", label: "ESP32 / HID", icon: "🎮" },
  { key: "agents", label: "Агенты", icon: "✦" },
  { key: "memory", label: "Память", icon: "◈" },
  { key: "llm", label: "LLM", icon: "🧠" },
  { key: "security", label: "Безопасность", icon: "🔒" },
  { key: "approvals", label: "Подтверждения", icon: "✓" },
  { key: "appearance", label: "Оформление", icon: "🎨" },
];

interface SettingsState {
  // general
  workspace: string;
  defaultMode: string;
  language: "ru" | "en";
  // vdi
  vdiHost: string;
  vdiResolution: string;
  vdiFps: number;
  vdiCursorSync: boolean;
  // obs
  frameProvider: "mock" | "obs" | "file";
  obsWsUrl: string;
  obsWsPassword: string;
  obsSource: string;
  obsFps: number;
  obsBitrate: number;
  obsBuffer: number;
  // esp32
  esp32Host: string;
  esp32Port: number;
  hidBridge: "mock" | "esp32_http" | "esp32_ws";
  esp32MoveProfile: "linear" | "human" | "fast";
  esp32MoveDelay: number;
  // agents
  agentsEnabled: Record<string, boolean>;
  agentsAutoplan: boolean;
  agentsMaxConcurrent: number;
  // memory
  memoryStoreScreens: boolean;
  memoryStoreAudio: boolean;
  memoryRetentionDays: number;
  memoryAutoSummarize: boolean;
  // llm
  llmPolicy: "Local" | "External" | "Serverless" | "Hybrid";
  llmExternalDailyUsd: number;
  llmModelLocal: string;
  llmModelExternal: string;
  llmTemperature: number;
  // security
  pinEnabled: boolean;
  pin: string;
  remoteAccess: boolean;
  emergencyStopHotkey: string;
  // approvals
  approveSave: boolean;
  approveSend: boolean;
  approveDelete: boolean;
  approveRiskThreshold: "low" | "medium" | "high";
  // appearance
  density: "compact" | "comfortable";
  accent: "cyan" | "violet" | "emerald";
}

const defaultState: SettingsState = {
  workspace: "Work VDI",
  defaultMode: "Live Control",
  language: "ru",
  vdiHost: "vdi.company.local",
  vdiResolution: "1920x1080",
  vdiFps: 15,
  vdiCursorSync: true,
  frameProvider: "mock",
  obsWsUrl: "ws://localhost:4455",
  obsWsPassword: "",
  obsSource: "VDI Capture",
  obsFps: 15,
  obsBitrate: 4000,
  obsBuffer: 1.2,
  esp32Host: "http://192.168.31.234",
  esp32Port: 8080,
  hidBridge: "mock",
  esp32MoveProfile: "human",
  esp32MoveDelay: 80,
  agentsEnabled: {
    Supervisor: true,
    "VDI Agent": true,
    "Task Agent": true,
    "Mail Agent": true,
    "Telegram Agent": true,
    "Calendar Agent": true,
    "Voice Agent": false,
    "Message Writer": true,
  },
  agentsAutoplan: true,
  agentsMaxConcurrent: 3,
  memoryStoreScreens: true,
  memoryStoreAudio: false,
  memoryRetentionDays: 90,
  memoryAutoSummarize: true,
  llmPolicy: "Hybrid",
  llmExternalDailyUsd: 5,
  llmModelLocal: "qwen2.5:14b",
  llmModelExternal: "claude-sonnet",
  llmTemperature: 0.3,
  pinEnabled: true,
  pin: "",
  remoteAccess: false,
  emergencyStopHotkey: "Ctrl+Shift+Esc",
  approveSave: true,
  approveSend: true,
  approveDelete: true,
  approveRiskThreshold: "medium",
  density: "comfortable",
  accent: "cyan",
};

function parseEsp32BaseUrl(value: string): { host: string; port: number } {
  try {
    const url = new URL(value.includes("://") ? value : `http://${value}`);
    const defaultPort = url.protocol === "https:" ? 443 : 80;
    const port = url.port ? Number(url.port) : defaultPort;
    url.port = "";
    return { host: url.toString().replace(/\/$/, ""), port };
  } catch {
    return { host: value, port: 80 };
  }
}

function buildEsp32BaseUrl(host: string, port: number): string {
  try {
    const url = new URL(host.includes("://") ? host : `http://${host}`);
    const defaultPort = url.protocol === "https:" ? 443 : 80;
    url.port = port && port !== defaultPort ? String(port) : "";
    return url.toString().replace(/\/$/, "");
  } catch {
    const cleanHost = host.replace(/\/$/, "");
    return port ? `${cleanHost}:${port}` : cleanHost;
  }
}

function stateFromSettings(settings: AppSettingsDto): SettingsState {
  const esp32 = parseEsp32BaseUrl(settings.esp32BaseUrl);
  return {
    ...defaultState,
    vdiResolution: `${settings.vdiWidth}x${settings.vdiHeight}`,
    vdiFps: Math.round(1000 / Math.max(settings.frameRefreshIntervalMs, 1)),
    frameProvider: settings.frameProvider === "obs" || settings.frameProvider === "file" ? settings.frameProvider : "mock",
    obsWsUrl: settings.obsWsUrl,
    obsWsPassword: settings.obsWsPassword,
    obsSource: settings.obsSourceName,
    esp32Host: esp32.host,
    esp32Port: esp32.port,
    hidBridge: settings.hidBridge === "esp32_http" || settings.hidBridge === "esp32_ws" ? settings.hidBridge : "mock",
    esp32MoveDelay: settings.afterActionRefreshDelayMs,
  };
}

function settingsFromState(state: SettingsState) {
  const [width, height] = state.vdiResolution.split("x").map(Number);
  return {
    frameProvider: state.frameProvider,
    obsWsUrl: state.obsWsUrl,
    obsWsPassword: state.obsWsPassword,
    obsSourceName: state.obsSource,
    esp32BaseUrl: buildEsp32BaseUrl(state.esp32Host, state.esp32Port),
    hidBridge: state.hidBridge,
    vdiWidth: width || 1920,
    vdiHeight: height || 1080,
    frameRefreshIntervalMs: Math.round(1000 / Math.max(state.vdiFps, 1)),
    afterActionRefreshDelayMs: state.esp32MoveDelay,
  };
}

export function SettingsScreen() {
  const [section, setSection] = useState<Section>("general");
  const [state, setState] = useState<SettingsState>(defaultState);
  const [dirty, setDirty] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const settings = await settingsApi.get();
        if (!cancelled) {
          setState(stateFromSettings(settings));
          setDirty(false);
          setError(null);
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  function update<K extends keyof SettingsState>(key: K, value: SettingsState[K]) {
    setState((s) => ({ ...s, [key]: value }));
    setDirty(true);
  }

  async function reloadSettings() {
    setLoading(true);
    try {
      const settings = await settingsApi.get();
      setState(stateFromSettings(settings));
      setDirty(false);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  async function saveSettings() {
    setSaving(true);
    try {
      const settings = await settingsApi.update(settingsFromState(state));
      setState(stateFromSettings(settings));
      setDirty(false);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid h-full grid-cols-[220px_1fr] gap-3 p-4 min-h-0">
      {/* Sidebar */}
      <Card padded={false} className="overflow-hidden">
        <ul className="flex flex-col">
          {sections.map((s) => (
            <li key={s.key}>
              <button
                onClick={() => setSection(s.key)}
                className={
                  "flex w-full items-center gap-2 px-3 py-2 text-sm text-left border-l-4 transition-colors " +
                  (section === s.key
                    ? "bg-cyan-50 border-l-cyan-500 text-cyan-700"
                    : "border-l-transparent text-slate-700 hover:bg-slate-50")
                }
              >
                <span className="w-5 text-center">{s.icon}</span>
                {s.label}
              </button>
            </li>
          ))}
        </ul>
      </Card>

      {/* Content */}
      <div className="flex flex-col gap-3 overflow-y-auto">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-slate-900">
            Settings · {sections.find((s) => s.key === section)?.label}
          </h1>
          <div className="flex items-center gap-2">
            {loading && <Badge tone="info">Загрузка…</Badge>}
            {error && <Badge tone="danger">Ошибка сохранения</Badge>}
            {dirty && <Badge tone="warn">Несохранённые изменения</Badge>}
            <Button
              variant="ghost"
              size="sm"
              onClick={reloadSettings}
            >
              Сбросить
            </Button>
            <Button
              variant="primary"
              size="sm"
              disabled={!dirty || saving}
              onClick={saveSettings}
            >
              {saving ? "Сохранение…" : "Сохранить"}
            </Button>
          </div>
        </div>

        {error && (
          <Card>
            <div className="text-sm text-red-600">{error}</div>
          </Card>
        )}

        {section === "general" && (
          <Card>
            <SectionTitle>Общие</SectionTitle>
            <Row label="Рабочее пространство">
              <TextInput value={state.workspace} onChange={(v) => update("workspace", v)} />
            </Row>
            <Row label="Режим по умолчанию">
              <Select
                value={state.defaultMode}
                onChange={(v) => update("defaultMode", v)}
                options={["View", "Live Control", "Annotation", "Agent Assist", "Step Auto", "Observe"]}
              />
            </Row>
            <Row label="Язык интерфейса">
              <Select
                value={state.language}
                onChange={(v) => update("language", v as "ru" | "en")}
                options={["ru", "en"]}
              />
            </Row>
          </Card>
        )}

        {section === "vdi" && (
          <Card>
            <SectionTitle>VDI</SectionTitle>
            <Row label="Хост VDI">
              <TextInput value={state.vdiHost} onChange={(v) => update("vdiHost", v)} />
            </Row>
            <Row label="Разрешение">
              <Select
                value={state.vdiResolution}
                onChange={(v) => update("vdiResolution", v)}
                options={["1280x720", "1920x1080", "2560x1440"]}
              />
            </Row>
            <Row label="FPS захвата">
              <NumberInput
                value={state.vdiFps}
                onChange={(v) => update("vdiFps", v)}
                min={5}
                max={60}
              />
            </Row>
            <Row label="Синхронизировать курсор">
              <Toggle value={state.vdiCursorSync} onChange={(v) => update("vdiCursorSync", v)} />
            </Row>
          </Card>
        )}

        {section === "obs" && (
          <Card>
            <SectionTitle>OBS / Захват</SectionTitle>
            <Row label="Провайдер кадров">
              <Select
                value={state.frameProvider}
                onChange={(v) => update("frameProvider", v as "mock" | "obs" | "file")}
                options={["mock", "obs", "file"]}
              />
            </Row>
            <Row label="OBS WebSocket URL">
              <TextInput value={state.obsWsUrl} onChange={(v) => update("obsWsUrl", v)} />
            </Row>
            <Row label="OBS WebSocket пароль">
              <TextInput
                value={state.obsWsPassword}
                onChange={(v) => update("obsWsPassword", v)}
                type="password"
              />
            </Row>
            <Row label="Источник">
              <TextInput
                value={state.obsSource}
                onChange={(v) => update("obsSource", v)}
              />
            </Row>
            <Row label="FPS">
              <NumberInput
                value={state.obsFps}
                onChange={(v) => update("obsFps", v)}
                min={5}
                max={60}
              />
            </Row>
            <Row label="Битрейт, kbps">
              <NumberInput
                value={state.obsBitrate}
                onChange={(v) => update("obsBitrate", v)}
                min={500}
                max={20000}
              />
            </Row>
            <Row label="Буфер, с">
              <NumberInput
                value={state.obsBuffer}
                onChange={(v) => update("obsBuffer", v)}
                min={0.1}
                max={5}
                step={0.1}
              />
            </Row>
          </Card>
        )}

        {section === "esp32" && (
          <Card>
            <SectionTitle>ESP32 / HID-эмуляция</SectionTitle>
            <Row label="HID bridge">
              <Select
                value={state.hidBridge}
                onChange={(v) => update("hidBridge", v as "mock" | "esp32_http" | "esp32_ws")}
                options={["mock", "esp32_http", "esp32_ws"]}
              />
            </Row>
            <Row label="Base URL">
              <TextInput value={state.esp32Host} onChange={(v) => update("esp32Host", v)} />
            </Row>
            <Row label="Порт">
              <NumberInput
                value={state.esp32Port}
                onChange={(v) => update("esp32Port", v)}
                min={1}
                max={65535}
              />
            </Row>
            <Row label="Профиль движения курсора">
              <Select
                value={state.esp32MoveProfile}
                onChange={(v) => update("esp32MoveProfile", v as "linear" | "human" | "fast")}
                options={["linear", "human", "fast"]}
              />
            </Row>
            <Row label="Задержка между нажатиями, мс">
              <NumberInput
                value={state.esp32MoveDelay}
                onChange={(v) => update("esp32MoveDelay", v)}
                min={0}
                max={1000}
              />
            </Row>
          </Card>
        )}

        {section === "agents" && (
          <>
            <Card>
              <SectionTitle>Глобальные настройки агентов</SectionTitle>
              <Row label="Автопланирование (Supervisor → Plan)">
                <Toggle
                  value={state.agentsAutoplan}
                  onChange={(v) => update("agentsAutoplan", v)}
                />
              </Row>
              <Row label="Макс. одновременных задач">
                <NumberInput
                  value={state.agentsMaxConcurrent}
                  onChange={(v) => update("agentsMaxConcurrent", v)}
                  min={1}
                  max={10}
                />
              </Row>
            </Card>
            <Card>
              <SectionTitle>Включённые агенты</SectionTitle>
              <ul className="grid grid-cols-2 gap-2">
                {Object.entries(state.agentsEnabled).map(([name, enabled]) => (
                  <li
                    key={name}
                    className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-3 py-2"
                  >
                    <span className="text-sm text-slate-800">{name}</span>
                    <Toggle
                      value={enabled}
                      onChange={(v) =>
                        update("agentsEnabled", { ...state.agentsEnabled, [name]: v })
                      }
                    />
                  </li>
                ))}
              </ul>
            </Card>
          </>
        )}

        {section === "memory" && (
          <Card>
            <SectionTitle>Память</SectionTitle>
            <Row label="Хранить скриншоты">
              <Toggle
                value={state.memoryStoreScreens}
                onChange={(v) => update("memoryStoreScreens", v)}
              />
            </Row>
            <Row label="Хранить аудио">
              <Toggle
                value={state.memoryStoreAudio}
                onChange={(v) => update("memoryStoreAudio", v)}
              />
            </Row>
            <Row label="Хранить N дней">
              <NumberInput
                value={state.memoryRetentionDays}
                onChange={(v) => update("memoryRetentionDays", v)}
                min={1}
                max={3650}
              />
            </Row>
            <Row label="Авто-резюме встреч/чатов">
              <Toggle
                value={state.memoryAutoSummarize}
                onChange={(v) => update("memoryAutoSummarize", v)}
              />
            </Row>
            <div className="mt-3 flex gap-1.5">
              <Button size="sm" variant="secondary">Экспорт памяти</Button>
              <Button size="sm" variant="ghost" className="text-red-600 hover:bg-red-50">
                Очистить старые записи
              </Button>
            </div>
          </Card>
        )}

        {section === "llm" && (
          <Card>
            <SectionTitle>LLM</SectionTitle>
            <Row label="Политика выбора">
              <Select
                value={state.llmPolicy}
                onChange={(v) => update("llmPolicy", v as SettingsState["llmPolicy"])}
                options={["Local", "External", "Serverless", "Hybrid"]}
              />
            </Row>
            <Row label="Локальная модель">
              <TextInput
                value={state.llmModelLocal}
                onChange={(v) => update("llmModelLocal", v)}
              />
            </Row>
            <Row label="Внешняя модель">
              <TextInput
                value={state.llmModelExternal}
                onChange={(v) => update("llmModelExternal", v)}
              />
            </Row>
            <Row label="Лимит внешних вызовов, $/день">
              <NumberInput
                value={state.llmExternalDailyUsd}
                onChange={(v) => update("llmExternalDailyUsd", v)}
                min={0}
                max={500}
                step={0.5}
              />
            </Row>
            <Row label={`Temperature: ${state.llmTemperature.toFixed(2)}`}>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={state.llmTemperature}
                onChange={(e) => update("llmTemperature", Number(e.target.value))}
                className="w-full accent-cyan-600"
                aria-label="Temperature"
              />
            </Row>
          </Card>
        )}

        {section === "security" && (
          <Card>
            <SectionTitle>Безопасность</SectionTitle>
            <Row label="Запрашивать PIN при критических действиях">
              <Toggle
                value={state.pinEnabled}
                onChange={(v) => update("pinEnabled", v)}
              />
            </Row>
            <Row label="PIN-код">
              <TextInput
                value={state.pin}
                onChange={(v) => update("pin", v)}
                type="password"
                placeholder="••••"
              />
            </Row>
            <Row label="Удалённый доступ к панели">
              <Toggle
                value={state.remoteAccess}
                onChange={(v) => update("remoteAccess", v)}
              />
            </Row>
            <Row label="Hotkey аварийной остановки">
              <TextInput
                value={state.emergencyStopHotkey}
                onChange={(v) => update("emergencyStopHotkey", v)}
              />
            </Row>
          </Card>
        )}

        {section === "approvals" && (
          <Card>
            <SectionTitle>Политика подтверждений</SectionTitle>
            <Row label="Подтверждать сохранение задач">
              <Toggle
                value={state.approveSave}
                onChange={(v) => update("approveSave", v)}
              />
            </Row>
            <Row label="Подтверждать отправку сообщений">
              <Toggle
                value={state.approveSend}
                onChange={(v) => update("approveSend", v)}
              />
            </Row>
            <Row label="Подтверждать удаления">
              <Toggle
                value={state.approveDelete}
                onChange={(v) => update("approveDelete", v)}
              />
            </Row>
            <Row label="Порог риска для авто-апрува">
              <Select
                value={state.approveRiskThreshold}
                onChange={(v) =>
                  update("approveRiskThreshold", v as "low" | "medium" | "high")
                }
                options={["low", "medium", "high"]}
              />
            </Row>
          </Card>
        )}

        {section === "appearance" && (
          <Card>
            <SectionTitle>Оформление</SectionTitle>
            <Row label="Тема">
              <div className="flex items-center gap-2">
                <Badge tone="info">Светлая</Badge>
                <span className="text-[11px] text-slate-500">
                  Тёмная тема отключена в этой версии
                </span>
              </div>
            </Row>
            <Row label="Плотность">
              <Select
                value={state.density}
                onChange={(v) => update("density", v as "compact" | "comfortable")}
                options={["compact", "comfortable"]}
              />
            </Row>
            <Row label="Акцентный цвет">
              <Select
                value={state.accent}
                onChange={(v) => update("accent", v as "cyan" | "violet" | "emerald")}
                options={["cyan", "violet", "emerald"]}
              />
            </Row>
          </Card>
        )}
      </div>
    </div>
  );
}

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <div className="mb-2 text-xs uppercase tracking-wider text-slate-500">{children}</div>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-slate-100 py-2 last:border-0">
      <div className="text-sm text-slate-800">{label}</div>
      <div className="w-72">{children}</div>
    </div>
  );
}

function TextInput({
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  type?: "text" | "password";
  placeholder?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="h-8 w-full rounded-md border border-slate-300 bg-white px-2 text-sm outline-none focus:border-cyan-500"
      aria-label="text input"
    />
  );
}

function NumberInput({
  value,
  onChange,
  min,
  max,
  step,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
}) {
  return (
    <input
      type="number"
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      min={min}
      max={max}
      step={step}
      className="h-8 w-full rounded-md border border-slate-300 bg-white px-2 text-sm outline-none focus:border-cyan-500"
      aria-label="number input"
    />
  );
}

function Select({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-8 w-full rounded-md border border-slate-300 bg-white px-2 text-sm outline-none focus:border-cyan-500"
      aria-label="select"
    >
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}

function Toggle({
  value,
  onChange,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={value}
      aria-label={value ? "Включено" : "Выключено"}
      onClick={() => onChange(!value)}
      className={
        "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors " +
        (value ? "bg-cyan-600" : "bg-slate-300")
      }
    >
      <span
        className={
          "inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform " +
          (value ? "translate-x-4" : "translate-x-0.5")
        }
      />
    </button>
  );
}
