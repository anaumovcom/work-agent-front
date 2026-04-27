export interface Task {
  id: string;
  title: string;
  epic?: string;
  assignee: string;
  status: "Backlog" | "To Do" | "In Progress" | "Review" | "Done";
}

export const tasks: Task[] = [
  { id: "GAMES-1250", title: "Интеграция с новым API платежей", epic: "GP-45", assignee: "Мария К.", status: "Backlog" },
  { id: "GAMES-1249", title: "Доработка фильтров по статусу игр", epic: "GP-45", assignee: "Алексей С.", status: "Backlog" },
  { id: "GAMES-1234", title: "Добавить фильтр по статусу в списке игр", assignee: "Иван П.", status: "To Do" },
  { id: "GAMES-1235", title: "Исправить отображение даты в календаре", epic: "GP-12", assignee: "Мария К.", status: "To Do" },
  { id: "GAMES-1236", title: "Возможность экспорта отчётов", epic: "GP-30", assignee: "Алексей С.", status: "In Progress" },
  { id: "GAMES-1237", title: "Рефакторинг модуля авторизации", epic: "GP-10", assignee: "Дмитрий В.", status: "In Progress" },
  { id: "GAMES-1238", title: "Обновить документацию по API", epic: "GP-30", assignee: "Ольга Б.", status: "Review" },
  { id: "GAMES-1239", title: "Исправить ошибку при загрузке аватаров", epic: "GP-22", assignee: "Мария К.", status: "Review" },
  { id: "GAMES-1244", title: "Настроить CI/CD для проекта", epic: "GP-01", assignee: "Иван П.", status: "Done" },
  { id: "GAMES-1245", title: "Добавить логирование ошибок", epic: "GP-22", assignee: "Мария К.", status: "Done" },
];

export const taskColumns = ["Backlog", "To Do", "In Progress", "Review", "Done"] as const;
export const columnCounts: Record<string, number> = {
  Backlog: 24,
  "To Do": 8,
  "In Progress": 5,
  Review: 3,
  Done: 12,
};
