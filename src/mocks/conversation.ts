import type { AgentMessage, ConversationNote } from "../types";

export const initialMessages: AgentMessage[] = [
  {
    id: "m1",
    author: "agent",
    time: "10:14",
    text: "Привет! Я готов помочь. Что нужно сделать?",
  },
  {
    id: "m2",
    author: "user",
    time: "10:14",
    text: "Завезли задачи на команду в трекере, привяжи их к эпикам.",
  },
  {
    id: "m3",
    author: "agent",
    time: "10:15",
    card: {
      seen: [
        "открыт трекер задач",
        "вижу 8 карточек в To Do",
        "3 задачи без эпика",
      ],
      proposal: [
        "прочитать новые задачи",
        "сопоставить с эпиками из памяти",
        "показать маппинг для подтверждения",
        "заполнить Epic Link и сохранить",
      ],
      actions: ["Начать", "Изменить план", "Отмена"],
    },
  },
];

export const quickActions = [
  "Разбери экран",
  "Найди новые задачи",
  "Привяжи задачи к эпикам",
  "Подготовь ответ",
  "Проверь почту",
  "Проверь календарь",
];

export const conversationNotes: ConversationNote[] = [
  { id: "c1", kind: "preference", text: "Пользователь часто просит: «короче», «без воды»" },
  { id: "c2", kind: "preference", text: "Стиль для командных чатов: менее формальный" },
  { id: "c3", kind: "edit", text: "Заменил «прошу обратить внимание» на «посмотрите, пожалуйста»" },
  { id: "c4", kind: "rejected", text: "Отклонил вариант с длинным вступлением о контексте" },
  { id: "c5", kind: "decision", text: "Подтвердил автомаппинг задач при confidence > 0.9" },
];
