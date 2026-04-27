import { useState } from "react";
import { Badge } from "../components/common/Badge";
import { Card } from "../components/common/Card";
import { Tabs, type TabItem } from "../components/common/Tabs";
import type { HistoryEvent } from "../types";

type Filter = "all" | "user" | "agent" | "system" | "vdi";

const tabs: TabItem<Filter>[] = [
  { key: "all", label: "Все" },
  { key: "user", label: "Пользователь" },
  { key: "agent", label: "Агенты" },
  { key: "vdi", label: "VDI" },
  { key: "system", label: "Система" },
];

interface Props {
  history: HistoryEvent[];
}

export function HistoryScreen({ history }: Props) {
  const [tab, setTab] = useState<Filter>("all");
  const [query, setQuery] = useState("");

  const filtered = history.filter((h) => {
    if (tab !== "all" && h.actor !== tab) return false;
    if (query && !h.summary.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="flex h-full flex-col gap-3 p-4">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">History</h1>
        <div className="text-xs text-slate-500">
          Лента событий: пользователь, агенты, VDI, система
        </div>
      </div>

      <div className="flex gap-2 items-center">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Поиск по событиям…"
          aria-label="Поиск событий"
          className="h-8 w-64 rounded-md border border-slate-300 bg-white px-2.5 text-sm outline-none focus:border-cyan-500"
        />
        <Tabs
          items={tabs.map((t) => ({
            ...t,
            count:
              t.key === "all"
                ? history.length
                : history.filter((h) => h.actor === t.key).length,
          }))}
          active={tab}
          onChange={setTab}
          size="sm"
        />
      </div>

      <Card padded={false} className="flex-1 overflow-y-auto">
        <ul className="flex flex-col">
          {filtered.map((h) => (
            <li
              key={h.id}
              className="flex items-start gap-3 border-b border-slate-100 px-3 py-2 last:border-0 hover:bg-slate-50"
            >
              <span className="w-20 text-[11px] tabular-nums text-slate-500">
                {h.time}
              </span>
              <Badge
                tone={
                  h.actor === "agent"
                    ? "violet"
                    : h.actor === "user"
                    ? "info"
                    : h.actor === "vdi"
                    ? "warn"
                    : "neutral"
                }
              >
                {h.actor}
              </Badge>
              <span className="text-[11px] uppercase tracking-wider text-slate-500 w-24">
                {h.type}
              </span>
              <span className="text-sm text-slate-800 flex-1">{h.summary}</span>
              {h.status === "error" && <Badge tone="danger">error</Badge>}
            </li>
          ))}
          {filtered.length === 0 && (
            <li className="p-6 text-center text-sm text-slate-500">События не найдены</li>
          )}
        </ul>
      </Card>
    </div>
  );
}
