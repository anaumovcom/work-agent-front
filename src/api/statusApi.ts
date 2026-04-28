import { api } from "./client";

export type SystemMode =
  | "view"
  | "live_control"
  | "annotation"
  | "agent_assist"
  | "step_auto"
  | "observe";

export interface SystemStatusDto {
  vdi: "online" | "offline" | "mock";
  obs: { status: string; delayMs: number };
  esp32: { status: string };
  ai: { mode: string };
  memory: { status: string };
  currentMode: SystemMode;
  agentsPaused: boolean;
  emergencyStop: boolean;
}

export const statusApi = {
  get: () => api.get<SystemStatusDto>("/api/status"),
  setMode: (mode: SystemMode) =>
    api.patch<SystemStatusDto>("/api/status/mode", { mode }),
  pauseAgents: (paused: boolean) =>
    api.post<SystemStatusDto>("/api/status/pause-agents", { paused }),
  emergencyStop: () => api.post<SystemStatusDto>("/api/status/emergency-stop"),
  resetEmergencyStop: () =>
    api.post<SystemStatusDto>("/api/status/reset-emergency-stop"),
};
