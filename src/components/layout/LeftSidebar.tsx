import clsx from "clsx";
import type { ScreenKey } from "../../types";

interface Props {
  active: ScreenKey;
  onChange: (s: ScreenKey) => void;
  badges?: Partial<Record<ScreenKey, number>>;
}

const items: { key: ScreenKey; label: string; icon: string }[] = [
  { key: "vdi", label: "VDI Control", icon: "▣" },
  { key: "inbox", label: "Agent Inbox", icon: "✉" },
  { key: "plan", label: "Plan", icon: "≡" },
  { key: "approvals", label: "Approvals", icon: "✓" },
  { key: "memory", label: "Memory", icon: "◈" },
  { key: "scenarios", label: "Scenarios", icon: "↻" },
  { key: "history", label: "History", icon: "⏱" },
  { key: "diagnostics", label: "Diagnostics", icon: "◉" },
  { key: "settings", label: "Settings", icon: "⚙" },
];

export function LeftSidebar({ active, onChange, badges }: Props) {
  return (
    <aside className="flex w-[72px] shrink-0 flex-col items-center gap-1 border-r border-slate-200 bg-white py-3">
      {items.map((it) => {
        const isActive = active === it.key;
        const badge = badges?.[it.key];
        return (
          <button
            key={it.key}
            onClick={() => onChange(it.key)}
            title={it.label}
            className={clsx(
              "group relative flex h-12 w-12 flex-col items-center justify-center rounded-lg border text-[10px] transition-all",
              isActive
                ? "border-cyan-300 bg-cyan-50 text-cyan-700"
                : "border-transparent text-slate-500 hover:bg-slate-100 hover:text-slate-800"
            )}
          >
            <span className="text-lg leading-none">{it.icon}</span>
            <span className="mt-1 leading-none">{it.label.split(" ")[0]}</span>

            {badge ? (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                {badge}
              </span>
            ) : null}

            <span className="pointer-events-none absolute left-full ml-2 hidden whitespace-nowrap rounded-md border border-slate-300 bg-white px-2 py-1 text-xs text-slate-700 shadow-md group-hover:block z-50">
              {it.label}
            </span>
          </button>
        );
      })}

      <div className="mt-auto flex flex-col items-center gap-1">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 text-xs font-bold text-white">
          ИП
        </div>
      </div>
    </aside>
  );
}
