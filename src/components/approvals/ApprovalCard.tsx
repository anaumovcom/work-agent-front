import { useState } from "react";
import { Badge } from "../common/Badge";
import { Button } from "../common/Button";
import type { Approval } from "../../types";

interface Props {
  approval: Approval;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onEdit: (id: string, content: string) => void;
}

const riskTone = {
  low: "success",
  medium: "warn",
  high: "danger",
} as const;

export function ApprovalCard({ approval, onApprove, onReject, onEdit }: Props) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(approval.content);

  function applyTransform(kind: "shorter" | "casual" | "simple" | "details") {
    let next = text;
    if (kind === "shorter") next = next.split(".").slice(0, 1).join(".") + ".";
    if (kind === "casual") next = next.replace(/Уважаемый|Здравствуйте/gi, "Привет");
    if (kind === "simple") next = next.replace(/осуществить|произвести/gi, "сделать");
    if (kind === "details") next = next + " Подробности — в треде.";
    setText(next);
    onEdit(approval.id, next);
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
      <div className="flex items-start gap-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-slate-900">
              {approval.type}
            </span>
            <Badge tone={riskTone[approval.risk]}>
              risk: {approval.risk}
            </Badge>
            <Badge tone="violet">{approval.agent}</Badge>
          </div>
          <div className="mt-0.5 text-[11px] text-slate-500">
            → {approval.target}
            {approval.expected ? ` • ${approval.expected}` : ""}
          </div>
        </div>
      </div>

      <div className="mt-2">
        {editing ? (
          <textarea
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              onEdit(approval.id, e.target.value);
            }}
            rows={4}
            aria-label="Содержимое действия"
            className="w-full resize-none rounded-md border border-slate-300 bg-white p-2 text-sm text-slate-900 outline-none focus:border-cyan-500"
          />
        ) : (
          <div className="rounded-md border border-slate-200 bg-slate-50 p-2 text-sm text-slate-800 whitespace-pre-wrap">
            {text}
          </div>
        )}
      </div>

      {editing && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          <Button size="sm" variant="ghost" onClick={() => applyTransform("shorter")}>
            Сделать короче
          </Button>
          <Button size="sm" variant="ghost" onClick={() => applyTransform("casual")}>
            Менее формально
          </Button>
          <Button size="sm" variant="ghost" onClick={() => applyTransform("simple")}>
            Простым языком
          </Button>
          <Button size="sm" variant="ghost" onClick={() => applyTransform("details")}>
            Добавить детали
          </Button>
        </div>
      )}

      <div className="mt-3 flex gap-1.5">
        <Button size="sm" variant="success" onClick={() => onApprove(approval.id)}>
          ✓ Подтвердить
        </Button>
        <Button size="sm" variant="secondary" onClick={() => setEditing((v) => !v)}>
          {editing ? "Готово" : "Редактировать"}
        </Button>
        <Button size="sm" variant="ghost" onClick={() => onReject(approval.id)}>
          ✕ Отклонить
        </Button>
      </div>
    </div>
  );
}
