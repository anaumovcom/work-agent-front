import clsx from "clsx";
import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
} from "react";
import { tasks, taskColumns, columnCounts } from "../../mocks/tasks";
import { vdiElements } from "../../mocks/vdiElements";
import type { Point, Zone } from "../../types";

interface Overlays {
  ocr: boolean;
  ui: boolean;
  zones: boolean;
  target: boolean;
  lastActions: boolean;
}

interface ClickRipple {
  id: number;
  x: number;
  y: number;
}

interface Props {
  overlays: Overlays;
  lastClick: Point | null;
  selectedZone: Zone | null;
  focused: boolean;
  onFocus: () => void;
  onBlur: () => void;
  onClick: (p: Point) => void;
  onZoneSelected: (z: Zone) => void;
  onScroll: () => void;
  onKey: (key: string) => void;
}

export function VdiScreen({
  overlays,
  lastClick,
  selectedZone,
  focused,
  onFocus,
  onBlur,
  onClick,
  onZoneSelected,
  onScroll,
  onKey,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [drag, setDrag] = useState<{ start: Point; end: Point } | null>(null);
  const [cursor, setCursor] = useState<Point | null>(null);
  const [ripples, setRipples] = useState<ClickRipple[]>([]);

  function relPoint(e: MouseEvent): Point {
    const r = ref.current!.getBoundingClientRect();
    return {
      x: Math.round(e.clientX - r.left),
      y: Math.round(e.clientY - r.top),
    };
  }

  function handleMouseDown(e: MouseEvent) {
    const p = relPoint(e);
    setDrag({ start: p, end: p });
  }
  function handleMouseMove(e: MouseEvent) {
    setCursor(relPoint(e));
    if (!drag) return;
    setDrag({ start: drag.start, end: relPoint(e) });
  }
  function handleMouseLeave() {
    setCursor(null);
  }
  function handleMouseUp(e: MouseEvent) {
    if (!drag) return;
    const end = relPoint(e);
    const dx = Math.abs(end.x - drag.start.x);
    const dy = Math.abs(end.y - drag.start.y);
    if (dx < 4 && dy < 4) {
      onFocus();
      ref.current?.focus();
      onClick(end);
      const id = Date.now();
      setRipples((r) => [...r, { id, x: end.x, y: end.y }]);
      window.setTimeout(() => {
        setRipples((r) => r.filter((x) => x.id !== id));
      }, 600);
    } else {
      onZoneSelected({
        x: Math.min(drag.start.x, end.x),
        y: Math.min(drag.start.y, end.y),
        w: dx,
        h: dy,
      });
    }
    setDrag(null);
  }

  function handleKey(e: KeyboardEvent<HTMLDivElement>) {
    if (!focused) return;
    if (e.key === "Escape") {
      onBlur();
      ref.current?.blur();
      return;
    }
    if (
      e.key.length === 1 ||
      e.key === "Enter" ||
      e.key === "Backspace" ||
      e.key === "Tab" ||
      e.key === "ArrowUp" ||
      e.key === "ArrowDown" ||
      e.key === "ArrowLeft" ||
      e.key === "ArrowRight"
    ) {
      e.preventDefault();
      onKey(e.key);
    }
  }

  useEffect(() => {
    if (!focused) return;
    ref.current?.focus();
  }, [focused]);

  return (
    <div
      ref={ref}
      tabIndex={0}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseUp={handleMouseUp}
      onScroll={onScroll}
      onKeyDown={handleKey}
      onBlur={onBlur}
      className={clsx(
        "relative h-full w-full overflow-hidden rounded-lg bg-slate-100 text-slate-900 select-none outline-none ring-offset-2 cursor-none",
        focused
          ? "border-2 border-cyan-500 ring-2 ring-cyan-300"
          : "border border-slate-300"
      )}
    >
      {focused && (
        <div className="pointer-events-none absolute right-2 top-2 z-30 rounded-md bg-cyan-600 px-2 py-1 text-[10px] font-medium text-white shadow-md">
          ⌨ Ввод направлен на VDI · Esc для выхода
        </div>
      )}

      {/* Browser top bar */}
      <div className="flex h-9 items-center gap-2 border-b border-slate-300 bg-slate-200 px-3">
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
        </div>
        <div className="flex h-5 items-center gap-1 rounded-md bg-white px-2 text-[10px] text-slate-600 border border-slate-300">
          <span>📄 Трекер задач — Команда GAMES</span>
          <span className="ml-1 text-slate-400">×</span>
        </div>
        <div className="ml-1 text-slate-400">+</div>
      </div>
      <div className="flex h-8 items-center gap-2 border-b border-slate-300 bg-white px-3 text-xs text-slate-500">
        <span>←</span>
        <span>→</span>
        <span>↻</span>
        <div className="flex h-5 flex-1 items-center rounded-md bg-slate-100 px-2 text-[11px] text-slate-700 border border-slate-200">
          tracker.company.local/board/GAMES
        </div>
      </div>

      {/* Filters */}
      <div className="flex h-10 items-center gap-2 border-b border-slate-200 bg-white px-3 text-xs">
        <div className="flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1 text-slate-700 border border-slate-200">
          <span className="text-violet-500">◆</span> GAMES
          <span className="ml-1 text-slate-400">Команда ▾</span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <input
            placeholder="Поиск задач"
            aria-label="Поиск задач (mock)"
            readOnly
            className="h-7 w-44 rounded-md border border-slate-200 bg-slate-50 px-2 text-[11px] text-slate-700 outline-none cursor-none"
            onMouseDown={(e) => e.stopPropagation()}
          />
          <SelectChip label="Исполнитель: Все" />
          <SelectChip label="Статус: Все" />
          <SelectChip label="Эпик: Все" />
          <button className="h-7 rounded-md bg-blue-600 px-3 text-[11px] font-medium text-white">
            Создать задачу
          </button>
        </div>
      </div>

      {/* Kanban */}
      <div className="flex flex-1 gap-3 overflow-x-auto p-3 vdi-kanban">
        {taskColumns.map((col) => (
          <div
            key={col}
            className="flex w-56 shrink-0 flex-col rounded-md bg-slate-100 border border-slate-200"
          >
            <div className="flex items-center justify-between px-2.5 py-2 text-xs font-semibold text-slate-700">
              <span>{col}</span>
              <span className="text-slate-400">{columnCounts[col]}</span>
            </div>
            <div className="flex flex-col gap-2 p-2 overflow-y-auto">
              {tasks
                .filter((t) => t.status === col)
                .map((t) => (
                  <div
                    key={t.id}
                    className={clsx(
                      "rounded-md border bg-white p-2 text-[11px] shadow-sm",
                      t.id === "GAMES-1234"
                        ? "border-cyan-400 ring-2 ring-cyan-300"
                        : "border-slate-200"
                    )}
                  >
                    <div className="flex items-center justify-between text-[10px] text-slate-500">
                      <span>{t.id}</span>
                      <span>⋮</span>
                    </div>
                    <div className="mt-1 text-slate-800 leading-snug">
                      {t.title}
                    </div>
                    <div
                      className={clsx(
                        "mt-2 inline-block rounded px-1.5 py-0.5 text-[10px]",
                        t.epic
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-red-100 text-red-700"
                      )}
                    >
                      {t.epic ?? "Без эпика"}
                    </div>
                    <div className="mt-2 flex items-center gap-1 text-[10px] text-slate-500">
                      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-slate-200 text-slate-700">
                        {t.assignee[0]}
                      </span>
                      <span>{t.assignee}</span>
                    </div>
                  </div>
                ))}
              <button className="rounded-md py-1.5 text-[11px] text-slate-500 hover:bg-slate-200">
                + Добавить задачу
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Overlays */}
      {overlays.zones &&
        vdiElements
          .filter((e) => e.kind === "zone")
          .map((e) => (
            <div
              key={e.id}
              className="pointer-events-none absolute border-2 border-violet-400/60 bg-violet-400/10"
              style={{
                left: `${e.bbox.x}%`,
                top: `${e.bbox.y}%`,
                width: `${e.bbox.w}%`,
                height: `${e.bbox.h}%`,
              }}
            >
              <span className="absolute left-1 top-1 rounded bg-violet-500 px-1 py-0.5 text-[9px] text-white">
                {e.label}
              </span>
            </div>
          ))}

      {overlays.ui &&
        vdiElements
          .filter((e) => e.kind === "element")
          .map((e) => (
            <div
              key={e.id}
              className="pointer-events-none absolute border border-cyan-500 bg-cyan-400/10"
              style={{
                left: `${e.bbox.x}%`,
                top: `${e.bbox.y}%`,
                width: `${e.bbox.w}%`,
                height: `${e.bbox.h}%`,
              }}
            >
              <span className="absolute -top-4 left-0 rounded bg-cyan-600 px-1 text-[9px] text-white">
                {e.label}
              </span>
            </div>
          ))}

      {overlays.ocr && (
        <div className="pointer-events-none absolute inset-0">
          {[12, 25, 38, 52, 66].map((y) => (
            <div
              key={y}
              className="absolute h-2 w-24 rounded bg-amber-400/30 border border-amber-400/60"
              style={{ left: `${24 + (y % 7)}%`, top: `${y}%` }}
            />
          ))}
        </div>
      )}

      {overlays.target && (
        <div
          className="pointer-events-none absolute h-12 w-12 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-emerald-500 animate-pulse"
          style={{ left: "30%", top: "30%" }}
        >
          <span className="absolute left-full ml-2 whitespace-nowrap rounded bg-emerald-600 px-1.5 py-0.5 text-[10px] text-white">
            Цель агента: GAMES-1234
          </span>
        </div>
      )}

      {overlays.lastActions && lastClick && (
        <div
          className="pointer-events-none absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-500 ring-4 ring-red-500/30"
          style={{ left: lastClick.x, top: lastClick.y }}
        />
      )}

      {selectedZone && (
        <div
          className="pointer-events-none absolute border-2 border-cyan-500 bg-cyan-400/15"
          style={{
            left: selectedZone.x,
            top: selectedZone.y,
            width: selectedZone.w,
            height: selectedZone.h,
          }}
        >
          <span className="absolute -top-5 left-0 rounded bg-cyan-600 px-1 text-[10px] text-white">
            Temporary zone
          </span>
        </div>
      )}

      {drag && (
        <div
          className="pointer-events-none absolute border border-dashed border-cyan-600 bg-cyan-400/10"
          style={{
            left: Math.min(drag.start.x, drag.end.x),
            top: Math.min(drag.start.y, drag.end.y),
            width: Math.abs(drag.end.x - drag.start.x),
            height: Math.abs(drag.end.y - drag.start.y),
          }}
        />
      )}

      {/* Ripples — click animation */}
      {ripples.map((r) => (
        <span
          key={r.id}
          className="pointer-events-none absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-500/40 vdi-ripple"
          style={{ left: r.x, top: r.y }}
        />
      ))}

      {/* Custom cursor */}
      {cursor && (
        <svg
          className="pointer-events-none absolute z-20"
          width="20"
          height="20"
          viewBox="0 0 20 20"
          style={{ left: cursor.x, top: cursor.y }}
        >
          <path
            d="M2 2 L2 16 L6 12 L9 18 L11 17 L8 11 L14 11 Z"
            fill="black"
            stroke="white"
            strokeWidth="1.2"
          />
        </svg>
      )}
    </div>
  );
}

function SelectChip({ label }: { label: string }) {
  return (
    <button className="h-7 rounded-md border border-slate-200 bg-white px-2 text-[11px] text-slate-700">
      {label} ▾
    </button>
  );
}
