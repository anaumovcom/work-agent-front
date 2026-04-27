import { api } from "./client";

export interface VdiFrameDto {
  frameId: string;
  timestamp: string;
  imageUrl?: string | null;
  resolution: { width: number; height: number };
}

type Source = "user" | "agent" | "scenario";

export const vdiApi = {
  currentFrame: () => api.get<VdiFrameDto>("/api/vdi/frame/current"),
  click: (x: number, y: number, button: "left" | "right" | "middle" = "left",
          source: Source = "user") =>
    api.post("/api/vdi/mouse/click", { x, y, button, source }),
  doubleClick: (x: number, y: number, source: Source = "user") =>
    api.post("/api/vdi/mouse/double-click", { x, y, source }),
  move: (x: number, y: number, source: Source = "user") =>
    api.post("/api/vdi/mouse/move", { x, y, source }),
  scroll: (x: number, y: number, deltaX = 0, deltaY = 0, source: Source = "user") =>
    api.post("/api/vdi/mouse/scroll", { x, y, deltaX, deltaY, source }),
  type: (text: string, source: Source = "user") =>
    api.post("/api/vdi/keyboard/type", { text, source }),
  key: (key: string, source: Source = "user") =>
    api.post("/api/vdi/keyboard/key", { key, source }),
  hotkey: (keys: string[], source: Source = "user") =>
    api.post("/api/vdi/keyboard/hotkey", { keys, source }),
};
