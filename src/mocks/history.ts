import type { HistoryEvent } from "../types";

export const historyEvents: HistoryEvent[] = [
  { id: "h1", time: "22:10:01", actor: "system", type: "Screen", summary: "Screen analyzed" },
  { id: "h2", time: "22:11:15", actor: "user", type: "VDI Action", summary: "User clicked 640, 320" },
  { id: "h3", time: "22:11:22", actor: "agent", type: "Vision", summary: "Agent detected task board" },
  { id: "h4", time: "22:12:03", actor: "agent", type: "Approval", summary: "Draft created для GAMES-1234" },
  { id: "h5", time: "22:13:40", actor: "user", type: "Approval", summary: "User edited draft" },
  { id: "h6", time: "22:14:12", actor: "agent", type: "Memory", summary: "Saved decision: Релиз 1.4 — 30 апреля" },
  { id: "h7", time: "22:15:00", actor: "agent", type: "Error", summary: "Не удалось распознать форму справа", status: "error" },
];
