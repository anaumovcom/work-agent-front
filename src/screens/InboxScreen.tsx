import { Badge } from "../components/common/Badge";
import { Button } from "../components/common/Button";
import { Card } from "../components/common/Card";
import { Tabs, type TabItem } from "../components/common/Tabs";
import { inboxItems } from "../mocks/inbox";
import type { InboxItem } from "../types";
import { useState } from "react";

type Group = InboxItem["group"] | "all";

const groups: TabItem<Group>[] = [
  { key: "all", label: "Все" },
  { key: "approval", label: "Approvals" },
  { key: "messages", label: "Сообщения" },
  { key: "tasks", label: "Задачи" },
  { key: "meetings", label: "Встречи" },
  { key: "errors", label: "Ошибки" },
  { key: "reminders", label: "Напоминания" },
];

const priorityTone = {
  low: "neutral",
  med: "info",
  high: "danger",
} as const;

export function InboxScreen() {
  const [tab, setTab] = useState<Group>("all");
  const filtered = tab === "all" ? inboxItems : inboxItems.filter((i) => i.group === tab);

  return (
    <div className="flex h-full flex-col gap-3 p-4">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Agent Inbox</h1>
        <div className="text-xs text-slate-500">Очередь внимания: всё, что требует решения</div>
      </div>
      <Tabs
        items={groups.map((g) => ({
          ...g,
          count:
            g.key === "all"
              ? inboxItems.length
              : inboxItems.filter((i) => i.group === g.key).length,
        }))}
        active={tab}
        onChange={setTab}
      />

      <div className="grid grid-cols-2 gap-3 overflow-y-auto">
        {filtered.map((it) => (
          <Card key={it.id}>
            <div className="flex items-start gap-2">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-slate-900">{it.title}</span>
                  <Badge tone={priorityTone[it.priority]}>{it.priority}</Badge>
                </div>
                <div className="mt-0.5 text-[11px] text-slate-500">
                  {it.source}
                  {it.related ? ` • ${it.related}` : ""}
                </div>
                <div className="mt-2 text-sm text-slate-700">{it.summary}</div>
              </div>
            </div>
            <div className="mt-3 flex gap-1.5">
              <Button size="sm" variant="primary">Открыть</Button>
              <Button size="sm" variant="secondary">Назначить</Button>
              <Button size="sm" variant="ghost">Отложить</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
