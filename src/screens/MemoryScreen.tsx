import { useEffect, useMemo, useState } from "react";
import { Badge } from "../components/common/Badge";
import { Card } from "../components/common/Card";
import { Tabs, type TabItem } from "../components/common/Tabs";
import { memoryApi, type MemoryItemDto } from "../api/memoryApi";
import { memoryOverview } from "../mocks/memory";
import type { MemoryEntity } from "../types";

type Tab = "all" | MemoryEntity["kind"];

const tabs: TabItem<Tab>[] = [
  { key: "all", label: "Все" },
  { key: "task", label: "Задачи" },
  { key: "epic", label: "Эпики" },
  { key: "person", label: "Люди" },
  { key: "project", label: "Проекты" },
  { key: "decision", label: "Решения" },
  { key: "message", label: "Сообщения" },
];

const KIND_FROM_TYPE: Record<string, MemoryEntity["kind"]> = {
  task: "task",
  epic: "epic",
  person: "person",
  project: "project",
  decision: "decision",
  message: "message",
  preference: "decision",
};

function dtoToEntity(dto: MemoryItemDto): MemoryEntity | null {
  const kind = KIND_FROM_TYPE[dto.type];
  if (!kind) return null;
  return {
    id: dto.id,
    kind,
    title: dto.title,
    meta: dto.meta ?? undefined,
    summary: dto.summary ?? dto.content ?? undefined,
  };
}

export function MemoryScreen() {
  const [tab, setTab] = useState<Tab>("all");
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<MemoryEntity[]>([]);
  const [searchHits, setSearchHits] = useState<MemoryItemDto[] | null>(null);

  useEffect(() => {
    memoryApi
      .list()
      .then((dtos) =>
        setItems(dtos.map(dtoToEntity).filter((x): x is MemoryEntity => x !== null))
      )
      .catch(() => setItems([]));
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setSearchHits(null);
      return;
    }
    const t = setTimeout(() => {
      memoryApi
        .search(query.trim())
        .then(setSearchHits)
        .catch(() => setSearchHits([]));
    }, 250);
    return () => clearTimeout(t);
  }, [query]);

  const filtered = useMemo(
    () => items.filter((x) => tab === "all" || x.kind === tab),
    [items, tab]
  );

  return (
    <div className="flex h-full flex-col gap-3 p-4">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Memory</h1>
        <div className="text-xs text-slate-500">
          Долгосрочная память: задачи, люди, эпики, решения
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2">
        <Card padded><div className="text-[11px] text-slate-500">Задачи</div><div className="text-lg font-semibold">{memoryOverview.tasks}</div></Card>
        <Card padded><div className="text-[11px] text-slate-500">Эпики</div><div className="text-lg font-semibold">{memoryOverview.epics}</div></Card>
        <Card padded><div className="text-[11px] text-slate-500">Люди</div><div className="text-lg font-semibold">{memoryOverview.people}</div></Card>
        <Card padded><div className="text-[11px] text-slate-500">Решения</div><div className="text-lg font-semibold">{memoryOverview.decisions}</div></Card>
      </div>

      <div className="flex items-center gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Поиск по памяти…"
          aria-label="Поиск по памяти"
          className="h-8 w-72 rounded-md border border-slate-300 bg-white px-2.5 text-sm outline-none focus:border-cyan-500"
        />
        <Tabs items={tabs} active={tab} onChange={setTab} size="sm" />
      </div>

      {searchHits ? (
        <Card padded={false} className="flex-1 overflow-y-auto">
          <ul className="flex flex-col">
            {searchHits.length === 0 && (
              <li className="px-3 py-4 text-sm text-slate-500">Ничего не найдено</li>
            )}
            {searchHits.map((h) => (
              <li
                key={h.id}
                className="flex flex-col gap-1 border-b border-slate-100 px-3 py-2 last:border-0"
              >
                <div className="flex items-center gap-2">
                  <Badge tone="info">{h.type}</Badge>
                  <span className="text-sm font-medium">{h.title}</span>
                  {h.confidence != null && (
                    <span className="text-[11px] text-slate-500">
                      {Math.round(h.confidence * 100)}%
                    </span>
                  )}
                </div>
                {(h.summary || h.content) && (
                  <div className="text-xs text-slate-600">{h.summary ?? h.content}</div>
                )}
                {h.source && (
                  <div className="text-[11px] text-slate-500">{h.source}</div>
                )}
              </li>
            ))}
          </ul>
        </Card>
      ) : (
        <Card padded={false} className="flex-1 overflow-y-auto">
          <ul className="flex flex-col">
            {filtered.map((e) => (
              <li
                key={e.id}
                className="flex flex-col gap-1 border-b border-slate-100 px-3 py-2 last:border-0"
              >
                <div className="flex items-center gap-2">
                  <Badge tone="neutral">{e.kind}</Badge>
                  <span className="text-sm font-medium">{e.title}</span>
                </div>
                {e.meta && <div className="text-[11px] text-slate-500">{e.meta}</div>}
                {e.summary && <div className="text-xs text-slate-600">{e.summary}</div>}
              </li>
            ))}
            {filtered.length === 0 && (
              <li className="px-3 py-4 text-sm text-slate-500">Нет записей</li>
            )}
          </ul>
        </Card>
      )}
    </div>
  );
}
