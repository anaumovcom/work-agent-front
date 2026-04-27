# VDI AI Control Center — frontend prototype

Кликабельный UI-прототип системы управления VDI, ИИ-агентами, памятью и действиями.

Стек:

- React 18
- Vite 5
- TypeScript
- TailwindCSS 3

Все данные — из mock-файлов в `src/mocks`. Нет backend, OBS, ESP32, OCR, LLM — UI готов к интеграции.

## Запуск

```bash
npm install
npm run dev
```

Откроется на http://localhost:5173.

## Сборка

```bash
npm run build
npm run preview
```

## Структура

```
src/
  app/App.tsx               — корневой компонент, состояние, роутинг экранов
  main.tsx, index.css       — bootstrap
  types.ts                  — типы данных
  mocks/                    — мок-данные (tasks, approvals, memory, history, ...)
  components/
    common/                 — Button, Card, Tabs, Badge, EmptyState
    layout/                 — TopBar, LeftSidebar, RightPanel
    vdi/                    — VdiScreen, VdiInputBar, OverlayToggles
    agents/                 — AgentChat, AgentMessage, PlanSteps
    approvals/              — ApprovalCard
  screens/
    VdiControlScreen.tsx
    InboxScreen.tsx
    PlanScreen.tsx
    ApprovalsScreen.tsx
    MemoryScreen.tsx
    ScenariosScreen.tsx
    HistoryScreen.tsx
    DiagnosticsScreen.tsx
    SettingsScreen.tsx
```

## Что работает на моках

- Переключение всех 9 экранов через LeftSidebar
- Переключение режимов (View / Live Control / Annotation / Agent Assist / Step Auto / Observe)
- Emergency Stop / Pause Agents
- Клик по mock VDI экрану → точка клика, координаты в RightPanel и History
- Drag по экрану → выделение временной зоны
- Toggle overlays (OCR / UI / Zones / Target / Last actions)
- Ввод в VDI / Agent режимах из единой строки
- Чат с агентом + быстрые команды
- План с шагами (Run / Edit / Skip)
- Approvals: редактирование текста, transform-кнопки, Approve / Reject
- Память: поиск, overview, Conversation Memory
- Сценарии: enable/disable, выбор сценария, детали
- History с фильтрами
- Diagnostics с тестовыми кнопками
- Settings со всеми ключевыми тумблерами
