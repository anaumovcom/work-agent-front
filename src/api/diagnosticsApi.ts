import { api } from "./client";

export interface DiagnosticBlockDto {
  id: string;
  name: string;
  status: "ok" | "warn" | "error";
  metrics: { label: string; value: string }[];
}

export const diagnosticsApi = {
  list: () => api.get<DiagnosticBlockDto[]>("/api/diagnostics"),
  testClick: () => api.post("/api/diagnostics/test-click"),
  testTyping: () => api.post("/api/diagnostics/test-typing"),
  testOcr: () => api.post("/api/diagnostics/test-ocr"),
  testVision: () => api.post("/api/diagnostics/test-vision"),
};
