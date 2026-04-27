import { api } from "./client";

export interface MemoryItemDto {
  id: string;
  type: string;
  title: string;
  content?: string | null;
  summary?: string | null;
  meta?: string | null;
  source?: string | null;
  confidence?: number | null;
  related: string[];
  extra: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export const memoryApi = {
  list: (type?: string) =>
    api.get<MemoryItemDto[]>(
      `/api/memory/items${type ? `?type=${encodeURIComponent(type)}` : ""}`
    ),
  get: (id: string) => api.get<MemoryItemDto>(`/api/memory/items/${id}`),
  search: (query: string, types?: string[], limit = 20) =>
    api.post<MemoryItemDto[]>("/api/memory/search", { query, types, limit }),
  patch: (id: string, body: Partial<MemoryItemDto>) =>
    api.patch<MemoryItemDto>(`/api/memory/items/${id}`, body),
  correct: (id: string, content: string, note?: string) =>
    api.post<MemoryItemDto>(`/api/memory/items/${id}/correct`, { content, note }),
  forget: (id: string) =>
    api.post<{ ok: boolean }>(`/api/memory/items/${id}/forget`),
};
