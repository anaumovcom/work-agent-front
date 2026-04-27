import clsx from "clsx";

interface Overlays {
  ocr: boolean;
  ui: boolean;
  zones: boolean;
  target: boolean;
  lastActions: boolean;
}

interface Props {
  value: Overlays;
  onChange: (next: Overlays) => void;
}

const items: { key: keyof Overlays; label: string }[] = [
  { key: "ocr", label: "OCR" },
  { key: "ui", label: "Элементы UI" },
  { key: "zones", label: "Зоны" },
  { key: "target", label: "Цель агента" },
  { key: "lastActions", label: "Последние действия" },
];

export function OverlayToggles({ value, onChange }: Props) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="text-slate-500">Оверлеи:</span>
      {items.map((it) => {
        const active = value[it.key];
        return (
          <label
            key={it.key}
            className={clsx(
              "flex cursor-pointer items-center gap-1.5 rounded-md border px-2 py-1 transition-colors",
              active
                ? "border-cyan-300 bg-cyan-50 text-cyan-700"
                : "border-slate-200 bg-white text-slate-600 hover:text-slate-900"
            )}
          >
            <input
              type="checkbox"
              className="accent-cyan-600"
              checked={active}
              onChange={() => onChange({ ...value, [it.key]: !active })}
            />
            {it.label}
          </label>
        );
      })}
    </div>
  );
}
