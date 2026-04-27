import type { DiagnosticBlock } from "../types";

export const diagnostics: DiagnosticBlock[] = [
  {
    id: "obs",
    name: "OBS",
    status: "ok",
    metrics: [
      { label: "FPS", value: "15" },
      { label: "Frame delay", value: "1.2s" },
      { label: "Bitrate", value: "4.2 Mbps" },
    ],
  },
  {
    id: "esp32",
    name: "ESP32",
    status: "ok",
    metrics: [
      { label: "Ping", value: "8ms" },
      { label: "HID queue", value: "0" },
      { label: "Firmware", value: "1.2.0" },
    ],
  },
  {
    id: "vision",
    name: "Vision",
    status: "ok",
    metrics: [
      { label: "OCR latency", value: "420ms" },
      { label: "Vision latency", value: "1.8s" },
      { label: "Confidence avg", value: "0.87" },
    ],
  },
  {
    id: "llm",
    name: "LLM",
    status: "warn",
    metrics: [
      { label: "Mode", value: "Hybrid" },
      { label: "External cost (today)", value: "$1.24" },
      { label: "Tokens", value: "184k" },
    ],
  },
  {
    id: "memory",
    name: "Memory",
    status: "ok",
    metrics: [
      { label: "Postgres", value: "OK" },
      { label: "Qdrant", value: "OK" },
      { label: "MinIO", value: "OK" },
    ],
  },
  {
    id: "queue",
    name: "Queue",
    status: "ok",
    metrics: [
      { label: "Pending", value: "2" },
      { label: "Failed (1h)", value: "0" },
    ],
  },
  {
    id: "storage",
    name: "Storage",
    status: "ok",
    metrics: [
      { label: "Screenshots", value: "312" },
      { label: "Audio", value: "8h" },
      { label: "Free space", value: "412 GB" },
    ],
  },
];
