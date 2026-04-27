import { useEffect, useRef, useState } from "react";

const MIN = 320;
const MAX = 720;
const COLLAPSED = 40;
const DEFAULT = 420;

export function useRightPanel(screenKey: string) {
  const storageKey = `rightPanelWidth.${screenKey}`;
  const [width, setWidth] = useState<number>(() => {
    if (typeof window === "undefined") return DEFAULT;
    const raw = window.localStorage.getItem(storageKey);
    const n = raw ? Number(raw) : NaN;
    return Number.isFinite(n) && n > 0 ? n : DEFAULT;
  });

  useEffect(() => {
    const raw = window.localStorage.getItem(storageKey);
    const n = raw ? Number(raw) : NaN;
    setWidth(Number.isFinite(n) && n > 0 ? n : DEFAULT);
  }, [storageKey]);

  function persist(w: number) {
    window.localStorage.setItem(storageKey, String(w));
  }

  const collapsed = width <= COLLAPSED + 1;

  function setAndPersist(w: number) {
    const clamped = Math.max(MIN, Math.min(MAX, w));
    setWidth(clamped);
    persist(clamped);
  }

  function toggleCollapse() {
    if (collapsed) {
      const restored = DEFAULT;
      setWidth(restored);
      persist(restored);
    } else {
      setWidth(COLLAPSED);
      persist(COLLAPSED);
    }
  }

  return { width, collapsed, setWidth: setAndPersist, toggleCollapse };
}

interface ResizerProps {
  onResize: (newWidth: number) => void;
  containerRef: React.RefObject<HTMLElement>;
}

export function Resizer({ onResize, containerRef }: ResizerProps) {
  const draggingRef = useRef(false);

  useEffect(() => {
    function onMove(e: MouseEvent) {
      if (!draggingRef.current || !containerRef.current) return;
      const parentRect = containerRef.current.parentElement!.getBoundingClientRect();
      const newWidth = parentRect.right - e.clientX;
      onResize(newWidth);
    }
    function onUp() {
      if (draggingRef.current) {
        draggingRef.current = false;
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      }
    }
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [onResize, containerRef]);

  return (
    <div
      onMouseDown={() => {
        draggingRef.current = true;
        document.body.style.cursor = "col-resize";
        document.body.style.userSelect = "none";
      }}
      className="group absolute left-0 top-0 z-10 h-full w-1.5 -translate-x-1/2 cursor-col-resize"
      title="Перетащите, чтобы изменить ширину"
    >
      <div className="h-full w-px bg-slate-200 group-hover:bg-cyan-500 transition-colors" />
    </div>
  );
}

export const RIGHT_PANEL_LIMITS = { MIN, MAX, COLLAPSED, DEFAULT };
