import { Tabs, type TabItem } from "../components/common/Tabs";
import { ApprovalCard } from "../components/approvals/ApprovalCard";
import { useState } from "react";
import type { Approval } from "../types";

type Filter = "all" | "low" | "medium" | "high";

interface Props {
  approvals: Approval[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onEdit: (id: string, content: string) => void;
}

export function ApprovalsScreen({ approvals, onApprove, onReject, onEdit }: Props) {
  const [filter, setFilter] = useState<Filter>("all");
  const filtered =
    filter === "all" ? approvals : approvals.filter((a) => a.risk === filter);

  const tabs: TabItem<Filter>[] = [
    { key: "all", label: "Все", count: approvals.length },
    { key: "low", label: "Низкий", count: approvals.filter((a) => a.risk === "low").length },
    { key: "medium", label: "Средний", count: approvals.filter((a) => a.risk === "medium").length },
    { key: "high", label: "Высокий", count: approvals.filter((a) => a.risk === "high").length },
  ];

  return (
    <div className="flex h-full flex-col gap-3 p-4">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Approvals</h1>
        <div className="text-xs text-slate-500">
          Действия агентов, требующие подтверждения
        </div>
      </div>

      <Tabs items={tabs} active={filter} onChange={setFilter} />

      <div className="grid grid-cols-2 gap-3 overflow-y-auto">
        {filtered.length === 0 && (
          <div className="col-span-2 rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
            Нет действий на подтверждение
          </div>
        )}
        {filtered.map((a) => (
          <ApprovalCard
            key={a.id}
            approval={a}
            onApprove={onApprove}
            onReject={onReject}
            onEdit={onEdit}
          />
        ))}
      </div>
    </div>
  );
}
