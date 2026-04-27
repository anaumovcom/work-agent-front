import { api } from "./client";

export interface HistoryEventDto {
  id: string;
  timestamp: string;
  actor: "user" | "agent" | "system" | "vdi";
  type: string;
  summary: string;
  status: "success" | "info" | "error" | "warn";
  related_entities: string[];
  metadata: Record<string, unknown>;
}

export const historyApi = {
  list: (limit = 200, actor?: string) => {
    const params = new URLSearchParams();
    params.set("limit", String(limit));
    if (actor) params.set("actor", actor);
    return api.get<HistoryEventDto[]>(`/api/history?${params}`);
  },
  create: (body: Omit<HistoryEventDto, "id" | "timestamp">) =>
    api.post<HistoryEventDto>("/api/history", body),
};
