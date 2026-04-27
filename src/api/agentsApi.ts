import type { PlanStep } from "../types";
import { api } from "./client";

export interface AgentMessageDto {
  id: string;
  author: "user" | "agent";
  time: string;
  text?: string | null;
  card?: { seen?: string[]; proposal?: string[]; actions?: string[] } | null;
}

export interface RiskDto {
  tone: "warn" | "success" | "danger" | "info";
  text: string;
}

export interface AgentTaskDto {
  id: string;
  title: string;
  agent: string;
  status: string;
  planId?: string | null;
  context: string[];
  sources: string[];
  risks: RiskDto[];
  createdAt: string;
}

export interface PlanDto {
  id: string;
  taskId: string;
  steps: PlanStep[];
}

export const agentsApi = {
  listMessages: () => api.get<AgentMessageDto[]>("/api/agents/messages"),
  sendMessage: (text: string) =>
    api.post<AgentMessageDto>("/api/agents/messages", { text }),

  listTasks: () => api.get<AgentTaskDto[]>("/api/agents/tasks"),
  getTask: (id: string) => api.get<AgentTaskDto>(`/api/agents/tasks/${id}`),
  createTask: (message: string, context: Record<string, unknown> = {}) =>
    api.post<AgentTaskDto>("/api/agents/tasks", { message, context }),
  cancelTask: (id: string) =>
    api.post<AgentTaskDto>(`/api/agents/tasks/${id}/cancel`),

  currentPlan: () => api.get<PlanDto>("/api/plans/current"),
  getPlan: (id: string) => api.get<PlanDto>(`/api/plans/${id}`),
  patchStep: (planId: string, stepId: string, patch: Partial<PlanStep>) =>
    api.patch<PlanDto>(`/api/plans/${planId}/steps/${stepId}`, patch),
  addStep: (planId: string, step: { title: string; description?: string;
            agent?: string; status?: PlanStep["status"] }) =>
    api.post<PlanDto>(`/api/plans/${planId}/steps`, step),
  deleteStep: (planId: string, stepId: string) =>
    api.delete<PlanDto>(`/api/plans/${planId}/steps/${stepId}`),
  reorder: (planId: string, stepIds: string[]) =>
    api.post<PlanDto>(`/api/plans/${planId}/steps/reorder`, { stepIds }),
};
