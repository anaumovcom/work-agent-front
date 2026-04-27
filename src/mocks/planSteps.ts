import type { PlanStep } from "../types";

export const planSteps: PlanStep[] = [
  {
    id: "s1",
    title: "Открыть доску команды",
    description: "Перейти на доску GAMES в трекере",
    status: "done",
    agent: "VDI Agent",
    confidence: 0.98,
    expected: "Доска открыта",
    actual: "Доска открыта",
  },
  {
    id: "s2",
    title: "Найти новые задачи",
    description: "Сканировать колонку To Do",
    status: "done",
    agent: "Task Agent",
    confidence: 0.94,
    expected: "Список карточек",
    actual: "Найдено 8 карточек",
  },
  {
    id: "s3",
    title: "Распознать карточки",
    description: "OCR + извлечение полей",
    status: "active",
    agent: "Vision",
    confidence: 0.86,
  },
  {
    id: "s4",
    title: "Сопоставить с эпиками",
    status: "waiting",
    agent: "Task Agent",
  },
  {
    id: "s5",
    title: "Показать маппинг пользователю",
    status: "approval",
    agent: "Supervisor",
  },
  {
    id: "s6",
    title: "Заполнить Epic Link",
    status: "waiting",
    agent: "VDI Agent",
  },
  {
    id: "s7",
    title: "Проверить результат",
    status: "waiting",
    agent: "VDI Agent",
  },
];
