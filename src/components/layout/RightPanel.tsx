import { useRef } from "react";
import { Tabs, type TabItem } from "../common/Tabs";
import { AgentChat } from "../agents/AgentChat";
import { PlanSteps } from "../agents/PlanSteps";
import { ApprovalCard } from "../approvals/ApprovalCard";
import { vdiElements } from "../../mocks/vdiElements";
import { memoryEntities } from "../../mocks/memory";
import type {
  AgentMessage,
  Approval,
  HistoryEvent,
  PlanStep,
  Point,
  RightTab,
  Zone,
} from "../../types";
import { Badge } from "../common/Badge";
import { Resizer, RIGHT_PANEL_LIMITS } from "./rightPanelWidth";

interface Props {
  width: number;
  collapsed: boolean;
  onWidthChange: (w: number) => void;
  onToggle: () => void;
  tab: RightTab;
  onTabChange: (t: RightTab) => void;

  messages: AgentMessage[];
  onSendMessage: (text: string) => void;
  onCardAction: (messageId: string, action: string) => void;

  planSteps: PlanStep[];
  onPlanAction: (id: string, action: "run" | "edit" | "skip" | "delete") => void;

  approvals: Approval[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onEditApproval: (id: string, content: string) => void;

  history: HistoryEvent[];
  lastClick: Point | null;
  selectedZone: Zone | null;
}

export function RightPanel(props: Props) {
  const ref = useRef<HTMLElement>(null);
  const { collapsed, onToggle, width } = props;

  if (collapsed) {
    return (
      <aside
        ref={ref}
        style={{ width: RIGHT_PANEL_LIMITS.COLLAPSED }}
        className="relative flex shrink-0 flex-col items-center border-l border-slate-200 bg-white py-3"
      >
        <button
          onClick={onToggle}
          className="rounded-md border border-slate-300 bg-white p-1 text-slate-500 hover:text-cyan-700"
          title="Развернуть"
        >
          ◀
        </button>
      </aside>
    );
  }

  const tabs: TabItem<RightTab>[] = [
    { key: "agent", label: "Агент" },
    { key: "plan", label: "План", count: props.planSteps.length },
    { key: "elements", label: "Элементы", count: vdiElements.length },
    { key: "approvals", label: "Approvals", count: props.approvals.length },
    { key: "memory", label: "Память" },
    { key: "history", label: "История" },
  ];

  return (
    <aside
      ref={ref}
      style={{ width }}
      className="relative flex shrink-0 flex-col border-l border-slate-200 bg-white"
    >
      <Resizer onResize={props.onWidthChange} containerRef={ref} />

      <div className="flex items-center gap-1 px-2 pt-2">
        <Tabs items={tabs} active={props.tab} onChange={props.onTabChange} size="sm" className="flex-1 border-b-0" />
        <button
          onClick={onToggle}
          className="rounded-md border border-slate-300 bg-white p-1 text-slate-500 hover:text-cyan-700"
          title="Свернуть"
        >
          ▶
        </button>
      </div>
      <div className="border-b border-slate-200" />

      <div className="flex-1 min-h-0 overflow-y-auto">
        {props.tab === "agent" && (
          <AgentChat
            messages={props.messages}
            onSend={props.onSendMessage}
            onQuick={(t) => props.onSendMessage(t)}
            onCardAction={props.onCardAction}
          />
        )}
        {props.tab === "plan" && (
          <div className="p-3">
            <PlanSteps steps={props.planSteps} onAction={props.onPlanAction} />
          </div>
        )}
        {props.tab === "elements" && (
          <div className="flex flex-col gap-2 p-3">
            <div className="text-xs uppercase tracking-wider text-slate-500">Зоны</div>
            {vdiElements
              .filter((e) => e.kind === "zone")
              .map((e) => (
                <ElementRow key={e.id} title={e.label} type={e.type} confidence={e.confidence} />
              ))}
            <div className="mt-2 text-xs uppercase tracking-wider text-slate-500">Элементы</div>
            {vdiElements
              .filter((e) => e.kind === "element")
              .map((e) => (
                <ElementRow key={e.id} title={e.label} type={e.type} confidence={e.confidence} />
              ))}
          </div>
        )}
        {props.tab === "approvals" && (
          <div className="flex flex-col gap-2 p-3">
            {props.approvals.length === 0 && (
              <div className="text-sm text-slate-500">Нет действий на подтверждение</div>
            )}
            {props.approvals.map((a) => (
              <ApprovalCard
                key={a.id}
                approval={a}
                onApprove={props.onApprove}
                onReject={props.onReject}
                onEdit={props.onEditApproval}
              />
            ))}
          </div>
        )}
        {props.tab === "memory" && (
          <div className="flex flex-col gap-2 p-3">
            <div className="text-xs uppercase tracking-wider text-slate-500">
              Связано с текущим контекстом
            </div>
            {memoryEntities.slice(0, 6).map((m) => (
              <div
                key={m.id}
                className="rounded-lg border border-slate-200 bg-white p-2.5"
              >
                <div className="flex items-center gap-2">
                  <Badge tone="violet">{m.kind}</Badge>
                  <span className="text-sm font-medium text-slate-900">{m.title}</span>
                </div>
                {m.meta && <div className="mt-0.5 text-[11px] text-slate-500">{m.meta}</div>}
                {m.summary && (
                  <div className="mt-1 text-xs text-slate-600">{m.summary}</div>
                )}
              </div>
            ))}
          </div>
        )}
        {props.tab === "history" && (
          <ul className="flex flex-col gap-1.5 p-3 text-sm">
            {props.history.map((h) => (
              <li
                key={h.id}
                className="flex items-start gap-2 rounded-md border border-slate-200 bg-white p-2"
              >
                <span className="text-[11px] tabular-nums text-slate-500">
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
                <span className="text-slate-800">{h.summary}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {(props.lastClick || props.selectedZone) && (
        <div className="border-t border-slate-200 p-2 text-[11px] text-slate-500">
          {props.lastClick && (
            <div>
              Последний клик: <span className="text-slate-700">x={props.lastClick.x}, y={props.lastClick.y}</span>
            </div>
          )}
          {props.selectedZone && (
            <div>
              Зона: <span className="text-slate-700">
                {props.selectedZone.x},{props.selectedZone.y} • {props.selectedZone.w}×{props.selectedZone.h}
              </span>
            </div>
          )}
        </div>
      )}
    </aside>
  );
}

function ElementRow({
  title,
  type,
  confidence,
}: {
  title: string;
  type: string;
  confidence: number;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-2.5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm text-slate-900">{title}</span>
        <Badge tone="info">{Math.round(confidence * 100)}%</Badge>
      </div>
      <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
        <span>type: {type}</span>
        <div className="flex gap-1">
          <button className="rounded border border-slate-200 bg-white px-1.5 py-0.5 hover:text-cyan-700">
            Show
          </button>
          <button className="rounded border border-slate-200 bg-white px-1.5 py-0.5 hover:text-cyan-700">
            Re-analyze
          </button>
          <button className="rounded border border-slate-200 bg-white px-1.5 py-0.5 hover:text-cyan-700">
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
