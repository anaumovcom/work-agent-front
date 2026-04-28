import { api, API_BASE } from "./client";

export interface VdiFrameDto {
  frameId: string;
  timestamp: string;
  imageUrl?: string | null;
  resolution: { width: number; height: number };
  source: string;
  latencyMs: number;
  status: "ok" | "stale" | "error";
}

export interface FrameStatusDto {
  provider: string;
  connected: boolean;
  lastFrameAt?: string | null;
  resolution: { width: number; height: number };
  latencyMs: number;
  fpsApprox: number;
  error?: string | null;
}

export interface CommandResultDto {
  commandId: string;
  status: "queued" | "pending" | "running" | "done" | "failed" | "cancelled";
  estimatedDelayMs: number;
  error?: string | null;
}

export interface HidQueueItemDto {
  commandId: string;
  type: string;
  payload: Record<string, unknown>;
  status: CommandResultDto["status"];
  enqueuedAt: string;
  startedAt?: string | null;
  finishedAt?: string | null;
  durationMs?: number | null;
  error?: string | null;
}

type Source = "user" | "agent" | "scenario";

export const vdiApi = {
  currentFrame: () => api.get<VdiFrameDto>("/api/vdi/frame/current"),
  refreshFrame: () => api.post<VdiFrameDto>("/api/vdi/frame/refresh"),
  frameStatus: () => api.get<FrameStatusDto>("/api/vdi/frame/status"),
  frameImageUrl: (frameId: string) =>
    `${API_BASE}/api/vdi/frame/${encodeURIComponent(frameId)}/image`,
  click: (x: number, y: number, button: "left" | "right" | "middle" = "left",
          source: Source = "user") =>
    api.post<CommandResultDto>("/api/vdi/mouse/click", { x, y, button, source }),
  mouseDown: (x: number, y: number, button: "left" | "right" | "middle" = "left",
              source: Source = "user") =>
    api.post<CommandResultDto>("/api/vdi/mouse/down", { x, y, button, source }),
  mouseUp: (x: number, y: number, button: "left" | "right" | "middle" = "left",
            source: Source = "user") =>
    api.post<CommandResultDto>("/api/vdi/mouse/up", { x, y, button, source }),
  doubleClick: (x: number, y: number, source: Source = "user") =>
    api.post<CommandResultDto>("/api/vdi/mouse/double-click", { x, y, source }),
  move: (x: number, y: number, source: Source = "user") =>
    api.post<CommandResultDto>("/api/vdi/mouse/move", { x, y, source }),
  drag: (fromX: number, fromY: number, toX: number, toY: number,
         button: "left" | "right" | "middle" = "left", source: Source = "user") =>
    api.post<CommandResultDto>("/api/vdi/mouse/drag", { fromX, fromY, toX, toY, button, source }),
  scroll: (x: number, y: number, deltaX = 0, deltaY = 0, source: Source = "user") =>
    api.post<CommandResultDto>("/api/vdi/mouse/scroll", { x, y, deltaX, deltaY, source }),
  type: (text: string, source: Source = "user") =>
    api.post<CommandResultDto>("/api/vdi/keyboard/type", { text, source }),
  key: (key: string, source: Source = "user") =>
    api.post<CommandResultDto>("/api/vdi/keyboard/key", { key, source }),
  hotkey: (keys: string[], source: Source = "user") =>
    api.post<CommandResultDto>("/api/vdi/keyboard/hotkey", { keys, source }),
  listQueue: () => api.get<HidQueueItemDto[]>("/api/vdi/queue"),
  clearQueue: () => api.post<{ cleared: number }>("/api/vdi/queue/clear"),
};
