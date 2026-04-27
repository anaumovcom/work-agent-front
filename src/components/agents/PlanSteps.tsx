import clsx from "clsx";
import { useState } from "react";
import { Badge } from "../common/Badge";
import { Button } from "../common/Button";
import type { PlanStep } from "../../types";

interface Props {
  steps: PlanStep[];
  onAction: (id: string, action: "run" | "edit" | "skip" | "delete") => void;
  onEditCommit?: (id: string, patch: Partial<PlanStep>) => void;
  onAdd?: () => void;
  editable?: boolean;
}

const statusConfig: Record<
  PlanStep["status"],
  {
    tone: "neutral" | "info" | "success" | "warn" | "danger" | "violet";
    label: string;
    dot: string;
  }
> = {
  done: { tone: "success", label: "Готово", dot: "bg-emerald-500" },
  active: { tone: "info", label: "Выполняется", dot: "bg-cyan-500 animate-pulse" },
  waiting: { tone: "neutral", label: "Ожидает", dot: "bg-slate-400" },
  approval: { tone: "warn", label: "Подтверждение", dot: "bg-amber-500" },
  error: { tone: "danger", label: "Ошибка", dot: "bg-red-500" },
};

export function PlanSteps({ steps, onAction, onEditCommit, onAdd, editable }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<{ title: string; description: string }>({
    title: "",
    description: "",
  });

  function startEdit(s: PlanStep) {
    setEditingId(s.id);
    setDraft({ title: s.title, description: s.description ?? "" });
  }
  function commit(id: string) {
    onEditCommit?.(id, { title: draft.title, description: draft.description });
    setEditingId(null);
  }

  return (
    <div className="flex flex-col gap-2">
      <ol className="flex flex-col gap-2">
        {steps.map((s, i) => {
          const cfg = statusConfig[s.status];
          const isEditing = editingId === s.id;
          return (
            <li
              key={s.id}
              className={clsx(
                "rounded-lg border p-3 bg-white shadow-sm",
                s.status === "active"
                  ? "border-cyan-300 bg-cyan-50/40"
                  : "border-slate-200"
              )}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full border border-slate-300 bg-white text-[11px] text-slate-700">
                  {i + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className={clsx("h-2 w-2 rounded-full", cfg.dot)} />
                    {isEditing ? (
                      <input
                        value={draft.title}
                        onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                        className="flex-1 rounded-md border border-slate-300 bg-white px-2 py-1 text-sm outline-none focus:border-cyan-500"
                        aria-label="Название шага"
                      />
                    ) : (
                      <span className="text-sm font-medium text-slate-900">
                        {s.title}
                      </span>
                    )}
                    <Badge tone={cfg.tone} className="ml-auto">
                      {cfg.label}
                    </Badge>
                  </div>

                  {isEditing ? (
                    <textarea
                      value={draft.description}
                      onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                      placeholder="Описание шага"
                      rows={2}
                      className="mt-2 w-full resize-none rounded-md border border-slate-300 bg-white p-2 text-xs text-slate-800 outline-none focus:border-cyan-500"
                    />
                  ) : (
                    s.description && (
                      <div className="mt-1 text-xs text-slate-600">
                        {s.description}
                      </div>
                    )
                  )}

                  <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                    {s.agent && <span>Агент: {s.agent}</span>}
                    {typeof s.confidence === "number" && (
                      <span>• confidence {Math.round(s.confidence * 100)}%</span>
                    )}
                    {s.expected && <span>• ожидается: {s.expected}</span>}
                    {s.actual && <span>• факт: {s.actual}</span>}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {isEditing ? (
                      <>
                        <Button size="sm" variant="primary" onClick={() => commit(s.id)}>
                          Сохранить
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                          Отмена
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button size="sm" variant="primary" onClick={() => onAction(s.id, "run")}>
                          Run
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => (editable ? startEdit(s) : onAction(s.id, "edit"))}
                        >
                          Edit
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => onAction(s.id, "skip")}>
                          Skip
                        </Button>
                        {editable && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onAction(s.id, "delete")}
                            className="text-red-600 hover:bg-red-50"
                          >
                            Удалить
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ol>

      {editable && onAdd && (
        <Button variant="secondary" size="sm" onClick={onAdd} className="self-start">
          + Добавить шаг
        </Button>
      )}
    </div>
  );
}
