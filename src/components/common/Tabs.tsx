import clsx from "clsx";

export interface TabItem<T extends string = string> {
  key: T;
  label: string;
  count?: number;
}

interface Props<T extends string> {
  items: TabItem<T>[];
  active: T;
  onChange: (key: T) => void;
  size?: "sm" | "md";
  className?: string;
}

export function Tabs<T extends string>({
  items,
  active,
  onChange,
  size = "md",
  className,
}: Props<T>) {
  return (
    <div
      className={clsx(
        "flex items-center gap-1 border-b border-slate-200 overflow-x-auto",
        className
      )}
    >
      {items.map((it) => {
        const isActive = it.key === active;
        return (
          <button
            key={it.key}
            onClick={() => onChange(it.key)}
            className={clsx(
              "relative -mb-px whitespace-nowrap border-b-2 transition-colors",
              size === "sm" ? "px-2.5 py-1.5 text-xs" : "px-3 py-2 text-sm",
              isActive
                ? "border-cyan-600 text-cyan-700"
                : "border-transparent text-slate-500 hover:text-slate-800"
            )}
          >
            {it.label}
            {typeof it.count === "number" && (
              <span
                className={clsx(
                  "ml-1.5 rounded-md px-1.5 py-0.5 text-[10px]",
                  isActive
                    ? "bg-cyan-100 text-cyan-700"
                    : "bg-slate-100 text-slate-500"
                )}
              >
                {it.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
