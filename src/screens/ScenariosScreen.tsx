import { useState } from "react";
import { Badge } from "../components/common/Badge";
import { Button } from "../components/common/Button";
import { Card } from "../components/common/Card";
import type { Scenario } from "../types";

interface Props {
  scenarios: Scenario[];
  onCreate: () => void;
  onUpdate: (id: string, patch: Partial<Scenario>) => void;
  onDelete: (id: string) => void;
}

export function ScenariosScreen({ scenarios, onCreate, onUpdate, onDelete }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <div className="flex h-full flex-col gap-3 p-4 overflow-y-auto">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Scenarios</h1>
          <div className="text-xs text-slate-500">
            Повторяющиеся задачи: расписание, триггеры, описание
          </div>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={() => {
            onCreate();
          }}
        >
          + Новый сценарий
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {scenarios.map((s) =>
          editingId === s.id ? (
            <ScenarioEdit
              key={s.id}
              scenario={s}
              onSave={(patch) => {
                onUpdate(s.id, patch);
                setEditingId(null);
              }}
              onCancel={() => setEditingId(null)}
            />
          ) : (
            <Card key={s.id}>
              <div className="flex items-start gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-900">{s.name}</span>
                    <Badge tone={s.enabled ? "success" : "neutral"}>
                      {s.enabled ? "включён" : "выкл"}
                    </Badge>
                  </div>
                  <div className="mt-1 text-xs text-slate-700">{s.description}</div>
                  <div className="mt-2 grid grid-cols-3 gap-2 text-[11px] text-slate-500">
                    <div>
                      <div className="text-slate-400">Триггер</div>
                      <div className="text-slate-700">{s.trigger}</div>
                    </div>
                    <div>
                      <div className="text-slate-400">Шагов</div>
                      <div className="text-slate-700">{s.steps}</div>
                    </div>
                    <div>
                      <div className="text-slate-400">Успех</div>
                      <div className="text-slate-700">{Math.round(s.successRate * 100)}%</div>
                    </div>
                  </div>
                  <div className="mt-1 text-[11px] text-slate-500">
                    Последний запуск: {s.lastRun}
                  </div>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                <Button size="sm" variant="primary">Запустить</Button>
                <Button size="sm" variant="secondary" onClick={() => setEditingId(s.id)}>
                  Редактировать
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onUpdate(s.id, { enabled: !s.enabled })}
                >
                  {s.enabled ? "Выключить" : "Включить"}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onDelete(s.id)}
                  className="text-red-600 hover:bg-red-50"
                >
                  Удалить
                </Button>
              </div>
            </Card>
          )
        )}
        {scenarios.length === 0 && (
          <div className="col-span-2 rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
            Сценариев пока нет. Создайте первый.
          </div>
        )}
      </div>
    </div>
  );
}

function ScenarioEdit({
  scenario,
  onSave,
  onCancel,
}: {
  scenario: Scenario;
  onSave: (patch: Partial<Scenario>) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(scenario.name);
  const [description, setDescription] = useState(scenario.description);
  const [trigger, setTrigger] = useState(scenario.trigger);
  const [steps, setSteps] = useState(scenario.steps);
  const [enabled, setEnabled] = useState(scenario.enabled);

  return (
    <Card>
      <div className="flex flex-col gap-2">
        <Field label="Название">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-8 w-full rounded-md border border-slate-300 bg-white px-2 text-sm outline-none focus:border-cyan-500"
            aria-label="Название сценария"
          />
        </Field>
        <Field label="Описание">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="w-full resize-none rounded-md border border-slate-300 bg-white p-2 text-sm outline-none focus:border-cyan-500"
            aria-label="Описание сценария"
          />
        </Field>
        <div className="grid grid-cols-2 gap-2">
          <Field label="Триггер">
            <input
              value={trigger}
              onChange={(e) => setTrigger(e.target.value)}
              className="h-8 w-full rounded-md border border-slate-300 bg-white px-2 text-sm outline-none focus:border-cyan-500"
              aria-label="Триггер сценария"
            />
          </Field>
          <Field label="Шагов">
            <input
              type="number"
              min={1}
              value={steps}
              onChange={(e) => setSteps(Number(e.target.value) || 1)}
              className="h-8 w-full rounded-md border border-slate-300 bg-white px-2 text-sm outline-none focus:border-cyan-500"
              aria-label="Число шагов"
            />
          </Field>
        </div>
        <label className="flex items-center gap-2 text-xs text-slate-700">
          <input
            type="checkbox"
            className="accent-cyan-600"
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
          />
          Включён
        </label>
        <div className="mt-1 flex gap-1.5">
          <Button
            size="sm"
            variant="primary"
            onClick={() => onSave({ name, description, trigger, steps, enabled })}
          >
            Сохранить
          </Button>
          <Button size="sm" variant="ghost" onClick={onCancel}>
            Отмена
          </Button>
        </div>
      </div>
    </Card>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[10px] uppercase tracking-wider text-slate-500">{label}</span>
      {children}
    </label>
  );
}
