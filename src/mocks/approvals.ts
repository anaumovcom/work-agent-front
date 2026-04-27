import type { Approval } from "../types";

export const approvals: Approval[] = [
  {
    id: "a1",
    type: "Сообщение в Telegram",
    target: "Чат: Команда GAMES",
    content:
      "Привет! Я завёл новые задачи в To Do и собираюсь привязать их к эпикам. Если есть пожелания — напишите.",
    risk: "low",
    agent: "Message Writer",
    expected: "Сообщение будет отправлено в групповой чат",
  },
  {
    id: "a2",
    type: "Сохранение задачи",
    target: "GAMES-1234",
    content: "Установить Epic Link = GP-45 (Профиль)",
    risk: "medium",
    agent: "Task Agent",
    expected: "Задача обновлена в трекере",
  },
  {
    id: "a3",
    type: "Создание встречи",
    target: "Календарь Иван П.",
    content: "Встреча по ПСИ, 28.04 в 14:00, 30 минут",
    risk: "medium",
    agent: "Calendar Agent",
  },
  {
    id: "a4",
    type: "Email",
    target: "ivan@company.local",
    content: "Подготовил черновик ответа по релизу 1.4",
    risk: "high",
    agent: "Mail Agent",
  },
  {
    id: "a5",
    type: "Сохранение задачи",
    target: "GAMES-1235",
    content: "Установить Epic Link = GP-12",
    risk: "low",
    agent: "Task Agent",
  },
];
