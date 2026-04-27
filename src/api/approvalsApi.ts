import { api } from "./client";

export interface ApprovalDto {
  id: string;
  type: string;
  target: string;
  content: string;
  risk: "low" | "medium" | "high";
  agent: string;
  expected?: string | null;
  status: "pending" | "approved" | "rejected" | "cancelled";
  editable: boolean;
  related_entities: string[];
  created_at: string;
  plan_id?: string | null;
  step_id?: string | null;
}

export const approvalsApi = {
  list: (status?: string) =>
    api.get<ApprovalDto[]>(
      `/api/approvals${status ? `?status=${encodeURIComponent(status)}` : ""}`
    ),
  get: (id: string) => api.get<ApprovalDto>(`/api/approvals/${id}`),
  patch: (id: string, body: { content?: string; expected?: string }) =>
    api.patch<ApprovalDto>(`/api/approvals/${id}`, body),
  rewrite: (id: string, content: string) =>
    api.post<ApprovalDto>(`/api/approvals/${id}/rewrite`, { content }),
  approve: (id: string) => api.post<ApprovalDto>(`/api/approvals/${id}/approve`),
  reject: (id: string) => api.post<ApprovalDto>(`/api/approvals/${id}/reject`),
};
