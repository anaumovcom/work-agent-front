import { useEffect, useState } from "react";
import { Badge } from "../components/common/Badge";
import { Button } from "../components/common/Button";
import { Card } from "../components/common/Card";
import { diagnosticsApi, type DiagnosticBlockDto } from "../api/diagnosticsApi";
import { agents } from "../mocks/agents";

const statusTone = {
  ok: "success",
  warn: "warn",
  error: "danger",
} as const;

export function DiagnosticsScreen() {
  const [blocks, setBlocks] = useState<DiagnosticBlockDto[]>([]);
  const [busy, setBusy] = useState<string | null>(null);

  const load = () => {
    diagnosticsApi
      .list()
      .then(setBlocks)
      .catch(() => setBlocks([]));
  };

  useEffect(() => {
    load();
  }, []);

  const runTest = async (
    name: string,
    fn: () => Promise<unknown>
  ) => {
    setBusy(name);
    try {
      await fn();
      load();
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="flex h-full flex-col gap-3 p-4">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Diagnostics</h1>
        <div className="text-xs text-slate-500">
          Состояние подсистем и быстрые self-test'ы
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          disabled={busy !== null}
          onClick={() => runTest("click", diagnosticsApi.testClick)}
        >
          {busy === "click" ? "…" : "Test click"}
        </Button>
        <Button
          size="sm"
          disabled={busy !== null}
          onClick={() => runTest("typing", diagnosticsApi.testTyping)}
        >
          {busy === "typing" ? "…" : "Test typing"}
        </Button>
        <Button
          size="sm"
          disabled={busy !== null}
          onClick={() => runTest("ocr", diagnosticsApi.testOcr)}
        >
          {busy === "ocr" ? "…" : "Test OCR"}
        </Button>
        <Button
          size="sm"
          disabled={busy !== null}
          onClick={() => runTest("vision", diagnosticsApi.testVision)}
        >
          {busy === "vision" ? "…" : "Test vision"}
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {blocks.map((b) => (
          <Card key={b.id} padded>
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold">{b.name}</div>
              <Badge tone={statusTone[b.status]}>{b.status}</Badge>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-1 text-xs">
              {b.metrics.map((m, i) => (
                <div key={i} className="flex justify-between gap-2">
                  <span className="text-slate-500">{m.label}</span>
                  <span className="tabular-nums">{m.value}</span>
                </div>
              ))}
            </div>
          </Card>
        ))}
        {blocks.length === 0 && (
          <Card padded>
            <div className="text-sm text-slate-500">Нет данных диагностики</div>
          </Card>
        )}
      </div>

      <Card padded>
        <div className="mb-2 text-sm font-semibold">Агенты</div>
        <ul className="grid grid-cols-2 gap-1 text-xs">
          {agents.map((a) => (
            <li key={a.id} className="flex justify-between gap-2">
              <span>{a.name}</span>
              <span className="text-slate-500">
                {a.status} · load {Math.round(a.load * 100)}%
              </span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
