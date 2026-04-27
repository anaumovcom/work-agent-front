import type { MemoryEntity } from "../types";

export const memoryOverview = {
  tasks: 124,
  people: 38,
  meetings: 17,
  messages: 2400,
  decisions: 86,
  screenshots: 312,
  epics: 14,
  projects: 6,
};

export const memoryEntities: MemoryEntity[] = [
  { id: "t1", kind: "task", title: "GAMES-1234", meta: "epic GP-45 • Иван П.", summary: "Похожа на задачи по эпику Профиль" },
  { id: "t2", kind: "task", title: "GAMES-1235", meta: "epic GP-12 • Мария К.", summary: "Связана с календарём" },
  { id: "e1", kind: "epic", title: "GP-45 Профиль", summary: "Эпик по работе с профилями игроков" },
  { id: "e2", kind: "epic", title: "GP-12 Календарь", summary: "Эпик по календарным фичам" },
  { id: "p1", kind: "person", title: "Иван Петров", meta: "Тимлид GAMES", summary: "Отвечает за фильтрацию и поиск" },
  { id: "p2", kind: "person", title: "Мария Климова", meta: "Frontend", summary: "Берёт UI-задачи" },
  { id: "d1", kind: "decision", title: "Релиз 1.4 — 30 апреля", summary: "Зафиксировано на встрече 24.04" },
  { id: "d2", kind: "decision", title: "Не использовать внешние LLM для писем", summary: "Подтверждено пользователем 22.04" },
  { id: "m1", kind: "message", title: "Иван П. в Telegram", summary: "Просит короткие сообщения без воды" },
];

export const searchResults = [
  {
    id: "r1",
    summary: "Решено: ПСИ переносится на 28.04, повестку готовит Иван",
    source: "Встреча 22.04, 14:00",
    confidence: 0.92,
    related: ["GP-45", "Иван П."],
  },
  {
    id: "r2",
    summary: "Решено: задачи без эпика автоматически попадают на ревью к тимлиду",
    source: "Чат GAMES, 18.04",
    confidence: 0.81,
    related: ["GAMES", "Иван П."],
  },
];
