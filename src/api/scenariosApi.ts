import type { Scenario } from "../types";
import { api } from "./client";

export const scenariosApi = {
  list: () => api.get<Scenario[]>("/api/scenarios"),
  get: (id: string) => api.get<Scenario>(`/api/scenarios/${id}`),
  patch: (id: string, body: Partial<Scenario>) =>
    api.patch<Scenario>(`/api/scenarios/${id}`, body),
  run: (id: string) =>
    api.post<{ taskId: string; scenarioId: string }>(`/api/scenarios/${id}/run`),
};
