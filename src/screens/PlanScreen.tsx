import { useState } from "react";
import { Badge } from "../components/common/Badge";
import { Button } from "../components/common/Button";
import { Card } from "../components/common/Card";
import { PlanSteps } from "../components/agents/PlanSteps";
import type { PlanStep } from "../types";

export interface PlanTask {
  id: string;
  title: string;
  agent: string;
  status: string;
  steps: PlanStep[];
  context: string[];
  sources: string[];
  risks: { tone: "success" | "warn" | "danger"; text: string }[];
}

interface Props {
  tasks: PlanTask[];
  activeTaskId: string;
  onActiveTaskChange: (id: string) => void;
  onAddTask: () => void;
  onDeleteTask: (id: string) => void;
  onTaskTitleChange: (id: string, title: string) => void;

  onStepAction: (taskId: string, stepId: string, action: "run" | "edit" | "skip" | "delete") => void;
  onStepEdit: (taskId: string, stepId: string, patch: Partial<PlanStep>) => void;
  onAddStep: (taskId: string) => void;

  onContextChange: (taskId: string, context: string[]) => void;
  onSourcesChange: (taskId: string, sources: string[]) => void;
}

export function PlanScreen(props: Props) {
  const current = props.tasks.find((t) => t.id === props.activeTaskId) ?? props.tasks[0];
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(current?.title ?? "");

  if (!current) {
    return (
      <div className="flex h-full flex-col gap-3 p-4">
        <h1 className="text-xl font-semibold text-slate-900">Plan</h1>
        <Card>
          <div className="text-sm text-slate-700">Нет активных задач.</div>
          <Button variant="primary" size="sm" onClick={props.onAddTask} className="mt-2">
            + Создать задачу
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid h-full grid-cols-[280px_1fr_340px] gap-3 p-4 min-h-0">
      {/* Left: tasks */}
      <Card padded={false} className="overflow-hidden flex flex-col">
        <div className="flex items-center justify-between border-b border-slate-200 p-3">
          <span className="text-xs uppercase tracking-wider text-slate-500">
            Активные задачи
          </span>
          <Button size="sm" variant="primary" onClick={props.onAddTask}>
            +
          </Button>
        </div>
        <ul className="flex flex-1 flex-col overflow-y-auto">
          {props.tasks.map((t) => {
            const isActive = t.id === current.id;
            return (
              <li key={t.id}>
                <button
                  onClick={() => props.onActiveTaskChange(t.id)}
                  className={
                    "flex w-full flex-col items-start gap-1 border-b border-slate-200 px-3 py-2.5 text-left transition-colors " +
                    (isActive
                      ? "bg-cyan-50 border-l-4 border-l-cyan-500"
                      : "hover:bg-slate-50 border-l-4 border-l-transparent")
                  }
                >
                  <div className="text-sm text-slate-900 font-medium">{t.title}</div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500">
                    <Badge tone="violet">{t.agent}</Badge>
                    <span>{t.status}</span>
                    <span>• {t.steps.length} шагов</span>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      </Card>

      {/* Center: task plan */}
      <div className="flex flex-col gap-3 min-h-0 overflow-y-auto">
        <div className="flex items-center justify-between gap-2">
          {editingTitle ? (
            <input
              autoFocus
              value={titleDraft}
              onChange={(e) => setTitleDraft(e.target.value)}
              onBlur={() => {
                props.onTaskTitleChange(current.id, titleDraft.trim() || current.title);
                setEditingTitle(false);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  props.onTaskTitleChange(current.id, titleDraft.trim() || current.title);
                  setEditingTitle(false);
                }
                if (e.key === "Escape") setEditingTitle(false);
              }}
              className="flex-1 rounded-md border border-slate-300 bg-white px-2 py-1 text-xl font-semibold outline-none focus:border-cyan-500"
              aria-label="Название задачи"
            />
          ) : (
            <h1
              className="text-xl font-semibold text-slate-900 cursor-text hover:bg-slate-100 rounded px-1"
              onClick={() => {
                setTitleDraft(current.title);
                setEditingTitle(true);
              }}
              title="Кликните, чтобы переименовать"
            >
              {current.title}
            </h1>
          )}
          <div className="flex gap-1.5">
            <Button size="sm" variant="primary">Запустить план</Button>
            <Button
              size="sm"
              variant="ghost"
              className="text-red-600 hover:bg-red-50"
              onClick={() => props.onDeleteTask(current.id)}
            >
              Удалить задачу
            </Button>
          </div>
        </div>

        <PlanSteps
          steps={current.steps}
          editable
          onAction={(stepId, action) => props.onStepAction(current.id, stepId, action)}
          onEditCommit={(stepId, patch) => props.onStepEdit(current.id, stepId, patch)}
          onAdd={() => props.onAddStep(current.id)}
        />
      </div>

      {/* Right: editable context */}
      <div className="flex flex-col gap-3 overflow-y-auto">
        <EditableList
          title="Контекст"
          items={current.context}
          onChange={(next) => props.onContextChange(current.id, next)}
          placeholder="Добавить пункт контекста"
        />
        <EditableList
          title="Источники"
          items={current.sources}
          onChange={(next) => props.onSourcesChange(current.id, next)}
          placeholder="Добавить источник"
        />
        <Card>
          <div className="text-xs uppercase tracking-wider text-slate-500">Риски</div>
          <ul className="mt-2 space-y-1.5 text-xs text-slate-800">
            {current.risks.map((r, i) => (
              <li key={i} className="flex items-center gap-2">
                <Badge tone={r.tone}>{r.tone === "danger" ? "high" : r.tone === "warn" ? "medium" : "low"}</Badge>
                {r.text}
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}

function EditableList({
  title,
  items,
  onChange,
  placeholder,
}: {
  title: string;
  items: string[];
  onChange: (next: string[]) => void;
  placeholder: string;
}) {
  const [draft, setDraft] = useState("");

  return (
    <Card>
      <div className="text-xs uppercase tracking-wider text-slate-500">{title}</div>
      <ul className="mt-2 flex flex-col gap-1.5">
        {items.map((it, i) => (
          <li key={i} className="flex items-start gap-2 group">
            <input
              value={it}
              onChange={(e) => {
                const next = [...items];
                next[i] = e.target.value;
                onChange(next);
              }}
              className="flex-1 rounded-md border border-transparent bg-transparent px-1.5 py-1 text-sm text-slate-800 outline-none hover:border-slate-200 focus:border-cyan-500 focus:bg-white"
              aria-label={`${title} элемент ${i + 1}`}
            />
            <button
              onClick={() => onChange(items.filter((_, idx) => idx !== i))}
              title="Удалить"
              className="opacity-0 group-hover:opacity-100 px-1.5 text-xs text-slate-400 hover:text-red-600"
            >
              ✕
            </button>
          </li>
        ))}
      </ul>
      <div className="mt-2 flex gap-1.5">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && draft.trim()) {
              onChange([...items, draft.trim()]);
              setDraft("");
            }
          }}
          placeholder={placeholder}
          aria-label={placeholder}
          className="h-7 flex-1 rounded-md border border-slate-300 bg-white px-2 text-xs outline-none focus:border-cyan-500"
        />
        <Button
          size="sm"
          variant="secondary"
          onClick={() => {
            if (draft.trim()) {
              onChange([...items, draft.trim()]);
              setDraft("");
            }
          }}
        >
          +
        </Button>
      </div>
    </Card>
  );
}
