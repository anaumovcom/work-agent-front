import type { VdiElement } from "../types";

export const vdiElements: VdiElement[] = [
  { id: "z1", kind: "zone", type: "browser-bar", label: "Browser top bar", bbox: { x: 0, y: 0, w: 100, h: 8 }, confidence: 0.99 },
  { id: "z2", kind: "zone", type: "task-board", label: "Task board", bbox: { x: 0, y: 16, w: 100, h: 70 }, confidence: 0.96 },
  { id: "z3", kind: "zone", type: "filters", label: "Filters panel", bbox: { x: 0, y: 8, w: 100, h: 8 }, confidence: 0.91 },
  { id: "e1", kind: "element", type: "button", label: "Кнопка \"Создать задачу\"", bbox: { x: 86, y: 10, w: 12, h: 4 }, confidence: 0.98 },
  { id: "e2", kind: "element", type: "input", label: "Поиск задач", bbox: { x: 2, y: 10, w: 22, h: 4 }, confidence: 0.95 },
  { id: "e3", kind: "element", type: "card", label: "Карточка GAMES-1234", bbox: { x: 22, y: 22, w: 16, h: 16 }, confidence: 0.93 },
  { id: "e4", kind: "element", type: "card", label: "Карточка GAMES-1235", bbox: { x: 22, y: 42, w: 16, h: 14 }, confidence: 0.9 },
];
