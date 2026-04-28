import { api } from "./client";

export interface DiagnosticBlockDto {
  id: string;
  name: string;
  status: "ok" | "warn" | "error";
  metrics: { label: string; value: string }[];
}

export const diagnosticsApi = {
  list: () => api.get<DiagnosticBlockDto[]>("/api/diagnostics"),
  esp32: () => api.get<Record<string, unknown>>("/api/diagnostics/esp32"),
  testClick: () => api.post("/api/diagnostics/test-click"),
  testTyping: () => api.post("/api/diagnostics/test-typing"),
  testEsp32Move: () => api.post("/api/diagnostics/test-esp32-move"),
  testFrame: () => api.post("/api/diagnostics/test-frame"),
  testOcr: () => api.post("/api/diagnostics/test-ocr"),
  testVision: () => api.post("/api/diagnostics/test-vision"),
};
