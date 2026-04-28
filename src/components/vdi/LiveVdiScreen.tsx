import clsx from "clsx";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type WheelEvent,
} from "react";

import { vdiApi, type VdiFrameDto } from "../../api/vdiApi";
import {
  fitFrameIntoRect,
  getDisplayedRect,
  mapClientPointToVdiCoords,
  mapDragRectToVdiBBox,
} from "../../utils/coordinateMapper";

interface Overlays {
  ocr: boolean;
  ui: boolean;
  zones: boolean;
  target: boolean;
  lastActions: boolean;
}

interface Props {
  overlays: Overlays;
  focused: boolean;
  onFocus: () => void;
  onBlur: () => void;
  /** Колбэк после успешного клика — даёт VDI-координату для отрисовки overlay. */
  onAction?: (info: { kind: string; vdi?: { x: number; y: number } }) => void;
  /** Заблокировать ввод (emergency stop / esp32 offline / stale block). */
  blockInput: boolean;
  blockReason?: string;
  /** Предупреждение о устаревшем кадре (без блокировки). */
  staleWarning?: string | null;
  /** Текущий кадр и колбэк его обновления — данные приходят сверху. */
  frame: VdiFrameDto | null;
  loading: boolean;
  error: string | null;
  autoRefresh: boolean;
  onAutoRefreshChange: (v: boolean) => void;
  refreshIntervalMs: number;
  onRefreshIntervalChange: (ms: number) => void;
  onManualRefresh: () => void;
}

interface ClickRipple {
  id: number;
  clientX: number;
  clientY: number;
}

const HOVER_MOVE_INTERVAL_MS = 40;

const INTERVAL_OPTIONS: { label: string; ms: number }[] = [
  { label: "0.5 c", ms: 500 },
  { label: "1 c", ms: 1000 },
  { label: "2 c", ms: 2000 },
  { label: "5 c", ms: 5000 },
];

type MouseButtonName = "left" | "right" | "middle";

export function LiveVdiScreen(props: Props) {
  const {
    overlays,
    focused,
    onFocus,
    onBlur,
    onAction,
    blockInput,
    blockReason,
    staleWarning,
    frame,
    loading,
    error,
    autoRefresh,
    onAutoRefreshChange,
    refreshIntervalMs,
    onRefreshIntervalChange,
    onManualRefresh,
  } = props;

  const containerRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const dragRef = useRef<{
    startClient: { x: number; y: number };
    startVdi: { x: number; y: number };
    button: MouseButtonName;
    dragging: boolean;
  } | null>(null);
  const hoverMoveTimerRef = useRef<number | null>(null);
  const hoverMovePendingRef = useRef<{ x: number; y: number } | null>(null);
  const hoverMoveInFlightRef = useRef(false);
  const lastHoverMoveRef = useRef<{ x: number; y: number } | null>(null);
  const [dragRect, setDragRect] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const [ripples, setRipples] = useState<ClickRipple[]>([]);
  const [imgError, setImgError] = useState(false);
  const [viewportRect, setViewportRect] = useState({ left: 0, top: 0, width: 0, height: 0 });

  const resolution = frame?.resolution ?? { width: 1920, height: 1080 };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateViewport = () => {
      const rect = container.getBoundingClientRect();
      setViewportRect(fitFrameIntoRect({ left: 0, top: 0, width: rect.width, height: rect.height }, resolution));
    };

    updateViewport();
    const observer = new ResizeObserver(updateViewport);
    observer.observe(container);
    return () => observer.disconnect();
  }, [resolution.height, resolution.width]);

  useEffect(() => {
    setImgError(false);
  }, [frame?.frameId]);

  useEffect(() => {
    return () => {
      if (hoverMoveTimerRef.current !== null) {
        window.clearTimeout(hoverMoveTimerRef.current);
      }
    };
  }, []);

  function spawnRipple(clientX: number, clientY: number) {
    const id = Date.now() + Math.random();
    setRipples((rs) => [...rs, { id, clientX, clientY }]);
    window.setTimeout(() => setRipples((rs) => rs.filter((r) => r.id !== id)), 600);
  }

  const cancelScheduledMove = useCallback(() => {
    if (hoverMoveTimerRef.current !== null) {
      window.clearTimeout(hoverMoveTimerRef.current);
      hoverMoveTimerRef.current = null;
    }
    hoverMovePendingRef.current = null;
  }, []);

  const guard = useCallback(
    (kind: string): boolean => {
      if (blockInput) {
        console.warn("[VDI] blocked:", blockReason);
        return false;
      }
      if (!imgRef.current || !frame) {
        console.warn("[VDI] no frame yet");
        return false;
      }
      void kind;
      return true;
    },
    [blockInput, blockReason, frame],
  );

  const flushHoverMove = useCallback(() => {
    if (hoverMoveInFlightRef.current) return;
    const next = hoverMovePendingRef.current;
    if (!next) return;
    hoverMovePendingRef.current = null;
    hoverMoveInFlightRef.current = true;
    void vdiApi.move(next.x, next.y, "user").catch((err) => {
      console.error("move failed", err);
    }).finally(() => {
      hoverMoveInFlightRef.current = false;
      lastHoverMoveRef.current = next;
      if (hoverMovePendingRef.current) {
        flushHoverMove();
      }
    });
  }, []);

  const scheduleHoverMove = useCallback((point: { x: number; y: number }) => {
    const last = lastHoverMoveRef.current;
    if (last && last.x === point.x && last.y === point.y && !hoverMovePendingRef.current) {
      return;
    }
    hoverMovePendingRef.current = point;
    if (hoverMoveTimerRef.current !== null) return;
    hoverMoveTimerRef.current = window.setTimeout(() => {
      hoverMoveTimerRef.current = null;
      flushHoverMove();
    }, HOVER_MOVE_INTERVAL_MS);
  }, [flushHoverMove]);

  const handleMouseDown = useCallback(
    (e: ReactMouseEvent<HTMLDivElement>) => {
      if (!guard("down")) return;
      if (!imgRef.current) return;
      const vdi = mapClientPointToVdiCoords(e.clientX, e.clientY, imgRef.current, resolution);
      if (!vdi) return;
      const button: MouseButtonName = e.button === 2 ? "right" : e.button === 1 ? "middle" : "left";
      dragRef.current = { startClient: { x: e.clientX, y: e.clientY }, startVdi: vdi, button, dragging: false };
      setDragRect(null);
      onFocus();
      containerRef.current?.focus();
      lastHoverMoveRef.current = vdi;
      cancelScheduledMove();
    },
    [cancelScheduledMove, guard, onFocus, resolution],
  );

  const handleMouseMove = useCallback(
    (e: ReactMouseEvent<HTMLDivElement>) => {
      if (!imgRef.current) return;
      const d = dragRef.current;
      if (!d) {
        if (blockInput || !frame) return;
        const vdi = mapClientPointToVdiCoords(e.clientX, e.clientY, imgRef.current, resolution);
        if (!vdi) return;
        scheduleHoverMove(vdi);
        return;
      }
      const r = getDisplayedRect(imgRef.current, resolution);
      const x1 = Math.min(d.startClient.x, e.clientX) - r.left;
      const y1 = Math.min(d.startClient.y, e.clientY) - r.top;
      const w = Math.abs(e.clientX - d.startClient.x);
      const h = Math.abs(e.clientY - d.startClient.y);
      if (w <= 4 && h <= 4) {
        return;
      }
      if (!d.dragging) {
        d.dragging = true;
        cancelScheduledMove();
        void vdiApi.mouseDown(d.startVdi.x, d.startVdi.y, d.button, "user").catch((err) => {
          console.error("mouse down failed", err);
        });
      }
      const vdi = mapClientPointToVdiCoords(e.clientX, e.clientY, imgRef.current, resolution);
      if (vdi) {
        scheduleHoverMove(vdi);
      }
      setDragRect({ x: x1, y: y1, w, h });
    },
    [blockInput, cancelScheduledMove, frame, resolution, scheduleHoverMove],
  );

  const handleMouseUp = useCallback(
    async (e: ReactMouseEvent<HTMLDivElement>) => {
      const d = dragRef.current;
      dragRef.current = null;
      if (!d || !imgRef.current) {
        setDragRect(null);
        return;
      }
      const dx = Math.abs(e.clientX - d.startClient.x);
      const dy = Math.abs(e.clientY - d.startClient.y);

      // ensure focus
      onFocus();
      containerRef.current?.focus();

      if (!guard("up")) {
        setDragRect(null);
        return;
      }

      cancelScheduledMove();
      const vdi = mapClientPointToVdiCoords(e.clientX, e.clientY, imgRef.current, resolution) ?? d.startVdi;
      if (dx < 4 && dy < 4) {
        spawnRipple(e.clientX, e.clientY);
        try {
          await vdiApi.click(vdi.x, vdi.y, d.button, "user");
        } catch (err) {
          console.error("click failed", err);
        }
        onAction?.({ kind: "click", vdi });
      } else {
        if (d.dragging) {
          try {
            await vdiApi.move(vdi.x, vdi.y, "user");
            await vdiApi.mouseUp(vdi.x, vdi.y, d.button, "user");
          } catch (err) {
            console.error("mouse up failed", err);
          }
        }
        onAction?.({ kind: "drag", vdi });
      }
      setDragRect(null);
    },
    [cancelScheduledMove, guard, onAction, onFocus, resolution],
  );

  const handleMouseLeave = useCallback(() => {
    const d = dragRef.current;
    if (!d) return;
    dragRef.current = null;
    cancelScheduledMove();
    if (d.dragging) {
      const vdi = lastHoverMoveRef.current ?? d.startVdi;
      void vdiApi.mouseUp(vdi.x, vdi.y, d.button, "user").catch((err) => {
        console.error("mouse leave release failed", err);
      });
    }
    setDragRect(null);
  }, [cancelScheduledMove]);

  const handleDoubleClick = useCallback(
    async (e: ReactMouseEvent<HTMLDivElement>) => {
      if (!guard("dblclick")) return;
      if (!imgRef.current) return;
      const vdi = mapClientPointToVdiCoords(e.clientX, e.clientY, imgRef.current, resolution);
      if (!vdi) return;
      spawnRipple(e.clientX, e.clientY);
      try {
        await vdiApi.doubleClick(vdi.x, vdi.y, "user");
      } catch (err) {
        console.error("dblclick failed", err);
      }
      onAction?.({ kind: "dblclick", vdi });
    },
    [guard, onAction, resolution],
  );

  const handleContextMenu = useCallback((e: ReactMouseEvent<HTMLDivElement>) => {
    e.preventDefault();
  }, []);

  const handleWheel = useCallback(
    async (e: WheelEvent<HTMLDivElement>) => {
      if (!guard("scroll")) return;
      if (!imgRef.current) return;
      const vdi = mapClientPointToVdiCoords(e.clientX, e.clientY, imgRef.current, resolution);
      if (!vdi) return;
      try {
        await vdiApi.scroll(vdi.x, vdi.y, e.deltaX, -e.deltaY, "user");
      } catch (err) {
        console.error("scroll failed", err);
      }
      onAction?.({ kind: "scroll" });
    },
    [guard, onAction, resolution],
  );

  const handleKey = useCallback(
    async (e: KeyboardEvent<HTMLDivElement>) => {
      if (!focused) return;
      if (e.key === "Escape") {
        onBlur();
        containerRef.current?.blur();
        return;
      }
      if (blockInput) {
        console.warn("[VDI] keyboard blocked:", blockReason);
        return;
      }
      if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        try {
          await vdiApi.type(e.key, "user");
        } catch (err) {
          console.error("type failed", err);
        }
        onAction?.({ kind: "type" });
        return;
      }
      const named = ["Enter", "Backspace", "Tab", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Delete", "Home", "End", "PageUp", "PageDown"];
      if (named.includes(e.key)) {
        e.preventDefault();
        try {
          await vdiApi.key(e.key, "user");
        } catch (err) {
          console.error("key failed", err);
        }
        onAction?.({ kind: "key" });
        return;
      }
      if (e.ctrlKey || e.metaKey || e.altKey) {
        e.preventDefault();
        const keys = [
          ...(e.ctrlKey || e.metaKey ? ["CTRL"] : []),
          ...(e.altKey ? ["ALT"] : []),
          ...(e.shiftKey ? ["SHIFT"] : []),
          e.key.toUpperCase(),
        ];
        try {
          await vdiApi.hotkey(keys, "user");
        } catch (err) {
          console.error("hotkey failed", err);
        }
        onAction?.({ kind: "hotkey" });
      }
    },
    [blockInput, blockReason, focused, onAction, onBlur],
  );

  useEffect(() => {
    if (focused) containerRef.current?.focus();
  }, [focused]);

  const imgSrc = useMemo(() => {
    if (!frame || !frame.frameId || frame.status === "error") return null;
    return frame.imageUrl
      ? (frame.imageUrl.startsWith("http") ? frame.imageUrl : vdiApi.frameImageUrl(frame.frameId))
      : vdiApi.frameImageUrl(frame.frameId);
  }, [frame]);

  return (
    <div className="flex h-full flex-col gap-2">
      {/* top toolbar */}
      <div className="flex flex-wrap items-center gap-3 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs shadow-sm">
        <div className="flex items-center gap-1">
          <label className="flex cursor-pointer items-center gap-1">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => onAutoRefreshChange(e.target.checked)}
            />
            Авто
          </label>
          <select
            className="rounded border border-slate-200 bg-white px-1 py-0.5 text-[11px]"
            value={refreshIntervalMs}
            onChange={(e) => onRefreshIntervalChange(Number(e.target.value))}
            title="Интервал автообновления"
            aria-label="Интервал автообновления"
          >
            {INTERVAL_OPTIONS.map((o) => (
              <option key={o.ms} value={o.ms}>{o.label}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={onManualRefresh}
            className="rounded border border-slate-200 bg-slate-50 px-2 py-0.5 hover:bg-slate-100"
          >
            ↻ Обновить
          </button>
        </div>
        <div className="ml-auto flex items-center gap-3 text-[11px] text-slate-500">
          {frame && (
            <>
              <span>src: <b>{frame.source}</b></span>
              <span>{frame.resolution.width}×{frame.resolution.height}</span>
              <span className="tabular-nums">{frame.latencyMs} ms</span>
              <span className="font-mono text-[10px] text-slate-400">{frame.frameId}</span>
            </>
          )}
        </div>
      </div>

      {/* warnings */}
      {staleWarning && !blockInput && (
        <div className="rounded-md border border-amber-300 bg-amber-50 px-3 py-1.5 text-[11px] text-amber-800">
          ⚠ {staleWarning}
        </div>
      )}
      {blockInput && (
        <div className="rounded-md border border-red-300 bg-red-50 px-3 py-1.5 text-[11px] text-red-800">
          ⛔ Ввод заблокирован: {blockReason}
        </div>
      )}

      {/* screen */}
      <div
        ref={containerRef}
        tabIndex={0}
        onKeyDown={handleKey}
        onBlur={onBlur}
        className={clsx(
          "relative flex-1 min-h-0 overflow-hidden rounded-lg bg-slate-900 text-slate-100 outline-none",
          focused ? "border-2 border-cyan-500 ring-2 ring-cyan-300" : "border border-slate-300",
          blockInput && "cursor-not-allowed",
        )}
      >
        {focused && (
          <div className="pointer-events-none absolute right-2 top-2 z-30 rounded-md bg-cyan-600 px-2 py-1 text-[10px] font-medium text-white shadow-md">
            ⌨ Ввод направлен на VDI · Esc для выхода
          </div>
        )}
        {loading && !frame && (
          <div className="absolute inset-0 grid place-items-center text-xs text-slate-400 animate-pulse">
            Загрузка кадра…
          </div>
        )}
        {(error || imgError || frame?.status === "error" || !imgSrc) && !loading && (
          <div className="absolute inset-0 grid place-items-center text-center text-sm text-red-300">
            <div>
              <div className="font-semibold">Кадр недоступен</div>
              <div className="mt-1 text-xs text-red-200/80">{error ?? "нет соединения с источником"}</div>
              <button
                onClick={onManualRefresh}
                className="mt-2 rounded border border-red-300/50 bg-red-500/20 px-3 py-1 text-xs text-white hover:bg-red-500/30"
              >
                Попробовать снова
              </button>
            </div>
          </div>
        )}
        <div
          ref={viewportRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onDoubleClick={handleDoubleClick}
          onContextMenu={handleContextMenu}
          onWheel={handleWheel}
          className="absolute overflow-hidden select-none"
          style={{
            left: viewportRect.left,
            top: viewportRect.top,
            width: viewportRect.width,
            height: viewportRect.height,
          }}
        >
          {imgSrc && (
            <img
              ref={imgRef}
              src={imgSrc}
              alt="VDI frame"
              draggable={false}
              onError={() => setImgError(true)}
              className="h-full w-full object-fill"
            />
          )}

          {/* overlays — пока остаются как заглушки (этап 3 это про физический контур) */}
          {overlays.target && (
            <div
              className="pointer-events-none absolute h-12 w-12 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-emerald-500 animate-pulse"
              style={{ left: "30%", top: "30%" }}
            />
          )}

          {/* drag rect */}
          {dragRect && (
            <div
              className="pointer-events-none absolute border border-dashed border-cyan-300 bg-cyan-300/10"
              style={{ left: dragRect.x, top: dragRect.y, width: dragRect.w, height: dragRect.h }}
            />
          )}

          {/* ripples */}
          {ripples.map((r) => {
            const rect = viewportRef.current?.getBoundingClientRect();
            const left = rect ? r.clientX - rect.left : r.clientX;
            const top = rect ? r.clientY - rect.top : r.clientY;
            return (
              <span
                key={r.id}
                className="pointer-events-none absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-400/60 vdi-ripple"
                style={{ left, top }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
